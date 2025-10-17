export interface Invoice {
  id: string
  invoiceNumber: string
  customerId: string
  customerName: string
  carrierId: string
  carrierName: string
  loadId: string
  amount: number
  tax: number
  total: number
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  dueDate: string
  issuedDate: string
  paidDate?: string
  paymentMethod?: 'check' | 'ach' | 'wire' | 'credit_card'
  description: string
  lineItems: InvoiceLineItem[]
  attachments?: string[]
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface InvoiceLineItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
  category: 'hauling' | 'fuel_surcharge' | 'accessorial' | 'permit' | 'other'
}

export interface InvoiceStats {
  totalInvoices: number
  pendingInvoices: number
  paidInvoices: number
  overdueInvoices: number
  totalAmount: number
  pendingAmount: number
  paidAmount: number
  overdueAmount: number
  averagePaymentDays: number
}

export interface Payment {
  id: string
  invoiceId: string
  amount: number
  paymentDate: string
  paymentMethod: 'check' | 'ach' | 'wire' | 'credit_card'
  referenceNumber?: string
  status: 'pending' | 'completed' | 'failed'
  notes?: string
  createdAt: string
}

export interface InvoiceFilters {
  status?: Invoice['status']
  customerId?: string
  carrierId?: string
  dateRange?: {
    start: string
    end: string
  }
  amountRange?: {
    min: number
    max: number
  }
}
