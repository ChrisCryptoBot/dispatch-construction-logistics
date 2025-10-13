# 🎯 Software Workflow Perfection Plan
## Focus: Perfect the Software, Get MC# Later

**Your Decision:** Focus on perfecting software workflows now, get MC# when ready to launch.
**Smart Move:** Can't test with real customers without MC# anyway, so perfect the code first.

---

## ✅ **WHAT TO BUILD NOW (No MC# Needed)**

### **Week 1: Payment Safety (CRITICAL)**

#### **1. Payment Escrow System** ⭐⭐⭐
**What:** Charge customer when material RELEASED, capture when COMPLETED.

**Implementation:**
```javascript
// src/services/paymentService.js

/**
 * Authorize (hold) payment when material released
 * Money is reserved but not captured
 */
async function authorizePayment(loadId) {
  const load = await prisma.load.findUnique({
    where: { id: loadId },
    include: { shipper: true }
  })

  // Get customer's saved payment method
  const customer = await prisma.organization.findUnique({
    where: { id: load.shipperId },
    select: { stripeCustomerId: true, stripePaymentMethodId: true }
  })

  if (!customer.stripePaymentMethodId) {
    throw new Error('Customer has no payment method on file')
  }

  // Create PaymentIntent with manual capture
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(load.grossRevenue * 100), // Convert to cents
    currency: 'usd',
    customer: customer.stripeCustomerId,
    payment_method: customer.stripePaymentMethodId,
    capture_method: 'manual', // KEY: Don't capture yet, just authorize
    confirm: true,
    off_session: true,
    metadata: {
      loadId: load.id,
      type: 'load_payment'
    }
  })

  // Create invoice record
  await prisma.invoice.create({
    data: {
      loadId: load.id,
      customerId: load.shipperId,
      amount: load.grossRevenue,
      status: 'AUTHORIZED', // New status
      dueDate: new Date(),
      stripePaymentIntentId: paymentIntent.id
    }
  })

  return paymentIntent
}

/**
 * Capture (actually charge) payment when load completed
 */
async function capturePayment(loadId) {
  const invoice = await prisma.invoice.findUnique({
    where: { loadId }
  })

  if (!invoice || !invoice.stripePaymentIntentId) {
    throw new Error('No authorized payment found')
  }

  // Capture the held funds
  const paymentIntent = await stripe.paymentIntents.capture(
    invoice.stripePaymentIntentId
  )

  // Update invoice
  await prisma.invoice.update({
    where: { id: invoice.id },
    data: {
      status: 'PAID',
      paidAt: new Date()
    }
  })

  return paymentIntent
}

/**
 * Cancel authorization if load cancelled
 */
async function cancelAuthorization(loadId) {
  const invoice = await prisma.invoice.findUnique({
    where: { loadId }
  })

  if (invoice && invoice.stripePaymentIntentId) {
    // Cancel the PaymentIntent (release the hold)
    await stripe.paymentIntents.cancel(invoice.stripePaymentIntentId)

    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { status: 'CANCELLED' }
    })
  }
}

module.exports = {
  authorizePayment,
  capturePayment,
  cancelAuthorization,
  // ...existing functions
}
```

**Wire into workflow:**
```javascript
// src/routes/customer.js - Issue release endpoint
router.post('/loads/:id/release', authenticateJWT, async (req, res) => {
  try {
    // Issue release
    const load = await releaseService.issueRelease(loadId, req.user.id, releaseData)

    // AUTHORIZE payment (hold funds)
    await paymentService.authorizePayment(loadId)

    res.json({
      success: true,
      load,
      paymentAuthorized: true,
      message: 'Release issued and payment authorized'
    })
  } catch (error) {
    if (error.message.includes('payment method')) {
      return res.status(400).json({
        error: 'No payment method on file. Please add a payment method in Settings.',
        code: 'NO_PAYMENT_METHOD'
      })
    }
    throw error
  }
})

// src/routes/loads.js - Status update endpoint
router.patch('/:id/status', authenticateJWT, async (req, res) => {
  const { status } = req.body

  if (status === 'COMPLETED') {
    // CAPTURE payment (actually charge)
    await paymentService.capturePayment(loadId)
    
    // PAYOUT carrier
    await paymentService.processPayoutAsync(loadId)
  }

  if (status === 'CANCELLED') {
    // RELEASE payment authorization
    await paymentService.cancelAuthorization(loadId)
  }

  // Update load status
  const load = await prisma.load.update({
    where: { id: loadId },
    data: { status }
  })

  res.json({ success: true, load })
})
```

