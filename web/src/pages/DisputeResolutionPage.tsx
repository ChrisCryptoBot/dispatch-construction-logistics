import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext-fixed'
import PageContainer from '../components/shared/PageContainer'
import Card from '../components/ui/Card'
import {
  AlertTriangle, FileText, MessageSquare, Clock, User, Phone,
  CheckCircle, XCircle, Eye, Plus, Search, Filter, Calendar,
  DollarSign, Package, Truck, Building, Hash, Loader, Info,
  TrendingUp, Bell, ArrowRight, Scale, Shield, Gavel
} from 'lucide-react'

interface Dispute {
  id: string
  loadId: string
  type: 'PAYMENT' | 'DELIVERY' | 'DAMAGE' | 'SERVICE' | 'CONTRACT' | 'OTHER'
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  status: 'OPEN' | 'IN_REVIEW' | 'MEDIATION' | 'RESOLVED' | 'CLOSED'
  title: string
  description: string
  createdBy: { name: string; role: 'CUSTOMER' | 'CARRIER' | 'ADMIN' }
  assignedTo?: { name: string; role: string }
  load: {
    id: string
    commodity: string
    customer: { name: string }
    carrier: { name: string }
    revenue: number
    pickupDate: string
    deliveryDate: string
  }
  evidence: Evidence[]
  communications: Communication[]
  resolution?: {
    outcome: string
    resolution: string
    resolvedBy: string
    resolvedAt: string
    compensation?: number
  }
  createdAt: string
  updatedAt: string
  deadline: string
  priority: number
}

interface Evidence {
  id: string
  type: 'PHOTO' | 'DOCUMENT' | 'RECEIPT' | 'COMMUNICATION' | 'OTHER'
  fileName: string
  fileUrl: string
  description: string
  uploadedBy: string
  uploadedAt: string
}

interface Communication {
  id: string
  type: 'NOTE' | 'MESSAGE' | 'UPDATE' | 'RESOLUTION'
  message: string
  from: string
  timestamp: string
  isInternal: boolean
}

