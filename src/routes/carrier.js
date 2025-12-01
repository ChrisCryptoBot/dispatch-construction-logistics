const express = require('express');
const { prisma } = require('../db/prisma');
const { authenticateJWT } = require('../middleware/auth');
const releaseService = require('../services/releaseService');
const insuranceService = require('../services/insuranceVerificationService');
const doubleBrokerService = require('../services/doubleBrokerService');
const gpsTrackingService = require('../services/gpsTrackingService');
const { parsePagination, createPaginationMeta, parseSorting } = require('../utils/pagination');

const router = express.Router();

/**
 * GET /carrier/available-loads - Browse loads available for bidding
 */
router.get('/available-loads', authenticateJWT, async (req, res) => {
  try {
    const { page = 1, limit = 20, haulType, loadType, commodity, minRate, maxDistance } = req.query;
    
    // Verify this is a carrier organization
    const org = await prisma.organization.findUnique({
      where: { id: req.user.orgId }
    });
    
    if (!org || (org.type !== 'CARRIER' && org.type !== 'BOTH')) {
      return res.status(403).json({
        error: 'Only carrier organizations can access available loads',
        code: 'INVALID_ORG_TYPE'
      });
    }

    const where = {
      status: 'POSTED',
      carrierId: null // Only unassigned loads
    };

    if (haulType) {
      where.haulType = haulType.toUpperCase();
    }

    if (loadType) {
      where.loadType = loadType.toUpperCase();
    }

    if (commodity) {
      where.commodity = { contains: commodity, mode: 'insensitive' };
    }

    if (minRate) {
      where.rate = { gte: parseFloat(minRate) };
    }

    if (maxDistance) {
      where.miles = { lte: parseInt(maxDistance) };
    }

    const loads = await prisma.load.findMany({
      where,
      include: {
        shipper: {
          select: { id: true, name: true, type: true }
        },
        _count: {
          select: { interests: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit)
    });

    // Check if carrier has already bid on any of these loads
    const carrierBids = await prisma.loadInterest.findMany({
      where: {
        carrierId: req.user.orgId,
        loadId: { in: loads.map(l => l.id) }
      },
      select: {
        loadId: true,
        status: true,
        bidAmount: true
      }
    });

    const bidsByLoadId = carrierBids.reduce((acc, bid) => {
      acc[bid.loadId] = bid;
      return acc;
    }, {});

    // Add bid information to each load
    const loadsWithBidInfo = loads.map(load => ({
      ...load,
      bidCount: load._count.interests,
      myBid: bidsByLoadId[load.id] || null,
      hasBid: !!bidsByLoadId[load.id]
    }));

    const total = await prisma.load.count({ where });

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
    console.error('Available loads error:', error);
    res.status(500).json({
      error: 'Internal server error fetching available loads',
      code: 'AVAILABLE_LOADS_ERROR'
    });
  }
});

/**
 * POST /carrier/loads/:id/bid - Submit a bid on a load
 */
router.post('/loads/:id/bid', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const { bidAmount, message, expiresInHours } = req.body;

    // Verify this is a carrier organization
    const org = await prisma.organization.findUnique({
      where: { id: req.user.orgId }
    });
    
    if (!org || (org.type !== 'CARRIER' && org.type !== 'BOTH')) {
      return res.status(403).json({
        error: 'Only carrier organizations can bid on loads',
        code: 'INVALID_ORG_TYPE'
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

    if (load.status !== 'POSTED') {
      return res.status(400).json({
        error: 'Load is not available for bidding',
        code: 'LOAD_NOT_AVAILABLE'
      });
    }

    // Check if carrier has already bid
    const existingBid = await prisma.loadInterest.findFirst({
      where: {
        loadId: id,
        carrierId: req.user.orgId
      }
    });

    if (existingBid) {
      return res.status(400).json({
        error: 'You have already bid on this load',
        code: 'BID_ALREADY_EXISTS',
        existingBid
      });
    }

    // Calculate expiration if provided
    let expiresAt = null;
    if (expiresInHours) {
      expiresAt = new Date(Date.now() + (expiresInHours * 60 * 60 * 1000));
    }

    // Create bid
    const bid = await prisma.loadInterest.create({
      data: {
        loadId: id,
        carrierId: req.user.orgId,
        bidAmount: bidAmount ? parseFloat(bidAmount) : null,
        message: message || null,
        expiresAt,
        status: 'PENDING'
      },
      include: {
        carrier: {
          select: { id: true, name: true, mcNumber: true }
        },
        load: {
          select: { 
            id: true, 
            commodity: true, 
            origin: true, 
            destination: true,
            rate: true,
            rateMode: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      bid,
      message: 'Bid submitted successfully'
    });

  } catch (error) {
    console.error('Bid submission error:', error);
    res.status(500).json({
      error: 'Internal server error submitting bid',
      code: 'BID_SUBMISSION_ERROR'
    });
  }
});

/**
 * GET /carrier/my-loads - Get loads assigned to this carrier
 */
router.get('/my-loads', authenticateJWT, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    const where = {
      carrierId: req.user.orgId
    };
    
    if (status) {
      where.status = status.toUpperCase();
    } else {
      // Default: only show active loads
      where.status = { in: ['ASSIGNED', 'ACCEPTED', 'IN_TRANSIT'] };
    }

    const loads = await prisma.load.findMany({
      where,
      include: {
        shipper: {
          select: { id: true, name: true, type: true, phone: true, email: true }
        },
        documents: true,
        scaleTickets: true
      },
      orderBy: { pickupDate: 'asc' },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit)
    });

    const total = await prisma.load.count({ where });

    res.json({
      success: true,
      loads,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Carrier loads error:', error);
    res.status(500).json({
      error: 'Internal server error fetching carrier loads',
      code: 'CARRIER_LOADS_ERROR'
    });
  }
});

/**
 * POST /carrier/loads/:id/accept - Accept assigned load
 */
router.post('/loads/:id/accept', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const { notes, driverId, equipmentId } = req.body;

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
    if (load.carrierId !== req.user.orgId) {
      return res.status(403).json({
        error: 'This load is not assigned to your organization',
        code: 'ACCESS_DENIED'
      });
    }

    if (load.status !== 'ASSIGNED') {
      return res.status(400).json({
        error: 'Load must be in ASSIGNED status to accept',
        code: 'INVALID_STATUS'
      });
    }

    // Check insurance status before accepting
    const insuranceStatus = await insuranceService.checkCarrierInsurance(req.user.orgId);
    if (!insuranceStatus.valid) {
      // Send email notification to carrier about insurance block
      try {
        const org = await prisma.organization.findUnique({
          where: { id: req.user.orgId },
          select: { name: true, email: true }
        });
        
        if (org && org.email) {
          const emailService = require('../services/emailService');
          await emailService.sendInsuranceBlockedEmail(org);
        }
      } catch (emailError) {
        console.error('Failed to send insurance blocked email:', emailError);
        // Don't block the response if email fails
      }

      return res.status(403).json({
        error: 'Account Restricted: Insurance Verification Required',
        code: 'INSURANCE_VERIFICATION_REQUIRED',
        blocked: true,
        ...insuranceStatus.disputeInfo
      });
    }

    // Accept the load
    const updatedLoad = await prisma.load.update({
      where: { id },
      data: {
        status: 'ACCEPTED',
        notes: notes ? `${load.notes || ''}\n${new Date().toISOString()}: Accepted by carrier - ${notes}`.trim() : load.notes
      },
      include: {
        shipper: {
          select: { id: true, name: true, phone: true, email: true }
        },
        carrier: {
          select: { id: true, name: true, mcNumber: true }
        }
      }
    });

    // Generate Rate Confirmation document
    let rateConGenerated = false;
    try {
      const documentService = require('../services/documentService');
      const rateConPath = await documentService.generateRateConfirmation(id);
      rateConGenerated = true;
      console.log(`✅ Rate Confirmation generated for load ${id}: ${rateConPath}`);
    } catch (error) {
      console.error('Failed to generate Rate Confirmation:', error);
    }

    // Automatically request release from shipper
    let releaseLoad;
    try {
      releaseLoad = await releaseService.requestRelease(id, req.user.id);
    } catch (error) {
      // If release request fails, load is still accepted, just log the error
      console.error('Release request error (non-critical):', error);
      releaseLoad = updatedLoad;
    }

    res.json({
      success: true,
      load: releaseLoad,
      message: 'Load accepted successfully. Waiting for shipper to confirm material is ready.',
      releaseRequested: releaseLoad.status === 'RELEASE_REQUESTED'
    });

  } catch (error) {
    console.error('Load acceptance error:', error);
    res.status(500).json({
      error: 'Internal server error accepting load',
      code: 'LOAD_ACCEPTANCE_ERROR'
    });
  }
});

/**
 * GET /carrier/loads/:id/release-status - Check release status for a load
 */
router.get('/loads/:id/release-status', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;

    const load = await prisma.load.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        carrierId: true,
        releaseNumber: true,
        releaseRequestedAt: true,
        releasedAt: true,
        releaseExpiresAt: true,
        releaseNotes: true,
        shipperConfirmedReady: true,
        quantityConfirmed: true,
        origin: true,
        destination: true,
        pickupDate: true
      }
    });

    if (!load) {
      return res.status(404).json({
        error: 'Load not found',
        code: 'LOAD_NOT_FOUND'
      });
    }

    // Verify access
    if (load.carrierId !== req.user.orgId) {
      return res.status(403).json({
        error: 'This load is not assigned to your organization',
        code: 'ACCESS_DENIED'
      });
    }

    // Check if release has expired
    let expired = false;
    if (load.status === 'RELEASED' && load.releaseExpiresAt) {
      expired = new Date() > new Date(load.releaseExpiresAt);
    }

    // Hide full pickup address until released
    let pickupAddress = 'Hidden until release confirmed';
    if (load.status === 'RELEASED' && !expired) {
      const origin = JSON.parse(load.origin);
      pickupAddress = origin.address;
    }

    res.json({
      success: true,
      releaseStatus: {
        status: load.status,
        isReleased: load.status === 'RELEASED' && !expired,
        releaseNumber: load.releaseNumber,
        releasedAt: load.releasedAt,
        expiresAt: load.releaseExpiresAt,
        expired,
        notes: load.releaseNotes,
        quantityConfirmed: load.quantityConfirmed,
        pickupAddress,
        pickupDate: load.pickupDate
      }
    });

  } catch (error) {
    console.error('Release status error:', error);
    res.status(500).json({
      error: 'Internal server error fetching release status',
      code: 'RELEASE_STATUS_ERROR'
    });
  }
});

