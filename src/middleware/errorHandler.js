/**
 * Standardized Error Handler Middleware
 * 
 * Converts all errors to consistent format:
 * { error: { code: string, message: string, details?: any } }
 * 
 * Handles:
 * - Prisma errors (P2002, P2025, etc.)
 * - Validation errors
 * - Custom application errors
 * - Unexpected errors
 */

const errorHandler = (err, req, res, next) => {
  // Log all errors
  console.error('[ERROR]', {
    path: req.path,
    method: req.method,
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  })

  // Prisma error handling
  if (err.code?.startsWith('P')) {
    switch (err.code) {
      case 'P2002': // Unique constraint violation
        return res.status(409).json({
          error: {
            code: 'CONFLICT',
            message: 'Resource already exists',
            details: err.meta?.target
          }
        })
      
      case 'P2025': // Record not found
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Resource not found'
          }
        })
      
      case 'P2003': // Foreign key constraint
        return res.status(422).json({
          error: {
            code: 'INVALID_REFERENCE',
            message: 'Referenced resource does not exist',
            details: err.meta?.field_name
          }
        })
      
      case 'P2014': // Required relation violation
        return res.status(422).json({
          error: {
            code: 'MISSING_RELATION',
            message: 'Required relationship not satisfied'
          }
        })
      
      default:
        return res.status(500).json({
          error: {
            code: 'DATABASE_ERROR',
            message: 'Database operation failed',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
          }
        })
    }
  }

  // Custom application errors (with httpCode property)
  if (err.httpCode) {
    return res.status(err.httpCode).json({
      error: {
        code: err.code || 'APPLICATION_ERROR',
        message: err.message,
        details: err.details
      }
    })
  }

  // Validation errors (should be caught by validate middleware, but just in case)
  if (err.name === 'ValidationError' || err.name === 'ZodError') {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: err.errors || err.issues
      }
    })
  }

  // JWT/Auth errors
  if (err.name === 'UnauthorizedError' || err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required'
      }
    })
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: {
        code: 'TOKEN_EXPIRED',
        message: 'Authentication token expired'
      }
    })
  }

  // Default: Internal server error
  return res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    }
  })
}

module.exports = errorHandler



