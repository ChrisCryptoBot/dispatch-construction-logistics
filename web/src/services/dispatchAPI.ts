import apiClient from '../api/client'
import type { 
  DriverStatusUpdate, 
  DispatchAlert, 
  DispatchCoordination, 
  MobileDriverUpdate,
  DriverStatus 
} from '../types/dispatch'

export const dispatchAPI = {
  // Get all driver statuses for dispatch coordination
  getDriverStatuses: async () => {
    const response = await apiClient.get('/dispatch/driver-statuses')
    return response.data as DispatchCoordination[]
  },

  // Get specific driver status
  getDriverStatus: async (driverId: string) => {
    const response = await apiClient.get(`/dispatch/driver-statuses/${driverId}`)
    return response.data as DispatchCoordination
  },

  // Update driver status (from mobile app or web)
  updateDriverStatus: async (driverId: string, update: MobileDriverUpdate) => {
    const response = await apiClient.post(`/dispatch/driver-statuses/${driverId}`, update)
    return response.data as DriverStatusUpdate
  },

  // Get dispatch alerts
  getAlerts: async () => {
    const response = await apiClient.get('/dispatch/alerts')
    return response.data as DispatchAlert[]
  },

  // Acknowledge alert
  acknowledgeAlert: async (alertId: string) => {
    const response = await apiClient.post(`/dispatch/alerts/${alertId}/acknowledge`)
    return response.data
  },

  // Get empty drivers (ready for new loads)
  getEmptyDrivers: async () => {
    const response = await apiClient.get('/dispatch/drivers/empty')
    return response.data as DispatchCoordination[]
  },

  // Get loaded drivers (en route to delivery)
  getLoadedDrivers: async () => {
    const response = await apiClient.get('/dispatch/drivers/loaded')
    return response.data as DispatchCoordination[]
  },

  // Get driver ETA for pickup
  getPickupETA: async (driverId: string, pickupLocation: { lat: number, lng: number }) => {
    const response = await apiClient.post(`/dispatch/drivers/${driverId}/eta/pickup`, {
      location: pickupLocation
    })
    return response.data as { eta: string, distance: number, duration: number }
  },

  // Get driver ETA for delivery
  getDeliveryETA: async (driverId: string, deliveryLocation: { lat: number, lng: number }) => {
    const response = await apiClient.post(`/dispatch/drivers/${driverId}/eta/delivery`, {
      location: deliveryLocation
    })
    return response.data as { eta: string, distance: number, duration: number }
  },

  // Send dispatch notification to driver
  notifyDriver: async (driverId: string, message: string, type: 'load_assignment' | 'pickup_reminder' | 'delivery_reminder' | 'status_request') => {
    const response = await apiClient.post(`/dispatch/drivers/${driverId}/notify`, {
      message,
      type
    })
    return response.data
  },

  // Get dispatch statistics
  getDispatchStats: async () => {
    const response = await apiClient.get('/dispatch/stats')
    return response.data as {
      totalDrivers: number
      emptyDrivers: number
      loadedDrivers: number
      driversAtPickup: number
      driversAtDelivery: number
      driversEnRoute: number
      activeLoads: number
      pendingPickups: number
      pendingDeliveries: number
    }
  }
}
