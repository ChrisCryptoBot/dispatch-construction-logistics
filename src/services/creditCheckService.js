const { prisma } = require('../db/prisma');

/**
 * Credit Check & Risk Management Service
 * Manages customer credit limits and payment risk
 */

const DEFAULT_CREDIT_LIMIT_CENTS = parseInt(process.env.DEFAULT_CREDIT_LIMIT || '0'); // $0 = prepay only
const MIN_LOADS_FOR_CREDIT = 5; // Need 5 paid loads before extending credit

/**
 * Initialize credit profile for new customer
 * @param {string} customerId - Customer user ID
 * @returns {Promise<Object>} Credit profile
 */
async function initializeCreditProfile(customerId) {
  const existing = await prisma.creditProfile.findUnique({
    where: { customerId }
  });

  if (existing) {
    return existing;
  }

  const profile = await prisma.creditProfile.create({
    data: {
      customerId,
      achStatus: 'pending',
      riskLimitCents: BigInt(DEFAULT_CREDIT_LIMIT_CENTS),
      currentExposureCents: BigInt(0)
    }
  });

  return profile;
}

/**
 * Check if customer can post load (credit limit check)
 * @param {string} orgId - Customer organization ID
 * @param {number} loadValueCents - Load value in cents
 * @returns {Promise<Object>} Authorization result
 */
async function canPostLoad(orgId, loadValueCents) {
  // Get customer's primary user (admin)
  const user = await prisma.user.findFirst({
    where: {
      orgId,
      role: 'admin'
    },
    include: {
      creditProfile: true
    }
  });

  if (!user) {
    throw new Error('CUSTOMER_NOT_FOUND');
  }

  // Initialize credit profile if doesn't exist
  let profile = user.creditProfile;
  if (!profile) {
    profile = await initializeCreditProfile(user.id);
  }

  const riskLimit = Number(profile.riskLimitCents);
  const currentExposure = Number(profile.currentExposureCents);
  const newExposure = currentExposure + loadValueCents;

  // Check if exceeds limit
  if (newExposure > riskLimit) {
    return {
      authorized: false,
      reason: 'CREDIT_LIMIT_EXCEEDED',
      currentExposure: (currentExposure / 100).toFixed(2),
      creditLimit: (riskLimit / 100).toFixed(2),
      requestedAmount: (loadValueCents / 100).toFixed(2),
      shortfall: ((newExposure - riskLimit) / 100).toFixed(2),
      requiresPrepayment: true
    };
  }

  // Check ACH status
  if (profile.achStatus !== 'verified' && riskLimit > 0) {
    return {
      authorized: false,
      reason: 'ACH_NOT_VERIFIED',
      message: 'Please verify your bank account before posting loads on credit',
      requiresPrepayment: true
    };
  }

  return {
    authorized: true,
    currentExposure: (currentExposure / 100).toFixed(2),
    creditLimit: (riskLimit / 100).toFixed(2),
    availableCredit: ((riskLimit - currentExposure) / 100).toFixed(2)
  };
}

/**
 * Add to customer exposure when load posted
 * @param {string} orgId - Customer organization ID
 * @param {number} loadValueCents - Load value in cents
 * @returns {Promise<Object>} Updated profile
 */
async function addExposure(orgId, loadValueCents) {
  const user = await prisma.user.findFirst({
    where: { orgId, role: 'admin' },
    include: { creditProfile: true }
  });

  if (!user?.creditProfile) {
    throw new Error('CREDIT_PROFILE_NOT_FOUND');
  }

  const updated = await prisma.creditProfile.update({
    where: { customerId: user.id },
    data: {
      currentExposureCents: {
        increment: BigInt(loadValueCents)
      }
    }
  });

  return updated;
}

/**
 * Reduce exposure when payment received
 * @param {string} customerId - Customer user ID
 * @param {number} amountCents - Payment amount in cents
 * @returns {Promise<Object>} Updated profile
 */
async function reduceExposure(customerId, amountCents) {
  const profile = await prisma.creditProfile.findUnique({
    where: { customerId }
  });

  if (!profile) {
    throw new Error('CREDIT_PROFILE_NOT_FOUND');
  }

  const currentExposure = Number(profile.currentExposureCents);
  const newExposure = Math.max(0, currentExposure - amountCents);

  const updated = await prisma.creditProfile.update({
    where: { customerId },
    data: {
      currentExposureCents: BigInt(newExposure)
    }
  });

  return updated;
}

/**
 * Calculate and update credit limit based on payment history
 * @param {string} customerId - Customer user ID
 * @returns {Promise<Object>} Updated profile
 */
async function recalculateCreditLimit(customerId) {
  const profile = await prisma.creditProfile.findUnique({
    where: { customerId }
  });

  if (!profile) {
    throw new Error('CREDIT_PROFILE_NOT_FOUND');
  }

  // Get customer's organization
  const user = await prisma.user.findUnique({
    where: { id: customerId },
    select: { orgId: true }
  });

  // Get payment history
  const paidInvoices = await prisma.invoice.findMany({
    where: {
      customerId: user.orgId,
      status: 'PAID'
    },
    orderBy: { paidAt: 'desc' }
  });

  // Calculate payment metrics
  const totalPaid = paidInvoices.length;
  
  if (totalPaid < MIN_LOADS_FOR_CREDIT) {
    // Not enough history, keep at $0 (prepay only)
    return {
      profile,
      reason: 'INSUFFICIENT_HISTORY',
      loadsCompleted: totalPaid,
      minimumRequired: MIN_LOADS_FOR_CREDIT,
      creditLimit: '0.00'
    };
  }

  // Calculate average days to pay
  let totalDays = 0;
  let lateCount = 0;

  for (const invoice of paidInvoices) {
    if (invoice.paidAt && invoice.issuedAt) {
      const daysToPay = (new Date(invoice.paidAt) - new Date(invoice.issuedAt)) / (1000 * 60 * 60 * 24);
      totalDays += daysToPay;
      
      if (daysToPay > 35) { // Late if >35 days (Net 30 + 5 grace)
        lateCount++;
      }
    }
  }

  const avgDaysToPay = totalDays / paidInvoices.length;
  const latePercent = lateCount / paidInvoices.length;

  // Determine credit limit
  let newLimitCents = 0;

  if (latePercent === 0 && avgDaysToPay <= 30) {
    // Perfect payment history
    newLimitCents = 50000 * 100; // $50,000
  } else if (latePercent < 0.20 && avgDaysToPay <= 40) {
    // Good payment history
    newLimitCents = 20000 * 100; // $20,000
  } else if (latePercent < 0.40) {
    // Fair payment history
    newLimitCents = 5000 * 100; // $5,000
  } else {
    // Poor payment history - prepay only
    newLimitCents = 0;
  }

  // Update profile
  const updated = await prisma.creditProfile.update({
    where: { customerId },
    data: {
      riskLimitCents: BigInt(newLimitCents),
      lastVerifiedAt: new Date()
    }
  });

  return {
    profile: updated,
    creditLimit: (newLimitCents / 100).toFixed(2),
    paymentHistory: {
      totalPaidLoads: totalPaid,
      avgDaysToPay: Math.round(avgDaysToPay),
      latePaymentRate: (latePercent * 100).toFixed(1) + '%'
    }
  };
}

module.exports = {
  initializeCreditProfile,
  canPostLoad,
  addExposure,
  reduceExposure,
  recalculateCreditLimit,
  MIN_LOADS_FOR_CREDIT
};

