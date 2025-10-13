import React, { useState, useEffect } from 'react'
import PageContainer from '../../components/shared/PageContainer'
import Card from '../../components/ui/Card'
import AnimatedCounter from '../../components/enhanced/AnimatedCounter'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Truck, 
  Clock, 
  MapPin,
  Package,
  Users,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Target,
  RefreshCw
} from 'lucide-react'

interface MetricData {
  label: string
  value: number
  change: number
  changeType: 'increase' | 'decrease'
  format: 'currency' | 'number' | 'percentage'
  icon: React.ReactNode
}

interface ChartData {
  month: string
  revenue: number
  loads: number
  efficiency: number
}

const DataVisualizationPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [lastRefresh, setLastRefresh] = useState(new Date())

  const metrics: MetricData[] = [
    {
      label: 'Total Revenue',
      value: 428950,
      change: 12.5,
      changeType: 'increase',
      format: 'currency',
      icon: <DollarSign color="#10b981" size={24} />
    },
    {
      label: 'Loads Completed',
      value: 247,
      change: 8.3,
      changeType: 'increase',
      format: 'number',
      icon: <Package color="#3b82f6" size={24} />
    },
    {
      label: 'On-Time Delivery',
      value: 94.2,
      change: -2.1,
      changeType: 'decrease',
      format: 'percentage',
      icon: <Clock color="#f59e0b" size={24} />
    },
    {
      label: 'Driver Utilization',
      value: 87.5,
      change: 5.7,
      changeType: 'increase',
      format: 'percentage',
      icon: <Users color="#8b5cf6" size={24} />
    }
  ]

  const chartData: ChartData[] = [
    { month: 'Jan', revenue: 385000, loads: 198, efficiency: 89.2 },
    { month: 'Feb', revenue: 412000, loads: 215, efficiency: 91.5 },
    { month: 'Mar', revenue: 398000, loads: 203, efficiency: 88.7 },
    { month: 'Apr', revenue: 445000, loads: 232, efficiency: 92.1 },
    { month: 'May', revenue: 428950, loads: 247, efficiency: 94.2 },
    { month: 'Jun', revenue: 0, loads: 0, efficiency: 0 } // Current month placeholder
  ]

  const topRoutes = [
    { route: 'Dallas → Houston', loads: 45, revenue: 89500, efficiency: 96.2 },
    { route: 'Austin → San Antonio', loads: 38, revenue: 72300, efficiency: 94.8 },
    { route: 'Houston → Dallas', loads: 32, revenue: 67800, efficiency: 92.1 },
    { route: 'Dallas → Austin', loads: 28, revenue: 54200, efficiency: 89.5 },
    { route: 'San Antonio → Houston', loads: 24, revenue: 48100, efficiency: 87.3 }
  ]

  const formatValue = (value: number, format: string) => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(value)
      case 'percentage':
        return `${value.toFixed(1)}%`
      default:
        return value.toLocaleString()
    }
  }

  const refreshData = () => {
    setLastRefresh(new Date())
    console.log('Refreshing analytics data...')
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
              Data Visualization
            </h1>
            <p style={{ 
              color: '#CBD5E0', 
              fontSize: '16px', 
              margin: 0 
            }}>
              Analytics dashboard and performance metrics
            </p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              style={{
                padding: '8px 12px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#F7FAFC',
                fontSize: '14px'
              }}
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
            </select>
            
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
              Refresh
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '20px',
          marginBottom: '32px' 
        }}>
          {metrics.map((metric, index) => (
            <Card 
              key={index}
              title={metric.label}
              icon={metric.icon}
              style={{ position: 'relative' }}
              className="glass-card lift-on-hover"
            >
              <div style={{ textAlign: 'center' }}>
                <AnimatedCounter
                  value={metric.value}
                  duration={1200}
                  fontSize="36px"
                  fontWeight="700"
                  color="#F7FAFC"
                  prefix={metric.format === 'currency' ? '$' : ''}
                  suffix={metric.format === 'percentage' ? '%' : ''}
                  decimals={metric.format === 'percentage' ? 1 : 0}
                />
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  gap: '4px',
                  fontSize: '14px'
                }}>
                  {metric.changeType === 'increase' ? (
                    <TrendingUp color="#10b981" size={16} />
                  ) : (
                    <TrendingDown color="#ef4444" size={16} />
                  )}
                  <span style={{ 
                    color: metric.changeType === 'increase' ? '#10b981' : '#ef4444',
                    fontWeight: '600'
                  }}>
                    {Math.abs(metric.change)}%
                  </span>
                  <span style={{ color: '#718096' }}>
                    vs last period
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Charts Section */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '2fr 1fr', 
          gap: '24px',
          marginBottom: '32px' 
        }}>
          {/* Revenue Chart */}
          <Card title="Revenue & Loads Trend" icon={<BarChart3 color="#C53030" size={24} />}>
            <div style={{ height: '300px', position: 'relative' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'end', 
                justifyContent: 'space-between',
                height: '100%',
                padding: '20px 0'
              }}>
                {chartData.filter(d => d.revenue > 0).map((data, index) => (
                  <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <div style={{ 
                      width: '40px',
                      height: `${(data.revenue / 500000) * 200}px`,
                      background: 'linear-gradient(180deg, #C53030 0%, #9B2C2C 100%)',
                      borderRadius: '4px',
                      position: 'relative'
                    }}>
                      <div style={{
                        position: 'absolute',
                        bottom: '-20px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontSize: '12px',
                        color: '#CBD5E0',
                        fontWeight: '600'
                      }}>
                        {data.month}
                      </div>
                    </div>
                    <div style={{ 
                      fontSize: '11px', 
                      color: '#718096',
                      textAlign: 'center'
                    }}>
                      ${(data.revenue / 1000).toFixed(0)}k
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Top Routes */}
          <Card title="Top Performing Routes" icon={<MapPin color="#3b82f6" size={24} />}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {topRoutes.map((route, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px'
                  }}
                >
                  <div>
                    <div style={{ 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      color: '#F7FAFC',
                      marginBottom: '2px'
                    }}>
                      {route.route}
                    </div>
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#718096' 
                    }}>
                      {route.loads} loads • {formatValue(route.revenue, 'currency')}
                    </div>
                  </div>
                  <div style={{ 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: '#10b981' 
                  }}>
                    {route.efficiency}%
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Performance Insights */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
          gap: '24px' 
        }}>
          <Card title="Efficiency Metrics" icon={<Target color="#f59e0b" size={24} />}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#CBD5E0' }}>Fuel Efficiency</span>
                <span style={{ color: '#F7FAFC', fontWeight: '600' }}>7.2 MPG</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#CBD5E0' }}>Average Load Time</span>
                <span style={{ color: '#F7FAFC', fontWeight: '600' }}>2.3 hours</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#CBD5E0' }}>Customer Satisfaction</span>
                <span style={{ color: '#F7FAFC', fontWeight: '600' }}>4.8/5</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#CBD5E0' }}>Revenue per Load</span>
                <span style={{ color: '#F7FAFC', fontWeight: '600' }}>{formatValue(1736, 'currency')}</span>
              </div>
            </div>
          </Card>

          <Card title="Recent Activity" icon={<Activity color="#8b5cf6" size={24} />}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { action: 'Load completed', detail: 'Dallas → Houston', time: '2 minutes ago', type: 'success' },
                { action: 'New load assigned', detail: 'Austin → San Antonio', time: '15 minutes ago', type: 'info' },
                { action: 'Driver check-in', detail: 'TRK-001 at destination', time: '1 hour ago', type: 'info' },
                { action: 'Payment received', detail: '$2,450.00', time: '2 hours ago', type: 'success' },
                { action: 'Maintenance alert', detail: 'TRK-002 oil change due', time: '3 hours ago', type: 'warning' }
              ].map((activity, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px 0',
                    borderBottom: index < 4 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none'
                  }}
                >
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: activity.type === 'success' ? '#10b981' : 
                              activity.type === 'warning' ? '#f59e0b' : '#3b82f6'
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      fontSize: '14px', 
                      color: '#F7FAFC',
                      fontWeight: '500'
                    }}>
                      {activity.action}
                    </div>
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#718096' 
                    }}>
                      {activity.detail} • {activity.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Last Updated */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: '32px',
          color: '#718096',
          fontSize: '14px'
        }}>
          Last updated: {lastRefresh.toLocaleString()}
        </div>
      </div>
    </PageContainer>
  )
}

export default DataVisualizationPage
