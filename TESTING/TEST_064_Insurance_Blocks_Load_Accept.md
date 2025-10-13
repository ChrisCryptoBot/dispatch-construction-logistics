# TEST_064: Insurance Verification Blocks Load Acceptance

## 📋 **Test Information**
- **Feature**: Insurance Check Integration
- **Priority**: 🔴 CRITICAL (Safety)
- **Endpoint**: `POST /api/carrier/loads/:id/accept`
- **Authentication**: Required (Carrier)
- **Dependencies**: TEST_040 (Load assigned to carrier)

---

## 🎯 **Test Objective**
Verify that carriers with invalid insurance are blocked from accepting loads.

---

## 🔧 **Setup: Create Carriers with Different Insurance States**

### **Carrier A: Valid Insurance** ✅
```sql
-- Cargo insurance (valid)
INSERT INTO insurance (org_id, type, coverage_amount, expiry_date, active)
VALUES ('{carrierA}', 'cargo', 1000000, '2025-12-31', true);

-- Liability insurance (valid)
INSERT INTO insurance (org_id, type, coverage_amount, expiry_date, active)
VALUES ('{carrierA}', 'liability', 100000, '2025-12-31', true);
```

### **Carrier B: Expired Insurance** ❌
```sql
INSERT INTO insurance (org_id, type, coverage_amount, expiry_date, active)
VALUES ('{carrierB}', 'cargo', 1000000, '2024-12-31', true);  -- Expired!
```

### **Carrier C: Missing Liability** ❌
```sql
-- Only cargo, no liability
INSERT INTO insurance (org_id, type, coverage_amount, expiry_date, active)
VALUES ('{carrierC}', 'cargo', 1000000, '2025-12-31', true);
```

### **Carrier D: Insufficient Coverage** ❌
```sql
INSERT INTO insurance (org_id, type, coverage_amount, expiry_date, active)
VALUES ('{carrierD}', 'cargo', 500000, '2025-12-31', true);  -- Only $500K, need $1M
```

---

## 📝 **Test Cases**

### **Test Case 64.1: Carrier A (Valid Insurance) - ALLOWED** ✅

**Request:**
```http
POST http://localhost:3000/api/carrier/loads/{loadId}/accept
Authorization: Bearer {carrierAToken}
```

**Expected Response:**
```json
{
  "success": true,
  "load": {
    "status": "RELEASE_REQUESTED"
  },
  "message": "Load accepted successfully..."
}
```

**Result:** ✅ PASS - Carrier can accept

---

### **Test Case 64.2: Carrier B (Expired Insurance) - BLOCKED** ❌

**Request:**
```http
POST http://localhost:3000/api/carrier/loads/{loadId}/accept
Authorization: Bearer {carrierBToken}
```

**Expected Response:**
```json
{
  "error": "Cannot accept loads - insurance verification failed",
  "code": "INSURANCE_INVALID",
  "details": "1 insurance policy(ies) expired"
}
```

**Expected Status Code:** `403 Forbidden`

**Result:** ✅ PASS - Carrier correctly blocked

---

### **Test Case 64.3: Carrier C (Missing Liability) - BLOCKED** ❌

**Expected Response:**
```json
{
  "error": "Cannot accept loads - insurance verification failed",
  "code": "INSURANCE_INVALID",
  "details": "Missing required insurance: liability"
}
```

**Expected Status Code:** `403 Forbidden`

**Result:** ✅ PASS - Carrier correctly blocked

---

### **Test Case 64.4: Carrier D (Insufficient Coverage) - BLOCKED** ❌

**Expected Response:**
```json
{
  "error": "Cannot accept loads - insurance verification failed",
  "code": "INSURANCE_INVALID",
  "details": "Insurance coverage amounts below minimum requirements"
}
```

**Expected Status Code:** `403 Forbidden`

**Result:** ✅ PASS - Carrier correctly blocked

---

## ✅ **Success Criteria**

**Valid Carriers (can accept):**
- [ ] Cargo insurance ≥ $1M, not expired
- [ ] Liability insurance ≥ $100K, not expired
- [ ] Both types present

**Blocked Carriers (cannot accept):**
- [ ] Missing cargo insurance → BLOCKED
- [ ] Missing liability insurance → BLOCKED
- [ ] Expired insurance → BLOCKED
- [ ] Insufficient coverage → BLOCKED
- [ ] Clear error message explaining why

**Integration:**
- [ ] Check runs automatically on carrier accept
- [ ] No manual verification needed
- [ ] Carrier sees helpful error message
- [ ] Organization.verified = false for blocked carriers

**Result:** PASS / FAIL

**Notes:**

This is a **CRITICAL SAFETY FEATURE** - protects platform from liability if uninsured carrier causes damage!


