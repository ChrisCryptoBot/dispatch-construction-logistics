import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../../contexts/ThemeContext'
import { useQuery } from '@tanstack/react-query'
import { loadsAPI, carrierAPI } from '../../services/api'
import PageContainer from '../../components/PageContainer'
import Card from '../../components/Card'
import Logo from '../../components/ui/Logo'
import {
  LayoutDashboard, Package, Truck, Users, DollarSign, 
  TrendingUp, AlertTriangle, CheckCircle, Clock, MapPin,
  Activity, Zap, Star, Calendar, ArrowRight, Loader, Wrench, Globe
} from 'lucide-react'
import { formatNumber, formatCurrency, formatCompactCurrency, formatPercentage } from '../../utils/formatters'
import AnimatedCounter from '../../components/enhanced/AnimatedCounter'

const CarrierDashboard = () => {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const [selectedTimezone, setSelectedTimezone] = useState(
    localStorage.getItem('userTimezone') || Intl.DateTimeFormat().resolvedOptions().timeZone
  )
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
        return await loadsAPI.list({ limit: 4, sort: 'createdAt:desc' })
      } catch (error) {
        console.warn('API not available, using mock data:', error)
        // Fallback to mock data
        return [
          { id: 'LT-1234', material: 'Crushed Stone', driver: 'John Smith', status: 'in_progress', revenue: 1125, priority: 'high' },
          { id: 'LT-1235', material: 'Ready-Mix Concrete', driver: 'Sarah Johnson', status: 'completed', revenue: 1440, priority: 'medium' },
          { id: 'LT-1236', material: 'Steel Beams', driver: 'Mike Rodriguez', status: 'in_progress', revenue: 850, priority: 'low' },
          { id: 'LT-1237', material: 'Debris Removal', driver: 'David Chen', status: 'completed', revenue: 1900, priority: 'medium' }
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

  // Save timezone to localStorage when changed
  useEffect(() => {
    localStorage.setItem('userTimezone', selectedTimezone)
  }, [selectedTimezone])

  // US Timezones
  const usTimezones = [
    { value: 'America/New_York', label: 'Eastern (ET)', offset: 'UTC-5' },
    { value: 'America/Chicago', label: 'Central (CT)', offset: 'UTC-6' },
    { value: 'America/Denver', label: 'Mountain (MT)', offset: 'UTC-7' },
    { value: 'America/Phoenix', label: 'Arizona (MST)', offset: 'UTC-7' },
    { value: 'America/Los_Angeles', label: 'Pacific (PT)', offset: 'UTC-8' },
    { value: 'America/Anchorage', label: 'Alaska (AKT)', offset: 'UTC-9' },
    { value: 'Pacific/Honolulu', label: 'Hawaii (HST)', offset: 'UTC-10' }
  ]

  // Format time for selected timezone
  const formatTimeForTimezone = (date: Date, timezone: string) => {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }).format(date)
  }

  // Format date for selected timezone
  const formatDateForTimezone = (date: Date, timezone: string) => {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }).format(date)
  }

  // Mock data for features not yet implemented
  const activeDrivers = [
    { name: 'John Smith', status: 'driving', load: 'LT-1234', location: 'Dallas, TX', hours: '8.5/11' },
    { name: 'Sarah Johnson', status: 'on_break', load: 'LT-1235', location: 'Fort Worth, TX', hours: '7.0/11' },
    { name: 'Mike Rodriguez', status: 'driving', load: 'LT-1236', location: 'Austin, TX', hours: '6.5/11' }
  ]


  // Show loading state
  if (statsLoading || loadsLoading) {
    return (
      <PageContainer>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <Loader size={32} style={{ animation: 'spin 1s linear infinite' }} />
          <span style={{ marginLeft: '12px', color: theme.colors.textSecondary }}>Loading dashboard...</span>
        </div>
      </PageContainer>
    )
  }

  const getStatusColor = (status: string) => {
    const colors = {
      completed: theme.colors.success,
      in_progress: theme.colors.info,
      pending: theme.colors.warning,
      overdue: theme.colors.error,
      upcoming: theme.colors.warning,
      scheduled: theme.colors.info,
      driving: theme.colors.info,
      on_break: theme.colors.warning
    }
    return colors[status] || theme.colors.textSecondary
  }

  // Removed redundant header actions - Load Board and Quick Dispatch are in sidebar

  return (
    <div>
      <PageContainer title="">
      
      {/* Dashboard Header with Logo */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px',
        padding: '20px',
        background: `linear-gradient(135deg, ${theme.colors.backgroundCard} 0%, ${theme.colors.backgroundSecondary} 100%)`,
        borderRadius: '16px',
        border: `1px solid ${theme.colors.border}`,
        boxShadow: theme.shadow.subtle
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Logo size="lg" className="h-12" />
          <div>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: theme.colors.textPrimary,
              margin: '0 0 4px 0'
            }}>
              Superior One Logistics
            </h2>
            <p style={{
              fontSize: '14px',
              color: theme.colors.textSecondary,
              margin: 0
            }}>
              Carrier Command Center
            </p>
          </div>
        </div>
        
        {/* Quick Status Indicators */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', background: theme.colors.success, borderRadius: '50%' }}></div>
            <span style={{ fontSize: '12px', color: theme.colors.textSecondary, fontWeight: '500' }}>API 99.9%</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', background: theme.colors.info, borderRadius: '50%' }}></div>
            <span style={{ fontSize: '12px', color: theme.colors.textSecondary, fontWeight: '500' }}>ELD 98.2%</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', background: theme.colors.warning, borderRadius: '50%' }}></div>
            <span style={{ fontSize: '12px', color: theme.colors.textSecondary, fontWeight: '500' }}>3 Active Alerts</span>
          </div>
        </div>
      </div>

      {/* Main Content Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '32px',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: theme.colors.textPrimary,
            margin: '0 0 8px 0'
          }}>
            Operations Dashboard
          </h1>
          <p style={{
            fontSize: '15px',
            color: theme.colors.textSecondary,
            margin: 0
          }}>
            Real-time operations overview and key performance metrics
          </p>
        </div>

        {/* Timezone Clock */}
        <Card padding="20px" style={{ minWidth: '280px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <Globe size={18} color={theme.colors.primary} />
            <select
              value={selectedTimezone}
              onChange={(e) => setSelectedTimezone(e.target.value)}
              style={{
                flex: 1,
                padding: '6px 10px',
                background: theme.colors.backgroundSecondary,
                color: theme.colors.textPrimary,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              {usTimezones.map(tz => (
                <option key={tz.value} value={tz.value}>
                  {tz.label} - {tz.offset}
                </option>
              ))}
            </select>
          </div>
          <div style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: theme.colors.primary,
            letterSpacing: '0.5px'
          }}>
            {formatTimeForTimezone(currentTime, selectedTimezone)}
          </div>
          <div style={{
            fontSize: '13px',
            color: theme.colors.textSecondary,
            marginTop: '4px'
          }}>
            {formatDateForTimezone(currentTime, selectedTimezone)}
          </div>
        </Card>
      </div>

      {/* Key Metrics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '24px'
      }}>
        <Card padding="24px" hover onClick={() => navigate('/loads')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              background: `${theme.colors.info}20`,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Activity size={28} color={theme.colors.info} />
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
        </Card>

        <Card padding="24px" hover onClick={() => navigate('/loads')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              background: `${theme.colors.success}20`,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Package size={28} color={theme.colors.success} />
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
        </Card>

        <Card padding="24px">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              background: `${theme.colors.success}20`,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <DollarSign size={28} color={theme.colors.success} />
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
              background: `${theme.colors.success}20`,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CheckCircle size={28} color={theme.colors.success} />
            </div>
            <div>
              <p style={{ fontSize: '36px', fontWeight: 'bold', color: theme.colors.textPrimary, margin: 0, lineHeight: 1 }}>
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
              background: `${theme.colors.info}20`,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Star size={28} color={theme.colors.info} />
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
              background: `${theme.colors.warning}20`,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AlertTriangle size={28} color={theme.colors.warning} />
            </div>
            <div>
              <p style={{ fontSize: '36px', fontWeight: 'bold', color: theme.colors.textPrimary, margin: 0, lineHeight: 1 }}>
                3
              </p>
              <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: '4px 0 0 0' }}>
                Active Alerts
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
        gap: '24px',
        marginBottom: '24px'
      }}>
        {/* Calendar Quick Access */}
        <Card 
          title="Schedule & Calendar" 
          icon={<Calendar size={20} color={theme.colors.primary} />}
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
                  <Truck size={16} color={theme.colors.primary} />
                  <span style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary }}>Today's Loads</span>
                </div>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: theme.colors.primary, margin: 0 }}>8</p>
                <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: '4px 0 0 0' }}>Pickups & Deliveries</p>
              </div>
              <div style={{ background: theme.colors.background, padding: '16px', borderRadius: '10px', border: `1px solid ${theme.colors.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Wrench size={16} color={theme.colors.warning} />
                  <span style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary }}>Maintenance</span>
                </div>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: theme.colors.warning, margin: 0 }}>3</p>
                <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: '4px 0 0 0' }}>Scheduled Today</p>
              </div>
            </div>
            <div style={{ background: theme.colors.background, padding: '16px', borderRadius: '10px', border: `1px solid ${theme.colors.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Clock size={16} color={theme.colors.info} />
                <span style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary }}>Upcoming Events</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: theme.colors.textPrimary }}>Load Pickup - Dallas</span>
                  <span style={{ fontSize: '12px', color: theme.colors.textSecondary }}>9:00 AM</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: theme.colors.textPrimary }}>Oil Change - Truck #2</span>
                  <span style={{ fontSize: '12px', color: theme.colors.textSecondary }}>11:00 AM</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: theme.colors.textPrimary }}>Load Delivery - Houston</span>
                  <span style={{ fontSize: '12px', color: theme.colors.textSecondary }}>2:30 PM</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
        {/* Business Intelligence */}
        <Card 
          title="Business Intelligence" 
          icon={<TrendingUp size={20} color={theme.colors.primary} />}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              <div style={{ background: theme.colors.background, padding: '16px', borderRadius: '10px', border: `1px solid ${theme.colors.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <TrendingUp size={16} color={theme.colors.success} />
                  <span style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary }}>Revenue Growth</span>
                </div>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: theme.colors.success, margin: 0 }}>+12.5%</p>
                <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: '4px 0 0 0' }}>vs last month</p>
              </div>
              <div style={{ background: theme.colors.background, padding: '16px', borderRadius: '10px', border: `1px solid ${theme.colors.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <DollarSign size={16} color={theme.colors.info} />
                  <span style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary }}>Avg Rate/Mile</span>
                </div>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: theme.colors.info, margin: 0 }}>$2.85</p>
                <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: '4px 0 0 0' }}>+$0.15 this week</p>
              </div>
            </div>
            <div style={{ background: theme.colors.background, padding: '16px', borderRadius: '10px', border: `1px solid ${theme.colors.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Users size={16} color={theme.colors.warning} />
                <span style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary }}>Market Position</span>
              </div>
              <p style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.warning, margin: '0 0 4px 0' }}>Top 15%</p>
              <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: '0 0 12px 0' }}>In your region for on-time delivery</p>
              
              <div style={{ borderTop: `1px solid ${theme.colors.border}`, paddingTop: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <TrendingUp size={14} color={theme.colors.success} />
                  <span style={{ fontSize: '13px', fontWeight: '600', color: theme.colors.textPrimary }}>Rate Competitiveness</span>
                </div>
                <p style={{ fontSize: '16px', fontWeight: '600', color: theme.colors.success, margin: '0 0 4px 0' }}>+5.2%</p>
                <p style={{ fontSize: '11px', color: theme.colors.textSecondary, margin: '0 0 12px 0' }}>Above market average for similar lanes</p>
                
                <div style={{ borderTop: `1px solid ${theme.colors.border}`, paddingTop: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <DollarSign size={14} color={theme.colors.info} />
                    <span style={{ fontSize: '13px', fontWeight: '600', color: theme.colors.textPrimary }}>Profit Margin</span>
                  </div>
                  <p style={{ fontSize: '16px', fontWeight: '600', color: theme.colors.info, margin: '0 0 4px 0' }}>18.7%</p>
                  <p style={{ fontSize: '11px', color: theme.colors.textSecondary, margin: 0 }}>Industry benchmark: 12-15%</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Operational Alerts */}
        <Card 
          title="Operational Alerts" 
          icon={<AlertTriangle size={20} color={theme.colors.warning} />}
          action={
            <button
              onClick={() => navigate('/fleet')} // Redirects to Fleet Management alerts
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
              View All
              <ArrowRight size={14} />
            </button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { 
                type: 'urgent', 
                title: 'DOT Inspection Due', 
                description: 'Truck #2 inspection expires in 3 days', 
                time: '2 hours ago',
                icon: <AlertTriangle size={16} color={theme.colors.error} />
              },
              { 
                type: 'warning', 
                title: 'Fuel Surcharge Alert', 
                description: 'Diesel prices increased 8% this week', 
                time: '4 hours ago',
                icon: <TrendingUp size={16} color={theme.colors.warning} />
              },
              { 
                type: 'info', 
                title: 'New Load Available', 
                description: 'Hot load from Dallas to Houston - $2,850', 
                time: '6 hours ago',
                icon: <Package size={16} color={theme.colors.info} />
              },
              { 
                type: 'success', 
                title: 'Driver Verified', 
                description: 'John Smith completed background check', 
                time: '1 day ago',
                icon: <CheckCircle size={16} color={theme.colors.success} />
              }
            ].map((alert, idx) => (
              <div
                key={idx}
                style={{
                  background: theme.colors.background,
                  padding: '16px',
                  borderRadius: '10px',
                  border: `1px solid ${
                    alert.type === 'urgent' ? theme.colors.error :
                    alert.type === 'warning' ? theme.colors.warning :
                    alert.type === 'info' ? theme.colors.info :
                    theme.colors.success
                  }`,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateX(4px)'
                  e.currentTarget.style.boxShadow = `0 4px 12px ${
                    alert.type === 'urgent' ? `${theme.colors.error}20` :
                    alert.type === 'warning' ? `${theme.colors.warning}20` :
                    alert.type === 'info' ? `${theme.colors.info}20` :
                    `${theme.colors.success}20`
                  }`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateX(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  background: `${
                    alert.type === 'urgent' ? `${theme.colors.error}20` :
                    alert.type === 'warning' ? `${theme.colors.warning}20` :
                    alert.type === 'info' ? `${theme.colors.info}20` :
                    `${theme.colors.success}20`
                  }`,
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {alert.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, margin: 0 }}>
                      {alert.title}
                    </h4>
                    {alert.type === 'urgent' && (
                      <span style={{
                        padding: '2px 6px',
                        background: `${theme.colors.error}20`,
                        color: theme.colors.error,
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: '600',
                        textTransform: 'uppercase'
                      }}>
                        URGENT
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '13px', color: theme.colors.textSecondary, margin: '0 0 4px 0' }}>
                    {alert.description}
                  </p>
                  <p style={{ fontSize: '11px', color: theme.colors.textSecondary, margin: 0 }}>
                    {alert.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Performance Analytics */}
      <Card 
        title="Performance Analytics" 
        icon={<TrendingUp size={20} color={theme.colors.primary} />}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div style={{
            background: theme.colors.background,
            padding: '20px',
            borderRadius: '10px',
            border: `1px solid ${theme.colors.border}`,
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: theme.colors.success, marginBottom: '8px' }}>
              +12.5%
            </div>
            <div style={{ fontSize: '13px', color: theme.colors.textSecondary }}>
              Revenue Growth
            </div>
            <div style={{ fontSize: '11px', color: theme.colors.success, marginTop: '4px' }}>
              ↗ +2.1% vs last month
            </div>
          </div>
          
          <div style={{
            background: theme.colors.background,
            padding: '20px',
            borderRadius: '10px',
            border: `1px solid ${theme.colors.border}`,
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: theme.colors.info, marginBottom: '8px' }}>
              94.2%
            </div>
            <div style={{ fontSize: '13px', color: theme.colors.textSecondary }}>
              On-Time Rate
            </div>
            <div style={{ fontSize: '11px', color: theme.colors.success, marginTop: '4px' }}>
              ↗ +1.8% vs last month
            </div>
          </div>
          
          <div style={{
            background: theme.colors.background,
            padding: '20px',
            borderRadius: '10px',
            border: `1px solid ${theme.colors.border}`,
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: theme.colors.warning, marginBottom: '8px' }}>
              87%
            </div>
            <div style={{ fontSize: '13px', color: theme.colors.textSecondary }}>
              Fleet Utilization
            </div>
            <div style={{ fontSize: '11px', color: theme.colors.warning, marginTop: '4px' }}>
              ↘ -3.2% vs last month
            </div>
          </div>
          
          <div style={{
            background: theme.colors.background,
            padding: '20px',
            borderRadius: '10px',
            border: `1px solid ${theme.colors.border}`,
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: theme.colors.primary, marginBottom: '8px' }}>
              4.8★
            </div>
            <div style={{ fontSize: '13px', color: theme.colors.textSecondary }}>
              Customer Rating
            </div>
            <div style={{ fontSize: '11px', color: theme.colors.success, marginTop: '4px' }}>
              ↗ +0.3 vs last month
            </div>
          </div>
        </div>
      </Card>

      {/* Financial Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginTop: '24px' }}>
        <Card 
          title="Financial Overview" 
          icon={<DollarSign size={20} color={theme.colors.success} />}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: theme.colors.textSecondary }}>Today's Revenue</span>
              <span style={{ fontSize: '18px', fontWeight: 'bold', color: theme.colors.success }}>{formatCurrency(stats?.revenue)}</span>
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
              <span style={{ fontSize: '16px', fontWeight: '600', color: theme.colors.info }}>$2.45</span>
            </div>
            <div style={{ 
              height: '2px', 
              background: `linear-gradient(90deg, ${theme.colors.success} 0%, ${theme.colors.primary} 100%)`,
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
          icon={<CheckCircle size={20} color={theme.colors.success} />}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: theme.colors.background, borderRadius: '8px', border: `1px solid ${theme.colors.success}40` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={16} color={theme.colors.success} />
                <span style={{ fontSize: '14px', color: theme.colors.textPrimary }}>DOT Compliance</span>
              </div>
              <span style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.success }}>Current</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: theme.colors.background, borderRadius: '8px', border: `1px solid ${theme.colors.success}40` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={16} color={theme.colors.success} />
                <span style={{ fontSize: '14px', color: theme.colors.textPrimary }}>Insurance</span>
              </div>
              <span style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.success }}>Active</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: theme.colors.background, borderRadius: '8px', border: `1px solid ${theme.colors.warning}40` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={16} color={theme.colors.warning} />
                <span style={{ fontSize: '14px', color: theme.colors.textPrimary }}>Safety Score</span>
              </div>
              <span style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.warning }}>85.2</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: theme.colors.background, borderRadius: '8px', border: `1px solid ${theme.colors.info}40` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={16} color={theme.colors.info} />
                <span style={{ fontSize: '14px', color: theme.colors.textPrimary }}>Next Inspection</span>
              </div>
              <span style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.info }}>Jan 15</span>
            </div>
          </div>
        </Card>
      </div>
      </PageContainer>
    </div>
  )
}

export default CarrierDashboard

