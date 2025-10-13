import React, { useState } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import PageContainer from '../components/shared/PageContainer'
import Card from '../components/ui/Card'
import { Users, UserCheck, Clock, AlertTriangle, TrendingUp, Phone, Mail, MapPin, Calendar, Eye, Edit, Plus, Search, Star } from 'lucide-react'

interface Driver {
  id: string
  name: string
  phone: string
  email: string
  licenseNumber: string
  licenseExpiry: string
  status: 'active' | 'off_duty' | 'driving' | 'on_break' | 'inactive'
  currentLoad?: string
  hoursRemaining: number
  hoursToday: number
  location: string
  rating: number
  completedLoads: number
  onTimeRate: number
}

const DriversPage = () => {
  const { theme } = useTheme()
  
  const [drivers, setDrivers] = useState<Driver[]>([
    {
      id: '1',
      name: 'John Smith',
      phone: '(555) 123-4567',
      email: 'john.smith@example.com',
      licenseNumber: 'CDL-TX-123456',
      licenseExpiry: '2026-06-15',
      status: 'driving',
      currentLoad: 'LT-1234',
      hoursRemaining: 5.5,
      hoursToday: 8.5,
      location: 'Dallas, TX',
      rating: 4.8,
      completedLoads: 245,
      onTimeRate: 96
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      phone: '(555) 234-5678',
      email: 'sarah.j@example.com',
      licenseNumber: 'CDL-TX-234567',
      licenseExpiry: '2025-09-20',
      status: 'on_break',
      currentLoad: 'LT-1235',
      hoursRemaining: 6.0,
      hoursToday: 7.0,
      location: 'Fort Worth, TX',
      rating: 4.9,
      completedLoads: 312,
      onTimeRate: 98
    },
    {
      id: '3',
      name: 'Mike Rodriguez',
      phone: '(555) 345-6789',
      email: 'mike.r@example.com',
      licenseNumber: 'CDL-TX-345678',
      licenseExpiry: '2027-03-10',
      status: 'active',
      hoursRemaining: 11.0,
      hoursToday: 0,
      location: 'Austin, TX',
      rating: 4.7,
      completedLoads: 189,
      onTimeRate: 94
    },
    {
      id: '4',
      name: 'David Chen',
      phone: '(555) 456-7890',
      email: 'david.c@example.com',
      licenseNumber: 'CDL-TX-456789',
      licenseExpiry: '2025-11-30',
      status: 'off_duty',
      hoursRemaining: 11.0,
      hoursToday: 0,
      location: 'Houston, TX',
      rating: 4.6,
      completedLoads: 167,
      onTimeRate: 92
    }
  ])
  
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null)

  const getStatusColor = (status: string) => {
    const colors = {
      active: theme.colors.success,
      driving: theme.colors.info,
      on_break: theme.colors.warning,
      off_duty: theme.colors.textSecondary,
      inactive: theme.colors.error
    }
    return colors[status] || theme.colors.textSecondary
  }

  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         driver.phone.includes(searchTerm) ||
                         driver.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || driver.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: drivers.length,
    active: drivers.filter(d => d.status === 'active' || d.status === 'driving' || d.status === 'on_break').length,
    driving: drivers.filter(d => d.status === 'driving').length,
    avgRating: (drivers.reduce((sum, d) => sum + d.rating, 0) / drivers.length).toFixed(1)
  }

  const headerAction = (
    <button
      onClick={() => alert('Add new driver')}
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
      <Plus size={18} />
      Add Driver
    </button>
  )

  return (
    <PageContainer
      title="Driver Management"
      subtitle="Manage your driver roster, track hours of service, and monitor performance"
      icon={Users}
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
              <Users size={28} color={theme.colors.primary} />
            </div>
            <div>
              <p style={{ fontSize: '36px', fontWeight: 'bold', color: theme.colors.textPrimary, margin: 0, lineHeight: 1 }}>
                {stats.total}
              </p>
              <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: '4px 0 0 0' }}>
                Total Drivers
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
              <UserCheck size={28} color={theme.colors.success} />
            </div>
            <div>
              <p style={{ fontSize: '36px', fontWeight: 'bold', color: theme.colors.textPrimary, margin: 0, lineHeight: 1 }}>
                {stats.active}
              </p>
              <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: '4px 0 0 0' }}>
                Active Drivers
              </p>
            </div>
          </div>
        </Card>

        <Card padding="24px">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              background: `${theme.colors.info}20`,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Clock size={28} color={theme.colors.info} />
            </div>
            <div>
              <p style={{ fontSize: '36px', fontWeight: 'bold', color: theme.colors.textPrimary, margin: 0, lineHeight: 1 }}>
                {stats.driving}
              </p>
              <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: '4px 0 0 0' }}>
                Currently Driving
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
              <Star size={28} color={theme.colors.warning} />
            </div>
            <div>
              <p style={{ fontSize: '36px', fontWeight: 'bold', color: theme.colors.textPrimary, margin: 0, lineHeight: 1 }}>
                {stats.avgRating}
              </p>
              <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: '4px 0 0 0' }}>
                Average Rating
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card padding="20px" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
            <Search size={18} color={theme.colors.textSecondary} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search drivers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 12px 12px 42px',
                backgroundColor: theme.colors.background,
                color: theme.colors.textPrimary,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: '10px',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              padding: '12px 16px',
              backgroundColor: theme.colors.backgroundCard,
              color: theme.colors.textPrimary,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: '10px',
              fontSize: '14px',
              cursor: 'pointer',
              outline: 'none',
              minWidth: '180px'
            }}
          >
            <option value="all" style={{ backgroundColor: theme.colors.backgroundCard, color: theme.colors.textPrimary }}>All Status</option>
            <option value="active" style={{ backgroundColor: theme.colors.backgroundCard, color: theme.colors.textPrimary }}>Active</option>
            <option value="driving" style={{ backgroundColor: theme.colors.backgroundCard, color: theme.colors.textPrimary }}>Driving</option>
            <option value="on_break" style={{ backgroundColor: theme.colors.backgroundCard, color: theme.colors.textPrimary }}>On Break</option>
            <option value="off_duty" style={{ backgroundColor: theme.colors.backgroundCard, color: theme.colors.textPrimary }}>Off Duty</option>
            <option value="inactive" style={{ backgroundColor: theme.colors.backgroundCard, color: theme.colors.textPrimary }}>Inactive</option>
          </select>
        </div>
      </Card>

      {/* Drivers List */}
      <Card title="Drivers" icon={<Users size={20} color={theme.colors.primary} />}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredDrivers.map((driver) => (
            <div
              key={driver.id}
              style={{
                background: theme.colors.background,
                borderRadius: '12px',
                padding: '20px',
                border: `1px solid ${theme.colors.border}`,
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              onClick={() => setSelectedDriver(driver)}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.accent} 100%)`,
                    borderRadius: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '24px',
                    fontWeight: 'bold'
                  }}>
                    {driver.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary, margin: '0 0 6px 0' }}>
                      {driver.name}
                      <span style={{ marginLeft: '12px', fontSize: '14px', color: theme.colors.warning }}>
                        <Star size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                        {driver.rating}
                      </span>
                    </h3>
                    <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: '0 0 4px 0' }}>
                      {driver.licenseNumber} • {driver.completedLoads} loads • {driver.onTimeRate}% on-time
                    </p>
                    <p style={{ fontSize: '13px', color: theme.colors.textSecondary, margin: 0 }}>
                      <MapPin size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                      {driver.location} • {driver.hoursToday}h driven today, {driver.hoursRemaining}h remaining
                    </p>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {driver.currentLoad && (
                    <div style={{
                      padding: '6px 12px',
                      background: `${theme.colors.info}20`,
                      color: theme.colors.info,
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '600'
                    }}>
                      {driver.currentLoad}
                    </div>
                  )}
                  
                  <div style={{
                    padding: '8px 14px',
                    background: `${getStatusColor(driver.status)}20`,
                    color: getStatusColor(driver.status),
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '600',
                    textTransform: 'capitalize'
                  }}>
                    {driver.status.replace('_', ' ')}
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedDriver(driver)
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
          ))}
        </div>
      </Card>

      {/* Driver Detail Modal */}
      {selectedDriver && (
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
          onClick={() => setSelectedDriver(null)}
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
                  {selectedDriver.name}
                </h2>
                <p style={{ color: theme.colors.textSecondary, margin: 0 }}>
                  {selectedDriver.licenseNumber}
                </p>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '16px',
              marginBottom: '28px'
            }}>
              <div style={{ background: theme.colors.background, padding: '20px', borderRadius: '12px' }}>
                <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
                  Phone
                </p>
                <p style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary, margin: 0 }}>
                  {selectedDriver.phone}
                </p>
              </div>

              <div style={{ background: theme.colors.background, padding: '20px', borderRadius: '12px' }}>
                <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
                  Email
                </p>
                <p style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary, margin: 0 }}>
                  {selectedDriver.email}
                </p>
              </div>

              <div style={{ background: theme.colors.background, padding: '20px', borderRadius: '12px' }}>
                <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
                  Location
                </p>
                <p style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary, margin: 0 }}>
                  {selectedDriver.location}
                </p>
              </div>

              <div style={{ background: theme.colors.background, padding: '20px', borderRadius: '12px' }}>
                <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
                  Status
                </p>
                <p style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: getStatusColor(selectedDriver.status),
                  margin: 0,
                  textTransform: 'capitalize'
                }}>
                  {selectedDriver.status.replace('_', ' ')}
                </p>
              </div>

              <div style={{ background: theme.colors.background, padding: '20px', borderRadius: '12px' }}>
                <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
                  Hours Today
                </p>
                <p style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary, margin: 0 }}>
                  {selectedDriver.hoursToday}h / 11h
                </p>
              </div>

              <div style={{ background: theme.colors.background, padding: '20px', borderRadius: '12px' }}>
                <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
                  Rating
                </p>
                <p style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary, margin: 0 }}>
                  ⭐ {selectedDriver.rating} / 5.0
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setSelectedDriver(null)}
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
                <Edit size={18} />
                Edit Driver
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  )
}

export default DriversPage

