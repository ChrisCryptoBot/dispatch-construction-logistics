import type { CalendarEvent } from '../types'

export interface LoadEvent {
  id: string
  loadNumber: string
  customer: string
  pickupDate: Date
  deliveryDate: Date
  pickupLocation: string
  deliveryLocation: string
  driver?: string
  status: 'booked' | 'in-transit' | 'delivered' | 'cancelled'
  rate: number
  equipment: string
  specialInstructions?: string
}

export interface MaintenanceEvent {
  id: string
  vehicleId: string
  vehicleNumber: string
  serviceType: string
  scheduledDate: Date
  estimatedDuration: number
  serviceProvider: string
  cost: number
  priority: 'low' | 'medium' | 'high' | 'urgent'
  description: string
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
}

export interface ComplianceEvent {
  id: string
  type: 'license-renewal' | 'insurance-renewal' | 'inspection' | 'permit-expiry'
  entity: string // driver name, vehicle number, etc.
  dueDate: Date
  priority: 'low' | 'medium' | 'high' | 'urgent'
  description: string
  status: 'pending' | 'submitted' | 'approved' | 'expired'
}

export interface DriverEvent {
  id: string
  driverId: string
  driverName: string
  type: 'license-expiry' | 'medical-expiry' | 'training-due' | 'performance-review'
  dueDate: Date
  priority: 'low' | 'medium' | 'high' | 'urgent'
  description: string
  status: 'pending' | 'completed' | 'overdue'
}

class CalendarSyncService {
  private static instance: CalendarSyncService
  private events: CalendarEvent[] = []
  private listeners: ((events: CalendarEvent[]) => void)[] = []

  static getInstance(): CalendarSyncService {
    if (!CalendarSyncService.instance) {
      CalendarSyncService.instance = new CalendarSyncService()
    }
    return CalendarSyncService.instance
  }

