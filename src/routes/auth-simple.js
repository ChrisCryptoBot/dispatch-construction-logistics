const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { prisma } = require('../db/prisma');

const router = express.Router();

/**
 * POST /auth/signup
 * Simple signup for testing
 */
router.post('/signup', async (req, res) => {
  try {
    const { orgName, orgType, email, password, firstName, lastName, phone } = req.body;

    console.log('📝 Signup request received:', { email, orgName, orgType });

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

    // Create organization and user
    const result = await prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          name: orgName,
          type: orgType,
          email,
          phone,
          verified: false,
          active: true
        }
      });

      const user = await tx.user.create({
        data: {
          orgId: organization.id,
          email,
          passwordHash,
          firstName: firstName || 'User',
          lastName: lastName || 'User',
          phone,
          role: 'admin',
          active: true,
          emailVerified: false,
          accountStatus: 'PENDING_VERIFICATION'
        }
      });

      return { organization, user };
    });

    console.log('✅ User created successfully:', result.user.email);
    console.log('========================================');
    console.log('📧 MOCK EMAIL SERVICE');
    console.log('========================================');
    console.log('To:', email);
    console.log('🔐 VERIFICATION CODE: 123456');
    console.log('⏰ Expires in: 15 minutes');
    console.log('========================================\n');

    // Return 202 Accepted
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
 * Simple email verification
 */
router.post('/verify-email', async (req, res) => {
  try {
    const { email, code } = req.body;

    console.log('🔐 Verification request:', { email, code });

    if (code !== '123456') {
      return res.status(400).json({
        error: {
          code: 'INVALID_CODE',
          message: 'Invalid verification code'
        }
      });
    }

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
          message: 'No account found'
        }
      });
    }

    // Update user to ACTIVE
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        accountStatus: 'ACTIVE',
        activatedAt: new Date()
      }
    });

    // Generate token
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

    console.log('✅ Email verified successfully:', email);

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
        message: 'Internal server error'
      }
    });
  }
});

/**
 * POST /auth/login
 * Simple login
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

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

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }

    if (!user.emailVerified) {
      return res.status(403).json({
        error: {
          code: 'EMAIL_NOT_VERIFIED',
          message: 'Please verify your email',
          requiresVerification: true,
          email: user.email
        }
      });
    }

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
        message: 'Internal server error'
      }
    });
  }
});

module.exports = router;


