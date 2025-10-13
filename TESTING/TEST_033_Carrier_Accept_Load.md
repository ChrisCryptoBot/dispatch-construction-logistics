# TEST_033: Carrier Accept Assigned Load

## 📋 **Test Information**
- **Feature**: Carrier Load Acceptance with Safety Checks
- **Priority**: 🔴 CRITICAL
- **Endpoint**: `POST /api/carrier/loads/:id/accept`
- **Authentication**: Required (Carrier only)
- **Dependencies**: 
  - TEST_040: Customer accepted carrier's bid
  - TEST_060: FMCSA verification passed
  - TEST_062: Insurance valid
- **NEW Features**: 
  - ✅ Insurance check enforced
  - ✅ Auto-requests release from shipper

---

## 🎯 **Test Objective**
Verify carriers can only accept loads if FMCSA verified and insurance valid, and that release is automatically requested from shipper.

---

## 🔧 **Prerequisites**

1. Carrier FMCSA verified = true
2. Carrier has valid cargo insurance ($1M+)
3. Carrier has valid liability insurance ($100K+)
4. Load assigned to carrier (status = ASSIGNED)
5. Customer accepted carrier's bid

---

## 📝 **Test Cases**

### **Test Case 33.1: Successful Load Acceptance (Happy Path)**

**Request:**
```http
POST http://localhost:3000/api/carrier/loads/{loadId}/accept
Authorization: Bearer {carrierToken}
Content-Type: application/json

{
  "notes": "Truck #7 assigned, driver Mike Johnson"
}
```

**Expected Response:**
```json
{
  "success": true,
  "load": {
    "id": "{loadId}",
    "status": "RELEASE_REQUESTED",
    "carrierId": "{carrierOrgId}",
    "releaseRequestedAt": "2025-01-15T10:30:00Z",
    "releaseRequestedBy": "{userId}"
  },
  "message": "Load accepted successfully. Waiting for shipper to confirm material is ready.",
  "releaseRequested": true
}
```

**Expected Status Code:** `200 OK`

**Expected Side Effects:**
- ✅ Load status = RELEASE_REQUESTED (automatically!)
- ✅ Release requested from shipper
- ✅ releaseRequestedAt timestamp set
- ✅ releaseRequestedBy = current user ID
- ✅ Shipper should be notified (future: email/SMS)
- ✅ Carrier CANNOT see full pickup address yet

---

### **Test Case 33.2: Insurance Invalid - Load Acceptance Blocked (Negative)**

**Setup:**
- Carrier insurance expired or missing

