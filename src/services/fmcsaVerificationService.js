const { prisma } = require('../db/prisma');
const fmcsaAPI = require('../adapters/fmcsaAPI');

/**
 * FMCSA Carrier Verification Service
 * Verifies carrier authority, safety ratings, and operating status
 */

/**
 * Verify carrier via FMCSA API
 * @param {string} organizationId - Organization ID to verify
 * @returns {Promise<Object>} Verification result
 */
async function verifyCarrier(organizationId) {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId }
  });

  if (!org) {
    throw new Error('Organization not found');
  }

  if (org.type !== 'CARRIER' && org.type !== 'BOTH') {
    throw new Error('Only carrier organizations can be verified via FMCSA');
  }

  if (!org.dotNumber && !org.mcNumber) {
    throw new Error('DOT or MC number required for FMCSA verification');
  }

  // Fetch from FMCSA (prefer DOT number, fall back to MC)
  let fmcsaData;
  try {
    if (org.dotNumber) {
      fmcsaData = await fmcsaAPI.getCarrierByDOT(org.dotNumber);
    } else if (org.mcNumber) {
      fmcsaData = await fmcsaAPI.getCarrierByMC(org.mcNumber);
    }
  } catch (error) {
    console.error('FMCSA API error:', error);
    
    // Record failed attempt
    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        fmcsaLastChecked: new Date()
      }
    });
    
    throw new Error(`FMCSA API error: ${error.message}`);
  }

  if (!fmcsaData.found) {
    // Carrier not found in FMCSA database
    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        fmcsaVerified: false,
        fmcsaStatus: 'NOT_FOUND',
        fmcsaLastChecked: new Date(),
        fmcsaDataSnapshot: fmcsaData.raw
      }
    });

    return {
      verified: false,
      status: 'NOT_FOUND',
      message: 'Carrier not found in FMCSA database',
      data: fmcsaData
    };
  }

  // Determine if carrier is verified (active authority + acceptable safety rating)
  const acceptableSafetyRatings = ['SATISFACTORY', 'NOT_RATED'];
  const verified = fmcsaData.active && acceptableSafetyRatings.includes(fmcsaData.safetyRating);

  // Update organization record
  const updatedOrg = await prisma.organization.update({
    where: { id: organizationId },
    data: {
      fmcsaVerified: verified,
      fmcsaVerifiedAt: verified ? new Date() : null,
      fmcsaStatus: fmcsaData.authority,
      fmcsaSafetyRating: fmcsaData.safetyRating,
      fmcsaLastChecked: new Date(),
      fmcsaDataSnapshot: fmcsaData.raw,
      verified: verified, // Update overall verified flag
      // Optionally update org details from FMCSA
      ...(fmcsaData.phone && !org.phone ? { phone: fmcsaData.phone } : {})
    }
  });

  return {
    verified,
    status: fmcsaData.authority,
    safetyRating: fmcsaData.safetyRating,
    active: fmcsaData.active,
    message: verified 
      ? 'Carrier verified successfully' 
      : `Verification failed: ${!fmcsaData.active ? 'Authority not active' : 'Unsatisfactory safety rating'}`,
    data: fmcsaData,
    organization: updatedOrg
  };
}

/**
 * Check if carrier needs re-verification (weekly check)
 * @param {string} organizationId - Organization ID
 * @returns {Promise<boolean>} True if needs verification
 */
async function needsReverification(organizationId) {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { fmcsaLastChecked: true }
  });

  if (!org || !org.fmcsaLastChecked) {
    return true; // Never checked
  }

  const daysSinceCheck = (Date.now() - new Date(org.fmcsaLastChecked).getTime()) / (1000 * 60 * 60 * 24);
  
  return daysSinceCheck >= 7; // Re-verify weekly
}

/**
 * Get verification status
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Object>} Verification status
 */
async function getVerificationStatus(organizationId) {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: {
      id: true,
      name: true,
      mcNumber: true,
      dotNumber: true,
      verified: true,
      fmcsaVerified: true,
      fmcsaVerifiedAt: true,
      fmcsaStatus: true,
      fmcsaSafetyRating: true,
      fmcsaLastChecked: true
    }
  });

  if (!org) {
    throw new Error('Organization not found');
  }

  const needsRecheck = await needsReverification(organizationId);

  return {
    organization: org,
    needsReverification: needsRecheck,
    verificationAge: org.fmcsaLastChecked 
      ? Math.floor((Date.now() - new Date(org.fmcsaLastChecked).getTime()) / (1000 * 60 * 60 * 24)) 
      : null
  };
}

/**
 * Batch verify all carriers (background job)
 * @returns {Promise<Object>} Verification results
 */
async function batchVerifyCarriers() {
  const carriers = await prisma.organization.findMany({
    where: {
      type: { in: ['CARRIER', 'BOTH'] },
      active: true,
      OR: [
        { fmcsaLastChecked: null },
        { fmcsaLastChecked: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } // 7 days old
      ]
    },
    select: { id: true, name: true }
  });

  const results = {
    total: carriers.length,
    verified: 0,
    failed: 0,
    errors: []
  };

  for (const carrier of carriers) {
    try {
      const result = await verifyCarrier(carrier.id);
      if (result.verified) {
        results.verified++;
      } else {
        results.failed++;
      }
      
      // Rate limiting delay between carriers
      await new Promise(resolve => setTimeout(resolve, 6000));
    } catch (error) {
      results.failed++;
      results.errors.push({
        carrierId: carrier.id,
        carrierName: carrier.name,
        error: error.message
      });
    }
  }

  return results;
}

module.exports = {
  verifyCarrier,
  needsReverification,
  getVerificationStatus,
  batchVerifyCarriers
};

