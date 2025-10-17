/**
 * OPTIMIZED BACKEND SERVER
 * 
 * Enhancements:
 * - Helmet (security headers)
 * - Compression (gzip/brotli)
 * - Rate limiting (Redis-backed)
 * - Standardized error handling
 * - SSE support for real-time updates
 * - BullMQ job queues
 * - Prisma singleton
 */

const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const compression = require('compression')
const errorHandler = require('./middleware/errorHandler')
const { apiLimiter } = require('./middleware/rateLimit')

const app = express()

// ============================================================================
// INITIALIZATION
// ============================================================================

// Initialize Redis connection (for locks, queues, rate limiting)
require('./workers/redis')

// Initialize BullMQ queues
require('./workers/queues')

// Start workers
if (process.env.NODE_ENV !== 'test') {
  require('./workers/bid.processor')
  // Add other workers as needed:
  // require('./workers/email.processor')
  // require('./workers/sms.processor')
  // require('./workers/payment.processor')
}

// ============================================================================
// MIDDLEWARE (Order matters!)
// ============================================================================

// 1. Security headers
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for now (API server)
  crossOriginEmbedderPolicy: false
}))

// 2. CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  exposedHeaders: ['ETag', 'X-RateLimit-Limit', 'X-RateLimit-Remaining']
}))

// 3. Compression (gzip/brotli)
app.use(compression({
  level: 6, // Balance between speed and compression
  threshold: 1024, // Only compress responses > 1KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false
    }
    return compression.filter(req, res)
  }
}))

// 4. Body parsing
app.use(express.json({ limit: '10mb' })) // For file uploads
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// 5. Request logging
app.use((req, res, next) => {
  const start = Date.now()
  res.on('finish', () => {
    const duration = Date.now() - start
    console.log(`[${req.method}] ${req.path} - ${res.statusCode} (${duration}ms)`)
  })
  next()
})

// 6. General API rate limiting
app.use('/api', apiLimiter)

// ============================================================================
// ROUTES
// ============================================================================

// Auth routes (with strict rate limiting)
const { authLimiter } = require('./middleware/rateLimit')
app.use('/api/auth', authLimiter, require('./routes/auth'))

// SSE events (real-time updates)
const { router: eventsRouter } = require('./routes/events')
app.use('/api/events', eventsRouter)

// Optimized marketplace routes
const { bidLimiter, loadPostingLimiter } = require('./middleware/rateLimit')
const marketplaceRouter = require('./routes/marketplace.optimized')
app.use('/api/marketplace', marketplaceRouter)

// Apply bid limiter to specific endpoint
app.use('/api/marketplace/bid', bidLimiter)

// Customer routes (optimized)
const customerRouter = require('./routes/customer.optimized')
app.use('/api/customer', customerRouter)

// Apply load posting limiter
app.use('/api/customer/loads', loadPostingLimiter)

// Other routes (existing)
app.use('/api/carrier', require('./routes/carrier'))
app.use('/api/dispatch', require('./routes/dispatch'))
app.use('/api/organizations', require('./routes/organizations'))
app.use('/api/users', require('./routes/users'))

// Original loads route (fallback)
app.use('/api/loads', require('./routes/loads'))

// ============================================================================
// HEALTH & MONITORING
// ============================================================================

/**
 * GET /health
 * Health check endpoint for load balancers
 */
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`
    
    // Check Redis connection
    const redisHealthy = global.redis ? await global.redis.ping() === 'PONG' : false

    // Check queue health
    const { getQueueHealth } = require('./workers/queues')
    const queueHealth = global.redis ? await getQueueHealth() : []

    const overallHealth = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      redis: redisHealthy ? 'connected' : 'disconnected',
      queues: queueHealth,
      uptime: process.uptime()
    }

    res.json(overallHealth)
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    })
  }
})

/**
 * GET /metrics
 * Basic metrics for monitoring
 */
app.get('/metrics', async (req, res) => {
  const { getConnectedCount } = require('./routes/events')
  
  res.json({
    timestamp: new Date().toISOString(),
    sseConnections: getConnectedCount(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    nodeVersion: process.version
  })
})

// ============================================================================
// ERROR HANDLING (Must be last!)
// ============================================================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Cannot ${req.method} ${req.path}`
    }
  })
})

// Global error handler
app.use(errorHandler)

// ============================================================================
// SERVER START
// ============================================================================

const PORT = process.env.PORT || 3000

const server = app.listen(PORT, () => {
  console.log('='.repeat(60))
  console.log('🚀 SUPERIOR ONE LOGISTICS - OPTIMIZED BACKEND')
  console.log('='.repeat(60))
  console.log(`Server running on port ${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`Redis: ${global.redis ? '✅ Connected' : '❌ Disconnected'}`)
  console.log(`Workers: ${process.env.NODE_ENV === 'test' ? '❌ Disabled (test mode)' : '✅ Active'}`)
  console.log('='.repeat(60))
})

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received, shutting down gracefully...`)
  
  server.close(async () => {
    console.log('✅ HTTP server closed')
    
    // Close database connection
    const { prisma } = require('./db/prisma')
    await prisma.$disconnect()
    console.log('✅ Database disconnected')
    
    // Close Redis connection
    if (global.redis) {
      await global.redis.quit()
      console.log('✅ Redis disconnected')
    }
    
    // Close queues
    if (global.bidQueue) {
      await global.bidQueue.close()
      console.log('✅ Queues closed')
    }
    
    console.log('👋 Shutdown complete')
    process.exit(0)
  })

  // Force close after 30 seconds
  setTimeout(() => {
    console.error('❌ Forced shutdown after timeout')
    process.exit(1)
  }, 30000)
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

module.exports = app



