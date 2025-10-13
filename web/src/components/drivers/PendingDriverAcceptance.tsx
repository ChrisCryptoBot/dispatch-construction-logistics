import React, { useState, useEffect } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { 
  Clock, User, MapPin, DollarSign, AlertCircle, X, RefreshCw,
  MessageSquare, CheckCircle, XCircle
} from 'lucide-react'
import type { Load } from '../types'

interface PendingDriverAcceptanceProps {
  load: Load
  onReassign: (loadId: string) => void
  onCancel: (loadId: string) => void
}

const PendingDriverAcceptance: React.FC<PendingDriverAcceptanceProps> = ({
  load,
  onReassign,
  onCancel
}) => {
  const { theme } = useTheme()
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    if (load.driverAcceptanceExpiry) {
      const updateTimer = () => {
        const now = new Date().getTime()
        const expiry = new Date(load.driverAcceptanceExpiry!).getTime()
        const remaining = Math.max(0, Math.floor((expiry - now) / 1000))
        setTimeRemaining(remaining)
        
        if (remaining === 0) {
          setIsExpired(true)
        }
      }

      updateTimer()
      const interval = setInterval(updateTimer, 1000)
      return () => clearInterval(interval)
    }
  }, [load.driverAcceptanceExpiry])

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getTimeSinceAssignment = (): string => {
    if (!load.driverAssignedAt) return 'Unknown'
    const now = new Date().getTime()
    const assigned = new Date(load.driverAssignedAt).getTime()
    const diffMinutes = Math.floor((now - assigned) / 60000)
    
    if (diffMinutes < 1) return 'Just now'
    if (diffMinutes === 1) return '1 min ago'
    return `${diffMinutes} mins ago`
  }

  const isExpiringSoon = timeRemaining < 300 && timeRemaining > 0 // Less than 5 minutes

  return (
    <div style={{
      padding: '16px',
      background: theme.colors.backgroundSecondary,
      borderRadius: '12px',
      border: `2px solid ${isExpired ? theme.colors.error : isExpiringSoon ? theme.colors.warning : theme.colors.border}`,
      marginBottom: '12px'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
        {/* Timer Section */}
        <div style={{
          padding: '16px',
          background: isExpired 
            ? `${theme.colors.error}15` 
            : isExpiringSoon 
              ? `${theme.colors.warning}15` 
              : `${theme.colors.info}15`,
          borderRadius: '12px',
          textAlign: 'center',
          minWidth: '120px'
        }}>
          <Clock 
            size={24} 
            color={isExpired ? theme.colors.error : isExpiringSoon ? theme.colors.warning : theme.colors.info} 
            style={{ marginBottom: '8px' }}
          />
          <div style={{ 
            fontSize: '24px', 
            fontWeight: '700', 
            color: isExpired ? theme.colors.error : isExpiringSoon ? theme.colors.warning : theme.colors.textPrimary,
            marginBottom: '4px'
          }}>
            {formatTime(timeRemaining)}
          </div>
          <div style={{ fontSize: '11px', color: theme.colors.textSecondary }}>
            {isExpired ? 'EXPIRED' : 'Remaining'}
          </div>
        </div>

        {/* Load Details */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: theme.colors.textPrimary, marginBottom: '4px' }}>
                Load #{load.id}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: theme.colors.textSecondary }}>
                <User size={14} />
                <span style={{ fontWeight: '600', color: theme.colors.textPrimary }}>
                  {load.driverName}
                </span>
                {load.driverPhone && (
                  <>
                    <span>•</span>
                    <span>{load.driverPhone}</span>
                  </>
                )}
              </div>
            </div>

            {/* Status Badge */}
            <div style={{
              padding: '6px 12px',
              background: load.driverAcceptanceStatus === 'PENDING' 
                ? `${theme.colors.warning}20` 
                : load.driverAcceptanceStatus === 'ACCEPTED'
                  ? `${theme.colors.success}20`
                  : `${theme.colors.error}20`,
              color: load.driverAcceptanceStatus === 'PENDING' 
                ? theme.colors.warning 
                : load.driverAcceptanceStatus === 'ACCEPTED'
                  ? theme.colors.success
                  : theme.colors.error,
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '600',
              whiteSpace: 'nowrap'
            }}>
              {load.driverAcceptanceStatus === 'PENDING' && '⏳ Waiting for Driver'}
              {load.driverAcceptanceStatus === 'ACCEPTED' && '📱 Waiting for SMS Verification'}
              {load.driverAcceptanceStatus === 'EXPIRED' && '❌ Expired'}
              {load.driverAcceptanceStatus === 'REJECTED' && '❌ Rejected'}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <MapPin size={14} color={theme.colors.textSecondary} />
                <span style={{ fontSize: '12px', color: theme.colors.textSecondary }}>Route</span>
              </div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary }}>
                {load.origin.city}, {load.origin.state} → {load.destination.city}, {load.destination.state}
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <DollarSign size={14} color={theme.colors.textSecondary} />
                <span style={{ fontSize: '12px', color: theme.colors.textSecondary }}>Rate</span>
              </div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.success }}>
                ${load.rate.toFixed(2)}
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <MessageSquare size={14} color={theme.colors.textSecondary} />
                <span style={{ fontSize: '12px', color: theme.colors.textSecondary }}>SMS Status</span>
              </div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: load.smsVerificationSent ? theme.colors.success : theme.colors.textSecondary }}>
                {load.smsVerificationSent ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle size={14} />
                    Delivered
                  </span>
                ) : (
                  'Not Sent'
                )}
              </div>
            </div>
          </div>

          {/* Assignment Info */}
          <div style={{
            padding: '12px',
            background: theme.colors.backgroundPrimary,
            borderRadius: '8px',
            marginBottom: '12px'
          }}>
            <div style={{ fontSize: '12px', color: theme.colors.textSecondary }}>
              Assigned {getTimeSinceAssignment()} • {load.smsVerificationSent ? 'SMS Delivered ✓' : 'SMS Pending'}
              {load.driverAcceptedAt && ` • Accepted ${new Date(load.driverAcceptedAt).toLocaleTimeString()}`}
            </div>
          </div>

          {/* Warning Message */}
          {isExpiringSoon && !isExpired && (
            <div style={{
              padding: '12px',
              background: `${theme.colors.warning}15`,
              borderRadius: '8px',
              border: `1px solid ${theme.colors.warning}`,
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={16} color={theme.colors.warning} />
              <span style={{ fontSize: '12px', color: theme.colors.textSecondary }}>
                <strong style={{ color: theme.colors.warning }}>Warning:</strong> Less than 5 minutes remaining!
              </span>
            </div>
          )}

          {isExpired && (
            <div style={{
              padding: '12px',
              background: `${theme.colors.error}15`,
              borderRadius: '8px',
              border: `1px solid ${theme.colors.error}`,
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <XCircle size={16} color={theme.colors.error} />
              <span style={{ fontSize: '12px', color: theme.colors.textSecondary }}>
                <strong style={{ color: theme.colors.error }}>Expired:</strong> Load will be returned to pool automatically.
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => onReassign(load.id)}
              style={{
                padding: '8px 16px',
                background: 'transparent',
                color: theme.colors.primary,
                border: `1px solid ${theme.colors.primary}`,
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <RefreshCw size={14} />
              Reassign
            </button>

            <button
              onClick={() => onCancel(load.id)}
              style={{
                padding: '8px 16px',
                background: 'transparent',
                color: theme.colors.error,
                border: `1px solid ${theme.colors.error}`,
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <X size={14} />
              Cancel Assignment
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PendingDriverAcceptance

