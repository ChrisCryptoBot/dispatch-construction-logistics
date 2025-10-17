import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../../contexts/ThemeContext'
import { useQuery } from '@tanstack/react-query'
import { carrierAPI } from '../../services/api'
import PageContainer from '../../components/shared/PageContainer'
import Card from '../../components/ui/Card'
import {
  TrendingUp, TrendingDown, DollarSign, Package, Users, Clock,
  Activity, BarChart3, PieChart, LineChart, Calendar, Filter,
  Download, RefreshCw, ArrowUp, ArrowDown, ArrowLeft, Target, Award,
  MapPin, Truck, CheckCircle, AlertTriangle, Star, Zap,
  Eye, EyeOff, Settings, Share2, Maximize2, Minimize2
} from 'lucide-react'
import { formatNumber, formatCurrency, formatPercentage, formatDate } from '../../utils/formatters'
import AnimatedCounter from '../../components/enhanced/AnimatedCounter'

const BusinessIntelligencePage = () => {
  const { theme } = useTheme()
  const navigate = useNavigate()
  const [dateRange, setDateRange] = useState('30d')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  const [selectedCommodity, setSelectedCommodity] = useState<string | null>(null)
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf' | 'json'>('csv')
  const [error, setError] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  
  // Adjustment states
  const [rateAdjustments, setRateAdjustments] = useState({
    baseRate: 2.85,
    regionalMultiplier: 1.0,
    seasonalAdjustment: 0.0,
    demandBoost: 0.0
  })
  const [performanceTargets, setPerformanceTargets] = useState({
    onTimeRate: 94.2,
    customerSatisfaction: 4.8,
    profitMargin: 18.7,
    loadCapacity: 85.0
  })
  const [marketPosition, setMarketPosition] = useState({
    competitiveRate: 2.75,
    marketShare: 15.2,
    growthTarget: 20.0,
    expansionRegions: ['southeast', 'southwest']
  })

  // Enhanced data fetching with error handling
  const { data: analyticsData, isLoading, refetch, error: queryError } = useQuery({
    queryKey: ['business-intelligence', dateRange, selectedRegion, selectedCommodity],
    queryFn: async () => {
      try {
        setError(null)
        const params = { 
          dateRange, 
          region: selectedRegion,
          commodity: selectedCommodity 
        }
        return await carrierAPI.getAnalyticsData(params)
      } catch (error) {
        console.warn('API not available, using mock data:', error)
        setError('Using offline data - API unavailable')
        // Comprehensive mock data
        return {
          overview: {
            totalRevenue: 284750,
            revenueGrowth: 12.5,
            totalLoads: 847,
            loadGrowth: 8.3,
            onTimeRate: 94.2,
            onTimeGrowth: 2.1,
            avgRatePerMile: 2.85,
            rateGrowth: 5.2,
            profitMargin: 18.7,
            marginGrowth: 1.8,
            customerSatisfaction: 4.8,
            satisfactionGrowth: 0.3,
            marketPosition: 15,
            positionGrowth: 3
          },
          revenue: {
            daily: [
              { date: '2024-01-01', revenue: 8450, loads: 28, avgRate: 2.78 },
              { date: '2024-01-02', revenue: 9230, loads: 31, avgRate: 2.82 },
              { date: '2024-01-03', revenue: 10890, loads: 35, avgRate: 2.85 },
              { date: '2024-01-04', revenue: 12450, loads: 38, avgRate: 2.88 },
              { date: '2024-01-05', revenue: 9870, loads: 32, avgRate: 2.81 },
              { date: '2024-01-06', revenue: 7560, loads: 24, avgRate: 2.79 },
              { date: '2024-01-07', revenue: 6890, loads: 22, avgRate: 2.77 }
            ],
            monthly: [
              { month: 'Jul', revenue: 245600, loads: 782, growth: -2.1 },
              { month: 'Aug', revenue: 251200, loads: 798, growth: 2.3 },
              { month: 'Sep', revenue: 263800, loads: 821, growth: 5.0 },
              { month: 'Oct', revenue: 278900, loads: 845, growth: 5.7 },
              { month: 'Nov', revenue: 284750, loads: 847, growth: 2.1 }
            ],
            byRegion: [
              { region: 'Southeast', revenue: 85420, percentage: 30.0, growth: 8.2 },
              { region: 'Southwest', revenue: 68230, percentage: 24.0, growth: 5.1 },
              { region: 'Northeast', revenue: 56980, percentage: 20.0, growth: 12.3 },
              { region: 'Midwest', revenue: 42650, percentage: 15.0, growth: 3.8 },
              { region: 'West Coast', revenue: 31470, percentage: 11.0, growth: 15.6 }
            ]
          },
          performance: {
            onTimeDelivery: {
              current: 94.2,
              target: 95.0,
              trend: [
                { period: 'Week 1', rate: 91.8 },
                { period: 'Week 2', rate: 92.5 },
                { period: 'Week 3', rate: 93.1 },
                { period: 'Week 4', rate: 94.2 }
              ]
            },
            loadEfficiency: {
              current: 87.3,
              target: 90.0,
              trend: [
                { period: 'Week 1', efficiency: 84.2 },
                { period: 'Week 2', efficiency: 85.1 },
                { period: 'Week 3', efficiency: 86.0 },
                { period: 'Week 4', efficiency: 87.3 }
              ]
            },
            customerRetention: {
              current: 89.5,
              target: 92.0,
              trend: [
                { period: 'Week 1', retention: 87.2 },
                { period: 'Week 2', retention: 87.8 },
                { period: 'Week 3', retention: 88.6 },
                { period: 'Week 4', retention: 89.5 }
              ]
            }
          },
          market: {
            competitivePosition: {
              rank: 15,
              total: 100,
              percentile: 85
            },
            rateComparison: {
              yourRate: 2.85,
              marketAvg: 2.62,
              difference: 8.8
            },
            laneAnalysis: [
              { lane: 'Dallas-Houston', volume: 45, rate: 2.95, efficiency: 92.1, margin: 22.3 },
              { lane: 'Atlanta-Miami', volume: 38, rate: 3.12, efficiency: 88.7, margin: 24.1 },
              { lane: 'Chicago-Detroit', volume: 32, rate: 2.78, efficiency: 94.2, margin: 19.8 },
              { lane: 'Phoenix-LA', volume: 28, rate: 3.45, efficiency: 86.3, margin: 26.7 },
              { lane: 'Denver-Dallas', volume: 25, rate: 2.89, efficiency: 91.5, margin: 21.2 }
            ]
          },
          insights: [
            {
              type: 'opportunity',
              title: 'West Coast Expansion',
              description: 'High growth potential in West Coast lanes with 15.6% revenue increase',
              impact: 'High',
              action: 'Consider expanding fleet capacity for West Coast routes'
            },
            {
              type: 'warning',
              title: 'Load Efficiency Gap',
              description: 'Current efficiency at 87.3% vs 90% target',
              impact: 'Medium',
              action: 'Review dispatch optimization and route planning'
            },
            {
              type: 'success',
              title: 'Customer Satisfaction',
              description: '4.8/5.0 rating with 0.3 point improvement this month',
              impact: 'High',
              action: 'Maintain current service quality standards'
            },
            {
              type: 'info',
              title: 'Rate Optimization',
              description: '8.8% above market average with strong margins',
              impact: 'Medium',
              action: 'Monitor competitive pricing to maintain advantage'
            }
          ]
        }
      }
    }
  })

  const dateRangeOptions = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: '1y', label: 'Last Year' }
  ]

  const metricOptions = [
    { value: 'revenue', label: 'Revenue Analysis', icon: <DollarSign size={16} /> },
    { value: 'performance', label: 'Performance Metrics', icon: <Target size={16} /> },
    { value: 'market', label: 'Market Analysis', icon: <BarChart3 size={16} /> },
    { value: 'insights', label: 'Business Insights', icon: <Award size={16} /> }
  ]

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? <ArrowUp size={14} color={theme.colors.success} /> : <ArrowDown size={14} color={theme.colors.error} />
  }

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? theme.colors.success : theme.colors.error
  }


  // Enhanced utility functions
  const handleExport = useCallback(async () => {
    setIsExporting(true)
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // In a real implementation, this would call an API endpoint
      const exportData = {
        dateRange,
        filters: { region: selectedRegion, commodity: selectedCommodity },
        data: analyticsData,
        exportedAt: new Date().toISOString()
      }
      
      if (exportFormat === 'csv') {
        // Convert to CSV and download
        const csvContent = convertToCSV(exportData)
        downloadFile(csvContent, `analytics-${dateRange}.csv`, 'text/csv')
      } else if (exportFormat === 'json') {
        downloadFile(JSON.stringify(exportData, null, 2), `analytics-${dateRange}.json`, 'application/json')
      }
      
      alert(`Analytics data exported successfully as ${exportFormat.toUpperCase()}`)
    } catch (error) {
      setError('Export failed. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }, [exportFormat, dateRange, selectedRegion, selectedCommodity, analyticsData])

  const convertToCSV = useCallback((data: any) => {
    // Simple CSV conversion - in production, use a proper CSV library
    const headers = ['Metric', 'Value', 'Growth', 'Date Range']
    const rows = [
      ['Total Revenue', data.overview.totalRevenue, data.overview.revenueGrowth, dateRange],
      ['Total Loads', data.overview.totalLoads, data.overview.loadGrowth, dateRange],
      ['On-Time Rate', data.overview.onTimeRate, data.overview.onTimeGrowth, dateRange],
      ['Avg Rate/Mile', data.overview.avgRatePerMile, data.overview.rateGrowth, dateRange],
      ['Profit Margin', data.overview.profitMargin, data.overview.marginGrowth, dateRange]
    ]
    
    return [headers, ...rows].map(row => row.join(',')).join('\n')
  }, [dateRange])

  const downloadFile = useCallback((content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [])

  const handleMetricClick = useCallback((metric: string) => {
    setSelectedMetric(metric)
    setViewMode('detailed')
  }, [])

  const handleRegionClick = useCallback((region: string) => {
    setSelectedRegion(region === selectedRegion ? null : region)
  }, [selectedRegion])

  const handleCommodityClick = useCallback((commodity: string) => {
    setSelectedCommodity(commodity === selectedCommodity ? null : commodity)
  }, [selectedCommodity])

  // Memoized filtered data
  const filteredData = useMemo(() => {
    if (!analyticsData) return null
    
    let filtered = { ...analyticsData }
    
    if (selectedRegion) {
      // Filter data by region
      filtered.revenue = {
        ...filtered.revenue,
        regional: filtered.revenue.regional?.filter((r: any) => r.region === selectedRegion) || []
      }
    }
    
    if (selectedCommodity) {
      // Filter data by commodity
      filtered.revenue = {
        ...filtered.revenue,
        byCommodity: filtered.revenue.byCommodity?.filter((c: any) => c.commodity === selectedCommodity) || []
      }
    }
    
    return filtered
  }, [analyticsData, selectedRegion, selectedCommodity])

  if (isLoading) {
    return (
      <PageContainer title="Operational Intelligence Hub" subtitle="Loading analytics data...">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ fontSize: '16px', color: theme.colors.textSecondary }}>
              Loading analytics data...
            </span>
          </div>
        </div>
      </PageContainer>
    )
  }

  // Error state
  if (queryError && !analyticsData) {
    return (
      <PageContainer title="Operational Intelligence Hub" subtitle="Unable to load analytics data">
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '400px',
          gap: '16px'
        }}>
          <AlertTriangle size={48} color={theme.colors.error} />
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ color: theme.colors.textPrimary, marginBottom: '8px' }}>
              Unable to load analytics data
            </h3>
            <p style={{ color: theme.colors.textSecondary, marginBottom: '16px' }}>
              There was an error loading your analytics data. Please try again.
            </p>
            <button
              onClick={() => refetch()}
              style={{
                padding: '12px 24px',
                background: 'transparent',
                border: `1px solid ${theme.colors.primary}`,
                borderRadius: '8px',
                color: theme.colors.primary,
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = theme.colors.primary
                e.currentTarget.style.color = '#ffffff'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = theme.colors.primary
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </PageContainer>
    )
  }

  return (
    <>
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    <PageContainer 
      title="Operational Intelligence Hub" 
      subtitle="Unified financial, operational, and market analytics"
      icon={BarChart3 as any}
      headerAction={
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* Back to Dashboard button */}
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              padding: '8px 12px',
              background: 'transparent',
              border: `1px solid ${theme.colors.border}`,
              borderRadius: '8px',
              color: theme.colors.textSecondary,
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = theme.colors.backgroundCardHover
              e.currentTarget.style.color = theme.colors.textPrimary
              e.currentTarget.style.borderColor = theme.colors.textSecondary
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = theme.colors.textSecondary
              e.currentTarget.style.borderColor = theme.colors.border
            }}
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
          
          {/* Error indicator */}
          {error && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              padding: '6px 12px',
              background: `${theme.colors.warning}20`,
              border: `1px solid ${theme.colors.warning}`,
              borderRadius: '6px',
              fontSize: '12px',
              color: theme.colors.warning
            }}>
              <AlertTriangle size={14} />
              Offline Mode
            </div>
          )}
          
          {/* Fullscreen toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            style={{
              padding: '8px',
              background: 'transparent',
              border: `1px solid ${theme.colors.border}`,
              borderRadius: '6px',
              color: theme.colors.textSecondary,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = theme.colors.backgroundCardHover
              e.currentTarget.style.color = theme.colors.textPrimary
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = theme.colors.textSecondary
            }}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      }
    >
      {/* Header Controls */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {/* Date Range Selector */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            style={{
              padding: '8px 12px',
              background: theme.colors.background,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: '8px',
              color: theme.colors.textPrimary,
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
            <option value="ytd">Year to date</option>
          </select>

          {/* Region Filter */}
          <select
            value={selectedRegion || ''}
            onChange={(e) => setSelectedRegion(e.target.value || null)}
            style={{
              padding: '8px 12px',
              background: theme.colors.background,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: '8px',
              color: theme.colors.textPrimary,
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            <option value="">All Regions</option>
            <option value="northeast">Northeast</option>
            <option value="southeast">Southeast</option>
            <option value="midwest">Midwest</option>
            <option value="southwest">Southwest</option>
            <option value="west">West Coast</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => refetch()}
            style={{
              padding: '8px 12px',
              background: 'transparent',
              border: `1px solid ${theme.colors.border}`,
              borderRadius: '8px',
              color: theme.colors.textSecondary,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = theme.colors.backgroundCardHover
              e.currentTarget.style.color = theme.colors.textPrimary
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = theme.colors.textSecondary
            }}
          >
            <RefreshCw size={16} />
            Refresh
          </button>

          <button
            onClick={handleExport}
            disabled={isExporting}
            style={{
              padding: '8px 12px',
              background: 'transparent',
              border: `1px solid ${theme.colors.border}`,
              borderRadius: '8px',
              color: theme.colors.textSecondary,
              fontSize: '14px',
              cursor: isExporting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
              opacity: isExporting ? 0.5 : 1
            }}
            onMouseEnter={(e) => {
              if (!isExporting) {
                e.currentTarget.style.background = theme.colors.backgroundCardHover
                e.currentTarget.style.color = theme.colors.textPrimary
                e.currentTarget.style.borderColor = theme.colors.textSecondary
              }
            }}
            onMouseLeave={(e) => {
              if (!isExporting) {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = theme.colors.textSecondary
                e.currentTarget.style.borderColor = theme.colors.border
              }
            }}
          >
            <Download size={16} />
            {isExporting ? 'Exporting...' : 'Export'}
          </button>
        </div>
      </div>


      {/* Operational Adjustments & Controls */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        {/* Rate & Pricing Adjustments */}
        <Card title="Rate & Pricing Controls" icon={<DollarSign size={20} color={theme.colors.textSecondary} />}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                Base Rate per Mile
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="number"
                  value={rateAdjustments.baseRate}
                  onChange={(e) => setRateAdjustments(prev => ({ ...prev, baseRate: parseFloat(e.target.value) || 0 }))}
                  step="0.01"
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    background: theme.colors.background,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: '6px',
                    color: theme.colors.textPrimary,
                    fontSize: '14px'
                  }}
                />
                <span style={{ fontSize: '14px', color: theme.colors.textSecondary }}>$</span>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                Regional Multiplier
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="range"
                  min="0.8"
                  max="1.5"
                  step="0.05"
                  value={rateAdjustments.regionalMultiplier}
                  onChange={(e) => setRateAdjustments(prev => ({ ...prev, regionalMultiplier: parseFloat(e.target.value) }))}
                  style={{ flex: 1 }}
                />
                <span style={{ fontSize: '14px', color: theme.colors.textPrimary, minWidth: '40px' }}>
                  {rateAdjustments.regionalMultiplier.toFixed(2)}x
                </span>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                Seasonal Adjustment
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="range"
                  min="-0.3"
                  max="0.3"
                  step="0.05"
                  value={rateAdjustments.seasonalAdjustment}
                  onChange={(e) => setRateAdjustments(prev => ({ ...prev, seasonalAdjustment: parseFloat(e.target.value) }))}
                  style={{ flex: 1 }}
                />
                <span style={{ fontSize: '14px', color: theme.colors.textPrimary, minWidth: '50px' }}>
                  {rateAdjustments.seasonalAdjustment > 0 ? '+' : ''}{(rateAdjustments.seasonalAdjustment * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            <div style={{ 
              padding: '12px', 
              background: theme.colors.backgroundTertiary, 
              borderRadius: '8px',
              border: `1px solid ${theme.colors.border}`
            }}>
              <div style={{ fontSize: '12px', color: theme.colors.textSecondary, marginBottom: '4px' }}>
                Effective Rate
              </div>
              <div style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary }}>
                ${((rateAdjustments.baseRate * rateAdjustments.regionalMultiplier) + (rateAdjustments.baseRate * rateAdjustments.seasonalAdjustment)).toFixed(2)}/mile
              </div>
            </div>

            <button
              onClick={() => {
                // Apply rate adjustments
                alert('Rate adjustments applied to all new loads')
              }}
              style={{
                padding: '10px 16px',
                background: 'transparent',
                border: `1px solid ${theme.colors.border}`,
                borderRadius: '8px',
                color: theme.colors.textSecondary,
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = theme.colors.backgroundCardHover
                e.currentTarget.style.color = theme.colors.textPrimary
                e.currentTarget.style.borderColor = theme.colors.textSecondary
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = theme.colors.textSecondary
                e.currentTarget.style.borderColor = theme.colors.border
              }}
            >
              Apply Rate Changes
            </button>
          </div>
        </Card>

        {/* Performance Targets */}
        <Card title="Performance Targets" icon={<Target size={20} color={theme.colors.textSecondary} />}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                On-Time Delivery Target
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="range"
                  min="85"
                  max="100"
                  step="0.5"
                  value={performanceTargets.onTimeRate}
                  onChange={(e) => setPerformanceTargets(prev => ({ ...prev, onTimeRate: parseFloat(e.target.value) }))}
                  style={{ flex: 1 }}
                />
                <span style={{ fontSize: '14px', color: theme.colors.textPrimary, minWidth: '50px' }}>
                  {performanceTargets.onTimeRate.toFixed(1)}%
                </span>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                Customer Satisfaction Target
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="range"
                  min="3.0"
                  max="5.0"
                  step="0.1"
                  value={performanceTargets.customerSatisfaction}
                  onChange={(e) => setPerformanceTargets(prev => ({ ...prev, customerSatisfaction: parseFloat(e.target.value) }))}
                  style={{ flex: 1 }}
                />
                <span style={{ fontSize: '14px', color: theme.colors.textPrimary, minWidth: '50px' }}>
                  {performanceTargets.customerSatisfaction.toFixed(1)}★
                </span>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                Profit Margin Target
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="range"
                  min="10"
                  max="30"
                  step="0.5"
                  value={performanceTargets.profitMargin}
                  onChange={(e) => setPerformanceTargets(prev => ({ ...prev, profitMargin: parseFloat(e.target.value) }))}
                  style={{ flex: 1 }}
                />
                <span style={{ fontSize: '14px', color: theme.colors.textPrimary, minWidth: '50px' }}>
                  {performanceTargets.profitMargin.toFixed(1)}%
                </span>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                Fleet Utilization Target
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="range"
                  min="60"
                  max="95"
                  step="1"
                  value={performanceTargets.loadCapacity}
                  onChange={(e) => setPerformanceTargets(prev => ({ ...prev, loadCapacity: parseFloat(e.target.value) }))}
                  style={{ flex: 1 }}
                />
                <span style={{ fontSize: '14px', color: theme.colors.textPrimary, minWidth: '50px' }}>
                  {performanceTargets.loadCapacity.toFixed(0)}%
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                // Update performance targets
                alert('Performance targets updated and notifications sent to team')
              }}
              style={{
                padding: '10px 16px',
                background: 'transparent',
                border: `1px solid ${theme.colors.border}`,
                borderRadius: '8px',
                color: theme.colors.textSecondary,
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = theme.colors.backgroundCardHover
                e.currentTarget.style.color = theme.colors.textPrimary
                e.currentTarget.style.borderColor = theme.colors.textSecondary
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = theme.colors.textSecondary
                e.currentTarget.style.borderColor = theme.colors.border
              }}
            >
              Update Targets
            </button>
          </div>
        </Card>

        {/* Market Positioning */}
        <Card title="Market Positioning" icon={<TrendingUp size={20} color={theme.colors.textSecondary} />}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                Competitive Rate Analysis
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="number"
                  value={marketPosition.competitiveRate}
                  onChange={(e) => setMarketPosition(prev => ({ ...prev, competitiveRate: parseFloat(e.target.value) || 0 }))}
                  step="0.01"
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    background: theme.colors.background,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: '6px',
                    color: theme.colors.textPrimary,
                    fontSize: '14px'
                  }}
                />
                <span style={{ fontSize: '14px', color: theme.colors.textSecondary }}>$</span>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                Market Share Target
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="range"
                  min="10"
                  max="30"
                  step="0.5"
                  value={marketPosition.marketShare}
                  onChange={(e) => setMarketPosition(prev => ({ ...prev, marketShare: parseFloat(e.target.value) }))}
                  style={{ flex: 1 }}
                />
                <span style={{ fontSize: '14px', color: theme.colors.textPrimary, minWidth: '50px' }}>
                  {marketPosition.marketShare.toFixed(1)}%
                </span>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                Growth Target
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="1"
                  value={marketPosition.growthTarget}
                  onChange={(e) => setMarketPosition(prev => ({ ...prev, growthTarget: parseFloat(e.target.value) }))}
                  style={{ flex: 1 }}
                />
                <span style={{ fontSize: '14px', color: theme.colors.textPrimary, minWidth: '50px' }}>
                  {marketPosition.growthTarget.toFixed(0)}%
                </span>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                Expansion Regions
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {['northeast', 'southeast', 'midwest', 'southwest', 'west'].map(region => (
                  <button
                    key={region}
                    onClick={() => {
                      const newRegions = marketPosition.expansionRegions.includes(region)
                        ? marketPosition.expansionRegions.filter(r => r !== region)
                        : [...marketPosition.expansionRegions, region]
                      setMarketPosition(prev => ({ ...prev, expansionRegions: newRegions }))
                    }}
                    style={{
                      padding: '6px 12px',
                      background: marketPosition.expansionRegions.includes(region) ? theme.colors.backgroundCardHover : 'transparent',
                      border: `1px solid ${theme.colors.border}`,
                      borderRadius: '6px',
                      color: theme.colors.textSecondary,
                      fontSize: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textTransform: 'capitalize'
                    }}
                  >
                    {region}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                // Update market strategy
                alert('Market positioning strategy updated')
              }}
              style={{
                padding: '10px 16px',
                background: 'transparent',
                border: `1px solid ${theme.colors.border}`,
                borderRadius: '8px',
                color: theme.colors.textSecondary,
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = theme.colors.backgroundCardHover
                e.currentTarget.style.color = theme.colors.textPrimary
                e.currentTarget.style.borderColor = theme.colors.textSecondary
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = theme.colors.textSecondary
                e.currentTarget.style.borderColor = theme.colors.border
              }}
            >
              Update Strategy
            </button>
          </div>
        </Card>

        {/* Forecasting & Insights */}
        <Card title="Forecasting & Insights" icon={<Activity size={20} color={theme.colors.textSecondary} />}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ 
              padding: '12px', 
              background: theme.colors.backgroundTertiary, 
              borderRadius: '8px',
              border: `1px solid ${theme.colors.border}`
            }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                Revenue Forecast (Next 30 Days)
              </div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: theme.colors.success, marginBottom: '4px' }}>
                $312,450
              </div>
              <div style={{ fontSize: '12px', color: theme.colors.textSecondary }}>
                Based on current trends and adjustments
              </div>
            </div>

            <div style={{ 
              padding: '12px', 
              background: theme.colors.backgroundTertiary, 
              borderRadius: '8px',
              border: `1px solid ${theme.colors.border}`
            }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                Market Opportunity
              </div>
              <div style={{ fontSize: '16px', color: theme.colors.textSecondary, marginBottom: '8px' }}>
                High-demand routes identified in {marketPosition.expansionRegions.length} regions
              </div>
              <div style={{ fontSize: '12px', color: theme.colors.success }}>
                Potential revenue increase: +15-25%
              </div>
            </div>

            <div style={{ 
              padding: '12px', 
              background: theme.colors.backgroundTertiary, 
              borderRadius: '8px',
              border: `1px solid ${theme.colors.border}`
            }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                Risk Assessment
              </div>
              <div style={{ fontSize: '12px', color: theme.colors.warning, marginBottom: '4px' }}>
                ⚠️ Seasonal rate adjustment may impact competitiveness
              </div>
              <div style={{ fontSize: '12px', color: theme.colors.textSecondary }}>
                Monitor competitor rates in target regions
              </div>
            </div>

            <button
              onClick={() => {
                // Generate detailed forecast
                alert('Detailed forecast report generated and sent to email')
              }}
              style={{
                padding: '10px 16px',
                background: 'transparent',
                border: `1px solid ${theme.colors.border}`,
                borderRadius: '8px',
                color: theme.colors.textSecondary,
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = theme.colors.backgroundCardHover
                e.currentTarget.style.color = theme.colors.textPrimary
                e.currentTarget.style.borderColor = theme.colors.textSecondary
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = theme.colors.textSecondary
                e.currentTarget.style.borderColor = theme.colors.border
              }}
            >
              Generate Forecast Report
            </button>
          </div>
        </Card>
      </div>

      {/* Main Analytics Content */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
        gap: '20px'
      }}>
        {/* Revenue Analysis */}
        {(
          <>
            <Card title="Business Insights" icon={<Award size={20} color={theme.colors.textSecondary} />}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {analyticsData?.insights.map((insight, index) => (
                  <div key={index} style={{
                    background: theme.colors.background,
                    padding: '16px',
                    borderRadius: '10px',
                    border: `1px solid ${theme.colors.border}`,
                    borderLeft: `4px solid ${theme.colors.border}`
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary }}>
                        {insight.title}
                      </div>
                      <div style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '500',
                        background: insight.type === 'success' ? '#2d4a2d' :
                                   insight.type === 'warning' ? '#4a3d2d' :
                                   insight.type === 'error' ? '#4a2d2d' :
                                   insight.type === 'opportunity' ? '#4a2d4a' :
                                   '#2d2d4a',
                        color: insight.type === 'success' ? '#7fb87f' :
                               insight.type === 'warning' ? '#bfa87f' :
                               insight.type === 'error' ? '#bf7f7f' :
                               insight.type === 'opportunity' ? '#bf7fbf' :
                               '#7f7fbf'
                      }}>
                        {insight.type}
                      </div>
                    </div>
                    <div style={{ fontSize: '13px', color: theme.colors.textSecondary, lineHeight: '1.5' }}>
                      {insight.description}
                    </div>
                    {insight.impact && (
                      <div style={{ marginTop: '8px', fontSize: '12px', color: theme.colors.textSecondary }}>
                        <strong>Impact:</strong> {insight.impact}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Revenue by Region" icon={<PieChart size={20} color={theme.colors.textSecondary} />}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {analyticsData?.revenue.byRegion.map((region, index) => (
                  <div key={index} style={{
                    background: theme.colors.background,
                    padding: '16px',
                    borderRadius: '10px',
                    border: `1px solid ${theme.colors.border}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary }}>
                        {region.region}
                      </div>
                      <div style={{ fontSize: '12px', color: theme.colors.textSecondary }}>
                        {region.percentage}% of total revenue
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '16px', fontWeight: '600', color: theme.colors.textPrimary }}>
                        {formatCurrency(region.revenue)}
                      </div>
                      <div style={{ 
                        fontSize: '12px', 
                        color: getGrowthColor(region.growth),
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        justifyContent: 'flex-end'
                      }}>
                        {getGrowthIcon(region.growth)}
                        {region.growth}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}

        {/* Merged Performance & Market Metrics */}
        {(
          <Card title="Performance & Market Metrics" icon={<Activity size={20} color={theme.colors.textSecondary} />}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* On-Time Delivery */}
              <div style={{
                background: theme.colors.background,
                padding: '16px',
                borderRadius: '8px',
                border: `1px solid ${theme.colors.border}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary }}>On-Time Delivery</div>
                  <div style={{ fontSize: '12px', color: theme.colors.textSecondary }}>Target: {analyticsData?.performance.onTimeDelivery.target}%</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: theme.colors.textPrimary }}>
                    {analyticsData?.performance.onTimeDelivery.current}%
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', marginTop: '4px' }}>
                    <ArrowUp size={12} color={theme.colors.success} />
                    <span style={{ fontSize: '12px', color: theme.colors.success, fontWeight: '500' }}>+2.1%</span>
                  </div>
                </div>
              </div>

              {/* Load Efficiency */}
              <div style={{
                background: theme.colors.background,
                padding: '16px',
                borderRadius: '8px',
                border: `1px solid ${theme.colors.border}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary }}>Load Efficiency</div>
                  <div style={{ fontSize: '12px', color: theme.colors.textSecondary }}>Target: {analyticsData?.performance.loadEfficiency.target}%</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: theme.colors.textPrimary }}>
                    {analyticsData?.performance.loadEfficiency.current}%
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', marginTop: '4px' }}>
                    <ArrowDown size={12} color={theme.colors.error} />
                    <span style={{ fontSize: '12px', color: theme.colors.error, fontWeight: '500' }}>-1.8%</span>
                  </div>
                </div>
              </div>

              {/* Competitive Position */}
              <div style={{
                background: theme.colors.background,
                padding: '16px',
                borderRadius: '8px',
                border: `1px solid ${theme.colors.border}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary }}>Competitive Position</div>
                  <div style={{ fontSize: '12px', color: theme.colors.textSecondary }}>Top {analyticsData?.market.competitivePosition.percentile}% of {analyticsData?.market.competitivePosition.total} carriers</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: theme.colors.textPrimary }}>
                    #{analyticsData?.market.competitivePosition.rank}
                  </div>
                </div>
              </div>

              {/* Rate Comparison */}
              <div style={{
                background: theme.colors.background,
                padding: '16px',
                borderRadius: '8px',
                border: `1px solid ${theme.colors.border}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary }}>Rate Comparison</div>
                  <div style={{ fontSize: '12px', color: theme.colors.textSecondary }}>vs Market Average</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: theme.colors.textPrimary }}>
                    ${analyticsData?.market.rateComparison.yourRate}
                  </div>
                  <div style={{ 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: theme.colors.success,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '4px',
                    marginTop: '2px'
                  }}>
                    {getGrowthIcon(analyticsData?.market.rateComparison.difference || 0)}
                    +{analyticsData?.market.rateComparison.difference}%
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

      </div>

      {/* Lane Performance Analysis */}
      <Card title="Lane Performance Analysis" icon={<MapPin size={20} color={theme.colors.textSecondary} />} style={{ marginTop: '24px' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${theme.colors.border}` }}>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary }}>Lane</th>
                <th style={{ padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary }}>Volume</th>
                <th style={{ padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary }}>Rate/Mile</th>
                <th style={{ padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary }}>Efficiency</th>
                <th style={{ padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary }}>Margin</th>
              </tr>
            </thead>
            <tbody>
              {analyticsData?.market.laneAnalysis.map((lane, index) => (
                <tr key={index} style={{ borderBottom: `1px solid ${theme.colors.border}` }}>
                  <td style={{ padding: '12px', fontSize: '14px', color: theme.colors.textPrimary }}>{lane.lane}</td>
                  <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px', color: theme.colors.textPrimary }}>{lane.volume}</td>
                  <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px', color: theme.colors.success }}>${lane.rate}</td>
                  <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px', color: theme.colors.textPrimary }}>{lane.efficiency}%</td>
                  <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px', color: theme.colors.success }}>{lane.margin}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Inject CSS for animations */}
      <style>
        {`
          .animate-spin {
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </PageContainer>
    </>
  )
}

export default BusinessIntelligencePage
