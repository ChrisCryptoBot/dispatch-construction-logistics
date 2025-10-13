/**
 * Cryptographic utility functions for email verification
 */
const crypto = require('crypto');

/**
 * Generate SHA256 hash of a string
 * @param {string} str - String to hash
 * @returns {string} Hex-encoded SHA256 hash
 */
exports.sha256 = (str) => {
  return crypto.createHash('sha256').update(str).digest('hex');
};

/**
 * Generate a random 6-digit verification code
 * @returns {string} 6-digit code (100000-999999)
 */
exports.rand6 = () => {
  return String(Math.floor(100000 + Math.random() * 900000));
};

/**
 * Generate a cryptographically secure random token
 * @param {number} bytes - Number of random bytes (default: 32)
 * @returns {string} Hex-encoded random token
 */
exports.generateToken = (bytes = 32) => {
  return crypto.randomBytes(bytes).toString('hex');
};



