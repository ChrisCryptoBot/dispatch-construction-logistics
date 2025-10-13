/**
 * Bid Notification Worker
 * 
 * Processes 'new-bid-notification' jobs from the queue.
 * Sends email, SMS, and in-app notifications when a bid is submitted.
 */

const { Worker } = require('bullmq')
const { connection } = require('./redis')
const { prisma } = require('../db/prisma')
const { pushEvent } = require('../routes/events')

const bidWorker = new Worker('bid-notifications', async (job) => {
  const { bidId, shipperId, carrierId, loadId } = job.data

  console.log(`[BID WORKER] Processing bid notification: ${bidId}`)

  try {
    // Fetch bid details
    const bid = await prisma.loadInterest.findUnique({
      where: { id: bidId },
      include: {
        load: {
          select: {
            id: true,
            commodity: true,
            equipmentType: true,
            pickupDate: true,
            rate: true
          }
        },
        carrier: {
          select: {
            id: true,
            name: true,
            mcNumber: true,
            dotNumber: true
          }
        }
      }
    })

    if (!bid) {
      console.error(`[BID WORKER] Bid not found: ${bidId}`)
      return
    }

    // Get customer details
    const customer = await prisma.user.findFirst({
      where: { id: shipperId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true
      }
    })

    if (!customer) {
      console.error(`[BID WORKER] Customer not found: ${shipperId}`)
      return
    }

    // Send in-app notification via SSE
    const sseSuccess = pushEvent(shipperId, 'bid_received', {
      type: 'bid_received',
      bidId: bid.id,
      loadId: bid.loadId,
      carrierName: bid.carrier.name,
      bidAmount: bid.bidAmount,
      timestamp: new Date().toISOString()
    })

    console.log(`[BID WORKER] SSE notification sent: ${sseSuccess}`)

    // Queue email notification
    if (global.emailQueue && customer.email) {
      await global.emailQueue.add('bid-received-email', {
        to: customer.email,
        customerName: `${customer.firstName} ${customer.lastName}`,
        carrierName: bid.carrier.name,
        commodity: bid.load.commodity,
        bidAmount: bid.bidAmount,
        loadId: bid.loadId
      })
      console.log(`[BID WORKER] Email queued for: ${customer.email}`)
    }

    // Optional: Queue SMS if critical/urgent load
    // if (bid.load.priority === 'urgent' && customer.phone) {
    //   await global.smsQueue.add('bid-received-sms', { ... })
    // }

    console.log(`[BID WORKER] Completed bid notification: ${bidId}`)
  } catch (error) {
    console.error(`[BID WORKER] Error processing bid ${bidId}:`, error)
    throw error // Will trigger retry
  }
}, {
  connection,
  concurrency: 10, // Process up to 10 jobs concurrently
  removeOnComplete: { count: 100 },
  removeOnFail: { count: 1000 }
})

bidWorker.on('completed', (job) => {
  console.log(`[BID WORKER] Job completed: ${job.id}`)
})

bidWorker.on('failed', (job, err) => {
  console.error(`[BID WORKER] Job failed: ${job?.id}`, err.message)
})

bidWorker.on('error', (err) => {
  console.error('[BID WORKER] Worker error:', err)
})

module.exports = bidWorker



