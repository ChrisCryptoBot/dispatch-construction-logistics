export type NotificationType = 
  | 'load_update'
  | 'payment'
  | 'compliance'
  | 'maintenance'
  | 'document'
  | 'bid'
  | 'driver'
  | 'system'

export type NotificationPriority = 'info' | 'warning' | 'critical'

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  priority: NotificationPriority
  actionUrl?: string
  actionText?: string
  readAt?: string
  createdAt: string
  metadata?: NotificationMetadata
}

export interface NotificationMetadata {
  loadId?: string
  invoiceId?: string
  vehicleId?: string
  driverId?: string
  documentId?: string
  bidId?: string
  amount?: number
  status?: string
}

export interface NotificationFilters {
  type?: NotificationType
  priority?: NotificationPriority
  unreadOnly?: boolean
  dateRange?: {
    start: string
    end: string
  }
}

export interface NotificationStats {
  total: number
  unread: number
  byType: Record<NotificationType, number>
  byPriority: Record<NotificationPriority, number>
}

export interface NotificationPreferences {
  userId: string
  emailNotifications: boolean
  smsNotifications: boolean
  pushNotifications: boolean
  types: Record<NotificationType, {
    enabled: boolean
    email: boolean
    sms: boolean
    push: boolean
  }>
}






