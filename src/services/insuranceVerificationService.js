const { prisma } = require('../db/prisma');

/**
 * Insurance Verification Service
 * Validates insurance coverage, monitors expiry, sends alerts
 */

/**
 * Verify insurance policy and check coverage amounts
 * @param {string} insuranceId - Insurance record ID
 * @param {number} minCoverageAmount - Minimum required coverage (optional)
 * @returns {Promise<Object>} Verification result
 */
async function verifyInsurance(insuranceId, minCoverageAmount = null) {
  const insurance = await prisma.insurance.findUnique({
    where: { id: insuranceId }
  });

  if (!insurance) {
    throw new Error('Insurance record not found');
  }

  const now = new Date();
  const expiryDate = new Date(insurance.expiryDate);
  const daysUntilExpiry = Math.floor((expiryDate - now) / (1000 * 60 * 60 * 24));

  // Check if expired
  const expired = daysUntilExpiry < 0;

  // Check coverage amount if specified
  let coverageAdequate = true;
  if (minCoverageAmount !== null) {
    const coverageAmountNum = parseFloat(insurance.coverageAmount);
    coverageAdequate = coverageAmountNum >= minCoverageAmount;
  }

  // Determine verification status
  const verified = !expired && coverageAdequate;

  // Update insurance record
  const updated = await prisma.insurance.update({
    where: { id: insuranceId },
    data: {
      verified,
      active: !expired,
      lastVerifiedAt: new Date(),
      verificationMethod: 'MANUAL' // Will be API or OCR later
    }
  });

  // If expired or insufficient coverage, suspend carrier
  if (!verified) {
    await prisma.organization.update({
      where: { id: insurance.orgId },
      data: { verified: false }
    });
  }

  return {
    verified,
    expired,
    coverageAdequate,
    daysUntilExpiry: expired ? 0 : daysUntilExpiry,
    expiresAt: expiryDate,
    message: expired 
      ? 'Insurance has expired'
      : !coverageAdequate 
        ? 'Coverage amount insufficient'
        : 'Insurance verified successfully',
    insurance: updated
  };
}

/**
 * Check all insurance policies for a carrier
 * @param {string} orgId - Organization ID
 * @returns {Promise<Object>} Overall insurance status
 */
async function checkCarrierInsurance(orgId) {
  const insurancePolicies = await prisma.insurance.findMany({
    where: { orgId },
    orderBy: { expiryDate: 'asc' }
  });

  if (insurancePolicies.length === 0) {
    return {
      valid: false,
      message: 'No insurance policies found',
      policies: []
    };
  }

  const now = new Date();
  const requiredTypes = ['cargo', 'liability'];
  const minimumCoverage = {
    cargo: 1000000, // $1M
    liability: 100000 // $100K
  };

  const validPolicies = [];
  const expiredPolicies = [];
  const missingTypes = [...requiredTypes];

  for (const policy of insurancePolicies) {
    const expiryDate = new Date(policy.expiryDate);
    const expired = expiryDate < now;

    if (expired) {
      expiredPolicies.push(policy);
    } else {
      validPolicies.push(policy);
      // Remove from missing types if found
      const index = missingTypes.indexOf(policy.type);
      if (index > -1) {
        missingTypes.splice(index, 1);
      }
    }
  }

  // Check if all required types are covered
  const allRequiredCovered = missingTypes.length === 0;

  // Check if coverage amounts are adequate
  let adequateCoverage = true;
  for (const type of requiredTypes) {
    const policy = validPolicies.find(p => p.type === type);
    if (policy) {
      const coverageAmount = parseFloat(policy.coverageAmount);
      if (coverageAmount < minimumCoverage[type]) {
        adequateCoverage = false;
      }
    }
  }

  const valid = allRequiredCovered && adequateCoverage && expiredPolicies.length === 0;

  // Update organization verification status
  if (!valid) {
    await prisma.organization.update({
      where: { id: orgId },
      data: { verified: false }
    });
  }

  // Build professional dispute message if blocked
  let disputeInfo = null;
  if (!valid) {
    const issues = [];
    if (!allRequiredCovered) {
      issues.push(`Missing required insurance types: ${missingTypes.join(', ')}`);
    }
    if (expiredPolicies.length > 0) {
      const expiredTypes = expiredPolicies.map(p => p.type).join(', ');
      issues.push(`${expiredPolicies.length} policy(ies) expired: ${expiredTypes}`);
    }
    if (!adequateCoverage) {
      issues.push('Coverage amounts below minimum requirements');
    }

    disputeInfo = {
      title: 'Insurance Verification Required',
      message: `Your account is temporarily restricted from accepting loads. ${issues.join('. ')}.`,
      action: 'Please upload current insurance certificates in the Compliance section of your carrier dashboard.',
      requirements: {
        cargo: `Cargo Insurance: Minimum $${(minimumCoverage.cargo / 1000000).toFixed(1)}M coverage`,
        liability: `General Liability: Minimum $${(minimumCoverage.liability / 1000).toFixed(0)}K coverage`,
        note: 'All policies must be current and issued by an AM Best rated A- or better insurance company.'
      },
      dispute: {
        enabled: true,
        heading: 'Believe this is an error?',
        contact: {
          phone: '(512) 555-COMP (2667)',
          email: 'compliance@superioronelogistics.com',
          hours: 'Monday-Friday, 8 AM - 6 PM Central Time'
        },
        process: 'Our compliance team reviews all disputes within 24-48 business hours. We will verify your documentation and restore your account access once everything is confirmed to be in order.',
        note: 'If you recently uploaded updated insurance, please allow up to 48 hours for manual verification. We manually review all insurance documents to ensure accuracy and compliance with federal regulations.'
      }
    };
  }

  return {
    valid,
    blocked: !valid,
    allRequiredCovered,
    adequateCoverage,
    expiredCount: expiredPolicies.length,
    validCount: validPolicies.length,
    missingTypes,
    message: !allRequiredCovered
      ? `Missing required insurance: ${missingTypes.join(', ')}`
      : expiredPolicies.length > 0
        ? `${expiredPolicies.length} insurance policy(ies) expired`
        : !adequateCoverage
          ? 'Insurance coverage amounts below minimum requirements'
          : 'All insurance policies valid',
    policies: insurancePolicies,
    minimumRequirements: minimumCoverage,
    disputeInfo
  };
}

