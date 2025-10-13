import React, { useState, useEffect } from 'react'
import { useTheme } from '../../../contexts/ThemeContext'
import { 
  Truck, MapPin, Calendar, DollarSign, Package, AlertCircle, 
  CheckCircle, X, Clock, Phone, MessageSquare 
} from 'lucide-react'
import type { Load } from '../types'

interface DriverLoadAcceptanceProps {
  load: Load
  onAccept: (loadId: string, smsCode: string) => Promise<void>
  onReject: (loadId: string, reason?: string) => Promise<void>
  onClose: () => void
}

const DriverLoadAcceptance: React.FC<DriverLoadAcceptanceProps> = ({ 
  load, 
  onAccept, 
  onReject, 
  onClose 
}) => {
  const { theme } = useTheme()
  const [step, setStep] = useState<'review' | 'sms-verification' | 'confirmed' | 'rejected'>('review')
  const [smsCode, setSmsCode] = useState('')
  const [smsError, setSmsError] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Calculate time remaining for acceptance
  useEffect(() => {
    if (load.driverAcceptanceExpiry) {
      const updateTimer = () => {
        const now = new Date().getTime()
        const expiry = new Date(load.driverAcceptanceExpiry!).getTime()
        const remaining = Math.max(0, Math.floor((expiry - now) / 1000))
        setTimeRemaining(remaining)
        
        if (remaining === 0 && step === 'review') {
          setStep('rejected')
        }
      }

      updateTimer()
      const interval = setInterval(updateTimer, 1000)
      return () => clearInterval(interval)
    }
  }, [load.driverAcceptanceExpiry, step])

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleAccept = () => {
    setStep('sms-verification')
    // In production, this would trigger SMS send via API
  }

  const handleSmsVerification = async () => {
    if (!smsCode || smsCode.length !== 6) {
      setSmsError('Please enter a valid 6-digit code')
      return
    }

    setIsSubmitting(true)
    try {
      await onAccept(load.id, smsCode)
      setStep('confirmed')
    } catch (error) {
      setSmsError('Invalid verification code. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReject = async () => {
    setIsSubmitting(true)
    try {
      await onReject(load.id, rejectionReason)
      setStep('rejected')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderReviewStep = () => (
    <div style={{ display: 'grid', gap: '20px' }}>
      {/* Time Remaining Alert */}
      <div style={{
        padding: '16px',
        background: timeRemaining < 300 ? `${theme.colors.error}15` : `${theme.colors.warning}15`,
        borderRadius: '12px',
        border: `2px solid ${timeRemaining < 300 ? theme.colors.error : theme.colors.warning}`,
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <Clock size={24} color={timeRemaining < 300 ? theme.colors.error : theme.colors.warning} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '4px' }}>
            Time to Accept: {formatTime(timeRemaining)}
          </div>
          <div style={{ fontSize: '12px', color: theme.colors.textSecondary }}>
            You must accept this load before the timer expires or it will be reassigned
          </div>
        </div>
      </div>

      {/* Load Details */}
      <div style={{
        padding: '20px',
        background: theme.colors.backgroundSecondary,
        borderRadius: '12px',
        border: `1px solid ${theme.colors.border}`
      }}>
        <h4 style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '16px' }}>
          Load Details
        </h4>

        <div style={{ display: 'grid', gap: '16px' }}>
          {/* Origin & Destination */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '12px', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <MapPin size={16} color={theme.colors.success} />
                <span style={{ fontSize: '12px', fontWeight: '600', color: theme.colors.textSecondary }}>
                  ORIGIN
                </span>
              </div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary }}>
                {load.origin.city}, {load.origin.state}
              </div>
              <div style={{ fontSize: '12px', color: theme.colors.textSecondary }}>
                {load.origin.zip}
              </div>
            </div>

            <div style={{ fontSize: '24px', color: theme.colors.textSecondary }}>→</div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <MapPin size={16} color={theme.colors.error} />
                <span style={{ fontSize: '12px', fontWeight: '600', color: theme.colors.textSecondary }}>
                  DESTINATION
                </span>
              </div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary }}>
                {load.destination.city}, {load.destination.state}
              </div>
              <div style={{ fontSize: '12px', color: theme.colors.textSecondary }}>
                {load.destination.zip}
              </div>
            </div>
          </div>

          {/* Key Info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div style={{
              padding: '12px',
              background: theme.colors.backgroundPrimary,
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <DollarSign size={16} color={theme.colors.success} style={{ marginBottom: '4px' }} />
              <div style={{ fontSize: '16px', fontWeight: '700', color: theme.colors.textPrimary }}>
                ${load.rate.toFixed(2)}
              </div>
              <div style={{ fontSize: '11px', color: theme.colors.textSecondary }}>Rate</div>
            </div>

            <div style={{
              padding: '12px',
              background: theme.colors.backgroundPrimary,
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <Calendar size={16} color={theme.colors.primary} style={{ marginBottom: '4px' }} />
              <div style={{ fontSize: '16px', fontWeight: '700', color: theme.colors.textPrimary }}>
                {new Date(load.pickupDate).toLocaleDateString()}
              </div>
              <div style={{ fontSize: '11px', color: theme.colors.textSecondary }}>Pickup</div>
            </div>

            <div style={{
              padding: '12px',
              background: theme.colors.backgroundPrimary,
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <Package size={16} color={theme.colors.warning} style={{ marginBottom: '4px' }} />
              <div style={{ fontSize: '16px', fontWeight: '700', color: theme.colors.textPrimary }}>
                {load.commodity}
              </div>
              <div style={{ fontSize: '11px', color: theme.colors.textSecondary }}>Commodity</div>
            </div>
          </div>

          {/* Additional Info */}
          {load.notes && (
            <div style={{
              padding: '12px',
              background: theme.colors.backgroundPrimary,
              borderRadius: '8px'
            }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '4px' }}>
                Load Notes:
              </div>
              <div style={{ fontSize: '12px', color: theme.colors.textSecondary }}>
                {load.notes}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SMS Verification Notice */}
      <div style={{
        padding: '16px',
        background: `${theme.colors.info}15`,
        borderRadius: '12px',
        border: `1px solid ${theme.colors.info}`,
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px'
      }}>
        <MessageSquare size={20} color={theme.colors.info} style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <div style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '4px' }}>
            SMS Verification Required
          </div>
          <div style={{ fontSize: '12px', color: theme.colors.textSecondary, lineHeight: '1.5' }}>
            After accepting, you will receive an SMS verification code to {load.driverPhone}. 
            You must enter this code to confirm your acceptance and activate the load.
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '8px' }}>
        <button
          onClick={() => setStep('rejected')}
          disabled={timeRemaining === 0}
          style={{
            padding: '14px',
            background: 'transparent',
            color: theme.colors.error,
            border: `2px solid ${theme.colors.error}`,
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: timeRemaining === 0 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            opacity: timeRemaining === 0 ? 0.5 : 1
          }}
        >
          <X size={20} />
          Reject Load
        </button>

        <button
          onClick={handleAccept}
          disabled={timeRemaining === 0}
          style={{
            padding: '14px',
            background: timeRemaining === 0 ? theme.colors.border : theme.colors.success,
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: timeRemaining === 0 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <CheckCircle size={20} />
          Accept Load
        </button>
      </div>
    </div>
  )

  const renderSmsVerificationStep = () => (
    <div style={{ display: 'grid', gap: '20px' }}>
      <div style={{
        padding: '40px',
        textAlign: 'center',
        background: theme.colors.backgroundSecondary,
        borderRadius: '12px',
        border: `1px solid ${theme.colors.border}`
      }}>
        <MessageSquare size={64} color={theme.colors.primary} style={{ marginBottom: '20px' }} />
        <h3 style={{ fontSize: '24px', fontWeight: '700', color: theme.colors.textPrimary, marginBottom: '12px' }}>
          SMS Verification Sent
        </h3>
        <p style={{ fontSize: '14px', color: theme.colors.textSecondary, marginBottom: '24px' }}>
          We've sent a 6-digit verification code to:<br />
          <strong style={{ color: theme.colors.textPrimary }}>{load.driverPhone}</strong>
        </p>

        <div style={{ maxWidth: '300px', margin: '0 auto' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px', textAlign: 'left' }}>
            Enter Verification Code
          </label>
          <input
            type="text"
            value={smsCode}
            onChange={(e) => {
              setSmsCode(e.target.value.replace(/\D/g, '').slice(0, 6))
              setSmsError('')
            }}
            placeholder="000000"
            maxLength={6}
            style={{
              width: '100%',
              padding: '16px',
              background: theme.colors.backgroundPrimary,
              border: `2px solid ${smsError ? theme.colors.error : theme.colors.border}`,
              borderRadius: '8px',
              fontSize: '24px',
              fontWeight: '700',
              color: theme.colors.textPrimary,
              textAlign: 'center',
              letterSpacing: '8px',
              outline: 'none'
            }}
          />
          {smsError && (
            <div style={{ 
              fontSize: '12px', 
              color: theme.colors.error, 
              marginTop: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              justifyContent: 'center'
            }}>
              <AlertCircle size={14} />
              {smsError}
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '32px' }}>
          <button
            onClick={() => setStep('review')}
            disabled={isSubmitting}
            style={{
              padding: '12px',
              background: 'transparent',
              color: theme.colors.textSecondary,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: isSubmitting ? 'not-allowed' : 'pointer'
            }}
          >
            Back
          </button>

          <button
            onClick={handleSmsVerification}
            disabled={!smsCode || smsCode.length !== 6 || isSubmitting}
            style={{
              padding: '12px',
              background: (!smsCode || smsCode.length !== 6 || isSubmitting) ? theme.colors.border : theme.colors.success,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: (!smsCode || smsCode.length !== 6 || isSubmitting) ? 'not-allowed' : 'pointer'
            }}
          >
            {isSubmitting ? 'Verifying...' : 'Verify & Confirm'}
          </button>
        </div>

        <p style={{ fontSize: '12px', color: theme.colors.textSecondary, marginTop: '20px' }}>
          Didn't receive the code? <a href="#" style={{ color: theme.colors.primary, textDecoration: 'none' }}>Resend SMS</a>
        </p>
      </div>
    </div>
  )

  const renderConfirmedStep = () => (
    <div style={{
      padding: '60px 40px',
      textAlign: 'center',
      background: theme.colors.backgroundSecondary,
      borderRadius: '12px',
      border: `2px solid ${theme.colors.success}`
    }}>
      <CheckCircle size={80} color={theme.colors.success} style={{ marginBottom: '24px' }} />
      <h3 style={{ fontSize: '28px', fontWeight: '700', color: theme.colors.textPrimary, marginBottom: '12px' }}>
        Load Confirmed!
      </h3>
      <p style={{ fontSize: '14px', color: theme.colors.textSecondary, marginBottom: '24px' }}>
        You have successfully accepted this load. The customer has been notified and<br />
        the load is now active in your dashboard.
      </p>

      <div style={{
        padding: '20px',
        background: `${theme.colors.success}15`,
        borderRadius: '8px',
        marginBottom: '24px'
      }}>
        <div style={{ fontSize: '12px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
          Next Steps:
        </div>
        <ul style={{ fontSize: '12px', color: theme.colors.textSecondary, textAlign: 'left', margin: 0, paddingLeft: '20px', lineHeight: '1.6' }}>
          <li>Review pickup instructions and address</li>
          <li>Confirm arrival at origin via app</li>
          <li>Provide GPS location updates during transit</li>
          <li>Confirm delivery with receiver signature and photo</li>
        </ul>
      </div>

      <button
        onClick={onClose}
        style={{
          padding: '14px 32px',
          background: theme.colors.success,
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: 'pointer'
        }}
      >
        View Load Dashboard
      </button>
    </div>
  )

  const renderRejectedStep = () => (
    <div style={{ display: 'grid', gap: '20px' }}>
      <div style={{
        padding: '40px',
        textAlign: 'center',
        background: theme.colors.backgroundSecondary,
        borderRadius: '12px',
        border: `1px solid ${theme.colors.border}`
      }}>
        <AlertCircle size={64} color={theme.colors.error} style={{ marginBottom: '20px' }} />
        <h3 style={{ fontSize: '24px', fontWeight: '700', color: theme.colors.textPrimary, marginBottom: '12px' }}>
          {timeRemaining === 0 ? 'Load Assignment Expired' : 'Reject Load'}
        </h3>
        <p style={{ fontSize: '14px', color: theme.colors.textSecondary, marginBottom: '24px' }}>
          {timeRemaining === 0 
            ? 'The time to accept this load has expired. The load will be reassigned to another driver.'
            : 'Please provide a reason for rejecting this load. This helps us improve load assignments.'}
        </p>

        {timeRemaining > 0 && (
          <>
            <div style={{ maxWidth: '400px', margin: '0 auto 24px' }}>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Reason for rejection..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: theme.colors.backgroundPrimary,
                  border: `2px solid ${theme.colors.border}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: theme.colors.textPrimary,
                  outline: 'none',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', maxWidth: '400px', margin: '0 auto' }}>
              <button
                onClick={() => setStep('review')}
                disabled={isSubmitting}
                style={{
                  padding: '12px',
                  background: 'transparent',
                  color: theme.colors.textSecondary,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer'
                }}
              >
                Back
              </button>

              <button
                onClick={handleReject}
                disabled={isSubmitting}
                style={{
                  padding: '12px',
                  background: theme.colors.error,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer'
                }}
              >
                {isSubmitting ? 'Submitting...' : 'Confirm Rejection'}
              </button>
            </div>
          </>
        )}

        {timeRemaining === 0 && (
          <button
            onClick={onClose}
            style={{
              padding: '14px 32px',
              background: theme.colors.primary,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              marginTop: '16px'
            }}
          >
            Close
          </button>
        )}
      </div>
    </div>
  )

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        background: theme.colors.backgroundPrimary,
        borderRadius: '16px',
        maxWidth: '700px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: `1px solid ${theme.colors.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          background: theme.colors.backgroundPrimary,
          zIndex: 1
        }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: theme.colors.textPrimary, margin: '0 0 4px 0' }}>
              Load Assignment
            </h2>
            <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: 0 }}>
              Review and accept your assigned load
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: theme.colors.textSecondary,
              cursor: 'pointer',
              padding: '8px'
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {step === 'review' && renderReviewStep()}
          {step === 'sms-verification' && renderSmsVerificationStep()}
          {step === 'confirmed' && renderConfirmedStep()}
          {step === 'rejected' && renderRejectedStep()}
        </div>
      </div>
    </div>
  )
}

export default DriverLoadAcceptance

