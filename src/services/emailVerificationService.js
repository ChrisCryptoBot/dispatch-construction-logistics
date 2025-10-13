/**
 * Email verification service
 * Handles code generation, sending, and validation
 */

const { prisma } = require('../db/prisma');
const { sha256, rand6 } = require('../utils/crypto');
const { addMinutes, isExpired } = require('../utils/time');
const { sendVerificationEmail } = require('./email');

// Configuration from environment
const TTL_MINUTES = parseInt(process.env.VERIFICATION_TTL_MINUTES || '15', 10);
const MAX_ATTEMPTS = parseInt(process.env.VERIFICATION_MAX_ATTEMPTS || '5', 10);
const RESEND_COOLDOWN_SECONDS = parseInt(process.env.VERIFICATION_RESEND_COOLDOWN_SECONDS || '60', 10);
const DAILY_RESEND_MAX = parseInt(process.env.VERIFICATION_DAILY_RESEND_MAX || '5', 10);

/**
 * Issue a new verification code and send email
 * @param {string} userId - User ID
 * @param {string} email - User email
 * @returns {Promise<{success: boolean, expiresAt: Date}>}
 */
exports.issueCode = async (userId, email) => {
  const code = rand6();
  const hash = sha256(`${email}:${code}`);
  const expiresAt = addMinutes(new Date(), TTL_MINUTES);
  
  // Update user with new verification code
  await prisma.user.update({
    where: { id: userId },
    data: {
      verificationCodeHash: hash,
      verificationExpires: expiresAt,
      verificationAttempts: 0,
      lastVerificationSent: new Date()
    }
  });
  
  // Send email (mock or real)
  await sendVerificationEmail({ to: email, code });
  
  console.log(`✅ Verification code issued for ${email} (expires in ${TTL_MINUTES} min)`);
  
  return {
    success: true,
    expiresAt
  };
};

/**
 * Check if user can resend verification code
 * @param {Object} user - User object with lastVerificationSent
 * @returns {{ok: boolean, reason?: string, secondsRemaining?: number}}
 */
exports.canResend = (user) => {
  if (!user.lastVerificationSent) {
    return { ok: true };
  }
  
  const elapsedSeconds = (Date.now() - user.lastVerificationSent.getTime()) / 1000;
  
  if (elapsedSeconds < RESEND_COOLDOWN_SECONDS) {
    const remaining = Math.ceil(RESEND_COOLDOWN_SECONDS - elapsedSeconds);
    return { 
      ok: false, 
      reason: 'COOLDOWN',
      secondsRemaining: remaining,
      message: `Please wait ${remaining} seconds before requesting another code`
    };
  }
  
  // Additional check: Daily limit (simplified - just check attempts)
  // In production, you'd track this in a separate table or with a time window
  
  return { ok: true };
};

/**
 * Verify a code entered by the user
 * @param {Object} user - User object with verification fields
 * @param {string} email - User email (for hash validation)
 * @param {string} code - 6-digit code entered by user
 * @returns {Promise<{ok: boolean, code?: string, message?: string}>}
 */
exports.verifyCode = async (user, email, code) => {
  // Check if code has expired
  if (!user.verificationExpires || isExpired(user.verificationExpires)) {
    return { 
      ok: false, 
      code: 'EXPIRED',
      message: 'Verification code has expired. Please request a new one.'
    };
  }
  
  // Check attempt limit
  const attempts = user.verificationAttempts || 0;
  if (attempts >= MAX_ATTEMPTS) {
    return { 
      ok: false, 
      code: 'TOO_MANY_ATTEMPTS',
      message: 'Too many verification attempts. Please request a new code.'
    };
  }
  
  // Verify the code
  const hash = sha256(`${email}:${code}`);
  const isValid = user.verificationCodeHash === hash;
  
  if (!isValid) {
    // Increment attempt counter
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationAttempts: attempts + 1
      }
    });
    
    const remaining = MAX_ATTEMPTS - attempts - 1;
    return { 
      ok: false, 
      code: 'INVALID_CODE',
      message: `Invalid verification code. ${remaining} attempts remaining.`
    };
  }
  
  // Code is valid! Activate the account
  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      accountStatus: 'ACTIVE',
      activatedAt: new Date(),
      verificationCodeHash: null,
      verificationExpires: null,
      verificationAttempts: 0
    }
  });
  
  console.log(`✅ Email verified successfully for ${email}`);
  
  return { 
    ok: true,
    message: 'Email verified successfully! Your account is now active.'
  };
};

/**
 * Check verification status
 * @param {string} email - User email
 * @returns {Promise<{verified: boolean, pending: boolean, user?: Object}>}
 */
exports.checkStatus = async (email) => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      emailVerified: true,
      accountStatus: true,
      verificationExpires: true
    }
  });
  
  if (!user) {
    return { verified: false, pending: false };
  }
  
  return {
    verified: user.emailVerified,
    pending: !user.emailVerified && user.accountStatus === 'PENDING_VERIFICATION',
    user
  };
};


