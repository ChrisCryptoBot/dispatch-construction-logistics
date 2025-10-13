// Superior One Logistics - Professional Design System
// Mature, sophisticated color palette and refined styling

export const colors = {
  // Primary Brand Colors - Muted Burgundy (60% less saturated)
  primary: {
    50: '#fef2f2',
    100: '#fee2e2', 
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#C53030', // Muted burgundy red (was #dc2626)
    600: '#9B2C2C', // Darker burgundy
    700: '#822727', // Even darker
    800: '#7f1d1d',
    900: '#450a0a',
    950: '#2d0b0b'
  },
  
  // Premium Gray Scale - Deeper, Richer
  silver: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#718096', // Muted gray
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0A0E1A', // Deeper, richer black (was #0f172a)
    950: '#020617'
  },

  // Professional Accent Colors
  accent: {
    gold: '#b8860b',
    platinum: '#c0c0c0',
    charcoal: '#2c3e50',
    steel: '#5a6c7d'
  },

  // Status Colors - Desaturated, Professional
  status: {
    success: '#2F855A',    // Muted green
    warning: '#C05621',    // Muted orange
    error: '#C53030',      // Muted red (same as accent)
    info: '#2C5282'        // Muted blue
  },

  // Semantic Colors - Professional Enterprise Palette
  background: {
    primary: '#0A0E1A',    // Deeper, richer black
    secondary: '#0F1419',  // Card backgrounds
    tertiary: '#161B26',   // Elevated elements
    hover: '#1C2433',      // Hover states
    card: '#0F1419',       // Card background
    modal: '#0F1419'       // Modal background
  },

  text: {
    primary: '#F7FAFC',    // Almost white, not pure white
    secondary: '#CBD5E0',  // Medium gray for secondary text
    tertiary: '#718096',   // Subtle gray for labels
    muted: '#4A5568'       // Very subtle text
  },

  border: {
    primary: 'rgba(197, 48, 48, 0.3)',     // Primary brand border
    secondary: 'rgba(255, 255, 255, 0.12)', // Secondary border
    subtle: 'rgba(255, 255, 255, 0.06)',   // Extremely subtle
    medium: 'rgba(255, 255, 255, 0.1)',    // Standard borders
    strong: 'rgba(255, 255, 255, 0.15)',   // Emphasized borders
    accent: 'rgba(197, 48, 48, 0.2)',      // Subtle red borders
    glow: 'rgba(197, 48, 48, 0.08)'        // Very subtle glow
  }
}

export const shadows = {
  // Professional shadow system - softer, more sophisticated
  primary: '0 4px 12px rgba(197, 48, 48, 0.3)',  // Primary brand shadow
  secondary: '0 2px 8px rgba(0, 0, 0, 0.3)',     // Secondary shadow
  subtle: '0 2px 8px rgba(0, 0, 0, 0.4)',
  soft: '0 4px 16px rgba(0, 0, 0, 0.5)',
  medium: '0 8px 32px rgba(0, 0, 0, 0.6)',
  strong: '0 12px 40px rgba(0, 0, 0, 0.7)',
  accent: '0 0 15px rgba(197, 48, 48, 0.2)',     // Accent shadow
  glow: '0 0 15px rgba(197, 48, 48, 0.08)',      // Very subtle red glow
  card: '0 8px 32px rgba(0, 0, 0, 0.5)',
  modal: '0 25px 50px rgba(0, 0, 0, 0.7)'
}

export const borders = {
  // Professional border system
  none: 'none',
  thin: '1px solid',
  medium: '2px solid', 
  thick: '3px solid',
  radius: {
    none: '0',
    xs: '2px',
    sm: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
    full: '9999px'
  }
}

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
  xxxl: '64px'
}

