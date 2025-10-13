// Customer-specific API types
export interface CustomerLoad {
  id: string
  loadNumber: string
  origin: string
  destination: string
  pickupDate: string
  deliveryDate: string
  status: 'pending' | 'assigned' | 'in-transit' | 'delivered' | 'cancelled'
  estimatedCost: number
  actualCost?: number
  carrierId?: string
  driverId?: string
  documents: Document[]
  tracking: LoadTracking
}

export interface CustomerJobSite {
  id: string
  name: string
  address: string
  contactPerson: string
  phone: string
  email: string
  specialInstructions?: string
  accessRequirements?: string
  active: boolean
  loads: CustomerLoad[]
}

export interface CustomerDashboard {
  stats: {
    activeLoads: number
    completedLoads: number
    totalSpent: number
    averageDeliveryTime: number
  }
  recentActivity: Activity[]
  upcomingPickups: CustomerLoad[]
}

export interface CustomerBid {
  id: string
  loadId: string
  carrierId: string
  bidAmount: number
  proposedPickupDate: string
  proposedDeliveryDate: string
  status: 'pending' | 'accepted' | 'rejected' | 'expired'
  submittedAt: string
  carrierInfo: {
    name: string
    rating: number
    totalLoads: number
  }
}

export interface Document {
  id: string
  type: 'bol' | 'pod' | 'invoice' | 'receipt' | 'other'
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

export interface Activity {
  id: string
  type: string
  description: string
  timestamp: string
  loadId?: string
  jobSiteId?: string
}
