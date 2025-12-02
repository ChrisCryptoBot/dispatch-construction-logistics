import React, { useState, type ReactNode } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext-fixed'
import { Logo } from './ui/Logo'
import {
  LayoutDashboard,
  Package,
  MapPin,
  FileText,
  DollarSign,
  Settings,
  Calendar,
  Building2,
  Users,
  Bell,
  User,
  LogOut,
  Sun,
  Moon,
  ChevronDown,
  PlusCircle,
  Truck,
} from 'lucide-react'

interface CustomerLayoutProps {
  children: ReactNode
}

interface NavItem {
  name: string
  path: string
  icon: React.ReactNode
  badge?: number
}

const CustomerLayout: React.FC<CustomerLayoutProps> = ({ children }) => {
  const { theme, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  const navItems: NavItem[] = [
    { name: 'Dashboard', path: '/customer-dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'My Loads', path: '/customer/loads', icon: <Package size={20} /> },
    { name: 'Truck Board', path: '/customer/truck-board', icon: <Truck size={20} /> },
    { name: 'Job Sites', path: '/customer/job-sites', icon: <MapPin size={20} /> },
    { name: 'Schedule', path: '/customer/schedule', icon: <Calendar size={20} /> },
    { name: 'Documents', path: '/customer/documents', icon: <FileText size={20} /> },
    { name: 'Invoices', path: '/customer/invoices', icon: <Building2 size={20} /> },
    { name: 'Carriers', path: '/customer/carriers', icon: <Users size={20} /> },
    { name: 'Billing', path: '/customer/billing', icon: <DollarSign size={20} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
  ]

  const isActive = (path: string) => location.pathname === path

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: theme.colors.background,
        color: theme.colors.textPrimary,
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: '280px',
          height: '100vh',
          background: theme.colors.sidebarBg,
          borderRight: `1px solid ${theme.colors.sidebarBorder}`,
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          left: 0,
          top: 0,
          zIndex: 200,
          boxShadow: theme.name === 'light' ? '2px 0 8px rgba(0, 0, 0, 0.08)' : '2px 0 8px rgba(0, 0, 0, 0.3)',
        }}
      >
        {/* Logo Section */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: `1px solid ${theme.colors.sidebarBorder}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: `linear-gradient(135deg, ${theme.colors.primary}15 0%, ${theme.colors.primary}05 100%)`,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Logo variant="dark" size="md" />
          </div>
        </div>

        {/* Quick Action */}
        <div style={{ padding: '16px' }}>
          <button
            onClick={() => navigate('/customer/post-load')}
            style={{
              width: '100%',
              background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primaryHover} 100%)`,
              border: 'none',
              cursor: 'pointer',
              padding: '14px 16px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              color: '#fff',
              fontSize: '15px',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(197, 48, 48, 0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(197, 48, 48, 0.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(197, 48, 48, 0.3)'
            }}
          >
            <PlusCircle size={20} />
            Post New Load
          </button>
        </div>

        {/* Navigation Items */}
        <nav
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '8px 16px',
          }}
        >
          {navItems.map((item) => {
            const active = isActive(item.path)
            const hovered = hoveredItem === item.name

            return (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                onMouseEnter={() => setHoveredItem(item.name)}
                onMouseLeave={() => setHoveredItem(null)}
                style={{
                  width: '100%',
                  background: active 
                    ? theme.colors.sidebarItemActive 
                    : hovered 
                    ? theme.colors.sidebarItemHover 
                    : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '4px',
                  transition: 'all 0.2s ease',
                  color: active ? '#ffffff' : theme.colors.textPrimary,
                  fontSize: '15px',
                  fontWeight: active ? '600' : '500',
                  justifyContent: 'flex-start',
                }}
              >
                <div style={{ 
                  minWidth: '20px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: active ? '#ffffff' : theme.colors.textPrimary,
                }}>
                  {React.cloneElement(item.icon as React.ReactElement, {
                    color: active ? '#ffffff' : theme.colors.textPrimary,
                    stroke: active ? '#ffffff' : theme.colors.textPrimary,
                  })}
                </div>
                <span style={{ flex: 1, textAlign: 'left' }}>{item.name}</span>
                {item.badge && (
                  <span
                    style={{
                      background: theme.colors.error,
                      color: '#fff',
                      fontSize: '11px',
                      fontWeight: '600',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      minWidth: '20px',
                      textAlign: 'center',
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Status Card */}
        <div
          style={{
            padding: '16px',
            borderTop: `1px solid ${theme.colors.sidebarBorder}`,
          }}
        >
          <div
            style={{
              background: `linear-gradient(135deg, ${theme.colors.success}20 0%, ${theme.colors.success}10 100%)`,
              padding: '16px',
              borderRadius: '12px',
              border: `1px solid ${theme.colors.success}30`,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', color: theme.colors.textSecondary, fontWeight: '600' }}>
                Active Loads
              </span>
              <span style={{ fontSize: '18px', color: theme.colors.success, fontWeight: '700' }}>
                {Math.floor(Math.random() * 20)}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', color: theme.colors.textSecondary, fontWeight: '600' }}>
                In Transit
              </span>
              <span style={{ fontSize: '18px', color: theme.colors.primary, fontWeight: '700' }}>
                {Math.floor(Math.random() * 15)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          marginLeft: '280px',
        }}
      >
        {/* Header */}
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
          {/* Search */}
          <div style={{ flex: 1 }}>
            <input
              type="text"
              placeholder="Search loads, carriers, job sites..."
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

          {/* Header Actions */}
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
            </div>

            {/* Profile */}
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
                  {user?.name?.charAt(0).toUpperCase() || 'C'}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary }}>
                    {user?.name || 'Customer'}
                  </div>
                  <div style={{ fontSize: '12px', color: theme.colors.textSecondary }}>
                    Customer
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
                      color: theme.colors.textPrimary,
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
                      color: theme.colors.textPrimary,
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

                  <div style={{ height: '1px', background: theme.colors.border, margin: '8px 0' }} />

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
                      textAlign: 'left',
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

        {/* Page Content */}
        <main
          style={{
            flex: 1,
            padding: '32px',
            overflowY: 'auto',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  )
}

export default CustomerLayout

