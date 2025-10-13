# TEST_062: Insurance Policy Verification

## 📋 **Test Information**
- **Feature**: Insurance Verification & Expiry Monitoring
- **Priority**: 🔴 CRITICAL (Legal/Liability)
- **Endpoints**: 
  - `POST /api/verification/insurance/:id/verify`
  - `GET /api/verification/insurance/:orgId/status`
  - `GET /api/verification/insurance/expiring`
- **Authentication**: Required
- **Dependencies**: 
  - Carrier organization exists
  - Insurance policies in database

---

## 🎯 **Test Objective**
Ensure carriers cannot operate without valid insurance, and expiring policies trigger alerts to prevent coverage gaps.

---

## 🔧 **Test Data Setup**

### **Create Test Insurance Policies:**

```sql
-- Cargo Insurance (Valid)
INSERT INTO insurance (
  id, org_id, type, provider, policy_number,
  coverage_amount, effective_date, expiry_date,
  verified, active, created_at
) VALUES (
  'ins-cargo-valid',
  '{carrierOrgId}',
  'cargo',
  'Progressive Commercial',
  'CARGO-2025-001',
  1000000.00,
  '2025-01-01',
  '2025-12-31',
  false,
  true,
  NOW()
);

-- Liability Insurance (Valid)
INSERT INTO insurance (
  id, org_id, type, provider, policy_number,
  coverage_amount, effective_date, expiry_date,
  verified, active, created_at
) VALUES (
  'ins-liability-valid',
  '{carrierOrgId}',
  'liability',
  'Travelers',
  'LIAB-2025-001',
  100000.00,
  '2025-01-01',
  '2025-12-31',
  false,
  true,
  NOW()
);

-- Expired Insurance (for negative testing)
INSERT INTO insurance (
  id, org_id, type, provider, policy_number,
  coverage_amount, effective_date, expiry_date,
  verified, active, created_at
) VALUES (
  'ins-expired',
  '{carrierOrgId2}',
  'cargo',
  'Old Insurance Co',
  'EXPIRED-001',
  1000000.00,
  '2024-01-01',
  '2024-12-31',
  false,
  true,
  NOW()
);

-- Insufficient Coverage (for negative testing)
INSERT INTO insurance (
  id, org_id, type, provider, policy_number,
  coverage_amount, effective_date, expiry_date,
  verified, active, created_at
) VALUES (
  'ins-insufficient',
  '{carrierOrgId3}',
  'cargo',
  'Budget Insurance',
  'LOW-001',
  500000.00,  -- Only $500K (need $1M)
  '2025-01-01',
  '2025-12-31',
  false,
  true,
  NOW()
);
```

---

## 📝 **Test Cases**

### **Test Case 62.1: Verify Valid Insurance Policy**

**Request:**
```http
POST http://localhost:3000/api/verification/insurance/ins-cargo-valid/verify
Authorization: Bearer {token}
Content-Type: application/json

{
  "minCoverageAmount": 1000000
}
```

**Expected Response:**
```json
{
  "success": true,
  "verified": true,
  "expired": false,
  "coverageAdequate": true,
  "daysUntilExpiry": 350,
  "message": "Insurance verified successfully"
}
```

**Expected Status Code:** `200 OK`

**Expected Side Effects:**
- ✅ Insurance.verified = true
- ✅ Insurance.lastVerifiedAt = current timestamp
- ✅ Insurance.verificationMethod = "MANUAL"

---

### **Test Case 62.2: Check Overall Carrier Insurance Status**

**Request:**
```http
GET http://localhost:3000/api/verification/insurance/{carrierOrgId}/status
Authorization: Bearer {carrierToken}
```

**Expected Response:**
```json
{
  "success": true,
  "valid": true,
  "allRequiredCovered": true,
  "adequateCoverage": true,
  "expiredCount": 0,
  "validCount": 2,
  "missingTypes": [],
  "message": "All insurance policies valid",
  "policies": [
    {
      "id": "ins-cargo-valid",
      "type": "cargo",
      "provider": "Progressive Commercial",
      "coverageAmount": "1000000",
      "expiryDate": "2025-12-31"
    },
    {
      "id": "ins-liability-valid",
      "type": "liability",
      "provider": "Travelers",
      "coverageAmount": "100000",
      "expiryDate": "2025-12-31"
    }
  ],
  "minimumRequirements": {
    "cargo": 1000000,
    "liability": 100000
  }
}
```

**Expected Status Code:** `200 OK`

---

### **Test Case 62.3: Missing Required Insurance Type (Negative)**

**Setup:** Carrier only has cargo insurance, no liability

**Expected Response:**
```json
{
  "success": true,
  "valid": false,
  "allRequiredCovered": false,
  "missingTypes": ["liability"],
  "message": "Missing required insurance: liability"
}
```

**Expected Side Effects:**
- ✅ Organization.verified = false
- ✅ Carrier CANNOT accept loads

---

### **Test Case 62.4: Expired Insurance (Negative)**

