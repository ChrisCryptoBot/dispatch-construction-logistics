import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../../contexts/ThemeContext'
import { useQuery } from '@tanstack/react-query'
import { loadsAPI, carrierAPI } from '../../services/api'
import PageContainer from '../../components/shared/PageContainer'
import Card from '../../components/ui/Card'
import {
  LayoutDashboard, Package, Truck, Users, DollarSign, 
  TrendingUp, AlertTriangle, CheckCircle, Clock, MapPin,
  Activity, Zap, Star, Calendar, ArrowRight, Loader, Wrench, 
  Globe, RefreshCw, Navigation, Bell, Smartphone, ExternalLink, FileText
} from 'lucide-react'
import { formatNumber, formatCurrency, formatCompactCurrency, formatPercentage } from '../../utils/formatters'
import AnimatedCounter from '../../components/enhanced/AnimatedCounter'

const CarrierDashboard = () => {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const [selectedTimezone, setSelectedTimezone] = useState(
    localStorage.getItem('userTimezone') || Intl.DateTimeFormat().resolvedOptions().timeZone
  )

  // US Time Zones
  const usTimeZones = [
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Phoenix', label: 'Mountain Time - Arizona (MST)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
    { value: 'Pacific/Honolulu', label: 'Hawaii Time (HST)' }
  ]

  // Handle timezone change
  const handleTimezoneChange = (timezone: string) => {
    setSelectedTimezone(timezone)
    localStorage.setItem('userTimezone', timezone)
  }
  const [currentTime, setCurrentTime] = useState(new Date())

  // Fetch real data from API
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['carrier-stats'],
    queryFn: async () => {
      try {
        return await carrierAPI.getDashboardStats()
      } catch (error) {
        console.warn('API not available, using mock data:', error)
        // Fallback to mock data
        return {
          activeLoads: 12,
          availableLoads: 8,
          completedToday: 5,
          revenue: 8420,
          fleetUtilization: 87,
          onTimeDelivery: 96,
          activeDrivers: 8,
          totalDrivers: 12
        }
      }
    }
  })

  const { data: recentLoads, isLoading: loadsLoading } = useQuery({
    queryKey: ['carrier-loads'],
    queryFn: async () => {
      try {
        return await loadsAPI.list()
      } catch (error) {
        console.warn('API not available, using mock data:', error)
        // Fallback to mock data
        return [
          { id: '1', customer: 'ABC Corp', pickup: 'Dallas, TX', delivery: 'Houston, TX', status: 'in_progress', rate: 2850 },
          { id: '2', customer: 'XYZ Inc', pickup: 'Austin, TX', delivery: 'San Antonio, TX', status: 'pending', rate: 1950 },
          { id: '3', customer: 'DEF Ltd', pickup: 'Fort Worth, TX', delivery: 'Dallas, TX', status: 'completed', rate: 1200 }
        ]
      }
    }
  })

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Handle refresh
  const handleRefresh = () => {
    window.location.reload()
  }

  // Mock driver data for Driver Status Overview
  const mockDrivers = [
    {
      id: '1',
      name: 'Mike Johnson',
      status: 'driving',
      location: 'I-35, Dallas',
      currentLoad: 'ABC Corp → Houston',
      hos: '8.5 hrs remaining',
      eta: '2:30 PM'
    },
    {
      id: '2', 
      name: 'Sarah Davis',
      status: 'on_break',
      location: 'Rest Area, Austin',
      currentLoad: 'XYZ Inc → San Antonio',
      hos: 'Break: 30 min',
      eta: '4:15 PM'
    },
    {
      id: '3',
      name: 'Robert Wilson',
      status: 'driving',
      location: 'Highway 290, Houston',
      currentLoad: 'DEF Ltd → Dallas',
      hos: '6.2 hrs remaining',
      eta: '6:45 PM'
    }
  ]

  // Show loading state
  if (statsLoading || loadsLoading) {
    return (
      <PageContainer title="Loading Dashboard">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <Loader size={32} style={{ animation: 'spin 1s linear infinite' }} />
          <span style={{ marginLeft: '12px', color: theme.colors.textSecondary }}>Loading dashboard...</span>
        </div>
      </PageContainer>
    )
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Header with Quick Actions */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
        padding: '20px',
        background: theme.colors.backgroundCard,
        borderRadius: '16px',
        border: `1px solid ${theme.colors.border}`
      }}>
        <div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: theme.colors.textPrimary,
            margin: '0 0 8px 0',
            background: `linear-gradient(135deg, ${theme.colors.textPrimary} 0%, ${theme.colors.textSecondary} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            CARRIER OPERATIONS DASHBOARD
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Globe size={18} color={theme.colors.textSecondary} />
              <select
                value={selectedTimezone}
                onChange={(e) => handleTimezoneChange(e.target.value)}
                style={{
                  background: theme.colors.background,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: '8px',
                  padding: '6px 12px',
                  fontSize: '14px',
                  color: theme.colors.textPrimary,
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  minWidth: '200px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = theme.colors.primary
                  e.currentTarget.style.boxShadow = `0 0 0 2px ${theme.colors.primary}20`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = theme.colors.border
                  e.currentTarget.style.boxShadow = 'none'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = theme.colors.primary
                  e.currentTarget.style.boxShadow = `0 0 0 2px ${theme.colors.primary}20`
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = theme.colors.border
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                {usTimeZones.map((tz) => (
                  <option 
                    key={tz.value} 
                    value={tz.value}
                    style={{
                      background: theme.name === 'dark' ? '#1e293b' : '#ffffff',
                      color: theme.name === 'dark' ? '#f8fafc' : '#1e293b',
                      padding: '8px',
                      fontSize: '14px'
                    }}
                  >
                    {tz.label}
                  </option>
                ))}
              </select>
            </div>
            <div style={{
              fontSize: '24px',
              fontWeight: '700',
              color: theme.colors.error,
              fontFamily: 'monospace',
              padding: '12px 20px',
              background: theme.colors.background,
              borderRadius: '12px',
              border: `1px solid ${theme.colors.border}`,
              minWidth: '180px',
              textAlign: 'center',
              boxShadow: `0 2px 8px ${theme.colors.error}20`
            }}>
              {currentTime.toLocaleTimeString('en-US', { 
                timeZone: selectedTimezone,
                hour12: true,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })}
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleRefresh}
            style={{
              padding: '12px 20px',
              background: 'transparent',
              border: `1px solid ${theme.colors.border}`,
              borderRadius: '12px',
              color: theme.colors.textSecondary,
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = theme.colors.backgroundHover
              e.currentTarget.style.color = theme.colors.textPrimary
              e.currentTarget.style.borderColor = theme.colors.primary
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = theme.colors.textSecondary
              e.currentTarget.style.borderColor = theme.colors.border
            }}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          
        </div>
      </div>

      {/* Key Metrics - All 6 Cards in Horizontal Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '24px'
      }}>
        <Card padding="24px" hover onClick={() => navigate('/loads')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                background: theme.colors.backgroundTertiary,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Activity size={28} color={theme.colors.textSecondary} />
              </div>
              <div>
                <p style={{ fontSize: '36px', fontWeight: 'bold', color: theme.colors.textPrimary, margin: 0, lineHeight: 1 }}>
                  <AnimatedCounter value={stats?.activeLoads || 0} />
                </p>
                <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: '4px 0 0 0' }}>
                  Active Loads
                </p>
              </div>
            </div>
            <ExternalLink size={18} color={theme.colors.textSecondary} style={{ opacity: 0.5 }} />
          </div>
        </Card>

        <Card padding="24px" hover onClick={() => navigate('/loads')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                background: theme.colors.backgroundTertiary,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Package size={28} color={theme.colors.textSecondary} />
              </div>
              <div>
                <p style={{ fontSize: '36px', fontWeight: 'bold', color: theme.colors.textPrimary, margin: 0, lineHeight: 1 }}>
                  <AnimatedCounter value={stats?.availableLoads || 0} />
                </p>
                <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: '4px 0 0 0' }}>
                  Available
                </p>
              </div>
            </div>
            <ExternalLink size={18} color={theme.colors.textSecondary} style={{ opacity: 0.5 }} />
          </div>
        </Card>

        <Card padding="24px">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              background: theme.colors.backgroundTertiary,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <DollarSign size={28} color={theme.colors.textSecondary} />
            </div>
            <div>
              <p style={{ fontSize: '36px', fontWeight: 'bold', color: theme.colors.success, margin: 0, lineHeight: 1 }}>
                <AnimatedCounter value={stats?.revenue || 0} prefix="$" />
              </p>
              <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: '4px 0 0 0' }}>
                Today's Revenue
              </p>
            </div>
          </div>
        </Card>

        <Card padding="24px">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              background: theme.colors.backgroundTertiary,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CheckCircle size={28} color={theme.colors.textSecondary} />
            </div>
            <div>
              <p style={{ fontSize: '36px', fontWeight: 'bold', color: theme.colors.success, margin: 0, lineHeight: 1 }}>
                {formatPercentage(stats?.onTimeDelivery)}
              </p>
              <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: '4px 0 0 0' }}>
                On-Time Rate
              </p>
            </div>
          </div>
        </Card>

        <Card padding="24px">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              background: theme.colors.backgroundTertiary,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Star size={28} color={theme.colors.textSecondary} />
            </div>
            <div>
              <p style={{ fontSize: '36px', fontWeight: 'bold', color: theme.colors.textPrimary, margin: 0, lineHeight: 1 }}>
                4.8★
              </p>
              <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: '4px 0 0 0' }}>
                Customer Rating
              </p>
            </div>
          </div>
        </Card>

        <Card padding="24px">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              background: theme.colors.backgroundTertiary,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AlertTriangle size={28} color={theme.colors.textSecondary} />
            </div>
            <div>
              <p style={{ fontSize: '36px', fontWeight: 'bold', color: theme.colors.warning, margin: 0, lineHeight: 1 }}>
                3
              </p>
              <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: '4px 0 0 0' }}>
                Active Alerts
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Feature Cards Row - All 3 cards horizontally aligned */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '24px',
        marginBottom: '24px'
      }}>
        {/* Schedule & Calendar */}
        <Card 
          title="Schedule & Calendar" 
          icon={<Calendar size={20} color={theme.colors.textSecondary} />}
          action={
            <button
              onClick={() => navigate('/calendar')}
              style={{
                padding: '8px 16px',
                background: 'transparent',
                color: theme.colors.textSecondary,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.colors.backgroundCardHover
                e.currentTarget.style.color = theme.colors.textPrimary
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = theme.colors.textSecondary
              }}
            >
              Open Calendar
              <ArrowRight size={14} />
            </button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              <div style={{ background: theme.colors.background, padding: '16px', borderRadius: '10px', border: `1px solid ${theme.colors.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Truck size={16} color={theme.colors.textSecondary} />
                  <span style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary }}>Today's Loads</span>
                </div>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: theme.colors.textPrimary, margin: 0 }}>8</p>
                <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: '4px 0 0 0' }}>Pickups & Deliveries</p>
              </div>
              <div style={{ background: theme.colors.background, padding: '16px', borderRadius: '10px', border: `1px solid ${theme.colors.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Wrench size={16} color={theme.colors.textSecondary} />
                  <span style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary }}>Maintenance</span>
                </div>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: theme.colors.textPrimary, margin: 0 }}>3</p>
                <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: '4px 0 0 0' }}>Scheduled Today</p>
              </div>
            </div>
            <div style={{ background: theme.colors.background, padding: '16px', borderRadius: '10px', border: `1px solid ${theme.colors.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Clock size={16} color={theme.colors.textSecondary} />
                <span style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary }}>Upcoming Events</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: theme.colors.textPrimary }}>Load Pickup - Dallas</span>
                  <span style={{ fontSize: '12px', color: theme.colors.textSecondary }}>9:00 AM</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: theme.colors.textPrimary }}>Delivery - Houston</span>
                  <span style={{ fontSize: '12px', color: theme.colors.textSecondary }}>2:30 PM</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: theme.colors.textPrimary }}>Maintenance Check</span>
                  <span style={{ fontSize: '12px', color: theme.colors.textSecondary }}>5:00 PM</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Business Intelligence */}
        <Card 
          title="Business Intelligence" 
          icon={<TrendingUp size={20} color={theme.colors.textSecondary} />}
          action={
            <button
              onClick={() => navigate('/analytics')}
              style={{
                padding: '8px 16px',
                background: 'transparent',
                color: theme.colors.textSecondary,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.colors.backgroundCardHover
                e.currentTarget.style.color = theme.colors.textPrimary
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = theme.colors.textSecondary
              }}
            >
              View Analytics
              <ArrowRight size={14} />
            </button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              <div style={{ background: theme.colors.background, padding: '16px', borderRadius: '10px', border: `1px solid ${theme.colors.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <TrendingUp size={16} color={theme.colors.textSecondary} />
                  <span style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary }}>Revenue Growth</span>
                </div>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: theme.colors.success, margin: 0 }}>+12.5%</p>
                <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: '4px 0 0 0' }}>vs last month</p>
              </div>
              <div style={{ background: theme.colors.background, padding: '16px', borderRadius: '10px', border: `1px solid ${theme.colors.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <DollarSign size={16} color={theme.colors.textSecondary} />
                  <span style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary }}>Avg Rate/Mile</span>
                </div>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: theme.colors.success, margin: 0 }}>$2.85</p>
                <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: '4px 0 0 0' }}>+$0.15 this week</p>
              </div>
            </div>
            <div style={{ background: theme.colors.background, padding: '16px', borderRadius: '10px', border: `1px solid ${theme.colors.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Users size={16} color={theme.colors.textSecondary} />
                <span style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary }}>Market Position</span>
              </div>
              <p style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary, margin: '0 0 4px 0' }}>Top 15%</p>
              <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: 0 }}>Regional performance ranking</p>
            </div>
          </div>
        </Card>

        {/* Messages & Communications */}
        <Card 
          title="Messages & Communications" 
          icon={<Bell size={20} color={theme.colors.textSecondary} />}
          action={
            <button
              onClick={() => navigate('/messages')}
              style={{
                padding: '8px 16px',
                background: 'transparent',
                color: theme.colors.textSecondary,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.colors.backgroundCardHover
                e.currentTarget.style.color = theme.colors.textPrimary
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = theme.colors.textSecondary
              }}
            >
              View All Messages
              <ArrowRight size={14} />
            </button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { 
                from: 'ACME Logistics', 
                subject: 'Load confirmation for #12345', 
                time: '10 min ago',
                unread: true,
                priority: 'normal'
              },
              { 
                from: 'Global Shipping Co.', 
                subject: 'Rate confirmation needed', 
                time: '1 hour ago',
                unread: true,
                priority: 'high'
              },
              { 
                from: 'Fleet Dispatch', 
                subject: 'Driver update: Mike Johnson', 
                time: '3 hours ago',
                unread: false,
                priority: 'normal'
              },
              { 
                from: 'Customer Support', 
                subject: 'Weekly performance report', 
                time: '1 day ago',
                unread: false,
                priority: 'normal'
              }
            ].map((message, idx) => (
              <div
                key={idx}
                onClick={() => navigate('/messages')}
                style={{
                  background: message.unread ? theme.colors.background : theme.colors.background,
                  padding: '16px',
                  borderRadius: '10px',
                  border: `1px solid ${theme.colors.border}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateX(4px)'
                  e.currentTarget.style.boxShadow = `0 4px 12px ${theme.colors.primary}20`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateX(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                {message.unread && (
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    width: '8px',
                    height: '8px',
                    background: theme.colors.primary,
                    borderRadius: '50%'
                  }}></div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ 
                      fontSize: '14px', 
                      fontWeight: message.unread ? '600' : '500', 
                      color: theme.colors.textPrimary 
                    }}>
                      {message.from}
                    </span>
                    {message.priority === 'high' && (
                      <span style={{
                        padding: '2px 6px',
                        background: theme.colors.error,
                        color: 'white',
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: '600'
                      }}>
                        URGENT
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '11px', color: theme.colors.textSecondary }}>
                    {message.time}
                  </span>
                </div>
                <p style={{ 
                  fontSize: '13px', 
                  color: theme.colors.textSecondary, 
                  margin: 0,
                  fontWeight: message.unread ? '500' : '400'
                }}>
                  {message.subject}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>




      {/* Financial Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginTop: '24px' }}>
        <Card 
          title="Financial Overview" 
          icon={<DollarSign size={20} color={theme.colors.textSecondary} />}
          action={
            <button
              onClick={() => navigate('/financial')}
              style={{
                padding: '8px 16px',
                background: 'transparent',
                color: theme.colors.textSecondary,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.colors.backgroundCardHover
                e.currentTarget.style.color = theme.colors.textPrimary
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = theme.colors.textSecondary
              }}
            >
              View Financials
              <ArrowRight size={14} />
            </button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: theme.colors.textSecondary }}>Today's Revenue</span>
              <span style={{ fontSize: '18px', fontWeight: 'bold', color: theme.colors.textPrimary }}>{formatCurrency(stats?.revenue)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: theme.colors.textSecondary }}>This Week</span>
              <span style={{ fontSize: '16px', fontWeight: '600', color: theme.colors.textPrimary }}>$28,450</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: theme.colors.textSecondary }}>This Month</span>
              <span style={{ fontSize: '16px', fontWeight: '600', color: theme.colors.textPrimary }}>$127,800</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: theme.colors.textSecondary }}>Avg. Rate/Mile</span>
              <span style={{ fontSize: '16px', fontWeight: '600', color: theme.colors.textPrimary }}>$2.45</span>
            </div>
            <div style={{ 
              height: '2px', 
              background: theme.colors.border,
              borderRadius: '1px',
              margin: '8px 0'
            }}></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: theme.colors.textSecondary }}>Profit Margin</span>
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: theme.colors.success }}>23.4%</span>
            </div>
          </div>
        </Card>

        <Card 
          title="Compliance Status" 
          icon={<CheckCircle size={20} color={theme.colors.textSecondary} />}
          action={
            <button
              onClick={() => navigate('/compliance')}
              style={{
                padding: '8px 16px',
                background: 'transparent',
                color: theme.colors.textSecondary,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.colors.backgroundCardHover
                e.currentTarget.style.color = theme.colors.textPrimary
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = theme.colors.textSecondary
              }}
            >
              View Details
              <ArrowRight size={14} />
            </button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div 
              onClick={() => navigate('/compliance')}
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                padding: '12px', 
                background: theme.colors.background, 
                borderRadius: '8px', 
                border: `1px solid ${theme.colors.border}`,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateX(4px)'
                e.currentTarget.style.boxShadow = `0 4px 12px ${theme.colors.primary}20`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateX(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={16} color={theme.colors.textSecondary} />
                <span style={{ fontSize: '14px', color: theme.colors.textPrimary }}>DOT Compliance</span>
              </div>
              <span style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary }}>Current</span>
            </div>
            
            <div 
              onClick={() => navigate('/compliance')}
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                padding: '12px', 
                background: theme.colors.background, 
                borderRadius: '8px', 
                border: `1px solid ${theme.colors.border}`,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateX(4px)'
                e.currentTarget.style.boxShadow = `0 4px 12px ${theme.colors.primary}20`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateX(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={16} color={theme.colors.textSecondary} />
                <span style={{ fontSize: '14px', color: theme.colors.textPrimary }}>Insurance</span>
              </div>
              <span style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary }}>Active</span>
            </div>
            
            <div 
              onClick={() => navigate('/compliance')}
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                padding: '12px', 
                background: theme.colors.background, 
                borderRadius: '8px', 
                border: `1px solid ${theme.colors.border}`,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateX(4px)'
                e.currentTarget.style.boxShadow = `0 4px 12px ${theme.colors.primary}20`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateX(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={16} color={theme.colors.textSecondary} />
                <span style={{ fontSize: '14px', color: theme.colors.textPrimary }}>Safety Score</span>
              </div>
              <span style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary }}>85.2</span>
            </div>
            
            <div 
              onClick={() => navigate('/compliance')}
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                padding: '12px', 
                background: theme.colors.background, 
                borderRadius: '8px', 
                border: `1px solid ${theme.colors.border}`,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateX(4px)'
                e.currentTarget.style.boxShadow = `0 4px 12px ${theme.colors.primary}20`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateX(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={16} color={theme.colors.textSecondary} />
                <span style={{ fontSize: '14px', color: theme.colors.textPrimary }}>Next Inspection</span>
              </div>
              <span style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary }}>Jan 15</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Enhanced Customer Rating System */}
      <Card 
        title="Customer Rating & Reviews" 
        icon={<Star size={20} color={theme.colors.textSecondary} />}
        action={
          <button
            onClick={() => navigate('/reviews')}
            style={{
              padding: '8px 16px',
              background: 'transparent',
              color: theme.colors.textSecondary,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.backgroundCardHover
              e.currentTarget.style.color = theme.colors.textPrimary
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = theme.colors.textSecondary
            }}
          >
            View All Reviews
            <ArrowRight size={14} />
          </button>
        }
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {/* Overall Rating */}
          <div style={{
            background: theme.colors.background,
            padding: '24px',
            borderRadius: '12px',
            border: `1px solid ${theme.colors.border}`,
            textAlign: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '12px' }}>
              <Star size={24} fill="#FFD700" color="#FFD700" />
              <span style={{ fontSize: '32px', fontWeight: 'bold', color: theme.colors.textPrimary }}>4.8</span>
              <span style={{ fontSize: '14px', color: theme.colors.textSecondary }}>/5.0</span>
            </div>
            <div style={{ fontSize: '14px', color: theme.colors.textSecondary, marginBottom: '8px' }}>
              Overall Rating
            </div>
            <div style={{ fontSize: '12px', color: theme.colors.success, fontWeight: '600' }}>
              ↗ +0.3 vs last month
            </div>
          </div>

          {/* Performance Metrics */}
          <div style={{
            background: theme.colors.background,
            padding: '24px',
            borderRadius: '12px',
            border: `1px solid ${theme.colors.border}`
          }}>
            <div style={{ fontSize: '16px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '16px' }}>
              Performance Metrics
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: theme.colors.textSecondary }}>On-Time Delivery</span>
                <span style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.success }}>94.2%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: theme.colors.textSecondary }}>Communication</span>
                <span style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.success }}>4.9★</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: theme.colors.textSecondary }}>Load Handling</span>
                <span style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.success }}>4.7★</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: theme.colors.textSecondary }}>Total Reviews</span>
                <span style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary }}>127</span>
              </div>
            </div>
          </div>

          {/* Recent Review */}
          <div style={{
            background: theme.colors.background,
            padding: '24px',
            borderRadius: '12px',
            border: `1px solid ${theme.colors.border}`
          }}>
            <div style={{ fontSize: '16px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '12px' }}>
              Recent Review
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <div style={{ display: 'flex', gap: '2px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={14} fill="#FFD700" color="#FFD700" />
                ))}
              </div>
              <span style={{ fontSize: '12px', color: theme.colors.textSecondary }}>by ACME Logistics</span>
            </div>
            <p style={{ fontSize: '13px', color: theme.colors.textPrimary, margin: '0 0 8px 0', lineHeight: '1.4' }}>
              "Excellent service! Always on time and great communication. Will definitely use again."
            </p>
            <div style={{ fontSize: '11px', color: theme.colors.textSecondary }}>
              2 days ago
            </div>
          </div>
        </div>
      </Card>

      {/* Enhanced Performance Trends */}
      <Card 
        title="Performance Trends" 
        icon={<Activity size={20} color={theme.colors.textSecondary} />}
        action={
          <button
            onClick={() => navigate('/analytics')}
            style={{
              padding: '8px 16px',
              background: 'transparent',
              color: theme.colors.textSecondary,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.backgroundCardHover
              e.currentTarget.style.color = theme.colors.textPrimary
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = theme.colors.textSecondary
            }}
          >
            View Full Analytics
            <ArrowRight size={14} />
          </button>
        }
      >
        <div style={{
          background: theme.colors.background,
          padding: '24px',
          borderRadius: '12px',
          border: `1px solid ${theme.colors.border}`,
          height: '400px',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Chart Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '4px' }}>
                Weekly Performance Overview
              </div>
              <div style={{ fontSize: '12px', color: theme.colors.textSecondary }}>
                Last 7 days performance metrics
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: theme.colors.success }}>94.2%</div>
                <div style={{ fontSize: '11px', color: theme.colors.textSecondary }}>On-Time</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: theme.colors.primary }}>127</div>
                <div style={{ fontSize: '11px', color: theme.colors.textSecondary }}>Loads</div>
              </div>
            </div>
          </div>

          {/* Chart Area */}
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'end',
            justifyContent: 'space-between',
            padding: '20px 0',
            position: 'relative'
          }}>
            {/* Chart bars with real mock data */}
            {[
              { day: 'Mon', onTime: 92, loads: 18, revenue: 2840 },
              { day: 'Tue', onTime: 88, loads: 22, revenue: 3150 },
              { day: 'Wed', onTime: 95, loads: 19, revenue: 2890 },
              { day: 'Thu', onTime: 97, loads: 25, revenue: 3850 },
              { day: 'Fri', onTime: 94, loads: 21, revenue: 3280 },
              { day: 'Sat', onTime: 89, loads: 12, revenue: 1920 },
              { day: 'Sun', onTime: 96, loads: 10, revenue: 1650 }
            ].map((data, index) => (
              <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                {/* Chart Bar */}
                <div style={{ position: 'relative', height: '180px', display: 'flex', alignItems: 'end' }}>
                  <div style={{
                    width: '32px',
                    height: `${data.onTime}%`,
                    background: `linear-gradient(to top, ${theme.colors.primary}, ${theme.colors.success})`,
                    borderRadius: '4px 4px 0 0',
                    position: 'relative',
                    animation: `growUp 1s ease-out ${index * 0.1}s both`,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)'
                    e.currentTarget.style.boxShadow = `0 4px 12px ${theme.colors.primary}40`
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}>
                    {/* Tooltip on hover */}
                    <div style={{
                      position: 'absolute',
                      bottom: '100%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: theme.colors.background,
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: `1px solid ${theme.colors.border}`,
                      fontSize: '11px',
                      color: theme.colors.textPrimary,
                      whiteSpace: 'nowrap',
                      opacity: 0,
                      pointerEvents: 'none',
                      transition: 'opacity 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '1'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '0'
                    }}>
                      {data.onTime}% on-time
                      <br />
                      {data.loads} loads
                      <br />
                      ${data.revenue.toLocaleString()}
                    </div>
                  </div>
                </div>
                
                {/* Day Label */}
                <div style={{ fontSize: '12px', color: theme.colors.textSecondary, fontWeight: '500' }}>
                  {data.day}
                </div>
                
                {/* Load Count */}
                <div style={{ fontSize: '10px', color: theme.colors.textSecondary }}>
                  {data.loads} loads
                </div>
              </div>
            ))}
          </div>

          {/* Chart Footer Stats */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 0 0 0',
            borderTop: `1px solid ${theme.colors.border}`
          }}>
            <div style={{ display: 'flex', gap: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', background: theme.colors.success, borderRadius: '2px' }}></div>
                <span style={{ fontSize: '12px', color: theme.colors.textSecondary }}>On-Time Delivery</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', background: theme.colors.primary, borderRadius: '2px' }}></div>
                <span style={{ fontSize: '12px', color: theme.colors.textSecondary }}>Total Loads</span>
              </div>
            </div>
            <div style={{ fontSize: '11px', color: theme.colors.textSecondary }}>
              Week over week: +3.2% improvement
            </div>
          </div>
        </div>
        
        {/* Enhanced CSS for animation */}
        <style>
          {`
            @keyframes growUp {
              from {
                height: 0%;
                opacity: 0;
                transform: translateY(20px);
              }
              to {
                height: var(--target-height);
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}
        </style>
      </Card>
    </div>
  )
}

export default CarrierDashboard