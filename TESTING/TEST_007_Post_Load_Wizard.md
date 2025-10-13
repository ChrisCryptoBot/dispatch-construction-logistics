# TEST 007: Post Load Wizard (7-Step Complete Flow)

**Category:** Load Management - Customer  
**Priority:** Critical  
**Estimated Time:** 10 minutes  
**Dependencies:** TEST_004 (Customer must be logged in)  

---

## 🎯 **TEST OBJECTIVE**

Verify the complete 7-step Load Posting Wizard works end-to-end with all 13 new fields.

---

## 📋 **PRE-REQUISITES**

- [ ] Logged in as customer
- [ ] On Customer Dashboard
- [ ] Browser console open (F12) to check for errors

---

## 🔧 **TEST STEPS**

### **STEP 1: Material & Commodity**

- [ ] Click "Post New Load" button
- [ ] Load Posting Wizard opens
- [ ] Progress indicator shows "Step 1 of 7"

#### **1.1: Select Material**
- [ ] Click material type: "Aggregates (Crushed Stone, Gravel)"
- [ ] Material card highlights with primary color
- [ ] Equipment recommendation appears

#### **1.2: Enter Commodity Details**
- [ ] Enter commodity: `3/4 inch crushed stone`
- [ ] Enter quantity: `25`
- [ ] Select unit: `Tons`
- [ ] Enter piece count: `150` (NEW FIELD ✅)

#### **1.3: Select Equipment**
- [ ] Equipment options appear (End Dump, Transfer Dump)
- [ ] Click "End Dump" (NEW FIELD ✅)
- [ ] Selection highlights

**Expected Result:** Step 1 complete, "Next" button enabled

- [ ] Click "Next" button
- [ ] Progress indicator shows "Step 2 of 7"

---

### **STEP 2: Locations & Contacts**

#### **2.1: Pickup Location**
- [ ] Enter pickup location name: `Acme Quarry North`
- [ ] Enter pickup address: `123 Quarry Rd, Dallas, TX 75001`

#### **2.2: Pickup Contact** (NEW SECTION ✅)
- [ ] Enter pickup contact name: `John Smith`
- [ ] Enter pickup contact phone: `(555) 123-4567`
- [ ] Contact card displays properly

#### **2.3: Delivery Location**
- [ ] Enter delivery location name: `I-35 Bridge Project`
- [ ] Enter delivery address: `456 Construction Site, Dallas, TX 75002`

#### **2.4: Delivery Contact** (NEW SECTION ✅)
- [ ] Enter delivery contact name: `Jane Doe`
- [ ] Enter delivery contact phone: `(555) 987-6543`
- [ ] Contact card displays properly

**Expected Result:** Estimated distance calculated and shown

- [ ] Distance shows (e.g., "28 miles")
- [ ] Haul type detected (e.g., "Metro/Zone haul")
- [ ] Click "Next" button

---

### **STEP 3: Schedule & Time Windows**

#### **3.1: Pickup Schedule**
- [ ] Select pickup date: `[Tomorrow's date]`
- [ ] Enter pickup start time: `08:00`
- [ ] Enter pickup end time: `10:00`

#### **3.2: Estimated Loading Time** (NEW FIELD ✅)
- [ ] Enter loading time: `30` minutes

#### **3.3: Delivery Schedule**
- [ ] Select delivery date: `[Tomorrow's date]`
- [ ] Enter delivery start time: `14:00`
- [ ] Enter delivery end time: `16:00`

#### **3.4: Estimated Unloading Time** (NEW FIELD ✅)
- [ ] Enter unloading time: `30` minutes

**Expected Result:** Total estimated time calculates (60 minutes)

- [ ] Total time displays correctly
- [ ] Click "Next" button

---

### **STEP 4: Requirements & Compliance**

- [ ] Toggle "Requires Scale Ticket": ON
- [ ] Toggle "Requires Permit": OFF
- [ ] Toggle "Prevailing Wage": OFF
- [ ] Enter special instructions: `Call 30 minutes before arrival`

**Expected Result:** Toggles work, instructions field accepts text

- [ ] Click "Next" button

---

### **STEP 5: Pricing & Payment**

#### **5.1: Rate Mode**
- [ ] Select rate mode: "Per Ton"
- [ ] Card highlights

#### **5.2: Rate Amount**
- [ ] Enter rate: `45.00`
- [ ] Estimated total calculates: `$1,125.00` (25 tons × $45)

#### **5.3: Payment Terms** (NEW SECTION ✅)
- [ ] Select payment terms: "Net 30 Days"
- [ ] Card highlights

#### **5.4: Quick Pay** (NEW FIELD ✅)
- [ ] Check "Quick Pay Available" checkbox
- [ ] Description shows "2% discount for 3-day payment"

#### **5.5: Load Priority** (NEW FIELD ✅)
- [ ] Select priority: "High Priority"
- [ ] Card changes to warning color (orange)

**Expected Result:** All payment settings saved

- [ ] Click "Next" button

---

### **STEP 6: Accessorial Services** (NEW STEP ✅)

