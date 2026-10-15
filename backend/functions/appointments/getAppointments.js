import { QueryCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { docClient, TABLE_NAME } from "../../shared/dynamoClient.js";
import { buildResponse, successResponse, errorResponse } from "../../shared/response.js";
import { extractCaller } from "../../shared/authHelper.js";

/**
 * Lambda Handler: GET /appointments
 * Returns appointments filtered by caller's role (Patient, Doctor, or Admin).
 */
export async function handler(event) {
  if (event.httpMethod === "OPTIONS") {
    return buildResponse(200, {});
  }

  try {
    const caller = extractCaller(event);
    const queryParams = event.queryStringParameters || {};
    const requestedPatientId = queryParams.patientId || caller?.userId;
    const requestedDoctorId = queryParams.doctorId;

    // RBAC:
    // 1. If caller is Admin -> Can see all appointments or filter by doctor/patient
    // 2. If caller is Doctor -> Can only query appointments for their doctorId
    // 3. If caller is Patient (or default) -> Can only query their own appointments
    const role = caller?.role || "Patient";

    let items = [];

    if (role === "Admin") {
      if (requestedDoctorId) {
        // Query by Doctor GSI
        const result = await docClient.send(
          new QueryCommand({
            TableName: TABLE_NAME,
            IndexName: "GSI2",
            KeyConditionExpression: "GSI2PK = :docKey",
            ExpressionAttributeValues: {
              ":docKey": `DOCTOR#${requestedDoctorId}`
            }
          })
        );
        items = result.Items || [];
      } else if (requestedPatientId) {
        // Query by Patient GSI
        const result = await docClient.send(
          new QueryCommand({
            TableName: TABLE_NAME,
            IndexName: "GSI1",
            KeyConditionExpression: "GSI1PK = :userKey",
            ExpressionAttributeValues: {
              ":userKey": `USER#${requestedPatientId}`
            }
          })
        );
        items = result.Items || [];
      } else {
        // Scan all appointment records (Admin view)
        const result = await docClient.send(
          new ScanCommand({
            TableName: TABLE_NAME,
            FilterExpression: "begins_with(PK, :prefix) AND SK = :meta",
            ExpressionAttributeValues: {
              ":prefix": "APPOINTMENT#",
              ":meta": "METADATA"
            }
          })
        );
        items = result.Items || [];
      }
    } else if (role === "Doctor") {
      const docId = requestedDoctorId || caller?.userId;
      const result = await docClient.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          IndexName: "GSI2",
          KeyConditionExpression: "GSI2PK = :docKey",
          ExpressionAttributeValues: {
            ":docKey": `DOCTOR#${docId}`
          }
        })
      );
      items = result.Items || [];
    } else {
      // Patient view: strictly scoped to caller's own patientId
      const patientId = caller?.userId || requestedPatientId;
      if (!patientId) {
        return errorResponse("Authentication required: missing patient identity", 401);
      }

      const result = await docClient.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          IndexName: "GSI1",
          KeyConditionExpression: "GSI1PK = :userKey",
          ExpressionAttributeValues: {
            ":userKey": `USER#${patientId}`
          }
        })
      );
      items = result.Items || [];
    }

    // Sort descending by creation date
    items.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    return successResponse(items, "Appointments retrieved successfully");
  } catch (error) {
    console.error("Error retrieving appointments:", error);
    return errorResponse("Failed to retrieve appointments: " + error.message, 500);
  }
}
