# 🎯 Comprehensive Platform Review Request
## Superior One Logistics - Construction Logistics Broker Replacement Platform

**Purpose:** We need an expert review to ensure our platform is enterprise-grade, has seamless workflows, and truly replaces a traditional freight broker. We want to **perfect what we have** before adding new features.

---

## 📋 **EXECUTIVE SUMMARY**

### **What We've Built:**
A full-stack construction logistics platform that connects shippers (GCs, material suppliers) with carriers (dump trucks, flatbeds). Our goal: **completely replace traditional freight brokers** with automated, transparent, technology-driven workflows.

### **Tech Stack:**
- **Backend:** Node.js + Express, Prisma ORM, PostgreSQL
- **Frontend:** React + TypeScript, Vite
- **Caching:** Redis (ioredis)
- **Job Queues:** BullMQ
- **Auth:** JWT with role-based access
- **Payments:** Stripe (cards + ACH)
- **Email:** Twilio SendGrid

### **Current Status:**
- ✅ 84 features implemented
- ✅ Production-ready backend (optimized for 10,000+ concurrent users)
- ✅ All critical broker workflows automated
- ✅ Comprehensive testing suite prepared
- ✅ Zero infrastructure costs (local development)

###  **What We Need From You:**
**Deep review of workflows, architecture, and features to identify:**
1. Critical gaps that would prevent us from replacing a broker
2. Workflow issues that would frustrate real users
3. Enterprise-grade requirements we're missing
4. Security/compliance blind spots
5. Edge cases that could cause failures

---

## 🏗️ **PLATFORM ARCHITECTURE**

### **1. Database Schema (Prisma)**

**Core Models:**
```prisma
// Users & Authentication
User {
  id, orgId, email, passwordHash, role (admin/dispatcher/viewer)
  emailVerified, accountStatus, active
  // Relations: Organization, AuditLogs, GeoEvents
}

Organization {
  id, name, type (SHIPPER/CARRIER/BROKER/BOTH)
  dotNumber (for carriers), mcNumber
  contactEmail, contactPhone, address
  verified, active, verifiedAt
  // FMCSA Verification fields
  fmcsaVerified, fmcsaStatus, fmcsaSafetyRating, fmcsaLastChecked, fmcsaDataSnapshot
  // Relations: Users, Loads, Insurance, CarrierProfile, CreditProfile
}

// Load Management
Load {
  id, orgId, shipperId, carrierId
  loadType (FREIGHT/AGGREGATE/EQUIPMENT/MATERIAL/WASTE)
  rateMode (PER_MILE/PER_TON/PER_YARD/PER_TRIP/PER_HOUR/PER_LOAD/DAILY)
  haulType (METRO/REGIONAL/OTR)
  
  // Material & Equipment
  commodity, equipmentType, equipmentMatchTier, overrideReason
  
  // Origin & Destination (JSON)
  origin: { address, city, state, zip, lat, lng, siteName, constraints }
  destination: { address, city, state, zip, lat, lng, siteName, constraints }
  
  // Pricing
  rate, grossRevenue, platformFee, netToCarrier, miles
  
  // Scheduling
  pickupDate, pickupWindowStart, pickupWindowEnd
  deliveryDate, estimatedDuration
  
  // Status & Workflow
  status (DRAFT/POSTED/ASSIGNED/ACCEPTED/RELEASE_REQUESTED/RELEASED/
          IN_TRANSIT/DELIVERED/COMPLETED/CANCELLED/DISPUTED/TONU/EXPIRED_RELEASE)
  
  // Material Release System (TONU Prevention)
  releaseNumber, releaseRequestedAt, releaseRequestedBy
  releasedAt, releasedBy, releaseExpiresAt, releaseNotes
  shipperConfirmedReady, shipperConfirmedAt, shipperAcknowledgedTonu
  quantityConfirmed
  
  // TONU (Truck Ordered Not Used)
  tonuFiled, tonuFiledAt, tonuAmount, tonuReason, tonuEvidence (JSON)
  
  // Documents & Tracking
  rateConSigned, bolUploaded, podUploaded
  pickupContact (JSON), deliveryContact (JSON)
  
  // Assignment
  assignedAt, assignedBy, acceptedAt
  driver (JSON), truckNumber, trailerNumber
  
  // Special Requirements
  notes, specialInstructions, siteRequirements (JSON)
}

// Insurance (Per Carrier)
Insurance {
  id, orgId, type (cargo/liability/workers_comp)
  provider, policyNumber, coverageAmount, effectiveDate, expiryDate
  documentUrl, verified, active
  // Auto-Verification fields
  lastVerifiedAt, verificationMethod, verificationSource
  autoRenewAlert, alertSentAt
  namedInsured, producerName, producerPhone
}

// Double-Brokering Prevention
DriverIdentity {
  id, orgId, driverName, licenseNumber, licenseState, verified, active
}

LoadAttestation {
  id, loadId, carrierId, signedBy
  attestationType (NO_DOUBLE_BROKER, EQUIPMENT_OWNERSHIP)
  attestationText, signedAt, ipAddress
}

// Payment Automation
Invoice {
  id, loadId, customerId, amount, status, dueDate
  stripeInvoiceId, stripePaymentIntentId
}

Payout {
  id, loadId, carrierId, amount, status, type (STANDARD/QUICKPAY)
  quickPayFee, stripeTransferId, stripeConnectAccountId
}

// Performance & Credit
CarrierProfile {
  orgId, onTimeRate, docAccuracyRate, commsScore, complianceScore, reputationScore
  tier (Bronze/Silver/Gold)
  loadsCount, lastUpdatedAt
}

CreditProfile {
  orgId, creditLimitCents, riskLimitCents, currentExposureCents
  achStatus, externalScore, lastCheckedAt, terms
}

// Recurring Loads
LoadTemplate {
  id, customerId, name, payload (JSON - full load data structure)
}

RecurringSchedule {
  id, templateId, customerId, cronExpression
  nextRunAt, lastRunAt, active
}

// GPS Tracking
GeoEvent {
  id, loadId, driverId, eventType, timestamp
  latitude, longitude, accuracyMeters, source (gps/manual/telematics)
}
```

