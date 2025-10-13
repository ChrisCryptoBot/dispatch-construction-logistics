/**
 * Cron Jobs for Background Tasks
 * Handles insurance expiry alerts, FMCSA re-verification, performance scoring, etc.
 * 
 * Usage: Add to src/index.js or run as separate worker process
 */

const cron = require('node-cron');
const insuranceService = require('../services/insuranceVerificationService');
const fmcsaService = require('../services/fmcsaVerificationService');
const performanceService = require('../services/performanceScoringService');
const recurringService = require('../services/recurringLoadsService');

/**
 * Daily Insurance Expiry Check (2 AM)
 * Checks for expired insurance and suspends carriers
 */
const dailyInsuranceCheck = cron.schedule('0 2 * * *', async () => {
  console.log('🔄 Running daily insurance expiry check...');
  try {
    const results = await insuranceService.batchCheckExpiredInsurance();
    console.log('✅ Insurance check complete:', results);
  } catch (error) {
    console.error('❌ Insurance check failed:', error);
  }
}, {
  scheduled: false // Don't start immediately
});

/**
 * Daily Insurance Expiry Alerts (3 AM)
 * Sends alerts for insurance expiring within 30 days
 */
const dailyInsuranceAlerts = cron.schedule('0 3 * * *', async () => {
  console.log('📧 Sending insurance expiry alerts...');
  try {
    const results = await insuranceService.sendExpiryAlerts();
    console.log('✅ Alerts sent:', results);
  } catch (error) {
    console.error('❌ Alert sending failed:', error);
  }
}, {
  scheduled: false
});

/**
 * Weekly FMCSA Re-verification (Sunday 1 AM)
 * Re-verifies all carriers against FMCSA database
 */
const weeklyFMCSACheck = cron.schedule('0 1 * * 0', async () => {
  console.log('🔄 Running weekly FMCSA re-verification...');
  try {
    const results = await fmcsaService.batchVerifyCarriers();
    console.log('✅ FMCSA verification complete:', results);
  } catch (error) {
    console.error('❌ FMCSA verification failed:', error);
  }
}, {
  scheduled: false
});

/**
 * Daily Performance Score Update (4 AM)
 * Recalculates carrier performance scores
 */
const dailyPerformanceUpdate = cron.schedule('0 4 * * *', async () => {
  console.log('📊 Updating carrier performance scores...');
  try {
    const results = await performanceService.batchUpdatePerformances();
    console.log('✅ Performance scores updated:', results);
  } catch (error) {
    console.error('❌ Performance update failed:', error);
  }
}, {
  scheduled: false
});

/**
 * Hourly Recurring Load Processing
 * Creates loads from recurring schedules
 */
const hourlyRecurringLoads = cron.schedule('0 * * * *', async () => {
  console.log('🔄 Processing recurring load schedules...');
  try {
    const results = await recurringService.processRecurringSchedules();
    console.log('✅ Recurring loads processed:', results);
  } catch (error) {
    console.error('❌ Recurring load processing failed:', error);
  }
}, {
  scheduled: false
});

/**
 * Start all cron jobs
 */
function startAllJobs() {
  console.log('\n🕐 Starting background cron jobs...');
  
  dailyInsuranceCheck.start();
  console.log('  ✅ Daily Insurance Check (2 AM)');
  
  dailyInsuranceAlerts.start();
  console.log('  ✅ Daily Insurance Alerts (3 AM)');
  
  weeklyFMCSACheck.start();
  console.log('  ✅ Weekly FMCSA Re-verification (Sunday 1 AM)');
  
  dailyPerformanceUpdate.start();
  console.log('  ✅ Daily Performance Score Update (4 AM)');
  
  hourlyRecurringLoads.start();
  console.log('  ✅ Hourly Recurring Load Processing');
  
  console.log('🎉 All background jobs started!\n');
}

/**
 * Stop all cron jobs
 */
function stopAllJobs() {
  dailyInsuranceCheck.stop();
  dailyInsuranceAlerts.stop();
  weeklyFMCSACheck.stop();
  dailyPerformanceUpdate.stop();
  hourlyRecurringLoads.stop();
  console.log('⏸️  All background jobs stopped');
}

/**
 * Run job immediately (for testing)
 */
async function runJobNow(jobName) {
  console.log(`🔄 Running ${jobName} immediately...`);
  
  const jobs = {
    'insurance-check': () => insuranceService.batchCheckExpiredInsurance(),
    'insurance-alerts': () => insuranceService.sendExpiryAlerts(),
    'fmcsa-verify': () => fmcsaService.batchVerifyCarriers(),
    'performance-update': () => performanceService.batchUpdatePerformances(),
    'recurring-loads': () => recurringService.processRecurringSchedules()
  };

  if (!jobs[jobName]) {
    throw new Error(`Unknown job: ${jobName}`);
  }

  try {
    const results = await jobs[jobName]();
    console.log('✅ Job complete:', results);
    return results;
  } catch (error) {
    console.error('❌ Job failed:', error);
    throw error;
  }
}

module.exports = {
  startAllJobs,
  stopAllJobs,
  runJobNow,
  jobs: {
    dailyInsuranceCheck,
    dailyInsuranceAlerts,
    weeklyFMCSACheck,
    dailyPerformanceUpdate,
    hourlyRecurringLoads
  }
};


