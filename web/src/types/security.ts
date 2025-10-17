export interface SecuritySettings {
  twoFactorEnabled: boolean
  sessionTimeout: number
  requirePasswordChange: boolean
  passwordChangeInterval: number
  loginNotifications: boolean
  securityAlerts: boolean
  trustedDevices: string[]
  lastPasswordChange: string
  accountLockoutAttempts: number
  accountLockoutUntil: string | null
}

export interface PasswordChangeRequest {
  currentPassword: string
  newPassword: string
}

export interface LoginSession {
  id: string
  device: string
  location: string
  ipAddress: string
  userAgent: string
  isCurrent: boolean
  lastActivity: string
  createdAt: string
}

export interface SecurityEvent {
  id: string
  type: 'login' | 'logout' | 'password_change' | 'failed_login' | '2fa_enabled' | '2fa_disabled' | 'session_terminated'
  description: string
  ipAddress: string
  location: string
  device: string
  timestamp: string
  severity: 'info' | 'warning' | 'critical'
}

export interface TwoFactorSetup {
  qrCode: string
  secret: string
  backupCodes: string[]
}

export interface SecurityStats {
  totalLogins: number
  failedLogins: number
  passwordChanges: number
  securityEvents: number
  activeSessions: number
  lastLogin: string
  accountAge: number
  securityScore: number
}





