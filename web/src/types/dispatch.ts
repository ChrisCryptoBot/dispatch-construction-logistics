/**
 * Dispatch Status Types for Real-Time Coordination
 * 
 * Critical for dispatch workflow:
 * - EMPTY: Driver is ready to pick up new load
 * - LOADED: Driver is en route to delivery (has load)
 * - AT_PICKUP: Driver is at pickup location
 * - AT_DELIVERY: Driver is at delivery location
 * - EN_ROUTE_PICKUP: Driver is heading to pickup location
 * - EN_ROUTE_DELIVERY: Driver is heading to delivery location
 */

export type DriverStatus = 
  | 'EMPTY'           // Ready to pick up new load
  | 'LOADED'          // Has load, heading to delivery
  | 'AT_PICKUP'       // At pickup location
  | 'AT_DELIVERY'     // At delivery location
  | 'EN_ROUTE_PICKUP' // Heading to pickup
  | 'EN_ROUTE_DELIVERY' // Heading to delivery
  | 'OFF_DUTY'        // Not available
  | 'ON_BREAK'        // Temporary unavailable

export type LoadStatus = 
  | 'PENDING'         // Load created, awaiting assignment
  | 'ASSIGNED'        // Load assigned to driver
  | 'PICKUP_SCHEDULED' // Pickup time confirmed
  | 'PICKUP_CONFIRMED' // Driver at pickup location
  | 'PICKED_UP'       // Load picked up
  | 'IN_TRANSIT'      // Load in transit to delivery
  | 'DELIVERY_SCHEDULED' // Delivery time confirmed
  | 'DELIVERY_CONFIRMED' // Driver at delivery location
  | 'DELIVERED'       // Load delivered
  | 'CANCELLED'       // Load cancelled

export interface DriverLocation {
  lat: number
  lng: number
  address?: string
  lastUpdated: string // ISO timestamp
  accuracy?: number // GPS accuracy in meters
}

export interface DriverStatusUpdate {
  id: string
  driverId: string
  driverName: string
  status: DriverStatus
  location?: DriverLocation
  currentLoadId?: string
  currentLoadDescription?: string
  etaToPickup?: string // ISO timestamp
  etaToDelivery?: string // ISO timestamp
  notes?: string
  timestamp: string // ISO timestamp
  source: 'mobile_app' | 'web_app' | 'api' | 'manual'
}

export interface DispatchAlert {
  id: string
  type: 'DRIVER_EMPTY' | 'DRIVER_LOADED' | 'PICKUP_ETA' | 'DELIVERY_ETA' | 'STATUS_CHANGE'
  driverId: string
  driverName: string
  loadId?: string
  message: string
  priority: 'high' | 'medium' | 'low'
  timestamp: string
  acknowledged: boolean
  acknowledgedBy?: string
  acknowledgedAt?: string
}

export interface DispatchCoordination {
  driverId: string
  driverName: string
  status: DriverStatus
  currentLoad?: {
    id: string
    customerName: string
    pickupLocation: string
    deliveryLocation: string
    pickupTime: string
    deliveryTime: string
  }
  nextLoad?: {
    id: string
    customerName: string
    pickupLocation: string
    pickupTime: string
  }
  location: DriverLocation
  etaToPickup?: string
  etaToDelivery?: string
  lastUpdate: string
}

export interface MobileDriverUpdate {
  driverId: string
  status: DriverStatus
  location: DriverLocation
  loadId?: string
  notes?: string
  timestamp: string
}
