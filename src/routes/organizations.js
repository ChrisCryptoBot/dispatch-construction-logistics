const express = require('express');
const { prisma } = require('../db/prisma');

const router = express.Router();

/**
 * POST /organizations
 * Create organization (admin only)
 */
router.post('/', async (req, res) => {
  try {
    const {
      name,
      type,
      email,
      phone,
      address,
      mcNumber,
      dotNumber,
      ein,
      metadata
    } = req.body;

    // Validate required fields
    if (!name || !type) {
      return res.status(400).json({
        error: 'Name and type are required',
        code: 'MISSING_REQUIRED_FIELDS'
      });
    }

    // Check for duplicate MC/DOT numbers
    if (mcNumber) {
      const existingMC = await prisma.organization.findUnique({
        where: { mcNumber }
      });
      if (existingMC) {
        return res.status(400).json({
          error: 'MC Number already exists',
          code: 'MC_NUMBER_EXISTS'
        });
      }
    }

    if (dotNumber) {
      const existingDOT = await prisma.organization.findUnique({
        where: { dotNumber }
      });
      if (existingDOT) {
        return res.status(400).json({
          error: 'DOT Number already exists',
          code: 'DOT_NUMBER_EXISTS'
        });
      }
    }

    const organization = await prisma.organization.create({
      data: {
        name,
        type,
        email,
        phone,
        address,
        mcNumber,
        dotNumber,
        ein,
        metadata,
        verified: false,
        active: true
      }
    });

    res.status(201).json({
      success: true,
      organization
    });

  } catch (error) {
    console.error('Organization creation error:', error);
    res.status(500).json({
      error: 'Internal server error creating organization',
      code: 'ORG_CREATION_ERROR'
    });
  }
});

/**
 * GET /organizations/:id
 * Get organization details
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const organization = await prisma.organization.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            active: true,
            createdAt: true
          }
        },
        _count: {
          select: {
            loadsAsShipper: true,
            loadsAsCarrier: true
          }
        }
      }
    });

    if (!organization) {
      return res.status(404).json({
        error: 'Organization not found',
        code: 'ORG_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      organization
    });

  } catch (error) {
    console.error('Organization retrieval error:', error);
    res.status(500).json({
      error: 'Internal server error retrieving organization',
      code: 'ORG_RETRIEVAL_ERROR'
    });
  }
});

/**
 * PATCH /organizations/:id
 * Update organization
 */
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated directly
    delete updateData.id;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    const organization = await prisma.organization.update({
      where: { id },
      data: updateData
    });

    res.json({
      success: true,
      organization
    });

  } catch (error) {
    console.error('Organization update error:', error);
    res.status(500).json({
      error: 'Internal server error updating organization',
      code: 'ORG_UPDATE_ERROR'
    });
  }
});

/**
 * GET /organizations
 * List organizations (with filtering)
 */
router.get('/', async (req, res) => {
  try {
    const {
      type,
      verified,
      active,
      search,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const where = {};
    if (type) where.type = type;
    if (verified !== undefined) where.verified = verified === 'true';
    if (active !== undefined) where.active = active === 'true';
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { mcNumber: { contains: search, mode: 'insensitive' } },
        { dotNumber: { contains: search, mode: 'insensitive' } }
      ];
    }

    const organizations = await prisma.organization.findMany({
      where,
      select: {
        id: true,
        name: true,
        type: true,
        email: true,
        phone: true,
        mcNumber: true,
        dotNumber: true,
        verified: true,
        active: true,
        createdAt: true,
        _count: {
          select: {
            users: true,
            loadsAsShipper: true,
            loadsAsCarrier: true
          }
        }
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: parseInt(limit)
    });

    const total = await prisma.organization.count({ where });

    res.json({
      success: true,
      organizations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Organization listing error:', error);
    res.status(500).json({
      error: 'Internal server error listing organizations',
      code: 'ORG_LISTING_ERROR'
    });
  }
});

/**
 * DELETE /organizations/:id
 * Deactivate organization (soft delete)
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const organization = await prisma.organization.update({
      where: { id },
      data: { active: false }
    });

    res.json({
      success: true,
      message: 'Organization deactivated',
      organization
    });

  } catch (error) {
    console.error('Organization deactivation error:', error);
    res.status(500).json({
      error: 'Internal server error deactivating organization',
      code: 'ORG_DEACTIVATION_ERROR'
    });
  }
});

module.exports = router;

