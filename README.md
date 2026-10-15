# CloudCare – Hospital Appointment Booking System Using AWS
**2nd-Year B.Tech CSE Mini Project**

A modern, responsive healthcare appointment management web application engineered with a clean React single-page frontend and designed for an **AWS Serverless Cloud** backend architecture.

---

## 📌 Project Overview & System Roles

CloudCare streamlines the scheduling process between patients and multi-specialty clinical departments, eliminating outpatient queue times and offering transparent, real-time doctor availability.

The system incorporates three distinct roles:
1. **Patient**:
   - Discover doctors by name, medical specialty, and same-day availability.
   - Choose convenient consultation time slots.
   - (Planned) View booking history, reschedule, and cancel appointments with instant cloud confirmations.
2. **Doctor**:
   - (Planned) Dedicated physician portal to manage daily consultation queues.
   - Update availability schedules, blackout dates, and slot durations.
   - View patient consultation history and log appointment status.
3. **Admin**:
   - (Planned) Hospital operations command center.
   - Verify and onboard doctor profiles, map clinical departments.
   - Review CloudWatch operational metrics, error traces, and patient volume statistics.

---

## 🏗️ Technical Architecture & AWS Stack

| Layer | Technology / AWS Service | Purpose | Current Status |
|---|---|---|---|
| **Frontend** | React 18 + Vite + Modern CSS | Responsive healthcare UI, interactive search & slot selection | **Active (Phase 1)** |
| **Icons & Design** | Lucide Icons + Plus Jakarta Sans | Clinical aesthetics, accessibility, and iconography | **Active (Phase 1)** |
| **Hosting** | AWS Amplify Hosting | Continuous deployment from Git repo with SSL | *Planned (Phase 5)* |
| **Authentication** | Amazon Cognito | User Pools with RBAC (Patient, Doctor, Admin groups) | *Planned (Phase 2)* |
| **API Gateway** | Amazon API Gateway (REST API) | Request routing, CORS handling & Cognito Authorizer | *Planned (Phase 2)* |
| **Backend Compute**| Node.js on AWS Lambda | Serverless microservices for appointments & schedules | *Planned (Phase 2)* |
| **Database** | Amazon DynamoDB | NoSQL high-speed key-value & document storage | *Planned (Phase 2)* |
| **Notifications** | Amazon SES | Email booking vouchers & reminder notifications | *Planned (Phase 3)* |
| **Monitoring** | Amazon CloudWatch | Lambda execution logs & API gateway performance metrics | *Planned (Phase 4)* |
| **Access Control** | AWS IAM | Least-privilege role policies for cloud microservices | *Planned (Phase 2)* |

---

## 📁 Project Directory Structure

```
CloudCare_miniproject/
├── frontend/                     # React + Vite application
│   ├── public/
│   │   └── favicon.svg           # Medical pulse favicon
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   │   ├── Navbar.jsx        # Navigation & Role portal selector
│   │   │   ├── Hero.jsx          # Hero section with quick doctor finder
│   │   │   ├── EmergencyBanner.jsx # 24/7 hospital emergency triage strip
│   │   │   ├── Departments.jsx   # Clinical specialty cards
│   │   │   ├── SearchFilter.jsx  # Doctor search & filter bar
│   │   │   ├── DoctorCard.jsx    # Doctor credential cards & slots preview
│   │   │   ├── DoctorModal.jsx   # Detail modal & demo slot reservation
│   │   │   ├── HowItWorks.jsx    # 4-step patient booking journey
│   │   │   ├── RolePortalsPreview.jsx # Patient, Doctor, and Admin RBAC specs
│   │   │   ├── AwsTechStack.jsx  # AWS Serverless cloud mapping section
│   │   │   └── Footer.jsx        # Hospital info, campus address, disclaimer
│   │   ├── data/
│   │   │   ├── doctorsData.js     # Sample doctor dataset (8 specialties)
│   │   │   └── departmentsData.js # 8 hospital departments
│   │   ├── styles/
│   │   │   └── index.css         # Modern medical design system stylesheet
│   │   ├── App.jsx               # Main state container with live search
│   │   └── main.jsx              # React DOM mount point
│   ├── index.html
│   ├── package.json              # Frontend dependencies (React, Vite, Lucide)
│   └── vite.config.js
├── backend/                      # Node.js Lambda microservices (Phase 2)
│   └── README.md
├── infrastructure/               # CloudFormation / SAM templates & DynamoDB schema
│   └── README.md
├── .gitignore                    # Prevents node_modules, .env & AWS secrets from git
├── package.json                  # Root orchestration scripts
└── README.md                     # Project documentation & execution guide
```

