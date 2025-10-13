// Carrier-specific API types
export interface CarrierLoad {
  id: string
  loadNumber: string
  origin: string
  destination: string
  pickupDate: string
  deliveryDate: string
  status: 'pending' | 'assigned' | 'in-transit' | 'delivered' | 'cancelled'
  revenue: number
  permitCost?: number
  driverId?: string
  equipmentId?: string
  documents: Document[]
  tracking: LoadTracking
}

export interface CarrierDriver {
  id: string
  name: string
  licenseNumber: string
  phone: string
  email: string
  status: 'available' | 'assigned' | 'off-duty' | 'suspended'
  currentLoadId?: string
  location: DriverLocation
  certifications: Certification[]
}

export interface CarrierEquipment {
  id: string
  type: 'tractor' | 'trailer' | 'both'
  make: string
  model: string
  year: number
  vin: string
  licensePlate: string
  status: 'available' | 'in-use' | 'maintenance' | 'out-of-service'
  currentDriverId?: string
  maintenanceSchedule: MaintenanceRecord[]
}

export interface CarrierDashboard {
  stats: {
    activeLoads: number
    availableDrivers: number
    totalRevenue: number
    onTimeDelivery: number
  }
  recentActivity: Activity[]
  alerts: Alert[]
}

export interface Document {
  id: string
  type: 'bol' | 'pod' | 'permit' | 'insurance' | 'other'
  name: string
  url: string
  uploadedAt: string
  status: 'pending' | 'approved' | 'rejected'
}

export interface LoadTracking {
  currentLocation: {
    lat: number
    lng: number
    address: string
  }
  lastUpdated: string
  estimatedArrival: string
  status: 'loading' | 'in-transit' | 'delivered'
}

export interface DriverLocation {
  lat: number
  lng: number
  address: string
  lastUpdated: string
}

export interface Certification {
  id: string
  type: string
  issuedDate: string
  expiryDate: string
  status: 'valid' | 'expired' | 'pending'
}

export interface MaintenanceRecord {
  id: string
  type: string
  description: string
  date: string
  cost: number
  nextDueDate?: string
}

export interface Activity {
  id: string
  type: string
  description: string
  timestamp: string
  loadId?: string
  driverId?: string
}

export interface Alert {
  id: string
  type: 'urgent' | 'warning' | 'info'
  title: string
  message: string
  timestamp: string
  acknowledged: boolean
}