**Priority:** CRITICAL  
**Timeline:** 2-3 days  
**Effort:** Medium  
**Why:** Prevents financial disaster

---

#### **2. POD Review Before Payment** ⭐⭐⭐
**What:** Add PENDING_APPROVAL status so customer reviews POD before payment captures.

**Implementation:**
```javascript
// Update Prisma schema
enum LoadStatus {
  // ...existing statuses...
  DELIVERED,        // Carrier says delivered
  PENDING_APPROVAL, // Waiting for customer review
  COMPLETED,        // Customer approved, payment captured
}

// src/routes/loads.js
router.patch('/:id/status', authenticateJWT, async (req, res) => {
  const { status } = req.body

  // Carrier marks as DELIVERED
  if (status === 'DELIVERED') {
    await prisma.load.update({
      where: { id: loadId },
      data: {
        status: 'DELIVERED',
        deliveredAt: new Date()
      }
    })

    // Notify customer to review POD
    await emailService.sendPODReviewRequest(load)

    return res.json({
      success: true,
      message: 'Delivery recorded. Customer will review POD.'
    })
  }

  // Customer approves POD → Move to PENDING_APPROVAL → COMPLETED
  if (status === 'PENDING_APPROVAL') {
    // Verify customer reviewed POD
    if (!req.body.podApproved) {
      return res.status(400).json({
        error: 'Must confirm POD review',
        code: 'POD_APPROVAL_REQUIRED'
      })
    }

    // Update to PENDING_APPROVAL (triggers payment capture)
    await prisma.load.update({
      where: { id: loadId },
      data: {
        status: 'PENDING_APPROVAL',
        podApprovedAt: new Date(),
        podApprovedBy: req.user.id
      }
    })

    // CAPTURE payment
    await paymentService.capturePayment(loadId)

    // PAYOUT carrier
    await paymentService.processPayoutAsync(loadId)

    // Move to COMPLETED
    await prisma.load.update({
      where: { id: loadId },
      data: { status: 'COMPLETED' }
    })

    return res.json({
      success: true,
      message: 'Payment captured, carrier payout initiated'
    })
  }
})

// Cron job: Auto-approve after 48 hours
// src/workers/cronJobs.js
cron.schedule('0 * * * *', async () => {
  console.log('Checking for auto-approval...')

  const staleDeliveries = await prisma.load.findMany({
    where: {
      status: 'DELIVERED',
      deliveredAt: {
        lt: new Date(Date.now() - 48 * 60 * 60 * 1000) // 48 hours ago
      }
    }
  })

  for (const load of staleDeliveries) {
    console.log(`Auto-approving load ${load.id}`)
    
    // Auto-approve
    await prisma.load.update({
      where: { id: load.id },
      data: {
        status: 'PENDING_APPROVAL',
        podApprovedAt: new Date(),
        podApprovedBy: 'system',
        autoApproved: true
      }
    })

    // Capture payment
    await paymentService.capturePayment(load.id)
    await paymentService.processPayoutAsync(load.id)

    // Complete
    await prisma.load.update({
      where: { id: load.id },
      data: { status: 'COMPLETED' }
    })
  }
})
```

**Frontend:**
```typescript
// web/src/pages/customer/CustomerMyLoadsPage.tsx
{load.status === 'DELIVERED' && (
  <div className="pod-review-section">
    <h3>Review Proof of Delivery</h3>
    <img src={load.podUrl} alt="POD" />
    
    <div className="quantity-check">
      <p>Expected: {load.units} {load.rateMode}</p>
      <p>Delivered: {load.quantityDelivered || 'Pending'}</p>
    </div>

    <button
      onClick={async () => {
        await api.patch(`/loads/${load.id}/status`, {
          status: 'PENDING_APPROVAL',
          podApproved: true
        })
        refetch()
      }}
      className="approve-button"
    >
      ✅ Approve Delivery & Process Payment
    </button>

    <button
      onClick={() => setShowDisputeModal(true)}
      className="dispute-button"
    >
      ⚠️ Dispute Delivery
    </button>

    <p className="auto-approve-notice">
      Auto-approves in {48 - hoursSinceDelivery} hours if no action taken
    </p>
  </div>
)}
```

**Priority:** CRITICAL  
**Timeline:** 1 day  
**Effort:** Low  
**Why:** Prevents customer disputes after payment

---

### **Week 2: Cancellation & Disputes**

#### **3. Cancellation Policy & Fees** ⭐⭐
**What:** Handle customer/carrier cancellations with appropriate fees.

