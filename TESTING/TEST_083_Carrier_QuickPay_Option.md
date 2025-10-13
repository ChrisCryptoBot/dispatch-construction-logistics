# TEST_083: Carrier QuickPay Option (2% Fee, 48 Hours)

## 📋 **Test Information**
- **Feature**: QuickPay - Fast Carrier Payment
- **Priority**: 🔴 CRITICAL
- **Endpoint**: `POST /api/payments/payout/:loadId`
- **Authentication**: Required
- **Dependencies**: TEST_080 (Load completed)

---

## 📝 **Test Cases**

### **Test Case 83.1: Create QuickPay Payout**

**Load Details:**
- Gross Revenue: $625.00
- Platform Fee (6%): $37.50
- **QuickPay Fee (2%):** $12.50
- Carrier Payout: $575.00

**Request:**
```http
POST http://localhost:3000/api/payments/payout/{loadId}
Authorization: Bearer {carrierToken}
Content-Type: application/json

{
  "quickPay": true
}
```

**Expected Response:**
```json
{
  "success": true,
  "payout": {
    "id": "payout-456",
    "amount": "575.00",
    "platformFee": "37.50",
    "quickPayFee": "12.50",
    "status": "QUEUED",
    "quickPay": true
  },
  "estimatedPayoutDate": "48 hours"
}
```

**Expected Side Effects:**
- ✅ Payout created
- ✅ amountCents = gross - 6% - 2% = $575.00
- ✅ platformFeeCents = $37.50
- ✅ quickPayFeeCents = $12.50
- ✅ quickPay = true
- ✅ Payout processed within 48 hours

---

### **Test Case 83.2: Fee Calculation Validation**

**Verify QuickPay math:**
```
Gross Revenue: $625.00
- Platform Fee (6%): $625 × 0.06 = $37.50
- QuickPay Fee (2%): $625 × 0.02 = $12.50
= Carrier Payout: $625 - $37.50 - $12.50 = $575.00

Carrier trades $12.50 for 48-hour payment vs 30-day wait
```

---

### **Test Case 83.3: Compare Standard vs QuickPay**

| Payment Option | Carrier Gets | Wait Time | Fees Paid |
|----------------|--------------|-----------|-----------|
| Standard (Net 30) | $587.50 | 30 days | 6% |
| QuickPay | $575.00 | 48 hours | 6% + 2% = 8% |

**Difference:** Carrier pays $12.50 for 28-day faster payment

---

## ✅ **Success Criteria**

- [ ] QuickPay payout created
- [ ] Additional 2% fee calculated
- [ ] Total fees = 8% (6% platform + 2% QuickPay)
- [ ] Carrier payout correct
- [ ] Scheduled for 48 hours
- [ ] Mock Stripe transfer succeeds

**Result:** PASS / FAIL

**Notes:**


