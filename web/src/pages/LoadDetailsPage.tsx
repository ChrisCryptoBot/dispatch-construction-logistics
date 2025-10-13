import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext-fixed'
import PageContainer from '../components/shared/PageContainer'
import Card from '../components/ui/Card'
import { formatNumber, formatCurrency, formatCompactCurrency, formatPercentage } from '../utils/formatters';

import {
  Package, Truck, MapPin, Clock, DollarSign, FileText, FileSignature,
  CheckCircle, AlertCircle, User, Phone, Calendar, MessageSquare,
  Edit, Upload, Download, Eye, ArrowLeft, Navigation, Scale,
  Building, Hash, Loader, Info, TrendingUp, Bell, XCircle
} from 'lucide-react'

interface Load {
  id: string
  commodity: string
  status: string
  units: number
  rateMode: string
  revenue: number
  customer: { name: string; phone: string }
  carrier?: { name: string; phone: string }
  origin: { siteName: string; address: string; city: string }
  destination: { siteName: string; address: string; city: string }
  miles: number
  pickupDate: string
  pickupETA: string
  deliveryDate: string
  deliveryETA: string
  equipmentType: string
  driver?: { name: string; phone: string }
  notes?: string
  rateConSigned: boolean
  rateConSignedDate?: string
  bolUploaded: boolean
  podUploaded: boolean
  customerPaid: boolean
  createdAt: string
  updatedAt: string
  statusHistory: StatusHistory[]
  documents: Document[]
  communications: Communication[]
}

interface StatusHistory {
  id: string
  status: string
  timestamp: string
  updatedBy: string
  notes?: string
}

interface Document {
  id: string
  type: 'RATE_CON' | 'BOL' | 'POD' | 'SCALE_TICKET' | 'PERMIT'
  fileName: string
  fileUrl: string
  uploadedBy: string
  uploadedAt: string
}

interface Communication {
  id: string
  type: 'NOTE' | 'ALERT' | 'UPDATE'
  message: string
  from: string
  timestamp: string
  isRead: boolean
}

