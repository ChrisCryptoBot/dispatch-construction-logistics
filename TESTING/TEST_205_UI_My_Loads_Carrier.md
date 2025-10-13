# TEST_205: UI - Carrier My Loads Page

## 📋 **Test Information**
- **Feature**: Carrier My Loads UI
- **Priority**: 🔴 CRITICAL
- **Page**: `web/src/pages/carrier/CarrierMyLoadsPage.tsx`
- **Route**: `/carrier/my-loads`
- **Authentication**: Required (Carrier)

---

## 📝 **UI Elements to Test**

### **Filter Tabs:**
- [ ] "Active" tab (ASSIGNED, RELEASE_REQUESTED, RELEASED, IN_TRANSIT)
- [ ] "Completed" tab
- [ ] "All" tab
- [ ] Tab counts accurate

### **Load Cards Display:**
- [ ] Load ID
- [ ] Commodity
- [ ] Status badge (color-coded)
- [ ] Customer name
- [ ] Pickup location (city/state only if not released)
- [ ] **Full address if RELEASED** ⭐ NEW!
- [ ] Pickup date
- [ ] Rate and revenue

### **Action Buttons (by status):**

**ASSIGNED loads:**
- [ ] "Accept Load" button
- [ ] Opens confirmation modal
- [ ] **Insurance check happens on submit** ⭐ NEW!
- [ ] Error if insurance invalid

**RELEASE_REQUESTED loads:** ⭐ **NEW!**
- [ ] **ReleaseStatusCard displays** with yellow banner
- [ ] Shows "Waiting for shipper confirmation"
- [ ] Pickup address HIDDEN
- [ ] No dispatch allowed

**RELEASED loads:** ⭐ **NEW!**
- [ ] **ReleaseStatusCard displays** with green banner
- [ ] **Release number prominently shown**
- [ ] **Full pickup address NOW VISIBLE**
- [ ] Contact person and phone shown
- [ ] Pickup instructions displayed
- [ ] Expiry countdown timer
- [ ] "Start Pickup" button (GPS ping)
- [ ] **"File TONU" button** (if material not ready)

**IN_TRANSIT loads:**
- [ ] "Update Location" button (GPS ping)
- [ ] "Arrived at Delivery" button
- [ ] ETA display
- [ ] Customer contact info

**DELIVERED loads:**
- [ ] "Upload POD" button
- [ ] "Upload BOL" button
- [ ] "Upload Scale Ticket" button (if required)
- [ ] Document upload modals work

**COMPLETED loads:**
- [ ] Payment status displays
- [ ] "View Payout" button ⭐ NEW!
- [ ] QuickPay option toggle (if available) ⭐ NEW!
- [ ] "Download Documents" button

---

### **TONU Filing Modal:** ⭐ **NEW!**
When "File TONU" clicked:
- [ ] Modal opens
- [ ] Reason textarea (required)
- [ ] Arrival time picker (required)
- [ ] Wait time input (minutes)
- [ ] Photo evidence upload (optional)
- [ ] TONU amount calculated and displayed
- [ ] Carrier payout shown (85% of TONU)
- [ ] Submit button
- [ ] Success confirmation
- [ ] Load status changes to TONU

---

## ✅ **Success Criteria**

**Core Functionality:**
- [ ] All tabs work
- [ ] Load cards display correctly
- [ ] Status-specific buttons show

**NEW Features:**
- [ ] **ReleaseStatusCard displays correctly** ⭐
- [ ] **Address hidden until RELEASED** ⭐
- [ ] **Release number shows when released** ⭐
- [ ] **TONU filing works** ⭐
- [ ] **Insurance check blocks acceptance** ⭐
- [ ] **Payout options display** ⭐

**Result:** PASS / FAIL

**Notes:**


