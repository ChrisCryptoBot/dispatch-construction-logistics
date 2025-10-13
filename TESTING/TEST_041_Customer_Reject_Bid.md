# TEST_041: Customer Reject Carrier Bid

## 📋 **Test Information**
- **Feature**: Bid Rejection by Customer
- **Priority**: 🟡 HIGH
- **Endpoint**: `POST /api/customer/loads/:id/bids/:bidId/reject`
- **Authentication**: Required (Customer only)
- **Dependencies**: TEST_031 (Carrier bid submitted)

---

## 📝 **Test Cases**

### **Test Case 41.1: Reject Bid with Reason**

**Request:**
```http
POST http://localhost:3000/api/customer/loads/{loadId}/bids/{bidId}/reject
Authorization: Bearer {customerToken}
Content-Type: application/json

{
  "reason": "Rate too high, looking for lower bids"
}
```

**Expected Response:**
```json
{
  "success": true,
  "bid": {
    "id": "{bidId}",
    "status": "REJECTED",
    "message": "Rate too high, looking for lower bids"
  },
  "message": "Bid rejected"
}
```

**Expected Status Code:** `200 OK`

**Expected Side Effects:**
- ✅ Bid status = REJECTED
- ✅ Reason stored in bid.message
- ✅ Load remains POSTED (available for other bids)

---

## ✅ **Success Criteria**

- [ ] Bid rejected successfully
- [ ] Reason stored
- [ ] Load still available
- [ ] Carrier notified (future)

**Result:** PASS / FAIL

**Notes:**


