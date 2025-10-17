const express = require('express');
const { prisma } = require('../db/prisma');
const { CacheKeys, CacheTTL, get, set } = require('../config/redis');
const { cacheMiddleware } = require('../middleware/cache');
const { parsePagination, createPaginationMeta, parseSorting } = require('../utils/pagination');
const { authenticateJWT } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /marketplace/loads
 * Public load board for carriers to browse available loads
 */
router.get('/loads', cacheMiddleware(CacheTTL.LOAD_BOARD), async (req, res) => {
  try {
    const {
      state,
      equipmentType,
      haulType,
      minRate,
      maxDistance,
      page = 1,
      limit = 20
    } = req.query;

    // Build where clause for filtering
    const where = {
      status: 'POSTED' // Only show posted loads
    };

    if (state) {
      where.origin = {
        path: ['state'],
        equals: state
      };
    }

    if (equipmentType) {
      where.equipmentType = equipmentType;
    }

    if (haulType) {
      where.haulType = haulType;
    }

    if (minRate) {
      where.rate = {
        gte: parseFloat(minRate)
      };
    }

    // Get loads with filters
    const loads = await prisma.load.findMany({
      where,
      select: {
        id: true,
        commodity: true,
        equipmentType: true,
        origin: true,
        destination: true,
        pickupDate: true,
        deliveryDate: true,
        rate: true,
        rateMode: true,
        units: true,
        grossRevenue: true,
        miles: true,
        haulType: true,
        status: true,
        createdAt: true
      },
      orderBy: {
        pickupDate: 'asc'
      },
      skip: (page - 1) * limit,
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
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Load board error:', error);
    res.status(500).json({
      error: 'Internal server error fetching load board',
      code: 'LOAD_BOARD_ERROR'
    });
  }
});

/**
 * POST /loads/:id/interest
 * Carrier expresses interest in a load
 */
router.post('/:id/interest', async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const carrierId = req.user.orgId;

    // Verify load exists and is posted
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
        error: 'Load is not available for interest',
        code: 'LOAD_NOT_AVAILABLE'
      });
    }

    // Check if carrier already expressed interest
    const existingInterest = await prisma.loadInterest.findFirst({
      where: {
        loadId: id,
        carrierId: carrierId
      }
    });

    if (existingInterest) {
      return res.status(400).json({
        error: 'Interest already expressed for this load',
        code: 'INTEREST_ALREADY_EXISTS'
      });
    }

    // Create interest record
    const interest = await prisma.loadInterest.create({
      data: {
        loadId: id,
        carrierId: carrierId,
        message: message || null,
        status: 'PENDING'
      }
    });

    // Log notification (in production, send email/SMS)
    console.log(`📧 Notification: Carrier ${carrierId} expressed interest in load ${id}`);
    console.log(`   Message: ${message || 'No message provided'}`);

    res.status(201).json({
      success: true,
      interestId: interest.id,
      shipperNotified: true
    });

  } catch (error) {
    console.error('Interest expression error:', error);
    res.status(500).json({
      error: 'Internal server error expressing interest',
      code: 'INTEREST_ERROR'
    });
  }
});

/**
 * POST /loads/:id/assign
 * Shipper assigns carrier to load
 */
