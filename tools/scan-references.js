// tools/scan-references.js
// Usage: node tools/scan-references.js file1 file2 ...
// Scans for references to the given files in the codebase

const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');

const ROOT = process.cwd();
const EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.json', '.md', '.sh'];

async function scanFile(filePath, searchTerms) {
  try {
    const content = await fsp.readFile(filePath, 'utf8');
    const references = [];
    
    searchTerms.forEach(term => {
      if (content.includes(term)) {
        const lines = content.split('\n');
        lines.forEach((line, index) => {
          if (line.includes(term)) {
            references.push({
              file: path.relative(ROOT, filePath),
              line: index + 1,
              content: line.trim()
            });
          }
        });
      }
    });
    
    return references;
  } catch (error) {
    return [];
  }
}

async function walk(dir, base = '') {
  const entries = await fsp.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    if (e.name.startsWith('.') || e.name === 'node_modules' || e.name === 'backups') continue;
    const rel = path.join(base, e.name);
    const abs = path.join(dir, e.name);
    if (e.isDirectory()) files.push(...await walk(abs, rel));
    else if (EXTENSIONS.some(ext => e.name.endsWith(ext))) files.push(abs);
  }
  return files;
}

(async () => {
  const targetFiles = process.argv.slice(2);
  if (!targetFiles.length) {
    console.error('Usage: node tools/scan-references.js file1 file2 ...');
    process.exit(1);
  }
  
  console.log('🔍 Scanning for references to:', targetFiles.join(', '));
  
  const allFiles = await walk(ROOT);
  const results = {};
  
  for (const target of targetFiles) {
    const fileName = path.basename(target);
    const filePath = target;
    
    results[target] = [];
    
    for (const file of allFiles) {
      const references = await scanFile(file, [fileName, filePath]);
      if (references.length > 0) {
        results[target].push(...references);
      }
    }
  }
  
  // Output results
  let hasReferences = false;
  for (const [target, refs] of Object.entries(results)) {
    if (refs.length > 0) {
      hasReferences = true;
      console.log(`\n📌 References to ${target}:`);
      refs.forEach(ref => {
        console.log(`  ${ref.file}:${ref.line} - ${ref.content}`);
      });
    }
  }
  
  if (!hasReferences) {
    console.log('\n✅ No references found - files appear safe to remove');
  } else {
    console.log('\n⚠️  References found - review before deletion');
  }
})();


