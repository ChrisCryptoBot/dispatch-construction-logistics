/**
 * Worker Manager - Starts all background workers
 */

const emailWorker = require('./emailWorker');

// Import other workers as they're created
// const fmcsaWorker = require('./fmcsaWorker');
// const insuranceWorker = require('./insuranceWorker');
// const gpsWorker = require('./gpsWorker');
// const paymentWorker = require('./paymentWorker');

const workers = [
  emailWorker
  // Add other workers here as they're implemented
];

// Start all workers
const startWorkers = () => {
  console.log('🚀 Starting background workers...');
  console.log(`✅ ${workers.length} worker(s) initialized`);
  
  workers.forEach(worker => {
    console.log(`  - ${worker.name || 'Worker'} started`);
  });
};

// Stop all workers gracefully
const stopWorkers = async () => {
  console.log('Stopping background workers...');
  
  const closePromises = workers.map(worker => worker.close());
  await Promise.all(closePromises);
  
  console.log('✅ All workers stopped');
};

// Graceful shutdown
process.on('SIGTERM', stopWorkers);
process.on('SIGINT', stopWorkers);

module.exports = {
  workers,
  startWorkers,
  stopWorkers
};

