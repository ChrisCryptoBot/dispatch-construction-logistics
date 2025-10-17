import React, { useState } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { FileText, Upload, Download, Eye, Trash2, Filter, Search, CheckCircle, Clock, AlertTriangle, File } from 'lucide-react'
import PageContainer from '../../components/shared/PageContainer'
import Card from '../../components/ui/Card'

interface Document {
  id: string
  name: string
  type: 'BOL' | 'Invoice' | 'POD' | 'Scale_Ticket' | 'Insurance' | 'Contract' | 'Other'
  loadId?: string
  jobSite?: string
  uploadDate: string
  size: string
  status: 'approved' | 'pending' | 'rejected'
  uploadedBy: string
}

const DocumentsPage = () => {
  const { theme } = useTheme()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showUploadModal, setShowUploadModal] = useState(false)

  // Mock documents
  const [documents] = useState<Document[]>([
    {
      id: '1',
      name: 'BOL_LD5432_01082025.pdf',
      type: 'BOL',
      loadId: 'LD-5432',
      jobSite: 'Downtown Plaza Construction',
      uploadDate: '2025-01-08',
      size: '245 KB',
      status: 'approved',
      uploadedBy: 'John Smith (ABC Trucking)'
    },
    {
      id: '2',
      name: 'Invoice_LD5433.pdf',
      type: 'Invoice',
      loadId: 'LD-5433',
      jobSite: 'Highway 35 Extension',
      uploadDate: '2025-01-08',
      size: '156 KB',
      status: 'pending',
      uploadedBy: 'FastHaul Logistics'
    },
    {
      id: '3',
      name: 'POD_LD5430.pdf',
      type: 'POD',
      loadId: 'LD-5430',
      jobSite: 'Downtown Plaza Construction',
      uploadDate: '2025-01-07',
      size: '312 KB',
      status: 'approved',
      uploadedBy: 'Sarah Johnson (Superior Logistics)'
    },
    {
      id: '4',
      name: 'Scale_Ticket_ST001234.pdf',
      type: 'Scale_Ticket',
      loadId: 'LD-5432',
      jobSite: 'Dallas Quarry',
      uploadDate: '2025-01-08',
      size: '189 KB',
      status: 'approved',
      uploadedBy: 'John Smith (ABC Trucking)'
    },
    {
      id: '5',
      name: 'Insurance_Certificate_ABC.pdf',
      type: 'Insurance',
      jobSite: 'All Sites',
      uploadDate: '2025-01-01',
      size: '423 KB',
      status: 'approved',
      uploadedBy: 'ABC Trucking'
    },
    {
      id: '6',
      name: 'Contract_Downtown_Plaza.pdf',
      type: 'Contract',
      jobSite: 'Downtown Plaza Construction',
      uploadDate: '2024-11-15',
      size: '567 KB',
      status: 'approved',
      uploadedBy: 'Customer Portal'
    },
    {
      id: '7',
      name: 'BOL_LD5435_DRAFT.pdf',
      type: 'BOL',
      loadId: 'LD-5435',
      jobSite: 'Riverside Park Development',
      uploadDate: '2025-01-08',
      size: '198 KB',
      status: 'rejected',
      uploadedBy: 'Mike Rodriguez (XYZ Transport)'
    }
  ])

  const documentTypeConfig = {
    BOL: { label: 'Bill of Lading', color: theme.colors.primary, icon: FileText },
    Invoice: { label: 'Invoice', color: theme.colors.warning, icon: File },
    POD: { label: 'Proof of Delivery', color: theme.colors.success, icon: CheckCircle },
    Scale_Ticket: { label: 'Scale Ticket', color: theme.colors.info, icon: FileText },
    Insurance: { label: 'Insurance', color: theme.colors.error, icon: FileText },
    Contract: { label: 'Contract', color: theme.colors.textSecondary, icon: FileText },
    Other: { label: 'Other', color: theme.colors.textSecondary, icon: File }
  }

  const statusConfig = {
    approved: { color: theme.colors.success, label: 'Approved', icon: CheckCircle },
    pending: { color: theme.colors.warning, label: 'Pending', icon: Clock },
    rejected: { color: theme.colors.error, label: 'Rejected', icon: AlertTriangle }
  }

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.loadId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.jobSite?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || doc.type === filterType
    const matchesStatus = filterStatus === 'all' || doc.status === filterStatus
    return matchesSearch && matchesType && matchesStatus
  })

  const stats = {
    total: documents.length,
    pending: documents.filter(d => d.status === 'pending').length,
    approved: documents.filter(d => d.status === 'approved').length,
    rejected: documents.filter(d => d.status === 'rejected').length
  }

  return (
    <PageContainer>
      {/* Header */}
      <div style={{ marginBottom: theme.spacing.lg }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.md }}>
          <div>
            <h1 style={{ 
              fontSize: '28px', 
              fontWeight: '700',
              color: theme.colors.textPrimary,
              marginBottom: theme.spacing.xs
            }}>
              Documents
            </h1>
            <p style={{ color: theme.colors.textSecondary, fontSize: '14px' }}>
              Manage BOLs, invoices, scale tickets, and other documents
            </p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: theme.spacing.xs,
              padding: `${theme.spacing.sm} ${theme.spacing.md}`,
              background: 'transparent',
              color: theme.colors.textSecondary,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: theme.borderRadius.md,
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
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
            Upload Document
          </button>
        </div>

        {/* Stats Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: theme.spacing.md,
          marginBottom: theme.spacing.lg
        }}>
          <Card hover={false}>
            <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
              <div style={{ 
                padding: theme.spacing.sm,
                background: theme.colors.backgroundTertiary,
                borderRadius: theme.borderRadius.md
              }}>
                <FileText size={20} color={theme.colors.textSecondary} />
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: theme.colors.textPrimary }}>
                  {stats.total}
                </div>
                <div style={{ fontSize: '12px', color: theme.colors.textSecondary }}>Total Documents</div>
              </div>
            </div>
          </Card>

          <Card hover={false}>
            <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
              <div style={{ 
                padding: theme.spacing.sm,
                background: theme.colors.backgroundTertiary,
                borderRadius: theme.borderRadius.md
              }}>
                <Clock size={20} color={theme.colors.textSecondary} />
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: theme.colors.textPrimary }}>
                  {stats.pending}
                </div>
                <div style={{ fontSize: '12px', color: theme.colors.textSecondary }}>Pending Review</div>
              </div>
            </div>
          </Card>

          <Card hover={false}>
            <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
              <div style={{ 
                padding: theme.spacing.sm,
                background: theme.colors.backgroundTertiary,
                borderRadius: theme.borderRadius.md
              }}>
                <CheckCircle size={20} color={theme.colors.textSecondary} />
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: theme.colors.textPrimary }}>
                  {stats.approved}
                </div>
                <div style={{ fontSize: '12px', color: theme.colors.textSecondary }}>Approved</div>
              </div>
            </div>
          </Card>

          <Card hover={false}>
            <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
              <div style={{ 
                padding: theme.spacing.sm,
                background: theme.colors.backgroundTertiary,
                borderRadius: theme.borderRadius.md
              }}>
                <AlertTriangle size={20} color={theme.colors.textSecondary} />
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: theme.colors.textPrimary }}>
                  {stats.rejected}
                </div>
                <div style={{ fontSize: '12px', color: theme.colors.textSecondary }}>Rejected</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Search and Filters */}
        <div style={{ display: 'flex', gap: theme.spacing.md, marginBottom: theme.spacing.md }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search 
              size={18} 
              style={{ 
                position: 'absolute', 
                left: theme.spacing.sm, 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: theme.colors.textSecondary
              }} 
            />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: `${theme.spacing.sm} ${theme.spacing.sm} ${theme.spacing.sm} 40px`,
                background: theme.colors.backgroundSecondary,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: theme.borderRadius.md,
                color: theme.colors.textPrimary,
                fontSize: '14px'
              }}
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{
              padding: `${theme.spacing.sm} ${theme.spacing.md}`,
              background: theme.colors.backgroundSecondary,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: theme.borderRadius.md,
              color: theme.colors.textPrimary,
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Types</option>
            <option value="BOL">Bill of Lading</option>
            <option value="Invoice">Invoice</option>
            <option value="POD">Proof of Delivery</option>
            <option value="Scale_Ticket">Scale Ticket</option>
            <option value="Insurance">Insurance</option>
            <option value="Contract">Contract</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              padding: `${theme.spacing.sm} ${theme.spacing.md}`,
              background: theme.colors.backgroundSecondary,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: theme.borderRadius.md,
              color: theme.colors.textPrimary,
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Documents Table */}
      <Card hover={false}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${theme.colors.border}` }}>
                <th style={{ 
                  padding: theme.spacing.md, 
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: theme.colors.textSecondary,
                  textTransform: 'uppercase'
                }}>
                  Document Name
                </th>
                <th style={{ 
                  padding: theme.spacing.md, 
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: theme.colors.textSecondary,
                  textTransform: 'uppercase'
                }}>
                  Type
                </th>
                <th style={{ 
                  padding: theme.spacing.md, 
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: theme.colors.textSecondary,
                  textTransform: 'uppercase'
                }}>
                  Load / Job Site
                </th>
                <th style={{ 
                  padding: theme.spacing.md, 
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: theme.colors.textSecondary,
                  textTransform: 'uppercase'
                }}>
                  Date
                </th>
                <th style={{ 
                  padding: theme.spacing.md, 
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: theme.colors.textSecondary,
                  textTransform: 'uppercase'
                }}>
                  Status
                </th>
                <th style={{ 
                  padding: theme.spacing.md, 
                  textAlign: 'center',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: theme.colors.textSecondary,
                  textTransform: 'uppercase'
                }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.map(doc => {
                const TypeIcon = documentTypeConfig[doc.type].icon
                const StatusIcon = statusConfig[doc.status].icon
                
                return (
                  <tr 
                    key={doc.id}
                    style={{ 
                      borderBottom: `1px solid ${theme.colors.border}`,
                      transition: 'background 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = theme.colors.backgroundSecondary}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: theme.spacing.md }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
                        <TypeIcon size={18} color={documentTypeConfig[doc.type].color} />
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '500', color: theme.colors.textPrimary }}>
                            {doc.name}
                          </div>
                          <div style={{ fontSize: '12px', color: theme.colors.textSecondary }}>
                            {doc.size}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: theme.spacing.md }}>
                      <span style={{
                        padding: '4px 8px',
                        background: `${documentTypeConfig[doc.type].color}20`,
                        borderRadius: theme.borderRadius.sm,
                        fontSize: '12px',
                        fontWeight: '600',
                        color: documentTypeConfig[doc.type].color
                      }}>
                        {documentTypeConfig[doc.type].label}
                      </span>
                    </td>
                    <td style={{ padding: theme.spacing.md }}>
                      <div style={{ fontSize: '13px', color: theme.colors.textPrimary }}>
                        {doc.loadId && <div style={{ fontWeight: '600' }}>{doc.loadId}</div>}
                        <div style={{ fontSize: '12px', color: theme.colors.textSecondary }}>{doc.jobSite}</div>
                      </div>
                    </td>
                    <td style={{ padding: theme.spacing.md, fontSize: '13px', color: theme.colors.textPrimary }}>
                      {new Date(doc.uploadDate).toLocaleDateString()}
                    </td>
                    <td style={{ padding: theme.spacing.md }}>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: theme.spacing.xs,
                        padding: '4px 10px',
                        background: `${statusConfig[doc.status].color}20`,
                        borderRadius: theme.borderRadius.full,
                        fontSize: '12px',
                        fontWeight: '600',
                        color: statusConfig[doc.status].color
                      }}>
                        <StatusIcon size={12} />
                        {statusConfig[doc.status].label}
                      </div>
                    </td>
                    <td style={{ padding: theme.spacing.md }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: theme.spacing.xs }}>
                        <button
                          onClick={() => alert(`View document: ${doc.name}`)}
                          style={{
                            padding: theme.spacing.xs,
                            background: 'transparent',
                            border: 'none',
                            color: theme.colors.primary,
                            cursor: 'pointer',
                            borderRadius: theme.borderRadius.sm,
                            transition: 'background 0.2s ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = theme.colors.backgroundTertiary}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => alert(`Download document: ${doc.name}`)}
                          style={{
                            padding: theme.spacing.xs,
                            background: 'transparent',
                            border: 'none',
                            color: theme.colors.success,
                            cursor: 'pointer',
                            borderRadius: theme.borderRadius.sm,
                            transition: 'background 0.2s ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = theme.colors.backgroundTertiary}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <Download size={18} />
                        </button>
                        <button
                          onClick={() => alert(`Delete document: ${doc.name}`)}
                          style={{
                            padding: theme.spacing.xs,
                            background: 'transparent',
                            border: 'none',
                            color: theme.colors.error,
                            cursor: 'pointer',
                            borderRadius: theme.borderRadius.sm,
                            transition: 'background 0.2s ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = theme.colors.backgroundTertiary}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Upload Modal */}
      {showUploadModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: theme.spacing.lg
        }}>
          <div style={{
            background: theme.colors.backgroundPrimary,
            borderRadius: theme.borderRadius.lg,
            padding: theme.spacing.xl,
            maxWidth: '600px',
            width: '100%'
          }}>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: '700', 
              color: theme.colors.textPrimary,
              marginBottom: theme.spacing.lg 
            }}>
              Upload Document
            </h2>
            <p style={{ color: theme.colors.textSecondary, marginBottom: theme.spacing.lg }}>
              This feature will allow you to upload BOLs, PODs, invoices, scale tickets, and other documents.
            </p>
            <div style={{ display: 'flex', gap: theme.spacing.md }}>
              <button
                onClick={() => {
                  alert('Upload Document functionality - Coming soon!')
                  setShowUploadModal(false)
                }}
                style={{
                  flex: 1,
                  padding: theme.spacing.md,
                  background: 'transparent',
                  color: theme.colors.textSecondary,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: theme.borderRadius.md,
                  fontSize: '14px',
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
                OK
              </button>
              <button
                onClick={() => setShowUploadModal(false)}
                style={{
                  padding: theme.spacing.md,
                  background: 'transparent',
                  color: theme.colors.textSecondary,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: theme.borderRadius.md,
                  fontSize: '14px',
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
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  )
}

export default DocumentsPage

