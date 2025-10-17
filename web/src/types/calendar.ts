/**
 * Calendar and Schedule Types
 * Comprehensive types for calendar events, scheduling, and time management
 */

export type CalendarEventType = 
  | 'load'           // Load pickup/delivery
  | 'maintenance'    // Vehicle maintenance
  | 'compliance'     // Compliance check
  | 'driver'         // Driver-related event
  | 'meeting'        // Business meeting
  | 'custom'         // Custom event
  | 'break'          // Break/rest period
  | 'training'       // Training session
  | 'inspection'     // Vehicle inspection
  | 'pickup'         // Load pickup
  | 'delivery'       // Load delivery

export type CalendarEventPriority = 'low' | 'medium' | 'high' | 'urgent'

export type CalendarEventStatus = 
  | 'scheduled'      // Event is scheduled
  | 'confirmed'      // Event is confirmed
  | 'in_progress'    // Event is currently happening
  | 'completed'      // Event is completed
  | 'cancelled'      // Event is cancelled
  | 'rescheduled'    // Event was rescheduled

export type CalendarView = 'day' | 'week' | 'month' | 'agenda'

export interface CalendarEvent {
  id: string
  title: string
  type: CalendarEventType
  startDate: string // ISO date string
  endDate: string   // ISO date string
  startTime?: string // HH:mm format
  endTime?: string   // HH:mm format
  allDay: boolean
  location?: string
  description?: string
  priority: CalendarEventPriority
  status: CalendarEventStatus
  driverId?: string
  driverName?: string
  vehicleId?: string
  vehicleName?: string
  loadId?: string
  customerName?: string
  pickupLocation?: string
  deliveryLocation?: string
  estimatedDuration?: number // in minutes
  actualDuration?: number    // in minutes
  notes?: string
  attachments?: string[]     // File URLs
  reminder?: {
    enabled: boolean
    minutesBefore: number
  }
  recurrence?: {
    enabled: boolean
    pattern: 'daily' | 'weekly' | 'monthly' | 'yearly'
    interval: number
    endDate?: string
    daysOfWeek?: number[] // 0-6 (Sunday-Saturday)
    dayOfMonth?: number   // 1-31
  }
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy?: string
}

export interface CalendarFilter {
  categories: string[]
  drivers: string[]
  vehicles: string[]
  status: CalendarEventStatus[]
  priority: CalendarEventPriority[]
  dateRange: {
    start: string
    end: string
  }
}

export interface CalendarSyncSource {
  id: string
  name: string
  type: 'google' | 'outlook' | 'apple' | 'api' | 'manual'
  enabled: boolean
  lastSync: string
  syncStatus: 'success' | 'error' | 'pending'
  errorMessage?: string
}

export interface CalendarStats {
  totalEvents: number
  completedEvents: number
  upcomingEvents: number
  overdueEvents: number
  eventsByType: Record<CalendarEventType, number>
  eventsByPriority: Record<CalendarEventPriority, number>
  averageDuration: number
  onTimeRate: number
}

export interface TimeSlot {
  hour: number
  minute: number
  available: boolean
  eventId?: string
  eventTitle?: string
  eventType?: CalendarEventType
}

export interface CalendarDay {
  date: string
  events: CalendarEvent[]
  isToday: boolean
  isSelected: boolean
  isInCurrentMonth: boolean
  timeSlots: TimeSlot[]
}

export interface CalendarWeek {
  startDate: string
  endDate: string
  days: CalendarDay[]
}

export interface CalendarMonth {
  year: number
  month: number
  weeks: CalendarWeek[]
  totalEvents: number
  totalHours: number
}

export interface ScheduleConflict {
  id: string
  eventId1: string
  eventId2: string
  conflictType: 'overlap' | 'resource_conflict' | 'driver_conflict'
  severity: 'low' | 'medium' | 'high'
  message: string
  suggestedResolution?: string
}

export interface CalendarNotification {
  id: string
  eventId: string
  type: 'reminder' | 'conflict' | 'update' | 'cancellation'
  title: string
  message: string
  timestamp: string
  read: boolean
  actionUrl?: string
}



