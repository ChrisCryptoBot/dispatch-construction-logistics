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
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
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

/**
 * Formats a date into a human-readable string.
 * Accepts Date objects or ISO date strings.
 */
export function formatDate(input: Date | string, locale: string = "en-US"): string {
  try {
    const date = typeof input === "string" ? new Date(input) : input;

    if (isNaN(date.getTime())) {
      return ""; // fallback for invalid dates
    }

    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "short",
      day: "2-digit",
    }).format(date);
  } catch {
    return "";
  }
}

/**
 * Formats a time string (HH:mm) into a readable format.
 * @param timeString - Time string in HH:mm format
 * @param fallback - Fallback value if time is invalid (default: '')
 * @returns Formatted time string
 */
export function formatTime(timeString: string | undefined | null, fallback: string = ''): string {
  if (!timeString) return fallback;
  
  try {
    const [hours, minutes] = timeString.split(':').map(Number);
    
    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      return fallback;
    }
    
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date);
  } catch {
    return fallback;
  }
}

/**
 * Formats a date and time into a human-readable string.
 * Accepts Date objects or ISO date strings.
 */
export function formatDateTime(input: Date | string, locale: string = "en-US"): string {
  try {
    const date = typeof input === "string" ? new Date(input) : input;

    if (isNaN(date.getTime())) {
      return ""; // fallback for invalid dates
    }

    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    }).format(date);
  } catch {
    return "";
  }
}

/**
 * Formats a relative time (e.g., "2 hours ago", "in 3 days").
 * @param input - Date object or ISO date string
 * @param locale - Locale string (default: "en-US")
 * @returns Relative time string
 */
export function formatRelativeTime(input: Date | string, locale: string = "en-US"): string {
  try {
    const date = typeof input === "string" ? new Date(input) : input;
    const now = new Date();

    if (isNaN(date.getTime())) {
      return "";
    }

    const diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

    if (Math.abs(diffInDays) >= 1) {
      return rtf.format(diffInDays, 'day');
    } else if (Math.abs(diffInHours) >= 1) {
      return rtf.format(diffInHours, 'hour');
    } else if (Math.abs(diffInMinutes) >= 1) {
      return rtf.format(diffInMinutes, 'minute');
    } else {
      return rtf.format(diffInSeconds, 'second');
    }
  } catch {
    return "";
  }
}