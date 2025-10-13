import React, { type ReactNode } from 'react'

interface EnhancedButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'glass' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  disabled?: boolean
  loading?: boolean
  icon?: ReactNode
  className?: string
  type?: 'button' | 'submit' | 'reset'
}

/**
 * Enhanced Button Component with Spring Animations
 * Non-breaking addition - use alongside existing buttons
 */
const EnhancedButton: React.FC<EnhancedButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  icon,
  className = '',
  type = 'button'
}) => {
  const sizeStyles = {
    sm: { padding: '8px 16px', fontSize: '13px' },
    md: { padding: '12px 24px', fontSize: '14px' },
    lg: { padding: '16px 32px', fontSize: '16px' }
  }

  const variantClass = {
    primary: 'btn-primary-enhanced',
    secondary: 'bg-bg-tertiary text-text-primary border border-border-medium hover:border-border-strong',
    glass: 'btn-glass',
    ghost: 'bg-transparent text-text-primary hover:bg-bg-tertiary'
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${variantClass[variant]}
        ripple
        focus-ring
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      style={{
        ...sizeStyles[size],
        borderRadius: '10px',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all var(--duration-fast) var(--spring-smooth)'
      }}
    >
      {loading ? (
        <div className="spinner" style={{
          width: '16px',
          height: '16px',
          border: '2px solid rgba(255,255,255,0.3)',
          borderTop: '2px solid white',
          borderRadius: '50%',
          animation: 'spin 0.6s linear infinite'
        }} />
      ) : (
        <>
          {icon && <span>{icon}</span>}
          {children}
        </>
      )}
    </button>
  )
}

export default EnhancedButton


