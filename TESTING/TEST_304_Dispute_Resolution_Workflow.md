# TEST_304: Dispute Resolution Workflow
## Feature: Formal dispute process for TONU, delivery, and payment disputes

---

## 🎯 **Test Objective:**
Verify that disputes can be opened by customers or carriers, evidence can be submitted by both parties, admins can resolve disputes, and payments are processed based on resolution.

---

## 📋 **Dispute Process:**
1. **Open Dispute** (Customer or Carrier) - Load status → DISPUTED
2. **Submit Evidence** (48-hour window) - Both parties upload photos/documents
3. **Admin Reviews** (After 48 hours) - Admin examines all evidence
4. **Resolution** (Admin decision) - CUSTOMER_WINS, CARRIER_WINS, or SPLIT
5. **Payment Processing** - Based on resolution

---

## 🔄 **Test Workflow:**

### **Test 1: Customer Disputes TONU Claim**

**Scenario:** Carrier filed TONU claiming material not ready. Customer disputes.

1. **Setup:**
   - Carrier filed TONU on load
   - Load status: TONU
   - TONU amount: $200 to customer, $150 to carrier

2. **Customer Opens Dispute:**
   - Login as Customer
   - Navigate to load details
   - Click "Dispute TONU" button
   - Enter dispute reason: "Material WAS ready. Carrier arrived 3 hours late."
   - Upload evidence:
     - Photo of ready material with timestamp
     - Text messages to carrier
     - Site log showing material loaded at 8 AM
   - API Call: `POST /api/loads/:id/dispute/open`

**Expected Result:**
- ✅ Load status: TONU → DISPUTED
- ✅ Dispute opened timestamp recorded
- ✅ Evidence uploaded to dispute_evidence table
- ✅ Carrier notified via email: "Customer disputed your TONU claim"
- ✅ 48-hour evidence window starts
- ✅ Payment held (not processed) until resolution

**Verify in Database:**
```sql
SELECT status, dispute_reason, dispute_opened_at, dispute_opened_by
FROM loads WHERE id = '[load_id]';
-- status = 'DISPUTED'
-- dispute_reason should contain customer's reason

SELECT * FROM dispute_evidence WHERE load_id = '[load_id]';
-- Should have customer's initial evidence
-- submitter_role = 'CUSTOMER'
```

---

3. **Carrier Submits Counter-Evidence:**
   - Carrier receives email notification
   - Login as Carrier
   - Navigate to disputed load
   - Click "Submit Evidence" button
   - Upload evidence:
     - GPS trail showing arrival at 8:00 AM (on time)
     - Photo of truck at site at 8:05 AM
     - Text from shipper: "Material still processing, wait 2+ hours"
   - API Call: `POST /api/loads/:id/dispute/evidence`

**Expected Result:**
- ✅ Evidence added to dispute_evidence table
- ✅ submitter_role: CARRIER
- ✅ Customer notified: "Carrier submitted evidence"

**Verify in Database:**
```sql
SELECT COUNT(*) FROM dispute_evidence WHERE load_id = '[load_id]';
-- Should be 2 (customer + carrier evidence)

SELECT submitter_role FROM dispute_evidence WHERE load_id = '[load_id]';
-- Should have both 'CUSTOMER' and 'CARRIER'
```

---

4. **Admin Reviews and Resolves:**
   - Wait 48 hours OR admin reviews immediately
   - Login as Admin
   - Navigate to `/admin/disputes`
   - View all evidence from both parties:
     - Customer: Photos of ready material
     - Carrier: GPS trail + texts showing shipper delay
   - Admin decision: CARRIER_WINS (material was not ready)
   - Enter explanation: "GPS and text messages confirm carrier arrived on time. Shipper's material was not ready."
   - API Call: `POST /api/loads/:id/dispute/resolve`

**Request Body:**
```json
{
  "resolution": "CARRIER_WINS",
  "winner": "CARRIER",
  "explanation": "GPS and text messages confirm carrier arrived on time. Shipper's material was not ready."
}
```

**Expected Result:**
- ✅ Load status: DISPUTED → COMPLETED
- ✅ disputeResolution: "CARRIER_WINS"
- ✅ disputeWinner: "CARRIER"
- ✅ **Customer charged:** $200 TONU fee
- ✅ **Carrier paid:** $150 TONU compensation
- ✅ Both parties notified via email with resolution explanation

