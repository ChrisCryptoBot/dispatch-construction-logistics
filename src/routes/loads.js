const express = require('express');
const { prisma } = require('../db/prisma');
const { authenticateJWT, requireOrgOwnership } = require('../middleware/auth');
const { equipmentMatcher } = require('../services/matching/equipmentMatcher');
const { haulTypeDetector } = require('../services/matching/haulTypeDetector');
const { rateCalculator } = require('../services/pricing/rateCalculator');
const { complianceEngine } = require('../services/compliance/complianceEngine');
const paymentService = require('../services/paymentService');
const { parsePagination, createPaginationMeta, parseSorting } = require('../utils/pagination');

const router = express.Router();

/**
 * POST /loads - Create a new load
 */
router.post('/', authenticateJWT, requireOrgOwnership, async (req, res) => {
  try {
    console.log('=== LOAD CREATION DEBUG ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('User:', JSON.stringify(req.user, null, 2));
    
    // Security: Force orgId and shipperId to authenticated user's organization
    const orgId = req.user.orgId;
    const shipperId = req.user.orgId;
    
    const {
      loadType,
      commodity,
      equipmentType,
      origin,
      destination,
      pickupDate,
      deliveryDate,
      rate,
      rateMode,
      units,
      miles,
      deadhead,
      notes,
      jobCode,
      poNumber,
      projectName,
      dumpFee,
      fuelSurcharge,
      tolls
    } = req.body;

    // Validate required fields
    if (!loadType || !commodity || !origin || !destination || !pickupDate || !deliveryDate || !rate) {
      return res.status(400).json({
        error: 'Missing required fields: loadType, commodity, origin, destination, pickupDate, deliveryDate, rate',
        code: 'MISSING_REQUIRED_FIELDS'
      });
    }

    // Calculate distance and detect haul type
    const distance = await haulTypeDetector.calculateDistance(origin, destination);
    const detectedHaulType = haulTypeDetector.detectHaulType(distance);
    
    // Auto-suggest rate mode if not provided
    const finalRateMode = rateMode || haulTypeDetector.suggestRateMode(detectedHaulType, commodity);

    // Equipment matching
    const equipmentMatch = await equipmentMatcher.matchEquipment({
      commodity,
      equipmentOverride: equipmentType,
      loadType,
      haulType: detectedHaulType
    });

    // Compliance check
    const complianceCheck = await complianceEngine.checkLoadCompliance({
      loadType,
      commodity,
      equipmentType: equipmentMatch.equipmentType,
      origin,
      destination,
      distance
    });

    // Calculate pricing
    const pricing = await rateCalculator.calculateLoadPricing({
      rateMode: finalRateMode,
      rate,
      units,
      miles: distance,
      deadhead,
      commodity,
      loadType,
      dumpFee,
      fuelSurcharge,
      tolls
    });

    // Create the load
    const load = await prisma.load.create({
      data: {
        orgId,
        shipperId,
        loadType,
        rateMode: finalRateMode,
        haulType: detectedHaulType,
        commodity,
        equipmentType: equipmentMatch.equipmentType,
        equipmentMatchTier: equipmentMatch.tier,
        overrideReason: equipmentMatch.overrideReason || null,
        origin: JSON.stringify(origin),
        destination: JSON.stringify(destination),
        rate: parseFloat(rate),
        units: units ? parseFloat(units) : null,
        miles: distance,
        deadhead: deadhead || null,
        dumpFee: dumpFee ? parseFloat(dumpFee) : null,
        fuelSurcharge: fuelSurcharge ? parseFloat(fuelSurcharge) : null,
        tolls: tolls ? parseFloat(tolls) : null,
        grossRevenue: parseFloat(pricing.grossRevenue),
        pickupDate: new Date(pickupDate),
        deliveryDate: new Date(deliveryDate),
        jobCode: jobCode || null,
        poNumber: poNumber || null,
        projectName: projectName || null,
        notes: notes || null,
        status: 'DRAFT'
      }
    });

    res.status(201).json({
      success: true,
      load,
      analysis: {
        distance,
        haulType: detectedHaulType,
        equipmentMatch,
        complianceCheck,
        pricing
      }
    });

  } catch (error) {
    console.error('=== LOAD CREATION ERROR ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      error: 'Internal server error creating load',
      details: error.message,
      code: 'LOAD_CREATION_ERROR'
    });
  }
});

/**
 * GET /loads/:id - Get load details
 */
