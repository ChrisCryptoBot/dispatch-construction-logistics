# Unit 1 Execution - Ready to Run

## 🎯 Unit 1 Configuration
- **Name**: Unit 1 – COMPLETE docs only
- **Risk Level**: Zero (documentation only)
- **Target**: Files matching `**/COMPLETE*.md` and `**/*_COMPLETE.md`
- **Max Files**: 10
- **Expected References**: 0

## 🚀 Execution Steps (Run & Debug Panel)

### Step 1: Create Backup
1. Open **Run & Debug** panel in Cursor
2. Select **"1️⃣ Backup (Unit 1)"**
3. Click ▶️
4. **Expected Output**:
   ```
   🚀 Running task: backup
   📋 Using config: tools/config/cleanup-unit1.json
   📦 Starting backup process...
   ✅ Backup complete: backups/2025-01-16T14-30-45-123Z/
   ```

### Step 2: Reference Scan
1. Select **"2️⃣ RefScan (Unit 1)"**
2. Click ▶️
3. **Expected Output**:
   ```
   🚀 Running task: refscan
   📋 Using config: tools/config/cleanup-unit1.json
   📋 Config: Unit 1 – COMPLETE docs only
   📝 Description: Low-risk documentation files marked COMPLETE
   🎯 Risk Level: zero
   📁 Found 52 files, limiting to 10
   🔍 Scanning references for 10 files...
   ✅ Reference scan complete
   📄 Report: audit/runs/2025-01-16T14-30-45-123Z/refscan-report.json
   📊 Files with references: 0/10
   🎉 All files appear safe to remove (no references found)
   ```

### Step 3: Stage Delete (If Safe)
1. Review ref-scan results in the generated report
2. If **0 references found**, select **"3️⃣ Stage (Unit 1)"**
3. Click ▶️
4. **Expected Output**:
   ```
   🚀 Running task: stage
   📋 Using config: tools/config/cleanup-unit1.json
   📋 Config: Unit 1 – COMPLETE docs only
   📝 Description: Low-risk documentation files marked COMPLETE
   🎯 Risk Level: zero
   🔒 Dry Run: false
   📁 Found 52 files, limiting to 10
   ✅ moved: ALL_FEATURES_IMPLEMENTATION_COMPLETE.md -> archive/staged/2025-01-16T14-30-45-123Z/ALL_FEATURES_IMPLEMENTATION_COMPLETE.md
   ...
   ✅ Staging complete
   📄 Report: audit/runs/2025-01-16T14-30-45-123Z/stage-report.json
   📊 Staged: 10, Failed: 0
   📍 Location: archive/staged/2025-01-16T14-30-45-123Z
   ```

## 📊 Success Criteria

### ✅ Backup Success:
- `backups/<timestamp>/manifest.json` exists
- `backups/<timestamp>/repo.tar.gz` exists
- Manifest contains all repo files with hashes

### ✅ Reference Scan Success:
- `audit/runs/<timestamp>/refscan-report.json` exists
- Report shows 0 files with references
- All target files listed in report

### ✅ Stage Success:
- `audit/runs/<timestamp>/stage-report.json` exists
- Files moved to `archive/staged/<timestamp>/`
- Report shows 0 failed moves

## 🔒 Safety Features

### Reversible Process:
- All "deletions" are moves to `archive/staged/`
- Full backup available for complete restore
- Restore tool available: **"🔄 Restore Latest Batch"**

### Guardrails:
- Only documentation files (zero risk)
- Reference checking before staging
- Detailed logging of all actions
- Dry-run capability for investigation

## 📋 Unit 1 Report Template

After execution, provide:
- **Unit ID**: Unit 1 - COMPLETE docs
- **Files processed**: [list from stage-report.json]
- **Reference scan results**: [path to refscan-report.json]
- **Staged location**: [path from stage-report.json]
- **Risk assessment**: Zero (documentation only)
- **Status**: Ready for approval

## 🎯 Next Steps

1. **Execute Unit 1** using Run & Debug panel
2. **Review reports** in `audit/runs/<timestamp>/`
3. **Get user approval** for Unit 1 results
4. **Proceed to Unit 2** (duplicate audit reports)
5. **Continue with Unit 3** (investigate optimized files)

## 🚨 Rollback Instructions

If anything goes wrong:
1. Select **"🔄 Restore Latest Batch"**
2. Click ▶️
3. Files will be restored to original locations
4. Review what went wrong before proceeding

## 📁 Generated Files

After successful execution:
```
audit/runs/<timestamp>/
├── refscan-report.json    # Reference scan results
└── stage-report.json      # Staging results

archive/staged/<timestamp>/
├── ALL_FEATURES_IMPLEMENTATION_COMPLETE.md
├── ANALYTICS_INTEGRATION_COMPLETE.md
└── ... (other staged files)

backups/<timestamp>/
├── manifest.json          # Full repo manifest
└── repo.tar.gz           # Complete backup
```


