/**
 * Rate Limiting Middleware
 * 
 * Uses Redis-backed rate limiting for distributed environments.
 * Falls back to in-memory if Redis unavailable.
 * 
 * Usage:
 * app.use('/api/auth', authLimiter)
 * app.use('/api/marketplace/bid', bidLimiter)
 */

const rateLimit = require('express-rate-limit')
const RedisStore = require('rate-limit-redis')

// Check if Redis is available
let store
if (global.redis) {
  store = new RedisStore({
    sendCommand: (...args) => global.redis.call(...args)
  })
}

// Auth endpoints (strict)
const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 requests per minute
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts. Please try again later.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  store,
  skipSuccessfulRequests: false
})

// Bid submission (medium)
const bidLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 bids per minute per user
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many bid submissions. Please slow down.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  store,
  keyGenerator: (req) => req.user?.id || req.ip // Per-user if authenticated
})

// Load posting (medium)
const loadPostingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 loads per hour per customer
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many load postings. Please try again later.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  store,
  keyGenerator: (req) => req.user?.id || req.ip
})

// General API (light)
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120, // 120 requests per minute
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please slow down.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  store
})

// GPS pings (specific to drivers)
const gpsPingLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 2, // 2 pings per minute (30-second intervals)
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'GPS ping rate exceeded'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  store,
  keyGenerator: (req) => `gps:${req.user?.id || req.ip}`
})

module.exports = {
  authLimiter,
  bidLimiter,
  loadPostingLimiter,
  apiLimiter,
  gpsPingLimiter
}



