const { prisma } = require('../db/prisma');

/**
 * Double-Brokering Prevention Service
 * Prevents carriers from re-brokering loads to third parties
 */

const ATTESTATION_TEXT = {
  NO_DOUBLE_BROKER: `I, the undersigned, hereby attest that I will not re-broker, subcontract, or assign this load to any third party carrier. I confirm that my company will directly perform this transportation service using our own equipment and drivers. I understand that violation of this attestation may result in immediate account suspension, legal action, and reporting to FMCSA.`,
  
  EQUIPMENT_OWNERSHIP: `I attest that the equipment to be used for this load is owned or leased by my company and is properly insured and maintained. I will not use third-party equipment without explicit written permission from the shipper.`
};

/**
 * Create double-broker attestation (required before showing pickup address)
 * @param {string} loadId - Load ID
 * @param {string} userId - User ID signing attestation
 * @param {string} ipAddress - User's IP address for legal proof
 * @returns {Promise<Object>} Attestation record
 */
async function createAttestation(loadId, userId, ipAddress = null) {
  const load = await prisma.load.findUnique({
    where: { id: loadId },
    select: { carrierId: true, status: true }
  });

  if (!load) {
    throw new Error('LOAD_NOT_FOUND');
  }

  if (!load.carrierId) {
    throw new Error('LOAD_NOT_ASSIGNED');
  }

  // Check if already attested
  const existing = await prisma.loadAttestation.findFirst({
    where: {
      loadId,
      attestationType: 'NO_DOUBLE_BROKER'
    }
  });

  if (existing) {
    return existing; // Already attested, return existing
  }

  // Create attestation
  const attestation = await prisma.loadAttestation.create({
    data: {
      loadId,
      carrierId: load.carrierId,
      userId,
      attestationType: 'NO_DOUBLE_BROKER',
      attestationText: ATTESTATION_TEXT.NO_DOUBLE_BROKER,
      ipAddress
    }
  });

  return attestation;
}

/**
 * Verify carrier has provided equipment/driver details
 * @param {string} loadId - Load ID
 * @param {Object} dispatchInfo - Equipment and driver details
 * @returns {Promise<Object>} Verification result
 */
async function verifyDispatchDetails(loadId, dispatchInfo) {
  const { vin, driverId, driverName, truckNumber } = dispatchInfo;

  const load = await prisma.load.findUnique({
    where: { id: loadId },
    select: { id: true, carrierId: true, status: true }
  });

  if (!load) {
    throw new Error('LOAD_NOT_FOUND');
  }

  // At least one identifier required (VIN or driver)
  if (!vin && !driverId && !driverName) {
    throw new Error('DISPATCH_INFO_REQUIRED');
  }

  // If VIN provided, verify it belongs to this carrier
  if (vin) {
    const equipment = await prisma.carrierEquipment.findUnique({
      where: { vin }
    });

    if (!equipment) {
      throw new Error('VIN_NOT_FOUND');
    }

    if (equipment.carrierId !== load.carrierId) {
      throw new Error('VIN_NOT_OWNED_BY_CARRIER');
    }

    // Mark equipment as verified
    await prisma.carrierEquipment.update({
      where: { vin },
      data: {
        verified: true,
        lastVerifiedAt: new Date()
      }
    });
  }

  // Store dispatch details in load metadata
  const existingNotes = load.notes || '';
  const dispatchNotes = `\nDispatch Info: ${truckNumber || vin || 'N/A'}, Driver: ${driverName || driverId || 'TBD'}`;

  await prisma.load.update({
    where: { id: loadId },
    data: {
      notes: existingNotes + dispatchNotes
    }
  });

  return {
    verified: true,
    vin: vin || null,
    driver: driverName || driverId || null,
    truck: truckNumber || vin || null
  };
}

/**
 * Check if carrier has signed attestation for load
 * @param {string} loadId - Load ID
 * @returns {Promise<boolean>} True if attested
 */
async function hasSignedAttestation(loadId) {
  const attestation = await prisma.loadAttestation.findFirst({
    where: {
      loadId,
      attestationType: 'NO_DOUBLE_BROKER'
    }
  });

  return !!attestation;
}

/**
 * Flag load as suspicious (potential double-brokering)
 * @param {string} loadId - Load ID
 * @param {string} reason - Reason for flagging
 * @param {Object} evidence - Supporting evidence
 * @returns {Promise<Object>} Flag result
 */
async function flagSuspiciousActivity(loadId, reason, evidence = {}) {
  // Create delivery exception for manual review
  const flag = await prisma.deliveryException.create({
    data: {
      loadId,
      stage: 'pickup',
      notes: `SUSPICIOUS ACTIVITY: ${reason}`,
      photos: JSON.stringify(evidence),
      reportedBy: 'SYSTEM' // System-generated flag
    }
  });

  // Update load with internal note
  await prisma.load.update({
    where: { id: loadId },
    data: {
      internalNotes: `⚠️ FLAGGED: ${reason}`
    }
  });

  return {
    flagged: true,
    flagId: flag.id,
    reason,
    requiresReview: true
  };
}

/**
 * Verify GPS proximity to pickup location (anti-fraud)
 * @param {string} loadId - Load ID
 * @param {Object} location - Current GPS location
 * @returns {Promise<Object>} Proximity check result
 */
async function verifyPickupProximity(loadId, location) {
  const { latitude, longitude } = location;

  const load = await prisma.load.findUnique({
    where: { id: loadId },
    select: { origin: true, status: true }
  });

  if (!load) {
    throw new Error('LOAD_NOT_FOUND');
  }

  // Parse origin coordinates
  const origin = typeof load.origin === 'string' ? JSON.parse(load.origin) : load.origin;
  const pickupLat = origin.lat || origin.latitude;
  const pickupLon = origin.lng || origin.longitude;

  if (!pickupLat || !pickupLon) {
    // No coordinates available, skip check
    return { verified: true, proximity: 'unknown', reason: 'No pickup coordinates' };
  }

  // Calculate distance (Haversine formula - simple version)
  const distance = calculateDistanceMeters(latitude, longitude, pickupLat, pickupLon);
  const proximityThreshold = 800; // 800 meters (~0.5 miles)

  const atPickup = distance <= proximityThreshold;

  if (!atPickup && load.status === 'RELEASED') {
    // Carrier is supposed to be at pickup but GPS shows they're far away
    // Flag as suspicious
    await flagSuspiciousActivity(
      loadId,
      `GPS location ${distance}m from pickup (expected within ${proximityThreshold}m)`,
      { distance, threshold: proximityThreshold, lat: latitude, lon: longitude }
    );
  }

  return {
    verified: atPickup,
    distance: Math.round(distance),
    threshold: proximityThreshold,
    atPickup,
    flagged: !atPickup
  };
}

/**
 * Calculate distance in meters between two GPS coordinates
 * @param {number} lat1 - Latitude 1
 * @param {number} lon1 - Longitude 1
 * @param {number} lat2 - Latitude 2
 * @param {number} lon2 - Longitude 2
 * @returns {number} Distance in meters
 */
function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth's radius in meters
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
}

function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

module.exports = {
  createAttestation,
  verifyDispatchDetails,
  hasSignedAttestation,
  flagSuspiciousActivity,
  verifyPickupProximity,
  ATTESTATION_TEXT
};

