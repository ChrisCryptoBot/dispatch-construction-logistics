# TEST_074: TONU Claim Filing & Calculation

## 📋 **Test Information**
- **Feature**: TONU (Truck Ordered Not Used) Claim System
- **Priority**: 🔴 CRITICAL (Financial Protection)
- **Endpoint**: `POST /api/carrier/loads/:id/tonu`
- **Authentication**: Required (Carrier who owns load)
- **Dependencies**: 
  - TEST_042: Customer issued release
  - Load status = RELEASED or IN_TRANSIT

---

## 🎯 **Test Objective**
Verify carriers can file TONU claims when material is not ready, and platform correctly calculates compensation amounts.

---

## 🔧 **Prerequisites**

1. Load status = RELEASED (shipper confirmed material ready)
2. Carrier dispatched to pickup
3. Material NOT ready when carrier arrives
4. Carrier assigned to this load

---

## 📝 **Test Cases**

### **Test Case 74.1: Successful TONU Claim (Local Haul ≤50 miles)**

**Load Details:**
- grossRevenue: $500
- miles: 25 (local)
- Expected TONU: $250 (50% of revenue)

**Request:**
```http
POST http://localhost:3000/api/carrier/loads/{loadId}/tonu
Authorization: Bearer {carrierToken}
Content-Type: application/json

{
  "reason": "Material not ready - quarry still processing gravel",
  "arrivalTime": "2025-01-16T08:15:00Z",
  "waitTime": 45,
  "evidence": []
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "TONU claim filed successfully",
  "tonu": {
    "amount": 250.00,
    "carrierPayout": 212.50,
    "platformFee": 37.50,
    "filedAt": "2025-01-16T09:00:00Z"
  }
}
```

**Expected Status Code:** `200 OK`

**Expected Side Effects:**
- ✅ Load status = TONU
- ✅ tonuFiled = true
- ✅ tonuAmount = $250.00
- ✅ tonuReason stored
- ✅ tonuEvidence = []
- ✅ Shipper charged $250 (when payment integrated)
- ✅ Carrier paid $212.50 (85%)
- ✅ Platform keeps $37.50 (15%)

---

### **Test Case 74.2: TONU Claim (Regional/OTR >50 miles, Capped)**

**Load Details:**
- grossRevenue: $1000
- miles: 150 (regional)
- Calculation: $1000 × 0.75 = $750, **capped at $250**

**Request:**
```http
POST http://localhost:3000/api/carrier/loads/{loadId}/tonu
Authorization: Bearer {carrierToken}
Content-Type: application/json

{
  "reason": "Site closed, no one present to load material",
  "arrivalTime": "2025-01-16T08:00:00Z",
  "waitTime": 60
}
```

**Expected Response:**
```json
{
  "success": true,
  "tonu": {
    "amount": 250.00,
    "carrierPayout": 212.50,
    "platformFee": 37.50
  }
}
```

**Calculation:**
```javascript
TONU Amount Calculation:
if (miles <= 50) {
  tonuAmount = grossRevenue * 0.50  // 50% for local
} else {
  tonuAmount = Math.min(grossRevenue * 0.75, 250)  // 75%, capped at $250
}

Platform Fee: tonuAmount * 0.15 (15%)
Carrier Payout: tonuAmount * 0.85 (85%)
```

---

### **Test Case 74.3: TONU with Photo Evidence**

**Request:**
```http
POST http://localhost:3000/api/carrier/loads/{loadId}/tonu
Authorization: Bearer {carrierToken}
Content-Type: application/json

{
  "reason": "Gravel pile empty, site not operational",
  "arrivalTime": "2025-01-16T08:30:00Z",
  "waitTime": 30,
  "evidence": [
    "photo_empty_yard.jpg",
    "photo_closed_gate.jpg",
    "timestamp_screenshot.jpg"
  ]
}
```

**Expected Response:**
```json
{
  "success": true,
  "tonu": {
    "amount": 250.00,
    "carrierPayout": 212.50,
    "platformFee": 37.50
  }
}
```

**Expected Side Effects:**
- ✅ tonuEvidence = array of photo references
- ✅ Evidence available for dispute resolution

---

### **Test Case 74.4: Missing Required Fields (Negative)**

**Request:**
```http
POST http://localhost:3000/api/carrier/loads/{loadId}/tonu
Authorization: Bearer {carrierToken}
Content-Type: application/json

{
  "reason": "Material not ready"
  // Missing arrivalTime
}
```

**Expected Response:**
```json
{
  "error": "Missing required fields: reason and arrivalTime",
  "code": "MISSING_REQUIRED_FIELDS"
}
```

**Expected Status Code:** `400 Bad Request`

---

### **Test Case 74.5: TONU Filed on Non-RELEASED Load (Negative)**

**Load Status:** POSTED or ASSIGNED

**Request:**
```http
POST http://localhost:3000/api/carrier/loads/{loadId}/tonu
Authorization: Bearer {carrierToken}
Content-Type: application/json

{
  "reason": "Material not ready",
  "arrivalTime": "2025-01-16T08:00:00Z"
}
```

