import test from "node:test";
import assert from "node:assert/strict";
import { buildResponse, successResponse, errorResponse } from "../shared/response.js";
import { extractCaller } from "../shared/authHelper.js";

test("buildResponse formats valid API Gateway response with CORS headers", () => {
  const resp = buildResponse(200, { message: "ok" });
  assert.equal(resp.statusCode, 200);
  assert.equal(resp.headers["Access-Control-Allow-Origin"], "*");
  assert.equal(resp.headers["Content-Type"], "application/json");
  assert.equal(JSON.parse(resp.body).message, "ok");
});

test("errorResponse formats valid error payload with status code", () => {
  const resp = errorResponse("Slot conflict error", 409);
  assert.equal(resp.statusCode, 409);
  const body = JSON.parse(resp.body);
  assert.equal(body.success, false);
  assert.equal(body.error, "Slot conflict error");
});

test("extractCaller derives Admin role from Cognito Groups", () => {
  const event = {
    requestContext: {
      authorizer: {
        claims: {
          sub: "user-admin-123",
          email: "admin@hospital.com",
          name: "Dr. Admin",
          "cognito:groups": "Admin,Staff"
        }
      }
    }
  };

  const caller = extractCaller(event);
  assert.equal(caller.userId, "user-admin-123");
  assert.equal(caller.role, "Admin");
});

test("extractCaller derives Doctor role from Cognito Groups array", () => {
  const event = {
    requestContext: {
      authorizer: {
        claims: {
          sub: "user-doc-456",
          email: "doc@hospital.com",
          name: "Dr. Arvind",
          "cognito:groups": ["Doctor"]
        }
      }
    }
  };

  const caller = extractCaller(event);
  assert.equal(caller.userId, "user-doc-456");
  assert.equal(caller.role, "Doctor");
});

test("extractCaller defaults safely to Patient if no privileged group is present", () => {
  const event = {
    requestContext: {
      authorizer: {
        claims: {
          sub: "user-patient-789",
          email: "patient@example.com",
          name: "Rahul",
          "cognito:groups": []
        }
      }
    }
  };

  const caller = extractCaller(event);
  assert.equal(caller.userId, "user-patient-789");
  assert.equal(caller.role, "Patient");
});
