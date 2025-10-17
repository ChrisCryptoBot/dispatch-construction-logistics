# 🚀 Unit 3 Consolidation - Staging Readiness Checklist

## 📊 **EXECUTIVE SUMMARY**

**Date:** January 16, 2025  
**Operation:** Unit 3 Safe Consolidation - Staging Deployment  
**Status:** ✅ **READY FOR STAGING**  
**Risk Level:** Low (with proper testing)  

---

## 🎯 **DEPLOYMENT OBJECTIVES**

### **Primary Goals:**
- ✅ Deploy consolidated server with feature flags
- ✅ Maintain 100% backward compatibility
- ✅ Enable gradual feature rollout
- ✅ Provide safe rollback capability
- ✅ Monitor performance improvements

### **Success Criteria:**
- All existing endpoints functional
- New optimized features available
- Performance improvements measurable
- No breaking changes for clients
- Safe rollback mechanism working

---

## 📋 **PRE-DEPLOYMENT CHECKLIST**

### **🔧 Environment Configuration**

#### **Required Environment Variables:**
```bash
# Server Configuration (Unit 3 Consolidation)
USE_OPTIMIZED_ENTRY=false          # Use canonical consolidated version
USE_OPTIMIZED_FEATURES=false       # Start with features disabled
ENABLE_COMPRESSION=true            # Enable response compression
ENABLE_METRICS=true                # Enable metrics endpoint
ENABLE_REQUEST_LOGGING=true        # Enable request logging

# Existing Environment Variables (unchanged)
DATABASE_URL="postgresql://..."
JWT_SECRET="your-jwt-secret"
PORT=3000
NODE_ENV=staging
```

#### **Environment Setup Commands:**
```bash
# Copy environment template
cp env.example .env

# Edit .env file with staging values
# Ensure all Unit 3 variables are set as shown above
```

### **📦 Dependencies Verification**

#### **Required Dependencies:**
- ✅ `express` - Web framework
- ✅ `cors` - CORS middleware  
- ✅ `helmet` - Security headers
- ✅ `compression` - Response compression
- ✅ `express-rate-limit` - Rate limiting
- ✅ `prisma` - Database ORM
- ✅ `axios` - HTTP client (for smoke tests)

#### **Dependency Check Commands:**
```bash
# Check if all dependencies are installed
npm list express cors helmet compression express-rate-limit @prisma/client

# Install missing dependencies if needed
npm install compression
```

---

## 🚀 **DEPLOYMENT STEPS**

### **Step 1: Pre-Deployment Verification**

#### **Code Quality Checks:**
```bash
# 1. Verify all files are in place
ls -la src/index.canonical.js
ls -la src/routes/customer.js
ls -la src/routes/marketplace.js

# 2. Check environment variables
grep -E "USE_OPTIMIZED|ENABLE_" .env

# 3. Verify no syntax errors
node -c src/index.canonical.js
node -c src/routes/customer.js
node -c src/routes/marketplace.js
```

#### **Backup Verification:**
```bash
# Verify backup exists
ls -la backups/2025-01-16T16-15-00Z/unit3-consolidation/manifest.json

# Check backup integrity
cat backups/2025-01-16T16-15-00Z/unit3-consolidation/manifest.json
```

### **Step 2: Server Startup**

#### **Start Commands:**
```bash
# Option 1: Using canonical consolidated version (RECOMMENDED)
USE_OPTIMIZED_ENTRY=false npm run dev

# Option 2: Using optimized version (for comparison)
USE_OPTIMIZED_ENTRY=true npm run dev

# Option 3: Using package.json script
npm run dev
```

#### **Expected Startup Logs:**
```
🔄 Using canonical consolidated server with feature flags
🚀 Dispatch Construction Logistics API running on port 3000
📊 Health check: http://localhost:3000/health
📈 Metrics: http://localhost:3000/metrics
🔧 API docs: http://localhost:3000/
🏗️  Equipment matcher: http://localhost:3000/api/dispatch
🛡️  Rate limiting: 100 req/15min (Auth: 5 req/15min)
⚡ Features: optimized=false, compression=true, metrics=true
```

### **Step 3: Smoke Testing**

#### **Run Smoke Tests:**
```bash
# Execute comprehensive smoke tests
node test-smoke-unit3.js

# Expected output: All tests should pass
# Check results in: audit/runs/2025-01-16T16-15-00Z/smoke-unit3.txt
```