**Request:**
```http
POST http://localhost:3000/api/carrier/loads/{loadId}/accept
Authorization: Bearer {carrierWithExpiredInsuranceToken}
Content-Type: application/json

{
  "notes": "Ready to haul"
}
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
- ✅ No release requested
- ✅ Carrier blocked from operation

---

### **Test Case 33.3: Load Not Assigned to Carrier (Negative)**

**Request:**
```http
POST http://localhost:3000/api/carrier/loads/{loadId}/accept
Authorization: Bearer {differentCarrierToken}
```

**Expected Response:**
```json
{
  "error": "This load is not assigned to your organization",
  "code": "ACCESS_DENIED"
}
```

**Expected Status Code:** `403 Forbidden`

---

### **Test Case 33.4: Invalid Load Status (Negative)**

**Request:**
```http
POST http://localhost:3000/api/carrier/loads/{loadId}/accept
Authorization: Bearer {carrierToken}
```

**Load Status:** POSTED or COMPLETED

**Expected Response:**
```json
{
  "error": "Load must be in ASSIGNED status to accept",
  "code": "INVALID_STATUS"
}
```

**Expected Status Code:** `400 Bad Request`

---

### **Test Case 33.5: Missing Required Insurance Type (Negative)**

**Setup:**
- Carrier has cargo insurance
- Carrier missing liability insurance

**Request:**
```http
POST http://localhost:3000/api/carrier/loads/{loadId}/accept
Authorization: Bearer {carrierToken}
```

**Expected Response:**
```json
{
  "error": "Cannot accept loads - insurance verification failed",
  "code": "INSURANCE_INVALID",
  "details": "Missing required insurance: liability"
}
```

**Expected Status Code:** `403 Forbidden`

---

### **Test Case 33.6: Insufficient Insurance Coverage (Negative)**

**Setup:**
- Carrier has cargo insurance = $500K (need $1M)

**Expected Response:**
```json
{
  "error": "Cannot accept loads - insurance verification failed",
  "code": "INSURANCE_INVALID",
  "details": "Insurance coverage amounts below minimum requirements"
}
```

**Expected Status Code:** `403 Forbidden`

---

### **Test Case 33.7: Load Already Accepted (Idempotency)**

**Request:** Accept same load twice

**Expected Response:**
- First request: 200 OK, status = RELEASE_REQUESTED
- Second request: 400 Bad Request, INVALID_STATUS

---

## ✅ **Success Criteria**

### **Safety Checks Enforced:**
- [ ] FMCSA verification not checked (future enhancement)
- [ ] Insurance validity ENFORCED
  - [ ] Cargo insurance ≥ $1M
  - [ ] Liability insurance ≥ $100K
  - [ ] Both not expired
- [ ] Carrier blocked if insurance invalid
- [ ] Error message explains why blocked

### **Release Workflow:**
- [ ] Load status changes to RELEASE_REQUESTED
- [ ] releaseRequestedAt timestamp set
- [ ] releaseRequestedBy = user ID
- [ ] Release request succeeds or gracefully degrades
- [ ] Shipper notified (when integration added)

### **Access Control:**
- [ ] Only assigned carrier can accept
- [ ] Load must be in ASSIGNED status
- [ ] Different carrier cannot accept
- [ ] Shipper cannot accept own load

---

## 🧪 **Business Logic Validation**

### **Pre-Acceptance Checks:**

```javascript
// Automatic checks performed:
1. Load status = ASSIGNED? ✅
2. Carrier owns this load? ✅
3. Insurance valid?
   - cargo insurance exists? ✅
   - cargo coverage ≥ $1M? ✅
   - cargo not expired? ✅
   - liability insurance exists? ✅
   - liability coverage ≥ $100K? ✅
   - liability not expired? ✅
4. All checks pass → Accept load + request release
5. Any check fails → Block with specific error
```

### **Status Progression:**
```
POSTED → ASSIGNED → ACCEPTED → RELEASE_REQUESTED → RELEASED → IN_TRANSIT
```

**NEW Behavior (Just Implemented):**
- Old: ASSIGNED → ACCEPTED → IN_TRANSIT
- New: ASSIGNED → ACCEPTED → **RELEASE_REQUESTED** → RELEASED → IN_TRANSIT

**Why:** Prevents carrier from dispatching before material is ready (TONU prevention)

---

## 🐛 **Known Issues / Notes**

- Insurance check runs synchronously (may add latency)
- If release request fails, load still accepted (logged as non-critical error)
- No notification sent yet (console log only)
- Future: Add ELD/telematics integration for truck assignment

---

## 🔗 **Related Tests**
- TEST_040: Customer Accept Bid (prerequisite)
- TEST_042: Customer Issue Release (next step)
- TEST_062: Insurance Verification (enforced here)
- TEST_072: Carrier Check Release Status (after acceptance)

---

## 📊 **Sample Test Sequence**

```bash
# 1. Create carrier and verify insurance
POST /api/auth/signup (carrier)
POST /api/auth/verify-email
SQL: Add insurance policies
POST /api/verification/insurance/{orgId}/status  # Should be valid

# 2. Customer posts load
POST /api/customer/loads (as customer)

# 3. Carrier bids
POST /api/carrier/loads/{loadId}/bid (as carrier)

# 4. Customer accepts bid
POST /api/customer/loads/{loadId}/bids/{bidId}/accept (as customer)

# 5. Carrier accepts load (THIS TEST)
POST /api/carrier/loads/{loadId}/accept (as carrier)

# Expected: status = RELEASE_REQUESTED, insurance checked ✅
```

---

## ⚠️ **Critical Validations**

**If carrier tries to accept with expired insurance:**
→ **BLOCKED** with clear error message

**If carrier tries to accept without liability insurance:**
→ **BLOCKED** with "Missing required insurance: liability"

**If carrier has all valid insurance:**
→ **ACCEPTED** and release workflow begins

This is a **safety-critical checkpoint** - DO NOT allow carriers to operate without proper insurance!