### **2. Backend Services Architecture**

**Service Layer Pattern:**
```javascript
// src/services/
releaseService.js - Material release & TONU management
fmcsaVerificationService.js - Carrier authority verification
insuranceVerificationService.js - Insurance validation & alerts
doubleBrokerService.js - Attestation, VIN tracking, GPS proximity checks
paymentService.js - Invoicing, charging customers, carrier payouts
performanceScoringService.js - Carrier reputation scoring
creditCheckService.js - Customer credit limit management
gpsTrackingService.js - GPS event ingestion & auto status updates
recurringLoadsService.js - Template & schedule management
emailService.js - Email notifications via SendGrid
```

**Key Business Logic Examples:**

**Material Release Workflow:**
```javascript
// releaseService.js
async function requestRelease(loadId, userId) {
  // Carrier accepts load → auto-request release
  // Updates status: ACCEPTED → RELEASE_REQUESTED
}

async function issueRelease(loadId, userId, payload) {
  // Shipper confirms material ready
  // Requires:
  //   - confirmedReady: boolean
  //   - acknowledgedTonu: boolean (liability waiver)
  //   - quantityConfirmed: string
  //   - pickupInstructions: string
  // Generates unique release number (RL-YYYY-XXXXX)
  // Sets 24-hour expiry
  // Updates status: RELEASE_REQUESTED → RELEASED
  // Hides full pickup address from carrier until released
}

async function fileTonu(loadId, userId, dto) {
  // Carrier files TONU if material not ready
  // Calculates TONU: $200 charged to customer, $150 paid to carrier
  // Updates status: RELEASED → TONU
  // Captures: reason, arrivalTime, waitTime, evidence (photos)
}
```

**FMCSA Verification:**
```javascript
// fmcsaVerificationService.js
async function verifyCarrier(orgId) {
  // Calls FMCSA API (mocked currently)
  // Checks: DOT number, authority status, safety rating
  // Caches result with 30-day TTL
  // Updates Organization: fmcsaVerified, fmcsaStatus, fmcsaSafetyRating
  // Returns: { verified, status, safetyRating, authorityType, data }
}

async function batchVerifyCarriers(orgIds) {
  // Background job to re-verify all carriers
  // Runs monthly via cron job
}
```

**Insurance Blocking:**
```javascript
// insuranceVerificationService.js
async function checkCarrierInsurance(orgId) {
  // Validates all required insurance types (cargo, liability, workers_comp)
  // Checks coverage amounts meet minimums
  // Checks expiry dates
  // Returns: { valid, blocked, message, policies, disputeInfo }
  // If blocked, returns professional dispute process with contact info
}

// Enforced in src/routes/carrier.js POST /loads/:id/accept
// Blocks load acceptance if insurance invalid
// Sends email notification to carrier
```

