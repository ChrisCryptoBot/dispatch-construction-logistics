import React, { type ReactNode, useEffect, useState } from 'react'

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  title?: string
  snapPoints?: number[] // Percentage heights: [50, 90]
  initialSnap?: number
}

/**
 * Mobile Bottom Sheet Component
 * Better UX than modals on mobile devices
 */
const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  children,
  title,
  snapPoints = [90],
  initialSnap = 0
}) => {
  const [currentSnap, setCurrentSnap] = useState(initialSnap)
  const [isDragging, setIsDragging] = useState(false)
  const [startY, setStartY] = useState(0)
  const [currentY, setCurrentY] = useState(0)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true)
    setStartY(e.touches[0].clientY)
    setCurrentY(e.touches[0].clientY)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    setCurrentY(e.touches[0].clientY)
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
    const deltaY = currentY - startY
    
    if (deltaY > 100) {
      onClose()
    }
  }

  if (!isOpen) return null

  const height = snapPoints[currentSnap]
  const dragOffset = isDragging ? Math.max(0, currentY - startY) : 0

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          zIndex: 999,
          animation: 'fadeIn 0.2s ease-out'
        }}
      />

      {/* Bottom Sheet */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="glass-modal"
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          height: `${height}%`,
          transform: `translateY(${dragOffset}px)`,
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          zIndex: 1000,
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
          animation: 'slideUpMobile 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Drag Handle */}
        <div
          style={{
            width: '48px',
            height: '4px',
            background: 'rgba(255, 255, 255, 0.3)',
            borderRadius: '2px',
            margin: '0 auto 20px',
            cursor: 'grab',
            flexShrink: 0
          }}
        />

        {/* Title */}
        {title && (
          <h2 className="text-fluid-xl" style={{
            margin: '0 0 20px 0',
            fontWeight: '600',
            color: 'var(--text/primary)',
            flexShrink: 0
          }}>
            {title}
          </h2>
        )}

        {/* Content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          marginRight: '-24px',
          paddingRight: '24px'
        }}>
          {children}
        </div>
      </div>

      <style>{`
        @keyframes slideUpMobile {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </>
  )
}

export default BottomSheet


