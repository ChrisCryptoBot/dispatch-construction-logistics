import React, { useState } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext-fixed'
import { Bell, Settings, User, LogOut, Sun, Moon, ChevronDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const S1Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

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
            }}
          >
            <Bell size={20} />
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
              <p style={{ color: theme.colors.textSecondary, fontSize: '14px' }}>
                No new notifications
              </p>
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
                  color: '#000000',
                }}
              >
                {user?.name || 'User'}
              </div>
              <div
                style={{
                  fontSize: '12px',
                  color: '#374151',
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
              <button
                onClick={() => {
                  navigate('/profile')
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
                  color: '#000000',
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
                <User size={16} />
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
                  color: '#000000',
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

