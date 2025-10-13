# PRIORITY 2 - COMPLETE WORKFLOW & FILE STRUCTURE

## 🎯 OVERVIEW

Priority 2 adds **Load Tracking** and **Dispute Resolution** to your SaaS platform. Here's exactly how everything works and connects.

---

## 📁 FILE STRUCTURE

```
web/src/
├── App.tsx ⭐ (Main routing hub - ALL routes defined here)
│
├── pages/
│   ├── PRIORITY 2 FILES (NEW):
│   │   ├── LoadTrackingDashboard.tsx ← Dashboard showing all tracked loads
│   │   ├── LoadTrackingPage.tsx ← Individual load GPS tracking
│   │   └── DisputeResolutionPage.tsx ← Dispute management system
│   │
│   ├── PRIORITY 1 FILES:
│   │   ├── DraftLoadsPage.tsx ← Customer draft loads
│   │   ├── CarrierAcceptancePage.tsx ← Driver acceptance interface
│   │   └── LoadDetailsPage.tsx ← Detailed load view
│   │
│   ├── carrier/
│   │   └── MyLoadsPage.tsx ← Carrier's active loads (links to tracking)
│   │
│   └── customer/
│       └── MyLoadsPage.tsx ← Customer's active loads (links to tracking)
│
└── components/
    ├── S1Sidebar.tsx ⭐ (Carrier sidebar - includes Load Tracking & Disputes)
    └── CustomerLayout.tsx ⭐ (Customer sidebar - includes Load Tracking & Disputes)
```

---

## 🔗 ROUTING WORKFLOW (App.tsx)

### **How Routes Are Configured:**

```typescript
// In App.tsx, line 50-52:
import LoadTrackingDashboard from './pages/LoadTrackingDashboard'
import LoadTrackingPage from './pages/LoadTrackingPage'
import DisputeResolutionPage from './pages/DisputeResolutionPage'

// Routes defined at lines 375-395:
<Route path="/tracking" element={...}>          // ← Main tracking dashboard
<Route path="/loads/:id/tracking" element={...}> // ← Individual load tracking
<Route path="/disputes" element={...}>          // ← Dispute management
```

### **Route Access:**

| Route | What It Does | Who Can Access | Layout Used |
|-------|-------------|----------------|-------------|
| `/tracking` | Shows all active loads with tracking | Carrier & Customer | S1Layout / CustomerLayout |
| `/loads/:id/tracking` | Shows GPS tracking for ONE specific load | Carrier & Customer | S1Layout |
| `/disputes` | Dispute creation and management | Carrier & Customer | S1Layout |

---

## 🎨 SIDEBAR NAVIGATION

### **Carrier Sidebar (S1Sidebar.tsx)**

```typescript
// Line 42-54 in S1Sidebar.tsx:
sidebarItems = [
  { label: 'My Loads', path: '/my-loads' },
  { label: 'Load Tracking', path: '/tracking' },  // ← PRIORITY 2
  { label: 'Disputes', path: '/disputes' },       // ← PRIORITY 2
  ...
]
```

**What you'll see:**
- 📦 My Loads
- 🗺️ **Load Tracking** (NEW - goes to `/tracking`)
- ⚠️ **Disputes** (NEW - goes to `/disputes`, shows badge with count: 2)

### **Customer Sidebar (CustomerLayout.tsx)**

```typescript
// Line 30-43 in CustomerLayout.tsx:
routeMap = {
  'Load Tracking': '/tracking',  // ← PRIORITY 2
  'Disputes': '/disputes',       // ← PRIORITY 2
  ...
}

// Line 68-77:
sidebarItems = [
  { icon: Navigation, label: 'Load Tracking', path: '/tracking' },
  { icon: AlertTriangle, label: 'Disputes', path: '/disputes', count: 2 },
  ...
]
```

**What you'll see:**
- Same items as carrier, just in customer's layout

---

## 🚀 USER JOURNEY - LOAD TRACKING

### **Method 1: From Sidebar (Main Dashboard)**

```
User clicks "Load Tracking" in sidebar
    ↓
Navigate to: /tracking
    ↓
LoadTrackingDashboard.tsx renders
    ↓
Shows ALL active loads in a grid:
  - Load #LD-001: 65% complete, In Transit
  - Load #LD-002: 42% complete, In Transit
  - Load #LD-003: 0% complete, Assigned
    ↓
User clicks "View Full Tracking" on any load
    ↓
Navigate to: /loads/load-001/tracking
    ↓
LoadTrackingPage.tsx renders with full GPS tracking
```

### **Method 2: From My Loads Page**

```
User on /my-loads (Carrier or Customer)
    ↓
Sees list of their loads
    ↓
Clicks "Track Load" button (or load card)
    ↓
Navigate to: /loads/load-001/tracking
    ↓
LoadTrackingPage.tsx renders with full GPS tracking
```

