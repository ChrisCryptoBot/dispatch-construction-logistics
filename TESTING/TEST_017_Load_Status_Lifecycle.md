# TEST_017: Complete Load Status Lifecycle

## 📋 **Test Information**
- **Feature**: Load Status Progression (All States)
- **Priority**: 🔴 CRITICAL
- **Endpoints**: Multiple (status updates)
- **Authentication**: Required
- **Dependencies**: Complete workflow (TEST_001-042)

---

## 🎯 **Test Objective**
Verify load progresses through all status states correctly from DRAFT → COMPLETED.

---

## 📝 **Expected Status Flow**

### **Complete Status Progression:**

```
1. DRAFT              (customer creates load)
   ↓
2. POSTED             (customer posts to marketplace)
   ↓
3. ASSIGNED           (customer accepts carrier bid)
   ↓
4. ACCEPTED           (carrier accepts load)
   ↓
5. RELEASE_REQUESTED  (auto-triggered on carrier accept) 🆕
   ↓
6. RELEASED           (customer confirms material ready) 🆕
   ↓
7. IN_TRANSIT         (GPS at pickup OR manual update) 🆕
   ↓
8. DELIVERED          (GPS at delivery OR manual update) 🆕
   ↓
9. COMPLETED          (customer confirms complete)
   ↓
   [Invoice auto-created] 🆕
```

**Alternative Paths:**
- Any status → **CANCELLED** (customer cancels)
- RELEASED/IN_TRANSIT → **TONU** (material not ready) 🆕
- Any status → **DISPUTED** (disagreement)
- RELEASED → **EXPIRED_RELEASE** (>24 hours passed) 🆕

---

## 📝 **Test Cases**

### **Test Case 17.1: Happy Path (All Statuses)**

**Step 1:** Create load → Status = DRAFT  
**Step 2:** Post load → Status = POSTED  
**Step 3:** Accept bid → Status = ASSIGNED  
**Step 4:** Carrier accepts → Status = RELEASE_REQUESTED 🆕  
**Step 5:** Issue release → Status = RELEASED 🆕  
**Step 6:** GPS at pickup → Status = IN_TRANSIT 🆕  
**Step 7:** GPS at delivery → Status = DELIVERED 🆕  
**Step 8:** Mark complete → Status = COMPLETED  

**Time to Complete:** 5-10 minutes manual

**Expected:** Load progresses through all 9 statuses ✅

---

### **Test Case 17.2: Invalid Status Transition (Negative)**

**Attempt:** DRAFT → COMPLETED (skip intermediate steps)

**Expected:** Validation error or business logic prevents

---

### **Test Case 17.3: TONU Path**

**Progression:**
```
POSTED → ASSIGNED → ACCEPTED → RELEASE_REQUESTED → RELEASED → TONU
```

**Trigger:** Carrier files TONU claim

**Expected:**
- Status = TONU
- Invoice created for TONU amount
- Customer charged
- Carrier paid

---

### **Test Case 17.4: Cancellation Path**

**From any status (except COMPLETED):**
```
POSTED → CANCELLED
```

**Expected:**
- Status = CANCELLED
- Reason stored in notes
- Cannot reactivate

---

## ✅ **Success Criteria**

**Status Transitions:**
- [ ] DRAFT → POSTED ✅
- [ ] POSTED → ASSIGNED ✅
- [ ] ASSIGNED → ACCEPTED ✅
- [ ] ACCEPTED → RELEASE_REQUESTED ✅ NEW!
- [ ] RELEASE_REQUESTED → RELEASED ✅ NEW!
- [ ] RELEASED → IN_TRANSIT ✅
- [ ] IN_TRANSIT → DELIVERED ✅
- [ ] DELIVERED → COMPLETED ✅
- [ ] RELEASED → TONU ✅ NEW!
- [ ] RELEASED → EXPIRED_RELEASE ✅ NEW!
- [ ] Any → CANCELLED ✅

**Auto-Triggers:**
- [ ] Carrier accept → RELEASE_REQUESTED (auto)
- [ ] GPS at pickup → IN_TRANSIT (auto)
- [ ] GPS at delivery → DELIVERED (auto)
- [ ] Status = COMPLETED → Invoice created (auto)

**Result:** PASS / FAIL

**Notes:**


