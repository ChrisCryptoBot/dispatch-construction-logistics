import React, { useState } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { MapPin, Plus, Edit2, Trash2, AlertCircle, CheckCircle, Clock, Users, Package, TrendingUp, Search, Filter } from 'lucide-react'
import PageContainer from '../../components/PageContainer'
import Card from '../../components/Card'

interface JobSite {
  id: string
  name: string
  address: string
  city: string
  state: string
  zipCode: string
  contactName: string
  contactPhone: string
  status: 'active' | 'upcoming' | 'completed' | 'on_hold'
  totalLoads: number
  activeLoads: number
  totalSpend: number
  startDate: string
  estimatedEndDate?: string
  materials: string[]
  notes?: string
}

const JobSitesPage = () => {
  const { theme } = useTheme()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedSite, setSelectedSite] = useState<JobSite | null>(null)
  const [editForm, setEditForm] = useState<Partial<JobSite>>({})

  // Mock data (mutable for testing)
  const [jobSites, setJobSites] = useState<JobSite[]>([
    {
      id: '1',
      name: 'Downtown Plaza Construction',
      address: '123 Main Street',
      city: 'Dallas',
      state: 'TX',
      zipCode: '75201',
      contactName: 'John Smith',
      contactPhone: '(214) 555-0123',
      status: 'active',
      totalLoads: 142,
      activeLoads: 8,
      totalSpend: 287500,
      startDate: '2024-11-15',
      estimatedEndDate: '2025-03-30',
      materials: ['Crushed Stone', 'Sand', 'Ready-Mix Concrete'],
      notes: 'High priority project, requires daily deliveries'
    },
    {
      id: '2',
      name: 'Highway 35 Extension',
      address: '4500 State Highway 35',
      city: 'Austin',
      state: 'TX',
      zipCode: '78701',
      contactName: 'Sarah Johnson',
      contactPhone: '(512) 555-0456',
      status: 'active',
      totalLoads: 89,
      activeLoads: 5,
      totalSpend: 156200,
      startDate: '2024-12-01',
      estimatedEndDate: '2025-06-15',
      materials: ['Asphalt', 'Base Material'],
      notes: 'Weekend deliveries only'
    },
    {
      id: '3',
      name: 'Riverside Park Development',
      address: '789 Riverside Drive',
      city: 'Fort Worth',
      state: 'TX',
      zipCode: '76102',
      contactName: 'Mike Rodriguez',
      contactPhone: '(817) 555-0789',
      status: 'upcoming',
      totalLoads: 0,
      activeLoads: 0,
      totalSpend: 0,
      startDate: '2025-02-01',
      estimatedEndDate: '2025-09-30',
      materials: ['Topsoil', 'Gravel', 'Decorative Stone']
    },
    {
      id: '4',
      name: 'Municipal Building Renovation',
      address: '456 City Hall Plaza',
      city: 'Houston',
      state: 'TX',
      zipCode: '77002',
      contactName: 'Lisa Chen',
      contactPhone: '(713) 555-0234',
      status: 'completed',
      totalLoads: 67,
      activeLoads: 0,
      totalSpend: 98400,
      startDate: '2024-08-01',
      estimatedEndDate: '2024-12-15',
      materials: ['Concrete', 'Steel']
    },
    {
      id: '5',
      name: 'Industrial Park Phase 2',
      address: '1200 Industrial Parkway',
      city: 'San Antonio',
      state: 'TX',
      zipCode: '78216',
      contactName: 'David Park',
      contactPhone: '(210) 555-0567',
      status: 'on_hold',
      totalLoads: 23,
      activeLoads: 0,
      totalSpend: 41800,
      startDate: '2024-10-15',
      materials: ['Base Material', 'Crushed Stone']
    }
  ])

  const statusConfig = {
    active: { color: theme.colors.success, label: 'Active', icon: CheckCircle },
    upcoming: { color: theme.colors.info, label: 'Upcoming', icon: Clock },
    completed: { color: theme.colors.textSecondary, label: 'Completed', icon: CheckCircle },
    on_hold: { color: theme.colors.warning, label: 'On Hold', icon: AlertCircle }
  }

  const filteredSites = jobSites.filter(site => {
    const matchesSearch = site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         site.city.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || site.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const stats = {
    total: jobSites.length,
    active: jobSites.filter(s => s.status === 'active').length,
    upcoming: jobSites.filter(s => s.status === 'upcoming').length,
    activeLoads: jobSites.reduce((sum, s) => sum + s.activeLoads, 0)
  }

  const handleAddSite = () => {
    alert('Add Job Site functionality - Coming soon!')
    setShowAddModal(false)
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
              Job Sites
            </h1>
            <p style={{ color: theme.colors.textSecondary, fontSize: '14px' }}>
              Manage your construction sites and delivery locations
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: theme.spacing.xs,
              padding: `${theme.spacing.sm} ${theme.spacing.md}`,
              background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primaryHover})`,
              color: 'white',
              border: 'none',
              borderRadius: theme.borderRadius.md,
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <Plus size={18} />
            Add Job Site
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
                background: `${theme.colors.primary}20`,
                borderRadius: theme.borderRadius.md
              }}>
                <MapPin size={20} color={theme.colors.primary} />
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: theme.colors.textPrimary }}>
                  {stats.total}
                </div>
                <div style={{ fontSize: '12px', color: theme.colors.textSecondary }}>Total Sites</div>
              </div>
            </div>
          </Card>

          <Card hover={false}>
            <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
              <div style={{ 
                padding: theme.spacing.sm,
                background: `${theme.colors.success}20`,
                borderRadius: theme.borderRadius.md
              }}>
                <CheckCircle size={20} color={theme.colors.success} />
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: theme.colors.textPrimary }}>
                  {stats.active}
                </div>
                <div style={{ fontSize: '12px', color: theme.colors.textSecondary }}>Active Sites</div>
              </div>
            </div>
          </Card>

          <Card hover={false}>
            <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
              <div style={{ 
                padding: theme.spacing.sm,
                background: `${theme.colors.info}20`,
                borderRadius: theme.borderRadius.md
              }}>
                <Clock size={20} color={theme.colors.info} />
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: theme.colors.textPrimary }}>
                  {stats.upcoming}
                </div>
                <div style={{ fontSize: '12px', color: theme.colors.textSecondary }}>Upcoming</div>
              </div>
            </div>
          </Card>

          <Card hover={false}>
            <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
              <div style={{ 
                padding: theme.spacing.sm,
                background: `${theme.colors.primary}20`,
                borderRadius: theme.borderRadius.md
              }}>
                <Package size={20} color={theme.colors.primary} />
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: theme.colors.textPrimary }}>
                  {stats.activeLoads}
                </div>
                <div style={{ fontSize: '12px', color: theme.colors.textSecondary }}>Active Loads</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Search and Filter */}
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
              placeholder="Search job sites..."
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
            <option value="active">Active</option>
            <option value="upcoming">Upcoming</option>
            <option value="completed">Completed</option>
            <option value="on_hold">On Hold</option>
          </select>
        </div>
      </div>

      {/* Job Sites Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', 
        gap: theme.spacing.md 
      }}>
        {filteredSites.map(site => {
          const StatusIcon = statusConfig[site.status].icon
          return (
            <Card key={site.id} hover>
              <div style={{ marginBottom: theme.spacing.md }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: theme.spacing.sm }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ 
                      fontSize: '18px', 
                      fontWeight: '600', 
                      color: theme.colors.textPrimary,
                      marginBottom: theme.spacing.xs
                    }}>
                      {site.name}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.xs, marginBottom: theme.spacing.xs }}>
                      <MapPin size={14} color={theme.colors.textSecondary} />
                      <span style={{ fontSize: '13px', color: theme.colors.textSecondary }}>
                        {site.city}, {site.state}
                      </span>
                    </div>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: theme.spacing.xs,
                    padding: `4px 12px`,
                    background: `${statusConfig[site.status].color}20`,
                    borderRadius: theme.borderRadius.full,
                    fontSize: '12px',
                    fontWeight: '600',
                    color: statusConfig[site.status].color
                  }}>
                    <StatusIcon size={14} />
                    {statusConfig[site.status].label}
                  </div>
                </div>

                {/* Contact Info */}
                <div style={{ 
                  padding: theme.spacing.sm,
                  background: theme.colors.backgroundTertiary,
                  borderRadius: theme.borderRadius.md,
                  marginBottom: theme.spacing.sm
                }}>
                  <div style={{ fontSize: '12px', color: theme.colors.textSecondary, marginBottom: '4px' }}>
                    Contact
                  </div>
                  <div style={{ fontSize: '13px', color: theme.colors.textPrimary, fontWeight: '500' }}>
                    {site.contactName}
                  </div>
                  <div style={{ fontSize: '13px', color: theme.colors.textSecondary }}>
                    {site.contactPhone}
                  </div>
                </div>

                {/* Stats */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: theme.spacing.sm,
                  marginBottom: theme.spacing.md
                }}>
                  <div>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: theme.colors.textPrimary }}>
                      {site.totalLoads}
                    </div>
                    <div style={{ fontSize: '11px', color: theme.colors.textSecondary }}>Total Loads</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: theme.colors.primary }}>
                      {site.activeLoads}
                    </div>
                    <div style={{ fontSize: '11px', color: theme.colors.textSecondary }}>Active</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: theme.colors.success }}>
                      ${(site.totalSpend / 1000).toFixed(0)}k
                    </div>
                    <div style={{ fontSize: '11px', color: theme.colors.textSecondary }}>Total Spend</div>
                  </div>
                </div>

                {/* Materials */}
                <div style={{ marginBottom: theme.spacing.md }}>
                  <div style={{ fontSize: '11px', color: theme.colors.textSecondary, marginBottom: theme.spacing.xs }}>
                    Materials
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: theme.spacing.xs }}>
                    {site.materials.map((material, idx) => (
                      <span
                        key={idx}
                        style={{
                          padding: '4px 8px',
                          background: theme.colors.backgroundSecondary,
                          border: `1px solid ${theme.colors.border}`,
                          borderRadius: theme.borderRadius.sm,
                          fontSize: '11px',
                          color: theme.colors.textPrimary
                        }}
                      >
                        {material}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: theme.spacing.sm }}>
                  <button
                    onClick={() => setSelectedSite(site)}
                    style={{
                      flex: 1,
                      padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                      background: theme.colors.backgroundSecondary,
                      border: `1px solid ${theme.colors.border}`,
                      borderRadius: theme.borderRadius.md,
                      color: theme.colors.textPrimary,
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = theme.colors.backgroundTertiary
                      e.currentTarget.style.borderColor = theme.colors.primary
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = theme.colors.backgroundSecondary
                      e.currentTarget.style.borderColor = theme.colors.border
                    }}
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => {
                      setSelectedSite(site)
                      setEditForm(site)
                      setShowEditModal(true)
                    }}
                    style={{
                      padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                      background: theme.colors.backgroundSecondary,
                      border: `1px solid ${theme.colors.border}`,
                      borderRadius: theme.borderRadius.md,
                      color: theme.colors.textPrimary,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = theme.colors.backgroundTertiary
                      e.currentTarget.style.borderColor = theme.colors.primary
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = theme.colors.backgroundSecondary
                      e.currentTarget.style.borderColor = theme.colors.border
                    }}
                  >
                    <Edit2 size={16} />
                  </button>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Add Modal */}
      {showAddModal && (
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
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: '700', 
              color: theme.colors.textPrimary,
              marginBottom: theme.spacing.lg 
            }}>
              Add New Job Site
            </h2>
            <p style={{ color: theme.colors.textSecondary, marginBottom: theme.spacing.lg }}>
              This feature will allow you to add new job sites with full details.
            </p>
            <div style={{ display: 'flex', gap: theme.spacing.md }}>
              <button
                onClick={handleAddSite}
                style={{
                  flex: 1,
                  padding: theme.spacing.md,
                  background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primaryHover})`,
                  color: 'white',
                  border: 'none',
                  borderRadius: theme.borderRadius.md,
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                OK
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                style={{
                  padding: theme.spacing.md,
                  background: theme.colors.backgroundSecondary,
                  color: theme.colors.textPrimary,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: theme.borderRadius.md,
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedSite && (
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
            maxWidth: '700px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: theme.spacing.lg }}>
              <h2 style={{ fontSize: '24px', fontWeight: '700', color: theme.colors.textPrimary }}>
                {selectedSite.name}
              </h2>
              <button
                onClick={() => setSelectedSite(null)}
                style={{
                  padding: theme.spacing.xs,
                  background: 'transparent',
                  border: 'none',
                  color: theme.colors.textSecondary,
                  cursor: 'pointer'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ marginBottom: theme.spacing.md }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textSecondary, marginBottom: theme.spacing.sm }}>
                Address
              </h4>
              <p style={{ color: theme.colors.textPrimary }}>
                {selectedSite.address}<br />
                {selectedSite.city}, {selectedSite.state} {selectedSite.zipCode}
              </p>
            </div>

            <div style={{ marginBottom: theme.spacing.md }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textSecondary, marginBottom: theme.spacing.sm }}>
                Contact
              </h4>
              <p style={{ color: theme.colors.textPrimary }}>
                {selectedSite.contactName}<br />
                {selectedSite.contactPhone}
              </p>
            </div>

            {selectedSite.notes && (
              <div style={{ marginBottom: theme.spacing.md }}>
                <h4 style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textSecondary, marginBottom: theme.spacing.sm }}>
                  Notes
                </h4>
                <p style={{ color: theme.colors.textPrimary }}>{selectedSite.notes}</p>
              </div>
            )}

            <button
              onClick={() => setSelectedSite(null)}
              style={{
                width: '100%',
                padding: theme.spacing.md,
                background: theme.colors.backgroundSecondary,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: theme.borderRadius.md,
                color: theme.colors.textPrimary,
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Edit Job Site Modal */}
      {showEditModal && selectedSite && (
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
          zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: theme.colors.backgroundCard,
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: theme.colors.textPrimary, marginBottom: '24px' }}>
              Edit Job Site
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                  Site Name *
                </label>
                <input
                  type="text"
                  value={editForm.name || ''}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: theme.colors.inputBg,
                    border: `2px solid ${theme.colors.inputBorder}`,
                    borderRadius: '10px',
                    fontSize: '15px',
                    color: theme.colors.textPrimary,
                    outline: 'none'
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = theme.colors.inputFocus}
                  onBlur={(e) => e.currentTarget.style.borderColor = theme.colors.inputBorder}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                  Address *
                </label>
                <input
                  type="text"
                  value={editForm.address || ''}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: theme.colors.inputBg,
                    border: `2px solid ${theme.colors.inputBorder}`,
                    borderRadius: '10px',
                    fontSize: '15px',
                    color: theme.colors.textPrimary,
                    outline: 'none'
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = theme.colors.inputFocus}
                  onBlur={(e) => e.currentTarget.style.borderColor = theme.colors.inputBorder}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                    City *
                  </label>
                  <input
                    type="text"
                    value={editForm.city || ''}
                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: theme.colors.inputBg,
                      border: `2px solid ${theme.colors.inputBorder}`,
                      borderRadius: '10px',
                      fontSize: '15px',
                      color: theme.colors.textPrimary,
                      outline: 'none'
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = theme.colors.inputFocus}
                    onBlur={(e) => e.currentTarget.style.borderColor = theme.colors.inputBorder}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                    State *
                  </label>
                  <input
                    type="text"
                    value={editForm.state || ''}
                    onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: theme.colors.inputBg,
                      border: `2px solid ${theme.colors.inputBorder}`,
                      borderRadius: '10px',
                      fontSize: '15px',
                      color: theme.colors.textPrimary,
                      outline: 'none'
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = theme.colors.inputFocus}
                    onBlur={(e) => e.currentTarget.style.borderColor = theme.colors.inputBorder}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                    Zip *
                  </label>
                  <input
                    type="text"
                    value={editForm.zipCode || ''}
                    onChange={(e) => setEditForm({ ...editForm, zipCode: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: theme.colors.inputBg,
                      border: `2px solid ${theme.colors.inputBorder}`,
                      borderRadius: '10px',
                      fontSize: '15px',
                      color: theme.colors.textPrimary,
                      outline: 'none'
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = theme.colors.inputFocus}
                    onBlur={(e) => e.currentTarget.style.borderColor = theme.colors.inputBorder}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    value={editForm.contactName || ''}
                    onChange={(e) => setEditForm({ ...editForm, contactName: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: theme.colors.inputBg,
                      border: `2px solid ${theme.colors.inputBorder}`,
                      borderRadius: '10px',
                      fontSize: '15px',
                      color: theme.colors.textPrimary,
                      outline: 'none'
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = theme.colors.inputFocus}
                    onBlur={(e) => e.currentTarget.style.borderColor = theme.colors.inputBorder}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                    Contact Phone *
                  </label>
                  <input
                    type="tel"
                    value={editForm.contactPhone || ''}
                    onChange={(e) => setEditForm({ ...editForm, contactPhone: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: theme.colors.inputBg,
                      border: `2px solid ${theme.colors.inputBorder}`,
                      borderRadius: '10px',
                      fontSize: '15px',
                      color: theme.colors.textPrimary,
                      outline: 'none'
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = theme.colors.inputFocus}
                    onBlur={(e) => e.currentTarget.style.borderColor = theme.colors.inputBorder}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                  Status *
                </label>
                <select
                  value={editForm.status || 'active'}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: theme.colors.inputBg,
                    border: `2px solid ${theme.colors.inputBorder}`,
                    borderRadius: '10px',
                    fontSize: '15px',
                    color: theme.colors.textPrimary,
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="active">Active</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="completed">Completed</option>
                  <option value="on_hold">On Hold</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                  Notes
                </label>
                <textarea
                  value={editForm.notes || ''}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: theme.colors.inputBg,
                    border: `2px solid ${theme.colors.inputBorder}`,
                    borderRadius: '10px',
                    fontSize: '15px',
                    color: theme.colors.textPrimary,
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = theme.colors.inputFocus}
                  onBlur={(e) => e.currentTarget.style.borderColor = theme.colors.inputBorder}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                onClick={() => {
                  // Save changes
                  if (!editForm.name || !editForm.address || !editForm.city || !editForm.state || !editForm.zipCode || !editForm.contactName || !editForm.contactPhone) {
                    alert('Please fill in all required fields')
                    return
                  }

                  setJobSites(prev => prev.map(site => 
                    site.id === selectedSite.id ? { ...site, ...editForm } as JobSite : site
                  ))

                  setShowEditModal(false)
                  setSelectedSite(null)
                  setEditForm({})
                }}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.accent} 100%)`,
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: `0 4px 12px ${theme.colors.primary}40`
                }}
              >
                Save Changes
              </button>

              <button
                onClick={() => {
                  setShowEditModal(false)
                  setSelectedSite(null)
                  setEditForm({})
                }}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: theme.colors.backgroundSecondary,
                  color: theme.colors.textPrimary,
                  border: `2px solid ${theme.colors.border}`,
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
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

export default JobSitesPage

