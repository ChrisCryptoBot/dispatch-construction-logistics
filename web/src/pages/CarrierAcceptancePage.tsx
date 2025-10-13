import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext-fixed'
import PageContainer from '../components/shared/PageContainer'
import Card from '../components/ui/Card'
import { formatNumber, formatCurrency, formatCompactCurrency, formatPercentage } from '../utils/formatters';

import {
  Package, Truck, MapPin, Clock, DollarSign, FileText, FileSignature,
  CheckCircle, AlertCircle, User, Phone, Calendar, MessageSquare,
  ArrowLeft, Navigation, Scale, Building, Hash, Loader, Info,
  TrendingUp, Bell, XCircle, ThumbsUp, ThumbsDown, Timer
} from 'lucide-react'

interface Load {
  id: string
  commodity: string
  status: string
  units: number
  rateMode: string
  revenue: number
  customer: { name: string; phone: string }
  origin: { siteName: string; address: string; city: string }
  destination: { siteName: string; address: string; city: string }
  miles: number
  pickupDate: string
  pickupETA: string
  deliveryDate: string
  deliveryETA: string
  equipmentType: string
  driver?: { name: string; phone: string }
  notes?: string
  rateConSigned: boolean
  rateConSignedDate?: string
  dispatchSignedAt?: string
  driverAcceptanceDeadline?: string
  driverAccepted?: boolean
  timeRemaining?: number
}

