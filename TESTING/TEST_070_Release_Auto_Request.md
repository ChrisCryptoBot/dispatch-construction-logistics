# TEST_070: Release Auto-Request on Carrier Accept

## 📋 **Test Information**
- **Feature**: Automatic Release Request Trigger
- **Priority**: 🔴 CRITICAL
- **Endpoint**: `POST /api/carrier/loads/:id/accept` (triggers auto-request)
- **Authentication**: Required (Carrier)
- **Dependencies**: TEST_040 (Customer accepted bid)

---

## 🎯 **Test Objective**
Verify that when carrier accepts a load, the system automatically requests release from the shipper.

---

## 📝 **Test Cases**

### **Test Case 70.1: Auto-Request on Accept**

**Request:**
```http
POST http://localhost:3000/api/carrier/loads/{loadId}/accept
Authorization: Bearer {carrierToken}
Content-Type: application/json

{
  "notes": "Truck assigned, ready for pickup"
}
```

**Expected Response:**
```json
{
  "success": true,
  "load": {
    "id": "{loadId}",
    "status": "RELEASE_REQUESTED",
    "releaseRequestedAt": "2025-01-15T10:30:00Z",
    "releaseRequestedBy": "{userId}"
  },
  "message": "Load accepted successfully. Waiting for shipper to confirm material is ready.",
  "releaseRequested": true
}
```

**Expected Status Code:** `200 OK`

**Expected Side Effects:**
- ✅ Load status = RELEASE_REQUESTED (not just ACCEPTED!)
- ✅ releaseRequestedAt timestamp set
- ✅ releaseRequestedBy = user ID
- ✅ Shipper should see "Action Required" notification
- ✅ Carrier CANNOT see full pickup address yet

---

## ✅ **Success Criteria**

- [ ] Status changes to RELEASE_REQUESTED automatically
- [ ] Timestamps recorded
- [ ] No manual step required
- [ ] Address hidden from carrier
- [ ] Shipper notified (when email integrated)

**Result:** PASS / FAIL

**Notes:**


