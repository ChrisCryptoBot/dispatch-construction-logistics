// Scans for references to files matching config globs
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const fg = require('fast-glob');

const ROOT = process.cwd();
const SEARCH_DIRS = ['src', 'prisma', 'app', 'server', 'web'].map(d => path.join(ROOT, d)).filter(p => fs.existsSync(p));

function escapeReg(s){return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');}

async function walk(dir){
  const ents = await fsp.readdir(dir,{withFileTypes:true});
  const files=[];
  for(const e of ents){
    const abs=path.join(dir,e.name);
    if(e.isDirectory()) files.push(...await walk(abs));
    else files.push(abs);
  }
  return files;
}

async function loadConfig() {
  const configPath = process.env.CFG || 'tools/config/cleanup-unit1.json';
  const config = JSON.parse(await fsp.readFile(configPath, 'utf8'));
  console.log(`📋 Config: ${config.name}`);
  console.log(`📝 Description: ${config.description}`);
  console.log(`🎯 Risk Level: ${config.riskLevel}`);
  return config;
}

async function getTargetFiles(config) {
  const includeFiles = await fg(config.includeGlobs, { 
    cwd: ROOT, 
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
    const targets = await getTargetFiles(config);
    
    if (!targets.length) {
      console.log('✅ No files found matching config patterns');
      return;
    }
    
    console.log(`🔍 Scanning references for ${targets.length} files...`);
    
    const basePatterns = targets.map(t => path.basename(t)).map(b => new RegExp(escapeReg(b), 'i'));
    const relPatterns  = targets.map(t => t.replace(/\\/g,'/')).map(r => new RegExp(escapeReg(r), 'i'));

    const result = { config, targets, references: {} };
    for(const t of targets){ result.references[t] = []; }

    for(const dir of SEARCH_DIRS){
      const files = await walk(dir);
      for(const f of files){
        const text = await fsp.readFile(f, 'utf8');
        for(const t of targets){
          if (basePatterns.some(rx => rx.test(text)) || relPatterns.some(rx => rx.test(text))) {
            result.references[t].push(path.relative(ROOT, f));
          }
        }
      }
    }
    
    // Create run log directory
    const runTs = new Date().toISOString().replace(/[:.]/g, '-');
    const runDir = path.join(ROOT, 'audit', 'runs', runTs);
    await fsp.mkdir(runDir, { recursive: true });
    
    const out = path.join(runDir, 'refscan-report.json');
    await fsp.writeFile(out, JSON.stringify(result, null, 2));
    
    // Summary
    const filesWithRefs = Object.values(result.references).filter(refs => refs.length > 0).length;
    console.log(`✅ Reference scan complete`);
    console.log(`📄 Report: ${out}`);
    console.log(`📊 Files with references: ${filesWithRefs}/${targets.length}`);
    
    if (filesWithRefs === 0) {
      console.log(`🎉 All files appear safe to remove (no references found)`);
    } else {
      console.log(`⚠️  ${filesWithRefs} files have references - review before deletion`);
    }
    
  } catch (error) {
    console.error('❌ Reference scan failed:', error.message);
    process.exit(1);
  }
})();
