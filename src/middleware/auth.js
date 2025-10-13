// src/middleware/auth.js - COMPLETE FIXED VERSION
const jwt = require('jsonwebtoken');
const { prisma } = require('../db/prisma');
require('dotenv').config();

/**
 * JWT Authentication Middleware
 * Supports both production JWT tokens and development mode dev tokens
 */
const authenticateJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    // Debug logging
    console.log('🔐 Auth Middleware Debug:');
    console.log('  - NODE_ENV:', process.env.NODE_ENV);
    console.log('  - Token received:', token ? token.substring(0, 30) + '...' : 'none');
    console.log('  - Is dev token:', token?.startsWith('dev-admin-token-'));

    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({
        error: 'Access token required',
        code: 'NO_TOKEN'
      });
    }

    const isDevMode = process.env.NODE_ENV === 'development';
    const isDevToken = token.startsWith('dev-admin-token-');

    // DEVELOPMENT MODE: Accept dev tokens
    if (isDevMode && isDevToken) {
      console.log('✅ Development mode: Accepting dev token');
      
      req.user = {
        id: 'dev-user-id',
        orgId: 'dev-org-id',
        email: 'admin@admin.com',
        role: 'admin',
        organization: {
          id: 'dev-org-id',
          name: 'Superior One Logistics',
          type: 'CARRIER',
          active: true,
          verified: true
        }
      };
      
      console.log('✅ Dev user attached to request:', req.user.email);
      return next();
    }

    // PRODUCTION MODE: Verify JWT token
    console.log('🔑 Verifying JWT token...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            type: true,
            active: true,
            verified: true
          }
        }
      }
    });

    if (!user || !user.active || !user.organization?.active) {
      console.log('❌ User not found or inactive');
      return res.status(401).json({
        error: 'Invalid or inactive user',
        code: 'INVALID_USER'
      });
    }

    req.user = {
      id: user.id,
      orgId: user.orgId,
      email: user.email,
      role: user.role,
      organization: user.organization
    };

    console.log('✅ JWT user authenticated:', user.email);
    next();

  } catch (error) {
    console.error('❌ Auth error:', error.message);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid token',
        code: 'INVALID_TOKEN',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }

    return res.status(500).json({
      error: 'Authentication failed',
      code: 'AUTH_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Optional middleware to check specific roles
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        code: 'NO_USER'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        code: 'FORBIDDEN',
        required: allowedRoles,
        current: req.user.role
      });
    }

    next();
  };
};

// Middleware to ensure user has organization ownership
const requireOrgOwnership = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required',
      code: 'NO_USER'
    });
  }

  if (!req.user.orgId) {
    return res.status(403).json({
      error: 'Organization ownership required',
      code: 'NO_ORG'
    });
  }

  next();
};

module.exports = {
  authenticateJWT,
  requireRole,
  requireOrgOwnership
};