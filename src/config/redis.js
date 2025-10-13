/**
 * Redis Configuration - Production Ready
 * 
 * Handles caching, rate limiting, and session storage
 * Optimized for high-concurrency scenarios
 */

const Redis = require('ioredis');

// Redis connection configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: process.env.REDIS_DB || 0,
  
  // Connection pool settings
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: null, // Required for BullMQ
  lazyConnect: true,
  
  // Performance settings
  keepAlive: 30000,
  connectTimeout: 10000,
  commandTimeout: 5000,
  
  // Error handling
  retryDelayOnClusterDown: 300,
  enableOfflineQueue: false,
};

// Create Redis client
let redis;

if (process.env.NODE_ENV === 'production') {
  redis = new Redis(redisConfig);
} else {
  // Development: Use global to persist across hot reloads
  if (!global.__redis) {
    global.__redis = new Redis(redisConfig);
  }
  redis = global.__redis;
}

// Redis error handling
redis.on('error', (error) => {
  console.error('Redis connection error:', error.message);
  // Don't crash the app if Redis is down
});

redis.on('connect', () => {
  console.log('✅ Redis connected successfully');
});

redis.on('ready', () => {
  console.log('✅ Redis ready for operations');
});

// Cache key generators
const CacheKeys = {
  // User authentication
  userSession: (userId) => `user:session:${userId}`,
  userProfile: (userId) => `user:profile:${userId}`,
  userOrg: (userId) => `user:org:${userId}`,
  
  // Load board caching
  loadBoard: (filters) => {
    const key = Object.keys(filters)
      .sort()
      .map(k => `${k}:${filters[k]}`)
      .join('|');
    return `loadboard:${Buffer.from(key).toString('base64')}`;
  },
  
  // Organization data
  orgProfile: (orgId) => `org:profile:${orgId}`,
  orgInsurance: (orgId) => `org:insurance:${orgId}`,
  orgFmcsa: (orgId) => `org:fmcsa:${orgId}`,
  
  // Rate limiting
  rateLimit: (identifier, window) => `ratelimit:${identifier}:${window}`,
  
  // API responses
  apiResponse: (endpoint, params) => `api:${endpoint}:${Buffer.from(JSON.stringify(params)).toString('base64')}`,
};

// Cache TTL constants (in seconds)
const CacheTTL = {
  USER_SESSION: 24 * 60 * 60, // 24 hours
  USER_PROFILE: 60 * 60, // 1 hour
  LOAD_BOARD: 5 * 60, // 5 minutes
  ORG_DATA: 30 * 60, // 30 minutes
  API_RESPONSE: 2 * 60, // 2 minutes
  RATE_LIMIT: 60, // 1 minute
};

// Helper functions
const cacheHelpers = {
  // Get with fallback
  async get(key) {
    try {
      const value = await redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error.message);
      return null;
    }
  },

  // Set with TTL
  async set(key, value, ttl = CacheTTL.API_RESPONSE) {
    try {
      const serialized = JSON.stringify(value);
      await redis.setex(key, ttl, serialized);
      return true;
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error.message);
      return false;
    }
  },

  // Delete
  async del(key) {
    try {
      await redis.del(key);
      return true;
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error.message);
      return false;
    }
  },

  // Delete pattern
  async delPattern(pattern) {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
      return keys.length;
    } catch (error) {
      console.error(`Cache delete pattern error for ${pattern}:`, error.message);
      return 0;
    }
  },

  // Increment for rate limiting
  async increment(key, ttl = CacheTTL.RATE_LIMIT) {
    try {
      const count = await redis.incr(key);
      if (count === 1) {
        await redis.expire(key, ttl);
      }
      return count;
    } catch (error) {
      console.error(`Cache increment error for key ${key}:`, error.message);
      return 0;
    }
  },

  // Health check
  async healthCheck() {
    try {
      const start = Date.now();
      await redis.ping();
      const duration = Date.now() - start;
      return {
        healthy: true,
        responseTime: `${duration}ms`,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message,
        timestamp: new Date()
      };
    }
  }
};

// Graceful shutdown
process.on('beforeExit', async () => {
  try {
    await redis.quit();
    console.log('Redis connection closed gracefully');
  } catch (error) {
    console.error('Error closing Redis connection:', error.message);
  }
});

module.exports = {
  redis,
  CacheKeys,
  CacheTTL,
  ...cacheHelpers
};
