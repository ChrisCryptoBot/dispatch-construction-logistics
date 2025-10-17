export interface PrivacySettings {
  allowAnalytics: boolean
  shareWithPartners: boolean
  personalizedAds: boolean
  usageReports: boolean
  dataRetention: number // days
  cookieConsent: boolean
  thirdPartyTracking: boolean
  marketingEmails: boolean
}

export interface DataExportRequest {
  userId: string
  requestedAt: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  downloadUrl?: string
  expiresAt?: string
  fileSize?: number
  format: 'json' | 'csv' | 'pdf'
}

export interface DataDeletionRequest {
  userId: string
  requestedAt: string
  scheduledFor: string
  status: 'pending' | 'scheduled' | 'processing' | 'completed' | 'cancelled'
  reason?: string
  confirmationCode: string
}

export interface DataUsage {
  totalStorageUsed: number // bytes
  documentCount: number
  loadCount: number
  messageCount: number
  invoiceCount: number
  lastUpdated: string
}

export interface PrivacyAuditLog {
  id: string
  action: 'settings_changed' | 'data_exported' | 'data_deleted' | 'consent_granted' | 'consent_revoked'
  description: string
  timestamp: string
  ipAddress: string
  userAgent: string
}

export interface GDPRCompliance {
  dataProcessingBasis: 'consent' | 'contract' | 'legal_obligation' | 'legitimate_interest'
  consentDate?: string
  dataController: {
    name: string
    email: string
    address: string
  }
  dataProtectionOfficer: {
    name: string
    email: string
  }
  retentionPolicy: string
  internationalTransfers: boolean
}






