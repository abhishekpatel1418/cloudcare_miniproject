import { TransactWriteCommand } from "@aws-sdk/lib-dynamodb";
import { docClient, TABLE_NAME } from "../../shared/dynamoClient.js";
import { buildResponse, successResponse, errorResponse } from "../../shared/response.js";
import { extractCaller } from "../../shared/authHelper.js";
import { sendEmailNotification } from "../notifications/sendEmailNotification.js";
import crypto from "crypto";

/**
 * Lambda Handler: POST /appointments
 * Creates an appointment with server-side validation and duplicate-booking prevention.
 */
export async function handler(event) {
  // Handle CORS preflight OPTIONS request
  if (event.httpMethod === "OPTIONS") {
    return buildResponse(200, {});
  }

  try {
    const caller = extractCaller(event);
    const body = typeof event.body === "string" ? JSON.parse(event.body || "{}") : event.body || {};

    // Validate inputs
    const {
      doctorId,
      doctorName,
      specialty,
      date,
      slot,
      patientName,
      patientEmail,
      patientPhone,
      consultationFee,
      hospitalLocation
    } = body;

    if (!doctorId || !doctorName || !date || !slot || !patientName) {
      return errorResponse("Missing required fields: doctorId, doctorName, date, slot, patientName", 400);
    }

    // Determine secure patient identity
    const patientId = caller?.userId || body.patientId || `guest_${Date.now()}`;
    const confirmedEmail = caller?.email || patientEmail || "";
    const appointmentId = `CC-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
    const timestamp = new Date().toISOString();

    const appointmentItem = {
      PK: `APPOINTMENT#${appointmentId}`,
      SK: "METADATA",
      GSI1PK: `USER#${patientId}`,
      GSI1SK: `DATE#${date}#${slot}`,
      GSI2PK: `DOCTOR#${doctorId}`,
      GSI2SK: `DATE#${date}#${slot}`,
      appointmentId,
      patientId,
      patientName,
      patientEmail: confirmedEmail,
      patientPhone: patientPhone || "",
      doctorId,
      doctorName,
      specialty: specialty || "General",
      date,
      slot,
      consultationFee: consultationFee || 500,
      hospitalLocation: hospitalLocation || "CloudCare Central Hospital",
      status: "CONFIRMED",
      createdAt: timestamp,
      updatedAt: timestamp
    };

    // Slot Lock Item: prevents double-booking the same doctor at the same date & time slot
    const slotLockItem = {
      PK: `DOCTOR#${doctorId}`,
      SK: `SLOT#${date}#${slot}`,
      appointmentId,
      patientId,
      status: "LOCKED",
      lockedAt: timestamp
    };

    // Atomic transaction: Writes the appointment item AND the slot lock item.
    // The ConditionExpression on the slot ensures no two requests can reserve the same doctor & slot.
    const transactParams = {
      TransactItems: [
        {
          Put: {
            TableName: TABLE_NAME,
            Item: appointmentItem
          }
        },
        {
          Put: {
            TableName: TABLE_NAME,
            Item: slotLockItem,
            ConditionExpression: "attribute_not_exists(PK) AND attribute_not_exists(SK)"
          }
        }
      ]
    };

    await docClient.send(new TransactWriteCommand(transactParams));

    // Optional Amazon SES Notification dispatch (planned, safe check)
    if (confirmedEmail && process.env.ENABLE_SES === "true") {
      try {
        await sendEmailNotification({
          to: confirmedEmail,
          patientName,
          doctorName,
          specialty,
          date,
          slot,
          appointmentId,
          hospitalLocation: appointmentItem.hospitalLocation
        });
      } catch (sesErr) {
        console.warn("SES notification warning (non-fatal):", sesErr.message);
      }
    }

    return successResponse(appointmentItem, "Appointment confirmed successfully", 201);
  } catch (error) {
    console.error("Error creating appointment:", error);

    // Handle DynamoDB conditional check failure (duplicate slot booking)
    if (
      error.name === "TransactionCanceledException" ||
      error.name === "ConditionalCheckFailedException" ||
      (error.CancellationReasons && error.CancellationReasons.some(r => r.Code === "ConditionalCheckFailed"))
    ) {
      return errorResponse(
        "This time slot is already booked for this doctor. Please select another slot.",
        409
      );
    }

    return errorResponse("Failed to create appointment: " + error.message, 500);
  }
}
