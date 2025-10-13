/**
 * Bid Acceptance Lock Service
 * 
 * Prevents race conditions when multiple customers try to accept different bids
 * on the same load simultaneously.
 * 
 * Three-layer defense:
 * 1. Redis SETNX lock (90s TTL) - Application layer
 * 2. Database partial unique index - Database layer
 * 3. Database trigger - Final failsafe
 */

const LOCK_TTL_MS = 90000 // 90 seconds

/**
 * Try to acquire lock for bid acceptance
 * Returns true if lock acquired, false if already locked
 */
const tryLockAcceptance = async (loadId) => {
  if (!global.redis) {
    // Redis not available - rely on DB constraints only
    console.warn('[BID LOCK] Redis not available - using DB constraints only')
    return true
  }

  const lockKey = `lock:accept:${loadId}`
  
  try {
    // SETNX with TTL (atomic operation)
    const result = await global.redis.set(lockKey, '1', 'NX', 'PX', LOCK_TTL_MS)
    
    if (result === 'OK') {
      console.log(`[BID LOCK] Lock acquired for load: ${loadId}`)
      return true
    } else {
      console.log(`[BID LOCK] Lock already held for load: ${loadId}`)
      return false
    }
  } catch (error) {
    console.error('[BID LOCK] Redis error, falling back to DB constraints:', error)
    // On Redis error, allow operation (DB constraints will catch conflicts)
    return true
  }
}

/**
 * Release lock after bid acceptance
 */
const releaseLock = async (loadId) => {
  if (!global.redis) return

  const lockKey = `lock:accept:${loadId}`
  
  try {
    await global.redis.del(lockKey)
    console.log(`[BID LOCK] Lock released for load: ${loadId}`)
  } catch (error) {
    // Non-critical error (lock will expire anyway)
    console.error('[BID LOCK] Error releasing lock:', error)
  }
}

/**
 * Check if load is currently locked
 */
const isLocked = async (loadId) => {
  if (!global.redis) return false

  const lockKey = `lock:accept:${loadId}`
  
  try {
    const exists = await global.redis.exists(lockKey)
    return exists === 1
  } catch (error) {
    console.error('[BID LOCK] Error checking lock:', error)
    return false
  }
}

/**
 * Get lock TTL (time remaining)
 */
const getLockTTL = async (loadId) => {
  if (!global.redis) return 0

  const lockKey = `lock:accept:${loadId}`
  
  try {
    const ttl = await global.redis.pttl(lockKey)
    return ttl > 0 ? ttl : 0
  } catch (error) {
    console.error('[BID LOCK] Error getting lock TTL:', error)
    return 0
  }
}

module.exports = {
  tryLockAcceptance,
  releaseLock,
  isLocked,
  getLockTTL,
  LOCK_TTL_MS
}



