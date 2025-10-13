import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext-fixed'
import PageContainer from '../components/shared/PageContainer'
import Card from '../components/ui/Card'
import { formatNumber, formatCurrency, formatCompactCurrency, formatPercentage } from '../utils/formatters';

import {
  Package, MapPin, Clock, Navigation, AlertCircle, CheckCircle,
  User, Phone, ArrowLeft, RefreshCw, Loader, Truck, TrendingUp,
  CloudRain, AlertTriangle, Info, Activity
} from 'lucide-react'

interface LoadTracking {
  id: string
  loadNumber: string
  commodity: string
  status: string
  customer: { name: string; phone: string }
  carrier: { name: string; phone: string }
  driver: { name: string; phone: string; license: string }
  origin: { siteName: string; address: string; city: string; state: string }
  destination: { siteName: string; address: string; city: string; state: string }
  currentLocation: { address: string; timestamp: string; lat: number; lng: number }
  pickupDate: string
  deliveryDate: string
  estimatedArrival: string
  actualProgress: number
  milestones: Milestone[]
  updates: Update[]
  lastUpdate: string
}

interface Milestone {
  id: string
  name: string
  type: 'PICKUP' | 'CHECKPOINT' | 'DELIVERY'
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
  estimatedTime: string
  actualTime?: string
  location: { address: string }
  notes?: string
}

interface Update {
  id: string
  type: 'TRAFFIC' | 'WEATHER' | 'STATUS' | 'ALERT' | 'INFO'
  severity: 'LOW' | 'MEDIUM' | 'HIGH'
  message: string
  timestamp: string
  location?: string
}

