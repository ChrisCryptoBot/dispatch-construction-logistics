# TEST_050: Marketplace Load Board

## 📋 **Test Information**
- **Feature**: Public Load Board (Carrier View)
- **Priority**: 🔴 CRITICAL
- **Endpoint**: `GET /api/marketplace/loads`
- **Authentication**: Required
- **Dependencies**: Loads with status = POSTED

---

## 🎯 **Test Objective**
Verify carriers can browse available loads with filtering, sorting, and pagination.

---

## 📝 **Test Cases**

### **Test Case 50.1: Get All Available Loads**

**Request:**
```http
GET http://localhost:3000/api/marketplace/loads
Authorization: Bearer {carrierToken}
```

**Expected Response:**
```json
{
  "success": true,
  "loads": [
    {
      "id": "load-123",
      "commodity": "3/4 inch gravel",
      "equipmentType": "End Dump",
      "origin": { "address": "...", "city": "Austin", "state": "TX" },
      "destination": { ... },
      "pickupDate": "2025-01-20",
      "deliveryDate": "2025-01-20",
      "rate": "12.50",
      "rateMode": "PER_TON",
      "units": "50",
      "grossRevenue": "625.00",
      "miles": 12,
      "haulType": "METRO",
      "status": "POSTED"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "pages": 1
  }
}
```

**Expected Status Code:** `200 OK`

---

### **Test Case 50.2: Filter by State**

**Request:**
```http
GET http://localhost:3000/api/marketplace/loads?state=TX
Authorization: Bearer {carrierToken}
```

**Expected:** Only loads with origin.state = "TX"

---

### **Test Case 50.3: Filter by Equipment Type**

**Request:**
```http
GET http://localhost:3000/api/marketplace/loads?equipmentType=End%20Dump
Authorization: Bearer {carrierToken}
```

**Expected:** Only loads requiring End Dump trucks

---

### **Test Case 50.4: Filter by Haul Type**

**Request:**
```http
GET http://localhost:3000/api/marketplace/loads?haulType=METRO
Authorization: Bearer {carrierToken}
```

**Expected:** Only METRO loads (≤50 miles)

---

### **Test Case 50.5: Filter by Minimum Rate**

**Request:**
```http
GET http://localhost:3000/api/marketplace/loads?minRate=15
Authorization: Bearer {carrierToken}
```

**Expected:** Only loads with rate ≥ $15

---

### **Test Case 50.6: Pagination**

**Request:**
```http
GET http://localhost:3000/api/marketplace/loads?page=2&limit=10
Authorization: Bearer {carrierToken}
```

**Expected Response:**
```json
{
  "pagination": {
    "page": 2,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

---

## ✅ **Success Criteria**

- [ ] Only POSTED loads shown
- [ ] Filters work correctly (state, equipment, haul type, min rate)
- [ ] Pagination works
- [ ] Results sorted by pickupDate (ascending)
- [ ] No loads from other carriers (status=ASSIGNED)
- [ ] No completed/cancelled loads shown

---

## 🔗 **Related Tests**
- TEST_031: Carrier Submit Bid (next action)
- TEST_030: Carrier Browse Available Loads (alternative endpoint)