/**
 * Suspend carrier if insurance expired
 * @param {string} orgId - Organization ID
 * @returns {Promise<boolean>} True if carrier was suspended
 */
async function suspendIfExpired(orgId) {
  const expiredPolicies = await prisma.insurance.findMany({
    where: {
      orgId,
      expiryDate: { lt: new Date() },
      active: true
    }
  });

  if (expiredPolicies.length > 0) {
    // Mark expired policies as inactive
    await prisma.insurance.updateMany({
      where: {
        id: { in: expiredPolicies.map(p => p.id) }
      },
      data: {
        active: false,
        verified: false
      }
    });

    // Suspend carrier
    await prisma.organization.update({
      where: { id: orgId },
      data: { verified: false }
    });

    return true;
  }

  return false;
}

/**
 * Get insurance policies expiring soon (for alerts)
 * @param {number} daysAhead - Number of days to look ahead (default 30)
 * @returns {Promise<Array>} List of expiring policies
 */
async function getExpiringPolicies(daysAhead = 30) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysAhead);

  const expiring = await prisma.insurance.findMany({
    where: {
      expiryDate: {
        gte: new Date(),
        lte: futureDate
      },
      active: true,
      OR: [
        { alertSentAt: null },
        { 
          alertSentAt: { 
            lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
          } 
        }
      ]
    },
    include: {
      organization: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    },
    orderBy: {
      expiryDate: 'asc'
    }
  });

  return expiring;
}

/**
 * Send expiry alerts (daily cron job)
 * @returns {Promise<Object>} Alert results
 */
async function sendExpiryAlerts() {
  const expiring = await getExpiringPolicies(30);

  const results = {
    total: expiring.length,
    sent: 0,
    errors: []
  };

  for (const policy of expiring) {
    try {
      const daysUntilExpiry = Math.floor(
        (new Date(policy.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)
      );

      // TODO: Integrate with email/SMS service
      console.log(`Alert: ${policy.organization.name}'s ${policy.type} insurance expires in ${daysUntilExpiry} days`);
      
      // Mark alert as sent
      await prisma.insurance.update({
        where: { id: policy.id },
        data: { alertSentAt: new Date() }
      });

      results.sent++;
    } catch (error) {
      results.errors.push({
        policyId: policy.id,
        orgName: policy.organization.name,
        error: error.message
      });
    }
  }

  return results;
}

/**
 * Check all carriers for expired insurance (background job)
 * @returns {Promise<Object>} Check results
 */
async function batchCheckExpiredInsurance() {
  const carriers = await prisma.organization.findMany({
    where: {
      type: { in: ['CARRIER', 'BOTH'] },
      active: true
    },
    select: { id: true, name: true }
  });

  const results = {
    total: carriers.length,
    suspended: 0,
    valid: 0,
    errors: []
  };

  for (const carrier of carriers) {
    try {
      const suspended = await suspendIfExpired(carrier.id);
      if (suspended) {
        results.suspended++;
      } else {
        results.valid++;
      }
    } catch (error) {
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
  verifyInsurance,
  checkCarrierInsurance,
  suspendIfExpired,
  getExpiringPolicies,
  sendExpiryAlerts,
  batchCheckExpiredInsurance
};

