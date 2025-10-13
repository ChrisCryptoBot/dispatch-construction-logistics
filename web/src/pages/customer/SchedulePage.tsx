import React, { useState } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { Calendar, ChevronLeft, ChevronRight, Plus, MapPin, Package, Clock, User, AlertCircle } from 'lucide-react'
import PageContainer from '../../components/shared/PageContainer'
import Card from '../../components/ui/Card'

interface ScheduledDelivery {
  id: string
  loadId: string
  date: string
  time: string
  jobSite: string
  material: string
  quantity: number
  carrier: string
  driver?: string
  status: 'scheduled' | 'confirmed' | 'in_transit' | 'delivered' | 'cancelled'
  notes?: string
}

const SchedulePage = () => {
  const { theme } = useTheme()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showAddModal, setShowAddModal] = useState(false)

  // Mock scheduled deliveries
  const [deliveries] = useState<ScheduledDelivery[]>([
    {
      id: '1',
      loadId: 'LD-5432',
      date: '2025-01-08',
      time: '08:00',
      jobSite: 'Downtown Plaza Construction',
      material: 'Ready-Mix Concrete',
      quantity: 25.5,
      carrier: 'ABC Trucking',
      driver: 'John Smith',
      status: 'confirmed'
    },
    {
      id: '2',
      loadId: 'LD-5433',
      date: '2025-01-08',
      time: '10:30',
      jobSite: 'Highway 35 Extension',
      material: 'Asphalt',
      quantity: 32.0,
      carrier: 'FastHaul Logistics',
      driver: 'Sarah Johnson',
      status: 'scheduled'
    },
    {
      id: '3',
      loadId: 'LD-5434',
      date: '2025-01-08',
      time: '14:00',
      jobSite: 'Downtown Plaza Construction',
      material: 'Crushed Stone',
      quantity: 28.3,
      carrier: 'Superior Logistics',
      status: 'scheduled'
    },
    {
      id: '4',
      loadId: 'LD-5435',
      date: '2025-01-09',
      time: '07:00',
      jobSite: 'Riverside Park Development',
      material: 'Topsoil',
      quantity: 18.5,
      carrier: 'ABC Trucking',
      driver: 'Mike Rodriguez',
      status: 'scheduled'
    },
    {
      id: '5',
      loadId: 'LD-5436',
      date: '2025-01-09',
      time: '13:00',
      jobSite: 'Highway 35 Extension',
      material: 'Base Material',
      quantity: 30.0,
      carrier: 'XYZ Transport',
      status: 'scheduled'
    },
    {
      id: '6',
      loadId: 'LD-5437',
      date: '2025-01-10',
      time: '09:00',
      jobSite: 'Downtown Plaza Construction',
      material: 'Sand',
      quantity: 22.0,
      carrier: 'FastHaul Logistics',
      status: 'scheduled'
    }
  ])

  const statusConfig = {
    scheduled: { color: theme.colors.info, label: 'Scheduled' },
    confirmed: { color: theme.colors.success, label: 'Confirmed' },
    in_transit: { color: theme.colors.primary, label: 'In Transit' },
    delivered: { color: theme.colors.textSecondary, label: 'Delivered' },
    cancelled: { color: theme.colors.error, label: 'Cancelled' }
  }

  const getWeekDays = () => {
    const start = new Date(currentDate)
    const day = start.getDay()
    const diff = start.getDate() - day + (day === 0 ? -6 : 1) // Adjust to Monday
    const monday = new Date(start.setDate(diff))
    
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(monday)
      date.setDate(monday.getDate() + i)
      return date
    })
  }

  const weekDays = getWeekDays()

  const getDeliveriesForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return deliveries.filter(d => d.date === dateStr)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const formatDayName = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' })
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const handlePrevWeek = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() - 7)
    setCurrentDate(newDate)
  }

  const handleNextWeek = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + 7)
    setCurrentDate(newDate)
  }

  return (
    <PageContainer>
      {/* Header */}
      <div style={{ marginBottom: theme.spacing.lg }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.md }}>
          <div>
            <h1 style={{ 
              fontSize: '28px', 
              fontWeight: '700',
              color: theme.colors.textPrimary,
              marginBottom: theme.spacing.xs
            }}>
              Delivery Schedule
            </h1>
            <p style={{ color: theme.colors.textSecondary, fontSize: '14px' }}>
              Manage and view your scheduled deliveries
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: theme.spacing.xs,
              padding: `${theme.spacing.sm} ${theme.spacing.md}`,
              background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primaryHover})`,
              color: 'white',
              border: 'none',
              borderRadius: theme.borderRadius.md,
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <Plus size={18} />
            Schedule Delivery
          </button>
        </div>

        {/* Week Navigation */}
        <Card hover={false}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={handlePrevWeek}
              style={{
                padding: theme.spacing.sm,
                background: 'transparent',
                border: 'none',
                color: theme.colors.textPrimary,
                cursor: 'pointer',
                borderRadius: theme.borderRadius.md,
                transition: 'background 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = theme.colors.backgroundSecondary}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <ChevronLeft size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
              <Calendar size={20} color={theme.colors.primary} />
              <span style={{ fontSize: '16px', fontWeight: '600', color: theme.colors.textPrimary }}>
                {formatDate(weekDays[0])} - {formatDate(weekDays[6])}
              </span>
            </div>

            <button
              onClick={handleNextWeek}
              style={{
                padding: theme.spacing.sm,
                background: 'transparent',
                border: 'none',
                color: theme.colors.textPrimary,
                cursor: 'pointer',
                borderRadius: theme.borderRadius.md,
                transition: 'background 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = theme.colors.backgroundSecondary}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </Card>
      </div>

      {/* Week View */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(7, 1fr)', 
        gap: theme.spacing.md 
      }}>
        {weekDays.map((date, idx) => {
          const dayDeliveries = getDeliveriesForDate(date)
          const isTodayDate = isToday(date)

          return (
            <div key={idx}>
              {/* Day Header */}
              <div style={{
                padding: theme.spacing.sm,
                background: isTodayDate 
                  ? `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primaryHover})`
                  : theme.colors.backgroundSecondary,
                borderRadius: theme.borderRadius.md,
                marginBottom: theme.spacing.sm,
                textAlign: 'center'
              }}>
                <div style={{ 
                  fontSize: '12px', 
                  fontWeight: '600',
                  color: isTodayDate ? 'white' : theme.colors.textSecondary,
                  marginBottom: '2px'
                }}>
                  {formatDayName(date)}
                </div>
                <div style={{ 
                  fontSize: '20px', 
                  fontWeight: '700',
                  color: isTodayDate ? 'white' : theme.colors.textPrimary
                }}>
                  {date.getDate()}
                </div>
                {dayDeliveries.length > 0 && (
                  <div style={{
                    fontSize: '11px',
                    fontWeight: '600',
                    color: isTodayDate ? 'rgba(255,255,255,0.9)' : theme.colors.primary,
                    marginTop: '4px'
                  }}>
                    {dayDeliveries.length} {dayDeliveries.length === 1 ? 'delivery' : 'deliveries'}
                  </div>
                )}
              </div>

              {/* Deliveries */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xs }}>
                {dayDeliveries.length === 0 ? (
                  <div style={{
                    padding: theme.spacing.md,
                    background: theme.colors.backgroundSecondary,
                    borderRadius: theme.borderRadius.md,
                    textAlign: 'center',
                    fontSize: '12px',
                    color: theme.colors.textSecondary
                  }}>
                    No deliveries
                  </div>
                ) : (
                  dayDeliveries.map(delivery => (
                    <Card key={delivery.id} hover>
                      <div style={{ padding: '8px' }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: theme.spacing.xs,
                          marginBottom: theme.spacing.xs
                        }}>
                          <Clock size={12} color={theme.colors.textSecondary} />
                          <span style={{ fontSize: '12px', fontWeight: '600', color: theme.colors.textPrimary }}>
                            {delivery.time}
                          </span>
                        </div>

                        <div style={{
                          fontSize: '13px',
                          fontWeight: '600',
                          color: theme.colors.textPrimary,
                          marginBottom: '4px'
                        }}>
                          {delivery.material}
                        </div>

                        <div style={{ fontSize: '11px', color: theme.colors.textSecondary, marginBottom: '4px' }}>
                          {delivery.quantity}t
                        </div>

                        <div style={{
                          display: 'inline-block',
                          padding: '2px 6px',
                          background: `${statusConfig[delivery.status].color}20`,
                          borderRadius: theme.borderRadius.sm,
                          fontSize: '10px',
                          fontWeight: '600',
                          color: statusConfig[delivery.status].color
                        }}>
                          {statusConfig[delivery.status].label}
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: theme.spacing.lg
        }}>
          <div style={{
            background: theme.colors.backgroundPrimary,
            borderRadius: theme.borderRadius.lg,
            padding: theme.spacing.xl,
            maxWidth: '600px',
            width: '100%'
          }}>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: '700', 
              color: theme.colors.textPrimary,
              marginBottom: theme.spacing.lg 
            }}>
              Schedule New Delivery
            </h2>
            <p style={{ color: theme.colors.textSecondary, marginBottom: theme.spacing.lg }}>
              This feature will allow you to schedule deliveries with specific dates, times, and job sites.
            </p>
            <div style={{ display: 'flex', gap: theme.spacing.md }}>
              <button
                onClick={() => {
                  alert('Schedule Delivery functionality - Coming soon!')
                  setShowAddModal(false)
                }}
                style={{
                  flex: 1,
                  padding: theme.spacing.md,
                  background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primaryHover})`,
                  color: 'white',
                  border: 'none',
                  borderRadius: theme.borderRadius.md,
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                OK
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                style={{
                  padding: theme.spacing.md,
                  background: theme.colors.backgroundSecondary,
                  color: theme.colors.textPrimary,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: theme.borderRadius.md,
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  )
}

export default SchedulePage

