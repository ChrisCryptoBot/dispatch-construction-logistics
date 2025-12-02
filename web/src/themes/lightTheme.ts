import type { Theme } from '../types/theme'

export const lightTheme: Theme = {
  name: 'light',
  colors: {
    // Primary colors - Muted professional red
    primary: '#9F1239',
    onPrimary: '#ffffff',
    secondary: '#7c2d12',
    onSecondary: '#ffffff',

    // Backgrounds - Light with subtle gradients and depth
    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
    backgroundPrimary: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    backgroundSecondary: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
    backgroundTertiary: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)',
    backgroundCard: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    backgroundCardHover: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
    backgroundHover: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)',

    // Sidebar - Subtle gradient for depth while maintaining contrast
    sidebarBg: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
    sidebarBorder: '#cbd5e1',
    sidebarItemActive: '#9F1239',
    sidebarItemHover: '#e2e8f0',

    // Header - Light with clear border
    headerBg: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    headerBorder: '#cbd5e1',

    // Text - Very dark for maximum contrast
    textPrimary: '#000000',
    textSecondary: '#1e293b',
    textTertiary: '#334155',
    onBackground: '#000000',
    onSurface: '#000000',

    // Accents - Muted red palette
    primaryHover: '#881337',
    primaryLight: '#fee2e2',
    accent: '#7c2d12',

    // Status - Professional muted tones
    success: '#059669',
    warning: '#D97706',
    error: '#f87171',
    info: '#0284C7',

    // Borders - Darker and more defined for better structure
    border: '#94a3b8',
    borderLight: '#cbd5e1',
    borderHover: '#64748b',

    // Inputs - Light gray background with dark text
    inputBg: '#f1f5f9',
    inputBorder: '#cbd5e1',
    inputFocus: '#9F1239',

    // Surface
    surface: '#ffffff'
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px'
  },
  borderRadius: {
    sm: '6px',
    md: '12px',
    lg: '16px',
    full: '50%'
  },
  shadow: {
    subtle: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    medium: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    strong: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    accent: '0 0 0 3px rgba(159, 18, 57, 0.1)',
    glow: '0 0 20px rgba(159, 18, 57, 0.3)'
  }
}
