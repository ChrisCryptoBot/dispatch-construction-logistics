const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { prisma } = require('../db/prisma');
const { signupLimiter, verifyLimiter, resendLimiter, loginLimiter } = require('../middleware/rateLimiter');
const verifyCaptcha = require('../middleware/verifyCaptcha');
const { validateBusinessEmail } = require('../services/emailValidationService');
const { issueCode, verifyCode, canResend } = require('../services/emailVerificationService');
const { sendWelcomeEmail } = require('../services/email');

const router = express.Router();

// Admin bypass for development
const DEV_BYPASS_EMAILS = ['admin@admin.com'];

/**
 * POST /auth/signup
 * Create account and send verification email (202 Accepted)
 */
router.post('/signup', signupLimiter, verifyCaptcha, async (req, res) => {
  try {
    const {
      orgName,
      orgType,
      email,
      password,
      firstName,
      lastName,
      phone,
      mcNumber,
      dotNumber,
      ein
    } = req.body;

    // Validate required fields
    if (!orgName || !orgType || !email || !password || !firstName || !lastName) {
      return res.status(400).json({
        error: {
          code: 'MISSING_REQUIRED_FIELDS',
          message: 'Missing required fields: orgName, orgType, email, password, firstName, lastName'
        }
      });
    }

    // Validate email format and domain
    const emailValidation = await validateBusinessEmail(email, {
      allowFreeEmail: true, // Allow Gmail for now
      checkMX: false // Skip MX check in development
    });

    if (!emailValidation.ok) {
      return res.status(400).json({
        error: {
          code: emailValidation.reason,
          message: emailValidation.message
        }
      });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({
        error: {
          code: 'EMAIL_TAKEN',
          message: 'Email already registered'
        }
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Determine initial account status
    const isDevBypass = DEV_BYPASS_EMAILS.includes(email.toLowerCase());
    const accountStatus = isDevBypass ? 'ACTIVE' : 'PENDING_VERIFICATION';
    const emailVerified = isDevBypass;

    // Create organization and user in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create organization
      const organization = await tx.organization.create({
        data: {
          name: orgName,
          type: orgType,
          email,
          phone,
          mcNumber,
          dotNumber,
          ein,
          verified: false,
          active: true
        }
      });

      // Create first user (admin)
      const user = await tx.user.create({
        data: {
          orgId: organization.id,
          email,
          passwordHash,
          firstName,
          lastName,
          phone,
          role: 'admin',
          active: true,
          emailVerified,
          accountStatus,
          activatedAt: isDevBypass ? new Date() : null
        }
      });

      return { organization, user };
    });

    // If dev bypass, immediately return token
    if (isDevBypass) {
      const token = jwt.sign(
        {
          userId: result.user.id,
          orgId: result.organization.id,
          email: result.user.email,
          role: result.user.role
        },
        process.env.JWT_SECRET || 'dev-secret-key',
        { expiresIn: '7d' }
      );

      console.log('🔓 DEV BYPASS: Admin account created and activated');

      return res.status(201).json({
        success: true,
        message: 'Account created (dev bypass)',
        token,
        user: {
          id: result.user.id,
          email: result.user.email,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          role: result.user.role,
          emailVerified: true
        },
        organization: {
          id: result.organization.id,
          name: result.organization.name,
          type: result.organization.type
        }
      });
    }

    // Issue verification code and send email
    await issueCode(result.user.id, email);

    // Return 202 Accepted (not 201 Created)
    res.status(202).json({
      success: true,
      message: 'VERIFICATION_SENT',
      email,
      requiresVerification: true
    });

  } catch (error) {
    console.error('❌ Signup error:', error);
    res.status(500).json({
      error: {
        code: 'SIGNUP_ERROR',
        message: 'Internal server error during signup'
      }
    });
  }
});

/**
 * POST /auth/verify-email
 * Verify email with 6-digit code
 */
router.post('/verify-email', verifyLimiter, async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        error: {
          code: 'MISSING_FIELDS',
          message: 'Email and verification code are required'
        }
      });
    }

    // Validate code format
    if (!/^\d{6}$/.test(code)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_FORMAT',
          message: 'Verification code must be 6 digits'
        }
      });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            type: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        error: {
          code: 'USER_NOT_FOUND',
          message: 'No account found with this email'
        }
      });
    }

    if (user.emailVerified) {
      return res.json({
        success: true,
        message: 'ALREADY_VERIFIED',
        alreadyVerified: true
      });
    }

    // Verify the code
    const result = await verifyCode(user, email, code);

    if (!result.ok) {
      return res.status(400).json({
        error: {
          code: result.code,
          message: result.message
        }
      });
    }

    // Send welcome email with onboarding link
    await sendWelcomeEmail({
      to: email,
      name: user.firstName
    });

    // Generate token for onboarding
    const token = jwt.sign(
      {
        userId: user.id,
        orgId: user.orgId,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET || 'dev-secret-key',
      { expiresIn: '7d' }
    });

    res.json({
      success: true,
      message: 'VERIFIED',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        emailVerified: true
      },
      organization: user.organization
    });

  } catch (error) {
    console.error('❌ Verification error:', error);
    res.status(500).json({
      error: {
        code: 'VERIFICATION_ERROR',
        message: 'Internal server error during verification'
      }
    });
  }
});

