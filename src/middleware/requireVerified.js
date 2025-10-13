/**
 * Middleware to require email verification and active account status
 * Use this on protected routes that require a fully verified account
 */

module.exports = function requireVerified(req, res, next) {
  // Assume req.user is populated by auth middleware (JWT verification)
  if (!req.user) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required'
      }
    });
  }

  // Check email verification
  if (!req.user.emailVerified) {
    return res.status(403).json({
      error: {
        code: 'EMAIL_NOT_VERIFIED',
        message: 'Email verification required to access this resource',
        requiresVerification: true
      }
    });
  }

  // Check account status
  if (req.user.accountStatus !== 'ACTIVE') {
    const statusMessages = {
      PENDING_VERIFICATION: 'Please verify your email to access this resource',
      SUSPENDED: 'Your account has been suspended. Please contact support.',
      DEACTIVATED: 'Your account has been deactivated'
    };

    return res.status(403).json({
      error: {
        code: `ACCOUNT_${req.user.accountStatus}`,
        message: statusMessages[req.user.accountStatus] || 'Account access denied'
      }
    });
  }

  // All checks passed
  next();
};