**Implementation:**
```javascript
// Update Prisma schema
model Load {
  // ...existing fields...
  cancellationFee     Decimal?  @db.Decimal(10, 2)
  cancelledBy         String?
  cancellationReason  String?
  cancelledAt         DateTime?
  cancellationType    String?   // CUSTOMER, CARRIER, SYSTEM
}

// src/routes/customer.js
router.post('/loads/:id/cancel', authenticateJWT, async (req, res) => {
  const { reason } = req.body
  const load = await prisma.load.findUnique({ where: { id: loadId } })

  if (!load) {
    return res.status(404).json({ error: 'Load not found' })
  }

  // Calculate cancellation fee based on status
  let fee = 0
  let carrierCompensation = 0

  switch (load.status) {
    case 'DRAFT':
    case 'POSTED':
      fee = 0 // Free to cancel before acceptance
      break

    case 'ASSIGNED':
    case 'ACCEPTED':
    case 'RELEASE_REQUESTED':
      fee = 50 // $50 admin fee
      break

    case 'RELEASED':
      fee = 200 // Full TONU charge
      carrierCompensation = 150 // Carrier gets $150
      break

    case 'IN_TRANSIT':
      return res.status(400).json({
        error: 'Cannot cancel load in transit. Contact emergency support.',
        code: 'CANNOT_CANCEL_IN_TRANSIT'
      })

    default:
      return res.status(400).json({
        error: 'Cannot cancel load in current status',
        code: 'INVALID_STATUS_FOR_CANCELLATION'
      })
  }

  // Update load
  await prisma.load.update({
    where: { id: loadId },
    data: {
      status: 'CANCELLED',
      cancelledBy: req.user.id,
      cancellationReason: reason,
      cancellationFee: fee,
      cancellationType: 'CUSTOMER',
      cancelledAt: new Date()
    }
  })

  // Release payment authorization if exists
  await paymentService.cancelAuthorization(loadId)

  // Charge cancellation fee if applicable
  if (fee > 0) {
    await paymentService.chargeCancellationFee(load.shipperId, fee, loadId)
  }

  // Compensate carrier if applicable
  if (carrierCompensation > 0 && load.carrierId) {
    await paymentService.processCancellationPayout(load.carrierId, carrierCompensation, loadId)
  }

  res.json({
    success: true,
    cancellationFee: fee,
    carrierCompensation,
    message: `Load cancelled. ${fee > 0 ? `Cancellation fee: $${fee}` : 'No fee'}`
  })
})

// src/routes/carrier.js
router.post('/loads/:id/cancel', authenticateJWT, async (req, res) => {
  const { reason } = req.body
  const load = await prisma.load.findUnique({ where: { id: loadId } })

  // Calculate time until pickup
  const hoursUntilPickup = (new Date(load.pickupDate) - new Date()) / (1000 * 60 * 60)

  // Determine penalty
  let penalty = 0
  let suspended = false

  if (hoursUntilPickup < 24) {
    penalty = 100 // $100 penalty for late cancellation
  }

  // Track cancellation in carrier profile
  const carrierProfile = await prisma.carrierProfile.findUnique({
    where: { orgId: req.user.orgId }
  })

  const newCancellationCount = (carrierProfile?.cancellationCount || 0) + 1
  const totalLoads = carrierProfile?.loadsCount || 1
  const cancellationRate = newCancellationCount / totalLoads

  // Suspend if >10% cancellation rate
  if (cancellationRate > 0.10) {
    suspended = true
    await prisma.organization.update({
      where: { id: req.user.orgId },
      data: { active: false }
    })
  }

  // Update carrier profile
  await prisma.carrierProfile.update({
    where: { orgId: req.user.orgId },
    data: {
      cancellationCount: newCancellationCount
    }
  })

  // Cancel load
  await prisma.load.update({
    where: { id: loadId },
    data: {
      status: 'CANCELLED',
      cancelledBy: req.user.id,
      cancellationReason: reason,
      cancellationType: 'CARRIER',
      cancelledAt: new Date()
    }
  })

  // Release payment authorization
  await paymentService.cancelAuthorization(loadId)

  // Repost to marketplace
  await prisma.load.update({
    where: { id: loadId },
    data: {
      status: 'POSTED',
      carrierId: null,
      assignedAt: null,
      acceptedAt: null
    }
  })

  res.json({
    success: true,
    penalty,
    suspended,
    cancellationRate: (cancellationRate * 100).toFixed(1) + '%',
    message: suspended 
      ? 'Load cancelled. Account suspended due to high cancellation rate.'
      : 'Load cancelled and reposted to marketplace.'
  })
})
```