/**
 * POST /auth/resend-verification
 * Resend verification code (60s cooldown)
 */
router.post('/resend-verification', resendLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: {
          code: 'MISSING_EMAIL',
          message: 'Email is required'
        }
      });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({
        error: {
          code: 'USER_NOT_FOUND',
          message: 'No account found with this email'
        }
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        error: {
          code: 'ALREADY_VERIFIED',
          message: 'Email is already verified'
        }
      });
    }

    // Check cooldown
    const canResendCheck = canResend(user);
    if (!canResendCheck.ok) {
      return res.status(429).json({
        error: {
          code: canResendCheck.reason,
          message: canResendCheck.message,
          secondsRemaining: canResendCheck.secondsRemaining
        }
      });
    }

    // Issue new code
    await issueCode(user.id, email);

    res.status(202).json({
      success: true,
      message: 'VERIFICATION_SENT'
    });

  } catch (error) {
    console.error('❌ Resend error:', error);
    res.status(500).json({
      error: {
        code: 'RESEND_ERROR',
        message: 'Internal server error resending verification'
      }
    });
  }
});

/**
 * POST /auth/login
 * User login with email verification check
 */
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: {
          code: 'MISSING_CREDENTIALS',
          message: 'Email and password are required'
        }
      });
    }

    // Find user with organization
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            type: true,
            verified: true,
            active: true
          }
        }
      }
    });

    if (!user) {
      return res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }

    // Check email verification
    if (!user.emailVerified || user.accountStatus === 'PENDING_VERIFICATION') {
      return res.status(403).json({
        error: {
          code: 'EMAIL_NOT_VERIFIED',
          message: 'Please verify your email before logging in',
          requiresVerification: true,
          email: user.email
        }
      });
    }

    // Check account status
    if (user.accountStatus === 'SUSPENDED') {
      return res.status(403).json({
        error: {
          code: 'ACCOUNT_SUSPENDED',
          message: 'Your account has been suspended. Please contact support.'
        }
      });
    }

    if (user.accountStatus === 'DEACTIVATED') {
      return res.status(403).json({
        error: {
          code: 'ACCOUNT_DEACTIVATED',
          message: 'Your account has been deactivated'
        }
      });
    }

    // Check if user is active
    if (!user.active) {
      return res.status(401).json({
        error: {
          code: 'ACCOUNT_INACTIVE',
          message: 'Account is inactive'
        }
      });
    }

    // Check if organization is active
    if (!user.organization.active) {
      return res.status(401).json({
        error: {
          code: 'ORG_DEACTIVATED',
          message: 'Organization is deactivated'
        }
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        orgId: user.orgId,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET || 'dev-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        emailVerified: user.emailVerified
      },
      organization: user.organization
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      error: {
        code: 'LOGIN_ERROR',
        message: 'Internal server error during login'
      }
    });
  }
});

/**
 * GET /auth/me
 * Get current user profile
 */
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        error: {
          code: 'NO_TOKEN',
          message: 'No token provided'
        }
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-key');
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            type: true,
            verified: true,
            active: true,
            mcNumber: true,
            dotNumber: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        emailVerified: user.emailVerified,
        accountStatus: user.accountStatus,
        createdAt: user.createdAt
      },
      organization: user.organization
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid token'
        }
      });
    }
    
    console.error('❌ Profile error:', error);
    res.status(500).json({
      error: {
        code: 'PROFILE_ERROR',
        message: 'Internal server error fetching profile'
      }
    });
  }
});

/**
 * POST /auth/refresh
 * Refresh JWT token
 */
router.post('/refresh', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        error: {
          code: 'NO_TOKEN',
          message: 'No token provided'
        }
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-key');
    
    // Generate new token
    const newToken = jwt.sign(
      {
        userId: decoded.userId,
        orgId: decoded.orgId,
        email: decoded.email,
        role: decoded.role
      },
      process.env.JWT_SECRET || 'dev-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token: newToken
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid token'
        }
      });
    }
    
    console.error('❌ Token refresh error:', error);
    res.status(500).json({
      error: {
        code: 'REFRESH_ERROR',
        message: 'Internal server error refreshing token'
      }
    });
  }
});

module.exports = router;
