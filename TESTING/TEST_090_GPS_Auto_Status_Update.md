# TEST_090: GPS Auto-Status Update (Geofencing)

## 📋 **Test Information**
- **Feature**: Automatic Load Status Update via GPS Geofencing
- **Priority**: 🟡 HIGH
- **Endpoint**: `POST /api/carrier/loads/:id/gps-ping`
- **Authentication**: Required (Carrier)
- **Dependencies**: TEST_042 (Release issued), Load status = RELEASED

---

## 🎯 **Test Objective**
Verify that GPS location reports automatically update load status when driver enters pickup/delivery geofences.

---

## 📝 **Test Cases**

### **Test Case 90.1: GPS at Pickup (Auto → IN_TRANSIT)**

**Load Status:** RELEASED  
**Pickup Location:** 30.2672, -97.7431 (example coordinates)

**Request:**
```http
POST http://localhost:3000/api/carrier/loads/{loadId}/gps-ping
Authorization: Bearer {carrierToken}
Content-Type: application/json

{
  "latitude": 30.2675,
  "longitude": -97.7428,
  "stage": "at_pickup"
}
```

**Distance from Pickup:** ~50 meters (within 500m geofence)

**Expected Response:**
```json
{
  "success": true,
  "message": "Load status updated to IN_TRANSIT",
  "statusUpdated": true,
  "newStatus": "IN_TRANSIT",
  "proximity": {
    "verified": true,
    "distance": 50,
    "threshold": 500,
    "atPickup": true,
    "flagged": false
  }
}
```

**Expected Side Effects:**
- ✅ Load status = IN_TRANSIT (automatically!)
- ✅ pickupEta timestamp set
- ✅ GeoEvent created
- ✅ No manual status update needed

---

### **Test Case 90.2: GPS at Delivery (Auto → DELIVERED)**

**Load Status:** IN_TRANSIT  
**Delivery Location:** 30.2500, -97.7200

**Request:**
```json
{
  "latitude": 30.2502,
  "longitude": -97.7198,
  "stage": "at_delivery"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Load status updated to DELIVERED",
  "statusUpdated": true,
  "newStatus": "DELIVERED"
}
```

**Expected Side Effects:**
- ✅ Load status = DELIVERED (automatically!)
- ✅ deliveryEta timestamp set

---

### **Test Case 90.3: GPS Far from Pickup (Flagged as Suspicious)**

**Load Status:** RELEASED  
**Carrier Location:** 50 miles away from pickup

**Request:**
```json
{
  "latitude": 29.7604,
  "longitude": -95.3698,
  "stage": "at_pickup"
}
```

**Distance:** 50,000+ meters (way outside geofence)

**Expected Response:**
```json
{
  "success": true,
  "statusUpdated": false,
  "proximity": {
    "verified": false,
    "distance": 50234,
    "threshold": 500,
    "atPickup": false,
    "flagged": true
  }
}
```

**Expected Side Effects:**
- ✅ Load flagged as suspicious
- ✅ Delivery exception created
- ✅ Admin notified for review
- ✅ Status NOT updated

---

## ✅ **Success Criteria**

- [ ] Geofence radius = 500 meters
- [ ] GPS within geofence auto-updates status
- [ ] at_pickup + within range → IN_TRANSIT
- [ ] at_delivery + within range → DELIVERED
- [ ] GPS outside geofence → flagged for review
- [ ] No manual status update needed when GPS used

**Result:** PASS / FAIL

**Notes:**


