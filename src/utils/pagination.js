/**
 * Pagination Utilities
 * Provides safe pagination parsing with validation
 */

/**
 * Parse and validate pagination parameters
 * @param {Object} query - Express req.query object
 * @param {Object} options - Configuration options
 * @returns {Object} - Validated pagination params
 */
function parsePagination(query, options = {}) {
  const {
    maxLimit = 100,       // Maximum items per page
    defaultLimit = 20,    // Default items per page
    defaultPage = 1,      // Default page number
  } = options;

  // Parse and validate page number
  let page = parseInt(query.page, 10);
  if (isNaN(page) || page < 1) {
    page = defaultPage;
  }

  // Parse and validate limit
  let limit = parseInt(query.limit, 10);
  if (isNaN(limit) || limit < 1) {
    limit = defaultLimit;
  }
  // Cap at maximum to prevent abuse
  limit = Math.min(limit, maxLimit);

  // Calculate skip value for database queries
  const skip = (page - 1) * limit;

  return {
    page,
    limit,
    skip,
    take: limit, // Prisma uses 'take' instead of 'limit'
  };
}

/**
 * Create pagination metadata for API responses
 * @param {number} total - Total number of records
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @returns {Object} - Pagination metadata
 */
function createPaginationMeta(total, page, limit) {
  const pages = Math.ceil(total / limit);
  const hasNext = page < pages;
  const hasPrevious = page > 1;

  return {
    page,
    limit,
    total,
    pages,
    hasNext,
    hasPrevious,
  };
}

/**
 * Parse and validate sort parameters
 * @param {Object} query - Express req.query object
 * @param {Array} allowedFields - Array of allowed field names
 * @param {string} defaultField - Default sort field
 * @returns {Object} - Validated sort params
 */
function parseSorting(query, allowedFields = [], defaultField = 'createdAt') {
  let sortBy = query.sortBy || defaultField;
  let sortOrder = query.sortOrder || 'desc';

  // Validate sortBy field
  if (allowedFields.length > 0 && !allowedFields.includes(sortBy)) {
    sortBy = defaultField;
  }

  // Validate sort order
  if (!['asc', 'desc'].includes(sortOrder.toLowerCase())) {
    sortOrder = 'desc';
  }

  return {
    sortBy,
    sortOrder: sortOrder.toLowerCase(),
  };
}

module.exports = {
  parsePagination,
  createPaginationMeta,
  parseSorting,
};

