# TEST_011: Post Load to Marketplace

## 📋 **Test Information**
- **Feature**: Change Load from DRAFT to POSTED
- **Priority**: 🔴 CRITICAL
- **Endpoint**: `PATCH /api/loads/:id/status`
- **Authentication**: Required (Shipper who owns load)
- **Dependencies**: TEST_010 (Load created)

---

## 📝 **Test Cases**

### **Test Case 11.1: Post Load Successfully**

**Request:**
```http
PATCH http://localhost:3000/api/loads/{loadId}/status
Authorization: Bearer {customerToken}
Content-Type: application/json

{
  "status": "POSTED",
  "notes": "Load posted to marketplace for carrier bidding"
}
```

**Expected Response:**
```json
{
  "success": true,
  "load": {
    "id": "{loadId}",
    "status": "POSTED",
    "updatedAt": "2025-01-15T10:30:00.000Z"
  }
}
```

**Expected Status Code:** `200 OK`

**Expected Side Effects:**
- ✅ Load status = POSTED
- ✅ Load appears in marketplace load board
- ✅ Carriers can now bid on load
- ✅ Notes appended with timestamp

---

### **Test Case 11.2: Verify Load Appears in Marketplace**

**Request:**
```http
GET http://localhost:3000/api/marketplace/loads
Authorization: Bearer {carrierToken}
```

**Expected:** Load from Test Case 11.1 appears in results

---

## ✅ **Success Criteria**

- [ ] Status changes from DRAFT to POSTED
- [ ] Load visible in marketplace
- [ ] Carriers can bid
- [ ] Timestamp updated
- [ ] Notes recorded

**Result:** PASS / FAIL

**Notes:**


