const { prisma } = require('../db/prisma');

/**
 * Recurring Loads & Templates Service
 * Manages load templates and automated recurring load posting
 */

/**
 * Create load template from existing load
 * @param {string} loadId - Source load ID
 * @param {string} customerId - Customer organization ID
 * @param {string} templateName - Template name
 * @returns {Promise<Object>} Created template
 */
async function createTemplateFromLoad(loadId, customerId, templateName) {
  const load = await prisma.load.findUnique({
    where: { id: loadId },
    select: {
      shipperId: true,
      loadType: true,
      rateMode: true,
      haulType: true,
      commodity: true,
      equipmentType: true,
      origin: true,
      destination: true,
      rate: true,
      units: true,
      dumpFee: true,
      fuelSurcharge: true,
      tolls: true,
      jobCode: true,
      poNumber: true,
      projectName: true,
      notes: true,
      overweightPermit: true,
      prevailingWage: true,
      publicProject: true,
      requiresEscort: true
    }
  });

  if (!load) {
    throw new Error('LOAD_NOT_FOUND');
  }

  if (load.shipperId !== customerId) {
    throw new Error('ACCESS_DENIED');
  }

  // Create template
  const template = await prisma.loadTemplate.create({
    data: {
      customerId,
      name: templateName,
      payload: JSON.stringify(load)
    }
  });

  return template;
}

/**
 * Create load from template
 * @param {string} templateId - Template ID
 * @param {Object} overrides - Optional field overrides (pickupDate, deliveryDate, etc.)
 * @returns {Promise<Object>} Created load
 */
async function createLoadFromTemplate(templateId, overrides = {}) {
  const template = await prisma.loadTemplate.findUnique({
    where: { id: templateId }
  });

  if (!template) {
    throw new Error('TEMPLATE_NOT_FOUND');
  }

  const templateData = JSON.parse(template.payload);

  // Merge template data with overrides
  const loadData = {
    ...templateData,
    ...overrides,
    status: 'POSTED', // Always post new loads
    createdAt: undefined, // Remove old timestamp
    id: undefined // Generate new ID
  };

  // Set default dates if not provided
  if (!loadData.pickupDate) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    loadData.pickupDate = tomorrow;
  }

  if (!loadData.deliveryDate) {
    loadData.deliveryDate = loadData.pickupDate;
  }

  // Convert JSON strings back to JSON for Prisma
  if (typeof loadData.origin === 'string') {
    loadData.origin = loadData.origin; // Already JSON string
  } else {
    loadData.origin = JSON.stringify(loadData.origin);
  }

  if (typeof loadData.destination === 'string') {
    loadData.destination = loadData.destination;
  } else {
    loadData.destination = JSON.stringify(loadData.destination);
  }

  // Create the load
  const load = await prisma.load.create({
    data: {
      orgId: template.customerId,
      shipperId: template.customerId,
      ...loadData
    }
  });

  return load;
}

/**
 * Create recurring schedule for template
 * @param {string} templateId - Template ID
 * @param {string} cronExpr - Cron expression (e.g., "0 6 * * 1-5" = 6 AM Mon-Fri)
 * @returns {Promise<Object>} Recurring schedule
 */
async function createRecurringSchedule(templateId, cronExpr) {
  const template = await prisma.loadTemplate.findUnique({
    where: { id: templateId }
  });

  if (!template) {
    throw new Error('TEMPLATE_NOT_FOUND');
  }

  // Calculate next run time from cron expression
  const nextRunAt = calculateNextRun(cronExpr);

  const schedule = await prisma.recurringSchedule.create({
    data: {
      templateId,
      cronExpr,
      nextRunAt,
      active: true
    }
  });

  return schedule;
}

/**
 * Process recurring schedules (run by cron job)
 * @returns {Promise<Object>} Processing results
 */
async function processRecurringSchedules() {
  const now = new Date();

  // Get schedules that are due
  const dueSchedules = await prisma.recurringSchedule.findMany({
    where: {
      active: true,
      nextRunAt: { lte: now }
    },
    include: {
      template: true
    }
  });

  const results = {
    total: dueSchedules.length,
    created: 0,
    errors: []
  };

  for (const schedule of dueSchedules) {
    try {
      // Create load from template
      const load = await createLoadFromTemplate(schedule.templateId);
      
      console.log(`✅ Recurring load created: ${load.id} from template ${schedule.template.name}`);

      // Calculate next run time
      const nextRunAt = calculateNextRun(schedule.cronExpr);

      // Update schedule
      await prisma.recurringSchedule.update({
        where: { id: schedule.id },
        data: {
          lastRunAt: now,
          nextRunAt
        }
      });

      results.created++;

    } catch (error) {
      results.errors.push({
        scheduleId: schedule.id,
        templateId: schedule.templateId,
        error: error.message
      });
    }
  }

  return results;
}

/**
 * Calculate next run time from cron expression
 * Simple implementation - just adds 1 day for now
 * (Full cron parser would use 'cron-parser' library)
 * @param {string} cronExpr - Cron expression
 * @returns {Date} Next run time
 */
function calculateNextRun(cronExpr) {
  // Simple implementation: daily schedule
  // For production, use cron-parser library
  const nextRun = new Date();
  nextRun.setDate(nextRun.getDate() + 1);
  nextRun.setHours(6, 0, 0, 0); // 6 AM tomorrow
  
  return nextRun;
}

/**
 * Get templates for customer
 * @param {string} customerId - Customer organization ID
 * @returns {Promise<Array>} Templates
 */
async function getCustomerTemplates(customerId) {
  const templates = await prisma.loadTemplate.findMany({
    where: { customerId },
    orderBy: { createdAt: 'desc' }
  });

  return templates;
}

/**
 * Delete template
 * @param {string} templateId - Template ID
 * @param {string} customerId - Customer organization ID (for access control)
 * @returns {Promise<Object>} Delete result
 */
async function deleteTemplate(templateId, customerId) {
  const template = await prisma.loadTemplate.findUnique({
    where: { id: templateId }
  });

  if (!template) {
    throw new Error('TEMPLATE_NOT_FOUND');
  }

  if (template.customerId !== customerId) {
    throw new Error('ACCESS_DENIED');
  }

  // Delete associated recurring schedules first
  await prisma.recurringSchedule.deleteMany({
    where: { templateId }
  });

  // Delete template
  await prisma.loadTemplate.delete({
    where: { id: templateId }
  });

  return { success: true, message: 'Template deleted' };
}

module.exports = {
  createTemplateFromLoad,
  createLoadFromTemplate,
  createRecurringSchedule,
  processRecurringSchedules,
  getCustomerTemplates,
  deleteTemplate,
  calculateNextRun
};