router.get('/:id', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;

    const load = await prisma.load.findUnique({
      where: { id },
      include: {
        shipper: {
          select: { id: true, name: true, type: true }
        },
        carrier: {
          select: { id: true, name: true, type: true }
        },
        documents: true,
        scaleTickets: true
      }
    });

    if (!load) {
      return res.status(404).json({
        error: 'Load not found',
        code: 'LOAD_NOT_FOUND'
      });
    }

    // Verify user has access to this load
    if (load.shipperId !== req.user.orgId && load.carrierId !== req.user.orgId) {
      return res.status(403).json({
        error: 'Access denied',
        code: 'ACCESS_DENIED'
      });
    }

    res.json({
      success: true,
      load
    });

  } catch (error) {
    console.error('Load retrieval error:', error);
    res.status(500).json({
      error: 'Internal server error retrieving load',
      code: 'LOAD_RETRIEVAL_ERROR'
    });
  }
});

/**
 * PATCH /loads/:id/status - Update load status
 */
router.patch('/:id/status', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({
        error: 'Status is required',
        code: 'MISSING_STATUS'
      });
    }

    const validStatuses = ['DRAFT', 'POSTED', 'ASSIGNED', 'ACCEPTED', 'IN_TRANSIT', 'DELIVERED', 'PENDING_APPROVAL', 'COMPLETED', 'CANCELLED', 'DISPUTED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Invalid status',
        code: 'INVALID_STATUS',
        validStatuses
      });
    }

    const existingLoad = await prisma.load.findUnique({
      where: { id }
    });

    if (!existingLoad) {
      return res.status(404).json({
        error: 'Load not found',
        code: 'LOAD_NOT_FOUND'
      });
    }

    // Verify access
    if (existingLoad.shipperId !== req.user.orgId && existingLoad.carrierId !== req.user.orgId) {
      return res.status(403).json({
        error: 'Access denied',
        code: 'ACCESS_DENIED'
      });
    }

    const updateData = {
      status,
      notes: notes ? `${existingLoad.notes || ''}\n${new Date().toISOString()}: ${notes}`.trim() : existingLoad.notes
    };

    // Set completedAt timestamp when status changes to COMPLETED
    if (status === 'COMPLETED' && existingLoad.status !== 'COMPLETED') {
      updateData.completedAt = new Date();
    }

    // Handle payment workflows based on status
    let paymentResult = null;

    // When POD approved → capture payment and payout carrier
    if (status === 'PENDING_APPROVAL') {
      try {
        // Capture the authorized payment
        const captureResult = await paymentService.capturePayment(id);
        
        // Process carrier payout
        const payoutResult = await paymentService.processPayoutAsync(id, req.body.quickPay || false);
        
        paymentResult = {
          captured: true,
          amount: captureResult.invoice.amountCents / 100,
          payoutInitiated: true
        };

        // Automatically move to COMPLETED
        updateData.status = 'COMPLETED';
        updateData.completedAt = new Date();
        
        console.log(`✅ Payment captured and payout initiated for load ${id}`);
      } catch (error) {
        console.error(`⚠️ Payment processing failed for load ${id}:`, error.message);
        paymentResult = {
          captured: false,
          error: error.message
        };
      }
    }

    // When load cancelled → release payment authorization
    if (status === 'CANCELLED') {
      try {
        await paymentService.cancelAuthorization(id);
        console.log(`✅ Payment authorization cancelled for load ${id}`);
      } catch (error) {
        console.error(`⚠️ Failed to cancel authorization for load ${id}:`, error.message);
      }
    }

    // Update load with final status
    const load = await prisma.load.update({
      where: { id },
      data: updateData
    });

    res.json({
      success: true,
      load,
      payment: paymentResult
    });

  } catch (error) {
    console.error('Load status update error:', error);
    res.status(500).json({
      error: 'Internal server error updating load status',
      code: 'LOAD_STATUS_UPDATE_ERROR'
    });
  }
});

/**
 * GET /loads - List and filter loads (with safe pagination)
 */
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const { status, loadType, haulType, commodity } = req.query;

    // Parse pagination with validation (max 100 items per page)
    const pagination = parsePagination(req.query, { maxLimit: 100, defaultLimit: 20 });
    
    // Parse sorting with allowed fields
    const sorting = parseSorting(req.query, ['createdAt', 'updatedAt', 'pickupDate', 'deliveryDate', 'rate', 'status'], 'createdAt');

    const where = {
      OR: [
        { shipperId: req.user.orgId },
        { carrierId: req.user.orgId }
      ]
    };
    
    if (status) where.status = status;
    if (loadType) where.loadType = loadType;
    if (haulType) where.haulType = haulType;
    if (commodity) where.commodity = { contains: commodity, mode: 'insensitive' };

    const loads = await prisma.load.findMany({
      where,
      include: {
        shipper: {
          select: { id: true, name: true, type: true }
        },
        carrier: {
          select: { id: true, name: true, type: true }
        }
      },
      orderBy: { [sorting.sortBy]: sorting.sortOrder },
      skip: pagination.skip,
      take: pagination.take
    });

    const total = await prisma.load.count({ where });

    res.json({
      success: true,
      loads,
      pagination: createPaginationMeta(total, pagination.page, pagination.limit)
    });

  } catch (error) {
    console.error('Load listing error:', error);
    res.status(500).json({
      error: 'Internal server error listing loads',
      code: 'LOAD_LISTING_ERROR'
    });
  }
});

