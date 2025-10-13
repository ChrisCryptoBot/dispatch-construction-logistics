import React, { useState, useEffect } from 'react'
import PageContainer from '../../components/PageContainer'
import Card from '../../components/Card'
import AnimatedCounter from '../../components/enhanced/AnimatedCounter'
import { 
  Truck, 
  Gauge, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  MapPin,
  Fuel,
  Wrench,
  Activity,
  TrendingUp,
  RefreshCw
} from 'lucide-react'

interface Equipment {
  id: string
  type: string
  status: 'active' | 'maintenance' | 'idle' | 'offline'
  location: string
  fuelLevel: number
  mileage: number
  lastUpdate: string
  alerts: string[]
}

const EquipmentMonitorPage = () => {
  const [equipment, setEquipment] = useState<Equipment[]>([
    {
      id: 'TRK-001',
      type: 'End Dump Truck',
      status: 'active',
      location: 'Austin, TX',
      fuelLevel: 85,
      mileage: 245000,
      lastUpdate: '2 minutes ago',
      alerts: []
    },
    {
      id: 'TRK-002', 
      type: 'Flatbed Trailer',
      status: 'maintenance',
      location: 'Houston, TX',
      fuelLevel: 0,
      mileage: 189000,
      lastUpdate: '1 hour ago',
      alerts: ['Oil change due', 'Brake inspection needed']
    },
    {
      id: 'TRK-003',
      type: 'Concrete Mixer',
      status: 'idle',
      location: 'Dallas, TX',
      fuelLevel: 92,
      mileage: 156000,
      lastUpdate: '5 minutes ago',
      alerts: []
    },
    {
      id: 'TRK-004',
      type: 'Lowboy Trailer',
      status: 'offline',
      location: 'San Antonio, TX',
      fuelLevel: 45,
      mileage: 312000,
      lastUpdate: '2 hours ago',
      alerts: ['GPS offline', 'Fuel low']
    }
  ])

  const [lastRefresh, setLastRefresh] = useState(new Date())

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10b981'
      case 'maintenance': return '#f59e0b'
      case 'idle': return '#6b7280'
      case 'offline': return '#ef4444'
      default: return '#6b7280'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle color="#10b981" size={20} />
      case 'maintenance': return <Wrench color="#f59e0b" size={20} />
      case 'idle': return <Clock color="#6b7280" size={20} />
      case 'offline': return <AlertTriangle color="#ef4444" size={20} />
      default: return <Clock color="#6b7280" size={20} />
    }
  }

  const refreshData = () => {
    setLastRefresh(new Date())
    // Simulate data refresh
    console.log('Refreshing equipment data...')
  }

  return (
    <PageContainer>
      <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '32px' 
        }}>
          <div>
            <h1 style={{ 
              fontSize: '32px', 
              fontWeight: '700', 
              color: '#F7FAFC', 
              margin: '0 0 8px 0' 
            }}>
              Equipment Monitor
            </h1>
            <p style={{ 
              color: '#CBD5E0', 
              fontSize: '16px', 
              margin: 0 
            }}>
              Real-time fleet monitoring and diagnostics
            </p>
          </div>
          
          <button
            onClick={refreshData}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              background: 'linear-gradient(135deg, #C53030 0%, #9B2C2C 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.2s ease'
            }}
          >
            <RefreshCw size={16} />
            Refresh Data
          </button>
        </div>

        {/* Stats Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '20px',
          marginBottom: '32px' 
        }}>
          <Card title="Active Equipment" icon={<Truck color="#10b981" size={24} />} className="glass-card lift-on-hover">
            <div style={{ textAlign: 'center' }}>
              <AnimatedCounter
                value={equipment.filter(e => e.status === 'active').length}
                duration={1000}
                fontSize="48px"
                fontWeight="700"
                color="#10b981"
              />
              <p style={{ color: '#CBD5E0', margin: '8px 0 0 0' }}>
                of {equipment.length} total units
              </p>
            </div>
          </Card>

          <Card title="Maintenance Alerts" icon={<AlertTriangle color="#f59e0b" size={24} />}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '48px', 
                fontWeight: '700', 
                color: '#f59e0b',
                marginBottom: '8px'
              }}>
                {equipment.reduce((sum, e) => sum + e.alerts.length, 0)}
              </div>
              <p style={{ color: '#CBD5E0', margin: 0 }}>
                active alerts
              </p>
            </div>
          </Card>

          <Card title="Fuel Efficiency" icon={<Fuel color="#3b82f6" size={24} />}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '48px', 
                fontWeight: '700', 
                color: '#3b82f6',
                marginBottom: '8px'
              }}>
                {Math.round(equipment.reduce((sum, e) => sum + e.fuelLevel, 0) / equipment.length)}%
              </div>
              <p style={{ color: '#CBD5E0', margin: 0 }}>
                average fuel level
              </p>
            </div>
          </Card>

          <Card title="Last Updated" icon={<Clock color="#6b7280" size={24} />}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                color: '#F7FAFC',
                marginBottom: '8px'
              }}>
                {lastRefresh.toLocaleTimeString()}
              </div>
              <p style={{ color: '#CBD5E0', margin: 0 }}>
                data refresh
              </p>
            </div>
          </Card>
        </div>

        {/* Equipment List */}
        <Card title="Fleet Status Overview">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {equipment.map((unit) => (
              <div
                key={unit.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '20px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '16px', 
                  flex: 1 
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    background: 'rgba(197, 48, 48, 0.15)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Truck color="#C53030" size={24} />
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px',
                      marginBottom: '4px'
                    }}>
                      <h3 style={{ 
                        fontSize: '18px', 
                        fontWeight: '600', 
                        color: '#F7FAFC', 
                        margin: 0 
                      }}>
                        {unit.id}
                      </h3>
                      <span style={{
                        padding: '4px 8px',
                        background: getStatusColor(unit.status),
                        color: 'white',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600',
                        textTransform: 'uppercase'
                      }}>
                        {unit.status}
                      </span>
                    </div>
                    <p style={{ 
                      color: '#CBD5E0', 
                      fontSize: '14px', 
                      margin: '0 0 4px 0' 
                    }}>
                      {unit.type}
                    </p>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      color: '#718096',
                      fontSize: '13px'
                    }}>
                      <MapPin size={14} />
                      {unit.location}
                    </div>
                  </div>

                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '24px' 
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ 
                        fontSize: '14px', 
                        color: '#CBD5E0',
                        marginBottom: '4px'
                      }}>
                        Fuel
                      </div>
                      <div style={{ 
                        fontSize: '18px', 
                        fontWeight: '600', 
                        color: '#F7FAFC' 
                      }}>
                        {unit.fuelLevel}%
                      </div>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                      <div style={{ 
                        fontSize: '14px', 
                        color: '#CBD5E0',
                        marginBottom: '4px'
                      }}>
                        Mileage
                      </div>
                      <div style={{ 
                        fontSize: '18px', 
                        fontWeight: '600', 
                        color: '#F7FAFC' 
                      }}>
                        {unit.mileage.toLocaleString()}
                      </div>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                      <div style={{ 
                        fontSize: '14px', 
                        color: '#CBD5E0',
                        marginBottom: '4px'
                      }}>
                        Status
                      </div>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center' 
                      }}>
                        {getStatusIcon(unit.status)}
                      </div>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                      <div style={{ 
                        fontSize: '14px', 
                        color: '#CBD5E0',
                        marginBottom: '4px'
                      }}>
                        Alerts
                      </div>
                      <div style={{ 
                        fontSize: '18px', 
                        fontWeight: '600', 
                        color: unit.alerts.length > 0 ? '#f59e0b' : '#10b981' 
                      }}>
                        {unit.alerts.length}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Alerts Section */}
        {equipment.some(e => e.alerts.length > 0) && (
          <Card title="Active Alerts" style={{ marginTop: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {equipment
                .filter(e => e.alerts.length > 0)
                .map(unit => 
                  unit.alerts.map((alert, index) => (
                    <div
                      key={`${unit.id}-${index}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        background: 'rgba(245, 158, 11, 0.1)',
                        border: '1px solid rgba(245, 158, 11, 0.2)',
                        borderRadius: '8px'
                      }}
                    >
                      <AlertTriangle color="#f59e0b" size={20} />
                      <div>
                        <strong style={{ color: '#F7FAFC' }}>{unit.id}</strong>
                        <span style={{ color: '#CBD5E0', margin: '0 8px' }}>-</span>
                        <span style={{ color: '#CBD5E0' }}>{alert}</span>
                      </div>
                    </div>
                  ))
                )
              }
            </div>
          </Card>
        )}
      </div>
    </PageContainer>
  )
}

export default EquipmentMonitorPage