/**
 * POST /carrier/loads/:id/tonu - File TONU claim
 */
router.post('/loads/:id/tonu', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, arrivalTime, waitTime, evidence } = req.body;

    // Validate required fields
    if (!reason || !arrivalTime) {
      return res.status(400).json({
        error: 'Missing required fields: reason and arrivalTime',
        code: 'MISSING_REQUIRED_FIELDS'
      });
    }

    // REQUIRE photo evidence
    if (!evidence || evidence.length === 0) {
      return res.status(400).json({
        error: 'Photo evidence is required to file TONU. Please upload at least one photo showing you arrived at the site and material was not ready.',
        code: 'TONU_EVIDENCE_REQUIRED'
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
    if (load.carrierId !== req.user.orgId) {
      return res.status(403).json({
        error: 'This load is not assigned to your organization',
        code: 'ACCESS_DENIED'
      });
    }

    // Validate GPS trail shows carrier was at location
    const gpsEvents = await prisma.geoEvent.findMany({
      where: {
        loadId: id,
        timestamp: {
          gte: new Date(arrivalTime),
          lte: new Date()
        }
      },
      orderBy: { timestamp: 'asc' }
    });

    if (gpsEvents.length === 0) {
      return res.status(400).json({
        error: 'No GPS record showing arrival at pickup location. GPS tracking must be enabled.',
        code: 'NO_GPS_TRAIL'
      });
    }

    // Calculate time at location
    const firstPing = new Date(gpsEvents[0].timestamp);
    const lastPing = new Date(gpsEvents[gpsEvents.length - 1].timestamp);
    const minutesAtLocation = (lastPing - firstPing) / (1000 * 60);

    if (minutesAtLocation < 15) {
      return res.status(400).json({
        error: `Must wait at least 15 minutes at location before filing TONU. You waited ${minutesAtLocation.toFixed(0)} minutes.`,
        code: 'INSUFFICIENT_WAIT_TIME',
        actualWaitTime: minutesAtLocation
      });
    }

    // Validate proximity to pickup location
    const origin = typeof load.origin === 'string' ? JSON.parse(load.origin) : load.origin;
    if (origin.lat && origin.lng && gpsEvents[0].latitude && gpsEvents[0].longitude) {
      const doubleBrokerService = require('../services/doubleBrokerService');
      const distance = doubleBrokerService.calculateDistance(
        origin.lat,
        origin.lng,
        gpsEvents[0].latitude,
        gpsEvents[0].longitude
      );
      
      if (distance > 0.5) { // More than 0.5 miles away
        return res.status(400).json({
          error: `GPS shows you were ${distance.toFixed(2)} miles from the pickup location. Must be within 0.5 miles to file TONU.`,
          code: 'LOCATION_MISMATCH',
          distance: `${distance.toFixed(2)} miles from pickup`
        });
      }
    }

    // File TONU (all validations passed)
    const result = await releaseService.fileTonu(id, req.user.id, {
      reason,
      arrivalTime,
      waitTime: waitTime || 0,
      evidence: evidence || []
    });

    res.json({
      success: true,
      message: 'TONU claim filed successfully',
      tonu: {
        amount: result.tonuAmount,
        carrierPayout: result.carrierPayout,
        platformFee: result.platformFee,
        filedAt: result.load.tonuFiledAt
      }
    });

  } catch (error) {
    console.error('TONU filing error:', error);
    
    const errorMap = {
      'LOAD_NOT_FOUND': { status: 404, code: 'LOAD_NOT_FOUND' },
      'INVALID_STATUS': { status: 400, code: 'INVALID_STATUS' }
    };

    const mappedError = errorMap[error.message] || { status: 500, code: 'TONU_FILING_ERROR' };

    res.status(mappedError.status).json({
      error: error.message,
      code: mappedError.code
    });
  }
});