/**
 * DELETE /loads/:id - Cancel a load
 */
router.delete('/:id', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const load = await prisma.load.findUnique({
      where: { id }
    });

    if (!load) {
      return res.status(404).json({
        error: 'Load not found',
        code: 'LOAD_NOT_FOUND'
      });
    }

    // Verify access
    if (load.shipperId !== req.user.orgId) {
      return res.status(403).json({
        error: 'Only the shipper can cancel this load',
        code: 'ACCESS_DENIED'
      });
    }

    if (load.status === 'COMPLETED' || load.status === 'CANCELLED') {
      return res.status(400).json({
        error: 'Cannot cancel completed or already cancelled load',
        code: 'INVALID_CANCELLATION'
      });
    }

    const updatedLoad = await prisma.load.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        notes: reason ? `${load.notes || ''}\n${new Date().toISOString()}: Cancelled - ${reason}`.trim() : load.notes
      }
    });

    res.json({
      success: true,
      load: updatedLoad
    });

  } catch (error) {
    console.error('Load cancellation error:', error);
    res.status(500).json({
      error: 'Internal server error cancelling load',
      code: 'LOAD_CANCELLATION_ERROR'
    });
  }
});

/**
 * POST /loads/:id/assign - Assign carrier to load
 */
router.post('/:id/assign', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const { carrierId, notes } = req.body;

    if (!carrierId) {
      return res.status(400).json({
        error: 'Carrier ID is required',
        code: 'MISSING_CARRIER_ID'
      });
    }

    const load = await prisma.load.findUnique({
      where: { id }
    });

    if (!load) {
      return res.status(404).json({
        error: 'Load not found',
        code: 'LOAD_NOT_FOUND'
      });
    }

    // Verify access - only shipper can assign
    if (load.shipperId !== req.user.orgId) {
      return res.status(403).json({
        error: 'Only the shipper can assign carriers',
        code: 'ACCESS_DENIED'
      });
    }

    const updatedLoad = await prisma.load.update({
      where: { id },
      data: {
        carrierId,
        status: 'ASSIGNED',
        notes: notes ? `${load.notes || ''}\n${new Date().toISOString()}: Assigned to carrier - ${notes}`.trim() : load.notes
      },
      include: {
        shipper: {
          select: { id: true, name: true, type: true }
        },
        carrier: {
          select: { id: true, name: true, type: true }
        }
      }
    });

    res.json({
      success: true,
      load: updatedLoad
    });

  } catch (error) {
    console.error('Load assignment error:', error);
    res.status(500).json({
      error: 'Internal server error assigning load',
      code: 'LOAD_ASSIGNMENT_ERROR'
    });
  }
});

/**
 * POST /loads/:id/dispute/open - Open a dispute on a load
 */
router.post('/:id/dispute/open', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, evidenceType, files, description } = req.body;

    if (!reason) {
      return res.status(400).json({
        error: 'Dispute reason is required',
        code: 'MISSING_REASON'
      });
    }

    const load = await prisma.load.findUnique({
      where: { id }
    });

    if (!load) {
      return res.status(404).json({
        error: 'Load not found',
        code: 'LOAD_NOT_FOUND'
      });
    }

    // Verify access (customer or carrier can dispute)
    if (load.shipperId !== req.user.orgId && load.carrierId !== req.user.orgId) {
      return res.status(403).json({
        error: 'Access denied',
        code: 'ACCESS_DENIED'
      });
    }

    // Can only dispute certain statuses
    if (!['TONU', 'DELIVERED', 'PENDING_APPROVAL', 'COMPLETED'].includes(load.status)) {
      return res.status(400).json({
        error: 'Cannot dispute load in current status',
        code: 'INVALID_STATUS_FOR_DISPUTE',
        allowedStatuses: ['TONU', 'DELIVERED', 'PENDING_APPROVAL', 'COMPLETED']
      });
    }

    // Update load to DISPUTED
    await prisma.load.update({
      where: { id },
      data: {
        status: 'DISPUTED',
        disputeReason: reason,
        disputeOpenedAt: new Date(),
        disputeOpenedBy: req.user.id
      }
    });

    // Add initial evidence
    if (evidenceType && files && description) {
      await prisma.disputeEvidence.create({
        data: {
          loadId: id,
          submittedBy: req.user.id,
          submitterRole: req.user.organization.type,
          evidenceType,
          fileUrls: files,
          description
        }
      });
    }

    // Notify other party
    const emailService = require('../services/emailService');
    const otherPartyId = req.user.organization.type === 'CUSTOMER' 
      ? load.carrierId 
      : load.shipperId;
    
    if (otherPartyId) {
      try {
        await emailService.sendDisputeNotification(otherPartyId, id, reason);
      } catch (error) {
        console.error('Failed to send dispute notification:', error);
      }
    }

    res.json({
      success: true,
      message: 'Dispute opened. Other party has 48 hours to submit evidence.',
      disputeId: id,
      evidenceDeadline: new Date(Date.now() + 48 * 60 * 60 * 1000)
    });

  } catch (error) {
    console.error('Dispute open error:', error);
    res.status(500).json({
      error: 'Internal server error opening dispute',
      code: 'DISPUTE_OPEN_ERROR'
    });
  }
});

