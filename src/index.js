// 🔑 Load env FIRST — before any other imports
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dispatchRoutes = require('./routes/dispatch.js');
const loadRoutes = require('./routes/loads.js');
const authRoutes = require('./routes/auth-simple.js'); // Using simple version temporarily
const orgRoutes = require('./routes/organizations.js');
const userRoutes = require('./routes/users.js');
const marketplaceRoutes = require('./routes/marketplace.js');
const customerRoutes = require('./routes/customer.js');
const carrierRoutes = require('./routes/carrier.js');
const verificationRoutes = require('./routes/verification.js'); // NEW
const paymentsRoutes = require('./routes/payments.js'); // NEW
const templatesRoutes = require('./routes/templates.js'); // NEW
const esignatureRoutes = require('./routes/esignature.js'); // NEW
const debugRouter = require('./routes/debug.js'); // NEW
const { authenticateJWT, requireOrgOwnership } = require('./middleware/auth.js');

// Environment already loaded at top

const app = express();
const PORT = process.env.PORT || 3000;

// Background jobs
const cronJobs = require('./workers/cronJobs');
const { startWorkers } = require('./workers/index');
const ENABLE_CRON = process.env.ENABLE_CRON === 'true';
const ENABLE_WORKERS = process.env.ENABLE_WORKERS !== 'false'; // Default to true

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
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Skip rate limiting for health checks
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
  skipSuccessfulRequests: true, // Don't count successful requests
  standardHeaders: true,
  legacyHeaders: false,
});

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    service: 'Dispatch Construction Logistics API',
    env: process.env.NODE_ENV || null
  });
});

// 👉 Public debug route (no auth, no rate limiting)
app.use('/api/debug', debugRouter);

// 👉 Example protected probe using your normal middleware
app.get('/api/debug/protected', authenticateJWT, (req, res) => {
  res.json({ ok: true, user: req.user });
});

// Apply rate limiting to all API routes (except debug and health)
app.use('/api/', apiLimiter);

// Public routes (with stricter auth rate limiting)
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth', authRoutes);

// Protected routes (authentication required)
app.use('/api/dispatch', authenticateJWT, dispatchRoutes);
app.use('/api/loads', authenticateJWT, requireOrgOwnership, loadRoutes);
app.use('/api/organizations', authenticateJWT, orgRoutes);
app.use('/api/users', authenticateJWT, userRoutes);
app.use('/api/marketplace', authenticateJWT, marketplaceRoutes);
app.use('/api/customer', authenticateJWT, customerRoutes);
app.use('/api/carrier', authenticateJWT, carrierRoutes);
app.use('/api/verification', authenticateJWT, verificationRoutes); // NEW
app.use('/api/payments', authenticateJWT, paymentsRoutes); // NEW
app.use('/api/templates', authenticateJWT, templatesRoutes); // NEW
app.use('/api/esignature', authenticateJWT, esignatureRoutes); // NEW

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Dispatch Construction Logistics API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    code: 'NOT_FOUND',
    path: req.originalUrl
  });
});

// Start server with timeouts
const server = app.listen(PORT, () => {
  console.log(`🚀 Dispatch Construction Logistics API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔧 API docs: http://localhost:${PORT}/`);
  console.log(`🏗️  Equipment matcher: http://localhost:${PORT}/api/dispatch`);
  console.log(`🛡️  Rate limiting: 100 req/15min (Auth: 5 req/15min)`);
  
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

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

module.exports = app;

