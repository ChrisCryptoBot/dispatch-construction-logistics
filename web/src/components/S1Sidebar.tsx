import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from '../../../contexts/ThemeContext'
import { Logo } from './ui/Logo'
import {
  LayoutDashboard,
  Truck,
  Package,
  Users,
  MapPin,
  FileText,
  DollarSign,
  Settings,
  BarChart3,
  Calendar,
  Shield,
  ChevronLeft,
  ChevronRight,
  Layers,
  ClipboardList,
  Scale,
  Building2,
} from 'lucide-react'

interface NavItem {
  name: string
  path: string
  icon: React.ReactNode
  badge?: number
}

interface S1SidebarProps {
  isCollapsed: boolean
  onToggleCollapse: () => void
}

const S1Sidebar: React.FC<S1SidebarProps> = ({ isCollapsed, onToggleCollapse }) => {
  const { theme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  const navItems: NavItem[] = [
    { name: 'Dashboard', path: '/carrier-dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Load Board', path: '/loads', icon: <Package size={20} /> },
    { name: 'My Loads', path: '/my-loads', icon: <Layers size={20} /> },
    { name: 'Drivers', path: '/drivers', icon: <Users size={20} /> },
    { name: 'Fleet', path: '/fleet', icon: <Truck size={20} /> },
    { name: 'Dispatch', path: '/dispatch', icon: <MapPin size={20} /> },
    { name: 'Scale Tickets', path: '/scale-tickets', icon: <Scale size={20} /> },
    { name: 'BOL Templates', path: '/bol-templates', icon: <ClipboardList size={20} /> },
    { name: 'Documents', path: '/documents', icon: <FileText size={20} /> },
    { name: 'Factoring', path: '/factoring', icon: <DollarSign size={20} /> },
    { name: 'Invoices', path: '/invoices', icon: <Building2 size={20} /> },
    { name: 'Compliance', path: '/compliance', icon: <Shield size={20} /> },
    { name: 'Calendar', path: '/calendar', icon: <Calendar size={20} /> },
    { name: 'Analytics', path: '/analytics', icon: <BarChart3 size={20} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <div
      style={{
        width: isCollapsed ? '80px' : '280px',
        height: '100vh',
        background: theme.colors.sidebarBg,
        borderRight: `1px solid ${theme.colors.sidebarBorder}`,
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: 0,
        top: 0,
        transition: 'width 0.3s ease',
        zIndex: 200,
        boxShadow: theme.name === 'light' ? '2px 0 8px rgba(0, 0, 0, 0.08)' : '2px 0 8px rgba(0, 0, 0, 0.3)',
      }}
    >
      {/* Logo Section */}
      <div
        style={{
          padding: isCollapsed ? '20px 16px' : '20px 24px',
          borderBottom: `1px solid ${theme.colors.sidebarBorder}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
          background: `linear-gradient(135deg, ${theme.colors.primary}15 0%, ${theme.colors.primary}05 100%)`,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        }}
      >
        {!isCollapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Logo variant="dark" size="md" />
          </div>
        )}
        {isCollapsed && (
          <Logo variant="dark" size="sm" />
        )}
      </div>

      {/* Navigation Items */}
      <nav
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: isCollapsed ? '16px 8px' : '16px 16px',
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
                padding: isCollapsed ? '14px' : '14px 16px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '4px',
                transition: 'all 0.2s ease',
                color: active ? theme.colors.primary : '#000000',
                fontSize: '15px',
                fontWeight: active ? '600' : '500',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                position: 'relative',
              }}
            >
              <div style={{ 
                minWidth: '20px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                {item.icon}
              </div>
              {!isCollapsed && (
                <>
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
                </>
              )}
              {isCollapsed && item.badge && (
                <span
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    width: '8px',
                    height: '8px',
                    background: theme.colors.error,
                    borderRadius: '50%',
                  }}
                />
              )}
            </button>
          )
        })}
      </nav>

      {/* Quick Filters */}
      {!isCollapsed && (
        <div
          style={{
            padding: '16px',
            borderTop: `1px solid ${theme.colors.sidebarBorder}`,
          }}
        >
          <h3
            style={{
              fontSize: '12px',
              fontWeight: '700',
              color: '#000000',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              margin: '0 0 12px 0',
            }}
          >
            Quick Filters
          </h3>
          {['Active', 'Pending', 'In Transit', 'Delivered'].map((filter) => (
            <button
              key={filter}
              style={{
                width: '100%',
                background: 'transparent',
                border: `1px solid ${theme.colors.borderLight}`,
                cursor: 'pointer',
                padding: '10px 12px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '8px',
                transition: 'all 0.2s',
                fontSize: '14px',
                color: '#000000',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = theme.colors.backgroundHover
                e.currentTarget.style.borderColor = theme.colors.border
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.borderColor = theme.colors.borderLight
              }}
            >
              <span>{filter}</span>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: theme.colors.textSecondary,
                }}
              >
                {Math.floor(Math.random() * 20)}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Collapse Toggle */}
      <button
        onClick={onToggleCollapse}
        style={{
          width: '100%',
          background: theme.colors.backgroundHover,
          border: 'none',
          cursor: 'pointer',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: theme.colors.textSecondary,
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = theme.colors.sidebarItemHover
          e.currentTarget.style.color = theme.colors.primary
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = theme.colors.backgroundHover
          e.currentTarget.style.color = theme.colors.textSecondary
        }}
      >
        {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>
    </div>
  )
}

export default S1Sidebar

