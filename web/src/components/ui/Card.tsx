import React, { type ReactNode, type CSSProperties } from 'react'
import { useTheme } from '../../../contexts/ThemeContext'

interface CardProps {
  title?: string
  subtitle?: string
  children: ReactNode
  icon?: ReactNode
  action?: ReactNode
  padding?: string
  noBorder?: boolean
  onClick?: () => void
  hover?: boolean
  style?: CSSProperties
  className?: string
}

const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  children,
  icon,
  action,
  padding = '28px',
  noBorder = false,
  onClick,
  hover = false,
  style = {},
  className = ''
}) => {
  const { theme } = useTheme()
  const [isHovered, setIsHovered] = React.useState(false)

  // Determine if we should use enhanced styles or theme styles
  const useEnhancedStyles = className.includes('enhanced-card')
  
  return (
    <div
      className={className}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        // Only apply theme styles if not using enhanced styles
        ...(useEnhancedStyles ? {} : {
          background: theme.colors.backgroundCard,
          border: noBorder ? 'none' : `1px solid ${theme.colors.border}`,
          boxShadow: isHovered && hover ? '0 8px 24px rgba(0, 0, 0, 0.15)' : '0 4px 12px rgba(0, 0, 0, 0.1)',
        }),
        // Always apply these styles
        borderRadius: '16px',
        padding,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        transform: isHovered && hover ? 'translateY(-2px)' : 'translateY(0)',
        ...style
      }}
    >
      {(title || action) && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: subtitle || children ? '20px' : 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
            {icon && (
              <div style={{
                width: '40px',
                height: '40px',
                background: `${theme.colors.primary}20`,
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {icon}
              </div>
            )}
            <div>
              {title && (
                <h2 style={{
                  fontSize: '22px',
                  fontWeight: '700',
                  color: theme.colors.textPrimary,
                  margin: '0'
                }}>
                  {title}
                </h2>
              )}
              {subtitle && (
                <p style={{
                  fontSize: '14px',
                  color: theme.colors.textSecondary,
                  margin: '4px 0 0 0'
                }}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  )
}

export default Card

