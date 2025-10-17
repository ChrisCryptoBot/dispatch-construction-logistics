import React, { useState, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { 
  Users, Truck, Package, DollarSign, TrendingUp, 
  AlertTriangle, CheckCircle, Clock, BarChart3,
  Settings, UserPlus, Database, Activity, Globe
} from 'lucide-react'
import PageContainer from '../components/shared/PageContainer'
import { formatNumber, formatCurrency, formatPercentage } from '../utils/formatters'

interface SystemStats {
  totalUsers: number
  totalCarriers: number
  totalCustomers: number
  totalDrivers: number
  totalLoads: number
  activeLoads: number
  completedLoads: number
  totalRevenue: number
  monthlyRevenue: number
  systemUptime: string
  databaseSize: string
  apiCallsToday: number
}

interface RecentActivity {
  id: string
  type: 'user_login' | 'load_created' | 'driver_assigned' | 'payment_completed' | 'system_alert'
  message: string
  timestamp: string
  severity?: 'low' | 'medium' | 'high'
}

const AdminDashboard: React.FC = () => {
  const { theme } = useTheme()
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'system' | 'analytics'>('overview')
  
  // Mock data - In production, this would come from API
  const [systemStats] = useState<SystemStats>({
    totalUsers: 1247,
    totalCarriers: 89,
    totalCustomers: 1158,
    totalDrivers: 342,
    totalLoads: 8947,
    activeLoads: 234,
    completedLoads: 8713,
    totalRevenue: 2847563.45,
    monthlyRevenue: 187432.67,
    systemUptime: '99.97%',
    databaseSize: '2.4 GB',
    apiCallsToday: 45672
  })

  const [recentActivity] = useState<RecentActivity[]>([
    {
      id: '1',
      type: 'user_login',
      message: 'Admin user logged in from 192.168.1.100',
      timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
      severity: 'low'
    },
    {
      id: '2',
      type: 'load_created',
      message: 'New load created: LT-2025-0001 (Dallas → Houston)',
      timestamp: new Date(Date.now() - 12 * 60000).toISOString(),
      severity: 'medium'
    },
    {
      id: '3',
      type: 'driver_assigned',
      message: 'Driver Mike Johnson assigned to load LT-2025-0001',
      timestamp: new Date(Date.now() - 18 * 60000).toISOString(),
      severity: 'medium'
    },
    {
      id: '4',
      type: 'payment_completed',
      message: 'Payment completed: $2,450.00 for load LT-2024-9999',
      timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
      severity: 'high'
    },
    {
      id: '5',
      type: 'system_alert',
      message: 'Database query performance warning detected',
      timestamp: new Date(Date.now() - 32 * 60000).toISOString(),
      severity: 'high'
    }
  ])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_login': return <Users size={16} />
      case 'load_created': return <Package size={16} />
      case 'driver_assigned': return <Truck size={16} />
      case 'payment_completed': return <DollarSign size={16} />
      case 'system_alert': return <AlertTriangle size={16} />
      default: return <Activity size={16} />
    }
  }

  const getActivityColor = (severity?: string) => {
    switch (severity) {
      case 'high': return '#EF4444'
      case 'medium': return '#F59E0B'
      case 'low': return '#10B981'
      default: return theme.colors.textSecondary
    }
  }

  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
      minHeight: '100vh',
      padding: '24px'
    }}>
      <PageContainer 
        title="Administrative Dashboard" 
        description="System overview, user management, and administrative controls"
      >
      {/* Tab Navigation */}
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        marginBottom: '32px',
        borderBottom: `1px solid ${theme.colors.border}`
      }}>
        {[
          { id: 'overview', label: 'System Overview', icon: <BarChart3 size={16} /> },
          { id: 'users', label: 'User Management', icon: <Users size={16} /> },
          { id: 'system', label: 'System Health', icon: <Activity size={16} /> },
          { id: 'analytics', label: 'Analytics', icon: <TrendingUp size={16} /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              padding: '12px 24px',
              background: activeTab === tab.id ? theme.colors.primary : 'transparent',
              color: activeTab === tab.id ? 'white' : theme.colors.textSecondary,
              border: 'none',
              borderRadius: '8px 8px 0 0',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Key Metrics */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '24px', 
            marginBottom: '40px' 
          }}>
            <div style={{
              padding: '28px',
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(12px)',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: `
                0 8px 32px rgba(0, 0, 0, 0.08),
                0 4px 16px rgba(0, 0, 0, 0.04),
                inset 0 1px 0 rgba(255, 255, 255, 0.2)
              `,
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)'
              e.currentTarget.style.boxShadow = `
                0 16px 40px rgba(0, 0, 0, 0.12),
                0 8px 20px rgba(0, 0, 0, 0.08),
                inset 0 1px 0 rgba(255, 255, 255, 0.3)
              `
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
              e.currentTarget.style.boxShadow = `
                0 8px 32px rgba(0, 0, 0, 0.08),
                0 4px 16px rgba(0, 0, 0, 0.04),
                inset 0 1px 0 rgba(255, 255, 255, 0.2)
              `
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
              }}>
                <Users size={28} color="white" />
              </div>
              <div>
                <p style={{ 
                  fontSize: '36px', 
                  fontWeight: '800', 
                  background: 'linear-gradient(135deg, #1F2937 0%, #374151 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  margin: '0 0 6px 0',
                  lineHeight: 1
                }}>
                  {formatNumber(systemStats.totalUsers)}
                </p>
                <p style={{ 
                  fontSize: '15px', 
                  color: '#6B7280',
                  margin: 0,
                  fontWeight: '500'
                }}>
                  Total Users
                </p>
              </div>
            </div>

            <div style={{
              padding: '24px',
              background: theme.colors.backgroundCard,
              borderRadius: '12px',
              border: `1px solid ${theme.colors.border}`,
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Package size={24} color="white" />
              </div>
              <div>
                <p style={{ 
                  fontSize: '32px', 
                  fontWeight: '700', 
                  color: theme.colors.textPrimary,
                  margin: '0 0 4px 0',
                  lineHeight: 1
                }}>
                  {formatNumber(systemStats.totalLoads)}
                </p>
                <p style={{ 
                  fontSize: '14px', 
                  color: theme.colors.textSecondary,
                  margin: 0 
                }}>
                  Total Loads
                </p>
              </div>
            </div>

            <div style={{
              padding: '24px',
              background: theme.colors.backgroundCard,
              borderRadius: '12px',
              border: `1px solid ${theme.colors.border}`,
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <DollarSign size={24} color="white" />
              </div>
              <div>
                <p style={{ 
                  fontSize: '32px', 
                  fontWeight: '700', 
                  color: theme.colors.textPrimary,
                  margin: '0 0 4px 0',
                  lineHeight: 1
                }}>
                  {formatCurrency(systemStats.totalRevenue)}
                </p>
                <p style={{ 
                  fontSize: '14px', 
                  color: theme.colors.textSecondary,
                  margin: 0 
                }}>
                  Total Revenue
                </p>
              </div>
            </div>

            <div style={{
              padding: '24px',
              background: theme.colors.backgroundCard,
              borderRadius: '12px',
              border: `1px solid ${theme.colors.border}`,
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <CheckCircle size={24} color="white" />
              </div>
              <div>
                <p style={{ 
                  fontSize: '32px', 
                  fontWeight: '700', 
                  color: theme.colors.textPrimary,
                  margin: '0 0 4px 0',
                  lineHeight: 1
                }}>
                  {systemStats.systemUptime}
                </p>
                <p style={{ 
                  fontSize: '14px', 
                  color: theme.colors.textSecondary,
                  margin: 0 
                }}>
                  System Uptime
                </p>
              </div>
            </div>
          </div>

          {/* User Breakdown */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '32px'
          }}>
            <div style={{
              padding: '20px',
              background: theme.colors.backgroundCard,
              borderRadius: '12px',
              border: `1px solid ${theme.colors.border}`,
              textAlign: 'center'
            }}>
              <Truck size={32} color={theme.colors.primary} style={{ marginBottom: '12px' }} />
              <p style={{ 
                fontSize: '24px', 
                fontWeight: '700', 
                color: theme.colors.textPrimary,
                margin: '0 0 4px 0' 
              }}>
                {formatNumber(systemStats.totalCarriers)}
              </p>
              <p style={{ 
                fontSize: '14px', 
                color: theme.colors.textSecondary,
                margin: 0 
              }}>
                Carriers
              </p>
            </div>

            <div style={{
              padding: '20px',
              background: theme.colors.backgroundCard,
              borderRadius: '12px',
              border: `1px solid ${theme.colors.border}`,
              textAlign: 'center'
            }}>
              <Users size={32} color={theme.colors.success} style={{ marginBottom: '12px' }} />
              <p style={{ 
                fontSize: '24px', 
                fontWeight: '700', 
                color: theme.colors.textPrimary,
                margin: '0 0 4px 0' 
              }}>
                {formatNumber(systemStats.totalCustomers)}
              </p>
              <p style={{ 
                fontSize: '14px', 
                color: theme.colors.textSecondary,
                margin: 0 
              }}>
                Customers
              </p>
            </div>

            <div style={{
              padding: '20px',
              background: theme.colors.backgroundCard,
              borderRadius: '12px',
              border: `1px solid ${theme.colors.border}`,
              textAlign: 'center'
            }}>
              <Users size={32} color={theme.colors.warning} style={{ marginBottom: '12px' }} />
              <p style={{ 
                fontSize: '24px', 
                fontWeight: '700', 
                color: theme.colors.textPrimary,
                margin: '0 0 4px 0' 
              }}>
                {formatNumber(systemStats.totalDrivers)}
              </p>
              <p style={{ 
                fontSize: '14px', 
                color: theme.colors.textSecondary,
                margin: 0 
              }}>
                Drivers
              </p>
            </div>

            <div style={{
              padding: '20px',
              background: theme.colors.backgroundCard,
              borderRadius: '12px',
              border: `1px solid ${theme.colors.border}`,
              textAlign: 'center'
            }}>
              <Package size={32} color={theme.colors.info} style={{ marginBottom: '12px' }} />
              <p style={{ 
                fontSize: '24px', 
                fontWeight: '700', 
                color: theme.colors.textPrimary,
                margin: '0 0 4px 0' 
              }}>
                {formatNumber(systemStats.activeLoads)}
              </p>
              <p style={{ 
                fontSize: '14px', 
                color: theme.colors.textSecondary,
                margin: 0 
              }}>
                Active Loads
              </p>
            </div>
          </div>

          {/* Recent Activity */}
          <div style={{
            background: theme.colors.backgroundCard,
            borderRadius: '12px',
            border: `1px solid ${theme.colors.border}`,
            padding: '20px'
          }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              color: theme.colors.textPrimary,
              margin: '0 0 20px 0' 
            }}>
              Recent System Activity
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recentActivity.map(activity => (
                <div
                  key={activity.id}
                  style={{
                    padding: '12px',
                    background: theme.colors.backgroundSecondary,
                    borderRadius: '8px',
                    border: `1px solid ${theme.colors.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <div style={{ color: getActivityColor(activity.severity) }}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ 
                      fontSize: '14px', 
                      color: theme.colors.textPrimary,
                      margin: '0 0 4px 0' 
                    }}>
                      {activity.message}
                    </p>
                    <p style={{ 
                      fontSize: '12px', 
                      color: theme.colors.textSecondary,
                      margin: 0 
                    }}>
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                  {activity.severity === 'high' && (
                    <AlertTriangle size={16} color="#EF4444" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div style={{
          background: theme.colors.backgroundCard,
          borderRadius: '12px',
          border: `1px solid ${theme.colors.border}`,
          padding: '20px',
          textAlign: 'center'
        }}>
          <Users size={48} color={theme.colors.textSecondary} style={{ marginBottom: '16px' }} />
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: theme.colors.textPrimary,
            margin: '0 0 8px 0' 
          }}>
            User Management
          </h3>
          <p style={{ 
            fontSize: '14px', 
            color: theme.colors.textSecondary,
            margin: 0 
          }}>
            User management interface coming soon. This will include user creation, role management, and permissions.
          </p>
        </div>
      )}

      {/* System Tab */}
      {activeTab === 'system' && (
        <div style={{
          background: theme.colors.backgroundCard,
          borderRadius: '12px',
          border: `1px solid ${theme.colors.border}`,
          padding: '20px'
        }}>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: theme.colors.textPrimary,
            margin: '0 0 20px 0' 
          }}>
            System Health
          </h3>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '16px' 
          }}>
            <div style={{
              padding: '16px',
              background: theme.colors.backgroundSecondary,
              borderRadius: '8px',
              border: `1px solid ${theme.colors.border}`
            }}>
              <Database size={24} color={theme.colors.success} style={{ marginBottom: '8px' }} />
              <p style={{ 
                fontSize: '16px', 
                fontWeight: '600', 
                color: theme.colors.textPrimary,
                margin: '0 0 4px 0' 
              }}>
                Database
              </p>
              <p style={{ 
                fontSize: '14px', 
                color: theme.colors.textSecondary,
                margin: 0 
              }}>
                Size: {systemStats.databaseSize}
              </p>
            </div>

            <div style={{
              padding: '16px',
              background: theme.colors.backgroundSecondary,
              borderRadius: '8px',
              border: `1px solid ${theme.colors.border}`
            }}>
              <Globe size={24} color={theme.colors.primary} style={{ marginBottom: '8px' }} />
              <p style={{ 
                fontSize: '16px', 
                fontWeight: '600', 
                color: theme.colors.textPrimary,
                margin: '0 0 4px 0' 
              }}>
                API Usage
              </p>
              <p style={{ 
                fontSize: '14px', 
                color: theme.colors.textSecondary,
                margin: 0 
              }}>
                Today: {formatNumber(systemStats.apiCallsToday)} calls
              </p>
            </div>

            <div style={{
              padding: '16px',
              background: theme.colors.backgroundSecondary,
              borderRadius: '8px',
              border: `1px solid ${theme.colors.border}`
            }}>
              <Clock size={24} color={theme.colors.warning} style={{ marginBottom: '8px' }} />
              <p style={{ 
                fontSize: '16px', 
                fontWeight: '600', 
                color: theme.colors.textPrimary,
                margin: '0 0 4px 0' 
              }}>
                Uptime
              </p>
              <p style={{ 
                fontSize: '14px', 
                color: theme.colors.textSecondary,
                margin: 0 
              }}>
                {systemStats.systemUptime}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div style={{
          background: theme.colors.backgroundCard,
          borderRadius: '12px',
          border: `1px solid ${theme.colors.border}`,
          padding: '20px',
          textAlign: 'center'
        }}>
          <TrendingUp size={48} color={theme.colors.textSecondary} style={{ marginBottom: '16px' }} />
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: theme.colors.textPrimary,
            margin: '0 0 8px 0' 
          }}>
            Analytics Dashboard
          </h3>
          <p style={{ 
            fontSize: '14px', 
            color: theme.colors.textSecondary,
            margin: 0 
          }}>
            Advanced analytics and reporting interface coming soon. This will include revenue trends, user growth, and performance metrics.
          </p>
        </div>
      )}
      </PageContainer>
    </div>
  )
}

export default AdminDashboard
