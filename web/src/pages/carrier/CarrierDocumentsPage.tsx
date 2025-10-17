import React, { useState, useRef } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { documentsAPI } from '../../services/api'
import PageContainer from '../../components/shared/PageContainer'
import Card from '../../components/ui/Card'
import { FileText, Upload, Download, Eye, Trash2, Search, Filter, FolderOpen, File, FileCheck, AlertCircle, CheckCircle, Clock, X, Plus, Edit2, Save, Loader, ArrowUpDown, CheckSquare, Square } from 'lucide-react'

interface Document {
  id: string
  name: string
  type: 'contract' | 'invoice' | 'pod' | 'scale_ticket' | 'insurance' | 'permit' | 'license' | 'other'
  size: number
  uploadedAt: string
  uploadedBy: string
  status: 'active' | 'expired' | 'pending_review' | 'rejected'
  expiryDate?: string
  relatedLoad?: string
  notes?: string
  url?: string
}

const DocumentsPage = () => {
  const { theme } = useTheme()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()
  
  // Fetch documents from API
  const { data: documents = [], isLoading, error } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      try {
        return await documentsAPI.getDocuments()
      } catch (error) {
        console.warn('API not available, using mock data:', error)
        // Fallback to mock data
        return [
    {
      id: '1',
      name: 'Insurance Certificate - General Liability.pdf',
      type: 'insurance',
      size: 2456789,
      uploadedAt: '2025-01-05',
      uploadedBy: 'John Smith',
      status: 'active',
      expiryDate: '2025-12-31'
    },
    {
      id: '2',
      name: 'Commercial Drivers License - Smith.pdf',
      type: 'license',
      size: 1234567,
      uploadedAt: '2025-01-03',
      uploadedBy: 'Admin',
      status: 'active',
      expiryDate: '2026-06-15'
    },
    {
      id: '3',
      name: 'Load Contract ABC-2025-001.pdf',
      type: 'contract',
      size: 987654,
      uploadedAt: '2025-01-07',
      uploadedBy: 'Sarah Johnson',
      status: 'active',
      relatedLoad: 'LT-1234'
    },
    {
      id: '4',
      name: 'Proof of Delivery LT-1230.pdf',
      type: 'pod',
      size: 456789,
      uploadedAt: '2025-01-06',
      uploadedBy: 'Mike Rodriguez',
      status: 'active',
      relatedLoad: 'LT-1230'
    },
    {
      id: '5',
      name: 'Overweight Permit TX-2025-045.pdf',
      type: 'permit',
      size: 234567,
      uploadedAt: '2024-12-20',
      uploadedBy: 'Admin',
      status: 'expired',
      expiryDate: '2025-01-05'
    }
        ]
      }
    }
  })
  
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  
  // Enhanced state for new features
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size' | 'type' | 'status'>('date')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [selectedDocs, setSelectedDocs] = useState<string[]>([])
  const [dateRange, setDateRange] = useState<{start: string, end: string}>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })
  const [showPreview, setShowPreview] = useState(false)
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null)

  const getTypeIcon = (type: string) => {
    const icons = {
      contract: FileCheck,
      invoice: FileText,
      pod: CheckCircle,
      scale_ticket: FileText,
      insurance: FileCheck,
      permit: FileCheck,
      license: FileCheck,
      other: File
    }
    return icons[type] || File
  }

  const getTypeLabel = (type: string) => {
    const labels = {
      contract: 'Contract',
      invoice: 'Invoice',
      pod: 'Proof of Delivery',
      scale_ticket: 'Scale Ticket',
      insurance: 'Insurance',
      permit: 'Permit',
      license: 'License',
      other: 'Other'
    }
    return labels[type] || 'Document'
  }

  const getStatusColor = (status: string) => {
    const colors = {
      active: theme.colors.success,
      expired: theme.colors.error,
      pending_review: theme.colors.warning,
      rejected: theme.colors.error
    }
    return colors[status] || theme.colors.textSecondary
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleFileUpload = (file: File) => {
    const newDoc: Document = {
      id: Date.now().toString(),
      name: file.name,
      type: 'other',
      size: file.size,
      uploadedAt: new Date().toISOString().split('T')[0],
      uploadedBy: 'Current User',
      status: 'pending_review'
    }
    // Update the query cache directly
    queryClient.setQueryData(['documents'], (oldData: Document[] = []) => [newDoc, ...oldData])
    setShowUploadModal(false)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }

  const deleteDocument = (docId: string) => {
    // Update the query cache directly
    queryClient.setQueryData(['documents'], (oldData: Document[] = []) => oldData.filter(d => d.id !== docId))
    if (selectedDoc?.id === docId) {
      setSelectedDoc(null)
    }
  }

  // Enhanced filtering and sorting logic
  const filteredAndSortedDocs = documents.filter(doc => {
    // Search filter
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Type filter
    const matchesType = filterType === 'all' || doc.type === filterType
    
    // Status filter
    const matchesStatus = filterStatus === 'all' || doc.status === filterStatus
    
    // Date range filter
    const docDate = new Date(doc.uploadedAt)
    const startDate = new Date(dateRange.start)
    const endDate = new Date(dateRange.end)
    const matchesDateRange = docDate >= startDate && docDate <= endDate
    
    return matchesSearch && matchesType && matchesStatus && matchesDateRange
  }).sort((a, b) => {
    // Sorting logic
    let comparison = 0
    
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name)
        break
      case 'date':
        comparison = new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime()
        break
      case 'size':
        comparison = a.size - b.size
        break
      case 'type':
        comparison = a.type.localeCompare(b.type)
        break
      case 'status':
        comparison = a.status.localeCompare(b.status)
        break
      default:
        comparison = 0
    }
    
    return sortDirection === 'asc' ? comparison : -comparison
  })
  
  // Bulk operations helper functions
  const toggleDocSelection = (docId: string) => {
    if (selectedDocs.includes(docId)) {
      setSelectedDocs(prev => prev.filter(id => id !== docId))
    } else {
      setSelectedDocs(prev => [...prev, docId])
    }
  }
  
  const selectAllDocs = () => {
    setSelectedDocs(filteredAndSortedDocs.map(doc => doc.id))
  }
  
  const clearSelection = () => {
    setSelectedDocs([])
  }
  
  const handleBulkDownload = () => {
    const selectedDocuments = documents.filter(d => selectedDocs.includes(d.id))
    alert(`Downloading ${selectedDocuments.length} documents...\nThis would typically create a ZIP file with all selected documents.`)
    // In production, create ZIP and download
  }
  
  const handleBulkDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedDocs.length} document(s)?`)) {
      // Update the query cache directly
      queryClient.setQueryData(['documents'], (oldData: Document[] = []) => oldData.filter(d => !selectedDocs.includes(d.id)))
      setSelectedDocs([])
      alert(`✅ ${selectedDocs.length} document(s) deleted successfully`)
    }
  }
  
  // Calculate expiring soon documents (next 30 days)
  const expiringSoon = documents.filter(doc => {
    if (!doc.expiryDate) return false
    const today = new Date()
    const expiryDate = new Date(doc.expiryDate)
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 30 && daysUntilExpiry >= 0
  })
  
  const filteredDocs = filteredAndSortedDocs // For compatibility with existing code

  const docStats = {
    total: documents.length,
    active: documents.filter(d => d.status === 'active').length,
    expired: documents.filter(d => d.status === 'expired').length,
    pending: documents.filter(d => d.status === 'pending_review').length,
    expiringSoon: expiringSoon.length,
    filteredCount: filteredAndSortedDocs.length
  }

  const headerAction = (
    <button
      onClick={() => setShowUploadModal(true)}
      style={{
        padding: '14px 28px',
        background: 'transparent',
        color: theme.colors.textSecondary,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: '8px',
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
        e.currentTarget.style.transform = 'translateY(-1px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent'
        e.currentTarget.style.color = theme.colors.textSecondary
        e.currentTarget.style.borderColor = theme.colors.border
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      <Upload size={18} />
      Upload Document
    </button>
  )

  return (
    <PageContainer
      title="Document Management"
      subtitle="Upload, organize, and manage all your business documents"
      icon={FolderOpen as any}
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
              <FileText size={28} color={theme.colors.textSecondary} />
            </div>
            <div>
              <p style={{ fontSize: '36px', fontWeight: 'bold', color: theme.colors.textPrimary, margin: 0, lineHeight: 1 }}>
                {docStats.total}
              </p>
              <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: '4px 0 0 0' }}>
                Total Documents
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
                {docStats.active}
              </p>
              <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: '4px 0 0 0' }}>
                Active Documents
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
              <AlertCircle size={28} color={theme.colors.textSecondary} />
            </div>
            <div>
              <p style={{ fontSize: '36px', fontWeight: 'bold', color: theme.colors.textPrimary, margin: 0, lineHeight: 1 }}>
                {docStats.expired}
              </p>
              <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: '4px 0 0 0' }}>
                Expired Documents
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
                {docStats.pending}
              </p>
              <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: '4px 0 0 0' }}>
                Pending Review
              </p>
            </div>
          </div>
        </Card>

        {/* Expiring Soon Card */}
        <Card padding="24px">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              background: theme.colors.backgroundTertiary,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}>
              <AlertCircle size={28} color={theme.colors.textSecondary} />
              {docStats.expiringSoon > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  width: '20px',
                  height: '20px',
                  background: theme.colors.error,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  color: 'white',
                  border: `2px solid ${theme.colors.backgroundCard}`
                }}>
                  !
                </div>
              )}
            </div>
            <div>
              <p style={{ fontSize: '36px', fontWeight: 'bold', color: theme.colors.textPrimary, margin: 0, lineHeight: 1 }}>
                {docStats.expiringSoon}
              </p>
              <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: '4px 0 0 0' }}>
                Expiring Soon
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Expiry Alert Banner */}
      {docStats.expiringSoon > 0 && (
        <div style={{
          background: `linear-gradient(135deg, ${theme.colors.warning}20, ${theme.colors.error}20)`,
          border: `2px solid ${theme.colors.warning}`,
          borderRadius: '12px',
          padding: '16px 24px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <AlertCircle size={24} color={theme.colors.warning} />
          <div style={{ flex: 1 }}>
            <p style={{
              fontSize: '16px',
              fontWeight: '600',
              color: theme.colors.textPrimary,
              margin: '0 0 4px 0'
            }}>
              ⚠️ {docStats.expiringSoon} Document{docStats.expiringSoon > 1 ? 's' : ''} Expiring Soon
            </p>
            <p style={{
              fontSize: '14px',
              color: theme.colors.textSecondary,
              margin: 0
            }}>
              You have {docStats.expiringSoon} document{docStats.expiringSoon > 1 ? 's' : ''} expiring within the next 30 days. Please review and renew as needed.
            </p>
          </div>
          <button
            onClick={() => {
              setFilterStatus('active')
              // In production, this would filter to show only expiring docs
              alert(`Showing ${docStats.expiringSoon} expiring documents`)
            }}
            style={{
              padding: '10px 20px',
              background: 'transparent',
              color: theme.colors.textSecondary,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
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
            View Details
          </button>
        </div>
      )}

      {/* Enhanced Search and Filters */}
      <Card padding="24px" style={{ marginBottom: '24px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '20px'
        }}>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: theme.colors.textPrimary,
              marginBottom: '8px'
            }}>
              Search Documents
            </label>
            <input
              type="text"
              placeholder="Search by name, type, etc..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: theme.colors.inputBg,
                border: `2px solid ${theme.colors.inputBorder}`,
                borderRadius: '10px',
                color: theme.colors.textPrimary,
                fontSize: '14px',
                outline: 'none',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = theme.colors.primary}
              onBlur={(e) => e.currentTarget.style.borderColor = theme.colors.inputBorder}
            />
          </div>

          {/* Type Filter */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: theme.colors.textPrimary,
              marginBottom: '8px'
            }}>
              Type
            </label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{
                width: '100%',
                padding: '12px',
                background: theme.colors.inputBg,
                border: `2px solid ${theme.colors.inputBorder}`,
                borderRadius: '10px',
                color: theme.colors.textPrimary,
              fontSize: '14px',
              cursor: 'pointer',
                outline: 'none'
            }}
          >
            <option value="all">All Types</option>
            <option value="contract">Contracts</option>
            <option value="invoice">Invoices</option>
            <option value="pod">Proof of Delivery</option>
            <option value="scale_ticket">Scale Tickets</option>
            <option value="insurance">Insurance</option>
            <option value="permit">Permits</option>
            <option value="license">Licenses</option>
            <option value="other">Other</option>
          </select>
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
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
                width: '100%',
                padding: '12px',
                background: theme.colors.inputBg,
                border: `2px solid ${theme.colors.inputBorder}`,
                borderRadius: '10px',
                color: theme.colors.textPrimary,
              fontSize: '14px',
              cursor: 'pointer',
                outline: 'none'
            }}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="pending_review">Pending Review</option>
            <option value="rejected">Rejected</option>
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
                  color: theme.colors.textPrimary,
                  fontSize: '14px',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <option value="date">Date</option>
                <option value="name">Name</option>
                <option value="size">Size</option>
                <option value="type">Type</option>
                <option value="status">Status</option>
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
              Upload Date Range
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
                  color: theme.colors.textPrimary,
                  fontSize: '14px',
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
                  color: theme.colors.textPrimary,
                  fontSize: '14px',
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
          marginTop: '16px'
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
            { label: 'Expired', action: () => setFilterStatus('expired') },
            { label: 'Expiring Soon', action: () => {
              setFilterStatus('active')
              alert('Showing documents expiring in the next 30 days')
            }},
            { label: 'Clear All', action: () => {
              setSearchTerm('')
              setFilterType('all')
              setFilterStatus('all')
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
          marginTop: '16px',
          padding: '12px',
          background: `${theme.colors.primary}10`,
          borderRadius: '8px',
          border: `1px solid ${theme.colors.primary}30`
        }}>
          <p style={{
            fontSize: '13px',
            color: theme.colors.textSecondary,
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <FileText size={16} color={theme.colors.primary} />
            <strong>Showing {filteredAndSortedDocs.length} of {documents.length} documents</strong>
            {searchTerm && ` • Search: "${searchTerm}"`}
            {filterType !== 'all' && ` • Type: ${getTypeLabel(filterType)}`}
            {filterStatus !== 'all' && ` • Status: ${filterStatus.replace('_', ' ')}`}
          </p>
        </div>
      </Card>

      {/* Documents List */}
      <Card padding="28px">
        {/* List Header with Bulk Actions */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h2 style={{
            fontSize: '22px',
            fontWeight: '700',
            color: theme.colors.textPrimary,
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <FileText size={22} color={theme.colors.primary} />
            Documents ({filteredAndSortedDocs.length})
          </h2>
          
          {/* Bulk Actions */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {selectedDocs.length > 0 && (
              <>
                <span style={{
                  fontSize: '14px',
                  color: theme.colors.textSecondary,
                  fontWeight: '600'
                }}>
                  {selectedDocs.length} selected
                </span>
                <button
                  onClick={handleBulkDownload}
                  style={{
                    padding: '10px 16px',
                    background: theme.colors.primary,
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <Download size={16} />
                  Download All
                </button>
                <button
                  onClick={handleBulkDelete}
                  style={{
                    padding: '10px 16px',
                    background: 'transparent',
                    color: theme.colors.error,
                    border: `2px solid ${theme.colors.error}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
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
                  <Trash2 size={16} />
                  Delete
                </button>
                <button
                  onClick={clearSelection}
                  style={{
                    padding: '10px 16px',
                    background: 'transparent',
                    color: theme.colors.textSecondary,
                    border: `2px solid ${theme.colors.border}`,
                    borderRadius: '8px',
                    fontSize: '14px',
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
              </>
            )}
            
            {/* Select All / Deselect All */}
            <button
              onClick={() => {
                if (selectedDocs.length === filteredAndSortedDocs.length && filteredAndSortedDocs.length > 0) {
                  clearSelection()
                } else {
                  selectAllDocs()
                }
              }}
              style={{
                padding: '10px 16px',
                background: 'transparent',
                color: theme.colors.textSecondary,
                border: `2px solid ${theme.colors.border}`,
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
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
              {selectedDocs.length === filteredAndSortedDocs.length && filteredAndSortedDocs.length > 0 ? (
                <>
                  <Square size={16} />
                  Deselect All
                </>
              ) : (
                <>
                  <CheckSquare size={16} />
                  Select All
                </>
              )}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredDocs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: theme.colors.textSecondary }}>
              <FileText size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
              <p style={{ fontSize: '18px', margin: 0 }}>No documents found</p>
            </div>
          ) : (
            filteredDocs.map((doc) => {
              const TypeIcon = getTypeIcon(doc.type)
              
              return (
                <div
                  key={doc.id}
                  style={{
                    background: theme.colors.background,
                    borderRadius: '12px',
                    padding: '20px',
                    border: `1px solid ${theme.colors.border}`,
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px'
                  }}
                  onClick={() => setSelectedDoc(doc)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                    {/* Bulk Selection Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedDocs.includes(doc.id)}
                      onChange={(e) => {
                        e.stopPropagation()
                        toggleDocSelection(doc.id)
                      }}
                      style={{
                        width: '20px',
                        height: '20px',
                        cursor: 'pointer',
                        accentColor: theme.colors.primary
                      }}
                    />
                    
                    <div style={{
                      width: '48px',
                      height: '48px',
                      background: `${theme.colors.primary}20`,
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <TypeIcon size={24} color={theme.colors.primary} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '16px', fontWeight: '600', color: theme.colors.textPrimary, margin: '0 0 6px 0' }}>
                        {doc.name}
                      </h3>
                      <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: 0 }}>
                        {getTypeLabel(doc.type)} • {formatFileSize(doc.size)} • {formatDate(doc.uploadedAt)}
                      </p>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {/* Expiry Warning Badge */}
                    {doc.expiryDate && (() => {
                      const today = new Date()
                      const expiryDate = new Date(doc.expiryDate)
                      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                      
                      if (daysUntilExpiry <= 30 && daysUntilExpiry >= 0) {
                        return (
                          <div style={{
                            padding: '6px 12px',
                            background: `${theme.colors.warning}20`,
                            color: theme.colors.warning,
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}>
                            <AlertCircle size={14} />
                            Expires in {daysUntilExpiry} days
                          </div>
                        )
                      }
                      return null
                    })()}
                    
                    <div style={{
                      padding: '6px 12px',
                      background: `${getStatusColor(doc.status)}20`,
                      color: getStatusColor(doc.status),
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '600',
                      textTransform: 'capitalize'
                    }}>
                      {doc.status.replace('_', ' ')}
                    </div>
                    
                    {/* Preview Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setPreviewDoc(doc)
                        setShowPreview(true)
                      }}
                      style={{
                        padding: '8px',
                        background: 'transparent',
                        color: theme.colors.textSecondary,
                        border: `1px solid ${theme.colors.border}`,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = theme.colors.backgroundHover
                        e.currentTarget.style.color = theme.colors.textPrimary
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent'
                        e.currentTarget.style.color = theme.colors.textSecondary
                      }}
                      title="Preview Document"
                    >
                      <Eye size={16} />
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        // Download logic
                      }}
                      style={{
                        padding: '8px',
                        background: 'transparent',
                        color: theme.colors.textSecondary,
                        border: `1px solid ${theme.colors.border}`,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = theme.colors.backgroundHover
                        e.currentTarget.style.color = theme.colors.textPrimary
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent'
                        e.currentTarget.style.color = theme.colors.textSecondary
                      }}
                    >
                      <Download size={16} />
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteDocument(doc.id)
                      }}
                      style={{
                        padding: '8px',
                        background: 'transparent',
                        color: theme.colors.error,
                        border: `1px solid ${theme.colors.error}40`,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = `${theme.colors.error}20`
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent'
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </Card>

      {/* Upload Modal */}
      {showUploadModal && (
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
          onClick={() => setShowUploadModal(false)}
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
                Upload Document
              </h2>
              <button
                onClick={() => setShowUploadModal(false)}
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
            
            <div
              style={{
                backgroundColor: dragActive ? `${theme.colors.primary}20` : theme.colors.background,
                padding: '48px',
                borderRadius: '16px',
                border: `3px dashed ${dragActive ? theme.colors.primary : theme.colors.border}`,
                textAlign: 'center',
                marginBottom: '24px',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div style={{
                width: '80px',
                height: '80px',
                background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.accent} 100%)`,
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                boxShadow: `0 8px 20px ${theme.colors.primary}40`
              }}>
                <Upload size={40} color="white" />
              </div>
              <h3 style={{ color: theme.colors.textPrimary, fontSize: '20px', marginBottom: '12px' }}>
                {dragActive ? 'Drop file here' : 'Drag & Drop or Click to Upload'}
              </h3>
              <p style={{ color: theme.colors.textSecondary, fontSize: '15px', marginBottom: '24px', lineHeight: 1.6 }}>
                Upload contracts, invoices, PODs, permits, licenses, and other documents
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="*/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0])
                  }
                }}
              />
              <button
                style={{
                  padding: '14px 32px',
                  background: 'transparent',
                  color: theme.colors.textSecondary,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = theme.colors.backgroundCardHover
                  e.currentTarget.style.color = theme.colors.textPrimary
                  e.currentTarget.style.borderColor = theme.colors.primary
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = theme.colors.textSecondary
                  e.currentTarget.style.borderColor = theme.colors.border
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <Upload size={18} />
                Choose File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Details Modal */}
      {selectedDoc && (
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
          onClick={() => setSelectedDoc(null)}
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
                  {selectedDoc.name}
                </h2>
                <p style={{ color: theme.colors.textSecondary, margin: 0 }}>
                  {getTypeLabel(selectedDoc.type)} • {formatFileSize(selectedDoc.size)}
                </p>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
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

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '16px',
              marginBottom: '28px'
            }}>
              <div style={{ background: theme.colors.background, padding: '20px', borderRadius: '12px' }}>
                <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
                  Status
                </p>
                <p style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: getStatusColor(selectedDoc.status),
                  margin: 0,
                  textTransform: 'capitalize'
                }}>
                  {selectedDoc.status.replace('_', ' ')}
                </p>
              </div>

              <div style={{ background: theme.colors.background, padding: '20px', borderRadius: '12px' }}>
                <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
                  Uploaded By
                </p>
                <p style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary, margin: 0 }}>
                  {selectedDoc.uploadedBy}
                </p>
              </div>

              <div style={{ background: theme.colors.background, padding: '20px', borderRadius: '12px' }}>
                <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
                  Upload Date
                </p>
                <p style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary, margin: 0 }}>
                  {formatDate(selectedDoc.uploadedAt)}
                </p>
              </div>

              {selectedDoc.expiryDate && (
                <div style={{ background: theme.colors.background, padding: '20px', borderRadius: '12px' }}>
                  <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
                    Expiry Date
                  </p>
                  <p style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary, margin: 0 }}>
                    {formatDate(selectedDoc.expiryDate)}
                  </p>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setSelectedDoc(null)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'transparent',
                  color: theme.colors.textSecondary,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: '8px',
                  fontSize: '15px',
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
                Close
              </button>
              <button
                style={{
                  padding: '12px 24px',
                  background: 'transparent',
                  color: theme.colors.textSecondary,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
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
                <Download size={18} />
                Download
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      {showPreview && previewDoc && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            backdropFilter: 'blur(8px)'
          }}
          onClick={() => {
            setShowPreview(false)
            setPreviewDoc(null)
          }}
        >
          <div
            style={{
              background: theme.colors.backgroundCard,
              borderRadius: '20px',
              padding: '36px',
              maxWidth: '1200px',
              width: '95%',
              maxHeight: '95vh',
              border: `1px solid ${theme.colors.border}`,
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)',
              overflow: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Preview Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
              <div>
                <h2 style={{ color: theme.colors.textPrimary, fontSize: '24px', fontWeight: 'bold', margin: '0 0 8px 0' }}>
                  {previewDoc.name}
                </h2>
                <p style={{ color: theme.colors.textSecondary, margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span>{getTypeLabel(previewDoc.type)}</span>
                  <span>•</span>
                  <span>{formatFileSize(previewDoc.size)}</span>
                  <span>•</span>
                  <span>Uploaded {formatDate(previewDoc.uploadedAt)}</span>
                  {previewDoc.expiryDate && (
                    <>
                      <span>•</span>
                      <span style={{
                        color: (() => {
                          const daysUntilExpiry = Math.ceil((new Date(previewDoc.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                          return daysUntilExpiry <= 30 && daysUntilExpiry >= 0 ? theme.colors.warning : theme.colors.textSecondary
                        })()
                      }}>
                        Expires {formatDate(previewDoc.expiryDate)}
                      </span>
                    </>
                  )}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowPreview(false)
                  setPreviewDoc(null)
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

            {/* Preview Content Area */}
            <div style={{
              background: theme.colors.background,
              borderRadius: '12px',
              padding: '40px',
              minHeight: '400px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '24px',
              border: `1px solid ${theme.colors.border}`
            }}>
              <div style={{ textAlign: 'center' }}>
                <FileText size={80} color={theme.colors.textSecondary} style={{ margin: '0 auto 24px', opacity: 0.3 }} />
                <p style={{ fontSize: '18px', color: theme.colors.textPrimary, marginBottom: '12px', fontWeight: '600' }}>
                  Document Preview
                </p>
                <p style={{ fontSize: '14px', color: theme.colors.textSecondary, marginBottom: '24px', maxWidth: '500px', lineHeight: 1.6 }}>
                  In production, this would display a PDF viewer or image viewer for supported file types. 
                  For now, you can download the document to view it.
                </p>
                
                {/* Document Metadata */}
                <div style={{
                  background: theme.colors.backgroundCard,
                  borderRadius: '12px',
                  padding: '24px',
                  marginTop: '24px',
                  textAlign: 'left'
                }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '16px' }}>
                    Document Information
                  </h3>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '14px', color: theme.colors.textSecondary }}>Type:</span>
                      <span style={{ fontSize: '14px', color: theme.colors.textPrimary, fontWeight: '600' }}>{getTypeLabel(previewDoc.type)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '14px', color: theme.colors.textSecondary }}>Status:</span>
                      <span style={{ fontSize: '14px', color: getStatusColor(previewDoc.status), fontWeight: '600', textTransform: 'capitalize' }}>
                        {previewDoc.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '14px', color: theme.colors.textSecondary }}>Uploaded By:</span>
                      <span style={{ fontSize: '14px', color: theme.colors.textPrimary, fontWeight: '600' }}>{previewDoc.uploadedBy}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '14px', color: theme.colors.textSecondary }}>Upload Date:</span>
                      <span style={{ fontSize: '14px', color: theme.colors.textPrimary, fontWeight: '600' }}>{formatDate(previewDoc.uploadedAt)}</span>
                    </div>
                    {previewDoc.expiryDate && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '14px', color: theme.colors.textSecondary }}>Expiry Date:</span>
                        <span style={{ fontSize: '14px', color: theme.colors.textPrimary, fontWeight: '600' }}>{formatDate(previewDoc.expiryDate)}</span>
                      </div>
                    )}
                    {previewDoc.relatedLoad && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '14px', color: theme.colors.textSecondary }}>Related Load:</span>
                        <span style={{ 
                          fontSize: '14px', 
                          color: theme.colors.primary, 
                          fontWeight: '600',
                          cursor: 'pointer',
                          textDecoration: 'underline'
                        }}>
                          {previewDoc.relatedLoad}
                        </span>
                      </div>
                    )}
                    {previewDoc.notes && (
                      <div style={{ marginTop: '8px' }}>
                        <span style={{ fontSize: '14px', color: theme.colors.textSecondary, display: 'block', marginBottom: '8px' }}>Notes:</span>
                        <p style={{ 
                          fontSize: '14px', 
                          color: theme.colors.textPrimary, 
                          background: theme.colors.background,
                          padding: '12px',
                          borderRadius: '8px',
                          margin: 0
                        }}>
                          {previewDoc.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Preview Actions */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowPreview(false)
                  setPreviewDoc(null)
                }}
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'transparent',
                  color: theme.colors.textSecondary,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: '8px',
                  fontSize: '15px',
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
                Close
              </button>
              <button
                onClick={() => {
                  alert(`Downloading ${previewDoc.name}...`)
                }}
                style={{
                  padding: '12px 24px',
                  background: 'transparent',
                  color: theme.colors.textSecondary,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
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
                <Download size={18} />
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  )
}

export default DocumentsPage


