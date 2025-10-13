/**
 * Email validation service
 * Validates email format, checks MX records, blocks disposable emails
 */

const dns = require('dns').promises;

// List of known disposable/temporary email providers
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com',
  'tempmail.com',
  'guerrillamail.com',
  '10minutemail.com',
  'throwaway.email',
  'maildrop.cc',
  'temp-mail.org',
  'yopmail.com',
  'trashmail.com',
  'getnada.com'
]);

// Free email providers (for business email enforcement)
const FREE_EMAIL_PROVIDERS = new Set([
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'aol.com',
  'icloud.com',
  'mail.com',
  'protonmail.com',
  'zoho.com'
]);

/**
 * Validate email format using regex
 * @param {string} email
 * @returns {boolean}
 */
function isValidFormat(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Check if domain has valid MX records
 * @param {string} domain
 * @returns {Promise<boolean>}
 */
async function hasMXRecords(domain) {
  try {
    const mx = await dns.resolveMx(domain);
    return mx && mx.length > 0;
  } catch (error) {
    return false;
  }
}

/**
 * Validate business email for signup
 * @param {string} email
 * @param {Object} options
 * @param {boolean} options.allowFreeEmail - Allow gmail, yahoo, etc. (default: true for dev)
 * @param {boolean} options.checkMX - Check MX records (default: true)
 * @returns {Promise<{ok: boolean, reason?: string, warning?: string}>}
 */
exports.validateBusinessEmail = async (email, options = {}) => {
  const {
    allowFreeEmail = true, // Lenient for development
    checkMX = true
  } = options;
  
  // Step 1: Format validation
  if (!isValidFormat(email)) {
    return { 
      ok: false, 
      reason: 'INVALID_FORMAT',
      message: 'Invalid email format'
    };
  }
  
  const domain = email.split('@')[1].toLowerCase();
  
  // Step 2: Disposable email check (always blocked)
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return { 
      ok: false, 
      reason: 'DISPOSABLE',
      message: 'Disposable email addresses are not allowed'
    };
  }
  
  // Step 3: Free email provider check (warning only if allowFreeEmail=true)
  if (FREE_EMAIL_PROVIDERS.has(domain)) {
    if (!allowFreeEmail) {
      return { 
        ok: false, 
        reason: 'FREE_EMAIL',
        message: 'Business email required. Free email providers (Gmail, Yahoo, etc.) are not allowed.'
      };
    } else {
      return {
        ok: true,
        warning: 'FREE_EMAIL',
        message: 'Using a free email provider. Consider using a business email for better deliverability.'
      };
    }
  }
  
  // Step 4: MX record validation
  if (checkMX) {
    const hasValidMX = await hasMXRecords(domain);
    if (!hasValidMX) {
      return { 
        ok: false, 
        reason: 'NO_MX',
        message: 'Email domain has no valid mail server (MX records not found)'
      };
    }
  }
  
  // All checks passed
  return { ok: true };
};

/**
 * Simple email format validation (for quick checks)
 * @param {string} email
 * @returns {boolean}
 */
exports.isValidEmail = (email) => {
  return isValidFormat(email);
};

/**
 * Check if email is from a free provider
 * @param {string} email
 * @returns {boolean}
 */
exports.isFreeEmail = (email) => {
  const domain = email.split('@')[1]?.toLowerCase();
  return FREE_EMAIL_PROVIDERS.has(domain);
};

/**
 * Check if email is disposable
 * @param {string} email
 * @returns {boolean}
 */
exports.isDisposableEmail = (email) => {
  const domain = email.split('@')[1]?.toLowerCase();
  return DISPOSABLE_DOMAINS.has(domain);
};



