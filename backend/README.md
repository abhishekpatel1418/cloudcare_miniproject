# CloudCare Backend (AWS Serverless)

This directory is designated for the serverless Node.js backend microservices that will be deployed on AWS Lambda in **Phase 2**.

## Planned Microservices Structure

```
backend/
├── functions/
│   ├── auth/
│   │   └── postConfirmation.js     # Cognito post-confirmation trigger to seed user in DynamoDB
│   ├── doctors/
│   │   ├── getDoctors.js           # Query doctors by specialty or all
│   │   └── updateSchedule.js       # Doctor manages slots / availability
│   ├── appointments/
│   │   ├── bookAppointment.js      # Creates appointment record with transactional lock
│   │   ├── getAppointments.js      # Fetch bookings for patient / doctor
│   │   └── cancelAppointment.js    # Update appointment status to CANCELLED
│   └── notifications/
│       └── sendConfirmationEmail.js # Triggers Amazon SES transactional email
├── shared/
│   ├── dynamoClient.js             # AWS SDK v3 DynamoDB DocumentClient helper
│   ├── sesClient.js                # AWS SDK v3 SES helper
│   └── response.js                 # Standardized CORS and JSON response wrappers
├── package.json
└── template.yaml                   # AWS SAM / CloudFormation template
```

## AWS Security & Credentials Notice
- Do NOT hardcode AWS credentials (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`) in code or commit them to git.
- When running locally, AWS credentials will be sourced from environment variables or local AWS CLI profiles.
- When deployed, Lambda functions receive least-privilege permissions via attached **AWS IAM execution roles**.
