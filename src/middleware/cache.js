/**
 * Caching Middleware
 * 
 * Provides caching for API responses and authentication
 */

const { CacheKeys, CacheTTL, get, set, del, increment } = require('../config/redis');

/**
 * Cache middleware for API responses
 */
const cacheMiddleware = (ttl = CacheTTL.API_RESPONSE) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Skip caching for authenticated routes that need fresh data
    if (req.path.includes('/admin') || req.path.includes('/auth')) {
      return next();
    }

    try {
      // Generate cache key from request
      const cacheKey = CacheKeys.apiResponse(req.path, req.query);
      
      // Try to get from cache
      const cached = await get(cacheKey);
      if (cached) {
        return res.json({
          ...cached,
          cached: true,
          cacheTimestamp: new Date().toISOString()
        });
      }

      // Store original res.json
      const originalJson = res.json.bind(res);
      
      // Override res.json to cache the response
      res.json = function(data) {
        // Cache the response (async, don't wait)
        set(cacheKey, data, ttl).catch(error => {
          console.error('Cache set error:', error.message);
        });
        
        // Send response
        return originalJson(data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error.message);
      // Continue without caching if Redis fails
      next();
    }
  };
};

/**
 * Rate limiting middleware
 */
const rateLimitMiddleware = (windowMs = 60000, maxRequests = 100) => {
  return async (req, res, next) => {
    try {
      // Use IP address or user ID for rate limiting
      const identifier = req.user?.id || req.ip || 'anonymous';
      const window = Math.floor(Date.now() / windowMs);
      const key = CacheKeys.rateLimit(identifier, window);
      
      const count = await increment(key, Math.ceil(windowMs / 1000));
      
      if (count > maxRequests) {
        return res.status(429).json({
          error: 'Too many requests',
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfter: Math.ceil(windowMs / 1000)
        });
      }

      // Add rate limit headers
      res.set({
        'X-RateLimit-Limit': maxRequests,
        'X-RateLimit-Remaining': Math.max(0, maxRequests - count),
        'X-RateLimit-Reset': new Date(Date.now() + windowMs).toISOString()
      });

      next();
    } catch (error) {
      console.error('Rate limit middleware error:', error.message);
      // Continue without rate limiting if Redis fails
      next();
    }
  };
};

/**
 * Cache invalidation helper
 */
const invalidateCache = {
  // Invalidate user-related cache
  user: async (userId) => {
    const patterns = [
      CacheKeys.userSession(userId),
      CacheKeys.userProfile(userId),
      CacheKeys.userOrg(userId)
    ];
    
    for (const pattern of patterns) {
      await del(pattern);
    }
  },

  // Invalidate load board cache
  loadBoard: async () => {
    const pattern = 'loadboard:*';
    return await del(pattern);
  },

  // Invalidate organization cache
  organization: async (orgId) => {
    const patterns = [
      CacheKeys.orgProfile(orgId),
      CacheKeys.orgInsurance(orgId),
      CacheKeys.orgFmcsa(orgId)
    ];
    
    for (const pattern of patterns) {
      await del(pattern);
    }
  },

  // Invalidate all API cache
  api: async (endpoint) => {
    const pattern = `api:${endpoint}:*`;
    return await del(pattern);
  }
};

/**
 * Cache warming for frequently accessed data
 */
const warmCache = {
  // Warm user session cache
  userSession: async (userId, userData) => {
    const key = CacheKeys.userSession(userId);
    await set(key, userData, CacheTTL.USER_SESSION);
  },

  // Warm load board cache
  loadBoard: async (filters, loadData) => {
    const key = CacheKeys.loadBoard(filters);
    await set(key, loadData, CacheTTL.LOAD_BOARD);
  }
};

module.exports = {
  cacheMiddleware,
  rateLimitMiddleware,
  invalidateCache,
  warmCache
};

