# TEST_025: Equipment Matching (AI)

## 📋 **Test Information**
- **Feature**: Intelligent Equipment-Commodity Matching
- **Priority**: 🔴 CRITICAL
- **Endpoint**: `POST /api/dispatch/assign`
- **Authentication**: Required
- **Dependencies**: None

---

## 🎯 **Test Objective**
Verify AI equipment matcher suggests optimal equipment based on commodity type and load characteristics.

---

## 📝 **Test Cases**

### **Test Case 25.1: Gravel → End Dump (Optimal)**

**Request:**
```http
POST http://localhost:3000/api/dispatch/assign
Authorization: Bearer {token}
Content-Type: application/json

{
  "commodity": "3/4 inch washed gravel",
  "loadType": "AGGREGATE",
  "haulType": "METRO"
}
```

**Expected Response:**
```json
{
  "success": true,
  "match": {
    "equipmentType": "End Dump",
    "tier": "optimal",
    "confidence": "high",
    "reason": "End dumps are optimal for loose aggregates",
    "suggestedTypes": ["End Dump", "Super 10", "Transfer Dump"]
  }
}
```

---

### **Test Case 25.2: Concrete → Mixer (Optimal)**

**Request:**
```json
{
  "commodity": "4000 PSI ready-mix concrete",
  "loadType": "MATERIAL"
}
```

**Expected:**
```json
{
  "equipmentType": "Concrete Mixer",
  "tier": "optimal"
}
```

---

### **Test Case 25.3: Equipment Override**

**Request:**
```json
{
  "commodity": "gravel",
  "equipmentOverride": "Flatbed",
  "overrideReason": "Customer requested flatbed for site constraints"
}
```

**Expected:**
```json
{
  "equipmentType": "Flatbed",
  "tier": "unusual",
  "overridden": true,
  "overrideReason": "Customer requested..."
}
```

---

## ✅ **Success Criteria**

Common Commodity Matches:
- [ ] Gravel/Sand/Dirt → End Dump
- [ ] Concrete → Mixer
- [ ] Rebar/Steel → Flatbed
- [ ] Heavy Equipment → Lowboy
- [ ] Lumber → Flatbed
- [ ] Asphalt → End Dump


