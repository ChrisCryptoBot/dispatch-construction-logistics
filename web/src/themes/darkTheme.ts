import type { Theme } from '../types/theme'

export const darkTheme: Theme = {
  name: 'dark',
  colors: {
    // Primary colors - Muted professional red
    primary: '#9F1239',
    onPrimary: '#ffffff',
    secondary: '#fca5a5',
    onSecondary: '#000000',

    // Backgrounds - Dark with depth
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
    backgroundPrimary: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
    backgroundSecondary: 'linear-gradient(135deg, #334155 0%, #475569 100%)',
    backgroundTertiary: 'linear-gradient(135deg, #475569 0%, #64748b 100%)',
    backgroundCard: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
    backgroundCardHover: 'linear-gradient(135deg, #334155 0%, #475569 100%)',
    backgroundHover: 'linear-gradient(135deg, #475569 0%, #64748b 100%)',

    // Sidebar - Professional dark with subtle depth
    sidebarBg: 'linear-gradient(180deg, rgba(15, 23, 42, 0.98) 0%, rgba(15, 23, 42, 0.95) 100%)',
    sidebarBorder: 'rgba(255, 255, 255, 0.1)',
    sidebarItemActive: '#ffffff',
    sidebarItemHover: 'rgba(255, 255, 255, 0.1)',

    // Header - Dark with subtle gradient
    headerBg: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
    headerBorder: '#475569',

    // Text - Light for dark backgrounds
    textPrimary: '#f8fafc',
    textSecondary: '#cbd5e1',
    textTertiary: '#94a3b8',
    onBackground: '#f8fafc',
    onSurface: '#f8fafc',

    // Accents - Muted red palette
    primaryHover: '#881337',
    primaryLight: '#fee2e2',
    accent: '#fca5a5',

    // Status - Professional muted tones
    success: '#059669',
    warning: '#D97706',
    error: '#f87171',
    info: '#0284C7',

    // Borders - Lighter for dark mode
    border: '#64748b',
    borderLight: '#475569',
    borderHover: '#94a3b8',

    // Inputs - Dark mode inputs
    inputBg: '#374151',
    inputBorder: '#4b5563',
    inputFocus: '#9F1239',

    // Surface
    surface: '#1e293b'
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
    subtle: '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px 0 rgba(0, 0, 0, 0.2)',
    medium: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
    strong: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
    accent: '0 0 0 3px rgba(159, 18, 57, 0.3)',
    glow: '0 0 20px rgba(159, 18, 57, 0.5)'
  }
}
