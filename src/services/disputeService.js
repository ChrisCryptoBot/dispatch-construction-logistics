const { prisma } = require('../db/prisma');

/**
 * Dispute Service
 * Handles dispute resolution workflow for loads
 * Supports disputes from both customers and carriers
 */

/**
 * Open a dispute on a load
 * @param {string} loadId - Load ID
 * @param {string} userId - User opening the dispute
 * @param {string} userRole - CUSTOMER or CARRIER
 * @param {Object} disputeData - Dispute details
 * @returns {Promise<Object>} Updated load with dispute info
 */
async function openDispute(loadId, userId, userRole, disputeData) {
  const { reason, description, requestedResolution } = disputeData;

  const load = await prisma.load.findUnique({
    where: { id: loadId },
    include: {
      shipper: { select: { id: true, name: true, email: true } },
      carrier: { select: { id: true, name: true, email: true } }
    }
  });

  if (!load) {
    throw new Error('LOAD_NOT_FOUND');
  }

  // Can only dispute loads that are DELIVERED, COMPLETED, or TONU
  if (!['DELIVERED', 'COMPLETED', 'TONU'].includes(load.status)) {
    throw new Error('INVALID_STATUS');
  }

  // Check if dispute already open
  if (load.disputeOpenedAt && !load.disputeResolvedAt) {
    throw new Error('DISPUTE_ALREADY_OPEN');
  }

  const updatedLoad = await prisma.load.update({
    where: { id: loadId },
    data: {
      status: 'DISPUTED',
      disputeReason: reason,
      disputeOpenedAt: new Date(),
      disputeOpenedBy: userId,
      internalNotes: load.internalNotes
        ? `${load.internalNotes}\n\n[DISPUTE] ${userRole}: ${description || reason}`
        : `[DISPUTE] ${userRole}: ${description || reason}`
    },
    include: {
      shipper: { select: { id: true, name: true, email: true } },
      carrier: { select: { id: true, name: true, email: true } }
    }
  });

  // TODO: Send email notification to both parties
  // TODO: Create admin notification for dispute review

  return {
    load: updatedLoad,
    disputeId: updatedLoad.id,
    openedBy: userRole,
    requestedResolution: requestedResolution || null
  };
}

/**
 * Submit evidence for a dispute
 * @param {string} loadId - Load ID
 * @param {string} userId - User submitting evidence
 * @param {string} userRole - CUSTOMER or CARRIER
 * @param {Object} evidenceData - Evidence details
 * @returns {Promise<Object>} Created evidence record
 */
async function submitEvidence(loadId, userId, userRole, evidenceData) {
  const { evidenceType, fileUrls, description } = evidenceData;

  const load = await prisma.load.findUnique({
    where: { id: loadId }
  });

  if (!load) {
    throw new Error('LOAD_NOT_FOUND');
  }

  // Must have open dispute
  if (!load.disputeOpenedAt || load.disputeResolvedAt) {
    throw new Error('NO_ACTIVE_DISPUTE');
  }

  const evidence = await prisma.disputeEvidence.create({
    data: {
      loadId,
      submittedBy: userId,
      submitterRole: userRole,
      evidenceType,
      fileUrls: fileUrls || [],
      description
    }
  });

  return evidence;
}

/**
 * Resolve a dispute (admin function)
 * @param {string} loadId - Load ID
 * @param {string} adminId - Admin user ID
 * @param {Object} resolutionData - Resolution details
 * @returns {Promise<Object>} Updated load with resolution
 */
async function resolveDispute(loadId, adminId, resolutionData) {
  const { resolution, winner, notes, financialAdjustment } = resolutionData;

  const load = await prisma.load.findUnique({
    where: { id: loadId },
    include: {
      shipper: { select: { id: true, name: true, email: true } },
      carrier: { select: { id: true, name: true, email: true } }
    }
  });

  if (!load) {
    throw new Error('LOAD_NOT_FOUND');
  }

  // Must have open dispute
  if (!load.disputeOpenedAt || load.disputeResolvedAt) {
    throw new Error('NO_ACTIVE_DISPUTE');
  }

  // Validate resolution
  if (!['CUSTOMER_WINS', 'CARRIER_WINS', 'SPLIT', 'NO_FAULT'].includes(resolution)) {
    throw new Error('INVALID_RESOLUTION');
  }

  // Determine final status based on original status
  let finalStatus = 'COMPLETED';
  if (load.status === 'TONU' || resolution === 'CARRIER_WINS') {
    finalStatus = 'TONU';
  }

  const updatedLoad = await prisma.load.update({
    where: { id: loadId },
    data: {
      status: finalStatus,
      disputeResolvedAt: new Date(),
      disputeResolvedBy: adminId,
      disputeResolution: resolution,
      disputeWinner: winner,
      internalNotes: load.internalNotes
        ? `${load.internalNotes}\n\n[RESOLUTION] ${resolution}: ${notes}`
        : `[RESOLUTION] ${resolution}: ${notes}`
    },
    include: {
      shipper: { select: { id: true, name: true, email: true } },
      carrier: { select: { id: true, name: true, email: true } }
    }
  });

  // Handle financial adjustments if needed
  if (financialAdjustment && financialAdjustment.amount) {
    // TODO: Create refund/adjustment record
    // TODO: Process payment adjustment through Stripe
  }

  // TODO: Send resolution notification to both parties
  // TODO: Update carrier reputation score if applicable

  return {
    load: updatedLoad,
    resolution,
    financialAdjustment: financialAdjustment || null
  };
}