/**
 * POST /carrier/loads/:id/attest - Sign anti-double-brokering attestation
 */
router.post('/loads/:id/attest', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const ipAddress = req.ip || req.connection.remoteAddress;

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
    if (load.carrierId !== req.user.orgId) {
      return res.status(403).json({
        error: 'This load is not assigned to your organization',
        code: 'ACCESS_DENIED'
      });
    }

    const attestation = await doubleBrokerService.createAttestation(id, req.user.id, ipAddress);

    res.json({
      success: true,
      message: 'Attestation signed successfully',
      attestation: {
        id: attestation.id,
        signedAt: attestation.signedAt,
        ipAddress: attestation.ipAddress
      }
    });

  } catch (error) {
    console.error('Attestation error:', error);
    res.status(500).json({
      error: error.message,
      code: 'ATTESTATION_ERROR'
    });
  }
});

/**
 * POST /carrier/loads/:id/dispatch-details - Provide VIN/driver before pickup
 */
router.post('/loads/:id/dispatch-details', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const { vin, driverId, driverName, truckNumber } = req.body;

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
    if (load.carrierId !== req.user.orgId) {
      return res.status(403).json({
        error: 'This load is not assigned to your organization',
        code: 'ACCESS_DENIED'
      });
    }

    const result = await doubleBrokerService.verifyDispatchDetails(id, {
      vin,
      driverId,
      driverName,
      truckNumber
    });

    res.json({
      success: true,
      message: 'Dispatch details verified',
      details: result
    });

  } catch (error) {
    console.error('Dispatch details error:', error);

    const errorMap = {
      'LOAD_NOT_FOUND': { status: 404, code: 'LOAD_NOT_FOUND' },
      'DISPATCH_INFO_REQUIRED': { status: 400, code: 'MISSING_REQUIRED_INFO' },
      'VIN_NOT_FOUND': { status: 404, code: 'VIN_NOT_FOUND' },
      'VIN_NOT_OWNED_BY_CARRIER': { status: 403, code: 'VIN_OWNERSHIP_MISMATCH' }
    };

    const mappedError = errorMap[error.message] || { status: 500, code: 'DISPATCH_DETAILS_ERROR' };

    res.status(mappedError.status).json({
      error: error.message,
      code: mappedError.code
    });
  }
});

