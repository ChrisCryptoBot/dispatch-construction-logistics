import React, { useState, useRef, useEffect, type ReactNode } from 'react'

interface TooltipProps {
  content: ReactNode
  children: ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
  className?: string
}

/**
 * Enhanced Tooltip with Glassmorphism
 * Smooth animations and smart positioning
 */
const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  delay = 300,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [coords, setCoords] = useState({ x: 0, y: 0 })
  const timeoutRef = useRef<NodeJS.Timeout>()
  const triggerRef = useRef<HTMLDivElement>(null)

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect()
        setCoords({
          x: rect.left + rect.width / 2,
          y: rect.top
        })
      }
      setIsVisible(true)
    }, delay)
  }

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsVisible(false)
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const positions = {
    top: { bottom: '100%', left: '50%', transform: 'translateX(-50%) translateY(-8px)' },
    bottom: { top: '100%', left: '50%', transform: 'translateX(-50%) translateY(8px)' },
    left: { right: '100%', top: '50%', transform: 'translateY(-50%) translateX(-8px)' },
    right: { left: '100%', top: '50%', transform: 'translateY(-50%) translateX(8px)' }
  }

  return (
    <div
      ref={triggerRef}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      style={{ position: 'relative', display: 'inline-block' }}
      className={className}
    >
      {children}
      {isVisible && (
        <div
          className="glass-modal"
          style={{
            position: 'absolute',
            ...positions[position],
            padding: '8px 12px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '500',
            color: 'var(--text/primary)',
            whiteSpace: 'nowrap',
            zIndex: 1000,
            pointerEvents: 'none',
            animation: 'tooltipFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            maxWidth: '300px'
          }}
        >
          {content}
          <div
            style={{
              position: 'absolute',
              width: '8px',
              height: '8px',
              background: 'linear-gradient(135deg, rgba(22, 27, 38, 0.95) 0%, rgba(15, 20, 25, 0.98) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              transform: 'rotate(45deg)',
              ...(position === 'top' && { bottom: '-4px', left: '50%', marginLeft: '-4px' }),
              ...(position === 'bottom' && { top: '-4px', left: '50%', marginLeft: '-4px' }),
              ...(position === 'left' && { right: '-4px', top: '50%', marginTop: '-4px' }),
              ...(position === 'right' && { left: '-4px', top: '50%', marginTop: '-4px' })
            }}
          />
        </div>
      )}
      <style>{`
        @keyframes tooltipFadeIn {
          from {
            opacity: 0;
            transform: ${positions[position].transform} scale(0.95);
          }
          to {
            opacity: 1;
            transform: ${positions[position].transform} scale(1);
          }
        }
      `}</style>
    </div>
  )
}

export default Tooltip


