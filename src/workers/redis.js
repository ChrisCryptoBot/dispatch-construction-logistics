/**
 * Redis Connection for BullMQ and Caching
 * 
 * Used for:
 * - Job queues (BullMQ)
 * - Bid acceptance locks (SETNX)
 * - Rate limiting
 * - Short-lived caching
 */

const Redis = require('ioredis')

const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null, // Required for BullMQ
  enableReadyCheck: false,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000)
    return delay
  },
  reconnectOnError(err) {
    const targetError = 'READONLY'
    if (err.message.includes(targetError)) {
      // Only reconnect when the error contains "READONLY"
      return true
    }
    return false
  }
})

connection.on('connect', () => {
  console.log('✅ Redis connected')
})

connection.on('error', (err) => {
  console.error('❌ Redis connection error:', err.message)
})

connection.on('ready', () => {
  console.log('✅ Redis ready for operations')
  // Make available globally for easy access
  global.redis = connection
})

module.exports = { connection, redis: connection }



