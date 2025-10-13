import React, { useState, useEffect } from 'react'
import { colors, shadows, borders, spacing, gradients } from '../styles/design-system'

interface Route {
  id: string
  name: string
  origin: string
  destination: string
  distance: number
  estimatedTime: number
  trafficDelay: number
  fuelCost: number
  status: 'optimized' | 'pending' | 'active' | 'completed'
  efficiency: number
  stops: Stop[]
}

interface Stop {
  id: string
  name: string
  address: string
  type: 'pickup' | 'delivery' | 'fuel' | 'rest'
  estimatedArrival: string
  estimatedDeparture: string
  status: 'pending' | 'completed' | 'in-progress'
}

interface TrafficAlert {
  id: string
  routeId: string
  type: 'accident' | 'construction' | 'congestion' | 'weather'
  severity: 'low' | 'medium' | 'high'
  message: string
  estimatedDelay: number
}

const RouteOptimization = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'optimization' | 'traffic' | 'fuel'>('overview')
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null)
  const [optimizationRunning, setOptimizationRunning] = useState(false)

  // Mock data
  const routes: Route[] = [
    {
      id: 'RT001',
      name: 'Baltimore to Philadelphia',
      origin: 'Baltimore, MD',
      destination: 'Philadelphia, PA',
      distance: 95,
      estimatedTime: 120,
      trafficDelay: 15,
      fuelCost: 45.50,
      status: 'optimized',
      efficiency: 94,
      stops: [
        { id: 'S001', name: 'Pickup Site A', address: '123 Industrial Blvd, Baltimore', type: 'pickup', estimatedArrival: '08:00', estimatedDeparture: '08:30', status: 'completed' },
        { id: 'S002', name: 'Delivery Site B', address: '456 Commerce St, Philadelphia', type: 'delivery', estimatedArrival: '11:30', estimatedDeparture: '12:00', status: 'in-progress' }
      ]
    },
    {
      id: 'RT002',
      name: 'Harrisburg to Columbus',
      origin: 'Harrisburg, PA',
      destination: 'Columbus, OH',
      distance: 320,
      estimatedTime: 360,
      trafficDelay: 25,
      fuelCost: 156.80,
      status: 'pending',
      efficiency: 87,
      stops: [
        { id: 'S003', name: 'Fuel Stop', address: '789 Highway Plaza, Pittsburgh', type: 'fuel', estimatedArrival: '14:00', estimatedDeparture: '14:15', status: 'pending' },
        { id: 'S004', name: 'Delivery Site C', address: '321 Business Park, Columbus', type: 'delivery', estimatedArrival: '18:30', estimatedDeparture: '19:00', status: 'pending' }
      ]
    },
    {
      id: 'RT003',
      name: 'Columbus to Cleveland',
      origin: 'Columbus, OH',
      destination: 'Cleveland, OH',
      distance: 145,
      estimatedTime: 135,
      trafficDelay: 8,
      fuelCost: 68.20,
      status: 'active',
      efficiency: 91,
      stops: [
        { id: 'S005', name: 'Pickup Site D', address: '654 Manufacturing Ave, Columbus', type: 'pickup', estimatedArrival: '09:00', estimatedDeparture: '09:45', status: 'completed' },
        { id: 'S006', name: 'Delivery Site E', address: '987 Port St, Cleveland', type: 'delivery', estimatedArrival: '12:30', estimatedDeparture: '13:15', status: 'in-progress' }
      ]
    }
  ]

  const trafficAlerts: TrafficAlert[] = [
    {
      id: 'TA001',
      routeId: 'RT001',
      type: 'construction',
      severity: 'medium',
      message: 'Road construction on I-95 North, lane closure expected',
      estimatedDelay: 15
    },
    {
      id: 'TA002',
      routeId: 'RT002',
      type: 'weather',
      severity: 'high',
      message: 'Heavy rain and reduced visibility on Route 70',
      estimatedDelay: 30
    },
    {
      id: 'TA003',
      routeId: 'RT003',
      type: 'congestion',
      severity: 'low',
      message: 'Rush hour traffic on I-71 North',
      estimatedDelay: 8
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimized': return '#10b981'
      case 'pending': return '#f59e0b'
      case 'active': return '#3b82f6'
      case 'completed': return '#6b7280'
      default: return '#6b7280'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return '#ef4444'
      case 'medium': return '#f59e0b'
      case 'low': return '#10b981'
      default: return '#6b7280'
    }
  }

  const getStopTypeColor = (type: string) => {
    switch (type) {
      case 'pickup': return '#3b82f6'
      case 'delivery': return '#10b981'
      case 'fuel': return '#f59e0b'
      case 'rest': return '#8b5cf6'
      default: return '#6b7280'
    }
  }

  const runOptimization = () => {
    setOptimizationRunning(true)
    setTimeout(() => {
      setOptimizationRunning(false)
      // Simulate optimization results
    }, 3000)
  }

  return (
    <div style={{
      background: colors.background.secondary,
      borderRadius: borders.radius.xl,
      padding: spacing.xl,
      border: `${borders.thin} ${colors.border.primary}`,
      boxShadow: shadows.card,
      marginBottom: spacing.xl
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg }}>
        <div>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: colors.text.primary,
            margin: '0 0 8px 0',
            display: 'flex',
            alignItems: 'center',
            gap: spacing.md
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: gradients.primary,
              borderRadius: borders.radius.md,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: shadows.soft
            }}>
              <i className="fas fa-route" style={{ color: 'white', fontSize: '18px' }}></i>
            </div>
            Route Optimization
          </h2>
          <p style={{ color: colors.text.secondary, margin: 0, fontSize: '14px' }}>
            Intelligent route planning with traffic integration and fuel optimization
          </p>
        </div>
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
            Refresh Traffic
          </button>
          <button
            onClick={runOptimization}
            disabled={optimizationRunning}
            style={{
              padding: `${spacing.sm} ${spacing.md}`,
              background: optimizationRunning ? '#6b7280' : gradients.primary,
              color: 'white',
              border: 'none',
              borderRadius: borders.radius.sm,
              fontSize: '12px',
              fontWeight: '600',
              cursor: optimizationRunning ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: shadows.soft
            }}
          >
            <i className={`fas fa-${optimizationRunning ? 'spinner fa-spin' : 'magic'}`} style={{ marginRight: spacing.xs }}></i>
            {optimizationRunning ? 'Optimizing...' : 'Optimize Routes'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: spacing.xs,
        marginBottom: spacing.lg,
        borderBottom: `${borders.thin} ${colors.border.secondary}`,
        paddingBottom: spacing.md
      }}>
        {[
          { id: 'overview', label: 'Route Overview', icon: 'fas fa-map' },
          { id: 'optimization', label: 'AI Optimization', icon: 'fas fa-brain' },
          { id: 'traffic', label: 'Traffic Alerts', icon: 'fas fa-exclamation-triangle', count: trafficAlerts.length },
          { id: 'fuel', label: 'Fuel Analysis', icon: 'fas fa-gas-pump' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              padding: `${spacing.sm} ${spacing.md}`,
              backgroundColor: activeTab === tab.id ? colors.primary[500] : 'transparent',
              color: activeTab === tab.id ? 'white' : colors.text.secondary,
              border: 'none',
              borderRadius: borders.radius.sm,
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: spacing.xs
            }}
          >
            <i className={tab.icon} style={{ fontSize: '14px' }}></i>
            {tab.label}
            {tab.count && (
              <span style={{
                backgroundColor: activeTab === tab.id ? 'rgba(255,255,255,0.2)' : colors.primary[500],
                color: 'white',
                fontSize: '11px',
                fontWeight: '700',
                padding: '2px 6px',
                borderRadius: '10px',
                marginLeft: spacing.xs
              }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div>
          {/* Route Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: spacing.lg,
            marginBottom: spacing.xl
          }}>
            <div style={{
              background: colors.background.tertiary,
              borderRadius: borders.radius.lg,
              padding: spacing.lg,
              border: `${borders.thin} ${colors.border.secondary}`,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#3b82f6', marginBottom: spacing.xs }}>
                {routes.length}
              </div>
              <div style={{ color: colors.text.secondary, fontSize: '14px', fontWeight: '600' }}>
                Active Routes
              </div>
            </div>
            <div style={{
              background: colors.background.tertiary,
              borderRadius: borders.radius.lg,
              padding: spacing.lg,
              border: `${borders.thin} ${colors.border.secondary}`,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981', marginBottom: spacing.xs }}>
                {Math.round(routes.reduce((acc, r) => acc + r.efficiency, 0) / routes.length)}%
              </div>
              <div style={{ color: colors.text.secondary, fontSize: '14px', fontWeight: '600' }}>
                Avg Efficiency
              </div>
            </div>
            <div style={{
              background: colors.background.tertiary,
              borderRadius: borders.radius.lg,
              padding: spacing.lg,
              border: `${borders.thin} ${colors.border.secondary}`,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f59e0b', marginBottom: spacing.xs }}>
                {routes.reduce((acc, r) => acc + r.trafficDelay, 0)}m
              </div>
              <div style={{ color: colors.text.secondary, fontSize: '14px', fontWeight: '600' }}>
                Total Delays
              </div>
            </div>
            <div style={{
              background: colors.background.tertiary,
              borderRadius: borders.radius.lg,
              padding: spacing.lg,
              border: `${borders.thin} ${colors.border.secondary}`,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ef4444', marginBottom: spacing.xs }}>
                ${routes.reduce((acc, r) => acc + r.fuelCost, 0).toFixed(0)}
              </div>
              <div style={{ color: colors.text.secondary, fontSize: '14px', fontWeight: '600' }}>
                Total Fuel Cost
              </div>
            </div>
          </div>

          {/* Routes List */}
          <div style={{
            display: 'grid',
            gap: spacing.lg
          }}>
            {routes.map(route => (
              <div
                key={route.id}
                onClick={() => setSelectedRoute(route)}
                style={{
                  background: colors.background.tertiary,
                  borderRadius: borders.radius.lg,
                  padding: spacing.lg,
                  border: `${borders.thin} ${colors.border.secondary}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLDivElement).style.transform = 'translateY(-2px)'
                  (e.target as HTMLDivElement).style.boxShadow = shadows.medium
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLDivElement).style.transform = 'translateY(0)'
                  (e.target as HTMLDivElement).style.boxShadow = 'none'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ color: colors.text.primary, fontSize: '18px', fontWeight: '700', margin: '0 0 8px 0' }}>
                      {route.name}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md, marginBottom: spacing.sm }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
                        <i className="fas fa-map-marker-alt" style={{ color: colors.primary[500], fontSize: '14px' }}></i>
                        <span style={{ color: colors.text.secondary, fontSize: '14px' }}>{route.origin}</span>
                      </div>
                      <i className="fas fa-arrow-right" style={{ color: colors.text.tertiary, fontSize: '12px' }}></i>
                      <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
                        <i className="fas fa-flag-checkered" style={{ color: colors.primary[500], fontSize: '14px' }}></i>
                        <span style={{ color: colors.text.secondary, fontSize: '14px' }}>{route.destination}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing.xs,
                    backgroundColor: getStatusColor(route.status),
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: borders.radius.sm,
                    fontSize: '12px',
                    fontWeight: '600',
                    textTransform: 'uppercase'
                  }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      backgroundColor: 'white',
                      borderRadius: '50%'
                    }} />
                    {route.status}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: spacing.lg }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: colors.text.secondary, fontSize: '12px', marginBottom: '4px' }}>Distance</div>
                    <div style={{ color: colors.text.primary, fontSize: '16px', fontWeight: '700' }}>
                      {route.distance} mi
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: colors.text.secondary, fontSize: '12px', marginBottom: '4px' }}>Est. Time</div>
                    <div style={{ color: colors.text.primary, fontSize: '16px', fontWeight: '700' }}>
                      {route.estimatedTime}m
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: colors.text.secondary, fontSize: '12px', marginBottom: '4px' }}>Efficiency</div>
                    <div style={{ color: colors.text.primary, fontSize: '16px', fontWeight: '700' }}>
                      {route.efficiency}%
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: colors.text.secondary, fontSize: '12px', marginBottom: '4px' }}>Fuel Cost</div>
                    <div style={{ color: colors.text.primary, fontSize: '16px', fontWeight: '700' }}>
                      ${route.fuelCost}
                    </div>
                  </div>
                </div>

                {route.trafficDelay > 0 && (
                  <div style={{
                    marginTop: spacing.md,
                    padding: spacing.sm,
                    backgroundColor: '#fef3c7',
                    border: '1px solid #f59e0b',
                    borderRadius: borders.radius.sm,
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing.xs
                  }}>
                    <i className="fas fa-clock" style={{ color: '#f59e0b', fontSize: '12px' }}></i>
                    <span style={{ color: '#92400e', fontSize: '12px', fontWeight: '600' }}>
                      Traffic Delay: +{route.trafficDelay} minutes
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'optimization' && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: colors.text.secondary }}>
          <i className="fas fa-brain" style={{ fontSize: '64px', marginBottom: spacing.lg, color: colors.primary[500] }}></i>
          <h3 style={{ fontSize: '24px', marginBottom: spacing.md, color: colors.text.primary }}>AI Route Optimization</h3>
          <p style={{ marginBottom: spacing.lg }}>Advanced machine learning algorithms for optimal route planning...</p>
          <button
            onClick={runOptimization}
            disabled={optimizationRunning}
            style={{
              padding: `${spacing.md} ${spacing.lg}`,
              background: optimizationRunning ? '#6b7280' : gradients.primary,
              color: 'white',
              border: 'none',
              borderRadius: borders.radius.md,
              fontSize: '14px',
              fontWeight: '600',
              cursor: optimizationRunning ? 'not-allowed' : 'pointer'
            }}
          >
            <i className={`fas fa-${optimizationRunning ? 'spinner fa-spin' : 'magic'}`} style={{ marginRight: spacing.sm }}></i>
            {optimizationRunning ? 'Optimizing...' : 'Run AI Optimization'}
          </button>
        </div>
      )}

      {activeTab === 'traffic' && (
        <div>
          <div style={{
            display: 'grid',
            gap: spacing.md
          }}>
            {trafficAlerts.map(alert => (
              <div
                key={alert.id}
                style={{
                  background: colors.background.tertiary,
                  borderRadius: borders.radius.lg,
                  padding: spacing.lg,
                  border: `${borders.thin} ${colors.border.secondary}`,
                  borderLeft: `4px solid ${getSeverityColor(alert.severity)}`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs }}>
                      <span style={{
                        backgroundColor: getSeverityColor(alert.severity),
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: borders.radius.sm,
                        fontSize: '11px',
                        fontWeight: '700',
                        textTransform: 'uppercase'
                      }}>
                        {alert.severity}
                      </span>
                      <span style={{
                        backgroundColor: colors.background.primary,
                        color: colors.text.secondary,
                        padding: '2px 8px',
                        borderRadius: borders.radius.sm,
                        fontSize: '11px',
                        fontWeight: '600'
                      }}>
                        {alert.type}
                      </span>
                    </div>
                    <h3 style={{ color: colors.text.primary, fontSize: '16px', fontWeight: '700', margin: '0 0 8px 0' }}>
                      {alert.message}
                    </h3>
                    <p style={{ color: colors.text.secondary, fontSize: '14px', margin: '0 0 8px 0' }}>
                      Route: {routes.find(r => r.id === alert.routeId)?.name}
                    </p>
                    <p style={{ color: colors.text.tertiary, fontSize: '12px', margin: 0 }}>
                      Estimated Delay: +{alert.estimatedDelay} minutes
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: spacing.xs }}>
                    <button style={{
                      padding: `${spacing.xs} ${spacing.sm}`,
                      backgroundColor: colors.background.primary,
                      color: colors.text.secondary,
                      border: `${borders.thin} ${colors.border.secondary}`,
                      borderRadius: borders.radius.sm,
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}>
                      View Route
                    </button>
                    <button style={{
                      padding: `${spacing.xs} ${spacing.sm}`,
                      background: gradients.primary,
                      color: 'white',
                      border: 'none',
                      borderRadius: borders.radius.sm,
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}>
                      Reroute
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'fuel' && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: colors.text.secondary }}>
          <i className="fas fa-gas-pump" style={{ fontSize: '64px', marginBottom: spacing.lg, color: '#f59e0b' }}></i>
          <h3 style={{ fontSize: '24px', marginBottom: spacing.md, color: colors.text.primary }}>Fuel Analysis</h3>
          <p style={{ marginBottom: spacing.lg }}>Advanced fuel consumption tracking and optimization recommendations...</p>
          <button style={{
            padding: `${spacing.md} ${spacing.lg}`,
            background: gradients.primary,
            color: 'white',
            border: 'none',
            borderRadius: borders.radius.md,
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}>
            <i className="fas fa-chart-line" style={{ marginRight: spacing.sm }}></i>
            View Fuel Reports
          </button>
        </div>
      )}
    </div>
  )
}

export default RouteOptimization
