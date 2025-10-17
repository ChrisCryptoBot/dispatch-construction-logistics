import apiClient from '../api/client'
import type { 
  Notification, 
  NotificationFilters, 
  NotificationStats, 
  NotificationPreferences,
  NotificationType 
} from '../types/notification'

export const notificationAPI = {
  // Get all notifications
  list: async (filters?: NotificationFilters) => {
    try {
      const params = new URLSearchParams()
      if (filters?.type) params.append('type', filters.type)
      if (filters?.priority) params.append('priority', filters.priority)
      if (filters?.unreadOnly) params.append('unreadOnly', 'true')
      if (filters?.dateRange) {
        params.append('startDate', filters.dateRange.start)
        params.append('endDate', filters.dateRange.end)
      }

      const response = await apiClient.get(`/notifications?${params.toString()}`)
      return response.data as Notification[]
    } catch (error) {
      console.warn('API not available, using mock data:', error)
      return mockNotifications
    }
  },

  // Get notification by ID
  getById: async (id: string) => {
    try {
      const response = await apiClient.get(`/notifications/${id}`)
      return response.data as Notification
    } catch (error) {
      console.warn('API not available, using mock data:', error)
      return mockNotifications.find(n => n.id === id)
    }
  },

  // Mark as read
  markAsRead: async (id: string) => {
    try {
      const response = await apiClient.patch(`/notifications/${id}/read`)
      return response.data
    } catch (error) {
      console.warn('API not available:', error)
      return { success: true }
    }
  },

  // Mark all as read
  markAllAsRead: async () => {
    try {
      const response = await apiClient.patch('/notifications/read-all')
      return response.data
    } catch (error) {
      console.warn('API not available:', error)
      return { success: true }
    }
  },

  // Delete notification
  delete: async (id: string) => {
    try {
      await apiClient.delete(`/notifications/${id}`)
      return { success: true }
    } catch (error) {
      console.warn('API not available:', error)
      return { success: true }
    }
  },

  // Get notification stats
  getStats: async () => {
    try {
      const response = await apiClient.get('/notifications/stats')
      return response.data as NotificationStats
    } catch (error) {
      console.warn('API not available, using mock data:', error)
      return {
        total: 12,
        unread: 5,
        byType: {
          load_update: 4,
          payment: 2,
          compliance: 3,
          maintenance: 1,
          document: 1,
          bid: 1,
          driver: 0,
          system: 0
        },
        byPriority: {
          info: 8,
          warning: 3,
          critical: 1
        }
      } as NotificationStats
    }
  },

  // Get user preferences
  getPreferences: async () => {
    try {
      const response = await apiClient.get('/notifications/preferences')
      return response.data as NotificationPreferences
    } catch (error) {
      console.warn('API not available, using mock data:', error)
      return mockPreferences
    }
  },

  // Update preferences
  updatePreferences: async (preferences: Partial<NotificationPreferences>) => {
    try {
      const response = await apiClient.put('/notifications/preferences', preferences)
      return response.data as NotificationPreferences
    } catch (error) {
      console.warn('API not available:', error)
      return mockPreferences
    }
  },

  // Get unread count
  getUnreadCount: async () => {
    try {
      const response = await apiClient.get('/notifications/unread-count')
      return response.data.count as number
    } catch (error) {
      console.warn('API not available, using mock data:', error)
      return 5
    }
  }
}

// Mock data for development
const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    userId: 'current-user',
    type: 'load_update',
    title: 'Load Delivered',
    message: 'Load LT-1234 has been delivered to Houston, TX',
    priority: 'info',
    actionUrl: '/my-loads?id=LT-1234',
    actionText: 'View Load',
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    metadata: {
      loadId: 'LT-1234',
      status: 'delivered'
    }
  },
  {
    id: 'notif-2',
    userId: 'current-user',
    type: 'payment',
    title: 'Payment Received',
    message: 'Invoice INV-2024-001 paid: $2,500.00',
    priority: 'info',
    actionUrl: '/invoices?id=INV-2024-001',
    actionText: 'View Invoice',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    metadata: {
      invoiceId: 'INV-2024-001',
      amount: 2500
    }
  },
  {
    id: 'notif-3',
    userId: 'current-user',
    type: 'compliance',
    title: 'License Expiring Soon',
    message: 'Driver John Smith license expires in 7 days',
    priority: 'warning',
    actionUrl: '/drivers?id=john-smith',
    actionText: 'Update License',
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    metadata: {
      driverId: 'john-smith'
    }
  },
  {
    id: 'notif-4',
    userId: 'current-user',
    type: 'maintenance',
    title: 'Maintenance Completed',
    message: 'Vehicle TRK-101 oil change completed',
    priority: 'info',
    actionUrl: '/fleet?id=TRK-101',
    actionText: 'View Vehicle',
    readAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    metadata: {
      vehicleId: 'TRK-101'
    }
  },
  {
    id: 'notif-5',
    userId: 'current-user',
    type: 'compliance',
    title: 'DOT Inspection Due',
    message: 'Vehicle TRK-102 DOT inspection due in 3 days',
    priority: 'critical',
    actionUrl: '/fleet?id=TRK-102',
    actionText: 'Schedule Inspection',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    metadata: {
      vehicleId: 'TRK-102'
    }
  }
]

const mockPreferences: NotificationPreferences = {
  userId: 'current-user',
  emailNotifications: true,
  smsNotifications: false,
  pushNotifications: true,
  types: {
    load_update: { enabled: true, email: true, sms: false, push: true },
    payment: { enabled: true, email: true, sms: true, push: true },
    compliance: { enabled: true, email: true, sms: true, push: true },
    maintenance: { enabled: true, email: false, sms: false, push: true },
    document: { enabled: true, email: false, sms: false, push: true },
    bid: { enabled: true, email: true, sms: false, push: true },
    driver: { enabled: true, email: false, sms: false, push: true },
    system: { enabled: true, email: false, sms: false, push: false }
  }
}

export { mockNotifications, mockPreferences }






