// Shared API types used across carrier and customer
export interface User {
  id: string
  email: string
  name: string
  role: 'carrier' | 'customer' | 'admin'
  companyId: string
  companyName: string
  avatar?: string
  phone?: string
  isActive: boolean
  createdAt: string
  lastLoginAt?: string
}

export interface Company {
  id: string
  name: string
  type: 'carrier' | 'customer'
  address: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  contact: {
    phone: string
    email: string
    website?: string
  }
  billing: {
    taxId: string
    paymentTerms: string
    creditLimit?: number
  }
  isActive: boolean
  createdAt: string
}

export interface Message {
  id: string
  senderId: string
  receiverId: string
  loadId?: string
  subject: string
  content: string
  type: 'text' | 'image' | 'document'
  attachments?: Attachment[]
  read: boolean
  sentAt: string
  readAt?: string
}

export interface Attachment {
  id: string
  name: string
  type: string
  size: number
  url: string
  uploadedAt: string
}

export interface Notification {
  id: string
  userId: string
  type: 'info' | 'warning' | 'error' | 'success'
  title: string
  message: string
  read: boolean
  createdAt: string
  readAt?: string
  actionUrl?: string
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, any>
  timestamp: string
}

export interface PaginationParams {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  search?: string
  filters?: Record<string, any>
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface FileUpload {
  file: File
  progress: number
  status: 'uploading' | 'completed' | 'error'
  url?: string
  error?: string
}
