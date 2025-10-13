import React, { type ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'
  size?: 'sm' | 'md' | 'lg'
  pulse?: boolean
  dot?: boolean
  className?: string
}

/**
 * Enhanced Badge Component
 * With optional pulse animation for notifications
 */
const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  pulse = false,
  dot = false,
  className = ''
}) => {
  const sizes = {
    sm: { padding: '2px 6px', fontSize: '10px' },
    md: { padding: '4px 10px', fontSize: '12px' },
    lg: { padding: '6px 14px', fontSize: '14px' }
  }

  const variants = {
    primary: {
      background: 'linear-gradient(135deg, #C53030 0%, #9B2C2C 100%)',
      color: 'white',
      border: '1px solid rgba(197, 48, 48, 0.4)'
    },
    success: {
      background: 'linear-gradient(135deg, #2F855A 0%, #10b981 100%)',
      color: 'white',
      border: '1px solid rgba(16, 185, 129, 0.4)'
    },
    warning: {
      background: 'linear-gradient(135deg, #C05621 0%, #f59e0b 100%)',
      color: 'white',
      border: '1px solid rgba(245, 158, 11, 0.4)'
    },
    danger: {
      background: 'linear-gradient(135deg, #C53030 0%, #ef4444 100%)',
      color: 'white',
      border: '1px solid rgba(239, 68, 68, 0.4)'
    },
    info: {
      background: 'linear-gradient(135deg, #2C5282 0%, #3b82f6 100%)',
      color: 'white',
      border: '1px solid rgba(59, 130, 246, 0.4)'
    },
    neutral: {
      background: 'rgba(255, 255, 255, 0.1)',
      color: 'var(--text/secondary)',
      border: '1px solid rgba(255, 255, 255, 0.15)'
    }
  }

  return (
    <span
      className={`${pulse ? 'badge-pulse' : ''} ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: dot ? '6px' : 0,
        ...sizes[size],
        ...variants[variant],
        borderRadius: '12px',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
        transition: 'all var(--duration-fast) var(--spring-smooth)'
      }}
    >
      {dot && (
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: 'currentColor',
            boxShadow: '0 0 8px currentColor'
          }}
        />
      )}
      {children}
    </span>
  )
}

export default Badge