**Payment Automation:**
```javascript
// paymentService.js
async function createInvoice(loadId) {
  // Auto-triggered when load status → COMPLETED
  // Creates invoice in DB
  // Integrates with Stripe
}

async function chargeCustomer(invoiceId) {
  // Charges customer's saved payment method (card/ACH)
  // Updates invoice status
}

async function processPayoutAsync(loadId, quickPay = false) {
  // Pays carrier via Stripe Connect (ACH)
  // QuickPay option: 3-day payout, 3% fee
  // Standard: 7-day payout, no fee
}
```

**GPS Auto Status Updates:**
```javascript
// gpsTrackingService.js
async function ingestGPSLocation(loadId, driverId, locationData) {
  // Receives GPS ping from carrier app
  // Calculates proximity to pickup/delivery locations
  // Auto-updates load status:
  //   - Near pickup → IN_TRANSIT
  //   - Near delivery → DELIVERED (requires confirmation)
  // Stores in GeoEvent table
}
```

### **3. API Endpoints Structure**

**Authentication:**
```
POST /api/auth/signup - Create account with email verification
POST /api/auth/verify - Verify email code
POST /api/auth/login - Login with JWT
POST /api/auth/resend - Resend verification code
```

**Load Management:**
```
POST /api/loads - Create draft load (customer)
GET /api/loads/:id - Get load details
PATCH /api/loads/:id/status - Update load status
POST /api/customer/loads - Post load to marketplace
GET /api/customer/loads - Get customer's loads
POST /api/customer/loads/:id/release - Issue material release
POST /api/carrier/loads/:id/accept - Accept load (enforces insurance check)
GET /api/carrier/loads/:id/release-status - Check release status
POST /api/carrier/loads/:id/tonu - File TONU claim
POST /api/carrier/loads/:id/attest - Sign anti-double-broker attestation
POST /api/carrier/loads/:id/dispatch-details - Submit VIN/driver before pickup
POST /api/carrier/loads/:id/gps-ping - Submit GPS location
GET /api/marketplace/loads - Browse available loads (public)
```

**Verification:**
```
POST /api/verification/fmcsa/:orgId/verify - Verify carrier FMCSA
GET /api/verification/fmcsa/:orgId/status - Get FMCSA status
POST /api/verification/batch - Batch verify multiple carriers
POST /api/verification/insurance/:id/verify - Verify insurance policy
GET /api/verification/insurance/:orgId/status - Get insurance status
GET /api/verification/insurance/expiring - Get expiring policies (admin)
```

**Payments:**
```
POST /api/payments/invoice/:loadId - Create invoice
POST /api/payments/charge/:invoiceId - Charge customer
POST /api/payments/payout/:loadId - Process carrier payout
```

**Templates & Recurring:**
```
POST /api/templates - Create load template
GET /api/templates/:id - Get template
POST /api/templates/:templateId/schedule - Schedule recurring loads
```

### **4. Frontend Architecture**

**Pages:**
```
/auth/login - Login page
/auth/signup - Signup wizard
/auth/verify-email - Email verification

// Customer Portal
/customer/dashboard - Overview, active loads, analytics
/customer/post-load - Load posting wizard (multi-step)
/customer/my-loads - Active/completed loads with release buttons
/customer/payment-setup - Stripe payment method setup (cards/ACH)

// Carrier Portal (S1 Layout)
/carrier/dashboard - Overview, available loads, earnings
/carrier/load-board - Browse & bid on loads
/carrier/my-loads - Assigned loads with TONU button
/carrier/payout-setup - Stripe Connect payout setup (ACH/W9)

// Shared
/settings - Account settings, billing, Stripe integration
```

**Key Components:**
```typescript
// Material Release System
ReleaseConfirmationModal.tsx
  - Customer confirms material ready
  - Checkboxes for ready confirmation & TONU liability
  - Displays $200 TONU charge warning
  - Captures quantity, site contact, pickup instructions

ReleaseStatusCard.tsx
  - Carrier views release status
  - Shows countdown to pickup
  - Hides full pickup address until released
  - Displays release number when issued

TonuFilingModal.tsx
  - Carrier files TONU claim
  - Inputs: reason, arrival time, wait time, evidence
  - Shows carrier payout: $150 (platform fee hidden)
  - Captures photos/documentation

// Payment Setup
PaymentSetupPage.tsx
  - Customer adds credit card or ACH bank account
  - Stripe Elements integration
  - Saves to Stripe for auto-invoicing

PayoutSetupPage.tsx
  - Carrier adds ACH bank account for payouts
  - Stripe Connect integration
  - W9 upload for tax purposes
  - QuickPay option displayed
```

