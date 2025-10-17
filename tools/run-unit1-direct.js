// Direct execution of Unit 1 - no shell dependencies
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const zlib = require('zlib');
const fg = require('fast-glob');

const ROOT = process.cwd();
const CONFIG_PATH = 'tools/config/cleanup-unit1.json';

async function loadConfig() {
  const config = JSON.parse(await fsp.readFile(CONFIG_PATH, 'utf8'));
  console.log(`📋 Config: ${config.name}`);
  console.log(`📝 Description: ${config.description}`);
  console.log(`🎯 Risk Level: ${config.riskLevel}`);
  return config;
}

async function createBackup() {
  console.log('📦 Creating full repo backup...');
  
  const TS = new Date().toISOString().replace(/[:.]/g, '-');
  const OUT = path.join(ROOT, 'backups', TS);
  const MANI = path.join(OUT, 'manifest.json');

  const EXCLUDES = new Set(['node_modules', '.git', 'backups', 'archive']);

  async function walk(dir, base = '') {
    const items = await fsp.readdir(dir, { withFileTypes: true });
    const files = [];
    for (const it of items) {
      if (EXCLUDES.has(it.name)) continue;
      const rel = path.join(base, it.name);
      const abs = path.join(dir, it.name);
      if (it.isDirectory()) files.push(...await walk(abs, rel));
      else files.push({ abs, rel });
    }
    return files;
  }

  function sha256File(abs) {
    return new Promise((resolve, reject) => {
      const h = crypto.createHash('sha256');
      fs.createReadStream(abs).on('data', d => h.update(d))
        .on('error', reject).on('end', () => resolve(h.digest('hex')));
    });
  }

  const files = await walk(ROOT);
  const manifest = [];
  
  await fsp.mkdir(OUT, { recursive: true });
  
  for (const f of files) {
    const st = await fsp.stat(f.abs);
    const hash = await sha256File(f.abs);
    manifest.push({ path: f.rel, bytes: st.size, sha256: hash });
    
    // Copy file to backup
    const backupPath = path.join(OUT, f.rel);
    await fsp.mkdir(path.dirname(backupPath), { recursive: true });
    await fsp.copyFile(f.abs, backupPath);
  }
  
  await fsp.writeFile(MANI, JSON.stringify({ createdAt: TS, count: manifest.length, files: manifest }, null, 2));
  console.log(`✅ Backup complete: ${OUT}`);
  console.log(`📁 Files backed up: ${manifest.length}`);
  return { backupDir: OUT, manifest };
}

async function scanReferences(config) {
  console.log('🔍 Scanning for references...');
  
  const targets = await fg(config.includeGlobs, { 
    cwd: ROOT, 
    ignore: config.excludeGlobs,
    onlyFiles: true 
  });
  
  const limitedTargets = targets.slice(0, config.maxFiles);
  console.log(`📁 Found ${targets.length} files, limiting to ${limitedTargets.length}`);
  
  const SEARCH_DIRS = ['src', 'prisma', 'app', 'server', 'web']
    .map(d => path.join(ROOT, d))
    .filter(p => fs.existsSync(p));

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

  const basePatterns = limitedTargets.map(t => path.basename(t)).map(b => new RegExp(escapeReg(b), 'i'));
  const relPatterns = limitedTargets.map(t => t.replace(/\\/g,'/')).map(r => new RegExp(escapeReg(r), 'i'));

  const result = { config, targets: limitedTargets, references: {} };
  for(const t of limitedTargets){ result.references[t] = []; }

  for(const dir of SEARCH_DIRS){
    const files = await walk(dir);
    for(const f of files){
      const text = await fsp.readFile(f, 'utf8');
      for(const t of limitedTargets){
        if (basePatterns.some(rx => rx.test(text)) || relPatterns.some(rx => rx.test(text))) {
          result.references[t].push(path.relative(ROOT, f));
        }
      }
    }
  }
  
  const runTs = new Date().toISOString().replace(/[:.]/g, '-');
  const runDir = path.join(ROOT, 'audit', 'runs', runTs);
  await fsp.mkdir(runDir, { recursive: true });
  
  const out = path.join(runDir, 'refscan-report.json');
  await fsp.writeFile(out, JSON.stringify(result, null, 2));
  
  const filesWithRefs = Object.values(result.references).filter(refs => refs.length > 0).length;
  console.log(`✅ Reference scan complete`);
  console.log(`📄 Report: ${out}`);
  console.log(`📊 Files with references: ${filesWithRefs}/${limitedTargets.length}`);
  
  if (filesWithRefs === 0) {
    console.log(`🎉 All files appear safe to remove (no references found)`);
  } else {
    console.log(`⚠️  ${filesWithRefs} files have references - review before deletion`);
  }
  
  return { result, runDir, safeToStage: filesWithRefs === 0 };
}

async function stageFiles(config, targets) {
  console.log('📁 Staging files for deletion...');
  
  const ROOT = process.cwd();
  const TS = new Date().toISOString().replace(/[:.]/g,'-');
  const DESTROOT = path.join(ROOT,'archive','staged',TS);
  
  await fsp.mkdir(DESTROOT,{recursive:true});
  
  const staged = [];
  const failed = [];
  
  for(const rel of targets){
    try {
      const src = path.join(ROOT, rel);
      const dst = path.join(DESTROOT, rel);
      
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
  
  return { report, staged };
}

async function executeUnit1() {
  console.log('🚀 Starting Unit 1 Cleanup Sequence');
  console.log('📋 Config: tools/config/cleanup-unit1.json');
  console.log('🎯 Target: COMPLETE documentation files');
  console.log('🔒 Risk Level: Zero (documentation only)\n');

  try {
    const config = await loadConfig();
    
    // Step 1: Backup
    const { backupDir } = await createBackup();
    
    // Step 2: Reference Scan
    const { result, runDir, safeToStage } = await scanReferences(config);
    
    if (!safeToStage) {
      console.log('⚠️  Some files have references - skipping staging');
      console.log('📄 Review refscan-report.json for details');
      return;
    }
    
    // Step 3: Stage Delete
    const { report, staged } = await stageFiles(config, result.targets);

    console.log('\n🎉 Unit 1 cleanup sequence completed successfully!');
    console.log('📄 Reports available in: audit/runs/');
    console.log(`📍 Staged files: archive/staged/`);
    console.log(`📊 Files processed: ${staged.length}`);
    console.log('🔄 Use restore tool if rollback needed');

  } catch (error) {
    console.error('❌ Unit 1 cleanup failed:', error.message);
    console.log('🔄 Use restore tool to rollback any changes');
    process.exit(1);
  }
}

executeUnit1();


