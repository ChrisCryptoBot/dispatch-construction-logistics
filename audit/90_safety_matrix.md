# Safety Matrix - Never Delete / Critical Files

**Last Updated:** 2025-10-16T21:45:32Z  
**Purpose:** Denylist of files that must NEVER be deleted without explicit override

---

## 🔴 CRITICAL - NEVER DELETE

### Entry Points
- `src/index.js` - Main server entry point (now delegates to canonical)
- `src/index.canonical.js` - Canonical consolidated server
- `web/index.html` - Frontend entry point
- `web/src/main.tsx` - React application entry

### Authentication & Security
- `src/middleware/auth.js` - JWT authentication
- `src/middleware/errorHandler.js` - Error handling
- `src/middleware/rateLimiter.js` - Rate limiting
- `src/utils/jwt.js` - Token management

### Database & Prisma
- `prisma/schema.prisma` - Database schema
- `src/db/prisma.js` - Prisma client instance
- `prisma/seed.js` - Database seeding
- `prisma/migrations/` - All migration files

### Core Routes
- `src/routes/auth.js` - Authentication routes
- `src/routes/customer.js` - Customer routes
- `src/routes/carrier.js` - Carrier routes
- `src/routes/marketplace.js` - Marketplace routes
- `src/routes/users.js` - User management
- `src/routes/organizations.js` - Organization management

### Core Services
- `src/services/` - All service files (business logic)
- `src/utils/` - All utility files (shared helpers)

### Shared UI Components
- `web/src/components/` - All React components
- `web/src/pages/` - All page components
- `web/src/hooks/` - All custom hooks
- `web/src/contexts/` - All context providers

### Configuration
- `package.json` - Node dependencies
- `package-lock.json` - Dependency lock file
- `web/package.json` - Frontend dependencies
- `tsconfig.json` - TypeScript configuration
- `vite.config.ts` - Vite bundler configuration
- `.env.example` - Environment template
- `env.example` - Environment template (backend)

---

## 🟡 ACTIVE - REQUIRES REVIEW

### Testing & Automation
- `TESTING/RUN_CRITICAL_TESTS.js` ⭐ **ADDED 2025-10-16** - Automated test runner (36 documentation references)
- `test-matcher.js` - Equipment matcher tests
- `test-smoke-unit3.js` - Unit 3 smoke tests

### Tools & Scripts
- `tools/staging-bringup.js` - Staging validation
- `tools/backup-and-manifest.js` - Backup automation
- `tools/ref-scan.js` - Reference scanning
- `tools/refscan-unit3-cleanup.js` - Unit 3 reference scanner
- `tools/stage-move-unit3.js` - Unit 3 archival tool

---

## 🟢 SAFE TO REVIEW (Documentation)

### Status Documents (Already Archived in Units 1-2)
- Various `*_COMPLETE.md` files → Archived in `archive/staged/2025-01-16T15-30-00Z/`
- Duplicate audit reports → Archived in `archive/staged/2025-01-16T15-45-00Z/unit2/`

### One-Time Fix Scripts (Archived in Phase 2)
- `fix-import-paths-final.js` → Archived in `archive/staged/2025-10-16T21-45-32Z/phase2-scripts/`
- `fix-pagination-all-routes.sh` → Archived in `archive/staged/2025-10-16T21-45-32Z/phase2-scripts/`

---

## 🔧 Rollback Checklist

If a file was accidentally deleted:

1. **Check backups:**
   ```powershell
   cd C:\dev\dispatch\backups\<timestamp>\
   # Review manifest.json
   ```

2. **Check archive:**
   ```powershell
   cd C:\dev\dispatch\archive\staged\<timestamp>\
   # Review deletion_manifest.json
   ```

3. **Restore from archive:**
   ```powershell
   Move-Item archive\staged\<timestamp>\<file> <original-path>
   ```

4. **Restore from git:**
   ```powershell
   git log --all --full-history -- <file-path>
   git checkout <commit-sha> -- <file-path>
   ```

5. **Verify:**
   ```powershell
   npm run build  # Test build
   node src/index.canonical.js  # Test server start
   ```

---

## 📊 Cleanup History

| Date | Phase | Units | Files Archived | Status |
|------|-------|-------|----------------|--------|
| 2025-01-16 | Unit 1 (Docs) | U1-01 to U1-52 | 52 complete docs | ✅ Done |
| 2025-01-16 | Unit 2 (Duplicates) | U2-01 to U2-08 | 8 duplicate audits | ✅ Done |
| 2025-10-17 | Unit 3 (Optimized) | U3-01 to U3-03 | 3 optimized files | ✅ Done |
| 2025-10-16 | Phase 2 (Scripts) | P2-01, P2-02 | 2 fix scripts | ✅ Done |

---

## 🚫 Denylist Rules

1. **Never delete without scanning references first**
2. **Never delete if ANY active code reference exists**
3. **Never delete files in CRITICAL or ACTIVE sections above**
4. **Always create backup + manifest before any deletion**
5. **Always move to archive/ (never hard delete)**
6. **Always commit with descriptive message per unit**
7. **Always generate audit artifacts**
8. **Always run post-delete validation**

---

## ⚠️ Override Protocol

If you believe a file on this denylist should be deleted:

1. Open a GitHub issue with:
   - File path
   - Reason for deletion
   - Reference scan results
   - Proposed replacement (if any)

2. Get approval from team lead

3. Create dedicated PR with:
   - Full backup
   - Rollback instructions
   - Test coverage
   - Migration guide (if needed)

---

**Remember:** When in doubt, DON'T DELETE. Archive and wait for review.

