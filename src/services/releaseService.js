const { prisma } = require('../db/prisma');
const crypto = require('crypto');

/**
 * Release Service
 * Handles material release confirmation and TONU prevention
 */

/**
 * Generate unique release number
 */
function generateReleaseNumber() {
  const year = new Date().getFullYear();
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `RL-${year}-${random}`;
}

/**
 * Request release from shipper (auto-called when carrier accepts load)
 */
async function requestRelease(loadId, userId) {
  const load = await prisma.load.findUnique({
    where: { id: loadId }
  });

  if (!load) {
    throw new Error('LOAD_NOT_FOUND');
  }

  if (load.status !== 'ACCEPTED') {
    throw new Error('INVALID_STATUS');
  }

  // Update load to RELEASE_REQUESTED
  const updatedLoad = await prisma.load.update({
    where: { id: loadId },
    data: {
      status: 'RELEASE_REQUESTED',
      releaseRequestedAt: new Date(),
      releaseRequestedBy: userId
    },
    include: {
      shipper: {
        select: { id: true, name: true, email: true, phone: true }
      },
      carrier: {
        select: { id: true, name: true }
      }
    }
  });

  return updatedLoad;
}

/**
 * Issue release (shipper confirms material is ready)
 */
async function issueRelease(loadId, userId, payload) {
  const {
    confirmedReady,
    quantityConfirmed,
    acknowledgedTonu,
    pickupInstructions,
    siteContact
  } = payload;

  const load = await prisma.load.findUnique({
    where: { id: loadId },
    include: {
      carrier: {
        select: { id: true, name: true, email: true, phone: true }
      }
    }
  });

  if (!load) {
    throw new Error('LOAD_NOT_FOUND');
  }

  // Must be in RELEASE_REQUESTED or ACCEPTED status
  if (load.status !== 'RELEASE_REQUESTED' && load.status !== 'ACCEPTED') {
    throw new Error('INVALID_STATUS');
  }

  if (!confirmedReady || !acknowledgedTonu) {
    throw new Error('CONFIRMATION_REQUIRED');
  }

  // Check timing: cannot release more than 24 hours before pickup window
  const now = new Date();
  const pickupDate = new Date(load.pickupDate);
  const hoursDiff = (pickupDate.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursDiff > 24) {
    throw new Error('TOO_EARLY');
  }

  // Generate release number and set expiry (24 hours)
  const releaseNumber = generateReleaseNumber();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  // Build release notes
  const releaseNotesParts = [];
  if (siteContact) releaseNotesParts.push(`Contact: ${siteContact}`);
  if (pickupInstructions) releaseNotesParts.push(pickupInstructions);

  const updatedLoad = await prisma.load.update({
    where: { id: loadId },
    data: {
      status: 'RELEASED',
      releaseNumber,
      releasedAt: now,
      releasedBy: userId,
      releaseExpiresAt: expiresAt,
      shipperConfirmedReady: true,
      shipperConfirmedAt: now,
      shipperAcknowledgedTonu: true,
      quantityConfirmed,
      releaseNotes: releaseNotesParts.join(' | ')
    },
    include: {
      shipper: {
        select: { id: true, name: true }
      },
      carrier: {
        select: { id: true, name: true, email: true, phone: true }
      }
    }
  });

  return updatedLoad;
}

/**
 * Calculate TONU amount based on industry standards
 */
function calculateTonuAmount(load) {
  const grossRevenue = parseFloat(load.grossRevenue || 0);
  const miles = load.miles || 0;

  // Local hauls (≤50 miles): 50% of gross revenue
  if (miles <= 50) {
    return grossRevenue * 0.50;
  }

  // Regional/OTR: 75% of gross revenue, capped at $250
  return Math.min(grossRevenue * 0.75, 250);
}

/**
 * File TONU claim (carrier reports material not ready)
 */
async function fileTonu(loadId, userId, dto) {
  const { reason, arrivalTime, waitTime, evidence } = dto;

  const load = await prisma.load.findUnique({
    where: { id: loadId },
    include: {
      shipper: {
        select: { id: true, name: true, email: true }
      },
      carrier: {
        select: { id: true, name: true }
      }
    }
  });

  if (!load) {
    throw new Error('LOAD_NOT_FOUND');
  }

  // Can only file TONU if load was RELEASED
  if (load.status !== 'RELEASED' && load.status !== 'IN_TRANSIT') {
    throw new Error('INVALID_STATUS');
  }

  // Calculate TONU amount
  const tonuAmount = calculateTonuAmount(load);

  const updatedLoad = await prisma.load.update({
    where: { id: loadId },
    data: {
      status: 'TONU',
      tonuFiled: true,
      tonuFiledAt: new Date(),
      tonuAmount,
      tonuReason: reason,
      tonuEvidence: evidence || []
    },
    include: {
      shipper: {
        select: { id: true, name: true, email: true }
      },
      carrier: {
        select: { id: true, name: true }
      }
    }
  });

  return {
    load: updatedLoad,
    tonuAmount,
    platformFee: tonuAmount * 0.15, // 15% platform admin fee
    carrierPayout: tonuAmount * 0.85
  };
}

/**
 * Get release status for a load
 */
async function getReleaseStatus(loadId) {
  const load = await prisma.load.findUnique({
    where: { id: loadId },
    select: {
      id: true,
      status: true,
      releaseNumber: true,
      releaseRequestedAt: true,
      releasedAt: true,
      releaseExpiresAt: true,
      releaseNotes: true,
      shipperConfirmedReady: true,
      quantityConfirmed: true
    }
  });

  if (!load) {
    throw new Error('LOAD_NOT_FOUND');
  }

  return load;
}

/**
 * Check if release has expired and update status
 */
async function checkReleaseExpiry(loadId) {
  const load = await prisma.load.findUnique({
    where: { id: loadId }
  });

  if (!load) {
    throw new Error('LOAD_NOT_FOUND');
  }

  if (load.status === 'RELEASED' && load.releaseExpiresAt) {
    const now = new Date();
    if (now > new Date(load.releaseExpiresAt)) {
      // Release has expired - require re-confirmation
      await prisma.load.update({
        where: { id: loadId },
        data: {
          status: 'EXPIRED_RELEASE'
        }
      });
      return { expired: true };
    }
  }

  return { expired: false };
}

module.exports = {
  generateReleaseNumber,
  requestRelease,
  issueRelease,
  calculateTonuAmount,
  fileTonu,
  getReleaseStatus,
  checkReleaseExpiry
};

