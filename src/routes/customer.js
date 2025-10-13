const express = require('express');
const { prisma } = require('../db/prisma');
const { authenticateJWT } = require('../middleware/auth');
const { equipmentMatcher } = require('../services/matching/equipmentMatcher');
const { haulTypeDetector } = require('../services/matching/haulTypeDetector');
const { rateCalculator } = require('../services/pricing/rateCalculator');
const releaseService = require('../services/releaseService');

const router = express.Router();

/**
 * POST /customer/loads - Create a new load (from load posting wizard)
 */
router.post('/loads', authenticateJWT, async (req, res) => {
  try {
    const orgId = req.user.orgId;
    
    // Verify this is a customer/shipper organization
    const org = await prisma.organization.findUnique({
      where: { id: orgId }
    });
    
    if (!org || (org.type !== 'SHIPPER' && org.type !== 'BOTH')) {
      return res.status(403).json({
        error: 'Only shipper organizations can post loads',
        code: 'INVALID_ORG_TYPE'
      });
    }

    const {
      materialType,
      commodityDetails,
      quantity,
      quantityUnit,
      pickupLocation,
      pickupAddress,
      deliveryLocation,
      deliveryAddress,
      pickupDate,
      pickupTimeStart,
      pickupTimeEnd,
      deliveryDate,
      deliveryTimeStart,
      deliveryTimeEnd,
      requiresScaleTicket,
      requiresPermit,
      requiresPrevailingWage,
      specialInstructions,
      rateMode,
      rateAmount,
      jobCode,
      poNumber,
      siteName
    } = req.body;

    // Validate required fields
    if (!materialType || !commodityDetails || !quantity || !pickupAddress || !deliveryAddress || 
        !pickupDate || !deliveryDate || !rateMode || !rateAmount) {
      return res.status(400).json({
        error: 'Missing required fields',
        code: 'MISSING_REQUIRED_FIELDS'
      });
    }

    // Build origin/destination objects
    const origin = {
      address: pickupAddress,
      siteName: pickupLocation || 'Pickup Location',
      timeWindow: {
        date: pickupDate,
        start: pickupTimeStart,
        end: pickupTimeEnd
      }
    };

    const destination = {
      address: deliveryAddress,
      siteName: deliveryLocation || siteName || 'Delivery Location',
      timeWindow: {
        date: deliveryDate,
        start: deliveryTimeStart,
        end: deliveryTimeEnd
      }
    };

    // Calculate distance and detect haul type
    const distance = await haulTypeDetector.calculateDistance(origin, destination);
    const detectedHaulType = haulTypeDetector.detectHaulType(distance);

    // Equipment matching based on material type
    const equipmentMatch = await equipmentMatcher.matchEquipment({
      commodity: commodityDetails,
      loadType: materialType.toUpperCase(),
      haulType: detectedHaulType
    });

    // Calculate pricing
    const pricing = await rateCalculator.calculateLoadPricing({
      rateMode: rateMode.toUpperCase(),
      rate: parseFloat(rateAmount),
      units: parseFloat(quantity),
      miles: distance,
      commodity: commodityDetails,
      loadType: materialType.toUpperCase()
    });

    // Create the load
    const load = await prisma.load.create({
      data: {
        orgId,
        shipperId: orgId,
        loadType: materialType.toUpperCase(),
        rateMode: rateMode.toUpperCase(),
        haulType: detectedHaulType,
        commodity: commodityDetails,
        equipmentType: equipmentMatch.equipmentType,
        equipmentMatchTier: equipmentMatch.tier,
        origin: JSON.stringify(origin),
        destination: JSON.stringify(destination),
        rate: parseFloat(rateAmount),
        units: parseFloat(quantity),
        miles: distance,
        grossRevenue: parseFloat(pricing.grossRevenue),
        pickupDate: new Date(pickupDate),
        deliveryDate: new Date(deliveryDate),
        jobCode: jobCode || null,
        poNumber: poNumber || null,
        projectName: siteName || null,
        notes: specialInstructions || null,
        overweightPermit: requiresPermit || false,
        prevailingWage: requiresPrevailingWage || false,
        status: 'POSTED' // Automatically post for bidding
      },
      include: {
        shipper: {
          select: { id: true, name: true, type: true }
        }
      }
    });

    // If scale ticket required, add a note
    if (requiresScaleTicket) {
      await prisma.load.update({
        where: { id: load.id },
        data: {
          notes: `${load.notes || ''}\nScale ticket required`.trim()
        }
      });
    }

    res.status(201).json({
      success: true,
      load,
      analysis: {
        distance,
        haulType: detectedHaulType,
        equipmentMatch,
        pricing,
        suggestedEquipment: equipmentMatch.suggestedTypes || [equipmentMatch.equipmentType]
      }
    });

  } catch (error) {
    console.error('Customer load creation error:', error);
    res.status(500).json({
      error: 'Internal server error creating load',
      details: error.message,
      code: 'LOAD_CREATION_ERROR'
    });
  }
});

