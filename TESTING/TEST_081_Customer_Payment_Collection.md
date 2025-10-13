# TEST_081: Customer Payment Collection

## 📋 **Test Information**
- **Feature**: Charge Customer via Stripe
- **Priority**: 🔴 CRITICAL
- **Endpoint**: `POST /api/payments/charge/:invoiceId`
- **Authentication**: Required (Admin only)
- **Dependencies**: TEST_080 (Invoice created)

---

## 📝 **Test Cases**

### **Test Case 81.1: Charge Customer (Mock Mode)**

**Request:**
```http
POST http://localhost:3000/api/payments/charge/{invoiceId}
Authorization: Bearer {adminToken}
```

**Expected Response (Mock Mode):**
```json
{
  "success": true,
  "message": "Invoice charged successfully",
  "invoice": {
    "id": "{invoiceId}",
    "status": "PAID",
    "amount": "625.00",
    "paidAt": "2025-01-16T16:00:00Z"
  }
}
```

**Check Console Log:**
```
[MOCK] Charging customer cus_mock_{customerId}: $625.00
```

**Expected Side Effects:**
- ✅ Invoice status = PAID
- ✅ paidAt timestamp set
- ✅ Mock payment ID generated

---

### **Test Case 81.2: Charge Already Paid Invoice**

**Request:** Charge same invoice twice

**Expected Response:**
```json
{
  "success": true,
  "message": "Invoice already paid",
  "invoice": {
    "status": "PAID"
  }
}
```

**Expected:** No duplicate charge

---

## ✅ **Success Criteria**

- [ ] Invoice status changes to PAID
- [ ] Payment timestamp recorded
- [ ] Mock mode works (no real Stripe key needed)
- [ ] Duplicate charges prevented
- [ ] Admin access enforced

**Result:** PASS / FAIL

**Notes:**

**⚠️ Mock Mode:** If STRIPE_SECRET_KEY not set in .env, uses mock payments (always succeeds)

**Real Mode:** Set STRIPE_SECRET_KEY=sk_test_... to test real Stripe integration


