import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('⚠️ API returned 401, but keeping dev auth active')
      // Don't clear token in development mode
      // localStorage.removeItem('token')
      // window.location.href = '/auth/login'
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  login: (credentials: { email: string; password: string }) => 
    api.post('/auth/login', credentials).then(res => res.data),
  register: (data: {
    orgName: string;
    orgType: 'SHIPPER' | 'CARRIER';
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) => api.post('/auth/register', data).then(res => res.data),
  getMe: (token: string) => api.get('/auth/me', {
    headers: { Authorization: `Bearer ${token}` }
  }).then(res => res.data),
  refresh: () => api.post('/auth/refresh').then(res => res.data),
}

export const organizationsAPI = {
  create: (data: any) => api.post('/organizations', data).then(res => res.data),
  get: (id: string) => api.get(`/organizations/${id}`).then(res => res.data),
  update: (id: string, data: any) => api.patch(`/organizations/${id}`, data).then(res => res.data),
  list: () => api.get('/organizations').then(res => res.data),
}

export const loadsAPI = {
  create: (data: any) => api.post('/loads', data).then(res => res.data),
  get: (id: string) => api.get(`/loads/${id}`).then(res => res.data),
  updateStatus: (id: string, status: string) => 
    api.patch(`/loads/${id}/status`, { status }).then(res => res.data),
  list: (params: any = {}) => api.get('/loads', { params }).then(res => res.data),
  delete: (id: string) => api.delete(`/loads/${id}`).then(res => res.data),
}

export const marketplaceAPI = {
  getLoads: (params: any = {}) => 
    api.get('/marketplace/loads', { params }).then(res => res.data),
  expressInterest: (loadId: string, data: { message?: string }) => 
    api.post(`/marketplace/${loadId}/interest`, data).then(res => res.data),
  assignCarrier: (loadId: string, carrierId: string) => 
    api.post(`/marketplace/${loadId}/assign`, { carrierId }).then(res => res.data),
  acceptLoad: (loadId: string) => 
    api.patch(`/marketplace/${loadId}/accept`).then(res => res.data),
  rejectLoad: (loadId: string, reason?: string) => 
    api.patch(`/marketplace/${loadId}/reject`, { reason }).then(res => res.data),
}

export const dispatchAPI = {
  getEquipmentSuggestions: (commodity: string) => 
    api.get(`/dispatch/suggestions/${commodity}`).then(res => res.data),
  validateCompliance: (data: any) => 
    api.post('/dispatch/validate', data).then(res => res.data),
  getEquipmentTypes: () => 
    api.get('/dispatch/equipment-types').then(res => res.data),
}

export const customerAPI = {
  createLoad: (data: any) => 
    api.post('/customer/loads', data).then(res => res.data),
  getLoads: (params: any = {}) => 
    api.get('/customer/loads', { params }).then(res => res.data),
  getLoad: (id: string) => 
    api.get(`/customer/loads/${id}`).then(res => res.data),
  acceptBid: (loadId: string, bidId: string, notes?: string) => 
    api.post(`/customer/loads/${loadId}/bids/${bidId}/accept`, { notes }).then(res => res.data),
  rejectBid: (loadId: string, bidId: string, reason?: string) => 
    api.post(`/customer/loads/${loadId}/bids/${bidId}/reject`, { reason }).then(res => res.data),
  issueRelease: (loadId: string, data: {
    confirmedReady: boolean;
    quantityConfirmed: string;
    siteContact: string;
    pickupInstructions?: string;
    acknowledgedTonu: boolean;
  }) => 
    api.post(`/customer/loads/${loadId}/release`, data).then(res => res.data),
  getDashboardStats: () => 
    api.get('/customer/dashboard/stats').then(res => res.data),
}

