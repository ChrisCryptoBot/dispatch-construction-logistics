# TEST_201: UI - Carrier Dashboard Page

## 📋 **Test Information**
- **Feature**: Carrier Dashboard UI
- **Priority**: 🔴 CRITICAL
- **Page**: `web/src/pages/carrier/CarrierDashboard.tsx`
- **Route**: `/carrier/dashboard`
- **Authentication**: Required (Carrier only)

---

## 📝 **UI Elements to Test**

### **Dashboard Stats:**
- [ ] Active Loads count
- [ ] Available Loads count
- [ ] Completed This Month count
- [ ] Revenue This Month
- [ ] Pending Bids count

### **Quick Actions:**
- [ ] "Browse Loads" button → load board
- [ ] "My Active Loads" button → my loads
- [ ] "Submit Documents" button → documents page

### **Performance Score Display:**
- [ ] Score displays (0-100)
- [ ] Tier badge (Bronze/Silver/Gold) ⭐ NEW!
- [ ] On-time rate %
- [ ] Doc accuracy rate %

### **Insurance Alerts:** ⭐ NEW!
- [ ] Expiring insurance warning shows
- [ ] "Renew Now" button → insurance page
- [ ] Days until expiry shown

### **FMCSA Status:** ⭐ NEW!
- [ ] Verification status badge
- [ ] "Verify Now" button if not verified
- [ ] Safety rating display

---

## ✅ **Success Criteria**

- [ ] All stats accurate
- [ ] Performance score displays
- [ ] Insurance alerts work
- [ ] All buttons functional
- [ ] NEW features integrated

**Result:** PASS / FAIL

**Notes:**


