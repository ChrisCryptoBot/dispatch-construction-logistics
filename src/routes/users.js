const express = require('express');
const bcrypt = require('bcryptjs');
const { prisma } = require('../db/prisma');

const router = express.Router();

/**
 * POST /users
 * Add user to organization
 */
router.post('/', async (req, res) => {
  try {
    const {
      orgId,
      email,
      password,
      firstName,
      lastName,
      phone,
      role = 'dispatcher'
    } = req.body;

    // Validate required fields
    if (!orgId || !email || !password || !firstName || !lastName) {
      return res.status(400).json({
        error: 'Missing required fields: orgId, email, password, firstName, lastName',
        code: 'MISSING_REQUIRED_FIELDS'
      });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        error: 'Email already exists',
        code: 'EMAIL_EXISTS'
      });
    }

    // Verify organization exists
    const organization = await prisma.organization.findUnique({
      where: { id: orgId }
    });

    if (!organization) {
      return res.status(404).json({
        error: 'Organization not found',
        code: 'ORG_NOT_FOUND'
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        orgId,
        email,
        passwordHash,
        firstName,
        lastName,
        phone,
        role,
        active: true,
        emailVerified: false
      }
    });

    res.status(201).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        active: user.active,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('User creation error:', error);
    res.status(500).json({
      error: 'Internal server error creating user',
      code: 'USER_CREATION_ERROR'
    });
  }
});

/**
 * GET /users
 * List users in organization
 */
router.get('/', async (req, res) => {
  try {
    const {
      orgId,
      role,
      active,
      search,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const where = {};
    if (orgId) where.orgId = orgId;
    if (role) where.role = role;
    if (active !== undefined) where.active = active === 'true';
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        active: true,
        emailVerified: true,
        createdAt: true,
        organization: {
          select: {
            id: true,
            name: true,
            type: true
          }
        }
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: parseInt(limit)
    });

    const total = await prisma.user.count({ where });

    res.json({
      success: true,
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('User listing error:', error);
    res.status(500).json({
      error: 'Internal server error listing users',
      code: 'USER_LISTING_ERROR'
    });
  }
});

/**
 * GET /users/:id
 * Get user details
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
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
      return res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Remove sensitive data
    const { passwordHash, ...userWithoutPassword } = user;

    res.json({
      success: true,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('User retrieval error:', error);
    res.status(500).json({
      error: 'Internal server error retrieving user',
      code: 'USER_RETRIEVAL_ERROR'
    });
  }
});

/**
 * PATCH /users/:id
 * Update user
 */
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated directly
    delete updateData.id;
    delete updateData.passwordHash;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    // Hash password if provided
    if (updateData.password) {
      updateData.passwordHash = await bcrypt.hash(updateData.password, 12);
      delete updateData.password;
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
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

    // Remove sensitive data
    const { passwordHash, ...userWithoutPassword } = user;

    res.json({
      success: true,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('User update error:', error);
    res.status(500).json({
      error: 'Internal server error updating user',
      code: 'USER_UPDATE_ERROR'
    });
  }
});

/**
 * DELETE /users/:id
 * Deactivate user (soft delete)
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.update({
      where: { id },
      data: { active: false }
    });

    res.json({
      success: true,
      message: 'User deactivated',
      user: {
        id: user.id,
        email: user.email,
        active: user.active
      }
    });

  } catch (error) {
    console.error('User deactivation error:', error);
    res.status(500).json({
      error: 'Internal server error deactivating user',
      code: 'USER_DEACTIVATION_ERROR'
    });
  }
});

/**
 * POST /users/:id/reset-password
 * Reset user password
 */
router.post('/:id/reset-password', async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({
        error: 'New password is required',
        code: 'MISSING_PASSWORD'
      });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id },
      data: { passwordHash }
    });

    res.json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({
      error: 'Internal server error resetting password',
      code: 'PASSWORD_RESET_ERROR'
    });
  }
});

module.exports = router;