router.post('/:id/assign', async (req, res) => {
  try {
    const { id } = req.params;
    const { carrierId } = req.body;
    const shipperId = req.user.orgId;

    // Verify load exists and belongs to shipper
    const load = await prisma.load.findUnique({
      where: { id }
    });

    if (!load) {
      return res.status(404).json({
        error: 'Load not found',
        code: 'LOAD_NOT_FOUND'
      });
    }

    if (load.shipperId !== shipperId) {
      return res.status(403).json({
        error: 'Access denied - cannot assign carrier to other shipper\'s load',
        code: 'ACCESS_DENIED'
      });
    }

    if (load.status !== 'POSTED') {
      return res.status(400).json({
        error: 'Load is not available for assignment',
        code: 'LOAD_NOT_AVAILABLE'
      });
    }

    // Verify carrier exists
    const carrier = await prisma.organization.findUnique({
      where: { id: carrierId }
    });

    if (!carrier) {
      return res.status(404).json({
        error: 'Carrier not found',
        code: 'CARRIER_NOT_FOUND'
      });
    }

    // Update load with assignment
    const updatedLoad = await prisma.load.update({
      where: { id },
      data: {
        carrierId: carrierId,
        status: 'ASSIGNED',
        updatedAt: new Date()
      }
    });

    // Reject other pending interests for this load
    await prisma.loadInterest.updateMany({
      where: {
        loadId: id,
        carrierId: { not: carrierId },
        status: 'PENDING'
      },
      data: {
        status: 'REJECTED'
      }
    });

    // Accept the assigned carrier's interest
    await prisma.loadInterest.updateMany({
      where: {
        loadId: id,
        carrierId: carrierId,
        status: 'PENDING'
      },
      data: {
        status: 'ACCEPTED'
      }
    });

    // Log assignment (in production, send notification)
    console.log(`📧 Notification: Load ${id} assigned to carrier ${carrierId}`);
    console.log(`   Shipper: ${shipperId}`);
    console.log(`   Carrier: ${carrier.name}`);

    res.json({
      success: true,
      load: updatedLoad
    });

  } catch (error) {
    console.error('Load assignment error:', error);
    res.status(500).json({
      error: 'Internal server error assigning load',
      code: 'ASSIGNMENT_ERROR'
    });
  }
});

/**
 * PATCH /loads/:id/accept
 * Carrier accepts assigned load
 */
router.patch('/:id/accept', async (req, res) => {
  try {
    const { id } = req.params;
    const carrierId = req.user.orgId;

    // Verify load exists and is assigned to this carrier
    const load = await prisma.load.findUnique({
      where: { id }
    });

    if (!load) {
      return res.status(404).json({
        error: 'Load not found',
        code: 'LOAD_NOT_FOUND'
      });
    }

    if (load.carrierId !== carrierId) {
      return res.status(403).json({
        error: 'Access denied - cannot accept load assigned to other carrier',
        code: 'ACCESS_DENIED'
      });
    }

    if (load.status !== 'ASSIGNED') {
      return res.status(400).json({
        error: 'Load is not in ASSIGNED status',
        code: 'INVALID_STATUS'
      });
    }

    // Update load status
    const updatedLoad = await prisma.load.update({
      where: { id },
      data: {
        status: 'ACCEPTED',
        updatedAt: new Date()
      }
    });

    // Log acceptance (in production, send notification)
    console.log(`📧 Notification: Carrier ${carrierId} accepted load ${id}`);
    console.log(`   Shipper: ${load.shipperId}`);

    res.json({
      success: true,
      load: updatedLoad
    });

  } catch (error) {
    console.error('Load acceptance error:', error);
    res.status(500).json({
      error: 'Internal server error accepting load',
      code: 'ACCEPTANCE_ERROR'
    });
  }
});

/**
 * PATCH /loads/:id/reject
 * Carrier rejects assigned load
 */
router.patch('/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const carrierId = req.user.orgId;

    // Verify load exists and is assigned to this carrier
    const load = await prisma.load.findUnique({
      where: { id }
    });

    if (!load) {
      return res.status(404).json({
        error: 'Load not found',
        code: 'LOAD_NOT_FOUND'
      });
    }

    if (load.carrierId !== carrierId) {
      return res.status(403).json({
        error: 'Access denied - cannot reject load assigned to other carrier',
        code: 'ACCESS_DENIED'
      });
    }

    if (load.status !== 'ASSIGNED') {
      return res.status(400).json({
        error: 'Load is not in ASSIGNED status',
        code: 'INVALID_STATUS'
      });
    }

    // Update load status back to POSTED
    const updatedLoad = await prisma.load.update({
      where: { id },
      data: {
        carrierId: null,
        status: 'POSTED',
        updatedAt: new Date()
      }
    });

    // Update carrier's interest status
    await prisma.loadInterest.updateMany({
      where: {
        loadId: id,
        carrierId: carrierId
      },
      data: {
        status: 'REJECTED'
      }
    });

    // Log rejection (in production, send notification)
    console.log(`📧 Notification: Carrier ${carrierId} rejected load ${id}`);
    console.log(`   Reason: ${reason || 'No reason provided'}`);
    console.log(`   Load returned to POSTED status`);

    res.json({
      success: true,
      load: updatedLoad
    });

  } catch (error) {
    console.error('Load rejection error:', error);
    res.status(500).json({
      error: 'Internal server error rejecting load',
      code: 'REJECTION_ERROR'
    });
  }
});

