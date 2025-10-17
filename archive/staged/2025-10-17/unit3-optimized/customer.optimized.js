const express = require('express')
const router = express.Router()
const { prisma } = require('../db/prisma')
const { validate } = require('../middleware/validate')
const { z } = require('zod')

// ============================================================================
// OPTIMIZED MY LOADS ENDPOINT
// ============================================================================
// Features:
// - Single query (no N+1)
// - Cursor pagination
// - Field selection (summary vs detail)
// - Proper Prisma includes
// ============================================================================

/**
 * GET /api/customer/my-loads
 * Get customer's loads with bids (optimized, no N+1 queries)
 * 
 * Query params:
 * - limit: Page size (default 20, max 100)
 * - cursor: Pagination cursor
 * - detail: true/false (include bids & carrier details)
 * - status: Filter by status
 */
router.get('/my-loads', async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || '20', 10), 100)
    const cursor = req.query.cursor || null
    const detail = req.query.detail === 'true'
    const statusFilter = req.query.status

    // Build where clause
    const where = {
      shipperId: req.user.id,
      ...(statusFilter ? { status: statusFilter } : {})
    }

    // Single query with conditional includes
    const loads = await prisma.load.findMany({
      where,
      select: {
        id: true,
        status: true,
        commodity: true,
        equipmentType: true,
        haulType: true,
        rate: true,
        rateMode: true,
        units: true,
        grossRevenue: true,
        miles: true,
        pickupDate: true,
        deliveryDate: true,
        origin: true,
        destination: true,
        jobCode: true,
        poNumber: true,
        createdAt: true,
        updatedAt: true,
        
        // Conditional includes based on detail flag
        ...(detail ? {
          carrier: {
            select: {
              id: true,
              name: true,
              mcNumber: true,
              dotNumber: true
            }
          },
          interests: {
            select: {
              id: true,
              bidAmount: true,
              message: true,
              status: true,
              createdAt: true,
              carrier: {
                select: {
                  id: true,
                  name: true,
                  mcNumber: true
                }
              }
            },
            orderBy: { createdAt: 'desc' },
            take: 10 // Limit bids per load
          },
          documents: {
            select: {
              id: true,
              type: true,
              url: true,
              createdAt: true
            }
          }
        } : {})
      },
      orderBy: { updatedAt: 'desc' },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {})
    })

    // Pagination logic
    const hasMore = loads.length > limit
    const page = hasMore ? loads.slice(0, -1) : loads
    const nextCursor = hasMore ? page[page.length - 1].id : null

    return res.json({
      items: page,
      nextCursor,
      hasMore,
      count: page.length
    })
  } catch (e) {
    next(e)
  }
})

// ============================================================================
// CREATE LOAD ENDPOINT
// ============================================================================

const CreateLoadSchema = z.object({
  body: z.object({
    commodity: z.string().min(1, 'Commodity required'),
    equipmentType: z.string().min(1, 'Equipment type required'),
    quantity: z.number().positive('Quantity must be positive'),
    quantityUnit: z.enum(['tons', 'yards', 'pieces', 'trips']),
    pickupLocation: z.string().min(1, 'Pickup location required'),
    pickupAddress: z.string().min(1, 'Pickup address required'),
    deliveryLocation: z.string().min(1, 'Delivery location required'),
    deliveryAddress: z.string().min(1, 'Delivery address required'),
    pickupDate: z.string().datetime('Invalid pickup date'),
    deliveryDate: z.string().datetime('Invalid delivery date'),
    rateMode: z.enum(['per_ton', 'per_yard', 'per_mile', 'per_trip', 'per_hour']),
    rateAmount: z.number().positive('Rate must be positive'),
    specialInstructions: z.string().max(1000).optional(),
    jobCode: z.string().max(50).optional(),
    siteName: z.string().max(100).optional()
  })
})

/**
 * POST /api/customer/loads
 * Create a new load
 */
router.post('/loads', validate(CreateLoadSchema), async (req, res, next) => {
  try {
    const data = req.valid.body
    const customerId = req.user.id

    // Calculate estimated values (using existing services)
    const { getRecommendedEquipment, getQuickEstimate } = require('../services/pricingEngine')
    
    const equipment = getRecommendedEquipment(data.commodity)
    const estimate = getQuickEstimate({
      materialType: data.commodity,
      quantity: data.quantity,
      quantityUnit: data.quantityUnit,
      pickupLocation: data.pickupLocation,
      deliveryLocation: data.deliveryLocation
    })

    // Create load
    const load = await prisma.load.create({
      data: {
        shipperId: customerId,
        commodity: data.commodity,
        equipmentType: data.equipmentType || equipment[0],
        loadType: 'CONSTRUCTION',
        rateMode: data.rateMode,
        haulType: estimate.haulType,
        origin: {
          address: data.pickupAddress,
          city: data.pickupLocation.split(',')[0]?.trim(),
          state: data.pickupLocation.split(',')[1]?.trim(),
          // TODO: Geocode for lat/lng
        },
        destination: {
          address: data.deliveryAddress,
          city: data.deliveryLocation.split(',')[0]?.trim(),
          state: data.deliveryLocation.split(',')[1]?.trim(),
        },
        rate: data.rateAmount,
        units: data.quantity,
        grossRevenue: estimate.estimatedRevenue,
        miles: estimate.distance,
        pickupDate: new Date(data.pickupDate),
        deliveryDate: new Date(data.deliveryDate),
        jobCode: data.jobCode || null,
        siteName: data.siteName || null,
        status: 'POSTED'
      },
      select: {
        id: true,
        commodity: true,
        status: true,
        grossRevenue: true,
        createdAt: true
      }
    })

    // Queue calendar sync notification
    if (global.calendarQueue) {
      await global.calendarQueue.add('sync-load-to-calendar', {
        loadId: load.id,
        customerId
      })
    }

    return res.status(201).json(load)
  } catch (e) {
    next(e)
  }
})

module.exports = router



