export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'error' | 'success'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  timestamp: Date
  read: boolean
  actionUrl?: string
  metadata?: any
}

export interface CalendarNotification extends Notification {
  eventId: string
  eventType: 'load' | 'maintenance' | 'compliance' | 'driver' | 'custom'
  eventDate: Date
  reminderType: 'upcoming' | 'due' | 'overdue' | 'reminder'
}

class NotificationService {
  private static instance: NotificationService
  private notifications: Notification[] = []
  private listeners: ((notifications: Notification[]) => void)[] = []
  private checkInterval: NodeJS.Timeout | null = null

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }
    return NotificationService.instance
  }

  // Subscribe to notification updates
  subscribe(listener: (notifications: Notification[]) => void): () => void {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  // Notify all listeners
  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.notifications]))
  }

  // Add notification
  addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): void {
    const newNotification: Notification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false
    }

    this.notifications.unshift(newNotification)
    
    // Keep only last 100 notifications
    if (this.notifications.length > 100) {
      this.notifications = this.notifications.slice(0, 100)
    }

    this.notifyListeners()

    // Show browser notification if permission granted
    this.showBrowserNotification(newNotification)
  }

  // Create calendar event notifications
  createCalendarNotification(
    eventId: string,
    eventType: CalendarNotification['eventType'],
    eventDate: Date,
    reminderType: CalendarNotification['reminderType'],
    title: string,
    message: string,
    priority: Notification['priority'] = 'medium'
  ): void {
    const notification: CalendarNotification = {
      id: `calendar-${eventId}-${reminderType}-${Date.now()}`,
      title,
      message,
      type: this.getNotificationType(priority),
      priority,
      timestamp: new Date(),
      read: false,
      eventId,
      eventType,
      eventDate,
      reminderType
    }

    this.notifications.unshift(notification)
    this.notifyListeners()
    this.showBrowserNotification(notification)
  }

  // Get notification type based on priority
  private getNotificationType(priority: string): Notification['type'] {
    switch (priority) {
      case 'urgent': return 'error'
      case 'high': return 'warning'
      case 'medium': return 'info'
      case 'low': return 'success'
      default: return 'info'
    }
  }

  // Show browser notification
  private async showBrowserNotification(notification: Notification): Promise<void> {
    if ('Notification' in window && Notification.permission === 'granted') {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        tag: notification.id,
        requireInteraction: notification.priority === 'urgent' || notification.priority === 'high'
      })

      browserNotification.onclick = () => {
        window.focus()
        browserNotification.close()
      }
      browserNotification.onshow = () => {
        setTimeout(() => browserNotification.close(), 5000)
      }
    }
  }

  // Request notification permission
  async requestPermission(): Promise<boolean> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }
    return false
  }

  // Mark notification as read
  markAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId)
    if (notification) {
      notification.read = true
      this.notifyListeners()
    }
  }

  // Mark all notifications as read
  markAllAsRead(): void {
    this.notifications.forEach(notification => {
      notification.read = true
    })
    this.notifyListeners()
  }

  // Remove notification
  removeNotification(notificationId: string): void {
    this.notifications = this.notifications.filter(n => n.id !== notificationId)
    this.notifyListeners()
  }

  // Clear all notifications
  clearAllNotifications(): void {
    this.notifications = []
    this.notifyListeners()
  }

  // Get all notifications
  getAllNotifications(): Notification[] {
    return [...this.notifications]
  }

  // Get unread notifications
  getUnreadNotifications(): Notification[] {
    return this.notifications.filter(n => !n.read)
  }

  // Get notifications by type
  getNotificationsByType(type: Notification['type']): Notification[] {
    return this.notifications.filter(n => n.type === type)
  }

  // Get notifications by priority
  getNotificationsByPriority(priority: Notification['priority']): Notification[] {
    return this.notifications.filter(n => n.priority === priority)
  }

  // Get unread count
  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length
  }

  // Start checking for upcoming events
  startEventMonitoring(calendarSyncService: any): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
    }

    this.checkInterval = setInterval(() => {
      this.checkUpcomingEvents(calendarSyncService)
    }, 60000) // Check every minute
  }

  // Stop monitoring
  stopEventMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
    }
  }

  // Check for upcoming events and create notifications
  private checkUpcomingEvents(calendarSyncService: any): void {
    const events = calendarSyncService.getAllEvents()
    const now = new Date()
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000)
    const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000)

    events.forEach(event => {
      const eventDate = new Date(event.start)
      const timeDiff = eventDate.getTime() - now.getTime()
      const hoursUntilEvent = timeDiff / (1000 * 60 * 60)

      // Skip if event is in the past or already completed
      if (timeDiff < 0 || event.status === 'completed' || event.status === 'cancelled') {
        return
      }

      // Check for 1 hour reminder
      if (hoursUntilEvent <= 1 && hoursUntilEvent > 0) {
        this.createCalendarNotification(
          event.id,
          event.type as any,
          eventDate,
          'reminder',
          `Upcoming Event: ${event.title}`,
          `${event.title} is starting in less than 1 hour. ${event.location ? `Location: ${event.location}` : ''}`,
          event.priority
        )
      }
      // Check for 24 hour reminder
      else if (hoursUntilEvent <= 24 && hoursUntilEvent > 23) {
        this.createCalendarNotification(
          event.id,
          event.type as any,
          eventDate,
          'upcoming',
          `Tomorrow: ${event.title}`,
          `${event.title} is scheduled for tomorrow. ${event.location ? `Location: ${event.location}` : ''}`,
          event.priority
        )
      }
      // Check for overdue events
      else if (timeDiff < 0 && event.status === 'scheduled') {
        this.createCalendarNotification(
          event.id,
          event.type as any,
          eventDate,
          'overdue',
          `Overdue: ${event.title}`,
          `${event.title} was scheduled for ${eventDate.toLocaleDateString()} but hasn't been completed.`,
          'urgent'
        )
      }
    })
  }

  // Create load booking notification
  createLoadBookingNotification(loadNumber: string, customer: string, pickupDate: Date): void {
    this.addNotification({
      title: 'New Load Booked',
      message: `Load ${loadNumber} has been booked for ${customer}. Pickup scheduled for ${pickupDate.toLocaleDateString()}.`,
      type: 'success',
      priority: 'medium',
      actionUrl: '/loads'
    })
  }

  // Create maintenance notification
  createMaintenanceNotification(vehicleNumber: string, serviceType: string, scheduledDate: Date): void {
    this.addNotification({
      title: 'Maintenance Scheduled',
      message: `${serviceType} has been scheduled for ${vehicleNumber} on ${scheduledDate.toLocaleDateString()}.`,
      type: 'info',
      priority: 'medium',
      actionUrl: '/fleet-management'
    })
  }

  // Create compliance notification
  createComplianceNotification(entity: string, type: string, dueDate: Date): void {
    this.addNotification({
      title: 'Compliance Deadline',
      message: `${type} for ${entity} is due on ${dueDate.toLocaleDateString()}.`,
      type: 'warning',
      priority: 'high',
      actionUrl: '/compliance'
    })
  }

  // Create driver notification
  createDriverNotification(driverName: string, type: string, dueDate: Date): void {
    this.addNotification({
      title: 'Driver Action Required',
      message: `${type} for ${driverName} is due on ${dueDate.toLocaleDateString()}.`,
      type: 'info',
      priority: 'medium',
      actionUrl: '/drivers'
    })
  }
}

export default NotificationService