const LoadTrackingPage = () => {
  const { theme } = useTheme()
  const { user } = useAuth()
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [loadTracking, setLoadTracking] = useState<LoadTracking | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    loadTrackingData()
    
    // Set up real-time updates every 30 seconds
    const interval = setInterval(() => {
      updateTrackingData()
    }, 30000)

    return () => clearInterval(interval)
  }, [id])

  const loadTrackingData = async () => {
    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Please log in to view load tracking')
        return
      }

      const isDevMode = token.startsWith('dev-')

      if (isDevMode) {
        console.log('🧪 Development mode - using mock load tracking data')

        // Mock comprehensive load tracking data
        setLoadTracking({
          id: id || 'load-001',
          loadNumber: 'LD-001',
          commodity: 'Crushed Limestone',
          status: 'IN_TRANSIT',
          customer: { name: 'ABC Construction', phone: '(512) 555-0123' },
          carrier: { name: 'Superior One Logistics', phone: '(512) 555-0198' },
          driver: { name: 'John Smith', phone: '(512) 555-0198', license: 'DL-123456789' },
          origin: { 
            siteName: 'Main Quarry', 
            address: '1234 Rock Rd', 
            city: 'Austin',
            state: 'TX'
          },
          destination: { 
            siteName: 'Downtown Project', 
            address: '789 Congress Ave', 
            city: 'Austin',
            state: 'TX'
          },
          currentLocation: {
            address: 'I-35 S near Ben White Blvd, Austin, TX',
            timestamp: new Date().toISOString(),
            lat: 30.2672,
            lng: -97.7431
          },
          pickupDate: '2025-10-09',
          deliveryDate: '2025-10-09',
          estimatedArrival: '2:00 PM',
          actualProgress: 65,
          milestones: [
            {
              id: 'milestone-1',
              name: 'Pickup - Main Quarry',
              type: 'PICKUP',
              status: 'COMPLETED',
              estimatedTime: '8:00 AM',
              actualTime: '8:15 AM',
              location: { address: '1234 Rock Rd, Austin, TX' },
              notes: 'Loaded 18.5 tons successfully. BOL signed by dispatcher.'
            },
            {
              id: 'milestone-2',
              name: 'Highway Entrance - I-35',
              type: 'CHECKPOINT',
              status: 'COMPLETED',
              estimatedTime: '9:00 AM',
              actualTime: '9:30 AM',
              location: { address: 'I-35 S Entrance, Austin, TX' },
              notes: 'On route, no issues reported.'
            },
            {
              id: 'milestone-3',
              name: 'Downtown Exit',
              type: 'CHECKPOINT',
              status: 'IN_PROGRESS',
              estimatedTime: '1:30 PM',
              location: { address: 'Congress Ave Exit, Austin, TX' },
              notes: 'Approaching downtown area. Traffic congestion expected.'
            },
            {
              id: 'milestone-4',
              name: 'Delivery - Downtown Project',
              type: 'DELIVERY',
              status: 'PENDING',
              estimatedTime: '2:00 PM',
              location: { address: '789 Congress Ave, Austin, TX' },
              notes: 'Customer notified of ETA. Delivery crew standing by.'
            }
          ],
          updates: [
            {
              id: 'update-1',
              type: 'TRAFFIC',
              severity: 'MEDIUM',
              message: 'Moderate traffic congestion on I-35 S near downtown. ETA delayed by 15 minutes.',
              timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
              location: 'I-35 S, Austin, TX'
            },
            {
              id: 'update-2',
              type: 'WEATHER',
              severity: 'LOW',
              message: 'Clear skies, 75°F. Ideal conditions for delivery.',
              timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
              location: 'Austin, TX'
            },
            {
              id: 'update-3',
              type: 'STATUS',
              severity: 'LOW',
              message: 'Driver completed mandatory break. Resuming route.',
              timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
              location: 'Rest Area, I-35'
            },
            {
              id: 'update-4',
              type: 'INFO',
              severity: 'LOW',
              message: 'Customer requested delivery time change to 2:30 PM. Updated ETA confirmed.',
              timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString()
            }
          ],
          lastUpdate: new Date().toISOString()
        })
      } else {
        // Production API call
        const response = await fetch(`/api/loads/${id}/tracking`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error('Failed to load tracking data')
        }

        const data = await response.json()
        setLoadTracking(data.tracking)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load tracking data')
    } finally {
      setLoading(false)
    }
  }

  const updateTrackingData = async () => {
    if (!loadTracking) return

    setIsRefreshing(true)
    try {
      // Simulate real-time updates
      setLoadTracking(prev => prev ? {
        ...prev,
        currentLocation: {
          ...prev.currentLocation,
          timestamp: new Date().toISOString()
        },
        lastUpdate: new Date().toISOString(),
        actualProgress: Math.min(prev.actualProgress + Math.random() * 2, 100)
      } : null)
    } catch (err) {
      console.error('Error updating tracking data:', err)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleRefresh = () => {
    updateTrackingData()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return theme.colors.textSecondary
      case 'IN_PROGRESS': return theme.colors.primary
      case 'COMPLETED': return theme.colors.success
      default: return theme.colors.textSecondary
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'LOW': return theme.colors.info
      case 'MEDIUM': return theme.colors.warning
      case 'HIGH': return theme.colors.error
      default: return theme.colors.textSecondary
    }
  }

  const getUpdateIcon = (type: string) => {
    switch (type) {
      case 'TRAFFIC': return AlertTriangle
      case 'WEATHER': return CloudRain
      case 'STATUS': return Activity
      case 'ALERT': return AlertCircle
      default: return Info
    }
  }

  if (loading) {
    return (
      <PageContainer title="Load Tracking" subtitle="Loading..." icon={Navigation}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px', flexDirection: 'column', gap: '16px' }}>
          <Loader size={48} style={{ animation: 'spin 1s linear infinite', color: theme.colors.primary }} />
          <p style={{ fontSize: '16px', color: theme.colors.textSecondary, fontWeight: '500' }}>Loading tracking data...</p>
        </div>
      </PageContainer>
    )
  }

  if (error || !loadTracking) {
    return (
      <PageContainer title="Load Tracking" subtitle="Error" icon={Navigation}>
        <Card padding="24px">
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <AlertCircle size={48} color={theme.colors.error} style={{ marginBottom: '16px' }} />
            <h3 style={{ color: theme.colors.textPrimary, marginBottom: '8px' }}>Tracking Not Available</h3>
            <p style={{ color: theme.colors.textSecondary, marginBottom: '24px' }}>{error || 'Unable to load tracking data for this load.'}</p>
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
      title={`Tracking Load #${loadTracking.loadNumber}`}
      subtitle={`${loadTracking.commodity} • ${loadTracking.origin.city}, ${loadTracking.origin.state} → ${loadTracking.destination.city}, ${loadTracking.destination.state}`}
      icon={Navigation}
      headerAction={
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            style={{
              padding: '12px 24px',
              background: 'transparent',
              color: theme.colors.textSecondary,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: isRefreshing ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (!isRefreshing) {
                e.currentTarget.style.background = theme.colors.backgroundCardHover
                e.currentTarget.style.borderColor = theme.colors.primary
                e.currentTarget.style.color = theme.colors.primary
              }
            }}
            onMouseLeave={(e) => {
              if (!isRefreshing) {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.borderColor = theme.colors.border
                e.currentTarget.style.color = theme.colors.textSecondary
              }
            }}
          >
            {isRefreshing ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <RefreshCw size={16} />}
            {isRefreshing ? 'Updating...' : 'Refresh'}
          </button>
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
            Back to My Loads
          </button>
        </div>
      }
    >
      {/* Progress Banner */}
      <Card padding="20px" style={{ marginBottom: '24px', background: `${theme.colors.primary}10`, border: `2px solid ${theme.colors.primary}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Activity size={20} color={theme.colors.success} />
            <span style={{ fontSize: '16px', fontWeight: '600', color: theme.colors.textPrimary }}>
              Live Tracking Active
            </span>
            <span style={{ fontSize: '14px', color: theme.colors.textSecondary }}>
              • Updated {new Date(loadTracking.lastUpdate).toLocaleTimeString()}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '14px', color: theme.colors.textSecondary, marginBottom: '4px' }}>Progress</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: theme.colors.primary }}>
                {Math.round(loadTracking.actualProgress)}%
              </div>
            </div>
            <div style={{ width: '150px', height: '8px', background: theme.colors.backgroundTertiary, borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                width: `${loadTracking.actualProgress}%`,
                height: '100%',
                background: `linear-gradient(90deg, ${theme.colors.primary} 0%, ${theme.colors.success} 100%)`,
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>
        </div>
      </Card>

      {/* MAP PLACEHOLDER - This will be integrated with mobile app GPS */}
      <Card padding="0" style={{ marginBottom: '24px', overflow: 'hidden' }}>
        <div style={{
          width: '100%',
          height: '500px',
          background: `linear-gradient(135deg, ${theme.colors.backgroundTertiary} 0%, ${theme.colors.backgroundSecondary} 100%)`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          borderRadius: '12px'
        }}>
          <MapPin size={64} color={theme.colors.primary} style={{ marginBottom: '20px', opacity: 0.3 }} />
          <h3 style={{ color: theme.colors.textPrimary, fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>
            Live GPS Map View
          </h3>
          <p style={{ color: theme.colors.textSecondary, fontSize: '14px', maxWidth: '500px', textAlign: 'center', lineHeight: 1.6 }}>
            Real-time map integration ready for mobile app connection.
            <br />
            Driver's physical location will be displayed here via GPS tracking.
          </p>
          
          {/* Current Location Overlay */}
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            background: theme.colors.backgroundCard,
            padding: '16px 20px',
            borderRadius: '12px',
            border: `1px solid ${theme.colors.border}`,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            maxWidth: '350px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <Navigation size={18} color={theme.colors.success} />
              <span style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary }}>
                Current Location
              </span>
            </div>
            <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: '0 0 6px 0' }}>
              {loadTracking.currentLocation.address}
            </p>
            <p style={{ fontSize: '12px', color: theme.colors.textTertiary, margin: 0 }}>
              GPS: {formatNumber(loadTracking.currentLocation.lat, "4")}, {formatNumber(loadTracking.currentLocation.lng, "4")}
            </p>
          </div>

          {/* ETA Overlay */}
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: theme.colors.backgroundCard,
            padding: '16px 20px',
            borderRadius: '12px',
            border: `1px solid ${theme.colors.border}`,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <Clock size={18} color={theme.colors.info} />
              <span style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary }}>
                Estimated Arrival
              </span>
            </div>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: theme.colors.primary, margin: 0 }}>
              {loadTracking.estimatedArrival}
            </p>
          </div>
        </div>
      </Card>

      {/* Route Milestones */}
      <Card padding="24px" style={{ marginBottom: '24px' }}>
        <h3 style={{ color: theme.colors.textPrimary, fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <TrendingUp size={20} />
          Route Milestones
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {loadTracking.milestones.map((milestone, index) => (
            <div key={milestone.id} style={{ display: 'flex', gap: '16px' }}>
              {/* Timeline dot and line */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '24px' }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  background: getStatusColor(milestone.status),
                  border: `3px solid ${theme.colors.backgroundCard}`,
                  boxShadow: `0 0 0 2px ${getStatusColor(milestone.status)}`,
                  zIndex: 1
                }} />
                {index < loadTracking.milestones.length - 1 && (
                  <div style={{
                    width: '2px',
                    flex: 1,
                    background: theme.colors.border,
                    marginTop: '4px',
                    minHeight: '60px'
                  }} />
                )}
              </div>

              {/* Milestone content */}
              <div style={{ flex: 1, paddingBottom: index < loadTracking.milestones.length - 1 ? '0' : '0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
                  <span style={{
                    padding: '4px 10px',
                    background: `${getStatusColor(milestone.status)}20`,
                    color: getStatusColor(milestone.status),
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '600',
                    textTransform: 'uppercase'
                  }}>
                    {milestone.status.replace('_', ' ')}
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary }}>
                    {milestone.name}
                  </span>
                  <span style={{ fontSize: '13px', color: theme.colors.textSecondary }}>
                    {milestone.actualTime ? (
                      <>✓ {milestone.actualTime}</>
                    ) : (
                      <>ETA: {milestone.estimatedTime}</>
                    )}
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: theme.colors.textSecondary, margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={14} />
                  {milestone.location.address}
                </p>
                {milestone.notes && (
                  <p style={{ fontSize: '13px', color: theme.colors.textTertiary, margin: 0, fontStyle: 'italic', paddingLeft: '20px' }}>
                    {milestone.notes}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Traffic, Weather & Relevant Updates */}
      <Card padding="24px">
        <h3 style={{ color: theme.colors.textPrimary, fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle size={20} />
          Traffic, Weather & Updates
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {loadTracking.updates.map(update => {
            const UpdateIcon = getUpdateIcon(update.type)
            return (
              <div
                key={update.id}
                style={{
                  padding: '16px',
                  background: `${getSeverityColor(update.severity)}10`,
                  border: `1px solid ${getSeverityColor(update.severity)}`,
                  borderRadius: '8px',
                  borderLeft: `4px solid ${getSeverityColor(update.severity)}`
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <UpdateIcon size={20} color={getSeverityColor(update.severity)} style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                      <span style={{
                        padding: '3px 8px',
                        background: `${getSeverityColor(update.severity)}20`,
                        color: getSeverityColor(update.severity),
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '600',
                        textTransform: 'uppercase'
                      }}>
                        {update.type}
                      </span>
                      <span style={{ fontSize: '12px', color: theme.colors.textSecondary }}>
                        {new Date(update.timestamp).toLocaleString()}
                      </span>
                      {update.location && (
                        <span style={{ fontSize: '12px', color: theme.colors.textTertiary, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={12} />
                          {update.location}
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '14px', color: theme.colors.textPrimary, margin: 0, lineHeight: 1.5 }}>
                      {update.message}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </PageContainer>
  )
}

export default LoadTrackingPage
