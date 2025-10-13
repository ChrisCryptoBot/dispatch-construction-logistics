# TEST_303: Carrier Cancellation with Penalties
## Feature: Carrier can cancel loads with penalties and suspension for high cancellation rates

---

## 🎯 **Test Objective:**
Verify that carriers can cancel loads when needed, penalties are applied for late cancellations, loads are reposted, and carriers are suspended if cancellation rate exceeds 10%.

---

## 📋 **Carrier Cancellation Rules:**
| Time Until Pickup | Penalty | Tracked in Profile | Auto-Suspend |
|-------------------|---------|-------------------|--------------|
| >24 hours | $0 | ✅ Yes | No |
| <24 hours | $100 | ✅ Yes | If rate >10% |
| <2 hours | Not allowed | - | Emergency only |

---

## 🔄 **Test Workflow:**

### **Test 1: Carrier Cancels >24 Hours Before Pickup**
1. Login as Carrier
2. Navigate to `/carrier/my-loads`
3. Find load in "ACCEPTED" status
4. Pickup date: Tomorrow (>24 hours away)
5. Click "Cancel Load" button
6. Enter reason: "Truck breakdown - need repairs"
7. API Call: `POST /api/carrier/loads/:id/cancel`

**Expected Result:**
- ✅ Load status: CANCELLED → POSTED (reposted to marketplace)
- ✅ Penalty: $0 (more than 24 hours notice)
- ✅ Cancellation count incremented in carrier profile
- ✅ Load reposted for other carriers
- ✅ Customer notified via email
- ✅ Warning message: "Cancellation rate: X% (limit: 10%)"

**Verify in Database:**
```sql
SELECT 
  status,
  carrier_id,
  cancelled_by,
  cancellation_type
FROM loads WHERE id = '[load_id]';
-- status should be 'POSTED' (reposted)
-- carrier_id should be NULL (unassigned)

SELECT cancellation_count, loads_count 
FROM carrier_profiles WHERE org_id = '[carrier_org_id]';
-- cancellation_count should increment
-- Calculate rate: cancellation_count / loads_count
```

---

### **Test 2: Carrier Cancels <24 Hours Before Pickup**
1. Load in "ACCEPTED" status
2. Pickup date: Tomorrow 10 AM (current time: Today 11 AM = 23 hours)
3. Carrier cancels with reason: "Driver called in sick"
4. API Call: `POST /api/carrier/loads/:id/cancel`

**Expected Result:**
- ✅ Load status: CANCELLED → POSTED
- ✅ **Penalty: $100** (late cancellation)
- ✅ Cancellation count incremented
- ✅ Load reposted to marketplace
- ✅ Customer notified
- ✅ Penalty logged (deducted from future earnings)

**Verify in Database:**
```sql
-- Check that penalty is logged
-- (Implementation may vary: immediate charge or future deduction)
```

---

### **Test 3: High Cancellation Rate → Auto-Suspension**
1. Carrier has completed 9 loads, cancelled 0
2. Cancellation rate: 0%
3. Carrier accepts 10th load, cancels it
4. Cancellation rate: 1/10 = 10%
5. Carrier accepts 11th load, cancels it
6. Cancellation rate: 2/11 = 18.2% (>10% threshold)
7. API Call: `POST /api/carrier/loads/:id/cancel`

**Expected Result:**
- ✅ Load cancelled and reposted
- ✅ Carrier account **SUSPENDED**
- ✅ organization.active = false
- ✅ Message: "Your account has been suspended due to high cancellation rate (18.2%). Limit is 10%."
- ✅ Carrier cannot accept new loads
- ✅ Admin notified for manual review

**Verify in Database:**
```sql
SELECT active FROM organizations WHERE id = '[carrier_org_id]';
-- Should be false (suspended)

SELECT cancellation_count, loads_count 
FROM carrier_profiles WHERE org_id = '[carrier_org_id]';
-- cancellation_count / loads_count should be >0.10
```

**UI Verification:**
- Carrier tries to accept another load
- **Expected:** Error "Account suspended. Contact support."

---

### **Test 4: Cannot Cancel IN_TRANSIT**
1. Load status: IN_TRANSIT
2. Carrier tries to cancel
3. API Call: `POST /api/carrier/loads/:id/cancel`

**Expected Result:**
- ✅ Error 400
- ✅ Message: "Cannot cancel load in IN_TRANSIT status. Contact emergency support."
- ✅ Emergency phone: "(512) 555-HELP"

---

### **Test 5: Load Reposted to Marketplace**
1. Carrier cancels load in ACCEPTED status
2. Load reposted to marketplace
3. Different carrier views load board
4. API Call: `GET /api/marketplace/loads`

**Expected Result:**
- ✅ Cancelled load appears in load board
- ✅ Load status: POSTED
- ✅ carrierId: null (unassigned)
- ✅ assignedAt: null
- ✅ No history of previous carrier visible

---

## ✅ **Success Criteria:**

- [ ] Carrier can cancel before IN_TRANSIT
- [ ] >24hr cancellation: $0 penalty
- [ ] <24hr cancellation: $100 penalty
- [ ] Cancellation rate tracked accurately
- [ ] Auto-suspension at >10% rate
- [ ] Load reposted to marketplace
- [ ] Customer notified of cancellation
- [ ] Cannot cancel IN_TRANSIT or later
- [ ] Emergency support message for blocked cancellations

---

## 🚨 **Edge Cases:**

### **EC1: Carrier Cancels Immediately After Accepting**
- Carrier accepts load
- Within 1 minute, carrier cancels
- **Test:** Is this allowed? Should there be a grace period?

### **EC2: Legitimate Emergency (Truck Breakdown)**
- Carrier has 0% cancellation rate (reliable carrier)
- Cancels <24hrs due to truck breakdown
- **Expected:** Still $100 penalty, but admin review available

### **EC3: Carrier Suspended, Has Active Loads**
- Carrier gets suspended for >10% cancellation rate
- Still has 3 active loads IN_TRANSIT
- **Expected:** Can complete existing loads, cannot accept new ones

### **EC4: Multiple Carrier Cancellations on Same Load**
- Carrier A accepts, cancels
- Load reposted
- Carrier B accepts, cancels
- **Expected:** Both tracked separately, load reposted twice

---

## 📊 **Performance Metrics:**

- **Cancellation Rate by Carrier:** Track in carrier_profiles
- **Average Cancellation Time:** Time from acceptance to cancellation
- **Repost Success Rate:** % of cancelled loads that get reassigned
- **Suspension Rate:** % of carriers suspended (target: <1%)

---

**Status:** ✅ READY TO TEST
**Priority:** HIGH
**Estimated Time:** 45 minutes
**Last Updated:** October 10, 2025

