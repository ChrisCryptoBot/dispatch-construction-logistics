import React, { useState, useEffect } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import PageContainer from '../../components/PageContainer'
import Card from '../../components/Card'
import { 
  Calendar, ChevronLeft, ChevronRight, Plus, Filter, 
  Truck, User, Wrench, AlertTriangle, Clock, MapPin,
  Eye, EyeOff, Settings, Download, Upload, RefreshCw,
  CheckCircle, XCircle, AlertCircle, Info, Search,
  ArrowRight, ArrowLeft, CalendarDays, MoreHorizontal
} from 'lucide-react'
import CalendarSyncService from '../../services/calendarSync'
import NotificationService from '../../services/notificationService'
import type { CalendarEvent } from '../../types'

const CalendarPage = () => {
  const { theme } = useTheme()
  
  // State management
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<'week' | 'month' | 'day'>('week')
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [showEventModal, setShowEventModal] = useState(false)
  const [showNewEventModal, setShowNewEventModal] = useState(false)
  const [newEventForm, setNewEventForm] = useState({
    title: '',
    type: 'custom' as CalendarEvent['type'],
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    allDay: false,
    location: '',
    description: '',
    priority: 'medium' as CalendarEvent['priority']
  })
  const [filteredCategories, setFilteredCategories] = useState<string[]>(['load', 'maintenance', 'compliance', 'driver', 'meeting'])
  const [searchTerm, setSearchTerm] = useState('')
  const [syncService] = useState(() => CalendarSyncService.getInstance())
  const [notificationService] = useState(() => NotificationService.getInstance())
  const [showYearPicker, setShowYearPicker] = useState(false)
  const [showMonthPicker, setShowMonthPicker] = useState(false)
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())
  const [showMonthSelection, setShowMonthSelection] = useState(false)
  const [showTimeSlotModal, setShowTimeSlotModal] = useState(false)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{hour: number, minute: number} | null>(null)

  // Auto-sync events from various sources
  const [events, setEvents] = useState<CalendarEvent[]>([])

  // Initialize auto-sync on component mount
  useEffect(() => {
    // Subscribe to calendar sync updates
    const unsubscribe = syncService.subscribe((syncedEvents) => {
      setEvents(syncedEvents)
    })

    // Initialize with mock data for demonstration
    initializeMockData()

    // Start notification monitoring
    notificationService.startEventMonitoring(syncService)

    // Request notification permission
    notificationService.requestPermission()

    return () => {
      unsubscribe()
      notificationService.stopEventMonitoring()
    }
  }, [])

  // Initialize mock data for demonstration
  const initializeMockData = () => {
    // Mock loads
    const mockLoads = [
      {
        id: 'load-1',
        loadNumber: '12345',
        customer: 'ABC Manufacturing',
        pickupDate: new Date(2025, 0, 27, 8, 0),
        deliveryDate: new Date(2025, 0, 27, 16, 0),
        pickupLocation: 'Dallas, TX',
        deliveryLocation: 'Houston, TX',
        driver: 'John Smith',
        status: 'booked' as const,
        rate: 2500,
        equipment: 'Dry Van',
        specialInstructions: 'Handle with care - fragile cargo'
      },
      {
        id: 'load-2',
        loadNumber: '12346',
        customer: 'XYZ Corp',
        pickupDate: new Date(2025, 0, 28, 9, 0),
        deliveryDate: new Date(2025, 0, 28, 17, 0),
        pickupLocation: 'Houston, TX',
        deliveryLocation: 'Austin, TX',
        driver: 'Mike Johnson',
        status: 'booked' as const,
        rate: 3200,
        equipment: 'Flatbed'
      }
    ]

    // Mock maintenance
    const mockMaintenance = [
      {
        id: 'maintenance-1',
        vehicleId: 'truck-001',
        vehicleNumber: 'Truck #1',
        serviceType: 'Oil Change',
        scheduledDate: new Date(2025, 0, 27, 9, 0),
        estimatedDuration: 60,
        serviceProvider: 'Fleet Service Center',
        cost: 150,
        priority: 'medium' as const,
        description: 'Regular oil change service',
        status: 'scheduled' as const
      },
      {
        id: 'maintenance-2',
        vehicleId: 'truck-002',
        vehicleNumber: 'Truck #2',
        serviceType: 'DOT Inspection',
        scheduledDate: new Date(2025, 0, 28, 8, 0),
        estimatedDuration: 240,
        serviceProvider: 'DOT Inspection Station',
        cost: 300,
        priority: 'urgent' as const,
        description: 'Annual DOT inspection required',
        status: 'scheduled' as const
      }
    ]

    // Mock compliance
    const mockCompliance = [
      {
        id: 'compliance-1',
        type: 'insurance-renewal' as const,
        entity: 'Fleet Insurance',
        dueDate: new Date(2025, 0, 30),
        priority: 'high' as const,
        description: 'Fleet insurance renewal due',
        status: 'pending' as const
      }
    ]

    // Mock driver events
    const mockDrivers = [
      {
        id: 'driver-1',
        driverId: 'driver-001',
        driverName: 'John Smith',
        type: 'license-expiry' as const,
        dueDate: new Date(2025, 1, 5),
        priority: 'high' as const,
        description: 'CDL license renewal required',
        status: 'pending' as const
      }
    ]

    // Sync all data to calendar
    syncService.syncLoads(mockLoads)
    syncService.syncMaintenance(mockMaintenance)
    syncService.syncCompliance(mockCompliance)
    syncService.syncDrivers(mockDrivers)

    // Create notifications for new events
    mockLoads.forEach(load => {
      notificationService.createLoadBookingNotification(
        load.loadNumber,
        load.customer,
        load.pickupDate
      )
    })

    mockMaintenance.forEach(maintenance => {
      notificationService.createMaintenanceNotification(
        maintenance.vehicleNumber,
        maintenance.serviceType,
        maintenance.scheduledDate
      )
    })

    mockCompliance.forEach(compliance => {
      notificationService.createComplianceNotification(
        compliance.entity,
        compliance.type,
        compliance.dueDate
      )
    })

    mockDrivers.forEach(driver => {
      notificationService.createDriverNotification(
        driver.driverName,
        driver.type,
        driver.dueDate
      )
    })
  }

  // All mock data is now managed by the auto-sync system above
  // No legacy event arrays needed
  /* REMOVED LEGACY ARRAY:
      id: 'load-2',
      title: 'Load Delivery - Houston Site',
      type: 'load',
      start: new Date(2025, 0, 27, 14, 30),
      end: new Date(2025, 0, 27, 15, 30),
      status: 'scheduled',
      priority: 'high',
      location: 'Houston Construction Site',
      assignee: 'John Smith',
      vehicle: 'Truck #1',
      loadId: 'LT-1234',
      customer: 'ABC Construction',
      color: theme.colors.primary
    },
    {
      id: 'load-3',
      title: 'Load Pickup - Austin to San Antonio',
      type: 'load',
      start: new Date(2025, 0, 28, 10, 0),
      end: new Date(2025, 0, 28, 11, 0),
      status: 'scheduled',
      priority: 'medium',
      location: 'Austin Material Yard',
      assignee: 'Mike Johnson',
      vehicle: 'Truck #3',
      loadId: 'LT-1235',
      customer: 'XYZ Builders',
      color: theme.colors.primary
    },

    // Maintenance Events
    {
      id: 'maint-1',
      title: 'Oil Change - Truck #2',
      type: 'maintenance',
      start: new Date(2025, 0, 27, 9, 0),
      end: new Date(2025, 0, 27, 11, 0),
      status: 'scheduled',
      priority: 'medium',
      location: 'Maintenance Shop',
      vehicle: 'Truck #2',
      color: theme.colors.warning
    },
    {
      id: 'maint-2',
      title: 'DOT Inspection - Truck #4',
      type: 'maintenance',
      start: new Date(2025, 0, 28, 8, 0),
      end: new Date(2025, 0, 28, 12, 0),
      status: 'scheduled',
      priority: 'urgent',
      location: 'DOT Inspection Station',
      vehicle: 'Truck #4',
      color: theme.colors.error
    },

    // Compliance Events
    {
      id: 'comp-1',
      title: 'Insurance Renewal Due',
      type: 'compliance',
      start: new Date(2025, 0, 30),
      end: new Date(2025, 0, 30),
      allDay: true,
      status: 'scheduled',
      priority: 'high',
      description: 'Primary liability insurance renewal',
      color: theme.colors.error
    },
    {
      id: 'comp-2',
      title: 'Driver License Verification',
      type: 'compliance',
      start: new Date(2025, 1, 5),
      end: new Date(2025, 1, 5),
      allDay: true,
      status: 'scheduled',
      priority: 'medium',
      assignee: 'Sarah Davis',
      color: theme.colors.info
    },

    // Driver Events
    {
      id: 'driver-1',
      title: 'John Smith - Off Duty',
      type: 'driver',
      start: new Date(2025, 0, 29, 18, 0),
      end: new Date(2025, 0, 30, 6, 0),
      status: 'scheduled',
      priority: 'low',
      assignee: 'John Smith',
      color: theme.colors.textSecondary
    },
    {
      id: 'driver-2',
      title: 'Mike Johnson - Training',
      type: 'driver',
      start: new Date(2025, 0, 28, 14, 0),
      end: new Date(2025, 0, 28, 17, 0),
      status: 'scheduled',
      priority: 'medium',
      assignee: 'Mike Johnson',
      location: 'Training Center',
      color: theme.colors.info
    },

    // Meeting Events
    {
      id: 'meeting-1',
      title: 'Customer Meeting - ABC Construction',
      type: 'meeting',
      start: new Date(2025, 0, 29, 10, 0),
      end: new Date(2025, 0, 29, 11, 0),
      status: 'scheduled',
      priority: 'high',
      location: 'ABC Construction Office',
      customer: 'ABC Construction',
      color: theme.colors.accent
    }
  ])  END OF REMOVED LEGACY ARRAY */

  // Calendar navigation
  const navigateCalendar = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (view === 'week') {
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7))
    } else if (view === 'month') {
      newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1))
    } else {
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1))
    }
    setCurrentDate(newDate)
  }

  const goToToday = () => {
    setShowYearPicker(!showYearPicker)
    setShowMonthPicker(false)
    setShowMonthSelection(false)
  }

  const jumpToYear = (year: number) => {
    setSelectedYear(year)
    setShowYearPicker(false)
    setShowMonthSelection(true)
  }

  const jumpToMonth = (month: number) => {
    const newDate = new Date(currentDate)
    newDate.setFullYear(selectedYear)
    newDate.setMonth(month)
    setCurrentDate(newDate)
    setShowMonthPicker(false)
    setShowMonthSelection(false)
  }

  const jumpToToday = () => {
    setCurrentDate(new Date())
    setShowYearPicker(false)
    setShowMonthPicker(false)
    setShowMonthSelection(false)
  }

  const handleTimeSlotClick = (hour: number, minute: number = 0) => {
    setSelectedTimeSlot({ hour, minute })
    setShowTimeSlotModal(true)
  }

  const createAppointmentFromTimeSlot = (title: string, type: CalendarEvent['type'], duration: number = 60) => {
    if (!selectedTimeSlot) return

    const startTime = new Date(currentDate)
    startTime.setHours(selectedTimeSlot.hour, selectedTimeSlot.minute, 0, 0)
    
    const endTime = new Date(startTime)
    endTime.setMinutes(endTime.getMinutes() + duration)

    const newEvent: CalendarEvent = {
      id: `event-${Date.now()}`,
      title,
      type,
      start: startTime,
      end: endTime,
      allDay: false,
      color: getEventColor(type),
      priority: 'medium',
      description: `Appointment created at ${startTime.toLocaleTimeString()}`
    }

    setEvents(prev => [...prev, newEvent])
    setShowTimeSlotModal(false)
    setSelectedTimeSlot(null)
    
    // Show success notification
    if (notificationService) {
      notificationService.createLoadBookingNotification({
        title: 'Appointment Created',
        message: `${title} scheduled for ${startTime.toLocaleTimeString()}`,
        icon: '/icons/icon-192x192.png'
      })
    }
  }

  const getEventColor = (type: CalendarEvent['type']) => {
    const colors = {
      load: '#3B82F6',
      maintenance: '#F59E0B', 
      compliance: '#EF4444',
      driver: '#10B981',
      meeting: '#8B5CF6',
      custom: '#6B7280'
    }
    return colors[type] || colors.custom
  }

  // Get week dates
  const getWeekDates = (date: Date) => {
    const week = []
    const startOfWeek = new Date(date)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1) // Adjust for Monday start
    startOfWeek.setDate(diff)

    for (let i = 0; i < 7; i++) {
      const weekDay = new Date(startOfWeek)
      weekDay.setDate(startOfWeek.getDate() + i)
      week.push(weekDay)
    }
    return week
  }

  // Filter events
  const filteredEvents = events.filter(event => {
    const matchesCategory = filteredCategories.includes(event.type)
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.assignee?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // Get events for specific date
  const getEventsForDate = (date: Date) => {
    return filteredEvents.filter(event => {
      const eventDate = new Date(event.start)
      return eventDate.toDateString() === date.toDateString()
    })
  }

  // Get time slots for week view
  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = i
    const timeString = hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`
    return { hour, timeString }
  })

  // Event type configurations
  const eventTypes = {
    load: { label: 'Loads', icon: Truck, color: theme.colors.primary },
    maintenance: { label: 'Maintenance', icon: Wrench, color: theme.colors.warning },
    compliance: { label: 'Compliance', icon: AlertTriangle, color: theme.colors.error },
    driver: { label: 'Drivers', icon: User, color: theme.colors.info },
    meeting: { label: 'Meetings', icon: Calendar, color: theme.colors.accent },
    custom: { label: 'Custom', icon: Plus, color: theme.colors.textSecondary }
  }

  const getEventIcon = (type: string) => {
    const config = eventTypes[type as keyof typeof eventTypes]
    return config ? config.icon : Plus
  }


  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  const handleDayClick = (date: Date) => {
    setCurrentDate(date)
    setView('day')
  }

  const handleCreateEvent = () => {
    if (!newEventForm.title.trim()) {
      alert('Please enter an event title')
      return
    }

    if (!newEventForm.startDate) {
      alert('Please select a start date')
      return
    }

    const startDateTime = newEventForm.allDay 
      ? new Date(newEventForm.startDate)
      : new Date(`${newEventForm.startDate}T${newEventForm.startTime}`)
    
    const endDateTime = newEventForm.allDay 
      ? new Date(newEventForm.endDate || newEventForm.startDate)
      : new Date(`${newEventForm.endDate || newEventForm.startDate}T${newEventForm.endTime}`)

    const newEvent: CalendarEvent = {
      id: `event-${Date.now()}`,
      title: newEventForm.title,
      type: newEventForm.type,
      start: startDateTime,
      end: endDateTime,
      allDay: newEventForm.allDay,
      status: 'scheduled',
      priority: newEventForm.priority,
      location: newEventForm.location,
      description: newEventForm.description,
      color: getEventColor(newEventForm.type)
    }

    setEvents(prev => [...prev, newEvent])
    setShowNewEventModal(false)
    setNewEventForm({
      title: '',
      type: 'custom',
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      allDay: false,
      location: '',
      description: '',
      priority: 'medium'
    })
  }

  const weekDates = getWeekDates(currentDate)

  return (
    <PageContainer>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Calendar size={32} color={theme.colors.primary} />
          <div>
            <h1 style={{ 
              color: theme.colors.textPrimary, 
              fontSize: '28px', 
              fontWeight: 'bold', 
              margin: 0 
            }}>
              Calendar
            </h1>
            <p style={{ 
              color: theme.colors.textSecondary, 
              margin: '4px 0 0 0',
              fontSize: '14px'
            }}>
              Manage schedules, loads, and operations
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ display: 'flex', gap: '20px', height: 'calc(100vh - 200px)' }}>
        {/* Left Sidebar */}
        <div style={{
          width: '280px',
          background: theme.colors.background,
          borderRadius: '12px',
          border: `1px solid ${theme.colors.border}`,
          padding: '20px',
          overflow: 'hidden'
        }}>
              {/* Mini Calendar */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px'
                }}>
                  <button
                    onClick={goToToday}
                    style={{
                      background: theme.colors.primary,
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: '600',
                      padding: '8px 12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = theme.colors.accent
                      e.currentTarget.style.transform = 'scale(1.05)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = theme.colors.primary
                      e.currentTarget.style.transform = 'scale(1)'
                    }}
                  >
                    <CalendarDays size={16} />
                    {currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </button>
                </div>

                {/* Year Selection Grid */}
                {showYearPicker && (
                  <div style={{
                    marginBottom: '16px',
                    padding: '12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px',
                    border: `1px solid ${theme.colors.border}`
                  }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: theme.colors.textPrimary,
                      marginBottom: '12px',
                      textAlign: 'center'
                    }}>
                      Select Year
                    </div>
                    
                    {/* Go to Today Button */}
                    <button
                      onClick={jumpToToday}
                      style={{
                        width: '100%',
                        padding: '10px',
                        background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primary}dd 100%)`,
                        border: 'none',
                        borderRadius: '6px',
                        color: 'white',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        marginBottom: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.02)'
                        e.currentTarget.style.background = `linear-gradient(135deg, ${theme.colors.accent} 0%, ${theme.colors.accent}dd 100%)`
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)'
                        e.currentTarget.style.background = `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primary}dd 100%)`
                      }}
                    >
                      <CalendarDays size={14} />
                      Go to Today
                    </button>
                    
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: '6px',
                      marginBottom: '12px'
                    }}>
                      {Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - 10 + i).map(year => (
                        <button
                          key={year}
                          onClick={() => jumpToYear(year)}
                          style={{
                            padding: '8px 4px',
                            background: year === currentDate.getFullYear() 
                              ? theme.colors.primary 
                              : 'rgba(255, 255, 255, 0.05)',
                            border: `1px solid ${year === currentDate.getFullYear() 
                              ? theme.colors.primary 
                              : 'rgba(255, 255, 255, 0.1)'}`,
                            borderRadius: '6px',
                            color: year === currentDate.getFullYear() 
                              ? 'white' 
                              : theme.colors.textPrimary,
                            fontSize: '12px',
                            fontWeight: year === currentDate.getFullYear() ? '600' : '500',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            textAlign: 'center'
                          }}
                          onMouseEnter={(e) => {
                            if (year !== currentDate.getFullYear()) {
                              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                              e.currentTarget.style.transform = 'scale(1.05)'
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (year !== currentDate.getFullYear()) {
                              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                              e.currentTarget.style.transform = 'scale(1)'
                            }
                          }}
                        >
                          {year}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setShowYearPicker(false)}
                      style={{
                        width: '100%',
                        padding: '8px',
                        background: 'transparent',
                        border: `1px solid ${theme.colors.border}`,
                        borderRadius: '6px',
                        color: theme.colors.textSecondary,
                        fontSize: '12px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                        e.currentTarget.style.color = theme.colors.textPrimary
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                        e.currentTarget.style.color = theme.colors.textSecondary
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {/* Month Selection Grid */}
                {showMonthSelection && (
                  <div style={{
                    marginBottom: '16px',
                    padding: '12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px',
                    border: `1px solid ${theme.colors.border}`
                  }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: theme.colors.textPrimary,
                      marginBottom: '12px',
                      textAlign: 'center'
                    }}>
                      Select Month for {selectedYear}
                    </div>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '6px'
                    }}>
                      {[
                        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
                      ].map((month, index) => (
                        <button
                          key={month}
                          onClick={() => jumpToMonth(index)}
                          style={{
                            padding: '8px 4px',
                            background: index === currentDate.getMonth() && selectedYear === currentDate.getFullYear()
                              ? theme.colors.primary 
                              : 'rgba(255, 255, 255, 0.05)',
                            border: `1px solid ${index === currentDate.getMonth() && selectedYear === currentDate.getFullYear()
                              ? theme.colors.primary 
                              : 'rgba(255, 255, 255, 0.1)'}`,
                            borderRadius: '6px',
                            color: index === currentDate.getMonth() && selectedYear === currentDate.getFullYear()
                              ? 'white' 
                              : theme.colors.textPrimary,
                            fontSize: '12px',
                            fontWeight: index === currentDate.getMonth() && selectedYear === currentDate.getFullYear() ? '600' : '500',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            textAlign: 'center'
                          }}
                          onMouseEnter={(e) => {
                            if (!(index === currentDate.getMonth() && selectedYear === currentDate.getFullYear())) {
                              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                              e.currentTarget.style.transform = 'scale(1.05)'
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!(index === currentDate.getMonth() && selectedYear === currentDate.getFullYear())) {
                              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                              e.currentTarget.style.transform = 'scale(1)'
                            }
                          }}
                        >
                          {month}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setShowMonthSelection(false)}
                      style={{
                        width: '100%',
                        marginTop: '12px',
                        padding: '8px',
                        background: 'transparent',
                        border: `1px solid ${theme.colors.border}`,
                        borderRadius: '6px',
                        color: theme.colors.textSecondary,
                        fontSize: '12px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                        e.currentTarget.style.color = theme.colors.textPrimary
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                        e.currentTarget.style.color = theme.colors.textSecondary
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                )}
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  gap: '4px',
                  marginBottom: '8px'
                }}>
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                    <div key={day} style={{
                      padding: '4px',
                      textAlign: 'center',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: theme.colors.textSecondary
                    }}>
                      {day}
                    </div>
                  ))}
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  gap: '4px'
                }}>
                  {(() => {
                    const year = currentDate.getFullYear()
                    const month = currentDate.getMonth()
                    const firstDay = new Date(year, month, 1)
                    const lastDay = new Date(year, month + 1, 0)
                    const startDate = new Date(firstDay)
                    startDate.setDate(startDate.getDate() - firstDay.getDay())
                    
                    const days = []
                    for (let i = 0; i < 42; i++) {
                      const date = new Date(startDate)
                      date.setDate(startDate.getDate() + i)
                      days.push(date)
                    }
                    
                    return days.map((date, index) => {
                      const isCurrentMonth = date.getMonth() === month
                      const isToday = date.toDateString() === new Date().toDateString()
                      const isSelected = date.toDateString() === currentDate.toDateString()
                      const hasEvents = getEventsForDate(date).length > 0

                      return (
                        <button
                          key={index}
                          onClick={() => handleDayClick(date)}
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '6px',
                          border: 'none',
                          background: isSelected ? theme.colors.primary : 
                                    isToday ? `${theme.colors.primary}20` : 'transparent',
                          color: isSelected ? 'white' : 
                                isToday ? theme.colors.primary :
                                isCurrentMonth ? theme.colors.textPrimary : theme.colors.textSecondary,
                          fontSize: '12px',
                          fontWeight: isToday ? '600' : '400',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.background = theme.colors.backgroundHover
                            e.currentTarget.style.transform = 'scale(1.1)'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.background = isToday ? `${theme.colors.primary}20` : 'transparent'
                            e.currentTarget.style.transform = 'scale(1)'
                          }
                        }}
                      >
                        {date.getDate()}
                        {hasEvents && (
                          <div style={{
                            position: 'absolute',
                            bottom: '2px',
                            width: '4px',
                            height: '4px',
                            borderRadius: '50%',
                            background: theme.colors.primary
                          }} />
                        )}
                        </button>
                      )
                    })
                  })()}
                </div>
              </div>

              {/* Event Categories */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{
                  color: theme.colors.textPrimary,
                  fontSize: '14px',
                  fontWeight: '600',
                  margin: '0 0 12px 0'
                }}>
                  Categories
                </h4>
                {Object.entries(eventTypes).map(([type, config]) => {
                  const Icon = config.icon
                  const isFiltered = filteredCategories.includes(type)
                  
                  return (
                    <label
                      key={type}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'background 0.2s ease',
                        background: isFiltered ? theme.colors.backgroundHover : 'transparent'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isFiltered}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilteredCategories(prev => [...prev, type])
                          } else {
                            setFilteredCategories(prev => prev.filter(cat => cat !== type))
                          }
                        }}
                        style={{
                          width: '16px',
                          height: '16px',
                          cursor: 'pointer'
                        }}
                      />
                      <Icon size={16} color={config.color} />
                      <span style={{
                        fontSize: '13px',
                        color: theme.colors.textPrimary,
                        textTransform: 'capitalize'
                      }}>
                        {config.label}
                      </span>
                    </label>
                  )
                })}
              </div>

              {/* Quick Stats */}
              <div>
                <h4 style={{
                  color: theme.colors.textPrimary,
                  fontSize: '14px',
                  fontWeight: '600',
                  margin: '0 0 12px 0'
                }}>
                  Today's Overview
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {Object.entries(eventTypes).map(([type, config]) => {
                    const Icon = config.icon
                    const todayEvents = getEventsForDate(new Date()).filter(e => e.type === type)
                    
                    if (todayEvents.length === 0) return null
                    
                    return (
                      <div
                        key={type}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px',
                          background: theme.colors.backgroundHover,
                          borderRadius: '6px'
                        }}
                      >
                        <Icon size={14} color={config.color} />
                        <span style={{
                          fontSize: '12px',
                          color: theme.colors.textPrimary,
                          fontWeight: '500'
                        }}>
                          {todayEvents.length} {config.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
        </div>

        {/* Main Calendar View */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Calendar Header */}
          <Card padding="16px" style={{ marginBottom: '16px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 
                onClick={() => {
                  if (view === 'month') {
                    setSelectedYear(currentDate.getFullYear())
                    setShowMonthPicker(true)
                    setShowYearPicker(false)
                  }
                }}
                style={{
                  color: theme.colors.textPrimary,
                  fontSize: '20px',
                  fontWeight: 'bold',
                  margin: 0,
                  cursor: view === 'month' ? 'pointer' : 'default',
                  transition: view === 'month' ? 'color 0.2s ease' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (view === 'month') {
                    e.currentTarget.style.color = theme.colors.primary
                  }
                }}
                onMouseLeave={(e) => {
                  if (view === 'month') {
                    e.currentTarget.style.color = theme.colors.textPrimary
                  }
                }}
              >
                {view === 'week' && `${formatDate(weekDates[0])} - ${formatDate(weekDates[6])}`}
                {view === 'month' && currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                {view === 'day' && formatDate(currentDate)}
              </h2>

              {/* Search */}
              <div style={{ position: 'relative', minWidth: '250px' }}>
                <Search size={18} color={theme.colors.textSecondary} style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)'
                }} />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 12px 12px 42px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea'
                    e.target.style.background = 'rgba(255, 255, 255, 0.08)'
                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                    e.target.style.background = 'rgba(255, 255, 255, 0.05)'
                    e.target.style.boxShadow = 'none'
                  }}
                />
              </div>
            </div>
          </Card>

          {/* Calendar Grid */}
          <Card padding="0" style={{ flex: 1, overflow: 'hidden' }}>
            {view === 'day' && (
              <div style={{ display: 'flex', height: '100%' }}>
                {/* Time Column */}
                <div style={{
                  width: '80px',
                  borderRight: `1px solid ${theme.colors.border}`,
                  padding: '12px 8px'
                }}>
                  {timeSlots.map(({ hour, timeString }) => (
                    <div
                      key={hour}
                      style={{
                        height: '60px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'flex-end',
                        paddingRight: '8px',
                        fontSize: '12px',
                        color: theme.colors.textSecondary,
                        borderBottom: hour < 23 ? `1px solid ${theme.colors.border}20` : 'none'
                      }}
                    >
                      {timeString}
                    </div>
                  ))}
                </div>

                {/* Day Content */}
                <div style={{ flex: 1, position: 'relative', borderRight: `1px solid ${theme.colors.border}` }}>
                  {/* Day Header */}
                  <div style={{
                    padding: '12px',
                    borderBottom: `1px solid ${theme.colors.border}`,
                    textAlign: 'center',
                    background: `${theme.colors.primary}10`
                  }}>
                    <div style={{
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: theme.colors.primary,
                      marginBottom: '4px'
                    }}>
                      {currentDate.toLocaleDateString('en-US', { weekday: 'long' })}
                    </div>
                    <div style={{
                      fontSize: '24px',
                      fontWeight: 'bold',
                      color: theme.colors.textPrimary
                    }}>
                      {currentDate.getDate()}
                    </div>
                    <div 
                      onClick={() => {
                        setSelectedYear(currentDate.getFullYear())
                        setShowMonthPicker(true)
                        setShowYearPicker(false)
                      }}
                      style={{
                        fontSize: '14px',
                        color: theme.colors.textSecondary,
                        cursor: 'pointer',
                        transition: 'color 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = theme.colors.primary
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = theme.colors.textSecondary
                      }}
                    >
                      {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </div>
                  </div>

                  {/* All Day Events */}
                  {getEventsForDate(currentDate).filter(event => event.allDay).map(event => (
                    <div
                      key={event.id}
                      style={{
                        background: event.color,
                        color: 'white',
                        padding: '8px 12px',
                        margin: '8px',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '500',
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        setSelectedEvent(event)
                        setShowEventModal(true)
                      }}
                    >
                      {event.title}
                    </div>
                  ))}

                  {/* Time Slots */}
                  <div style={{ position: 'relative' }}>
                    {timeSlots.map(({ hour }) => (
                      <div
                        key={hour}
                        onClick={() => handleTimeSlotClick(hour, 0)}
                        style={{
                          height: '60px',
                          borderBottom: hour < 23 ? `1px solid ${theme.colors.border}20` : 'none',
                          position: 'relative',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent'
                        }}
                      />
                    ))}

                    {/* Events */}
                    {getEventsForDate(currentDate).filter(event => !event.allDay).map(event => {
                      const startHour = event.start.getHours() + event.start.getMinutes() / 60
                      const endHour = event.end.getHours() + event.end.getMinutes() / 60
                      const duration = endHour - startHour
                      const top = (startHour * 60) + 12
                      
                      return (
                        <div
                          key={event.id}
                          onClick={() => {
                            setSelectedEvent(event)
                            setShowEventModal(true)
                          }}
                          style={{
                            position: 'absolute',
                            top: `${top}px`,
                            left: '8px',
                            right: '8px',
                            height: `${Math.max(duration * 60, 20)}px`,
                            background: event.color,
                            color: 'white',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            fontSize: '11px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                          }}
                        >
                          <div style={{ fontWeight: '600' }}>{event.title}</div>
                          <div style={{ fontSize: '10px', opacity: 0.9 }}>
                            {formatTime(event.start)} - {formatTime(event.end)}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Agenda Bar */}
                <div style={{
                  width: '280px',
                  background: theme.colors.backgroundCard,
                  borderLeft: `1px solid ${theme.colors.border}`,
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  {/* Agenda Header */}
                  <div style={{
                    padding: '16px',
                    borderBottom: `1px solid ${theme.colors.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <h3 style={{
                      margin: 0,
                      fontSize: '16px',
                      fontWeight: '600',
                      color: theme.colors.textPrimary
                    }}>
                      Agenda
                    </h3>
                    <button
                      onClick={() => setShowNewEventModal(true)}
                      style={{
                        padding: '8px',
                        background: theme.colors.primary,
                        border: 'none',
                        borderRadius: '6px',
                        color: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = theme.colors.accent
                        e.currentTarget.style.transform = 'scale(1.05)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = theme.colors.primary
                        e.currentTarget.style.transform = 'scale(1)'
                      }}
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  {/* Agenda Content */}
                  <div style={{ flex: 1, padding: '16px', overflow: 'auto' }}>
                    {/* Today's Events */}
                    <div style={{ marginBottom: '20px' }}>
                      <h4 style={{
                        margin: '0 0 12px 0',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: theme.colors.textPrimary,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <Calendar size={16} />
                        Today ({currentDate.getDate()})
                      </h4>
                      
                      {getEventsForDate(currentDate).length === 0 ? (
                        <p style={{
                          margin: 0,
                          fontSize: '13px',
                          color: theme.colors.textSecondary,
                          fontStyle: 'italic'
                        }}>
                          No events today
                        </p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {getEventsForDate(currentDate).map(event => (
                            <div
                              key={event.id}
                              onClick={() => {
                                setSelectedEvent(event)
                                setShowEventModal(true)
                              }}
                              style={{
                                padding: '12px',
                                background: `${event.color}20`,
                                border: `1px solid ${event.color}40`,
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = `${event.color}30`
                                e.currentTarget.style.transform = 'translateY(-1px)'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = `${event.color}20`
                                e.currentTarget.style.transform = 'translateY(0)'
                              }}
                            >
                              <div style={{
                                fontSize: '13px',
                                fontWeight: '600',
                                color: event.color,
                                marginBottom: '4px'
                              }}>
                                {event.title}
                              </div>
                              <div style={{
                                fontSize: '12px',
                                color: theme.colors.textSecondary
                              }}>
                                {formatTime(event.start)} - {formatTime(event.end)}
                              </div>
                              {event.location && (
                                <div style={{
                                  fontSize: '11px',
                                  color: theme.colors.textSecondary,
                                  marginTop: '4px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}>
                                  <MapPin size={12} />
                                  {event.location}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Tomorrow's Events */}
                    <div style={{ marginBottom: '20px' }}>
                      <h4 style={{
                        margin: '0 0 12px 0',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: theme.colors.textPrimary,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <Clock size={16} />
                        Tomorrow
                      </h4>
                      
                      {(() => {
                        const tomorrow = new Date(currentDate)
                        tomorrow.setDate(tomorrow.getDate() + 1)
                        const tomorrowEvents = getEventsForDate(tomorrow)
                        
                        return tomorrowEvents.length === 0 ? (
                          <p style={{
                            margin: 0,
                            fontSize: '13px',
                            color: theme.colors.textSecondary,
                            fontStyle: 'italic'
                          }}>
                            No events tomorrow
                          </p>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {tomorrowEvents.map(event => (
                              <div
                                key={event.id}
                                onClick={() => {
                                  setSelectedEvent(event)
                                  setShowEventModal(true)
                                }}
                                style={{
                                  padding: '12px',
                                  background: `${event.color}20`,
                                  border: `1px solid ${event.color}40`,
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = `${event.color}30`
                                  e.currentTarget.style.transform = 'translateY(-1px)'
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = `${event.color}20`
                                  e.currentTarget.style.transform = 'translateY(0)'
                                }}
                              >
                                <div style={{
                                  fontSize: '13px',
                                  fontWeight: '600',
                                  color: event.color,
                                  marginBottom: '4px'
                                }}>
                                  {event.title}
                                </div>
                                <div style={{
                                  fontSize: '12px',
                                  color: theme.colors.textSecondary
                                }}>
                                  {formatTime(event.start)} - {formatTime(event.end)}
                                </div>
                              </div>
                            ))}
                          </div>
                        )
                      })()}
                    </div>

                    {/* This Week's Events */}
                    <div>
                      <h4 style={{
                        margin: '0 0 12px 0',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: theme.colors.textPrimary,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <Calendar size={16} />
                        This Week
                      </h4>
                      
                      {(() => {
                        const weekEvents = []
                        const startOfWeek = new Date(currentDate)
                        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
                        
                        for (let i = 0; i < 7; i++) {
                          const date = new Date(startOfWeek)
                          date.setDate(startOfWeek.getDate() + i)
                          const events = getEventsForDate(date)
                          if (events.length > 0) {
                            weekEvents.push(...events.map(event => ({
                              ...event,
                              date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                            })))
                          }
                        }
                        
                        return weekEvents.length === 0 ? (
                          <p style={{
                            margin: 0,
                            fontSize: '13px',
                            color: theme.colors.textSecondary,
                            fontStyle: 'italic'
                          }}>
                            No events this week
                          </p>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {weekEvents.slice(0, 5).map(event => (
                              <div
                                key={event.id}
                                onClick={() => {
                                  setSelectedEvent(event)
                                  setShowEventModal(true)
                                }}
                                style={{
                                  padding: '10px',
                                  background: `${event.color}15`,
                                  border: `1px solid ${event.color}30`,
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = `${event.color}25`
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = `${event.color}15`
                                }}
                              >
                                <div style={{
                                  fontSize: '12px',
                                  fontWeight: '600',
                                  color: event.color,
                                  marginBottom: '2px'
                                }}>
                                  {event.title}
                                </div>
                                <div style={{
                                  fontSize: '11px',
                                  color: theme.colors.textSecondary
                                }}>
                                  {(event as any).date} • {formatTime(event.start)}
                                </div>
                              </div>
                            ))}
                            {weekEvents.length > 5 && (
                              <p style={{
                                margin: '8px 0 0 0',
                                fontSize: '12px',
                                color: theme.colors.textSecondary,
                                fontStyle: 'italic'
                              }}>
                                +{weekEvents.length - 5} more events
                              </p>
                            )}
                          </div>
                        )
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {view === 'week' && (
              <div style={{ display: 'flex', height: '100%' }}>
                {/* Time Column */}
                <div style={{
                  width: '80px',
                  borderRight: `1px solid ${theme.colors.border}`,
                  padding: '12px 8px'
                }}>
                  {timeSlots.map(({ hour, timeString }) => (
                    <div
                      key={hour}
                      style={{
                        height: '60px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'flex-end',
                        paddingRight: '8px',
                        fontSize: '12px',
                        color: theme.colors.textSecondary,
                        borderBottom: hour < 23 ? `1px solid ${theme.colors.border}20` : 'none'
                      }}
                    >
                      {timeString}
                    </div>
                  ))}
                </div>

                {/* Days Grid */}
                <div style={{ flex: 1, display: 'flex' }}>
                  {weekDates.map((date, dayIndex) => {
                    const dayEvents = getEventsForDate(date).filter(event => !event.allDay)
                    
                    return (
                      <div
                        key={dayIndex}
                        style={{
                          flex: 1,
                          borderRight: dayIndex < 6 ? `1px solid ${theme.colors.border}` : 'none',
                          position: 'relative'
                        }}
                      >
                        {/* Day Header */}
                        <div style={{
                          padding: '12px',
                          borderBottom: `1px solid ${theme.colors.border}`,
                          textAlign: 'center',
                          background: date.toDateString() === new Date().toDateString() 
                            ? `${theme.colors.primary}10` 
                            : 'transparent'
                        }}>
                          <div style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: theme.colors.textPrimary,
                            marginBottom: '4px'
                          }}>
                            {date.toLocaleDateString('en-US', { weekday: 'short' })}
                          </div>
                          <div style={{
                            fontSize: '18px',
                            fontWeight: 'bold',
                            color: date.toDateString() === new Date().toDateString() 
                              ? theme.colors.primary 
                              : theme.colors.textPrimary
                          }}>
                            {date.getDate()}
                          </div>
                        </div>

                        {/* All Day Events */}
                        {getEventsForDate(date).filter(event => event.allDay).map(event => (
                          <div
                            key={event.id}
                            style={{
                              background: event.color,
                              color: 'white',
                              padding: '4px 8px',
                              margin: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: '500',
                              cursor: 'pointer'
                            }}
                            onClick={() => {
                              setSelectedEvent(event)
                              setShowEventModal(true)
                            }}
                          >
                            {event.title}
                          </div>
                        ))}

                        {/* Time Slots */}
                        <div style={{ position: 'relative' }}>
                          {timeSlots.map(({ hour }) => (
                            <div
                              key={hour}
                              style={{
                                height: '60px',
                                borderBottom: hour < 23 ? `1px solid ${theme.colors.border}20` : 'none',
                                position: 'relative'
                              }}
                            />
                          ))}

                          {/* Events */}
                          {dayEvents.map(event => {
                            const startHour = event.start.getHours() + event.start.getMinutes() / 60
                            const endHour = event.end.getHours() + event.end.getMinutes() / 60
                            const duration = endHour - startHour
                            const top = (startHour * 60) + 12 // 12px for header
                            
                            return (
                              <div
                                key={event.id}
                                onClick={() => {
                                  setSelectedEvent(event)
                                  setShowEventModal(true)
                                }}
                                style={{
                                  position: 'absolute',
                                  top: `${top}px`,
                                  left: '8px',
                                  right: '8px',
                                  height: `${Math.max(duration * 60, 20)}px`,
                                  background: event.color,
                                  color: 'white',
                                  borderRadius: '4px',
                                  padding: '4px 8px',
                                  fontSize: '11px',
                                  fontWeight: '500',
                                  cursor: 'pointer',
                                  overflow: 'hidden',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  justifyContent: 'space-between',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                }}
                              >
                                <div style={{ fontWeight: '600' }}>{event.title}</div>
                                <div style={{ fontSize: '10px', opacity: 0.9 }}>
                                  {formatTime(event.start)} - {formatTime(event.end)}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Agenda Sidebar */}
                <div style={{
                  width: '280px',
                  borderLeft: `1px solid ${theme.colors.border}`,
                  background: theme.colors.background,
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  {/* Agenda Header */}
                  <div style={{
                    padding: '16px',
                    borderBottom: `1px solid ${theme.colors.border}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <h3 style={{
                      color: theme.colors.textPrimary,
                      fontSize: '16px',
                      fontWeight: 'bold',
                      margin: 0
                    }}>
                      Agenda
                    </h3>
                    <button
                      onClick={() => setShowNewEventModal(true)}
                      style={{
                        padding: '6px 12px',
                        background: theme.colors.primary,
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = theme.colors.accent
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = theme.colors.primary
                      }}
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Agenda Content */}
                  <div style={{ flex: 1, padding: '16px', overflow: 'auto' }}>
                    {/* Today's Events */}
                    <div style={{ marginBottom: '20px' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '12px'
                      }}>
                        <div style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: theme.colors.primary
                        }} />
                        <h4 style={{
                          color: theme.colors.textPrimary,
                          fontSize: '13px',
                          fontWeight: '600',
                          margin: 0
                        }}>
                          Today {new Date().getDate()}
                        </h4>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {getEventsForDate(new Date()).map(event => (
                          <div
                            key={event.id}
                            onClick={() => {
                              setSelectedEvent(event)
                              setShowEventModal(true)
                            }}
                            style={{
                              padding: '8px',
                              background: theme.colors.cardBackground,
                              border: `1px solid ${theme.colors.border}`,
                              borderRadius: '6px',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = event.color
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = theme.colors.border
                            }}
                          >
                            <div style={{
                              fontSize: '12px',
                              fontWeight: '600',
                              color: theme.colors.textPrimary,
                              marginBottom: '2px'
                            }}>
                              {event.title}
                            </div>
                            <div style={{
                              fontSize: '10px',
                              color: theme.colors.textSecondary
                            }}>
                              {event.allDay ? 'All-day' : `${formatTime(event.start)} - ${formatTime(event.end)}`}
                            </div>
                          </div>
                        ))}
                        {getEventsForDate(new Date()).length === 0 && (
                          <div style={{
                            padding: '12px',
                            textAlign: 'center',
                            color: theme.colors.textSecondary,
                            fontSize: '11px'
                          }}>
                            No events today
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Tomorrow's Events */}
                    <div style={{ marginBottom: '20px' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '12px'
                      }}>
                        <div style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: theme.colors.info
                        }} />
                        <h4 style={{
                          color: theme.colors.textPrimary,
                          fontSize: '13px',
                          fontWeight: '600',
                          margin: 0
                        }}>
                          Tomorrow
                        </h4>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {getEventsForDate(new Date(Date.now() + 24 * 60 * 60 * 1000)).map(event => (
                          <div
                            key={event.id}
                            onClick={() => {
                              setSelectedEvent(event)
                              setShowEventModal(true)
                            }}
                            style={{
                              padding: '8px',
                              background: theme.colors.cardBackground,
                              border: `1px solid ${theme.colors.border}`,
                              borderRadius: '6px',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = event.color
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = theme.colors.border
                            }}
                          >
                            <div style={{
                              fontSize: '12px',
                              fontWeight: '600',
                              color: theme.colors.textPrimary,
                              marginBottom: '2px'
                            }}>
                              {event.title}
                            </div>
                            <div style={{
                              fontSize: '10px',
                              color: theme.colors.textSecondary
                            }}>
                              {event.allDay ? 'All-day' : `${formatTime(event.start)} - ${formatTime(event.end)}`}
                            </div>
                          </div>
                        ))}
                        {getEventsForDate(new Date(Date.now() + 24 * 60 * 60 * 1000)).length === 0 && (
                          <div style={{
                            padding: '12px',
                            textAlign: 'center',
                            color: theme.colors.textSecondary,
                            fontSize: '11px'
                          }}>
                            No events tomorrow
                          </div>
                        )}
                      </div>
                    </div>

                    {/* This Week Events */}
                    <div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '12px'
                      }}>
                        <div style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: theme.colors.warning
                        }} />
                        <h4 style={{
                          color: theme.colors.textPrimary,
                          fontSize: '13px',
                          fontWeight: '600',
                          margin: 0
                        }}>
                          This Week
                        </h4>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {events
                          .filter(event => {
                            const eventDate = new Date(event.start)
                            const today = new Date()
                            const weekEnd = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
                            return eventDate > weekEnd && eventDate <= new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000)
                          })
                          .slice(0, 3)
                          .map(event => (
                          <div
                            key={event.id}
                            onClick={() => {
                              setSelectedEvent(event)
                              setShowEventModal(true)
                            }}
                            style={{
                              padding: '8px',
                              background: theme.colors.cardBackground,
                              border: `1px solid ${theme.colors.border}`,
                              borderRadius: '6px',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = event.color
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = theme.colors.border
                            }}
                          >
                            <div style={{
                              fontSize: '12px',
                              fontWeight: '600',
                              color: theme.colors.textPrimary,
                              marginBottom: '2px'
                            }}>
                              {event.title}
                            </div>
                            <div style={{
                              fontSize: '10px',
                              color: theme.colors.textSecondary
                            }}>
                              {formatDate(event.start)} • {event.allDay ? 'All-day' : formatTime(event.start)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {view === 'month' && (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Month Grid */}
                <div style={{ flex: 1, padding: '20px' }}>
                  {/* Days of Week Header */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gap: '1px',
                    marginBottom: '8px'
                  }}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div
                        key={day}
                        style={{
                          padding: '12px',
                          textAlign: 'center',
                          fontSize: '14px',
                          fontWeight: '600',
                          color: theme.colors.textSecondary,
                          background: theme.colors.background
                        }}
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Month Calendar Grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gap: '1px',
                    background: theme.colors.border
                  }}>
                    {(() => {
                      const year = currentDate.getFullYear()
                      const month = currentDate.getMonth()
                      const firstDay = new Date(year, month, 1)
                      const startDate = new Date(firstDay)
                      startDate.setDate(startDate.getDate() - firstDay.getDay())
                      
                      const days = []
                      for (let i = 0; i < 42; i++) {
                        const date = new Date(startDate)
                        date.setDate(startDate.getDate() + i)
                        days.push(date)
                      }
                      
                      return days.map((date, index) => {
                        const isCurrentMonth = date.getMonth() === month
                        const isToday = date.toDateString() === new Date().toDateString()
                        const dayEvents = getEventsForDate(date)
                        
                        return (
                          <div
                            key={index}
                            onClick={() => handleDayClick(date)}
                            style={{
                              minHeight: '120px',
                              padding: '8px',
                              background: theme.colors.cardBackground,
                              border: `1px solid ${theme.colors.border}`,
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              position: 'relative'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = theme.colors.backgroundHover
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = theme.colors.cardBackground
                            }}
                          >
                            {/* Day Number */}
                            <div style={{
                              fontSize: '14px',
                              fontWeight: isToday ? 'bold' : '500',
                              color: isCurrentMonth 
                                ? (isToday ? theme.colors.primary : theme.colors.textPrimary)
                                : theme.colors.textSecondary,
                              marginBottom: '4px'
                            }}>
                              {date.getDate()}
                            </div>
                            
                            {/* Events */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              {dayEvents.slice(0, 3).map(event => (
                                <div
                                  key={event.id}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setSelectedEvent(event)
                                    setShowEventModal(true)
                                  }}
                                  style={{
                                    fontSize: '10px',
                                    padding: '2px 4px',
                                    background: event.color,
                                    color: 'white',
                                    borderRadius: '3px',
                                    cursor: 'pointer',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  {event.title}
                                </div>
                              ))}
                              {dayEvents.length > 3 && (
                                <div style={{
                                  fontSize: '10px',
                                  color: theme.colors.textSecondary,
                                  textAlign: 'center'
                                }}>
                                  +{dayEvents.length - 3} more
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })
                    })()}
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Event Detail Modal */}
      {showEventModal && selectedEvent && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={() => setShowEventModal(false)}
        >
          <div
            style={{
              background: theme.colors.cardBackground,
              borderRadius: '16px',
              maxWidth: '500px',
              width: '100%',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              padding: '24px',
              borderBottom: `1px solid ${theme.colors.border}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start'
            }}>
              <div style={{ flex: 1 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '12px'
                }}>
                  {React.createElement(getEventIcon(selectedEvent.type), {
                    size: 24,
                    color: selectedEvent.color
                  })}
                  <h2 style={{
                    color: theme.colors.textPrimary,
                    fontSize: '20px',
                    fontWeight: 'bold',
                    margin: 0,
                    flex: 1
                  }}>
                    {selectedEvent.title}
                  </h2>
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px'
                }}>
                  <Clock size={16} color={theme.colors.textSecondary} />
                  <span style={{ color: theme.colors.textSecondary, fontSize: '14px' }}>
                    {selectedEvent.allDay 
                      ? 'All Day' 
                      : `${formatTime(selectedEvent.start)} - ${formatTime(selectedEvent.end)}`
                    }
                  </span>
                </div>

                {selectedEvent.location && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px'
                  }}>
                    <MapPin size={16} color={theme.colors.textSecondary} />
                    <span style={{ color: theme.colors.textSecondary, fontSize: '14px' }}>
                      {selectedEvent.location}
                    </span>
                  </div>
                )}

                {selectedEvent.assignee && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px'
                  }}>
                    <User size={16} color={theme.colors.textSecondary} />
                    <span style={{ color: theme.colors.textSecondary, fontSize: '14px' }}>
                      {selectedEvent.assignee}
                    </span>
                  </div>
                )}

                {selectedEvent.vehicle && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px'
                  }}>
                    <Truck size={16} color={theme.colors.textSecondary} />
                    <span style={{ color: theme.colors.textSecondary, fontSize: '14px' }}>
                      {selectedEvent.vehicle}
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowEventModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: theme.colors.textSecondary,
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <XCircle size={24} />
              </button>
            </div>

            {selectedEvent.description && (
              <div style={{ padding: '20px 24px' }}>
                <h4 style={{
                  color: theme.colors.textPrimary,
                  fontSize: '14px',
                  fontWeight: '600',
                  margin: '0 0 8px 0'
                }}>
                  Description
                </h4>
                <p style={{
                  color: theme.colors.textSecondary,
                  fontSize: '14px',
                  margin: 0,
                  lineHeight: 1.5
                }}>
                  {selectedEvent.description}
                </p>
              </div>
            )}

            <div style={{
              padding: '16px 24px',
              borderTop: `1px solid ${theme.colors.border}`,
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px'
            }}>
              <button
                onClick={() => setShowEventModal(false)}
                style={{
                  padding: '10px 20px',
                  background: 'transparent',
                  color: theme.colors.textSecondary,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
              <button
                style={{
                  padding: '10px 20px',
                  background: theme.colors.primary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Edit Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Event Modal */}
      {showNewEventModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={() => setShowNewEventModal(false)}
        >
          <div
            style={{
              background: theme.colors.cardBackground,
              borderRadius: '16px',
              maxWidth: '600px',
              width: '100%',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              padding: '24px',
              borderBottom: `1px solid ${theme.colors.border}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{ color: theme.colors.textPrimary, fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
                Create New Event
              </h2>
              <button
                onClick={() => setShowNewEventModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: theme.colors.textSecondary,
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <XCircle size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Event Title */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                    Event Title *
                  </label>
                  <input
                    type="text"
                    value={newEventForm.title}
                    onChange={(e) => setNewEventForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter event title"
                        style={{
                          width: '100%',
                          padding: '12px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '8px',
                          color: '#FFFFFF',
                          fontSize: '14px',
                          outline: 'none',
                          transition: 'all 0.2s ease'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#667eea'
                          e.target.style.background = 'rgba(255, 255, 255, 0.08)'
                          e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                          e.target.style.background = 'rgba(255, 255, 255, 0.05)'
                          e.target.style.boxShadow = 'none'
                        }}
                        />
                </div>

                {/* Event Type */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                    Event Type
                  </label>
                  <select
                    value={newEventForm.type}
                    onChange={(e) => setNewEventForm(prev => ({ ...prev, type: e.target.value as CalendarEvent['type'] }))}
                        style={{
                          width: '100%',
                          padding: '12px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '8px',
                          color: '#FFFFFF',
                          fontSize: '14px',
                          outline: 'none',
                          transition: 'all 0.2s ease'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#667eea'
                          e.target.style.background = 'rgba(255, 255, 255, 0.08)'
                          e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                          e.target.style.background = 'rgba(255, 255, 255, 0.05)'
                          e.target.style.boxShadow = 'none'
                        }}
                        >
                    <option value="custom" style={{ background: '#1a1a1a', color: '#FFFFFF' }}>Custom</option>
                    <option value="load" style={{ background: '#1a1a1a', color: '#FFFFFF' }}>Load</option>
                    <option value="maintenance" style={{ background: '#1a1a1a', color: '#FFFFFF' }}>Maintenance</option>
                    <option value="compliance" style={{ background: '#1a1a1a', color: '#FFFFFF' }}>Compliance</option>
                    <option value="driver" style={{ background: '#1a1a1a', color: '#FFFFFF' }}>Driver</option>
                    <option value="meeting" style={{ background: '#1a1a1a', color: '#FFFFFF' }}>Meeting</option>
                  </select>
                </div>

                {/* All Day Toggle */}
                <div>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                    padding: '12px',
                    background: theme.colors.background,
                    borderRadius: '8px',
                    border: `1px solid ${theme.colors.border}`
                  }}>
                    <input
                      type="checkbox"
                      checked={newEventForm.allDay}
                      onChange={(e) => setNewEventForm(prev => ({ ...prev, allDay: e.target.checked }))}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '14px', fontWeight: '500', color: theme.colors.textPrimary }}>
                      All Day Event
                    </span>
                  </label>
                </div>

                {/* Date and Time */}
                <div style={{ display: 'grid', gridTemplateColumns: newEventForm.allDay ? '1fr 1fr' : '1fr 1fr 1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={newEventForm.startDate}
                      onChange={(e) => setNewEventForm(prev => ({ ...prev, startDate: e.target.value }))}
                        style={{
                          width: '100%',
                          padding: '12px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '8px',
                          color: '#FFFFFF',
                          fontSize: '14px',
                          outline: 'none',
                          transition: 'all 0.2s ease'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#667eea'
                          e.target.style.background = 'rgba(255, 255, 255, 0.08)'
                          e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                          e.target.style.background = 'rgba(255, 255, 255, 0.05)'
                          e.target.style.boxShadow = 'none'
                        }}
                        />
                  </div>
                  
                  {!newEventForm.allDay && (
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={newEventForm.startTime}
                        onChange={(e) => setNewEventForm(prev => ({ ...prev, startTime: e.target.value }))}
                        style={{
                          width: '100%',
                          padding: '12px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '8px',
                          color: '#FFFFFF',
                          fontSize: '14px',
                          outline: 'none',
                          transition: 'all 0.2s ease'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#667eea'
                          e.target.style.background = 'rgba(255, 255, 255, 0.08)'
                          e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                          e.target.style.background = 'rgba(255, 255, 255, 0.05)'
                          e.target.style.boxShadow = 'none'
                        }}
                      />
                    </div>
                  )}

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                      End Date
                    </label>
                    <input
                      type="date"
                      value={newEventForm.endDate}
                      onChange={(e) => setNewEventForm(prev => ({ ...prev, endDate: e.target.value }))}
                        style={{
                          width: '100%',
                          padding: '12px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '8px',
                          color: '#FFFFFF',
                          fontSize: '14px',
                          outline: 'none',
                          transition: 'all 0.2s ease'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#667eea'
                          e.target.style.background = 'rgba(255, 255, 255, 0.08)'
                          e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                          e.target.style.background = 'rgba(255, 255, 255, 0.05)'
                          e.target.style.boxShadow = 'none'
                        }}
                        />
                  </div>

                  {!newEventForm.allDay && (
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                        End Time
                      </label>
                      <input
                        type="time"
                        value={newEventForm.endTime}
                        onChange={(e) => setNewEventForm(prev => ({ ...prev, endTime: e.target.value }))}
                        style={{
                          width: '100%',
                          padding: '12px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '8px',
                          color: '#FFFFFF',
                          fontSize: '14px',
                          outline: 'none',
                          transition: 'all 0.2s ease'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#667eea'
                          e.target.style.background = 'rgba(255, 255, 255, 0.08)'
                          e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                          e.target.style.background = 'rgba(255, 255, 255, 0.05)'
                          e.target.style.boxShadow = 'none'
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Location */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                    Location
                  </label>
                  <input
                    type="text"
                    value={newEventForm.location}
                    onChange={(e) => setNewEventForm(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Event location"
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: theme.colors.background,
                      border: `1px solid ${theme.colors.border}`,
                      borderRadius: '8px',
                      color: theme.colors.textPrimary,
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>

                {/* Description */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                    Description
                  </label>
                  <textarea
                    value={newEventForm.description}
                    onChange={(e) => setNewEventForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Event description"
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: theme.colors.background,
                      border: `1px solid ${theme.colors.border}`,
                      borderRadius: '8px',
                      color: theme.colors.textPrimary,
                      fontSize: '14px',
                      outline: 'none',
                      resize: 'vertical',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>

                {/* Priority */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                    Priority
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                    {(['low', 'medium', 'high', 'urgent'] as const).map((priority) => (
                      <div
                        key={priority}
                        onClick={() => setNewEventForm(prev => ({ ...prev, priority }))}
                        style={{
                          padding: '12px',
                          background: newEventForm.priority === priority 
                            ? `${
                                priority === 'urgent' ? theme.colors.error :
                                priority === 'high' ? theme.colors.warning :
                                priority === 'medium' ? theme.colors.info :
                                theme.colors.success
                              }20` 
                            : theme.colors.background,
                          border: `2px solid ${newEventForm.priority === priority 
                            ? (priority === 'urgent' ? theme.colors.error :
                               priority === 'high' ? theme.colors.warning :
                               priority === 'medium' ? theme.colors.info :
                               theme.colors.success)
                            : theme.colors.border}`,
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          fontSize: '13px',
                          fontWeight: '600',
                          color: newEventForm.priority === priority 
                            ? (priority === 'urgent' ? theme.colors.error :
                               priority === 'high' ? theme.colors.warning :
                               priority === 'medium' ? theme.colors.info :
                               theme.colors.success)
                            : theme.colors.textPrimary,
                          textAlign: 'center',
                          textTransform: 'capitalize'
                        }}
                      >
                        {priority}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '20px 24px',
              borderTop: `1px solid ${theme.colors.border}`,
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px'
            }}>
              <button
                onClick={() => setShowNewEventModal(false)}
                style={{
                  padding: '12px 24px',
                  background: 'transparent',
                  color: theme.colors.textSecondary,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = theme.colors.backgroundHover
                  e.currentTarget.style.color = theme.colors.textPrimary
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = theme.colors.textSecondary
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateEvent}
                style={{
                  padding: '12px 24px',
                  background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.accent} 100%)`,
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease',
                  boxShadow: `0 4px 12px ${theme.colors.primary}40`
                }}
              >
                <CheckCircle size={18} />
                Create Event
              </button>
            </div>
          </div>
        </div>
        )}

        {/* Time Slot Appointment Modal */}
        {showTimeSlotModal && selectedTimeSlot && (
          <>
            {/* Backdrop */}
            <div 
              onClick={() => {
                setShowTimeSlotModal(false)
                setSelectedTimeSlot(null)
              }}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                zIndex: 999
              }}
            />
            {/* Modal */}
            <div style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: theme.colors.backgroundCard,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              zIndex: 1000,
              minWidth: '400px',
              maxWidth: '500px'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <h3 style={{
                  margin: 0,
                  fontSize: '18px',
                  fontWeight: '600',
                  color: theme.colors.textPrimary
                }}>
                  Create Appointment
                </h3>
                <button
                  onClick={() => {
                    setShowTimeSlotModal(false)
                    setSelectedTimeSlot(null)
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: theme.colors.textSecondary,
                    fontSize: '20px',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '4px',
                    transition: 'color 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = theme.colors.textPrimary
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = theme.colors.textSecondary
                  }}
                >
                  ×
                </button>
              </div>

              {/* Time Display */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '20px',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: theme.colors.textPrimary,
                  marginBottom: '4px'
                }}>
                  Selected Time
                </div>
                <div style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: theme.colors.primary
                }}>
                  {selectedTimeSlot.hour === 0 ? '12:00 AM' : 
                   selectedTimeSlot.hour < 12 ? `${selectedTimeSlot.hour}:00 AM` : 
                   selectedTimeSlot.hour === 12 ? '12:00 PM' : 
                   `${selectedTimeSlot.hour - 12}:00 PM`}
                </div>
              </div>

              {/* Quick Appointment Buttons */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px',
                marginBottom: '20px'
              }}>
                <button
                  onClick={() => createAppointmentFromTimeSlot('Meeting', 'meeting', 60)}
                  style={{
                    padding: '12px',
                    background: 'rgba(139, 92, 246, 0.1)',
                    border: `1px solid rgba(139, 92, 246, 0.3)`,
                    borderRadius: '8px',
                    color: theme.colors.textPrimary,
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)'
                    e.currentTarget.style.transform = 'scale(1.02)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)'
                    e.currentTarget.style.transform = 'scale(1)'
                  }}
                >
                  <Calendar size={16} />
                  Meeting
                </button>

                <button
                  onClick={() => createAppointmentFromTimeSlot('Load Pickup', 'load', 90)}
                  style={{
                    padding: '12px',
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: `1px solid rgba(59, 130, 246, 0.3)`,
                    borderRadius: '8px',
                    color: theme.colors.textPrimary,
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)'
                    e.currentTarget.style.transform = 'scale(1.02)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'
                    e.currentTarget.style.transform = 'scale(1)'
                  }}
                >
                  <Truck size={16} />
                  Load Pickup
                </button>

                <button
                  onClick={() => createAppointmentFromTimeSlot('Maintenance', 'maintenance', 120)}
                  style={{
                    padding: '12px',
                    background: 'rgba(245, 158, 11, 0.1)',
                    border: `1px solid rgba(245, 158, 11, 0.3)`,
                    borderRadius: '8px',
                    color: theme.colors.textPrimary,
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(245, 158, 11, 0.2)'
                    e.currentTarget.style.transform = 'scale(1.02)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(245, 158, 11, 0.1)'
                    e.currentTarget.style.transform = 'scale(1)'
                  }}
                >
                  <Wrench size={16} />
                  Maintenance
                </button>

                <button
                  onClick={() => createAppointmentFromTimeSlot('Custom Event', 'custom', 60)}
                  style={{
                    padding: '12px',
                    background: 'rgba(107, 114, 128, 0.1)',
                    border: `1px solid rgba(107, 114, 128, 0.3)`,
                    borderRadius: '8px',
                    color: theme.colors.textPrimary,
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(107, 114, 128, 0.2)'
                    e.currentTarget.style.transform = 'scale(1.02)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(107, 114, 128, 0.1)'
                    e.currentTarget.style.transform = 'scale(1)'
                  }}
                >
                  <Plus size={16} />
                  Custom Event
                </button>
              </div>

              {/* Custom Time Input */}
              <div style={{
                marginBottom: '20px'
              }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: theme.colors.textPrimary,
                  marginBottom: '8px'
                }}>
                  Or create custom appointment:
                </label>
                <button
                  onClick={() => setShowNewEventModal(true)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'transparent',
                    border: `2px dashed ${theme.colors.border}`,
                    borderRadius: '8px',
                    color: theme.colors.textSecondary,
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = theme.colors.primary
                    e.currentTarget.style.color = theme.colors.primary
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = theme.colors.border
                    e.currentTarget.style.color = theme.colors.textSecondary
                    e.currentTarget.style.background = 'transparent'
                  }}
                >
                  <Plus size={16} />
                  Create Custom Appointment
                </button>
              </div>

              {/* Cancel Button */}
              <button
                onClick={() => {
                  setShowTimeSlotModal(false)
                  setSelectedTimeSlot(null)
                }}
                style={{
                  width: '100%',
                  padding: '10px',
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
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                  e.currentTarget.style.color = theme.colors.textPrimary
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = theme.colors.textSecondary
                }}
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </PageContainer>
    )
  }

export default CalendarPage

