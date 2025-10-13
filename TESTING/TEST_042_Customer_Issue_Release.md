# TEST_042: Customer Issue Release (TONU Prevention)

## 📋 **Test Information**
- **Feature**: Material Release Confirmation
- **Priority**: 🔴 CRITICAL
- **Endpoint**: `POST /api/customer/loads/:id/release`
- **Authentication**: Required (Customer/Shipper only)
- **Dependencies**: 
  - TEST_040 (Customer Accept Bid)
  - TEST_033 (Carrier Accept Load)

---

## 🎯 **Test Objective**
Verify shippers can issue material releases with proper legal acknowledgments, preventing TONU liability for the platform.

---

## 🔄 **Prerequisites**

1. Customer has posted a load (status = POSTED)
2. Carrier has bid on load
3. Customer accepted bid (status = ASSIGNED)
4. Carrier accepted load (status = ACCEPTED → RELEASE_REQUESTED)

**Load Status at Test Start:** `RELEASE_REQUESTED`

---

## 📝 **Test Cases**

### **Test Case 42.1: Successful Release Issuance**

**Setup:**
- Load status = RELEASE_REQUESTED
- Pickup date within 24 hours
- User = Shipper who owns the load

**Request:**
```http
POST http://localhost:3000/api/customer/loads/{loadId}/release
Authorization: Bearer {customerToken}
Content-Type: application/json

{
  "confirmedReady": true,
  "quantityConfirmed": "45 tons of 3/4 gravel",
  "siteContact": "Joe Smith @ 555-123-4567",
  "pickupInstructions": "Gate 3, code 4567, ask for Joe at scale house",
  "acknowledgedTonu": true
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Release issued successfully. Carrier has been notified.",
  "load": {
    "id": "...",
    "status": "RELEASED",
    "releaseNumber": "RL-2025-...",
    "releasedAt": "2025-01-15T10:30:00.000Z",
    "shipperConfirmedReady": true,
    "quantityConfirmed": "45 tons of 3/4 gravel",
    "releaseNotes": "Contact: Joe Smith @ 555-123-4567 | Gate 3, code 4567..."
  },
  "release": {
    "releaseNumber": "RL-2025-A3F4B89C",
    "releasedAt": "2025-01-15T10:30:00.000Z",
    "expiresAt": "2025-01-16T10:30:00.000Z"
  }
}
```

**Expected Status Code:** `200 OK`

**Expected Side Effects:**
- ✅ Load status = RELEASED
- ✅ Unique release number generated (e.g., RL-2025-A3F4B89C)
- ✅ Release expires in 24 hours
- ✅ shipperConfirmedReady = true
- ✅ shipperAcknowledgedTonu = true
- ✅ Release notes stored with contact info
- ✅ Carrier should receive notification (if integrated)
- ✅ Pickup address now visible to carrier

---

### **Test Case 42.2: Missing Required Fields (Negative)**

**Request:**
```http
POST http://localhost:3000/api/customer/loads/{loadId}/release
Authorization: Bearer {customerToken}
Content-Type: application/json

{
  "confirmedReady": true,
  "quantityConfirmed": "45 tons"
  // Missing siteContact and acknowledgedTonu
}
```

**Expected Response:**
```json
{
  "error": "Missing required fields",
  "code": "MISSING_REQUIRED_FIELDS",
  "required": [
    "confirmedReady",
    "quantityConfirmed",
    "siteContact",
    "acknowledgedTonu"
  ]
}
```

**Expected Status Code:** `400 Bad Request`

---

### **Test Case 42.3: TONU Not Acknowledged (Negative)**

**Request:**
```http
POST http://localhost:3000/api/customer/loads/{loadId}/release
Authorization: Bearer {customerToken}
Content-Type: application/json

{
  "confirmedReady": true,
  "quantityConfirmed": "45 tons",
  "siteContact": "Joe Smith",
  "acknowledgedTonu": false  // ❌ Not acknowledged
}
```

**Expected Response:**
```json
{
  "error": "All confirmations must be checked",
  "code": "CONFIRMATION_REQUIRED"
}
```

**Expected Status Code:** `400 Bad Request`

---

### **Test Case 42.4: Too Early to Release (>24 hours before pickup)**

**Request:**
```http
POST http://localhost:3000/api/customer/loads/{loadId}/release
Authorization: Bearer {customerToken}
Content-Type: application/json

{
  "confirmedReady": true,
  "quantityConfirmed": "45 tons",
  "siteContact": "Joe Smith @ 555-1234",
  "acknowledgedTonu": true
}
```

