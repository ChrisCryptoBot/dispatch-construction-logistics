const express = require('express');
const router = express.Router();
const disputeService = require('../services/disputeService');
const { authenticateJWT } = require('../middleware/auth');

/**
 * Dispute Resolution Routes
 * Handles all dispute-related endpoints
 */

/**
 * POST /api/disputes/open
 * Open a dispute on a load
 */
router.post('/open', authenticateJWT, async (req, res) => {
  try {
    const { loadId, reason, description, requestedResolution } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Determine if user is customer or carrier based on org type
    const { prisma } = require('../db/prisma');
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { organization: true }
    });

    let role = 'CUSTOMER';
    if (user.organization.type === 'CARRIER') {
      role = 'CARRIER';
    }

    const result = await disputeService.openDispute(
      loadId,
      userId,
      role,
      { reason, description, requestedResolution }
    );

    res.json({
      success: true,
      dispute: result
    });
  } catch (error) {
    console.error('Open dispute error:', error);

    if (error.message === 'LOAD_NOT_FOUND') {
      return res.status(404).json({ error: 'Load not found' });
    }

    if (error.message === 'INVALID_STATUS') {
      return res.status(400).json({ error: 'Cannot dispute load in current status' });
    }

    if (error.message === 'DISPUTE_ALREADY_OPEN') {
      return res.status(400).json({ error: 'Dispute already open for this load' });
    }

    res.status(500).json({ error: 'Failed to open dispute' });
  }
});

/**
 * POST /api/disputes/:loadId/evidence
 * Submit evidence for a dispute
 */
router.post('/:loadId/evidence', authenticateJWT, async (req, res) => {
  try {
    const { loadId } = req.params;
    const { evidenceType, fileUrls, description } = req.body;
    const userId = req.user.id;

    // Determine user role
    const { prisma } = require('../db/prisma');
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { organization: true }
    });

    let role = 'CUSTOMER';
    if (user.organization.type === 'CARRIER') {
      role = 'CARRIER';
    }

    const evidence = await disputeService.submitEvidence(
      loadId,
      userId,
      role,
      { evidenceType, fileUrls, description }
    );

    res.json({
      success: true,
      evidence
    });
  } catch (error) {
    console.error('Submit evidence error:', error);

    if (error.message === 'LOAD_NOT_FOUND') {
      return res.status(404).json({ error: 'Load not found' });
    }

    if (error.message === 'NO_ACTIVE_DISPUTE') {
      return res.status(400).json({ error: 'No active dispute for this load' });
    }

    res.status(500).json({ error: 'Failed to submit evidence' });
  }
});

/**
 * POST /api/disputes/:loadId/resolve
 * Resolve a dispute (admin only)
 */
router.post('/:loadId/resolve', authenticateJWT, async (req, res) => {
  try {
    const { loadId } = req.params;
    const { resolution, winner, notes, financialAdjustment } = req.body;
    const adminId = req.user.id;

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const result = await disputeService.resolveDispute(
      loadId,
      adminId,
      { resolution, winner, notes, financialAdjustment }
    );

    res.json({
      success: true,
      resolution: result
    });
  } catch (error) {
    console.error('Resolve dispute error:', error);

    if (error.message === 'LOAD_NOT_FOUND') {
      return res.status(404).json({ error: 'Load not found' });
    }

    if (error.message === 'NO_ACTIVE_DISPUTE') {
      return res.status(400).json({ error: 'No active dispute to resolve' });
    }

    if (error.message === 'INVALID_RESOLUTION') {
      return res.status(400).json({ error: 'Invalid resolution type' });
    }

    res.status(500).json({ error: 'Failed to resolve dispute' });
  }
});

/**
 * GET /api/disputes/:loadId/evidence
 * Get all evidence for a dispute
 */
router.get('/:loadId/evidence', authenticateJWT, async (req, res) => {
  try {
    const { loadId } = req.params;

    const evidence = await disputeService.getDisputeEvidence(loadId);

    res.json({
      success: true,
      evidence
    });
  } catch (error) {
    console.error('Get evidence error:', error);
    res.status(500).json({ error: 'Failed to get evidence' });
  }
});

/**
 * GET /api/disputes/open
 * Get all open disputes (admin only)
 */
router.get('/open', authenticateJWT, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const disputes = await disputeService.getOpenDisputes();

    res.json({
      success: true,
      disputes,
      count: disputes.length
    });
  } catch (error) {
    console.error('Get open disputes error:', error);
    res.status(500).json({ error: 'Failed to get open disputes' });
  }
});

/**
 * GET /api/disputes/:loadId/recommendation
 * Get AI-recommended resolution (admin only)
 */
router.get('/:loadId/recommendation', authenticateJWT, async (req, res) => {
  try {
    const { loadId } = req.params;

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const recommendation = await disputeService.calculateRecommendation(loadId);

    res.json({
      success: true,
      recommendation
    });
  } catch (error) {
    console.error('Get recommendation error:', error);

    if (error.message === 'LOAD_NOT_FOUND') {
      return res.status(404).json({ error: 'Load not found' });
    }

    res.status(500).json({ error: 'Failed to calculate recommendation' });
  }
});

module.exports = router;
