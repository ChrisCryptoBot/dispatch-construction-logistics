# 🚀 QUICK START GUIDE - Testing Your Platform

## ⚡ Start the Platform (Every Time)

### 1. Start Backend Server
```powershell
cd C:\dev\dispatch
npm start
```
**Expected:** Server running on `http://localhost:3000`

### 2. Start Frontend (New Terminal)
```powershell
cd C:\dev\dispatch\web
npm run dev
```
**Expected:** Vite dev server on `http://localhost:5173`

### 3. Open Browser
Navigate to: **http://localhost:5173**

---

## 🔑 Login Credentials

**Development Admin:**
- **Username:** `admin`
- **Password:** `admin`
- **Access:** Both Carrier & Customer dashboards

---

## 🧪 Test the Load Posting Wizard (NEW!)

### Step-by-Step Test

1. **Login:** `admin/admin`

2. **Switch to Customer View:**
   - Click profile dropdown (top-right)
   - Click "Switch View"
   - Select "Customer Dashboard"

3. **Navigate to Load Posting:**
   - Click "Post New Load" card OR
   - Click "Loads" in sidebar → "Post Load"

4. **Complete All 7 Steps:**

   **Step 1: Material & Commodity**
   - Select material type (e.g., "Aggregates")
   - Enter commodity details
   - Enter quantity & unit
   - **NEW:** Enter piece count (optional)
   - **NEW:** Select equipment type

   **Step 2: Locations & Contacts**
   - Enter pickup location & address
   - **NEW:** Enter pickup contact name & phone
   - Enter delivery location & address
   - **NEW:** Enter delivery contact name & phone

   **Step 3: Schedule & Time Windows**
   - Select pickup date & time window
   - **NEW:** Enter estimated loading time (minutes)
   - Select delivery date & time window
   - **NEW:** Enter estimated unloading time (minutes)

   **Step 4: Requirements & Compliance**
   - Toggle scale ticket (if needed)
   - Toggle permit (if needed)
   - Toggle prevailing wage (if needed)
   - Enter special instructions (optional)

   **Step 5: Pricing & Payment**
   - Select rate mode (e.g., "Per Ton")
   - Enter rate amount
   - **NEW:** Select payment terms (Net 15/30/45)
   - **NEW:** Enable quick pay (optional)
   - **NEW:** Select load priority (Normal/High/Urgent)

   **Step 6: Accessorial Services** *(NEW STEP)*
   - Check detention (if may be needed)
   - Check layover (if may be needed)
   - Set stop-off count (use +/- buttons)
   - Check driver assist (if needed)

   **Step 7: Job Details & Review**
   - Enter job code
   - Enter site name
   - Review all details
   - Click "Post Load to Board"

5. **Test Save as Draft:**
   - At any step, click "Save Draft" button
   - Navigate to "Draft Loads" page
   - Verify draft appears with completion %
   - Click "Resume" to continue

---

## 🎯 Key Features to Test

### Load Posting Wizard
- ✅ All 7 steps render correctly
- ✅ Step indicator shows progress
- ✅ Previous/Next navigation
- ✅ Save as Draft button works
- ✅ Equipment selection is interactive
- ✅ Contact cards display properly
- ✅ Time estimates calculate total
- ✅ Payment terms are selectable
- ✅ Load priority changes colors
- ✅ Accessorial checkboxes work
- ✅ Stop-off +/- buttons work
- ✅ Final submission succeeds

### Carrier Workflow
1. Switch to "Carrier Dashboard"
2. Go to "Load Board"
3. Find the load you posted
4. Submit a bid
5. Switch back to "Customer Dashboard"
6. Go to "My Loads" → "Posted Loads"
7. Accept the bid
8. Switch to "Carrier Dashboard"
9. Go to "My Loads"
10. Verify Rate Con appears
11. Check countdown timer
12. Track the load

### Fleet & Calendar
1. Go to "Fleet Management"
2. Click "Add Vehicle"
3. Fill out all fields
4. Click "Schedule Maintenance"
5. Pick a date & service
6. Go to "Calendar"
7. Verify maintenance appears

---

