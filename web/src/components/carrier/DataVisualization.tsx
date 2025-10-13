import React, { useState, useEffect } from 'react'
import { colors, shadows, borders, spacing, gradients } from '../styles/design-system'

interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string
    borderColor?: string
    fill?: boolean
  }[]
}

interface KPIMetric {
  title: string
  value: string | number
  change: number
  trend: 'up' | 'down' | 'stable'
  icon: string
  color: string
}

const DataVisualization = () => {
  const [activeChart, setActiveChart] = useState<'revenue' | 'performance' | 'utilization' | 'efficiency'>('revenue')
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')

  // Mock KPI data
  const kpiMetrics: KPIMetric[] = [
    {
      title: 'Total Revenue',
      value: '$127,450',
      change: 12.5,
      trend: 'up',
      icon: 'fas fa-dollar-sign',
      color: '#10b981'
    },
    {
      title: 'Loads Completed',
      value: 847,
      change: 8.2,
      trend: 'up',
      icon: 'fas fa-shipping-fast',
      color: '#3b82f6'
    },
    {
      title: 'Fleet Utilization',
      value: '94.2%',
      change: -2.1,
      trend: 'down',
      icon: 'fas fa-truck',
      color: '#f59e0b'
    },
    {
      title: 'On-Time Delivery',
      value: '97.8%',
      change: 3.4,
      trend: 'up',
      icon: 'fas fa-clock',
      color: '#8b5cf6'
    },
    {
      title: 'Fuel Efficiency',
      value: '6.8 MPG',
      change: 1.2,
      trend: 'up',
      icon: 'fas fa-gas-pump',
      color: '#ef4444'
    },
    {
      title: 'Driver Score',
      value: '4.7/5',
      change: 0.3,
      trend: 'up',
      icon: 'fas fa-star',
      color: '#f59e0b'
    }
  ]

  // Mock chart data
  const revenueData: ChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Revenue',
        data: [85000, 92000, 78000, 105000, 115000, 98000, 120000, 135000, 110000, 125000, 118000, 127450],
        backgroundColor: 'rgba(220, 38, 38, 0.1)',
        borderColor: '#dc2626',
        fill: true
      }
    ]
  }

  const performanceData: ChartData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Loads Completed',
        data: [45, 52, 48, 61],
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderColor: '#3b82f6',
        fill: true
      },
      {
        label: 'On-Time Rate',
        data: [94, 96, 95, 98],
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderColor: '#10b981',
        fill: true
      }
    ]
  }

  const utilizationData: ChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Fleet Utilization',
        data: [92, 96, 89, 94, 98, 85, 78],
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderColor: '#f59e0b',
        fill: true
      }
    ]
  }

  const efficiencyData: ChartData = {
    labels: ['Route A', 'Route B', 'Route C', 'Route D', 'Route E'],
    datasets: [
      {
        label: 'Efficiency Score',
        data: [87, 92, 78, 95, 89],
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        borderColor: '#8b5cf6',
        fill: true
      }
    ]
  }

  const getChartData = () => {
    switch (activeChart) {
      case 'revenue': return revenueData
      case 'performance': return performanceData
      case 'utilization': return utilizationData
      case 'efficiency': return efficiencyData
      default: return revenueData
    }
  }

  const SimpleLineChart = ({ data }: { data: ChartData }) => {
    const maxValue = Math.max(...data.datasets.flatMap(d => d.data))
    const minValue = Math.min(...data.datasets.flatMap(d => d.data))
    const range = maxValue - minValue

    return (
      <div style={{ height: '300px', position: 'relative', padding: spacing.md }}>
        <svg width="100%" height="100%" style={{ overflow: 'visible' }}>
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
            <g key={index}>
              <line
                x1="40"
                y1={40 + ratio * 220}
                x2="100%"
                y2={40 + ratio * 220}
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="1"
              />
              <text
                x="35"
                y={40 + ratio * 220 + 4}
                fill={colors.text.tertiary}
                fontSize="12"
                textAnchor="end"
              >
                {Math.round(maxValue - range * ratio).toLocaleString()}
              </text>
            </g>
          ))}

          {/* Chart lines */}
          {data.datasets.map((dataset, datasetIndex) => (
            <g key={datasetIndex}>
              <polyline
                fill="none"
                stroke={dataset.borderColor}
                strokeWidth="3"
                points={data.labels.map((label, index) => {
                  const x = 60 + (index * (100 / data.labels.length)) + '%'
                  const y = 40 + ((maxValue - dataset.data[index]) / range) * 220
                  return `${x},${y}`
                }).join(' ')}
              />
              <polygon
                fill={dataset.backgroundColor}
                points={[
                  `60,${260}`,
                  ...data.labels.map((label, index) => {
                    const x = 60 + (index * (100 / data.labels.length)) + '%'
                    const y = 40 + ((maxValue - dataset.data[index]) / range) * 220
                    return `${x},${y}`
                  }),
                  `${60 + ((data.labels.length - 1) * (100 / data.labels.length))}%,${260}`
                ].join(' ')}
              />
            </g>
          ))}

          {/* X-axis labels */}
          {data.labels.map((label, index) => (
            <text
              key={index}
              x={60 + (index * (100 / data.labels.length)) + '%'}
              y="290"
              fill={colors.text.tertiary}
              fontSize="12"
              textAnchor="middle"
            >
              {label}
            </text>
          ))}
        </svg>

        {/* Legend */}
        <div style={{ display: 'flex', gap: spacing.lg, marginTop: spacing.md, justifyContent: 'center' }}>
          {data.datasets.map((dataset, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
              <div style={{
                width: '12px',
                height: '12px',
                backgroundColor: dataset.borderColor,
                borderRadius: '2px'
              }} />
              <span style={{ color: colors.text.secondary, fontSize: '12px', fontWeight: '600' }}>
                {dataset.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const DonutChart = ({ data, size = 120 }: { data: { label: string; value: number; color: string }[], size?: number }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0)
    let cumulativePercentage = 0

    return (
      <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100
            const circumference = 2 * Math.PI * (size / 2 - 10)
            const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`
            const strokeDashoffset = -((cumulativePercentage / 100) * circumference)
            
            cumulativePercentage += percentage

            return (
              <circle
                key={index}
                cx={size / 2}
                cy={size / 2}
                r={size / 2 - 10}
                fill="none"
                stroke={item.color}
                strokeWidth="8"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            )
          })}
        </svg>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center'
        }}>
          <div style={{ color: colors.text.primary, fontSize: '16px', fontWeight: '700' }}>
            {total}
          </div>
          <div style={{ color: colors.text.secondary, fontSize: '10px' }}>
            Total
          </div>
        </div>
      </div>
    )
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
              <i className="fas fa-chart-line" style={{ color: 'white', fontSize: '18px' }}></i>
            </div>
            Data Visualization
          </h2>
          <p style={{ color: colors.text.secondary, margin: 0, fontSize: '14px' }}>
            Interactive charts and real-time analytics dashboard
          </p>
        </div>
        <div style={{ display: 'flex', gap: spacing.sm }}>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            style={{
              padding: `${spacing.sm} ${spacing.md}`,
              backgroundColor: colors.background.tertiary,
              color: colors.text.primary,
              border: `${borders.thin} ${colors.border.secondary}`,
              borderRadius: borders.radius.sm,
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
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
            <i className="fas fa-download" style={{ marginRight: spacing.xs }}></i>
            Export
          </button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: spacing.lg,
        marginBottom: spacing.xl
      }}>
        {kpiMetrics.map((metric, index) => (
          <div
            key={index}
            style={{
              background: colors.background.tertiary,
              borderRadius: borders.radius.lg,
              padding: spacing.lg,
              border: `${borders.thin} ${colors.border.secondary}`,
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{
              position: 'absolute',
              top: spacing.sm,
              right: spacing.sm,
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: metric.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0.1
            }}>
              <i className={metric.icon} style={{ color: metric.color, fontSize: '16px' }}></i>
            </div>
            <div style={{ marginBottom: spacing.sm }}>
              <i className={metric.icon} style={{ color: metric.color, fontSize: '24px', marginBottom: spacing.xs }}></i>
            </div>
            <div style={{ color: colors.text.primary, fontSize: '24px', fontWeight: '700', marginBottom: spacing.xs }}>
              {metric.value}
            </div>
            <div style={{ color: colors.text.secondary, fontSize: '12px', fontWeight: '600', marginBottom: spacing.xs }}>
              {metric.title}
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: spacing.xs,
              fontSize: '11px',
              fontWeight: '600',
              color: metric.trend === 'up' ? '#10b981' : metric.trend === 'down' ? '#ef4444' : colors.text.tertiary
            }}>
              <i className={`fas fa-arrow-${metric.trend === 'up' ? 'up' : metric.trend === 'down' ? 'down' : 'right'}`}></i>
              {metric.change > 0 && '+'}{metric.change}%
            </div>
          </div>
        ))}
      </div>

      {/* Chart Navigation */}
      <div style={{
        display: 'flex',
        gap: spacing.xs,
        marginBottom: spacing.lg,
        borderBottom: `${borders.thin} ${colors.border.secondary}`,
        paddingBottom: spacing.md
      }}>
        {[
          { id: 'revenue', label: 'Revenue Trends', icon: 'fas fa-dollar-sign' },
          { id: 'performance', label: 'Performance Metrics', icon: 'fas fa-chart-bar' },
          { id: 'utilization', label: 'Fleet Utilization', icon: 'fas fa-truck' },
          { id: 'efficiency', label: 'Route Efficiency', icon: 'fas fa-route' }
        ].map(chart => (
          <button
            key={chart.id}
            onClick={() => setActiveChart(chart.id as any)}
            style={{
              padding: `${spacing.sm} ${spacing.md}`,
              backgroundColor: activeChart === chart.id ? colors.primary[500] : 'transparent',
              color: activeChart === chart.id ? 'white' : colors.text.secondary,
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
            <i className={chart.icon} style={{ fontSize: '14px' }}></i>
            {chart.label}
          </button>
        ))}
      </div>

      {/* Chart Display */}
      <div style={{
        background: colors.background.tertiary,
        borderRadius: borders.radius.lg,
        padding: spacing.lg,
        border: `${borders.thin} ${colors.border.secondary}`,
        marginBottom: spacing.lg
      }}>
        <SimpleLineChart data={getChartData()} />
      </div>

      {/* Additional Charts Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: spacing.lg
      }}>
        {/* Load Distribution Donut Chart */}
        <div style={{
          background: colors.background.tertiary,
          borderRadius: borders.radius.lg,
          padding: spacing.lg,
          border: `${borders.thin} ${colors.border.secondary}`,
          textAlign: 'center'
        }}>
          <h3 style={{ color: colors.text.primary, fontSize: '16px', fontWeight: '700', marginBottom: spacing.lg }}>
            Load Distribution
          </h3>
          <DonutChart
            data={[
              { label: 'Metro', value: 45, color: '#3b82f6' },
              { label: 'OTR', value: 35, color: '#10b981' },
              { label: 'Local', value: 20, color: '#f59e0b' }
            ]}
          />
          <div style={{ marginTop: spacing.md }}>
            <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
                <div style={{ width: '8px', height: '8px', backgroundColor: '#3b82f6', borderRadius: '50%' }}></div>
                <span style={{ color: colors.text.secondary }}>Metro (45%)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
                <div style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%' }}></div>
                <span style={{ color: colors.text.secondary }}>OTR (35%)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
                <div style={{ width: '8px', height: '8px', backgroundColor: '#f59e0b', borderRadius: '50%' }}></div>
                <span style={{ color: colors.text.secondary }}>Local (20%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Equipment Status Chart */}
        <div style={{
          background: colors.background.tertiary,
          borderRadius: borders.radius.lg,
          padding: spacing.lg,
          border: `${borders.thin} ${colors.border.secondary}`,
          textAlign: 'center'
        }}>
          <h3 style={{ color: colors.text.primary, fontSize: '16px', fontWeight: '700', marginBottom: spacing.lg }}>
            Equipment Status
          </h3>
          <DonutChart
            data={[
              { label: 'Active', value: 24, color: '#10b981' },
              { label: 'Maintenance', value: 3, color: '#3b82f6' },
              { label: 'Alert', value: 1, color: '#f59e0b' },
              { label: 'Offline', value: 0, color: '#ef4444' }
            ]}
          />
          <div style={{ marginTop: spacing.md }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.sm, fontSize: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
                <div style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%' }}></div>
                <span style={{ color: colors.text.secondary }}>Active (24)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
                <div style={{ width: '8px', height: '8px', backgroundColor: '#3b82f6', borderRadius: '50%' }}></div>
                <span style={{ color: colors.text.secondary }}>Maintenance (3)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
                <div style={{ width: '8px', height: '8px', backgroundColor: '#f59e0b', borderRadius: '50%' }}></div>
                <span style={{ color: colors.text.secondary }}>Alert (1)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
                <div style={{ width: '8px', height: '8px', backgroundColor: '#ef4444', borderRadius: '50%' }}></div>
                <span style={{ color: colors.text.secondary }}>Offline (0)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DataVisualization
