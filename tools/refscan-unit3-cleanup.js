// Unit 3 Cleanup: Scan for any references to *.optimized.js files
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');

const ROOT = process.cwd();
const ts = new Date().toISOString().replace(/[:]/g, '-').replace(/\..+/, 'Z');
const runDir = path.join(ROOT, 'audit', 'runs', ts);

// Files to check for references
const TARGET_FILES = [
  'src/index.optimized.js',
  'src/routes/customer.optimized.js',
  'src/routes/marketplace.optimized.js'
];

// Directories to scan (exclude backups/audit/archive)
const SCAN_DIRS = ['src', 'routes', 'prisma', 'tools', '.vscode'];

// Extensions to scan
const SCAN_EXTS = ['.js', '.ts', '.tsx', '.json', '.md'];

// Exclude patterns
const EXCLUDE = ['node_modules', 'archive', 'audit', '.git', 'dist', 'build'];

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

async function walk(dir) {
  const entries = await fsp.readdir(dir, { withFileTypes: true });
  const files = [];
  
  for (const entry of entries) {
    if (EXCLUDE.includes(entry.name)) continue;
    
    const absPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      files.push(...await walk(absPath));
    } else {
      const ext = path.extname(entry.name);
      if (SCAN_EXTS.includes(ext)) {
        files.push(absPath);
      }
    }
  }
  
  return files;
}

async function scanFile(filePath, patterns) {
  try {
    const content = await fsp.readFile(filePath, 'utf8');
    const lines = content.split(/\r?\n/);
    const matches = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      for (const pattern of patterns) {
        if (line.includes(pattern)) {
          matches.push({
            line: i + 1,
            content: line.trim(),
            pattern
          });
        }
      }
    }
    
    return matches;
  } catch (err) {
    console.warn(`Warning: Could not scan ${filePath}: ${err.message}`);
    return [];
  }
}

(async () => {
  console.log('🔍 Unit 3 Cleanup: Scanning for *.optimized.js references...\n');
  
  ensureDir(runDir);
  
  // Build search patterns
  const patterns = [];
  for (const target of TARGET_FILES) {
    patterns.push(target);
    patterns.push(target.replace(/\\/g, '/'));
    patterns.push(path.basename(target));
    patterns.push(path.basename(target, '.js'));
  }
  
  // Get all files to scan
  const allFiles = [];
  for (const dir of SCAN_DIRS) {
    const scanPath = path.join(ROOT, dir);
    if (fs.existsSync(scanPath)) {
      allFiles.push(...await walk(scanPath));
    }
  }
  
  console.log(`📁 Scanning ${allFiles.length} files...`);
  
  const results = {
    timestamp: new Date().toISOString(),
    targetFiles: TARGET_FILES,
    scannedFiles: allFiles.length,
    references: [],
    summary: {
      totalReferences: 0,
      filesWithReferences: 0
    }
  };
  
  // Scan each file
  for (const filePath of allFiles) {
    const matches = await scanFile(filePath, patterns);
    
    if (matches.length > 0) {
      const relPath = path.relative(ROOT, filePath);
      results.references.push({
        file: relPath,
        matches
      });
      results.summary.totalReferences += matches.length;
      results.summary.filesWithReferences++;
    }
  }
  
  // Output phase (pre or post)
  const phase = process.argv[2] || 'pre-pr';
  const outputFile = path.join(runDir, `refscan-unit3-${phase}.json`);
  
  await fsp.writeFile(outputFile, JSON.stringify(results, null, 2));
  
  console.log(`\n✅ Scan complete!`);
  console.log(`📊 Results:`);
  console.log(`   - Files scanned: ${results.scannedFiles}`);
  console.log(`   - References found: ${results.summary.totalReferences}`);
  console.log(`   - Files with references: ${results.summary.filesWithReferences}`);
  console.log(`\n📄 Report saved: ${outputFile}`);
  
  if (results.summary.totalReferences > 0) {
    console.log(`\n❌ STOP: Found ${results.summary.totalReferences} references to *.optimized.js`);
    console.log(`\n🔍 References:`);
    for (const ref of results.references) {
      console.log(`\n   ${ref.file}:`);
      for (const match of ref.matches) {
        console.log(`     Line ${match.line}: ${match.content}`);
      }
    }
    process.exit(1);
  } else {
    console.log(`\n✅ PASS: Zero references to *.optimized.js found!`);
  }
  
  // Save timestamp for next steps
  await fsp.writeFile(path.join(ROOT, '.unit3-cleanup-ts'), ts);
})();

