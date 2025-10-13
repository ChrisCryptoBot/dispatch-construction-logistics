import React, { useState, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { 
  Bell, CheckCircle, AlertTriangle, Info, X, 
  ClipboardList, UserCheck, Truck, CreditCard, 
  Settings as SettingsIcon, XCircle
} from 'lucide-react'

interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: Date
  priority: 'low' | 'medium' | 'high' | 'critical'
  category: 'load' | 'driver' | 'fleet' | 'payment' | 'system'
  read: boolean
}

const NotificationSystem = () => {
  const { theme } = useTheme()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  // Simulate real-time notifications
  useEffect(() => {
    const sampleNotifications: Notification[] = [
      {
        id: '1',
        type: 'success',
        title: 'Load Completed',
        message: 'LT-1234 has been successfully delivered to I-35 Bridge Project',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        priority: 'medium',
        category: 'load',
        read: false
      },
      {
        id: '2',
        type: 'warning',
        title: 'Driver Alert',
        message: 'John Smith is approaching his 11-hour driving limit',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        priority: 'high',
        category: 'driver',
        read: false
      },
      {
        id: '3',
        type: 'info',
        title: 'New Load Available',
        message: 'High-priority crushed stone load available in DFW North',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        priority: 'medium',
        category: 'load',
        read: true
      },
      {
        id: '4',
        type: 'success',
        title: 'Payment Received',
        message: 'QuickPay of $1,125 received for LT-1234',
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
        priority: 'low',
        category: 'payment',
        read: true
      },
      {
        id: '5',
        type: 'error',
        title: 'Equipment Issue',
        message: 'Truck #24 requires immediate maintenance - brake system alert',
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
        priority: 'critical',
        category: 'fleet',
        read: false
      }
    ]

    setNotifications(sampleNotifications)
    setUnreadCount(sampleNotifications.filter(n => !n.read).length)

    // Simulate new notifications
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const newNotification: Notification = {
          id: Date.now().toString(),
          type: ['info', 'success', 'warning'][Math.floor(Math.random() * 3)] as any,
          title: 'System Update',
          message: 'Real-time data synchronization completed',
          timestamp: new Date(),
          priority: 'low',
          category: 'system',
          read: false
        }
        setNotifications(prev => [newNotification, ...prev.slice(0, 9)])
        setUnreadCount(prev => prev + 1)
      }
    }, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const getNotificationIcon = (category: string, type: string) => {
    if (category === 'load') return type === 'success' ? CheckCircle : ClipboardList
    if (category === 'driver') return UserCheck
    if (category === 'fleet') return type === 'error' ? AlertTriangle : Truck
    if (category === 'payment') return CreditCard
    if (category === 'system') return SettingsIcon
    return Bell
  }

  const getNotificationColor = (type: string, priority: string) => {
    if (priority === 'critical') return '#ef4444'
    if (type === 'error') return '#ef4444'
    if (type === 'warning') return '#f59e0b'
    if (type === 'success') return '#10b981'
    return '#3b82f6'
  }

  const getPriorityBadge = (priority: string) => {
    const priorityMap: { [key: string]: { label: string; color: string } } = {
      critical: { label: 'Critical', color: '#ef4444' },
      high: { label: 'High', color: '#f59e0b' },
      medium: { label: 'Medium', color: '#3b82f6' },
      low: { label: 'Low', color: '#6b7280' }
    }
    return priorityMap[priority] || priorityMap.low
  }

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    )
    setUnreadCount(0)
  }

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Notification Bell */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        style={{
          position: 'relative',
          padding: '14px',
          backgroundColor: 'transparent',
          border: 'none',
          borderRadius: '12px',
          cursor: 'pointer',
          color: theme.colors.textSecondary,
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = theme.colors.backgroundTertiary
          e.currentTarget.style.color = theme.colors.textPrimary
          e.currentTarget.style.transform = 'scale(1.05)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent'
          e.currentTarget.style.color = theme.colors.textSecondary
          e.currentTarget.style.transform = 'scale(1)'
        }}
      >
        <Bell style={{ height: '26px', width: '26px' }} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '6px',
            right: '6px',
            width: '22px',
            height: '22px',
            backgroundColor: '#dc2626',
            color: 'white',
            fontSize: '11px',
            fontWeight: 'bold',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `3px solid ${theme.colors.backgroundCard}`,
            boxShadow: '0 2px 8px rgba(220, 38, 38, 0.4)'
          }}>
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {showDropdown && (
        <div className="notification-scroll" style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: '8px',
          width: '400px',
          maxHeight: '500px',
          backgroundColor: theme.colors.backgroundCard,
          borderRadius: '12px',
          border: `1px solid ${theme.colors.border}`,
          boxShadow: theme.shadow.subtle,
          zIndex: 999,
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            padding: '16px 20px',
            borderBottom: `1px solid ${theme.colors.border}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{
              color: '#000000',
              fontSize: '16px',
              fontWeight: '600',
              margin: 0
            }}>
              Notifications
            </h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  style={{
                    padding: '4px 8px',
                    backgroundColor: 'transparent',
                    color: theme.colors.primary,
                    border: `1px solid ${theme.colors.primary}`,
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Mark All Read
                </button>
              )}
              <button
                onClick={() => setShowDropdown(false)}
                style={{
                  padding: '4px',
                  backgroundColor: 'transparent',
                  color: theme.colors.textSecondary,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <X style={{ height: '16px', width: '16px' }} />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="notification-scroll" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{
                padding: '40px 20px',
                textAlign: 'center',
                color: theme.colors.textSecondary,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px'
              }}>
                <Bell style={{ height: '32px', width: '32px', opacity: 0.5 }} />
                <p style={{ margin: 0 }}>No notifications</p>
              </div>
            ) : (
              notifications.map((notification) => {
                const IconComponent = getNotificationIcon(notification.category, notification.type)
                return (
                <div
                  key={notification.id}
                  onClick={() => markAsRead(notification.id)}
                  style={{
                    padding: '16px 20px',
                    borderBottom: `1px solid ${theme.colors.border}`,
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease',
                    backgroundColor: notification.read ? 'transparent' : `${theme.colors.backgroundTertiary}40`,
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.colors.backgroundTertiary
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = notification.read ? 'transparent' : `${theme.colors.backgroundTertiary}40`
                  }}
                >
                  {!notification.read && (
                    <div style={{
                      position: 'absolute',
                      left: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '4px',
                      height: '4px',
                      backgroundColor: '#dc2626',
                      borderRadius: '50%'
                    }}></div>
                  )}
                  
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginLeft: notification.read ? '0' : '12px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: `${getNotificationColor(notification.type, notification.priority)}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <IconComponent 
                        style={{ 
                          color: getNotificationColor(notification.type, notification.priority),
                          height: '16px',
                          width: '16px'
                        }}
                      />
                    </div>
                    
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                        <h4 style={{
                          color: '#000000',
                          fontSize: '14px',
                          fontWeight: '600',
                          margin: 0,
                          lineHeight: 1.3
                        }}>
                          {notification.title}
                        </h4>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <span style={{
                            backgroundColor: getPriorityBadge(notification.priority).color + '20',
                            color: getPriorityBadge(notification.priority).color,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: '600',
                            textTransform: 'uppercase'
                          }}>
                            {getPriorityBadge(notification.priority).label}
                          </span>
                          <span style={{
                            color: theme.colors.textSecondary,
                            fontSize: '12px'
                          }}>
                            {formatTimeAgo(notification.timestamp)}
                          </span>
                        </div>
                      </div>
                      <p style={{
                        color: theme.colors.textSecondary,
                        fontSize: '13px',
                        margin: 0,
                        lineHeight: 1.4
                      }}>
                        {notification.message}
                      </p>
                    </div>
                  </div>
                </div>
              )})
            )}
          </div>

          {/* Footer */}
          <div style={{
            padding: '12px 20px',
            borderTop: `1px solid ${theme.colors.border}`,
            backgroundColor: theme.colors.background
          }}>
            <button
              onClick={() => setShowDropdown(false)}
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: 'transparent',
                color: theme.colors.primary,
                border: `1px solid ${theme.colors.primary}`,
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              View All Notifications
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationSystem
