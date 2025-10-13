/**
 * Time utility functions for expiration and scheduling
 */

/**
 * Add minutes to a date
 * @param {Date} date - Base date
 * @param {number} minutes - Minutes to add
 * @returns {Date} New date with minutes added
 */
exports.addMinutes = (date, minutes) => {
  return new Date(date.getTime() + minutes * 60 * 1000);
};

/**
 * Get a date that is X seconds in the past
 * @param {number} seconds - Seconds ago
 * @returns {Date} Date in the past
 */
exports.secondsAgo = (seconds) => {
  return new Date(Date.now() - seconds * 1000);
};

/**
 * Check if a date has expired
 * @param {Date} expiryDate - The expiry date to check
 * @returns {boolean} True if expired
 */
exports.isExpired = (expiryDate) => {
  return expiryDate && expiryDate < new Date();
};

/**
 * Get seconds until a date
 * @param {Date} futureDate - Future date
 * @returns {number} Seconds until date (0 if past)
 */
exports.secondsUntil = (futureDate) => {
  const diff = futureDate.getTime() - Date.now();
  return Math.max(0, Math.floor(diff / 1000));
};