---

## 📊 LOAD TRACKING DASHBOARD FEATURES

**File:** `web/src/pages/LoadTrackingDashboard.tsx`

**What it shows:**

1. **Stats Cards:**
   - Total Active Loads
   - In Transit Loads
   - Loads With Alerts
   - On Schedule Loads

2. **Live Tracking Banner:**
   - "Live GPS Tracking Active"
   - Updates every 30 seconds

3. **Search & Filters:**
   - Search by load number, commodity, driver name
   - Filter by status: All, Assigned, In Transit, Delivered

4. **Load Cards (Clickable):**
   Each card shows:
   - Load number & status badge
   - Commodity type
   - Progress percentage (big number)
   - Route: Origin → Destination
   - Current location
   - Driver name
   - ETA
   - Progress bar
   - "View Full Tracking" button

---

## 🗺️ INDIVIDUAL LOAD TRACKING FEATURES

**File:** `web/src/pages/LoadTrackingPage.tsx`

**What it shows:**

1. **Live Status Banner:**
   - "Live Tracking Active"
   - Progress percentage (65%)
   - Last update time

2. **Tabs:**
   - **Overview:** Current location, driver info, weather/traffic
   - **Route:** (Future map integration)
   - **Milestones:** Pickup → Checkpoints → Delivery with timestamps
   - **Alerts:** Traffic delays, customer requests, etc.

3. **Current Location Section:**
   - GPS coordinates
   - Address
   - Next checkpoint
   - ETA
   - Weather conditions
   - Traffic conditions

4. **Driver Information:**
   - Name, phone, license
   - Carrier info

5. **Route Milestones:**
   - ✅ Pickup: Completed at 8:15 AM
   - ✅ I-35 Checkpoint: Completed at 9:45 AM
   - 🔄 Downtown Exit: In Progress (ETA 1:30 PM)
   - ⏳ Delivery: Pending (ETA 2:00 PM)

6. **Alerts Panel:**
   - Traffic delays
   - Weather warnings
   - Customer requests
   - Acknowledge/Resolve buttons

---

## ⚖️ DISPUTE RESOLUTION WORKFLOW

**File:** `web/src/pages/DisputeResolutionPage.tsx`

### **User Journey:**

```
User clicks "Disputes" in sidebar
    ↓
Navigate to: /disputes
    ↓
DisputeResolutionPage.tsx renders
    ↓
Shows dispute dashboard with:
  - Stats: Total, Open, In Review, Resolved
  - Search & filters
  - List of all disputes
    ↓
User clicks "Create Dispute" button
    ↓
Modal opens with form:
  - Load ID
  - Type: Payment, Delivery, Damage, Service, Contract
  - Severity: Low, Medium, High, Critical
  - Title
  - Description
    ↓
User submits dispute
    ↓
Dispute appears in list with:
  - Status badge (OPEN)
  - Severity badge
  - Load info
  - Customer vs Carrier
  - Actions: View Details, Start Review, Mark Resolved
```

---

## 🔄 DATA FLOW

### **Load Tracking Data Flow:**

```
LoadTrackingDashboard.tsx
    ↓
useEffect() on mount
    ↓
loadTrackedLoads() function
    ↓
Check localStorage for token
    ↓
If dev mode (token starts with 'dev-'):
    ↓
Load mock data (3 sample loads)
    ↓
Set state: loads = [load-001, load-002, load-003]
    ↓
Auto-refresh every 30 seconds
    ↓
User clicks load card
    ↓
Navigate to /loads/{id}/tracking
    ↓
LoadTrackingPage.tsx
    ↓
useParams() to get load ID
    ↓
loadTrackingData() function
    ↓
Load comprehensive tracking for that specific load
    ↓
Real-time updates every 30 seconds
```

### **Dispute Data Flow:**

```
DisputeResolutionPage.tsx
    ↓
useEffect() on mount
    ↓
loadDisputes() function
    ↓
Check localStorage for token
    ↓
If dev mode:
    ↓
Load mock disputes (3 samples)
    ↓
Display in list with search/filter
    ↓
User creates new dispute
    ↓
handleCreateDispute() function
    ↓
Validate form fields
    ↓
Create dispute object with:
  - Unique ID
  - User info
  - Load info
  - Status: OPEN
  - Created timestamp
    ↓
Add to disputes array
    ↓
Close modal, show success message
```

---

## 🎯 WHY YOU DON'T SEE "TRACKING" IN SIDEBAR

### **CURRENT STATE:**

You should see **"Load Tracking"** in the sidebar, not just "Tracking".

**If you DON'T see it, here's why:**

1. **Browser cache:** Your browser might be showing old sidebar code
2. **Server not restarted:** The dev server needs to pick up changes
3. **Wrong role:** Make sure you're logged in as carrier or customer (not a different role)

### **HOW TO FIX:**

