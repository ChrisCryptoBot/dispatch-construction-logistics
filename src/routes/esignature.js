/**
 * E-Signature Routes
 * Handle electronic signature capture for BOL and POD
 */

const express = require('express');
const { prisma } = require('../db/prisma');
const { authenticateJWT } = require('../middleware/auth');
const eSignService = require('../services/eSignatureService');

const router = express.Router();

/**
 * GET /esignature/bol/:loadId - Get BOL for e-signing
 */
router.get('/bol/:loadId', authenticateJWT, async (req, res) => {
  try {
    const { loadId } = req.params;

    const bolData = await eSignService.getESignDocument(loadId, 'BOL');

    res.json({
      success: true,
      document: bolData
    });

  } catch (error) {
    console.error('Get BOL error:', error);
    res.status(404).json({
      error: error.message,
      code: 'BOL_NOT_FOUND'
    });
  }
});

/**
 * POST /esignature/bol/:loadId/sign - Sign BOL electronically
 */
router.post('/bol/:loadId/sign', authenticateJWT, async (req, res) => {
  try {
    const { loadId } = req.params;
    const { signatureType, signatureData, signedBy } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;

    if (!signatureType || !signatureData || !signedBy) {
      return res.status(400).json({
        error: 'Missing required fields: signatureType, signatureData, signedBy',
        code: 'MISSING_REQUIRED_FIELDS'
      });
    }

    if (!['SHIPPER', 'DRIVER'].includes(signatureType)) {
      return res.status(400).json({
        error: 'Invalid signature type. Must be SHIPPER or DRIVER',
        code: 'INVALID_SIGNATURE_TYPE'
      });
    }

    const result = await eSignService.signBOL(
      loadId,
      signatureType,
      signatureData,
      signedBy,
      ipAddress
    );

    res.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('Sign BOL error:', error);
    res.status(500).json({
      error: 'Internal server error signing BOL',
      code: 'BOL_SIGN_ERROR'
    });
  }
});

/**
 * GET /esignature/pod/:loadId - Get POD for e-signing
 */
router.get('/pod/:loadId', authenticateJWT, async (req, res) => {
  try {
    const { loadId } = req.params;

    const podData = await eSignService.getESignDocument(loadId, 'POD');

    res.json({
      success: true,
      document: podData
    });

  } catch (error) {
    console.error('Get POD error:', error);
    res.status(404).json({
      error: error.message,
      code: 'POD_NOT_FOUND'
    });
  }
});

/**
 * POST /esignature/pod/:loadId/sign - Sign POD electronically
 */
router.post('/pod/:loadId/sign', authenticateJWT, async (req, res) => {
  try {
    const { loadId } = req.params;
    const { signatureType, deliveryData, signatureData, signedBy } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;

    if (!signatureType || !signatureData || !signedBy) {
      return res.status(400).json({
        error: 'Missing required fields: signatureType, signatureData, signedBy',
        code: 'MISSING_REQUIRED_FIELDS'
      });
    }

    if (!['RECEIVER', 'DRIVER'].includes(signatureType)) {
      return res.status(400).json({
        error: 'Invalid signature type. Must be RECEIVER or DRIVER',
        code: 'INVALID_SIGNATURE_TYPE'
      });
    }

    // Receiver must provide delivery verification data
    if (signatureType === 'RECEIVER' && !deliveryData) {
      return res.status(400).json({
        error: 'Receiver must provide delivery data (actualQuantity, condition)',
        code: 'MISSING_DELIVERY_DATA'
      });
    }

    const result = await eSignService.signPOD(
      loadId,
      signatureType,
      deliveryData,
      signatureData,
      signedBy,
      ipAddress
    );

    res.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('Sign POD error:', error);
    res.status(500).json({
      error: 'Internal server error signing POD',
      code: 'POD_SIGN_ERROR'
    });
  }
});

/**
 * GET /esignature/documents/:loadId - Get all signed documents for a load
 */
router.get('/documents/:loadId', authenticateJWT, async (req, res) => {
  try {
    const { loadId } = req.params;

    const documents = await prisma.document.findMany({
      where: {
        loadId,
        type: { in: ['BOL', 'POD', 'RATE_CONFIRMATION'] },
        status: 'SIGNED'
      },
      orderBy: { createdAt: 'asc' }
    });

    res.json({
      success: true,
      documents
    });

  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({
      error: 'Internal server error fetching documents',
      code: 'DOCUMENTS_ERROR'
    });
  }
});

module.exports = router;

