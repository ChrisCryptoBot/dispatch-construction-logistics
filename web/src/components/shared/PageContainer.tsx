import React, { type ReactNode } from 'react'
import { useTheme } from '../../../contexts/ThemeContext'

interface PageContainerProps {
  title: string
  subtitle?: string
  icon?: React.ComponentType<{ size?: number; color?: string }>
  children: ReactNode
  headerAction?: ReactNode
  fullWidth?: boolean
}

const PageContainer: React.FC<PageContainerProps> = ({
  title,
  subtitle,
  icon: Icon,
  children,
  headerAction,
  fullWidth = false
}) => {
  const { theme } = useTheme()

  return (
    <div style={{
      maxWidth: fullWidth ? '100%' : '1600px',
      margin: '0 auto',
      padding: '24px',
      color: theme.colors.textPrimary,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      {/* Page Header */}
      <div style={{
        background: theme.colors.backgroundCard,
        borderRadius: '16px',
        padding: '32px',
        marginBottom: '24px',
        border: `1px solid ${theme.colors.border}`,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ flex: 1 }}>
            <h1 style={{
              fontSize: '32px',
              fontWeight: '700',
              color: theme.colors.textPrimary,
              margin: '0 0 8px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              {Icon && (
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.accent} 100%)`,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 4px 16px ${theme.colors.primary}40`
                }}>
                  <Icon size={24} color="white" />
                </div>
              )}
              {title}
            </h1>
            {subtitle && (
              <p style={{
                color: theme.colors.textSecondary,
                fontSize: '16px',
                margin: 0
              }}>
                {subtitle}
              </p>
            )}
          </div>
          {headerAction && (
            <div>{headerAction}</div>
          )}
        </div>
      </div>

      {/* Page Content */}
      <div>{children}</div>
    </div>
  )
}

export default PageContainer

