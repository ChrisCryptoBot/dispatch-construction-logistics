const { prisma } = require('../db/prisma');
const { emailService } = require('./emailService');

/**
 * Load Cancellation Service
 * Handles load cancellations with appropriate fee calculations
 * Supports cancellations from both customers and carriers
 */

/**
 * Calculate cancellation fee based on timing and load status
 * @param {Object} load - Load object
 * @param {string} cancelledBy - 'CUSTOMER' or 'CARRIER'
 * @returns {Object} Fee details
 */
function calculateCancellationFee(load, cancelledBy) {
  const now = new Date();
  const pickupDate = new Date(load.pickupDate);
  const hoursUntilPickup = (pickupDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  const grossRevenue = parseFloat(load.grossRevenue || 0);

  let fee = 0;
  let feePercentage = 0;
  let reason = '';

  // Customer cancellation fee structure
  if (cancelledBy === 'CUSTOMER') {
    if (load.status === 'POSTED') {
      // No carrier assigned yet - free cancellation
      fee = 0;
      reason = 'No carrier assigned - free cancellation';
    } else if (load.status === 'ACCEPTED' || load.status === 'RELEASE_REQUESTED') {
      // Carrier accepted but not yet released
      if (hoursUntilPickup > 24) {
        // More than 24 hours - 10% fee
        feePercentage = 0.10;
        fee = grossRevenue * feePercentage;
        reason = `>24 hours before pickup - ${(feePercentage * 100).toFixed(0)}% cancellation fee`;
      } else if (hoursUntilPickup > 4) {
        // 4-24 hours - 25% fee
        feePercentage = 0.25;
        fee = grossRevenue * feePercentage;
        reason = `4-24 hours before pickup - ${(feePercentage * 100).toFixed(0)}% cancellation fee`;
      } else {
        // Less than 4 hours - 50% fee
        feePercentage = 0.50;
        fee = grossRevenue * feePercentage;
        reason = `<4 hours before pickup - ${(feePercentage * 100).toFixed(0)}% cancellation fee`;
      }
    } else if (load.status === 'RELEASED') {
      // Material released - 75% fee
      feePercentage = 0.75;
      fee = grossRevenue * feePercentage;
      reason = 'Material already released - 75% cancellation fee';
    } else if (load.status === 'IN_TRANSIT') {
      // Cannot cancel once in transit - full fee
      feePercentage = 1.00;
      fee = grossRevenue;
      reason = 'Load in transit - full payment required';
    }
  }

  // Carrier cancellation fee structure
  if (cancelledBy === 'CARRIER') {
    if (load.status === 'ACCEPTED' || load.status === 'RELEASE_REQUESTED') {
      if (hoursUntilPickup > 12) {
        // More than 12 hours - warning only, no penalty
        fee = 0;
        reason = '>12 hours before pickup - warning issued, no penalty';
      } else if (hoursUntilPickup > 2) {
        // 2-12 hours - $100 penalty
        fee = 100;
        reason = '2-12 hours before pickup - $100 penalty';
      } else {
        // Less than 2 hours - $250 penalty + reputation hit
        fee = 250;
        reason = '<2 hours before pickup - $250 penalty + reputation impact';
      }
    } else if (load.status === 'RELEASED') {
      // Released material - $500 penalty + severe reputation hit
      fee = 500;
      reason = 'Material released - $500 penalty + severe reputation impact';
    } else if (load.status === 'IN_TRANSIT') {
      // Cannot cancel in transit
      throw new Error('CANNOT_CANCEL_IN_TRANSIT');
    }
  }

  return {
    fee: Math.round(fee * 100) / 100, // Round to 2 decimal places
    feePercentage,
    reason,
    hoursUntilPickup: Math.round(hoursUntilPickup * 10) / 10
  };
}

/**
 * Cancel a load (customer-initiated)
 * @param {string} loadId - Load ID
 * @param {string} userId - User cancelling
 * @param {Object} cancellationData - Cancellation details
 * @returns {Promise<Object>} Updated load and fee info
 */
async function cancelLoadByCustomer(loadId, userId, cancellationData) {
  const { reason, notes } = cancellationData;

  const load = await prisma.load.findUnique({
    where: { id: loadId },
    include: {
      shipper: { select: { id: true, name: true, email: true } },
      carrier: { select: { id: true, name: true, email: true, phone: true } }
    }
  });

  if (!load) {
    throw new Error('LOAD_NOT_FOUND');
  }

  // Cannot cancel completed or cancelled loads
  if (['COMPLETED', 'CANCELLED', 'DISPUTED'].includes(load.status)) {
    throw new Error('CANNOT_CANCEL');
  }

  // Calculate fee
  const feeInfo = calculateCancellationFee(load, 'CUSTOMER');

  const updatedLoad = await prisma.load.update({
    where: { id: loadId },
    data: {
      status: 'CANCELLED',
      cancelledBy: userId,
      cancellationType: 'CUSTOMER',
      cancellationReason: reason,
      cancellationFee: feeInfo.fee,
      cancelledAt: new Date(),
      internalNotes: load.internalNotes
        ? `${load.internalNotes}\n\n[CANCELLED BY CUSTOMER] ${reason}\n${notes || ''}\nFee: $${feeInfo.fee} - ${feeInfo.reason}`
        : `[CANCELLED BY CUSTOMER] ${reason}\n${notes || ''}\nFee: $${feeInfo.fee} - ${feeInfo.reason}`
    },
    include: {
      shipper: { select: { id: true, name: true, email: true } },
      carrier: { select: { id: true, name: true, email: true, phone: true } }
    }
  });

  // Notify carrier if one was assigned
  if (load.carrier && load.carrier.email) {
    try {
      // TODO: Replace with actual email service call
      console.log(`[EMAIL] Notifying carrier ${load.carrier.email} of cancellation for load ${loadId}`);
    } catch (emailError) {
      console.error('Failed to send carrier notification:', emailError);
    }
  }

  // Process cancellation fee if applicable
  if (feeInfo.fee > 0 && load.carrier) {
    // Create a partial payout to carrier
    // TODO: Integrate with paymentService for actual payout
    console.log(`[PAYMENT] Processing cancellation compensation: $${feeInfo.fee} to carrier`);
  }

  return {
    load: updatedLoad,
    feeInfo,
    carrierCompensation: feeInfo.fee > 0 && load.carrier ? feeInfo.fee * 0.75 : 0 // Carrier gets 75% of fee
  };
}

/**
 * Cancel a load (carrier-initiated)
 * @param {string} loadId - Load ID
 * @param {string} userId - User cancelling
 * @param {Object} cancellationData - Cancellation details
 * @returns {Promise<Object>} Updated load and penalty info
 */
async function cancelLoadByCarrier(loadId, userId, cancellationData) {
  const { reason, notes } = cancellationData;

  const load = await prisma.load.findUnique({
    where: { id: loadId },
    include: {
      shipper: { select: { id: true, name: true, email: true, phone: true } },
      carrier: { select: { id: true, name: true, email: true } }
    }
  });

  if (!load) {
    throw new Error('LOAD_NOT_FOUND');
  }

  // Cannot cancel if not assigned to this carrier
  if (!load.carrierId || load.status === 'POSTED') {
    throw new Error('NOT_ASSIGNED');
  }

  // Cannot cancel completed or cancelled loads
  if (['COMPLETED', 'CANCELLED', 'DISPUTED', 'DELIVERED'].includes(load.status)) {
    throw new Error('CANNOT_CANCEL');
  }

  // Calculate penalty
  const penaltyInfo = calculateCancellationFee(load, 'CARRIER');

  const updatedLoad = await prisma.load.update({
    where: { id: loadId },
    data: {
      status: 'POSTED', // Return to posted status for re-assignment
      carrierId: null, // Unassign carrier
      acceptedAt: null,
      cancelledBy: userId,
      cancellationType: 'CARRIER',
      cancellationReason: reason,
      cancellationFee: penaltyInfo.fee,
      cancelledAt: new Date(),
      internalNotes: load.internalNotes
        ? `${load.internalNotes}\n\n[CANCELLED BY CARRIER] ${reason}\n${notes || ''}\nPenalty: $${penaltyInfo.fee} - ${penaltyInfo.reason}`
        : `[CANCELLED BY CARRIER] ${reason}\n${notes || ''}\nPenalty: $${penaltyInfo.fee} - ${penaltyInfo.reason}`,
      // Reset release fields
      releaseNumber: null,
      releaseRequestedAt: null,
      releasedAt: null,
      releaseExpiresAt: null,
      releaseNotes: null,
      shipperConfirmedReady: false,
      shipperConfirmedAt: null,
      shipperAcknowledgedTonu: false
    },
    include: {
      shipper: { select: { id: true, name: true, email: true, phone: true } },
      carrier: { select: { id: true, name: true, email: true } }
    }
  });

  // Update carrier reputation for late cancellation
  if (penaltyInfo.fee > 0) {
    try {
      await prisma.carrierProfile.update({
        where: { organizationId: load.carrier.id },
        data: {
          cancellationCount: { increment: 1 }
        }
      });
    } catch (error) {
      console.error('Failed to update carrier profile:', error);
    }
  }

  // Notify customer
  if (load.shipper && load.shipper.email) {
    try {
      console.log(`[EMAIL] Notifying customer ${load.shipper.email} of carrier cancellation for load ${loadId}`);
    } catch (emailError) {
      console.error('Failed to send customer notification:', emailError);
    }
  }

  // Charge carrier penalty if applicable
  if (penaltyInfo.fee > 0) {
    // TODO: Integrate with payment service to charge carrier
    console.log(`[PAYMENT] Processing carrier penalty: $${penaltyInfo.fee}`);
  }

  return {
    load: updatedLoad,
    penaltyInfo,
    reputationImpact: penaltyInfo.fee >= 250 ? 'SEVERE' : penaltyInfo.fee > 0 ? 'MODERATE' : 'WARNING'
  };
}

/**
 * Get cancellation policy details for display
 * @param {string} loadId - Load ID
 * @param {string} userType - 'CUSTOMER' or 'CARRIER'
 * @returns {Promise<Object>} Policy details
 */
async function getCancellationPolicy(loadId, userType) {
  const load = await prisma.load.findUnique({
    where: { id: loadId }
  });

  if (!load) {
    throw new Error('LOAD_NOT_FOUND');
  }

  const now = new Date();
  const pickupDate = new Date(load.pickupDate);
  const hoursUntilPickup = (pickupDate.getTime() - now.getTime()) / (1000 * 60 * 60);

  // Calculate what fee would be charged right now
  const currentFeeInfo = calculateCancellationFee(load, userType);

  let policy = {
    canCancel: true,
    currentFee: currentFeeInfo.fee,
    currentReason: currentFeeInfo.reason,
    hoursUntilPickup: Math.round(hoursUntilPickup * 10) / 10,
    tiers: []
  };

  if (userType === 'CUSTOMER') {
    policy.tiers = [
      {
        threshold: '>24 hours before pickup',
        feePercentage: 10,
        description: '10% of load value'
      },
      {
        threshold: '4-24 hours before pickup',
        feePercentage: 25,
        description: '25% of load value'
      },
      {
        threshold: '<4 hours before pickup',
        feePercentage: 50,
        description: '50% of load value'
      },
      {
        threshold: 'Material released',
        feePercentage: 75,
        description: '75% of load value'
      }
    ];

    if (load.status === 'IN_TRANSIT') {
      policy.canCancel = false;
      policy.reason = 'Cannot cancel load that is already in transit';
    }
  }

  if (userType === 'CARRIER') {
    policy.tiers = [
      {
        threshold: '>12 hours before pickup',
        fee: 0,
        description: 'Warning only, no penalty'
      },
      {
        threshold: '2-12 hours before pickup',
        fee: 100,
        description: '$100 penalty'
      },
      {
        threshold: '<2 hours before pickup',
        fee: 250,
        description: '$250 penalty + reputation impact'
      },
      {
        threshold: 'Material released',
        fee: 500,
        description: '$500 penalty + severe reputation impact'
      }
    ];

    if (load.status === 'IN_TRANSIT') {
      policy.canCancel = false;
      policy.reason = 'Cannot cancel load that is in transit';
    }
  }

  return policy;
}

module.exports = {
  calculateCancellationFee,
  cancelLoadByCustomer,
  cancelLoadByCarrier,
  getCancellationPolicy
};
