# TEST_031: Carrier Submit Bid on Load

## 📋 **Test Information**
- **Feature**: Carrier Bidding System
- **Priority**: 🔴 CRITICAL
- **Endpoint**: `POST /api/carrier/loads/:id/bid`
- **Authentication**: Required (Carrier only)
- **Dependencies**: 
  - TEST_030: Customer posted load (status = POSTED)
  - TEST_060: Carrier FMCSA verified
  - TEST_062: Carrier insurance valid

---

## 🎯 **Test Objective**
Verify carriers can submit competitive bids on posted loads with optional counter-offers and expiration times.

---

## 📝 **Test Cases**

### **Test Case 31.1: Submit Bid at Posted Rate**

**Request:**
```http
POST http://localhost:3000/api/carrier/loads/{loadId}/bid
Authorization: Bearer {carrierToken}
Content-Type: application/json

{
  "message": "Can deliver same day. Have 25-ton end dump ready."
}
```

**Expected Response:**
```json
{
  "success": true,
  "bid": {
    "id": "bid-123",
    "loadId": "{loadId}",
    "carrierId": "{carrierOrgId}",
    "bidAmount": null,
    "message": "Can deliver same day. Have 25-ton end dump ready.",
    "status": "PENDING",
    "createdAt": "2025-01-15T10:30:00Z"
  },
  "message": "Bid submitted successfully"
}
```

**Expected Status Code:** `201 Created`

**Expected Side Effects:**
- ✅ LoadInterest record created
- ✅ Status = PENDING
- ✅ bidAmount = null (accepting posted rate)

---

### **Test Case 31.2: Submit Counter-Offer Bid**

**Request:**
```http
POST http://localhost:3000/api/carrier/loads/{loadId}/bid
Authorization: Bearer {carrierToken}
Content-Type: application/json

{
  "bidAmount": 15.00,
  "message": "Counter-offer: $15/ton due to extended delivery distance",
  "expiresInHours": 12
}
```

**Expected Response:**
```json
{
  "success": true,
  "bid": {
    "id": "bid-456",
    "bidAmount": "15.00",
    "message": "Counter-offer...",
    "status": "PENDING",
    "expiresAt": "2025-01-15T22:30:00Z"
  }
}
```

**Expected Status Code:** `201 Created`

**Expected Side Effects:**
- ✅ bidAmount = 15.00
- ✅ expiresAt = current time + 12 hours

---

### **Test Case 31.3: Duplicate Bid Prevention (Negative)**

**Request:**
```http
POST http://localhost:3000/api/carrier/loads/{loadId}/bid
Authorization: Bearer {carrierToken}
Content-Type: application/json

{
  "message": "Second bid attempt"
}
```

**Precondition:** Carrier already bid on this load

**Expected Response:**
```json
{
  "error": "You have already bid on this load",
  "code": "BID_ALREADY_EXISTS",
  "existingBid": {
    "id": "bid-123",
    "status": "PENDING"
  }
}
```

**Expected Status Code:** `400 Bad Request`

---

### **Test Case 31.4: Bid on Non-POSTED Load (Negative)**

**Request:**
```http
POST http://localhost:3000/api/carrier/loads/{assignedLoadId}/bid
Authorization: Bearer {carrierToken}
```

**Load Status:** ASSIGNED or COMPLETED

**Expected Response:**
```json
{
  "error": "Load is not available for bidding",
  "code": "LOAD_NOT_AVAILABLE"
}
```

**Expected Status Code:** `400 Bad Request`

---

### **Test Case 31.5: Load Not Found (Negative)**

**Request:**
```http
POST http://localhost:3000/api/carrier/loads/invalid-load-id/bid
Authorization: Bearer {carrierToken}
```

**Expected Response:**
```json
{
  "error": "Load not found",
  "code": "LOAD_NOT_FOUND"
}
```

**Expected Status Code:** `404 Not Found`

---

### **Test Case 31.6: Shipper Tries to Bid on Own Load (Negative)**

**Request:**
```http
POST http://localhost:3000/api/carrier/loads/{loadId}/bid
Authorization: Bearer {shipperToken}
```

**Expected Response:**
```json
{
  "error": "Only carrier organizations can bid on loads",
  "code": "INVALID_ORG_TYPE"
}
```

**Expected Status Code:** `403 Forbidden`

---

## ✅ **Success Criteria**

- [ ] Carrier can bid at posted rate (bidAmount = null)
- [ ] Carrier can submit counter-offer (bidAmount specified)
- [ ] Bid expiration time calculated correctly
- [ ] Duplicate bids prevented
- [ ] Only POSTED loads accept bids
- [ ] Only CARRIER organizations can bid
- [ ] Shipper notified of bid (future: email/SMS)
- [ ] Bid includes carrier details (name, MC number, contact)

---

## 🧪 **Business Logic**

### **Bid Types:**

**1. Accept Posted Rate:**
```json
{
  "message": "We accept your rate"
}
```
→ `bidAmount = null` (use load.rate)

**2. Counter-Offer:**
```json
{
  "bidAmount": 15.00,
  "message": "Counter-offer due to..."
}
```
→ If customer accepts, load.rate updated to 15.00

### **Bid Expiration:**
- `expiresInHours`: Optional parameter
- If set: bid auto-expires after X hours
- If not set: bid remains valid until load assigned
- Expired bids: future feature (cron job to auto-reject)

---

## 🔗 **Related Tests**
- TEST_040: Customer Accept Bid (next step in workflow)
- TEST_041: Customer Reject Bid
- TEST_030: Carrier Browse Available Loads (find loads to bid on)
- TEST_050: Marketplace Load Board (alternative bidding interface)