- [ ] Informational banner displays explanation
- [ ] Check "May Require Detention"
  - [ ] Shows: "$60/hour after 2 hours (Platform 25%, Carrier 75%)"
- [ ] Check "May Require Layover"
  - [ ] Shows: "$250/day (Platform 25%, Carrier 75%)"
- [ ] Set stop-off count to `2` using +/- buttons
  - [ ] Counter shows "2"
  - [ ] Shows: "$50 per additional stop"
- [ ] Check "Driver Assist Required"

**Expected Result:** All accessorial options selectable

- [ ] Click "Next" button

---

### **STEP 7: Job Details & Review**

#### **7.1: Auto-Generated Identifiers** (NEW SECTION ✅)
- [ ] BOL Number displays (e.g., `BOL-20251009-1234`)
- [ ] Load ID displays (e.g., `LOAD-ABC123`)
- [ ] Green banner with checkmark shows

#### **7.2: Job Details**
- [ ] Enter job code: `Highway-35-Project` (optional)
- [ ] Description shows: "Your accounting/project code"
- [ ] Enter site name: `I-35 Bridge Project Site B`

#### **7.3: Review Summary**
- [ ] Load summary displays all entered data:
  - [ ] Material: Aggregates
  - [ ] Quantity: 25 Tons
  - [ ] Piece Count: 150
  - [ ] Equipment: End Dump
  - [ ] Pickup: Dallas, TX
  - [ ] Pickup Contact: John Smith
  - [ ] Delivery: Dallas, TX
  - [ ] Delivery Contact: Jane Doe
  - [ ] Rate: $45.00/ton
  - [ ] Total: $1,125.00
  - [ ] Payment: Net 30, Quick Pay available
  - [ ] Priority: High
  - [ ] Accessorials: Detention, Layover, 2 Stop-offs, Driver Assist

**Expected Result:** All data displays correctly in summary

---

### **STEP 8: Submit Load**

- [ ] Click "Post Load to Board" button
- [ ] Loading indicator appears
- [ ] Success message displays
- [ ] Redirects to "My Loads" page

**Expected Result:** Load appears in "Posted Loads" section

---

### **STEP 9: Verify Load on Load Board**

- [ ] Switch to Carrier view (profile dropdown)
- [ ] Navigate to "Load Board"
- [ ] Find the load you just posted
- [ ] Verify details are correct (city-only for security)

**Expected Result:** Load visible on carrier load board

---

## ✅ **PASS/FAIL CRITERIA**

### **PASS** ✅ **IF:**
- [ ] All 7 steps complete without errors
- [ ] All 13 new fields work correctly
- [ ] Data persists between steps
- [ ] BOL # auto-generated
- [ ] Load ID auto-generated
- [ ] Summary shows all data
- [ ] Load posted successfully
- [ ] Load appears on Load Board
- [ ] No console errors
- [ ] "Save as Draft" works at any step

### **FAIL** ❌ **IF:**
- [ ] Any step crashes or errors
- [ ] Data lost between steps
- [ ] Fields don't accept input
- [ ] Submit fails
- [ ] Load doesn't appear on board
- [ ] Console errors
- [ ] Draft save doesn't work

---

## 📸 **SCREENSHOTS TO CAPTURE**

1. Step 1: Material selection
2. Step 2: Locations & Contacts (NEW)
3. Step 3: Schedule & Time (NEW)
4. Step 5: Payment & Priority (NEW)
5. Step 6: Accessorial Services (NEW STEP)
6. Step 7: Auto-generated BOL# and Load ID (NEW)
7. Step 7: Complete summary
8. Success message
9. Load on "My Loads" page
10. Load on "Load Board" (carrier view)

**Save in:** `TESTING/screenshots/TEST_007/`

---

## 🐛 **ISSUES FOUND**

### **Critical Issues:**
- 

### **Minor Issues:**
- 

### **UI/UX Issues:**
- 

### **Data Validation Issues:**
- 

### **Performance Issues:**
- 

---

## 📝 **TEST NOTES**

**Date Tested:** ___________  
**Browser:** ___________  
**Screen Resolution:** ___________  
**Time to Complete:** ___________ minutes  

**Fields Tested (13 NEW):**
- [ ] Piece count
- [ ] Equipment selection
- [ ] Pickup contact name
- [ ] Pickup contact phone
- [ ] Delivery contact name
- [ ] Delivery contact phone
- [ ] Estimated loading time
- [ ] Estimated unloading time
- [ ] Payment terms
- [ ] Quick pay option
- [ ] Load priority
- [ ] Accessorial pre-selection (4 fields)

**Additional Notes:**




---

## ✅ **FINAL RESULT**

- [ ] **PASS** ✅ - All steps completed, load posted successfully
- [ ] **FAIL** ❌ - Critical error prevents completion
- [ ] **PARTIAL PASS** ⚠️ - Works but has minor issues
- [ ] **BLOCKED** 🚫 - Cannot test due to previous failure

**Steps Passed:** ___ / 9  
**Critical Issues:** ___  
**Minor Issues:** ___  

---

**Next Test:** `TEST_008_Save_Draft_Load.md`