export const carrierAPI = {
  getAvailableLoads: (params: any = {}) => 
    api.get('/carrier/available-loads', { params }).then(res => res.data),
  submitBid: (loadId: string, data: { bidAmount?: number; message?: string; expiresInHours?: number }) => 
    api.post(`/carrier/loads/${loadId}/bid`, data).then(res => res.data),
  getMyLoads: (params: any = {}) => 
    api.get('/carrier/my-loads', { params }).then(res => res.data),
  acceptLoad: (loadId: string, data?: { notes?: string; driverId?: string; equipmentId?: string }) => 
    api.post(`/carrier/loads/${loadId}/accept`, data).then(res => res.data),
  getReleaseStatus: (loadId: string) => 
    api.get(`/carrier/loads/${loadId}/release-status`).then(res => res.data),
  fileTonu: (loadId: string, data: {
    reason: string;
    arrivalTime: string;
    waitTime?: number;
    evidence?: string[];
  }) => 
    api.post(`/carrier/loads/${loadId}/tonu`, data).then(res => res.data),
  getDashboardStats: () => 
    api.get('/carrier/dashboard/stats').then(res => res.data),
}

export const messagingAPI = {
  getConversations: () => api.get('/messaging/conversations').then(res => res.data),
  getMessages: (conversationId: string) => api.get(`/messaging/conversations/${conversationId}/messages`).then(res => res.data),
  sendMessage: (conversationId: string, content: string, attachments?: any[]) => 
    api.post(`/messaging/conversations/${conversationId}/messages`, { content, attachments }).then(res => res.data),
  markAsRead: (conversationId: string) => api.patch(`/messaging/conversations/${conversationId}/read`).then(res => res.data),
}

export const documentsAPI = {
  getDocuments: (params: any = {}) => api.get('/documents', { params }).then(res => res.data),
  uploadDocument: (file: File, metadata: any) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('metadata', JSON.stringify(metadata))
    return api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data)
  },
  downloadDocument: (documentId: string) => api.get(`/documents/${documentId}/download`).then(res => res.data),
  deleteDocument: (documentId: string) => api.delete(`/documents/${documentId}`).then(res => res.data),
  updateDocument: (documentId: string, data: any) => api.patch(`/documents/${documentId}`, data).then(res => res.data),
}

export const analyticsAPI = {
  getAnalytics: (params: any = {}) => api.get('/analytics', { params }).then(res => res.data),
  getPerformanceMetrics: () => api.get('/analytics/performance').then(res => res.data),
  getFinancialMetrics: () => api.get('/analytics/financial').then(res => res.data),
  getFleetMetrics: () => api.get('/analytics/fleet').then(res => res.data),
  exportReport: (type: string, params: any = {}) => api.post(`/analytics/export/${type}`, params).then(res => res.data),
}

export const scaleTicketsAPI = {
  getScaleTickets: (params: any = {}) => api.get('/scale-tickets', { params }).then(res => res.data),
  uploadScaleTicket: (file: File, loadId: string) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('loadId', loadId)
    return api.post('/scale-tickets/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data)
  },
  processOCR: (ticketId: string) => api.post(`/scale-tickets/${ticketId}/ocr`).then(res => res.data),
  verifyTicket: (ticketId: string, data: any) => api.patch(`/scale-tickets/${ticketId}/verify`, data).then(res => res.data),
  deleteTicket: (ticketId: string) => api.delete(`/scale-tickets/${ticketId}`).then(res => res.data),
}

export const fleetAPI = {
  getVehicles: (params: any = {}) => api.get('/fleet/vehicles', { params }).then(res => res.data),
  getVehicle: (vehicleId: string) => api.get(`/fleet/vehicles/${vehicleId}`).then(res => res.data),
  addVehicle: (data: any) => api.post('/fleet/vehicles', data).then(res => res.data),
  updateVehicle: (vehicleId: string, data: any) => api.patch(`/fleet/vehicles/${vehicleId}`, data).then(res => res.data),
  deleteVehicle: (vehicleId: string) => api.delete(`/fleet/vehicles/${vehicleId}`).then(res => res.data),
  getMaintenance: (vehicleId: string) => api.get(`/fleet/vehicles/${vehicleId}/maintenance`).then(res => res.data),
  scheduleMaintenance: (vehicleId: string, data: any) => api.post(`/fleet/vehicles/${vehicleId}/maintenance`, data).then(res => res.data),
}

export { api }
export default api

