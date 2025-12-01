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
      background: 'linear-gradient(135deg, #9F1239 0%, #881337 100%)',
      color: 'white',
      border: '1px solid rgba(159, 18, 57, 0.4)'
    },
    success: {
      background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
      color: 'white',
      border: '1px solid rgba(5, 150, 105, 0.4)'
    },
    warning: {
      background: 'linear-gradient(135deg, #D97706 0%, #f59e0b 100%)',
      color: 'white',
      border: '1px solid rgba(217, 119, 6, 0.4)'
    },
    danger: {
      background: 'linear-gradient(135deg, #DC2626 0%, #ef4444 100%)',
      color: 'white',
      border: '1px solid rgba(220, 38, 38, 0.4)'
    },
    info: {
      background: 'linear-gradient(135deg, #0284C7 0%, #3b82f6 100%)',
      color: 'white',
      border: '1px solid rgba(2, 132, 199, 0.4)'
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


