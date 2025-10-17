const express = require('express')
const router = express.Router()
const crypto = require('crypto')
const { prisma } = require('../db/prisma')
const { validate } = require('../middleware/validate')
const { idempotency } = require('../middleware/idempotency')
const { z } = require('zod')

// ============================================================================
// OPTIMIZED LOAD BOARD ENDPOINT
// ============================================================================
// Features:
// - Field selection via ?fields=
// - Cursor-based pagination
// - Incremental polling via ?since=
// - ETag caching (304 responses)
// - Compressed payloads (via middleware)
// ============================================================================

// Safe whitelist for field selection
const SUMMARY_FIELDS = [
  'id', 'commodity', 'equipmentType', 'haulType',
  'rate', 'rateMode', 'units', 'grossRevenue', 'miles',
  'pickupDate', 'deliveryDate', 'status', 'updatedAt',
  'createdAt'
]

const parseFields = (fieldsParam) => {
  if (!fieldsParam) return SUMMARY_FIELDS
  const requested = fieldsParam.split(',').map(s => s.trim())
  return requested.filter(f => SUMMARY_FIELDS.includes(f))
}

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
})

/**
 * GET /api/marketplace/loads
 * Optimized load board with pagination, field selection, and caching
 * 
 * Query params:
 * - limit: Page size (default 25, max 100)
 * - cursor: Pagination cursor (load ID)
 * - since: ISO timestamp for incremental updates
 * - fields: Comma-separated field list
 * - equipmentType: Filter by equipment
 * - state: Filter by origin state
 * - minRate: Minimum rate filter
 */
router.get('/loads', async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || '25', 10), 100)
    const cursor = req.query.cursor || null
    const since = req.query.since ? new Date(req.query.since) : null
    const fields = parseFields(req.query.fields)

    // Build where clause
    const where = {
      status: 'POSTED',
      ...(since ? { updatedAt: { gt: since } } : {}),
      ...(req.query.equipmentType ? { equipmentType: req.query.equipmentType } : {}),
      ...(req.query.minRate ? { rate: { gte: parseFloat(req.query.minRate) } } : {})
    }

    // Add origin state filter (JSON field query)
    if (req.query.state) {
      where.origin = {
        path: ['state'],
        equals: req.query.state
      }
    }

    // Prisma select shape from requested fields
    // Always include origin/destination for city/state extraction
    const select = {
      origin: true,
      destination: true,
      ...Object.fromEntries(fields.map(f => [f, true]))
    }

    // Fetch with cursor pagination
    const loads = await prisma.load.findMany({
      where,
      select,
      orderBy: [
        { updatedAt: 'desc' },
        { id: 'asc' } // Stable sort
      ],
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {})
    })

    // Pagination logic
    const hasMore = loads.length > limit
    const page = hasMore ? loads.slice(0, -1) : loads
    const nextCursor = hasMore ? page[page.length - 1].id : null

    // Transform loads (extract city/state, remove full addresses)
    const transformedPage = page.map(transformLoadSummary)

    // Build response
    const body = {
      items: transformedPage,
      nextCursor,
      hasMore,
      count: transformedPage.length
    }

    // ETag for caching
    const etag = `"${crypto.createHash('sha1').update(JSON.stringify(body)).digest('hex')}"`

    if (req.headers['if-none-match'] === etag) {
      return res.status(304).end()
    }

    res.set('ETag', etag)
    res.set('Cache-Control', 'private, max-age=15') // 15-second client cache
    
    return res.json(body)
  } catch (e) {
    next(e)
  }
})

// ============================================================================
// OPTIMIZED BID SUBMISSION ENDPOINT
// ============================================================================
// Features:
// - Idempotency support (prevents duplicate bids on retry)
// - Async notifications (email/SMS queued, doesn't block response)
// - Request validation (Zod schema)
// - Fast response (<100ms)
// ============================================================================

const SubmitBidSchema = z.object({
  body: z.object({
    loadId: z.string().uuid('Invalid load ID'),
    bidAmount: z.number().positive('Bid amount must be positive'),
    message: z.string().max(500, 'Message too long').optional()
  })
})

/**
 * POST /api/marketplace/bid
 * Submit a bid on a posted load (instant response, queued notifications)
 */
