import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const region = process.env.AWS_REGION || "us-east-1";
const sesClient = new SESClient({ region });
const SENDER_EMAIL = process.env.SES_SENDER_EMAIL || "notifications@cloudcare-health.local";

/**
 * Sends a transactional confirmation email using Amazon Simple Email Service (SES).
 */
export async function sendEmailNotification({
  to,
  patientName,
  doctorName,
  specialty,
  date,
  slot,
  appointmentId,
  hospitalLocation
}) {
  if (!to) {
    console.warn("Skipping email: recipient email address not provided.");
    return false;
  }

  const subject = `Appointment Confirmed: Dr. ${doctorName} [${appointmentId}]`;
  const bodyText = `
Dear ${patientName},

Your appointment has been confirmed at CloudCare Health Systems.

Booking Details:
- Appointment ID: ${appointmentId}
- Doctor: Dr. ${doctorName} (${specialty})
- Date: ${date}
- Time Slot: ${slot}
- Location: ${hospitalLocation}

Please arrive 15 minutes prior to your scheduled time at the OPD reception desk.
If you need to reschedule or cancel, you can do so through your CloudCare Patient Portal.

Warm regards,
CloudCare Healthcare Team
  `.trim();

  const bodyHtml = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
  <div style="background: #0284c7; color: white; padding: 16px; border-radius: 6px; text-align: center;">
    <h2 style="margin: 0;">CloudCare Hospital System</h2>
    <p style="margin: 4px 0 0 0; font-size: 14px;">Appointment Confirmation Receipt</p>
  </div>
  <div style="padding: 20px 0;">
    <p>Dear <strong>${patientName}</strong>,</p>
    <p>Your appointment has been successfully scheduled. Here are your booking details:</p>
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 8px 0; color: #64748b;">Booking Reference:</td>
        <td style="padding: 8px 0; font-weight: bold; color: #0f172a;">${appointmentId}</td>
      </tr>
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 8px 0; color: #64748b;">Consultant Doctor:</td>
        <td style="padding: 8px 0; font-weight: bold; color: #0f172a;">Dr. ${doctorName} (${specialty})</td>
      </tr>
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 8px 0; color: #64748b;">Date & Time Slot:</td>
        <td style="padding: 8px 0; font-weight: bold; color: #0284c7;">${date} at ${slot}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #64748b;">Hospital Wing:</td>
        <td style="padding: 8px 0; font-weight: bold; color: #0f172a;">${hospitalLocation}</td>
      </tr>
    </table>
    <p style="font-size: 13px; color: #64748b;">
      Please arrive 15 minutes before your slot. You may view or cancel this appointment anytime from your Patient Portal.
    </p>
  </div>
  <div style="border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 12px; color: #94a3b8; text-align: center;">
    &copy; CloudCare Health Systems • Powered by AWS Serverless Microservices
  </div>
</div>
  `.trim();

  const command = new SendEmailCommand({
    Source: SENDER_EMAIL,
    Destination: {
      ToAddresses: [to]
    },
    Message: {
      Subject: { Data: subject, Charset: "UTF-8" },
      Body: {
        Text: { Data: bodyText, Charset: "UTF-8" },
        Html: { Data: bodyHtml, Charset: "UTF-8" }
      }
    }
  });

  try {
    const response = await sesClient.send(command);
    console.log("SES Email dispatched successfully, MessageId:", response.MessageId);
    return true;
  } catch (error) {
    console.error("SES SendEmail error:", error);
    throw error;
  }
}