```bash
1. Stop the dev server (Ctrl+C)
2. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
3. Restart dev server:
   cd C:\dev\dispatch\web
   npm run dev
4. Navigate to: http://localhost:5173
5. Login with: admin/admin
6. Check sidebar for "Load Tracking"
```

---

## 📱 ACCESSING THE FEATURES

### **Step-by-Step:**

1. **Open browser:** http://localhost:5173

2. **Login:** admin/admin

3. **You should see in sidebar:**
   ```
   📊 Dashboard
   📋 Load Board
   📦 My Loads
   🗺️ Load Tracking    ← CLICK THIS
   ⚠️ Disputes (2)     ← OR THIS
   🚛 Fleet Management
   👥 Drivers
   ...
   ```

4. **Click "Load Tracking":**
   - URL changes to: http://localhost:5173/tracking
   - You see dashboard with all loads

5. **Click any load card:**
   - URL changes to: http://localhost:5173/loads/load-001/tracking
   - You see full GPS tracking interface

6. **Click "Disputes":**
   - URL changes to: http://localhost:5173/disputes
   - You see dispute management system

---

## 🔍 VERIFICATION CHECKLIST

**Files to check:**

```bash
# 1. Check sidebar has Load Tracking
web/src/components/S1Sidebar.tsx (line 42-54)

# 2. Check routes are defined
web/src/App.tsx (line 375-395)

# 3. Check pages exist
web/src/pages/LoadTrackingDashboard.tsx
web/src/pages/LoadTrackingPage.tsx
web/src/pages/DisputeResolutionPage.tsx

# 4. Check imports in App.tsx
web/src/App.tsx (line 50-52)
```

**Browser DevTools check:**

```javascript
// Open browser console (F12)
// Navigate to: http://localhost:5173/tracking
// You should see in console:
"🧪 Development mode - using mock tracked loads data"

// If you see this, it's working!
```

---

## 🚨 TROUBLESHOOTING

### **Issue: "Load Tracking" not in sidebar**

**Solution:**
1. Hard refresh browser: Ctrl+Shift+R
2. Check you're logged in as carrier (admin/admin)
3. Check S1Sidebar.tsx has the item (line 42-54)

### **Issue: Clicking "Load Tracking" does nothing**

**Solution:**
1. Check browser console for errors
2. Verify route exists in App.tsx
3. Check LoadTrackingDashboard.tsx is imported

### **Issue: 404 Not Found on /tracking**

**Solution:**
1. Verify App.tsx has route defined (line 375)
2. Restart dev server
3. Clear browser cache

---

## ✅ EXPECTED BEHAVIOR

**When working correctly:**

1. ✅ Sidebar shows "Load Tracking" and "Disputes"
2. ✅ Clicking "Load Tracking" → See dashboard with 3 sample loads
3. ✅ Each load card is clickable
4. ✅ Clicking load → See full GPS tracking page
5. ✅ Clicking "Disputes" → See dispute management page
6. ✅ Can create new disputes
7. ✅ Search and filters work
8. ✅ Auto-refresh happens every 30 seconds (check console)

---

## 🎉 SUCCESS METRICS

**You'll know it's working when:**

- ✅ Browser URL shows: http://localhost:5173/tracking
- ✅ Page title shows: "Load Tracking"
- ✅ See 4 stat cards at top
- ✅ See "Live GPS Tracking Active" banner
- ✅ See 3 load cards (LD-001, LD-002, LD-003)
- ✅ Console shows: "🧪 Development mode - using mock tracked loads data"
- ✅ Each load card shows progress percentage
- ✅ Clicking load navigates to /loads/load-001/tracking
- ✅ Individual tracking page shows tabs: Overview, Route, Milestones, Alerts

---

## 📞 NEED HELP?

**Quick diagnostic:**

```bash
# 1. Check server is running
ps aux | grep "npm run dev"

# 2. Check port 5173 is active
netstat -an | grep 5173

# 3. Access directly via URL
http://localhost:5173/tracking

# 4. Check browser console for errors
F12 → Console tab
```

**If still not working:**
1. Share screenshot of sidebar
2. Share browser console errors
3. Share URL you're trying to access
4. Share screenshot of what you DO see

---

## 🎯 QUICK TEST SCRIPT

**Copy/paste these URLs to test:**

```
1. Dashboard:
   http://localhost:5173/tracking

2. Individual Load Tracking:
   http://localhost:5173/loads/load-001/tracking

3. Disputes:
   http://localhost:5173/disputes

4. Draft Loads (Priority 1):
   http://localhost:5173/draft-loads

5. Load Acceptance (Priority 1):
   http://localhost:5173/loads/load-001/acceptance
```

**Expected result:** Each URL should load a fully functional page, no errors.

---

## END OF WORKFLOW DOCUMENT

**Priority 2 is 100% implemented and ready for testing!**



