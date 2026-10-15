# Beginner's AWS Console Step-by-Step Setup Guide
**CloudCare – Hospital Appointment Booking System**

This guide walks you through setting up your **Amazon Cognito User Pool** and **Amazon DynamoDB Table** directly in the AWS Console for free.

> [!IMPORTANT]
> **Free Tier Safety Guarantee**:
> Following this guide uses only AWS Free Tier eligible settings:
> 1. Cognito User Pools has **50,000 Free Monthly Active Users (MAUs)** forever.
> 2. DynamoDB using **On-Demand (Pay-Per-Request)** has **zero monthly baseline fee**.
> 3. No paid SMS services or paid NAT gateways are provisioned.

---

## Step 1: Sign in and Choose Your AWS Region

1. Open your browser and go to [https://aws.amazon.com/console/](https://aws.amazon.com/console/).
2. Log in with your AWS root account or IAM user credentials.
3. In the top-right corner of the AWS navigation bar, choose your preferred AWS Region:
   - Recommended: **US East (N. Virginia) `us-east-1`** or **Asia Pacific (Mumbai) `ap-south-1`**.
   - Note down your chosen region code (e.g. `us-east-1`).

---

## Step 2: Create Amazon Cognito User Pool (Authentication & RBAC)

1. In the top search bar, type **Cognito** and click on **Amazon Cognito**.
2. Click the orange **Create user pool** button.

### 2.1 Configure sign-in experience
- Under **Cognito user pool sign-in options**, check **Email**.
- Leave User name and Phone number unchecked.
- Click **Next**.

### 2.2 Configure security requirements
- **Password policy**: Leave as **Cognito defaults** (Minimum 8 chars, uppercase, lowercase, numbers, symbols).
- **Multi-factor authentication (MFA)**: Select **No MFA** *(important: this avoids SMS carrier charges for student projects)*.
- **User account recovery**: Leave **Self-service account recovery** checked (Email only).
- Click **Next**.

### 2.3 Configure sign-up experience
- **Self-service sign-up**: Ensure **Enable self-registration** is checked.
- **Cognito-assisted verification**: Check **Send email message, verify email address**.
- **Required attributes**:
  - Click **Add attribute** and select **name** (Marks full name required on registration).
- Click **Next**.

### 2.4 Configure message delivery
- Under **Email provider**, select **Send email with Cognito** *(Cognito provides up to 50 free emails per day without needing SES domain registration; ideal for testing)*.
- Click **Next**.

### 2.5 Integrate your app
- **User pool name**: Enter `CloudCare-UserPool`.
- **Initial app client**: Select **Public client**.
- **App client name**: Enter `CloudCare-WebClient`.
- **Client secret**: **SELECT "Don't generate a client secret"** *(CRITICAL: Web apps written in React/Vite cannot store secret keys safely; client secret MUST be disabled)*.
- Click **Next**.

### 2.6 Review and Create
- Review all settings and click **Create user pool**.

### 2.7 Create the 3 Role Groups in Cognito
Once created, click on your newly created `CloudCare-UserPool`:
1. In the left navigation, click **Groups** under **User management**.
2. Click **Create group**:
   - Name: `Patient` (Description: Registered hospital patients) -> Click **Create group**.
3. Click **Create group** again:
   - Name: `Doctor` (Description: Hospital physicians managing OPD) -> Click **Create group**.
4. Click **Create group** again:
   - Name: `Admin` (Description: Hospital administrators) -> Click **Create group**.

### 2.8 Copy Your IDs for the Frontend
1. Under **User pool overview**, copy the **User pool ID** (e.g. `us-east-1_AbCdEf123`).
2. Click the **App integration** tab, scroll to the bottom under **App clients and analytics**, and copy the **Client ID** (e.g. `7a8b9c0d1e2f3g4h5i6j7k8l9m`).

---

## Step 3: Create Amazon DynamoDB Table (Database)

1. In the AWS top search bar, type **DynamoDB** and click on **DynamoDB**.
2. Click the orange **Create table** button.
3. Fill in the table parameters:
   - **Table name**: Enter `CloudCare_HospitalTable`.
   - **Partition key**: Enter `PK` and select **String**.
   - **Sort key**: Enter `SK` and select **String**.
4. Under **Table settings**:
   - Choose **Customize settings**.
   - Under **Read/write capacity settings**, select **On-demand** *(This gives you Pay-Per-Request pricing: you pay $0.00 when nobody is accessing the table)*.
5. Under **Global secondary indexes (GSI)**:
   - Click **Create index**:
     - Partition key: `GSI1PK` (String)
     - Sort key: `GSI1SK` (String)
     - Index name: `GSI1`
     - Click **Create index**.
   - Click **Create index** again:
     - Partition key: `GSI2PK` (String)
     - Sort key: `GSI2SK` (String)
     - Index name: `GSI2`
     - Click **Create index**.
6. Scroll to the bottom and click **Create table**.

---

## Step 4: Configure Your Frontend `.env` File

1. In your project, go to the `frontend/` folder.
2. Create a new file named `.env` by copying `frontend/.env.example`:
   ```powershell
   Copy-Item frontend\.env.example frontend\.env
   ```
3. Open `frontend/.env` in your editor and paste the values you copied in Step 1 and Step 2:
   ```env
   VITE_AWS_REGION=us-east-1
   VITE_COGNITO_USER_POOL_ID=your_real_user_pool_id_from_step_2
   VITE_COGNITO_CLIENT_ID=your_real_client_id_from_step_2
   VITE_API_BASE_URL=https://placeholder.execute-api.us-east-1.amazonaws.com/dev
   ```
4. Save the file.

---

## Step 5: Test Locally

1. Start your Vite development server:
   ```powershell
   npm run dev
   ```
2. Open `http://localhost:5173`.
3. Click **Sign In**:
   - The status pill will change from *Awaiting credentials* to **Connected to Amazon Cognito**!
   - Register a new patient account with your email.
   - Enter the 6-digit confirmation code Cognito sent to your inbox.
   - Log in! You are now authenticated with real AWS Cognito!
