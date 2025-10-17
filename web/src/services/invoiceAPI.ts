import apiClient from '../api/client'
import type { Invoice, InvoiceStats, Payment, InvoiceFilters } from '../types/invoice'

export const invoiceAPI = {
  // Get all invoices with optional filters
  list: async (filters?: InvoiceFilters) => {
    const params = new URLSearchParams()
    
    if (filters?.status) params.append('status', filters.status)
    if (filters?.customerId) params.append('customerId', filters.customerId)
    if (filters?.carrierId) params.append('carrierId', filters.carrierId)
    if (filters?.dateRange) {
      params.append('startDate', filters.dateRange.start)
      params.append('endDate', filters.dateRange.end)
    }
    if (filters?.amountRange) {
      params.append('minAmount', filters.amountRange.min.toString())
      params.append('maxAmount', filters.amountRange.max.toString())
    }

    const response = await apiClient.get(`/invoices?${params.toString()}`)
    return response.data as Invoice[]
  },

  // Get invoice by ID
  getById: async (id: string) => {
    const response = await apiClient.get(`/invoices/${id}`)
    return response.data as Invoice
  },

  // Create new invoice
  create: async (invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>) => {
    const response = await apiClient.post('/invoices', invoice)
    return response.data as Invoice
  },

  // Update invoice
  update: async (id: string, updates: Partial<Invoice>) => {
    const response = await apiClient.put(`/invoices/${id}`, updates)
    return response.data as Invoice
  },

  // Delete invoice
  delete: async (id: string) => {
    await apiClient.delete(`/invoices/${id}`)
  },

  // Get invoice statistics
  getStats: async () => {
    const response = await apiClient.get('/invoices/stats')
    return response.data as InvoiceStats
  },

  // Send invoice to customer
  send: async (id: string) => {
    const response = await apiClient.post(`/invoices/${id}/send`)
    return response.data as Invoice
  },

  // Record payment
  recordPayment: async (invoiceId: string, payment: Omit<Payment, 'id' | 'invoiceId' | 'createdAt'>) => {
    const response = await apiClient.post(`/invoices/${invoiceId}/payments`, payment)
    return response.data as Payment
  },

  // Get payments for invoice
  getPayments: async (invoiceId: string) => {
    const response = await apiClient.get(`/invoices/${invoiceId}/payments`)
    return response.data as Payment[]
  },

  // Generate invoice PDF
  generatePDF: async (id: string) => {
    const response = await apiClient.get(`/invoices/${id}/pdf`, {
      responseType: 'blob'
    })
    return response.data
  },

  // Bulk operations
  bulkSend: async (invoiceIds: string[]) => {
    const response = await apiClient.post('/invoices/bulk/send', { invoiceIds })
    return response.data
  },

  bulkDelete: async (invoiceIds: string[]) => {
    await apiClient.delete('/invoices/bulk', { data: { invoiceIds } })
  }
}
