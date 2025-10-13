# TEST_082: Carrier Payout (Standard Net 30)

## 📋 **Test Information**
- **Feature**: Create Standard Carrier Payout
- **Priority**: 🔴 CRITICAL
- **Endpoint**: `POST /api/payments/payout/:loadId`
- **Authentication**: Required
- **Dependencies**: TEST_080 (Load completed, invoice created)

---

## 📝 **Test Cases**

### **Test Case 82.1: Create Standard Payout (Net 30)**

**Load Details:**
- Gross Revenue: $625.00
- Platform Fee (6%): $37.50
- Carrier Payout: $587.50

**Request:**
```http
POST http://localhost:3000/api/payments/payout/{loadId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "quickPay": false
}
```

**Expected Response:**
```json
{
  "success": true,
  "payout": {
    "id": "payout-123",
    "amount": "587.50",
    "platformFee": "37.50",
    "quickPayFee": "0.00",
    "status": "QUEUED",
    "quickPay": false
  },
  "estimatedPayoutDate": "30 days"
}
```

**Expected Status Code:** `200 OK`

**Expected Side Effects:**
- ✅ Payout record created
- ✅ amountCents = (gross - 6%)
- ✅ platformFeeCents = gross × 0.06
- ✅ quickPayFeeCents = 0
- ✅ status = QUEUED (scheduled for 30 days)

---

### **Test Case 82.2: Fee Calculation Validation**

**Verify math:**
```
Gross Revenue: $625.00
- Platform Fee (6%): $625 × 0.06 = $37.50
= Carrier Payout: $625 - $37.50 = $587.50
```

**Expected:** Amount matches calculation

---

## ✅ **Success Criteria**

- [ ] Payout created with correct amount
- [ ] Platform fee = 6% of gross revenue
- [ ] Quick pay fee = $0 (standard payment)
- [ ] Status = QUEUED
- [ ] Scheduled for 30 days out

**Result:** PASS / FAIL

**Notes:**


