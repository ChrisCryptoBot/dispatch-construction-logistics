# TEST_305: Document Generation (BOL, POD, Rate Confirmation)
## Feature: Auto-generate professional PDFs for BOL, POD template, and Rate Confirmation

---

## 🎯 **Test Objective:**
Verify that professional PDF documents are automatically generated at appropriate workflow stages and contain all required information.

---

## 📋 **Document Generation Triggers:**
| Document | Trigger | Endpoint | Generated When |
|----------|---------|----------|----------------|
| Rate Confirmation | Carrier accepts load | `POST /carrier/loads/:id/accept` | status → ACCEPTED |
| BOL (Bill of Lading) | Material released | `POST /customer/loads/:id/release` | status → RELEASED |
| POD Template | Material released | `POST /customer/loads/:id/release` | status → RELEASED |

---

## 🔄 **Test Workflow:**

### **Test 1: Rate Confirmation Generation**

1. **Carrier Accepts Load:**
   - Login as Carrier
   - Navigate to load board
   - Find posted load
   - Click "Accept Load"
   - API Call: `POST /api/carrier/loads/:id/accept`

2. **Verify Document Generated:**
   - Check server logs: "✅ Rate Confirmation generated for load [id]"
   - Check filesystem: `documents/rate_con_[load_id].pdf` exists

