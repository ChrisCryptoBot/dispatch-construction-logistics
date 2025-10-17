import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../../contexts/ThemeContext'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { carrierAPI } from '../../services/api'
import PageContainer from '../../components/shared/PageContainer'
import Card from '../../components/ui/Card'
import { 
  Calendar, ChevronLeft, ChevronRight, Plus, Filter, 
  Truck, User, Wrench, AlertTriangle, Clock, MapPin,
  Eye, EyeOff, Settings, Download, Upload, RefreshCw,
  CheckCircle, XCircle, AlertCircle, Info, Search,
  ArrowRight, ArrowLeft, CalendarDays, MoreHorizontal,
  Edit, Trash2, Copy, Bell, BellOff, Star, StarOff,
  BarChart3, PieChart, TrendingUp, Calendar as CalendarIcon,
  PlusCircle, MinusCircle, Grid3X3, List, Layout, Package
} from 'lucide-react'
import CalendarSyncService from '../../services/calendarSync'
import NotificationService from '../../services/notificationService'
import type { CalendarEvent, CalendarView, CalendarEventType, CalendarEventPriority, CalendarEventStatus } from '../../types'
import { formatDate, formatTime, formatCurrency } from '../../utils/formatters'

const CarrierCalendarPage = () => {
  const { theme } = useTheme()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  
  // State management
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<CalendarView>('week')
  const [resourceView, setResourceView] = useState<'driver' | 'vehicle' | 'project'>('driver')
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [showEventModal, setShowEventModal] = useState(false)
  const [showNewEventModal, setShowNewEventModal] = useState(false)
  const [showEditEventModal, setShowEditEventModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showStatsModal, setShowStatsModal] = useState(false)
  const [conflicts, setConflicts] = useState<any[]>([])
  
  // Form states
  const [newEventForm, setNewEventForm] = useState({
    title: '',
    type: 'custom' as CalendarEventType,
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    allDay: false,
    location: '',
    description: '',
    priority: 'medium' as CalendarEventPriority,
    driverId: '',
    vehicleId: '',
    loadId: '',
    reminder: { enabled: true, minutesBefore: 15 }
  })
  
  // Filter and search states
  const [filteredCategories, setFilteredCategories] = useState<string[]>(['load', 'maintenance', 'compliance', 'driver', 'meeting', 'custom'])
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredDrivers, setFilteredDrivers] = useState<string[]>([])
  const [filteredVehicles, setFilteredVehicles] = useState<string[]>([])
  const [filteredPriorities, setFilteredPriorities] = useState<CalendarEventPriority[]>(['low', 'medium', 'high', 'urgent'])
  const [filteredStatuses, setFilteredStatuses] = useState<CalendarEventStatus[]>(['scheduled', 'confirmed', 'in_progress', 'completed'])
  
  // UI states
  const [showFilters, setShowFilters] = useState(false)
  const [showMiniCalendar, setShowMiniCalendar] = useState(false)
  const [compactView, setCompactView] = useState(false)
  // Services
  const [syncService] = useState(() => CalendarSyncService.getInstance())
  const [notificationService] = useState(() => NotificationService.getInstance())

  // Fetch calendar events
  const { data: events = [], isLoading, refetch } = useQuery({
    queryKey: ['calendar-events', currentDate, view],
    queryFn: async () => {
      try {
        // Mock API call - replace with actual API when available
        return generateMockEvents()
      } catch (error) {
        console.warn('API not available, using mock data:', error)
        return generateMockEvents()
      }
    }
  })

  // Fetch drivers and vehicles for forms
  const { data: drivers = [] } = useQuery({
    queryKey: ['drivers'],
    queryFn: async () => {
      try {
        // Mock API call - replace with actual API when available
        return [
          { id: '1', name: 'Mike Johnson', status: 'available' },
          { id: '2', name: 'Sarah Wilson', status: 'on_duty' },
          { id: '3', name: 'David Brown', status: 'available' }
        ]
      } catch (error) {
        return [
          { id: '1', name: 'Mike Johnson', status: 'available' },
          { id: '2', name: 'Sarah Wilson', status: 'on_duty' },
          { id: '3', name: 'David Brown', status: 'available' }
        ]
      }
    }
  })

  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles'],
    queryFn: async () => {
      try {
        // Mock API call - replace with actual API when available
        return [
          { id: '1', number: 'TRK-001', type: 'Dry Van', status: 'available' },
          { id: '2', number: 'TRK-002', type: 'Flatbed', status: 'in_use' },
          { id: '3', number: 'TRK-003', type: 'Refrigerated', status: 'maintenance' }
        ]
      } catch (error) {
        return [
          { id: '1', number: 'TRK-001', type: 'Dry Van', status: 'available' },
          { id: '2', number: 'TRK-002', type: 'Flatbed', status: 'in_use' },
          { id: '3', number: 'TRK-003', type: 'Refrigerated', status: 'maintenance' }
        ]
      }
    }
  })

  // Mutations
  const createEventMutation = useMutation({
    mutationFn: async (eventData: Partial<CalendarEvent>) => {
      // Mock API call - replace with actual API when available
      return Promise.resolve(eventData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] })
      setShowNewEventModal(false)
      resetNewEventForm()
      notificationService.addNotification({
        title: 'Event Created',
        message: 'New calendar event has been created successfully',
        type: 'success',
        priority: 'medium'
      })
    }
  })

  const updateEventMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CalendarEvent> }) => {
      // Mock API call - replace with actual API when available
      return Promise.resolve({ id, ...data })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] })
      setShowEditEventModal(false)
      setSelectedEvent(null)
      notificationService.addNotification({
        title: 'Event Updated',
        message: 'Calendar event has been updated successfully',
        type: 'success',
        priority: 'medium'
      })
    }
  })

  const deleteEventMutation = useMutation({
    mutationFn: async (id: string) => {
      // Mock API call - replace with actual API when available
      return Promise.resolve({ id })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] })
      setShowDeleteModal(false)
      setSelectedEvent(null)
      notificationService.addNotification({
        title: 'Event Deleted',
        message: 'Calendar event has been deleted successfully',
        type: 'info',
        priority: 'medium'
      })
    }
  })

  // Helper functions
  const getDateRange = () => {
    const start = new Date(currentDate)
    const end = new Date(currentDate)
    
    switch (view) {
      case 'day':
        return { start: start.toISOString(), end: start.toISOString() }
      case 'week':
        start.setDate(start.getDate() - start.getDay())
        end.setDate(start.getDate() + 6)
        return { start: start.toISOString(), end: end.toISOString() }
      case 'month':
        start.setDate(1)
        end.setMonth(end.getMonth() + 1)
        end.setDate(0)
        return { start: start.toISOString(), end: end.toISOString() }
      default:
        return { start: start.toISOString(), end: end.toISOString() }
    }
  }

  const getMonthDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const days = []
    const today = new Date()
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      
      days.push({
        date: date.getDate(),
        month: date.getMonth(),
        year: date.getFullYear(),
        isCurrentMonth: date.getMonth() === month,
        isToday: date.toDateString() === today.toDateString()
      })
    }
    
    return days
  }

  const getWeekDays = () => {
    const startDate = new Date(currentDate)
    startDate.setDate(startDate.getDate() - startDate.getDay())
    
    const days = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      days.push(date)
    }
    
    return days
  }

  const generateMockEvents = (): CalendarEvent[] => {
    const today = new Date()
    return [
      {
        id: '1',
        title: 'Load Pickup - ACME Logistics',
        type: 'pickup',
        startDate: new Date(today.getTime() + 2 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(today.getTime() + 3 * 60 * 60 * 1000).toISOString(),
        startTime: '10:00',
        endTime: '11:00',
        allDay: false,
        location: '123 Main St, Dallas, TX',
        description: 'Dry van pickup for electronics - Release expires at 10:30 AM',
        priority: 'high',
        status: 'confirmed',
        driverId: '1',
        driverName: 'Mike Johnson',
        vehicleId: '1',
        vehicleName: 'TRK-001',
        loadId: 'LD-2024-001',
        customerName: 'ACME Logistics',
        pickupLocation: '123 Main St, Dallas, TX',
        estimatedDuration: 60,
        reminder: { enabled: true, minutesBefore: 30 },
        createdAt: today.toISOString(),
        updatedAt: today.toISOString(),
        createdBy: 'user1'
      },
      {
        id: '2',
        title: 'Load Delivery - Global Shipping',
        type: 'delivery',
        startDate: new Date(today.getTime() + 5 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(today.getTime() + 6 * 60 * 60 * 1000).toISOString(),
        startTime: '13:00',
        endTime: '14:00',
        allDay: false,
        location: '456 Commerce Blvd, Houston, TX',
        description: 'Electronics delivery - ETA: 1:15 PM',
        priority: 'high',
        status: 'confirmed',
        driverId: '1',
        driverName: 'Mike Johnson',
        vehicleId: '1',
        vehicleName: 'TRK-001',
        loadId: 'LD-2024-001',
        customerName: 'Global Shipping',
        deliveryLocation: '456 Commerce Blvd, Houston, TX',
        estimatedDuration: 45,
        reminder: { enabled: true, minutesBefore: 15 },
        createdAt: today.toISOString(),
        updatedAt: today.toISOString(),
        createdBy: 'user1'
      },
      {
        id: '3',
        title: 'Vehicle Maintenance - TRK-002',
        type: 'maintenance',
        startDate: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(today.getTime() + 25 * 60 * 60 * 1000).toISOString(),
        startTime: '09:00',
        endTime: '12:00',
        allDay: false,
        location: 'ABC Auto Repair, Houston, TX',
        description: 'Routine oil change and inspection - Maintenance lock prevents load assignment',
        priority: 'medium',
        status: 'scheduled',
        vehicleId: '2',
        vehicleName: 'TRK-002',
        estimatedDuration: 180,
        reminder: { enabled: true, minutesBefore: 60 },
        createdAt: today.toISOString(),
        updatedAt: today.toISOString(),
        createdBy: 'user1'
      },
      {
        id: '4',
        title: 'Load Pickup - DEF Industries',
        type: 'pickup',
        startDate: new Date(today.getTime() + 26 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(today.getTime() + 27 * 60 * 60 * 1000).toISOString(),
        startTime: '11:00',
        endTime: '12:00',
        allDay: false,
        location: '789 Industrial Way, Austin, TX',
        description: 'Flatbed pickup for machinery - Release expires at 11:30 AM',
        priority: 'urgent',
        status: 'confirmed',
        driverId: '2',
        driverName: 'Sarah Wilson',
        vehicleId: '3',
        vehicleName: 'TRK-003',
        loadId: 'LD-2024-002',
        customerName: 'DEF Industries',
        pickupLocation: '789 Industrial Way, Austin, TX',
        estimatedDuration: 60,
        reminder: { enabled: true, minutesBefore: 30 },
        createdAt: today.toISOString(),
        updatedAt: today.toISOString(),
        createdBy: 'user1'
      },
      {
        id: '5',
        title: 'CDL Medical Expiry Reminder',
        type: 'compliance',
        startDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
        startTime: '08:00',
        endTime: '09:00',
        allDay: false,
        location: 'Medical Center, Dallas, TX',
        description: 'Mike Johnson CDL medical certificate expires in 7 days',
        priority: 'urgent',
        status: 'scheduled',
        driverId: '1',
        driverName: 'Mike Johnson',
        reminder: { enabled: true, minutesBefore: 1440 }, // 24 hours
        createdAt: today.toISOString(),
        updatedAt: today.toISOString(),
        createdBy: 'user1'
      },
      {
        id: '6',
        title: 'Driver Meeting - Safety Briefing',
        type: 'meeting',
        startDate: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
        startTime: '14:00',
        endTime: '15:00',
        allDay: false,
        location: 'Office Conference Room',
        description: 'Weekly safety briefing - All drivers required',
        priority: 'medium',
        status: 'scheduled',
        reminder: { enabled: true, minutesBefore: 15 },
        createdAt: today.toISOString(),
        updatedAt: today.toISOString(),
        createdBy: 'user1'
      }
    ]
  }

  // Conflict detection logic
  const detectConflicts = (events: CalendarEvent[]) => {
    const conflicts: any[] = []
    
    // Group events by resource (driver/vehicle)
    const driverEvents = events.filter(e => e.driverId)
    const vehicleEvents = events.filter(e => e.vehicleId)
    
    // Check driver conflicts
    const driverGroups = driverEvents.reduce((acc, event) => {
      if (!event.driverId) return acc
      if (!acc[event.driverId]) acc[event.driverId] = []
      acc[event.driverId].push(event)
      return acc
    }, {} as Record<string, CalendarEvent[]>)
    
    Object.entries(driverGroups).forEach(([driverId, driverEvents]) => {
      for (let i = 0; i < driverEvents.length; i++) {
        for (let j = i + 1; j < driverEvents.length; j++) {
          const event1 = driverEvents[i]
          const event2 = driverEvents[j]
          
          const start1 = new Date(event1.startDate)
          const end1 = new Date(event1.endDate)
          const start2 = new Date(event2.startDate)
          const end2 = new Date(event2.endDate)
          
          // Check for overlap
          if (start1 < end2 && start2 < end1) {
            conflicts.push({
              id: `conflict-${event1.id}-${event2.id}`,
              type: 'hard_clash',
              severity: 'high',
              message: `Driver ${event1.driverName} double-booked`,
              events: [event1, event2],
              resourceType: 'driver',
              resourceId: driverId,
              resourceName: event1.driverName
            })
          }
        }
      }
    })
    
    // Check vehicle conflicts
    const vehicleGroups = vehicleEvents.reduce((acc, event) => {
      if (!event.vehicleId) return acc
      if (!acc[event.vehicleId]) acc[event.vehicleId] = []
      acc[event.vehicleId].push(event)
      return acc
    }, {} as Record<string, CalendarEvent[]>)
    
    Object.entries(vehicleGroups).forEach(([vehicleId, vehicleEvents]) => {
      for (let i = 0; i < vehicleEvents.length; i++) {
        for (let j = i + 1; j < vehicleEvents.length; j++) {
          const event1 = vehicleEvents[i]
          const event2 = vehicleEvents[j]
          
          const start1 = new Date(event1.startDate)
          const end1 = new Date(event1.endDate)
          const start2 = new Date(event2.startDate)
          const end2 = new Date(event2.endDate)
          
          // Check for overlap
          if (start1 < end2 && start2 < end1) {
            conflicts.push({
              id: `conflict-${event1.id}-${event2.id}`,
              type: 'hard_clash',
              severity: 'high',
              message: `Vehicle ${event1.vehicleName} double-booked`,
              events: [event1, event2],
              resourceType: 'vehicle',
              resourceId: vehicleId,
              resourceName: event1.vehicleName
            })
          }
        }
      }
    })
    
    return conflicts
  }

  const resetNewEventForm = () => {
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
      priority: 'medium',
      driverId: '',
      vehicleId: '',
      loadId: '',
      reminder: { enabled: true, minutesBefore: 15 }
    })
  }

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesCategory = filteredCategories.includes(event.type)
      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.location?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesDriver = filteredDrivers.length === 0 || filteredDrivers.includes(event.driverId || '')
      const matchesVehicle = filteredVehicles.length === 0 || filteredVehicles.includes(event.vehicleId || '')
      const matchesPriority = filteredPriorities.includes(event.priority)
      const matchesStatus = filteredStatuses.includes(event.status)
      
      return matchesCategory && matchesSearch && matchesDriver && matchesVehicle && matchesPriority && matchesStatus
    })
  }, [events, filteredCategories, searchTerm, filteredDrivers, filteredVehicles, filteredPriorities, filteredStatuses])

  const getEventIcon = (type: CalendarEventType) => {
    switch (type) {
      case 'load': return <Truck size={16} />
      case 'pickup': return <ArrowRight size={16} />
      case 'delivery': return <CheckCircle size={16} />
      case 'maintenance': return <Wrench size={16} />
      case 'compliance': return <AlertTriangle size={16} />
      case 'driver': return <User size={16} />
      case 'meeting': return <Calendar size={16} />
      case 'break': return <Clock size={16} />
      case 'training': return <Info size={16} />
      case 'inspection': return <CheckCircle size={16} />
      default: return <Calendar size={16} />
    }
  }

  const getEventColor = (type: CalendarEventType, priority: CalendarEventPriority) => {
    if (priority === 'urgent') return theme.colors.error
    if (priority === 'high') return theme.colors.warning
    
    switch (type) {
      case 'load': return theme.colors.primary
      case 'pickup': return theme.colors.success
      case 'delivery': return theme.colors.success
      case 'maintenance': return theme.colors.warning
      case 'compliance': return theme.colors.error
      case 'driver': return theme.colors.textPrimary
      case 'meeting': return theme.colors.primary
      case 'break': return theme.colors.textSecondary
      case 'training': return theme.colors.primary
      case 'inspection': return theme.colors.success
      default: return theme.colors.textSecondary
    }
  }

  const getStatusColor = (status: CalendarEventStatus) => {
    switch (status) {
      case 'completed': return theme.colors.success
      case 'in_progress': return theme.colors.primary
      case 'confirmed': return theme.colors.success
      case 'cancelled': return theme.colors.error
      case 'rescheduled': return theme.colors.warning
      default: return theme.colors.textSecondary
    }
  }

  // Calendar navigation
  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    switch (view) {
      case 'day':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1))
        break
      case 'week':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7))
        break
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1))
        break
    }
    setCurrentDate(newDate)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Event handlers
  const handleCreateEvent = () => {
    const eventData: Partial<CalendarEvent> = {
      ...newEventForm,
      id: Date.now().toString(),
      status: 'scheduled',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'current-user'
    }
    createEventMutation.mutate(eventData)
  }

  const handleUpdateEvent = () => {
    if (!selectedEvent) return
    updateEventMutation.mutate({ id: selectedEvent.id, data: selectedEvent })
  }

  const handleDeleteEvent = () => {
    if (!selectedEvent) return
    deleteEventMutation.mutate(selectedEvent.id)
  }

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event)
    setShowEventModal(true)
  }

  const handleEditEvent = () => {
    setShowEventModal(false)
    setShowEditEventModal(true)
  }

  // Auto-sync events on mount and detect conflicts
  useEffect(() => {
    const syncEvents = async () => {
      try {
        // Mock sync call - replace with actual sync when available
        refetch()
      } catch (error) {
        console.warn('Sync failed:', error)
      }
    }
    
    syncEvents()
    
    // Set up periodic sync
    const syncInterval = setInterval(syncEvents, 5 * 60 * 1000) // Every 5 minutes
    
    return () => clearInterval(syncInterval)
  }, [refetch])

  // Detect conflicts when events change
  useEffect(() => {
    if (events.length > 0) {
      const detectedConflicts = detectConflicts(events)
      setConflicts(detectedConflicts)
    }
  }, [events])

  if (isLoading) {
    return (
      <PageContainer title="Schedule & Calendar" subtitle="Loading calendar events...">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <RefreshCw size={32} className="animate-spin" color={theme.colors.primary} />
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer 
      title="Schedule & Calendar" 
      subtitle="Manage your schedule, loads, maintenance, and appointments"
      icon={Calendar as any}
      headerAction={
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
        {/* View Controls */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {(['day', 'week', 'month', 'agenda'] as CalendarView[]).map((viewType) => (
            <button
              key={viewType}
              onClick={() => setView(viewType)}
              style={{
                padding: '8px 16px',
                background: 'transparent',
                border: `1px solid ${theme.colors.border}`,
                borderRadius: '8px',
                color: theme.colors.textSecondary,
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textTransform: 'capitalize'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = theme.colors.backgroundCardHover
                e.currentTarget.style.color = theme.colors.textPrimary
                e.currentTarget.style.borderColor = theme.colors.primary
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = theme.colors.textSecondary
                e.currentTarget.style.borderColor = theme.colors.border
              }}
            >
              {viewType}
            </button>
          ))}
        </div>

        {/* Resource Lane Toggle */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, alignSelf: 'center', marginRight: '8px' }}>
            View by:
          </span>
          {(['driver', 'vehicle', 'project'] as const).map((resourceType) => (
            <button
              key={resourceType}
              onClick={() => setResourceView(resourceType)}
              style={{
                padding: '8px 16px',
                background: 'transparent',
                border: `1px solid ${theme.colors.border}`,
                borderRadius: '8px',
                color: theme.colors.textSecondary,
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textTransform: 'capitalize'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = theme.colors.backgroundCardHover
                e.currentTarget.style.color = theme.colors.textPrimary
                e.currentTarget.style.borderColor = theme.colors.primary
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = theme.colors.textSecondary
                e.currentTarget.style.borderColor = theme.colors.border
              }}
            >
              {resourceType}s
            </button>
          ))}
        </div>

        {/* Date Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => navigateDate('prev')}
            style={{
              padding: '8px',
              background: 'transparent',
              border: `1px solid ${theme.colors.border}`,
              borderRadius: '8px',
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
            <ChevronLeft size={20} />
          </button>
          
          <button
            onClick={goToToday}
            style={{
              padding: '8px 16px',
              background: 'transparent',
              border: `1px solid ${theme.colors.border}`,
              borderRadius: '8px',
              color: theme.colors.textSecondary,
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = theme.colors.backgroundCardHover
              e.currentTarget.style.color = theme.colors.textPrimary
              e.currentTarget.style.borderColor = theme.colors.primary
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = theme.colors.textSecondary
              e.currentTarget.style.borderColor = theme.colors.border
            }}
          >
            Today
          </button>
          
          <button
            onClick={() => navigateDate('next')}
            style={{
              padding: '8px',
              background: 'transparent',
              border: `1px solid ${theme.colors.border}`,
              borderRadius: '8px',
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
            <ChevronRight size={20} />
          </button>
          
          <div style={{ 
            fontSize: '16px', 
            fontWeight: '600', 
            color: theme.colors.textPrimary,
            minWidth: '200px',
            textAlign: 'center'
          }}>
            {currentDate.toLocaleDateString('en-US', { 
              month: 'long', 
              year: 'numeric',
              ...(view === 'day' && { weekday: 'long', day: 'numeric' })
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {/* Conflict Indicator */}
          {conflicts.length > 0 && (
            <button
              onClick={() => alert(`${conflicts.length} conflicts detected. Click to view details.`)}
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
                e.currentTarget.style.borderColor = theme.colors.warning
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = theme.colors.textSecondary
                e.currentTarget.style.borderColor = theme.colors.border
              }}
            >
              <AlertTriangle size={16} />
              {conflicts.length} Conflicts
            </button>
          )}

          <button
            onClick={() => setShowFilters(!showFilters)}
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
              e.currentTarget.style.borderColor = theme.colors.primary
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = theme.colors.textSecondary
              e.currentTarget.style.borderColor = theme.colors.border
            }}
          >
            <Filter size={16} />
            Filters
          </button>

          <button
            onClick={() => setShowNewEventModal(true)}
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
            <Plus size={16} />
            New Event
          </button>

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
            Sync
          </button>
        </div>
      </div>

      {/* Filters Section */}
      {showFilters && (
        <Card style={{ marginBottom: '24px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            padding: '20px'
          }}>
            {/* Search */}
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                Search Events
              </label>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: theme.colors.textSecondary }} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search events..."
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 40px',
                    background: theme.colors.background,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: '8px',
                    color: theme.colors.textPrimary,
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                Categories
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {['load', 'pickup', 'delivery', 'maintenance', 'compliance', 'driver', 'meeting', 'custom'].map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      if (filteredCategories.includes(category)) {
                        setFilteredCategories(prev => prev.filter(c => c !== category))
                      } else {
                        setFilteredCategories(prev => [...prev, category])
                      }
                    }}
                    style={{
                      padding: '4px 8px',
                      background: filteredCategories.includes(category) ? theme.colors.backgroundCardHover : 'transparent',
                      border: `1px solid ${filteredCategories.includes(category) ? theme.colors.textSecondary : theme.colors.border}`,
                      borderRadius: '6px',
                      color: filteredCategories.includes(category) ? theme.colors.textPrimary : theme.colors.textSecondary,
                      fontSize: '12px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      textTransform: 'capitalize',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority Filter */}
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                Priority
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {(['low', 'medium', 'high', 'urgent'] as CalendarEventPriority[]).map((priority) => (
                  <button
                    key={priority}
                    onClick={() => {
                      if (filteredPriorities.includes(priority)) {
                        setFilteredPriorities(prev => prev.filter(p => p !== priority))
                      } else {
                        setFilteredPriorities(prev => [...prev, priority])
                      }
                    }}
                    style={{
                      padding: '4px 8px',
                      background: filteredPriorities.includes(priority) ? 
                        (priority === 'urgent' ? theme.colors.error : 
                         priority === 'high' ? theme.colors.warning : theme.colors.primary) : 
                        theme.colors.backgroundTertiary,
                      border: 'none',
                      borderRadius: '6px',
                      color: filteredPriorities.includes(priority) ? '#ffffff' : theme.colors.textSecondary,
                      fontSize: '12px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      textTransform: 'capitalize',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {priority}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                Status
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled'] as CalendarEventStatus[]).map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      if (filteredStatuses.includes(status)) {
                        setFilteredStatuses(prev => prev.filter(s => s !== status))
                      } else {
                        setFilteredStatuses(prev => [...prev, status])
                      }
                    }}
                    style={{
                      padding: '4px 8px',
                      background: filteredStatuses.includes(status) ? getStatusColor(status) : theme.colors.backgroundTertiary,
                      border: 'none',
                      borderRadius: '6px',
                      color: filteredStatuses.includes(status) ? '#ffffff' : theme.colors.textSecondary,
                      fontSize: '12px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      textTransform: 'capitalize',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {status.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Color Legend and Heatmap */}
      <Card style={{ marginBottom: '16px' }}>
        <div style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            {/* Color Legend */}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              {[
                { type: 'load', label: 'Loads', color: theme.colors.primary, count: filteredEvents.filter(e => e.type === 'load' || e.type === 'pickup' || e.type === 'delivery').length },
                { type: 'maintenance', label: 'Maintenance', color: theme.colors.warning, count: filteredEvents.filter(e => e.type === 'maintenance').length },
                { type: 'compliance', label: 'Compliance', color: theme.colors.error, count: filteredEvents.filter(e => e.type === 'compliance').length },
                { type: 'driver', label: 'Driver', color: theme.colors.textPrimary, count: filteredEvents.filter(e => e.type === 'driver' || e.type === 'meeting').length },
                { type: 'custom', label: 'Custom', color: theme.colors.textSecondary, count: filteredEvents.filter(e => e.type === 'custom').length }
              ].map((legend) => (
                <div key={legend.type} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    background: legend.color,
                    borderRadius: '2px'
                  }}></div>
                  <span style={{ fontSize: '12px', color: theme.colors.textSecondary }}>
                    {legend.label} {legend.count}
                  </span>
                </div>
              ))}
            </div>

            {/* Conflict Summary */}
            {conflicts.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={16} color={theme.colors.error} />
                <span style={{ fontSize: '12px', color: theme.colors.error, fontWeight: '600' }}>
                  {conflicts.length} resource conflicts detected
                </span>
              </div>
            )}
          </div>

          {/* Mini Heatmap Ribbon */}
          <div style={{ marginTop: '12px', padding: '8px 0', borderTop: `1px solid ${theme.colors.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', color: theme.colors.textSecondary, fontWeight: '600' }}>
                Daily Activity Heatmap:
              </span>
              <span style={{ fontSize: '11px', color: theme.colors.textSecondary }}>
                (Darker = busier hours)
              </span>
            </div>
            <div style={{ display: 'flex', gap: '2px', height: '20px' }}>
              {Array.from({ length: 24 }, (_, hour) => {
                const hourEvents = filteredEvents.filter(event => {
                  if (!event.startTime) return false
                  const eventHour = parseInt(event.startTime.split(':')[0])
                  return eventHour === hour
                }).length
                const intensity = Math.min(hourEvents / 3, 1) // Max 3 events = full intensity
                return (
                  <div
                    key={hour}
                    style={{
                      flex: 1,
                      background: `rgba(59, 130, 246, ${intensity * 0.8})`,
                      borderRadius: '2px',
                      minWidth: '8px'
                    }}
                    title={`${hour}:00 - ${hourEvents} events`}
                  ></div>
                )
              })}
            </div>
          </div>
        </div>
      </Card>

      {/* Calendar Content */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: view === 'agenda' ? '1fr' : compactView ? '1fr 300px' : '1fr',
        gap: '24px'
      }}>
        {/* Main Calendar View */}
        <Card>
          {view === 'agenda' ? (
            // Agenda View
            <div>
              <div style={{ padding: '20px', borderBottom: `1px solid ${theme.colors.border}` }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary }}>
                  Upcoming Events
                </h3>
              </div>
              <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                {filteredEvents.length === 0 ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: theme.colors.textSecondary }}>
                    <Calendar size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                    <p>No events found for the selected filters</p>
                  </div>
                ) : (
                  <div style={{ padding: '20px' }}>
                    {filteredEvents.map((event) => (
                      <div
                        key={event.id}
                        onClick={() => handleEventClick(event)}
                        style={{
                          padding: '16px',
                          background: theme.colors.background,
                          border: `1px solid ${theme.colors.border}`,
                          borderRadius: '10px',
                          marginBottom: '12px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          borderLeft: `4px solid ${getEventColor(event.type, event.priority)}`
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = theme.colors.backgroundCardHover
                          e.currentTarget.style.transform = 'translateY(-2px)'
                          e.currentTarget.style.boxShadow = `0 4px 12px ${theme.colors.primary}20`
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = theme.colors.background
                          e.currentTarget.style.transform = 'translateY(0)'
                          e.currentTarget.style.boxShadow = 'none'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <div style={{ color: getEventColor(event.type, event.priority) }}>
                              {getEventIcon(event.type)}
                            </div>
                            <div style={{ fontSize: '16px', fontWeight: '600', color: theme.colors.textPrimary }}>
                              {event.title}
                            </div>
                            <span style={{
                              padding: '2px 6px',
                              background: getEventColor(event.type, event.priority),
                              color: '#ffffff',
                              borderRadius: '4px',
                              fontSize: '10px',
                              fontWeight: '600',
                              textTransform: 'uppercase'
                            }}>
                              {event.type}
                            </span>
                            <span style={{
                              padding: '2px 6px',
                              background: getStatusColor(event.status),
                              color: '#ffffff',
                              borderRadius: '4px',
                              fontSize: '10px',
                              fontWeight: '600',
                              textTransform: 'uppercase'
                            }}>
                              {event.status.replace('_', ' ')}
                            </span>
                            
                            {/* Smart Badges */}
                            {event.type === 'pickup' && event.description?.includes('Release expires') && (
                              <span style={{
                                padding: '2px 6px',
                                background: theme.colors.warning,
                                color: '#ffffff',
                                borderRadius: '4px',
                                fontSize: '10px',
                                fontWeight: '600',
                                textTransform: 'uppercase'
                              }}>
                                Release Expires Soon
                              </span>
                            )}
                            
                            {event.type === 'delivery' && event.description?.includes('ETA') && (
                              <span style={{
                                padding: '2px 6px',
                                background: theme.colors.success,
                                color: '#ffffff',
                                borderRadius: '4px',
                                fontSize: '10px',
                                fontWeight: '600',
                                textTransform: 'uppercase'
                              }}>
                                ETA Tracked
                              </span>
                            )}
                            
                            {event.type === 'compliance' && event.description?.includes('expires') && (
                              <span style={{
                                padding: '2px 6px',
                                background: theme.colors.error,
                                color: '#ffffff',
                                borderRadius: '4px',
                                fontSize: '10px',
                                fontWeight: '600',
                                textTransform: 'uppercase'
                              }}>
                                Expires Soon
                              </span>
                            )}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={14} color={theme.colors.textSecondary} />
                            <span style={{ fontSize: '12px', color: theme.colors.textSecondary }}>
                              {formatTime(event.startTime)} - {formatTime(event.endTime)}
                            </span>
                          </div>
                        </div>
                        
                        {event.location && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                            <MapPin size={12} color={theme.colors.textSecondary} />
                            <span style={{ fontSize: '12px', color: theme.colors.textSecondary }}>
                              {event.location}
                            </span>
                          </div>
                        )}
                        
                        {/* Resource Information */}
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
                          {event.driverName && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <User size={12} color={theme.colors.textSecondary} />
                              <span style={{ fontSize: '11px', color: theme.colors.textSecondary }}>
                                {event.driverName}
                              </span>
                            </div>
                          )}
                          {event.vehicleName && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Truck size={12} color={theme.colors.textSecondary} />
                              <span style={{ fontSize: '11px', color: theme.colors.textSecondary }}>
                                {event.vehicleName}
                              </span>
                            </div>
                          )}
                          {event.loadId && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Package size={12} color={theme.colors.textSecondary} />
                              <span style={{ fontSize: '11px', color: theme.colors.textSecondary }}>
                                {event.loadId}
                              </span>
                            </div>
                          )}
                        </div>

                        {event.description && (
                          <p style={{ fontSize: '13px', color: theme.colors.textSecondary, margin: '0 0 8px 0', lineHeight: '1.4' }}>
                            {event.description}
                          </p>
                        )}

                        {/* Quick Actions */}
                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                          {event.type === 'pickup' || event.type === 'delivery' ? (
                            <>
                              <button
                                onClick={() => {
                                  // Navigate to load details
                                  alert(`Navigate to load ${event.loadId}`)
                                }}
                                style={{
                                  padding: '4px 8px',
                                  background: 'transparent',
                                  border: `1px solid ${theme.colors.border}`,
                                  borderRadius: '4px',
                                  color: theme.colors.textSecondary,
                                  fontSize: '10px',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = theme.colors.backgroundCardHover
                                  e.currentTarget.style.color = theme.colors.textPrimary
                                  e.currentTarget.style.borderColor = theme.colors.primary
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = 'transparent'
                                  e.currentTarget.style.color = theme.colors.textSecondary
                                  e.currentTarget.style.borderColor = theme.colors.border
                                }}
                              >
                                View Load
                              </button>
                              <button
                                onClick={() => {
                                  // Call driver
                                  alert(`Call ${event.driverName}`)
                                }}
                                style={{
                                  padding: '4px 8px',
                                  background: 'transparent',
                                  border: `1px solid ${theme.colors.border}`,
                                  borderRadius: '4px',
                                  color: theme.colors.textSecondary,
                                  fontSize: '10px',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = theme.colors.backgroundCardHover
                                  e.currentTarget.style.color = theme.colors.textPrimary
                                  e.currentTarget.style.borderColor = theme.colors.success
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = 'transparent'
                                  e.currentTarget.style.color = theme.colors.textSecondary
                                  e.currentTarget.style.borderColor = theme.colors.border
                                }}
                              >
                                Call Driver
                              </button>
                              <button
                                onClick={() => {
                                  // Navigate to location
                                  alert(`Navigate to ${event.location}`)
                                }}
                                style={{
                                  padding: '4px 8px',
                                  background: 'transparent',
                                  border: `1px solid ${theme.colors.border}`,
                                  borderRadius: '4px',
                                  color: theme.colors.textSecondary,
                                  fontSize: '10px',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = theme.colors.backgroundCardHover
                                  e.currentTarget.style.color = theme.colors.textPrimary
                                  e.currentTarget.style.borderColor = theme.colors.primary
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = 'transparent'
                                  e.currentTarget.style.color = theme.colors.textSecondary
                                  e.currentTarget.style.borderColor = theme.colors.border
                                }}
                              >
                                Navigate
                              </button>
                            </>
                          ) : event.type === 'maintenance' ? (
                            <button
                              onClick={() => {
                                // View maintenance details
                                alert(`View maintenance details for ${event.vehicleName}`)
                              }}
                              style={{
                                padding: '4px 8px',
                                background: 'transparent',
                                border: `1px solid ${theme.colors.border}`,
                                borderRadius: '4px',
                                color: theme.colors.textSecondary,
                                fontSize: '10px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = theme.colors.backgroundCardHover
                                e.currentTarget.style.color = theme.colors.textPrimary
                                e.currentTarget.style.borderColor = theme.colors.warning
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent'
                                e.currentTarget.style.color = theme.colors.textSecondary
                                e.currentTarget.style.borderColor = theme.colors.border
                              }}
                            >
                              View Maintenance
                            </button>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Calendar Grid View (Day/Week/Month)
            <div style={{ padding: '20px' }}>
              {view === 'month' ? (
                // Month View
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  gap: '1px',
                  background: theme.colors.border,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: '10px',
                  overflow: 'hidden'
                }}>
                  {/* Day Headers */}
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} style={{
                      background: theme.colors.backgroundTertiary,
                      padding: '12px 8px',
                      textAlign: 'center',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: theme.colors.textPrimary,
                      borderBottom: `1px solid ${theme.colors.border}`
                    }}>
                      {day}
                    </div>
                  ))}
                  
                  {/* Month Days */}
                  {getMonthDays().map((day, index) => (
                    <div
                      key={index}
                      style={{
                        background: theme.colors.backgroundCard,
                        minHeight: '120px',
                        padding: '8px',
                        borderRight: `1px solid ${theme.colors.border}`,
                        borderBottom: `1px solid ${theme.colors.border}`,
                        position: 'relative',
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        setCurrentDate(new Date(day.year, day.month, day.date))
                        setView('day')
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = theme.colors.backgroundCardHover
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = theme.colors.backgroundCard
                      }}
                    >
                      <div style={{
                        fontSize: '14px',
                        fontWeight: day.isToday ? '700' : '500',
                        background: day.isToday ? theme.colors.primary : 'transparent',
                        color: day.isToday ? '#ffffff' : day.isCurrentMonth ? theme.colors.textPrimary : theme.colors.textSecondary,
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '4px'
                      }}>
                        {day.date}
                      </div>
                      
                      {/* Events for this day */}
                      {filteredEvents
                        .filter(event => {
                          const eventDate = new Date(event.startDate)
                          return eventDate.getDate() === day.date && 
                                 eventDate.getMonth() === day.month && 
                                 eventDate.getFullYear() === day.year
                        })
                        .slice(0, 3)
                        .map((event) => (
                          <div
                            key={event.id}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEventClick(event)
                            }}
                            style={{
                              background: getEventColor(event.type, event.priority),
                              color: '#ffffff',
                              fontSize: '10px',
                              padding: '2px 4px',
                              borderRadius: '3px',
                              marginBottom: '2px',
                              cursor: 'pointer',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                            title={event.title}
                          >
                            {event.startTime && `${formatTime(event.startTime)} `}{event.title}
                          </div>
                        ))}
                      
                      {/* Show more indicator */}
                      {filteredEvents.filter(event => {
                        const eventDate = new Date(event.startDate)
                        return eventDate.getDate() === day.date && 
                               eventDate.getMonth() === day.month && 
                               eventDate.getFullYear() === day.year
                      }).length > 3 && (
                        <div style={{
                          fontSize: '10px',
                          color: theme.colors.textSecondary,
                          textAlign: 'center',
                          marginTop: '2px'
                        }}>
                          +{filteredEvents.filter(event => {
                            const eventDate = new Date(event.startDate)
                            return eventDate.getDate() === day.date && 
                                   eventDate.getMonth() === day.month && 
                                   eventDate.getFullYear() === day.year
                          }).length - 3} more
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : view === 'week' ? (
                // Week View
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: '60px repeat(7, 1fr)',
                  gap: '1px',
                  background: theme.colors.border,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: '10px',
                  overflow: 'hidden'
                }}>
                  {/* Time column header */}
                  <div style={{
                    background: theme.colors.backgroundTertiary,
                    padding: '12px 8px',
                    textAlign: 'center',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: theme.colors.textPrimary,
                    borderBottom: `1px solid ${theme.colors.border}`
                  }}>
                    Time
                  </div>
                  
                  {/* Day Headers */}
                  {getWeekDays().map((day) => (
                    <div key={day.toISOString()} style={{
                      background: theme.colors.backgroundTertiary,
                      padding: '12px 8px',
                      textAlign: 'center',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: theme.colors.textPrimary,
                      borderBottom: `1px solid ${theme.colors.border}`,
                      borderRight: `1px solid ${theme.colors.border}`
                    }}>
                      <div>{day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                      <div style={{ fontSize: '12px', marginTop: '2px' }}>
                        {day.getDate()}
                      </div>
                    </div>
                  ))}
                  
                  {/* Time slots and events */}
                  {Array.from({ length: 24 }, (_, hour) => (
                    <React.Fragment key={hour}>
                      {/* Time label */}
                      <div style={{
                        background: theme.colors.backgroundCard,
                        padding: '8px 4px',
                        textAlign: 'center',
                        fontSize: '12px',
                        color: theme.colors.textSecondary,
                        borderRight: `1px solid ${theme.colors.border}`,
                        borderBottom: `1px solid ${theme.colors.border}`,
                        height: '60px'
                      }}>
                        {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                      </div>
                      
                      {/* Day cells for this hour */}
                      {getWeekDays().map((day) => (
                        <div
                          key={`${day.toISOString()}-${hour}`}
                          style={{
                            background: theme.colors.backgroundCard,
                            minHeight: '60px',
                            padding: '4px',
                            borderRight: `1px solid ${theme.colors.border}`,
                            borderBottom: `1px solid ${theme.colors.border}`,
                            position: 'relative',
                            cursor: 'pointer'
                          }}
                          onClick={() => {
                            const newDate = new Date(day)
                            newDate.setHours(hour, 0, 0, 0)
                            setCurrentDate(newDate)
                            setShowNewEventModal(true)
                            setNewEventForm(prev => ({
                              ...prev,
                              startDate: newDate.toISOString().split('T')[0],
                              startTime: `${hour.toString().padStart(2, '0')}:00`,
                              endTime: `${(hour + 1).toString().padStart(2, '0')}:00`
                            }))
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = theme.colors.backgroundCardHover
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = theme.colors.backgroundCard
                          }}
                        >
                          {/* Events for this time slot */}
                          {filteredEvents
                            .filter(event => {
                              const eventDate = new Date(event.startDate)
                              const eventHour = event.startTime ? parseInt(event.startTime.split(':')[0]) : 0
                              return eventDate.toDateString() === day.toDateString() && eventHour === hour
                            })
                            .map((event) => (
                              <div
                                key={event.id}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleEventClick(event)
                                }}
                                style={{
                                  background: getEventColor(event.type, event.priority),
                                  color: '#ffffff',
                                  fontSize: '10px',
                                  padding: '2px 4px',
                                  borderRadius: '3px',
                                  marginBottom: '1px',
                                  cursor: 'pointer',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  position: 'absolute',
                                  top: '2px',
                                  left: '2px',
                                  right: '2px'
                                }}
                                title={event.title}
                              >
                                {event.title}
                              </div>
                            ))}
                        </div>
                      ))}
                    </React.Fragment>
                  ))}
                </div>
              ) : (
                // Day View
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: '60px 1fr',
                  gap: '1px',
                  background: theme.colors.border,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: '10px',
                  overflow: 'hidden'
                }}>
                  {/* Time column header */}
                  <div style={{
                    background: theme.colors.backgroundTertiary,
                    padding: '12px 8px',
                    textAlign: 'center',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: theme.colors.textPrimary,
                    borderBottom: `1px solid ${theme.colors.border}`
                  }}>
                    Time
                  </div>
                  
                  {/* Day header */}
                  <div style={{
                    background: theme.colors.backgroundTertiary,
                    padding: '12px 8px',
                    textAlign: 'center',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: theme.colors.textPrimary,
                    borderBottom: `1px solid ${theme.colors.border}`,
                    borderRight: `1px solid ${theme.colors.border}`
                  }}>
                    <div>{currentDate.toLocaleDateString('en-US', { weekday: 'long' })}</div>
                    <div style={{ fontSize: '12px', marginTop: '2px' }}>
                      {currentDate.getDate()} {currentDate.toLocaleDateString('en-US', { month: 'short' })}
                    </div>
                  </div>
                  
                  {/* Time slots and events */}
                  {Array.from({ length: 24 }, (_, hour) => (
                    <React.Fragment key={hour}>
                      {/* Time label */}
                      <div style={{
                        background: theme.colors.backgroundCard,
                        padding: '8px 4px',
                        textAlign: 'center',
                        fontSize: '12px',
                        color: theme.colors.textSecondary,
                        borderRight: `1px solid ${theme.colors.border}`,
                        borderBottom: `1px solid ${theme.colors.border}`,
                        height: '80px'
                      }}>
                        {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                      </div>
                      
                      {/* Day cell for this hour */}
                      <div
                        style={{
                          background: theme.colors.backgroundCard,
                          minHeight: '80px',
                          padding: '4px',
                          borderRight: `1px solid ${theme.colors.border}`,
                          borderBottom: `1px solid ${theme.colors.border}`,
                          position: 'relative',
                          cursor: 'pointer'
                        }}
                        onClick={() => {
                          const newDate = new Date(currentDate)
                          newDate.setHours(hour, 0, 0, 0)
                          setCurrentDate(newDate)
                          setShowNewEventModal(true)
                          setNewEventForm(prev => ({
                            ...prev,
                            startDate: newDate.toISOString().split('T')[0],
                            startTime: `${hour.toString().padStart(2, '0')}:00`,
                            endTime: `${(hour + 1).toString().padStart(2, '0')}:00`
                          }))
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = theme.colors.backgroundCardHover
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = theme.colors.backgroundCard
                        }}
                      >
                        {/* Events for this time slot */}
                        {filteredEvents
                          .filter(event => {
                            const eventDate = new Date(event.startDate)
                            const eventHour = event.startTime ? parseInt(event.startTime.split(':')[0]) : 0
                            return eventDate.toDateString() === currentDate.toDateString() && eventHour === hour
                          })
                          .map((event) => (
                            <div
                              key={event.id}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEventClick(event)
                              }}
                              style={{
                                background: getEventColor(event.type, event.priority),
                                color: '#ffffff',
                                fontSize: '11px',
                                padding: '4px 6px',
                                borderRadius: '4px',
                                marginBottom: '2px',
                                cursor: 'pointer',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                position: 'absolute',
                                top: '2px',
                                left: '2px',
                                right: '2px'
                              }}
                              title={event.title}
                            >
                              <div style={{ fontWeight: '600' }}>{event.title}</div>
                              {event.startTime && (
                                <div style={{ fontSize: '9px', opacity: 0.9 }}>
                                  {formatTime(event.startTime)} - {formatTime(event.endTime)}
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Sidebar (when not in compact view) */}
        {!compactView && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Quick Stats */}
            <Card>
              <div style={{ padding: '16px' }}>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: theme.colors.textPrimary }}>
                  Quick Stats
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '14px', color: theme.colors.textSecondary }}>Total Events</span>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary }}>{filteredEvents.length}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '14px', color: theme.colors.textSecondary }}>This Week</span>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary }}>
                      {filteredEvents.filter(e => {
                        const eventDate = new Date(e.startDate)
                        const weekStart = new Date(currentDate)
                        weekStart.setDate(weekStart.getDate() - weekStart.getDay())
                        const weekEnd = new Date(weekStart)
                        weekEnd.setDate(weekEnd.getDate() + 6)
                        return eventDate >= weekStart && eventDate <= weekEnd
                      }).length}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '14px', color: theme.colors.textSecondary }}>Completed</span>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.success }}>
                      {filteredEvents.filter(e => e.status === 'completed').length}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '14px', color: theme.colors.textSecondary }}>Pending</span>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.warning }}>
                      {filteredEvents.filter(e => e.status === 'scheduled' || e.status === 'confirmed').length}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Upcoming Events */}
            <Card>
              <div style={{ padding: '16px' }}>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: theme.colors.textPrimary }}>
                  Upcoming
                </h4>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {filteredEvents
                    .filter(e => new Date(e.startDate) >= new Date())
                    .slice(0, 5)
                    .map((event) => (
                    <div
                      key={event.id}
                      onClick={() => handleEventClick(event)}
                      style={{
                        padding: '12px',
                        background: theme.colors.background,
                        border: `1px solid ${theme.colors.border}`,
                        borderRadius: '8px',
                        marginBottom: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = theme.colors.backgroundCardHover
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = theme.colors.background
                      }}
                    >
                      <div style={{ fontSize: '13px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '4px' }}>
                        {event.title}
                      </div>
                      <div style={{ fontSize: '11px', color: theme.colors.textSecondary }}>
                        {formatDate(event.startDate)} at {formatTime(event.startTime)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Event Detail Modal */}
      {showEventModal && selectedEvent && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: theme.colors.backgroundCard,
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '80vh',
            overflowY: 'auto',
            border: `1px solid ${theme.colors.border}`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ color: getEventColor(selectedEvent.type, selectedEvent.priority) }}>
                  {getEventIcon(selectedEvent.type)}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary }}>
                    {selectedEvent.title}
                  </h3>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    <span style={{
                      padding: '2px 8px',
                      background: getEventColor(selectedEvent.type, selectedEvent.priority),
                      color: '#ffffff',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: '600',
                      textTransform: 'uppercase'
                    }}>
                      {selectedEvent.type}
                    </span>
                    <span style={{
                      padding: '2px 8px',
                      background: getStatusColor(selectedEvent.status),
                      color: '#ffffff',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: '600',
                      textTransform: 'uppercase'
                    }}>
                      {selectedEvent.status.replace('_', ' ')}
                    </span>
                    <span style={{
                      padding: '2px 8px',
                      background: theme.colors.backgroundTertiary,
                      color: theme.colors.textSecondary,
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: '600',
                      textTransform: 'uppercase'
                    }}>
                      {selectedEvent.priority}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowEventModal(false)}
                style={{
                  padding: '8px',
                  background: 'transparent',
                  border: 'none',
                  color: theme.colors.textSecondary,
                  cursor: 'pointer',
                  borderRadius: '6px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = theme.colors.backgroundCardHover
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                <XCircle size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {selectedEvent.startTime && (
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '4px' }}>
                    Time
                  </div>
                  <div style={{ fontSize: '14px', color: theme.colors.textSecondary }}>
                    {formatTime(selectedEvent.startTime)} - {formatTime(selectedEvent.endTime)}
                  </div>
                </div>
              )}

              {selectedEvent.location && (
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '4px' }}>
                    Location
                  </div>
                  <div style={{ fontSize: '14px', color: theme.colors.textSecondary }}>
                    {selectedEvent.location}
                  </div>
                </div>
              )}

              {selectedEvent.driverName && (
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '4px' }}>
                    Driver
                  </div>
                  <div style={{ fontSize: '14px', color: theme.colors.textSecondary }}>
                    {selectedEvent.driverName}
                  </div>
                </div>
              )}

              {selectedEvent.vehicleName && (
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '4px' }}>
                    Vehicle
                  </div>
                  <div style={{ fontSize: '14px', color: theme.colors.textSecondary }}>
                    {selectedEvent.vehicleName}
                  </div>
                </div>
              )}

              {selectedEvent.description && (
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '4px' }}>
                    Description
                  </div>
                  <div style={{ fontSize: '14px', color: theme.colors.textSecondary, lineHeight: '1.5' }}>
                    {selectedEvent.description}
                  </div>
                </div>
              )}

              {selectedEvent.notes && (
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '4px' }}>
                    Notes
                  </div>
                  <div style={{ fontSize: '14px', color: theme.colors.textSecondary, lineHeight: '1.5' }}>
                    {selectedEvent.notes}
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                onClick={handleEditEvent}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'transparent',
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: '8px',
                  color: theme.colors.textSecondary,
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
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
                <Edit size={16} />
                Edit
              </button>
              
              <button
                onClick={() => {
                  setShowEventModal(false)
                  setShowDeleteModal(true)
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'transparent',
                  border: `1px solid ${theme.colors.error}`,
                  borderRadius: '8px',
                  color: theme.colors.error,
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = theme.colors.error
                  e.currentTarget.style.color = '#ffffff'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = theme.colors.error
                }}
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Event Modal */}
      {showNewEventModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: theme.colors.backgroundCard,
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '80vh',
            overflowY: 'auto',
            border: `1px solid ${theme.colors.border}`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: theme.colors.textPrimary }}>
                Create New Event
              </h3>
              <button
                onClick={() => {
                  setShowNewEventModal(false)
                  resetNewEventForm()
                }}
                style={{
                  padding: '8px',
                  background: 'transparent',
                  border: 'none',
                  color: theme.colors.textSecondary,
                  cursor: 'pointer',
                  borderRadius: '6px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = theme.colors.backgroundCardHover
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                <XCircle size={20} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
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
                    background: theme.colors.background,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: '8px',
                    color: theme.colors.textPrimary,
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                  Event Type *
                </label>
                <select
                  value={newEventForm.type}
                  onChange={(e) => setNewEventForm(prev => ({ ...prev, type: e.target.value as CalendarEventType }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: theme.colors.background,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: '8px',
                    color: theme.colors.textPrimary,
                    fontSize: '14px'
                  }}
                >
                  <option value="custom">Custom</option>
                  <option value="load">Load</option>
                  <option value="pickup">Pickup</option>
                  <option value="delivery">Delivery</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="compliance">Compliance</option>
                  <option value="driver">Driver</option>
                  <option value="meeting">Meeting</option>
                  <option value="break">Break</option>
                  <option value="training">Training</option>
                  <option value="inspection">Inspection</option>
                </select>
              </div>

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
                    background: theme.colors.background,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: '8px',
                    color: theme.colors.textPrimary,
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                  Start Time *
                </label>
                <input
                  type="time"
                  value={newEventForm.startTime}
                  onChange={(e) => setNewEventForm(prev => ({ ...prev, startTime: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: theme.colors.background,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: '8px',
                    color: theme.colors.textPrimary,
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                  End Date *
                </label>
                <input
                  type="date"
                  value={newEventForm.endDate}
                  onChange={(e) => setNewEventForm(prev => ({ ...prev, endDate: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: theme.colors.background,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: '8px',
                    color: theme.colors.textPrimary,
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                  End Time *
                </label>
                <input
                  type="time"
                  value={newEventForm.endTime}
                  onChange={(e) => setNewEventForm(prev => ({ ...prev, endTime: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: theme.colors.background,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: '8px',
                    color: theme.colors.textPrimary,
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                  Priority
                </label>
                <select
                  value={newEventForm.priority}
                  onChange={(e) => setNewEventForm(prev => ({ ...prev, priority: e.target.value as CalendarEventPriority }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: theme.colors.background,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: '8px',
                    color: theme.colors.textPrimary,
                    fontSize: '14px'
                  }}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                  Driver
                </label>
                <select
                  value={newEventForm.driverId}
                  onChange={(e) => setNewEventForm(prev => ({ ...prev, driverId: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: theme.colors.background,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: '8px',
                    color: theme.colors.textPrimary,
                    fontSize: '14px'
                  }}
                >
                  <option value="">Select Driver</option>
                  {drivers.map((driver: any) => (
                    <option key={driver.id} value={driver.id}>{driver.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                  Vehicle
                </label>
                <select
                  value={newEventForm.vehicleId}
                  onChange={(e) => setNewEventForm(prev => ({ ...prev, vehicleId: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: theme.colors.background,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: '8px',
                    color: theme.colors.textPrimary,
                    fontSize: '14px'
                  }}
                >
                  <option value="">Select Vehicle</option>
                  {vehicles.map((vehicle: any) => (
                    <option key={vehicle.id} value={vehicle.id}>{vehicle.number} - {vehicle.type}</option>
                  ))}
                </select>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                  Location
                </label>
                <input
                  type="text"
                  value={newEventForm.location}
                  onChange={(e) => setNewEventForm(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Enter location"
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: theme.colors.background,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: '8px',
                    color: theme.colors.textPrimary,
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                  Description
                </label>
                <textarea
                  value={newEventForm.description}
                  onChange={(e) => setNewEventForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter event description"
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: theme.colors.background,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: '8px',
                    color: theme.colors.textPrimary,
                    fontSize: '14px',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                onClick={() => {
                  setShowNewEventModal(false)
                  resetNewEventForm()
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'transparent',
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: '8px',
                  color: theme.colors.textSecondary,
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = theme.colors.backgroundCardHover
                  e.currentTarget.style.color = theme.colors.textPrimary
                  e.currentTarget.style.borderColor = theme.colors.primary
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = theme.colors.textSecondary
                  e.currentTarget.style.borderColor = theme.colors.border
                }}
              >
                Cancel
              </button>
              
              <button
                onClick={handleCreateEvent}
                disabled={!newEventForm.title || !newEventForm.startDate || !newEventForm.startTime}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'transparent',
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: '8px',
                  color: theme.colors.textSecondary,
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: newEventForm.title && newEventForm.startDate && newEventForm.startTime ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s ease',
                  opacity: newEventForm.title && newEventForm.startDate && newEventForm.startTime ? 1 : 0.5
                }}
                onMouseEnter={(e) => {
                  if (newEventForm.title && newEventForm.startDate && newEventForm.startTime) {
                    e.currentTarget.style.background = theme.colors.backgroundCardHover
                    e.currentTarget.style.color = theme.colors.textPrimary
                    e.currentTarget.style.borderColor = theme.colors.primary
                  }
                }}
                onMouseLeave={(e) => {
                  if (newEventForm.title && newEventForm.startDate && newEventForm.startTime) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = theme.colors.textSecondary
                    e.currentTarget.style.borderColor = theme.colors.border
                  }
                }}
              >
                Create Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedEvent && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: theme.colors.backgroundCard,
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '400px',
            width: '100%',
            border: `1px solid ${theme.colors.border}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <AlertTriangle size={24} color={theme.colors.error} />
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary }}>
                Delete Event
              </h3>
            </div>
            
            <p style={{ fontSize: '14px', color: theme.colors.textSecondary, marginBottom: '24px', lineHeight: '1.5' }}>
              Are you sure you want to delete "{selectedEvent.title}"? This action cannot be undone.
            </p>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowDeleteModal(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'transparent',
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: '8px',
                  color: theme.colors.textSecondary,
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = theme.colors.backgroundCardHover
                  e.currentTarget.style.color = theme.colors.textPrimary
                  e.currentTarget.style.borderColor = theme.colors.primary
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = theme.colors.textSecondary
                  e.currentTarget.style.borderColor = theme.colors.border
                }}
              >
                Cancel
              </button>
              
              <button
                onClick={handleDeleteEvent}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'transparent',
                  border: `1px solid ${theme.colors.error}`,
                  borderRadius: '8px',
                  color: theme.colors.error,
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = theme.colors.error
                  e.currentTarget.style.color = '#ffffff'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = theme.colors.error
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

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
  )
}

export default CarrierCalendarPage