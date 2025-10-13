# TEST_203: UI - Carrier Load Board (Browse Loads)

## 📋 **Test Information**
- **Feature**: Carrier Load Board UI
- **Priority**: 🔴 CRITICAL
- **Page**: `web/src/pages/CarrierLoadBoardPage.tsx`
- **Route**: `/carrier/load-board`
- **Authentication**: Required (Carrier)

---

## 📝 **UI Elements to Test**

### **Filter Controls:**
- [ ] State filter dropdown
- [ ] Equipment type filter
- [ ] Haul type filter (Metro/Regional/OTR)
- [ ] Min rate slider/input
- [ ] Max distance slider/input
- [ ] Date range picker
- [ ] "Apply Filters" button
- [ ] "Clear Filters" button

### **Load Cards Display:**
- [ ] Load cards render with all details:
  - [ ] Commodity name
  - [ ] Pickup city/state
  - [ ] Delivery city/state
  - [ ] Distance (miles)
  - [ ] Rate ($/unit)
  - [ ] Gross revenue
  - [ ] Pickup date
  - [ ] Equipment type required
- [ ] Status badge shows "POSTED"
- [ ] Haul type badge (Metro/Regional/OTR)

### **Actions on Each Load:**
- [ ] "View Details" button → load details page
- [ ] "Submit Bid" button → opens bid modal
- [ ] "Express Interest" button (alternative)

### **Bid Modal (when opened):**
- [ ] Load summary displays
- [ ] Bid amount input (optional counter-offer)
- [ ] Message textarea
- [ ] Bid expiration dropdown
- [ ] "Submit Bid" button
- [ ] "Cancel" button closes modal

### **Pagination:**
- [ ] Page numbers display
- [ ] "Previous" button (disabled on page 1)
- [ ] "Next" button
- [ ] Page size selector (10/20/50 per page)
- [ ] Total count displays

### **Search:**
- [ ] Search bar filters loads
- [ ] Search by commodity name
- [ ] Search by location
- [ ] Search updates instantly

### **Sorting:**
- [ ] Sort by pickup date
- [ ] Sort by rate
- [ ] Sort by distance
- [ ] Sort order toggle (asc/desc)

---

## ✅ **Success Criteria**

- [ ] All filters work correctly
- [ ] Load cards display all info
- [ ] Bid submission works
- [ ] Pagination works
- [ ] Search works
- [ ] Sorting works
- [ ] Real-time updates (when load assigned, disappears)

**Result:** PASS / FAIL

**Notes:**


