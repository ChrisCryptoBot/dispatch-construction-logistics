# Cleanup Execution Plan - No Shell Required

## 🚀 Setup Complete

### ✅ Tools Created:
- `tools/backup-and-manifest.js` - Creates full repo backup + manifest
- `tools/ref-scan.js` - Scans for references to files in codebase  
- `tools/stage-delete.js` - Moves files to archive (reversible)
- `tools/run-task.js` - Debugger runner for all tasks
- `.vscode/launch.json` - Run & Debug configurations
- `run-backup.bat` - Windows batch file backup option

### ✅ Scripts Added to package.json:
- `npm run backup` - Run backup process
- `npm run refscan` - Run reference scan
- `npm run stage:delete` - Stage files for deletion

## 📋 Execution Steps

### Step 1: Create Backup (Run & Debug)
1. Open **Run & Debug** panel in Cursor
2. Select **"Run tools/run-task.js (backup)"**
3. Click ▶️ to execute
4. Verify output shows: `✅ Backup complete: backups/<timestamp>/`

### Step 2: Reference Scan - Unit 1 (First 10 COMPLETE docs)
**Files to scan:**
```
ALL_FEATURES_IMPLEMENTATION_COMPLETE.md
ANALYTICS_INTEGRATION_COMPLETE.md
ANALYTICS_REMOVAL_COMPLETE.md
BACKEND_OPTIMIZATION_COMPLETE_REPORT.md
BOL_TEMPLATES_UPGRADES_COMPLETE.md
BUTTON_FIX_COMPLETE_PLAN_AND_TIMELINE.md
CARRIER_LOAD_BOARD_ENHANCEMENTS_COMPLETE.md
CARRIER_MY_LOADS_ACTUAL_ENHANCEMENTS_COMPLETE.md
CARRIER_MY_LOADS_ENHANCEMENTS_COMPLETE.md
COMPLETE_BUTTON_AUDIT_REPORT.md
```

1. Select **"Run tools/run-task.js (refscan)"**
2. Click ▶️ to execute
3. Check output: `✅ ref-scan written to backups/ref-scan-<timestamp>.json`

### Step 3: Stage Delete - Unit 1 (If no references)
1. Review ref-scan results
2. If **no references found**, select **"Run tools/run-task.js (stage)"**
3. Click ▶️ to execute
4. Files moved to `archive/staged/<timestamp>/`

## 🎯 Alternative Execution Methods

### Method A: Run & Debug (Recommended)
- Use Cursor's Run & Debug panel
- Select appropriate configuration
- Click ▶️

### Method B: NPM Scripts Panel
- Left sidebar → NPM SCRIPTS
- Click `backup`, `refscan`, or `stage:delete`

### Method C: Windows Batch File
- Double-click `run-backup.bat` in Windows Explorer
- Only for backup process

### Method D: External Terminal
- Open Git Bash or Command Prompt
- Navigate to repo root
- Run: `npm run backup`

## 📊 Success Indicators

### Backup Success:
```
✅ Backup complete: backups/2025-01-16T14-30-45-123Z/
📁 Files backed up: 150+
📄 Manifest: backups/2025-01-16T14-30-45-123Z/manifest.json
```

### Reference Scan Success:
```
✅ ref-scan written to backups/ref-scan-1737037845123.json
```

### Stage Delete Success:
```
moved: ALL_FEATURES_IMPLEMENTATION_COMPLETE.md -> archive/staged/2025-01-16T14-30-45-123Z/ALL_FEATURES_IMPLEMENTATION_COMPLETE.md
✅ staged in archive/staged/2025-01-16T14-30-45-123Z
```

## 🔒 Safety Measures

### Never Delete:
- Files listed in `/audit/90_safety_matrix.md`
- Any file with references found in ref-scan
- Core application files (entry points, auth, DB, payments)

### Reversible Process:
- All "deletions" are actually moves to `archive/staged/`
- Can restore by moving files back from archive
- Full backup available in `backups/<timestamp>/`

## 📋 Unit 1 Report Template

After executing Unit 1, provide:
- **Unit ID**: Unit 1 - First 10 COMPLETE docs
- **Files processed**: [list of 10 files]
- **Reference scan results**: [path to ref-scan JSON]
- **Staged location**: [path to staged files]
- **Risk assessment**: Zero (documentation only)
- **Status**: Ready for approval

## 🎯 Next Steps After Unit 1

1. **Get user approval** for Unit 1
2. **Verify app still builds** (run build scripts)
3. **Proceed to Unit 2** (next 10 COMPLETE docs)
4. **Continue until all 52 COMPLETE docs processed**
5. **Move to Phase 2**: Duplicate audit reports
6. **Move to Phase 3**: Investigate optimized files