**Priority:** HIGH  
**Timeline:** 2 days  
**Effort:** Medium  
**Why:** Prevents abuse from both sides

---

#### **4. Dispute Resolution Workflow** ⭐⭐
**What:** Formal process for TONU disputes, delivery disputes, payment disputes.

**Implementation:**
```javascript
// Add to Prisma schema
model DisputeEvidence {
  id            String   @id @default(uuid())
  loadId        String
  submittedBy   String   // userId
  submitterRole String   // CUSTOMER, CARRIER
  evidenceType  String   // PHOTO, DOCUMENT, TESTIMONY, GPS_TRAIL
  fileUrls      String[] // Array of S3 URLs
  description   String   @db.Text
  timestamp     DateTime @default(now())
  
  load          Load     @relation(fields: [loadId], references: [id])
  
  @@index([loadId])
  @@map("dispute_evidence")
}

model Load {
  // ...existing fields...
  disputeReason       String?   @db.Text
  disputeOpenedAt     DateTime?
  disputeOpenedBy     String?
  disputeResolvedAt   DateTime?
  disputeResolvedBy   String?
  disputeResolution   String?   @db.Text
  disputeWinner       String?   // CUSTOMER, CARRIER, SPLIT
  
  disputeEvidence     DisputeEvidence[]
}

// src/routes/loads.js
router.post('/:id/dispute/open', authenticateJWT, async (req, res) => {
  const { reason, evidenceType, files, description } = req.body

  const load = await prisma.load.findUnique({ where: { id: loadId } })

  // Can only dispute certain statuses
  if (!['TONU', 'DELIVERED', 'COMPLETED'].includes(load.status)) {
    return res.status(400).json({
      error: 'Cannot dispute load in current status',
      code: 'INVALID_STATUS_FOR_DISPUTE'
    })
  }

  // Update load to DISPUTED
  await prisma.load.update({
    where: { id: loadId },
    data: {
      status: 'DISPUTED',
      disputeReason: reason,
      disputeOpenedAt: new Date(),
      disputeOpenedBy: req.user.id
    }
  })

  // Add initial evidence
  await prisma.disputeEvidence.create({
    data: {
      loadId,
      submittedBy: req.user.id,
      submitterRole: req.user.organization.type, // CUSTOMER or CARRIER
      evidenceType,
      fileUrls: files,
      description,
      timestamp: new Date()
    }
  })

  // Hold payment if captured
  // (In real system, would create dispute in Stripe)

  // Notify other party
  const otherPartyId = req.user.organization.type === 'CUSTOMER' 
    ? load.carrierId 
    : load.shipperId
  
  await emailService.sendDisputeNotification(otherPartyId, loadId, reason)

  res.json({
    success: true,
    message: 'Dispute opened. Other party has 48 hours to submit evidence.',
    disputeId: loadId
  })
})

router.post('/:id/dispute/evidence', authenticateJWT, async (req, res) => {
  const { evidenceType, files, description } = req.body

  // Add evidence
  await prisma.disputeEvidence.create({
    data: {
      loadId,
      submittedBy: req.user.id,
      submitterRole: req.user.organization.type,
      evidenceType,
      fileUrls: files,
      description
    }
  })

  res.json({
    success: true,
    message: 'Evidence submitted'
  })
})

router.post('/:id/dispute/resolve', authenticateJWT, requireAdmin, async (req, res) => {
  const { winner, resolution, explanation } = req.body

  const load = await prisma.load.findUnique({
    where: { id: loadId },
    include: { disputeEvidence: true }
  })

  // Update load
  await prisma.load.update({
    where: { id: loadId },
    data: {
      disputeResolvedAt: new Date(),
      disputeResolvedBy: req.user.id,
      disputeResolution: resolution, // CUSTOMER_WINS, CARRIER_WINS, SPLIT
      disputeWinner: winner,
      status: 'COMPLETED'
    }
  })

  // Process payment based on resolution
  if (resolution === 'CUSTOMER_WINS') {
    // Refund customer, no carrier payout
    await paymentService.refundCustomer(loadId)
  } else if (resolution === 'CARRIER_WINS') {
    // Charge customer (if not already), pay carrier
    await paymentService.capturePayment(loadId)
    await paymentService.processPayoutAsync(loadId)
  } else if (resolution === 'SPLIT') {
    // Partial refund to customer, partial payment to carrier
    // (Implement based on negotiated split)
  }

  // Notify both parties
  await emailService.sendDisputeResolution(load.shipperId, loadId, resolution, explanation)
  await emailService.sendDisputeResolution(load.carrierId, loadId, resolution, explanation)

  res.json({
    success: true,
    resolution,
    message: 'Dispute resolved'
  })
})

// Auto-escalate disputes after 72 hours
cron.schedule('0 0 * * *', async () => {
  const staleDisputes = await prisma.load.findMany({
    where: {
      status: 'DISPUTED',
      disputeOpenedAt: {
        lt: new Date(Date.now() - 72 * 60 * 60 * 1000)
      },
      disputeResolvedAt: null
    }
  })

  for (const load of staleDisputes) {
    // Escalate to admin for manual review
    await emailService.sendDisputeEscalation(load.id)
  }
})
```

