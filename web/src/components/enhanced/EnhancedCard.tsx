import React, { type ReactNode } from 'react'

interface EnhancedCardProps {
  children: ReactNode
  title?: string
  subtitle?: string
  icon?: ReactNode
  action?: ReactNode
  hover?: boolean
  className?: string
  style?: React.CSSProperties
  onClick?: () => void
  variant?: 'glass' | 'solid' | 'gradient'
  animateOnMount?: boolean
}

/**
 * Enhanced Card Component with Glassmorphism
 * Non-breaking addition - use alongside existing Card component
 */
const EnhancedCard: React.FC<EnhancedCardProps> = ({
  children,
  title,
  subtitle,
  icon,
  action,
  hover = false,
  className = '',
  style = {},
  onClick,
  variant = 'glass',
  animateOnMount = true
}) => {
  const variantClasses = {
    glass: 'glass-card',
    solid: 'bg-bg-secondary border border-border-medium shadow-lgx',
    gradient: 'glass-card duotone-red'
  }

  return (
    <div
      className={`
        ${variantClasses[variant]}
        ${hover ? 'lift-on-hover' : ''}
        ${animateOnMount ? 'bounce-on-load' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      style={{
        padding: '28px',
        borderRadius: '16px',
        ...style
      }}
      onClick={onClick}
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
              <div className="scale-on-hover" style={{
                width: '40px',
                height: '40px',
                background: 'rgba(197, 48, 48, 0.15)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(8px)'
              }}>
                {icon}
              </div>
            )}
            <div>
              {title && (
                <h2 className="text-fluid-xl" style={{
                  fontWeight: '600',
                  color: 'var(--text/primary)',
                  margin: '0'
                }}>
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-fluid-sm" style={{
                  color: 'var(--text/secondary)',
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

export default EnhancedCard


