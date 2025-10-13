import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext-fixed'
import PageContainer from '../components/shared/PageContainer'
import Card from '../components/ui/Card'
import { formatNumber, formatCurrency, formatCompactCurrency, formatPercentage } from '../utils/formatters';

import {
  Package, Edit, Trash2, Eye, Plus, Clock, MapPin, DollarSign,
  AlertCircle, CheckCircle, Loader, Search, Filter, Calendar,
  Truck, Building, Hash, FileText, ArrowRight, TrendingUp
} from 'lucide-react'

interface DraftLoad {
  id: string
  commodity: string
  status: 'DRAFT'
  units: number
  rateMode: string
  revenue: number
  origin: { siteName: string; address: string; city: string }
  destination: { siteName: string; address: string; city: string }
  miles: number
  pickupDate: string
  deliveryDate: string
  equipmentType: string
  createdAt: string
  updatedAt: string
  completionPercentage: number
  missingFields: string[]
}

const DraftLoadsPage = () => {
  const { theme } = useTheme()
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [draftLoads, setDraftLoads] = useState<DraftLoad[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedLoad, setSelectedLoad] = useState<DraftLoad | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    loadDraftLoads()
  }, [])

  const loadDraftLoads = async () => {
    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Please log in to view draft loads')
        return
      }

      const isDevMode = token.startsWith('dev-')

      if (isDevMode) {
        console.log('🧪 Development mode - using mock draft loads data')

        // Mock draft loads data
        setDraftLoads([
          {
            id: 'draft-001',
            commodity: 'Crushed Limestone',
            status: 'DRAFT',
            units: 18.5,
            rateMode: 'PER_TON',
            revenue: 925,
            origin: { siteName: 'Main Quarry', address: '1234 Rock Rd, Austin, TX', city: 'Austin' },
            destination: { siteName: 'Downtown Project', address: '789 Congress Ave, Austin, TX', city: 'Austin' },
            miles: 12.3,
            pickupDate: '2025-10-15',
            deliveryDate: '2025-10-15',
            equipmentType: 'End Dump',
            createdAt: '2025-10-05T08:00:00Z',
            updatedAt: '2025-10-09T10:30:00Z',
            completionPercentage: 85,
            missingFields: ['Special Instructions', 'Job Code']
          },
          {
            id: 'draft-002',
            commodity: 'Sand',
            status: 'DRAFT',
            units: 12.0,
            rateMode: 'PER_YARD',
            revenue: 480,
            origin: { siteName: 'Sand Pit', address: '456 Sand Rd, Round Rock, TX', city: 'Round Rock' },
            destination: { siteName: 'Construction Site', address: '321 Build St, Austin, TX', city: 'Austin' },
            miles: 8.7,
            pickupDate: '2025-10-16',
            deliveryDate: '2025-10-16',
            equipmentType: 'End Dump',
            createdAt: '2025-10-06T14:20:00Z',
            updatedAt: '2025-10-08T16:45:00Z',
            completionPercentage: 60,
            missingFields: ['Pickup Contact', 'Delivery Contact', 'Special Instructions', 'Job Code', 'Site Name']
          },
          {
            id: 'draft-003',
            commodity: 'Gravel',
            status: 'DRAFT',
            units: 25.0,
            rateMode: 'PER_TON',
            revenue: 1250,
            origin: { siteName: 'Gravel Yard', address: '789 Stone Ave, Cedar Park, TX', city: 'Cedar Park' },
            destination: { siteName: 'Highway Project', address: 'Highway 183, Austin, TX', city: 'Austin' },
            miles: 15.2,
            pickupDate: '2025-10-17',
            deliveryDate: '2025-10-17',
            equipmentType: 'End Dump',
            createdAt: '2025-10-07T11:30:00Z',
            updatedAt: '2025-10-09T09:15:00Z',
            completionPercentage: 95,
            missingFields: []
          }
        ])
      } else {
        // Production API call
        const response = await fetch('/api/loads/drafts', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error('Failed to load draft loads')
        }

        const data = await response.json()
        setDraftLoads(data.loads)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load draft loads')
    } finally {
      setLoading(false)
    }
  }

  const handlePublishLoad = async (loadId: string) => {
    setIsPublishing(true)
    try {
      // In production: API call to publish load
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      
      setDraftLoads(prev => prev.filter(load => load.id !== loadId))
      setSuccessMessage('Load published successfully! It is now live on the Load Board.')
      setShowSuccessModal(true)
      setTimeout(() => setShowSuccessModal(false), 3000)
    } catch (err) {
      setError('Failed to publish load. Please try again.')
      setTimeout(() => setError(null), 5000)
    } finally {
      setIsPublishing(false)
    }
  }

  const handleDeleteLoad = async (loadId: string) => {
    try {
      // In production: API call to delete load
      await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API call
      
      setDraftLoads(prev => prev.filter(load => load.id !== loadId))
      setShowDeleteModal(false)
      setSelectedLoad(null)
      setSuccessMessage('Draft load deleted successfully!')
      setShowSuccessModal(true)
      setTimeout(() => setShowSuccessModal(false), 2000)
    } catch (err) {
      setError('Failed to delete load. Please try again.')
      setTimeout(() => setError(null), 5000)
    }
  }

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 90) return theme.colors.success
    if (percentage >= 70) return theme.colors.warning
    return theme.colors.error
  }

  const filteredLoads = draftLoads.filter(load => {
    const matchesSearch = searchTerm === '' ||
      load.commodity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      load.origin.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      load.destination.city.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSearch
  })

  if (loading) {
    return (
      <PageContainer title="Draft Loads" subtitle="Loading..." icon={Package}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px', flexDirection: 'column', gap: '16px' }}>
          <Loader size={48} style={{ animation: 'spin 1s linear infinite', color: theme.colors.primary }} />
          <p style={{ fontSize: '16px', color: theme.colors.textSecondary, fontWeight: '500' }}>Loading draft loads...</p>
        </div>
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer title="Draft Loads" subtitle="Error" icon={Package}>
        <Card padding="24px">
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <AlertCircle size={48} color={theme.colors.error} style={{ marginBottom: '16px' }} />
            <h3 style={{ color: theme.colors.textPrimary, marginBottom: '8px' }}>Error Loading Draft Loads</h3>
            <p style={{ color: theme.colors.textSecondary, marginBottom: '24px' }}>{error}</p>
            <button
              onClick={() => loadDraftLoads()}
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
      title="Draft Loads"
      subtitle="Manage your draft load postings"
      icon={Package}
      headerAction={
        <button
          onClick={() => navigate('/customer/post-load')}
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
          Create New Load
        </button>
      }
    >
      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {[
          { label: 'Total Drafts', value: draftLoads.length, icon: FileText, color: theme.colors.info },
          { label: 'Ready to Publish', value: draftLoads.filter(l => l.completionPercentage >= 90).length, icon: CheckCircle, color: theme.colors.success },
          { label: 'Needs Completion', value: draftLoads.filter(l => l.completionPercentage < 90).length, icon: AlertCircle, color: theme.colors.warning },
          { label: 'Avg. Completion', value: `${Math.round(draftLoads.reduce((sum, l) => sum + l.completionPercentage, 0) / draftLoads.length || 0)}%`, icon: TrendingUp, color: theme.colors.primary }
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
                placeholder="Search draft loads..."
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
        </div>
      </Card>

      {/* Draft Loads List */}
      <Card padding="0">
        {filteredLoads.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px' }}>
            <Package size={64} style={{ color: theme.colors.textTertiary, marginBottom: '20px' }} />
            <h3 style={{ color: theme.colors.textPrimary, marginBottom: '8px' }}>No Draft Loads</h3>
            <p style={{ color: theme.colors.textSecondary, marginBottom: '24px' }}>
              {searchTerm ? 'No draft loads match your search.' : 'You haven\'t created any draft loads yet.'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => navigate('/customer/post-load')}
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
                Create Your First Load
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filteredLoads.map((load, index) => (
              <div
                key={load.id}
                style={{
                  padding: '24px',
                  borderBottom: index < filteredLoads.length - 1 ? `1px solid ${theme.colors.border}` : 'none',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = theme.colors.backgroundCardHover}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '18px', fontWeight: '700', color: theme.colors.textPrimary }}>
                        {load.commodity}
                      </span>
                      <span style={{
                        padding: '4px 8px',
                        background: `${theme.colors.info}20`,
                        color: theme.colors.info,
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        DRAFT
                      </span>
                    </div>
                    <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: '0 0 8px 0' }}>
                      {load.origin.city} → {load.destination.city} • {load.miles} miles • ${formatNumber(load.revenue)}
                    </p>
                    <p style={{ fontSize: '13px', color: theme.colors.textTertiary, margin: 0 }}>
                      Created {new Date(load.createdAt).toLocaleDateString()} • Updated {new Date(load.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', color: theme.colors.textSecondary }}>Completion:</span>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: getCompletionColor(load.completionPercentage) }}>
                        {load.completionPercentage}%
                      </span>
                    </div>
                    <div style={{ width: '100px', height: '4px', background: theme.colors.backgroundTertiary, borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${load.completionPercentage}%`,
                        height: '100%',
                        background: getCompletionColor(load.completionPercentage),
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  </div>
                </div>

                {/* Missing Fields */}
                {load.missingFields.length > 0 && (
                  <div style={{ marginBottom: '16px' }}>
                    <p style={{ fontSize: '12px', color: theme.colors.textSecondary, marginBottom: '6px' }}>Missing fields:</p>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {load.missingFields.map(field => (
                        <span key={field} style={{
                          padding: '3px 8px',
                          background: `${theme.colors.warning}20`,
                          color: theme.colors.warning,
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '500'
                        }}>
                          {field}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => navigate(`/loads/${load.id}/edit`)}
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
                    <Edit size={16} />
                    Edit
                  </button>

                  <button
                    onClick={() => navigate(`/loads/${load.id}`)}
                    style={{
                      padding: '10px 16px',
                      background: 'transparent',
                      color: theme.colors.textSecondary,
                      border: `1px solid ${theme.colors.border}`,
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
                    <Eye size={16} />
                    Preview
                  </button>

                  {load.completionPercentage >= 90 ? (
                    <button
                      onClick={() => handlePublishLoad(load.id)}
                      disabled={isPublishing}
                      style={{
                        padding: '10px 20px',
                        background: isPublishing ? theme.colors.backgroundTertiary : `linear-gradient(135deg, ${theme.colors.success} 0%, #059669 100%)`,
                        color: isPublishing ? theme.colors.textTertiary : 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: isPublishing ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: isPublishing ? 'none' : `0 4px 12px ${theme.colors.success}40`
                      }}
                    >
                      {isPublishing ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <ArrowRight size={16} />}
                      {isPublishing ? 'Publishing...' : 'Publish to Load Board'}
                    </button>
                  ) : (
                    <button
                      disabled
                      style={{
                        padding: '10px 20px',
                        background: theme.colors.backgroundTertiary,
                        color: theme.colors.textTertiary,
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <AlertCircle size={16} />
                      Complete Required Fields
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setSelectedLoad(load)
                      setShowDeleteModal(true)
                    }}
                    style={{
                      padding: '10px 16px',
                      background: 'transparent',
                      color: theme.colors.error,
                      border: `1px solid ${theme.colors.error}`,
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
                      e.currentTarget.style.background = `${theme.colors.error}20`
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedLoad && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)', padding: '20px' }} onClick={() => setShowDeleteModal(false)}>
          <div style={{ background: theme.colors.backgroundCard, borderRadius: '20px', padding: '36px', maxWidth: '500px', width: '100%', border: `1px solid ${theme.colors.border}`, boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <AlertCircle size={48} color={theme.colors.error} style={{ marginBottom: '16px' }} />
              <h2 style={{ color: theme.colors.textPrimary, fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>Delete Draft Load</h2>
              <p style={{ color: theme.colors.textSecondary, fontSize: '14px', lineHeight: 1.5 }}>
                Are you sure you want to delete this draft load?<br />
                <strong>{selectedLoad.commodity}</strong> • {selectedLoad.origin.city} → {selectedLoad.destination.city}
              </p>
              <p style={{ color: theme.colors.error, fontSize: '13px', marginTop: '12px', fontWeight: '600' }}>
                This action cannot be undone.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => setShowDeleteModal(false)}
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
                onClick={() => handleDeleteLoad(selectedLoad.id)}
                style={{
                  padding: '12px 24px',
                  background: theme.colors.error,
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
                onMouseEnter={(e) => e.currentTarget.style.background = '#dc2626'}
                onMouseLeave={(e) => e.currentTarget.style.background = theme.colors.error}
              >
                <Trash2 size={16} />
                Delete Draft
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: theme.colors.backgroundCard,
            borderRadius: '16px',
            padding: '40px',
            maxWidth: '400px',
            width: '90%',
            textAlign: 'center',
            boxShadow: `0 20px 60px ${theme.colors.success}40`
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: `${theme.colors.success}20`,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px'
            }}>
              <CheckCircle size={48} color={theme.colors.success} />
            </div>
            
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: theme.colors.textPrimary, marginBottom: '12px' }}>
              Success!
            </h2>
            
            <p style={{ 
              fontSize: '15px', 
              color: theme.colors.textSecondary, 
              lineHeight: '1.5',
              marginBottom: 0
            }}>
              {successMessage}
            </p>
          </div>
        </div>
      )}
    </PageContainer>
  )
}

export default DraftLoadsPage
