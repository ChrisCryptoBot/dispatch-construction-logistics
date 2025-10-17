import React, { useState } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { invoiceAPI } from '../services/invoiceAPI'
import PageContainer from '../components/shared/PageContainer'
import Card from '../components/ui/Card'
import AnimatedCounter from '../components/enhanced/AnimatedCounter'
import EnhancedCard from '../components/enhanced/EnhancedCard'
import EnhancedButton from '../components/enhanced/EnhancedButton'
import Tooltip from '../components/enhanced/Tooltip'
import Badge from '../components/enhanced/Badge'
import { 
  FileText, Plus, Search, Filter, Download, Send, Eye, Edit, 
  Trash2, DollarSign, Clock, CheckCircle, AlertTriangle, 
  TrendingUp, Calendar, User, Building, Building2, Package, CreditCard,
  MoreVertical, RefreshCw, FileDown, Mail, Bell, X
} from 'lucide-react'
import type { Invoice, InvoiceStats, InvoiceFilters } from '../types/invoice'
import { formatCurrency, formatDate, formatNumber } from '../utils'

const InvoicePage = () => {
  const { theme } = useTheme()
  const queryClient = useQueryClient()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<Invoice['status'] | 'all'>('all')
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([])
  const [filters, setFilters] = useState<InvoiceFilters>({})
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  
  // Form states
  const [createForm, setCreateForm] = useState({
    customerId: '',
    customerName: '',
    carrierId: '',
    carrierName: '',
    loadId: '',
    amount: 0,
    tax: 0,
    description: '',
    dueDate: '',
    lineItems: [{ id: '1', description: '', quantity: 1, unitPrice: 0, total: 0, category: 'hauling' as const }]
  })
  
  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    paymentMethod: 'ach' as const,
    referenceNumber: '',
    notes: ''
  })

  // Fetch invoice statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['invoice-stats'],
    queryFn: async () => {
      try {
        return await invoiceAPI.getStats()
      } catch (error) {
        console.warn('API not available, using mock data:', error)
        return {
          totalInvoices: 47,
          pendingInvoices: 12,
          paidInvoices: 28,
          overdueInvoices: 7,
          totalAmount: 84750,
          pendingAmount: 18500,
          paidAmount: 52400,
          overdueAmount: 13850,
          averagePaymentDays: 18.5
        } as InvoiceStats
      }
    }
  })

  // Fetch invoices
  const { data: invoices = [], isLoading: invoicesLoading } = useQuery({
    queryKey: ['invoices', filters],
    queryFn: () => invoiceAPI.list(filters)
  })

  // Mock data fallback
  const mockInvoices: Invoice[] = [
    {
      id: '1',
      invoiceNumber: 'INV-2024-001',
      customerId: 'cust-1',
      customerName: 'ABC Construction LLC',
      carrierId: 'carrier-1',
      carrierName: 'Superior Carriers Inc',
      loadId: 'LT-1234',
      amount: 1250.00,
      tax: 100.00,
      total: 1350.00,
      status: 'sent',
      dueDate: '2024-11-15',
      issuedDate: '2024-10-15',
      description: 'Crushed Stone Delivery - Dallas to Houston',
      lineItems: [
        { id: '1', description: 'Crushed Stone (25 tons)', quantity: 25, unitPrice: 45.00, total: 1125.00, category: 'hauling' },
        { id: '2', description: 'Fuel Surcharge', quantity: 1, unitPrice: 125.00, total: 125.00, category: 'fuel_surcharge' }
      ],
      createdAt: '2024-10-15T10:00:00Z',
      updatedAt: '2024-10-15T10:00:00Z'
    },
    {
      id: '2',
      invoiceNumber: 'INV-2024-002',
      customerId: 'cust-2',
      customerName: 'XYZ Materials',
      carrierId: 'carrier-1',
      carrierName: 'Superior Carriers Inc',
      loadId: 'LT-1235',
      amount: 2100.00,
      tax: 168.00,
      total: 2268.00,
      status: 'paid',
      dueDate: '2024-11-01',
      issuedDate: '2024-10-01',
      paidDate: '2024-10-28',
      paymentMethod: 'ach',
      description: 'Concrete Mix Delivery - Austin to San Antonio',
      lineItems: [
        { id: '1', description: 'Ready-Mix Concrete (12 yards)', quantity: 12, unitPrice: 150.00, total: 1800.00, category: 'hauling' },
        { id: '2', description: 'Overtime Loading', quantity: 1, unitPrice: 300.00, total: 300.00, category: 'accessorial' }
      ],
      createdAt: '2024-10-01T09:00:00Z',
      updatedAt: '2024-10-28T14:30:00Z'
    },
    {
      id: '3',
      invoiceNumber: 'INV-2024-003',
      customerId: 'cust-3',
      customerName: 'Metro Builders',
      carrierId: 'carrier-1',
      carrierName: 'Superior Carriers Inc',
      loadId: 'LT-1236',
      amount: 850.00,
      tax: 68.00,
      total: 918.00,
      status: 'overdue',
      dueDate: '2024-10-15',
      issuedDate: '2024-09-15',
      description: 'Steel Beams Delivery - Fort Worth to Dallas',
      lineItems: [
        { id: '1', description: 'Steel Beams (5 tons)', quantity: 5, unitPrice: 150.00, total: 750.00, category: 'hauling' },
        { id: '2', description: 'Specialized Equipment', quantity: 1, unitPrice: 100.00, total: 100.00, category: 'accessorial' }
      ],
      createdAt: '2024-09-15T11:00:00Z',
      updatedAt: '2024-09-15T11:00:00Z'
    }
  ]

  const displayInvoices = invoices.length > 0 ? invoices : mockInvoices

  // Filter invoices based on search and status
  const filteredInvoices = displayInvoices.filter(invoice => {
    const matchesSearch = searchTerm === '' || 
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.carrierName.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // Handler functions
  const handleCreateInvoice = () => {
    if (!createForm.customerName || !createForm.carrierName || !createForm.amount) {
      alert('⚠️ Please fill in all required fields')
      return
    }
    
    const newInvoice: Invoice = {
      id: `INV-${Date.now().toString().slice(-6)}`,
      invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
      customerId: createForm.customerId || 'CUST-001',
      customerName: createForm.customerName,
      carrierId: createForm.carrierId || 'CARR-001',
      carrierName: createForm.carrierName,
      loadId: createForm.loadId || 'LT-1234',
      amount: createForm.amount,
      tax: createForm.tax,
      total: createForm.amount + createForm.tax,
      status: 'draft',
      dueDate: createForm.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      issuedDate: new Date().toISOString().split('T')[0],
      description: createForm.description,
      lineItems: createForm.lineItems,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    // Add to local state (in real app, this would be an API call)
    queryClient.setQueryData(['invoices'], (old: Invoice[] = []) => [newInvoice, ...old])
    queryClient.invalidateQueries({ queryKey: ['invoice-stats'] })
    
    setShowCreateModal(false)
    setCreateForm({
      customerId: '',
      customerName: '',
      carrierId: '',
      carrierName: '',
      loadId: '',
      amount: 0,
      tax: 0,
      description: '',
      dueDate: '',
      lineItems: [{ id: '1', description: '', quantity: 1, unitPrice: 0, total: 0, category: 'hauling' }]
    })
    alert('✅ Invoice created successfully!')
  }
  
  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setShowDetailsModal(true)
  }
  
  const handleDownloadPDF = (invoice: Invoice) => {
    // Generate PDF content
    const pdfContent = `
      INVOICE #${invoice.invoiceNumber}
      
      Customer: ${invoice.customerName}
      Carrier: ${invoice.carrierName}
      Load ID: ${invoice.loadId}
      
      Amount: $${invoice.amount.toLocaleString()}
      Tax: $${invoice.tax.toLocaleString()}
      Total: $${invoice.total.toLocaleString()}
      
      Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}
      Status: ${invoice.status.toUpperCase()}
    `
    
    const blob = new Blob([pdfContent], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `invoice-${invoice.invoiceNumber}.txt`
    a.click()
    window.URL.revokeObjectURL(url)
    alert('✅ Invoice downloaded!')
  }
  
  const handleRecordPayment = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setPaymentForm({ ...paymentForm, amount: invoice.total })
    setShowPaymentModal(true)
  }
  
  const handleSubmitPayment = () => {
    if (!selectedInvoice || !paymentForm.amount) {
      alert('⚠️ Please enter payment amount')
      return
    }
    
    // Update invoice status to paid
    queryClient.setQueryData(['invoices'], (old: Invoice[] = []) => 
      old.map(inv => 
        inv.id === selectedInvoice.id 
          ? { ...inv, status: 'paid', paidDate: new Date().toISOString().split('T')[0] }
          : inv
      )
    )
    queryClient.invalidateQueries({ queryKey: ['invoice-stats'] })
    
    setShowPaymentModal(false)
    setShowDetailsModal(false)
    setSelectedInvoice(null)
    alert('✅ Payment recorded successfully!')
  }
  
  const toggleInvoiceSelection = (invoiceId: string) => {
    if (selectedInvoices.includes(invoiceId)) {
      setSelectedInvoices(prev => prev.filter(id => id !== invoiceId))
    } else {
      setSelectedInvoices(prev => [...prev, invoiceId])
    }
  }
  
  const selectAllInvoices = () => {
    setSelectedInvoices(filteredInvoices.map(inv => inv.id))
  }
  
  const clearSelection = () => {
    setSelectedInvoices([])
  }
  
  const handleBulkExport = () => {
    const selectedData = invoices.filter(inv => selectedInvoices.includes(inv.id))
    const csvContent = [
      'Invoice ID,Invoice Number,Customer,Carrier,Amount,Tax,Total,Status,Due Date,Issued Date',
      ...selectedData.map(inv => 
        `${inv.id},${inv.invoiceNumber},${inv.customerName},${inv.carrierName},${inv.amount},${inv.tax},${inv.total},${inv.status},${inv.dueDate},${inv.issuedDate}`
      )
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `invoices-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    alert(`✅ ${selectedData.length} invoice(s) exported!`)
  }

  // Mutations
  const sendInvoiceMutation = useMutation({
    mutationFn: (id: string) => invoiceAPI.send(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['invoice-stats'] })
      alert('✅ Invoice sent successfully!')
    }
  })

  const deleteInvoiceMutation = useMutation({
    mutationFn: (id: string) => invoiceAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['invoice-stats'] })
      alert('✅ Invoice deleted successfully!')
    }
  })


  const getStatusIcon = (status: Invoice['status']) => {
    switch (status) {
      case 'paid': return CheckCircle
      case 'sent': return Mail
      case 'overdue': return AlertTriangle
      case 'draft': return FileText
      case 'cancelled': return Trash2
      default: return FileText
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return '#10B981' // Green for paid
      case 'overdue': return '#EF4444' // Red for overdue
      case 'sent': return '#3B82F6' // Blue for sent
      case 'draft': return '#F59E0B' // Yellow for draft
      case 'cancelled': return '#6B7280' // Gray for cancelled
      default: return '#9CA3AF'
    }
  }

  const getStatusIconClass = (status: string) => {
    switch (status) {
      case 'paid': return 'fas fa-check-circle'
      case 'overdue': return 'fas fa-exclamation-triangle'
      case 'sent': return 'fas fa-paper-plane'
      case 'draft': return 'fas fa-file-alt'
      case 'cancelled': return 'fas fa-ban'
      default: return 'fas fa-clock'
    }
  }

  const headerAction = (
    <button
      onClick={() => setShowCreateModal(true)}
      style={{
        padding: '14px 28px',
        background: 'transparent',
        color: theme.colors.textSecondary,
        borderRadius: '12px',
        border: `1px solid ${theme.colors.border}`,
        fontSize: '15px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = theme.colors.backgroundCardHover
        e.currentTarget.style.color = theme.colors.textPrimary
        e.currentTarget.style.borderColor = theme.colors.primary
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent'
        e.currentTarget.style.color = theme.colors.textSecondary
        e.currentTarget.style.borderColor = theme.colors.border
      }}
    >
      <Plus size={18} />
      New Invoice
    </button>
  )

  return (
    <PageContainer
      title="Invoices & Payments"
      subtitle="Manage invoices, track payments, and monitor cash flow"
      icon={Building2 as any}
      headerAction={headerAction}
    >
      <style>{`
        select option {
          background: ${theme.colors.backgroundCard} !important;
          color: ${theme.colors.textPrimary} !important;
          padding: 8px 12px !important;
        }
        select option:hover {
          background: ${theme.colors.backgroundCardHover} !important;
          color: ${theme.colors.textPrimary} !important;
        }
        select option:checked {
          background: ${theme.colors.backgroundCardHover} !important;
          color: ${theme.colors.textPrimary} !important;
        }
        select option:focus {
          background: ${theme.colors.backgroundCardHover} !important;
          color: ${theme.colors.textPrimary} !important;
        }
      `}</style>

      {/* Stats Cards with Gold Standard Design */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '24px'
      }}>
        <Card padding="24px">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              background: theme.colors.backgroundTertiary,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FileText size={28} color={theme.colors.textSecondary} />
            </div>
            <div>
              <p style={{ fontSize: '36px', fontWeight: 'bold', color: theme.colors.textPrimary, margin: 0, lineHeight: 1 }}>
                <AnimatedCounter value={stats?.totalInvoices || 0} />
              </p>
              <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: '4px 0 0 0' }}>
                Total Invoices
              </p>
            </div>
          </div>
        </Card>

        <Card padding="24px">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              background: theme.colors.backgroundTertiary,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Mail size={28} color={theme.colors.textSecondary} />
            </div>
            <div>
              <p style={{ fontSize: '36px', fontWeight: 'bold', color: theme.colors.textPrimary, margin: 0, lineHeight: 1 }}>
                <AnimatedCounter value={stats?.pendingInvoices || 0} />
              </p>
              <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: '4px 0 0 0' }}>
                Pending
              </p>
            </div>
          </div>
        </Card>

        <Card padding="24px">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              background: theme.colors.backgroundTertiary,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CheckCircle size={28} color={theme.colors.textSecondary} />
            </div>
            <div>
              <p style={{ fontSize: '36px', fontWeight: 'bold', color: theme.colors.textPrimary, margin: 0, lineHeight: 1 }}>
                <AnimatedCounter value={stats?.paidInvoices || 0} />
              </p>
              <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: '4px 0 0 0' }}>
                Paid
              </p>
            </div>
          </div>
        </Card>

        <Card padding="24px">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              background: theme.colors.backgroundTertiary,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AlertTriangle size={28} color={theme.colors.textSecondary} />
            </div>
            <div>
              <p style={{ fontSize: '36px', fontWeight: 'bold', color: theme.colors.textPrimary, margin: 0, lineHeight: 1 }}>
                <AnimatedCounter value={stats?.overdueInvoices || 0} />
              </p>
              <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: '4px 0 0 0' }}>
                Overdue
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Revenue Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <Card padding="24px">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              background: theme.colors.backgroundTertiary,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <DollarSign size={28} color={theme.colors.textSecondary} />
            </div>
            <div>
              <p style={{ fontSize: '36px', fontWeight: 'bold', color: theme.colors.success, margin: 0, lineHeight: 1 }}>
                <AnimatedCounter value={stats?.totalAmount || 0} prefix="$" />
              </p>
              <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: '4px 0 0 0' }}>
                Total Revenue
              </p>
            </div>
          </div>
        </Card>

        <Card padding="24px">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              background: theme.colors.backgroundTertiary,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Clock size={28} color={theme.colors.textSecondary} />
            </div>
            <div>
              <p style={{ fontSize: '36px', fontWeight: 'bold', color: theme.colors.textPrimary, margin: 0, lineHeight: 1 }}>
                <AnimatedCounter value={stats?.pendingAmount || 0} prefix="$" />
              </p>
              <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: '4px 0 0 0' }}>
                Pending
              </p>
            </div>
          </div>
        </Card>

        <Card padding="24px">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              background: theme.colors.backgroundTertiary,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AlertTriangle size={28} color={theme.colors.textSecondary} />
            </div>
            <div>
              <p style={{ fontSize: '36px', fontWeight: 'bold', color: theme.colors.error, margin: 0, lineHeight: 1 }}>
                <AnimatedCounter value={stats?.overdueAmount || 0} prefix="$" />
              </p>
              <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: '4px 0 0 0' }}>
                Overdue
              </p>
            </div>
          </div>
        </Card>

        <Card padding="24px">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              background: theme.colors.backgroundTertiary,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <TrendingUp size={28} color={theme.colors.textSecondary} />
            </div>
            <div>
              <p style={{ fontSize: '36px', fontWeight: 'bold', color: theme.colors.warning, margin: 0, lineHeight: 1 }}>
                <AnimatedCounter value={stats?.averagePaymentDays || 0} suffix=" days" />
              </p>
              <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: '4px 0 0 0' }}>
                Avg Payment Days
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Advanced Filters Section */}
      <Card padding="24px" style={{ marginBottom: '24px' }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: theme.colors.textPrimary,
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Filter size={20} color={theme.colors.textSecondary} />
          Advanced Filters
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '20px'
        }}>
          {/* Status Filter */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: theme.colors.textPrimary,
              marginBottom: '8px'
            }}>
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as Invoice['status'] | 'all')}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: theme.colors.backgroundCard,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: '12px',
                color: theme.colors.textPrimary,
                fontSize: '14px',
                fontWeight: '500',
                outline: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='${theme.colors.textSecondary}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
                backgroundSize: '16px',
                paddingRight: '40px'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = theme.colors.primary
                e.target.style.boxShadow = `0 0 0 3px ${theme.colors.primary}20`
              }}
              onBlur={(e) => {
                e.target.style.borderColor = theme.colors.border
                e.target.style.boxShadow = 'none'
              }}
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Date Range Filter */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: theme.colors.textPrimary,
              marginBottom: '8px'
            }}>
              Date From
            </label>
            <input
              type="date"
              value={filters.dateRange?.start || ''}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                dateRange: { ...prev.dateRange, start: e.target.value } as any
              }))}
              style={{
                width: '100%',
                padding: '12px',
                background: theme.colors.inputBg,
                border: `2px solid ${theme.colors.inputBorder}`,
                borderRadius: '10px',
                fontSize: '14px',
                color: theme.colors.textPrimary,
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: theme.colors.textPrimary,
              marginBottom: '8px'
            }}>
              Date To
            </label>
            <input
              type="date"
              value={filters.dateRange?.end || ''}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                dateRange: { ...prev.dateRange, end: e.target.value } as any
              }))}
              style={{
                width: '100%',
                padding: '12px',
                background: theme.colors.inputBg,
                border: `2px solid ${theme.colors.inputBorder}`,
                borderRadius: '10px',
                fontSize: '14px',
                color: theme.colors.textPrimary,
                outline: 'none'
              }}
            />
          </div>

          {/* Amount Range Filter */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: theme.colors.textPrimary,
              marginBottom: '8px'
            }}>
              Min Amount
            </label>
            <input
              type="number"
              placeholder="0"
              value={filters.amountRange?.min || ''}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                amountRange: { ...prev.amountRange, min: parseFloat(e.target.value) || 0 } as any
              }))}
              style={{
                width: '100%',
                padding: '12px',
                background: theme.colors.inputBg,
                border: `2px solid ${theme.colors.inputBorder}`,
                borderRadius: '10px',
                fontSize: '14px',
                color: theme.colors.textPrimary,
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: theme.colors.textPrimary,
              marginBottom: '8px'
            }}>
              Max Amount
            </label>
            <input
              type="number"
              placeholder="No limit"
              value={filters.amountRange?.max || ''}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                amountRange: { ...prev.amountRange, max: parseFloat(e.target.value) || 0 } as any
              }))}
              style={{
                width: '100%',
                padding: '12px',
                background: theme.colors.inputBg,
                border: `2px solid ${theme.colors.inputBorder}`,
                borderRadius: '10px',
                fontSize: '14px',
                color: theme.colors.textPrimary,
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* Quick Filter Buttons */}
        <div style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
          marginBottom: '16px'
        }}>
          {[
            { label: 'Today', action: () => {
              const today = new Date().toISOString().split('T')[0]
              setFilters({ dateRange: { start: today, end: today } })
            }},
            { label: 'This Week', action: () => {
              const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
              const today = new Date().toISOString().split('T')[0]
              setFilters({ dateRange: { start: weekStart, end: today } })
            }},
            { label: 'This Month', action: () => {
              const monthStart = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
              const today = new Date().toISOString().split('T')[0]
              setFilters({ dateRange: { start: monthStart, end: today } })
            }},
            { label: 'Overdue Only', action: () => setStatusFilter('overdue') },
            { label: 'Paid Only', action: () => setStatusFilter('paid') },
            { label: 'High Value (>$5000)', action: () => setFilters({ amountRange: { min: 5000, max: 0 } }) },
            { label: 'Clear All', action: () => {
              setFilters({})
              setStatusFilter('all')
              setSearchTerm('')
            }}
          ].map((filter, index) => (
            <button
              key={index}
              onClick={filter.action}
              style={{
                padding: '8px 16px',
                background: theme.colors.backgroundTertiary,
                border: 'none',
                borderRadius: '8px',
                color: theme.colors.textPrimary,
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = theme.colors.backgroundCardHover
                e.currentTarget.style.color = theme.colors.textPrimary
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = theme.colors.backgroundTertiary
                e.currentTarget.style.color = theme.colors.textPrimary
              }}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Results Info */}
        <div style={{
          padding: '12px',
          background: theme.colors.backgroundTertiary,
          borderRadius: '8px',
          border: `1px solid ${theme.colors.border}`
        }}>
          <p style={{
            fontSize: '13px',
            color: theme.colors.textSecondary,
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <FileText size={16} color={theme.colors.textSecondary} />
            <strong>Showing {filteredInvoices.length} of {invoices.length} invoices</strong>
            {searchTerm && ` • Search: "${searchTerm}"`}
            {statusFilter !== 'all' && ` • Status: ${statusFilter}`}
            {filters.dateRange?.start && ` • Date: ${filters.dateRange.start} to ${filters.dateRange.end || 'today'}`}
            {filters.amountRange?.min && ` • Amount: $${filters.amountRange.min}+`}
          </p>
        </div>
      </Card>

      {/* Search and Filters */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '24px',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '300px' }}>
          <Search 
            size={20} 
            style={{ 
              position: 'absolute', 
              left: '12px', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              color: theme.colors.textTertiary 
            }} 
          />
          <input
            type="text"
            placeholder="Search invoices, customers, or invoice numbers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 12px 12px 44px',
              background: theme.colors.backgroundCard,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: '12px',
              color: theme.colors.textPrimary,
              fontSize: '14px',
              outline: 'none',
              transition: 'all 0.2s ease'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = theme.colors.primary
              e.target.style.boxShadow = `0 0 0 3px ${theme.colors.primary}20`
            }}
            onBlur={(e) => {
              e.target.style.borderColor = theme.colors.border
              e.target.style.boxShadow = 'none'
            }}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as Invoice['status'] | 'all')}
          style={{
            padding: '12px 16px',
            background: theme.colors.backgroundCard,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: '12px',
            color: theme.colors.textPrimary,
            fontSize: '14px',
            fontWeight: '500',
            outline: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            appearance: 'none',
            backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='${theme.colors.textSecondary}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 12px center',
            backgroundSize: '16px',
            paddingRight: '40px'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = theme.colors.primary
            e.target.style.boxShadow = `0 0 0 3px ${theme.colors.primary}20`
          }}
          onBlur={(e) => {
            e.target.style.borderColor = theme.colors.border
            e.target.style.boxShadow = 'none'
          }}
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Invoices Table */}
      <Card padding="24px">
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: theme.colors.textPrimary,
              margin: 0
            }}>
              Recent Invoices ({filteredInvoices.length})
            </h3>
            
            {/* Bulk Actions */}
            {selectedInvoices.length > 0 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                background: `${theme.colors.primary}10`,
                borderRadius: '8px',
                border: `1px solid ${theme.colors.primary}30`,
                marginBottom: '16px'
              }}>
                <span style={{
                  fontSize: '14px',
                  color: theme.colors.textPrimary,
                  fontWeight: '600'
                }}>
                  {selectedInvoices.length} invoice(s) selected
                </span>
                <button
                  onClick={handleBulkExport}
                  style={{
                    marginLeft: 'auto',
                    background: 'transparent',
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: '8px',
                    padding: '8px 16px',
                    color: theme.colors.textSecondary,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = theme.colors.backgroundCardHover
                    e.currentTarget.style.color = theme.colors.textPrimary
                    e.currentTarget.style.borderColor = theme.colors.primary
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = theme.colors.textSecondary
                    e.currentTarget.style.borderColor = theme.colors.border
                  }}
                >
                  <Download size={14} />
                  Export Selected
                </button>
                <button
                  onClick={clearSelection}
                  style={{
                    background: 'transparent',
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: '8px',
                    padding: '8px 16px',
                    color: theme.colors.textSecondary,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = theme.colors.backgroundCardHover
                    e.currentTarget.style.color = theme.colors.textPrimary
                    e.currentTarget.style.borderColor = theme.colors.primary
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = theme.colors.textSecondary
                    e.currentTarget.style.borderColor = theme.colors.border
                  }}
                >
                  Clear
                </button>
              </div>
            )}
            
            {/* Select All Button */}
            {filteredInvoices.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <button
                  onClick={() => {
                    if (selectedInvoices.length === filteredInvoices.length) {
                      clearSelection()
                    } else {
                      selectAllInvoices()
                    }
                  }}
                  style={{
                    background: 'transparent',
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: '8px',
                    padding: '8px 16px',
                    color: theme.colors.textSecondary,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = theme.colors.backgroundCardHover
                    e.currentTarget.style.color = theme.colors.textPrimary
                    e.currentTarget.style.borderColor = theme.colors.primary
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = theme.colors.textSecondary
                    e.currentTarget.style.borderColor = theme.colors.border
                  }}
                >
                  {selectedInvoices.length === filteredInvoices.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => {
                  queryClient.invalidateQueries({ queryKey: ['invoices'] })
                  queryClient.invalidateQueries({ queryKey: ['invoice-stats'] })
                  alert('✅ Data refreshed!')
                }}
                style={{
                  background: 'transparent',
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: '8px',
                  padding: '8px',
                  color: theme.colors.textSecondary,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = theme.colors.backgroundCardHover
                  e.currentTarget.style.color = theme.colors.textPrimary
                  e.currentTarget.style.borderColor = theme.colors.primary
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = theme.colors.textSecondary
                  e.currentTarget.style.borderColor = theme.colors.border
                }}
              >
                <RefreshCw size={16} />
              </button>
              
              <button
                onClick={() => {
                  if (selectedInvoices.length > 0) {
                    handleBulkExport()
                  } else {
                    alert('⚠️ Please select invoices to export')
                  }
                }}
                style={{
                  background: 'transparent',
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: '8px',
                  padding: '8px',
                  color: theme.colors.textSecondary,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = theme.colors.backgroundCardHover
                  e.currentTarget.style.color = theme.colors.textPrimary
                  e.currentTarget.style.borderColor = theme.colors.primary
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = theme.colors.textSecondary
                  e.currentTarget.style.borderColor = theme.colors.border
                }}
              >
                <Download size={16} />
              </button>
            </div>
          </div>

          {/* Invoices Grid */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            overflow: 'hidden'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr',
              gap: '16px',
              padding: '16px 24px',
              background: 'rgba(255, 255, 255, 0.05)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              fontSize: '12px',
              fontWeight: '600',
              color: '#9CA3AF',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              <div>
                <input
                  type="checkbox"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedInvoices(filteredInvoices.map(i => i.id))
                    } else {
                      setSelectedInvoices([])
                    }
                  }}
                  style={{ marginRight: '8px' }}
                />
                Invoice
              </div>
              <div>Customer</div>
              <div>Amount</div>
              <div>Status</div>
              <div>Due Date</div>
              <div>Actions</div>
            </div>

            {filteredInvoices.map((invoice) => {
              const StatusIcon = getStatusIcon(invoice.status)
              const isOverdue = invoice.status === 'overdue' || 
                (invoice.status === 'sent' && new Date(invoice.dueDate) < new Date())
              
              return (
                <div 
                  key={invoice.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr',
                    gap: '16px',
                    padding: '16px 24px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                  }}
                >
                  {/* Invoice */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input
                      type="checkbox"
                      checked={selectedInvoices.includes(invoice.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedInvoices([...selectedInvoices, invoice.id])
                        } else {
                          setSelectedInvoices(selectedInvoices.filter(id => id !== invoice.id))
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                      style={{ marginRight: '8px' }}
                    />
                    <div>
                      <p style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: theme.colors.textPrimary,
                        margin: '0 0 4px 0'
                      }}>
                        {invoice.invoiceNumber}
                      </p>
                      <p style={{
                        fontSize: '12px',
                        color: theme.colors.textSecondary,
                        margin: 0
                      }}>
                        {invoice.description}
                      </p>
                    </div>
                  </div>
                      
                  
                  {/* Customer */}
                  <div>
                    <p style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: theme.colors.textPrimary,
                      margin: '0 0 4px 0'
                    }}>
                      {invoice.customerName}
                    </p>
                    <p style={{
                      fontSize: '12px',
                      color: theme.colors.textSecondary,
                      margin: 0
                    }}>
                      {invoice.carrierName}
                    </p>
                  </div>
                      
                  
                  {/* Amount */}
                  <div>
                    <p style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: theme.colors.textPrimary,
                      margin: 0
                    }}>
                      {formatCurrency(invoice.total)}
                    </p>
                  </div>
                      
                  
                  {/* Status */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className={getStatusIconClass(invoice.status)} style={{ color: getStatusColor(invoice.status) }}></i>
                    <span style={{ color: getStatusColor(invoice.status), fontWeight: '500' }}>
                      {invoice.status.toUpperCase()}
                    </span>
                  </div>
                      
                  
                  {/* Due Date */}
                  <div>
                    <p style={{
                      fontSize: '14px',
                      color: isOverdue ? theme.colors.error : theme.colors.textPrimary,
                      fontWeight: isOverdue ? '600' : '400',
                      margin: 0
                    }}>
                      {formatDate(invoice.dueDate)}
                    </p>
                  </div>
                      
                  
                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleViewInvoice(invoice)}
                      style={{
                        background: 'transparent',
                        border: `1px solid ${theme.colors.border}`,
                        borderRadius: '8px',
                        padding: '6px 12px',
                        color: theme.colors.textSecondary,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = theme.colors.backgroundCardHover
                        e.currentTarget.style.color = theme.colors.textPrimary
                        e.currentTarget.style.borderColor = theme.colors.primary
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                        e.currentTarget.style.color = theme.colors.textSecondary
                        e.currentTarget.style.borderColor = theme.colors.border
                      }}
                    >
                      View
                    </button>
                    
                    <button
                      onClick={() => handleDownloadPDF(invoice)}
                      style={{
                        background: 'transparent',
                        border: `1px solid ${theme.colors.border}`,
                        borderRadius: '8px',
                        padding: '6px 12px',
                        color: theme.colors.textSecondary,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = theme.colors.backgroundCardHover
                        e.currentTarget.style.color = theme.colors.textPrimary
                        e.currentTarget.style.borderColor = theme.colors.primary
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                        e.currentTarget.style.color = theme.colors.textSecondary
                        e.currentTarget.style.borderColor = theme.colors.border
                      }}
                    >
                      Download
                    </button>
                    
                    <button
                      onClick={() => {
                        const actions = ['Record Payment', 'Edit', 'Delete']
                        const choice = prompt(`Choose action for ${invoice.invoiceNumber}:\n\n${actions.map((a, i) => `${i + 1}. ${a}`).join('\n')}\n\nEnter number (1-3):`)
                        
                        if (choice === '1') {
                          handleRecordPayment(invoice)
                        } else if (choice === '2') {
                          alert('Edit functionality coming soon!')
                        } else if (choice === '3') {
                          if (confirm(`Delete invoice ${invoice.invoiceNumber}?`)) {
                            deleteInvoiceMutation.mutate(invoice.id)
                          }
                        }
                      }}
                      style={{
                        background: 'transparent',
                        border: `1px solid ${theme.colors.border}`,
                        borderRadius: '8px',
                        padding: '6px 12px',
                        color: theme.colors.textSecondary,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = theme.colors.backgroundCardHover
                        e.currentTarget.style.color = theme.colors.textPrimary
                        e.currentTarget.style.borderColor = theme.colors.primary
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                        e.currentTarget.style.color = theme.colors.textSecondary
                        e.currentTarget.style.borderColor = theme.colors.border
                      }}
                    >
                      More
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
      </Card>

      {/* Create Invoice Modal */}
      {showCreateModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)'
          }}
          onClick={() => setShowCreateModal(false)}
        >
          <div
            style={{
              background: theme.colors.backgroundCard,
              borderRadius: '20px',
              padding: '36px',
              maxWidth: '700px',
              width: '90%',
              maxHeight: '90vh',
              overflowY: 'auto',
              border: `1px solid ${theme.colors.border}`,
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
              <h2 style={{ color: theme.colors.textPrimary, fontSize: '26px', fontWeight: 'bold', margin: 0 }}>
                Create New Invoice
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: theme.colors.textSecondary,
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease'
                }}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '24px' }}>
              {/* Customer Name */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                  Customer Name *
                </label>
                <input
                  type="text"
                  placeholder="Customer Company"
                  value={createForm.customerName}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, customerName: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: theme.colors.inputBg,
                    border: `2px solid ${theme.colors.inputBorder}`,
                    borderRadius: '10px',
                    fontSize: '14px',
                    color: theme.colors.textPrimary,
                    outline: 'none'
                  }}
                />
              </div>

              {/* Carrier Name */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                  Carrier Name *
                </label>
                <input
                  type="text"
                  placeholder="Carrier Company"
                  value={createForm.carrierName}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, carrierName: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: theme.colors.inputBg,
                    border: `2px solid ${theme.colors.inputBorder}`,
                    borderRadius: '10px',
                    fontSize: '14px',
                    color: theme.colors.textPrimary,
                    outline: 'none'
                  }}
                />
              </div>

              {/* Load ID */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                  Load ID
                </label>
                <input
                  type="text"
                  placeholder="LT-1234"
                  value={createForm.loadId}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, loadId: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: theme.colors.inputBg,
                    border: `2px solid ${theme.colors.inputBorder}`,
                    borderRadius: '10px',
                    fontSize: '14px',
                    color: theme.colors.textPrimary,
                    outline: 'none'
                  }}
                />
              </div>

              {/* Due Date */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                  Due Date
                </label>
                <input
                  type="date"
                  value={createForm.dueDate}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, dueDate: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: theme.colors.inputBg,
                    border: `2px solid ${theme.colors.inputBorder}`,
                    borderRadius: '10px',
                    fontSize: '14px',
                    color: theme.colors.textPrimary,
                    outline: 'none'
                  }}
                />
              </div>

              {/* Amount */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                  Amount *
                </label>
                <input
                  type="number"
                  placeholder="1500"
                  value={createForm.amount || ''}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: theme.colors.inputBg,
                    border: `2px solid ${theme.colors.inputBorder}`,
                    borderRadius: '10px',
                    fontSize: '14px',
                    color: theme.colors.textPrimary,
                    outline: 'none'
                  }}
                />
              </div>

              {/* Tax */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                  Tax
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={createForm.tax || ''}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, tax: parseFloat(e.target.value) || 0 }))}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: theme.colors.inputBg,
                    border: `2px solid ${theme.colors.inputBorder}`,
                    borderRadius: '10px',
                    fontSize: '14px',
                    color: theme.colors.textPrimary,
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                Description
              </label>
              <textarea
                placeholder="Invoice description..."
                value={createForm.description}
                onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: theme.colors.inputBg,
                  border: `2px solid ${theme.colors.inputBorder}`,
                  borderRadius: '10px',
                  fontSize: '14px',
                  color: theme.colors.textPrimary,
                  outline: 'none',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: theme.colors.backgroundHover,
                  color: theme.colors.textPrimary,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateInvoice}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.accent} 100%)`,
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease',
                  boxShadow: `0 4px 12px ${theme.colors.primary}40`
                }}
              >
                <FileText size={18} />
                Create Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Details Modal */}
      {showDetailsModal && selectedInvoice && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)'
          }}
          onClick={() => {
            setShowDetailsModal(false)
            setSelectedInvoice(null)
          }}
        >
          <div
            style={{
              background: theme.colors.backgroundCard,
              borderRadius: '20px',
              padding: '36px',
              maxWidth: '800px',
              width: '90%',
              maxHeight: '90vh',
              overflowY: 'auto',
              border: `1px solid ${theme.colors.border}`,
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
              <div>
                <h2 style={{ color: theme.colors.textPrimary, fontSize: '24px', fontWeight: 'bold', margin: '0 0 8px 0' }}>
                  Invoice Details
                </h2>
                <p style={{ color: theme.colors.textSecondary, margin: 0 }}>
                  {selectedInvoice.invoiceNumber}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowDetailsModal(false)
                  setSelectedInvoice(null)
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: theme.colors.textSecondary,
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease'
                }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Invoice Details Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '16px',
              marginBottom: '24px'
            }}>
              <div style={{ background: theme.colors.background, padding: '20px', borderRadius: '12px' }}>
                <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: '0 0 8px 0', textTransform: 'uppercase', fontWeight: '600' }}>
                  Customer
                </p>
                <p style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.primary, margin: 0 }}>
                  {selectedInvoice.customerName}
                </p>
              </div>

              <div style={{ background: theme.colors.background, padding: '20px', borderRadius: '12px' }}>
                <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: '0 0 8px 0', textTransform: 'uppercase', fontWeight: '600' }}>
                  Carrier
                </p>
                <p style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.primary, margin: 0 }}>
                  {selectedInvoice.carrierName}
                </p>
              </div>

              <div style={{ background: theme.colors.background, padding: '20px', borderRadius: '12px' }}>
                <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: '0 0 8px 0', textTransform: 'uppercase', fontWeight: '600' }}>
                  Load ID
                </p>
                <p style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary, margin: 0 }}>
                  {selectedInvoice.loadId}
                </p>
              </div>

              <div style={{ background: theme.colors.background, padding: '20px', borderRadius: '12px' }}>
                <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: '0 0 8px 0', textTransform: 'uppercase', fontWeight: '600' }}>
                  Status
                </p>
                <p style={{ fontSize: '18px', fontWeight: '600', color: getStatusColor(selectedInvoice.status), margin: 0, textTransform: 'capitalize' }}>
                  {selectedInvoice.status}
                </p>
              </div>

              <div style={{ background: theme.colors.background, padding: '20px', borderRadius: '12px' }}>
                <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: '0 0 8px 0', textTransform: 'uppercase', fontWeight: '600' }}>
                  Amount
                </p>
                <p style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary, margin: 0 }}>
                  ${selectedInvoice.amount.toLocaleString()}
                </p>
              </div>

              <div style={{ background: theme.colors.background, padding: '20px', borderRadius: '12px' }}>
                <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: '0 0 8px 0', textTransform: 'uppercase', fontWeight: '600' }}>
                  Total
                </p>
                <p style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.success, margin: 0 }}>
                  ${selectedInvoice.total.toLocaleString()}
                </p>
              </div>

              <div style={{ background: theme.colors.background, padding: '20px', borderRadius: '12px' }}>
                <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: '0 0 8px 0', textTransform: 'uppercase', fontWeight: '600' }}>
                  Due Date
                </p>
                <p style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary, margin: 0 }}>
                  {new Date(selectedInvoice.dueDate).toLocaleDateString()}
                </p>
              </div>

              <div style={{ background: theme.colors.background, padding: '20px', borderRadius: '12px' }}>
                <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: '0 0 8px 0', textTransform: 'uppercase', fontWeight: '600' }}>
                  Issued Date
                </p>
                <p style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary, margin: 0 }}>
                  {new Date(selectedInvoice.issuedDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
              <button
                onClick={() => handleDownloadPDF(selectedInvoice)}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  background: theme.colors.primary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
              >
                <FileDown size={18} />
                Download PDF
              </button>
              
              {selectedInvoice.status !== 'paid' && (
                <button
                  onClick={() => handleRecordPayment(selectedInvoice)}
                  style={{
                    flex: 1,
                    padding: '12px 24px',
                    background: theme.colors.success,
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <CreditCard size={18} />
                  Record Payment
                </button>
              )}
            </div>

            {/* Mobile Integration Info */}
            <div style={{
              background: `${theme.colors.primary}10`,
              border: `1px solid ${theme.colors.primary}30`,
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px'
            }}>
              <p style={{
                fontSize: '13px',
                color: theme.colors.textSecondary,
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Bell size={16} color={theme.colors.primary} />
                <strong>Mobile App Ready:</strong> Customers and carriers can view invoices, receive payment notifications, and track payment status via the mobile app.
              </p>
            </div>

            <button
              onClick={() => {
                setShowDetailsModal(false)
                setSelectedInvoice(null)
              }}
              style={{
                width: '100%',
                padding: '12px 24px',
                backgroundColor: theme.colors.backgroundHover,
                color: theme.colors.textPrimary,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: '10px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Payment Recording Modal */}
      {showPaymentModal && selectedInvoice && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)'
          }}
          onClick={() => {
            setShowPaymentModal(false)
            setSelectedInvoice(null)
          }}
        >
          <div
            style={{
              background: theme.colors.backgroundCard,
              borderRadius: '20px',
              padding: '36px',
              maxWidth: '500px',
              width: '90%',
              border: `1px solid ${theme.colors.border}`,
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
              <h2 style={{ color: theme.colors.textPrimary, fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
                Record Payment
              </h2>
              <button
                onClick={() => {
                  setShowPaymentModal(false)
                  setSelectedInvoice(null)
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: theme.colors.textSecondary,
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease'
                }}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <p style={{ fontSize: '16px', color: theme.colors.textPrimary, marginBottom: '20px' }}>
                Invoice: <strong>{selectedInvoice.invoiceNumber}</strong><br />
                Amount Due: <strong>${selectedInvoice.total.toLocaleString()}</strong>
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                    Payment Amount
                  </label>
                  <input
                    type="number"
                    placeholder={selectedInvoice.total.toString()}
                    value={paymentForm.amount || ''}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: theme.colors.inputBg,
                      border: `2px solid ${theme.colors.inputBorder}`,
                      borderRadius: '10px',
                      fontSize: '14px',
                      color: theme.colors.textPrimary,
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                    Payment Method
                  </label>
                  <select
                    value={paymentForm.paymentMethod}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, paymentMethod: e.target.value as any }))}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: theme.colors.backgroundCard,
                      border: `1px solid ${theme.colors.border}`,
                      borderRadius: '12px',
                      color: theme.colors.textPrimary,
                      fontSize: '14px',
                      fontWeight: '500',
                      outline: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      appearance: 'none',
                      backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='${theme.colors.textSecondary}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 12px center',
                      backgroundSize: '16px',
                      paddingRight: '40px'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = theme.colors.primary
                      e.target.style.boxShadow = `0 0 0 3px ${theme.colors.primary}20`
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = theme.colors.border
                      e.target.style.boxShadow = 'none'
                    }}
                  >
                    <option value="ach">ACH Transfer</option>
                    <option value="check">Check</option>
                    <option value="wire">Wire Transfer</option>
                    <option value="credit_card">Credit Card</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                    Reference Number
                  </label>
                  <input
                    type="text"
                    placeholder="Check #12345 or Transaction ID"
                    value={paymentForm.referenceNumber}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, referenceNumber: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: theme.colors.inputBg,
                      border: `2px solid ${theme.colors.inputBorder}`,
                      borderRadius: '10px',
                      fontSize: '14px',
                      color: theme.colors.textPrimary,
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                    Notes
                  </label>
                  <textarea
                    placeholder="Additional payment notes..."
                    value={paymentForm.notes}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: theme.colors.inputBg,
                      border: `2px solid ${theme.colors.inputBorder}`,
                      borderRadius: '10px',
                      fontSize: '14px',
                      color: theme.colors.textPrimary,
                      outline: 'none',
                      resize: 'vertical',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => {
                  setShowPaymentModal(false)
                  setSelectedInvoice(null)
                }}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: theme.colors.backgroundHover,
                  color: theme.colors.textPrimary,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitPayment}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: `linear-gradient(135deg, ${theme.colors.success} 0%, ${theme.colors.primary} 100%)`,
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease',
                  boxShadow: `0 4px 12px ${theme.colors.success}40`
                }}
              >
                <CreditCard size={18} />
                Record Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  )
}

export default InvoicePage
