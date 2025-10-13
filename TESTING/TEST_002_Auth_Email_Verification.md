# TEST_002: Email Verification

## 📋 **Test Information**
- **Feature**: Email Verification After Signup
- **Priority**: 🔴 CRITICAL
- **Endpoint**: `POST /api/auth/verify-email`
- **Authentication**: None (public)
- **Dependencies**: TEST_001 (User must be signed up)

---

## 🎯 **Test Objective**
Verify users can verify their email address and activate their account.

---

## 📝 **Test Cases**

### **Test Case 2.1: Successful Email Verification**

**Request:**
```http
POST http://localhost:3000/api/auth/verify-email
Content-Type: application/json

{
  "email": "john@acmetrucking.com",
  "code": "123456"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "VERIFIED",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-123",
    "email": "john@acmetrucking.com",
    "firstName": "John",
    "lastName": "Smith",
    "role": "admin",
    "emailVerified": true
  },
  "organization": {
    "id": "org-123",
    "name": "ACME Trucking",
    "type": "CARRIER"
  }
}
```

**Expected Status Code:** `200 OK`

**Expected Side Effects:**
- ✅ User.emailVerified = true
- ✅ User.accountStatus = ACTIVE
- ✅ User.activatedAt = current timestamp
- ✅ JWT token returned (valid for 7 days)

---

### **Test Case 2.2: Invalid Code (Negative)**

**Request:**
```json
{
  "email": "john@acmetrucking.com",
  "code": "wrong-code"
}
```

**Expected Response:**
```json
{
  "error": {
    "code": "INVALID_CODE",
    "message": "Invalid verification code"
  }
}
```

**Expected Status Code:** `400 Bad Request`

---

### **Test Case 2.3: User Not Found (Negative)**

**Request:**
```json
{
  "email": "nonexistent@test.com",
  "code": "123456"
}
```

**Expected Response:**
```json
{
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "No account found"
  }
}
```

**Expected Status Code:** `404 Not Found`

---

## ✅ **Success Criteria**

**Pass Conditions:**
- [ ] Valid code activates account
- [ ] JWT token returned
- [ ] User can login after verification
- [ ] Invalid code rejected
- [ ] Non-existent email rejected
- [ ] Account status changes to ACTIVE

**Result:** PASS / FAIL

**Notes:**