**Request:**
```http
POST http://localhost:3000/api/verification/insurance/ins-expired/verify
Authorization: Bearer {token}
```

**Expected Response:**
```json
{
  "success": true,
  "verified": false,
  "expired": true,
  "coverageAdequate": true,
  "daysUntilExpiry": 0,
  "message": "Insurance has expired"
}
```

**Expected Side Effects:**
- ✅ Insurance.verified = false
- ✅ Insurance.active = false
- ✅ Organization.verified = false (carrier suspended)
- ✅ Carrier CANNOT accept loads

---

### **Test Case 62.5: Insufficient Coverage Amount (Negative)**

**Request:**
```http
POST http://localhost:3000/api/verification/insurance/ins-insufficient/verify
Authorization: Bearer {token}
Content-Type: application/json

{
  "minCoverageAmount": 1000000
}
```

**Expected Response:**
```json
{
  "success": true,
  "verified": false,
  "expired": false,
  "coverageAdequate": false,
  "message": "Coverage amount insufficient"
}
```

**Expected Side Effects:**
- ✅ Insurance.verified = false
- ✅ Organization.verified = false

---

### **Test Case 62.6: Insurance Check Blocks Load Acceptance**

**Request:**
```http
POST http://localhost:3000/api/carrier/loads/{loadId}/accept
Authorization: Bearer {carrierWithExpiredInsurance}
```

**Expected Response:**
```json
{
  "error": "Cannot accept loads - insurance verification failed",
  "code": "INSURANCE_INVALID",
  "details": "1 insurance policy(ies) expired"
}
```

**Expected Status Code:** `403 Forbidden`

**Expected Side Effects:**
- ✅ Load status remains ASSIGNED (NOT accepted)
- ✅ Carrier blocked from accepting

---

### **Test Case 62.7: Get Expiring Policies (Admin)**

**Request:**
```http
GET http://localhost:3000/api/verification/insurance/expiring?days=30
Authorization: Bearer {adminToken}
```

**Expected Response:**
```json
{
  "success": true,
  "count": 3,
  "policies": [
    {
      "id": "ins-expiring-soon",
      "type": "cargo",
      "expiryDate": "2025-02-10",
      "organization": {
        "id": "org-456",
        "name": "Smith Trucking",
        "email": "admin@smithtrucking.com"
      }
    }
  ]
}
```

**Expected Status Code:** `200 OK`

---

## ✅ **Success Criteria**

### **Verification Logic:**
- [ ] Valid insurance (not expired, adequate coverage) → verified = true
- [ ] Expired insurance → verified = false, active = false
- [ ] Insufficient coverage → verified = false
- [ ] Missing required types (cargo or liability) → org.verified = false
- [ ] Carrier with invalid insurance CANNOT accept loads

### **Expiry Monitoring:**
- [ ] Policies expiring within 30 days returned
- [ ] Alert sent flag stored (alertSentAt)
- [ ] Daily batch job finds expiring policies
- [ ] Expired policies auto-suspend carrier

### **Business Rules:**
- [ ] Minimum cargo coverage: $1,000,000
- [ ] Minimum liability coverage: $100,000
- [ ] Required types: cargo + liability (both must exist)
- [ ] Expiry date < today → insurance invalid

---

## 🧪 **Business Logic Validation**

### **Insurance Requirements:**

| Type | Minimum Coverage | Purpose |
|------|------------------|---------|
| Cargo | $1,000,000 | Protect against material loss/damage |
| Liability | $100,000 | Bodily injury, property damage |
| Workers Comp | Recommended | Driver injury protection |

### **Verification Workflow:**
```
1. Carrier uploads COI (Certificate of Insurance)
2. Admin verifies policy details (manual for MVP)
3. System checks expiry date automatically
4. If valid: carrier.verified = true
5. If expired: carrier.verified = false, cannot accept loads
6. 30 days before expiry: Email/SMS alert sent
7. 7 days before: Second alert
8. 1 day before: Final alert
9. On expiry: Carrier auto-suspended
```

---

## 🐛 **Known Issues / Notes**

- No RMIS API integration yet (manual verification)
- No OCR for COI documents (manual data entry)
- Alerts logged to console (no email/SMS yet)
- Need to integrate SendGrid/Twilio for automated alerts
- Admin must manually review and approve COI uploads

---

## 🔗 **Related Tests**
- TEST_060: FMCSA Verification (both required for carrier approval)
- TEST_064: Insurance Blocks Load Accept (integration test)
- TEST_033: Carrier Accept Load (where check happens)
- TEST_063: Insurance Expiry Alerts (automated monitoring)

---

## 📊 **Test Data Summary**

**Valid Test Cases:**
- Cargo insurance: $1M, expires 2025-12-31 ✅
- Liability insurance: $100K, expires 2025-12-31 ✅

**Invalid Test Cases:**
- Expired insurance (expiryDate < today) ❌
- Insufficient coverage ($500K < $1M required) ❌
- Missing liability insurance ❌
- No insurance policies at all ❌


