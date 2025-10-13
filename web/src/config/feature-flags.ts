// Feature flags for gradual rollout and A/B testing
export const FEATURE_FLAGS = {
  // UI Enhancements
  ENHANCED_ANIMATIONS: true,
  GLASSMORPHISM_CARDS: true,
  SPRING_ANIMATIONS: true,
  
  // New Features
  REAL_TIME_TRACKING: true,
  ADVANCED_ANALYTICS: false,
  MOBILE_APP: false,
  
  // Beta Features
  AI_LOAD_OPTIMIZATION: false,
  PREDICTIVE_MAINTENANCE: false,
  
  // Performance
  LAZY_LOADING: true,
  CODE_SPLITTING: true,
  
  // Development
  DEBUG_MODE: import.meta.env.MODE === 'development',
  MOCK_DATA: import.meta.env.MODE === 'development',
} as const

// Helper function to check feature flag
export const isFeatureEnabled = (feature: keyof typeof FEATURE_FLAGS): boolean => {
  return FEATURE_FLAGS[feature]
}

// Helper function to get feature flag value
export const getFeatureFlag = <T extends keyof typeof FEATURE_FLAGS>(feature: T): typeof FEATURE_FLAGS[T] => {
  return FEATURE_FLAGS[feature]
}
