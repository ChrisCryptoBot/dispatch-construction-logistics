const fs = require('fs');
const path = require('path');
const fg = require('fast-glob');

(async () => {
  const ROOT = process.cwd();
  const stagedRoot = path.join(ROOT, 'archive', 'staged');
  
  if (!fs.existsSync(stagedRoot)) {
    console.error('❌ No staged directory found.');
    process.exit(1);
  }
  
  // Find latest batch
  const batches = fs.readdirSync(stagedRoot)
    .filter(f => fs.statSync(path.join(stagedRoot, f)).isDirectory())
    .sort();
    
  if (!batches.length) {
    console.error('❌ No staged batches found.');
    process.exit(1);
  }
  
  const latest = batches[batches.length - 1];
  const batchDir = path.join(stagedRoot, latest);
  
  console.log(`🔄 Restoring latest batch: ${latest}`);
  
  // Find all files in the batch
  const files = await fg(['**/*'], { 
    cwd: batchDir, 
    dot: true, 
    onlyFiles: true 
  });
  
  if (!files.length) {
    console.log('✅ No files to restore in this batch.');
    return;
  }
  
  console.log(`📁 Restoring ${files.length} files...`);
  
  let restored = 0;
  let failed = 0;
  
  for (const rel of files) {
    try {
      const from = path.join(batchDir, rel);
      const to = path.join(ROOT, rel);
      
      // Create directory if needed
      fs.mkdirSync(path.dirname(to), { recursive: true });
      
      // Copy file back
      fs.copyFileSync(from, to);
      restored++;
      console.log(`✅ Restored: ${rel}`);
    } catch (error) {
      failed++;
      console.warn(`⚠️  Failed to restore ${rel}: ${error.message}`);
    }
  }
  
  console.log(`\n🎉 Restore complete!`);
  console.log(`✅ Restored: ${restored}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📁 Batch: ${latest}`);
  
  if (failed === 0) {
    console.log(`\n💡 You can now delete the staged batch: ${batchDir}`);
  }
})();


