import React, { useState, useEffect } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { 
  Truck, 
  MapPin, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  Navigation,
  Phone,
  MessageSquare,
  Bell,
  RefreshCw
} from 'lucide-react'
import { dispatchAPI } from '../../services/dispatchAPI'
import type { DispatchCoordination, DispatchAlert, DriverStatus } from '../../types/dispatch'

interface DispatchCoordinationPanelProps {
  onDriverSelect?: (driver: DispatchCoordination) => void
  onLoadAssign?: (driverId: string) => void
}

const DispatchCoordinationPanel: React.FC<DispatchCoordinationPanelProps> = ({
  onDriverSelect,
  onLoadAssign
}) => {
  const { theme } = useTheme()
  const [drivers, setDrivers] = useState<DispatchCoordination[]>([])
  const [alerts, setAlerts] = useState<DispatchAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDriver, setSelectedDriver] = useState<DispatchCoordination | null>(null)

  // Mock data for development
  const mockDrivers: DispatchCoordination[] = [
    {
      driverId: 'driver-1',
      driverName: 'Mike Johnson',
      status: 'EMPTY',
      location: { lat: 30.2672, lng: -97.7431, address: 'Austin, TX', lastUpdated: new Date().toISOString() },
      lastUpdate: new Date().toISOString()
    },
    {
      driverId: 'driver-2', 
      driverName: 'Sarah Williams',
      status: 'LOADED',
      currentLoad: {
        id: 'load-123',
        customerName: 'ABC Construction',
        pickupLocation: 'Austin, TX',
        deliveryLocation: 'San Antonio, TX',
        pickupTime: '2025-10-14T10:00:00Z',
        deliveryTime: '2025-10-14T14:00:00Z'
      },
      location: { lat: 29.4241, lng: -98.4936, address: 'San Antonio, TX', lastUpdated: new Date().toISOString() },
      etaToDelivery: '2025-10-14T14:30:00Z',
      lastUpdate: new Date().toISOString()
    },
    {
      driverId: 'driver-3',
      driverName: 'Carlos Rodriguez',
      status: 'AT_PICKUP',
      currentLoad: {
        id: 'load-124',
        customerName: 'XYZ Corp',
        pickupLocation: 'Houston, TX',
        deliveryLocation: 'Dallas, TX',
        pickupTime: '2025-10-14T11:00:00Z',
        deliveryTime: '2025-10-14T16:00:00Z'
      },
      location: { lat: 29.7604, lng: -95.3698, address: 'Houston, TX', lastUpdated: new Date().toISOString() },
      lastUpdate: new Date().toISOString()
    }
  ]

  const mockAlerts: DispatchAlert[] = [
    {
      id: 'alert-1',
      type: 'DRIVER_EMPTY',
      driverId: 'driver-1',
      driverName: 'Mike Johnson',
      message: 'Driver is empty and ready for new load assignment',
      priority: 'high',
      timestamp: new Date().toISOString(),
      acknowledged: false
    },
    {
      id: 'alert-2',
      type: 'DELIVERY_ETA',
      driverId: 'driver-2',
      driverName: 'Sarah Williams',
      loadId: 'load-123',
      message: 'ETA to delivery: 30 minutes',
      priority: 'medium',
      timestamp: new Date().toISOString(),
      acknowledged: false
    }
  ]

  useEffect(() => {
    loadData()
    // Set up real-time updates every 30 seconds
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadData = async () => {
    try {
      // In development, use mock data
      setDrivers(mockDrivers)
      setAlerts(mockAlerts)
      setLoading(false)
      
      // TODO: Replace with real API calls
      // const [driversData, alertsData] = await Promise.all([
      //   dispatchAPI.getDriverStatuses(),
      //   dispatchAPI.getAlerts()
      // ])
      // setDrivers(driversData)
      // setAlerts(alertsData)
    } catch (error) {
      console.error('Failed to load dispatch data:', error)
      setLoading(false)
    }
  }

  const getStatusColor = (status: DriverStatus) => {
    switch (status) {
      case 'EMPTY': return '#10B981' // Green - ready for load
      case 'LOADED': return '#F59E0B' // Orange - has load
      case 'AT_PICKUP': return '#3B82F6' // Blue - at pickup
      case 'AT_DELIVERY': return '#8B5CF6' // Purple - at delivery
      case 'EN_ROUTE_PICKUP': return '#06B6D4' // Cyan - heading to pickup
      case 'EN_ROUTE_DELIVERY': return '#F59E0B' // Orange - heading to delivery
      case 'OFF_DUTY': return '#6B7280' // Gray - not available
      case 'ON_BREAK': return '#F59E0B' // Orange - temporary unavailable
      default: return theme.colors.textSecondary
    }
  }

  const getStatusIcon = (status: DriverStatus) => {
    switch (status) {
      case 'EMPTY': return <CheckCircle size={16} color={getStatusColor(status)} />
      case 'LOADED': return <Truck size={16} color={getStatusColor(status)} />
      case 'AT_PICKUP': return <MapPin size={16} color={getStatusColor(status)} />
      case 'AT_DELIVERY': return <MapPin size={16} color={getStatusColor(status)} />
      case 'EN_ROUTE_PICKUP': return <Navigation size={16} color={getStatusColor(status)} />
      case 'EN_ROUTE_DELIVERY': return <Navigation size={16} color={getStatusColor(status)} />
      case 'OFF_DUTY': return <AlertCircle size={16} color={getStatusColor(status)} />
      case 'ON_BREAK': return <Clock size={16} color={getStatusColor(status)} />
      default: return <Truck size={16} color={getStatusColor(status)} />
    }
  }

  const formatStatus = (status: DriverStatus) => {
    return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
  }

  const handleDriverClick = (driver: DispatchCoordination) => {
    setSelectedDriver(driver)
    onDriverSelect?.(driver)
  }

  const handleAssignLoad = (driverId: string) => {
    onLoadAssign?.(driverId)
  }

  const handleNotifyDriver = async (driverId: string, message: string) => {
    try {
      await dispatchAPI.notifyDriver(driverId, message, 'status_request')
      // TODO: Show success notification
    } catch (error) {
      console.error('Failed to notify driver:', error)
      // TODO: Show error notification
    }
  }

  if (loading) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center',
        color: theme.colors.textSecondary 
      }}>
        <RefreshCw size={20} className="animate-spin" />
        <p style={{ marginTop: '8px' }}>Loading dispatch data...</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div style={{
          background: theme.colors.backgroundCard,
          border: `1px solid ${theme.colors.border}`,
          borderRadius: '12px',
          padding: '16px'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            marginBottom: '12px' 
          }}>
            <Bell size={16} color={theme.colors.primary} />
            <h3 style={{ 
              fontSize: '16px', 
              fontWeight: '600', 
              color: theme.colors.textPrimary,
              margin: 0 
            }}>
              Dispatch Alerts ({alerts.length})
            </h3>
          </div>
          
          {alerts.map((alert) => (
            <div
              key={alert.id}
              style={{
                padding: '12px',
                background: alert.priority === 'high' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                border: `1px solid ${alert.priority === 'high' ? '#EF4444' : '#3B82F6'}`,
                borderRadius: '8px',
                marginBottom: '8px'
              }}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start' 
              }}>
                <div>
                  <p style={{ 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: theme.colors.textPrimary,
                    margin: '0 0 4px 0' 
                  }}>
                    {alert.driverName}
                  </p>
                  <p style={{ 
                    fontSize: '12px', 
                    color: theme.colors.textSecondary,
                    margin: 0 
                  }}>
                    {alert.message}
                  </p>
                </div>
                <button
                  onClick={() => handleNotifyDriver(alert.driverId, 'Please confirm your current status')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: theme.colors.primary,
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  <MessageSquare size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Drivers Section */}
      <div style={{
        background: theme.colors.backgroundCard,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: '12px',
        padding: '16px'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '16px' 
        }}>
          <h3 style={{ 
            fontSize: '16px', 
            fontWeight: '600', 
            color: theme.colors.textPrimary,
            margin: 0 
          }}>
            Driver Status ({drivers.length})
          </h3>
          <button
            onClick={loadData}
            style={{
              background: 'transparent',
              border: 'none',
              color: theme.colors.primary,
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <RefreshCw size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {drivers.map((driver) => (
            <div
              key={driver.driverId}
              onClick={() => handleDriverClick(driver)}
              style={{
                padding: '12px',
                background: selectedDriver?.driverId === driver.driverId 
                  ? theme.colors.backgroundHover 
                  : 'transparent',
                border: `1px solid ${theme.colors.border}`,
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (selectedDriver?.driverId !== driver.driverId) {
                  e.currentTarget.style.background = theme.colors.backgroundHover
                }
              }}
              onMouseLeave={(e) => {
                if (selectedDriver?.driverId !== driver.driverId) {
                  e.currentTarget.style.background = 'transparent'
                }
              }}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                marginBottom: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {getStatusIcon(driver.status)}
                  <div>
                    <p style={{ 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      color: theme.colors.textPrimary,
                      margin: '0 0 2px 0' 
                    }}>
                      {driver.driverName}
                    </p>
                    <p style={{ 
                      fontSize: '12px', 
                      color: getStatusColor(driver.status),
                      margin: 0,
                      fontWeight: '500'
                    }}>
                      {formatStatus(driver.status)}
                    </p>
                  </div>
                </div>
                
                {driver.status === 'EMPTY' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleAssignLoad(driver.driverId)
                    }}
                    style={{
                      background: theme.colors.primary,
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    Assign Load
                  </button>
                )}
              </div>

              {driver.currentLoad && (
                <div style={{
                  padding: '8px',
                  background: theme.colors.backgroundSecondary,
                  borderRadius: '6px',
                  marginBottom: '8px'
                }}>
                  <p style={{ 
                    fontSize: '12px', 
                    fontWeight: '600', 
                    color: theme.colors.textPrimary,
                    margin: '0 0 4px 0' 
                  }}>
                    Current Load: {driver.currentLoad.customerName}
                  </p>
                  <p style={{ 
                    fontSize: '11px', 
                    color: theme.colors.textSecondary,
                    margin: 0 
                  }}>
                    {driver.currentLoad.pickupLocation} → {driver.currentLoad.deliveryLocation}
                  </p>
                </div>
              )}

              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center' 
              }}>
                <p style={{ 
                  fontSize: '11px', 
                  color: theme.colors.textSecondary,
                  margin: 0 
                }}>
                  📍 {driver.location.address || `${driver.location.lat.toFixed(4)}, ${driver.location.lng.toFixed(4)}`}
                </p>
                <p style={{ 
                  fontSize: '11px', 
                  color: theme.colors.textSecondary,
                  margin: 0 
                }}>
                  {new Date(driver.lastUpdate).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DispatchCoordinationPanel
