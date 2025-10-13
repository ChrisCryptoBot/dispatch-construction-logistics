# TEST_072: Carrier Check Release Status

## 📋 **Test Information**
- **Feature**: Carrier View Release Details
- **Priority**: 🔴 CRITICAL
- **Endpoint**: `GET /api/carrier/loads/:id/release-status`
- **Authentication**: Required (Carrier assigned to load)
- **Dependencies**: TEST_070 or TEST_042 (Release requested or issued)

---

## 📝 **Test Cases**

### **Test Case 72.1: Check Status (Not Yet Released)**

**Load Status:** RELEASE_REQUESTED

**Request:**
```http
GET http://localhost:3000/api/carrier/loads/{loadId}/release-status
Authorization: Bearer {carrierToken}
```

**Expected Response:**
```json
{
  "success": true,
  "releaseStatus": {
    "status": "RELEASE_REQUESTED",
    "isReleased": false,
    "releaseNumber": null,
    "pickupAddress": "Hidden until release confirmed",
    "pickupDate": "2025-01-20T08:00:00Z"
  }
}
```

**Expected Side Effects:**
- ✅ Pickup address HIDDEN
- ✅ Carrier knows to wait

---

### **Test Case 72.2: Check Status (After Release Issued)**

**Load Status:** RELEASED

**Request:**
```http
GET http://localhost:3000/api/carrier/loads/{loadId}/release-status
Authorization: Bearer {carrierToken}
```

**Expected Response:**
```json
{
  "success": true,
  "releaseStatus": {
    "status": "RELEASED",
    "isReleased": true,
    "releaseNumber": "RL-2025-A3F4B89C",
    "releasedAt": "2025-01-15T14:30:00Z",
    "expiresAt": "2025-01-16T14:30:00Z",
    "expired": false,
    "notes": "Contact: Mike @ 555-1234 | Gate 3, code 4567",
    "quantityConfirmed": "50 tons 3/4 gravel",
    "pickupAddress": "123 Quarry Road, Austin, TX 78701",
    "pickupDate": "2025-01-16T08:00:00Z"
  }
}
```

**Expected Side Effects:**
- ✅ Full pickup address NOW VISIBLE
- ✅ Release number shown
- ✅ Contact info and instructions shown
- ✅ Carrier can proceed to pickup

---

## ✅ **Success Criteria**

- [ ] Address hidden when status = RELEASE_REQUESTED
- [ ] Address visible when status = RELEASED
- [ ] Release number displayed when released
- [ ] Expiry time shown
- [ ] Instructions and contact info available

**Result:** PASS / FAIL

**Notes:**


