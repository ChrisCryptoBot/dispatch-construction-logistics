# TEST_301: POD Approval Before Payment
## Feature: Customer must review and approve POD before payment is captured

---

## 🎯 **Test Objective:**
Verify that payments are NOT processed until customer reviews the Proof of Delivery and approves it. Prevent automatic charges for disputed or incorrect deliveries.

---

## 📋 **Prerequisites:**
- ✅ Load completed through release → pickup → delivery
- ✅ POD uploaded by carrier
- ✅ Payment authorized (held in escrow)
- ✅ Load status: DELIVERED

---

## 🔄 **Test Workflow:**

### **Step 1: Carrier Marks Load as Delivered**
1. Login as Carrier
2. Navigate to `/carrier/my-loads`
3. Find load in "IN_TRANSIT" status
4. Upload POD (photo of signed delivery ticket)
5. Click "Mark as Delivered"
6. API Call: `PATCH /api/loads/:id/status` with `status: 'DELIVERED'`

**Expected Result:**
- ✅ Load status: DELIVERED
- ✅ Customer receives email: "Please review POD for Load #12345"
- ✅ Payment still in AUTHORIZED state (NOT captured yet)
- ✅ Carrier sees: "Awaiting customer approval"

**Verify in Database:**
```sql
SELECT status FROM loads WHERE id = '[load_id]';
-- Should be 'DELIVERED', not 'COMPLETED'

SELECT status FROM invoices WHERE load_id = '[load_id]';
-- Should be 'AUTHORIZED', not 'PAID'
```

---

### **Step 2: Customer Reviews POD**
1. Login as Customer
2. Navigate to `/customer/my-loads`
3. Find load in "DELIVERED" status
4. Click "Review Delivery" button
5. POD Review Modal opens:
   - View uploaded POD photo
   - See expected vs. actual quantity
   - Expected: 20 tons
   - Delivered: 20 tons (from POD)
   - Material condition: Good

**Expected UI:**
```
┌─────────────────────────────────────┐
│ Review Proof of Delivery            │
├─────────────────────────────────────┤
│ [POD Photo]                         │
│                                     │
│ Expected Quantity: 20 tons          │
│ Delivered Quantity: 20 tons ✅      │
│ Condition: Good                     │
│                                     │
│ [✅ Approve Delivery & Process      │
│     Payment]                        │
│                                     │
│ [⚠️ Dispute Delivery]               │
│                                     │
│ Note: Auto-approves in 47 hours    │
└─────────────────────────────────────┘
```

---

### **Step 3: Customer Approves Delivery**
1. Click "✅ Approve Delivery & Process Payment" button
2. API Call: `PATCH /api/loads/:id/status` with `status: 'PENDING_APPROVAL', podApproved: true`

**Expected Result:**
- ✅ Load status: PENDING_APPROVAL → COMPLETED
- ✅ Payment **CAPTURED** from escrow
- ✅ Carrier payout **INITIATED**
- ✅ Success message: "Payment processed successfully"

**Verify in Database:**
```sql
SELECT 
  l.status,
  l.pod_approved_at,
  l.pod_approved_by,
  i.status as invoice_status,
  i.paid_at,
  p.status as payout_status
FROM loads l
LEFT JOIN invoices i ON i.load_id = l.id
LEFT JOIN payouts p ON p.load_id = l.id
WHERE l.id = '[load_id]';

-- status should be 'COMPLETED'
-- pod_approved_at should have timestamp
-- pod_approved_by should be customer user_id
-- invoice_status should be 'PAID'
-- paid_at should have timestamp
-- payout_status should be 'QUEUED' or 'SENT'
```

**Verify in Stripe:**
- PaymentIntent status: "succeeded"
- Charge amount matches invoice
- Transfer to carrier initiated

---

