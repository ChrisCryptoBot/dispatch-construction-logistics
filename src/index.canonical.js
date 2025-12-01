/**
 * CANONICAL BACKEND SERVER - CONSOLIDATED VERSION
 * 
 * This file merges the best features from both original and optimized versions:
 * - All original functionality preserved
 * - Performance optimizations from optimized version
 * - Enhanced monitoring and health checks
 * - Improved error handling and graceful shutdown
 * - Feature flags for safe deployment
 */

// 🔑 Load env FIRST — before any other imports
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

// Feature flags for safe deployment
const USE_OPTIMIZED_FEATURES = process.env.USE_OPTIMIZED_FEATURES === 'true';
const ENABLE_COMPRESSION = process.env.ENABLE_COMPRESSION !== 'false'; // Default true
const ENABLE_METRICS = process.env.ENABLE_METRICS !== 'false'; // Default true
const ENABLE_REQUEST_LOGGING = process.env.ENABLE_REQUEST_LOGGING !== 'false'; // Default true

// Route imports (maintain all original routes)
const dispatchRoutes = require('./routes/dispatch.js');
const loadRoutes = require('./routes/loads.js');
const authRoutes = require('./routes/auth-simple.js');
const orgRoutes = require('./routes/organizations.js');
const userRoutes = require('./routes/users.js');
const marketplaceRoutes = require('./routes/marketplace.js');
const customerRoutes = require('./routes/customer.js');
const carrierRoutes = require('./routes/carrier.js');
const verificationRoutes = require('./routes/verification.js');
const paymentsRoutes = require('./routes/payments.js');
const templatesRoutes = require('./routes/templates.js');
const esignatureRoutes = require('./routes/esignature.js');
const disputeRoutes = require('./routes/disputes.js');
const debugRouter = require('./routes/debug.js');

// Middleware imports
const { authenticateJWT, requireOrgOwnership } = require('./middleware/auth.js');

const app = express();
const PORT = process.env.PORT || 3000;

// Background jobs
const cronJobs = require('./workers/cronJobs');
const { startWorkers } = require('./workers/index');
const ENABLE_CRON = process.env.ENABLE_CRON === 'true';
const ENABLE_WORKERS = process.env.ENABLE_WORKERS !== 'false';

// Rate limiting
const rateLimit = require('express-rate-limit');

// General API rate limiter (100 requests per 15 minutes)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/health'
});

// Stricter rate limiter for authentication endpoints (5 attempts per 15 minutes)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    error: 'Too many authentication attempts, please try again later.',
    code: 'AUTH_RATE_LIMIT_EXCEEDED',
    retryAfter: '15 minutes'
  },
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
});

// ============================================================================
// MIDDLEWARE (Order matters!)
// ============================================================================

// 1. Security headers
app.use(helmet({
  contentSecurityPolicy: USE_OPTIMIZED_FEATURES ? false : undefined, // Disable CSP for API server if optimized
  crossOriginEmbedderPolicy: USE_OPTIMIZED_FEATURES ? false : undefined
}));

// 2. CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174'],
  credentials: true,
  exposedHeaders: USE_OPTIMIZED_FEATURES ? ['ETag', 'X-RateLimit-Limit', 'X-RateLimit-Remaining'] : undefined
}));

// 3. Compression (optimized feature)
if (ENABLE_COMPRESSION) {
  app.use(compression({
    level: 6, // Balance between speed and compression
    threshold: 1024, // Only compress responses > 1KB
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    }
  }));
}

// 4. Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 5. Request logging (optimized feature)
if (ENABLE_REQUEST_LOGGING) {
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`[${req.method}] ${req.path} - ${res.statusCode} (${duration}ms)`);
    });
    next();
  });
}

// ============================================================================
// ROUTES
// ============================================================================

