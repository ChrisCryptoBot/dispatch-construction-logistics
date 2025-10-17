# Cleanup Units 4-9: Production-Ready SaaS Foundation

**Date Started:** 2025-10-17  
**Status:** 🚀 IN PROGRESS  
**Goal:** Clean, modular, error-free repository ready for accelerated SaaS development

---

## 📊 Baseline State (Post-Unit 3)

✅ **Completed:**
- Unit 1: Documentation archived (52 files)
- Unit 2: Duplicate audits archived (8 files)
- Unit 3: Canonical lock + optimized archived (3 files)
- Phase 2: Fix scripts archived (2 files)
- Total: 65 files (~678 KB) cleaned up

✅ **Current State:**
- PRs #1 & #2 merged
- Staging verified (100% pass rate)
- Safety matrix established
- Backend canonical locked

⚠️ **Remaining Issues:**
- Frontend TypeScript errors (~150+)
- Circular dependencies (unknown count)
- Dead code (unknown count)
- No env validation
- No CI guardrails

---

## 🎯 Units 4-9 Overview

| Unit | Focus | Success Criteria |
|------|-------|------------------|
| 4 | TypeScript Debt | `npm run typecheck` passes |
| 5 | Build Chain | `npm run build` succeeds |
| 6 | Dead Code | Zero circulars, minimal dead exports |
| 7 | Env Validation | Runtime Zod validation working |
| 8 | Shared Boundaries | Clear separation, no leaks |
| 9 | CI Guardrails | Automated checks on every PR |

---

## 🔧 Unit 4: Frontend TypeScript Debt

**Goal:** Zero blocking TypeScript errors, stable Vite dev server

### Tasks
- [ ] Update `web/tsconfig.json` with strict settings
- [ ] Fix broken imports (missing extensions, wrong paths)
- [ ] Resolve implicit `any` types
- [ ] Add missing prop types
- [ ] Convert remaining `.js` to `.ts/.tsx` or exclude
- [ ] Verify `npm run typecheck` passes for `web/`

### Expected Errors (from previous run)
- ~150 TypeScript errors in frontend
- Main issues: missing types, wrong imports, prop mismatches

### Success Metric
```bash
cd web && npm run typecheck
# Expected: 0 errors
```

---

## 🔧 Unit 5: Build Chain Sanity

**Goal:** Consistent Vite/Tailwind/PostCSS configuration

### Tasks
- [ ] Validate `postcss.config.cjs` exists and is correct
- [ ] Validate `tailwind.config.cjs` scans all React files
- [ ] Confirm all `@/` aliases resolve correctly
- [ ] Test Vite HMR (Hot Module Replacement)
- [ ] Verify production build works end-to-end

### Success Metrics
```bash
npm run build
# Expected: Clean build, no errors

cd web && npm run dev
# Expected: Server starts, HMR works
```

---

## 🔧 Unit 6: Dead Code & Circular Dependencies

**Goal:** Zero circular dependencies, minimal dead exports

### Tasks
- [ ] Run `madge` to find circular dependencies
- [ ] Run `ts-prune` to find dead exports
- [ ] Archive or delete unreferenced modules
- [ ] Refactor circular imports
- [ ] Document remaining "intentional" circulars (if any)

### Success Metrics
```bash
npm run depgraph
# Expected: 0 circular dependencies

npm run deadcode
# Expected: Only known/intentional unused exports
```

---

## 🔧 Unit 7: Environment Normalization

**Goal:** Validated, type-safe environment configuration

### Tasks
- [ ] Create `src/infra/env.ts` with Zod schema (backend)
- [ ] Create `web/src/lib/env.ts` with Zod schema (frontend)
- [ ] Add runtime validation on app startup
- [ ] Document all required/optional env vars
- [ ] Create `.env.example` with all variables

### Success Metrics
```bash
# App fails fast with clear error if env is missing
node src/index.canonical.js
# Expected: Runtime validation, clear error messages
```

---

## 🔧 Unit 8: Shared Code Boundaries

**Goal:** Clear separation between backend, frontend, and shared code

### Tasks
- [ ] Create `src/shared/` or `packages/shared/`
- [ ] Move pure DTOs/types to shared
- [ ] Move constants to shared
- [ ] Ensure no React code in shared
- [ ] Ensure no DB code in shared
- [ ] Update imports across codebase

### Success Metrics
```bash
# Clear module boundaries, no cross-contamination
# Shared code has no runtime dependencies
```

---

## 🔧 Unit 9: CI Guardrails

**Goal:** Automated quality checks on every PR

