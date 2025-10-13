const express = require('express');
const { prisma } = require('../db/prisma');
const { authenticateJWT } = require('../middleware/auth');
const fmcsaService = require('../services/fmcsaVerificationService');
const insuranceService = require('../services/insuranceVerificationService');

const router = express.Router();

/**
 * POST /api/verification/fmcsa/:orgId/verify
 * Verify carrier FMCSA authority
 */
router.post('/fmcsa/:orgId/verify', authenticateJWT, async (req, res) => {
  try {
    const { orgId } = req.params;

    // Access control: user must be in the org or be admin
    if (req.user.orgId !== orgId && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Access denied - can only verify own organization',
        code: 'ACCESS_DENIED'
      });
    }

    const result = await fmcsaService.verifyCarrier(orgId);

    res.json({
      success: true,
      verified: result.verified,
      status: result.status,
      safetyRating: result.safetyRating,
      message: result.message,
      verifiedAt: result.organization.fmcsaVerifiedAt
    });

  } catch (error) {
    console.error('FMCSA verification error:', error);
    
    const errorMap = {
      'Organization not found': { status: 404, code: 'ORG_NOT_FOUND' },
      'DOT or MC number required for FMCSA verification': { status: 400, code: 'MISSING_IDENTIFIERS' },
      'Only carrier organizations can be verified via FMCSA': { status: 400, code: 'INVALID_ORG_TYPE' }
    };

    const mappedError = errorMap[error.message] || { status: 500, code: 'VERIFICATION_ERROR' };

    res.status(mappedError.status).json({
      error: error.message,
      code: mappedError.code
    });
  }
});

/**
 * GET /api/verification/fmcsa/:orgId/status
 * Get current FMCSA verification status
 */
router.get('/fmcsa/:orgId/status', authenticateJWT, async (req, res) => {
  try {
    const { orgId } = req.params;

    // Access control
    if (req.user.orgId !== orgId && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Access denied',
        code: 'ACCESS_DENIED'
      });
    }

    const status = await fmcsaService.getVerificationStatus(orgId);

    res.json({
      success: true,
      ...status
    });

  } catch (error) {
    console.error('Get verification status error:', error);
    res.status(error.message === 'Organization not found' ? 404 : 500).json({
      error: error.message,
      code: error.message === 'Organization not found' ? 'ORG_NOT_FOUND' : 'STATUS_ERROR'
    });
  }
});

/**
 * POST /api/verification/batch
 * Batch verify all carriers (admin only)
 */
router.post('/batch', authenticateJWT, async (req, res) => {
  try {
    // Admin only
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Admin access required',
        code: 'ACCESS_DENIED'
      });
    }

    // This is a long-running operation, return immediately and run in background
    res.json({
      success: true,
      message: 'Batch verification started in background',
      note: 'This may take several minutes depending on number of carriers'
    });

    // Run in background (in production, use BullMQ)
    fmcsaService.batchVerifyCarriers()
      .then(results => {
        console.log('Batch verification complete:', results);
      })
      .catch(error => {
        console.error('Batch verification error:', error);
      });

  } catch (error) {
    console.error('Batch verification error:', error);
    res.status(500).json({
      error: 'Failed to start batch verification',
      code: 'BATCH_ERROR'
    });
  }
});

/**
 * POST /api/verification/insurance/:id/verify
 * Verify specific insurance policy
 */
router.post('/insurance/:id/verify', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const { minCoverageAmount } = req.body;

    const result = await insuranceService.verifyInsurance(id, minCoverageAmount);

    res.json({
      success: true,
      verified: result.verified,
      expired: result.expired,
      coverageAdequate: result.coverageAdequate,
      daysUntilExpiry: result.daysUntilExpiry,
      message: result.message
    });

  } catch (error) {
    console.error('Insurance verification error:', error);
    res.status(error.message === 'Insurance record not found' ? 404 : 500).json({
      error: error.message,
      code: error.message === 'Insurance record not found' ? 'INSURANCE_NOT_FOUND' : 'VERIFICATION_ERROR'
    });
  }
});

/**
 * GET /api/verification/insurance/:orgId/status
 * Check all insurance policies for a carrier
 */
router.get('/insurance/:orgId/status', authenticateJWT, async (req, res) => {
  try {
    const { orgId } = req.params;

    // Access control
    if (req.user.orgId !== orgId && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Access denied',
        code: 'ACCESS_DENIED'
      });
    }

    const status = await insuranceService.checkCarrierInsurance(orgId);

    res.json({
      success: true,
      ...status
    });

  } catch (error) {
    console.error('Insurance status check error:', error);
    res.status(500).json({
      error: error.message,
      code: 'STATUS_CHECK_ERROR'
    });
  }
});

/**
 * GET /api/verification/insurance/expiring
 * Get insurance policies expiring soon (admin only)
 */
router.get('/insurance/expiring', authenticateJWT, async (req, res) => {
  try {
    // Admin only
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Admin access required',
        code: 'ACCESS_DENIED'
      });
    }

    const { days = 30 } = req.query;
    const expiring = await insuranceService.getExpiringPolicies(parseInt(days));

    res.json({
      success: true,
      count: expiring.length,
      policies: expiring
    });

  } catch (error) {
    console.error('Get expiring policies error:', error);
    res.status(500).json({
      error: error.message,
      code: 'EXPIRING_POLICIES_ERROR'
    });
  }
});

module.exports = router;