  // Subscribe to calendar updates
  subscribe(listener: (events: CalendarEvent[]) => void): () => void {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  // Notify all listeners of changes
  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.events]))
  }

  // Convert load to calendar event
  private loadToCalendarEvent(load: LoadEvent): CalendarEvent {
    const pickupTime = new Date(load.pickupDate)
    const deliveryTime = new Date(load.deliveryDate)
    
    return {
      id: `load-${load.id}`,
      title: `Load ${load.loadNumber} - ${load.customer}`,
      type: 'load',
      start: pickupTime,
      end: deliveryTime,
      allDay: false,
      status: load.status === 'booked' ? 'scheduled' : 
              load.status === 'in-transit' ? 'in-progress' : 
              load.status === 'delivered' ? 'completed' : 'cancelled',
      priority: 'medium',
      location: `${load.pickupLocation} → ${load.deliveryLocation}`,
      description: `Load ${load.loadNumber} for ${load.customer}. Equipment: ${load.equipment}. Rate: $${load.rate.toLocaleString()}${load.specialInstructions ? `\n\nSpecial Instructions: ${load.specialInstructions}` : ''}`,
      color: this.getLoadColor(load.status),
      metadata: {
        loadId: load.id,
        loadNumber: load.loadNumber,
        customer: load.customer,
        driver: load.driver,
        rate: load.rate,
        equipment: load.equipment
      }
    }
  }

  // Convert maintenance to calendar event
  private maintenanceToCalendarEvent(maintenance: MaintenanceEvent): CalendarEvent {
    const startTime = new Date(maintenance.scheduledDate)
    const endTime = new Date(startTime.getTime() + maintenance.estimatedDuration * 60 * 1000)
    
    return {
      id: `maintenance-${maintenance.id}`,
      title: `${maintenance.serviceType} - ${maintenance.vehicleNumber}`,
      type: 'maintenance',
      start: startTime,
      end: endTime,
      allDay: false,
      status: maintenance.status === 'scheduled' ? 'scheduled' :
              maintenance.status === 'in-progress' ? 'in-progress' :
              maintenance.status === 'completed' ? 'completed' : 'cancelled',
      priority: maintenance.priority,
      location: maintenance.serviceProvider,
      description: `${maintenance.serviceType} for ${maintenance.vehicleNumber}. Provider: ${maintenance.serviceProvider}. Cost: $${maintenance.cost.toLocaleString()}. Duration: ${maintenance.estimatedDuration} minutes.\n\n${maintenance.description}`,
      color: this.getMaintenanceColor(maintenance.priority),
      metadata: {
        maintenanceId: maintenance.id,
        vehicleId: maintenance.vehicleId,
        vehicleNumber: maintenance.vehicleNumber,
        serviceType: maintenance.serviceType,
        cost: maintenance.cost,
        serviceProvider: maintenance.serviceProvider
      }
    }
  }

  // Convert compliance to calendar event
  private complianceToCalendarEvent(compliance: ComplianceEvent): CalendarEvent {
    return {
      id: `compliance-${compliance.id}`,
      title: `${compliance.type.replace('-', ' ').toUpperCase()} - ${compliance.entity}`,
      type: 'compliance',
      start: compliance.dueDate,
      end: compliance.dueDate,
      allDay: true,
      status: compliance.status === 'pending' ? 'scheduled' :
              compliance.status === 'submitted' ? 'in-progress' :
              compliance.status === 'approved' ? 'completed' : 'cancelled',
      priority: compliance.priority,
      location: compliance.entity,
      description: `${compliance.type.replace('-', ' ').toUpperCase()} for ${compliance.entity}. Due: ${compliance.dueDate.toLocaleDateString()}\n\n${compliance.description}`,
      color: this.getComplianceColor(compliance.priority),
      metadata: {
        complianceId: compliance.id,
        type: compliance.type,
        entity: compliance.entity,
        dueDate: compliance.dueDate
      }
    }
  }

  // Convert driver event to calendar event
  private driverToCalendarEvent(driver: DriverEvent): CalendarEvent {
    return {
      id: `driver-${driver.id}`,
      title: `${driver.type.replace('-', ' ').toUpperCase()} - ${driver.driverName}`,
      type: 'driver',
      start: driver.dueDate,
      end: driver.dueDate,
      allDay: true,
      status: driver.status === 'pending' ? 'scheduled' :
              driver.status === 'completed' ? 'completed' : 'cancelled',
      priority: driver.priority,
      location: driver.driverName,
      description: `${driver.type.replace('-', ' ').toUpperCase()} for ${driver.driverName}. Due: ${driver.dueDate.toLocaleDateString()}\n\n${driver.description}`,
      color: this.getDriverColor(driver.priority),
      metadata: {
        driverId: driver.id,
        driverName: driver.driverName,
        type: driver.type,
        dueDate: driver.dueDate
      }
    }
  }

  // Color mapping functions
  private getLoadColor(status: string): string {
    switch (status) {
      case 'booked': return '#3b82f6' // Blue
      case 'in-transit': return '#f59e0b' // Amber
      case 'delivered': return '#10b981' // Green
      case 'cancelled': return '#ef4444' // Red
      default: return '#6b7280' // Gray
    }
  }

  private getMaintenanceColor(priority: string): string {
    switch (priority) {
      case 'urgent': return '#ef4444' // Red
      case 'high': return '#f59e0b' // Amber
      case 'medium': return '#3b82f6' // Blue
      case 'low': return '#10b981' // Green
      default: return '#6b7280' // Gray
    }
  }

  private getComplianceColor(priority: string): string {
    switch (priority) {
      case 'urgent': return '#ef4444' // Red
      case 'high': return '#f59e0b' // Amber
      case 'medium': return '#3b82f6' // Blue
      case 'low': return '#10b981' // Green
      default: return '#6b7280' // Gray
    }
  }

  private getDriverColor(priority: string): string {
    switch (priority) {
      case 'urgent': return '#ef4444' // Red
      case 'high': return '#f59e0b' // Amber
      case 'medium': return '#3b82f6' // Blue
      case 'low': return '#10b981' // Green
      default: return '#6b7280' // Gray
    }
  }

  // Sync loads to calendar
  syncLoads(loads: LoadEvent[]): void {
    // Remove existing load events
    this.events = this.events.filter(event => !event.id.startsWith('load-'))
    
    // Add new load events
    const loadEvents = loads.map(load => this.loadToCalendarEvent(load))
    this.events.push(...loadEvents)
    
    this.notifyListeners()
  }

  // Sync maintenance to calendar
  syncMaintenance(maintenance: MaintenanceEvent[]): void {
    // Remove existing maintenance events
    this.events = this.events.filter(event => !event.id.startsWith('maintenance-'))
    
    // Add new maintenance events
    const maintenanceEvents = maintenance.map(m => this.maintenanceToCalendarEvent(m))
    this.events.push(...maintenanceEvents)
    
    this.notifyListeners()
  }

  // Sync compliance to calendar
  syncCompliance(compliance: ComplianceEvent[]): void {
    // Remove existing compliance events
    this.events = this.events.filter(event => !event.id.startsWith('compliance-'))
    
    // Add new compliance events
    const complianceEvents = compliance.map(c => this.complianceToCalendarEvent(c))
    this.events.push(...complianceEvents)
    
    this.notifyListeners()
  }

  // Sync driver events to calendar
  syncDrivers(drivers: DriverEvent[]): void {
    // Remove existing driver events
    this.events = this.events.filter(event => !event.id.startsWith('driver-'))
    
    // Add new driver events
    const driverEvents = drivers.map(d => this.driverToCalendarEvent(d))
    this.events.push(...driverEvents)
    
    this.notifyListeners()
  }

  // Get all events
  getAllEvents(): CalendarEvent[] {
    return [...this.events]
  }

  // Get events by type
  getEventsByType(type: string): CalendarEvent[] {
    return this.events.filter(event => event.type === type)
  }

  // Get events by date range
  getEventsByDateRange(startDate: Date, endDate: Date): CalendarEvent[] {
    return this.events.filter(event => {
      const eventDate = new Date(event.start)
      return eventDate >= startDate && eventDate <= endDate
    })
  }

  // Get upcoming events (next 7 days)
  getUpcomingEvents(): CalendarEvent[] {
    const today = new Date()
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    return this.getEventsByDateRange(today, nextWeek)
  }

  // Get overdue events
  getOverdueEvents(): CalendarEvent[] {
    const today = new Date()
    return this.events.filter(event => {
      const eventDate = new Date(event.start)
      return eventDate < today && event.status === 'scheduled'
    })
  }

  // Clear all events
  clearAllEvents(): void {
    this.events = []
    this.notifyListeners()
  }

  // Remove specific event
  removeEvent(eventId: string): void {
    this.events = this.events.filter(event => event.id !== eventId)
    this.notifyListeners()
  }

  // Update event status
  updateEventStatus(eventId: string, status: string): void {
    const event = this.events.find(e => e.id === eventId)
    if (event) {
      event.status = status as any
      this.notifyListeners()
    }
  }
}

export default CalendarSyncService