router.post('/bid', idempotency, validate(SubmitBidSchema), async (req, res, next) => {
  try {
    const { loadId, bidAmount, message } = req.valid.body
    const carrierId = req.user.organizationId

    // Quick check: load exists and is posted
    const load = await prisma.load.findUnique({
      where: { id: loadId },
      select: { id: true, status: true, shipperId: true }
    })

    if (!load) {
      return res.status(404).json({
        error: { code: 'LOAD_NOT_FOUND', message: 'Load not found' }
      })
    }

    if (load.status !== 'POSTED') {
      return res.status(422).json({
        error: { code: 'LOAD_NOT_AVAILABLE', message: 'Load is not available for bidding' }
      })
    }

    // Check for existing bid from this carrier
    const existingBid = await prisma.loadInterest.findFirst({
      where: { loadId, carrierId },
      select: { id: true }
    })

    if (existingBid) {
      return res.status(409).json({
        error: { code: 'BID_ALREADY_EXISTS', message: 'You already bid on this load' }
      })
    }

    // Create bid (fast DB write only)
    const bid = await prisma.loadInterest.create({
      data: {
        loadId,
        carrierId,
        bidAmount,
        message: message || null,
        status: 'PENDING'
      },
      select: {
        id: true,
        loadId: true,
        bidAmount: true,
        createdAt: true,
        status: true
      }
    })

    // Queue notifications asynchronously (don't wait)
    if (global.bidQueue) {
      await global.bidQueue.add('new-bid-notification', {
        bidId: bid.id,
        shipperId: load.shipperId,
        carrierId,
        loadId
      }, { removeOnComplete: true, attempts: 3 })
    }

    // Return immediately (notifications processing in background)
    return res.status(201).json(bid)
  } catch (e) {
    next(e)
  }
})

// ============================================================================
// OPTIMIZED BID ACCEPTANCE ENDPOINT (Race-Condition Safe)
// ============================================================================
// Features:
// - Redis SETNX lock (90s TTL)
// - Database transaction
// - Idempotency support
// - Returns 409 if already locked/accepted
// ============================================================================

const AcceptBidSchema = z.object({
  body: z.object({
    bidId: z.string().uuid('Invalid bid ID')
  }),
  params: z.object({
    id: z.string().uuid('Invalid load ID')
  })
})

/**
 * POST /api/marketplace/loads/:id/accept-bid
 * Accept a bid (customer action)
 */
router.post('/loads/:id/accept-bid', idempotency, validate(AcceptBidSchema), async (req, res, next) => {
  try {
    const { id: loadId } = req.valid.params
    const { bidId } = req.valid.body
    const customerId = req.user.id

    // Try to acquire Redis lock (if available)
    let lockAcquired = false
    if (global.redis) {
      const lockKey = `lock:accept:${loadId}`
      const result = await global.redis.set(lockKey, '1', 'NX', 'PX', 90000) // 90s TTL
      lockAcquired = result === 'OK'
      
      if (!lockAcquired) {
        return res.status(409).json({
          error: { code: 'ALREADY_LOCKED', message: 'Another bid acceptance is in progress' }
        })
      }
    }

    try {
      // Transaction: verify, accept bid, update load, reject others
      await prisma.$transaction(async (tx) => {
        // Verify no bid already accepted
        const existingAccepted = await tx.loadInterest.findFirst({
          where: { loadId, status: 'ACCEPTED' },
          select: { id: true }
        })

        if (existingAccepted) {
          throw Object.assign(new Error('Load already has an accepted bid'), { 
            httpCode: 409, 
            code: 'ALREADY_ACCEPTED' 
          })
        }

        // Verify load belongs to this customer and is posted
        const load = await tx.load.findUnique({
          where: { id: loadId },
          select: { id: true, shipperId: true, status: true }
        })

        if (!load) {
          throw Object.assign(new Error('Load not found'), { httpCode: 404, code: 'LOAD_NOT_FOUND' })
        }

        if (load.shipperId !== customerId) {
          throw Object.assign(new Error('Access denied'), { httpCode: 403, code: 'ACCESS_DENIED' })
        }

        if (load.status !== 'POSTED') {
          throw Object.assign(new Error('Load not available'), { httpCode: 422, code: 'INVALID_STATUS' })
        }

        // Accept the bid
        await tx.loadInterest.update({
          where: { id: bidId },
          data: { status: 'ACCEPTED', updatedAt: new Date() }
        })

        // Reject other bids
        await tx.loadInterest.updateMany({
          where: {
            loadId,
            id: { not: bidId },
            status: 'PENDING'
          },
          data: { status: 'REJECTED', updatedAt: new Date() }
        })

        // Update load status
        await tx.load.update({
          where: { id: loadId },
          data: {
            status: 'RATE_CON_PENDING',
            updatedAt: new Date()
          }
        })

        // Create accept lock record (DB failsafe)
        await tx.loadAcceptLock.create({
          data: {
            loadId,
            acceptedBidId: bidId,
            lockedBy: customerId
          }
        })
      })

      // Queue Rate Con generation (async)
      if (global.rateConQueue) {
        await global.rateConQueue.add('generate-rate-con', {
          loadId,
          bidId
        }, { removeOnComplete: true })
      }

      // Release Redis lock
      if (lockAcquired && global.redis) {
        await global.redis.del(`lock:accept:${loadId}`)
      }

      return res.json({ ok: true, loadId, bidId })

    } catch (txError) {
      // Release lock on error
      if (lockAcquired && global.redis) {
        await global.redis.del(`lock:accept:${loadId}`)
      }

      if (txError.httpCode) {
        return res.status(txError.httpCode).json({
          error: { code: txError.code, message: txError.message }
        })
      }
      throw txError
    }
  } catch (e) {
    next(e)
  }
})

module.exports = router



