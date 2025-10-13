/**
 * Utility functions for formatting data in the frontend
 */

/**
 * Safely formats a number with locale-specific formatting
 * @param value - The number to format
 * @param fallback - Fallback value if number is undefined/null (default: '0')
 * @returns Formatted number string or fallback
 */
export const formatNumber = (value: number | undefined | null, fallback: string = '0'): string => {
  if (typeof value === 'number' && !isNaN(value)) {
    return value.toLocaleString();
  }
  return fallback;
};

/**
 * Safely formats currency values
 * @param value - The number to format as currency
 * @param currency - Currency code (default: 'USD')
 * @param fallback - Fallback value if number is undefined/null (default: '$0')
 * @returns Formatted currency string
 */
export const formatCurrency = (
  value: number | undefined | null, 
  currency: string = 'USD',
  fallback: string = '$0'
): string => {
  if (typeof value === 'number' && !isNaN(value)) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(value);
  }
  return fallback;
};

/**
 * Safely formats percentage values
 * @param value - The number to format as percentage
 * @param decimals - Number of decimal places (default: 0)
 * @param fallback - Fallback value if number is undefined/null (default: '0%')
 * @returns Formatted percentage string
 */
export const formatPercentage = (
  value: number | undefined | null, 
  decimals: number = 0,
  fallback: string = '0%'
): string => {
  if (typeof value === 'number' && !isNaN(value)) {
    return `${value.toFixed(decimals)}%`;
  }
  return fallback;
};

/**
 * Safely formats large numbers with K/M suffixes
 * @param value - The number to format
 * @param decimals - Number of decimal places (default: 1)
 * @param fallback - Fallback value if number is undefined/null (default: '0')
 * @returns Formatted number with suffix
 */
export const formatCompactNumber = (
  value: number | undefined | null,
  decimals: number = 1,
  fallback: string = '0'
): string => {
  if (typeof value === 'number' && !isNaN(value)) {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(decimals)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(decimals)}K`;
    } else {
      return value.toString();
    }
  }
  return fallback;
};

/**
 * Safely formats currency with compact notation (K/M)
 * @param value - The number to format as currency
 * @param decimals - Number of decimal places (default: 1)
 * @param currency - Currency symbol (default: '$')
 * @param fallback - Fallback value if number is undefined/null (default: '$0')
 * @returns Formatted compact currency string
 */
export const formatCompactCurrency = (
  value: number | undefined | null,
  decimals: number = 1,
  currency: string = '$',
  fallback: string = '$0'
): string => {
  if (typeof value === 'number' && !isNaN(value)) {
    if (value >= 1000000) {
      return `${currency}${(value / 1000000).toFixed(decimals)}M`;
    } else if (value >= 1000) {
      return `${currency}${(value / 1000).toFixed(decimals)}K`;
    } else {
      return `${currency}${value.toLocaleString()}`;
    }
  }
  return fallback;
};
