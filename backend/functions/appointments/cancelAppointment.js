import { GetCommand, UpdateCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { docClient, TABLE_NAME } from "../../shared/dynamoClient.js";
import { buildResponse, successResponse, errorResponse } from "../../shared/response.js";
import { extractCaller } from "../../shared/authHelper.js";

/**
 * Lambda Handler: POST or PUT /appointments/{id}/cancel
 * Cancels an appointment, updates status in DynamoDB, and releases the slot lock.
 */
export async function handler(event) {
  if (event.httpMethod === "OPTIONS") {
    return buildResponse(200, {});
  }

  try {
    const caller = extractCaller(event);
    const pathParams = event.pathParameters || {};
    const body = typeof event.body === "string" ? JSON.parse(event.body || "{}") : event.body || {};
    const appointmentId = pathParams.id || body.appointmentId;

    if (!appointmentId) {
      return errorResponse("Missing appointmentId parameter", 400);
    }

    // 1. Fetch current appointment record
    const getResult = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `APPOINTMENT#${appointmentId}`,
          SK: "METADATA"
        }
      })
    );

    const appointment = getResult.Item;
    if (!appointment) {
      return errorResponse("Appointment not found", 404);
    }

    // 2. Authorization check: caller must be Admin, or Doctor of this appointment, or Patient owner
    const callerRole = caller?.role || "Patient";
    const callerId = caller?.userId;

    const isPatientOwner = callerId && appointment.patientId === callerId;
    const isAssignedDoctor = callerRole === "Doctor" && (callerId === appointment.doctorId || caller?.name === appointment.doctorName);
    const isAdmin = callerRole === "Admin";

    // If caller is authenticated, enforce ownership
    if (caller && !isPatientOwner && !isAssignedDoctor && !isAdmin) {
      return errorResponse("Forbidden: You do not have permission to cancel this appointment", 403);
    }

    if (appointment.status === "CANCELLED") {
      return successResponse(appointment, "Appointment is already cancelled");
    }

    const timestamp = new Date().toISOString();

    // 3. Update appointment status to CANCELLED
    const updateResult = await docClient.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `APPOINTMENT#${appointmentId}`,
          SK: "METADATA"
        },
        UpdateExpression: "SET #s = :cancelled, updatedAt = :time",
        ExpressionAttributeNames: {
          "#s": "status"
        },
        ExpressionAttributeValues: {
          ":cancelled": "CANCELLED",
          ":time": timestamp
        },
        ReturnValues: "ALL_NEW"
      })
    );

    // 4. Release the slot lock so another patient can book this time slot
    try {
      await docClient.send(
        new DeleteCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `DOCTOR#${appointment.doctorId}`,
            SK: `SLOT#${appointment.date}#${appointment.slot}`
          }
        })
      );
    } catch (delErr) {
      console.warn("Could not delete slot lock (might not exist):", delErr.message);
    }

    return successResponse(updateResult.Attributes, "Appointment successfully cancelled");
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    return errorResponse("Failed to cancel appointment: " + error.message, 500);
  }
}
