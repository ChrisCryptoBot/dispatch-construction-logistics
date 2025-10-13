# 🔄 **COMPLETE END-TO-END WORKFLOW TEST**

## **Full Platform Test - Customer Posts Load → Carrier Delivers → Payment**

This test validates the **ENTIRE platform workflow** from start to finish including the new release and verification systems.

---

## 🎯 **Test Objective**
Validate complete load lifecycle with all new safety features (FMCSA, Insurance, Release, TONU prevention).

---

## 📋 **COMPLETE WORKFLOW (15 Steps)**

### **STEP 1: Customer Registration**
```http
POST http://localhost:3000/api/auth/signup
Content-Type: application/json

{
  "orgName": "ABC Construction",
  "orgType": "SHIPPER",
  "email": "customer@abcconstruction.com",
  "password": "Customer123!",
  "firstName": "Sarah",
  "lastName": "Johnson"
}
```

**Expected:** 202 Accepted, verification code logged

---

### **STEP 2: Customer Email Verification**
```http
POST http://localhost:3000/api/auth/verify-email
Content-Type: application/json

{
  "email": "customer@abcconstruction.com",
  "code": "123456"
}
```

**Expected:** Token returned, user status = ACTIVE

**Save customer token for next steps!**

---

### **STEP 3: Carrier Registration**
```http
POST http://localhost:3000/api/auth/signup
Content-Type: application/json

{
  "orgName": "ACME Trucking LLC",
  "orgType": "CARRIER",
  "email": "carrier@acmetrucking.com",
  "password": "Carrier123!",
  "firstName": "John",
  "lastName": "Smith"
}
```

**Expected:** 202 Accepted

---

### **STEP 4: Carrier Email Verification**
```http
POST http://localhost:3000/api/auth/verify-email
Content-Type: application/json

{
  "email": "carrier@acmetrucking.com",
  "code": "123456"
}
```

**Save carrier token!**

---

### **STEP 5: Add Carrier MC/DOT Numbers**

```sql
-- Via SQL or API (if org update endpoint exists)
UPDATE organizations 
SET mc_number = 'MC-480160', 
    dot_number = '2234567'  -- Werner Enterprises (real, active)
WHERE email = 'carrier@acmetrucking.com';
```

---

### **STEP 6: Verify Carrier FMCSA Authority**
```http
POST http://localhost:3000/api/verification/fmcsa/{carrierOrgId}/verify
Authorization: Bearer {carrierToken}
```

**Expected Response:**
```json
{
  "success": true,
  "verified": true,
  "status": "ACTIVE",
  "safetyRating": "SATISFACTORY"
}
```

**Expected Side Effects:**
- ✅ Carrier verified = true
- ✅ Can now accept loads

---

### **STEP 7: Add Carrier Insurance**

```sql
INSERT INTO insurance (
  org_id, type, provider, policy_number, 
  coverage_amount, effective_date, expiry_date, active
) VALUES (
  '{carrierOrgId}', 'cargo', 'Progressive', 'POL-123456',
  1000000, '2025-01-01', '2025-12-31', true
);

INSERT INTO insurance (
  org_id, type, provider, policy_number,
  coverage_amount, effective_date, expiry_date, active
) VALUES (
  '{carrierOrgId}', 'liability', 'Travelers', 'POL-789012',
  100000, '2025-01-01', '2025-12-31', true
);
```

---

### **STEP 8: Customer Posts Load**
```http
POST http://localhost:3000/api/customer/loads
Authorization: Bearer {customerToken}
Content-Type: application/json

{
  "materialType": "AGGREGATE",
  "commodityDetails": "3/4 inch washed gravel",
  "quantity": 50,
  "quantityUnit": "tons",
  "pickupLocation": "XYZ Quarry",
  "pickupAddress": "123 Quarry Road, Austin, TX 78701",
  "deliveryLocation": "Job Site Alpha",
  "deliveryAddress": "456 Construction Way, Austin, TX 78702",
  "pickupDate": "2025-01-16",
  "pickupTimeStart": "08:00",
  "pickupTimeEnd": "12:00",
  "deliveryDate": "2025-01-16",
  "deliveryTimeStart": "10:00",
  "deliveryTimeEnd": "15:00",
  "rateMode": "PER_TON",
  "rateAmount": 12.50,
  "requiresScaleTicket": true,
  "jobCode": "JOB-2025-001",
  "poNumber": "PO-98765"
}
```

