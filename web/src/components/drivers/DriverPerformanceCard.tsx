import React, { useState, useEffect } from 'react'
import { colors, shadows, borders, spacing, gradients } from '../styles/design-system'

interface Driver {
  id: string
  name: string
  avatar: string
  score: number
  loadsCompleted: number
  revenue: number
  onTimeRate: number
  fuelEfficiency: number
  safetyScore: number
  status: 'available' | 'on_route' | 'loading' | 'break'
  currentLoad?: string
  location?: string
  hoursWorked: number
  hoursRemaining: number
}

const DriverPerformanceCard = () => {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null)

  useEffect(() => {
    // Simulate driver data
    const mockDrivers: Driver[] = [
      {
        id: '1',
        name: 'John Smith',
        avatar: 'JS',
        score: 4.9,
        loadsCompleted: 28,
        revenue: 15420,
        onTimeRate: 96.8,
        fuelEfficiency: 7.2,
        safetyScore: 98.5,
        status: 'on_route',
        currentLoad: 'LT-1234',
        location: 'I-35 Bridge Project',
        hoursWorked: 8.5,
        hoursRemaining: 2.5
      },
      {
        id: '2',
        name: 'Sarah Johnson',
        avatar: 'SJ',
        score: 4.8,
        loadsCompleted: 25,
        revenue: 13850,
        onTimeRate: 94.2,
        fuelEfficiency: 7.0,
        safetyScore: 97.8,
        status: 'available',
        hoursWorked: 2.0,
        hoursRemaining: 9.0
      },
      {
        id: '3',
        name: 'Mike Rodriguez',
        avatar: 'MR',
        score: 4.7,
        loadsCompleted: 23,
        revenue: 12680,
        onTimeRate: 92.1,
        fuelEfficiency: 6.8,
        safetyScore: 96.2,
        status: 'loading',
        currentLoad: 'LT-1235',
        location: 'Plant C',
        hoursWorked: 6.0,
        hoursRemaining: 5.0
      },
      {
        id: '4',
        name: 'David Chen',
        avatar: 'DC',
        score: 4.6,
        loadsCompleted: 21,
        revenue: 11540,
        onTimeRate: 89.5,
        fuelEfficiency: 6.5,
        safetyScore: 95.8,
        status: 'break',
        hoursWorked: 10.5,
        hoursRemaining: 0.5
      }
    ]
    setDrivers(mockDrivers)
  }, [])

  const getStatusColor = (status: string) => {
    const statusColors = {
      available: '#10b981',
      on_route: '#3b82f6',
      loading: '#f59e0b',
      break: '#6b7280'
    }
    return statusColors[status] || '#6b7280'
  }

  const getStatusIcon = (status: string) => {
    const statusIcons = {
      available: 'fas fa-check-circle',
      on_route: 'fas fa-truck',
      loading: 'fas fa-box',
      break: 'fas fa-coffee'
    }
    return statusIcons[status] || 'fas fa-question-circle'
  }

  const getPerformanceColor = (score: number) => {
    if (score >= 4.5) return '#10b981'
    if (score >= 4.0) return '#f59e0b'
    return '#ef4444'
  }

  const DriverCard = ({ driver }: { driver: Driver }) => (
    <div style={{
      backgroundColor: '#1f2937',
      borderRadius: '16px',
      padding: '20px',
      border: '1px solid #374151',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      position: 'relative',
      overflow: 'hidden'
    }}
    onClick={() => setSelectedDriver(driver)}
    onMouseEnter={(e) => {
      e.target.style.transform = 'translateY(-4px)'
      e.target.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.4)'
    }}
    onMouseLeave={(e) => {
      e.target.style.transform = 'translateY(0)'
      e.target.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)'
    }}
    >
      {/* Status Indicator */}
      <div style={{
        position: 'absolute',
        top: '16px',
        right: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        backgroundColor: `${getStatusColor(driver.status)}20`,
        padding: '4px 8px',
        borderRadius: '8px',
        border: `1px solid ${getStatusColor(driver.status)}30`
      }}>
        <i className={getStatusIcon(driver.status)} style={{ color: getStatusColor(driver.status), fontSize: '12px' }}></i>
        <span style={{ color: getStatusColor(driver.status), fontSize: '12px', fontWeight: '600', textTransform: 'capitalize' }}>
          {driver.status.replace('_', ' ')}
        </span>
      </div>

      {/* Driver Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
        <div style={{
          width: '56px',
          height: '56px',
          backgroundColor: '#dc262620',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#dc2626',
          fontSize: '20px',
          fontWeight: 'bold',
          border: '2px solid #dc262630'
        }}>
          {driver.avatar}
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{
            color: '#f9fafb',
            fontSize: '18px',
            fontWeight: '700',
            margin: '0 0 4px 0'
          }}>
            {driver.name}
          </h3>
          {driver.currentLoad && (
            <p style={{
              color: '#9ca3af',
              fontSize: '14px',
              margin: 0
            }}>
              <i className="fas fa-clipboard-list" style={{ marginRight: '6px' }}></i>
              {driver.currentLoad} • {driver.location}
            </p>
          )}
        </div>
      </div>

      {/* Performance Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '16px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: getPerformanceColor(driver.score),
            marginBottom: '4px'
          }}>
            {driver.score.toFixed(1)}
          </div>
          <div style={{ fontSize: '12px', color: '#9ca3af', fontWeight: '600' }}>
            Performance Score
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#3b82f6',
            marginBottom: '4px'
          }}>
            {driver.loadsCompleted}
          </div>
          <div style={{ fontSize: '12px', color: '#9ca3af', fontWeight: '600' }}>
            Loads This Month
          </div>
        </div>
      </div>

      {/* Progress Bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '12px', color: '#d1d5db', fontWeight: '600' }}>On-Time Rate</span>
            <span style={{ fontSize: '12px', color: '#10b981', fontWeight: '600' }}>{driver.onTimeRate}%</span>
          </div>
          <div style={{ width: '100%', height: '6px', backgroundColor: '#374151', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{
              width: `${driver.onTimeRate}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)',
              borderRadius: '3px'
            }}></div>
          </div>
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '12px', color: '#d1d5db', fontWeight: '600' }}>Fuel Efficiency</span>
            <span style={{ fontSize: '12px', color: '#f59e0b', fontWeight: '600' }}>{driver.fuelEfficiency} MPG</span>
          </div>
          <div style={{ width: '100%', height: '6px', backgroundColor: '#374151', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{
              width: `${(driver.fuelEfficiency / 8) * 100}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)',
              borderRadius: '3px'
            }}></div>
          </div>
        </div>
      </div>

      {/* Hours Worked */}
      <div style={{
        backgroundColor: '#111827',
        padding: '12px',
        borderRadius: '8px',
        border: '1px solid #374151'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: '600' }}>Hours Today</span>
          <span style={{ fontSize: '14px', color: '#f9fafb', fontWeight: '600' }}>
            {driver.hoursWorked.toFixed(1)}h / {driver.hoursRemaining.toFixed(1)}h remaining
          </span>
        </div>
        <div style={{ width: '100%', height: '4px', backgroundColor: '#374151', borderRadius: '2px', overflow: 'hidden', marginTop: '6px' }}>
          <div style={{
            width: `${(driver.hoursWorked / 11) * 100}%`,
            height: '100%',
            background: driver.hoursWorked > 8 ? 'linear-gradient(90deg, #ef4444 0%, #f87171 100%)' : 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)',
            borderRadius: '2px'
          }}></div>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{
      background: colors.background.secondary,
      borderRadius: borders.radius.xl,
      padding: spacing.lg,
      border: `${borders.thin} ${colors.border.primary}`,
      boxShadow: shadows.card
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg }}>
        <h3 style={{
          color: colors.text.primary,
          fontSize: '20px',
          fontWeight: '700',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: spacing.sm
        }}>
          <i className="fas fa-users" style={{ color: colors.primary[500] }}></i>
          Driver Performance
        </h3>
        <div style={{ display: 'flex', gap: spacing.sm }}>
          <button style={{
            padding: `${spacing.sm} ${spacing.md}`,
            backgroundColor: colors.background.tertiary,
            color: colors.text.secondary,
            border: `${borders.thin} ${colors.border.secondary}`,
            borderRadius: borders.radius.sm,
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}>
            <i className="fas fa-sync-alt" style={{ marginRight: spacing.xs }}></i>
            Refresh
          </button>
          <button style={{
            padding: `${spacing.sm} ${spacing.md}`,
            background: gradients.primary,
            color: 'white',
            border: 'none',
            borderRadius: borders.radius.sm,
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: shadows.soft
          }}>
            <i className="fas fa-plus" style={{ marginRight: spacing.xs }}></i>
            Add Driver
          </button>
        </div>
      </div>

      {/* Driver Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '20px'
      }}>
        {drivers.map((driver) => (
          <DriverCard key={driver.id} driver={driver} />
        ))}
      </div>

      {/* Driver Detail Modal */}
      {selectedDriver && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#1f2937',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto',
            border: '1px solid #374151',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ color: '#f9fafb', fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
                {selectedDriver.name} - Performance Details
              </h2>
              <button
                onClick={() => setSelectedDriver(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#9ca3af',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
              <div style={{ backgroundColor: '#374151', padding: '16px', borderRadius: '8px' }}>
                <h4 style={{ color: '#f9fafb', marginBottom: '8px' }}>Revenue Generated</h4>
                <p style={{ color: '#10b981', fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
                  ${selectedDriver.revenue.toLocaleString()}
                </p>
              </div>
              <div style={{ backgroundColor: '#374151', padding: '16px', borderRadius: '8px' }}>
                <h4 style={{ color: '#f9fafb', marginBottom: '8px' }}>Safety Score</h4>
                <p style={{ color: '#3b82f6', fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
                  {selectedDriver.safetyScore}%
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DriverPerformanceCard
