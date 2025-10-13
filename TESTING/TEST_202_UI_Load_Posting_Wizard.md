# TEST_202: UI - Load Posting Wizard (Complete Flow)

## 📋 **Test Information**
- **Feature**: Multi-Step Load Posting Wizard UI
- **Priority**: 🔴 CRITICAL
- **Page**: `web/src/pages/customer/LoadPostingWizard.tsx`
- **Route**: `/customer/post-load`
- **Authentication**: Required (Customer)

---

## 📝 **UI Elements to Test**

### **Step 1: Material Selection**
- [ ] Material type dropdown (Aggregate, Concrete, Equipment, etc.)
- [ ] Commodity details input
- [ ] Quantity input
- [ ] Quantity unit selector
- [ ] "Next" button enabled when fields valid

### **Step 2: Pickup Location**
- [ ] Address autocomplete works
- [ ] Pickup location name input
- [ ] Date picker for pickup date
- [ ] Time range selectors (start/end)
- [ ] "Previous" and "Next" buttons work

### **Step 3: Delivery Location**
- [ ] Delivery address autocomplete
- [ ] Delivery location name
- [ ] Date picker for delivery
- [ ] Time range selectors
- [ ] Distance auto-calculated and displayed ⭐
- [ ] Haul type badge shows (METRO/REGIONAL/OTR) ⭐

### **Step 4: Equipment & Rate**
- [ ] Equipment suggestions displayed ⭐ (AI-matched)
- [ ] Equipment type selector
- [ ] Rate mode selector (PER_TON, PER_YARD, etc.)
- [ ] Rate amount input
- [ ] Gross revenue auto-calculated and displayed ⭐

### **Step 5: Additional Details**
- [ ] Job code input
- [ ] PO number input
- [ ] Site name input
- [ ] Special instructions textarea
- [ ] Checkboxes:
  - [ ] Requires scale ticket
  - [ ] Requires permit
  - [ ] Prevailing wage job

### **Step 6: Review & Submit**
- [ ] All entered data displays in summary
- [ ] "Edit" buttons for each section
- [ ] Equipment match info shows (optimal/acceptable/unusual)
- [ ] Pricing breakdown shows
- [ ] "Post Load" button submits
- [ ] Success message displays
- [ ] Redirects to my loads or shows confirmation

### **Validation & Errors:**
- [ ] Required fields prevent next step
- [ ] Invalid data shows error messages
- [ ] API errors display properly
- [ ] Can navigate back through steps

---

## ✅ **Success Criteria**

- [ ] All 6 wizard steps work
- [ ] Equipment auto-matches correctly
- [ ] Distance auto-calculates
- [ ] Pricing auto-calculates
- [ ] Form validation works
- [ ] Can save as draft
- [ ] Can post immediately
- [ ] Load created in database
- [ ] Appears in my loads

**Result:** PASS / FAIL

**Notes:**


