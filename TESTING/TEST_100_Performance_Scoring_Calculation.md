# TEST_100: Performance Scoring Calculation

## 📋 **Test Information**
- **Feature**: Carrier Performance Score & Tier Assignment
- **Priority**: 🟡 HIGH
- **Service**: `performanceScoringService.js`
- **Authentication**: Required
- **Dependencies**: Carrier with completed loads

---

## 🎯 **Test Objective**
Verify performance scores calculated correctly and tiers assigned properly (Bronze/Silver/Gold).

---

## 📝 **Test Cases**

### **Test Case 100.1: Calculate Score for New Carrier**

**Carrier Details:**
- Completed loads: 0
- On-time rate: N/A
- Doc accuracy: N/A

**Expected Score:** 50 (default for new carriers)  
**Expected Tier:** BRONZE

---

### **Test Case 100.2: Calculate Score for Good Carrier**

**Carrier Details:**
- Completed loads: 25
- On-time rate: 95% (19/20 recent loads on time)
- Doc accuracy: 90% (18/20 had all docs)
- Compliance: 100% (FMCSA active, insurance valid)
- Customer rating: 4.5/5 (90%)

**Calculation:**
```
Score = (0.30 × 0.95) + (0.20 × 0.90) + (0.15 × 0.75) + (0.20 × 1.00) + (0.15 × 0.90)
      = 0.285 + 0.18 + 0.1125 + 0.20 + 0.135
      = 0.9125 × 100
      = 91 (rounded)
```

**Expected Score:** 91  
**Expected Tier:** GOLD (≥90)

---

### **Test Case 100.3: Tier Thresholds**

| Score Range | Tier | Description |
|-------------|------|-------------|
| 90-100 | GOLD | Top performers |
| 75-89 | SILVER | Good performers |
| 60-74 | BRONZE | Acceptable |
| <60 | BRONZE | Needs improvement |

---

### **Test Case 100.4: On-Time Calculation**

**Test Data:**
- 10 completed loads
- 9 delivered within 30 minutes of ETA
- 1 delivered 45 minutes late

**Expected On-Time Rate:** 90% (9/10)

---

### **Test Case 100.5: Document Accuracy Calculation**

**Test Data:**
- 10 completed loads
- 8 loads have BOL + POD + Scale Ticket (if required)
- 2 loads missing POD

**Expected Doc Accuracy:** 80% (8/10)

---

## ✅ **Success Criteria**

**Scoring Weights:**
- [ ] On-Time: 30%
- [ ] Doc Accuracy: 20%
- [ ] Communication: 15%
- [ ] Compliance: 20%
- [ ] Customer Rating: 15%

**Tier Assignments:**
- [ ] Score ≥90 → GOLD
- [ ] Score 75-89 → SILVER
- [ ] Score 60-74 → BRONZE
- [ ] Score <60 → BRONZE

**Calculations:**
- [ ] Composite score correct
- [ ] On-time rate accurate
- [ ] Doc accuracy accurate
- [ ] Compliance score includes FMCSA + insurance

**Result:** PASS / FAIL

**Notes:**


