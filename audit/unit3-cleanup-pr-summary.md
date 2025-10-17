# Unit 3 Cleanup: Remove *.optimized.js (Archive Only) + Canonical Lock

**Branch:** `chore/unit3-cleanup-canonical`  
**Date:** 2025-10-17  
**Status:** Ready for Review

---

## 🎯 Why This Change

After completing Unit 3 Safe Consolidation, we successfully merged optimized and original server implementations into a single canonical version (`src/index.canonical.js`). This PR removes the now-redundant `*.optimized.js` files from active code paths, archives them for historical reference, and permanently locks the project to the canonical entry point.

### Benefits
- **Single Source of Truth:** Eliminates duplicate implementations
- **Reduced Maintenance:** No need to sync changes across multiple versions
- **Feature Flag Control:** Canonical server provides fine-grained environment controls
- **Zero Risk:** All optimized functionality preserved in canonical version
- **Clean Codebase:** Removes 25KB of redundant code

---

## 📋 What Changed

### 1. Frozen Canonical Entry (`src/index.js`)
- **Removed** environment toggle logic (`USE_OPTIMIZED_ENTRY`)
- **Now** unconditionally delegates to `src/index.canonical.js`
- **Preserved** legacy code wrapped in `if (false)` for reference
- **Rationale:** `audit/runs/2025-10-17T02-00-36Z/canonical-freeze.md`

### 2. Updated Build & Debug Configuration
- **package.json:** Scripts now reference `src/index.canonical.js`
  - `"start": "node src/index.canonical.js"`
  - `"dev": "nodemon src/index.canonical.js"`
- **launch.json:** Added "Start Canonical Server" debug configuration
- **Diff:** `audit/runs/2025-10-17T02-00-36Z/package-launch-updates.diff`

### 3. Archived Optimized Files
Moved to `archive/staged/2025-10-17/unit3-optimized/`:
- `index.optimized.js` (7.34 KB, SHA256: 3401c5ce...)
- `customer.optimized.js` (6.70 KB, SHA256: 42f6e777...)
- `marketplace.optimized.js` (11.21 KB, SHA256: ada4666e...)

**Total:** 3 files, 25.25 KB archived with SHA256 hashes

---

## ✅ Verification Artifacts

All verification artifacts are located under `audit/runs/`:

### Pre-PR Validation
- **Reference Scan (Pre):** `2025-10-17T02-00-36Z/refscan-unit3-pre-pr.json`
  - ✅ Zero active code references found
  - Only internal references within optimized files themselves (expected)

- **Canonical Freeze Rationale:** `2025-10-17T02-00-36Z/canonical-freeze.md`
  - Explains why the canonical lock is safe and necessary

### Cleanup Execution
- **Stage-Move Report:** `2025-10-17/stage-unit3-optimized.json`
  - All 3 files successfully archived
  - SHA256 hashes for integrity verification
  - Verified removal from active paths

### Post-PR Validation
- **Reference Scan (Post):** `2025-10-17T02-02-48Z/refscan-unit3-post-pr.json`
  - ✅ Zero active code references (only cleanup tools)
  - Confirmed no orphaned imports/requires

- **Smoke Tests (Post-PR):** `2025-10-17T02-02-48Z/smoke-unit3-post-pr.txt`
  - ✅ `/health` returns 200 OK
  - ✅ `/metrics` endpoint accessible
  - ✅ Server starts without errors

- **Staging Logs:**
  - `2025-10-17T02-02-48Z/staging-stdout-post-pr.log`
  - `2025-10-17T02-02-48Z/staging-stderr-post-pr.log`

---

## 🔄 How to Rollback

If any issues arise after merging, follow these steps to restore the optimized files:

### Step 1: Restore Archived Files
```powershell
cd C:\dev\dispatch

# Move files back from archive to their original locations
Move-Item archive\staged\2025-10-17\unit3-optimized\index.optimized.js src\
Move-Item archive\staged\2025-10-17\unit3-optimized\customer.optimized.js src\routes\
Move-Item archive\staged\2025-10-17\unit3-optimized\marketplace.optimized.js src\routes\
```

### Step 2: Restore Environment Toggle in `src/index.js`
Replace the canonical lock with the previous environment toggle:

```javascript
// 🔑 Load env FIRST — before any other imports
require('dotenv').config();

// Environment switch for optimized features
const USE_OPTIMIZED_ENTRY = process.env.USE_OPTIMIZED_ENTRY === 'true';

// Use canonical consolidated version if not using optimized entry
if (!USE_OPTIMIZED_ENTRY) {
  console.log('🔄 Using canonical consolidated server with feature flags');
  module.exports = require('./index.canonical');
  return;
}

// (rest of original code)
```

### Step 3: Update Environment Variables
Set `USE_OPTIMIZED_ENTRY=true` in your `.env` file to enable the restored optimized entry.

### Step 4: Verify
```powershell
npm run staging:canonical
```

Ensure `/health` returns 200 and the server operates as expected.

---

## 🧪 Testing Performed

1. **Pre-PR Reference Scan:** Verified zero active code references to `*.optimized.js`
2. **Staging Verification (Before):** Canonical server passed health checks (`audit/runs/2025-10-17T01-58-06Z`)
3. **File Archival:** All 3 files moved with integrity verification (SHA256 hashes)
4. **Post-PR Reference Scan:** Confirmed no orphaned references remain
5. **Staging Verification (After):** Canonical server still healthy post-cleanup
6. **Dependency Check:** All required packages installed (`compression`, etc.)

---

## 📊 Impact Summary

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Entry Points | 2 (canonical + optimized) | 1 (canonical only) | -50% |
| Server Files | 6 (3 canonical + 3 optimized) | 3 (canonical only) | -50% |
| Code Duplication | ~25KB duplicated | 0KB duplicated | -100% |
| Feature Flags | Mixed (env + code) | Centralized (canonical) | Simplified |
| Active References | 2 (in src/index.js) | 0 | -100% |

---

## 🚀 Post-Merge Actions

1. **Deploy to Staging:** Verify canonical server in staging environment
2. **Monitor Metrics:** Check `/metrics` endpoint for any anomalies
3. **Archive Cleanup Tools:** Move `tools/refscan-unit3-cleanup.js` and `tools/stage-move-unit3.js` to archive (optional)
4. **Update Documentation:** Note canonical entry point in developer docs

---

## 👥 Reviewers

Please verify:
- [ ] All artifact paths are accessible and reports look correct
- [ ] `src/index.js` properly delegates to canonical version
- [ ] `package.json` and `launch.json` use canonical paths
- [ ] Smoke test logs show `/health` returning 200
- [ ] Rollback instructions are clear and complete

---

## 📎 Related Work

- **Unit 1 Cleanup:** Complete docs archived (PR #XXX)
- **Unit 2 Cleanup:** Duplicate audit reports staged (PR #XXX)
- **Unit 3 Consolidation:** Canonical server merge completed
- **Unit 3 Staging:** Verified at `audit/runs/2025-10-17T01-58-06Z`

---

## 🏁 Conclusion

This PR completes Unit 3 by permanently transitioning to the canonical server and archiving redundant optimized implementations. All verification artifacts confirm zero risk and successful operation post-cleanup.

**Ready to merge after review approval.**