#### **Manual Testing:**
```bash
# 1. Health endpoint
curl http://localhost:3000/health

# 2. Root endpoint
curl http://localhost:3000/

# 3. Metrics endpoint (if enabled)
curl http://localhost:3000/metrics

# 4. Customer my-loads endpoint (should return 401 - auth required)
curl http://localhost:3000/api/customer/my-loads

# 5. Marketplace loads endpoint (should return 401 - auth required)
curl http://localhost:3000/api/marketplace/loads
```

### **Step 4: Feature Testing**

#### **Test Feature Flags:**
```bash
# Test with features disabled
USE_OPTIMIZED_FEATURES=false npm run dev
# Verify basic functionality

# Test with features enabled
USE_OPTIMIZED_FEATURES=true npm run dev
# Verify enhanced functionality

# Test individual features
ENABLE_COMPRESSION=false npm run dev
ENABLE_METRICS=false npm run dev
ENABLE_REQUEST_LOGGING=false npm run dev
```

#### **Performance Testing:**
```bash
# Test compression
curl -H "Accept-Encoding: gzip" http://localhost:3000/health

# Test rate limiting
for i in {1..10}; do curl http://localhost:3000/api/health; done

# Test response times
curl -w "@curl-format.txt" http://localhost:3000/health
```

---

## 🔍 **MONITORING & VERIFICATION**

### **Health Checks**

#### **Basic Health Check:**
```bash
curl http://localhost:3000/health | jq
```

**Expected Response (features disabled):**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-16T16:15:00.000Z",
  "version": "1.0.0",
  "service": "Dispatch Construction Logistics API",
  "env": "staging"
}
```

**Expected Response (features enabled):**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-16T16:15:00.000Z",
  "version": "1.0.0",
  "service": "Dispatch Construction Logistics API",
  "env": "staging",
  "database": "connected",
  "redis": "disconnected",
  "uptime": 123.456,
  "features": {
    "compression": true,
    "metrics": true,
    "requestLogging": true
  }
}
```

#### **Metrics Check:**
```bash
curl http://localhost:3000/metrics | jq
```

**Expected Response:**
```json
{
  "timestamp": "2025-01-16T16:15:00.000Z",
  "uptime": 123.456,
  "memory": {
    "rss": 45678912,
    "heapTotal": 20971520,
    "heapUsed": 12345678,
    "external": 1234567
  },
  "nodeVersion": "v18.17.0",
  "features": {
    "compression": true,
    "requestLogging": true
  }
}
```

### **Performance Monitoring**

#### **Key Metrics to Monitor:**
- **Response Times:** Should be similar or better than original
- **Memory Usage:** Monitor for memory leaks
- **CPU Usage:** Should be stable
- **Error Rates:** Should remain low
- **Throughput:** Should maintain or improve

#### **Monitoring Commands:**
```bash
# Monitor server logs
tail -f logs/server.log

# Monitor system resources
htop

# Monitor network connections
netstat -tulpn | grep :3000
```

---

## 🛡️ **ROLLBACK PROCEDURES**

### **Quick Rollback (Environment Variables)**

#### **Disable Optimized Features:**
```bash
# Disable all optimized features
USE_OPTIMIZED_FEATURES=false
ENABLE_COMPRESSION=false
ENABLE_METRICS=false
ENABLE_REQUEST_LOGGING=false

# Restart server
npm run dev
```

#### **Switch to Original Version:**
```bash
# Use original optimized entry point
USE_OPTIMIZED_ENTRY=true

# Restart server
npm run dev
```

### **Full Rollback (File Restoration)**

#### **Restore from Backup:**
```bash
# Restore original files from backup
cp backups/2025-01-16T16-15-00Z/unit3-consolidation/src/index.js src/index.js
cp backups/2025-01-16T16-15-00Z/unit3-consolidation/src/routes/customer.js src/routes/customer.js
cp backups/2025-01-16T16-15-00Z/unit3-consolidation/src/routes/marketplace.js src/routes/marketplace.js

# Restart server
npm run dev
```

#### **Git Rollback:**
```bash
# If using git, rollback to previous commit
git log --oneline -10
git reset --hard <previous-commit-hash>
npm run dev
```

---

## 📊 **SUCCESS CRITERIA**