**Load Pickup Date:** 3 days from now

**Expected Response:**
```json
{
  "error": "Cannot issue release more than 24 hours before pickup",
  "code": "TOO_EARLY"
}
```

**Expected Status Code:** `400 Bad Request`

---

### **Test Case 42.5: Invalid Load Status (Negative)**

**Request:**
```http
POST http://localhost:3000/api/customer/loads/{loadId}/release
Authorization: Bearer {customerToken}
Content-Type: application/json

{
  "confirmedReady": true,
  "quantityConfirmed": "45 tons",
  "siteContact": "Joe Smith",
  "acknowledgedTonu": true
}
```

**Load Status:** POSTED (not RELEASE_REQUESTED or ACCEPTED)

**Expected Response:**
```json
{
  "error": "Load is not in a valid status for release",
  "code": "INVALID_STATUS"
}
```

**Expected Status Code:** `400 Bad Request`

---

### **Test Case 42.6: Wrong User (Access Control)**

**Request:**
```http
POST http://localhost:3000/api/customer/loads/{loadId}/release
Authorization: Bearer {differentCustomerToken}
Content-Type: application/json

{
  "confirmedReady": true,
  "quantityConfirmed": "45 tons",
  "siteContact": "Joe Smith",
  "acknowledgedTonu": true
}
```

**Expected Response:**
```json
{
  "error": "Only the shipper can issue releases",
  "code": "ACCESS_DENIED"
}
```

**Expected Status Code:** `403 Forbidden`

---

### **Test Case 42.7: Carrier Tries to Issue Release (Negative)**

**Request:**
```http
POST http://localhost:3000/api/customer/loads/{loadId}/release
Authorization: Bearer {carrierToken}
Content-Type: application/json

{
  "confirmedReady": true,
  "quantityConfirmed": "45 tons",
  "siteContact": "Joe Smith",
  "acknowledgedTonu": true
}
```

**Expected Response:**
```json
{
  "error": "Only the shipper can issue releases",
  "code": "ACCESS_DENIED"
}
```

**Expected Status Code:** `403 Forbidden`

---

## ✅ **Success Criteria**

- [ ] Release number generated (format: RL-YYYY-XXXXXXXX)
- [ ] Load status changed to RELEASED
- [ ] Release expires in exactly 24 hours
- [ ] shipperConfirmedReady = true
- [ ] shipperAcknowledgedTonu = true
- [ ] quantityConfirmed stored correctly
- [ ] Release notes contain contact info and instructions
- [ ] releasedBy = current user ID
- [ ] releasedAt timestamp recorded
- [ ] Access control enforced (shipper only)
- [ ] Cannot release >24 hours before pickup
- [ ] Cannot release without TONU acknowledgment
- [ ] Load not found returns 404
- [ ] Invalid status returns 400

---

## 🧪 **Business Logic Validation**

### **TONU Liability Transfer:**
By clicking "acknowledgedTonu", shipper legally accepts liability if material is NOT ready when carrier arrives.

**Platform Protected:**
- If carrier arrives and material not ready → Carrier files TONU
- Shipper charged TONU amount (50-75% of load revenue)
- Platform keeps 15% admin fee
- Carrier receives 85% payout

### **Time Window Enforcement:**
- Cannot release >24 hours early (prevents premature dispatch)
- Release expires after 24 hours (requires re-confirmation)

### **Address Privacy:**
- Full pickup address HIDDEN from carrier until released
- After release, carrier can see complete address + instructions

---

## 🔗 **Related Tests**
- TEST_071: Carrier Check Release Status
- TEST_074: TONU Claim Filing
- TEST_073: Release Expiry Validation

---

## 📊 **Sample Test Data**

**Valid Release Request:**
```json
{
  "confirmedReady": true,
  "quantityConfirmed": "50 tons of washed gravel 3/4 inch",
  "siteContact": "Mike Johnson, Scale House, 512-555-1234",
  "pickupInstructions": "Main gate opens at 6 AM. Park at scale house. Radio channel 3 for dispatch.",
  "acknowledgedTonu": true
}
```

**Expected TONU Amount Calculation:**
- If load grossRevenue = $500, miles = 25 (local):
  - TONU = $250 (50% for local hauls)
- If load grossRevenue = $1000, miles = 150 (regional):
  - TONU = $750, capped at $250 = $250


