/**
 * BullMQ Queue Definitions
 * 
 * Centralized queue setup for all async operations.
 * Workers are in separate files (bid.processor.js, etc.)
 */

const { Queue } = require('bullmq')
const { connection } = require('./redis')

// ============================================================================
// QUEUE DEFINITIONS
// ============================================================================

// Bid notifications (email, SMS, in-app)
const bidQueue = new Queue('bid-notifications', {
  connection,
  defaultJobOptions: {
    removeOnComplete: 100, // Keep last 100 completed jobs
    removeOnFail: 1000, // Keep last 1000 failed jobs
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000 // Start with 5s, double each retry
    }
  }
})

// Rate Con generation
const rateConQueue = new Queue('rate-con-generation', {
  connection,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 1000,
    attempts: 2,
    backoff: {
      type: 'exponential',
      delay: 10000
    }
  }
})

// SMS notifications
const smsQueue = new Queue('sms-notifications', {
  connection,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 1000,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000
    }
  }
})

// Email notifications
const emailQueue = new Queue('email-notifications', {
  connection,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 1000,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000
    }
  }
})

// Calendar sync
const calendarQueue = new Queue('calendar-sync', {
  connection,
  defaultJobOptions: {
    removeOnComplete: 50,
    removeOnFail: 500,
    attempts: 2
  }
})

// Document processing (watermarking, PDF generation)
const documentQueue = new Queue('document-processing', {
  connection,
  defaultJobOptions: {
    removeOnComplete: 50,
    removeOnFail: 500,
    attempts: 2
  }
})

// Payment processing
const paymentQueue = new Queue('payment-processing', {
  connection,
  defaultJobOptions: {
    removeOnComplete: 1000, // Keep for audit
    removeOnFail: 5000,
    attempts: 2,
    backoff: {
      type: 'fixed',
      delay: 24 * 60 * 60 * 1000 // 24 hours
    }
  }
})

// ============================================================================
// QUEUE HEALTH MONITORING
// ============================================================================

const getQueueHealth = async () => {
  const queues = [
    { name: 'bid-notifications', queue: bidQueue },
    { name: 'rate-con-generation', queue: rateConQueue },
    { name: 'sms-notifications', queue: smsQueue },
    { name: 'email-notifications', queue: emailQueue },
    { name: 'calendar-sync', queue: calendarQueue },
    { name: 'document-processing', queue: documentQueue },
    { name: 'payment-processing', queue: paymentQueue }
  ]

  const health = []

  for (const { name, queue } of queues) {
    const [waiting, active, completed, failed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount()
    ])

    health.push({
      name,
      waiting,
      active,
      completed,
      failed,
      status: failed > waiting + active ? 'degraded' : 'healthy'
    })
  }

  return health
}

// Make queues available globally for easy access in routes
global.bidQueue = bidQueue
global.rateConQueue = rateConQueue
global.smsQueue = smsQueue
global.emailQueue = emailQueue
global.calendarQueue = calendarQueue
global.documentQueue = documentQueue
global.paymentQueue = paymentQueue

module.exports = {
  bidQueue,
  rateConQueue,
  smsQueue,
  emailQueue,
  calendarQueue,
  documentQueue,
  paymentQueue,
  getQueueHealth
}



