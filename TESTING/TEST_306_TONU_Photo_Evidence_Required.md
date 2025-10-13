# TEST_306: TONU Photo Evidence & GPS Validation
## Feature: Require photo evidence and GPS proximity validation for TONU filing

---

## 🎯 **Test Objective:**
Verify that TONU claims cannot be filed without photo evidence, GPS trail showing carrier was at location for minimum 15 minutes, and proximity within 0.5 miles of pickup location.

---

## 📋 **TONU Validation Rules:**
1. ✅ **Photo Evidence Required:** At least 1 photo showing site conditions
2. ✅ **GPS Trail Required:** Must have GPS pings showing arrival
3. ✅ **Minimum Wait Time:** Must wait 15+ minutes at location
4. ✅ **Proximity Validation:** GPS must show <0.5 miles from pickup
5. ✅ **Timestamp Validation:** Arrival time must be reasonable

---

## 🔄 **Test Workflow:**

### **Test 1: Valid TONU with All Evidence**

1. **Setup:**
   - Load status: RELEASED
   - Carrier dispatches driver to pickup
   - Driver arrives at site
   - Material not ready

2. **Carrier Files TONU:**
   - Driver takes photos:
     - Photo 1: Site entrance with truck visible (shows arrival)
     - Photo 2: Material pile showing incomplete/not ready
     - Photo 3: Text message from shipper: "Material not ready, processing delayed"
   - Carrier submits GPS pings every 5 minutes for 20 minutes
   - Login as Carrier
   - Navigate to load
   - Click "Material Not Ready - File TONU"
   - Fill out form:
     - Reason: "Material still being processed, shipper said wait 2+ hours"
     - Arrival time: "2025-10-10 08:30 AM"
     - Wait time: 30 minutes
     - Evidence: Upload 3 photos
   - API Call: `POST /api/carrier/loads/:id/tonu`

**Expected Result:**
- ✅ TONU filed successfully
- ✅ Load status: RELEASED → TONU
- ✅ tonuAmount: $200
- ✅ carrierPayout: $150
- ✅ tonuEvidence contains 3 photo URLs
- ✅ Customer notified of TONU claim
- ✅ Customer charged $200
- ✅ Carrier receives $150

**Verify in Database:**
```sql
SELECT 
  status,
  tonu_filed,
  tonu_filed_at,
  tonu_amount,
  tonu_reason,
  tonu_evidence
FROM loads WHERE id = '[load_id]';
-- status = 'TONU'
-- tonu_evidence (JSON) should contain photo URLs
```

---

### **Test 2: TONU Rejected - No Photo Evidence**

1. **Carrier Tries to File TONU Without Photos:**
   - Fill out TONU form
   - Reason: "Material not ready"
   - Arrival time: valid
   - Evidence: [] (empty array, no photos)
   - API Call: `POST /api/carrier/loads/:id/tonu`

**Expected Result:**
- ✅ Error 400
- ✅ Code: TONU_EVIDENCE_REQUIRED
- ✅ Message: "Photo evidence is required to file TONU. Please upload at least one photo showing you arrived at the site and material was not ready."
- ✅ TONU NOT filed
- ✅ Load status unchanged

---

### **Test 3: TONU Rejected - No GPS Trail**

1. **Carrier Files TONU But Never Sent GPS Pings:**
   - Upload photos
   - Enter arrival time
   - But GPS tracking was disabled or carrier never sent pings
   - API Call: `POST /api/carrier/loads/:id/tonu`

**Expected Result:**
- ✅ Error 400
- ✅ Code: NO_GPS_TRAIL
- ✅ Message: "No GPS record showing arrival at pickup location. GPS tracking must be enabled."
- ✅ TONU NOT filed

**Verify:**
```sql
SELECT COUNT(*) FROM geo_events WHERE load_id = '[load_id]';
-- Should be 0 (no GPS pings)
```

---

### **Test 4: TONU Rejected - Insufficient Wait Time**

1. **Carrier Arrives But Doesn't Wait 15 Minutes:**
   - Send GPS ping at 8:30 AM (arrival)
   - Send GPS ping at 8:40 AM (10 minutes later)
   - Try to file TONU at 8:40 AM
   - API Call: `POST /api/carrier/loads/:id/tonu`

**Expected Result:**
- ✅ Error 400
- ✅ Code: INSUFFICIENT_WAIT_TIME
- ✅ Message: "Must wait at least 15 minutes at location before filing TONU. You waited 10 minutes."
- ✅ actualWaitTime: 10
- ✅ TONU NOT filed

