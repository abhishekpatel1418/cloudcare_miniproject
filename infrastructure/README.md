# CloudCare Infrastructure & AWS Cloud Architecture

This directory holds architecture documentation, DynamoDB schema definitions, and cloud configuration files.

## High-Level Architecture Diagram

```
+----------------------------------------------------------------------------+
|                          CLIENT BROWSER (Vite + React)                     |
|                   Hosted on AWS Amplify Hosting (HTTPS / CDN)              |
+-------------------------------------+--------------------------------------+
                                      |
                 REST API Calls with JWT Authorization Header
                                      |
                                      v
+----------------------------------------------------------------------------+
|                          AMAZON API GATEWAY                                |
|  - CORS Enabled                                                            |
|  - Amazon Cognito Authorizer (Validates JWT tokens for Patient/Doctor/Admin)|
|  - Rate limiting & request throttling                                      |
+-------------------------------------+--------------------------------------+
                                      |
                           Routes to Lambda Handlers
                                      |
                                      v
+----------------------------------------------------------------------------+
|                       NODE.JS ON AWS LAMBDA                                |
|  - Microservice handlers:                                                  |
|    * Doctor Management & Querying                                          |
|    * Appointment Booking & Slot Locking                                    |
|    * Cancelation & Rescheduling Logic                                      |
+---------------------+-------------------------------+----------------------+
                      |                               |
                      v                               v
+-----------------------------------+   +------------------------------------+
|         AMAZON DYNAMODB           |   |            AMAZON SES              |
|  - Single-Table / Dedicated Schema|   |  - Booking Confirmation Email      |
|  - Partition Key (PK) & Sort (SK) |   |  - Reschedule / Cancel Alerts      |
+-----------------------------------+   +------------------------------------+
                      ^
                      | Monitored by
+---------------------+------------------------------------------------------+
|                 AMAZON CLOUDWATCH & AWS IAM                                |
|  - CloudWatch Logs: API Gateway access logs & Lambda execution telemetry   |
|  - AWS IAM: Granular least-privilege execution roles                       |
+----------------------------------------------------------------------------+
```

## DynamoDB Data Modeling (Planned for Phase 2)

### Table: `CloudCare_Appointments`
- **PK (Partition Key)**: `USER#<cognito_user_id>` (Patient ID)
- **SK (Sort Key)**: `APPOINTMENT#<timestamp>#<appointment_id>`
- **GSI1-PK**: `DOCTOR#<doctor_id>`
- **GSI1-SK**: `DATE#<slot_date_iso>`
- **Attributes**: `doctorName`, `patientName`, `specialty`, `slotTime`, `status` (`CONFIRMED` | `CANCELLED` | `COMPLETED`), `consultationFee`, `createdAt`

### Table: `CloudCare_Doctors`
- **PK**: `SPECIALTY#<specialty_name>`
- **SK**: `DOCTOR#<doctor_id>`
- **Attributes**: `name`, `qualifications`, `experienceYears`, `rating`, `availableSlots`, `roomLocation`