### **Functional Requirements**
- ✅ **Server Boots:** Server starts without errors
- ✅ **Health Endpoint:** Returns healthy status
- ✅ **All Routes:** Existing endpoints respond correctly
- ✅ **Authentication:** Auth endpoints work as expected
- ✅ **Database:** Database connections stable
- ✅ **Rate Limiting:** Rate limiting functions properly

### **Performance Requirements**
- ✅ **Response Time:** ≤ 200ms for health endpoint
- ✅ **Memory Usage:** Stable memory consumption
- ✅ **Error Rate:** ≤ 1% error rate
- ✅ **Throughput:** Maintains existing throughput

### **Feature Requirements**
- ✅ **Compression:** Response compression working
- ✅ **Metrics:** Metrics endpoint accessible
- ✅ **Logging:** Request logging functional
- ✅ **Feature Flags:** All feature flags working

---

## 🚨 **TROUBLESHOOTING**

### **Common Issues & Solutions**

#### **Server Won't Start**
```bash
# Check for syntax errors
node -c src/index.canonical.js

# Check environment variables
cat .env | grep -E "USE_OPTIMIZED|ENABLE_"

# Check dependencies
npm list compression
```

#### **Health Check Fails**
```bash
# Check database connection
psql $DATABASE_URL -c "SELECT 1"

# Check Redis connection (if used)
redis-cli ping

# Check server logs
tail -f logs/server.log
```

#### **Performance Issues**
```bash
# Disable compression temporarily
ENABLE_COMPRESSION=false npm run dev

# Disable request logging
ENABLE_REQUEST_LOGGING=false npm run dev

# Check system resources
htop
```

#### **Feature Flags Not Working**
```bash
# Verify environment variables
echo $USE_OPTIMIZED_FEATURES
echo $ENABLE_COMPRESSION
echo $ENABLE_METRICS

# Restart server after changes
npm run dev
```

---

## 📞 **SUPPORT & ESCALATION**

### **For Issues:**
1. **Check logs:** `tail -f logs/server.log`
2. **Verify environment:** `cat .env`
3. **Run smoke tests:** `node test-smoke-unit3.js`
4. **Check health:** `curl http://localhost:3000/health`

### **Escalation Path:**
1. **Level 1:** Environment variable adjustments
2. **Level 2:** Feature flag toggles
3. **Level 3:** File rollback from backup
4. **Level 4:** Git rollback to previous state

### **Emergency Contacts:**
- **Technical Lead:** Review merge plan and diff reports
- **DevOps:** Infrastructure and deployment issues
- **Database Admin:** Database connection problems

---

## ✅ **FINAL CHECKLIST**

### **Pre-Deployment:**
- [ ] Environment variables configured
- [ ] Dependencies installed
- [ ] Backup verified
- [ ] Code syntax checked

### **Deployment:**
- [ ] Server starts successfully
- [ ] Health endpoint responds
- [ ] Smoke tests pass
- [ ] Manual tests complete

### **Post-Deployment:**
- [ ] Performance metrics stable
- [ ] Error rates normal
- [ ] Feature flags working
- [ ] Rollback procedures tested

---

## 🎯 **NEXT STEPS AFTER SUCCESSFUL STAGING**

### **Phase 1: Gradual Feature Rollout**
1. **Enable compression:** `ENABLE_COMPRESSION=true`
2. **Enable metrics:** `ENABLE_METRICS=true`
3. **Enable logging:** `ENABLE_REQUEST_LOGGING=true`
4. **Monitor performance:** Watch for improvements

### **Phase 2: Optimized Features**
1. **Enable optimized features:** `USE_OPTIMIZED_FEATURES=true`
2. **Test new endpoints:** `/api/customer/my-loads`, `/api/marketplace/bid`
3. **Monitor performance:** Measure improvements
4. **Client testing:** Verify backward compatibility

### **Phase 3: Production Deployment**
1. **Blue-green deployment:** Deploy alongside existing
2. **Gradual traffic shift:** Move traffic gradually
3. **Performance monitoring:** Continuous monitoring
4. **Full rollout:** Complete migration

---

**🎯 FINAL RECOMMENDATION: Proceed with staging deployment using canonical consolidated version with feature flags disabled initially. Enable features gradually while monitoring performance and stability.**

---

*Staging checklist completed: January 16, 2025*  
*Status: ✅ Ready for staging deployment*  
*Next action: Execute staging deployment with monitoring*


