/**
 * BullMQ Queue Configuration - Production Ready
 * 
 * Handles background job processing for async operations
 * Optimized for reliability and performance
 */

const { Queue, Worker, QueueScheduler } = require('bullmq');
const { redis } = require('./redis');

// Queue connection config
const queueConnection = {
  connection: redis
};

// Queue names
const QueueNames = {
  EMAIL: 'email-notifications',
  FMCSA_VERIFICATION: 'fmcsa-verification',
  INSURANCE_CHECK: 'insurance-check',
  GPS_PROCESSING: 'gps-processing',
  PAYMENT_PROCESSING: 'payment-processing',
  RECURRING_LOADS: 'recurring-loads',
  ANALYTICS: 'analytics'
};

// Create queues
const queues = {};

Object.values(QueueNames).forEach(queueName => {
  queues[queueName] = new Queue(queueName, {
    ...queueConnection,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000 // Start with 2 seconds
      },
      removeOnComplete: {
        age: 24 * 3600, // Keep completed jobs for 24 hours
        count: 1000 // Keep max 1000 completed jobs
      },
      removeOnFail: {
        age: 7 * 24 * 3600 // Keep failed jobs for 7 days
      }
    }
  });
});

// Job priority levels
const JobPriority = {
  CRITICAL: 1,
  HIGH: 5,
  NORMAL: 10,
  LOW: 15
};

// Helper functions to add jobs
const addJob = async (queueName, jobName, data, options = {}) => {
  try {
    const queue = queues[queueName];
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    const job = await queue.add(jobName, data, {
      priority: options.priority || JobPriority.NORMAL,
      delay: options.delay || 0,
      ...options
    });

    return job;
  } catch (error) {
    console.error(`Failed to add job ${jobName} to queue ${queueName}:`, error.message);
    throw error;
  }
};

// Specific job adders
const queueJobs = {
  // Email notifications
  sendEmail: (emailData) => addJob(
    QueueNames.EMAIL,
    'send-email',
    emailData,
    { priority: JobPriority.HIGH }
  ),

  // FMCSA verification
  verifyCarrier: (orgId) => addJob(
    QueueNames.FMCSA_VERIFICATION,
    'verify-carrier',
    { orgId },
    { priority: JobPriority.NORMAL }
  ),

  batchVerifyCarriers: (orgIds) => addJob(
    QueueNames.FMCSA_VERIFICATION,
    'batch-verify',
    { orgIds },
    { priority: JobPriority.LOW }
  ),

  // Insurance checks
  checkInsurance: (orgId) => addJob(
    QueueNames.INSURANCE_CHECK,
    'check-insurance',
    { orgId },
    { priority: JobPriority.HIGH }
  ),

  sendInsuranceAlert: (orgId, policyId) => addJob(
    QueueNames.INSURANCE_CHECK,
    'send-alert',
    { orgId, policyId },
    { priority: JobPriority.HIGH }
  ),

  // GPS processing
  processGPSLocation: (loadId, locationData) => addJob(
    QueueNames.GPS_PROCESSING,
    'process-location',
    { loadId, locationData },
    { priority: JobPriority.NORMAL }
  ),

  // Payment processing
  processInvoice: (invoiceId) => addJob(
    QueueNames.PAYMENT_PROCESSING,
    'process-invoice',
    { invoiceId },
    { priority: JobPriority.CRITICAL }
  ),

  processPayout: (payoutId) => addJob(
    QueueNames.PAYMENT_PROCESSING,
    'process-payout',
    { payoutId },
    { priority: JobPriority.CRITICAL }
  ),

  // Recurring loads
  createRecurringLoad: (scheduleId) => addJob(
    QueueNames.RECURRING_LOADS,
    'create-load',
    { scheduleId },
    { priority: JobPriority.NORMAL }
  ),

  // Analytics
  updateCarrierScore: (carrierId) => addJob(
    QueueNames.ANALYTICS,
    'update-score',
    { carrierId },
    { priority: JobPriority.LOW }
  )
};

// Queue event handlers for monitoring
Object.values(queues).forEach(queue => {
  queue.on('error', (error) => {
    console.error(`Queue ${queue.name} error:`, error.message);
  });

  queue.on('waiting', (jobId) => {
    console.log(`Job ${jobId} is waiting in queue ${queue.name}`);
  });

  queue.on('completed', (jobId, result) => {
    console.log(`Job ${jobId} completed in queue ${queue.name}`);
  });

  queue.on('failed', (jobId, error) => {
    console.error(`Job ${jobId} failed in queue ${queue.name}:`, error.message);
  });
});

// Graceful shutdown
const closeQueues = async () => {
  console.log('Closing queues...');
  const closePromises = Object.values(queues).map(queue => queue.close());
  await Promise.all(closePromises);
  console.log('All queues closed');
};

process.on('SIGTERM', closeQueues);
process.on('SIGINT', closeQueues);

module.exports = {
  queues,
  QueueNames,
  JobPriority,
  addJob,
  queueJobs,
  closeQueues
};