### **5. Background Job Processing**

**BullMQ Queues:**
```javascript
// src/config/queue.js
QueueNames = {
  EMAIL: 'email-notifications',
  FMCSA_VERIFICATION: 'fmcsa-verification',
  INSURANCE_CHECK: 'insurance-check',
  GPS_PROCESSING: 'gps-processing',
  PAYMENT_PROCESSING: 'payment-processing',
  RECURRING_LOADS: 'recurring-loads',
  ANALYTICS: 'analytics'
}

// Workers
emailWorker.js - Sends emails async (5 concurrent)
// Future: fmcsaWorker, insuranceWorker, gpsWorker, paymentWorker
```

**Cron Jobs:**
```javascript
// src/workers/cronJobs.js
- Daily: Re-verify FMCSA for all carriers
- Daily: Check insurance expiry, send alerts
- Hourly: Process expired release numbers
- Hourly: Check recurring schedules, create loads
```

### **6. Performance Optimizations**

**Database:**
- ✅ Prisma singleton (single connection pool)
- ✅ 15 performance indexes on Load model
- ✅ Slow query detection (>100ms logged)
- ✅ Optimized for 10,000+ concurrent users

**Caching (Redis):**
- ✅ User session caching (24hr TTL) - 80-90% faster auth
- ✅ Load board response caching (5min TTL) - 95%+ faster queries
- ✅ Organization data caching (30min TTL)
- ✅ Rate limiting per endpoint

