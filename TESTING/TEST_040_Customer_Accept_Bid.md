# TEST_040: Customer Accept Carrier Bid

## 📋 **Test Information**
- **Feature**: Bid Acceptance & Carrier Assignment
- **Priority**: 🔴 CRITICAL
- **Endpoint**: `POST /api/customer/loads/:id/bids/:bidId/accept`
- **Authentication**: Required (Customer who owns load)
- **Dependencies**: 
  - TEST_018: Load posted
  - TEST_031: Carrier submitted bid

---

## 🎯 **Test Objective**
Verify customers can accept carrier bids, assign loads, and automatically reject competing bids.

---

## 📝 **Test Cases**

### **Test Case 40.1: Accept Bid at Posted Rate**

**Request:**
```http
POST http://localhost:3000/api/customer/loads/{loadId}/bids/{bidId}/accept
Authorization: Bearer {customerToken}
Content-Type: application/json

{
  "notes": "Confirmed for tomorrow 8 AM"
}
```

**Expected Response:**
```json
{
  "success": true,
  "load": {
    "id": "{loadId}",
    "status": "ASSIGNED",
    "carrierId": "{carrierOrgId}",
    "carrier": {
      "id": "{carrierOrgId}",
      "name": "ACME Trucking",
      "mcNumber": "MC-123456"
    },
    "rate": "12.50"
  },
  "message": "Bid accepted and load assigned to carrier"
}
```

**Expected Status Code:** `200 OK`

**Expected Side Effects:**
- ✅ Load status = ASSIGNED
- ✅ Load.carrierId = accepted carrier
- ✅ Accepted bid status = ACCEPTED
- ✅ All other bids status = REJECTED
- ✅ Load.rate remains original (no counter-offer)

---

### **Test Case 40.2: Accept Counter-Offer Bid**

**Bid Details:**
- Original load rate: $12.50/ton
- Carrier counter-offered: $15.00/ton

**Request:**
```http
POST http://localhost:3000/api/customer/loads/{loadId}/bids/{bidId}/accept
Authorization: Bearer {customerToken}
```

**Expected Response:**
```json
{
  "success": true,
  "load": {
    "status": "ASSIGNED",
    "rate": "15.00"
  }
}
```

**Expected Side Effects:**
- ✅ Load.rate updated to counter-offer amount ($15.00)
- ✅ grossRevenue recalculated

---

### **Test Case 40.3: Multiple Competing Bids**

**Setup:**
- 3 carriers bid on same load
- Customer accepts Carrier B's bid

**Expected Side Effects:**
- ✅ Carrier B's bid: status = ACCEPTED
- ✅ Carrier A's bid: status = REJECTED
- ✅ Carrier C's bid: status = REJECTED
- ✅ Only Carrier B assigned to load

---

### **Test Case 40.4: Wrong Customer Tries to Accept (Negative)**

**Request:**
```http
POST http://localhost:3000/api/customer/loads/{loadId}/bids/{bidId}/accept
Authorization: Bearer {differentCustomerToken}
```

**Expected Response:**
```json
{
  "error": "Only the shipper can accept bids",
  "code": "ACCESS_DENIED"
}
```

**Expected Status Code:** `403 Forbidden`

---

### **Test Case 40.5: Accept Non-Existent Bid (Negative)**

**Request:**
```http
POST http://localhost:3000/api/customer/loads/{loadId}/bids/invalid-bid-id/accept
Authorization: Bearer {customerToken}
```

**Expected Response:**
```json
{
  "error": "Bid not found",
  "code": "BID_NOT_FOUND"
}
```

**Expected Status Code:** `404 Not Found`

---

### **Test Case 40.6: Accept Bid on Already Assigned Load (Negative)**

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

## ✅ **Success Criteria**

- [ ] Bid accepted successfully
- [ ] Load status changed to ASSIGNED
- [ ] Carrier assigned to load
- [ ] Other bids automatically rejected
- [ ] Load rate updated if counter-offer
- [ ] Access control enforced (shipper only)
- [ ] Load not found returns 404
- [ ] Bid not found returns 404
- [ ] Already assigned load returns 400

---

## 🔗 **Related Tests**
- TEST_031: Carrier Submit Bid (prerequisite)
- TEST_041: Customer Reject Bid (alternative action)
- TEST_033: Carrier Accept Load (next step)
- TEST_042: Customer Issue Release (after carrier accepts)


