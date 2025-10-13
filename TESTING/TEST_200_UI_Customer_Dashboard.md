# TEST_200: UI - Customer Dashboard Page

## 📋 **Test Information**
- **Feature**: Customer Dashboard UI
- **Priority**: 🔴 CRITICAL
- **Page**: `web/src/pages/customer/CustomerDashboard.tsx`
- **Route**: `/customer/dashboard`
- **Authentication**: Required (Customer only)

---

## 🎯 **Test Objective**
Test every button, link, and interactive element on customer dashboard.

---

## 📝 **UI Elements to Test**

### **Dashboard Stats Cards:**
- [ ] Active Loads count displays
- [ ] Completed This Month count displays
- [ ] Total Spend displays
- [ ] Average Delivery Time displays

### **Quick Actions:**
- [ ] "Post New Load" button → navigates to load wizard
- [ ] "View All Loads" button → navigates to my loads
- [ ] "Track Shipments" button → navigates to tracking

### **Recent Loads List:**
- [ ] Load cards display with correct data
- [ ] "View Details" button → navigates to load details
- [ ] "Track" button → navigates to tracking
- [ ] Status badges show correct colors

### **Notifications Section:**
- [ ] "Action Required" alerts display for RELEASE_REQUESTED loads
- [ ] "Issue Release" button opens ReleaseConfirmationModal
- [ ] Notification count badge updates

### **Navigation:**
- [ ] Sidebar menu items work
- [ ] Profile dropdown works
- [ ] Logout button works
- [ ] Role switcher (if BOTH type)

---

## ✅ **Success Criteria**

- [ ] All stats load correctly
- [ ] All buttons navigate properly
- [ ] No console errors
- [ ] Data refreshes correctly
- [ ] Loading states show
- [ ] Error handling works

**Result:** PASS / FAIL

**Notes:**


