# 🔧 FILE RENAMING PLAN - PREVENT ROUTING CONFLICTS

## 🎯 **OBJECTIVE:**
Rename all files with identical names between carrier and customer to be hyper-specific and prevent routing issues.

---

## 📊 **CURRENT CONFLICTS IDENTIFIED:**

### **High Priority (Same Feature Name, Different Implementation):**

1. **Calendar**
   - ❌ Current: `web/src/pages/CalendarPage.tsx` (carrier)
   - ❌ Current: `web/src/pages/customer/CalendarPage.tsx` (customer)
   - ✅ New: `web/src/pages/carrier/CarrierCalendarPage.tsx`
   - ✅ New: `web/src/pages/customer/CustomerCalendarPage.tsx`

2. **My Loads**
   - ❌ Current: `web/src/pages/carrier/MyLoadsPage.tsx`
   - ❌ Current: `web/src/pages/customer/MyLoadsPage.tsx`
   - ✅ New: `web/src/pages/carrier/CarrierMyLoadsPage.tsx`
   - ✅ New: `web/src/pages/customer/CustomerMyLoadsPage.tsx`

3. **Dashboard**
   - ❌ Current: `web/src/pages/CarrierDashboard.tsx`
   - ❌ Current: `web/src/pages/customer/CustomerDashboard.tsx`
   - ✅ New: `web/src/pages/carrier/CarrierDashboard.tsx`
   - ✅ New: `web/src/pages/customer/CustomerDashboard.tsx` (already named correctly)

4. **Analytics**
   - ❌ Current: `web/src/pages/AnalyticsPage.tsx` (carrier)
   - ❌ Current: `web/src/pages/customer/AnalyticsPage.tsx` (customer)
   - ✅ New: `web/src/pages/carrier/CarrierAnalyticsPage.tsx`
   - ✅ New: `web/src/pages/customer/CustomerAnalyticsPage.tsx`

5. **Documents**
   - ❌ Current: `web/src/pages/DocumentsPage.tsx` (carrier)
   - ❌ Current: `web/src/pages/customer/DocumentsPage.tsx` (customer)
   - ✅ New: `web/src/pages/carrier/CarrierDocumentsPage.tsx`
   - ✅ New: `web/src/pages/customer/CustomerDocumentsPage.tsx`

6. **Invoices**
   - ❌ Current: `web/src/pages/InvoicesPage.tsx` (carrier)
   - ❌ Current: `web/src/pages/customer/InvoicesPage.tsx` (customer)
   - ✅ New: `web/src/pages/carrier/CarrierInvoicesPage.tsx`
   - ✅ New: `web/src/pages/customer/CustomerInvoicesPage.tsx`

---

## 📋 **COMPLETE RENAMING LIST:**

### **Carrier Files to Rename:**
1. `CalendarPage.tsx` → `carrier/CarrierCalendarPage.tsx`
2. `CarrierDashboard.tsx` → `carrier/CarrierDashboard.tsx`
3. `AnalyticsPage.tsx` → `carrier/CarrierAnalyticsPage.tsx`
4. `DocumentsPage.tsx` → `carrier/CarrierDocumentsPage.tsx`
5. `InvoicesPage.tsx` → `carrier/CarrierInvoicesPage.tsx`
6. `CompliancePage.tsx` → `carrier/CarrierCompliancePage.tsx`
7. `FleetManagementPage.tsx` → `carrier/CarrierFleetManagementPage.tsx`
8. `ZoneManagementPage.tsx` → `carrier/CarrierZoneManagementPage.tsx`

### **Customer Files to Rename:**
1. `customer/CalendarPage.tsx` → `customer/CustomerCalendarPage.tsx`
2. `customer/MyLoadsPage.tsx` → `customer/CustomerMyLoadsPage.tsx`
3. `customer/AnalyticsPage.tsx` → `customer/CustomerAnalyticsPage.tsx`
4. `customer/DocumentsPage.tsx` → `customer/CustomerDocumentsPage.tsx`
5. `customer/InvoicesPage.tsx` → `customer/CustomerInvoicesPage.tsx`

---

## 🔄 **EXECUTION ORDER:**

**Phase 1:** Rename Carrier Files ✅
**Phase 2:** Rename Customer Files ✅
**Phase 3:** Update App.tsx Imports ✅
**Phase 4:** Update All Route References ✅
**Phase 5:** Test All Routes ✅