**Priority:** HIGH  
**Timeline:** 2-3 days  
**Effort:** Medium  
**Why:** Inevitable conflicts need formal process

---

### **Week 3: Document Generation**

#### **5. BOL/POD/Rate Confirmation PDFs** ⭐⭐

**Install:**
```bash
npm install pdfkit
```

**Implementation:**
```javascript
// src/services/documentService.js
const PDFDocument = require('pdfkit')
const fs = require('fs')
const path = require('path')

async function generateBOL(loadId) {
  const load = await prisma.load.findUnique({
    where: { id: loadId },
    include: {
      shipper: true,
      carrier: true
    }
  })

  const doc = new PDFDocument({ margin: 50 })
  const filePath = path.join(__dirname, '../../documents', `bol_${loadId}.pdf`)
  
  // Pipe to file
  doc.pipe(fs.createWriteStream(filePath))

  // Header
  doc.fontSize(20).text('BILL OF LADING', { align: 'center' })
  doc.moveDown()
  
  // BOL Number & Date
  doc.fontSize(10)
  doc.text(`BOL #: ${loadId}`, 50, 100)
  doc.text(`Release #: ${load.releaseNumber}`, 50, 115)
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 50, 130)

  // Broker Info
  doc.moveDown()
  doc.fontSize(12).text('BROKER:', 50, 160)
  doc.fontSize(10)
  doc.text('Superior One Logistics', 50, 180)
  doc.text('MC #: [YOUR MC NUMBER HERE]', 50, 195)
  doc.text('Phone: (512) 555-XXXX', 50, 210)

  // Shipper Info
  doc.fontSize(12).text('SHIPPER:', 300, 160)
  doc.fontSize(10)
  doc.text(load.shipper.name, 300, 180)
  doc.text(load.origin.address, 300, 195)
  doc.text(`${load.origin.city}, ${load.origin.state} ${load.origin.zip}`, 300, 210)

  // Carrier Info
  doc.fontSize(12).text('CARRIER:', 50, 250)
  doc.fontSize(10)
  doc.text(load.carrier.name, 50, 270)
  doc.text(`MC #: ${load.carrier.mcNumber || 'N/A'}`, 50, 285)
  doc.text(`Driver: ${load.driver?.name || 'TBD'}`, 50, 300)
  doc.text(`Truck #: ${load.truckNumber || 'TBD'}`, 50, 315)

  // Consignee Info
  doc.fontSize(12).text('CONSIGNEE:', 300, 250)
  doc.fontSize(10)
  doc.text(load.destination.siteName || 'Delivery Site', 300, 270)
  doc.text(load.destination.address, 300, 285)
  doc.text(`${load.destination.city}, ${load.destination.state} ${load.destination.zip}`, 300, 300)

  // Commodity Details
  doc.fontSize(12).text('COMMODITY INFORMATION:', 50, 360)
  doc.fontSize(10)
  doc.text(`Description: ${load.commodity}`, 50, 380)
  doc.text(`Quantity: ${load.units} ${load.rateMode.replace('PER_', '').toLowerCase()}`, 50, 395)
  doc.text(`Weight: To be determined at pickup`, 50, 410)
  doc.text(`Equipment Type: ${load.equipmentType}`, 50, 425)

  // Special Instructions
  if (load.releaseNotes || load.specialInstructions) {
    doc.fontSize(12).text('SPECIAL INSTRUCTIONS:', 50, 460)
    doc.fontSize(10)
    doc.text(load.releaseNotes || load.specialInstructions || '', 50, 480, { width: 500 })
  }

  // Signatures
  doc.fontSize(10)
  doc.text('SHIPPER SIGNATURE:', 50, 600)
  doc.text('_______________________________', 50, 620)
  doc.text('Name:', 50, 640)
  doc.text('Date:', 50, 655)

  doc.text('DRIVER SIGNATURE:', 300, 600)
  doc.text('_______________________________', 300, 620)
  doc.text('Name:', 300, 640)
  doc.text('Date:', 300, 655)

  // Footer
  doc.fontSize(8).text(
    'This Bill of Lading is subject to terms and conditions available at superiorone.com/terms',
    50,
    720,
    { align: 'center', width: 500 }
  )

  doc.end()

  return filePath
}