/**
 * POST /carrier/loads/:id/gps-ping - Report GPS location (proximity check)
 */
router.post('/loads/:id/gps-ping', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const { latitude, longitude, stage } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        error: 'Latitude and longitude required',
        code: 'MISSING_GPS_DATA'
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
    if (load.carrierId !== req.user.orgId) {
      return res.status(403).json({
        error: 'This load is not assigned to your organization',
        code: 'ACCESS_DENIED'
      });
    }

    // Ingest GPS location with auto-status update
    const result = await gpsTrackingService.ingestGPSLocation(id, req.user.id, {
      latitude,
      longitude,
      stage,
      source: 'manual'
    });

    // Check proximity if at pickup stage (anti-double-broker)
    if (stage === 'at_pickup') {
      const proximityCheck = await doubleBrokerService.verifyPickupProximity(id, { latitude, longitude });
      
      return res.json({
        success: true,
        message: result.message,
        statusUpdated: result.statusUpdated,
        newStatus: result.newStatus,
        proximity: proximityCheck
      });
    }

    res.json({
      success: true,
      message: result.message,
      statusUpdated: result.statusUpdated,
      newStatus: result.newStatus
    });

  } catch (error) {
    console.error('GPS ping error:', error);
    res.status(500).json({
      error: error.message,
      code: 'GPS_PING_ERROR'
    });
  }
});

