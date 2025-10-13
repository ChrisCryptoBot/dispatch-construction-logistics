# TEST 001: Carrier Signup

**Category:** Authentication & Onboarding  
**Priority:** Critical  
**Estimated Time:** 5 minutes  
**Dependencies:** None  

---

## 🎯 **TEST OBJECTIVE**

Verify that a new carrier can successfully create an account through the signup process.

---

## 📋 **PRE-REQUISITES**

- [ ] Servers are running (frontend + backend)
- [ ] Browser is open to http://localhost:5173 or http://localhost:5174
- [ ] No existing session (clear localStorage)

---

## 🔧 **TEST STEPS**

### **Step 1: Access Signup Page**
- [ ] Navigate to http://localhost:5173
- [ ] Click "Sign Up" button or "Register" tab
- [ ] Verify signup form appears

**Expected Result:** Signup form visible with fields for carrier registration

---

### **Step 2: Select User Type**
- [ ] Select "Carrier" as organization type
- [ ] Verify carrier-specific fields appear

**Expected Result:** Form shows carrier-specific fields (MC#, DOT#, Fleet size, etc.)

---

### **Step 3: Enter Company Information**
- [ ] Company Name: `Test Carrier LLC`
- [ ] Email: `carrier_test_[timestamp]@test.com` (use unique email)
- [ ] Password: `Test123!@#`
- [ ] Confirm Password: `Test123!@#`
- [ ] Phone: `555-TEST-001`

**Expected Result:** All fields accept input without errors

---

### **Step 4: Enter Carrier-Specific Info**
- [ ] MC Number: `MC123456` (optional)
- [ ] DOT Number: `DOT789012`
- [ ] EIN: `12-3456789`
- [ ] Fleet Size: `5`

**Expected Result:** Fields accept valid input

---

### **Step 5: Submit Signup**
- [ ] Click "Create Account" or "Sign Up" button
- [ ] Wait for processing

**Expected Result:** 
- Loading indicator appears
- No error messages
- Success message or redirect

---

### **Step 6: Verify Account Created**
- [ ] Check if redirected to onboarding or dashboard
- [ ] Verify user is logged in (see username/company name in header)
- [ ] Verify organization type shows "CARRIER"

**Expected Result:** Account created successfully, user logged in

---

## ✅ **PASS/FAIL CRITERIA**

### **PASS** ✅ **IF:**
- [ ] All form fields work correctly
- [ ] No console errors
- [ ] Account created successfully
- [ ] User automatically logged in
- [ ] Redirected to appropriate page
- [ ] Company name visible in UI

### **FAIL** ❌ **IF:**
- [ ] Form validation errors prevent submission
- [ ] Console errors appear
- [ ] Account not created
- [ ] User not logged in
- [ ] White screen or crash
- [ ] Data not saved

---

## 📸 **SCREENSHOTS TO CAPTURE**

1. Signup form (empty)
2. Signup form (filled)
3. Success message or redirect
4. Dashboard after signup

**Save in:** `TESTING/screenshots/TEST_001/`

---

## 🐛 **ISSUES FOUND**

### **Critical Issues:**
- 

### **Minor Issues:**
- 

### **UI/UX Issues:**
- 

### **Suggestions:**
- 

---

## 📝 **TEST NOTES**

**Date Tested:** ___________  
**Tester:** ___________  
**Browser:** ___________  
**Screen Resolution:** ___________  

**Additional Notes:**




---

## ✅ **FINAL RESULT**

- [ ] **PASS** - All steps completed successfully
- [ ] **FAIL** - Test failed (document issues above)
- [ ] **BLOCKED** - Cannot complete due to previous test failure
- [ ] **SKIP** - Not applicable or deferred

**Overall Score:** ___ / 6 steps passed

---

**Next Test:** `TEST_002_Carrier_Onboarding.md`



