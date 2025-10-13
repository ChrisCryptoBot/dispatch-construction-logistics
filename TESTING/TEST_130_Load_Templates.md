# TEST_130: Load Templates (Save & Reuse)

## 📋 **Test Information**
- **Feature**: Load Template Creation & Reuse
- **Priority**: 🟢 MEDIUM
- **Endpoints**: 
  - `POST /api/templates/from-load/:loadId`
  - `POST /api/templates/:id/create-load`
  - `GET /api/templates`
- **Authentication**: Required (Customer)
- **Dependencies**: TEST_018 (Load created)

---

## 📝 **Test Cases**

### **Test Case 130.1: Create Template from Existing Load**

**Request:**
```http
POST http://localhost:3000/api/templates/from-load/{loadId}
Authorization: Bearer {customerToken}
Content-Type: application/json

{
  "name": "Weekly Gravel Delivery - Job Site Alpha"
}
```

**Expected Response:**
```json
{
  "success": true,
  "template": {
    "id": "template-123",
    "name": "Weekly Gravel Delivery - Job Site Alpha",
    "createdAt": "2025-01-15T10:30:00Z"
  }
}
```

**Expected Side Effects:**
- ✅ LoadTemplate record created
- ✅ Full load data stored in payload JSON
- ✅ Template owned by customer

---

### **Test Case 130.2: List Customer Templates**

**Request:**
```http
GET http://localhost:3000/api/templates
Authorization: Bearer {customerToken}
```

**Expected Response:**
```json
{
  "success": true,
  "templates": [
    {
      "id": "template-123",
      "name": "Weekly Gravel Delivery - Job Site Alpha",
      "createdAt": "2025-01-15T10:30:00Z"
    }
  ]
}
```

---

### **Test Case 130.3: Create Load from Template**

**Request:**
```http
POST http://localhost:3000/api/templates/template-123/create-load
Authorization: Bearer {customerToken}
Content-Type: application/json

{
  "pickupDate": "2025-01-22",
  "deliveryDate": "2025-01-22"
}
```

**Expected Response:**
```json
{
  "success": true,
  "load": {
    "id": "load-new-456",
    "status": "POSTED",
    "commodity": "3/4 washed gravel",
    "pickupDate": "2025-01-22"
  }
}
```

**Expected Side Effects:**
- ✅ New load created with template data
- ✅ Pickup/delivery dates overridden
- ✅ Status = POSTED (ready for bidding)
- ✅ All other fields from template

---

## ✅ **Success Criteria**

- [ ] Template created from load
- [ ] Template data stored correctly
- [ ] New load created from template
- [ ] Date overrides work
- [ ] Templates listed for customer
- [ ] Access control enforced

**Result:** PASS / FAIL

**Notes:**


