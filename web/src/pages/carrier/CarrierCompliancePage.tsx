import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from '../../contexts/ThemeContext'
import PageContainer from '../../components/shared/PageContainer'
import Card from '../../components/ui/Card'
import { Shield, AlertTriangle, CheckCircle, Clock, XCircle, Eye, FileText, Truck, Users, Calendar, AlertCircle, TrendingUp, RefreshCw, Search } from 'lucide-react'

interface ComplianceItem {
  id: string
  type: 'license' | 'insurance' | 'inspection' | 'permit' | 'hos' | 'dot' | 'training'
  title: string
  entity: string
  entityType: 'driver' | 'vehicle' | 'company'
  status: 'compliant' | 'expiring_soon' | 'expired' | 'missing' | 'pending'
  expiryDate?: string
  issueDate?: string
  lastCheck?: string
  details?: string
  violations?: number
}

const CompliancePage = () => {
  const { theme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  
  // Get vehicle filter from URL params
  const [vehicleFilter, setVehicleFilter] = useState<string | null>(null)
  
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search)
    const vehicleId = urlParams.get('vehicle')
    setVehicleFilter(vehicleId)
  }, [location.search])
  
  // Smart navigation to fleet management
  const navigateToFleet = (vehicleId?: string) => {
    if (vehicleId) {
      navigate(`/fleet?highlight=${vehicleId}`)
    } else {
      navigate('/fleet')
    }
  }
  
  const [items, setItems] = useState<ComplianceItem[]>([
    {
      id: '1',
      type: 'license',
      title: 'Commercial Driver License',
      entity: 'John Smith',
      entityType: 'driver',
      status: 'compliant',
      expiryDate: '2026-06-15',
      issueDate: '2022-06-15',
      lastCheck: '2025-01-05'
    },
    {
      id: '2',
      type: 'insurance',
      title: 'General Liability Insurance',
      entity: 'Superior One Logistics',
      entityType: 'company',
      status: 'expiring_soon',
      expiryDate: '2025-02-28',
      issueDate: '2024-03-01',
      lastCheck: '2025-01-07'
    },
    {
      id: '4',
      type: 'permit',
      title: 'Motor Carrier Authority',
      entity: 'Superior One Logistics',
      entityType: 'company',
      status: 'compliant',
      expiryDate: '2025-06-30',
      issueDate: '2024-12-15',
      lastCheck: '2025-01-07'
    },
    {
      id: '5',
      type: 'hos',
      title: 'Hours of Service Compliance',
      entity: 'Sarah Johnson',
      entityType: 'driver',
      status: 'compliant',
      lastCheck: '2025-01-07',
      details: '8.5 hours driven today, 2.5 hours remaining'
    },
    {
      id: '6',
      type: 'training',
      title: 'Hazmat Certification',
      entity: 'Mike Rodriguez',
      entityType: 'driver',
      status: 'missing',
      details: 'Required for hazmat loads'
    },
    {
      id: '7',
      type: 'dot',
      title: 'DOT Medical Card',
      entity: 'David Chen',
      entityType: 'driver',
      status: 'expiring_soon',
      expiryDate: '2025-02-15',
      issueDate: '2023-02-15',
      lastCheck: '2025-01-05'
    },
    {
      id: '8',
      type: 'training',
      title: 'Safety Training Program',
      entity: 'Superior One Logistics',
      entityType: 'company',
      status: 'compliant',
      expiryDate: '2025-08-15',
      issueDate: '2024-08-15',
      lastCheck: '2025-01-07'
    },
    {
      id: '9',
      type: 'insurance',
      title: 'Workers Compensation',
      entity: 'Superior One Logistics',
      entityType: 'company',
      status: 'compliant',
      expiryDate: '2025-12-31',
      issueDate: '2024-01-01',
      lastCheck: '2025-01-07'
    },
    {
      id: '10',
      type: 'license',
      title: 'CDL with Hazmat Endorsement',
      entity: 'Mike Rodriguez',
      entityType: 'driver',
      status: 'missing',
      details: 'Required for hazmat loads'
    },
    {
      id: '11',
      type: 'permit',
      title: 'IFTA License',
      entity: 'Superior One Logistics',
      entityType: 'company',
      status: 'expiring_soon',
      expiryDate: '2025-03-31',
      issueDate: '2024-04-01',
      lastCheck: '2025-01-07'
    },
    {
      id: '12',
      type: 'training',
      title: 'Defensive Driving Certification',
      entity: 'Sarah Johnson',
      entityType: 'driver',
      status: 'compliant',
      expiryDate: '2025-09-15',
      issueDate: '2024-09-15',
      lastCheck: '2025-01-05'
    }
  ])
  
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [selectedItem, setSelectedItem] = useState<ComplianceItem | null>(null)

  const getStatusColor = (status: string) => {
    const colors = {
      compliant: theme.colors.success,
      expiring_soon: theme.colors.warning,
      expired: theme.colors.error,
      missing: theme.colors.error,
      pending: theme.colors.textSecondary
    }
    return colors[status] || theme.colors.textSecondary
  }

  const getStatusIcon = (status: string) => {
    const icons = {
      compliant: CheckCircle,
      expiring_soon: AlertTriangle,
      expired: XCircle,
      missing: AlertCircle,
      pending: Clock
    }
    return icons[status] || Clock
  }

  const getTypeLabel = (type: string) => {
    const labels = {
      license: 'License',
      insurance: 'Insurance',
      inspection: 'Inspection',
      permit: 'Permit',
      hos: 'Hours of Service',
      dot: 'DOT Compliance',
      training: 'Training'
    }
    return labels[type] || 'Compliance'
  }

  const getEntityIcon = (entityType: string) => {
    const icons = {
      driver: Users,
      vehicle: Truck,
      company: Shield
    }
    return icons[entityType] || FileText
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date()
    const expiry = new Date(expiryDate)
    const diffTime = expiry.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const filteredItems = items.filter(item => {
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus
    const matchesType = filterType === 'all' || item.type === filterType
    return matchesStatus && matchesType
  })

  const stats = {
    compliant: items.filter(i => i.status === 'compliant').length,
    expiringSoon: items.filter(i => i.status === 'expiring_soon').length,
    expired: items.filter(i => i.status === 'expired').length,
    missing: items.filter(i => i.status === 'missing').length,
    complianceScore: Math.round((items.filter(i => i.status === 'compliant').length / items.length) * 100)
  }

  const headerAction = (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      <button
        onClick={() => navigateToFleet()}
        style={{
          padding: '12px 20px',
          background: 'transparent',
          border: `1px solid ${theme.colors.border}`,
          borderRadius: '12px',
          color: theme.colors.textSecondary,
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
          e.currentTarget.style.color = theme.colors.textPrimary
          e.currentTarget.style.borderColor = theme.colors.primary
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.color = theme.colors.textSecondary
          e.currentTarget.style.borderColor = theme.colors.border
        }}
      >
        <Truck size={18} />
        View Fleet Details
      </button>
      <button
        onClick={() => {
          // Trigger compliance check
          alert('Running compliance check across all systems...')
        }}
        style={{
          padding: '12px 20px',
          background: 'transparent',
          border: `1px solid ${theme.colors.border}`,
          borderRadius: '12px',
          color: theme.colors.textSecondary,
          fontSize: '14px',
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
        <RefreshCw size={18} />
        Run Compliance Check
      </button>
    </div>
  )

  return (
    <PageContainer
      title="Company Compliance Tracking"
      subtitle="Monitor driver licenses, company certifications, permits, and regulatory compliance"
      icon={Shield}
      headerAction={headerAction}
    >
      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '24px'
      }}>
        {/* Compliance Score */}
        <Card padding="24px">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              background: `linear-gradient(135deg, ${theme.colors.success} 0%, ${theme.colors.success}dd 100%)`,
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 8px 24px ${theme.colors.success}40`,
              position: 'relative'
            }}>
              <span style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: 'white'
              }}>
                {stats.complianceScore}%
              </span>
            </div>
            <div>
              <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: '0 0 4px 0' }}>
                Compliance Score
              </p>
              <p style={{ fontSize: '13px', color: theme.colors.success, margin: 0, fontWeight: '600' }}>
                <TrendingUp size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                Overall Status
              </p>
            </div>
          </div>
        </Card>

        {/* Compliant */}
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
                {stats.compliant}
              </p>
              <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: '4px 0 0 0' }}>
                Compliant
              </p>
            </div>
          </div>
        </Card>

        {/* Expiring Soon */}
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
                {stats.expiringSoon}
              </p>
              <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: '4px 0 0 0' }}>
                Expiring Soon
              </p>
            </div>
          </div>
        </Card>

        {/* Expired */}
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
              <XCircle size={28} color={theme.colors.textSecondary} />
            </div>
            <div>
              <p style={{ fontSize: '36px', fontWeight: 'bold', color: theme.colors.textPrimary, margin: 0, lineHeight: 1 }}>
                {stats.expired}
              </p>
              <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: '4px 0 0 0' }}>
                Expired
              </p>
            </div>
          </div>
        </Card>

        {/* Missing */}
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
                {stats.missing}
              </p>
              <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: '4px 0 0 0' }}>
                Missing
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
              placeholder="Search compliance items..."
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
              minWidth: '180px',
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
            <option value="compliant">Compliant</option>
            <option value="expiring_soon">Expiring Soon</option>
            <option value="expired">Expired</option>
            <option value="missing">Missing</option>
            <option value="pending">Pending</option>
          </select>

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
              minWidth: '180px',
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
            <option value="license">Licenses</option>
            <option value="insurance">Insurance</option>
            <option value="inspection">Inspections</option>
            <option value="permit">Permits</option>
            <option value="hos">Hours of Service</option>
            <option value="dot">DOT Compliance</option>
            <option value="training">Training</option>
          </select>
        </div>
      </Card>

      {/* Company Compliance Items */}
      <Card title="Company Compliance Items" icon={<Shield size={20} color={theme.colors.primary} />}>
        <div style={{ 
          background: `${theme.colors.primary}10`, 
          border: `1px solid ${theme.colors.primary}30`, 
          borderRadius: '8px', 
          padding: '12px 16px', 
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <Shield size={16} color={theme.colors.primary} />
          <p style={{ 
            fontSize: '13px', 
            color: theme.colors.textPrimary, 
            margin: 0,
            fontWeight: '500'
          }}>
            <strong>Company-Wide Compliance:</strong> This page tracks driver licenses, company permits, training certifications, and regulatory compliance. 
            For vehicle-specific compliance (DOT inspections, vehicle insurance, registration), visit the Fleet Management page.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: theme.colors.textSecondary }}>
              <Shield size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
              <p style={{ fontSize: '18px', margin: 0 }}>No compliance items found</p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const StatusIcon = getStatusIcon(item.status)
              const EntityIcon = getEntityIcon(item.entityType)
              const daysUntilExpiry = item.expiryDate ? getDaysUntilExpiry(item.expiryDate) : null
              
              return (
                <div
                  key={item.id}
                  style={{
                    background: theme.colors.background,
                    borderRadius: '12px',
                    padding: '20px',
                    border: `2px solid ${item.status === 'expired' || item.status === 'missing' ? theme.colors.error : theme.colors.border}`,
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                  }}
                  onClick={() => setSelectedItem(item)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                      <div style={{
                        width: '52px',
                        height: '52px',
                        background: `${getStatusColor(item.status)}20`,
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <StatusIcon size={26} color={getStatusColor(item.status)} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary, margin: '0 0 6px 0' }}>
                          {item.title}
                        </h3>
                        <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <EntityIcon size={14} />
                          {item.entity} • {getTypeLabel(item.type)}
                        </p>
                        {item.expiryDate && (
                          <p style={{ fontSize: '13px', color: daysUntilExpiry && daysUntilExpiry < 30 ? theme.colors.warning : theme.colors.textSecondary, margin: 0 }}>
                            {daysUntilExpiry !== null && daysUntilExpiry >= 0
                              ? `Expires in ${daysUntilExpiry} days (${formatDate(item.expiryDate)})`
                              : `Expired on ${formatDate(item.expiryDate)}`
                            }
                          </p>
                        )}
                        {item.details && (
                          <p style={{ fontSize: '13px', color: theme.colors.textSecondary, margin: '4px 0 0 0' }}>
                            {item.details}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {item.violations !== undefined && item.violations > 0 && (
                        <div style={{
                          padding: '6px 12px',
                          background: `${theme.colors.error}20`,
                          color: theme.colors.error,
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: '600'
                        }}>
                          {item.violations} Violation{item.violations > 1 ? 's' : ''}
                        </div>
                      )}
                      
                      <div style={{
                        padding: '8px 14px',
                        background: `${getStatusColor(item.status)}20`,
                        color: getStatusColor(item.status),
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: '600',
                        textTransform: 'capitalize',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <StatusIcon size={14} />
                        {item.status.replace('_', ' ')}
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedItem(item)
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
                        <Eye size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </Card>

      {/* Detail Modal */}
      {selectedItem && (
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
          onClick={() => setSelectedItem(null)}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
              <div>
                <h2 style={{ color: theme.colors.textPrimary, fontSize: '24px', fontWeight: 'bold', margin: '0 0 8px 0' }}>
                  {selectedItem.title}
                </h2>
                <p style={{ color: theme.colors.textSecondary, margin: 0 }}>
                  {selectedItem.entity} • {getTypeLabel(selectedItem.type)}
                </p>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
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
                <XCircle size={24} />
              </button>
            </div>

            {(selectedItem.status === 'expired' || selectedItem.status === 'missing' || selectedItem.status === 'expiring_soon') && (
              <div style={{
                background: `${theme.colors.error}15`,
                border: `2px solid ${theme.colors.error}`,
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '24px',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start'
              }}>
                <AlertTriangle size={24} color={theme.colors.error} style={{ flexShrink: 0 }} />
                <div>
                  <h4 style={{ color: theme.colors.error, fontSize: '16px', fontWeight: '700', margin: '0 0 8px 0' }}>
                    {selectedItem.status === 'expired' ? 'Compliance Item Expired' : selectedItem.status === 'missing' ? 'Required Item Missing' : 'Expiring Soon'}
                  </h4>
                  <p style={{ color: theme.colors.textPrimary, fontSize: '14px', margin: 0 }}>
                    {selectedItem.status === 'expired' 
                      ? 'This compliance item has expired and requires immediate attention.'
                      : selectedItem.status === 'missing'
                      ? 'This required compliance item is missing. Please upload or complete as soon as possible.'
                      : 'This compliance item will expire soon. Please renew before expiration.'
                    }
                  </p>
                </div>
              </div>
            )}

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
                  color: getStatusColor(selectedItem.status),
                  margin: 0,
                  textTransform: 'capitalize'
                }}>
                  {selectedItem.status.replace('_', ' ')}
                </p>
              </div>

              {selectedItem.expiryDate && (
                <div style={{ background: theme.colors.background, padding: '20px', borderRadius: '12px' }}>
                  <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
                    Expiry Date
                  </p>
                  <p style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary, margin: 0 }}>
                    {formatDate(selectedItem.expiryDate)}
                  </p>
                </div>
              )}

              {selectedItem.issueDate && (
                <div style={{ background: theme.colors.background, padding: '20px', borderRadius: '12px' }}>
                  <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
                    Issue Date
                  </p>
                  <p style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary, margin: 0 }}>
                    {formatDate(selectedItem.issueDate)}
                  </p>
                </div>
              )}

              {selectedItem.lastCheck && (
                <div style={{ background: theme.colors.background, padding: '20px', borderRadius: '12px' }}>
                  <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
                    Last Checked
                  </p>
                  <p style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary, margin: 0 }}>
                    {formatDate(selectedItem.lastCheck)}
                  </p>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setSelectedItem(null)}
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
              >
                <FileText size={18} />
                View Document
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  )
}

export default CompliancePage