---

## 🚀 How to Run and Test Locally

### Prerequisites
- Node.js (v18 or higher recommended, verified with v24.x)
- npm (v9 or higher)

### Option 1: Run from the Root Directory (Quickest)

1. Open PowerShell or Command Prompt in the project folder:
   ```powershell
   npm run dev
   ```
2. Open your web browser and navigate to:
   ```
   http://localhost:5173
   ```

### Option 2: Run directly inside the `frontend` folder

1. Navigate to the frontend directory:
   ```powershell
   cd frontend
   npm run dev
   ```
2. Open your web browser at `http://localhost:5173`.

### To create a production build:
```powershell
npm run build
```
*(The optimized production bundle will be generated in `frontend/dist/`)*

---

## 🧪 What You Can Test in Version 1 (Phase 1)

1. **Doctor Discovery & Search**:
   - Type doctor names (e.g., `Arvind`, `Sneha`, `Sharma`) or keywords (e.g., `AIIMS`, `stroke`, `cardiology`, `pediatrics`) in the search bar.
   - Observe instant reactive filtering.
2. **Department Filter**:
   - Click any department card in the "Specialties" section or use the filter chips/dropdown to view specialists in Cardiology, Neurology, Orthopedics, Pediatrics, Dermatology, General Medicine, ENT, and Oncology.
3. **Availability Filter**:
   - Check the **"Available Today Only"** toggle to filter doctors who have active outpatient slots on the current day.
4. **Slot Selection & Booking Feedback**:
   - Click **"Book Appointment"** on any doctor card.
   - Inspect doctor qualifications, experience, consultation fee, and hospital wing.
   - Select a time slot, enter patient details, and click **"Confirm Slot Reservation"**.
   - Review the confirmation screen with the pre-reserved slot token.
5. **Role Portals Preview (RBAC)**:
   - Click **"Portal Login"** in the top navigation or scroll to the **"User Roles"** section to inspect the planned features and AWS Cognito specifications for the **Patient**, **Doctor**, and **Admin** portals.
6. **AWS Architecture Visualization**:
   - Scroll to the **"Cloud Stack"** section to review how each AWS cloud service (Amplify, Lambda, API Gateway, DynamoDB, Cognito, SES, CloudWatch, IAM) integrates into the final multi-phase system.

---

## 🛡️ Important Academic & Security Notice

- **No AWS Resources Billed Yet**: No paid cloud infrastructure or deployments have been initiated in this phase.
- **Credential Protection**: No AWS access keys, secret keys, or account IDs are stored in the code. A comprehensive `.gitignore` is in place.
- **Honest Integration Roadmap**: In accordance with academic honesty, Phase 1 establishes the frontend foundation, data contracts, and UI flow. Live integration with Amazon Cognito, DynamoDB, and API Gateway will be connected in Phase 2.

---

## 📅 Multi-Phase Roadmap

- [x] **Phase 1 (Completed)**: Frontend foundation, responsive healthcare UI, doctor search & specialization filter, demo slot booking dialog, and architecture mapping.
- [ ] **Phase 2**: AWS Cognito User Pool setup (Patient, Doctor, Admin groups), DynamoDB table creation, Node.js Lambda functions for appointment booking and cancellation, and Amazon API Gateway integration.
- [ ] **Phase 3**: Doctor & Admin portal dashboard pages, Amazon SES transactional email triggers.
- [ ] **Phase 4**: CloudWatch monitoring, logging, and error tracing.
- [ ] **Phase 5**: Production deployment via AWS Amplify Hosting.
