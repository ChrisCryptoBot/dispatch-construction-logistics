# TEST_010: Create Load (Draft Status)

## 📋 **Test Information**
- **Feature**: Basic Load Creation
- **Priority**: 🔴 CRITICAL
- **Endpoint**: `POST /api/loads`
- **Authentication**: Required (Shipper only)
- **Dependencies**: TEST_003 (Login)

---

## 📝 **Test Cases**

### **Test Case 10.1: Create Basic Load**

**Request:**
```http
POST http://localhost:3000/api/loads
Authorization: Bearer {token}
Content-Type: application/json

{
  "loadType": "AGGREGATE",
  "commodity": "3/4 washed gravel",
  "equipmentType": "End Dump",
  "origin": {
    "address": "123 Quarry Rd, Austin, TX 78701",
    "city": "Austin",
    "state": "TX",
    "zip": "78701"
  },
  "destination": {
    "address": "456 Site Way, Austin, TX 78702",
    "city": "Austin",
    "state": "TX",
    "zip": "78702"
  },
  "pickupDate": "2025-01-20",
  "deliveryDate": "2025-01-20",
  "rate": 12.50,
  "rateMode": "PER_TON",
  "units": 50
}
```

**Expected Response:**
```json
{
  "success": true,
  "load": {
    "id": "load-123",
    "status": "DRAFT",
    "commodity": "3/4 washed gravel",
    "equipmentType": "End Dump",
    "grossRevenue": "625.00",
    "miles": 12,
    "haulType": "METRO"
  },
  "analysis": {
    "distance": 12,
    "haulType": "METRO",
    "equipmentMatch": {
      "equipmentType": "End Dump",
      "tier": "optimal"
    },
    "pricing": {
      "grossRevenue": "625.00"
    }
  }
}
```

**Expected Status Code:** `201 Created`

**Expected Side Effects:**
- ✅ Load created with status = DRAFT
- ✅ Equipment matched automatically
- ✅ Distance calculated
- ✅ Haul type detected
- ✅ Gross revenue calculated

---

## ✅ **Success Criteria**

- [ ] Load created successfully
- [ ] Equipment auto-matched
- [ ] Distance calculated accurately  
- [ ] Haul type correct (METRO/REGIONAL/OTR)
- [ ] Gross revenue = units × rate
- [ ] Status = DRAFT
- [ ] All timestamps recorded

**Result:** PASS / FAIL

**Notes:**


