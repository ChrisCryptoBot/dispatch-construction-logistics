/**
 * Idempotency Middleware
 * 
 * Prevents duplicate operations when clients retry requests.
 * Uses idempotency_keys table to store responses for 24 hours.
 * 
 * Usage:
 * router.post('/endpoint', idempotency, handler)
 * 
 * Client should send: Idempotency-Key header (UUID recommended)
 */

const { prisma } = require('../db/prisma')

const idempotency = async (req, res, next) => {
  const key = req.header('Idempotency-Key')
  
  // If no key provided, skip (idempotency is optional)
  if (!key) {
    return next()
  }

  try {
    // Check if we've seen this key before
    const existing = await prisma.idempotencyKey.findUnique({
      where: { key },
      select: {
        responseStatus: true,
        responseBody: true
      }
    })

    if (existing) {
      // Return cached response
      const status = existing.responseStatus || 200
      const body = existing.responseBody || '{}'
      
      return res.status(status).type('application/json').send(body)
    }

    // Store key for later
    res.locals.idempotencyKey = key

    // Intercept res.json to cache the response
    const originalJson = res.json.bind(res)
    res.json = async function(payload) {
      if (res.locals.idempotencyKey && res.statusCode < 500) {
        // Cache successful responses only (not server errors)
        try {
          await prisma.idempotencyKey.create({
            data: {
              key: res.locals.idempotencyKey,
              operation: req.method + ' ' + req.path,
              resourceId: String(payload?.id || payload?.loadId || payload?.bidId || ''),
              responseStatus: res.statusCode,
              responseBody: JSON.stringify(payload)
            }
          })
        } catch (cacheError) {
          // Don't fail the request if caching fails
          console.error('Idempotency cache error:', cacheError)
        }
      }
      return originalJson(payload)
    }

    next()
  } catch (error) {
    // Don't fail request if idempotency check fails
    console.error('Idempotency middleware error:', error)
    next()
  }
}

module.exports = { idempotency }