**Calculation:**
```javascript
firstPing = 8:30 AM
lastPing = 8:40 AM
minutesAtLocation = (8:40 - 8:30) = 10 minutes
required = 15 minutes
result = REJECTED
```

---

### **Test 5: TONU Rejected - GPS Too Far From Pickup**

1. **Carrier Sends GPS Pings From Wrong Location:**
   - Pickup location: 30.2672° N, 97.7431° W (Austin)
   - Carrier GPS: 30.3000° N, 97.8000° W (2+ miles away)
   - Upload photos, wait 20 minutes
   - Try to file TONU
   - API Call: `POST /api/carrier/loads/:id/tonu`

**Expected Result:**
- ✅ Error 400
- ✅ Code: LOCATION_MISMATCH
- ✅ Message: "GPS shows you were 2.34 miles from the pickup location. Must be within 0.5 miles to file TONU."
- ✅ distance: "2.34 miles from pickup"
- ✅ TONU NOT filed

**Distance Calculation:**
```javascript
pickupLat = 30.2672
pickupLng = 97.7431
carrierLat = 30.3000
carrierLng = 97.8000

distance = calculateDistance(...) // ~2.34 miles
threshold = 0.5 miles
result = REJECTED (distance > threshold)
```

---

### **Test 6: All Validations Pass**

1. **Carrier Provides Complete Evidence:**
   - ✅ Upload 2+ photos showing site and material status
   - ✅ GPS pings from correct location (<0.5 miles)
   - ✅ Wait at location for 20+ minutes
   - ✅ Valid arrival time and reason
   - API Call: `POST /api/carrier/loads/:id/tonu`

**Expected Result:**
- ✅ All validations pass
- ✅ TONU filed successfully
- ✅ Load status: TONU
- ✅ Carrier compensation: $150
- ✅ Customer charged: $200

---

## ✅ **Success Criteria:**

- [ ] Photo evidence REQUIRED (cannot file without)
- [ ] GPS trail REQUIRED (at least 1 ping)
- [ ] Minimum 15-minute wait enforced
- [ ] Proximity validation (<0.5 miles)
- [ ] All validations must pass to file TONU
- [ ] Clear error messages for each validation failure
- [ ] Evidence stored with TONU claim
- [ ] GPS trail stored for audit

---

## 🚨 **Edge Cases:**

### **EC1: GPS Accuracy Low**
- GPS ping has low accuracy (±100 meters)
- Might be outside 0.5-mile radius due to GPS error
- **Test:** Should we allow wider radius for low accuracy?

### **EC2: Driver Forgets to Enable GPS**
- Realizes at site that GPS tracking is off
- Turns it on, waits 15 minutes
- **Expected:** Can file TONU if GPS trail shows 15+ minutes

### **EC3: Multiple Arrival Times**
- Carrier arrives at 8 AM, leaves, comes back at 2 PM
- Wants to file TONU based on 2nd arrival
- **Expected:** Use earliest GPS ping within reasonable timeframe

### **EC4: Carrier Provides Video Evidence**
- Instead of photos, uploads video of site
- **Expected:** Video URL accepted in evidence array

---

## 📊 **Fraud Prevention Metrics:**

- **TONU Filing Success Rate:** % of TONU attempts that pass validation
- **Photo Evidence Compliance:** % of TONU claims with photos
- **GPS Trail Compliance:** % of TONU claims with valid GPS
- **Proximity Failures:** # of TONU rejections due to location mismatch
- **Wait Time Failures:** # of TONU rejections due to insufficient wait

**Target:** <5% fraudulent TONU attempts

---

## 🔧 **GPS Distance Calculation Test:**

Test the distance calculation function:

```javascript
// Test coordinates
const testCases = [
  {
    pickup: { lat: 30.2672, lng: -97.7431 },
    carrier: { lat: 30.2672, lng: -97.7431 },
    expected: 0 miles (exact match)
  },
  {
    pickup: { lat: 30.2672, lng: -97.7431 },
    carrier: { lat: 30.2700, lng: -97.7450 },
    expected: ~0.2 miles (within threshold, ACCEPT)
  },
  {
    pickup: { lat: 30.2672, lng: -97.7431 },
    carrier: { lat: 30.3000, lng: -97.8000 },
    expected: ~2.3 miles (outside threshold, REJECT)
  }
]
```

---

**Status:** ✅ READY TO TEST
**Priority:** CRITICAL (Prevents TONU fraud)
**Estimated Time:** 45 minutes
**Last Updated:** October 10, 2025

