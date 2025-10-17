// Execute Unit 1 cleanup sequence
const { spawn } = require('child_process');
const path = require('path');

async function runCommand(script, env = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn('node', [script], {
      cwd: process.cwd(),
      env: { ...process.env, ...env },
      stdio: 'inherit'
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });
  });
}

async function executeUnit1() {
  console.log('🚀 Starting Unit 1 Cleanup Sequence');
  console.log('📋 Config: tools/config/cleanup-unit1.json');
  console.log('🎯 Target: COMPLETE documentation files');
  console.log('🔒 Risk Level: Zero (documentation only)\n');

  try {
    // Step 1: Backup
    console.log('📦 Step 1: Creating full repo backup...');
    await runCommand('tools/backup-and-manifest.js');
    console.log('✅ Backup complete\n');

    // Step 2: Reference Scan
    console.log('🔍 Step 2: Scanning for references...');
    await runCommand('tools/ref-scan.js', { CFG: 'tools/config/cleanup-unit1.json' });
    console.log('✅ Reference scan complete\n');

    // Step 3: Stage Delete
    console.log('📁 Step 3: Staging files for deletion...');
    await runCommand('tools/stage-delete.js', { CFG: 'tools/config/cleanup-unit1.json' });
    console.log('✅ Staging complete\n');

    console.log('🎉 Unit 1 cleanup sequence completed successfully!');
    console.log('📄 Check audit/runs/<timestamp>/ for detailed reports');
    console.log('📍 Staged files moved to archive/staged/<timestamp>/');
    console.log('🔄 Use restore tool if rollback needed');

  } catch (error) {
    console.error('❌ Unit 1 cleanup failed:', error.message);
    console.log('🔄 Use restore tool to rollback any changes');
    process.exit(1);
  }
}

executeUnit1();


