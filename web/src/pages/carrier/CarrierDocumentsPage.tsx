import React, { useState, useRef } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { documentsAPI } from '../../services/api'
import PageContainer from '../../components/PageContainer'
import Card from '../../components/Card'
import { FileText, Upload, Download, Eye, Trash2, Search, Filter, FolderOpen, File, FileCheck, AlertCircle, CheckCircle, Clock, X, Plus, Edit2, Save, Loader } from 'lucide-react'

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
    setDocuments(prev => [newDoc, ...prev])
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
    setDocuments(prev => prev.filter(d => d.id !== docId))
    if (selectedDoc?.id === docId) {
      setSelectedDoc(null)
    }
  }

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || doc.type === filterType
    const matchesStatus = filterStatus === 'all' || doc.status === filterStatus
    return matchesSearch && matchesType && matchesStatus
  })

  const docStats = {
    total: documents.length,
    active: documents.filter(d => d.status === 'active').length,
    expired: documents.filter(d => d.status === 'expired').length,
    pending: documents.filter(d => d.status === 'pending_review').length
  }

  const headerAction = (
    <button
      onClick={() => setShowUploadModal(true)}
      style={{
        padding: '14px 28px',
        background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.accent} 100%)`,
        color: 'white',
        borderRadius: '12px',
        border: 'none',
        fontSize: '15px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: `0 4px 12px ${theme.colors.primary}40`,
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <Upload size={18} />
      Upload Document
    </button>
  )

  return (
    <PageContainer
      title="Document Management"
      subtitle="Upload, organize, and manage all your business documents"
      icon={FolderOpen}
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
              background: `${theme.colors.primary}20`,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FileText size={28} color={theme.colors.primary} />
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
              background: `${theme.colors.success}20`,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CheckCircle size={28} color={theme.colors.success} />
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
              background: `${theme.colors.error}20`,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AlertCircle size={28} color={theme.colors.error} />
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
              background: `${theme.colors.warning}20`,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Clock size={28} color={theme.colors.warning} />
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
      </div>

      {/* Search and Filters */}
      <Card padding="20px" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search */}
          <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
            <Search size={18} color={theme.colors.textSecondary} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 12px 12px 42px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#FFFFFF',
                fontSize: '14px',
                outline: 'none',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea'
                e.target.style.background = 'rgba(255, 255, 255, 0.08)'
                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                e.target.style.background = 'rgba(255, 255, 255, 0.05)'
                e.target.style.boxShadow = 'none'
              }}
            />
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{
              padding: '12px 16px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              color: '#FFFFFF',
              fontSize: '14px',
              cursor: 'pointer',
              outline: 'none',
              transition: 'all 0.2s ease'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#667eea'
              e.target.style.background = 'rgba(255, 255, 255, 0.08)'
              e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'
              e.target.style.background = 'rgba(255, 255, 255, 0.05)'
              e.target.style.boxShadow = 'none'
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

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              padding: '12px 16px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              color: '#FFFFFF',
              fontSize: '14px',
              cursor: 'pointer',
              outline: 'none',
              transition: 'all 0.2s ease'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#667eea'
              e.target.style.background = 'rgba(255, 255, 255, 0.08)'
              e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'
              e.target.style.background = 'rgba(255, 255, 255, 0.05)'
              e.target.style.boxShadow = 'none'
            }}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="pending_review">Pending Review</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </Card>

      {/* Documents List */}
      <Card title="Documents" icon={<FileText size={20} color={theme.colors.primary} />}>
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
                  background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.accent} 100%)`,
                  color: 'white',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: `0 4px 12px ${theme.colors.primary}40`,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
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
                  backgroundColor: theme.colors.backgroundHover,
                  color: theme.colors.textPrimary,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                Close
              </button>
              <button
                style={{
                  padding: '12px 24px',
                  background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.accent} 100%)`,
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease',
                  boxShadow: `0 4px 12px ${theme.colors.primary}40`
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
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