export const typography = {
  fontFamily: {
    primary: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: '"SF Mono", Monaco, Inconsolata, "Roboto Mono", Consolas, "Courier New", monospace'
  },
  fontSize: {
    xs: '11px',    // Fine print
    sm: '13px',    // Labels, metadata
    base: '14px',  // Body text
    lg: '16px',    // Section headers
    xl: '20px',    // Card headers
    '2xl': '24px', // Page headers
    '3xl': '32px'  // Display numbers
  },
  fontWeight: {
    normal: '400',   // Body text
    medium: '500',   // Emphasized text
    semibold: '600'  // Headers (never use 700/800)
  },
  lineHeight: {
    tight: '1.2',
    normal: '1.5',
    relaxed: '1.6'
  },
  // Professional heading styles - reduced weights
  heading: {
    h1: { fontSize: '32px', fontWeight: '600', lineHeight: '1.2', letterSpacing: '-0.02em' },
    h2: { fontSize: '24px', fontWeight: '600', lineHeight: '1.3', letterSpacing: '-0.02em' },
    h3: { fontSize: '20px', fontWeight: '600', lineHeight: '1.4', letterSpacing: '-0.01em' },
    h4: { fontSize: '18px', fontWeight: '500', lineHeight: '1.4', letterSpacing: '-0.01em' }
  },
  // Professional body text styles
  body: {
    large: { fontSize: '16px', fontWeight: '400', lineHeight: '1.6' },
    medium: { fontSize: '14px', fontWeight: '400', lineHeight: '1.5' },
    small: { fontSize: '12px', fontWeight: '400', lineHeight: '1.4' }
  },
  // Professional label styles - no uppercase
  labels: {
    primary: { fontSize: '13px', fontWeight: '500', lineHeight: '1.4', letterSpacing: '0.02em' },
    secondary: { fontSize: '12px', fontWeight: '500', lineHeight: '1.4', letterSpacing: '0.02em' }
  }
}

// Professional component styles - glassmorphism and subtle effects
export const components = {
  card: {
    background: 'linear-gradient(135deg, rgba(22, 27, 38, 0.8) 0%, rgba(15, 20, 25, 0.95) 100%)',
    backdropFilter: 'blur(10px)',
    border: `1px solid rgba(255, 255, 255, 0.08)`,
    borderRadius: borders.radius.xl,
    boxShadow: shadows.card,
    padding: spacing.lg
  },
  
  button: {
    primary: {
      background: `linear-gradient(135deg, #C53030 0%, #9B2C2C 100%)`,
      color: colors.text.primary,
      border: `1px solid rgba(197, 48, 48, 0.4)`,
      borderRadius: borders.radius.lg,
      boxShadow: `0 2px 8px rgba(197, 48, 48, 0.2)`,
      fontWeight: '500',
      fontSize: '13px',
      letterSpacing: '0.01em',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
    },
    secondary: {
      background: 'rgba(255, 255, 255, 0.05)',
      color: colors.text.secondary,
      border: `1px solid rgba(255, 255, 255, 0.1)`,
      borderRadius: borders.radius.lg,
      transition: 'all 0.2s ease'
    },
    tertiary: {
      color: colors.text.secondary,
      textDecoration: 'underline',
      textUnderlineOffset: '4px',
      transition: 'all 0.2s ease'
    }
  },

  input: {
    background: colors.background.tertiary,
    border: `1px solid rgba(255, 255, 255, 0.1)`,
    borderRadius: borders.radius.md,
    color: colors.text.primary,
    padding: `${spacing.sm} ${spacing.md}`,
    transition: 'all 0.2s ease'
  },

  modal: {
    background: colors.background.modal,
    backdropFilter: 'blur(20px)',
    border: `1px solid rgba(255, 255, 255, 0.08)`,
    borderRadius: borders.radius.xl,
    boxShadow: shadows.modal,
    padding: spacing.xl
  }
}

// Professional gradients - subtle and sophisticated
export const gradients = {
  primary: `linear-gradient(135deg, #C53030 0%, #9B2C2C 100%)`,
  silver: `linear-gradient(135deg, #334155 0%, #1e293b 100%)`,
  subtle: `linear-gradient(135deg, #0F1419 0%, #161B26 100%)`,
  glass: `linear-gradient(135deg, rgba(22, 27, 38, 0.8) 0%, rgba(15, 20, 25, 0.95) 100%)`,
  glow: `linear-gradient(135deg, rgba(197, 48, 48, 0.05) 0%, transparent 100%)`
}


// Animation presets
export const animations = {
  fadeIn: {
    from: { opacity: 0, transform: 'translateY(10px)' },
    to: { opacity: 1, transform: 'translateY(0)' }
  },
  slideIn: {
    from: { transform: 'translateX(-100%)' },
    to: { transform: 'translateX(0)' }
  },
  scaleIn: {
    from: { transform: 'scale(0.95)', opacity: 0 },
    to: { transform: 'scale(1)', opacity: 1 }
  }
}
