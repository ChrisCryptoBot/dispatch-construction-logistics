# Canonical Entry Freeze Rationale

**Date:** 2025-10-17  
**Phase:** Unit 3 Cleanup - Canonical Lock  
**File:** `src/index.js`

## Why This Change

During Unit 3 Safe Consolidation, we successfully merged the optimized and original server implementations into a single canonical version (`src/index.canonical.js`) that preserves all functionality while providing feature flag controls for safe deployment.

The staging verification (`audit/runs/2025-10-17T01-58-06Z`) demonstrated that the canonical server operates correctly with all middleware, routes, and health endpoints functioning as expected.

## What Changed

The `src/index.js` entry point previously contained an environment toggle (`USE_OPTIMIZED_ENTRY`) that allowed switching between the canonical and optimized implementations. This toggle has been **permanently removed** and replaced with an unconditional delegation to the canonical server.

**Before:**
```javascript
const USE_OPTIMIZED_ENTRY = process.env.USE_OPTIMIZED_ENTRY === 'true';

if (!USE_OPTIMIZED_ENTRY) {
  console.log('🔄 Using canonical consolidated server with feature flags');
  module.exports = require('./index.canonical');
  return;
}
// ... 220+ lines of legacy optimized code ...
```

**After:**
```javascript
console.log('🔄 Using canonical consolidated server');
module.exports = require('./index.canonical');

// Legacy fallback code below (kept for reference, never executed)
if (false) {
  // ... legacy code wrapped for reference ...
}
```

The legacy code remains in the file but is unreachable, preserving it for reference without affecting runtime behavior.

## Safety Guarantees

1. **Zero Active References:** Pre-PR reference scan confirmed no active code references `*.optimized.js` files
2. **Staging Verified:** Canonical server passed health checks and metrics probes
3. **Feature Flags:** All optimizations remain controllable via environment flags
4. **Rollback Available:** Archived files can be restored from `archive/staged/<ts>/unit3-optimized/`

## Next Steps

The `*.optimized.js` files will be stage-moved to the archive, and a final reference scan will confirm complete removal from active code paths.

