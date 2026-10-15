import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const region = process.env.AWS_REGION || process.env.VITE_AWS_REGION || "us-east-1";

// Create low-level client
const rawClient = new DynamoDBClient({ region });

// Wrap in DocumentClient to auto-serialize and deserialize JavaScript objects to DynamoDB AttributeValues
export const docClient = DynamoDBDocumentClient.from(rawClient, {
  marshallOptions: {
    removeUndefinedValues: true,
    convertClassInstanceToMap: true
  },
  unmarshallOptions: {
    wrapNumbers: false
  }
});

export const TABLE_NAME = process.env.DYNAMODB_TABLE || "CloudCare_HospitalTable";