async function generatePODTemplate(loadId) {
  const load = await prisma.load.findUnique({
    where: { id: loadId },
    include: { shipper: true, carrier: true }
  })

  const doc = new PDFDocument({ margin: 50 })
  const filePath = path.join(__dirname, '../../documents', `pod_template_${loadId}.pdf`)
  
  doc.pipe(fs.createWriteStream(filePath))

  // Header
  doc.fontSize(20).text('PROOF OF DELIVERY', { align: 'center' })
  doc.moveDown()
  
  doc.fontSize(10)
  doc.text(`Load #: ${loadId}`, 50, 100)
  doc.text(`BOL #: ${loadId}`, 50, 115)
  doc.text(`Date: __________________`, 50, 130)

  // Load Details
  doc.fontSize(12).text('LOAD INFORMATION:', 50, 160)
  doc.fontSize(10)
  doc.text(`Commodity: ${load.commodity}`, 50, 180)
  doc.text(`Expected Quantity: ${load.units} ${load.rateMode.replace('PER_', '').toLowerCase()}`, 50, 195)
  doc.text(`Delivered From: ${load.origin.city}, ${load.origin.state}`, 50, 210)
  doc.text(`Delivered To: ${load.destination.city}, ${load.destination.state}`, 50, 225)

  // Delivery Verification
  doc.fontSize(12).text('DELIVERY VERIFICATION:', 50, 260)
  doc.fontSize(10)
  doc.text('Actual Quantity Delivered: __________________', 50, 280)
  doc.text('Condition of Material (Good/Damaged): __________________', 50, 300)
  doc.text('Delivery Time: __________________', 50, 320)
  doc.text('Receiver Name (Print): __________________', 50, 340)

  // Receiver Signature
  doc.fontSize(12).text('RECEIVER SIGNATURE:', 50, 380)
  doc.text('_______________________________', 50, 400)
  doc.fontSize(10)
  doc.text('By signing, I confirm receipt of material as described above', 50, 425)

  // Photos
  doc.fontSize(10)
  doc.text('PHOTOS REQUIRED:', 50, 460)
  doc.text('☐ Photo of delivered material', 50, 480)
  doc.text('☐ Photo of truck at delivery site', 50, 495)
  doc.text('☐ Photo of signed POD', 50, 510)

  doc.end()

  return filePath
}

