# TEST_204: UI - Customer My Loads Page

## 📋 **Test Information**
- **Feature**: Customer My Loads UI
- **Priority**: 🔴 CRITICAL
- **Page**: `web/src/pages/customer/CustomerMyLoadsPage.tsx`
- **Route**: `/customer/my-loads`
- **Authentication**: Required (Customer)

---

## 📝 **UI Elements to Test**

### **Filter/Tabs:**
- [ ] "All Loads" tab
- [ ] "Active" tab
- [ ] "Completed" tab
- [ ] "Cancelled" tab
- [ ] Tab counts update correctly

### **Load List Display:**
For each load card:
- [ ] Load ID
- [ ] Commodity
- [ ] Status badge (color-coded)
- [ ] Pickup location
- [ ] Delivery location
- [ ] Pickup date
- [ ] Rate and revenue
- [ ] Carrier name (if assigned)
- [ ] Bid count badge

### **Action Buttons (per load status):**

**POSTED loads:**
- [ ] "View Bids" button → shows bid modal
- [ ] "Cancel Load" button → cancels load

**ASSIGNED loads:**
- [ ] "View Carrier" button → carrier details
- [ ] "Message Carrier" button → messaging

**RELEASE_REQUESTED loads:** ⭐ **NEW!**
- [ ] "🚨 Issue Release" button (prominent, orange)
- [ ] Opens ReleaseConfirmationModal
- [ ] Badge shows "Action Required"

**RELEASED loads:**
- [ ] Release number displays
- [ ] "View Release Details" button

**IN_TRANSIT loads:**
- [ ] "Track Load" button → tracking page
- [ ] ETA displays

**DELIVERED loads:**
- [ ] "Mark Complete" button
- [ ] "View POD" button

**COMPLETED loads:**
- [ ] "View Invoice" button ⭐ NEW!
- [ ] "Download BOL" button
- [ ] "Rate Carrier" button

---

### **Bids Modal (when "View Bids" clicked):**
- [ ] List of all bids displays
- [ ] Carrier name, MC#, rating
- [ ] Bid amount (or "At Posted Rate")
- [ ] Message from carrier
- [ ] Time submitted
- [ ] "Accept Bid" button (per bid)
- [ ] "Reject Bid" button
- [ ] "Counter-Offer" button

### **Release Confirmation Modal:** ⭐ **NEW!**
- [ ] Opens when "Issue Release" clicked
- [ ] Shows load summary
- [ ] Material ready checkbox
- [ ] Quantity input
- [ ] Contact input
- [ ] Instructions textarea
- [ ] TONU acknowledgment checkbox (with calculated amount)
- [ ] Submit button (disabled until all checked)
- [ ] Cancel button
- [ ] Success message after submit
- [ ] Load status updates to RELEASED

---

## ✅ **Success Criteria**

- [ ] All tabs work
- [ ] All load statuses display correctly
- [ ] Correct buttons show for each status
- [ ] Bid modal works
- [ ] **Release modal works** ⭐ NEW!
- [ ] **TONU liability clearly displayed** ⭐
- [ ] Status updates reflect immediately
- [ ] Pagination works
- [ ] Search/filter works

**Result:** PASS / FAIL

**Notes:**


