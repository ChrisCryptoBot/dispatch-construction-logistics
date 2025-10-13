# TEST_302: Customer Cancellation with Fees
## Feature: Customer can cancel loads with appropriate fees based on status

---

## 🎯 **Test Objective:**
Verify that customers can cancel loads at various stages, fees are calculated correctly, carriers are compensated if applicable, and payment authorizations are released.

---

## 📋 **Cancellation Fee Schedule:**
| Load Status | Cancellation Fee | Carrier Compensation | Notes |
|-------------|------------------|----------------------|-------|
| DRAFT | $0 | $0 | Free cancellation |
| POSTED | $0 | $0 | Free before acceptance |
| ACCEPTED | $50 | $0 | Admin fee |
| RELEASE_REQUESTED | $50 | $0 | Admin fee |
| RELEASED | $200 | $150 | Full TONU |
| IN_TRANSIT | Not allowed | - | Emergency support only |
| DELIVERED+ | Not allowed | - | Cannot cancel |

---

## 🔄 **Test Workflow:**

### **Test 1: Cancel in DRAFT Status**
1. Login as Customer
2. Create new load (don't post to marketplace)
3. Load status: DRAFT
4. Click "Cancel Load" button
5. Enter reason: "Project postponed"
6. API Call: `POST /api/customer/loads/:id/cancel`

**Expected Result:**
- ✅ Load status: CANCELLED
- ✅ Cancellation fee: $0
- ✅ Message: "Load cancelled successfully. No fee."

**Verify in Database:**
```sql
SELECT status, cancellation_fee, cancelled_by, cancellation_type 
FROM loads WHERE id = '[load_id]';
-- status = 'CANCELLED'
-- cancellation_fee = 0
-- cancellation_type = 'CUSTOMER'
```

---

### **Test 2: Cancel in POSTED Status**
1. Post load to marketplace
2. Load status: POSTED (no carrier assigned yet)
3. Cancel load with reason
4. API Call: `POST /api/customer/loads/:id/cancel`

**Expected Result:**
- ✅ Load status: CANCELLED
- ✅ Cancellation fee: $0
- ✅ No carrier compensation (none assigned)

---

### **Test 3: Cancel in ACCEPTED Status**
1. Carrier accepts load
2. Load status: ACCEPTED
3. Customer cancels before material release
4. API Call: `POST /api/customer/loads/:id/cancel`

**Expected Result:**
- ✅ Load status: CANCELLED
- ✅ **Cancellation fee: $50** (admin fee)
- ✅ Carrier compensation: $0
- ✅ Carrier notified via email
- ✅ Customer charged $50 cancellation fee

**Verify in Database:**
```sql
SELECT cancellation_fee FROM loads WHERE id = '[load_id]';
-- Should be 50.00

-- Check if fee was charged (may be in separate cancellation invoice)
```

**Verify in Stripe:**
- Charge created for $50 cancellation fee
- Description: "Cancellation fee for Load #12345"

---

### **Test 4: Cancel in RELEASED Status (Full TONU)**
1. Customer issues release (payment authorized)
2. Load status: RELEASED
3. Before carrier picks up, customer cancels
4. Reason: "Material no longer needed"
5. API Call: `POST /api/customer/loads/:id/cancel`

**Expected Result:**
- ✅ Load status: CANCELLED
- ✅ **Cancellation fee: $200** (full TONU)
- ✅ **Carrier compensation: $150**
- ✅ Payment authorization cancelled (original escrow released)
- ✅ Customer charged $200 cancellation fee
- ✅ Carrier paid $150 for wasted trip
- ✅ Platform keeps $50

**Verify in Database:**
```sql
SELECT cancellation_fee FROM loads WHERE id = '[load_id]';
-- Should be 200.00

SELECT status FROM invoices WHERE load_id = '[load_id]';
-- Should be 'CANCELLED' (original authorization)

-- Check for cancellation fee charge
-- Check for carrier compensation payout
```

**Verify in Stripe:**
- Original PaymentIntent: cancelled
- New charge: $200 cancellation fee
- Transfer to carrier: $150

---

### **Test 5: Cannot Cancel IN_TRANSIT**
1. Load in IN_TRANSIT status
2. Customer tries to cancel
3. API Call: `POST /api/customer/loads/:id/cancel`

**Expected Result:**
- ✅ Error 400
- ✅ Message: "Cannot cancel load in IN_TRANSIT status. Contact emergency support."
- ✅ Emergency phone displayed: "(512) 555-HELP"
- ✅ Load status unchanged

---

### **Test 6: Cannot Cancel DELIVERED/COMPLETED**
1. Load status: DELIVERED or COMPLETED
2. Customer tries to cancel
3. API Call: `POST /api/customer/loads/:id/cancel`

**Expected Result:**
- ✅ Error 400
- ✅ Message: "Cannot cancel load in DELIVERED status."
- ✅ Prompt to open dispute instead

---

## ✅ **Success Criteria:**

- [ ] DRAFT cancellation: $0 fee
- [ ] POSTED cancellation: $0 fee
- [ ] ACCEPTED cancellation: $50 fee charged
- [ ] RELEASED cancellation: $200 fee, $150 to carrier
- [ ] IN_TRANSIT: Cannot cancel (emergency support message)
- [ ] DELIVERED+: Cannot cancel (dispute process)
- [ ] Payment authorization released on cancellation
- [ ] Carrier notified of cancellation
- [ ] Fees processed through Stripe correctly

---

## 🚨 **Edge Cases:**

### **EC1: Customer Cancels Multiple Times**
- Create 5 loads
- Cancel all before acceptance
- **Expected:** No fees, no penalties (valid use case)

### **EC2: Customer Cancels After Release Then Disputes Fee**
- Cancel in RELEASED status ($200 fee)
- Customer disputes the cancellation fee
- **Expected:** Dispute process available

### **EC3: Carrier Already En Route When Cancelled**
- Load status: RELEASED
- Carrier GPS shows en route to pickup
- Customer cancels
- **Expected:** $200 fee still charged, $150 to carrier

### **EC4: Payment Method Fails for Cancellation Fee**
- Cancel in ACCEPTED status ($50 fee)
- Customer's card declines
- **Expected:** Fee still recorded, collections process triggered

---

## 📊 **Performance Metrics:**

- **Cancellation Time:** <3 seconds
- **Email Notification Time:** <10 seconds
- **Fee Charge Success Rate:** >98%
- **Carrier Compensation Success Rate:** >98%

---

**Status:** ✅ READY TO TEST
**Priority:** HIGH
**Estimated Time:** 45 minutes
**Last Updated:** October 10, 2025

