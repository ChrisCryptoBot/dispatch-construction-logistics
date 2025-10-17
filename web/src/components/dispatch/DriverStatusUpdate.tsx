import React, { useState, useEffect } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { 
  Truck, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Navigation,
  Package,
  Send,
  RefreshCw
} from 'lucide-react'
import type { DriverStatus, DriverLocation } from '../../types/dispatch'

interface DriverStatusUpdateProps {
  driverId: string
  driverName: string
  onStatusUpdate?: (status: DriverStatus, location?: DriverLocation, notes?: string) => void
  currentStatus?: DriverStatus
  currentLocation?: DriverLocation
}

const DriverStatusUpdate: React.FC<DriverStatusUpdateProps> = ({
  driverId,
  driverName,
  onStatusUpdate,
  currentStatus = 'OFF_DUTY',
  currentLocation
}) => {
  const { theme } = useTheme()
  const [selectedStatus, setSelectedStatus] = useState<DriverStatus>(currentStatus)
  const [notes, setNotes] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [location, setLocation] = useState<DriverLocation | undefined>(currentLocation)

  // Get current GPS location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            lastUpdated: new Date().toISOString()
          })
        },
        (error) => {
          console.error('Error getting location:', error)
        }
      )
    }
  }, [])

  const statusOptions: { value: DriverStatus; label: string; description: string; icon: React.ReactNode }[] = [
    {
      value: 'EMPTY',
      label: 'Empty',
      description: 'Ready to pick up new load',
      icon: <CheckCircle size={20} color="#10B981" />
    },
    {
      value: 'LOADED',
      label: 'Loaded',
      description: 'Has load, heading to delivery',
      icon: <Truck size={20} color="#F59E0B" />
    },
    {
      value: 'AT_PICKUP',
      label: 'At Pickup',
      description: 'At pickup location',
      icon: <MapPin size={20} color="#3B82F6" />
    },
    {
      value: 'AT_DELIVERY',
      label: 'At Delivery',
      description: 'At delivery location',
      icon: <MapPin size={20} color="#8B5CF6" />
    },
    {
      value: 'EN_ROUTE_PICKUP',
      label: 'En Route to Pickup',
      description: 'Heading to pickup location',
      icon: <Navigation size={20} color="#06B6D4" />
    },
    {
      value: 'EN_ROUTE_DELIVERY',
      label: 'En Route to Delivery',
      description: 'Heading to delivery location',
      icon: <Navigation size={20} color="#F59E0B" />
    },
    {
      value: 'ON_BREAK',
      label: 'On Break',
      description: 'Temporarily unavailable',
      icon: <Clock size={20} color="#F59E0B" />
    },
    {
      value: 'OFF_DUTY',
      label: 'Off Duty',
      description: 'Not available',
      icon: <AlertCircle size={20} color="#6B7280" />
    }
  ]

  const handleStatusUpdate = async () => {
    setIsUpdating(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      onStatusUpdate?.(selectedStatus, location, notes)
      
      // Clear form
      setNotes('')
      
      // TODO: Show success notification
      console.log('Status updated successfully')
    } catch (error) {
      console.error('Failed to update status:', error)
      // TODO: Show error notification
    } finally {
      setIsUpdating(false)
    }
  }

  const getCurrentLocationString = () => {
    if (location) {
      return `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
    }
    return 'Location not available'
  }

  return (
    <div style={{
      background: theme.colors.backgroundCard,
      border: `1px solid ${theme.colors.border}`,
      borderRadius: '12px',
      padding: '20px',
      maxWidth: '400px',
      margin: '0 auto'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px', 
        marginBottom: '20px' 
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: theme.colors.primary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: '600',
          fontSize: '16px'
        }}>
          {driverName.charAt(0).toUpperCase()}
        </div>
        <div>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: theme.colors.textPrimary,
            margin: '0 0 4px 0' 
          }}>
            {driverName}
          </h3>
          <p style={{ 
            fontSize: '14px', 
            color: theme.colors.textSecondary,
            margin: 0 
          }}>
            Driver ID: {driverId}
          </p>
        </div>
      </div>

      {/* Current Location */}
      <div style={{
        background: theme.colors.backgroundSecondary,
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '20px'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          marginBottom: '8px' 
        }}>
          <MapPin size={16} color={theme.colors.primary} />
          <p style={{ 
            fontSize: '14px', 
            fontWeight: '600', 
            color: theme.colors.textPrimary,
            margin: 0 
          }}>
            Current Location
          </p>
        </div>
        <p style={{ 
          fontSize: '12px', 
          color: theme.colors.textSecondary,
          margin: '0 0 8px 0' 
        }}>
          {getCurrentLocationString()}
        </p>
        <button
          onClick={() => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    lastUpdated: new Date().toISOString()
                  })
                },
                (error) => {
                  console.error('Error getting location:', error)
                }
              )
            }
          }}
          style={{
            background: 'transparent',
            border: `1px solid ${theme.colors.border}`,
            borderRadius: '6px',
            padding: '6px 12px',
            fontSize: '12px',
            color: theme.colors.primary,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <RefreshCw size={12} />
          Update Location
        </button>
      </div>

      {/* Status Selection */}
      <div style={{ marginBottom: '20px' }}>
        <p style={{ 
          fontSize: '14px', 
          fontWeight: '600', 
          color: theme.colors.textPrimary,
          margin: '0 0 12px 0' 
        }}>
          Update Status
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {statusOptions.map((option) => (
            <label
              key={option.value}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                background: selectedStatus === option.value 
                  ? theme.colors.backgroundHover 
                  : 'transparent',
                border: `1px solid ${selectedStatus === option.value 
                  ? theme.colors.primary 
                  : theme.colors.border}`,
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <input
                type="radio"
                name="status"
                value={option.value}
                checked={selectedStatus === option.value}
                onChange={(e) => setSelectedStatus(e.target.value as DriverStatus)}
                style={{ margin: 0 }}
              />
              {option.icon}
              <div style={{ flex: 1 }}>
                <p style={{ 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  color: theme.colors.textPrimary,
                  margin: '0 0 2px 0' 
                }}>
                  {option.label}
                </p>
                <p style={{ 
                  fontSize: '12px', 
                  color: theme.colors.textSecondary,
                  margin: 0 
                }}>
                  {option.description}
                </p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div style={{ marginBottom: '20px' }}>
        <p style={{ 
          fontSize: '14px', 
          fontWeight: '600', 
          color: theme.colors.textPrimary,
          margin: '0 0 8px 0' 
        }}>
          Notes (Optional)
        </p>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any additional information..."
          style={{
            width: '100%',
            minHeight: '80px',
            padding: '12px',
            background: theme.colors.inputBg,
            border: `1px solid ${theme.colors.inputBorder}`,
            borderRadius: '8px',
            fontSize: '14px',
            color: theme.colors.textPrimary,
            resize: 'vertical',
            outline: 'none',
            fontFamily: 'inherit'
          }}
        />
      </div>

      {/* Update Button */}
      <button
        onClick={handleStatusUpdate}
        disabled={isUpdating || !location}
        style={{
          width: '100%',
          background: isUpdating || !location 
            ? theme.colors.textSecondary 
            : theme.colors.primary,
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '14px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: isUpdating || !location ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          transition: 'all 0.2s'
        }}
      >
        {isUpdating ? (
          <>
            <RefreshCw size={16} className="animate-spin" />
            Updating...
          </>
        ) : (
          <>
            <Send size={16} />
            Update Status
          </>
        )}
      </button>

      {!location && (
        <p style={{ 
          fontSize: '12px', 
          color: theme.colors.error,
          textAlign: 'center',
          margin: '8px 0 0 0' 
        }}>
          Location access required to update status
        </p>
      )}
    </div>
  )
}

export default DriverStatusUpdate
