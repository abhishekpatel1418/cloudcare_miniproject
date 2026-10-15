/**
 * Standard HTTP response builder for AWS API Gateway Lambda Proxy Integration.
 * Always includes CORS headers to allow browser fetch requests.
 */
export function buildResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token",
      "Access-Control-Allow-Methods": "OPTIONS,GET,POST,PUT,DELETE"
    },
    body: JSON.stringify(body)
  };
}

export function successResponse(data, message = "Success", statusCode = 200) {
  return buildResponse(statusCode, {
    success: true,
    message,
    data
  });
}

export function errorResponse(message, statusCode = 400, details = null) {
  return buildResponse(statusCode, {
    success: false,
    error: message,
    ...(details ? { details } : {})
  });
}
