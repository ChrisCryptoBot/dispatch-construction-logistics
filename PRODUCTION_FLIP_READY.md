# Production Flip - Ready to Execute

**Date:** 2025-10-17  
**PRs Merged:** #1 (Unit 3), #2 (Phase 2)  
**Staging:** ✅ SUCCESS (`audit/runs/2025-10-17T03-17-16Z`)

---

## ⚠️ REQUIRED: Your Production Infrastructure Details

Before proceeding, I need to know:

1. **Production domain:** (e.g., `api.yoursaas.com` or `yoursaas.com`)
2. **Deployment method:** 
   - [ ] Railway
   - [ ] Heroku
   - [ ] DigitalOcean
   - [ ] AWS/Azure
   - [ ] Manual VPS
   - [ ] Other: __________

3. **Current deployment:** Is your app already running in production?
   - [ ] Yes (existing production)
   - [ ] No (first deployment)

4. **Log access:** How do you access production logs?
   - [ ] Platform dashboard (Railway/Heroku)
   - [ ] SSH to server
   - [ ] Logging service (Papertrail/Datadog)
   - [ ] Other: __________

---

## 🚀 Deployment Steps (Adapt to Your Platform)

### Option A: Railway/Heroku (Git-based)

```powershell
cd C:\dev\dispatch

# Ensure you're on master with both PRs merged
git checkout master
git pull origin master

# Add production remote if not exists
git remote add production <your-platform-git-url>

# Deploy
git push production master

# Or for Railway:
railway up

# Or for Heroku:
git push heroku master
```

### Option B: DigitalOcean/VPS (SSH)

```powershell
# SSH to your server
ssh user@your-server-ip

# Pull latest code
cd /var/www/dispatch
git pull origin master

# Install dependencies
npm ci --production

# Restart with PM2 or systemd
pm2 restart dispatch
# or
sudo systemctl restart dispatch
```

### Option C: Docker

```powershell
cd C:\dev\dispatch

# Build image
docker build -t dispatch-canonical:v1.0.0 .

# Push to registry
docker tag dispatch-canonical:v1.0.0 your-registry/dispatch:latest
docker push your-registry/dispatch:latest

# Deploy (adjust for your orchestration)
kubectl set image deployment/dispatch dispatch=your-registry/dispatch:latest
# or
docker-compose up -d
```

---

## 📋 Environment Variables (Set in Your Platform)

Copy these to your production environment:

```env
# Core Configuration
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=<your-production-database-url>

# Redis (if used)
REDIS_URL=<your-redis-url>

# Unit 3 Canonical Settings (IMPORTANT)
USE_OPTIMIZED_ENTRY=false
USE_OPTIMIZED_FEATURES=false

# Feature Flags
ENABLE_COMPRESSION=true
ENABLE_METRICS=true
ENABLE_REQUEST_LOGGING=true

# Auth
JWT_SECRET=<your-secret>
JWT_EXPIRATION=7d

# Email (if using SendGrid)
SENDGRID_API_KEY=<your-key>
SENDGRID_FROM_EMAIL=<your-from-email>

# Stripe (if using)
STRIPE_SECRET_KEY=<your-key>
STRIPE_WEBHOOK_SECRET=<your-webhook-secret>
```

---

## ✅ Verification Commands

### Step 1: Quick Health Check

Replace `YOUR_DOMAIN` with your actual production domain:

```powershell
cd C:\dev\dispatch

# Run automated verification
.\tools\prod-verify.ps1 -Domain "YOUR_DOMAIN.com"

# Example:
# .\tools\prod-verify.ps1 -Domain "api.dispatch-logistics.com"
```

### Step 2: Manual Verification (if needed)

```powershell
# Health endpoint
curl https://YOUR_DOMAIN.com/health

# Expected: {"status":"healthy",...}

# Metrics endpoint
curl https://YOUR_DOMAIN.com/metrics

# Expected: Metrics output (JSON or Prometheus format)
```

### Step 3: Monitor Logs for Errors

**For Railway/Heroku:**
```powershell
railway logs
# or
heroku logs --tail --app your-app-name
```

**For SSH/VPS:**
```bash
# PM2 logs
pm2 logs dispatch --lines 100

# Or system logs
tail -f /var/log/dispatch/error.log
journalctl -u dispatch.service -f
```

### Step 4: Watch for 10-15 Minutes

Set a timer and monitor:
- Error rates (should be stable or zero)
- Response times (should be normal)
- User reports (should be quiet)

---

## 📊 What to Report Back

After deployment, provide these three lines:

```
HEALTH_OK or HEALTH_FAIL
METRICS_OK or METRICS_FAIL
ERROR_DELTA=X (number of new errors in 10-15 min window)
```

Example good response:
```
HEALTH_OK
METRICS_OK
ERROR_DELTA=0
```

---

## 🔧 Optional: Canary Optimized Features

**Only do this AFTER the base deployment is stable for 15+ minutes:**

### Enable Features for Testing

Update environment variable in your platform:
```env
USE_OPTIMIZED_FEATURES=true
```

Restart the service and re-run verification:

```powershell
.\tools\prod-verify.ps1 -Domain "YOUR_DOMAIN.com"
```

Monitor for another 10-15 minutes. If any issues:

```env
USE_OPTIMIZED_FEATURES=false
```

Restart again.

---

## 🏷️ Tag Release

After successful deployment:

```powershell
cd C:\dev\dispatch
git tag v1.0.0-unit3-canonical
git push origin v1.0.0-unit3-canonical
```

---

## 🔄 Rollback Plan

If anything goes wrong:

### Method 1: Revert Environment Variable (Fastest)

```env
USE_OPTIMIZED_FEATURES=false
```

Restart service.

### Method 2: Git Revert (Code-level)

```powershell
cd C:\dev\dispatch
git revert f7cdb5b e47d485
git push production master
```

### Method 3: Restore from Archive

```powershell
Move-Item archive\staged\2025-10-17\unit3-optimized\* src\
git add -A
git commit -m "rollback: restore optimized files"
git push production master
```

---

## 📝 Release Documentation

After deployment succeeds, I'll create:

`audit/releases/2025-10-17-unit3-canonical.md`

With your production verification results.

---

## ❓ Need Help?

Provide me with:
1. Your production platform (Railway/Heroku/VPS/etc.)
2. Your production domain
3. How you currently deploy

I'll give you platform-specific deployment commands!

