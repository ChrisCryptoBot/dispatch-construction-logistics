import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../../contexts/ThemeContext'
import { customerAPI } from '../../services/api'
import PageContainer from '../../components/PageContainer'
import Card from '../../components/Card'
import {
  Package, TrendingUp, Clock, CheckCircle, AlertCircle, Truck, DollarSign, 
  MapPin, Plus, Eye, Loader, Calendar, ArrowRight, Users, Target, Award,
  TrendingDown, Activity, FileText, Bell, Navigation, Building, Wrench, Globe
} from 'lucide-react'
import { formatCurrency, formatNumber, formatCompactCurrency, formatPercentage } from '../../utils/formatters'

const CustomerDashboard = () => {
  const { theme } = useTheme()
  const navigate = useNavigate()
  
  // Timezone management (matching carrier dashboard)
  const [selectedTimezone, setSelectedTimezone] = useState(
    localStorage.getItem('userTimezone') || Intl.DateTimeFormat().resolvedOptions().timeZone
  )
  const [currentTime, setCurrentTime] = useState(new Date())

  const [stats, setStats] = useState({
    activeLoads: 0,
    completedThisMonth: 0,
    totalSpend: 0,
    avgDeliveryTime: 0,
    // Enhanced stats
    postedLoads: 0,
    assignedLoads: 0,
    inTransitLoads: 0,
    deliveredToday: 0,
    spendToday: 0,
    spendThisWeek: 0,
    avgCostPerLoad: 0,
    avgCostPerTon: 0,
    onTimeDeliveryRate: 0,
    totalCarriers: 0,
    activeCarriers: 0,
    avgBidsPerLoad: 0,
    carrierRatingAvg: 0,
    costSavings: 0,
    pendingBids: 0,
    jobSitesActive: 0
  })
  const [recentLoads, setRecentLoads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Save timezone preference
  useEffect(() => {
    localStorage.setItem('userTimezone', selectedTimezone)
  }, [selectedTimezone])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Please log in to view your dashboard')
        return
      }

      try {
        const statsResponse = await customerAPI.getDashboardStats()
        const loadsResponse = await customerAPI.getLoads()
        
        setStats(statsResponse.stats)
        setRecentLoads(loadsResponse.loads || [])
        
      } catch (apiError) {
        console.log('⚠️ API call failed, using mock data:', apiError)
        
        // Enhanced mock data
        setStats({
          activeLoads: 8,
          completedThisMonth: 47,
          totalSpend: 128450,
          avgDeliveryTime: 3.2,
          postedLoads: 3,
          assignedLoads: 2,
          inTransitLoads: 3,
          deliveredToday: 5,
          spendToday: 12850,
          spendThisWeek: 42300,
          avgCostPerLoad: 1875,
          avgCostPerTon: 68.50,
          onTimeDeliveryRate: 94.2,
          totalCarriers: 24,
          activeCarriers: 8,
          avgBidsPerLoad: 5.3,
          carrierRatingAvg: 4.6,
          costSavings: 8420,
          pendingBids: 7,
          jobSitesActive: 3
        })
        
        setRecentLoads([
          {
            id: 'load-001',
            commodity: 'Crushed Limestone',
            status: 'IN_TRANSIT',
            units: 18.5,
            rateMode: 'PER_TON',
            carrier: { name: 'Superior Carriers Inc' },
            origin: { siteName: 'Main Quarry', address: '1234 Rock Rd, Austin, TX' },
            destination: { siteName: 'Downtown Project', address: '789 Congress Ave, Austin, TX' },
            miles: 12.3,
            eta: '2:45 PM',
            bidCount: 0
          },
          {
            id: 'load-002',
            commodity: 'Concrete Mix',
            status: 'POSTED',
            units: 25.0,
            rateMode: 'PER_TON',
            carrier: { name: 'Unassigned' },
            origin: { siteName: 'North Plant', address: '456 Industrial Blvd, Round Rock, TX' },
            destination: { siteName: 'Highway 290 Bridge', address: 'Hwy 290 & Oak Hill, Austin, TX' },
            miles: 18.7,
            scheduledFor: 'Tomorrow 8:00 AM',
            bidCount: 3
          },
          {
            id: 'load-003',
            commodity: 'Gravel Base',
            status: 'COMPLETED',
            units: 22.3,
            rateMode: 'PER_TON',
            carrier: { name: 'Lone Star Trucking' },
            origin: { siteName: 'South Quarry', address: '789 Quarry Ln, Buda, TX' },
            destination: { siteName: 'Airport Expansion', address: 'Austin-Bergstrom Airport, Austin, TX' },
            miles: 15.2,
            completedAt: '11:30 AM',
            bidCount: 0
          }
        ])
      }
      
    } catch (err: any) {
      console.error('Error loading dashboard data:', err)
      setError(err.message || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  // US Timezones (same as carrier)
  const usTimezones = [
    { value: 'America/New_York', label: 'Eastern (ET)', offset: 'UTC-5' },
    { value: 'America/Chicago', label: 'Central (CT)', offset: 'UTC-6' },
    { value: 'America/Denver', label: 'Mountain (MT)', offset: 'UTC-7' },
    { value: 'America/Phoenix', label: 'Arizona (MST)', offset: 'UTC-7' },
    { value: 'America/Los_Angeles', label: 'Pacific (PT)', offset: 'UTC-8' },
    { value: 'America/Anchorage', label: 'Alaska (AKT)', offset: 'UTC-9' },
    { value: 'Pacific/Honolulu', label: 'Hawaii (HST)', offset: 'UTC-10' }
  ]

  const formatTimeForTimezone = (date: Date, timezone: string) => {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }).format(date)
  }

  const formatDateForTimezone = (date: Date, timezone: string) => {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date)
  }

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'POSTED': return theme.colors.info
      case 'ASSIGNED': return theme.colors.warning
      case 'ACCEPTED': return theme.colors.success
      case 'IN_TRANSIT': return theme.colors.primary
      case 'DELIVERED': return theme.colors.success
      case 'COMPLETED': return theme.colors.success
      case 'CANCELLED': return theme.colors.error
      default: return theme.colors.textSecondary
    }
  }

  if (loading) {
    return (
      <PageContainer title="Customer Dashboard">
        <Card padding="60px" style={{ textAlign: 'center' }}>
          <Loader size={48} className="animate-spin" style={{ color: theme.colors.primary, margin: '0 auto 20px' }} />
          <p style={{ color: theme.colors.textSecondary }}>Loading dashboard...</p>
        </Card>
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer title="Customer Dashboard">
        <Card padding="40px" style={{ textAlign: 'center' }}>
          <AlertCircle size={48} style={{ color: theme.colors.error, margin: '0 auto 20px' }} />
          <p style={{ color: theme.colors.error, fontSize: '16px', marginBottom: '16px' }}>{error}</p>
                <button
                  onClick={loadDashboardData}
                  style={{
                    padding: '12px 24px',
              backgroundColor: theme.colors.primary,
                    color: 'white',
              border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Retry
                </button>
        </Card>
      </PageContainer>
    )
  }

  return (
    <PageContainer title="">
      {/* Header with Timezone Clock */}
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
            Customer Command Center
          </h1>
          <p style={{
            fontSize: '15px',
            color: theme.colors.textSecondary,
            margin: 0
          }}>
            Logistics management and load tracking
          </p>
        </div>

        {/* Timezone Clock */}
        <div style={{
          padding: '16px 20px',
          background: theme.colors.backgroundCard,
          border: `1px solid ${theme.colors.border}`,
          borderRadius: '12px',
          minWidth: '280px'
        }}>
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
        </div>
      </div>

      {/* Key Metrics Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <Card padding="20px">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: `${theme.colors.primary}20`,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Package size={24} color={theme.colors.primary} />
            </div>
            <span style={{ fontSize: '13px', fontWeight: '600', color: theme.colors.textSecondary }}>ACTIVE LOADS</span>
          </div>
          <p style={{ fontSize: '36px', fontWeight: 'bold', color: theme.colors.textPrimary, margin: '0 0 4px 0' }}>
                {stats.activeLoads}
              </p>
          <p style={{ fontSize: '12px', color: theme.colors.textTertiary }}>
            {stats.postedLoads} posted • {stats.inTransitLoads} in transit
              </p>
        </Card>

        <Card padding="20px">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: `${theme.colors.success}20`,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CheckCircle size={24} color={theme.colors.success} />
            </div>
            <span style={{ fontSize: '13px', fontWeight: '600', color: theme.colors.textSecondary }}>COMPLETED</span>
          </div>
          <p style={{ fontSize: '36px', fontWeight: 'bold', color: theme.colors.textPrimary, margin: '0 0 4px 0' }}>
                {stats.completedThisMonth}
              </p>
          <p style={{ fontSize: '12px', color: theme.colors.textTertiary }}>
            This month • {stats.deliveredToday} today
          </p>
        </Card>

        <Card padding="20px">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: `${theme.colors.warning}20`,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <DollarSign size={24} color={theme.colors.warning} />
            </div>
            <span style={{ fontSize: '13px', fontWeight: '600', color: theme.colors.textSecondary }}>MONTH SPEND</span>
          </div>
          <p style={{ fontSize: '36px', fontWeight: 'bold', color: theme.colors.textPrimary, margin: '0 0 4px 0' }}>
            {formatCompactCurrency(stats?.totalSpend)}
          </p>
          <p style={{ fontSize: '12px', color: theme.colors.textTertiary }}>
            {formatCompactCurrency(stats?.spendToday)} today • {formatCompactCurrency(stats?.spendThisWeek)} this week
          </p>
        </Card>

        <Card padding="20px">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: `${theme.colors.info}20`,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Clock size={24} color={theme.colors.info} />
            </div>
            <span style={{ fontSize: '13px', fontWeight: '600', color: theme.colors.textSecondary }}>AVG DELIVERY</span>
          </div>
          <p style={{ fontSize: '36px', fontWeight: 'bold', color: theme.colors.textPrimary, margin: '0 0 4px 0' }}>
            {formatNumber(stats?.avgDeliveryTime, '0')}h
          </p>
          <p style={{ fontSize: '12px', color: theme.colors.textTertiary }}>
            On-time rate: {formatPercentage(stats?.onTimeDeliveryRate)}
          </p>
        </Card>

        <Card padding="20px">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: `${theme.colors.success}20`,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <TrendingDown size={24} color={theme.colors.success} />
            </div>
            <span style={{ fontSize: '13px', fontWeight: '600', color: theme.colors.textSecondary }}>COST SAVINGS</span>
          </div>
          <p style={{ fontSize: '36px', fontWeight: 'bold', color: theme.colors.success, margin: '0 0 4px 0' }}>
            {formatCompactCurrency(stats?.costSavings)}
          </p>
          <p style={{ fontSize: '12px', color: theme.colors.textTertiary }}>
            vs direct carrier rates
          </p>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '24px',
        marginBottom: '24px'
      }}>
        
        {/* Schedule & Calendar */}
        <Card 
          title="Schedule & Calendar" 
          icon={<Calendar size={20} color={theme.colors.primary} />}
          action={
            <button
              onClick={() => navigate('/customer/calendar')}
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
                e.currentTarget.style.backgroundColor = theme.colors.backgroundHover
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
                  <Package size={16} color={theme.colors.primary} />
                  <span style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary }}>Today's Loads</span>
                </div>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: theme.colors.primary, margin: 0 }}>5</p>
                <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: '4px 0 0 0' }}>Pickups & Deliveries</p>
              </div>
              <div style={{ background: theme.colors.background, padding: '16px', borderRadius: '10px', border: `1px solid ${theme.colors.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <MapPin size={16} color={theme.colors.warning} />
                  <span style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary }}>Job Sites</span>
                </div>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: theme.colors.warning, margin: 0 }}>{stats.jobSitesActive}</p>
                <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: '4px 0 0 0' }}>Active Today</p>
              </div>
            </div>
            <div style={{ background: theme.colors.background, padding: '16px', borderRadius: '10px', border: `1px solid ${theme.colors.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Clock size={16} color={theme.colors.info} />
                <span style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary }}>Upcoming Events</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: theme.colors.textPrimary }}>Limestone Delivery - Downtown Project</span>
                  <span style={{ fontSize: '12px', color: theme.colors.textSecondary }}>9:00 AM</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: theme.colors.textPrimary }}>Concrete Pickup - Main Quarry</span>
                  <span style={{ fontSize: '12px', color: theme.colors.textSecondary }}>11:30 AM</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: theme.colors.textPrimary }}>Site Inspection - West Side Project</span>
                  <span style={{ fontSize: '12px', color: theme.colors.textSecondary }}>3:00 PM</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Spending Analytics */}
        <Card 
          title="Spending & Cost Analysis" 
          icon={<DollarSign size={20} color={theme.colors.primary} />}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              <div style={{ background: theme.colors.background, padding: '16px', borderRadius: '10px', border: `1px solid ${theme.colors.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <DollarSign size={16} color={theme.colors.info} />
                  <span style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary }}>Avg Per Load</span>
                </div>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: theme.colors.info, margin: 0 }}>
                  {formatCurrency(stats?.avgCostPerLoad)}
                </p>
              </div>
              <div style={{ background: theme.colors.background, padding: '16px', borderRadius: '10px', border: `1px solid ${theme.colors.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Activity size={16} color={theme.colors.warning} />
                  <span style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary }}>Avg Per Ton</span>
                </div>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: theme.colors.warning, margin: 0 }}>
                  {formatCurrency(stats?.avgCostPerTon)}
                </p>
              </div>
            </div>
            <div style={{ background: `${theme.colors.success}10`, padding: '16px', borderRadius: '10px', border: `1px solid ${theme.colors.success}30` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <TrendingDown size={16} color={theme.colors.success} />
                    <span style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary }}>Cost Savings</span>
                  </div>
                  <p style={{ fontSize: '28px', fontWeight: 'bold', color: theme.colors.success, margin: 0 }}>
                    {formatCurrency(stats?.costSavings)}
                  </p>
                  <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: '4px 0 0 0' }}>
                    vs direct carrier rates
                  </p>
                </div>
                <Target size={40} color={theme.colors.success} style={{ opacity: 0.3 }} />
              </div>
            </div>
          </div>
        </Card>

        {/* Carrier Network */}
        <Card 
          title="Carrier Network" 
          icon={<Truck size={20} color={theme.colors.primary} />}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              <div style={{ background: theme.colors.background, padding: '16px', borderRadius: '10px', border: `1px solid ${theme.colors.border}` }}>
                <span style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textSecondary, display: 'block', marginBottom: '8px' }}>Total Carriers</span>
                <p style={{ fontSize: '28px', fontWeight: 'bold', color: theme.colors.textPrimary, margin: 0 }}>
                  {stats.totalCarriers}
                </p>
              </div>
              <div style={{ background: theme.colors.background, padding: '16px', borderRadius: '10px', border: `1px solid ${theme.colors.border}` }}>
                <span style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textSecondary, display: 'block', marginBottom: '8px' }}>Active Now</span>
                <p style={{ fontSize: '28px', fontWeight: 'bold', color: theme.colors.success, margin: 0 }}>
                  {stats.activeCarriers}
                </p>
              </div>
            </div>
            <div style={{ background: theme.colors.background, padding: '16px', borderRadius: '10px', border: `1px solid ${theme.colors.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary }}>Avg Carrier Rating</span>
                <Award size={18} color={theme.colors.warning} />
              </div>
              <p style={{ fontSize: '32px', fontWeight: 'bold', color: theme.colors.warning, margin: '0 0 8px 0' }}>
                {formatNumber(stats?.carrierRatingAvg, '0')}/5.0
              </p>
              <p style={{ fontSize: '12px', color: theme.colors.textSecondary }}>
                Avg {formatNumber(stats?.avgBidsPerLoad, '0')} bids per load
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Load Activity & Bidding */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '24px',
        marginBottom: '24px'
      }}>
        
        {/* Load Status Overview */}
        <Card 
          title="Load Status Overview" 
          subtitle="Current load distribution across statuses"
          icon={<Activity size={20} color={theme.colors.primary} />}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px',
              background: `${theme.colors.info}10`,
              borderRadius: '8px',
              border: `1px solid ${theme.colors.info}30`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Bell size={20} color={theme.colors.info} />
                <span style={{ fontSize: '15px', fontWeight: '600', color: theme.colors.textPrimary }}>Posted (Awaiting Bids)</span>
              </div>
              <span style={{ fontSize: '24px', fontWeight: 'bold', color: theme.colors.info }}>
                {stats.postedLoads}
              </span>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px',
              background: `${theme.colors.warning}10`,
              borderRadius: '8px',
              border: `1px solid ${theme.colors.warning}30`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <FileText size={20} color={theme.colors.warning} />
                <span style={{ fontSize: '15px', fontWeight: '600', color: theme.colors.textPrimary }}>Assigned (Rate Con Pending)</span>
              </div>
              <span style={{ fontSize: '24px', fontWeight: 'bold', color: theme.colors.warning }}>
                {stats.assignedLoads}
              </span>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px',
              background: `${theme.colors.primary}10`,
              borderRadius: '8px',
              border: `1px solid ${theme.colors.primary}30`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Navigation size={20} color={theme.colors.primary} />
                <span style={{ fontSize: '15px', fontWeight: '600', color: theme.colors.textPrimary }}>In Transit</span>
              </div>
              <span style={{ fontSize: '24px', fontWeight: 'bold', color: theme.colors.primary }}>
                {stats.inTransitLoads}
              </span>
            </div>
          </div>
        </Card>

        {/* Bidding Activity */}
        <Card 
          title="Bidding Activity" 
          subtitle="Real-time carrier bid status"
          icon={<Users size={20} color={theme.colors.primary} />}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              padding: '20px',
              background: `${theme.colors.warning}10`,
              borderRadius: '10px',
              border: `1px solid ${theme.colors.warning}30`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textSecondary, display: 'block', marginBottom: '8px' }}>
                    PENDING BIDS
                  </span>
                  <p style={{ fontSize: '40px', fontWeight: 'bold', color: theme.colors.warning, margin: 0 }}>
                    {stats.pendingBids}
                  </p>
                  <p style={{ fontSize: '13px', color: theme.colors.textSecondary, margin: '4px 0 0 0' }}>
                    Awaiting your review
                  </p>
                </div>
                <AlertCircle size={48} color={theme.colors.warning} style={{ opacity: 0.3 }} />
              </div>
              {stats.pendingBids > 0 && (
                <button
                  onClick={() => navigate('/customer/loads')}
                  style={{
                    width: '100%',
                    marginTop: '16px',
                    padding: '10px',
                    background: theme.colors.warning,
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Eye size={16} />
                  Review Bids Now
                </button>
              )}
            </div>

            <div style={{ background: theme.colors.backgroundSecondary, padding: '16px', borderRadius: '10px', border: `1px solid ${theme.colors.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary }}>Average Bids Per Load</span>
                <span style={{ fontSize: '20px', fontWeight: 'bold', color: theme.colors.info }}>
                  {formatNumber(stats?.avgBidsPerLoad, '0')}
                </span>
              </div>
              <div style={{
                height: '8px',
                background: theme.colors.backgroundHover,
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${(stats.avgBidsPerLoad / 10) * 100}%`,
                  height: '100%',
                  background: theme.colors.info,
                  borderRadius: '4px'
                }} />
              </div>
              <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: '8px 0 0 0' }}>
                Competitive bidding ensures best rates
              </p>
            </div>
          </div>
        </Card>

        {/* Performance Metrics */}
        <Card 
          title="Service Performance" 
          subtitle="Quality and reliability metrics"
          icon={<Target size={20} color={theme.colors.primary} />}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{
              padding: '16px',
              background: theme.colors.backgroundSecondary,
              borderRadius: '10px',
              border: `1px solid ${theme.colors.border}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '14px', color: theme.colors.textSecondary, fontWeight: '600' }}>On-Time Delivery Rate</span>
                <span style={{ fontSize: '16px', fontWeight: 'bold', color: theme.colors.success }}>
                  {formatPercentage(stats?.onTimeDeliveryRate)}
                </span>
              </div>
              <div style={{
                height: '10px',
                background: theme.colors.backgroundHover,
                borderRadius: '5px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${stats.onTimeDeliveryRate}%`,
                  height: '100%',
                  background: theme.colors.success,
                  borderRadius: '5px'
                }} />
              </div>
            </div>

            <div style={{
              padding: '16px',
              background: theme.colors.backgroundSecondary,
              borderRadius: '10px',
              border: `1px solid ${theme.colors.border}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', color: theme.colors.textSecondary, fontWeight: '600' }}>Average Delivery Time</span>
                <Clock size={18} color={theme.colors.info} />
              </div>
              <p style={{ fontSize: '32px', fontWeight: 'bold', color: theme.colors.info, margin: 0 }}>
                {formatNumber(stats?.avgDeliveryTime, '0')}h
              </p>
              <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: '4px 0 0 0' }}>
                From pickup to delivery
              </p>
            </div>

            <div style={{
              padding: '16px',
              background: `${theme.colors.warning}10`,
              borderRadius: '10px',
              border: `1px solid ${theme.colors.warning}30`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', color: theme.colors.textSecondary, fontWeight: '600' }}>Carrier Performance</span>
                <Award size={18} color={theme.colors.warning} />
              </div>
              <p style={{ fontSize: '32px', fontWeight: 'bold', color: theme.colors.warning, margin: 0 }}>
                {formatNumber(stats?.carrierRatingAvg, '0')}/5.0
              </p>
              <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: '4px 0 0 0' }}>
                Average carrier rating
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Loads */}
      <Card
        title="Recent Loads"
        subtitle="Track your active and recent shipments"
        icon={<Package size={20} color={theme.colors.primary} />}
        action={
          <button
            onClick={() => navigate('/customer/loads')}
            style={{
              padding: '8px 16px',
              background: theme.colors.backgroundHover,
              color: theme.colors.textPrimary,
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
              e.currentTarget.style.background = theme.colors.primary
              e.currentTarget.style.color = 'white'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = theme.colors.backgroundHover
              e.currentTarget.style.color = theme.colors.textPrimary
            }}
          >
            View All Loads
            <ArrowRight size={14} />
          </button>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {recentLoads.slice(0, 4).map((load) => (
            <div
              key={load.id}
              onClick={() => navigate(`/customer/loads`)}
              style={{
                padding: '16px',
                background: theme.colors.backgroundSecondary,
                borderRadius: '10px',
                border: `1px solid ${theme.colors.border}`,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = theme.colors.backgroundHover
                e.currentTarget.style.borderColor = theme.colors.primary
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = theme.colors.backgroundSecondary
                e.currentTarget.style.borderColor = theme.colors.border
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <h4 style={{ 
                      color: theme.colors.textPrimary, 
                      margin: 0,
                      fontSize: '16px',
                      fontWeight: '600'
                    }}>
                      {load.commodity}
                    </h4>
                    <span style={{
                      padding: '4px 10px',
                      background: getStatusColor(load.status) + '20',
                      color: getStatusColor(load.status),
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: '600',
                      textTransform: 'uppercase'
                    }}>
                      {load.status}
                    </span>
                    {load.bidCount > 0 && (
                      <span style={{
                        padding: '4px 10px',
                        background: `${theme.colors.warning}20`,
                        color: theme.colors.warning,
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '600'
                      }}>
                        {load.bidCount} {load.bidCount === 1 ? 'BID' : 'BIDS'}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MapPin size={14} color={theme.colors.success} />
                      <span style={{ fontSize: '13px', color: theme.colors.textSecondary }}>
                        {load.origin?.siteName || load.origin?.address}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MapPin size={14} color={theme.colors.error} />
                      <span style={{ fontSize: '13px', color: theme.colors.textSecondary }}>
                        {load.destination?.siteName || load.destination?.address}
                      </span>
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  {load.carrier?.name !== 'Unassigned' && (
                    <p style={{ fontSize: '13px', color: theme.colors.textSecondary, margin: '0 0 4px 0' }}>
                      <Truck size={12} style={{ display: 'inline', marginRight: '4px' }} />
                      {load.carrier?.name}
                    </p>
                  )}
                  {load.eta && (
                    <p style={{ fontSize: '13px', color: theme.colors.info, margin: '0 0 4px 0', fontWeight: '600' }}>
                      ETA: {load.eta}
                    </p>
                )}
                {load.scheduledFor && (
                    <p style={{ fontSize: '13px', color: theme.colors.warning, margin: 0, fontWeight: '600' }}>
                      {load.scheduledFor}
                    </p>
                  )}
                  {load.completedAt && (
                    <p style={{ fontSize: '13px', color: theme.colors.success, margin: 0, fontWeight: '600' }}>
                      ✓ {load.completedAt}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Actions */}
      <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        <Card
          padding="24px"
          hover
          onClick={() => navigate('/draft-loads')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: `${theme.colors.info}20`,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FileText size={24} color={theme.colors.info} />
            </div>
            <div>
              <div style={{ color: theme.colors.textPrimary, fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                Draft Loads
              </div>
              <div style={{ color: theme.colors.textSecondary, fontSize: '14px' }}>
                Continue incomplete postings
              </div>
            </div>
          </div>
        </Card>

        <Card
          padding="24px"
          hover
          onClick={() => navigate('/customer/job-sites')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: `${theme.colors.warning}20`,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Building size={24} color={theme.colors.warning} />
            </div>
            <div>
              <div style={{ color: theme.colors.textPrimary, fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                Job Sites
              </div>
              <div style={{ color: theme.colors.textSecondary, fontSize: '14px' }}>
                Manage active job sites
              </div>
            </div>
          </div>
        </Card>
      </div>
    </PageContainer>
  )
}

export default CustomerDashboard