const LoadDetailsPage = () => {
  const { theme } = useTheme()
  const { user } = useAuth()
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [load, setLoad] = useState<Load | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'history' | 'communications'>('overview')
  const [showDocumentModal, setShowDocumentModal] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [newNote, setNewNote] = useState('')
  const [isAddingNote, setIsAddingNote] = useState(false)

  useEffect(() => {
    loadLoadDetails()
  }, [id])

  const loadLoadDetails = async () => {
    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Please log in to view load details')
        return
      }

      const isDevMode = token.startsWith('dev-')

      if (isDevMode) {
        console.log('🧪 Development mode - using mock load details data')

        // Mock comprehensive load data
        setLoad({
          id: id || 'load-001',
          commodity: 'Crushed Limestone',
          status: 'IN_TRANSIT',
          units: 18.5,
          rateMode: 'PER_TON',
          revenue: 925,
          customer: { name: 'ABC Construction', phone: '(512) 555-0123' },
          carrier: { name: 'Superior One Logistics', phone: '(512) 555-0198' },
          origin: { 
            siteName: 'Main Quarry', 
            address: '1234 Rock Rd, Austin, TX 78701', 
            city: 'Austin' 
          },
          destination: { 
            siteName: 'Downtown Project', 
            address: '789 Congress Ave, Austin, TX 78701', 
            city: 'Austin' 
          },
          miles: 12.3,
          pickupDate: '2025-10-09',
          pickupETA: '8:00 AM',
          deliveryDate: '2025-10-09',
          deliveryETA: '2:00 PM',
          equipmentType: 'End Dump',
          driver: { name: 'John Smith', phone: '(512) 555-0198' },
          notes: 'Gate code: #4521. Contact foreman before arrival.',
          rateConSigned: true,
          rateConSignedDate: '2025-10-08',
          bolUploaded: true,
          podUploaded: false,
          customerPaid: false,
          createdAt: '2025-10-05T08:00:00Z',
          updatedAt: '2025-10-09T10:30:00Z',
          statusHistory: [
            {
              id: '1',
              status: 'DRAFT',
              timestamp: '2025-10-05T08:00:00Z',
              updatedBy: 'Customer',
              notes: 'Load created'
            },
            {
              id: '2',
              status: 'POSTED',
              timestamp: '2025-10-05T09:15:00Z',
              updatedBy: 'Customer',
              notes: 'Posted to Load Board'
            },
            {
              id: '3',
              status: 'ASSIGNED',
              timestamp: '2025-10-07T14:30:00Z',
              updatedBy: 'Customer',
              notes: 'Bid accepted from Superior One Logistics'
            },
            {
              id: '4',
              status: 'IN_TRANSIT',
              timestamp: '2025-10-09T08:15:00Z',
              updatedBy: 'Carrier',
              notes: 'Driver John Smith departed pickup location'
            }
          ],
          documents: [
            {
              id: 'doc-1',
              type: 'RATE_CON',
              fileName: 'Rate_Confirmation_LT-001-2025.pdf',
              fileUrl: '/documents/rate-con-001.pdf',
              uploadedBy: 'System',
              uploadedAt: '2025-10-08T09:00:00Z'
            },
            {
              id: 'doc-2',
              type: 'BOL',
              fileName: 'BOL_LT-001-2025.pdf',
              fileUrl: '/documents/bol-001.pdf',
              uploadedBy: 'John Smith',
              uploadedAt: '2025-10-09T08:30:00Z'
            }
          ],
          communications: [
            {
              id: 'comm-1',
              type: 'NOTE',
              message: 'Gate code updated to #4521. Please contact foreman Tom Martinez before arrival.',
              from: 'ABC Construction',
              timestamp: '2025-10-08T16:45:00Z',
              isRead: true
            },
            {
              id: 'comm-2',
              type: 'UPDATE',
              message: 'Driver John Smith has departed pickup location. ETA to delivery: 2:00 PM',
              from: 'Superior One Logistics',
              timestamp: '2025-10-09T08:15:00Z',
              isRead: false
            }
          ]
        })
      } else {
        // Production API call
        const response = await fetch(`/api/loads/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error('Failed to load load details')
        }

        const data = await response.json()
        setLoad(data.load)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load load details')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return theme.colors.textSecondary
      case 'POSTED': return theme.colors.info
      case 'ASSIGNED': return theme.colors.warning
      case 'ACCEPTED': return theme.colors.success
      case 'IN_TRANSIT': return theme.colors.primary
      case 'DELIVERED': return theme.colors.success
      case 'COMPLETED': return theme.colors.success
      case 'CANCELLED': return theme.colors.error
      case 'DISPUTED': return theme.colors.error
      default: return theme.colors.textSecondary
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DRAFT': return <Edit size={14} />
      case 'POSTED': return <Bell size={14} />
      case 'ASSIGNED': return <Truck size={14} />
      case 'ACCEPTED': return <CheckCircle size={14} />
      case 'IN_TRANSIT': return <Navigation size={14} />
      case 'DELIVERED': return <Package size={14} />
      case 'COMPLETED': return <CheckCircle size={14} />
      case 'CANCELLED': return <XCircle size={14} />
      case 'DISPUTED': return <AlertCircle size={14} />
      default: return <Package size={14} />
    }
  }

  const handleAddNote = async () => {
    if (!newNote.trim() || !load) return

    setIsAddingNote(true)
    try {
      // In production: API call to add communication
      const newCommunication: Communication = {
        id: `comm-${Date.now()}`,
        type: 'NOTE',
        message: newNote,
        from: user?.name || 'User',
        timestamp: new Date().toISOString(),
        isRead: false
      }

      setLoad(prev => prev ? {
        ...prev,
        communications: [newCommunication, ...prev.communications]
      } : null)

      setNewNote('')
      alert('✅ Note added successfully!')
    } catch (err) {
      alert('❌ Failed to add note')
    } finally {
      setIsAddingNote(false)
    }
  }

  const handleDocumentClick = (document: Document) => {
    setSelectedDocument(document)
    setShowDocumentModal(true)
  }

  if (loading) {
    return (
      <PageContainer title="Load Details" subtitle="Loading..." icon={Package}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px', flexDirection: 'column', gap: '16px' }}>
          <Loader size={48} style={{ animation: 'spin 1s linear infinite', color: theme.colors.primary }} />
          <p style={{ fontSize: '16px', color: theme.colors.textSecondary, fontWeight: '500' }}>Loading load details...</p>
        </div>
      </PageContainer>
    )
  }

  if (error || !load) {
    return (
      <PageContainer title="Load Details" subtitle="Error" icon={Package}>
        <Card padding="24px">
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <AlertCircle size={48} color={theme.colors.error} style={{ marginBottom: '16px' }} />
            <h3 style={{ color: theme.colors.textPrimary, marginBottom: '8px' }}>Load Not Found</h3>
            <p style={{ color: theme.colors.textSecondary, marginBottom: '24px' }}>{error || 'The requested load could not be found.'}</p>
            <button
              onClick={() => navigate(-1)}
              style={{
                padding: '12px 24px',
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
                margin: '0 auto'
              }}
            >
              <ArrowLeft size={16} />
              Go Back
            </button>
          </div>
        </Card>
      </PageContainer>
    )
  }

  return (
    <PageContainer
      title={`Load #${load.id.substring(0, 8)}`}
      subtitle={`${load.commodity} • ${load.origin.city} → ${load.destination.city}`}
      icon={Package}
      headerAction={
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: '12px 24px',
            background: 'transparent',
            color: theme.colors.textSecondary,
            border: `1px solid ${theme.colors.border}`,
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
            e.currentTarget.style.background = theme.colors.backgroundCardHover
            e.currentTarget.style.borderColor = theme.colors.primary
            e.currentTarget.style.color = theme.colors.primary
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.borderColor = theme.colors.border
            e.currentTarget.style.color = theme.colors.textSecondary
          }}
        >
          <ArrowLeft size={16} />
          Back
        </button>
      }
    >
      {/* Status Banner */}
      <Card padding="20px" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{
              padding: '8px 16px',
              background: `${getStatusColor(load.status)}20`,
              color: getStatusColor(load.status),
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {getStatusIcon(load.status)}
              {load.status.replace('_', ' ')}
            </span>
            <span style={{ fontSize: '14px', color: theme.colors.textSecondary }}>
              Updated {new Date(load.updatedAt).toLocaleDateString()}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '24px', fontWeight: 'bold', color: theme.colors.success }}>
              ${formatNumber(load.revenue)}
            </span>
            <span style={{ fontSize: '12px', color: theme.colors.textSecondary }}>
              {load.units} {load.rateMode.replace('PER_', '').toLowerCase()}
            </span>
          </div>
        </div>
      </Card>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: theme.colors.backgroundSecondary, padding: '4px', borderRadius: '12px', width: 'fit-content' }}>
        {[
          { id: 'overview', label: 'Overview', icon: Package },
          { id: 'documents', label: 'Documents', icon: FileText },
          { id: 'history', label: 'Status History', icon: Clock },
          { id: 'communications', label: 'Messages', icon: MessageSquare }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              padding: '12px 24px',
              background: activeTab === tab.id ? theme.colors.backgroundPrimary : 'transparent',
              color: activeTab === tab.id ? theme.colors.primary : theme.colors.textSecondary,
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {React.createElement(tab.icon, { size: 16 })}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gap: '24px' }}>
          {/* Load Information */}
          <Card padding="24px">
            <h3 style={{ color: theme.colors.textPrimary, fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Package size={20} />
              Load Information
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              <div>
                <label style={{ fontSize: '12px', color: theme.colors.textSecondary, textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.5px' }}>Commodity</label>
                <p style={{ fontSize: '16px', color: theme.colors.textPrimary, margin: '4px 0 0 0', fontWeight: '500' }}>{load.commodity}</p>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: theme.colors.textSecondary, textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.5px' }}>Equipment</label>
                <p style={{ fontSize: '16px', color: theme.colors.textPrimary, margin: '4px 0 0 0', fontWeight: '500' }}>{load.equipmentType}</p>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: theme.colors.textSecondary, textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.5px' }}>Rate Mode</label>
                <p style={{ fontSize: '16px', color: theme.colors.textPrimary, margin: '4px 0 0 0', fontWeight: '500' }}>{load.rateMode.replace('PER_', '').toLowerCase()}</p>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: theme.colors.textSecondary, textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.5px' }}>Distance</label>
                <p style={{ fontSize: '16px', color: theme.colors.textPrimary, margin: '4px 0 0 0', fontWeight: '500' }}>{load.miles} miles</p>
              </div>
            </div>
          </Card>

          {/* Route Information */}
          <Card padding="24px">
            <h3 style={{ color: theme.colors.textPrimary, fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <MapPin size={20} />
              Route Information
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '20px', alignItems: 'center' }}>
              <div>
                <label style={{ fontSize: '12px', color: theme.colors.textSecondary, textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.5px' }}>Pickup</label>
                <p style={{ fontSize: '16px', color: theme.colors.textPrimary, margin: '4px 0 0 0', fontWeight: '500' }}>{load.origin.siteName}</p>
                <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: '2px 0 0 0' }}>{load.origin.address}</p>
                <p style={{ fontSize: '12px', color: theme.colors.textTertiary, margin: '4px 0 0 0' }}>
                  {new Date(load.pickupDate).toLocaleDateString()} @ {load.pickupETA}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Navigation size={24} color={theme.colors.primary} style={{ transform: 'rotate(90deg)' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: theme.colors.textSecondary, textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.5px' }}>Delivery</label>
                <p style={{ fontSize: '16px', color: theme.colors.textPrimary, margin: '4px 0 0 0', fontWeight: '500' }}>{load.destination.siteName}</p>
                <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: '2px 0 0 0' }}>{load.destination.address}</p>
                <p style={{ fontSize: '12px', color: theme.colors.textTertiary, margin: '4px 0 0 0' }}>
                  {new Date(load.deliveryDate).toLocaleDateString()} @ {load.deliveryETA}
                </p>
              </div>
            </div>
          </Card>

          {/* Parties Information */}
          <Card padding="24px">
            <h3 style={{ color: theme.colors.textPrimary, fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <User size={20} />
              Parties
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
              <div>
                <label style={{ fontSize: '12px', color: theme.colors.textSecondary, textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.5px' }}>Customer</label>
                <p style={{ fontSize: '16px', color: theme.colors.textPrimary, margin: '4px 0 0 0', fontWeight: '500' }}>{load.customer.name}</p>
                <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: '2px 0 0 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Phone size={12} />
                  {load.customer.phone}
                </p>
              </div>
              {load.carrier && (
                <div>
                  <label style={{ fontSize: '12px', color: theme.colors.textSecondary, textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.5px' }}>Carrier</label>
                  <p style={{ fontSize: '16px', color: theme.colors.textPrimary, margin: '4px 0 0 0', fontWeight: '500' }}>{load.carrier.name}</p>
                  <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: '2px 0 0 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Phone size={12} />
                    {load.carrier.phone}
                  </p>
                </div>
              )}
              {load.driver && (
                <div>
                  <label style={{ fontSize: '12px', color: theme.colors.textSecondary, textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.5px' }}>Driver</label>
                  <p style={{ fontSize: '16px', color: theme.colors.textPrimary, margin: '4px 0 0 0', fontWeight: '500' }}>{load.driver.name}</p>
                  <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: '2px 0 0 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Phone size={12} />
                    {load.driver.phone}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Notes */}
          {load.notes && (
            <Card padding="24px">
              <h3 style={{ color: theme.colors.textPrimary, fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <MessageSquare size={20} />
                Notes
              </h3>
              <p style={{ fontSize: '14px', color: theme.colors.textSecondary, lineHeight: 1.6, margin: 0 }}>{load.notes}</p>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'documents' && (
        <Card padding="24px">
          <h3 style={{ color: theme.colors.textPrimary, fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText size={20} />
            Documents
          </h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            {load.documents.map(doc => (
              <div
                key={doc.id}
                onClick={() => handleDocumentClick(doc)}
                style={{
                  padding: '16px',
                  background: theme.colors.backgroundCard,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = theme.colors.backgroundCardHover
                  e.currentTarget.style.borderColor = theme.colors.primary
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = theme.colors.backgroundCard
                  e.currentTarget.style.borderColor = theme.colors.border
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <FileSignature size={20} color={theme.colors.primary} />
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, margin: '0 0 2px 0' }}>{doc.fileName}</p>
                    <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: 0 }}>
                      {doc.type.replace('_', ' ')} • Uploaded by {doc.uploadedBy} • {new Date(doc.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Eye size={16} color={theme.colors.textSecondary} />
              </div>
            ))}
            {load.documents.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: theme.colors.textSecondary }}>
                <FileText size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                <p>No documents uploaded yet</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {activeTab === 'history' && (
        <Card padding="24px">
          <h3 style={{ color: theme.colors.textPrimary, fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Clock size={20} />
            Status History
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {load.statusHistory.map((entry, index) => (
              <div key={entry.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '60px' }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: getStatusColor(entry.status),
                    marginBottom: '8px'
                  }} />
                  {index < load.statusHistory.length - 1 && (
                    <div style={{
                      width: '2px',
                      height: '40px',
                      background: theme.colors.border,
                      marginTop: '4px'
                    }} />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                    <span style={{
                      padding: '4px 8px',
                      background: `${getStatusColor(entry.status)}20`,
                      color: getStatusColor(entry.status),
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      {getStatusIcon(entry.status)}
                      {entry.status.replace('_', ' ')}
                    </span>
                    <span style={{ fontSize: '12px', color: theme.colors.textSecondary }}>
                      {new Date(entry.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p style={{ fontSize: '14px', color: theme.colors.textPrimary, margin: '0 0 4px 0' }}>
                    Updated by {entry.updatedBy}
                  </p>
                  {entry.notes && (
                    <p style={{ fontSize: '13px', color: theme.colors.textSecondary, margin: 0 }}>
                      {entry.notes}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'communications' && (
        <div style={{ display: 'grid', gap: '24px' }}>
          <Card padding="24px">
            <h3 style={{ color: theme.colors.textPrimary, fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <MessageSquare size={20} />
              Messages
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              {load.communications.map(comm => (
                <div
                  key={comm.id}
                  style={{
                    padding: '16px',
                    background: comm.isRead ? theme.colors.backgroundCard : `${theme.colors.primary}10`,
                    border: `1px solid ${comm.isRead ? theme.colors.border : theme.colors.primary}`,
                    borderRadius: '8px',
                    borderLeft: `4px solid ${comm.type === 'ALERT' ? theme.colors.error : comm.type === 'UPDATE' ? theme.colors.info : theme.colors.primary}`
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: theme.colors.textPrimary }}>
                      {comm.from}
                    </span>
                    <span style={{ fontSize: '12px', color: theme.colors.textSecondary }}>
                      {new Date(comm.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: 0, lineHeight: 1.5 }}>
                    {comm.message}
                  </p>
                </div>
              ))}
            </div>

            {/* Add Note */}
            <div style={{ borderTop: `1px solid ${theme.colors.border}`, paddingTop: '20px' }}>
              <h4 style={{ color: theme.colors.textPrimary, fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Add Note</h4>
              <div style={{ display: 'flex', gap: '12px' }}>
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a note or update..."
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: theme.colors.background,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: '8px',
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
                <button
                  onClick={handleAddNote}
                  disabled={!newNote.trim() || isAddingNote}
                  style={{
                    padding: '12px 24px',
                    background: newNote.trim() && !isAddingNote ? theme.colors.primary : theme.colors.backgroundTertiary,
                    color: newNote.trim() && !isAddingNote ? 'white' : theme.colors.textTertiary,
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: newNote.trim() && !isAddingNote ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  {isAddingNote ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <MessageSquare size={16} />}
                  {isAddingNote ? 'Adding...' : 'Add Note'}
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Document Modal */}
      {showDocumentModal && selectedDocument && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.90)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001, backdropFilter: 'blur(6px)', padding: '20px' }} onClick={() => setShowDocumentModal(false)}>
          <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '40px', maxWidth: '800px', width: '100%', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 25px 80px rgba(0, 0, 0, 0.5)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <FileSignature size={64} color={theme.colors.primary} style={{ marginBottom: '20px' }} />
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '12px', color: '#000' }}>{selectedDocument.fileName}</h2>
              <p style={{ fontSize: '16px', color: '#666', marginBottom: '8px' }}>{selectedDocument.type.replace('_', ' ')} Document</p>
              <p style={{ fontSize: '14px', color: '#666' }}>Uploaded by {selectedDocument.uploadedBy} on {new Date(selectedDocument.uploadedAt).toLocaleDateString()}</p>
              <div style={{ marginTop: '30px', padding: '20px', background: '#f0fdf4', borderRadius: '8px', border: '2px solid #22c55e' }}>
                <p style={{ fontSize: '14px', color: '#15803d', margin: 0 }}>
                  <strong>Document Available:</strong> This document is accessible and serves as legal proof for this load.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '24px' }}>
                <button
                  onClick={() => {/* In production: download document */}}
                  style={{ padding: '12px 24px', background: theme.colors.primary, color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Download size={16} />
                  Download
                </button>
                <button
                  onClick={() => setShowDocumentModal(false)}
                  style={{ padding: '12px 24px', background: '#6b7280', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  )
}

export default LoadDetailsPage
