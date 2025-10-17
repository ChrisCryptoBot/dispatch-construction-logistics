import React, { useState } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext-fixed'
import { Bell, Settings, User, LogOut, Sun, Moon, ChevronDown, Truck, Users, MessageSquare } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { messageAPI } from '../services/messageAPI'
import { notificationAPI } from '../services/notificationAPI'

const S1Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showMessages, setShowMessages] = useState(false)

  // Fetch unread counts
  const { data: unreadMessages = 0 } = useQuery({
    queryKey: ['unread-messages'],
    queryFn: messageAPI.getUnreadCount,
    refetchInterval: 30000 // Refetch every 30 seconds
  })

  const { data: unreadNotifications = 0 } = useQuery({
    queryKey: ['unread-notifications'],
    queryFn: notificationAPI.getUnreadCount,
    refetchInterval: 30000
  })

  // Fetch recent threads for messages dropdown
  const { data: recentThreads = [] } = useQuery({
    queryKey: ['message-threads-recent'],
    queryFn: messageAPI.getThreads,
    select: (data) => data.slice(0, 4) // Only show 4 most recent
  })

  // Fetch recent notifications for dropdown
  const { data: recentNotifications = [] } = useQuery({
    queryKey: ['notifications-recent'],
    queryFn: notificationAPI.list,
    select: (data) => data.slice(0, 5) // Only show 5 most recent
  })

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header
      style={{
        height: '72px',
        background: theme.colors.headerBg,
        borderBottom: `1px solid ${theme.colors.headerBorder}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Left Side - Search or Breadcrumbs */}
      <div style={{ flex: 1 }}>
        <input
          type="text"
          placeholder="Search loads, drivers, equipment..."
          style={{
            background: theme.colors.inputBg,
            border: `1px solid ${theme.colors.inputBorder}`,
            borderRadius: '12px',
            padding: '12px 16px',
            fontSize: '14px',
            color: theme.colors.textPrimary,
            width: '100%',
            maxWidth: '400px',
            outline: 'none',
          }}
        />
      </div>

      {/* Right Side - Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          style={{
            background: 'transparent',
            border: 'none',
            color: theme.colors.textSecondary,
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = theme.colors.backgroundHover
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
          }}
        >
          {theme.name === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Messages */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowMessages(!showMessages)}
            style={{
              background: 'transparent',
              border: 'none',
              color: theme.colors.textSecondary,
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = theme.colors.backgroundHover
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
            }}
          >
            <MessageSquare size={20} />
            {unreadMessages > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  width: '18px',
                  height: '18px',
                  background: theme.colors.primary,
                  borderRadius: '50%',
                  fontSize: '10px',
                  fontWeight: '600',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {unreadMessages > 9 ? '9+' : unreadMessages}
              </span>
            )}
          </button>

          {showMessages && (
            <div
              style={{
                position: 'absolute',
                top: '48px',
                right: 0,
                width: '380px',
                background: theme.colors.backgroundCard,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: '12px',
                boxShadow: theme.shadow.medium,
                zIndex: 1000,
                maxHeight: '500px',
                overflowY: 'auto',
              }}
            >
              <div style={{
                padding: '16px',
                borderBottom: `1px solid ${theme.colors.border}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <h3
                  style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: theme.colors.textPrimary,
                    margin: 0,
                  }}
                >
                  Messages
                </h3>
                <button
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: theme.colors.primary,
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Mark all read
                </button>
              </div>

              {/* Recent Messages */}
              {recentThreads.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: theme.colors.textSecondary }}>
                  <p style={{ margin: 0, fontSize: '14px' }}>No messages yet</p>
                </div>
              ) : (
                recentThreads.map((thread) => {
                  const otherParticipant = thread.participants.find(p => p.id !== user?.id)
                  return (
                    <div
                      key={thread.id}
                      onClick={() => {
                        setShowMessages(false)
                        navigate('/messages')
                      }}
                      style={{
                        padding: '16px',
                        borderBottom: `1px solid ${theme.colors.border}`,
                        cursor: 'pointer',
                        background: thread.unreadCount > 0 ? `${theme.colors.primary}05` : 'transparent',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = theme.colors.backgroundHover
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = thread.unreadCount > 0 ? `${theme.colors.primary}05` : 'transparent'
                      }}
                    >
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: theme.colors.primary,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: '600',
                            flexShrink: 0,
                          }}
                        >
                          {otherParticipant?.name.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '4px',
                          }}>
                            <span style={{
                              fontSize: '14px',
                              fontWeight: thread.unreadCount > 0 ? '600' : '500',
                              color: theme.colors.textPrimary,
                            }}>
                              {otherParticipant?.name}
                            </span>
                            {thread.unreadCount > 0 && (
                              <span style={{
                                fontSize: '10px',
                                fontWeight: '600',
                                background: theme.colors.primary,
                                color: 'white',
                                borderRadius: '10px',
                                padding: '2px 6px',
                                minWidth: '18px',
                                textAlign: 'center',
                              }}>
                                {thread.unreadCount}
                              </span>
                            )}
                          </div>
                          <p style={{
                            fontSize: '13px',
                            color: theme.colors.textSecondary,
                            margin: 0,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}>
                            {thread.lastMessage}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}

              <div style={{
                padding: '12px 16px',
                textAlign: 'center',
                borderTop: `1px solid ${theme.colors.border}`
              }}>
                <button
                  onClick={() => {
                    setShowMessages(false)
                    navigate('/messages')
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: theme.colors.primary,
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    width: '100%',
                    padding: '8px',
                  }}
                >
                  View all messages
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              background: 'transparent',
              border: 'none',
              color: theme.colors.textSecondary,
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = theme.colors.backgroundHover
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
            }}
          >
            <Bell size={20} />
            {unreadNotifications > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  width: '8px',
                  height: '8px',
                  background: theme.colors.error,
                  borderRadius: '50%',
                }}
              />
            )}
          </button>

          {showNotifications && (
            <div
              style={{
                position: 'absolute',
                top: '48px',
                right: 0,
                width: '320px',
                background: theme.colors.backgroundCard,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: '12px',
                boxShadow: theme.shadow.medium,
                padding: '16px',
                zIndex: 1000,
              }}
            >
              <h3
                style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: theme.colors.textPrimary,
                  margin: '0 0 12px 0',
                }}
              >
                Notifications
              </h3>
              {recentNotifications.length === 0 ? (
                <p style={{ color: theme.colors.textSecondary, fontSize: '14px', margin: 0 }}>
                  No new notifications
                </p>
              ) : (
                <div>
                  {recentNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        if (notif.actionUrl) {
                          setShowNotifications(false)
                          navigate(notif.actionUrl)
                        }
                      }}
                      style={{
                        padding: '12px 0',
                        borderBottom: `1px solid ${theme.colors.border}`,
                        cursor: notif.actionUrl ? 'pointer' : 'default',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        if (notif.actionUrl) e.currentTarget.style.opacity = '0.7'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '1'
                      }}
                    >
                      <p style={{ 
                        fontSize: '13px', 
                        fontWeight: '600',
                        color: theme.colors.textPrimary, 
                        margin: '0 0 4px 0' 
                      }}>
                        {notif.title}
                      </p>
                      <p style={{ 
                        fontSize: '12px', 
                        color: theme.colors.textSecondary, 
                        margin: 0 
                      }}>
                        {notif.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '8px 12px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = theme.colors.backgroundHover
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: theme.colors.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: '600',
                fontSize: '14px',
              }}
            >
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div style={{ textAlign: 'left' }}>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: theme.colors.textPrimary,
                }}
              >
                {user?.name || 'User'}
              </div>
              <div
                style={{
                  fontSize: '12px',
                  color: theme.colors.textSecondary,
                }}
              >
                {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) || 'Role'}
              </div>
            </div>
            <ChevronDown size={16} color={theme.colors.textSecondary} />
          </button>

          {showProfileMenu && (
            <div
              style={{
                position: 'absolute',
                top: '56px',
                right: 0,
                width: '220px',
                background: theme.colors.backgroundCard,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: '12px',
                boxShadow: theme.shadow.medium,
                padding: '8px',
                zIndex: 999,
              }}
            >
              {/* Role Switcher for Development */}
              {(user?.role === 'admin' || user?.role === 'SUPER_ADMIN') && (
                <>
                  <div style={{ 
                    padding: '8px 12px', 
                    fontSize: '12px', 
                    color: theme.colors.textSecondary,
                    fontWeight: '600',
                    borderBottom: `1px solid ${theme.colors.border}`,
                    marginBottom: '8px'
                  }}>
                    Switch View
                  </div>
                  <button
                    onClick={() => {
                      navigate('/carrier-dashboard')
                      setShowProfileMenu(false)
                    }}
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '12px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      fontSize: '14px',
                      color: theme.colors.textPrimary,
                      transition: 'all 0.2s',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = theme.colors.backgroundHover
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    <Truck size={16} color={theme.colors.textSecondary} />
                    Carrier Dashboard
                  </button>
                  <button
                    onClick={() => {
                      navigate('/customer-dashboard')
                      setShowProfileMenu(false)
                    }}
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '12px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      fontSize: '14px',
                      color: theme.colors.textPrimary,
                      transition: 'all 0.2s',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = theme.colors.backgroundHover
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    <Users size={16} color={theme.colors.textSecondary} />
                    Customer Dashboard
                  </button>
                  <button
                    onClick={() => {
                      navigate('/admin-dashboard')
                      setShowProfileMenu(false)
                    }}
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '12px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      fontSize: '14px',
                      color: theme.colors.textPrimary,
                      transition: 'all 0.2s',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = theme.colors.backgroundHover
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    <Settings size={16} color={theme.colors.textSecondary} />
                    Admin Dashboard
                  </button>
                  <div style={{ 
                    padding: '8px 12px', 
                    fontSize: '12px', 
                    color: theme.colors.textSecondary,
                    fontWeight: '600',
                    borderTop: `1px solid ${theme.colors.border}`,
                    marginTop: '8px'
                  }}>
                    Account
                  </div>
                </>
              )}

              <button
                onClick={() => {
                  navigate('/settings')
                  setShowProfileMenu(false)
                }}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '12px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '14px',
                  color: theme.colors.textPrimary,
                  transition: 'all 0.2s',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = theme.colors.backgroundHover
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                <User size={16} color={theme.colors.textSecondary} />
                Profile
              </button>

              <button
                onClick={() => {
                  navigate('/settings')
                  setShowProfileMenu(false)
                }}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '12px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '14px',
                  color: theme.colors.textPrimary,
                  transition: 'all 0.2s',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = theme.colors.backgroundHover
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                <Settings size={16} />
                Settings
              </button>

              <div
                style={{
                  height: '1px',
                  background: theme.colors.border,
                  margin: '8px 0',
                }}
              />

              <button
                onClick={handleLogout}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '12px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '14px',
                  color: theme.colors.error,
                  transition: 'all 0.2s',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = theme.colors.backgroundHover
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default S1Header

