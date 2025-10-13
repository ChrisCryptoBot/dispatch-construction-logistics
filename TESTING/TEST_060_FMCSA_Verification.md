# TEST_060: FMCSA Carrier Verification

## 📋 **Test Information**
- **Feature**: FMCSA Authority & Safety Rating Verification
- **Priority**: 🔴 CRITICAL (Safety/Legal)
- **Endpoint**: `POST /api/verification/fmcsa/:orgId/verify`
- **Authentication**: Required (Must own org or be admin)
- **Dependencies**: 
  - TEST_001 (User Signup - Carrier with MC/DOT numbers)
  - FMCSA API (external dependency)

---

## 🎯 **Test Objective**
Verify carriers are automatically validated against FMCSA database for active authority and acceptable safety ratings before accepting loads.

---

## 🔧 **Setup Requirements**

### **Create Test Carrier with MC/DOT:**

```http
POST http://localhost:3000/api/auth/signup
Content-Type: application/json

{
  "orgName": "Test Carrier Trucking",
  "orgType": "CARRIER",
  "email": "test@carrier.com",
  "password": "test123",
  "firstName": "Test",
  "lastName": "Carrier"
}
```

### **Update with MC/DOT Numbers:**

After signup, update the organization:
```sql
-- Manual SQL for testing (or via API if available)
UPDATE organizations 
SET mc_number = 'MC-123456', 
    dot_number = 'DOT-2234567'  -- Use real DOT for testing
WHERE email = 'test@carrier.com';
```

**Real DOT Numbers for Testing:**
- `DOT-2234567` - Werner Enterprises (ACTIVE, SATISFACTORY)
- `DOT-125094` - J.B. Hunt (ACTIVE, SATISFACTORY)
- `DOT-23820` - Schneider (ACTIVE, SATISFACTORY)

---

## 📝 **Test Cases**

### **Test Case 60.1: Successful FMCSA Verification (ACTIVE carrier)**

**Request:**
```http
POST http://localhost:3000/api/verification/fmcsa/{orgId}/verify
Authorization: Bearer {token}
```

**Expected Response:**
```json
{
  "success": true,
  "verified": true,
  "status": "ACTIVE",
  "safetyRating": "SATISFACTORY",
  "message": "Carrier verified successfully",
  "verifiedAt": "2025-01-15T10:30:00.000Z"
}
```

**Expected Status Code:** `200 OK`

**Expected Side Effects:**
- ✅ Organization.fmcsaVerified = true
- ✅ Organization.fmcsaStatus = "ACTIVE"
- ✅ Organization.fmcsaSafetyRating = "SATISFACTORY"
- ✅ Organization.fmcsaVerifiedAt = current timestamp
- ✅ Organization.fmcsaLastChecked = current timestamp
- ✅ Organization.fmcsaDataSnapshot = full FMCSA API response (cached)
- ✅ Organization.verified = true (overall flag)

---

### **Test Case 60.2: Check Verification Status**

**Request:**
```http
GET http://localhost:3000/api/verification/fmcsa/{orgId}/status
Authorization: Bearer {token}
```

**Expected Response:**
```json
{
  "success": true,
  "organization": {
    "id": "org-123",
    "name": "Test Carrier Trucking",
    "mcNumber": "MC-123456",
    "dotNumber": "DOT-2234567",
    "verified": true,
    "fmcsaVerified": true,
    "fmcsaVerifiedAt": "2025-01-15T10:30:00.000Z",
    "fmcsaStatus": "ACTIVE",
    "fmcsaSafetyRating": "SATISFACTORY",
    "fmcsaLastChecked": "2025-01-15T10:30:00.000Z"
  },
  "needsReverification": false,
  "verificationAge": 0
}
```

**Expected Status Code:** `200 OK`

---

### **Test Case 60.3: Missing MC/DOT Numbers (Negative)**

**Request:**
```http
POST http://localhost:3000/api/verification/fmcsa/{orgIdWithoutMCDOT}/verify
Authorization: Bearer {token}
```

**Expected Response:**
```json
{
  "error": "DOT or MC number required for FMCSA verification",
  "code": "MISSING_IDENTIFIERS"
}
```

**Expected Status Code:** `400 Bad Request`

---

### **Test Case 60.4: Invalid DOT Number (Not Found)**

**Request:**
```http
POST http://localhost:3000/api/verification/fmcsa/{orgId}/verify
Authorization: Bearer {token}
```

**Org DOT:** `DOT-99999999` (fake number)

**Expected Response:**
```json
{
  "success": true,
  "verified": false,
  "status": "NOT_FOUND",
  "safetyRating": null,
  "message": "Carrier not found in FMCSA database"
}
```

**Expected Status Code:** `200 OK`

**Expected Side Effects:**
- ✅ Organization.fmcsaVerified = false
- ✅ Organization.fmcsaStatus = "NOT_FOUND"
- ✅ Organization.verified = false

---

### **Test Case 60.5: Unsatisfactory Safety Rating (Negative)**