### Tasks
- [ ] Create `.github/workflows/ci.yml`
- [ ] Add `lint` check
- [ ] Add `typecheck` check
- [ ] Add `build` check
- [ ] Add `test` check (when tests exist)
- [ ] Separate backend/frontend checks
- [ ] Add pre-commit hooks (optional)

### Success Metrics
```bash
# Every PR runs checks automatically
# Failing checks block merge
```

---

## 📁 Target File Structure

```
dispatch-construction-logistics/
├── src/                          # Backend (Node/TS)
│   ├── app/                     # HTTP wiring (routes, middleware)
│   ├── domain/                  # Core business logic
│   ├── infra/                   # DB & external services
│   ├── shared/                  # Shared types/constants
│   ├── utils/                   # Pure helpers
│   └── index.canonical.ts       # Main entry (migrated from .js)
│
├── web/                          # Frontend (React/Vite)
│   ├── src/
│   │   ├── app/                # App shell
│   │   ├── features/           # Feature modules
│   │   ├── components/         # Shared components
│   │   ├── lib/                # Frontend utilities
│   │   ├── assets/             # Images, fonts
│   │   └── styles/             # Global styles
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.cjs
│
├── tools/                        # Deployment & scripts
├── audit/                        # Logs & release notes
├── archive/                      # Archived code
├── .github/                      # CI workflows
│   └── workflows/
│       └── ci.yml
│
├── tsconfig.base.json           # Root TS config
├── .eslintrc.cjs                # ESLint config
├── .prettierrc                  # Prettier config
└── package.json                 # Unified scripts
```

---

## 🔗 Path Aliases (to enforce)

### Backend
```json
{
  "@app/*": ["src/app/*"],
  "@domain/*": ["src/domain/*"],
  "@infra/*": ["src/infra/*"],
  "@shared/*": ["src/shared/*"],
  "@utils/*": ["src/utils/*"]
}
```

### Frontend
```json
{
  "@features/*": ["web/src/features/*"],
  "@components/*": ["web/src/components/*"],
  "@lib/*": ["web/src/lib/*"],
  "@assets/*": ["web/src/assets/*"],
  "@shared/*": ["src/shared/*"]
}
```

---

## 📊 Definition of "Clean" (End Target)

| Metric | Target | Command |
|--------|--------|---------|
| TypeScript | 0 errors | `npm run typecheck` |
| Linting | 0 errors, <10 warnings | `npm run lint` |
| Circular Deps | 0 critical | `npm run depgraph` |
| Dead Code | 0 critical exports | `npm run deadcode` |
| Build | Success | `npm run build` |
| Env Validation | Runtime check | App startup |
| Tests | All passing | `npm test` |

---

## 🚀 Execution Plan

### Phase 1: Infrastructure Setup (30 min)
1. Install dev dependencies
2. Create config files
3. Add npm scripts
4. Run baseline check

### Phase 2: Fix Errors (2-4 hours)
1. Unit 4: TypeScript errors
2. Unit 5: Build chain
3. Unit 6: Dead code

### Phase 3: Add Safety (1-2 hours)
1. Unit 7: Env validation
2. Unit 8: Shared boundaries
3. Unit 9: CI guardrails

### Phase 4: Verification (30 min)
1. Run all checks
2. Document results
3. Commit to master

---

## 📝 Commit Strategy

Each unit gets its own commit:

```bash
git commit -m "feat(unit4): fix all frontend TypeScript errors"
git commit -m "feat(unit5): stabilize build chain configuration"
git commit -m "feat(unit6): remove dead code and circular deps"
git commit -m "feat(unit7): add runtime env validation with Zod"
git commit -m "feat(unit8): establish shared code boundaries"
git commit -m "feat(unit9): add CI guardrails and pre-commit hooks"
```

Final summary commit:
```bash
git commit -m "feat(cleanup): complete Units 4-9 - production-ready foundation

- Zero TypeScript errors
- Stable build chain
- No circular dependencies
- Runtime env validation
- Clear code boundaries
- Automated CI checks"
```

---

## 🔄 Rollback Plan

Each unit is independently revertible:

```bash
# Revert specific unit
git revert <unit-commit-sha>

# Or restore from archive
git log --oneline | grep "unit[4-9]"
```

---

## 📈 Progress Tracking

Track progress in: `audit/runs/units-4-9-<timestamp>/`

Artifacts per unit:
- `unitX-errors-before.txt` - Baseline errors
- `unitX-fixes-log.md` - What was changed
- `unitX-errors-after.txt` - Final state
- `unitX-verification.json` - Test results

---

**🎯 Let's build a rock-solid SaaS foundation!**

