const { prisma } = require('../db/prisma');

/**
 * Performance Scoring Service
 * Calculates carrier reputation scores and tier assignments
 */

// Scoring weights
const WEIGHTS = {
  onTime: 0.30,       // 30% - On-time delivery
  docAccuracy: 0.20,  // 20% - Document accuracy
  communication: 0.15, // 15% - Response time
  compliance: 0.20,    // 20% - Insurance/FMCSA compliance
  customerRating: 0.15 // 15% - Customer feedback
};

// Tier thresholds
const TIERS = {
  GOLD: 90,
  SILVER: 75,
  BRONZE: 60
};

/**
 * Calculate composite performance score (0-100)
 * @param {Object} metrics - Individual metric scores (0-1 scale)
 * @returns {number} Composite score (0-100)
 */
function calculateCompositeScore(metrics) {
  const {
    onTime = 0.5,
    docAccuracy = 0.5,
    communication = 0.5,
    compliance = 0.5,
    customerRating = 0.5
  } = metrics;

  const raw = 100 * (
    WEIGHTS.onTime * onTime +
    WEIGHTS.docAccuracy * docAccuracy +
    WEIGHTS.communication * communication +
    WEIGHTS.compliance * compliance +
    WEIGHTS.customerRating * customerRating
  );

  return Math.round(Math.max(0, Math.min(raw, 100)));
}

/**
 * Determine tier based on score
 * @param {number} score - Composite score (0-100)
 * @returns {string} Tier (GOLD, SILVER, BRONZE)
 */
function determineTier(score) {
  if (score >= TIERS.GOLD) return 'GOLD';
  if (score >= TIERS.SILVER) return 'SILVER';
  if (score >= TIERS.BRONZE) return 'BRONZE';
  return 'BRONZE'; // Minimum tier
}

/**
 * Calculate on-time delivery rate
 * @param {string} carrierId - Carrier organization ID
 * @returns {Promise<number>} On-time rate (0-1)
 */
async function calculateOnTimeRate(carrierId) {
  const loads = await prisma.load.findMany({
    where: {
      carrierId,
      status: 'COMPLETED',
      completedAt: { not: null },
      deliveryDate: { not: null }
    },
    select: {
      completedAt: true,
      deliveryDate: true,
      deliveryEta: true
    },
    take: 50, // Last 50 loads
    orderBy: { completedAt: 'desc' }
  });

  if (loads.length === 0) return 0.5; // Default for new carriers

  let onTimeCount = 0;

  for (const load of loads) {
    const scheduledDate = load.deliveryEta || load.deliveryDate;
    const actualDate = load.completedAt;

    // Grace period: within 30 minutes
    const diffMinutes = (new Date(actualDate) - new Date(scheduledDate)) / (1000 * 60);
    
    if (diffMinutes <= 30) {
      onTimeCount++;
    }
  }

  return onTimeCount / loads.length;
}

/**
 * Calculate document accuracy rate
 * @param {string} carrierId - Carrier organization ID
 * @returns {Promise<number>} Document accuracy rate (0-1)
 */
async function calculateDocAccuracyRate(carrierId) {
  const loads = await prisma.load.findMany({
    where: {
      carrierId,
      status: 'COMPLETED'
    },
    include: {
      documents: {
        where: {
          type: { in: ['BOL', 'POD', 'SCALE_TICKET'] }
        }
      },
      scaleTickets: true
    },
    take: 50,
    orderBy: { completedAt: 'desc' }
  });

  if (loads.length === 0) return 0.5;

  let accurateCount = 0;

  for (const load of loads) {
    // Check if required documents present
    const hasBOL = load.documents.some(d => d.type === 'BOL');
    const hasPOD = load.documents.some(d => d.type === 'POD');
    const needsScaleTicket = load.notes?.includes('Scale ticket required');
    const hasScaleTicket = load.scaleTickets.length > 0;

    if (hasBOL && hasPOD && (!needsScaleTicket || hasScaleTicket)) {
      accurateCount++;
    }
  }

  return accurateCount / loads.length;
}

/**
 * Calculate compliance score
 * @param {string} carrierId - Carrier organization ID
 * @returns {Promise<number>} Compliance score (0-1)
 */
