const path = require('path');
const fs = require('fs');

const TASK = process.env.TASK || 'backup';
const CFG  = process.env.CFG  || 'tools/config/cleanup-unit1.json';

async function run() {
  console.log(`🚀 Running task: ${TASK}`);
  console.log(`📋 Using config: ${CFG}`);
  
  if (TASK === 'backup') {
    console.log('📦 Starting backup process...');
    require('./backup-and-manifest.js');
    return;
  }
  
  if (TASK === 'refscan') {
    console.log('🔍 Starting reference scan...');
    process.env.CFG = CFG;
    require('./ref-scan.js');
    return;
  }
  
  if (TASK === 'stage') {
    console.log('📁 Starting stage-delete process...');
    process.env.CFG = CFG;
    require('./stage-delete.js');
    return;
  }
  
  console.error('❌ Unknown TASK:', TASK);
  console.log('Available tasks: backup, refscan, stage');
  console.log('Available configs: cleanup-unit1, cleanup-unit2, cleanup-unit3');
}

run().catch(console.error);
