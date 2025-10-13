# TEST_120: Anti-Double-Brokering Attestation

## 📋 **Test Information**
- **Feature**: Double-Brokering Prevention
- **Priority**: 🔴 CRITICAL
- **Endpoint**: `POST /api/carrier/loads/:id/attest`
- **Authentication**: Required (Carrier assigned to load)
- **Dependencies**: TEST_033 (Carrier accepted load)

---

## 🎯 **Test Objective**
Verify carriers must sign legal attestation confirming they won't re-broker loads to third parties.

---

## 📝 **Test Cases**

### **Test Case 120.1: Sign Attestation**

**Request:**
```http
POST http://localhost:3000/api/carrier/loads/{loadId}/attest
Authorization: Bearer {carrierToken}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Attestation signed successfully",
  "attestation": {
    "id": "attest-123",
    "signedAt": "2025-01-15T10:30:00Z",
    "ipAddress": "192.168.1.100"
  }
}
```

**Expected Side Effects:**
- ✅ LoadAttestation record created
- ✅ attestationType = NO_DOUBLE_BROKER
- ✅ Full attestation text stored
- ✅ IP address captured (legal proof)
- ✅ Timestamp recorded

**Attestation Text (stored):**
```
I, the undersigned, hereby attest that I will not re-broker, subcontract, or assign this load to any third party carrier. I confirm that my company will directly perform this transportation service using our own equipment and drivers. I understand that violation of this attestation may result in immediate account suspension, legal action, and reporting to FMCSA.
```

---

### **Test Case 120.2: Provide VIN/Driver Details**

**Request:**
```http
POST http://localhost:3000/api/carrier/loads/{loadId}/dispatch-details
Authorization: Bearer {carrierToken}
Content-Type: application/json

{
  "vin": "1HTMMAAL52H517903",
  "driverName": "Mike Johnson",
  "truckNumber": "Truck #7"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Dispatch details verified",
  "details": {
    "verified": true,
    "vin": "1HTMMAAL52H517903",
    "driver": "Mike Johnson",
    "truck": "Truck #7"
  }
}
```

**Expected Side Effects:**
- ✅ VIN verified against carrier's equipment
- ✅ Equipment marked as verified
- ✅ Dispatch details stored in load notes

---

### **Test Case 120.3: VIN Not Owned by Carrier (Negative)**

**Request:**
```json
{
  "vin": "DIFFERENT_VIN_123",
  "driverName": "John Doe"
}
```

**VIN belongs to different carrier**

**Expected Response:**
```json
{
  "error": "VIN_NOT_OWNED_BY_CARRIER",
  "code": "VIN_OWNERSHIP_MISMATCH"
}
```

**Expected Status Code:** `403 Forbidden`

---

### **Test Case 120.4: GPS Proximity Check (Anti-Fraud)**

**Request:**
```http
POST http://localhost:3000/api/carrier/loads/{loadId}/gps-ping
Content-Type: application/json

{
  "latitude": 29.7604,
  "longitude": -95.3698,
  "stage": "at_pickup"
}
```

**Actual Pickup Location:** Austin (30.27, -97.74)  
**Carrier GPS:** Houston (29.76, -95.37)  
**Distance:** ~150 miles away

**Expected Response:**
```json
{
  "proximity": {
    "verified": false,
    "distance": 241000,
    "threshold": 800,
    "atPickup": false,
    "flagged": true
  }
}
```

**Expected Side Effects:**
- ⚠️ Load flagged for manual review
- ⚠️ Internal notes: "GPS location 241000m from pickup"
- ⚠️ Delivery exception created
- ⚠️ Admin alerted

---

## ✅ **Success Criteria**

**Attestation:**
- [ ] Attestation signed and stored
- [ ] Full legal text saved
- [ ] IP address captured
- [ ] Timestamp recorded
- [ ] Only signed once per load

**VIN Verification:**
- [ ] VIN matched to carrier's equipment
- [ ] VIN not owned by carrier → rejected
- [ ] Equipment verified flag set

**GPS Proximity:**
- [ ] Within 800m → verified
- [ ] Outside 800m → flagged as suspicious
- [ ] Fraudulent location → load flagged

**Result:** PASS / FAIL

**Notes:**


