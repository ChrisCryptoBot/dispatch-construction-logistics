const express = require('express');
const { prisma } = require('../db/prisma');
const { authenticateJWT } = require('../middleware/auth');
const recurringService = require('../services/recurringLoadsService');

const router = express.Router();

/**
 * POST /api/templates/from-load/:loadId - Create template from existing load
 */
router.post('/from-load/:loadId', authenticateJWT, async (req, res) => {
  try {
    const { loadId } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        error: 'Template name required',
        code: 'MISSING_NAME'
      });
    }

    const template = await recurringService.createTemplateFromLoad(loadId, req.user.orgId, name);

    res.status(201).json({
      success: true,
      template: {
        id: template.id,
        name: template.name,
        createdAt: template.createdAt
      }
    });

  } catch (error) {
    console.error('Create template error:', error);

    const errorMap = {
      'LOAD_NOT_FOUND': { status: 404, code: 'LOAD_NOT_FOUND' },
      'ACCESS_DENIED': { status: 403, code: 'ACCESS_DENIED' }
    };

    const mapped = errorMap[error.message] || { status: 500, code: 'TEMPLATE_CREATION_ERROR' };

    res.status(mapped.status).json({
      error: error.message,
      code: mapped.code
    });
  }
});

/**
 * GET /api/templates - Get customer's templates
 */
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const templates = await recurringService.getCustomerTemplates(req.user.orgId);

    res.json({
      success: true,
      templates: templates.map(t => ({
        id: t.id,
        name: t.name,
        createdAt: t.createdAt
      }))
    });

  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({
      error: error.message,
      code: 'GET_TEMPLATES_ERROR'
    });
  }
});

/**
 * POST /api/templates/:id/create-load - Create load from template
 */
router.post('/:id/create-load', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const overrides = req.body; // pickupDate, deliveryDate, etc.

    const load = await recurringService.createLoadFromTemplate(id, overrides);

    res.status(201).json({
      success: true,
      load: {
        id: load.id,
        status: load.status,
        commodity: load.commodity,
        pickupDate: load.pickupDate
      }
    });

  } catch (error) {
    console.error('Create load from template error:', error);

    const errorMap = {
      'TEMPLATE_NOT_FOUND': { status: 404, code: 'TEMPLATE_NOT_FOUND' }
    };

    const mapped = errorMap[error.message] || { status: 500, code: 'LOAD_CREATION_ERROR' };

    res.status(mapped.status).json({
      error: error.message,
      code: mapped.code
    });
  }
});

/**
 * POST /api/templates/:id/schedule - Create recurring schedule
 */
router.post('/:id/schedule', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const { cronExpr } = req.body;

    if (!cronExpr) {
      return res.status(400).json({
        error: 'Cron expression required',
        code: 'MISSING_CRON_EXPR'
      });
    }

    const schedule = await recurringService.createRecurringSchedule(id, cronExpr);

    res.status(201).json({
      success: true,
      schedule: {
        id: schedule.id,
        cronExpr: schedule.cronExpr,
        nextRunAt: schedule.nextRunAt,
        active: schedule.active
      }
    });

  } catch (error) {
    console.error('Create schedule error:', error);

    const errorMap = {
      'TEMPLATE_NOT_FOUND': { status: 404, code: 'TEMPLATE_NOT_FOUND' }
    };

    const mapped = errorMap[error.message] || { status: 500, code: 'SCHEDULE_CREATION_ERROR' };

    res.status(mapped.status).json({
      error: error.message,
      code: mapped.code
    });
  }
});

/**
 * DELETE /api/templates/:id - Delete template
 */
router.delete('/:id', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await recurringService.deleteTemplate(id, req.user.orgId);

    res.json(result);

  } catch (error) {
    console.error('Delete template error:', error);

    const errorMap = {
      'TEMPLATE_NOT_FOUND': { status: 404, code: 'TEMPLATE_NOT_FOUND' },
      'ACCESS_DENIED': { status: 403, code: 'ACCESS_DENIED' }
    };

    const mapped = errorMap[error.message] || { status: 500, code: 'DELETE_ERROR' };

    res.status(mapped.status).json({
      error: error.message,
      code: mapped.code
    });
  }
});

module.exports = router;

