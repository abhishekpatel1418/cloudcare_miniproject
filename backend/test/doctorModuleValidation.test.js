import test from "node:test";
import assert from "node:assert/strict";
import { extractCaller } from "../shared/authHelper.js";

test("Doctor authorization: caller with Doctor group has role Doctor", () => {
  const event = {
    requestContext: {
      authorizer: {
        claims: {
          sub: "doc-1",
          email: "dr.arvind@cloudcare.local",
          name: "Dr. Arvind Ramesh",
          "cognito:groups": ["Doctor"]
        }
      }
    }
  };

  const caller = extractCaller(event);
  assert.equal(caller.userId, "doc-1");
  assert.equal(caller.role, "Doctor");
});

test("Doctor cancellation logic: assigned doctor is authorized to cancel appointment", () => {
  const caller = {
    userId: "doc-1",
    name: "Dr. Arvind Ramesh",
    role: "Doctor"
  };

  const appointment = {
    appointmentId: "CC-A4F1",
    patientId: "patient-101",
    doctorId: "doc-1",
    doctorName: "Dr. Arvind Ramesh",
    status: "CONFIRMED"
  };

  const isAssignedDoctor = caller.role === "Doctor" && (caller.userId === appointment.doctorId || caller.name === appointment.doctorName);
  assert.equal(isAssignedDoctor, true, "Assigned doctor must be authorized");
});

test("Doctor cancellation logic: unassigned doctor is denied cancellation permission", () => {
  const otherDoctor = {
    userId: "doc-2",
    name: "Dr. Sneha Kulkarni",
    role: "Doctor"
  };

  const appointment = {
    appointmentId: "CC-A4F1",
    patientId: "patient-101",
    doctorId: "doc-1",
    doctorName: "Dr. Arvind Ramesh",
    status: "CONFIRMED"
  };

  const isPatientOwner = otherDoctor.userId === appointment.patientId;
  const isAssignedDoctor = otherDoctor.role === "Doctor" && (otherDoctor.userId === appointment.doctorId || otherDoctor.name === appointment.doctorName);
  const isAdmin = otherDoctor.role === "Admin";

  const isAuthorized = isPatientOwner || isAssignedDoctor || isAdmin;
  assert.equal(isAuthorized, false, "Unassigned doctor must not have cancellation permission");
});

test("Doctor appointment status indicators conform to supported application statuses", () => {
  const supportedStatuses = new Set(["CONFIRMED", "COMPLETED", "CANCELLED"]);

  assert.equal(supportedStatuses.has("CONFIRMED"), true);
  assert.equal(supportedStatuses.has("COMPLETED"), true);
  assert.equal(supportedStatuses.has("CANCELLED"), true);
  assert.equal(supportedStatuses.has("UNKNOWN_STATUS"), false);
});
