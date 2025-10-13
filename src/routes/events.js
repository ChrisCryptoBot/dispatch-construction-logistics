/**
 * Server-Sent Events (SSE) for Real-Time Updates
 * 
 * Provides push-based real-time updates to connected clients.
 * Used for: bid notifications, status changes, driver acceptance, etc.
 * 
 * Frontend usage:
 * const eventSource = new EventSource('/api/events/stream')
 * eventSource.addEventListener('bid_received', (e) => {
 *   const data = JSON.parse(e.data)
 *   // Update UI
 * })
 */

const express = require('express')
const router = express.Router()

// In-memory client connections (userId -> response object)
// In production with multiple servers, use Redis pub/sub
const clients = new Map()

/**
 * GET /api/events/stream
 * Establish SSE connection for real-time updates
 */
router.get('/stream', (req, res) => {
  // Verify authentication
  if (!req.user || !req.user.id) {
    return res.status(401).json({
      error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
    })
  }

  const userId = req.user.id

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache, no-transform')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no') // Disable nginx buffering
  res.flushHeaders()

  // Send initial ping
  res.write(`event: ping\ndata: ${JSON.stringify({ alive: true, timestamp: Date.now() })}\n\n`)

  // Store client connection
  clients.set(userId, res)

  // Send periodic pings to keep connection alive (every 30 seconds)
  const pingInterval = setInterval(() => {
    if (clients.has(userId)) {
      res.write(`event: ping\ndata: ${JSON.stringify({ alive: true, timestamp: Date.now() })}\n\n`)
    } else {
      clearInterval(pingInterval)
    }
  }, 30000)

  // Clean up on client disconnect
  req.on('close', () => {
    console.log(`[SSE] Client disconnected: ${userId}`)
    clients.delete(userId)
    clearInterval(pingInterval)
  })

  console.log(`[SSE] Client connected: ${userId}`)
})

/**
 * Push event to specific user
 * Called from other parts of the application
 */
const pushEvent = (userId, eventType, payload) => {
  const res = clients.get(userId)
  if (!res) {
    // Client not connected
    return false
  }

  try {
    const data = JSON.stringify(payload)
    res.write(`event: ${eventType}\ndata: ${data}\n\n`)
    return true
  } catch (error) {
    console.error(`[SSE] Error pushing event to ${userId}:`, error)
    clients.delete(userId)
    return false
  }
}

/**
 * Push event to multiple users
 */
const pushEventToUsers = (userIds, eventType, payload) => {
  const results = userIds.map(userId => pushEvent(userId, eventType, payload))
  return results.filter(Boolean).length
}

/**
 * Broadcast event to all connected clients
 */
const broadcast = (eventType, payload) => {
  let successCount = 0
  for (const [userId, res] of clients.entries()) {
    if (pushEvent(userId, eventType, payload)) {
      successCount++
    }
  }
  return successCount
}

/**
 * Get connected client count
 */
const getConnectedCount = () => clients.size

/**
 * Get connected user IDs
 */
const getConnectedUsers = () => Array.from(clients.keys())

module.exports = {
  router,
  pushEvent,
  pushEventToUsers,
  broadcast,
  getConnectedCount,
  getConnectedUsers
}



