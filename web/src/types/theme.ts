export type ThemeName = 'light' | 'dark'

export interface Palette {
  // Primary colors
  primary: string
  onPrimary: string
  secondary: string
  onSecondary: string
  
  // Backgrounds
  background: string
  backgroundPrimary: string
  backgroundSecondary: string
  backgroundTertiary: string
  backgroundCard: string
  backgroundCardHover: string
  backgroundHover: string
  
  // Sidebar
  sidebarBg: string
  sidebarBorder: string
  sidebarItemActive: string
  sidebarItemHover: string
  
  // Header
  headerBg: string
  headerBorder: string
  
  // Text
  textPrimary: string
  textSecondary: string
  textTertiary: string
  onBackground: string
  onSurface: string
  
  // Accents
  primaryHover: string
  primaryLight: string
  accent: string
  
  // Status
  success: string
  warning: string
  error: string
  info: string
  
  // Borders
  border: string
  borderLight: string
  borderHover: string
  
  // Inputs
  inputBg: string
  inputBorder: string
  inputFocus: string
  
  // Surface
  surface: string
}

export interface Theme {
  name: ThemeName
  colors: Palette
  spacing: {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
  }
  borderRadius: {
    sm: string
    md: string
    lg: string
    full: string
  }
  shadow: {
    subtle: string
    medium: string
    strong: string
    accent: string
    glow: string
  }
}

// Helper functions
export const isDark = (theme: Theme): boolean => theme.name === 'dark'
export const isLight = (theme: Theme): boolean => theme.name === 'light'

// Token convenience helpers
export const tokens = (t: Theme) => ({
  bg: t.colors.background,
  text: t.colors.textPrimary,
  card: t.colors.backgroundCard,
  cardText: t.colors.textPrimary,
  border: t.colors.border,
  primary: t.colors.primary,
  secondary: t.colors.secondary,
})
