/**
 * Extracts and securely verifies caller identity and role from AWS Cognito Authorizer claims.
 * Role is strictly derived from server-side Cognito Groups in the verified JWT.
 */
export function extractCaller(event) {
  const authorizer = event.requestContext?.authorizer;
  const claims = authorizer?.claims || authorizer?.jwt?.claims;

  if (!claims) {
    // If running in local simulation or test without authorizer
    return null;
  }

  const sub = claims.sub || claims.username;
  const email = claims.email || "";
  const name = claims.name || claims["cognito:username"] || email;

  // Cognito groups can appear as an array or a comma-separated string
  let groups = [];
  const rawGroups = claims["cognito:groups"];
  if (Array.isArray(rawGroups)) {
    groups = rawGroups;
  } else if (typeof rawGroups === "string") {
    groups = rawGroups.split(",").map(g => g.trim());
  }

  // Determine server-authorized role (Admins have highest priority, then Doctors, default is Patient)
  let role = "Patient";
  if (groups.includes("Admin") || groups.includes("Admins")) {
    role = "Admin";
  } else if (groups.includes("Doctor") || groups.includes("Doctors")) {
    role = "Doctor";
  }

  return {
    userId: sub,
    email,
    name,
    groups,
    role
  };
}