const DisputeResolutionPage = () => {
  const { theme } = useTheme()
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDisputeModal, setShowDisputeModal] = useState(false)
  const [newDispute, setNewDispute] = useState({
    type: 'PAYMENT' as Dispute['type'],
    severity: 'MEDIUM' as Dispute['severity'],
    title: '',
    description: '',
    loadId: ''
  })

  useEffect(() => {
    loadDisputes()
  }, [])

  const loadDisputes = async () => {
    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Please log in to view disputes')
        return
      }

      const isDevMode = token.startsWith('dev-')

      if (isDevMode) {
        console.log('🧪 Development mode - using mock dispute data')

        // Mock dispute data
        setDisputes([
          {
            id: 'dispute-001',
            loadId: 'load-001',
            type: 'PAYMENT',
            severity: 'HIGH',
            status: 'IN_REVIEW',
            title: 'Payment Dispute - Invoice #INV-001',
            description: 'Customer claims they were overcharged for accessorial fees. Disputing $150 in layover charges.',
            createdBy: { name: 'ABC Construction', role: 'CUSTOMER' },
            assignedTo: { name: 'Sarah Johnson', role: 'Dispute Resolution Specialist' },
            load: {
              id: 'load-001',
              commodity: 'Crushed Limestone',
              customer: { name: 'ABC Construction' },
              carrier: { name: 'Superior One Logistics' },
              revenue: 925,
              pickupDate: '2025-10-09',
              deliveryDate: '2025-10-09'
            },
            evidence: [
              {
                id: 'ev-1',
                type: 'DOCUMENT',
                fileName: 'Original_Invoice_INV-001.pdf',
                fileUrl: '/evidence/invoice-001.pdf',
                description: 'Original invoice showing disputed charges',
                uploadedBy: 'ABC Construction',
                uploadedAt: '2025-10-10T09:00:00Z'
              },
              {
                id: 'ev-2',
                type: 'PHOTO',
                fileName: 'delivery_photo_001.jpg',
                fileUrl: '/evidence/delivery-001.jpg',
                description: 'Photo showing on-time delivery',
                uploadedBy: 'Superior One Logistics',
                uploadedAt: '2025-10-10T10:30:00Z'
              }
            ],
            communications: [
              {
                id: 'comm-1',
                type: 'MESSAGE',
                message: 'We were charged $150 for layover time, but our records show the driver was only at the site for 2 hours, not the 4 hours billed.',
                from: 'ABC Construction',
                timestamp: '2025-10-10T09:00:00Z',
                isInternal: false
              },
              {
                id: 'comm-2',
                type: 'MESSAGE',
                message: 'Our driver was on-site for 4 hours as documented. The layover charge is correct per our rate confirmation.',
                from: 'Superior One Logistics',
                timestamp: '2025-10-10T10:30:00Z',
                isInternal: false
              }
            ],
            createdAt: '2025-10-10T09:00:00Z',
            updatedAt: '2025-10-10T14:30:00Z',
            deadline: '2025-10-17T09:00:00Z',
            priority: 8
          },
          {
            id: 'dispute-002',
            loadId: 'load-002',
            type: 'DELIVERY',
            severity: 'MEDIUM',
            status: 'MEDIATION',
            title: 'Late Delivery - Load #LD-002',
            description: 'Delivery was 3 hours late, causing project delays. Requesting compensation for additional costs.',
            createdBy: { name: 'XYZ Construction', role: 'CUSTOMER' },
            assignedTo: { name: 'Mike Chen', role: 'Mediation Specialist' },
            load: {
              id: 'load-002',
              commodity: 'Sand',
              customer: { name: 'XYZ Construction' },
              carrier: { name: 'Fast Haul Inc' },
              revenue: 480,
              pickupDate: '2025-10-08',
              deliveryDate: '2025-10-08'
            },
            evidence: [],
            communications: [
              {
                id: 'comm-3',
                type: 'MESSAGE',
                message: 'The late delivery caused us to reschedule our concrete pour, resulting in $500 in additional costs.',
                from: 'XYZ Construction',
                timestamp: '2025-10-09T08:00:00Z',
                isInternal: false
              }
            ],
            createdAt: '2025-10-09T08:00:00Z',
            updatedAt: '2025-10-09T15:30:00Z',
            deadline: '2025-10-16T08:00:00Z',
            priority: 6
          },
          {
            id: 'dispute-003',
            loadId: 'load-003',
            type: 'DAMAGE',
            severity: 'CRITICAL',
            status: 'RESOLVED',
            title: 'Equipment Damage - Load #LD-003',
            description: 'Customer equipment was damaged during loading. Insurance claim filed.',
            createdBy: { name: 'Superior One Logistics', role: 'CARRIER' },
            assignedTo: { name: 'Lisa Martinez', role: 'Claims Specialist' },
            load: {
              id: 'load-003',
              commodity: 'Gravel',
              customer: { name: 'DEF Construction' },
              carrier: { name: 'Superior One Logistics' },
              revenue: 1250,
              pickupDate: '2025-10-07',
              deliveryDate: '2025-10-07'
            },
            evidence: [
              {
                id: 'ev-3',
                type: 'PHOTO',
                fileName: 'damage_photo_001.jpg',
                fileUrl: '/evidence/damage-001.jpg',
                description: 'Photo of damaged equipment',
                uploadedBy: 'Superior One Logistics',
                uploadedAt: '2025-10-07T16:00:00Z'
              }
            ],
            communications: [
              {
                id: 'comm-4',
                type: 'RESOLUTION',
                message: 'Dispute resolved. Insurance claim approved for $2,500. Equipment replacement completed.',
                from: 'Lisa Martinez',
                timestamp: '2025-10-08T10:00:00Z',
                isInternal: true
              }
            ],
            resolution: {
              outcome: 'RESOLVED',
              resolution: 'Insurance claim approved for $2,500. Equipment replacement completed.',
              resolvedBy: 'Lisa Martinez',
              resolvedAt: '2025-10-08T10:00:00Z',
              compensation: 2500
            },
            createdAt: '2025-10-07T16:00:00Z',
            updatedAt: '2025-10-08T10:00:00Z',
            deadline: '2025-10-14T16:00:00Z',
            priority: 10
          }
        ])
      } else {
        // Production API call
        const response = await fetch('/api/disputes', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error('Failed to load disputes')
        }

        const data = await response.json()
        setDisputes(data.disputes)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load disputes')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateDispute = async () => {
    if (!newDispute.title.trim() || !newDispute.description.trim()) {
      alert('Please fill in all required fields')
      return
    }

    try {
      // In production: API call to create dispute
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      
      const dispute: Dispute = {
        id: `dispute-${Date.now()}`,
        loadId: newDispute.loadId,
        type: newDispute.type,
        severity: newDispute.severity,
        status: 'OPEN',
        title: newDispute.title,
        description: newDispute.description,
        createdBy: { name: user?.name || 'User', role: 'CUSTOMER' },
        load: {
          id: newDispute.loadId,
          commodity: 'Unknown',
          customer: { name: user?.name || 'User' },
          carrier: { name: 'Unknown Carrier' },
          revenue: 0,
          pickupDate: new Date().toISOString().split('T')[0],
          deliveryDate: new Date().toISOString().split('T')[0]
        },
        evidence: [],
        communications: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        priority: newDispute.severity === 'CRITICAL' ? 10 : newDispute.severity === 'HIGH' ? 8 : 5
      }

      setDisputes(prev => [dispute, ...prev])
      setShowCreateModal(false)
      setNewDispute({
        type: 'PAYMENT',
        severity: 'MEDIUM',
        title: '',
        description: '',
        loadId: ''
      })
      alert('✅ Dispute created successfully! It has been assigned to our dispute resolution team.')
    } catch (err) {
      alert('❌ Failed to create dispute')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return theme.colors.info
      case 'IN_REVIEW': return theme.colors.warning
      case 'MEDIATION': return theme.colors.primary
      case 'RESOLVED': return theme.colors.success
      case 'CLOSED': return theme.colors.textSecondary
      default: return theme.colors.textSecondary
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'LOW': return theme.colors.info
      case 'MEDIUM': return theme.colors.warning
      case 'HIGH': return theme.colors.error
      case 'CRITICAL': return theme.colors.error
      default: return theme.colors.textSecondary
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'PAYMENT': return DollarSign
      case 'DELIVERY': return Truck
      case 'DAMAGE': return AlertTriangle
      case 'SERVICE': return Package
      case 'CONTRACT': return FileText
      default: return MessageSquare
    }
  }

  const filteredDisputes = disputes.filter(dispute => {
    const matchesSearch = searchTerm === '' ||
      dispute.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispute.loadId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispute.load.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispute.load.carrier.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || dispute.status === filterStatus
    const matchesType = filterType === 'all' || dispute.type === filterType
    
    return matchesSearch && matchesStatus && matchesType
  })

  if (loading) {
    return (
      <PageContainer title="Dispute Resolution" subtitle="Loading..." icon={AlertTriangle}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px', flexDirection: 'column', gap: '16px' }}>
          <Loader size={48} style={{ animation: 'spin 1s linear infinite', color: theme.colors.primary }} />
          <p style={{ fontSize: '16px', color: theme.colors.textSecondary, fontWeight: '500' }}>Loading disputes...</p>
        </div>
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer title="Dispute Resolution" subtitle="Error" icon={AlertTriangle}>
        <Card padding="24px">
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <AlertTriangle size={48} color={theme.colors.error} style={{ marginBottom: '16px' }} />
            <h3 style={{ color: theme.colors.textPrimary, marginBottom: '8px' }}>Error Loading Disputes</h3>
            <p style={{ color: theme.colors.textSecondary, marginBottom: '24px' }}>{error}</p>
            <button
              onClick={() => loadDisputes()}
              style={{
                padding: '12px 24px',
                background: theme.colors.primary,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Try Again
            </button>
          </div>
        </Card>
      </PageContainer>
    )
  }

  return (
    <PageContainer
      title="Dispute Resolution"
      subtitle="Manage and resolve load disputes"
      icon={AlertTriangle}
      headerAction={
        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            padding: '14px 28px',
            background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primary} 100%)`,
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
        >
          <Plus size={20} />
          Create Dispute
        </button>
      }
    >
      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {[
          { label: 'Total Disputes', value: disputes.length, icon: AlertTriangle, color: theme.colors.info },
          { label: 'Open', value: disputes.filter(d => d.status === 'OPEN').length, icon: Clock, color: theme.colors.warning },
          { label: 'In Review', value: disputes.filter(d => d.status === 'IN_REVIEW').length, icon: Eye, color: theme.colors.primary },
          { label: 'Resolved', value: disputes.filter(d => d.status === 'RESOLVED').length, icon: CheckCircle, color: theme.colors.success }
        ].map(stat => (
          <Card key={stat.label} padding="20px">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: `${stat.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {React.createElement(stat.icon, { size: 24, color: stat.color })}
              </div>
              <div>
                <p style={{ fontSize: '28px', fontWeight: 'bold', color: theme.colors.textPrimary, margin: 0, lineHeight: 1 }}>{stat.value}</p>
                <p style={{ fontSize: '13px', color: theme.colors.textSecondary, margin: '4px 0 0 0' }}>{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Search and Filters */}
      <Card padding="24px" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '300px' }}>
            <div style={{ position: 'relative' }}>
              <Search 
                size={20} 
                style={{ 
                  position: 'absolute', 
                  left: '12px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: theme.colors.textSecondary 
                }} 
              />
              <input
                type="text"
                placeholder="Search disputes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 44px',
                  background: theme.colors.background,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: '12px',
                  color: theme.colors.textPrimary,
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = theme.colors.primary
                  e.target.style.background = theme.colors.backgroundCardHover
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = theme.colors.border
                  e.target.style.background = theme.colors.background
                }}
              />
            </div>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              padding: '12px 16px',
              background: theme.colors.backgroundCard,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: '8px',
              color: theme.colors.textPrimary,
              fontSize: '14px',
              cursor: 'pointer',
              outline: 'none',
              minWidth: '150px',
              transition: 'all 0.2s ease'
            }}
          >
            <option value="all" style={{ background: theme.colors.backgroundCard, color: theme.colors.textPrimary }}>All Status</option>
            <option value="OPEN" style={{ background: theme.colors.backgroundCard, color: theme.colors.textPrimary }}>Open</option>
            <option value="IN_REVIEW" style={{ background: theme.colors.backgroundCard, color: theme.colors.textPrimary }}>In Review</option>
            <option value="MEDIATION" style={{ background: theme.colors.backgroundCard, color: theme.colors.textPrimary }}>Mediation</option>
            <option value="RESOLVED" style={{ background: theme.colors.backgroundCard, color: theme.colors.textPrimary }}>Resolved</option>
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{
              padding: '12px 16px',
              background: theme.colors.backgroundCard,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: '8px',
              color: theme.colors.textPrimary,
              fontSize: '14px',
              cursor: 'pointer',
              outline: 'none',
              minWidth: '150px',
              transition: 'all 0.2s ease'
            }}
          >
            <option value="all" style={{ background: theme.colors.backgroundCard, color: theme.colors.textPrimary }}>All Types</option>
            <option value="PAYMENT" style={{ background: theme.colors.backgroundCard, color: theme.colors.textPrimary }}>Payment</option>
            <option value="DELIVERY" style={{ background: theme.colors.backgroundCard, color: theme.colors.textPrimary }}>Delivery</option>
            <option value="DAMAGE" style={{ background: theme.colors.backgroundCard, color: theme.colors.textPrimary }}>Damage</option>
            <option value="SERVICE" style={{ background: theme.colors.backgroundCard, color: theme.colors.textPrimary }}>Service</option>
          </select>
        </div>
      </Card>

      {/* Disputes List */}
      <Card padding="0">
        {filteredDisputes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px' }}>
            <AlertTriangle size={64} style={{ color: theme.colors.textTertiary, marginBottom: '20px' }} />
            <h3 style={{ color: theme.colors.textPrimary, marginBottom: '8px' }}>No Disputes Found</h3>
            <p style={{ color: theme.colors.textSecondary, marginBottom: '24px' }}>
              {searchTerm ? 'No disputes match your search criteria.' : 'You haven\'t created any disputes yet.'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowCreateModal(true)}
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
                <Plus size={16} />
                Create Your First Dispute
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filteredDisputes.map((dispute, index) => (
              <div
                key={dispute.id}
                style={{
                  padding: '24px',
                  borderBottom: index < filteredDisputes.length - 1 ? `1px solid ${theme.colors.border}` : 'none',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = theme.colors.backgroundCardHover}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '18px', fontWeight: '700', color: theme.colors.textPrimary }}>
                        {dispute.title}
                      </span>
                      <span style={{
                        padding: '4px 8px',
                        background: `${getStatusColor(dispute.status)}20`,
                        color: getStatusColor(dispute.status),
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {dispute.status.replace('_', ' ')}
                      </span>
                      <span style={{
                        padding: '4px 8px',
                        background: `${getSeverityColor(dispute.severity)}20`,
                        color: getSeverityColor(dispute.severity),
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {dispute.severity}
                      </span>
                    </div>
                    <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: '0 0 8px 0' }}>
                      Load: {dispute.loadId} • {dispute.load.customer.name} vs {dispute.load.carrier.name}
                    </p>
                    <p style={{ fontSize: '13px', color: theme.colors.textTertiary, margin: 0 }}>
                      Created {new Date(dispute.createdAt).toLocaleDateString()} • Updated {new Date(dispute.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      {React.createElement(getTypeIcon(dispute.type), { size: 16, color: theme.colors.textSecondary })}
                      <span style={{ fontSize: '12px', color: theme.colors.textSecondary }}>
                        {dispute.type}
                      </span>
                    </div>
                    {dispute.assignedTo && (
                      <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: 0 }}>
                        Assigned to {dispute.assignedTo.name}
                      </p>
                    )}
                  </div>
                </div>

                <p style={{ fontSize: '14px', color: theme.colors.textSecondary, marginBottom: '16px', lineHeight: 1.5 }}>
                  {dispute.description}
                </p>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => {
                      setSelectedDispute(dispute)
                      setShowDisputeModal(true)
                    }}
                    style={{
                      padding: '10px 16px',
                      background: 'transparent',
                      color: theme.colors.primary,
                      border: `1px solid ${theme.colors.primary}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = theme.colors.primary
                      e.currentTarget.style.color = 'white'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color = theme.colors.primary
                    }}
                  >
                    <Eye size={16} />
                    View Details
                  </button>

                  {dispute.status === 'OPEN' && (
                    <button
                      onClick={() => {
                        setDisputes(prev => prev.map(d => 
                          d.id === dispute.id 
                            ? { ...d, status: 'IN_REVIEW' as const, updatedAt: new Date().toISOString() }
                            : d
                        ))
                        alert('✅ Dispute moved to In Review status')
                      }}
                      style={{
                        padding: '10px 16px',
                        background: 'transparent',
                        color: theme.colors.warning,
                        border: `1px solid ${theme.colors.warning}`,
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = theme.colors.warning
                        e.currentTarget.style.color = 'white'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                        e.currentTarget.style.color = theme.colors.warning
                      }}
                    >
                      <Eye size={16} />
                      Start Review
                    </button>
                  )}

                  {dispute.status === 'IN_REVIEW' && (
                    <button
                      onClick={() => {
                        setDisputes(prev => prev.map(d => 
                          d.id === dispute.id 
                            ? { ...d, status: 'RESOLVED' as const, updatedAt: new Date().toISOString() }
                            : d
                        ))
                        alert('✅ Dispute marked as resolved')
                      }}
                      style={{
                        padding: '10px 16px',
                        background: 'transparent',
                        color: theme.colors.success,
                        border: `1px solid ${theme.colors.success}`,
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = theme.colors.success
                        e.currentTarget.style.color = 'white'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                        e.currentTarget.style.color = theme.colors.success
                      }}
                    >
                      <CheckCircle size={16} />
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Create Dispute Modal */}
      {showCreateModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)', padding: '20px' }} onClick={() => setShowCreateModal(false)}>
          <div style={{ background: theme.colors.backgroundCard, borderRadius: '20px', padding: '36px', maxWidth: '600px', width: '100%', border: `1px solid ${theme.colors.border}`, boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <AlertTriangle size={48} color={theme.colors.primary} style={{ marginBottom: '16px' }} />
              <h2 style={{ color: theme.colors.textPrimary, fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>Create New Dispute</h2>
              <p style={{ color: theme.colors.textSecondary, fontSize: '14px', lineHeight: 1.5 }}>
                Please provide details about the dispute. Our team will review and respond within 24 hours.
              </p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                  Load ID *
                </label>
                <input
                  type="text"
                  value={newDispute.loadId}
                  onChange={(e) => setNewDispute(prev => ({ ...prev, loadId: e.target.value }))}
                  placeholder="Enter the load ID for this dispute"
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: theme.colors.background,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: '8px',
                    color: theme.colors.textPrimary,
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.2s ease'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                    Dispute Type *
                  </label>
                  <select
                    value={newDispute.type}
                    onChange={(e) => setNewDispute(prev => ({ ...prev, type: e.target.value as Dispute['type'] }))}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: theme.colors.background,
                      border: `1px solid ${theme.colors.border}`,
                      borderRadius: '8px',
                      color: theme.colors.textPrimary,
                      fontSize: '14px',
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                  >
                    <option value="PAYMENT">Payment Dispute</option>
                    <option value="DELIVERY">Delivery Issue</option>
                    <option value="DAMAGE">Damage Claim</option>
                    <option value="SERVICE">Service Quality</option>
                    <option value="CONTRACT">Contract Dispute</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                    Severity *
                  </label>
                  <select
                    value={newDispute.severity}
                    onChange={(e) => setNewDispute(prev => ({ ...prev, severity: e.target.value as Dispute['severity'] }))}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: theme.colors.background,
                      border: `1px solid ${theme.colors.border}`,
                      borderRadius: '8px',
                      color: theme.colors.textPrimary,
                      fontSize: '14px',
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                  Title *
                </label>
                <input
                  type="text"
                  value={newDispute.title}
                  onChange={(e) => setNewDispute(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Brief title for this dispute"
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: theme.colors.background,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: '8px',
                    color: theme.colors.textPrimary,
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.2s ease'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                  Description *
                </label>
                <textarea
                  value={newDispute.description}
                  onChange={(e) => setNewDispute(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Please provide detailed information about the dispute..."
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: theme.colors.background,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: '8px',
                    color: theme.colors.textPrimary,
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{
                  padding: '12px 24px',
                  background: theme.colors.backgroundTertiary,
                  color: theme.colors.textSecondary,
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = theme.colors.backgroundCardHover}
                onMouseLeave={(e) => e.currentTarget.style.background = theme.colors.backgroundTertiary}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateDispute}
                style={{
                  padding: '12px 24px',
                  background: theme.colors.primary,
                  color: 'white',
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
                onMouseEnter={(e) => e.currentTarget.style.background = '#059669'}
                onMouseLeave={(e) => e.currentTarget.style.background = theme.colors.primary}
              >
                <Plus size={16} />
                Create Dispute
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  )
}

export default DisputeResolutionPage