async function generateRateConfirmation(loadId) {
  const load = await prisma.load.findUnique({
    where: { id: loadId },
    include: { shipper: true, carrier: true }
  })

  const doc = new PDFDocument({ margin: 50 })
  const filePath = path.join(__dirname, '../../documents', `rate_con_${loadId}.pdf`)
  
  doc.pipe(fs.createWriteStream(filePath))

  // Header
  doc.fontSize(20).text('RATE CONFIRMATION', { align: 'center' })
  doc.moveDown()

  // Confirmation Number & Date
  doc.fontSize(10)
  doc.text(`Confirmation #: ${loadId}`, 50, 100)
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 50, 115)

  // Broker Info
  doc.fontSize(12).text('BROKER:', 50, 150)
  doc.fontSize(10)
  doc.text('Superior One Logistics', 50, 170)
  doc.text('MC #: [YOUR MC NUMBER]', 50, 185)
  doc.text('Phone: (512) 555-XXXX', 50, 200)
  doc.text('Email: dispatch@superiorone.com', 50, 215)

  // Carrier Info
  doc.fontSize(12).text('CARRIER:', 300, 150)
  doc.fontSize(10)
  doc.text(load.carrier.name, 300, 170)
  doc.text(`MC #: ${load.carrier.mcNumber || 'N/A'}`, 300, 185)
  doc.text(`DOT #: ${load.carrier.dotNumber || 'N/A'}`, 300, 200)
  doc.text(`Contact: ${load.carrier.contactPhone}`, 300, 215)

  // Load Details
  doc.fontSize(12).text('LOAD DETAILS:', 50, 260)
  doc.fontSize(10)
  doc.text(`Commodity: ${load.commodity}`, 50, 280)
  doc.text(`Quantity: ${load.units} ${load.rateMode.replace('PER_', '').toLowerCase()}`, 50, 295)
  doc.text(`Equipment: ${load.equipmentType}`, 50, 310)
  doc.text(`Miles: ${load.miles}`, 50, 325)

  // Pickup
  doc.fontSize(12).text('PICKUP:', 50, 360)
  doc.fontSize(10)
  doc.text(load.origin.siteName || load.origin.address, 50, 380)
  doc.text(`${load.origin.city}, ${load.origin.state} ${load.origin.zip}`, 50, 395)
  doc.text(`Date: ${new Date(load.pickupDate).toLocaleDateString()}`, 50, 410)

  // Delivery
  doc.fontSize(12).text('DELIVERY:', 300, 360)
  doc.fontSize(10)
  doc.text(load.destination.siteName || load.destination.address, 300, 380)
  doc.text(`${load.destination.city}, ${load.destination.state} ${load.destination.zip}`, 300, 395)
  doc.text(`Date: ${new Date(load.deliveryDate).toLocaleDateString()}`, 300, 410)

  // Rate & Payment
  doc.fontSize(14).text('RATE & PAYMENT TERMS:', 50, 450)
  doc.fontSize(12)
  doc.text(`Rate: $${load.rate} per ${load.rateMode.replace('PER_', '').toLowerCase()}`, 50, 475)
  doc.text(`Total Amount: $${load.grossRevenue}`, 50, 495, { underline: true })
  
  doc.fontSize(10)
  doc.text('Payment Terms:', 50, 520)
  doc.text('  • Standard: Net-7 (Payment within 7 days of delivery)', 50, 535)
  doc.text('  • QuickPay: Net-3 (Payment within 3 days, 3% fee)', 50, 550)

  // Terms & Conditions
  doc.fontSize(10).text('TERMS & CONDITIONS:', 50, 590)
  doc.fontSize(8)
  doc.text('1. Carrier agrees to transport commodity as described above', 50, 610, { width: 500 })
  doc.text('2. Carrier confirms proper insurance and authority', 50, 625, { width: 500 })
  doc.text('3. Carrier will not re-broker this load', 50, 640, { width: 500 })
  doc.text('4. All loads subject to broker-carrier agreement terms', 50, 655, { width: 500 })

  // Signature
  doc.fontSize(10).text('CARRIER ACCEPTANCE:', 50, 690)
  doc.text('_______________________________', 50, 710)
  doc.text('Authorized Signature', 50, 730)
  doc.text('Date: __________________', 50, 745)

  doc.end()

  return filePath
}

module.exports = {
  generateBOL,
  generatePODTemplate,
  generateRateConfirmation
}
```

**Wire into workflows:**
```javascript
// When status → RELEASED, generate BOL
if (status === 'RELEASED') {
  const bolPath = await documentService.generateBOL(loadId)
  await prisma.load.update({
    where: { id: loadId },
    data: { bolDocumentUrl: bolPath }
  })
}

// When carrier accepts, generate rate confirmation
if (status === 'ACCEPTED') {
  const rateConPath = await documentService.generateRateConfirmation(loadId)
  await prisma.load.update({
    where: { id: loadId },
    data: { rateConDocumentUrl: rateConPath }
  })
}
```

**Priority:** HIGH  
**Timeline:** 2 days  
**Effort:** Medium  
**Why:** Professional appearance, legal compliance

---

### **Week 4: Fraud Prevention**

#### **6. Require TONU Photo Evidence** ⭐⭐

**Frontend:**
```typescript
// web/src/components/TonuFilingModal.tsx
const [photos, setPhotos] = useState<File[]>([])

<div className="photo-evidence-section">
  <label className="required">Photo Evidence (Required)</label>
  <input
    type="file"
    accept="image/*"
    multiple
    required
    onChange={(e) => setPhotos(Array.from(e.target.files || []))}
  />
  <p className="help-text">
    Required: Photos showing you arrived at site and material not ready.
    Timestamp must be visible.
  </p>
  
  {photos.length > 0 && (
    <div className="photo-previews">
      {photos.map((photo, i) => (
        <img key={i} src={URL.createObjectURL(photo)} alt={`Evidence ${i+1}`} />
      ))}
    </div>
  )}
</div>

// In submit handler
if (photos.length === 0) {
  alert('Photo evidence is required to file TONU')
  return
}

// Upload photos to S3/storage
const photoUrls = await uploadPhotos(photos)

