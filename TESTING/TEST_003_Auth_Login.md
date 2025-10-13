# TEST_003: User Login

## 📋 **Test Information**
- **Feature**: User Login Authentication
- **Priority**: 🔴 CRITICAL
- **Endpoint**: `POST /api/auth/login`
- **Authentication**: None (public)
- **Dependencies**: TEST_001 (Signup), TEST_002 (Email Verified)

---

## 📝 **Test Cases**

### **Test Case 3.1: Successful Login (Verified User)**

**Request:**
```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "john@acmetrucking.com",
  "password": "SecurePass123!"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
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
    "type": "CARRIER",
    "verified": false,
    "active": true
  }
}
```

**Expected Status Code:** `200 OK`

---

### **Test Case 3.2: Invalid Credentials (Negative)**

**Request:**
```json
{
  "email": "john@acmetrucking.com",
  "password": "WrongPassword123!"
}
```

**Expected Response:**
```json
{
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password"
  }
}
```

**Expected Status Code:** `401 Unauthorized`

---

### **Test Case 3.3: Email Not Verified (Negative)**

**Request:**
```json
{
  "email": "unverified@test.com",
  "password": "CorrectPassword123!"
}
```

**Expected Response:**
```json
{
  "error": {
    "code": "EMAIL_NOT_VERIFIED",
    "message": "Please verify your email",
    "requiresVerification": true,
    "email": "unverified@test.com"
  }
}
```

**Expected Status Code:** `403 Forbidden`

---

### **Test Case 3.4: User Not Found**

**Request:**
```json
{
  "email": "nonexistent@test.com",
  "password": "password123"
}
```

**Expected Response:**
```json
{
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password"
  }
}
```

**Expected Status Code:** `401 Unauthorized`

---

## ✅ **Success Criteria**

- [ ] Valid credentials return JWT token
- [ ] Token valid for 7 days
- [ ] Invalid password rejected
- [ ] Unverified email blocked
- [ ] Non-existent user rejected
- [ ] Organization details returned

**Result:** PASS / FAIL

**Notes:**


