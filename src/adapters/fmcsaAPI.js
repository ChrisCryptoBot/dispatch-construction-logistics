const axios = require('axios');

/**
 * FMCSA Safer API Adapter
 * Rate limit: 10 requests/minute
 * Documentation: https://mobile.fmcsa.dot.gov/developer/home.page
 */

const FMCSA_BASE_URL = 'https://mobile.fmcsa.dot.gov/qc/services/carriers';
const RATE_LIMIT_DELAY = 6000; // 6 seconds between requests (10/min)

let lastRequestTime = 0;

/**
 * Rate-limited request wrapper
 */
async function rateLimitedRequest(url) {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
    const waitTime = RATE_LIMIT_DELAY - timeSinceLastRequest;
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  lastRequestTime = Date.now();
  
  try {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'SuperiorOneLogistics/1.0'
      }
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 429) {
      // Too many requests - wait and retry once
      await new Promise(resolve => setTimeout(resolve, 60000)); // Wait 1 minute
      const response = await axios.get(url, { timeout: 10000 });
      return response.data;
    }
    throw error;
  }
}

/**
 * Get carrier by DOT number
 * @param {string} dotNumber - DOT number (with or without "DOT" prefix)
 * @returns {Promise<Object>} FMCSA carrier data
 */
async function getCarrierByDOT(dotNumber) {
  if (!dotNumber) {
    throw new Error('DOT number is required');
  }
  
  // Clean DOT number (remove prefix if present)
  const cleanDOT = dotNumber.toString().replace(/^DOT[-\s]*/i, '');
  
  // FMCSA API doesn't need webKey for basic lookups
  const url = `${FMCSA_BASE_URL}/${cleanDOT}`;
  
  const data = await rateLimitedRequest(url);
  
  return parseFMCSAResponse(data);
}

/**
 * Get carrier by MC number
 * @param {string} mcNumber - MC number (with or without "MC" prefix)
 * @returns {Promise<Object>} FMCSA carrier data
 */
async function getCarrierByMC(mcNumber) {
  if (!mcNumber) {
    throw new Error('MC number is required');
  }
  
  // Clean MC number (remove prefix if present)
  const cleanMC = mcNumber.toString().replace(/^MC[-\s]*/i, '');
  
  const url = `${FMCSA_BASE_URL}/docket-number/${cleanMC}`;
  
  const data = await rateLimitedRequest(url);
  
  return parseFMCSAResponse(data);
}

/**
 * Parse and normalize FMCSA API response
 */
function parseFMCSAResponse(rawData) {
  const carrier = rawData?.content?.carrier;
  
  if (!carrier) {
    return {
      found: false,
      authority: null,
      safetyRating: null,
      active: false,
      raw: rawData
    };
  }
  
  // Extract key fields
  const authorityStatus = carrier?.carrierOperation?.carrierOperationStatus;
  const safetyRating = carrier?.safetyRating || 'NOT_RATED';
  
  // Determine if carrier is authorized to operate
  const active = authorityStatus === 'AUTHORIZED' || authorityStatus === 'ACTIVE';
  
  // Map safety rating
  const normalizedRating = mapSafetyRating(safetyRating);
  
  return {
    found: true,
    authority: authorityStatus || 'UNKNOWN',
    safetyRating: normalizedRating,
    active,
    dotNumber: carrier?.dotNumber,
    mcNumber: carrier?.docketNumbers?.[0]?.docketNumber,
    legalName: carrier?.legalName,
    dbaName: carrier?.dbaName,
    physicalAddress: carrier?.phyStreet,
    physicalCity: carrier?.phyCity,
    physicalState: carrier?.phyState,
    physicalZipCode: carrier?.phyZipcode,
    phone: carrier?.telephone,
    raw: rawData
  };
}

/**
 * Map FMCSA safety ratings to our enum values
 */
function mapSafetyRating(rating) {
  if (!rating) return 'NOT_RATED';
  
  const normalized = rating.toUpperCase().replace(/\s+/g, '_');
  
  const ratingMap = {
    'SATISFACTORY': 'SATISFACTORY',
    'CONDITIONAL': 'CONDITIONAL',
    'UNSATISFACTORY': 'UNSATISFACTORY',
    'NOT_RATED': 'NOT_RATED',
    'UNRATED': 'NOT_RATED'
  };
  
  return ratingMap[normalized] || 'NOT_RATED';
}

module.exports = {
  getCarrierByDOT,
  getCarrierByMC
};