## 📋 Testing Checklist

### Day 1: Load Posting
- [ ] Complete all 7 steps of Load Posting Wizard
- [ ] Save draft at Step 3
- [ ] Resume from draft
- [ ] Complete and post load
- [ ] Verify load appears on Load Board

### Day 2: Bidding & Rate Con
- [ ] Submit bid as carrier
- [ ] Accept bid as customer
- [ ] Verify Rate Con auto-generated
- [ ] Sign Rate Con as dispatch
- [ ] Accept Rate Con as driver (SMS link)

### Day 3: Load Tracking
- [ ] Track active load
- [ ] Update milestones
- [ ] Upload BOL
- [ ] Upload POD
- [ ] Approve delivery

### Day 4: Fleet & Drivers
- [ ] Add vehicle
- [ ] Schedule maintenance
- [ ] Add driver
- [ ] Assign load to driver
- [ ] Verify calendar updates

### Day 5: Calendar & Billing
- [ ] Create manual event
- [ ] View week/month/day
- [ ] Test timezone selector
- [ ] Review invoices
- [ ] Check billing settings

---

## 🐛 If Something Breaks

### Clear Cache & Restart
```powershell
# Stop both servers (Ctrl+C)
# Clear browser cache
# Delete localStorage in DevTools
# Restart both servers
```

### Check Console Errors
- Open DevTools (F12)
- Check Console tab
- Check Network tab
- Report errors with screenshot

### Reset to Known State
```powershell
# Stop servers
cd C:\dev\dispatch\web
# Clear node_modules if needed
rm -r node_modules
npm install
# Restart
```

---

## 📊 What to Look For

### Good Signs ✅
- Smooth step transitions
- No console errors
- Data persists between steps
- Buttons respond immediately
- Modals open/close cleanly
- Forms validate correctly
- Draft saves successfully
- Load appears on board

### Red Flags 🚨
- White screens
- Console errors
- Data loss between steps
- Buttons don't respond
- Modals don't open
- Forms accept invalid data
- Draft doesn't save
- Load doesn't appear

---

## 📝 Documentation Files

After testing, review:
1. **LOAD_POSTING_WIZARD_COMPLETE.md** - Feature details
2. **PLATFORM_STATUS_FINAL.md** - Overall platform status
3. **This file** - Testing guide

---

## 💡 Pro Tips

1. **Test in Dark Mode:** Primary theme
2. **Test in Light Mode:** Toggle in settings
3. **Use Real-World Data:** Actual addresses, phone numbers
4. **Take Screenshots:** Document any issues
5. **Test Edge Cases:** Empty fields, long text, special characters
6. **Check Mobile View:** Resize browser to phone width
7. **Test Different Browsers:** Chrome, Edge, Firefox

---

## 🎯 Success Criteria

After 1 month of testing, you should have:
- [ ] Posted 10+ loads successfully
- [ ] Completed 5+ full load cycles (post → bid → accept → track → deliver)
- [ ] Added 3+ vehicles to fleet
- [ ] Added 3+ drivers
- [ ] Scheduled 5+ maintenance appointments
- [ ] Created 10+ calendar events
- [ ] Tested all accessorial charges
- [ ] Tested payment terms
- [ ] Tested load priority
- [ ] Saved and resumed 3+ drafts
- [ ] No critical bugs found

---

## 📞 Support

**Files to Check:**
- Console errors in browser DevTools
- Terminal output from both servers
- `PLATFORM_STATUS_FINAL.md` for features list
- `LOAD_POSTING_WIZARD_COMPLETE.md` for details

**Common Issues:**
- **"Can't log in"** → Use `admin/admin`
- **"White screen"** → Check console, restart servers
- **"Load not appearing"** → Check if submission succeeded
- **"Draft not saving"** → Check localStorage in DevTools

---

## 🚀 You're Ready!

The platform is **88% complete** and **ready for extensive testing**. Focus on the Load Posting Wizard first, then expand to other features. Take your time, document everything, and enjoy testing your SaaS!

**Happy Testing! 🎉**

---

*Quick Start Guide v1.0*  
*Last Updated: October 9, 2025*