async function calculateComplianceScore(carrierId) {
  const org = await prisma.organization.findUnique({
    where: { id: carrierId },
    include: {
      insurance: {
        where: { active: true }
      }
    }
  });

  if (!org) return 0;

  let score = 0;
  let checks = 0;

  // FMCSA verification (25%)
  if (org.fmcsaVerified && org.fmcsaStatus === 'ACTIVE') {
    score += 0.25;
  }
  checks++;

  // Safety rating (25%)
  if (org.fmcsaSafetyRating === 'SATISFACTORY' || org.fmcsaSafetyRating === 'NOT_RATED') {
    score += 0.25;
  }
  checks++;

  // Insurance coverage (50%)
  const cargoInsurance = org.insurance.find(i => i.type === 'cargo');
  const liabilityInsurance = org.insurance.find(i => i.type === 'liability');

  if (cargoInsurance && !isExpired(cargoInsurance.expiryDate)) {
    score += 0.25;
  }
  checks++;

  if (liabilityInsurance && !isExpired(liabilityInsurance.expiryDate)) {
    score += 0.25;
  }
  checks++;

  return checks > 0 ? score : 0.5;
}

function isExpired(expiryDate) {
  return new Date(expiryDate) < new Date();
}

/**
 * Update carrier performance profile
 * @param {string} carrierId - Carrier organization ID
 * @returns {Promise<Object>} Updated profile
 */
async function updateCarrierPerformance(carrierId) {
  // Calculate individual metrics
  const onTimeRate = await calculateOnTimeRate(carrierId);
  const docAccuracyRate = await calculateDocAccuracyRate(carrierId);
  const complianceScore = await calculateComplianceScore(carrierId);
  
  // Communication and customer rating would come from other sources
  // For now, use defaults
  const communication = 0.75; // Default
  const customerRating = 0.80; // Default

  // Calculate composite score
  const reputationScore = calculateCompositeScore({
    onTime: onTimeRate,
    docAccuracy: docAccuracyRate,
    communication,
    compliance: complianceScore,
    customerRating
  });

  // Determine tier
  const tier = determineTier(reputationScore);

  // Count completed loads
  const loadsCount = await prisma.load.count({
    where: {
      carrierId,
      status: 'COMPLETED'
    }
  });

  // Update or create carrier profile
  const profile = await prisma.carrierProfile.upsert({
    where: { organizationId: carrierId },
    create: {
      organizationId: carrierId,
      onTimeRate,
      docAccuracyRate,
      reputationScore,
      tier
    },
    update: {
      onTimeRate,
      docAccuracyRate,
      reputationScore,
      tier
    }
  });

  return {
    profile,
    metrics: {
      onTimeRate,
      docAccuracyRate,
      communication,
      complianceScore,
      customerRating,
      loadsCount
    },
    tier,
    score: reputationScore
  };
}

/**
 * Get carrier performance profile
 * @param {string} carrierId - Carrier organization ID
 * @returns {Promise<Object>} Performance profile
 */
async function getCarrierPerformance(carrierId) {
  const profile = await prisma.carrierProfile.findUnique({
    where: { organizationId: carrierId }
  });

  if (!profile) {
    // Create initial profile
    return await updateCarrierPerformance(carrierId);
  }

  return {
    profile,
    tier: profile.tier,
    score: profile.reputationScore
  };
}

/**
 * Batch update all carrier performances (background job)
 * @returns {Promise<Object>} Update results
 */
async function batchUpdatePerformances() {
  const carriers = await prisma.organization.findMany({
    where: {
      type: { in: ['CARRIER', 'BOTH'] },
      active: true
    },
    select: { id: true, name: true }
  });

  const results = {
    total: carriers.length,
    updated: 0,
    errors: []
  };

  for (const carrier of carriers) {
    try {
      await updateCarrierPerformance(carrier.id);
      results.updated++;
    } catch (error) {
      results.errors.push({
        carrierId: carrier.id,
        error: error.message
      });
    }
  }

  return results;
}

module.exports = {
  calculateCompositeScore,
  determineTier,
  calculateOnTimeRate,
  calculateDocAccuracyRate,
  calculateComplianceScore,
  updateCarrierPerformance,
  getCarrierPerformance,
  batchUpdatePerformances,
  WEIGHTS,
  TIERS
};

