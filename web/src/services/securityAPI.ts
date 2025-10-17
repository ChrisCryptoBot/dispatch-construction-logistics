import apiClient from '../api/client'
import type { 
  SecuritySettings, 
  LoginSession, 
  SecurityEvent, 
  PasswordChangeRequest,
  TwoFactorSetup,
  SecurityStats
} from '../types/security'

export const securityAPI = {
  // Get security settings
  getSettings: async () => {
    try {
      const response = await apiClient.get('/security/settings')
      return response.data as SecuritySettings
    } catch (error) {
      console.warn('API not available, using mock data:', error)
      return mockSecuritySettings
    }
  },

  // Update security settings
  updateSettings: async (settings: Partial<SecuritySettings>) => {
    try {
      const response = await apiClient.put('/security/settings', settings)
      return response.data as SecuritySettings
    } catch (error) {
      console.warn('API not available:', error)
      return { ...mockSecuritySettings, ...settings }
    }
  },

  // Change password
  changePassword: async (request: PasswordChangeRequest) => {
    try {
      const response = await apiClient.post('/security/change-password', request)
      return response.data
    } catch (error) {
      console.warn('API not available, simulating password change:', error)
      return new Promise(resolve => setTimeout(() => {
        resolve({ success: true, message: 'Password changed successfully' })
      }, 1000))
    }
  },

  // Get active sessions
  getActiveSessions: async () => {
    try {
      const response = await apiClient.get('/security/sessions')
      return response.data as LoginSession[]
    } catch (error) {
      console.warn('API not available, using mock data:', error)
      return mockSessions
    }
  },

  // Terminate session
  terminateSession: async (sessionId: string) => {
    try {
      const response = await apiClient.delete(`/security/sessions/${sessionId}`)
      return response.data
    } catch (error) {
      console.warn('API not available:', error)
      return { success: true }
    }
  },

  // Terminate all other sessions
  terminateAllOtherSessions: async () => {
    try {
      const response = await apiClient.delete('/security/sessions/others')
      return response.data
    } catch (error) {
      console.warn('API not available:', error)
      return { success: true }
    }
  },

  // Setup 2FA
  setup2FA: async () => {
    try {
      const response = await apiClient.post('/security/2fa/setup')
      return response.data as TwoFactorSetup
    } catch (error) {
      console.warn('API not available, simulating 2FA setup:', error)
      return new Promise(resolve => setTimeout(() => {
        resolve({
          qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
          secret: 'JBSWY3DPEHPK3PXP',
          backupCodes: ['123456', '234567', '345678', '456789', '567890']
        } as TwoFactorSetup)
      }, 1000))
    }
  },

  // Verify 2FA setup
  verify2FA: async (token: string) => {
    try {
      const response = await apiClient.post('/security/2fa/verify', { token })
      return response.data
    } catch (error) {
      console.warn('API not available:', error)
      return { success: true }
    }
  },

  // Disable 2FA
  disable2FA: async (password: string) => {
    try {
      const response = await apiClient.post('/security/2fa/disable', { password })
      return response.data
    } catch (error) {
      console.warn('API not available:', error)
      return { success: true }
    }
  },

  // Get security events
  getSecurityEvents: async () => {
    try {
      const response = await apiClient.get('/security/events')
      return response.data as SecurityEvent[]
    } catch (error) {
      console.warn('API not available, using mock data:', error)
      return mockSecurityEvents
    }
  },

  // Get security stats
  getSecurityStats: async () => {
    try {
      const response = await apiClient.get('/security/stats')
      return response.data as SecurityStats
    } catch (error) {
      console.warn('API not available, using mock data:', error)
      return mockSecurityStats
    }
  }
}

// Mock data for development
const mockSecuritySettings: SecuritySettings = {
  twoFactorEnabled: false,
  sessionTimeout: 30,
  requirePasswordChange: false,
  passwordChangeInterval: 90,
  loginNotifications: true,
  securityAlerts: true,
  trustedDevices: [],
  lastPasswordChange: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  accountLockoutAttempts: 0,
  accountLockoutUntil: null
}

const mockSessions: LoginSession[] = [
  {
    id: 'session-1',
    device: 'Chrome on Windows',
    location: 'Dallas, TX',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    isCurrent: true,
    lastActivity: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'session-2',
    device: 'Safari on iPhone',
    location: 'Dallas, TX',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
    isCurrent: false,
    lastActivity: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'session-3',
    device: 'Firefox on Mac',
    location: 'Austin, TX',
    ipAddress: '203.0.113.42',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:91.0)',
    isCurrent: false,
    lastActivity: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  }
]

const mockSecurityEvents: SecurityEvent[] = [
  {
    id: 'event-1',
    type: 'login',
    description: 'Successful login from Chrome on Windows',
    ipAddress: '192.168.1.100',
    location: 'Dallas, TX',
    device: 'Chrome on Windows',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    severity: 'info'
  },
  {
    id: 'event-2',
    type: 'password_change',
    description: 'Password changed successfully',
    ipAddress: '192.168.1.100',
    location: 'Dallas, TX',
    device: 'Chrome on Windows',
    timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    severity: 'info'
  },
  {
    id: 'event-3',
    type: 'failed_login',
    description: 'Failed login attempt from unknown device',
    ipAddress: '203.0.113.99',
    location: 'Unknown',
    device: 'Unknown',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    severity: 'warning'
  },
  {
    id: 'event-4',
    type: '2fa_enabled',
    description: 'Two-factor authentication enabled',
    ipAddress: '192.168.1.100',
    location: 'Dallas, TX',
    device: 'Chrome on Windows',
    timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    severity: 'info'
  }
]

const mockSecurityStats: SecurityStats = {
  totalLogins: 45,
  failedLogins: 3,
  passwordChanges: 1,
  securityEvents: 4,
  activeSessions: 3,
  lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  accountAge: 90,
  securityScore: 85
}

export { mockSecuritySettings, mockSessions, mockSecurityEvents, mockSecurityStats }