3. **Verify PDF Contents:**
   - Open `documents/rate_con_[load_id].pdf`
   - **Required Fields:**
     - ✅ Confirmation # (load ID)
     - ✅ Date (today's date)
     - ✅ Broker Info: Superior One Logistics, MC #, Phone, Email
     - ✅ Carrier Info: Name, MC#, DOT#, Contact
     - ✅ Load Details: Commodity, quantity, equipment, miles
     - ✅ Pickup: Address, city, state, date
     - ✅ Delivery: Address, city, state, date
     - ✅ Rate: $X per unit
     - ✅ Total Amount: $X,XXX
     - ✅ Payment Terms: Net-7 standard, Net-3 QuickPay (3% fee)
     - ✅ Terms & Conditions (4 points)
     - ✅ Carrier Signature Line

4. **Verify Professional Appearance:**
   - Font sizes appropriate
   - Layout clean and organized
   - All sections clearly labeled
   - No overlapping text
   - Signature lines present

---

### **Test 2: BOL (Bill of Lading) Generation**

1. **Customer Issues Release:**
   - Login as Customer
   - Find load in RELEASE_REQUESTED status
   - Click "Issue Release"
   - Complete release form
   - API Call: `POST /api/customer/loads/:id/release`

2. **Verify Document Generated:**
   - Check server logs: "✅ BOL generated for load [id]"
   - Check filesystem: `documents/bol_[load_id].pdf` exists

3. **Verify PDF Contents:**
   - Open `documents/bol_[load_id].pdf`
   - **Required Fields:**
     - ✅ BOL # (load ID)
     - ✅ Release # (RL-2025-XXXXX)
     - ✅ Date
     - ✅ Broker: Superior One Logistics, MC#, Phone
     - ✅ Shipper: Name, pickup address, city, state
     - ✅ Carrier: Name, MC#, Driver, Truck #
     - ✅ Consignee: Delivery site, address
     - ✅ Commodity: Description, quantity, weight TBD
     - ✅ Equipment Type
     - ✅ Special Instructions (gate codes, pickup notes)
     - ✅ Shipper Signature Line
     - ✅ Driver Signature Line
     - ✅ Footer: Terms reference

4. **Verify Carrier Can Download:**
   - Carrier views load details
   - "Download BOL" button visible
   - Clicking downloads the PDF

---

### **Test 3: POD Template Generation**

1. **Generated with BOL:**
   - When release issued, POD template also generated
   - Check filesystem: `documents/pod_template_[load_id].pdf` exists

2. **Verify PDF Contents:**
   - Open `documents/pod_template_[load_id].pdf`
   - **Required Fields:**
     - ✅ Load #, BOL #, Date line
     - ✅ Load Information: Commodity, expected quantity, origin, destination
     - ✅ Delivery Verification section:
       - Actual Quantity Delivered: _______
       - Condition of Material: _______
       - Delivery Time: _______
       - Receiver Name: _______
     - ✅ Receiver Signature Line
     - ✅ Photos Required checklist:
       - ☐ Photo of delivered material
       - ☐ Photo of truck at delivery site
       - ☐ Photo of signed POD

3. **Verify Carrier Can Download:**
   - Carrier downloads POD template
   - Prints and brings to delivery site
   - Gets receiver signature
   - Takes photo and uploads to platform

---

### **Test 4: Document Availability Throughout Workflow**

1. **After Rate Confirmation Generated:**
   - Carrier dashboard shows "Download Rate Confirmation" link
   - Clicking downloads PDF
   - Carrier can email to accounting department

2. **After BOL Generated:**
   - Carrier dashboard shows "Download BOL" link
   - Driver can view on mobile device
   - Print option available for physical copy

3. **After POD Template Generated:**
   - Carrier dashboard shows "Download POD Template" link
   - Driver downloads before leaving for delivery
   - Used to collect signature at delivery site

---

## ✅ **Success Criteria:**

- [ ] Rate Confirmation generated when carrier accepts
- [ ] BOL generated when material released
- [ ] POD template generated when material released
- [ ] All PDFs contain required information
- [ ] Professional layout and formatting
- [ ] Documents downloadable from carrier dashboard
- [ ] Signature lines present and clear
- [ ] Special instructions included where applicable
- [ ] No missing data or errors in PDFs
- [ ] Files saved to `documents/` directory

---

## 🚨 **Edge Cases:**

### **EC1: Load Data Incomplete**
- Load missing pickup address
- Try to generate BOL
- **Expected:** Error or "TBD" shown in PDF

### **EC2: Carrier Not Yet Assigned**
- Generate rate confirmation before carrier assigned
- **Expected:** "TBD" in carrier fields

### **EC3: Special Characters in Addresses**
- Address contains: "123 O'Brien St."
- **Expected:** PDF renders correctly, no parsing errors

### **EC4: Very Long Special Instructions**
- Release notes are 500+ characters
- **Expected:** Text wraps properly in PDF, doesn't overflow

---

## 📊 **Quality Checklist:**

### **Rate Confirmation:**
- [ ] All fields populated correctly
- [ ] MC numbers displayed (or [TO BE ASSIGNED] placeholder)
- [ ] Rate calculation correct
- [ ] Payment terms clear
- [ ] Signature line visible
- [ ] Professional appearance

### **BOL:**
- [ ] BOL number unique and correct
- [ ] Release number matches
- [ ] All party information complete
- [ ] Commodity details accurate
- [ ] Special instructions included
- [ ] Signature lines for shipper and driver
- [ ] Footer with terms reference

### **POD Template:**
- [ ] Load details accurate
- [ ] Quantity verification fields clear
- [ ] Signature line prominent
- [ ] Photo requirements checklist
- [ ] Receiver name and date fields

---

## 🔧 **Testing Steps:**

1. **Visual Inspection:**
   - Open each PDF
   - Check layout, fonts, spacing
   - Verify all sections visible
   - No overlapping text

2. **Data Accuracy:**
   - Compare PDF data to database
   - Verify all fields match
   - Check calculations (totals, rates)

3. **Download Functionality:**
   - Test download from UI
   - Verify file downloads correctly
   - Check file size (should be <100KB)

4. **Print Test:**
   - Print each PDF
   - Verify legibility
   - Check signature lines print correctly

---

**Status:** ✅ READY TO TEST
**Priority:** HIGH
**Estimated Time:** 30 minutes
**Last Updated:** October 10, 2025

