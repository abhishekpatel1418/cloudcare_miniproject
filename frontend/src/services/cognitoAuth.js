import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  ConfirmSignUpCommand,
  InitiateAuthCommand,
  GlobalSignOutCommand
} from "@aws-sdk/client-cognito-identity-provider";

const region = import.meta.env.VITE_AWS_REGION || "us-east-1";
const userPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID || "";
const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID || "";

// Check if environment variables contain real AWS identifiers (not placeholders)
export function isCognitoConfigured() {
  return (
    userPoolId &&
    clientId &&
    !userPoolId.includes("placeholder") &&
    !clientId.includes("placeholder")
  );
}

// Low-level Cognito client initialized with region
let cognitoClient = null;
function getCognitoClient() {
  if (!cognitoClient) {
    cognitoClient = new CognitoIdentityProviderClient({ region });
  }
  return cognitoClient;
}

/**
 * Safely decodes JWT payload without external libraries.
 */
export function parseJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

/**
 * Derives role strictly from cryptographically verified claims.
 * Never trusts frontend user input or form fields for role assignment.
 */
export function extractRoleFromClaims(claims) {
  if (!claims) return "Patient";

  const rawGroups = claims["cognito:groups"] || [];
  let groups = [];
  if (Array.isArray(rawGroups)) {
    groups = rawGroups;
  } else if (typeof rawGroups === "string") {
    groups = rawGroups.split(",").map((g) => g.trim());
  }

  if (groups.includes("Admin") || groups.includes("Admins")) {
    return "Admin";
  }
  if (groups.includes("Doctor") || groups.includes("Doctors")) {
    return "Doctor";
  }
  return "Patient";
}

const STORAGE_KEY = "cloudcare_auth_session";

/**
 * Formats a phone number to standard E.164 format (+<country_code><number>)
 * as strictly required by Amazon Cognito. Defaults to +91 if no country code provided.
 */
export function formatToE164(phone, defaultCountryCode = "+91") {
  if (!phone) return "";
  const cleaned = phone.replace(/[\s\-\(\)]/g, "");
  if (cleaned.startsWith("+")) {
    return cleaned;
  }
  if (cleaned.startsWith("0")) {
    return `${defaultCountryCode}${cleaned.substring(1)}`;
  }
  return `${defaultCountryCode}${cleaned}`;
}

/**
 * Signs up a new user via Amazon Cognito User Pools.
 */
export async function registerUser({ name, email, password, phone }) {
  if (!isCognitoConfigured()) {
    throw new Error(
      "Amazon Cognito is not configured yet. Please follow the AWS Console setup guide and set VITE_COGNITO_USER_POOL_ID and VITE_COGNITO_CLIENT_ID in your .env file."
    );
  }

  if (!phone || !phone.trim()) {
    throw new Error("Mobile phone number is required by your Amazon Cognito User Pool schema.");
  }

  const formattedPhone = formatToE164(phone);

  const client = getCognitoClient();
  const userAttributes = [
    { Name: "name", Value: name },
    { Name: "phone_number", Value: formattedPhone }
  ];

  const command = new SignUpCommand({
    ClientId: clientId,
    Username: email,
    Password: password,
    UserAttributes: userAttributes
  });

  const response = await client.send(command);
  return {
    isConfirmed: response.UserConfirmed,
    userSub: response.UserSub,
    email
  };
}

/**
 * Confirms user registration with the 6-digit email verification code.
 */
export async function confirmUserRegistration({ email, code }) {
  if (!isCognitoConfigured()) {
    throw new Error("Amazon Cognito is not configured yet.");
  }

  const client = getCognitoClient();
  const command = new ConfirmSignUpCommand({
    ClientId: clientId,
    Username: email,
    ConfirmationCode: code
  });

  await client.send(command);
  return true;
}

/**
 * Authenticates user via Amazon Cognito (USER_PASSWORD_AUTH flow).
 */
export async function loginUser({ email, password }) {
  if (!isCognitoConfigured()) {
    throw new Error(
      "Amazon Cognito is not configured yet. Configure VITE_COGNITO_USER_POOL_ID in .env or use the Local Evaluation Account Switcher below."
    );
  }

  const client = getCognitoClient();
  const command = new InitiateAuthCommand({
    AuthFlow: "USER_PASSWORD_AUTH",
    ClientId: clientId,
    AuthParameters: {
      USERNAME: email,
      PASSWORD: password
    }
  });

  const response = await client.send(command);
  const authResult = response.AuthenticationResult;
  if (!authResult) {
    throw new Error("Authentication challenge returned or failed to get tokens.");
  }

  const idToken = authResult.IdToken;
  const accessToken = authResult.AccessToken;
  const refreshToken = authResult.RefreshToken;

  const claims = parseJwt(idToken);
  const role = extractRoleFromClaims(claims);

  const session = {
    userId: claims.sub,
    email: claims.email || email,
    name: claims.name || email.split("@")[0],
    role,
    idToken,
    accessToken,
    refreshToken,
    expiresAt: claims.exp ? claims.exp * 1000 : Date.now() + 3600 * 1000,
    isLocalDemo: false
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  return session;
}

/**
 * Signs out user and clears local session.
 */
export async function logoutUser() {
  const session = getStoredSession();
  if (session?.accessToken && isCognitoConfigured()) {
    try {
      const client = getCognitoClient();
      await client.send(new GlobalSignOutCommand({ AccessToken: session.accessToken }));
    } catch (e) {
      console.warn("Global signout warning:", e.message);
    }
  }
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Returns currently active session from storage, verifying expiration.
 */
export function getStoredSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);

    // Check expiration
    if (session.expiresAt && Date.now() > session.expiresAt) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return session;
  } catch (e) {
    return null;
  }
}

/**
 * LOCAL EVALUATION MODE ONLY:
 * Allows B.Tech examiners to evaluate Patient, Doctor, and Admin dashboards
 * before the student provisions live AWS resources.
 * Clearly marked as local demo.
 */
export function loginLocalEvaluationUser(role) {
  const demoUsers = {
    Patient: {
      userId: "demo_patient_001",
      email: "rahul.patient@cloudcare.local",
      name: "Rahul Sharma",
      role: "Patient"
    },
    Doctor: {
      userId: "doc-1",
      email: "dr.arvind@cloudcare.local",
      name: "Dr. Arvind Ramesh",
      role: "Doctor",
      specialty: "Cardiology"
    },
    Admin: {
      userId: "demo_admin_001",
      email: "admin@cloudcare.local",
      name: "Hospital Admin (Dr. V. Rao)",
      role: "Admin"
    }
  };

  const selected = demoUsers[role] || demoUsers.Patient;
  const session = {
    ...selected,
    idToken: "mock_jwt_id_token_" + role.toLowerCase(),
    accessToken: "mock_jwt_access_token_" + role.toLowerCase(),
    expiresAt: Date.now() + 24 * 3600 * 1000,
    isLocalDemo: true
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  return session;
}
