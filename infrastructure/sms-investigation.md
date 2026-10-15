# AWS SMS Notifications Investigation for CloudCare

This document provides a technical and cost analysis for implementing SMS notifications in the CloudCare Hospital Appointment Booking System.

---

## 1. Candidate AWS SMS Services

### A. AWS End User Messaging SMS (formerly Amazon Pinpoint SMS)
- **Role**: AWS's modern flagship service for transactional and two-way SMS, MMS, and voice messaging.
- **Features**:
  - High deliverability, phone number pooling, message template management.
  - Native opt-out handling, delivery status metrics, and CloudWatch integration.
  - Dedicated origination identities (Long codes, Short codes, Toll-free numbers, Sender IDs).
- **Suitability**: Best suited for production healthcare enterprise environments.

### B. Amazon SNS (Simple Notification Service) Direct SMS
- **Role**: Lightweight, API-driven programmatic messaging.
- **Features**:
  - Simple `PublishCommand({ Message, PhoneNumber })` SDK call.
  - No need to manage complex message campaigns.
- **Suitability**: Recommended for lightweight developer/academic projects when SMS is required.

---

## 2. Regulatory & Setup Requirements (Why SMS Cannot Be "Instantly Free")

Unlike email (Amazon SES) which can be tested immediately with verified email addresses for free, **telecom regulations globally require strict business identity registration** before SMS messages are accepted by mobile networks:

### India (TRAI Regulations - DLT System)
1. **Mandatory DLT Registration**: Under Telecom Regulatory Authority of India (TRAI) guidelines, every business must register on a DLT portal (Jio DLT, Airtel DLT, or Vodafone Idea DLT).
2. **Entity & Header Approval**: You must register a Principal Entity and register a 6-character Alpha Sender ID (Header, e.g., `CLDCR-H`).
3. **Template Approval**: Every transactional message template (e.g. *"Dear {#var#}, your appointment {#var#} is confirmed..."*) must be pre-approved on DLT. Any message deviating by even one character is rejected by Indian telecom carriers.
4. **DLT Fees**: Telecom providers in India charge a non-refundable one-time registration fee (typically ₹5,900 incl. GST).

### United States & Canada (10DLC / Toll-Free)
1. **A2P 10DLC**: Requires legal business entity registration (EIN, corporate address) and campaign registration through The Campaign Registry (TCR).
2. **Monthly Brand Fees**: $4 to $10/month per campaign plus number lease fees ($1-$2/month).

---

## 3. Cost Analysis & Pricing Breakdown

| Item | Amazon SES (Email) | Amazon SNS / Pinpoint (SMS) |
|---|---|---|
| **Free Tier Allowance** | **62,000 emails/month** free when sent from AWS Lambda | **No Free Tier for SMS**. Every SMS incurs charges. |
| **Per-Message Cost (India)** | $0.0001 (negligible) | ~$0.0035 to $0.0058 per SMS (~₹0.30 to ₹0.50/SMS) + carrier fees |
| **Monthly Fixed Cost** | $0.00 | $0 to $15/month (depending on sender ID / 10DLC) |
| **Registration / Setup Cost** | **$0.00 (Free in AWS Console)** | ₹5,900 DLT registration fee (India) or 10DLC fees (US) |
| **Default Sandbox Limit** | 200 emails/day | $1.00/month maximum account spend limit |

---

## 4. Academic Project Recommendation for CloudCare

1. **Keep SMS as Documented Architecture**:
   - For a 2nd-Year B.Tech CSE Mini Project, paying telecom registration fees and provisioning dedicated carrier sender IDs is unnecessary and cost-prohibitive.
2. **Use Amazon SES (Email) as the Primary Notification Channel**:
   - Amazon SES is 100% free-tier eligible, has zero setup costs, provides professional HTML confirmation receipts, and is fully supported in our backend architecture.
3. **If SMS is Required by Evaluators**:
   - We have provided the mock notification handler and architecture pattern so the evaluator can see the logic, and we can demonstrate how the payload would map to `aws-sdk/client-sns`.