**Org DOT:** Carrier with UNSATISFACTORY rating

**Expected Response:**
```json
{
  "success": true,
  "verified": false,
  "status": "ACTIVE",
  "safetyRating": "UNSATISFACTORY",
  "message": "Verification failed: Unsatisfactory safety rating"
}
```

**Expected Side Effects:**
- ✅ Organization.fmcsaVerified = false
- ✅ Organization.verified = false
- ✅ Carrier CANNOT accept loads

---

### **Test Case 60.6: Access Control (Wrong User)**

**Request:**
```http
POST http://localhost:3000/api/verification/fmcsa/{differentOrgId}/verify
Authorization: Bearer {token}
```

**Expected Response:**
```json
{
  "error": "Access denied - can only verify own organization",
  "code": "ACCESS_DENIED"
}
```

**Expected Status Code:** `403 Forbidden`

---

### **Test Case 60.7: FMCSA API Rate Limiting**

**Request:** Call verification endpoint 15 times rapidly (>10 req/min)

**Expected Behavior:**
- ✅ First 10 requests process normally
- ✅ Requests 11+ delayed automatically (6-second intervals)
- ✅ No 429 errors from FMCSA API
- ✅ All requests eventually complete

---

### **Test Case 60.8: Batch Verification (Admin Only)**

**Request:**
```http
POST http://localhost:3000/api/verification/batch
Authorization: Bearer {adminToken}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Batch verification started in background",
  "note": "This may take several minutes depending on number of carriers"
}
```

**Expected Status Code:** `200 OK`

**Expected Side Effects:**
- ✅ All carriers with DOT/MC numbers verified
- ✅ Results logged to console
- ✅ Carriers with no MC/DOT skipped
- ✅ Rate limiting respected (6 second delays)

---

### **Test Case 60.9: Weekly Re-Verification**

**Setup:**
- Carrier verified 8 days ago (fmcsaLastChecked = 8 days old)

**Request:**
```http
GET http://localhost:3000/api/verification/fmcsa/{orgId}/status
```

**Expected Response:**
```json
{
  "success": true,
  "organization": { ... },
  "needsReverification": true,
  "verificationAge": 8
}
```

**Action:** Call verify endpoint to re-verify carrier

---

## ✅ **Success Criteria**

- [ ] ACTIVE carriers with SATISFACTORY rating verified = true
- [ ] ACTIVE carriers with NOT_RATED verified = true (new carriers)
- [ ] UNSATISFACTORY safety rating → verified = false
- [ ] REVOKED authority → verified = false
- [ ] SUSPENDED authority → verified = false
- [ ] DOT number not found → verified = false
- [ ] Rate limiting enforced (6 second delays)
- [ ] FMCSA response cached in fmcsaDataSnapshot
- [ ] Verification timestamp recorded
- [ ] Access control enforced (must own org or be admin)
- [ ] Batch verification works for all carriers
- [ ] Re-verification triggered after 7 days

---

## 🧪 **Business Logic Validation**

### **Acceptable Carriers:**
- Authority Status: ACTIVE or AUTHORIZED
- Safety Rating: SATISFACTORY or NOT_RATED

### **Blocked Carriers:**
- Authority Status: REVOKED, SUSPENDED, INACTIVE
- Safety Rating: UNSATISFACTORY, CONDITIONAL

### **FMCSA API Details:**
- Base URL: `https://mobile.fmcsa.dot.gov/qc/services/carriers/`
- Rate Limit: 10 requests/minute
- No API key required for basic lookups
- Timeout: 10 seconds
- Retry: Once on 429 (rate limit exceeded)

---

## 🐛 **Known Issues / Notes**

- FMCSA API sometimes slow (10+ second responses)
- No API key provided = using public endpoint (may have stricter limits)
- Safety ratings can be null for new carriers (treated as acceptable)
- FMCSA data snapshot can be large (5-10 KB JSON)

---

## 🔗 **Related Tests**
- TEST_062: Insurance Verification (required together)
- TEST_033: Carrier Accept Load (checks both FMCSA + insurance)
- TEST_120: Double-Brokering Prevention (uses FMCSA data)

---

## 📊 **Test Data**

**Valid Test Carriers (Real DOT numbers):**
```javascript
// Use these for testing - they're real, active carriers
const testCarriers = [
  { dot: '2234567', mc: 'MC-480160', name: 'Werner Enterprises', expected: 'VERIFIED' },
  { dot: '125094', mc: 'MC-160142', name: 'J.B. Hunt', expected: 'VERIFIED' },
  { dot: '23820', mc: 'MC-139032', name: 'Schneider', expected: 'VERIFIED' }
];
```

**Invalid Test Cases:**
```javascript
const invalidCases = [
  { dot: '99999999', expected: 'NOT_FOUND' },
  { dot: '', expected: 'MISSING_IDENTIFIERS' },
  { dot: 'ABC123', expected: 'API_ERROR' }
];
```


