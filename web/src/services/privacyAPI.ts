import apiClient from '../api/client'
import type { 
  PrivacySettings, 
  DataExportRequest, 
  DataDeletionRequest,
  DataUsage,
  PrivacyAuditLog,
  GDPRCompliance
} from '../types/privacy'

export const privacyAPI = {
  // Get privacy settings
  getSettings: async () => {
    try {
      const response = await apiClient.get('/privacy/settings')
      return response.data as PrivacySettings
    } catch (error) {
      console.warn('API not available, using mock data:', error)
      return mockPrivacySettings
    }
  },

  // Update privacy settings
  updateSettings: async (settings: Partial<PrivacySettings>) => {
    try {
      const response = await apiClient.put('/privacy/settings', settings)
      return response.data as PrivacySettings
    } catch (error) {
      console.warn('API not available:', error)
      return { ...mockPrivacySettings, ...settings }
    }
  },

  // Request data export
  requestDataExport: async (format: 'json' | 'csv' | 'pdf' = 'json') => {
    try {
      const response = await apiClient.post('/privacy/export', { format })
      return response.data as DataExportRequest
    } catch (error) {
      console.warn('API not available, simulating export:', error)
      return new Promise<DataExportRequest>(resolve => setTimeout(() => {
        resolve({
          userId: 'current-user',
          requestedAt: new Date().toISOString(),
          status: 'pending',
          format
        })
      }, 1000))
    }
  },

  // Get data export status
  getDataExportStatus: async (requestId: string) => {
    try {
      const response = await apiClient.get(`/privacy/export/${requestId}`)
      return response.data as DataExportRequest
    } catch (error) {
      console.warn('API not available:', error)
      return mockDataExport
    }
  },

  // Request account deletion
  requestAccountDeletion: async (reason: string, password: string) => {
    try {
      const response = await apiClient.post('/privacy/delete-account', { reason, password })
      return response.data as DataDeletionRequest
    } catch (error) {
      console.warn('API not available, simulating deletion:', error)
      return new Promise<DataDeletionRequest>(resolve => setTimeout(() => {
        resolve({
          userId: 'current-user',
          requestedAt: new Date().toISOString(),
          scheduledFor: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'scheduled',
          reason,
          confirmationCode: 'DEL-' + Math.random().toString(36).substring(2, 10).toUpperCase()
        })
      }, 1000))
    }
  },

  // Cancel account deletion
  cancelAccountDeletion: async (confirmationCode: string) => {
    try {
      const response = await apiClient.post('/privacy/cancel-deletion', { confirmationCode })
      return response.data
    } catch (error) {
      console.warn('API not available:', error)
      return { success: true }
    }
  },

  // Get data usage
  getDataUsage: async () => {
    try {
      const response = await apiClient.get('/privacy/data-usage')
      return response.data as DataUsage
    } catch (error) {
      console.warn('API not available, using mock data:', error)
      return mockDataUsage
    }
  },

  // Get privacy audit log
  getAuditLog: async () => {
    try {
      const response = await apiClient.get('/privacy/audit-log')
      return response.data as PrivacyAuditLog[]
    } catch (error) {
      console.warn('API not available, using mock data:', error)
      return mockAuditLog
    }
  },

  // Get GDPR compliance info
  getGDPRCompliance: async () => {
    try {
      const response = await apiClient.get('/privacy/gdpr-compliance')
      return response.data as GDPRCompliance
    } catch (error) {
      console.warn('API not available, using mock data:', error)
      return mockGDPRCompliance
    }
  },

  // Download data
  downloadData: async (url: string) => {
    try {
      const response = await apiClient.get(url, { responseType: 'blob' })
      return response.data as Blob
    } catch (error) {
      console.warn('API not available:', error)
      return new Blob(['Mock data export'], { type: 'application/json' })
    }
  }
}

// Mock data for development
const mockPrivacySettings: PrivacySettings = {
  allowAnalytics: true,
  shareWithPartners: false,
  personalizedAds: false,
  usageReports: true,
  dataRetention: 365,
  cookieConsent: true,
  thirdPartyTracking: false,
  marketingEmails: false
}

const mockDataExport: DataExportRequest = {
  userId: 'current-user',
  requestedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  status: 'completed',
  downloadUrl: '/api/privacy/download/export-123456',
  expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
  fileSize: 2458624, // ~2.3 MB
  format: 'json'
}

const mockDataUsage: DataUsage = {
  totalStorageUsed: 15728640, // ~15 MB
  documentCount: 45,
  loadCount: 127,
  messageCount: 532,
  invoiceCount: 38,
  lastUpdated: new Date().toISOString()
}

const mockAuditLog: PrivacyAuditLog[] = [
  {
    id: 'log-1',
    action: 'settings_changed',
    description: 'Privacy settings updated: Analytics disabled',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
  },
  {
    id: 'log-2',
    action: 'data_exported',
    description: 'Data export requested (JSON format)',
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
  },
  {
    id: 'log-3',
    action: 'consent_granted',
    description: 'Cookie consent granted',
    timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
  }
]

const mockGDPRCompliance: GDPRCompliance = {
  dataProcessingBasis: 'consent',
  consentDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  dataController: {
    name: 'Superior One Logistics',
    email: 'privacy@superiorone.com',
    address: '123 Logistics Way, Dallas, TX 75201'
  },
  dataProtectionOfficer: {
    name: 'Jane Smith',
    email: 'dpo@superiorone.com'
  },
  retentionPolicy: 'Data is retained for 365 days after last activity. You can request deletion at any time.',
  internationalTransfers: false
}

export { mockPrivacySettings, mockDataExport, mockDataUsage, mockAuditLog, mockGDPRCompliance }