/**
 * POST /loads/:id/dispute/evidence - Submit evidence for a dispute
 */
router.post('/:id/dispute/evidence', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const { evidenceType, files, description } = req.body;

    if (!evidenceType || !files || !description) {
      return res.status(400).json({
        error: 'Evidence type, files, and description are required',
        code: 'MISSING_EVIDENCE_DATA'
      });
    }

    const load = await prisma.load.findUnique({
      where: { id }
    });

    if (!load || load.status !== 'DISPUTED') {
      return res.status(400).json({
        error: 'Load not in disputed status',
        code: 'NOT_DISPUTED'
      });
    }

    // Add evidence
    const evidence = await prisma.disputeEvidence.create({
      data: {
        loadId: id,
        submittedBy: req.user.id,
        submitterRole: req.user.organization.type,
        evidenceType,
        fileUrls: files,
        description
      }
    });

    res.json({
      success: true,
      message: 'Evidence submitted successfully',
      evidence
    });

  } catch (error) {
    console.error('Evidence submission error:', error);
    res.status(500).json({
      error: 'Internal server error submitting evidence',
      code: 'EVIDENCE_SUBMISSION_ERROR'
    });
  }
});

/**
 * POST /loads/:id/dispute/resolve - Resolve a dispute (admin only)
 */
router.post('/:id/dispute/resolve', authenticateJWT, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Only admins can resolve disputes',
        code: 'ADMIN_REQUIRED'
      });
    }

    const { id } = req.params;
    const { resolution, winner, explanation } = req.body;

    if (!resolution || !winner || !explanation) {
      return res.status(400).json({
        error: 'Resolution, winner, and explanation are required',
        code: 'MISSING_RESOLUTION_DATA'
      });
    }

    const load = await prisma.load.findUnique({
      where: { id },
      include: { disputeEvidence: true }
    });

    if (!load || load.status !== 'DISPUTED') {
      return res.status(400).json({
        error: 'Load not in disputed status',
        code: 'NOT_DISPUTED'
      });
    }

    // Update load
    await prisma.load.update({
      where: { id },
      data: {
        disputeResolvedAt: new Date(),
        disputeResolvedBy: req.user.id,
        disputeResolution: resolution,
        disputeWinner: winner,
        status: 'COMPLETED'
      }
    });

    // Process payment based on resolution
    if (resolution === 'CUSTOMER_WINS') {
      // Customer wins - cancel carrier payout, refund customer if already charged
      try {
        const invoice = await prisma.invoice.findUnique({ where: { loadId: id } });
        if (invoice && invoice.status === 'PAID') {
          await paymentService.refundPayment(invoice.stripePaymentIntentId);
        }
      } catch (error) {
        console.error('Failed to refund customer:', error);
      }
    } else if (resolution === 'CARRIER_WINS') {
      // Carrier wins - capture payment (if not already) and pay carrier
      try {
        await paymentService.capturePayment(id);
        await paymentService.processPayoutAsync(id);
      } catch (error) {
        console.error('Failed to process carrier payment:', error);
      }
    } else if (resolution === 'SPLIT') {
      // Split decision - implement based on negotiated amounts
      // For now, log for manual processing
      console.log(`SPLIT resolution for load ${id} - requires manual payment processing`);
    }

    // Notify both parties
    const emailService = require('../services/emailService');
    try {
      await emailService.sendDisputeResolution(load.shipperId, id, resolution, explanation);
      if (load.carrierId) {
        await emailService.sendDisputeResolution(load.carrierId, id, resolution, explanation);
      }
    } catch (error) {
      console.error('Failed to send resolution emails:', error);
    }

    res.json({
      success: true,
      message: 'Dispute resolved successfully',
      resolution,
      winner,
      explanation
    });

  } catch (error) {
    console.error('Dispute resolution error:', error);
    res.status(500).json({
      error: 'Internal server error resolving dispute',
      code: 'DISPUTE_RESOLUTION_ERROR'
    });
  }
});

module.exports = router;