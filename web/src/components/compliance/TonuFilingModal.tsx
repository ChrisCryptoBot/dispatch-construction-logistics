import React, { useState } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { carrierAPI } from '../../services/api'
import { AlertTriangle, X, Clock, DollarSign, FileText, CheckCircle, Loader } from 'lucide-react'

interface TonuFilingModalProps {
  load: any
  onClose: () => void
  onSuccess: () => void
}

const TonuFilingModal: React.FC<TonuFilingModalProps> = ({
  load,
  onClose,
  onSuccess
}) => {
  const { theme } = useTheme()
  
  const [reason, setReason] = useState('')
  const [arrivalTime, setArrivalTime] = useState('')
  const [waitTime, setWaitTime] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Calculate TONU amounts
  const tonuAmount = 200 // Flat $200 charged to customer
  const platformFee = 50 // 25% to SaaS
  const carrierPayout = 150 // 75% to carrier

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!reason || reason.length < 10) {
      setError('Please provide a detailed reason (at least 10 characters)')
      return
    }
    
    if (!arrivalTime) {
      setError('Please specify when you arrived at the pickup location')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      await carrierAPI.fileTonu(load.id, {
        reason,
        arrivalTime,
        waitTime,
        evidence: []
      })
      
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to file TONU claim')
      setSubmitting(false)
    }
  }

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
        backdropFilter: 'blur(8px)'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          background: `linear-gradient(135deg, ${theme.colors.backgroundCard} 0%, ${theme.colors.backgroundSecondary} 100%)`,
          borderRadius: '20px',
          boxShadow: `0 25px 50px rgba(0, 0, 0, 0.25), 0 0 0 1px ${theme.colors.border}`,
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          style={{
            padding: '32px 32px 24px 32px',
            borderBottom: `1px solid ${theme.colors.border}`,
            background: `linear-gradient(135deg, ${theme.colors.primary}15 0%, transparent 100%)`
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: `linear-gradient(135deg, ${theme.colors.error} 0%, ${theme.colors.warning} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 8px 16px ${theme.colors.error}40`
              }}>
                <AlertTriangle size={28} color="white" />
              </div>
              <div>
                <h2 style={{
                  fontSize: '28px',
                  fontWeight: '700',
                  color: theme.colors.textPrimary,
                  margin: '0 0 4px 0',
                  letterSpacing: '-0.5px'
                }}>
                  File TONU Claim
                </h2>
                <p style={{
                  fontSize: '16px',
                  color: theme.colors.textSecondary,
                  margin: 0,
                  lineHeight: '1.4'
                }}>
                  Truck Ordered Not Used - Material not ready for pickup
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: theme.colors.backgroundHover,
                border: `1px solid ${theme.colors.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                color: theme.colors.textSecondary
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = theme.colors.background
                e.currentTarget.style.borderColor = theme.colors.primary
                e.currentTarget.style.color = theme.colors.primary
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = theme.colors.backgroundHover
                e.currentTarget.style.borderColor = theme.colors.border
                e.currentTarget.style.color = theme.colors.textSecondary
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '0 32px 32px 32px'
        }}>
          {error && (
            <div 
              style={{
                marginBottom: '24px',
                padding: '16px 20px',
                borderRadius: '12px',
                background: `${theme.colors.error}10`,
                border: `1px solid ${theme.colors.error}30`,
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <AlertTriangle size={20} color={theme.colors.error} />
              <p style={{
                color: theme.colors.error,
                fontWeight: '600',
                margin: 0,
                fontSize: '14px'
              }}>
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Load Summary */}
            <div 
              style={{ 
                padding: '24px',
                borderRadius: '16px',
                background: theme.colors.background,
                border: `1px solid ${theme.colors.border}`,
                boxShadow: theme.shadow.subtle
              }}
            >
              <h3 
                style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: theme.colors.textPrimary,
                  margin: '0 0 20px 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <FileText size={20} color={theme.colors.primary} />
                Load Information
              </h3>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(2, 1fr)', 
                gap: '20px' 
              }}>
                <div>
                  <p style={{ 
                    fontSize: '12px',
                    fontWeight: '600',
                    color: theme.colors.textSecondary,
                    margin: '0 0 4px 0',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Load ID
                  </p>
                  <p 
                    style={{ 
                      fontSize: '16px',
                      fontWeight: '700',
                      color: theme.colors.textPrimary,
                      margin: 0
                    }}
                  >
                    #{load.id?.substring(0, 8)}
                  </p>
                </div>
                <div>
                  <p style={{ 
                    fontSize: '12px',
                    fontWeight: '600',
                    color: theme.colors.textSecondary,
                    margin: '0 0 4px 0',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Commodity
                  </p>
                  <p 
                    style={{ 
                      fontSize: '16px',
                      fontWeight: '700',
                      color: theme.colors.textPrimary,
                      margin: 0
                    }}
                  >
                    {load.commodity}
                  </p>
                </div>
                <div>
                  <p style={{ 
                    fontSize: '12px',
                    fontWeight: '600',
                    color: theme.colors.textSecondary,
                    margin: '0 0 4px 0',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Distance
                  </p>
                  <p 
                    style={{ 
                      fontSize: '16px',
                      fontWeight: '700',
                      color: theme.colors.textPrimary,
                      margin: 0
                    }}
                  >
                    {load.miles} miles
                  </p>
                </div>
                <div>
                  <p style={{ 
                    fontSize: '12px',
                    fontWeight: '600',
                    color: theme.colors.textSecondary,
                    margin: '0 0 4px 0',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Original Revenue
                  </p>
                  <p 
                    style={{ 
                      fontSize: '16px',
                      fontWeight: '700',
                      color: theme.colors.textPrimary,
                      margin: 0
                    }}
                  >
                    ${(load.revenue || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* TONU Compensation Display */}
            <div 
              style={{ 
                padding: '28px',
                borderRadius: '20px',
                background: `linear-gradient(135deg, ${theme.colors.success}15 0%, ${theme.colors.primary}10 100%)`,
                border: `2px solid ${theme.colors.success}40`,
                boxShadow: `0 8px 32px ${theme.colors.success}20`
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: `linear-gradient(135deg, ${theme.colors.success} 0%, ${theme.colors.primary} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 4px 12px ${theme.colors.success}40`
                }}>
                  <DollarSign size={24} color="white" />
                </div>
                <div>
                  <p 
                    style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: theme.colors.textSecondary,
                      margin: '0 0 4px 0',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                  >
                    TONU Compensation
                  </p>
                  <p style={{
                    fontSize: '36px',
                    fontWeight: '800',
                    color: theme.colors.success,
                    margin: 0,
                    lineHeight: 1
                  }}>
                    ${carrierPayout.toLocaleString()}
                  </p>
                </div>
              </div>
              <div 
                style={{ 
                  padding: '16px 20px',
                  borderRadius: '12px',
                  background: `${theme.colors.success}20`,
                  border: `1px solid ${theme.colors.success}30`
                }}
              >
                <p style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: theme.colors.textPrimary,
                  margin: '0 0 8px 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <CheckCircle size={16} color={theme.colors.success} />
                  Your TONU Compensation: $150 flat rate
                </p>
                <p style={{
                  fontSize: '13px',
                  color: theme.colors.textSecondary,
                  margin: 0,
                  lineHeight: '1.4'
                }}>
                  This compensates you for the wasted trip and ensures accountability from shippers.
                </p>
              </div>
            </div>

            {/* Reason */}
            <div>
              <label 
                style={{
                  display: 'block',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: theme.colors.textPrimary,
                  marginBottom: '12px'
                }}
              >
                Reason for TONU <span style={{ color: theme.colors.error }}>*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={5}
                placeholder="Please provide detailed information about why the material was not ready (e.g., material not loaded yet, site closed, incorrect address, safety issue, etc.)"
                required
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  borderRadius: '12px',
                  background: theme.colors.inputBg,
                  border: `2px solid ${theme.colors.inputBorder}`,
                  color: theme.colors.textPrimary,
                  fontSize: '14px',
                  outline: 'none',
                  resize: 'none',
                  transition: 'border-color 0.2s ease',
                  fontFamily: 'inherit'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = theme.colors.primary}
                onBlur={(e) => e.currentTarget.style.borderColor = theme.colors.inputBorder}
              />
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '8px'
              }}>
                <p style={{
                  fontSize: '12px',
                  color: reason.length >= 10 ? theme.colors.success : theme.colors.textSecondary,
                  margin: 0,
                  fontWeight: '500'
                }}>
                  {reason.length} / 10 minimum characters
                </p>
                {reason.length >= 10 && (
                  <CheckCircle size={16} color={theme.colors.success} />
                )}
              </div>
            </div>

            {/* Arrival Time */}
            <div>
              <label 
                style={{
                  display: 'block',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: theme.colors.textPrimary,
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Clock size={18} color={theme.colors.primary} />
                Arrival Time <span style={{ color: theme.colors.error }}>*</span>
              </label>
              <input
                type="datetime-local"
                value={arrivalTime}
                onChange={(e) => setArrivalTime(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  borderRadius: '12px',
                  background: theme.colors.inputBg,
                  border: `2px solid ${theme.colors.inputBorder}`,
                  color: theme.colors.textPrimary,
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                  fontFamily: 'inherit'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = theme.colors.primary}
                onBlur={(e) => e.currentTarget.style.borderColor = theme.colors.inputBorder}
              />
              <p 
                style={{
                  fontSize: '12px',
                  color: theme.colors.textSecondary,
                  margin: '8px 0 0 0',
                  fontWeight: '500'
                }}
              >
                When did you arrive at the pickup location?
              </p>
            </div>

            {/* Wait Time */}
            <div>
              <label 
                style={{
                  display: 'block',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: theme.colors.textPrimary,
                  marginBottom: '12px'
                }}
              >
                Wait Time (minutes)
              </label>
              <input
                type="number"
                value={waitTime}
                onChange={(e) => setWaitTime(Number(e.target.value))}
                min="0"
                max="600"
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  borderRadius: '12px',
                  background: theme.colors.inputBg,
                  border: `2px solid ${theme.colors.inputBorder}`,
                  color: theme.colors.textPrimary,
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                  fontFamily: 'inherit'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = theme.colors.primary}
                onBlur={(e) => e.currentTarget.style.borderColor = theme.colors.inputBorder}
              />
              <p 
                style={{
                  fontSize: '12px',
                  color: theme.colors.textSecondary,
                  margin: '8px 0 0 0',
                  fontWeight: '500'
                }}
              >
                How long did you wait before leaving? (Optional)
              </p>
            </div>

            {/* Legal Notice */}
            <div 
              style={{
                padding: '20px 24px',
                borderRadius: '16px',
                background: `linear-gradient(135deg, ${theme.colors.warning}15 0%, ${theme.colors.error}10 100%)`,
                border: `2px solid ${theme.colors.warning}40`,
                boxShadow: `0 4px 16px ${theme.colors.warning}20`
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: `linear-gradient(135deg, ${theme.colors.warning} 0%, ${theme.colors.error} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '2px'
                }}>
                  <FileText size={20} color="white" />
                </div>
                <div>
                  <p style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: theme.colors.warning,
                    margin: '0 0 8px 0'
                  }}>
                    Legal Notice
                  </p>
                  <p style={{
                    fontSize: '13px',
                    color: theme.colors.textSecondary,
                    margin: 0,
                    lineHeight: '1.5'
                  }}>
                    By submitting this TONU claim, you certify that the information provided is accurate and truthful. False claims may result in account suspension and legal action. The customer will be notified and charged the TONU amount. Disputes will be reviewed with supporting evidence.
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Actions */}
        <div style={{
          padding: '24px 32px',
          borderTop: `1px solid ${theme.colors.border}`,
          background: theme.colors.backgroundSecondary,
          display: 'flex',
          gap: '16px'
        }}>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            style={{
              flex: 1,
              padding: '16px 24px',
              borderRadius: '12px',
              background: theme.colors.backgroundHover,
              border: `1px solid ${theme.colors.border}`,
              color: theme.colors.textPrimary,
              fontSize: '16px',
              fontWeight: '600',
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.5 : 1,
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (!submitting) {
                e.currentTarget.style.background = theme.colors.background
                e.currentTarget.style.borderColor = theme.colors.primary
                e.currentTarget.style.color = theme.colors.primary
              }
            }}
            onMouseLeave={(e) => {
              if (!submitting) {
                e.currentTarget.style.background = theme.colors.backgroundHover
                e.currentTarget.style.borderColor = theme.colors.border
                e.currentTarget.style.color = theme.colors.textPrimary
              }
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || !reason || reason.length < 10 || !arrivalTime}
            onClick={handleSubmit}
            style={{
              flex: 1,
              padding: '16px 24px',
              borderRadius: '12px',
              background: `linear-gradient(135deg, ${theme.colors.error} 0%, ${theme.colors.warning} 100%)`,
              border: 'none',
              color: 'white',
              fontSize: '16px',
              fontWeight: '600',
              cursor: (submitting || !reason || reason.length < 10 || !arrivalTime) ? 'not-allowed' : 'pointer',
              opacity: (submitting || !reason || reason.length < 10 || !arrivalTime) ? 0.5 : 1,
              transition: 'all 0.2s ease',
              boxShadow: `0 4px 12px ${theme.colors.error}40`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              if (!submitting && reason && reason.length >= 10 && arrivalTime) {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = `0 8px 20px ${theme.colors.error}60`
              }
            }}
            onMouseLeave={(e) => {
              if (!submitting && reason && reason.length >= 10 && arrivalTime) {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = `0 4px 12px ${theme.colors.error}40`
              }
            }}
          >
            {submitting ? (
              <>
                <Loader size={18} className="animate-spin" />
                Filing...
              </>
            ) : (
              `File TONU - $${carrierPayout.toLocaleString()}`
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default TonuFilingModal

