import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { rateConService } from '../services/rateConService'
import { smsService } from '../services/smsService'
import PageContainer from '../components/shared/PageContainer'
import Card from '../components/ui/Card'
import { formatNumber, formatCurrency, formatCompactCurrency, formatPercentage } from '../utils/formatters';

import { 
  Truck, Clock, CheckCircle, XCircle, MapPin, 
  Calendar, DollarSign, Phone, AlertCircle, Loader
} from 'lucide-react'

interface DriverAcceptancePageProps {}

const DriverAcceptancePage: React.FC<DriverAcceptancePageProps> = () => {
  const { workflowId } = useParams<{ workflowId: string }>()
  const { theme } = useTheme()
  const navigate = useNavigate()
  
  const [workflow, setWorkflow] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<string>('')
  const [isAccepting, setIsAccepting] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)

  useEffect(() => {
    if (workflowId) {
      loadWorkflow()
      startTimer()
    }
  }, [workflowId])

  const loadWorkflow = async () => {
    try {
      setLoading(true)
      
      // Get workflow from Rate Con service
      const workflowData = rateConService.getWorkflow(workflowId!)
      
      if (!workflowData) {
        setError('Load assignment not found or expired')
        return
      }

      // Mock load data (in production, fetch from API)
      const mockLoadData = {
        id: workflowData.loadId,
        commodity: 'Crushed Limestone',
        equipment: 'End Dump',
        pickupAddress: '1234 Quarry Rd, Austin, TX 78701',
        deliveryAddress: '5678 Construction Site, San Antonio, TX 78205',
        pickupDate: '2025-10-15',
        pickupETA: '8:00 AM - 10:00 AM',
        deliveryDate: '2025-10-15',
        deliveryETA: '2:00 PM - 4:00 PM',
        rate: 75,
        rateMode: 'PER_TON',
        units: 18.5,
        grossRevenue: 1387.50,
        pickupContact: { name: 'Tom Martinez', phone: '(512) 555-0123' },
        deliveryContact: { name: 'John Foreman', phone: '(210) 555-0456' },
        driverPhone: '(512) 555-0198',
        dispatchPhone: '(512) 555-0100'
      }

      setWorkflow({ ...workflowData, loadData: mockLoadData })
      
    } catch (err: any) {
      setError(err.message || 'Failed to load load assignment')
    } finally {
      setLoading(false)
    }
  }

  const startTimer = () => {
    const updateTimer = () => {
      if (workflow?.driverAcceptanceDeadline) {
        const deadline = new Date(workflow.driverAcceptanceDeadline).getTime()
        const now = Date.now()
        const remaining = deadline - now

        if (remaining <= 0) {
          setTimeRemaining('EXPIRED')
          setError('Acceptance deadline has passed. Load has been returned to load board.')
          return
        }

        const minutes = Math.floor(remaining / 60000)
        const seconds = Math.floor((remaining % 60000) / 1000)
        setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`)
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    
    return () => clearInterval(interval)
  }

  const handleAccept = async () => {
    if (!workflow || !workflowId) return

    setIsAccepting(true)
    
    try {
      const success = await rateConService.driverAcceptLoad(workflowId, workflow.loadData?.driverPhone || '')
      
      if (success) {
        // Show success message
        alert('✅ LOAD ACCEPTED!\n\nYou have successfully accepted this load assignment.\n\nNext steps:\n• Arrive at pickup location on time\n• Contact pickup contact upon arrival\n• Complete delivery as scheduled\n\nLoad details have been sent to your dispatch.')
        
        // Redirect or close
        navigate('/driver-dashboard')
      } else {
        alert('❌ ACCEPTANCE FAILED\n\nThis load assignment has expired or is no longer available.')
      }
    } catch (err: any) {
      alert(`❌ Error accepting load: ${err.message}`)
    } finally {
      setIsAccepting(false)
    }
  }

  const handleReject = async () => {
    if (!workflow || !workflowId) return

    const reason = prompt('Please provide a reason for rejecting this load:')
    if (!reason) return

    setIsRejecting(true)
    
    try {
      await rateConService.driverRejectLoad(workflowId, workflow.loadData?.driverPhone || '')
      
      // Show rejection message
      alert('❌ LOAD REJECTED\n\nYou have rejected this load assignment.\n\nReason: ' + reason + '\n\nThe load has been returned to the load board.')
      
      // Redirect or close
      navigate('/driver-dashboard')
    } catch (err: any) {
      alert(`❌ Error rejecting load: ${err.message}`)
    } finally {
      setIsRejecting(false)
    }
  }

  if (loading) {
    return (
      <PageContainer title="Load Assignment" subtitle="Loading assignment details...">
        <Card padding="40px" style={{ textAlign: 'center' }}>
          <Loader size={48} className="animate-spin" style={{ color: theme.colors.primary, margin: '0 auto 20px' }} />
          <p style={{ color: theme.colors.textSecondary }}>Loading load assignment...</p>
        </Card>
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer title="Load Assignment" subtitle="Assignment Error">
        <Card padding="40px" style={{ textAlign: 'center' }}>
          <AlertCircle size={48} style={{ color: theme.colors.error, margin: '0 auto 20px' }} />
          <h3 style={{ color: theme.colors.error, marginBottom: '16px' }}>Assignment Error</h3>
          <p style={{ color: theme.colors.textSecondary, marginBottom: '24px' }}>{error}</p>
          <button
            onClick={() => navigate('/driver-dashboard')}
            style={{
              padding: '12px 24px',
              backgroundColor: theme.colors.primary,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Go to Dashboard
          </button>
        </Card>
      </PageContainer>
    )
  }

  if (!workflow) {
    return (
      <PageContainer title="Load Assignment" subtitle="Assignment Not Found">
        <Card padding="40px" style={{ textAlign: 'center' }}>
          <XCircle size={48} style={{ color: theme.colors.error, margin: '0 auto 20px' }} />
          <h3 style={{ color: theme.colors.error, marginBottom: '16px' }}>Assignment Not Found</h3>
          <p style={{ color: theme.colors.textSecondary }}>This load assignment could not be found or has expired.</p>
        </Card>
      </PageContainer>
    )
  }

  const { loadData } = workflow

  return (
    <PageContainer title="Load Assignment" subtitle="Driver Acceptance Required">
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Time Remaining Alert */}
        <Card padding="20px" style={{ 
          marginBottom: '24px',
          backgroundColor: timeRemaining === 'EXPIRED' ? `${theme.colors.error}10` : `${theme.colors.warning}10`,
          border: `2px solid ${timeRemaining === 'EXPIRED' ? theme.colors.error : theme.colors.warning}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center' }}>
            <Clock size={24} color={timeRemaining === 'EXPIRED' ? theme.colors.error : theme.colors.warning} />
            <span style={{ 
              fontSize: '18px', 
              fontWeight: '700',
              color: timeRemaining === 'EXPIRED' ? theme.colors.error : theme.colors.warning
            }}>
              {timeRemaining === 'EXPIRED' ? 'DEADLINE EXPIRED' : `TIME REMAINING: ${timeRemaining}`}
            </span>
          </div>
          {timeRemaining !== 'EXPIRED' && (
            <p style={{ textAlign: 'center', marginTop: '8px', color: theme.colors.textSecondary, fontSize: '14px' }}>
              You must accept or reject this load within the time limit
            </p>
          )}
        </Card>

        {/* Load Details */}
        <Card padding="24px" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <Truck size={24} color={theme.colors.primary} />
            <h2 style={{ color: theme.colors.textPrimary, margin: 0 }}>Load Assignment Details</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            
            {/* Load Information */}
            <div>
              <h3 style={{ color: theme.colors.textPrimary, marginBottom: '12px', fontSize: '16px' }}>Load Information</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: theme.colors.textSecondary }}>Load ID:</span>
                  <span style={{ fontWeight: '600', color: theme.colors.textPrimary }}>{loadData.id}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: theme.colors.textSecondary }}>Commodity:</span>
                  <span style={{ fontWeight: '600', color: theme.colors.textPrimary }}>{loadData.commodity}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: theme.colors.textSecondary }}>Equipment:</span>
                  <span style={{ fontWeight: '600', color: theme.colors.textPrimary }}>{loadData.equipment}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: theme.colors.textSecondary }}>Units:</span>
                  <span style={{ fontWeight: '600', color: theme.colors.textPrimary }}>{loadData.units} tons</span>
                </div>
              </div>
            </div>

            {/* Financial Information */}
            <div>
              <h3 style={{ color: theme.colors.textPrimary, marginBottom: '12px', fontSize: '16px' }}>Financial</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: theme.colors.textSecondary }}>Rate:</span>
                  <span style={{ fontWeight: '600', color: theme.colors.textPrimary }}>
                    ${loadData.rate}/{loadData.rateMode.replace('PER_', '/').toLowerCase()}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: theme.colors.textSecondary }}>Gross Revenue:</span>
                  <span style={{ fontWeight: '600', color: theme.colors.success }}>
                    ${formatNumber(loadData.grossRevenue, "0")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Pickup & Delivery */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px', marginBottom: '24px' }}>
          
          {/* Pickup */}
          <Card padding="20px">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <MapPin size={20} color={theme.colors.primary} />
              <h3 style={{ color: theme.colors.textPrimary, margin: 0, fontSize: '16px' }}>Pickup</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div>
                <span style={{ color: theme.colors.textSecondary, fontSize: '14px' }}>Location:</span>
                <p style={{ margin: '4px 0 0 0', color: theme.colors.textPrimary, fontWeight: '500' }}>
                  {loadData.pickupAddress}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                <Calendar size={16} color={theme.colors.textSecondary} />
                <span style={{ color: theme.colors.textSecondary, fontSize: '14px' }}>
                  {loadData.pickupDate} - {loadData.pickupETA}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                <Phone size={16} color={theme.colors.textSecondary} />
                <span style={{ color: theme.colors.textSecondary, fontSize: '14px' }}>
                  {loadData.pickupContact.name} - {loadData.pickupContact.phone}
                </span>
              </div>
            </div>
          </Card>

          {/* Delivery */}
          <Card padding="20px">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <MapPin size={20} color={theme.colors.success} />
              <h3 style={{ color: theme.colors.textPrimary, margin: 0, fontSize: '16px' }}>Delivery</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div>
                <span style={{ color: theme.colors.textSecondary, fontSize: '14px' }}>Location:</span>
                <p style={{ margin: '4px 0 0 0', color: theme.colors.textPrimary, fontWeight: '500' }}>
                  {loadData.deliveryAddress}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                <Calendar size={16} color={theme.colors.textSecondary} />
                <span style={{ color: theme.colors.textSecondary, fontSize: '14px' }}>
                  {loadData.deliveryDate} - {loadData.deliveryETA}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                <Phone size={16} color={theme.colors.textSecondary} />
                <span style={{ color: theme.colors.textSecondary, fontSize: '14px' }}>
                  {loadData.deliveryContact.name} - {loadData.deliveryContact.phone}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Action Buttons */}
        {timeRemaining !== 'EXPIRED' && (
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button
              onClick={handleAccept}
              disabled={isAccepting || isRejecting}
              style={{
                padding: '16px 32px',
                backgroundColor: theme.colors.success,
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '700',
                cursor: isAccepting || isRejecting ? 'not-allowed' : 'pointer',
                opacity: isAccepting || isRejecting ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!isAccepting && !isRejecting) {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = `0 8px 20px ${theme.colors.success}40`
                }
              }}
              onMouseLeave={(e) => {
                if (!isAccepting && !isRejecting) {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }
              }}
            >
              {isAccepting ? <Loader size={20} className="animate-spin" /> : <CheckCircle size={20} />}
              {isAccepting ? 'Accepting...' : 'Accept Load'}
            </button>

            <button
              onClick={handleReject}
              disabled={isAccepting || isRejecting}
              style={{
                padding: '16px 32px',
                backgroundColor: 'transparent',
                color: theme.colors.error,
                border: `2px solid ${theme.colors.error}`,
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '700',
                cursor: isAccepting || isRejecting ? 'not-allowed' : 'pointer',
                opacity: isAccepting || isRejecting ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!isAccepting && !isRejecting) {
                  e.currentTarget.style.backgroundColor = theme.colors.error
                  e.currentTarget.style.color = 'white'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = `0 8px 20px ${theme.colors.error}40`
                }
              }}
              onMouseLeave={(e) => {
                if (!isAccepting && !isRejecting) {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = theme.colors.error
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }
              }}
            >
              {isRejecting ? <Loader size={20} className="animate-spin" /> : <XCircle size={20} />}
              {isRejecting ? 'Rejecting...' : 'Reject Load'}
            </button>
          </div>
        )}
      </div>
    </PageContainer>
  )
}

export default DriverAcceptancePage


