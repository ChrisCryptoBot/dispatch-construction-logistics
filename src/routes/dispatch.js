const express = require('express');
const { equipmentMatcher } = require('../services/matching/equipmentMatcher.js');
const { prisma } = require('../db/prisma');

const router = express.Router();

/**
 * POST /dispatch/assign
 * Main equipment assignment endpoint
 */
router.post('/assign', async (req, res) => {
  try {
    const { commodity, equipmentOverride, overrideReason, loadType, haulType } = req.body;

    // Validate required fields
    if (!commodity) {
      return res.status(400).json({
        error: 'Commodity is required',
        code: 'MISSING_COMMODITY'
      });
    }

    const matchRequest = {
      commodity,
      equipmentOverride,
      overrideReason,
      loadType,
      haulType
    };

    // Get equipment match
    const result = await equipmentMatcher.matchEquipment(matchRequest);

    // Return match result
    res.json({
      success: true,
      match: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Equipment matching error:', error);
    res.status(500).json({
      error: 'Internal server error during equipment matching',
      code: 'MATCHING_ERROR'
    });
  }
});

/**
 * GET /dispatch/suggestions/:commodity
 * Get equipment suggestions for a commodity
 */
router.get('/suggestions/:commodity', async (req, res) => {
  try {
    const { commodity } = req.params;
    const { loadType, haulType } = req.query;

    const suggestions = await equipmentMatcher.getEquipmentSuggestions(commodity);

    res.json({
      success: true,
      commodity,
      suggestions,
      filters: { loadType, haulType }
    });

  } catch (error) {
    console.error('Equipment suggestions error:', error);
    res.status(500).json({
      error: 'Internal server error fetching suggestions',
      code: 'SUGGESTIONS_ERROR'
    });
  }
});

/**
 * POST /dispatch/validate
 * Validate equipment-commodity combination
 */
router.post('/validate', async (req, res) => {
  try {
    const { equipmentName, commodity, loadType } = req.body;

    if (!equipmentName || !commodity || !loadType) {
      return res.status(400).json({
        error: 'equipmentName, commodity, and loadType are required',
        code: 'MISSING_FIELDS'
      });
    }

    const validation = await equipmentMatcher.validateEquipmentCompliance(
      equipmentName,
      commodity,
      loadType
    );

    res.json({
      success: true,
      validation,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Equipment validation error:', error);
    res.status(500).json({
      error: 'Internal server error during validation',
      code: 'VALIDATION_ERROR'
    });
  }
});

/**
 * GET /dispatch/equipment-types
 * Get all available equipment types
 */
router.get('/equipment-types', async (req, res) => {
  try {

    const equipmentTypes = await prisma.equipmentType.findMany({
      where: { active: true },
      select: {
        id: true,
        name: true,
        category: true,
        optimalFor: true,
        acceptableFor: true
      }
    });

    res.json({
      success: true,
      equipmentTypes
    });

  } catch (error) {
    console.error('Equipment types error:', error);
    res.status(500).json({
      error: 'Internal server error fetching equipment types',
      code: 'EQUIPMENT_TYPES_ERROR'
    });
  }
});

module.exports = router;