// Health check endpoint (enhanced with optimized features)
app.get('/health', async (req, res) => {
  try {
    // Basic health check (always available)
    const basicHealth = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      service: 'Dispatch Construction Logistics API',
      env: process.env.NODE_ENV || null
    };

    // Enhanced health check (if optimized features enabled)
    if (USE_OPTIMIZED_FEATURES) {
      try {
        // Check database connection
        const { prisma } = require('./db/prisma');
        await prisma.$queryRaw`SELECT 1`;
        
        // Check Redis connection (if available)
        let redisHealthy = false;
        try {
          if (global.redis) {
            redisHealthy = await global.redis.ping() === 'PONG';
          }
        } catch (e) {
          // Redis not available or not configured
        }

        // Enhanced health response
        res.json({
          ...basicHealth,
          database: 'connected',
          redis: redisHealthy ? 'connected' : 'disconnected',
          uptime: process.uptime(),
          features: {
            compression: ENABLE_COMPRESSION,
            metrics: ENABLE_METRICS,
            requestLogging: ENABLE_REQUEST_LOGGING
          }
        });
      } catch (dbError) {
        res.status(503).json({
          ...basicHealth,
          status: 'unhealthy',
          database: 'disconnected',
          error: dbError.message
        });
      }
    } else {
      // Basic health response
      res.json(basicHealth);
    }
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Metrics endpoint (optimized feature)
if (ENABLE_METRICS) {
  app.get('/metrics', async (req, res) => {
    try {
      const metrics = {
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        nodeVersion: process.version,
        features: {
          compression: ENABLE_COMPRESSION,
          requestLogging: ENABLE_REQUEST_LOGGING
        }
      };

      // Add SSE connection count if available
      try {
        const { getConnectedCount } = require('./routes/events');
        metrics.sseConnections = getConnectedCount();
      } catch (e) {
        // SSE not available
        metrics.sseConnections = 0;
      }

      res.json(metrics);
    } catch (error) {
      res.status(500).json({
        error: 'Failed to retrieve metrics',
        message: error.message
      });
    }
  });
}

// Public debug route (no auth, no rate limiting)
app.use('/api/debug', debugRouter);

// Example protected probe using your normal middleware
app.get('/api/debug/protected', authenticateJWT, (req, res) => {
  res.json({ ok: true, user: req.user });
});

// Apply rate limiting to all API routes (except debug and health)
app.use('/api/', apiLimiter);

// Public routes (with stricter auth rate limiting)
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth', authRoutes);

// Protected routes (authentication required) - ALL ORIGINAL ROUTES PRESERVED
app.use('/api/dispatch', authenticateJWT, dispatchRoutes);
app.use('/api/loads', authenticateJWT, requireOrgOwnership, loadRoutes);
app.use('/api/organizations', authenticateJWT, orgRoutes);
app.use('/api/users', authenticateJWT, userRoutes);
app.use('/api/marketplace', authenticateJWT, marketplaceRoutes);
app.use('/api/customer', authenticateJWT, customerRoutes);
app.use('/api/carrier', authenticateJWT, carrierRoutes);
app.use('/api/verification', authenticateJWT, verificationRoutes);
app.use('/api/payments', authenticateJWT, paymentsRoutes);
app.use('/api/templates', authenticateJWT, templatesRoutes);
app.use('/api/esignature', authenticateJWT, esignatureRoutes);
app.use('/api/disputes', authenticateJWT, disputeRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Dispatch Construction Logistics API',
    version: '1.0.0',
    features: {
      optimized: USE_OPTIMIZED_FEATURES,
      compression: ENABLE_COMPRESSION,
      metrics: ENABLE_METRICS,
      requestLogging: ENABLE_REQUEST_LOGGING
    },
    endpoints: {
      health: '/health',
      metrics: ENABLE_METRICS ? '/metrics' : null,
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me',
        refresh: 'POST /api/auth/refresh'
      },
      organizations: {
        create: 'POST /api/organizations',
        get: 'GET /api/organizations/:id',
        update: 'PATCH /api/organizations/:id',
        list: 'GET /api/organizations'
      },
      users: {
        create: 'POST /api/users',
        get: 'GET /api/users/:id',
        update: 'PATCH /api/users/:id',
        list: 'GET /api/users'
      },
      loads: {
        create: 'POST /api/loads',
        get: 'GET /api/loads/:id',
        update: 'PATCH /api/loads/:id/status',
        list: 'GET /api/loads',
        assign: 'POST /api/loads/:id/assign'
      },
      dispatch: {
        assign: 'POST /api/dispatch/assign',
        suggestions: 'GET /api/dispatch/suggestions/:commodity',
        validate: 'POST /api/dispatch/validate',
        equipment: 'GET /api/dispatch/equipment-types'
      },
      marketplace: {
        loadBoard: 'GET /api/marketplace/loads',
        expressInterest: 'POST /api/marketplace/:id/interest',
        assignCarrier: 'POST /api/marketplace/:id/assign',
        acceptLoad: 'PATCH /api/marketplace/:id/accept',
        rejectLoad: 'PATCH /api/marketplace/:id/reject'
      }
    }
  });
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  
  if (USE_OPTIMIZED_FEATURES) {
    // Enhanced error response
    res.status(err.status || 500).json({
      error: {
        code: err.code || 'INTERNAL_ERROR',
        message: err.message || 'Internal server error'
      },
      timestamp: new Date().toISOString()
    });
  } else {
    // Original error response
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
      timestamp: new Date().toISOString()
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  if (USE_OPTIMIZED_FEATURES) {
    res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: `Cannot ${req.method} ${req.path}`
      }
    });
  } else {
    res.status(404).json({
      error: 'Endpoint not found',
      code: 'NOT_FOUND',
      path: req.originalUrl
    });
  }
});

