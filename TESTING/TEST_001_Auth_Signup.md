# TEST_001: User Registration (Signup)

## 📋 **Test Information**
- **Feature**: User Registration / Signup
- **Priority**: 🔴 CRITICAL
- **Endpoint**: `POST /api/auth/signup`
- **Authentication**: None (public)
- **Dependencies**: None

---

## 🎯 **Test Objective**
Verify users can register as either CARRIER or SHIPPER organizations with proper validation and email verification flow.

---

## 📝 **Test Cases**

### **Test Case 1.1: Successful Carrier Signup**

**Request:**
```http
POST http://localhost:3000/api/auth/signup
Content-Type: application/json

{
  "orgName": "ACME Trucking",
  "orgType": "CARRIER",
  "email": "john@acmetrucking.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Smith",
  "phone": "555-123-4567"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "VERIFICATION_SENT",
  "email": "john@acmetrucking.com",
  "requiresVerification": true
}
```

**Expected Status Code:** `202 Accepted`

**Expected Side Effects:**
- ✅ Organization created with type=CARRIER
- ✅ User created with role=admin
- ✅ Email verification code logged to console
- ✅ User accountStatus = PENDING_VERIFICATION
- ✅ Password hashed (not stored plain)

---

### **Test Case 1.2: Successful Shipper Signup**

**Request:**
```http
POST http://localhost:3000/api/auth/signup
Content-Type: application/json

{
  "orgName": "ABC Construction",
  "orgType": "SHIPPER",
  "email": "sarah@abcconstruction.com",
  "password": "SecurePass456!",
  "firstName": "Sarah",
  "lastName": "Johnson",
  "phone": "555-987-6543"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "VERIFICATION_SENT",
  "email": "sarah@abcconstruction.com",
  "requiresVerification": true
}
```

**Expected Status Code:** `202 Accepted`

---

### **Test Case 1.3: Duplicate Email (Negative Test)**

**Request:**
```http
POST http://localhost:3000/api/auth/signup
Content-Type: application/json

{
  "orgName": "Duplicate Trucking",
  "orgType": "CARRIER",
  "email": "john@acmetrucking.com",
  "password": "AnotherPass123!",
  "firstName": "Jane",
  "lastName": "Doe"
}
```

**Expected Response:**
```json
{
  "error": {
    "code": "EMAIL_TAKEN",
    "message": "Email already registered"
  }
}
```

**Expected Status Code:** `409 Conflict`

---

### **Test Case 1.4: Missing Required Fields**

**Request:**
```http
POST http://localhost:3000/api/auth/signup
Content-Type: application/json

{
  "email": "incomplete@test.com",
  "password": "password123"
}
```

**Expected Response:**
```json
{
  "error": {
    "code": "SIGNUP_ERROR",
    "message": "Internal server error during signup"
  }
}
```

**Expected Status Code:** `500` or `400`

---

## ✅ **Success Criteria**

- [ ] Carrier organization created successfully
- [ ] Shipper organization created successfully
- [ ] User account created with admin role
- [ ] Password properly hashed (bcrypt)
- [ ] Email verification code generated
- [ ] Duplicate email rejected
- [ ] User account status = PENDING_VERIFICATION
- [ ] Verification code logged to console (mock email)

---

## 🐛 **Known Issues / Notes**

- Mock email service logs code to console (code is always `123456` for testing)
- No actual email sent in development mode
- Organization verified=false until further steps
- Carrier needs MC/DOT numbers for FMCSA verification (can be added later)

---

## 🔗 **Related Tests**
- TEST_002: Email Verification (next step)
- TEST_003: Login (after verification)
- TEST_060: FMCSA Verification (for carriers with MC/DOT)