// ============================================================================
// OPTIMIZED LOAD BOARD FEATURES (Added from optimized version)
// ============================================================================

// Safe whitelist for field selection
const SUMMARY_FIELDS = [
  'id', 'commodity', 'equipmentType', 'haulType',
  'rate', 'rateMode', 'units', 'grossRevenue', 'miles',
  'pickupDate', 'deliveryDate', 'status', 'updatedAt',
  'createdAt'
];

const parseFields = (fieldsParam) => {
  if (!fieldsParam) return SUMMARY_FIELDS;
  const requested = fieldsParam.split(',').map(s => s.trim());
  return requested.filter(f => SUMMARY_FIELDS.includes(f));
};

// Helper to extract city/state from origin/destination JSON
const transformLoadSummary = (load) => ({
  ...load,
  originCity: load.origin?.city,
  originState: load.origin?.state,
  destCity: load.destination?.city,
  destState: load.destination?.state,
  // Remove full address objects for security (city-only on load board)
  origin: undefined,
  destination: undefined
});

/**
 * POST /marketplace/bid
 * Optimized bid submission with idempotency and enhanced validation
 * 
 * Body:
 * - loadId: Load ID to bid on
 * - rate: Bid rate
 * - rateMode: 'per_mile' | 'flat_rate'
 * - notes: Optional bid notes
 * - idempotencyKey: Optional idempotency key
 */
router.post('/bid', authenticateJWT, async (req, res) => {
  try {
    const { loadId, rate, rateMode, notes, idempotencyKey } = req.body;
    const carrierId = req.user.id;

    // Validate required fields
    if (!loadId || !rate || !rateMode) {
      return res.status(400).json({
        error: 'Missing required fields: loadId, rate, rateMode',
        code: 'VALIDATION_ERROR'
      });
    }

    // Validate rate mode
    if (!['per_mile', 'flat_rate'].includes(rateMode)) {
      return res.status(400).json({
        error: 'Invalid rateMode. Must be "per_mile" or "flat_rate"',
        code: 'INVALID_RATE_MODE'
      });
    }

    // Check if load exists and is available for bidding
    const load = await prisma.load.findUnique({
      where: { id: loadId },
      select: {
        id: true,
        status: true,
        shipperId: true,
        commodity: true,
        equipmentType: true,
        pickupLocation: true,
        deliveryLocation: true
      }
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

    // Check for existing bid (idempotency)
    let existingBid = null;
    if (idempotencyKey) {
      existingBid = await prisma.bid.findFirst({
        where: {
          loadId,
          carrierId,
          idempotencyKey
        }
      });
    }

    if (existingBid) {
      return res.json({
        bidId: existingBid.id,
        status: 'duplicate',
        message: 'Bid already submitted with this idempotency key',
        timestamp: existingBid.submittedAt
      });
    }

    // Generate crypto-based bid ID
    const crypto = require('crypto');
    const bidId = crypto.randomUUID();

    // Create bid
    const bid = await prisma.bid.create({
      data: {
        id: bidId,
        loadId,
        carrierId,
        rate: parseFloat(rate),
        rateMode,
        notes: notes || null,
        idempotencyKey: idempotencyKey || null,
        status: 'SUBMITTED',
        submittedAt: new Date()
      },
      include: {
        carrier: {
          select: {
            id: true,
            name: true,
            rating: true
          }
        },
        load: {
          select: {
            id: true,
            commodity: true,
            equipmentType: true,
            pickupLocation: true,
            deliveryLocation: true
          }
        }
      }
    });

    res.status(201).json({
      bidId: bid.id,
      status: 'submitted',
      message: 'Bid submitted successfully',
      timestamp: bid.submittedAt,
      bid: {
        id: bid.id,
        rate: bid.rate,
        rateMode: bid.rateMode,
        notes: bid.notes,
        carrier: bid.carrier,
        load: bid.load
      }
    });

  } catch (error) {
    console.error('Error submitting bid:', error);
    res.status(500).json({
      error: 'Internal server error submitting bid',
      code: 'BID_SUBMISSION_ERROR'
    });
  }
});

module.exports = router;

