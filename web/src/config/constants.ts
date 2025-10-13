// Application Constants
export const APP_CONFIG = {
  name: 'Superior One Logistics',
  version: '1.0.0',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  environment: import.meta.env.MODE || 'development',
} as const

// User Types
export const USER_TYPES = {
  CARRIER: 'carrier',
  CUSTOMER: 'customer',
  ADMIN: 'admin',
} as const

// Route Paths
export const ROUTES = {
  // Auth
  LOGIN: '/login',
  REGISTER: '/register',
  SPLASH: '/splash',
  
  // Carrier
  CARRIER_DASHBOARD: '/carrier-dashboard',
  CARRIER_LOADS: '/my-loads',
  CARRIER_DRIVERS: '/drivers',
  CARRIER_FLEET: '/fleet',
  CARRIER_COMPLIANCE: '/compliance',
  
  // Customer
  CUSTOMER_DASHBOARD: '/customer-dashboard',
  CUSTOMER_LOADS: '/customer/loads',
  CUSTOMER_JOB_SITES: '/customer/job-sites',
  
  // Shared
  PROFILE: '/profile',
  SETTINGS: '/settings',
  MESSAGING: '/messaging',
} as const

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
  },
  CARRIER: {
    DASHBOARD: '/api/carrier/dashboard',
    LOADS: '/api/carrier/loads',
    DRIVERS: '/api/carrier/drivers',
  },
  CUSTOMER: {
    DASHBOARD: '/api/customer/dashboard',
    LOADS: '/api/customer/loads',
    JOB_SITES: '/api/customer/job-sites',
  },
} as const

// Theme Configuration
export const THEME_CONFIG = {
  DEFAULT_THEME: 'light',
  THEME_STORAGE_KEY: 'superior-one-theme',
} as const

// Validation Rules
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^\(\d{3}\) \d{3}-\d{4}$/,
  PASSWORD_MIN_LENGTH: 8,
} as const
