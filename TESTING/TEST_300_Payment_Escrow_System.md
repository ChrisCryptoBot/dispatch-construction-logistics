# TEST_300: Payment Escrow System
## Feature: Authorize payment on RELEASED, capture on COMPLETED

---

## 🎯 **Test Objective:**
Verify that customer payment is authorized (held) when material is released, and only captured (charged) when load is completed and POD approved.

---

## 📋 **Prerequisites:**
- ✅ Customer account with valid payment method (card or ACH) saved in Stripe
- ✅ Carrier account with verified insurance
- ✅ Load in RELEASE_REQUESTED status

---

## 🔄 **Test Workflow:**

### **Step 1: Customer Issues Release**
1. Login as Customer
2. Navigate to `/customer/my-loads`
3. Find load in "RELEASE_REQUESTED" status
4. Click "Issue Release" button
5. Fill out release form:
   - ✅ Check "Material is ready NOW"
   - ✅ Check "I acknowledge TONU liability ($200)"
   - Quantity: "20 tons"
   - Site contact: "Tom Martinez (512) 555-0999"
   - Instructions: "Gate code #4521"
6. Click "Issue Release Number"

**Expected Result:**
- ✅ Success message: "Release issued successfully"
- ✅ Release number generated (RL-2025-XXXXX)
- ✅ Load status: RELEASED
- ✅ **Payment authorization message:** "$1,200 authorized (funds held in escrow)"

**Verify in Database:**
```sql
SELECT * FROM invoices WHERE load_id = '[load_id]';
-- status should be 'AUTHORIZED'
-- authorized_at should have timestamp
-- stripe_payment_intent_id should exist
```

**Verify in Stripe Dashboard:**
- Go to Stripe Dashboard → Payments
- Find PaymentIntent with id from database
- Status should be: "requires_capture"
- Amount: Held but not captured

---

### **Step 2: Carrier Completes Load**
1. Login as Carrier
2. Navigate to `/carrier/my-loads`
3. Find load in "RELEASED" status
4. Simulate pickup (upload BOL)
5. Mark status: "IN_TRANSIT"
6. Simulate delivery (upload POD with photos)
7. Mark status: "DELIVERED"

**Expected Result:**
- ✅ Load status: DELIVERED
- ✅ Customer receives notification: "Please review POD"
- ✅ Payment NOT captured yet (still held)

---

### **Step 3: Customer Reviews & Approves POD**
1. Login as Customer
2. Navigate to `/customer/my-loads`
3. Find load in "DELIVERED" status
4. Click "Review Delivery" button
5. View POD photo
6. Verify quantity matches (20 tons expected, 20 tons delivered)
7. Click "Approve Delivery & Process Payment"

**Expected Result:**
- ✅ Load status: PENDING_APPROVAL → COMPLETED
- ✅ Success message: "Payment captured and carrier payout initiated"
- ✅ **Payment captured from escrow**
- ✅ **Carrier payout created**

**Verify in Database:**
```sql
SELECT * FROM invoices WHERE load_id = '[load_id]';
-- status should be 'PAID'
-- paid_at should have timestamp

SELECT * FROM payouts WHERE load_id = '[load_id]';
-- status should be 'QUEUED' or 'PROCESSING'
-- amount_cents should equal (grossRevenue - platformFee)
```

**Verify in Stripe:**
- PaymentIntent status: "succeeded"
- Amount captured matches invoice amount
- Transfer created to carrier's Connect account

---

### **Step 4: Test Cancellation (Release Hold)**
1. Start new load with same steps 1-2
2. Instead of completing, customer cancels load
3. POST `/api/customer/loads/:id/cancel` with reason
4. Expected: Payment authorization cancelled

**Verify in Database:**
```sql
SELECT * FROM invoices WHERE load_id = '[load_id]';
-- status should be 'CANCELLED'
```

**Verify in Stripe:**
- PaymentIntent status: "canceled"
- Funds released back to customer

---

## ✅ **Success Criteria:**

- [ ] Payment authorized (held) when status → RELEASED
- [ ] Funds NOT captured until PENDING_APPROVAL
- [ ] Customer sees escrow hold message
- [ ] Payment captured only after POD review
- [ ] Carrier payout initiated after capture
- [ ] Cancellation releases held funds
- [ ] No charges if customer cancels before completion
- [ ] Stripe dashboard shows correct PaymentIntent flow

---

## 🚨 **Edge Cases to Test:**

### **EC1: Customer Has No Payment Method**
- Remove payment method from customer account
- Try to issue release
- **Expected:** Warning message but release still issued
- **Reason:** Don't block material release, but flag for manual payment

### **EC2: Payment Authorization Fails (Card Declined)**
- Use Stripe test card that declines: `4000 0000 0000 0341`
- Issue release
- **Expected:** Error message, release NOT issued
- **Reason:** Can't proceed without payment security

### **EC3: Auto-Approval After 48 Hours**
- Deliver load but customer doesn't approve
- Wait 48 hours (or trigger cron job manually)
- **Expected:** Load auto-approved, payment captured, payout initiated

### **EC4: Customer Cancels After Payment Authorized**
- Issue release (payment held)
- Customer cancels load
- **Expected:** Authorization cancelled, funds released

---

## 📊 **Performance Metrics:**

- **Authorization Time:** <2 seconds
- **Capture Time:** <2 seconds  
- **Cancellation Time:** <2 seconds
- **Stripe API Success Rate:** >99%

---

## 🐛 **Known Issues / Limitations:**

- Stripe test mode allows authorization but may have different behavior in production
- Customer must have saved payment method (prompted during onboarding)
- QuickPay option adds 3% fee (test both standard and quick pay)

---

**Status:** ✅ READY TO TEST
**Priority:** CRITICAL
**Last Updated:** October 10, 2025

