// Moves files to archive/staged/<timestamp>/... (reversible).
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const fg = require('fast-glob');

async function loadConfig() {
  const configPath = process.env.CFG || 'tools/config/cleanup-unit1.json';
  const config = JSON.parse(await fsp.readFile(configPath, 'utf8'));
  console.log(`📋 Config: ${config.name}`);
  console.log(`📝 Description: ${config.description}`);
  console.log(`🎯 Risk Level: ${config.riskLevel}`);
  console.log(`🔒 Dry Run: ${config.dryRun}`);
  return config;
}

async function getTargetFiles(config) {
  const includeFiles = await fg(config.includeGlobs, { 
    cwd: process.cwd(), 
    ignore: config.excludeGlobs,
    onlyFiles: true 
  });
  
  // Limit to maxFiles
  const limitedFiles = includeFiles.slice(0, config.maxFiles);
  console.log(`📁 Found ${includeFiles.length} files, limiting to ${limitedFiles.length}`);
  return limitedFiles;
}

(async()=>{
  try {
    const config = await loadConfig();
    
    if (config.requiresApproval && !process.env.FORCE_STAGE) {
      console.log('⚠️  This config requires explicit approval');
      console.log('Set FORCE_STAGE=1 to proceed anyway');
      process.exit(1);
    }
    
    const targets = await getTargetFiles(config);
    
    if (!targets.length) {
      console.log('✅ No files found matching config patterns');
      return;
    }
    
    const ROOT = process.cwd();
    const TS = new Date().toISOString().replace(/[:.]/g,'-');
    const DESTROOT = path.join(ROOT,'archive','staged',TS);
    
    if (config.dryRun) {
      console.log(`🔍 DRY RUN - Would stage ${targets.length} files:`);
      for(const rel of targets){
        console.log(`  📄 ${rel}`);
      }
      console.log(`📍 Would move to: ${path.relative(ROOT, DESTROOT)}`);
      return;
    }
    
    await fsp.mkdir(DESTROOT,{recursive:true});
    
    const staged = [];
    const failed = [];
    
    for(const rel of targets){
      try {
        const src = path.join(ROOT, rel);
        const dst = path.join(DESTROOT, rel);
        
        // Check if file exists
        await fsp.access(src);
        
        await fsp.mkdir(path.dirname(dst), {recursive:true});
        await fsp.rename(src, dst);
        staged.push(rel);
        console.log(`✅ moved: ${rel} -> ${path.relative(ROOT,dst)}`);
      } catch (error) {
        failed.push({ file: rel, error: error.message });
        console.warn(`⚠️  Failed to stage ${rel}: ${error.message}`);
      }
    }
    
    // Create run log
    const runTs = new Date().toISOString().replace(/[:.]/g, '-');
    const runDir = path.join(ROOT, 'audit', 'runs', runTs);
    await fsp.mkdir(runDir, { recursive: true });
    
    const report = {
      config,
      timestamp: TS,
      staged: staged.length,
      failed: failed.length,
      stagedFiles: staged,
      failedFiles: failed,
      stagedLocation: path.relative(ROOT, DESTROOT)
    };
    
    const reportPath = path.join(runDir, 'stage-report.json');
    await fsp.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`✅ Staging complete`);
    console.log(`📄 Report: ${reportPath}`);
    console.log(`📊 Staged: ${staged.length}, Failed: ${failed.length}`);
    console.log(`📍 Location: ${path.relative(ROOT, DESTROOT)}`);
    
  } catch (error) {
    console.error('❌ Stage delete failed:', error.message);
    process.exit(1);
  }
})();
