import apiClient from '../api/client'

export interface MobileFuelUpdate {
  vehicleId: string
  driverId: string
  loadId: string
  fuelLevel: number
  odometerReading: number
  timestamp: string
  location: {
    lat: number
    lng: number
    address: string
  }
  loadCompleted: boolean
}

export interface FuelTrackingResponse {
  success: boolean
  message: string
  updatedVehicle: {
    id: string
    unitNumber: string
    fuelLevel: number
    odometer: number
    lastFuelUpdate: string
  }
}

// Mobile app fuel tracking API
export const mobileFuelAPI = {
  // Update fuel level at end of load (mobile app endpoint)
  updateFuelAtLoadEnd: async (update: MobileFuelUpdate): Promise<FuelTrackingResponse> => {
    try {
      const response = await apiClient.post('/api/mobile/fuel/update', update)
      return response.data
    } catch (error) {
      console.error('Failed to update fuel level:', error)
      throw error
    }
  },

  // Get fuel tracking history for a vehicle
  getFuelHistory: async (vehicleId: string, limit: number = 50) => {
    try {
      const response = await apiClient.get(`/api/mobile/fuel/history/${vehicleId}?limit=${limit}`)
      return response.data
    } catch (error) {
      console.error('Failed to get fuel history:', error)
      throw error
    }
  },

  // Get fuel efficiency analytics
  getFuelEfficiency: async (vehicleId: string, dateRange?: { start: string, end: string }) => {
    try {
      const params = dateRange ? { ...dateRange } : {}
      const response = await apiClient.get(`/api/mobile/fuel/efficiency/${vehicleId}`, { params })
      return response.data
    } catch (error) {
      console.error('Failed to get fuel efficiency:', error)
      throw error
    }
  },

  // Simulate mobile app fuel update (for development/testing)
  simulateMobileUpdate: async (vehicleId: string, loadId: string, fuelLevel: number) => {
    try {
      const mockUpdate: MobileFuelUpdate = {
        vehicleId,
        driverId: 'mock-driver-123',
        loadId,
        fuelLevel,
        odometerReading: Math.floor(Math.random() * 50000) + 100000,
        timestamp: new Date().toISOString(),
        location: {
          lat: 32.7767,
          lng: -96.7970,
          address: 'Dallas, TX'
        },
        loadCompleted: true
      }
      
      const response = await apiClient.post('/api/mobile/fuel/simulate', mockUpdate)
      return response.data
    } catch (error) {
      console.error('Failed to simulate mobile update:', error)
      throw error
    }
  }
}

export default mobileFuelAPI