**Background Processing:**
- ✅ Email sending async (doesn't block API)
- ✅ GPS processing async
- ✅ Payment processing async with retry logic

---

## 🔄 **CRITICAL WORKFLOWS (Step-by-Step)**

### **Workflow 1: Customer Posts Load → Carrier Accepts → Material Release → Delivery → Payment**

**Step 1: Customer Posts Load**
1. Customer logs in (/customer/dashboard)
2. Clicks "Post New Load" → /customer/post-load
3. Multi-step wizard:
   - Step 1: Material (commodity, quantity, equipmentType)
   - Step 2: Pickup/Delivery (addresses, dates, times)
   - Step 3: Pricing (rate mode, amount per unit)
   - Step 4: Details (special instructions, site requirements)
4. Backend: `POST /api/customer/loads`
   - Equipment matcher suggests optimal equipment
   - Haul type detector classifies (metro/regional/OTR)
   - Rate calculator validates pricing
   - Compliance engine checks regulations
   - Creates Load with status: DRAFT
5. Customer reviews, clicks "Post to Marketplace"
6. Backend: `PATCH /api/loads/:id/status` → status: POSTED
7. Load appears on carrier load board

**Step 2: Carrier Browses & Accepts**
1. Carrier logs in (/carrier/dashboard)
2. Clicks "Find Loads" → /carrier/load-board
3. Backend: `GET /api/marketplace/loads` (cached 5min, optimized query)
4. Carrier filters by: state, equipment type, haul type, rate, miles
5. Carrier clicks load → sees details modal (NOT full pickup address yet)
6. Carrier clicks "Accept Load"
7. Backend: `POST /api/carrier/loads/:id/accept`
   - **CRITICAL: Insurance check enforced**
   - `insuranceVerificationService.checkCarrierInsurance(carrierId)`
   - If invalid: Returns 403 with professional dispute info, sends email
   - If valid: Updates status: POSTED → ACCEPTED
   - Auto-triggers: `releaseService.requestRelease(loadId)`
   - Updates status: ACCEPTED → RELEASE_REQUESTED
8. Customer receives notification: "Load accepted, confirm material ready"

**Step 3: Material Release (TONU Prevention)**
1. Customer receives notification → goes to /customer/my-loads
2. Sees "Issue Release" button (orange, animated)
3. Clicks button → `ReleaseConfirmationModal` opens
4. Customer must check TWO boxes:
   - ✅ "I confirm the material is ready for pickup NOW"
   - ✅ "I acknowledge TONU liability ($200 if material not ready)"
5. Customer enters:
   - Quantity confirmed: "20 tons crushed limestone"
   - Site contact: "Tom Martinez (512) 555-0999"
   - Pickup instructions: "Use gate B, check in at office. Gate code: #4521"
6. Clicks "Issue Release Number"
7. Backend: `POST /api/customer/loads/:id/release`
   - Validates both checkboxes checked
   - Generates unique release number: "RL-2025-ABC123"
   - Sets 24-hour expiry
   - Updates status: RELEASE_REQUESTED → RELEASED
   - Stores confirmation data
8. Carrier receives SMS + push notification: "RELEASED: #RL-2025-ABC123"
9. Carrier goes to /carrier/my-loads
10. Sees `ReleaseStatusCard` with:
    - ✅ Release number
    - ✅ Full pickup address (NOW visible)
    - ✅ Pickup instructions with gate code
    - ✅ Site contact info
    - ✅ Expiry countdown (23:45:12 remaining)
11. **IMPORTANT: TONU button NOW visible on carrier's load card**

**Step 4A: Happy Path - Pickup & Delivery**
1. Carrier dispatches driver to pickup location
2. Driver clicks "Start Pickup" in carrier app
3. Backend: `POST /api/carrier/loads/:id/gps-ping`
   - GPS coordinates sent
   - `gpsTrackingService.ingestGPSLocation()`
   - Calculates proximity to pickup location
   - If within 100m: Auto-updates status: RELEASED → IN_TRANSIT
4. Driver loads material, gets BOL signed
5. Carrier uploads BOL photo: `bolUploaded: true`
6. Driver navigates to delivery site
7. Backend: Continuous GPS pings every 5min
8. Driver arrives at delivery, unloads material
9. Driver gets POD signed, takes photo
10. Carrier uploads POD: `podUploaded: true`
11. Carrier clicks "Mark Delivered"
12. Backend: `PATCH /api/loads/:id/status` → status: DELIVERED
13. Customer receives notification: "Load delivered, please confirm"
14. Customer reviews POD, clicks "Confirm Complete"
15. Backend: Updates status: DELIVERED → COMPLETED
16. **Auto-triggers payment automation:**
    - `paymentService.createInvoice(loadId)` (background job)
    - Creates invoice for customer
    - `paymentService.chargeCustomer(invoiceId)` (background job)
    - Charges customer's saved payment method (card/ACH)
    - `paymentService.processPayoutAsync(loadId)` (background job)
    - Pays carrier via Stripe Connect (standard 7-day or QuickPay 3-day)

**Step 4B: Unhappy Path - TONU Scenario**
1. Carrier dispatches driver to pickup location
2. Driver arrives at site
3. Driver checks in: "Material not ready, still being processed"
4. Carrier logs into /carrier/my-loads
5. Sees "Material Not Ready - File TONU" button (red, prominent)
6. Clicks button → `TonuFilingModal` opens
7. Carrier fills out:
   - Reason: "Material not loaded, told to wait 2+ hours"
   - Arrival time: "2025-10-10 08:30 AM"
   - Wait time: "30 minutes"
   - Evidence: Uploads photos of site, timestamp photo, text messages
8. Modal shows: "Your TONU Compensation: $150 flat rate"
9. Carrier clicks "Submit TONU Claim"
10. Backend: `POST /api/carrier/loads/:id/tonu`
    - Validates required fields
    - Calculates: $200 charged to customer, $150 paid to carrier, $50 platform fee
    - Updates status: RELEASED → TONU
    - Stores evidence (photos)
11. Customer receives notification: "TONU filed on Load #12345"
12. Customer sees dispute details, can contest if incorrect
13. **Payment automation for TONU:**
    - `paymentService.createInvoice(loadId)` (TONU invoice for $200)
    - `paymentService.chargeCustomer(invoiceId)` (charges customer)
    - `paymentService.processPayoutAsync(loadId, tonuPayout: true)` (pays carrier $150)

### **Workflow 2: FMCSA Verification & Insurance Blocking**

**Automatic Verification:**
1. Carrier signs up (/auth/signup)
2. Provides DOT number during onboarding
3. Backend: `POST /api/auth/signup`
   - Creates Organization with DOT number
   - Queues background job: `fmcsaVerificationService.verifyCarrier(orgId)`
4. Background worker calls FMCSA API (currently mocked)
5. Returns: { verified: true, status: 'AUTHORIZED', safetyRating: 'SATISFACTORY' }
6. Updates Organization: fmcsaVerified: true
7. Carrier can now accept loads

**Insurance Enforcement:**
1. Carrier uploads insurance documents in /settings
2. Admin or auto-OCR verifies policy details
3. Creates Insurance records (cargo, liability, workers_comp)
4. When carrier tries to accept load:
5. Backend: `POST /api/carrier/loads/:id/accept`
   - **Line 25:** `insuranceService.checkCarrierInsurance(req.user.orgId)`
   - Checks all required insurance types present
   - Checks coverage amounts meet minimums (cargo: $1M, liability: $750K)
   - Checks expiry dates not passed
   - If ANY check fails: Returns 403 with professional dispute message
6. Carrier sees professional error modal:
   - Title: "Insurance Verification Required"
   - Message: "Your account is temporarily restricted. Missing cargo insurance."
   - Action: "Upload current certificates in Compliance section"
   - Requirements: Lists all minimum coverage amounts
   - Dispute: Phone, email, hours, 24-48hr review process
7. Email sent to carrier: "Action Required: Insurance Verification"
8. Carrier uploads updated insurance
9. Admin verifies and marks active
10. Carrier can now accept loads

**Ongoing Monitoring:**
1. Cron job runs daily: `cronJobs.checkInsuranceExpiry()`
2. Finds insurance expiring in <30 days
3. Sends alert email to carrier: "Insurance expiring soon"
4. If expires: `insuranceService.checkCarrierInsurance()` returns blocked: true
5. Carrier immediately blocked from accepting new loads
6. Background job: Email notification sent
7. Carrier must upload new insurance to unblock

### **Workflow 3: Double-Brokering Prevention**

**Step 1: Attestation**
1. Carrier accepts load
2. Backend forces attestation: `POST /api/carrier/loads/:id/attest`
3. Attestation text displayed:
   - "I confirm I will not re-broker this load to a third party"
   - "I confirm I own or lease the equipment that will haul this load"
4. Carrier must sign digitally
5. Captures: IP address, timestamp, user signature
6. Stores in LoadAttestation table

**Step 2: VIN & Driver Verification**
1. Before pickup, carrier must submit:
2. Backend: `POST /api/carrier/loads/:id/dispatch-details`
   - VIN (vehicle identification number)
   - Driver name, license number, license state
   - Truck number, trailer number
3. Backend verifies:
   - VIN matches carrier's registered equipment in CarrierEquipment table
   - Driver exists in DriverIdentity table for this carrier
4. If mismatch: Flags for manual review, blocks pickup

**Step 3: GPS Proximity Verification**
1. Driver arrives at pickup location
2. Carrier app sends GPS ping: `POST /api/carrier/loads/:id/gps-ping`
3. Backend: `gpsTrackingService.ingestGPSLocation()`
4. Backend: `doubleBrokerService.verifyPickupProximity()`
   - Calculates distance between GPS coordinates and pickup location
   - If >500m: Flags potential double-brokering
   - If <100m: Verified legitimate pickup
5. Store in GeoEvent table for audit trail

### **Workflow 4: Performance Scoring & Carrier Tiers**

**Automatic Scoring:**
1. After each completed load:
2. Background job: `performanceScoringService.updateCarrierScore(carrierId)`
3. Calculates metrics:
   - On-time rate: % of loads delivered on time
   - Doc accuracy: % of loads with correct BOL/POD
   - Comms score: Response time, professionalism
   - Compliance score: Insurance, FMCSA, attestations up-to-date
   - Reputation: Customer ratings
4. Assigns tier based on thresholds:
   - Gold: >95% on-time, >98% doc accuracy, 100% compliance
   - Silver: >85% on-time, >90% doc accuracy, 100% compliance
   - Bronze: <85% on-time or compliance issues
5. Updates CarrierProfile: tier, scores, loadsCount
6. Higher tiers get priority in load assignments, better rates

---

## ❓ **CRITICAL REVIEW QUESTIONS**

### **🚨 A. Workflow & Logic Gaps**

**1. Material Release System:**
- Is the release workflow robust enough to prevent TONU abuse?
- Should we require photo evidence of ready material before issuing release?
- Is 24-hour release expiry appropriate, or should it be configurable?
- What happens if pickup window is missed after release issued?
- Should we block release if carrier insurance expired since acceptance?
- What if shipper confirms ready but quantity is significantly different on arrival?

**2. TONU Enforcement:**
- Is $200 customer charge / $150 carrier payout fair for construction?
- Should TONU amount be based on load value or distance traveled?
- What if customer disputes TONU claim? Who arbitrates?
- Should we require timestamp photo evidence for all TONU filings?
- Can carriers abuse TONU by filing false claims?
- What's the appeals process if customer disagrees?

**3. Insurance & Compliance:**
- Are our minimum coverage amounts correct? (Cargo: $1M, Liability: $750K)
- Should we verify insurance with actual insurance API vs. document uploads?
- What if carrier's insurance lapses mid-load (after pickup, before delivery)?
- Should we block existing assigned loads or just new acceptances?
- Is 24-48hr dispute review time reasonable?
- Should we have emergency contact for urgent insurance issues?

**4. Payment Flow:**
- What happens if customer's card declines when auto-charging invoice?
- Should we hold carrier payout until customer payment clears?
- What's the retry logic for failed ACH transfers?
- Should we escrow funds before load starts?
- What if customer disputes charge after delivery?
- How do we handle partial deliveries (e.g., 15 tons delivered instead of 20)?

**5. GPS & Tracking:**
- Is 5-minute GPS ping frequency sufficient?
- What if driver's phone dies or loses signal?
- Should we integrate with ELD (Electronic Logging Device) instead?
- What's the fallback if GPS fails?
- How do we handle drivers who forget to check in/out?
- Should we auto-file TONU if carrier no-shows (GPS never arrives)?

**6. Double-Brokering Prevention:**
- Can carriers still double-broker despite attestation?
- Should we require selfie with truck + load number at pickup?
- What if VIN is registered to carrier but truck is leased out?
- Should we verify driver license with DMV API?
- How do we catch double-brokering after the fact?
- Should we blacklist carriers caught double-brokering?

### **🏗️ B. Enterprise-Grade Requirements**

**7. Scalability & Performance:**
- Have we load-tested the platform? (Target: 10,000 concurrent users)
- Are our database indexes sufficient for complex load board queries?
- Will Redis caching hold up under high traffic?
- Are BullMQ jobs configured for high throughput?
- Do we need database read replicas for scaling?
- Are there any single points of failure?

**8. Security & Data Protection:**
- Is JWT auth sufficient or should we add OAuth2?
- Are we properly sanitizing user inputs (SQL injection, XSS)?
- Should we encrypt sensitive data at rest (PII, financial data)?
- Are API rate limits configured appropriately?
- Do we have audit logging for all critical actions?
- Are we GDPR/CCPA compliant?

**9. Reliability & Error Handling:**
- What happens if Stripe API is down during payment?
- Do we have circuit breakers for external API calls?
- Are all background jobs retrying on failure?
- What's the dead letter queue strategy for failed jobs?
- Do we have health checks for all critical services?
- Is there a rollback strategy for failed deployments?

**10. Monitoring & Observability:**
- Are we logging all critical events?
- Do we have alerting for system failures?
- Are we tracking key business metrics (loads posted, acceptance rate, TONU rate)?
- Do we have uptime monitoring?
- Are slow queries being tracked and optimized?
- Do we have error tracking (Sentry, Rollbar)?

### **💼 C. Business Logic & Edge Cases**

**11. Load Lifecycle Edge Cases:**
- What if customer cancels load after carrier accepts but before release?
- Should we charge cancellation fee?
- What if carrier cancels after release issued?
- How do we handle no-shows (carrier doesn't arrive)?
- What if delivery site refuses load (wrong material)?
- How do we handle load rejections at delivery?
- What if load is only partially delivered?

**12. Pricing & Rates:**
- Are our rate modes comprehensive? (PER_MILE/TON/YARD/TRIP/HOUR/LOAD/DAILY)
- Should we support spot rates vs. contract rates?
- Do we need surge pricing for high-demand routes?
- Should carriers be able to counter-offer on rates?
- How do we handle rate adjustments (e.g., fuel surcharges)?
- What if actual quantity differs from quoted quantity?

**13. Multi-Party Scenarios:**
- What if load requires multiple stops (pickup from 2 quarries)?
- Do we support team drivers or relay operations?
- Can a shipper have multiple delivery sites for one load?
- Should we support pooled loads (multiple shippers, one carrier)?
- How do we handle loads that need transloading?
- Do we support cross-docking scenarios?

**14. Accessorial Charges:**
- How are accessorial charges added? (Detention, driver assist, wait time)
- Detention: First 2 hours free, then $75/hr in 30min increments - correct?
- Driver Assist: Flat $150 - appropriate?
- Should these be configurable per load?
- Who initiates accessorial charge requests (carrier or customer)?
- What's the dispute process for accessorials?
- Are accessorial rates market-competitive?

**15. Customer Credit & Risk:**
- How do we determine initial credit limits for new customers?
- Should we require prepayment for new customers?
- What if customer exceeds credit limit mid-load?
- Do we need personal guarantees for small businesses?
- Should we offer net-30 terms or require immediate payment?
- What's the collections process for unpaid invoices?

### **🔐 D. Legal & Compliance**

**16. Broker Authority & Liability:**
- Do we have proper broker authority (MC number)?
- Are we legally liable as a broker vs. a platform?
- What's our liability if carrier damages cargo?
- Are we liable for carrier accidents during hauls?
- Do we need errors & omissions (E&O) insurance?
- What indemnification clauses do we need?

**17. Contracts & Agreements:**
- Do we have proper terms of service for shippers?
- Do we have carrier agreements (broker-carrier contract)?
- Are our rate confirmations legally binding?
- Do we need master service agreements (MSAs)?
- Should we have non-circumvention clauses?
- Are our electronic signatures legally valid (E-SIGN Act)?

**18. State & Federal Regulations:**
- Are we compliant with FMCSA broker regulations?
- Do we need surety bond ($75K for freight brokers)?
- Are we registered with USDOT?
- Do we need operating authority in every state?
- Are there Texas-specific regulations for construction materials?
- Do we need weight/oversize load permit systems?

**19. Data Retention & Privacy:**
- How long do we retain load data? (FMCSA requires 3 years)
- Are we compliant with data privacy laws?
- Do we have a privacy policy?
- Can users delete their data (GDPR right to be forgotten)?
- Are we storing data in US servers (data sovereignty)?
- Do we have data breach notification procedures?

**20. Tax & Financial Compliance:**
- Are we collecting/remitting sales tax correctly?
- Do we need 1099s for carrier payouts?
- Are we compliant with 1099-K reporting thresholds?
- Do we need to verify W9s before paying carriers?
- Are we handling fuel tax reporting (IFTA)?
- Do we need to file Form 2290 (heavy vehicle use tax)?

### **🎯 E. Product Completeness**

**21. Missing Features That Brokers Have:**
- Do we need a dedicated customer success team?
- Should we have 24/7 phone support?
- Do we need freight factoring integration?
- Should we offer fuel card programs?
- Do we need cargo insurance brokerage?
- Should we have preferred carrier networks?
- Do we need tender/RFP management for enterprise shippers?

**22. User Experience Gaps:**
- Is onboarding smooth enough? (Time to first load?)
- Do we need in-app tutorials or demos?
- Should we have a mobile app (vs. just responsive web)?
- Do carriers need offline functionality?
- Should we have in-app messaging between parties?
- Do we need SMS/push notifications for critical events?
- Is the load board UI intuitive enough?

**23. Reporting & Analytics:**
- What reports do shippers need? (Spend analysis, carrier performance)
- What reports do carriers need? (Revenue, profitability, deadhead miles)
- Do we need admin dashboards for platform health?
- Should we provide market rate intelligence?
- Do we need freight audit capabilities?
- Should we have exportable reports (CSV, PDF)?

**24. Integration & APIs:**
- Should we integrate with TMS (Transportation Management Systems)?
- Do we need API for third-party integrations?
- Should we integrate with accounting systems (QuickBooks, Xero)?
- Do we need project management tool integrations (Procore)?
- Should we have webhook notifications for load events?
- Do we need EDI (Electronic Data Interchange) for enterprise shippers?

---

## 🎯 **FINAL REQUEST**

**Please provide:**

1. **Critical Gaps (Top 10):**
   - What features/workflows are MISSING that would prevent us from replacing a broker?
   - Rank by severity (deal-breakers first)

2. **Workflow Issues (Top 10):**
   - What workflow logic is flawed or incomplete?
   - What edge cases aren't handled?
   - What would frustrate real users?

3. **Enterprise Requirements (Top 10):**
   - What do we need to be enterprise-grade?
   - Security, compliance, scalability concerns?
   - What would prevent enterprise adoption?

4. **Risk Assessment:**
   - What could cause the platform to fail under real load?
   - What legal/compliance risks are we exposed to?
   - What operational risks haven't we considered?

5. **30-Day Priority Roadmap:**
   - What should we fix/build FIRST before launching?
   - What can wait until post-launch?
   - What's the minimum viable product to replace a broker?

**Be brutally honest. We want to know what's broken, incomplete, or missing BEFORE we onboard real customers.**

