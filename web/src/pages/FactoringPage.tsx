import React, { useState } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import PageContainer from '../components/shared/PageContainer'
import Card from '../components/ui/Card'
import { 
  CreditCard, DollarSign, Clock, CheckCircle, Zap, 
  TrendingUp, AlertCircle, Star, Calculator, ArrowRight, Eye,
  ArrowUpDown, CheckSquare, Square, X, Save, Smartphone, Download
} from 'lucide-react'

interface FactoringRequest {
  id: string
  loadId: string
  amount: number
  advanceRate: number
  discountRate: number
  advanceAmount: number
  status: 'pending' | 'approved' | 'funded' | 'completed'
  createdAt: string
  fundedAt?: string
  factorName?: string
}

interface QuickPayOffer {
  id: string
  factorName: string
  advanceRate: number
  discountRate: number
  processingTime: string
  rating: number
  isRecommended: boolean
}

const FactoringPage = () => {
  const { theme } = useTheme()
  
  // Enhanced state management
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<FactoringRequest | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'funded' | 'completed'>('all')
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'status' | 'factor'>('date')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [dateRange, setDateRange] = useState<{start: string, end: string}>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })
  const [selectedBOLs, setSelectedBOLs] = useState<string[]>([])
  
  // Request form state
  const [requestForm, setRequestForm] = useState({
    loadId: '',
    amount: 0,
    selectedFactor: '',
    invoiceNumber: '',
    notes: ''
  })
  
  const [requests, setRequests] = useState<FactoringRequest[]>([
    {
      id: 'FR-001',
      loadId: 'LT-1234',
      amount: 1125,
      advanceRate: 95,
      discountRate: 2.5,
      advanceAmount: 1069,
      status: 'funded',
      createdAt: '2025-01-07',
      fundedAt: '2025-01-07',
      factorName: 'QuickPay Express'
    },
    {
      id: 'FR-002',
      loadId: 'LT-1235',
      amount: 1440,
      advanceRate: 90,
      discountRate: 3.0,
      advanceAmount: 1296,
      status: 'pending',
      createdAt: '2025-01-07',
      factorName: 'BYO Factor'
    }
  ])

  const quickPayOffers: QuickPayOffer[] = [
    {
      id: 'QP-001',
      factorName: 'QuickPay Express',
      advanceRate: 95,
      discountRate: 2.5,
      processingTime: '36 median payout',
      rating: 4.8,
      isRecommended: true
    },
    {
      id: 'QP-002',
      factorName: 'FastCash Factoring',
      advanceRate: 92,
      discountRate: 2.8,
      processingTime: '48 hours',
      rating: 4.6,
      isRecommended: false
    },
    {
      id: 'QP-003',
      factorName: 'Instant Funds',
      advanceRate: 90,
      discountRate: 3.0,
      processingTime: '24 hours',
      rating: 4.7,
      isRecommended: false
    }
  ]

  // Handler functions
  const handleCreateRequest = () => {
    if (!requestForm.loadId || !requestForm.amount || !requestForm.selectedFactor) {
      alert('⚠️ Please fill in all required fields')
      return
    }
    
    const selectedOffer = quickPayOffers.find(o => o.factorName === requestForm.selectedFactor)
    if (!selectedOffer) return
    
    const newRequest: FactoringRequest = {
      id: `FR-${Date.now().toString().slice(-6)}`,
      loadId: requestForm.loadId,
      amount: requestForm.amount,
      advanceRate: selectedOffer.advanceRate,
      discountRate: selectedOffer.discountRate,
      advanceAmount: requestForm.amount * (selectedOffer.advanceRate / 100),
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
      factorName: selectedOffer.factorName
    }
    
    setRequests(prev => [newRequest, ...prev])
    setShowRequestModal(false)
    setRequestForm({ loadId: '', amount: 0, selectedFactor: '', invoiceNumber: '', notes: '' })
    alert('✅ Factoring request submitted successfully!')
  }
  
  const handleCancelRequest = (requestId: string) => {
    if (confirm('Are you sure you want to cancel this factoring request?')) {
      setRequests(prev => prev.filter(r => r.id !== requestId))
      setShowDetailsModal(false)
      setSelectedRequest(null)
      alert('✅ Factoring request cancelled')
    }
  }
  
  const handleUpdateStatus = (requestId: string, newStatus: 'pending' | 'approved' | 'funded' | 'completed') => {
    setRequests(prev => prev.map(r => 
      r.id === requestId 
        ? { ...r, status: newStatus, fundedAt: newStatus === 'funded' ? new Date().toISOString().split('T')[0] : r.fundedAt }
        : r
    ))
    alert(`✅ Status updated to ${newStatus}`)
  }
  
  const toggleBOLSelection = (requestId: string) => {
    if (selectedBOLs.includes(requestId)) {
      setSelectedBOLs(prev => prev.filter(id => id !== requestId))
    } else {
      setSelectedBOLs(prev => [...prev, requestId])
    }
  }
  
  const selectAllRequests = () => {
    setSelectedBOLs(filteredAndSortedRequests.map(r => r.id))
  }
  
  const clearSelection = () => {
    setSelectedBOLs([])
  }
  
  const handleBulkExport = () => {
    const selectedData = requests.filter(r => selectedBOLs.includes(r.id))
    const csvContent = [
      'Request ID,Load ID,Amount,Advance Rate,Discount Rate,Advance Amount,Status,Factor,Created Date,Funded Date',
      ...selectedData.map(r => 
        `${r.id},${r.loadId},${r.amount},${r.advanceRate}%,${r.discountRate}%,${r.advanceAmount},${r.status},${r.factorName || 'N/A'},${r.createdAt},${r.fundedAt || 'N/A'}`
      )
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `factoring-requests-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    alert(`✅ ${selectedData.length} request(s) exported to CSV`)
  }

  const getStatusColor = (status: string) => {
    const colors = {
      pending: theme.colors.warning,
      approved: theme.colors.info,
      funded: theme.colors.success,
      completed: theme.colors.textSecondary
    }
    return colors[status] || theme.colors.textSecondary
  }
  
  // Enhanced filtering and sorting logic
  const filteredAndSortedRequests = requests.filter(req => {
    // Search filter
    const searchMatch = !searchTerm || 
      req.loadId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (req.factorName && req.factorName.toLowerCase().includes(searchTerm.toLowerCase()))
    
    // Status filter
    const statusMatch = statusFilter === 'all' || req.status === statusFilter
    
    // Date range filter
    const reqDate = new Date(req.createdAt)
    const startDate = new Date(dateRange.start)
    const endDate = new Date(dateRange.end)
    const dateMatch = reqDate >= startDate && reqDate <= endDate
    
    return searchMatch && statusMatch && dateMatch
  }).sort((a, b) => {
    let comparison = 0
    
    switch (sortBy) {
      case 'date':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        break
      case 'amount':
        comparison = a.amount - b.amount
        break
      case 'status':
        comparison = a.status.localeCompare(b.status)
        break
      case 'factor':
        comparison = (a.factorName || '').localeCompare(b.factorName || '')
        break
      default:
        comparison = 0
    }
    
    return sortDirection === 'asc' ? comparison : -comparison
  })

  const stats = {
    totalFunded: requests.filter(r => r.status === 'funded').reduce((sum, r) => sum + r.advanceAmount, 0),
    pendingAmount: requests.filter(r => r.status === 'pending').reduce((sum, r) => sum + r.amount, 0),
    avgDiscount: requests.length > 0 ? requests.reduce((sum, r) => sum + r.discountRate, 0) / requests.length : 0,
    requestCount: requests.length,
    filteredCount: filteredAndSortedRequests.length
  }

  const headerAction = (
    <button
      onClick={() => setShowRequestModal(true)}
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
      <Zap size={18} />
      Request QuickPay
    </button>
  )

  return (
    <PageContainer
      title="Factoring & QuickPay"
      subtitle="Manage your cash flow with fast, transparent factoring"
      icon={CreditCard as any}
      headerAction={headerAction}
    >
      {/* Stats Cards */}
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
              <DollarSign size={28} color={theme.colors.textSecondary} />
            </div>
            <div>
              <p style={{ fontSize: '36px', fontWeight: 'bold', color: theme.colors.textPrimary, margin: 0, lineHeight: 1 }}>
                ${(stats.totalFunded / 1000).toFixed(1)}k
              </p>
              <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: '4px 0 0 0' }}>
                Total Funded
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
                ${(stats.pendingAmount / 1000).toFixed(1)}k
              </p>
              <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: '4px 0 0 0' }}>
                Pending Approval
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
              <Calculator size={28} color={theme.colors.textSecondary} />
            </div>
            <div>
              <p style={{ fontSize: '36px', fontWeight: 'bold', color: theme.colors.textPrimary, margin: 0, lineHeight: 1 }}>
                {stats.avgDiscount.toFixed(1)}%
              </p>
              <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: '4px 0 0 0' }}>
                Avg Discount Rate
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
              <p style={{ fontSize: '36px', fontWeight: 'bold', color: theme.colors.textPrimary, margin: 0, lineHeight: 1 }}>
                {stats.requestCount}
              </p>
              <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: '4px 0 0 0' }}>
                Total Requests
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filter Section */}
      <Card padding="24px" style={{ marginBottom: '24px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '20px'
        }}>
          {/* Search */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: theme.colors.textPrimary,
              marginBottom: '8px'
            }}>
              Search Requests
            </label>
            <input
              type="text"
              placeholder="Search by Load ID, Request ID, Factor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: theme.colors.inputBg,
                border: `2px solid ${theme.colors.inputBorder}`,
                borderRadius: '10px',
                fontSize: '14px',
                color: theme.colors.textPrimary,
                outline: 'none',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = theme.colors.primary}
              onBlur={(e) => e.currentTarget.style.borderColor = theme.colors.inputBorder}
            />
          </div>

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
              onChange={(e) => setStatusFilter(e.target.value as any)}
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
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="funded">Funded</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: theme.colors.textPrimary,
              marginBottom: '8px'
            }}>
              Sort By
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: theme.colors.inputBg,
                  border: `2px solid ${theme.colors.inputBorder}`,
                  borderRadius: '10px',
                  fontSize: '14px',
                  color: theme.colors.textPrimary,
                  outline: 'none'
                }}
              >
                <option value="date">Date</option>
                <option value="amount">Amount</option>
                <option value="status">Status</option>
                <option value="factor">Factor</option>
              </select>
              <button
                onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                style={{
                  padding: '12px',
                  background: theme.colors.backgroundHover,
                  border: `2px solid ${theme.colors.inputBorder}`,
                  borderRadius: '10px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title={`Sort ${sortDirection === 'asc' ? 'Descending' : 'Ascending'}`}
              >
                <ArrowUpDown size={16} color={theme.colors.textSecondary} />
              </button>
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: theme.colors.textPrimary,
              marginBottom: '8px'
            }}>
              Date Range
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: theme.colors.inputBg,
                  border: `2px solid ${theme.colors.inputBorder}`,
                  borderRadius: '10px',
                  fontSize: '14px',
                  color: theme.colors.textPrimary,
                  outline: 'none'
                }}
              />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                style={{
                  flex: 1,
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
              setDateRange({ start: today, end: today })
            }},
            { label: 'This Week', action: () => {
              const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
              const today = new Date().toISOString().split('T')[0]
              setDateRange({ start: weekStart, end: today })
            }},
            { label: 'This Month', action: () => {
              const monthStart = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
              const today = new Date().toISOString().split('T')[0]
              setDateRange({ start: monthStart, end: today })
            }},
            { label: 'Pending Only', action: () => setStatusFilter('pending') },
            { label: 'Funded Only', action: () => setStatusFilter('funded') },
            { label: 'Clear All', action: () => {
              setSearchTerm('')
              setStatusFilter('all')
              setDateRange({
                start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                end: new Date().toISOString().split('T')[0]
              })
              setSortBy('date')
              setSortDirection('desc')
            }}
          ].map((filter, index) => (
            <button
              key={index}
              onClick={filter.action}
              style={{
                padding: '8px 16px',
                background: theme.colors.backgroundHover,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: '8px',
                color: theme.colors.textSecondary,
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = theme.colors.primary
                e.currentTarget.style.color = 'white'
                e.currentTarget.style.borderColor = theme.colors.primary
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = theme.colors.backgroundHover
                e.currentTarget.style.color = theme.colors.textSecondary
                e.currentTarget.style.borderColor = theme.colors.border
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
            <DollarSign size={16} color={theme.colors.textSecondary} />
            <strong>Showing {filteredAndSortedRequests.length} of {requests.length} requests</strong>
            {searchTerm && ` • Search: "${searchTerm}"`}
            {statusFilter !== 'all' && ` • Status: ${statusFilter}`}
          </p>
        </div>
      </Card>

      {/* QuickPay Options */}
          <Card 
            title="QuickPay" 
            subtitle="38h median payout"
            icon={<Zap size={20} color={theme.colors.primary} />}
            style={{ marginBottom: '24px' }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              {quickPayOffers.map((offer) => (
                <div
                  key={offer.id}
                  style={{
                    background: theme.colors.background,
                    padding: '20px',
                    borderRadius: '12px',
                    border: `2px solid ${offer.isRecommended ? theme.colors.primary : theme.colors.border}`,
                    position: 'relative'
                  }}
                >
                  {offer.isRecommended && (
                    <div style={{
                      position: 'absolute',
                      top: '-12px',
                      right: '12px',
                      background: theme.colors.primary,
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <Star size={12} />
                      Recommended
                    </div>
                  )}
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary, margin: '0 0 16px 0' }}>
                    {offer.factorName}
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '14px', color: theme.colors.textSecondary }}>Advance Rate</span>
                      <span style={{ fontSize: '16px', fontWeight: '600', color: theme.colors.success }}>{offer.advanceRate}%</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '14px', color: theme.colors.textSecondary }}>Discount Rate</span>
                      <span style={{ fontSize: '16px', fontWeight: '600', color: theme.colors.textPrimary }}>{offer.discountRate}%</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '14px', color: theme.colors.textSecondary }}>Processing Time</span>
                      <span style={{ fontSize: '14px', color: theme.colors.textPrimary }}>{offer.processingTime}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '14px', color: theme.colors.textSecondary }}>Rating</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Star size={14} color={theme.colors.warning} fill={theme.colors.warning} />
                        <span style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary }}>{offer.rating}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setRequestForm(prev => ({ ...prev, selectedFactor: offer.factorName }))
                      setShowRequestModal(true)
                    }}
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: 'transparent',
                      color: theme.colors.textSecondary,
                      border: `1px solid ${theme.colors.border}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.2s ease'
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
                    Request Advance
                    <ArrowRight size={16} />
                  </button>
                </div>
              ))}
            </div>
          </Card>

          {/* BYO Factor */}
          <Card 
            title="BYO Factor" 
            subtitle="Use your existing factor"
            icon={<CreditCard size={20} color={theme.colors.primary} />}
            style={{ marginBottom: '24px' }}
          >
            <div style={{
              background: theme.colors.background,
              padding: '32px',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                background: `${theme.colors.info}20`,
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <CreditCard size={32} color={theme.colors.info} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary, margin: '0 0 8px 0' }}>
                Use your existing factor
              </h3>
              <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: '0 0 20px 0' }}>
                NOA routing and reconciliation
              </p>
              <button
                onClick={() => {
                  alert('BYO Factor Setup:\n\nThis would open a form to:\n• Add your existing factor details\n• Configure NOA routing\n• Set up reconciliation\n• Upload factor agreement\n\nComing soon!')
                }}
                style={{
                  padding: '12px 24px',
                  background: theme.colors.backgroundHover,
                  color: theme.colors.textPrimary,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.colors.primary
                  e.currentTarget.style.color = 'white'
                  e.currentTarget.style.borderColor = theme.colors.primary
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = theme.colors.backgroundHover
                  e.currentTarget.style.color = theme.colors.textPrimary
                  e.currentTarget.style.borderColor = theme.colors.border
                }}
              >
                Add BYO Factor
              </button>
            </div>
          </Card>

          {/* Marketplace */}
          <Card 
            title="Marketplace" 
            subtitle="Compare offers from multiple factors"
            icon={<TrendingUp size={20} color={theme.colors.primary} />}
          >
            <div style={{
              background: theme.colors.background,
              padding: '32px',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                background: `${theme.colors.warning}20`,
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <TrendingUp size={32} color={theme.colors.warning} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary, margin: '0 0 8px 0' }}>
                Compare offers
              </h3>
              <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: '0 0 20px 0' }}>
                Get best rates from multiple factors
              </p>
              <button
                onClick={() => {
                  alert('Marketplace Coming Soon:\n\n• Compare rates from 10+ factors\n• See real-time offers\n• Filter by advance rate\n• Sort by discount rate\n• One-click acceptance\n\nStay tuned!')
                }}
                style={{
                  padding: '12px 24px',
                  background: theme.colors.backgroundHover,
                  color: theme.colors.textPrimary,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.colors.primary
                  e.currentTarget.style.color = 'white'
                  e.currentTarget.style.borderColor = theme.colors.primary
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = theme.colors.backgroundHover
                  e.currentTarget.style.color = theme.colors.textPrimary
                  e.currentTarget.style.borderColor = theme.colors.border
                }}
              >
                Browse Marketplace
              </button>
            </div>
          </Card>

      {/* Factoring Requests */}
      <Card 
        title="Factoring Requests" 
        subtitle={`${filteredAndSortedRequests.length} requests`}
        icon={<Clock size={20} color={theme.colors.textSecondary} />}
        style={{ marginTop: '24px' }}
      >
        {/* Bulk Actions Header */}
        {selectedBOLs.length > 0 && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            padding: '16px',
            background: theme.colors.backgroundTertiary,
            borderRadius: '10px',
            border: `1px solid ${theme.colors.border}`
          }}>
            <span style={{
              fontSize: '14px',
              color: theme.colors.textPrimary,
              fontWeight: '600'
            }}>
              {selectedBOLs.length} request(s) selected
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleBulkExport}
                style={{
                  padding: '8px 16px',
                  background: theme.colors.primary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <Download size={14} />
                Export CSV
              </button>
              <button
                onClick={clearSelection}
                style={{
                  padding: '8px 16px',
                  background: 'transparent',
                  color: theme.colors.textSecondary,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = theme.colors.primary
                  e.currentTarget.style.color = theme.colors.primary
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = theme.colors.border
                  e.currentTarget.style.color = theme.colors.textSecondary
                }}
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Select All Button */}
        {filteredAndSortedRequests.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <button
              onClick={() => {
                if (selectedBOLs.length === filteredAndSortedRequests.length) {
                  clearSelection()
                } else {
                  selectAllRequests()
                }
              }}
              style={{
                padding: '8px 16px',
                background: 'transparent',
                color: theme.colors.textSecondary,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = theme.colors.primary
                e.currentTarget.style.color = theme.colors.primary
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = theme.colors.border
                e.currentTarget.style.color = theme.colors.textSecondary
              }}
            >
              {selectedBOLs.length === filteredAndSortedRequests.length ? (
                <>
                  <Square size={14} />
                  Deselect All
                </>
              ) : (
                <>
                  <CheckSquare size={14} />
                  Select All
                </>
              )}
            </button>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredAndSortedRequests.map((req) => (
            <div
              key={req.id}
              style={{
                background: theme.colors.background,
                padding: '20px',
                borderRadius: '12px',
                border: `1px solid ${theme.colors.border}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '16px'
              }}
            >
              {/* Bulk Selection Checkbox */}
              <input
                type="checkbox"
                checked={selectedBOLs.includes(req.id)}
                onChange={(e) => {
                  e.stopPropagation()
                  toggleBOLSelection(req.id)
                }}
                style={{
                  width: '20px',
                  height: '20px',
                  cursor: 'pointer',
                  accentColor: theme.colors.primary
                }}
              />
              
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '16px', fontWeight: '600', color: theme.colors.textPrimary }}>
                    {req.loadId}
                  </span>
                  <span style={{
                    padding: '4px 10px',
                    background: `${getStatusColor(req.status)}20`,
                    color: getStatusColor(req.status),
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '600',
                    textTransform: 'capitalize'
                  }}>
                    {req.status}
                  </span>
                </div>
                <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: 0 }}>
                  {req.factorName} • {req.advanceRate}% advance @ {req.discountRate}% fee
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '20px', fontWeight: 'bold', color: theme.colors.success, margin: '0 0 4px 0' }}>
                    ${req.advanceAmount.toLocaleString()}
                  </p>
                  <p style={{ fontSize: '13px', color: theme.colors.textSecondary, margin: 0 }}>
                    of ${req.amount.toLocaleString()}
                  </p>
                </div>
                
                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => {
                      setSelectedRequest(req)
                      setShowDetailsModal(true)
                    }}
                    style={{
                      padding: '8px 16px',
                      background: theme.colors.primary,
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <Eye size={14} />
                    Details
                  </button>
                  
                  {req.status === 'pending' && (
                    <button
                      onClick={() => handleCancelRequest(req.id)}
                      style={{
                        padding: '8px 16px',
                        background: 'transparent',
                        color: theme.colors.error,
                        border: `1px solid ${theme.colors.error}`,
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = theme.colors.error
                        e.currentTarget.style.color = 'white'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                        e.currentTarget.style.color = theme.colors.error
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Factoring Request Modal */}
      {showRequestModal && (
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
          onClick={() => setShowRequestModal(false)}
        >
          <div
            style={{
              background: theme.colors.backgroundCard,
              borderRadius: '20px',
              padding: '36px',
              maxWidth: '600px',
              width: '90%',
              border: `1px solid ${theme.colors.border}`,
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
              <h2 style={{ color: theme.colors.textPrimary, fontSize: '26px', fontWeight: 'bold', margin: 0 }}>
                Request Factoring
              </h2>
              <button
                onClick={() => setShowRequestModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: theme.colors.textSecondary,
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.colors.backgroundHover}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <X size={24} />
              </button>
            </div>

            {/* Request Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Load ID */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: theme.colors.textPrimary,
                  marginBottom: '8px'
                }}>
                  Load ID *
                </label>
                <input
                  type="text"
                  placeholder="LT-1234"
                  value={requestForm.loadId}
                  onChange={(e) => setRequestForm(prev => ({ ...prev, loadId: e.target.value }))}
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

              {/* Invoice Amount */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: theme.colors.textPrimary,
                  marginBottom: '8px'
                }}>
                  Invoice Amount *
                </label>
                <input
                  type="number"
                  placeholder="1500"
                  value={requestForm.amount || ''}
                  onChange={(e) => setRequestForm(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
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

              {/* Factor Selection */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: theme.colors.textPrimary,
                  marginBottom: '8px'
                }}>
                  Select Factor *
                </label>
                <select
                  value={requestForm.selectedFactor}
                  onChange={(e) => setRequestForm(prev => ({ ...prev, selectedFactor: e.target.value }))}
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
                >
                  <option value="">Choose a factor...</option>
                  {quickPayOffers.map(offer => (
                    <option key={offer.id} value={offer.factorName}>
                      {offer.factorName} ({offer.advanceRate}% @ {offer.discountRate}%)
                    </option>
                  ))}
                </select>
              </div>

              {/* Rate Preview */}
              {requestForm.amount > 0 && requestForm.selectedFactor && (() => {
                const selectedOffer = quickPayOffers.find(o => o.factorName === requestForm.selectedFactor)
                if (!selectedOffer) return null
                
                const advanceAmount = requestForm.amount * (selectedOffer.advanceRate / 100)
                const feeAmount = requestForm.amount * (selectedOffer.discountRate / 100)
                
                return (
                  <div style={{
                    background: theme.colors.backgroundTertiary,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: '12px',
                    padding: '16px'
                  }}>
                    <h3 style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: theme.colors.textPrimary,
                      marginBottom: '12px'
                    }}>
                      💰 Advance Preview
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '13px', color: theme.colors.textSecondary }}>Invoice Amount:</span>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: theme.colors.textPrimary }}>${requestForm.amount.toLocaleString()}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '13px', color: theme.colors.textSecondary }}>Advance Rate:</span>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: theme.colors.textPrimary }}>{selectedOffer.advanceRate}%</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '13px', color: theme.colors.textSecondary }}>Discount Fee:</span>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: theme.colors.error }}>${feeAmount.toLocaleString()}</span>
                      </div>
                      <div style={{
                        borderTop: `1px solid ${theme.colors.border}`,
                        paddingTop: '8px',
                        marginTop: '4px',
                        display: 'flex',
                        justifyContent: 'space-between'
                      }}>
                        <span style={{ fontSize: '15px', fontWeight: '600', color: theme.colors.textPrimary }}>You Receive:</span>
                        <span style={{ fontSize: '18px', fontWeight: 'bold', color: theme.colors.success }}>${advanceAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )
              })()}

              {/* Invoice Number (Optional) */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: theme.colors.textPrimary,
                  marginBottom: '8px'
                }}>
                  Invoice Number (Optional)
                </label>
                <input
                  type="text"
                  placeholder="INV-2025-001"
                  value={requestForm.invoiceNumber}
                  onChange={(e) => setRequestForm(prev => ({ ...prev, invoiceNumber: e.target.value }))}
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

              {/* Notes (Optional) */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: theme.colors.textPrimary,
                  marginBottom: '8px'
                }}>
                  Notes (Optional)
                </label>
                <textarea
                  placeholder="Add any additional notes..."
                  value={requestForm.notes}
                  onChange={(e) => setRequestForm(prev => ({ ...prev, notes: e.target.value }))}
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

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                onClick={() => setShowRequestModal(false)}
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
                onClick={handleCreateRequest}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: 'transparent',
                  color: theme.colors.textSecondary,
                  border: `1px solid ${theme.colors.border}`,
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
                <Save size={18} />
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Details Modal */}
      {showDetailsModal && selectedRequest && (
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
            setSelectedRequest(null)
          }}
        >
          <div
            style={{
              background: theme.colors.backgroundCard,
              borderRadius: '20px',
              padding: '36px',
              maxWidth: '700px',
              width: '90%',
              border: `1px solid ${theme.colors.border}`,
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
              <div>
                <h2 style={{ color: theme.colors.textPrimary, fontSize: '24px', fontWeight: 'bold', margin: '0 0 8px 0' }}>
                  Request Details
                </h2>
                <p style={{ color: theme.colors.textSecondary, margin: 0 }}>
                  {selectedRequest.id}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowDetailsModal(false)
                  setSelectedRequest(null)
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
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.colors.backgroundHover}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <X size={24} />
              </button>
            </div>

            {/* Request Details Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '16px',
              marginBottom: '24px'
            }}>
              <div style={{ background: theme.colors.background, padding: '20px', borderRadius: '12px' }}>
                <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: '0 0 8px 0', textTransform: 'uppercase', fontWeight: '600' }}>
                  Load ID
                </p>
                <p style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.primary, margin: 0 }}>
                  {selectedRequest.loadId}
                </p>
              </div>

              <div style={{ background: theme.colors.background, padding: '20px', borderRadius: '12px' }}>
                <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: '0 0 8px 0', textTransform: 'uppercase', fontWeight: '600' }}>
                  Status
                </p>
                <p style={{ fontSize: '18px', fontWeight: '600', color: getStatusColor(selectedRequest.status), margin: 0, textTransform: 'capitalize' }}>
                  {selectedRequest.status}
                </p>
              </div>

              <div style={{ background: theme.colors.background, padding: '20px', borderRadius: '12px' }}>
                <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: '0 0 8px 0', textTransform: 'uppercase', fontWeight: '600' }}>
                  Invoice Amount
                </p>
                <p style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary, margin: 0 }}>
                  ${selectedRequest.amount.toLocaleString()}
                </p>
              </div>

              <div style={{ background: theme.colors.background, padding: '20px', borderRadius: '12px' }}>
                <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: '0 0 8px 0', textTransform: 'uppercase', fontWeight: '600' }}>
                  Advance Amount
                </p>
                <p style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.success, margin: 0 }}>
                  ${selectedRequest.advanceAmount.toLocaleString()}
                </p>
              </div>

              <div style={{ background: theme.colors.background, padding: '20px', borderRadius: '12px' }}>
                <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: '0 0 8px 0', textTransform: 'uppercase', fontWeight: '600' }}>
                  Advance Rate
                </p>
                <p style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary, margin: 0 }}>
                  {selectedRequest.advanceRate}%
                </p>
              </div>

              <div style={{ background: theme.colors.background, padding: '20px', borderRadius: '12px' }}>
                <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: '0 0 8px 0', textTransform: 'uppercase', fontWeight: '600' }}>
                  Discount Rate
                </p>
                <p style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary, margin: 0 }}>
                  {selectedRequest.discountRate}%
                </p>
              </div>

              <div style={{ background: theme.colors.background, padding: '20px', borderRadius: '12px' }}>
                <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: '0 0 8px 0', textTransform: 'uppercase', fontWeight: '600' }}>
                  Factor
                </p>
                <p style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary, margin: 0 }}>
                  {selectedRequest.factorName || 'N/A'}
                </p>
              </div>

              <div style={{ background: theme.colors.background, padding: '20px', borderRadius: '12px' }}>
                <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: '0 0 8px 0', textTransform: 'uppercase', fontWeight: '600' }}>
                  Created Date
                </p>
                <p style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary, margin: 0 }}>
                  {new Date(selectedRequest.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Status Update Actions */}
            {selectedRequest.status === 'pending' && (
              <div style={{
                background: `${theme.colors.info}10`,
                border: `1px solid ${theme.colors.info}30`,
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '20px'
              }}>
                <p style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '12px' }}>
                  Update Status:
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleUpdateStatus(selectedRequest.id, 'approved')}
                    style={{
                      flex: 1,
                      padding: '10px',
                      background: theme.colors.info,
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedRequest.id, 'funded')}
                    style={{
                      flex: 1,
                      padding: '10px',
                      background: 'transparent',
                      color: theme.colors.textSecondary,
                      border: `1px solid ${theme.colors.border}`,
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
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
                    Mark Funded
                  </button>
                </div>
              </div>
            )}

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
                <Smartphone size={16} color={theme.colors.primary} />
                <strong>Mobile App Ready:</strong> Drivers can view factoring status and receive push notifications when funds are available via the mobile app.
              </p>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => {
                  setShowDetailsModal(false)
                  setSelectedRequest(null)
                }}
                style={{
                  flex: 1,
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
              {selectedRequest.status === 'pending' && (
                <button
                  onClick={() => handleCancelRequest(selectedRequest.id)}
                  style={{
                    flex: 1,
                    padding: '12px 24px',
                    background: theme.colors.error,
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Cancel Request
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  )
}

export default FactoringPage