// ============================================================================
// SERVER START
// ============================================================================

// Start server with timeouts
const server = app.listen(PORT, () => {
  console.log(`🚀 Dispatch Construction Logistics API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📈 Metrics: ${ENABLE_METRICS ? `http://localhost:${PORT}/metrics` : 'disabled'}`);
  console.log(`🔧 API docs: http://localhost:${PORT}/`);
  console.log(`🏗️  Equipment matcher: http://localhost:${PORT}/api/dispatch`);
  console.log(`🛡️  Rate limiting: 100 req/15min (Auth: 5 req/15min)`);
  console.log(`⚡ Features: optimized=${USE_OPTIMIZED_FEATURES}, compression=${ENABLE_COMPRESSION}, metrics=${ENABLE_METRICS}`);
  
  // Start background workers if enabled
  if (ENABLE_WORKERS) {
    startWorkers();
  } else {
    console.log('⏸️  Background workers disabled (set ENABLE_WORKERS=true to enable)');
  }
  
  // Start cron jobs if enabled
  if (ENABLE_CRON) {
    cronJobs.startAllJobs();
  } else {
    console.log('⏸️  Cron jobs disabled (set ENABLE_CRON=true to enable)');
  }
});

// Configure server timeouts for production stability
server.timeout = 30000; // 30 seconds - prevent hung requests
server.keepAliveTimeout = 65000; // 65 seconds (more than ALB's default 60s)
server.headersTimeout = 66000; // Slightly more than keepAliveTimeout

// ============================================================================
// GRACEFUL SHUTDOWN (Enhanced)
// ============================================================================

const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received, shutting down gracefully...`);
  
  server.close(async () => {
    console.log('✅ HTTP server closed');
    
    try {
      // Close database connection
      const { prisma } = require('./db/prisma');
      await prisma.$disconnect();
      console.log('✅ Database disconnected');
    } catch (dbError) {
      console.log('⚠️  Database disconnect error:', dbError.message);
    }
    
    // Close Redis connection (if available)
    if (global.redis) {
      try {
        await global.redis.quit();
        console.log('✅ Redis disconnected');
      } catch (redisError) {
        console.log('⚠️  Redis disconnect error:', redisError.message);
      }
    }
    
    // Close queues (if available)
    if (global.bidQueue) {
      try {
        await global.bidQueue.close();
        console.log('✅ Queues closed');
      } catch (queueError) {
        console.log('⚠️  Queue close error:', queueError.message);
      }
    }
    
    console.log('👋 Shutdown complete');
    process.exit(0);
  });

  // Force close after 30 seconds
  setTimeout(() => {
    console.error('❌ Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Original SIGTERM handler (fallback)
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

module.exports = app;