### **Step 4: Test Auto-Approval After 48 Hours**
1. Complete steps 1-2 (get load to DELIVERED status)
2. Customer does NOT approve
3. Wait 48 hours OR trigger cron job manually:
   ```javascript
   // In src/workers/cronJobs.js
   cronJobs.autoApproveDeliveries()
   ```
4. Cron job should:
   - Find loads in DELIVERED status >48 hours
   - Auto-approve them
   - Capture payment
   - Process payout

**Expected Result:**
- ✅ Load status: DELIVERED → COMPLETED
- ✅ autoApproved: true
- ✅ Payment captured automatically
- ✅ Carrier payout initiated
- ✅ Customer receives email: "Delivery auto-approved"

**Verify in Database:**
```sql
SELECT auto_approved FROM loads WHERE id = '[load_id]';
-- Should be true
```

---

### **Step 5: Test Customer Disputes Delivery**
1. Complete steps 1-2 (get load to DELIVERED status)
2. Customer clicks "⚠️ Dispute Delivery" instead of approving
3. Dispute modal opens
4. Customer enters:
   - Reason: "Wrong material delivered - ordered crushed limestone, received sand"
   - Upload photos of wrong material
5. Click "Submit Dispute"
6. API Call: `POST /api/loads/:id/dispute/open`

**Expected Result:**
- ✅ Load status: DISPUTED
- ✅ Payment remains in AUTHORIZED state (NOT captured)
- ✅ Carrier notified of dispute
- ✅ 48-hour evidence submission window starts
- ✅ Carrier can submit counter-evidence

**Verify in Database:**
```sql
SELECT status, dispute_reason, dispute_opened_at FROM loads WHERE id = '[load_id]';
-- status should be 'DISPUTED'

SELECT * FROM dispute_evidence WHERE load_id = '[load_id]';
-- Should have customer's initial evidence

SELECT status FROM invoices WHERE load_id = '[load_id]';
-- Should still be 'AUTHORIZED' (not captured during dispute)
```

---

## ✅ **Success Criteria:**

- [ ] Payment NOT captured when status = DELIVERED
- [ ] Customer sees "Review POD" prompt
- [ ] Approve button triggers PENDING_APPROVAL → COMPLETED
- [ ] Payment captured only after approval
- [ ] Auto-approval works after 48 hours
- [ ] Dispute blocks payment capture
- [ ] Payment stays in escrow during dispute
- [ ] No carrier payout until payment captured

---

## 🚨 **Edge Cases:**

### **EC1: Quantity Variance**
- Expected: 20 tons
- Delivered: 15 tons (75%)
- **Test:** Does system flag variance >10%?
- **Expected:** Manual review required, prorated payment

### **EC2: Multiple POD Photos**
- Carrier uploads 3 POD photos
- Customer reviews all 3
- **Expected:** All photos viewable in review modal

### **EC3: POD Upload Fails**
- Carrier tries to mark delivered without POD
- **Expected:** Error "POD upload required"

### **EC4: Customer Approves Then Disputes**
- Customer approves (payment captured)
- Customer changes mind, opens dispute
- **Expected:** Dispute still possible, requires refund process

---

## 📊 **Performance Metrics:**

- **POD Review Time:** Time from DELIVERED to customer approval (target: <24 hours)
- **Auto-Approval Rate:** % of loads auto-approved (high rate = customers not engaged)
- **Dispute Rate:** % of loads disputed (target: <2%)
- **Payment Capture Success Rate:** >99%

---

## 🎬 **Test Data:**

**Customer Credentials:**
- Email: customer@test.com
- Password: TestPass123!

**Carrier Credentials:**
- Email: carrier@test.com
- Password: TestPass123!

**Load Details:**
- Commodity: Crushed Limestone
- Quantity: 20 tons
- Rate: $60/ton
- Total: $1,200

**Stripe Test Cards:**
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0341`
- Requires Auth: `4000 0025 0000 3155`

---

**Status:** ✅ READY TO TEST
**Priority:** CRITICAL
**Estimated Time:** 30 minutes
**Last Updated:** October 10, 2025