**Expected Response:**
```json
{
  "error": "INVALID_STATUS",
  "code": "INVALID_STATUS"
}
```

**Expected Status Code:** `400 Bad Request`

**Business Rule:** Can only file TONU if load was RELEASED (shipper confirmed ready)

---

### **Test Case 74.6: Wrong Carrier Tries to File TONU (Negative)**

**Request:**
```http
POST http://localhost:3000/api/carrier/loads/{loadId}/tonu
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

### **Test Case 74.7: Load Not Found (Negative)**

**Request:**
```http
POST http://localhost:3000/api/carrier/loads/invalid-id/tonu
Authorization: Bearer {carrierToken}
```

**Expected Response:**
```json
{
  "error": "LOAD_NOT_FOUND",
  "code": "LOAD_NOT_FOUND"
}
```

**Expected Status Code:** `404 Not Found`

---

## ✅ **Success Criteria**

### **TONU Calculation:**
- [ ] Local hauls (≤50 miles): 50% of gross revenue
- [ ] Regional hauls (>50 miles): 75% of gross revenue, capped at $250
- [ ] Platform fee: 15% of TONU amount
- [ ] Carrier payout: 85% of TONU amount

### **Claim Requirements:**
- [ ] Reason required (min 5 characters)
- [ ] Arrival time required (ISO timestamp)
- [ ] Wait time optional (minutes)
- [ ] Photo evidence optional (array of URLs)

### **Status Validation:**
- [ ] Can only file TONU if status = RELEASED or IN_TRANSIT
- [ ] Cannot file TONU on POSTED, DRAFT, or COMPLETED loads
- [ ] Load status changes to TONU after filing

### **Access Control:**
- [ ] Only assigned carrier can file TONU
- [ ] Different carrier blocked
- [ ] Customer cannot file TONU (different endpoint for disputes)

### **Financial Logic:**
- [ ] Amount calculated correctly
- [ ] Platform fee = 15%
- [ ] Carrier payout = 85%
- [ ] Shipper charged (when payment integrated)

---

## 🧪 **TONU Calculation Examples**

| Load Revenue | Miles | TONU Calculation | TONU Amount | Platform Fee | Carrier Payout |
|-------------|-------|------------------|-------------|--------------|----------------|
| $200 | 15 | $200 × 0.50 = $100 | $100 | $15 | $85 |
| $500 | 30 | $500 × 0.50 = $250 | $250 | $37.50 | $212.50 |
| $1000 | 75 | min($1000 × 0.75, $250) | $250 | $37.50 | $212.50 |
| $2000 | 200 | min($2000 × 0.75, $250) = $250 | $250 | $37.50 | $212.50 |

**Key Point:** Regional/OTR TONU always capped at $250 (industry standard)

---

## 🛡️ **Platform Protection**

### **How TONU Prevents Platform Liability:**

**Without Release System:**
```
1. Customer posts load
2. Carrier accepts, dispatches truck
3. Material not ready when carrier arrives
4. Carrier demands TONU payment
5. Customer refuses to pay
6. Carrier blames PLATFORM
7. Platform stuck paying TONU from own pocket
```

**With Release System:**
```
1. Customer posts load
2. Carrier accepts
3. System BLOCKS carrier from seeing address
4. System REQUIRES customer to confirm material ready
5. Customer checks box: "I acknowledge TONU liability"
6. Only THEN can carrier dispatch
7. If material not ready → Customer liable (not platform)
8. Platform charges customer, pays carrier, keeps admin fee
```

---

## 🔗 **Related Tests**
- TEST_042: Customer Issue Release (prevents TONU)
- TEST_073: Release Expiry (TONU if expired)
- TEST_064: Insurance Blocks Load Accept (safety check)

---

## 📊 **Dispute Scenarios (Future Feature)**

**Scenario 1: Shipper disputes TONU**
- Shipper claims material WAS ready
- Evidence review required
- Escrow holds payment pending resolution

**Scenario 2: Carrier files fraudulent TONU**
- GPS shows carrier never approached pickup
- TONU claim flagged for admin review
- Carrier account suspended if fraud confirmed

**Scenario 3: Partial Load Ready**
- 30 tons ready, 50 tons ordered
- Negotiate partial TONU or load adjustment
- Invoice adjustment required

---

## 💰 **Financial Impact**

**Example Month (50 loads, 5% TONU rate):**
- Total TONUs: 2-3 claims
- Average TONU: $200
- Total TONU charges: $600
- Platform revenue: $90 (15% fee)
- Carrier protection: $510 paid out

**Without TONU system:**
- Platform eats $510/month in wasted carrier trips
- Carriers leave platform due to time waste
- Customers develop bad habits (order loads "just in case")

**With TONU system:**
- Platform protected (collects fee)
- Carriers protected (compensated for time)
- Customers incentivized to only order when ready