/**
 * Get all evidence for a dispute
 * @param {string} loadId - Load ID
 * @returns {Promise<Array>} Evidence records
 */
async function getDisputeEvidence(loadId) {
  const evidence = await prisma.disputeEvidence.findMany({
    where: { loadId },
    orderBy: { timestamp: 'asc' }
  });

  return evidence;
}

/**
 * Get all open disputes (admin function)
 * @returns {Promise<Array>} Loads with open disputes
 */
async function getOpenDisputes() {
  const disputes = await prisma.load.findMany({
    where: {
      status: 'DISPUTED',
      disputeOpenedAt: { not: null },
      disputeResolvedAt: null
    },
    include: {
      shipper: { select: { id: true, name: true, email: true } },
      carrier: { select: { id: true, name: true, email: true } }
    },
    orderBy: { disputeOpenedAt: 'asc' }
  });

  return disputes;
}

/**
 * Calculate recommended resolution based on evidence
 * @param {string} loadId - Load ID
 * @returns {Promise<Object>} Recommendation
 */
async function calculateRecommendation(loadId) {
  const load = await prisma.load.findUnique({
    where: { id: loadId }
  });

  if (!load) {
    throw new Error('LOAD_NOT_FOUND');
  }

  const evidence = await getDisputeEvidence(loadId);

  // Simple heuristic-based recommendation
  // In production, this could use ML or more complex rules

  const customerEvidence = evidence.filter(e => e.submitterRole === 'CUSTOMER');
  const carrierEvidence = evidence.filter(e => e.submitterRole === 'CARRIER');

  let recommendation = {
    resolution: 'SPLIT',
    confidence: 'LOW',
    reasoning: 'Insufficient evidence from both parties'
  };

  // GPS evidence is strong
  const gpsEvidence = evidence.filter(e => e.evidenceType === 'GPS_TRAIL');
  if (gpsEvidence.length > 0) {
    const gpsSubmitter = gpsEvidence[0].submitterRole;
    recommendation = {
      resolution: gpsSubmitter === 'CARRIER' ? 'CARRIER_WINS' : 'CUSTOMER_WINS',
      confidence: 'HIGH',
      reasoning: 'GPS evidence strongly supports ' + gpsSubmitter.toLowerCase()
    };
  }

  // Photos are moderate evidence
  const photoEvidence = evidence.filter(e => e.evidenceType === 'PHOTO');
  if (photoEvidence.length > 3 && gpsEvidence.length === 0) {
    const photoSubmitter = photoEvidence[0].submitterRole;
    recommendation = {
      resolution: photoSubmitter === 'CARRIER' ? 'CARRIER_WINS' : 'CUSTOMER_WINS',
      confidence: 'MEDIUM',
      reasoning: 'Multiple photo evidence supports ' + photoSubmitter.toLowerCase()
    };
  }

  // TONU cases with no evidence favor carrier
  if (load.tonuFiled && evidence.length === 0) {
    recommendation = {
      resolution: 'CARRIER_WINS',
      confidence: 'MEDIUM',
      reasoning: 'TONU filed with no customer counter-evidence'
    };
  }

  return {
    ...recommendation,
    evidenceSummary: {
      total: evidence.length,
      customer: customerEvidence.length,
      carrier: carrierEvidence.length,
      gps: gpsEvidence.length,
      photos: photoEvidence.length
    }
  };
}

module.exports = {
  openDispute,
  submitEvidence,
  resolveDispute,
  getDisputeEvidence,
  getOpenDisputes,
  calculateRecommendation
};
