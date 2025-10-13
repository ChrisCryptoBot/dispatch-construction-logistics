# TEST_018: Customer Load Posting Wizard

## 📋 **Test Information**
- **Feature**: Customer Load Creation via Wizard
- **Priority**: 🔴 CRITICAL
- **Endpoint**: `POST /api/customer/loads`
- **Authentication**: Required (Customer/Shipper only)
- **Dependencies**: None (first step in load workflow)

---

## 🎯 **Test Objective**
Verify customers can post loads with all material types, equipment matching, distance calculation, and automatic pricing.

---

## 📝 **Test Cases**

### **Test Case 18.1: Post Aggregate Load (PER_TON)**

**Request:**
```http
POST http://localhost:3000/api/customer/loads
Authorization: Bearer {customerToken}
Content-Type: application/json

{
  "materialType": "AGGREGATE",
  "commodityDetails": "3/4 inch washed gravel",
  "quantity": 50,
  "quantityUnit": "tons",
  "pickupLocation": "Acme Quarry",
  "pickupAddress": "123 Quarry Rd, Austin, TX 78701",
  "deliveryLocation": "Construction Site Alpha",
  "deliveryAddress": "456 Site Way, Austin, TX 78702",
  "pickupDate": "2025-01-20",
  "pickupTimeStart": "08:00",
  "pickupTimeEnd": "12:00",
  "deliveryDate": "2025-01-20",
  "deliveryTimeStart": "10:00",
  "deliveryTimeEnd": "15:00",
  "rateMode": "PER_TON",
  "rateAmount": 12.50,
  "requiresScaleTicket": true,
  "requiresPermit": false,
  "requiresPrevailingWage": false,
  "specialInstructions": "Radio channel 3 for dispatch",
  "jobCode": "JOB-2025-001",
  "poNumber": "PO-12345",
  "siteName": "Downtown Office Complex"
}
```

**Expected Response:**
```json
{
  "success": true,
  "load": {
    "id": "load-123",
    "status": "POSTED",
    "commodity": "3/4 inch washed gravel",
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
      "tier": "optimal",
      "suggestedTypes": ["End Dump", "Super 10", "Transfer Dump"]
    },
    "pricing": {
      "grossRevenue": "625.00"
    }
  }
}
```

**Expected Side Effects:**
- ✅ Load created with status = POSTED
- ✅ Equipment auto-matched (End Dump for gravel)
- ✅ Distance calculated (12 miles)
- ✅ Haul type = METRO (≤50 miles)
- ✅ Gross revenue = 50 tons × $12.50 = $625
- ✅ Notes include "Scale ticket required"

---

### **Test Case 18.2: Post Concrete Load (PER_YARD)**

**Request:**
```http
POST http://localhost:3000/api/customer/loads
Authorization: Bearer {customerToken}
Content-Type: application/json

{
  "materialType": "MATERIAL",
  "commodityDetails": "4000 PSI ready-mix concrete",
  "quantity": 12,
  "quantityUnit": "yards",
  "pickupLocation": "Capitol Concrete Plant",
  "pickupAddress": "789 Industrial Dr, Austin, TX 78721",
  "deliveryLocation": "Foundation Pour Site",
  "deliveryAddress": "321 New Building Rd, Austin, TX 78704",
  "pickupDate": "2025-01-21",
  "pickupTimeStart": "06:00",
  "pickupTimeEnd": "08:00",
  "deliveryDate": "2025-01-21",
  "deliveryTimeStart": "07:00",
  "deliveryTimeEnd": "09:00",
  "rateMode": "PER_YARD",
  "rateAmount": 145.00,
  "requiresScaleTicket": false,
  "specialInstructions": "Time-sensitive pour, must arrive by 7:30 AM"
}
```