**Expected:** Load created with status = POSTED

**Save loadId!**

---

### **STEP 9: Carrier Browses Available Loads**
```http
GET http://localhost:3000/api/carrier/available-loads
Authorization: Bearer {carrierToken}
```

**Expected:** Load from Step 8 appears in results

---

### **STEP 10: Carrier Submits Bid**
```http
POST http://localhost:3000/api/carrier/loads/{loadId}/bid
Authorization: Bearer {carrierToken}
Content-Type: application/json

{
  "bidAmount": 12.50,
  "message": "Can deliver same day, have 25-ton end dump ready",
  "expiresInHours": 24
}
```

**Expected:** Bid created with status = PENDING

**Save bidId!**

---

### **STEP 11: Customer Accepts Bid**
```http
POST http://localhost:3000/api/customer/loads/{loadId}/bids/{bidId}/accept
Authorization: Bearer {customerToken}
Content-Type: application/json

{
  "notes": "Confirmed for tomorrow 8 AM pickup"
}
```

**Expected Response:**
- Load status = ASSIGNED
- Carrier assigned to load
- Other bids rejected

---

### **STEP 12: Carrier Accepts Load**
```http
POST http://localhost:3000/api/carrier/loads/{loadId}/accept
Authorization: Bearer {carrierToken}
Content-Type: application/json

{
  "notes": "Confirmed, truck #7 assigned"
}
```

**Expected Response:**
```json
{
  "success": true,
  "load": {
    "status": "RELEASE_REQUESTED"
  },
  "message": "Load accepted successfully. Waiting for shipper to confirm material is ready.",
  "releaseRequested": true
}
```

**Expected Side Effects:**
- ✅ Load status = RELEASE_REQUESTED (automatic!)
- ✅ Release requested from shipper
- ✅ Insurance checked automatically (must be valid)
- ✅ Pickup address HIDDEN from carrier

---

### **STEP 13: Customer Issues Release**
```http
POST http://localhost:3000/api/customer/loads/{loadId}/release
Authorization: Bearer {customerToken}
Content-Type: application/json

{
  "confirmedReady": true,
  "quantityConfirmed": "50 tons 3/4 gravel ready",
  "siteContact": "Mike @ XYZ Quarry, 512-555-1234",
  "pickupInstructions": "Gate 3, code 4567. Ask for Mike at scale house.",
  "acknowledgedTonu": true
}
```

**Expected Response:**
```json
{
  "success": true,
  "load": {
    "status": "RELEASED",
    "releaseNumber": "RL-2025-XXXXXXXX"
  },
  "release": {
    "releaseNumber": "RL-2025-XXXXXXXX",
    "expiresAt": "2025-01-16T10:30:00Z"
  }
}
```

**Expected Side Effects:**
- ✅ Release number generated
- ✅ Load status = RELEASED
- ✅ Pickup address now VISIBLE to carrier
- ✅ Release valid for 24 hours

---

### **STEP 14: Carrier Checks Release Status**
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
    "releaseNumber": "RL-2025-XXXXXXXX",
    "releasedAt": "2025-01-15T10:30:00Z",
    "expiresAt": "2025-01-16T10:30:00Z",
    "expired": false,
    "notes": "Contact: Mike @ XYZ Quarry, 512-555-1234 | Gate 3...",
    "quantityConfirmed": "50 tons 3/4 gravel ready",
    "pickupAddress": "123 Quarry Road, Austin, TX 78701",
    "pickupDate": "2025-01-16T08:00:00Z"
  }
}
```

**Carrier can now see:**
- ✅ Full pickup address
- ✅ Release number to show at gate
- ✅ Contact person at site
- ✅ Special instructions

---

### **STEP 15: Update Load Status (Pickup → Delivery → Complete)**

**15a. Carrier Picks Up Material:**
```http
PATCH http://localhost:3000/api/loads/{loadId}/status
Authorization: Bearer {carrierToken}
Content-Type: application/json