/**
 * GET /customer/loads - Get all loads for this customer
 */
router.get('/loads', authenticateJWT, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    const where = {
      shipperId: req.user.orgId
    };
    
    if (status) {
      where.status = status.toUpperCase();
    }

    const loads = await prisma.load.findMany({
      where,
      include: {
        carrier: {
          select: { id: true, name: true, type: true, mcNumber: true }
        },
        interests: {
          include: {
            carrier: {
              select: { id: true, name: true, mcNumber: true }
            }
          },
          where: {
            status: { in: ['PENDING', 'COUNTER_OFFERED'] }
          }
        },
        _count: {
          select: { interests: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit)
    });

    const total = await prisma.load.count({ where });

    // Add bid counts and summary
    const loadsWithBidInfo = loads.map(load => ({
      ...load,
      bidCount: load._count.interests,
      hasBids: load._count.interests > 0,
      pendingBids: load.interests.length
    }));

    res.json({
      success: true,
      loads: loadsWithBidInfo,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Customer load listing error:', error);
    res.status(500).json({
      error: 'Internal server error listing loads',
      code: 'LOAD_LISTING_ERROR'
    });
  }
});

/**
 * GET /customer/loads/:id - Get load details with all bids
 */
router.get('/loads/:id', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;

    const load = await prisma.load.findUnique({
      where: { id },
      include: {
        shipper: {
          select: { id: true, name: true, type: true }
        },
        carrier: {
          select: { id: true, name: true, type: true, mcNumber: true }
        },
        interests: {
          include: {
            carrier: {
              select: { 
                id: true, 
                name: true, 
                mcNumber: true, 
                dotNumber: true, 
                phone: true, 
                email: true 
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
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

    // Verify access
    if (load.shipperId !== req.user.orgId) {
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
    console.error('Customer load details error:', error);
    res.status(500).json({
      error: 'Internal server error retrieving load',
      code: 'LOAD_RETRIEVAL_ERROR'
    });
  }
});

/**
 * POST /customer/loads/:id/bids/:bidId/accept - Accept a carrier bid
 */
router.post('/loads/:id/bids/:bidId/accept', authenticateJWT, async (req, res) => {
  try {
    const { id, bidId } = req.params;
    const { notes } = req.body;

    const load = await prisma.load.findUnique({
      where: { id },
      include: {
        interests: {
          where: { id: bidId }
        }
      }
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
        error: 'Only the shipper can accept bids',
        code: 'ACCESS_DENIED'
      });
    }

    const bid = load.interests[0];
    if (!bid) {
      return res.status(404).json({
        error: 'Bid not found',
        code: 'BID_NOT_FOUND'
      });
    }

    // Update bid status to accepted
    await prisma.loadInterest.update({
      where: { id: bidId },
      data: {
        status: 'ACCEPTED'
      }
    });

    // Reject all other bids
    await prisma.loadInterest.updateMany({
      where: {
        loadId: id,
        id: { not: bidId },
        status: { in: ['PENDING', 'COUNTER_OFFERED'] }
      },
      data: {
        status: 'REJECTED'
      }
    });

    // Assign load to carrier
    const updatedLoad = await prisma.load.update({
      where: { id },
      data: {
        carrierId: bid.carrierId,
        status: 'ASSIGNED',
        // If bid had a counter-offer amount, update the rate
        rate: bid.bidAmount || load.rate,
        notes: notes ? `${load.notes || ''}\n${new Date().toISOString()}: Bid accepted - ${notes}`.trim() : load.notes
      },
      include: {
        shipper: {
          select: { id: true, name: true }
        },
        carrier: {
          select: { id: true, name: true, mcNumber: true }
        }
      }
    });

    res.json({
      success: true,
      load: updatedLoad,
      message: 'Bid accepted and load assigned to carrier'
    });

  } catch (error) {
    console.error('Bid acceptance error:', error);
    res.status(500).json({
      error: 'Internal server error accepting bid',
      code: 'BID_ACCEPTANCE_ERROR'
    });
  }
});

/**
 * POST /customer/loads/:id/bids/:bidId/reject - Reject a carrier bid
 */
router.post('/loads/:id/bids/:bidId/reject', authenticateJWT, async (req, res) => {
  try {
    const { id, bidId } = req.params;
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
        error: 'Only the shipper can reject bids',
        code: 'ACCESS_DENIED'
      });
    }

    const bid = await prisma.loadInterest.update({
      where: { id: bidId },
      data: {
        status: 'REJECTED',
        message: reason ? `${reason}` : 'Bid rejected by customer'
      }
    });

    res.json({
      success: true,
      bid,
      message: 'Bid rejected'
    });

  } catch (error) {
    console.error('Bid rejection error:', error);
    res.status(500).json({
      error: 'Internal server error rejecting bid',
      code: 'BID_REJECTION_ERROR'
    });
  }
});

/**
 * POST /customer/loads/:id/release - Issue release (confirm material is ready)
 */
router.post('/loads/:id/release', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      confirmedReady,
      quantityConfirmed,
      siteContact,
      pickupInstructions,
      acknowledgedTonu
    } = req.body;

    // Validate required fields
    if (!confirmedReady || !quantityConfirmed || !siteContact || !acknowledgedTonu) {
      return res.status(400).json({
        error: 'Missing required fields',
        code: 'MISSING_REQUIRED_FIELDS',
        required: ['confirmedReady', 'quantityConfirmed', 'siteContact', 'acknowledgedTonu']
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

    // Verify access
    if (load.shipperId !== req.user.orgId) {
      return res.status(403).json({
        error: 'Only the shipper can issue releases',
        code: 'ACCESS_DENIED'
      });
    }

    // Issue the release
    const releasedLoad = await releaseService.issueRelease(id, req.user.id, {
      confirmedReady,
      quantityConfirmed,
      siteContact,
      pickupInstructions,
      acknowledgedTonu
    });

    // Create E-Sign BOL and POD (pre-filled, ready for signatures)
    let documentsCreated = false;
    try {
      const eSignService = require('../services/eSignatureService');
      const bolData = await eSignService.createESignBOL(id);
      const podData = await eSignService.createESignPOD(id);
      documentsCreated = true;
      console.log(`✅ E-Sign BOL and POD created for load ${id}`);
    } catch (error) {
      console.error('Failed to create e-sign documents:', error);
    }

    // AUTHORIZE PAYMENT (hold funds in escrow)
    let paymentAuthorized = false;
    let paymentError = null;

    try {
      const paymentService = require('../services/paymentService');
      const authResult = await paymentService.authorizePayment(id);
      paymentAuthorized = authResult.success;
    } catch (error) {
      console.error('Payment authorization error:', error);
      paymentError = error.message;
      
      // Don't block release if payment fails, but warn
      if (error.message.includes('NO_PAYMENT_METHOD')) {
        paymentError = 'Customer has no payment method on file. Payment will be required before delivery.';
      }
    }

    res.json({
      success: true,
      message: 'Release issued successfully. Carrier has been notified.',
      load: releasedLoad,
      release: {
        releaseNumber: releasedLoad.releaseNumber,
        releasedAt: releasedLoad.releasedAt,
        expiresAt: releasedLoad.releaseExpiresAt
      },
      payment: {
        authorized: paymentAuthorized,
        error: paymentError,
        message: paymentAuthorized 
          ? `$${releasedLoad.grossRevenue} authorized (funds held in escrow)`
          : paymentError
      }
    });

  } catch (error) {
    console.error('Release issuance error:', error);

    const errorMap = {
      'LOAD_NOT_FOUND': { status: 404, code: 'LOAD_NOT_FOUND', message: 'Load not found' },
      'INVALID_STATUS': { status: 400, code: 'INVALID_STATUS', message: 'Load is not in a valid status for release' },
      'CONFIRMATION_REQUIRED': { status: 400, code: 'CONFIRMATION_REQUIRED', message: 'All confirmations must be checked' },
      'TOO_EARLY': { status: 400, code: 'TOO_EARLY', message: 'Cannot issue release more than 24 hours before pickup' }
    };

    const mappedError = errorMap[error.message] || { 
      status: 500, 
      code: 'RELEASE_ISSUANCE_ERROR', 
      message: 'Internal server error issuing release' 
    };

    res.status(mappedError.status).json({
      error: mappedError.message,
      code: mappedError.code
    });
  }
});

/**
 * GET /customer/dashboard/stats - Get dashboard statistics
 */
router.get('/dashboard/stats', authenticateJWT, async (req, res) => {
  try {
    const orgId = req.user.orgId;

    // Active loads
    const activeLoads = await prisma.load.count({
      where: {
        shipperId: orgId,
        status: { in: ['POSTED', 'ASSIGNED', 'ACCEPTED', 'IN_TRANSIT'] }
      }
    });

    // Completed this month
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const completedThisMonth = await prisma.load.count({
      where: {
        shipperId: orgId,
        status: 'COMPLETED',
        completedAt: {
          gte: startOfMonth
        }
      }
    });

    // Total spend this month
    const spendResult = await prisma.load.aggregate({
      where: {
        shipperId: orgId,
        createdAt: {
          gte: startOfMonth
        }
      },
      _sum: {
        grossRevenue: true
      }
    });

    // Average delivery time (mock for now - would calculate from actual timestamps)
    const avgDeliveryTime = 4.2;

    res.json({
      success: true,
      stats: {
        activeLoads,
        completedThisMonth,
        totalSpend: spendResult._sum.grossRevenue || 0,
        avgDeliveryTime
      }
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      error: 'Internal server error fetching stats',
      code: 'STATS_ERROR'
    });
  }
});

/**
 * POST /customer/loads/:id/cancel - Cancel a load
 */
router.post('/loads/:id/cancel', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        error: 'Cancellation reason is required',
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

    // Verify access
    if (load.shipperId !== req.user.orgId) {
      return res.status(403).json({
        error: 'Only the shipper can cancel loads',
        code: 'ACCESS_DENIED'
      });
    }

    // Cannot cancel if in certain statuses
    if (['IN_TRANSIT', 'DELIVERED', 'COMPLETED'].includes(load.status)) {
      return res.status(400).json({
        error: `Cannot cancel load in ${load.status} status. Contact emergency support.`,
        code: 'CANNOT_CANCEL',
        emergencyPhone: '(512) 555-HELP'
      });
    }

    // Calculate cancellation fee based on status
    let fee = 0;
    let carrierCompensation = 0;

    switch (load.status) {
      case 'DRAFT':
      case 'POSTED':
        fee = 0; // Free to cancel before acceptance
        break;

      case 'ASSIGNED':
      case 'ACCEPTED':
      case 'RELEASE_REQUESTED':
        fee = 50; // $50 admin fee
        break;

      case 'RELEASED':
        fee = 200; // Full TONU charge
        carrierCompensation = 150; // Carrier gets $150
        break;
    }

    // Update load
    await prisma.load.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancelledBy: req.user.id,
        cancellationReason: reason,
        cancellationFee: fee,
        cancellationType: 'CUSTOMER',
        cancelledAt: new Date()
      }
    });

    // Release payment authorization if exists
    const paymentService = require('../services/paymentService');
    await paymentService.cancelAuthorization(id);

    // Charge cancellation fee if applicable
    if (fee > 0) {
      try {
        await paymentService.chargeCancellationFee(load.shipperId, fee, id);
      } catch (error) {
        console.error('Failed to charge cancellation fee:', error);
      }
    }

    // Compensate carrier if applicable
    if (carrierCompensation > 0 && load.carrierId) {
      try {
        await paymentService.processCancellationPayout(load.carrierId, carrierCompensation, id);
      } catch (error) {
        console.error('Failed to process carrier compensation:', error);
      }
    }

    // Notify carrier if load was assigned
    if (load.carrierId) {
      const emailService = require('../services/emailService');
      try {
        await emailService.sendLoadCancellationEmail(load.carrierId, id, reason);
      } catch (error) {
        console.error('Failed to send cancellation email:', error);
      }
    }

    res.json({
      success: true,
      message: 'Load cancelled successfully',
      cancellationFee: fee,
      carrierCompensation,
      refundedAuthorization: fee > 0
    });

  } catch (error) {
    console.error('Load cancellation error:', error);
    res.status(500).json({
      error: 'Internal server error cancelling load',
      code: 'CANCELLATION_ERROR'
    });
  }
});

module.exports = router;