**Expected Response:**
```json
{
  "success": true,
  "load": {
    "equipmentType": "Concrete Mixer",
    "grossRevenue": "1740.00",
    "haulType": "METRO"
  },
  "analysis": {
    "equipmentMatch": {
      "equipmentType": "Concrete Mixer",
      "tier": "optimal"
    }
  }
}
```

**Calculation:** 12 yards × $145/yard = $1,740

---

### **Test Case 18.3: Post Equipment Haul (PER_LOAD)**

**Request:**
```http
POST http://localhost:3000/api/customer/loads
Authorization: Bearer {customerToken}
Content-Type: application/json

{
  "materialType": "EQUIPMENT",
  "commodityDetails": "Excavator - CAT 320",
  "quantity": 1,
  "quantityUnit": "piece",
  "pickupLocation": "Equipment Dealer",
  "pickupAddress": "555 Equipment Blvd, Dallas, TX 75201",
  "deliveryLocation": "Job Site",
  "deliveryAddress": "789 Project Ave, San Antonio, TX 78201",
  "pickupDate": "2025-01-22",
  "deliveryDate": "2025-01-22",
  "rateMode": "PER_LOAD",
  "rateAmount": 850.00,
  "requiresPermit": true,
  "specialInstructions": "Overwidth load, requires escort"
}
```

**Expected Response:**
```json
{
  "success": true,
  "load": {
    "equipmentType": "Lowboy",
    "grossRevenue": "850.00",
    "miles": 78,
    "haulType": "REGIONAL"
  },
  "analysis": {
    "distance": 78,
    "haulType": "REGIONAL",
    "equipmentMatch": {
      "equipmentType": "Lowboy",
      "tier": "optimal"
    }
  }
}
```

---

### **Test Case 18.4: Missing Required Fields (Negative)**

**Request:**
```http
POST http://localhost:3000/api/customer/loads
Authorization: Bearer {customerToken}
Content-Type: application/json

{
  "materialType": "AGGREGATE",
  "commodityDetails": "Gravel"
  // Missing: quantity, addresses, dates, rate
}
```

**Expected Response:**
```json
{
  "error": "Missing required fields",
  "code": "MISSING_REQUIRED_FIELDS"
}
```

**Expected Status Code:** `400 Bad Request`

---

### **Test Case 18.5: Carrier Tries to Post Load (Negative)**

**Request:**
```http
POST http://localhost:3000/api/customer/loads
Authorization: Bearer {carrierToken}
```

**Expected Response:**
```json
{
  "error": "Only shipper organizations can post loads",
  "code": "INVALID_ORG_TYPE"
}
```

**Expected Status Code:** `403 Forbidden`

---

## ✅ **Success Criteria**

### **Load Creation:**
- [ ] Load created with all required fields
- [ ] Status = POSTED (automatically available for bidding)
- [ ] Equipment auto-matched based on commodity
- [ ] Distance calculated accurately
- [ ] Haul type detected (METRO/REGIONAL/OTR)
- [ ] Gross revenue calculated correctly

### **Equipment Matching:**
- [ ] Gravel → End Dump
- [ ] Concrete → Concrete Mixer
- [ ] Heavy Equipment → Lowboy
- [ ] Dirt → End Dump or Bottom Dump
- [ ] Steel Beams → Flatbed

### **Rate Modes:**
- [ ] PER_TON: grossRevenue = tons × rate
- [ ] PER_YARD: grossRevenue = yards × rate
- [ ] PER_LOAD: grossRevenue = flat rate
- [ ] PER_MILE: grossRevenue = miles × rate
- [ ] PER_TRIP: grossRevenue = trips × rate

### **Haul Type Detection:**
- [ ] ≤50 miles = METRO
- [ ] 51-300 miles = REGIONAL
- [ ] >300 miles = OTR

---

## 🔗 **Related Tests**
- TEST_025: Equipment Matching (validation)
- TEST_028: Haul Type Detection
- TEST_029: Rate Calculation
- TEST_031: Carrier Submit Bid (next step)


