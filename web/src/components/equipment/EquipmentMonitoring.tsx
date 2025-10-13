import React, { useState, useEffect } from 'react'
import { colors, shadows, borders, spacing, gradients } from '../styles/design-system'

interface Equipment {
  id: string
  name: string
  type: string
  status: 'active' | 'maintenance' | 'alert' | 'offline'
  utilization: number
  nextMaintenance: string
  healthScore: number
  location: string
  lastUpdate: string
}

interface MaintenanceAlert {
  id: string
  equipmentId: string
  type: 'scheduled' | 'urgent' | 'overdue'
  message: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  dueDate: string
}

const EquipmentMonitoring = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'alerts' | 'maintenance'>('overview')
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null)

  // Mock data
  const equipment: Equipment[] = [
    {
      id: 'EQ001',
      name: 'Freightliner Cascadia',
      type: 'Tractor',
      status: 'active',
      utilization: 87,
      nextMaintenance: '2024-01-15',
      healthScore: 92,
      location: 'Route 95 - Baltimore',
      lastUpdate: '2 minutes ago'
    },
    {
      id: 'EQ002',
      name: 'Peterbilt 579',
      type: 'Tractor',
      status: 'alert',
      utilization: 65,
      nextMaintenance: '2024-01-08',
      healthScore: 78,
      location: 'I-81 - Harrisburg',
      lastUpdate: '5 minutes ago'
    },
    {
      id: 'EQ003',
      name: 'Volvo VNL 760',
      type: 'Tractor',
      status: 'maintenance',
      utilization: 0,
      nextMaintenance: '2024-01-05',
      healthScore: 85,
      location: 'Maintenance Bay 2',
      lastUpdate: '1 hour ago'
    },
    {
      id: 'EQ004',
      name: 'Mack Anthem',
      type: 'Tractor',
      status: 'active',
      utilization: 94,
      nextMaintenance: '2024-01-20',
      healthScore: 96,
      location: 'Route 70 - Columbus',
      lastUpdate: '30 seconds ago'
    }
  ]

  const alerts: MaintenanceAlert[] = [
    {
      id: 'ALT001',
      equipmentId: 'EQ002',
      type: 'urgent',
      message: 'Engine oil pressure below normal',
      priority: 'high',
      dueDate: '2024-01-08'
    },
    {
      id: 'ALT002',
      equipmentId: 'EQ003',
      type: 'scheduled',
      message: 'Regular maintenance due',
      priority: 'medium',
      dueDate: '2024-01-05'
    },
    {
      id: 'ALT003',
      equipmentId: 'EQ001',
      type: 'scheduled',
      message: 'Tire rotation scheduled',
      priority: 'low',
      dueDate: '2024-01-15'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10b981'
      case 'alert': return '#f59e0b'
      case 'maintenance': return '#3b82f6'
      case 'offline': return '#ef4444'
      default: return '#6b7280'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return '#ef4444'
      case 'high': return '#f59e0b'
      case 'medium': return '#3b82f6'
      case 'low': return '#10b981'
      default: return '#6b7280'
    }
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
              <i className="fas fa-truck" style={{ color: 'white', fontSize: '18px' }}></i>
            </div>
            Equipment Monitoring
          </h2>
          <p style={{ color: colors.text.secondary, margin: 0, fontSize: '14px' }}>
            Real-time fleet health and maintenance tracking
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
            Add Equipment
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
          { id: 'overview', label: 'Fleet Overview', icon: 'fas fa-th-large' },
          { id: 'alerts', label: 'Maintenance Alerts', icon: 'fas fa-exclamation-triangle', count: alerts.length },
          { id: 'maintenance', label: 'Scheduled Maintenance', icon: 'fas fa-calendar-check' }
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
          {/* Fleet Stats */}
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
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981', marginBottom: spacing.xs }}>
                {equipment.filter(e => e.status === 'active').length}
              </div>
              <div style={{ color: colors.text.secondary, fontSize: '14px', fontWeight: '600' }}>
                Active Vehicles
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
                {alerts.filter(a => a.priority === 'high' || a.priority === 'critical').length}
              </div>
              <div style={{ color: colors.text.secondary, fontSize: '14px', fontWeight: '600' }}>
                Critical Alerts
              </div>
            </div>
            <div style={{
              background: colors.background.tertiary,
              borderRadius: borders.radius.lg,
              padding: spacing.lg,
              border: `${borders.thin} ${colors.border.secondary}`,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#3b82f6', marginBottom: spacing.xs }}>
                {Math.round(equipment.reduce((acc, e) => acc + e.utilization, 0) / equipment.length)}%
              </div>
              <div style={{ color: colors.text.secondary, fontSize: '14px', fontWeight: '600' }}>
                Avg Utilization
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
                {Math.round(equipment.reduce((acc, e) => acc + e.healthScore, 0) / equipment.length)}%
              </div>
              <div style={{ color: colors.text.secondary, fontSize: '14px', fontWeight: '600' }}>
                Avg Health Score
              </div>
            </div>
          </div>

          {/* Equipment List */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: spacing.lg
          }}>
            {equipment.map(item => (
              <div
                key={item.id}
                onClick={() => setSelectedEquipment(item)}
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
                  <div>
                    <h3 style={{ color: colors.text.primary, fontSize: '16px', fontWeight: '700', margin: '0 0 4px 0' }}>
                      {item.name}
                    </h3>
                    <p style={{ color: colors.text.secondary, fontSize: '12px', margin: 0 }}>
                      {item.type} • {item.id}
                    </p>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing.xs,
                    backgroundColor: getStatusColor(item.status),
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: borders.radius.sm,
                    fontSize: '11px',
                    fontWeight: '600',
                    textTransform: 'uppercase'
                  }}>
                    <div style={{
                      width: '6px',
                      height: '6px',
                      backgroundColor: 'white',
                      borderRadius: '50%'
                    }} />
                    {item.status}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.md, marginBottom: spacing.md }}>
                  <div>
                    <div style={{ color: colors.text.secondary, fontSize: '12px', marginBottom: '4px' }}>Utilization</div>
                    <div style={{ color: colors.text.primary, fontSize: '18px', fontWeight: '700' }}>
                      {item.utilization}%
                    </div>
                  </div>
                  <div>
                    <div style={{ color: colors.text.secondary, fontSize: '12px', marginBottom: '4px' }}>Health Score</div>
                    <div style={{ color: colors.text.primary, fontSize: '18px', fontWeight: '700' }}>
                      {item.healthScore}%
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: `${borders.thin} ${colors.border.secondary}`, paddingTop: spacing.sm }}>
                  <div style={{ color: colors.text.tertiary, fontSize: '12px', marginBottom: '4px' }}>
                    Location: {item.location}
                  </div>
                  <div style={{ color: colors.text.tertiary, fontSize: '12px' }}>
                    Last Update: {item.lastUpdate}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'alerts' && (
        <div>
          <div style={{
            display: 'grid',
            gap: spacing.md
          }}>
            {alerts.map(alert => (
              <div
                key={alert.id}
                style={{
                  background: colors.background.tertiary,
                  borderRadius: borders.radius.lg,
                  padding: spacing.lg,
                  border: `${borders.thin} ${colors.border.secondary}`,
                  borderLeft: `4px solid ${getPriorityColor(alert.priority)}`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs }}>
                      <span style={{
                        backgroundColor: getPriorityColor(alert.priority),
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: borders.radius.sm,
                        fontSize: '11px',
                        fontWeight: '700',
                        textTransform: 'uppercase'
                      }}>
                        {alert.priority}
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
                      Equipment: {equipment.find(e => e.id === alert.equipmentId)?.name}
                    </p>
                    <p style={{ color: colors.text.tertiary, fontSize: '12px', margin: 0 }}>
                      Due: {alert.dueDate}
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
                      View Details
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
                      Resolve
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'maintenance' && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: colors.text.secondary }}>
          <i className="fas fa-calendar-check" style={{ fontSize: '64px', marginBottom: spacing.lg, color: colors.primary[500] }}></i>
          <h3 style={{ fontSize: '24px', marginBottom: spacing.md, color: colors.text.primary }}>Maintenance Scheduling</h3>
          <p style={{ marginBottom: spacing.lg }}>Advanced maintenance scheduling and tracking system coming soon...</p>
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
            <i className="fas fa-plus" style={{ marginRight: spacing.sm }}></i>
            Schedule Maintenance
          </button>
        </div>
      )}
    </div>
  )
}

export default EquipmentMonitoring
