import React, { useState } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { 
  X, User, Phone, CheckCircle, AlertCircle, Truck, Clock, 
  MessageSquare, Shield, TrendingUp, Calendar, MapPin, Package,
  DollarSign
} from 'lucide-react'
import type { Load } from '../types'

interface Driver {
  id: string
  name: string
  phone: string
  cdlClass: string
  cdlVerified: boolean
  phoneVerified: boolean
  truckNumber: string
  trailerNumber: string
  equipmentType: string
  status: 'available' | 'on_load' | 'off_duty'
  availableUntil?: string
  acceptanceRate: number
  totalLoadsCompleted: number
  rating: number
  currentLocation?: string
  distanceFromPickup?: number
}

interface DriverAssignmentModalProps {
  load: Load
  drivers: Driver[]
  onAssign: (driverId: string, timeoutMinutes: number, notes?: string) => Promise<void>
  onClose: () => void
}

const DriverAssignmentModal: React.FC<DriverAssignmentModalProps> = ({
  load,
  drivers,
  onAssign,
  onClose
}) => {
  const { theme } = useTheme()
  const [selectedDriver, setSelectedDriver] = useState<string>('')
  const [timeoutMinutes, setTimeoutMinutes] = useState(30)
  const [dispatchNotes, setDispatchNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const timeoutOptions = [
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes (Recommended)' },
    { value: 60, label: '60 minutes' },
    { value: 120, label: '2 hours' }
  ]

  const handleAssign = async () => {
    if (!selectedDriver) {
      setError('Please select a driver')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      await onAssign(selectedDriver, timeoutMinutes, dispatchNotes)
    } catch (err) {
      setError('Failed to assign load. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return theme.colors.success
      case 'on_load':
        return theme.colors.warning
      case 'off_duty':
        return theme.colors.error
      default:
        return theme.colors.textSecondary
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available':
        return 'Available'
      case 'on_load':
        return 'On Load'
      case 'off_duty':
        return 'Off Duty'
      default:
        return status
    }
  }

  // Sort drivers: available first, then by acceptance rate
  const sortedDrivers = [...drivers].sort((a, b) => {
    if (a.status === 'available' && b.status !== 'available') return -1
    if (a.status !== 'available' && b.status === 'available') return 1
    return b.acceptanceRate - a.acceptanceRate
  })

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
        maxWidth: '900px',
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
              Assign Driver to Load
            </h2>
            <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: 0 }}>
              Load #{load.id} • {load.origin.city}, {load.origin.state} → {load.destination.city}, {load.destination.state}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            style={{
              background: 'transparent',
              border: 'none',
              color: theme.colors.textSecondary,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              padding: '8px'
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {/* Load Summary */}
          <div style={{
            padding: '20px',
            background: theme.colors.backgroundSecondary,
            borderRadius: '12px',
            border: `1px solid ${theme.colors.border}`,
            marginBottom: '24px'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '16px' }}>
              Load Summary
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' }}>
              <div style={{ textAlign: 'center', padding: '12px', background: theme.colors.backgroundPrimary, borderRadius: '8px' }}>
                <DollarSign size={16} color={theme.colors.success} style={{ marginBottom: '4px' }} />
                <div style={{ fontSize: '16px', fontWeight: '700', color: theme.colors.textPrimary }}>
                  ${load.rate.toFixed(2)}
                </div>
                <div style={{ fontSize: '11px', color: theme.colors.textSecondary }}>Rate</div>
              </div>

              <div style={{ textAlign: 'center', padding: '12px', background: theme.colors.backgroundPrimary, borderRadius: '8px' }}>
                <Calendar size={16} color={theme.colors.primary} style={{ marginBottom: '4px' }} />
                <div style={{ fontSize: '16px', fontWeight: '700', color: theme.colors.textPrimary }}>
                  {new Date(load.pickupDate).toLocaleDateString()}
                </div>
                <div style={{ fontSize: '11px', color: theme.colors.textSecondary }}>Pickup</div>
              </div>

              <div style={{ textAlign: 'center', padding: '12px', background: theme.colors.backgroundPrimary, borderRadius: '8px' }}>
                <Package size={16} color={theme.colors.warning} style={{ marginBottom: '4px' }} />
                <div style={{ fontSize: '14px', fontWeight: '700', color: theme.colors.textPrimary }}>
                  {load.commodity}
                </div>
                <div style={{ fontSize: '11px', color: theme.colors.textSecondary }}>Commodity</div>
              </div>

              <div style={{ textAlign: 'center', padding: '12px', background: theme.colors.backgroundPrimary, borderRadius: '8px' }}>
                <Truck size={16} color={theme.colors.info} style={{ marginBottom: '4px' }} />
                <div style={{ fontSize: '14px', fontWeight: '700', color: theme.colors.textPrimary }}>
                  {load.equipmentType}
                </div>
                <div style={{ fontSize: '11px', color: theme.colors.textSecondary }}>Equipment</div>
              </div>
            </div>
          </div>

          {/* Driver Selection */}
          <div style={{
            padding: '20px',
            background: theme.colors.backgroundSecondary,
            borderRadius: '12px',
            border: `1px solid ${theme.colors.border}`,
            marginBottom: '24px'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '16px' }}>
              Select Verified Driver
            </h3>

            <div style={{ display: 'grid', gap: '12px', maxHeight: '400px', overflowY: 'auto', paddingRight: '8px' }}>
              {sortedDrivers.map((driver) => (
                <div
                  key={driver.id}
                  onClick={() => driver.status === 'available' && setSelectedDriver(driver.id)}
                  style={{
                    padding: '16px',
                    background: selectedDriver === driver.id 
                      ? `${theme.colors.primary}15` 
                      : theme.colors.backgroundPrimary,
                    borderRadius: '12px',
                    border: `2px solid ${selectedDriver === driver.id ? theme.colors.primary : theme.colors.border}`,
                    cursor: driver.status === 'available' ? 'pointer' : 'not-allowed',
                    opacity: driver.status === 'available' ? 1 : 0.6,
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                    {/* Radio Button */}
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      border: `2px solid ${selectedDriver === driver.id ? theme.colors.primary : theme.colors.border}`,
                      background: selectedDriver === driver.id ? theme.colors.primary : 'transparent',
                      flexShrink: 0,
                      marginTop: '2px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {selectedDriver === driver.id && (
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: 'white'
                        }} />
                      )}
                    </div>

                    {/* Driver Info */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
                        <div style={{ fontSize: '16px', fontWeight: '700', color: theme.colors.textPrimary }}>
                          {driver.name}
                        </div>
                        
                        <div style={{
                          padding: '4px 12px',
                          background: getStatusColor(driver.status) + '20',
                          color: getStatusColor(driver.status),
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {getStatusLabel(driver.status)}
                        </div>

                        {driver.cdlVerified && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: theme.colors.success }}>
                            <Shield size={14} />
                            CDL Verified
                          </div>
                        )}

                        {driver.phoneVerified && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: theme.colors.success }}>
                            <Phone size={14} />
                            Phone Verified
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                        <div>
                          <div style={{ fontSize: '12px', color: theme.colors.textSecondary, marginBottom: '4px' }}>
                            CDL Class
                          </div>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary }}>
                            {driver.cdlClass}
                          </div>
                        </div>

                        <div>
                          <div style={{ fontSize: '12px', color: theme.colors.textSecondary, marginBottom: '4px' }}>
                            Phone Number
                          </div>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary }}>
                            {driver.phone}
                          </div>
                        </div>

                        <div>
                          <div style={{ fontSize: '12px', color: theme.colors.textSecondary, marginBottom: '4px' }}>
                            Equipment
                          </div>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary }}>
                            Truck #{driver.truckNumber}, {driver.equipmentType} #{driver.trailerNumber}
                          </div>
                        </div>

                        {driver.status === 'on_load' && driver.availableUntil && (
                          <div>
                            <div style={{ fontSize: '12px', color: theme.colors.textSecondary, marginBottom: '4px' }}>
                              Available
                            </div>
                            <div style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.warning }}>
                              {new Date(driver.availableUntil).toLocaleString()}
                            </div>
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingTop: '12px', borderTop: `1px solid ${theme.colors.border}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <TrendingUp size={14} color={theme.colors.success} />
                          <span style={{ fontSize: '12px', color: theme.colors.textSecondary }}>
                            Acceptance Rate:
                          </span>
                          <span style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.success }}>
                            {driver.acceptanceRate}%
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <CheckCircle size={14} color={theme.colors.primary} />
                          <span style={{ fontSize: '12px', color: theme.colors.textSecondary }}>
                            Loads Completed:
                          </span>
                          <span style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary }}>
                            {driver.totalLoadsCompleted}
                          </span>
                        </div>

                        {driver.distanceFromPickup !== undefined && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <MapPin size={14} color={theme.colors.info} />
                            <span style={{ fontSize: '12px', color: theme.colors.textSecondary }}>
                              Distance:
                            </span>
                            <span style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary }}>
                              {driver.distanceFromPickup} mi
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Timeout Selection */}
          <div style={{
            padding: '20px',
            background: theme.colors.backgroundSecondary,
            borderRadius: '12px',
            border: `1px solid ${theme.colors.border}`,
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Clock size={20} color={theme.colors.warning} />
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: theme.colors.textPrimary, margin: 0 }}>
                Driver Acceptance Timeout
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
              {timeoutOptions.map((option) => (
                <div
                  key={option.value}
                  onClick={() => setTimeoutMinutes(option.value)}
                  style={{
                    padding: '12px',
                    background: timeoutMinutes === option.value 
                      ? `${theme.colors.primary}15` 
                      : theme.colors.backgroundPrimary,
                    borderRadius: '8px',
                    border: `2px solid ${timeoutMinutes === option.value ? theme.colors.primary : theme.colors.border}`,
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    border: `2px solid ${timeoutMinutes === option.value ? theme.colors.primary : theme.colors.border}`,
                    background: timeoutMinutes === option.value ? theme.colors.primary : 'transparent',
                    margin: '0 auto 8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {timeoutMinutes === option.value && (
                      <div style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: 'white'
                      }} />
                    )}
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary }}>
                    {option.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dispatch Notes */}
          <div style={{
            padding: '20px',
            background: theme.colors.backgroundSecondary,
            borderRadius: '12px',
            border: `1px solid ${theme.colors.border}`,
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <MessageSquare size={20} color={theme.colors.info} />
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: theme.colors.textPrimary, margin: 0 }}>
                Dispatch Notes (Optional)
              </h3>
            </div>

            <textarea
              value={dispatchNotes}
              onChange={(e) => setDispatchNotes(e.target.value)}
              placeholder="Add any special instructions or notes for the driver..."
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
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {/* Important Notice */}
          <div style={{
            padding: '16px',
            background: `${theme.colors.warning}15`,
            borderRadius: '12px',
            border: `1px solid ${theme.colors.warning}`,
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}>
            <AlertCircle size={20} color={theme.colors.warning} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '4px' }}>
                Important - SMS Verification Required
              </div>
              <div style={{ fontSize: '12px', color: theme.colors.textSecondary, lineHeight: '1.5' }}>
                The driver will receive an SMS notification and must accept the load within the timeout period. 
                After accepting, they must verify via SMS code. Failure to accept or verify will return the load 
                to the available pool and the assignment will be null and void.
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              padding: '12px',
              background: `${theme.colors.error}15`,
              borderRadius: '8px',
              border: `1px solid ${theme.colors.error}`,
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={16} color={theme.colors.error} />
              <span style={{ fontSize: '14px', color: theme.colors.error }}>
                {error}
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                padding: '14px',
                background: 'transparent',
                color: theme.colors.textSecondary,
                border: `2px solid ${theme.colors.border}`,
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: isSubmitting ? 'not-allowed' : 'pointer'
              }}
            >
              Cancel
            </button>

            <button
              onClick={handleAssign}
              disabled={!selectedDriver || isSubmitting}
              style={{
                padding: '14px',
                background: (!selectedDriver || isSubmitting) ? theme.colors.border : theme.colors.primary,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: (!selectedDriver || isSubmitting) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <CheckCircle size={20} />
              {isSubmitting ? 'Assigning...' : 'Assign Load to Driver'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DriverAssignmentModal

