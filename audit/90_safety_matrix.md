# Safety Matrix - Critical Files Protection

## 🚨 NEVER DELETE - Critical Runtime Files

### **Entry Points**
```
src/index.js                    - Main server entry point
web/src/main.tsx               - Vite/React entry point
web/src/App.tsx                - React app root component
package.json                   - Node.js dependencies
web/package.json              - Frontend dependencies
```

**Risk**: **CRITICAL** - Deletion breaks entire application
**Evidence**: Referenced in deployment scripts, build processes

### **Authentication & Security**
```
src/middleware/auth.js         - JWT authentication
src/middleware/rateLimit.js    - API rate limiting
src/middleware/rateLimiter.js  - Rate limiting service
web/src/contexts/AuthContext-fixed.tsx - Auth state management
```

**Risk**: **CRITICAL** - Deletion breaks security
**Evidence**: Imported by all protected routes

### **Database & Core Services**
```
src/db/prisma.js               - Database connection
prisma/schema.prisma           - Database schema
src/config/redis.js            - Redis configuration
src/config/queue.js            - Queue configuration
```

**Risk**: **CRITICAL** - Deletion breaks data layer
**Evidence**: Imported by all data operations

### **Payment Integration**
```
src/adapters/stripeAdapter.js  - Stripe payment processing
src/services/paymentService.js - Payment business logic
src/routes/payments.js         - Payment API endpoints
```

**Risk**: **CRITICAL** - Deletion breaks billing
**Evidence**: Referenced in payment flows

## ⚠️ HIGH RISK - Core Business Logic

### **Load Management**
```
src/routes/loads.js            - Load CRUD operations
src/routes/dispatch.js         - Dispatch coordination
src/services/equipmentMatcher.js - Load matching
```

**Risk**: **HIGH** - Core business functionality
**Evidence**: Imported by load management pages

### **User Management**
```
src/routes/users.js            - User CRUD operations
src/routes/organizations.js    - Organization management
src/routes/carrier.js          - Carrier operations
src/routes/customer.js         - Customer operations
```

**Risk**: **HIGH** - User management system
**Evidence**: Imported by user interfaces

### **Document Processing**
```
src/services/eSignatureService.js - Document signing
src/routes/esignature.js       - E-signature endpoints
src/services/documentService.js - Document management
```

**Risk**: **HIGH** - Legal document processing
**Evidence**: Referenced in document workflows

## 🔒 MEDIUM RISK - Feature Components

### **Frontend Pages**
```
web/src/pages/carrier/CarrierDashboard.tsx
web/src/pages/customer/CustomerDashboard.tsx
web/src/pages/LoginPage.tsx
web/src/pages/RegisterPage.tsx
```

**Risk**: **MEDIUM** - Core user interfaces
**Evidence**: Referenced in routing configuration

### **Shared Components**
```
web/src/components/shared/PageContainer.tsx
web/src/components/shared/ProtectedRoute.tsx
web/src/components/S1LayoutConstruction.tsx
web/src/components/S1Sidebar.tsx
```

**Risk**: **MEDIUM** - Shared UI components
**Evidence**: Imported by multiple pages

## ✅ LOW RISK - Safe to Modify

### **Styling & Themes**
```
web/src/themes/darkTheme.ts
web/src/themes/lightTheme.ts
web/src/styles/*.css
```

**Risk**: **LOW** - Visual styling only
**Evidence**: Imported by theme context

### **Utility Functions**
```
web/src/utils/formatters.ts
src/utils/time.js
src/utils/pagination.js
```

**Risk**: **LOW** - Helper functions
**Evidence**: Imported by multiple components

## 🗂️ DOCUMENTATION - Safe to Archive

### **Status Reports**
```
*_COMPLETE.md files (52 files)
*_AUDIT_REPORT.md files (8 files)
*_SUMMARY.md files (10 files)
```

**Risk**: **NONE** - Historical documentation
**Evidence**: No imports, documentation only

## 🔄 Rollback Checklist

### **Before Any Deletions:**
1. ✅ Create full repository backup
2. ✅ Document current working state
3. ✅ Test all critical user flows
4. ✅ Verify payment processing
5. ✅ Check authentication flows

### **After Deletions:**
1. ✅ Run full test suite
2. ✅ Verify build processes
3. ✅ Check deployment scripts
4. ✅ Test critical user journeys
5. ✅ Validate API endpoints

## 📊 Risk Assessment Matrix

| File Category | Count | Risk Level | Action |
|---------------|-------|------------|---------|
| Entry Points | 5 | CRITICAL | NEVER DELETE |
| Auth/Security | 4 | CRITICAL | NEVER DELETE |
| Database | 4 | CRITICAL | NEVER DELETE |
| Payments | 3 | CRITICAL | NEVER DELETE |
| Core Business | 8 | HIGH | INVESTIGATE FIRST |
| User Management | 4 | HIGH | INVESTIGATE FIRST |
| Documents | 3 | HIGH | INVESTIGATE FIRST |
| Frontend Pages | 20+ | MEDIUM | SAFE TO REFACTOR |
| Components | 30+ | MEDIUM | SAFE TO REFACTOR |
| Utilities | 10+ | LOW | SAFE TO MODIFY |
| Documentation | 80+ | NONE | SAFE TO ARCHIVE |

## 🎯 Safe Cleanup Priority

### **Phase 1: Zero Risk (Immediate)**
- Archive all `*_COMPLETE.md` files
- Remove duplicate audit reports
- Clean up fix scripts

### **Phase 2: Low Risk (After Testing)**
- Investigate optimized file duplicates
- Standardize import patterns
- Remove unused utility functions

### **Phase 3: Medium Risk (Careful Planning)**
- Refactor component structure
- Optimize page organization
- Consolidate similar services

**Total Files Safe to Clean**: 60+ files
**Estimated Space Savings**: 5-10 MB
**Risk Level**: Very Low (documentation focus)


