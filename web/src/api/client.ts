import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { APP_CONFIG } from '../config/constants'

// Create axios instance with default configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: APP_CONFIG.apiBaseUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for authentication
apiClient.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = localStorage.getItem('auth-token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error) => {
    // Handle common error scenarios
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      localStorage.removeItem('auth-token')
      window.location.href = '/login'
    } else if (error.response?.status === 403) {
      // Forbidden - show access denied message
      console.error('Access denied:', error.response.data.message)
    } else if (error.response?.status >= 500) {
      // Server error - show generic error message
      console.error('Server error:', error.response.data.message)
    }
    
    return Promise.reject(error)
  }
)

export default apiClient

// API response wrapper types
export interface ApiResponse<T = any> {
  data: T
  message?: string
  success: boolean
  timestamp: string
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Helper functions for common API operations
export const apiGet = async <T>(url: string): Promise<T> => {
  const response = await apiClient.get<ApiResponse<T>>(url)
  return response.data.data
}

export const apiPost = async <T>(url: string, data?: any): Promise<T> => {
  const response = await apiClient.post<ApiResponse<T>>(url, data)
  return response.data.data
}

export const apiPut = async <T>(url: string, data?: any): Promise<T> => {
  const response = await apiClient.put<ApiResponse<T>>(url, data)
  return response.data.data
}

export const apiDelete = async <T>(url: string): Promise<T> => {
  const response = await apiClient.delete<ApiResponse<T>>(url)
  return response.data.data
}
