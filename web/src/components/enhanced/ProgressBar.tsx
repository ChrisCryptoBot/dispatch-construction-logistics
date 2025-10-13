import React, { useEffect, useState } from 'react'

interface ProgressBarProps {
  value: number // 0-100
  max?: number
  variant?: 'primary' | 'success' | 'warning' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  animated?: boolean
  striped?: boolean
  className?: string
}

/**
 * Enhanced Progress Bar with Gradient and Animation
 * Smoothly animates to target percentage
 */
const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  variant = 'primary',
  size = 'md',
  showLabel = false,
  animated = true,
  striped = false,
  className = ''
}) => {
  const [animatedValue, setAnimatedValue] = useState(0)
  const percentage = Math.min((value / max) * 100, 100)

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => setAnimatedValue(percentage), 100)
      return () => clearTimeout(timer)
    } else {
      setAnimatedValue(percentage)
    }
  }, [percentage, animated])

  const heights = {
    sm: '6px',
    md: '10px',
    lg: '16px'
  }

  const gradients = {
    primary: 'linear-gradient(90deg, #C53030 0%, #9B2C2C 100%)',
    success: 'linear-gradient(90deg, #2F855A 0%, #10b981 100%)',
    warning: 'linear-gradient(90deg, #C05621 0%, #f59e0b 100%)',
    danger: 'linear-gradient(90deg, #C53030 0%, #ef4444 100%)'
  }

  return (
    <div className={`w-full ${className}`}>
      <div
        style={{
          width: '100%',
          height: heights[size],
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '999px',
          overflow: 'hidden',
          position: 'relative',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        <div
          style={{
            width: `${animatedValue}%`,
            height: '100%',
            background: gradients[variant],
            borderRadius: '999px',
            transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: `0 0 20px ${variant === 'primary' ? 'rgba(197, 48, 48, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
          }}
        >
          {striped && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,.15) 50%, rgba(255,255,255,.15) 75%, transparent 75%, transparent)',
                backgroundSize: '1rem 1rem',
                animation: animated ? 'progress-stripes 1s linear infinite' : 'none'
              }}
            />
          )}
        </div>
      </div>
      {showLabel && (
        <div className="text-fluid-sm" style={{
          marginTop: '8px',
          color: 'var(--text/secondary)',
          textAlign: 'right',
          fontWeight: '600'
        }}>
          {Math.round(percentage)}%
        </div>
      )}
      <style>{`
        @keyframes progress-stripes {
          from { background-position: 1rem 0; }
          to { background-position: 0 0; }
        }
      `}</style>
    </div>
  )
}

export default ProgressBar


