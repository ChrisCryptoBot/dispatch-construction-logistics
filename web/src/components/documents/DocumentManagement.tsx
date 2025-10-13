import React, { useState, useRef } from 'react'
import { colors, shadows, borders, spacing, gradients } from '../styles/design-system'

interface Document {
  id: string
  name: string
  type: 'pdf' | 'image' | 'excel' | 'word' | 'other'
  size: number
  uploadedBy: string
  uploadedAt: string
  category: 'contracts' | 'permits' | 'invoices' | 'compliance' | 'other'
  status: 'active' | 'archived' | 'pending' | 'expired'
  tags: string[]
  description?: string
  version: number
  lastModified: string
  downloadCount: number
}

const DocumentManagement = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'upload' | 'categories' | 'search'>('overview')
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Mock data
  const documents: Document[] = [
    {
      id: 'DOC001',
      name: 'Load Contract - LD-2024-001.pdf',
      type: 'pdf',
      size: 2450000,
      uploadedBy: 'John Smith',
      uploadedAt: '2024-01-08 09:30',
      category: 'contracts',
      status: 'active',
      tags: ['contract', 'load', 'LD-2024-001'],
      description: 'Contract for load LD-2024-001 from Baltimore to Philadelphia',
      version: 1,
      lastModified: '2024-01-08 09:30',
      downloadCount: 3
    },
    {
      id: 'DOC002',
      name: 'Overweight Permit - Route 95.pdf',
      type: 'pdf',
      size: 890000,
      uploadedBy: 'Mike Johnson',
      uploadedAt: '2024-01-07 14:20',
      category: 'permits',
      status: 'active',
      tags: ['permit', 'overweight', 'route-95'],
      description: 'Overweight permit for Route 95 corridor',
      version: 2,
      lastModified: '2024-01-07 16:45',
      downloadCount: 1
    },
    {
      id: 'DOC003',
      name: 'Invoice - January 2024.xlsx',
      type: 'excel',
      size: 156000,
      uploadedBy: 'Sarah Wilson',
      uploadedAt: '2024-01-06 11:15',
      category: 'invoices',
      status: 'active',
      tags: ['invoice', 'january', '2024'],
      description: 'Monthly invoice for January 2024 operations',
      version: 1,
      lastModified: '2024-01-06 11:15',
      downloadCount: 8
    },
    {
      id: 'DOC004',
      name: 'DOT Compliance Certificate.pdf',
      type: 'pdf',
      size: 1200000,
      uploadedBy: 'System',
      uploadedAt: '2024-01-05 08:00',
      category: 'compliance',
      status: 'expired',
      tags: ['compliance', 'dot', 'certificate'],
      description: 'DOT compliance certificate - requires renewal',
      version: 1,
      lastModified: '2024-01-05 08:00',
      downloadCount: 2
    },
    {
      id: 'DOC005',
      name: 'Driver License - John Smith.jpg',
      type: 'image',
      size: 890000,
      uploadedBy: 'John Smith',
      uploadedAt: '2024-01-04 16:30',
      category: 'compliance',
      status: 'active',
      tags: ['driver', 'license', 'john-smith'],
      description: 'Driver license verification document',
      version: 1,
      lastModified: '2024-01-04 16:30',
      downloadCount: 0
    }
  ]

  const categories = [
    { id: 'contracts', label: 'Contracts', icon: 'fas fa-file-contract', count: documents.filter(d => d.category === 'contracts').length, color: '#3b82f6' },
    { id: 'permits', label: 'Permits', icon: 'fas fa-id-card', count: documents.filter(d => d.category === 'permits').length, color: '#f59e0b' },
    { id: 'invoices', label: 'Invoices', icon: 'fas fa-file-invoice-dollar', count: documents.filter(d => d.category === 'invoices').length, color: '#10b981' },
    { id: 'compliance', label: 'Compliance', icon: 'fas fa-shield-alt', count: documents.filter(d => d.category === 'compliance').length, color: '#ef4444' },
    { id: 'other', label: 'Other', icon: 'fas fa-file', count: documents.filter(d => d.category === 'other').length, color: '#6b7280' }
  ]

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return 'fas fa-file-pdf'
      case 'image': return 'fas fa-file-image'
      case 'excel': return 'fas fa-file-excel'
      case 'word': return 'fas fa-file-word'
      default: return 'fas fa-file'
    }
  }

  const getFileColor = (type: string) => {
    switch (type) {
      case 'pdf': return '#ef4444'
      case 'image': return '#10b981'
      case 'excel': return '#059669'
      case 'word': return '#2563eb'
      default: return '#6b7280'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10b981'
      case 'pending': return '#f59e0b'
      case 'expired': return '#ef4444'
      case 'archived': return '#6b7280'
      default: return '#6b7280'
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      // In a real app, this would upload to the backend
      console.log('Uploading files:', files)
      // Reset the input
      event.target.value = ''
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    const files = event.dataTransfer.files
    if (files) {
      console.log('Dropped files:', files)
    }
  }

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || doc.category === filterCategory
    const matchesStatus = filterStatus === 'all' || doc.status === filterStatus
    return matchesSearch && matchesCategory && matchesStatus
  })

  return (
    <div style={{
      background: colors.background.secondary,
      borderRadius: borders.radius.xl,
      padding: spacing.xl,
      border: `${borders.thin} ${colors.border.primary}`,
      boxShadow: shadows.card,
      marginBottom: spacing.xl
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg }}>
        <div>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: colors.text.primary,
            margin: '0 0 8px 0',
            display: 'flex',
            alignItems: 'center',
            gap: spacing.md
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: gradients.primary,
              borderRadius: borders.radius.md,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: shadows.soft
            }}>
              <i className="fas fa-file-alt" style={{ color: 'white', fontSize: '18px' }}></i>
            </div>
            Document Management
          </h2>
          <p style={{ color: colors.text.secondary, margin: 0, fontSize: '14px' }}>
            Secure document storage, version control, and compliance tracking
          </p>
        </div>
        <div style={{ display: 'flex', gap: spacing.sm }}>
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: `${spacing.sm} ${spacing.md}`,
              background: gradients.primary,
              color: 'white',
              border: 'none',
              borderRadius: borders.radius.sm,
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: shadows.soft
            }}
          >
            <i className="fas fa-upload" style={{ marginRight: spacing.xs }}></i>
            Upload Files
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: spacing.xs,
        marginBottom: spacing.lg,
        borderBottom: `${borders.thin} ${colors.border.secondary}`,
        paddingBottom: spacing.md
      }}>
        {[
          { id: 'overview', label: 'Overview', icon: 'fas fa-th-large' },
          { id: 'upload', label: 'Upload', icon: 'fas fa-upload' },
          { id: 'categories', label: 'Categories', icon: 'fas fa-folder' },
          { id: 'search', label: 'Search', icon: 'fas fa-search' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              padding: `${spacing.sm} ${spacing.md}`,
              backgroundColor: activeTab === tab.id ? colors.primary[500] : 'transparent',
              color: activeTab === tab.id ? 'white' : colors.text.secondary,
              border: 'none',
              borderRadius: borders.radius.sm,
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: spacing.xs
            }}
          >
            <i className={tab.icon} style={{ fontSize: '14px' }}></i>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div>
          {/* Document Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: spacing.lg,
            marginBottom: spacing.xl
          }}>
            <div style={{
              background: colors.background.tertiary,
              borderRadius: borders.radius.lg,
              padding: spacing.lg,
              border: `${borders.thin} ${colors.border.secondary}`,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#3b82f6', marginBottom: spacing.xs }}>
                {documents.length}
              </div>
              <div style={{ color: colors.text.secondary, fontSize: '14px', fontWeight: '600' }}>
                Total Documents
              </div>
            </div>
            <div style={{
              background: colors.background.tertiary,
              borderRadius: borders.radius.lg,
              padding: spacing.lg,
              border: `${borders.thin} ${colors.border.secondary}`,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981', marginBottom: spacing.xs }}>
                {documents.filter(d => d.status === 'active').length}
              </div>
              <div style={{ color: colors.text.secondary, fontSize: '14px', fontWeight: '600' }}>
                Active Documents
              </div>
            </div>
            <div style={{
              background: colors.background.tertiary,
              borderRadius: borders.radius.lg,
              padding: spacing.lg,
              border: `${borders.thin} ${colors.border.secondary}`,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f59e0b', marginBottom: spacing.xs }}>
                {documents.filter(d => d.status === 'expired').length}
              </div>
              <div style={{ color: colors.text.secondary, fontSize: '14px', fontWeight: '600' }}>
                Expired Documents
              </div>
            </div>
            <div style={{
              background: colors.background.tertiary,
              borderRadius: borders.radius.lg,
              padding: spacing.lg,
              border: `${borders.thin} ${colors.border.secondary}`,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#8b5cf6', marginBottom: spacing.xs }}>
                {formatFileSize(documents.reduce((acc, doc) => acc + doc.size, 0))}
              </div>
              <div style={{ color: colors.text.secondary, fontSize: '14px', fontWeight: '600' }}>
                Total Storage Used
              </div>
            </div>
          </div>

          {/* Recent Documents */}
          <div>
            <h3 style={{
              color: colors.text.primary,
              fontSize: '18px',
              fontWeight: '700',
              margin: `0 0 ${spacing.lg} 0`
            }}>
              Recent Documents
            </h3>
            <div style={{
              display: 'grid',
              gap: spacing.md
            }}>
              {documents.slice(0, 5).map(doc => (
                <div
                  key={doc.id}
                  style={{
                    background: colors.background.tertiary,
                    borderRadius: borders.radius.lg,
                    padding: spacing.lg,
                    border: `${borders.thin} ${colors.border.secondary}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing.md,
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLDivElement).style.transform = 'translateY(-2px)'
                    (e.target as HTMLDivElement).style.boxShadow = shadows.medium
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLDivElement).style.transform = 'translateY(0)'
                    (e.target as HTMLDivElement).style.boxShadow = 'none'
                  }}
                >
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: borders.radius.md,
                    backgroundColor: getFileColor(doc.type),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <i className={getFileIcon(doc.type)} style={{ color: 'white', fontSize: '20px' }}></i>
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{
                      color: colors.text.primary,
                      fontSize: '16px',
                      fontWeight: '600',
                      margin: '0 0 4px 0'
                    }}>
                      {doc.name}
                    </h4>
                    <p style={{
                      color: colors.text.secondary,
                      fontSize: '14px',
                      margin: '0 0 8px 0'
                    }}>
                      {doc.description}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md, fontSize: '12px' }}>
                      <span style={{ color: colors.text.tertiary }}>Uploaded by {doc.uploadedBy}</span>
                      <span style={{ color: colors.text.tertiary }}>•</span>
                      <span style={{ color: colors.text.tertiary }}>{formatFileSize(doc.size)}</span>
                      <span style={{ color: colors.text.tertiary }}>•</span>
                      <span style={{ color: colors.text.tertiary }}>{doc.downloadCount} downloads</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing.xs,
                      backgroundColor: getStatusColor(doc.status),
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: borders.radius.sm,
                      fontSize: '11px',
                      fontWeight: '600',
                      textTransform: 'uppercase'
                    }}>
                      {doc.status}
                    </div>
                    <button style={{
                      padding: '8px',
                      backgroundColor: colors.background.primary,
                      border: `${borders.thin} ${colors.border.secondary}`,
                      borderRadius: borders.radius.sm,
                      cursor: 'pointer'
                    }}>
                      <i className="fas fa-download" style={{ color: colors.text.secondary, fontSize: '14px' }}></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'upload' && (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            style={{
              border: '2px dashed #4b5563',
              borderRadius: borders.radius.lg,
              padding: '60px 40px',
              backgroundColor: colors.background.tertiary,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              marginBottom: spacing.lg
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <i className="fas fa-cloud-upload-alt" style={{ fontSize: '48px', color: colors.text.tertiary, marginBottom: spacing.lg }}></i>
            <h3 style={{ color: colors.text.primary, fontSize: '20px', marginBottom: spacing.md }}>Drag & Drop Files Here</h3>
            <p style={{ color: colors.text.secondary, fontSize: '16px', marginBottom: spacing.lg }}>
              Or click to browse and select files to upload
            </p>
            <button style={{
              padding: `${spacing.md} ${spacing.lg}`,
              background: gradients.primary,
              color: 'white',
              border: 'none',
              borderRadius: borders.radius.md,
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}>
              <i className="fas fa-folder-open" style={{ marginRight: spacing.sm }}></i>
              Browse Files
            </button>
          </div>
          <p style={{ color: colors.text.tertiary, fontSize: '14px' }}>
            Supported formats: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, GIF (Max 50MB per file)
          </p>
        </div>
      )}

      {activeTab === 'categories' && (
        <div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: spacing.lg
          }}>
            {categories.map(category => (
              <div
                key={category.id}
                style={{
                  background: colors.background.tertiary,
                  borderRadius: borders.radius.lg,
                  padding: spacing.lg,
                  border: `${borders.thin} ${colors.border.secondary}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLDivElement).style.transform = 'translateY(-2px)'
                  (e.target as HTMLDivElement).style.boxShadow = shadows.medium
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLDivElement).style.transform = 'translateY(0)'
                  (e.target as HTMLDivElement).style.boxShadow = 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: borders.radius.md,
                    backgroundColor: category.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <i className={category.icon} style={{ color: 'white', fontSize: '20px' }}></i>
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      color: colors.text.primary,
                      fontSize: '18px',
                      fontWeight: '700',
                      margin: '0 0 4px 0'
                    }}>
                      {category.label}
                    </h3>
                    <p style={{
                      color: colors.text.secondary,
                      fontSize: '14px',
                      margin: 0
                    }}>
                      {category.count} documents
                    </p>
                  </div>
                </div>
                <div style={{
                  backgroundColor: colors.background.primary,
                  borderRadius: borders.radius.sm,
                  padding: spacing.sm,
                  border: `1px solid ${colors.border.secondary}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                    <span style={{ color: colors.text.secondary }}>Storage Used</span>
                    <span style={{ color: colors.text.primary, fontWeight: '600' }}>
                      {formatFileSize(documents.filter(d => d.category === category.id).reduce((acc, doc) => acc + doc.size, 0))}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'search' && (
        <div>
          {/* Search and Filters */}
          <div style={{
            display: 'flex',
            gap: spacing.md,
            marginBottom: spacing.lg
          }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <i className="fas fa-search" style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: colors.text.tertiary,
                fontSize: '14px'
              }}></i>
              <input
                type="text"
                placeholder="Search documents, tags, or descriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 40px',
                  backgroundColor: colors.background.tertiary,
                  border: `${borders.thin} ${colors.border.secondary}`,
                  borderRadius: borders.radius.sm,
                  color: colors.text.primary,
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{
                padding: '12px',
                backgroundColor: colors.background.tertiary,
                border: `${borders.thin} ${colors.border.secondary}`,
                borderRadius: borders.radius.sm,
                color: colors.text.primary,
                fontSize: '14px',
                outline: 'none'
              }}
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                padding: '12px',
                backgroundColor: colors.background.tertiary,
                border: `${borders.thin} ${colors.border.secondary}`,
                borderRadius: borders.radius.sm,
                color: colors.text.primary,
                fontSize: '14px',
                outline: 'none'
              }}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="expired">Expired</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Search Results */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg }}>
              <h3 style={{
                color: colors.text.primary,
                fontSize: '18px',
                fontWeight: '700',
                margin: 0
              }}>
                Search Results ({filteredDocuments.length})
              </h3>
            </div>
            <div style={{
              display: 'grid',
              gap: spacing.md
            }}>
              {filteredDocuments.map(doc => (
                <div
                  key={doc.id}
                  style={{
                    background: colors.background.tertiary,
                    borderRadius: borders.radius.lg,
                    padding: spacing.lg,
                    border: `${borders.thin} ${colors.border.secondary}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing.md,
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: borders.radius.md,
                    backgroundColor: getFileColor(doc.type),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <i className={getFileIcon(doc.type)} style={{ color: 'white', fontSize: '20px' }}></i>
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{
                      color: colors.text.primary,
                      fontSize: '16px',
                      fontWeight: '600',
                      margin: '0 0 4px 0'
                    }}>
                      {doc.name}
                    </h4>
                    <p style={{
                      color: colors.text.secondary,
                      fontSize: '14px',
                      margin: '0 0 8px 0'
                    }}>
                      {doc.description}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md, fontSize: '12px', flexWrap: 'wrap' }}>
                      <span style={{ color: colors.text.tertiary }}>Uploaded by {doc.uploadedBy}</span>
                      <span style={{ color: colors.text.tertiary }}>•</span>
                      <span style={{ color: colors.text.tertiary }}>{formatFileSize(doc.size)}</span>
                      <span style={{ color: colors.text.tertiary }}>•</span>
                      <span style={{ color: colors.text.tertiary }}>{doc.downloadCount} downloads</span>
                      <div style={{ display: 'flex', gap: spacing.xs, marginLeft: spacing.sm }}>
                        {doc.tags.map(tag => (
                          <span
                            key={tag}
                            style={{
                              backgroundColor: colors.background.primary,
                              color: colors.text.secondary,
                              padding: '2px 6px',
                              borderRadius: borders.radius.sm,
                              fontSize: '10px',
                              fontWeight: '600'
                            }}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing.xs,
                      backgroundColor: getStatusColor(doc.status),
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: borders.radius.sm,
                      fontSize: '11px',
                      fontWeight: '600',
                      textTransform: 'uppercase'
                    }}>
                      {doc.status}
                    </div>
                    <button style={{
                      padding: '8px',
                      backgroundColor: colors.background.primary,
                      border: `${borders.thin} ${colors.border.secondary}`,
                      borderRadius: borders.radius.sm,
                      cursor: 'pointer'
                    }}>
                      <i className="fas fa-download" style={{ color: colors.text.secondary, fontSize: '14px' }}></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DocumentManagement