/**
 * GET /carrier/dashboard/stats - Get carrier dashboard stats
 */
router.get('/dashboard/stats', authenticateJWT, async (req, res) => {
  try {
    const orgId = req.user.orgId;

    // Active loads
    const activeLoads = await prisma.load.count({
      where: {
        carrierId: orgId,
        status: { in: ['ASSIGNED', 'ACCEPTED', 'IN_TRANSIT'] }
      }
    });

    // Available loads (posted, not assigned)
    const availableLoads = await prisma.load.count({
      where: {
        status: 'POSTED',
        carrierId: null
      }
    });

    // Completed this month
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const completedThisMonth = await prisma.load.count({
      where: {
        carrierId: orgId,
        status: 'COMPLETED',
        completedAt: {
          gte: startOfMonth
        }
      }
    });

    // Revenue this month
    const revenueResult = await prisma.load.aggregate({
      where: {
        carrierId: orgId,
        completedAt: {
          gte: startOfMonth
        }
      },
      _sum: {
        grossRevenue: true
      }
    });

    // Pending bids
    const pendingBids = await prisma.loadInterest.count({
      where: {
        carrierId: orgId,
        status: 'PENDING'
      }
    });

    res.json({
      success: true,
      stats: {
        activeLoads,
        availableLoads,
        completedThisMonth,
        revenue: revenueResult._sum.grossRevenue || 0,
        pendingBids
      }
    });

  } catch (error) {
    console.error('Carrier dashboard stats error:', error);
    res.status(500).json({
      error: 'Internal server error fetching stats',
      code: 'STATS_ERROR'
    });
  }
});

/**
 * POST /carrier/loads/:id/cancel - Carrier cancels accepted load
 * Enhanced with comprehensive cancellation service
 */
router.post('/loads/:id/cancel', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, notes } = req.body;

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

    // Verify this carrier is assigned to the load
    if (load.carrierId !== req.user.orgId) {
      return res.status(403).json({
        error: 'You are not assigned to this load',
        code: 'ACCESS_DENIED'
      });
    }

    // Use comprehensive cancellation service
    const loadCancellationService = require('../services/loadCancellationService');
    const result = await loadCancellationService.cancelLoadByCarrier(
      id,
      req.user.id,
      { reason, notes }
    );

    res.json({
      success: true,
      message: 'Load cancelled and returned to marketplace',
      penalty: result.penaltyInfo.fee,
      penaltyReason: result.penaltyInfo.reason,
      reputationImpact: result.reputationImpact,
      hoursUntilPickup: result.penaltyInfo.hoursUntilPickup
    });

  } catch (error) {
    console.error('Carrier cancellation error:', error);

    if (error.message === 'LOAD_NOT_FOUND') {
      return res.status(404).json({ error: 'Load not found' });
    }

    if (error.message === 'NOT_ASSIGNED') {
      return res.status(403).json({ error: 'You are not assigned to this load' });
    }

    if (error.message === 'CANNOT_CANCEL') {
      return res.status(400).json({
        error: 'Cannot cancel load in current status. Contact emergency support.',
        emergencyPhone: '(512) 555-HELP'
      });
    }

    if (error.message === 'CANNOT_CANCEL_IN_TRANSIT') {
      return res.status(400).json({
        error: 'Cannot cancel load that is in transit',
        code: 'CANNOT_CANCEL_IN_TRANSIT'
      });
    }

    res.status(500).json({
      error: 'Internal server error cancelling load',
      code: 'CANCELLATION_ERROR'
    });
  }
});

/**
 * GET /carrier/loads/:id/cancellation-policy
 * Get cancellation policy and current penalty for a load
 */
router.get('/loads/:id/cancellation-policy', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;

    const load = await prisma.load.findUnique({
      where: { id }
    });

    if (!load) {
      return res.status(404).json({ error: 'Load not found' });
    }

    // Verify access
    if (load.carrierId !== req.user.orgId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const loadCancellationService = require('../services/loadCancellationService');
    const policy = await loadCancellationService.getCancellationPolicy(id, 'CARRIER');

    res.json({
      success: true,
      policy
    });

  } catch (error) {
    console.error('Get cancellation policy error:', error);
    res.status(500).json({ error: 'Failed to get cancellation policy' });
  }
});

module.exports = router;