{
  "status": "IN_TRANSIT",
  "notes": "Material loaded, en route to job site"
}
```

**Expected:** Load status = IN_TRANSIT

---

**15b. Carrier Delivers Material:**
```http
PATCH http://localhost:3000/api/loads/{loadId}/status
Authorization: Bearer {carrierToken}
Content-Type: application/json

{
  "status": "DELIVERED",
  "notes": "Material delivered, BOL signed"
}
```

**Expected:** Load status = DELIVERED

---

**15c. Customer Confirms Complete:**
```http
PATCH http://localhost:3000/api/loads/{loadId}/status
Authorization: Bearer {customerToken}
Content-Type: application/json

{
  "status": "COMPLETED",
  "notes": "Load completed successfully, scale ticket verified"
}
```

**Expected:** Load status = COMPLETED, completedAt timestamp set

---

## 🎉 **WORKFLOW COMPLETE!**

### **Final State:**
- ✅ Load created (DRAFT → POSTED)
- ✅ Carrier bid accepted (ASSIGNED)
- ✅ Carrier accepted load (RELEASE_REQUESTED)
- ✅ Customer issued release (RELEASED)
- ✅ Carrier picked up (IN_TRANSIT)
- ✅ Carrier delivered (DELIVERED)
- ✅ Customer confirmed (COMPLETED)

### **Safety Features Validated:**
- ✅ FMCSA verification enforced
- ✅ Insurance verification enforced
- ✅ Release system prevented premature pickup
- ✅ TONU liability transferred to shipper
- ✅ Audit trail complete

---

## 💰 **Next Step (Payment Automation - Coming Soon):**

```http
# Auto-generated after COMPLETED:
POST /api/payments/invoice/{loadId}  # Generate invoice
POST /api/payments/collect            # Charge customer
POST /api/payments/payout/{loadId}    # Pay carrier
```

---

## ✅ **Success Criteria**

**Full workflow completes with:**
- [ ] 2 users registered (customer + carrier)
- [ ] 1 load created
- [ ] Carrier FMCSA verified
- [ ] Carrier insurance validated
- [ ] Bid submitted and accepted
- [ ] Carrier accepted load
- [ ] Insurance checked automatically
- [ ] Release requested automatically
- [ ] Release issued with TONU acknowledgment
- [ ] Pickup address hidden until released
- [ ] Load progressed through all statuses
- [ ] Zero errors or exceptions
- [ ] All timestamps recorded
- [ ] Audit trail complete

---

## 🐛 **Troubleshooting**

**If carrier can't accept load:**
- Check: FMCSA verified = true
- Check: Insurance valid (cargo + liability, not expired)
- Check: Load status = ASSIGNED

**If release won't issue:**
- Check: Load status = RELEASE_REQUESTED or ACCEPTED
- Check: Pickup date within 24 hours
- Check: All confirmations checked
- Check: User is shipper who owns load

**If address stays hidden:**
- Check: Release issued successfully (status = RELEASED)
- Check: Release not expired (expiresAt > now)
- Check: Using correct endpoint (GET /carrier/loads/:id/release-status)

---

## 📊 **Expected Timeline**

Total workflow time: **~5 minutes** (manual testing)

1. Create 2 accounts: 2 min
2. Post load: 30 sec
3. Bid + accept: 1 min
4. Release workflow: 1 min
5. Status updates: 30 sec

**Automated:** Would take < 10 seconds

---

## 🔗 **Individual Test References**

This workflow combines:
- TEST_001: Signup
- TEST_002: Email Verification
- TEST_018: Load Posting Wizard
- TEST_031: Carrier Submit Bid
- TEST_040: Customer Accept Bid
- TEST_033: Carrier Accept Load
- TEST_060: FMCSA Verification
- TEST_062: Insurance Verification
- TEST_042: Customer Issue Release
- TEST_072: Carrier Release Status
- TEST_017: Load Status Lifecycle

**Run individual tests first, then this complete workflow!**


