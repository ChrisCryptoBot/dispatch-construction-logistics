// Unit 3 Cleanup: Stage-move *.optimized.js files to archive
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

const ROOT = process.cwd();
const ts = fs.readFileSync(path.join(ROOT, 'audit', 'runs', '2025-10-17T02-00-36Z', 'canonical-freeze.md'), 'utf8').match(/\d{4}-\d{2}-\d{2}/)?.[0] || '2025-10-17T02-00-36Z';
const archiveDir = path.join(ROOT, 'archive', 'staged', ts, 'unit3-optimized');
const reportPath = path.join(ROOT, 'audit', 'runs', ts, 'stage-unit3-optimized.json');

// Files to move
const TARGET_FILES = [
  'src/index.optimized.js',
  'src/routes/customer.optimized.js',
  'src/routes/marketplace.optimized.js'
];

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function sha256(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(content).digest('hex');
}

(async () => {
  console.log('📦 Unit 3 Cleanup: Stage-moving *.optimized.js files...\n');
  
  ensureDir(archiveDir);
  ensureDir(path.dirname(reportPath));
  
  const report = {
    timestamp: new Date().toISOString(),
    archiveLocation: `archive/staged/${ts}/unit3-optimized`,
    moves: []
  };
  
  for (const file of TARGET_FILES) {
    const oldPath = path.join(ROOT, file);
    const fileName = path.basename(file);
    const newPath = path.join(archiveDir, fileName);
    
    if (!fs.existsSync(oldPath)) {
      console.log(`⚠️  Skipped (not found): ${file}`);
      continue;
    }
    
    const stats = fs.statSync(oldPath);
    const hash = sha256(oldPath);
    
    // Move file
    await fsp.rename(oldPath, newPath);
    
    const moveRecord = {
      originalPath: file,
      archivedPath: `archive/staged/${ts}/unit3-optimized/${fileName}`,
      size: stats.size,
      sha256: hash,
      movedAt: new Date().toISOString()
    };
    
    report.moves.push(moveRecord);
    
    console.log(`✅ Moved: ${file}`);
    console.log(`   └─ To: ${moveRecord.archivedPath}`);
    console.log(`   └─ SHA256: ${hash.substring(0, 16)}...`);
    console.log(`   └─ Size: ${(stats.size / 1024).toFixed(2)} KB\n`);
  }
  
  // Save report
  await fsp.writeFile(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`\n✅ Stage-move complete!`);
  console.log(`📊 Summary:`);
  console.log(`   - Files moved: ${report.moves.length}`);
  console.log(`   - Archive location: ${report.archiveLocation}`);
  console.log(`   - Report: ${reportPath}`);
  
  // Verify files no longer exist in src
  console.log(`\n🔍 Verifying removal from active paths...`);
  let allRemoved = true;
  for (const file of TARGET_FILES) {
    const oldPath = path.join(ROOT, file);
    if (fs.existsSync(oldPath)) {
      console.log(`❌ ERROR: File still exists: ${file}`);
      allRemoved = false;
    }
  }
  
  if (allRemoved) {
    console.log(`✅ All files successfully removed from active paths`);
  } else {
    console.log(`❌ Some files still exist in active paths!`);
    process.exit(1);
  }
})();