const CarrierAcceptancePage = () => {
  const { theme } = useTheme()
  const { user } = useAuth()
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [load, setLoad] = useState<Load | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAccepting, setIsAccepting] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectionModal, setShowRejectionModal] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    loadLoadDetails()
  }, [id])

  useEffect(() => {
    // Update timer every second
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const loadLoadDetails = async () => {
    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Please log in to view load details')
        return
      }

      const isDevMode = token.startsWith('dev-')

      if (isDevMode) {
        console.log('🧪 Development mode - using mock load acceptance data')

        // Mock load data with pending acceptance
        setLoad({
          id: id || 'load-001',
          commodity: 'Crushed Limestone',
          status: 'ASSIGNED',
          units: 18.5,
          rateMode: 'PER_TON',
          revenue: 925,
          customer: { name: 'ABC Construction', phone: '(512) 555-0123' },
          origin: { 
            siteName: 'Main Quarry', 
            address: '1234 Rock Rd, Austin, TX 78701', 
            city: 'Austin' 
          },
          destination: { 
            siteName: 'Downtown Project', 
            address: '789 Congress Ave, Austin, TX 78701', 
            city: 'Austin' 
          },
          miles: 12.3,
          pickupDate: '2025-10-09',
          pickupETA: '8:00 AM',
          deliveryDate: '2025-10-09',
          deliveryETA: '2:00 PM',
          equipmentType: 'End Dump',
          driver: { name: 'John Smith', phone: '(512) 555-0198' },
          notes: 'Gate code: #4521. Contact foreman before arrival.',
          rateConSigned: true,
          rateConSignedDate: '2025-10-08',
          dispatchSignedAt: '2025-10-08T09:00:00Z',
          driverAcceptanceDeadline: '2025-10-08T09:30:00Z',
          driverAccepted: false,
          timeRemaining: Math.max(0, Math.floor((new Date('2025-10-08T09:30:00Z').getTime() - currentTime.getTime()) / 1000))
        })
      } else {
        // Production API call
        const response = await fetch(`/api/loads/${id}/acceptance`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error('Failed to load load details')
        }

        const data = await response.json()
        setLoad(data.load)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load load details')
    } finally {
      setLoading(false)
    }
  }

  const calculateTimeRemaining = () => {
    if (!load?.driverAcceptanceDeadline) return 0
    const deadline = new Date(load.driverAcceptanceDeadline)
    const now = currentTime
    return Math.max(0, Math.floor((deadline.getTime() - now.getTime()) / 1000))
  }

  const formatTimeRemaining = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const handleAcceptLoad = async () => {
    if (!load) return

    setIsAccepting(true)
    try {
      // In production: API call to accept load
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      
      alert('✅ Load accepted successfully! You will receive pickup details shortly.')
      navigate('/my-loads')
    } catch (err) {
      alert('❌ Failed to accept load')
    } finally {
      setIsAccepting(false)
    }
  }

  const handleRejectLoad = async () => {
    if (!load || !rejectionReason.trim()) return

    setIsRejecting(true)
    try {
      // In production: API call to reject load
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      
      alert('✅ Load rejected. The load will be returned to the Load Board.')
      navigate('/my-loads')
    } catch (err) {
      alert('❌ Failed to reject load')
    } finally {
      setIsRejecting(false)
      setShowRejectionModal(false)
      setRejectionReason('')
    }
  }

  const timeRemaining = calculateTimeRemaining()
  const isExpired = timeRemaining <= 0

  if (loading) {
    return (
      <PageContainer title="Load Acceptance" subtitle="Loading..." icon={Package}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px', flexDirection: 'column', gap: '16px' }}>
          <Loader size={48} style={{ animation: 'spin 1s linear infinite', color: theme.colors.primary }} />
          <p style={{ fontSize: '16px', color: theme.colors.textSecondary, fontWeight: '500' }}>Loading load details...</p>
        </div>
      </PageContainer>
    )
  }

  if (error || !load) {
    return (
      <PageContainer title="Load Acceptance" subtitle="Error" icon={Package}>
        <Card padding="24px">
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <AlertCircle size={48} color={theme.colors.error} style={{ marginBottom: '16px' }} />
            <h3 style={{ color: theme.colors.textPrimary, marginBottom: '8px' }}>Load Not Found</h3>
            <p style={{ color: theme.colors.textSecondary, marginBottom: '24px' }}>{error || 'The requested load could not be found.'}</p>
            <button
              onClick={() => navigate(-1)}
              style={{
                padding: '12px 24px',
                background: theme.colors.primary,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                margin: '0 auto'
              }}
            >
              <ArrowLeft size={16} />
              Go Back
            </button>
          </div>
        </Card>
      </PageContainer>
    )
  }

  return (
    <PageContainer
      title="Load Acceptance"
      subtitle={`${load.commodity} • ${load.origin.city} → ${load.destination.city}`}
      icon={Package}
      headerAction={
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: '12px 24px',
            background: 'transparent',
            color: theme.colors.textSecondary,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = theme.colors.backgroundCardHover
            e.currentTarget.style.borderColor = theme.colors.primary
            e.currentTarget.style.color = theme.colors.primary
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.borderColor = theme.colors.border
            e.currentTarget.style.color = theme.colors.textSecondary
          }}
        >
          <ArrowLeft size={16} />
          Back
        </button>
      }
    >
      {/* Timer Banner */}
      {!isExpired && timeRemaining > 0 && (
        <Card padding="20px" style={{ marginBottom: '24px', background: timeRemaining < 300 ? `${theme.colors.error}10` : `${theme.colors.warning}10`, border: `2px solid ${timeRemaining < 300 ? theme.colors.error : theme.colors.warning}` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            <Timer size={24} color={timeRemaining < 300 ? theme.colors.error : theme.colors.warning} />
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '16px', fontWeight: '600', color: theme.colors.textPrimary, margin: '0 0 4px 0' }}>
                {timeRemaining < 300 ? '⚠️ URGENT: ' : '⏰ '}Time Remaining
              </p>
              <p style={{ fontSize: '32px', fontWeight: 'bold', color: timeRemaining < 300 ? theme.colors.error : theme.colors.warning, margin: 0, fontFamily: 'monospace' }}>
                {formatTimeRemaining(timeRemaining)}
              </p>
              <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: '4px 0 0 0' }}>
                You must accept or reject this load before the deadline
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Expired Banner */}
      {isExpired && (
        <Card padding="20px" style={{ marginBottom: '24px', background: `${theme.colors.error}10`, border: `2px solid ${theme.colors.error}` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            <XCircle size={24} color={theme.colors.error} />
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.error, margin: '0 0 4px 0' }}>
                ⏰ Acceptance Deadline Expired
              </p>
              <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: 0 }}>
                This load has been automatically returned to the Load Board
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Load Information */}
      <div style={{ display: 'grid', gap: '24px', marginBottom: '24px' }}>
        {/* Load Details */}
        <Card padding="24px">
          <h3 style={{ color: theme.colors.textPrimary, fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Package size={20} />
            Load Information
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div>
              <label style={{ fontSize: '12px', color: theme.colors.textSecondary, textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.5px' }}>Commodity</label>
              <p style={{ fontSize: '16px', color: theme.colors.textPrimary, margin: '4px 0 0 0', fontWeight: '500' }}>{load.commodity}</p>
            </div>
            <div>
              <label style={{ fontSize: '12px', color: theme.colors.textSecondary, textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.5px' }}>Equipment</label>
              <p style={{ fontSize: '16px', color: theme.colors.textPrimary, margin: '4px 0 0 0', fontWeight: '500' }}>{load.equipmentType}</p>
            </div>
            <div>
              <label style={{ fontSize: '12px', color: theme.colors.textSecondary, textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.5px' }}>Rate</label>
              <p style={{ fontSize: '16px', color: theme.colors.textPrimary, margin: '4px 0 0 0', fontWeight: '500' }}>${formatNumber(load.revenue)}</p>
            </div>
            <div>
              <label style={{ fontSize: '12px', color: theme.colors.textSecondary, textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.5px' }}>Distance</label>
              <p style={{ fontSize: '16px', color: theme.colors.textPrimary, margin: '4px 0 0 0', fontWeight: '500' }}>{load.miles} miles</p>
            </div>
          </div>
        </Card>

        {/* Route Information */}
        <Card padding="24px">
          <h3 style={{ color: theme.colors.textPrimary, fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MapPin size={20} />
            Route Information
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '20px', alignItems: 'center' }}>
            <div>
              <label style={{ fontSize: '12px', color: theme.colors.textSecondary, textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.5px' }}>Pickup</label>
              <p style={{ fontSize: '16px', color: theme.colors.textPrimary, margin: '4px 0 0 0', fontWeight: '500' }}>{load.origin.siteName}</p>
              <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: '2px 0 0 0' }}>{load.origin.address}</p>
              <p style={{ fontSize: '12px', color: theme.colors.textTertiary, margin: '4px 0 0 0' }}>
                {new Date(load.pickupDate).toLocaleDateString()} @ {load.pickupETA}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Navigation size={24} color={theme.colors.primary} style={{ transform: 'rotate(90deg)' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: theme.colors.textSecondary, textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.5px' }}>Delivery</label>
              <p style={{ fontSize: '16px', color: theme.colors.textPrimary, margin: '4px 0 0 0', fontWeight: '500' }}>{load.destination.siteName}</p>
              <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: '2px 0 0 0' }}>{load.destination.address}</p>
              <p style={{ fontSize: '12px', color: theme.colors.textTertiary, margin: '4px 0 0 0' }}>
                {new Date(load.deliveryDate).toLocaleDateString()} @ {load.deliveryETA}
              </p>
            </div>
          </div>
        </Card>

        {/* Customer Information */}
        <Card padding="24px">
          <h3 style={{ color: theme.colors.textPrimary, fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Building size={20} />
            Customer Information
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div>
              <p style={{ fontSize: '16px', color: theme.colors.textPrimary, margin: '0 0 4px 0', fontWeight: '500' }}>{load.customer.name}</p>
              <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Phone size={12} />
                {load.customer.phone}
              </p>
            </div>
          </div>
        </Card>

        {/* Notes */}
        {load.notes && (
          <Card padding="24px">
            <h3 style={{ color: theme.colors.textPrimary, fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <MessageSquare size={20} />
              Special Instructions
            </h3>
            <p style={{ fontSize: '14px', color: theme.colors.textSecondary, lineHeight: 1.6, margin: 0 }}>{load.notes}</p>
          </Card>
        )}
      </div>

      {/* Action Buttons */}
      {!isExpired && (
        <Card padding="24px">
          <h3 style={{ color: theme.colors.textPrimary, fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle size={20} />
            Driver Acceptance
          </h3>
          <p style={{ fontSize: '14px', color: theme.colors.textSecondary, marginBottom: '24px', lineHeight: 1.5 }}>
            Please review the load details above and either accept or reject this assignment. 
            Your decision will be communicated to the customer immediately.
          </p>
          
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={handleAcceptLoad}
              disabled={isAccepting}
              style={{
                padding: '16px 32px',
                background: isAccepting ? theme.colors.backgroundTertiary : `linear-gradient(135deg, ${theme.colors.success} 0%, #059669 100%)`,
                color: isAccepting ? theme.colors.textTertiary : 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: isAccepting ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: isAccepting ? 'none' : `0 6px 20px ${theme.colors.success}40`,
                minWidth: '180px',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                if (!isAccepting) {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = `0 8px 25px ${theme.colors.success}50`
                }
              }}
              onMouseLeave={(e) => {
                if (!isAccepting) {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = `0 6px 20px ${theme.colors.success}40`
                }
              }}
            >
              {isAccepting ? <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} /> : <ThumbsUp size={20} />}
              {isAccepting ? 'Accepting...' : 'Accept Load'}
            </button>

            <button
              onClick={() => setShowRejectionModal(true)}
              disabled={isRejecting}
              style={{
                padding: '16px 32px',
                background: isRejecting ? theme.colors.backgroundTertiary : 'transparent',
                color: isRejecting ? theme.colors.textTertiary : theme.colors.error,
                border: `2px solid ${isRejecting ? theme.colors.border : theme.colors.error}`,
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: isRejecting ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                minWidth: '180px',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                if (!isRejecting) {
                  e.currentTarget.style.background = `${theme.colors.error}20`
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isRejecting) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.transform = 'translateY(0)'
                }
              }}
            >
              {isRejecting ? <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} /> : <ThumbsDown size={20} />}
              {isRejecting ? 'Rejecting...' : 'Reject Load'}
            </button>
          </div>
        </Card>
      )}

      {/* Rejection Modal */}
      {showRejectionModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)', padding: '20px' }} onClick={() => setShowRejectionModal(false)}>
          <div style={{ background: theme.colors.backgroundCard, borderRadius: '20px', padding: '36px', maxWidth: '500px', width: '100%', border: `1px solid ${theme.colors.border}`, boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <AlertCircle size={48} color={theme.colors.error} style={{ marginBottom: '16px' }} />
              <h2 style={{ color: theme.colors.textPrimary, fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>Reject Load Assignment</h2>
              <p style={{ color: theme.colors.textSecondary, fontSize: '14px', lineHeight: 1.5 }}>
                Please provide a reason for rejecting this load. This will help improve future load matching.
              </p>
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                Reason for Rejection
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g., Equipment not available, Schedule conflict, Distance too far..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: theme.colors.background,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: '8px',
                  color: theme.colors.textPrimary,
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  resize: 'vertical'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = theme.colors.primary
                  e.target.style.boxShadow = `0 0 0 3px ${theme.colors.primary}20`
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = theme.colors.border
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => setShowRejectionModal(false)}
                style={{
                  padding: '12px 24px',
                  background: theme.colors.backgroundTertiary,
                  color: theme.colors.textSecondary,
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = theme.colors.backgroundCardHover}
                onMouseLeave={(e) => e.currentTarget.style.background = theme.colors.backgroundTertiary}
              >
                Cancel
              </button>
              <button
                onClick={handleRejectLoad}
                disabled={!rejectionReason.trim() || isRejecting}
                style={{
                  padding: '12px 24px',
                  background: rejectionReason.trim() && !isRejecting ? theme.colors.error : theme.colors.backgroundTertiary,
                  color: rejectionReason.trim() && !isRejecting ? 'white' : theme.colors.textTertiary,
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: rejectionReason.trim() && !isRejecting ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {isRejecting ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <ThumbsDown size={16} />}
                {isRejecting ? 'Rejecting...' : 'Reject Load'}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  )
}

export default CarrierAcceptancePage


