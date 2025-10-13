# TEST_110: Customer Credit Limit Enforcement

## 📋 **Test Information**
- **Feature**: Credit Limit & Bad Debt Prevention
- **Priority**: 🟡 HIGH
- **Service**: `creditCheckService.js`
- **Authentication**: Required
- **Dependencies**: Customer with credit profile

---

## 🎯 **Test Objective**
Verify credit limits prevent customers from posting loads beyond their approved credit limit.

---

## 📝 **Test Cases**

### **Test Case 110.1: New Customer (Prepay Only)**

**Credit Profile:**
- riskLimitCents: $0
- currentExposureCents: $0
- Completed loads: 0

**Test:** Try to post $625 load

**Expected Result:**
```json
{
  "authorized": false,
  "reason": "CREDIT_LIMIT_EXCEEDED",
  "creditLimit": "0.00",
  "requestedAmount": "625.00",
  "requiresPrepayment": true
}
```

**Action:** Customer must prepay before posting

---

### **Test Case 110.2: Good Customer (Credit Extended)**

**Credit Profile:**
- Paid invoices: 10
- Average days to pay: 25 days
- Late payments: 0
- Calculated limit: $20,000

**Current exposure:** $5,000  
**New load value:** $625

**Expected Result:**
```json
{
  "authorized": true,
  "currentExposure": "5000.00",
  "creditLimit": "20000.00",
  "availableCredit": "15000.00"
}
```

**Action:** Load can be posted

---

### **Test Case 110.3: Limit Exceeded**

**Credit Profile:**
- Credit limit: $5,000
- Current exposure: $4,800
- New load: $625

**Calculation:** $4,800 + $625 = $5,425 > $5,000

**Expected Result:**
```json
{
  "authorized": false,
  "reason": "CREDIT_LIMIT_EXCEEDED",
  "currentExposure": "4800.00",
  "creditLimit": "5000.00",
  "shortfall": "425.00",
  "requiresPrepayment": true
}
```

---

### **Test Case 110.4: Credit Limit Increase (Good Payment History)**

**Payment History:**
- 15 invoices paid
- Average 28 days to pay
- 0 late payments (>35 days)

**Expected New Limit:** $50,000 (perfect history)

**Algorithm:**
```
if (latePercent === 0 && avgDaysToPay <= 30):
  limit = $50,000
elif (latePercent < 20% && avgDaysToPay <= 40):
  limit = $20,000
elif (latePercent < 40%):
  limit = $5,000
else:
  limit = $0 (prepay only)
```

---

## ✅ **Success Criteria**

- [ ] New customers start at $0 limit
- [ ] Credit limit increases after 5+ paid invoices
- [ ] Good payers get higher limits
- [ ] Late payers limited or prepay only
- [ ] Exposure tracked accurately
- [ ] Limits enforced before posting

**Result:** PASS / FAIL

**Notes:**