**Verify in Database:**
```sql
SELECT 
  status,
  dispute_resolved_at,
  dispute_resolved_by,
  dispute_resolution,
  dispute_winner
FROM loads WHERE id = '[load_id]';
-- status = 'COMPLETED'
-- dispute_resolution = 'CARRIER_WINS'

-- Check payments processed
SELECT status FROM invoices WHERE load_id = '[load_id]';
-- Should be 'PAID' (customer charged)

SELECT status FROM payouts WHERE load_id = '[load_id]';
-- Should be 'SENT' (carrier paid)
```

---

### **Test 2: Carrier Disputes Delivery Rejection**

**Scenario:** Customer refuses delivery claiming wrong material. Carrier disputes.

1. **Customer Opens Dispute:**
   - Load status: DELIVERED
   - Customer disputes: "Received sand instead of crushed limestone"
   - Upload photos of wrong material
   - API Call: `POST /api/loads/:id/dispute/open`

2. **Carrier Submits Evidence:**
   - Upload BOL showing "crushed limestone" signed by shipper
   - Upload photos at quarry showing correct material loaded
   - Upload delivery site photo showing same material unloaded

3. **Admin Resolves: SPLIT**
   - Both parties partially correct
   - Material was crushed limestone but wrong size (1.5" vs. 0.75")
   - Resolution: 50% payment
   - Customer pays $600 (50% of $1,200)
   - Carrier receives $300 (50% of payout)

**Expected Result:**
- ✅ disputeResolution: "SPLIT"
- ✅ Partial payment processed
- ✅ Both parties notified with explanation

---

### **Test 3: Customer Wins - Full Refund**
1. Customer disputes delivery quality
2. Upload photos of damaged material
3. Carrier cannot provide counter-evidence
4. Admin resolves: CUSTOMER_WINS
5. API Call: `POST /api/loads/:id/dispute/resolve`

**Expected Result:**
- ✅ disputeResolution: "CUSTOMER_WINS"
- ✅ **Customer refunded** (full amount)
- ✅ **Carrier receives $0**
- ✅ Both parties notified

**Verify in Stripe:**
- Refund created for full invoice amount
- No transfer to carrier

---

## ✅ **Success Criteria:**

- [ ] Dispute can be opened by customer or carrier
- [ ] Load status changes to DISPUTED
- [ ] Payment held during dispute (not processed)
- [ ] Both parties can submit evidence
- [ ] 48-hour evidence window enforced
- [ ] Admin can resolve with 3 options (CUSTOMER_WINS, CARRIER_WINS, SPLIT)
- [ ] Payment processed based on resolution
- [ ] Both parties notified with explanation
- [ ] Dispute evidence stored with timestamps
- [ ] Auto-escalation after 72 hours

---

## 🚨 **Edge Cases:**

### **EC1: Dispute Opened After Payment Captured**
- Customer already approved delivery (payment captured)
- Customer changes mind, opens dispute
- **Expected:** Dispute allowed, refund processed if customer wins

### **EC2: Multiple Evidence Submissions**
- Customer submits initial evidence
- Carrier submits counter-evidence
- Customer submits additional evidence (rebuttal)
- **Expected:** All evidence tracked, timestamped, viewable by admin

### **EC3: No Evidence Submitted**
- Dispute opened
- Neither party submits evidence
- 48 hours pass
- **Expected:** Auto-escalate to admin, default to status quo

### **EC4: Frivolous Disputes**
- Customer disputes every delivery to delay payment
- **Expected:** Track dispute rate, suspend if >20% of loads disputed

---

## 📊 **Performance Metrics:**

- **Dispute Rate:** % of loads disputed (target: <2%)
- **Resolution Time:** Time from dispute open to resolution (target: <72 hours)
- **Evidence Submission Rate:** % of disputes with evidence from both parties
- **Customer Win Rate:** % of disputes resolved in customer's favor
- **Carrier Win Rate:** % of disputes resolved in carrier's favor
- **Split Rate:** % of disputes resolved as split decision

---

**Status:** ✅ READY TO TEST
**Priority:** HIGH
**Estimated Time:** 60 minutes
**Last Updated:** October 10, 2025

