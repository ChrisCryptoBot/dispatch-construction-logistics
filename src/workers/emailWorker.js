/**
 * Email Worker - Processes email notification jobs
 */

const { Worker } = require('bullmq');
const { redis } = require('../config/redis');
const { QueueNames } = require('../config/queue');
const emailService = require('../services/emailService');

const emailWorker = new Worker(
  QueueNames.EMAIL,
  async (job) => {
    const { name, data } = job;

    console.log(`Processing email job: ${name} (${job.id})`);

    try {
      switch (name) {
        case 'send-email':
          await emailService.sendEmail(
            data.to,
            data.subject,
            data.htmlContent
          );
          break;

        case 'send-insurance-blocked':
          await emailService.sendInsuranceBlockedEmail(data.organization);
          break;

        case 'send-release-notification':
          await emailService.sendReleaseNotification(data.load, data.carrier);
          break;

        case 'send-invoice':
          await emailService.sendInvoiceEmail(data.invoice, data.customer);
          break;

        default:
          console.warn(`Unknown email job type: ${name}`);
      }

      return { success: true, jobName: name };
    } catch (error) {
      console.error(`Email job ${name} failed:`, error.message);
      throw error; // Will trigger retry
    }
  },
  {
    connection: redis,
    concurrency: 5, // Process 5 emails at a time
    limiter: {
      max: 10, // Max 10 jobs
      duration: 1000 // Per second
    }
  }
);

// Event listeners
emailWorker.on('completed', (job) => {
  console.log(`✅ Email job ${job.id} completed successfully`);
});

emailWorker.on('failed', (job, error) => {
  console.error(`❌ Email job ${job.id} failed:`, error.message);
});

emailWorker.on('error', (error) => {
  console.error('Email worker error:', error.message);
});

module.exports = emailWorker;

