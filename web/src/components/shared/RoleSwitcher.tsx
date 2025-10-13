import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from '../../../contexts/ThemeContext'
import { Truck, Building, Check } from 'lucide-react'
import { colors, shadows, borders, spacing, gradients } from '../styles/design-system'

const RoleSwitcher = () => {
  const { theme } = useTheme()
  const [showDropdown, setShowDropdown] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  // Determine current role based on route
  const currentRole = location.pathname.includes('/customer-dashboard') || location.pathname.includes('/shipper-dashboard') ? 'customer' : 'carrier'
  
  const roles = [
    {
      id: 'carrier',
      label: 'Carrier Dashboard',
      icon: Truck,
      path: '/carrier-dashboard',
      description: 'Fleet management & operations'
    },
    {
      id: 'customer',
      label: 'Customer Dashboard', 
      icon: Building,
      path: '/customer-dashboard',
      description: 'Load tracking & analytics'
    }
  ]

  const currentRoleData = roles.find(role => role.id === currentRole)

  const handleRoleSwitch = (role: typeof roles[0]) => {
    navigate(role.path)
    setShowDropdown(false)
  }

  const CurrentIcon = currentRoleData?.icon || Truck

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        style={{
          width: '44px',
          height: '44px',
          background: theme.colors.backgroundTertiary,
          border: `1px solid ${theme.colors.border}`,
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: theme.shadow.subtle,
          position: 'relative'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = theme.colors.backgroundCard
          e.currentTarget.style.borderColor = theme.colors.primary
          e.currentTarget.style.transform = 'scale(1.05)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = theme.colors.backgroundTertiary
          e.currentTarget.style.borderColor = theme.colors.border
          e.currentTarget.style.transform = 'scale(1)'
        }}
      >
        <CurrentIcon style={{
          color: theme.colors.textPrimary,
          height: '20px',
          width: '20px'
        }} />
        
        {/* Active indicator dot */}
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          width: '8px',
          height: '8px',
          backgroundColor: currentRole === 'carrier' ? '#10b981' : '#3b82f6',
          borderRadius: '50%',
          border: `2px solid ${theme.colors.backgroundTertiary}`,
          boxShadow: '0 0 4px rgba(0,0,0,0.3)'
        }} />
      </button>

      {/* Dropdown Menu */}
      {showDropdown && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: '8px',
          width: '280px',
          backgroundColor: theme.colors.backgroundCard,
          borderRadius: '12px',
          border: `1px solid ${theme.colors.border}`,
          boxShadow: theme.shadow.subtle,
          zIndex: 1000,
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            padding: '16px',
            borderBottom: `1px solid ${theme.colors.border}`,
            backgroundColor: theme.colors.background
          }}>
            <h3 style={{
              color: theme.colors.textPrimary,
              fontSize: '14px',
              fontWeight: '700',
              margin: '0 0 4px 0'
            }}>
              Switch Dashboard
            </h3>
            <p style={{
              color: theme.colors.textSecondary,
              fontSize: '12px',
              margin: 0
            }}>
              Choose your operational view
            </p>
          </div>

          {/* Role Options */}
          <div style={{ padding: '8px' }}>
            {roles.map((role) => {
              const RoleIcon = role.icon
              return (
              <button
                key={role.id}
                onClick={() => handleRoleSwitch(role)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  backgroundColor: currentRole === role.id ? theme.colors.primary : 'transparent',
                  borderRadius: '8px',
                  border: 'none',
                  color: currentRole === role.id ? 'white' : theme.colors.textPrimary,
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left',
                  marginBottom: '4px'
                }}
                onMouseEnter={(e) => {
                  if (currentRole !== role.id) {
                    e.currentTarget.style.backgroundColor = theme.colors.backgroundTertiary
                    e.currentTarget.style.color = theme.colors.textPrimary
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentRole !== role.id) {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.color = theme.colors.textPrimary
                  }
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  backgroundColor: currentRole === role.id ? 'rgba(255,255,255,0.2)' : theme.colors.backgroundTertiary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <RoleIcon style={{
                    color: currentRole === role.id ? 'white' : theme.colors.textSecondary,
                    height: '16px',
                    width: '16px'
                  }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    marginBottom: '2px'
                  }}>
                    {role.label}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: currentRole === role.id ? 'rgba(255,255,255,0.8)' : theme.colors.textSecondary
                  }}>
                    {role.description}
                  </div>
                </div>
                {currentRole === role.id && (
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Check style={{ color: theme.colors.primary, height: '14px', width: '14px' }} />
                  </div>
                )}
              </button>
            )})}
          </div>

          {/* Footer */}
          <div style={{
            padding: '12px 16px',
            borderTop: `1px solid ${theme.colors.border}`,
            backgroundColor: theme.colors.background
          }}>
            <p style={{
              color: theme.colors.textSecondary,
              fontSize: '11px',
              margin: 0,
              textAlign: 'center'
            }}>
              {currentRole === 'carrier' 
                ? 'Currently viewing: Carrier Operations' 
                : 'Currently viewing: Customer Portal'
              }
            </p>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {showDropdown && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  )
}

export default RoleSwitcher