await carrierAPI.fileTonu(load.id, {
  reason,
  arrivalTime,
  waitTime,
  evidence: photoUrls // Now required
})
```

**Backend:**
```javascript
// src/routes/carrier.js - POST /loads/:id/tonu
router.post('/loads/:id/tonu', authenticateJWT, async (req, res) => {
  const { reason, arrivalTime, waitTime, evidence } = req.body

  // REQUIRE photo evidence
  if (!evidence || evidence.length === 0) {
    return res.status(400).json({
      error: 'Photo evidence is required to file TONU',
      code: 'TONU_EVIDENCE_REQUIRED'
    })
  }

  // Validate GPS trail
  const gpsEvents = await prisma.geoEvent.findMany({
    where: {
      loadId,
      timestamp: {
        gte: new Date(arrivalTime),
        lte: new Date()
      }
    },
    orderBy: { timestamp: 'asc' }
  })

  if (gpsEvents.length === 0) {
    return res.status(400).json({
      error: 'No GPS record showing arrival at pickup location',
      code: 'NO_GPS_TRAIL'
    })
  }

  // Calculate time at location
  const firstPing = new Date(gpsEvents[0].timestamp)
  const lastPing = new Date(gpsEvents[gpsEvents.length - 1].timestamp)
  const minutesAtLocation = (lastPing - firstPing) / (1000 * 60)

  if (minutesAtLocation < 15) {
    return res.status(400).json({
      error: 'Must wait at least 15 minutes at location before filing TONU',
      code: 'INSUFFICIENT_WAIT_TIME',
      actualWaitTime: minutesAtLocation
    })
  }

  // Validate proximity to pickup location
  const pickupLocation = load.origin
  const carrierLocation = {
    lat: gpsEvents[0].latitude,
    lng: gpsEvents[0].longitude
  }
  
  const distance = calculateDistance(pickupLocation, carrierLocation)
  
  if (distance > 0.5) { // More than 0.5 miles away
    return res.status(400).json({
      error: 'GPS shows you were not at the pickup location',
      code: 'LOCATION_MISMATCH',
      distance: `${distance.toFixed(2)} miles from pickup`
    })
  }

  // All validations passed - file TONU
  const tonuLoad = await releaseService.fileTonu(loadId, req.user.id, {
    reason,
    arrivalTime,
    waitTime,
    evidence
  })

  res.json({
    success: true,
    load: tonuLoad,
    compensation: 150,
    message: 'TONU filed successfully. Evidence will be reviewed.'
  })
})
```

**Priority:** HIGH  
**Timeline:** 1 day  
**Effort:** Low  
**Why:** Prevents carrier fraud

---

## 🎯 **30-DAY SOFTWARE PERFECTION ROADMAP**

### **Week 1: Payment Safety**
- [ ] Day 1-3: Implement payment escrow (authorize/capture)
- [ ] Day 4-5: Add PENDING_APPROVAL status for POD review
- [ ] Day 6-7: Auto-approval cron job after 48 hours

### **Week 2: Cancellations & Disputes**
- [ ] Day 8-9: Customer cancellation with fees
- [ ] Day 10-11: Carrier cancellation with penalties
- [ ] Day 12-14: Dispute workflow (open, evidence, resolve)

### **Week 3: Document Generation**
- [ ] Day 15-16: BOL PDF generation
- [ ] Day 17-18: POD template generation
- [ ] Day 19-20: Rate confirmation generation
- [ ] Day 21: Wire documents into workflows

### **Week 4: Fraud Prevention & Testing**
- [ ] Day 22-23: Require TONU photo evidence + GPS validation
- [ ] Day 24-25: Partial delivery variance handling
- [ ] Day 26-27: Insurance re-checks during load lifecycle
- [ ] Day 28-30: End-to-end testing all workflows

---

## ✅ **WHAT YOU DON'T NEED**

Claude mentioned these - **you can skip for now:**
- ❌ 24/7 emergency support (launch with email first)
- ❌ Detention auto-tracking (manual for v1)
- ❌ Multi-stop loads (schema supports it, add UI later)
- ❌ 1-minute GPS pings (5min is fine)
- ❌ Load expiration (nice to have)
- ❌ Advanced reporting (post-launch)

---

## 🎯 **BOTTOM LINE**

### **Focus on these 6 critical workflow fixes:**
1. ✅ Payment escrow (2-3 days)
2. ✅ POD review before payment (1 day)
3. ✅ Cancellation fees (2 days)
4. ✅ Dispute resolution (2-3 days)
5. ✅ Document generation (2 days)
6. ✅ TONU fraud prevention (1 day)

**Total: ~12 days of focused work**

### **After 30 days:**
- ✅ Software workflows perfected
- ✅ Ready for real user testing (with test accounts)
- ✅ Can apply for MC# when ready to launch for real

**Then:** Get MC#, do final legal docs, launch to real customers.

**Smart approach: Perfect the software first, avoid MC# application fees until you're 100% ready.**

