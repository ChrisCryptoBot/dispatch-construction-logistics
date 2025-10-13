import React, { useState } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import PageContainer from '../../components/shared/PageContainer'
import Card from '../../components/ui/Card'
import { equipmentTypes } from '../../services/pricingEngine'
import { 
  MapPin, Navigation, TrendingUp, DollarSign, Truck, 
  Clock, Plus, Eye, Edit, Search, CheckCircle, AlertCircle,
  User, Phone, Package, Save, X, Edit2, Trash2, Calendar
} from 'lucide-react'

interface Zone {
  id: string
  name: string
  type: 'metro' | 'regional' | 'interstate'
  radius: number
  centerPoint: string
  activeLoads: number
  avgRate: number
  avgDistance: number
  vehiclesAssigned: number
  monthlyRevenue: number
  utilizationRate: number
  status: 'active' | 'inactive'
}

interface TruckPosting {
  id: string
  equipmentType: string
  truckNumber: string
  trailerNumber: string
  driver: string
  driverPhone: string
  currentLocation: string
  city: string
  state: string
  zipCode: string
  availableDate: string
  availableTime: string
  radius: number // miles willing to travel
  ratePerTon?: number
  ratePerMile?: number
  capacity: number
  preferredMaterials: string[]
  notes?: string
  status: 'active' | 'booked' | 'inactive'
  postedDate: string
}

const ZoneManagementPage = () => {
  const { theme } = useTheme()
  const [activeTab, setActiveTab] = useState<'zones' | 'trucks'>('zones')
  
  const [zones, setZones] = useState<Zone[]>([
    {
      id: 'Z-001',
      name: 'Dallas Metro',
      type: 'metro',
      radius: 50,
      centerPoint: 'Dallas, TX',
      activeLoads: 24,
      avgRate: 42,
      avgDistance: 28,
      vehiclesAssigned: 8,
      monthlyRevenue: 145000,
      utilizationRate: 89,
      status: 'active'
    },
    {
      id: 'Z-002',
      name: 'Fort Worth Zone',
      type: 'metro',
      radius: 50,
      centerPoint: 'Fort Worth, TX',
      activeLoads: 18,
      avgRate: 38,
      avgDistance: 32,
      vehiclesAssigned: 6,
      monthlyRevenue: 98000,
      utilizationRate: 82,
      status: 'active'
    },
    {
      id: 'Z-003',
      name: 'Houston Regional',
      type: 'regional',
      radius: 150,
      centerPoint: 'Houston, TX',
      activeLoads: 15,
      avgRate: 65,
      avgDistance: 95,
      vehiclesAssigned: 5,
      monthlyRevenue: 125000,
      utilizationRate: 76,
      status: 'active'
    },
    {
      id: 'Z-004',
      name: 'Austin Metro',
      type: 'metro',
      radius: 50,
      centerPoint: 'Austin, TX',
      activeLoads: 12,
      avgRate: 45,
      avgDistance: 30,
      vehiclesAssigned: 4,
      monthlyRevenue: 72000,
      utilizationRate: 71,
      status: 'active'
    }
  ])

  // Truck Posting State
  const [truckPostings, setTruckPostings] = useState<TruckPosting[]>([
    {
      id: '1',
      equipmentType: 'tri_axle_dump',
      truckNumber: '0001',
      trailerNumber: '0002',
      driver: 'John Smith',
      driverPhone: '(903) 388-5470',
      currentLocation: 'Dallas, TX',
      city: 'Dallas',
      state: 'TX',
      zipCode: '75201',
      availableDate: '2024-11-20',
      availableTime: '06:00',
      radius: 150,
      ratePerTon: 7.50,
      capacity: 18,
      preferredMaterials: ['Crushed Stone', 'Gravel', 'Sand'],
      notes: 'Specializes in aggregate hauling',
      status: 'active',
      postedDate: '2024-11-19'
    }
  ])
  const [showTruckModal, setShowTruckModal] = useState(false)
  const [editingTruck, setEditingTruck] = useState<TruckPosting | null>(null)
  const [truckFormData, setTruckFormData] = useState<Partial<TruckPosting>>({
    equipmentType: '',
    truckNumber: '',
    trailerNumber: '',
    driver: '',
    driverPhone: '',
    currentLocation: '',
    city: '',
    state: 'TX',
    zipCode: '',
    availableDate: new Date().toISOString().split('T')[0],
    availableTime: '08:00',
    radius: 150,
    capacity: 18,
    preferredMaterials: [],
    notes: '',
    status: 'active'
  })
  
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null)

  const getTypeColor = (type: string) => {
    const colors = {
      metro: theme.colors.info,
      regional: theme.colors.warning,
      interstate: theme.colors.primary
    }
    return colors[type] || theme.colors.textSecondary
  }

  const filteredZones = zones.filter(zone => {
    const matchesSearch = searchTerm === '' || 
      zone.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      zone.centerPoint.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = filterType === 'all' || zone.type === filterType
    
    return matchesSearch && matchesType
  })

  const stats = {
    totalZones: zones.length,
    activeZones: zones.filter(z => z.status === 'active').length,
    totalRevenue: zones.reduce((sum, z) => sum + z.monthlyRevenue, 0),
    avgUtilization: Math.round(zones.reduce((sum, z) => sum + z.utilizationRate, 0) / zones.length),
    // Truck posting stats
    totalTrucks: truckPostings.length,
    activeTrucks: truckPostings.filter(t => t.status === 'active').length,
    bookedTrucks: truckPostings.filter(t => t.status === 'booked').length
  }

  // Truck Posting Functions
  const handleSaveTruckPosting = () => {
    if (!truckFormData.equipmentType || !truckFormData.truckNumber || !truckFormData.city) {
      alert('Please fill in all required fields')
      return
    }

    const equipment = equipmentTypes[truckFormData.equipmentType as keyof typeof equipmentTypes]
    
    if (editingTruck) {
      // Update existing posting
      setTruckPostings(truckPostings.map(t => 
        t.id === editingTruck.id 
          ? { ...editingTruck, ...truckFormData, capacity: equipment?.capacity || truckFormData.capacity || 18 } as TruckPosting
          : t
      ))
      alert('✅ Truck posting updated successfully!')
    } else {
      // Create new posting
      const newPosting: TruckPosting = {
        id: Date.now().toString(),
        ...truckFormData as TruckPosting,
        currentLocation: `${truckFormData.city}, ${truckFormData.state}`,
        capacity: equipment?.capacity || truckFormData.capacity || 18,
        postedDate: new Date().toISOString().split('T')[0]
      }
      setTruckPostings([newPosting, ...truckPostings])
      alert('✅ Truck posted successfully! Customers can now see your availability.')
    }

    // Reset form
    setShowTruckModal(false)
    setEditingTruck(null)
    setTruckFormData({
      equipmentType: '',
      truckNumber: '',
      trailerNumber: '',
      driver: '',
      driverPhone: '',
      currentLocation: '',
      city: '',
      state: 'TX',
      zipCode: '',
      availableDate: new Date().toISOString().split('T')[0],
      availableTime: '08:00',
      radius: 150,
      capacity: 18,
      preferredMaterials: [],
      notes: '',
      status: 'active'
    })
  }

  const handleEditTruck = (posting: TruckPosting) => {
    setEditingTruck(posting)
    setTruckFormData(posting)
    setShowTruckModal(true)
  }

  const handleDeleteTruck = (id: string) => {
    if (confirm('Are you sure you want to remove this truck posting?')) {
      setTruckPostings(truckPostings.filter(t => t.id !== id))
      alert('✅ Truck posting removed')
    }
  }

  const handleToggleTruckStatus = (id: string) => {
    setTruckPostings(truckPostings.map(t => 
      t.id === id 
        ? { ...t, status: t.status === 'active' ? 'inactive' : 'active' as 'active' | 'booked' | 'inactive' }
        : t
    ))
  }

  const truckStatusConfig = {
    active: { color: theme.colors.success, label: 'Available', icon: CheckCircle },
    booked: { color: theme.colors.warning, label: 'Booked', icon: Clock },
    inactive: { color: theme.colors.textSecondary, label: 'Inactive', icon: AlertCircle }
  }

  const headerAction = (
    <button
      onClick={() => alert('Add new zone')}
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
      Create Zone
    </button>
  )

  return (
    <PageContainer
      title="Zone Management & Truck Posting"
      subtitle="Organize operations by geographic zones and manage truck availability"
      icon={MapPin}
      headerAction={headerAction}
    >
      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '4px',
        marginBottom: '24px',
        background: theme.colors.backgroundSecondary,
        padding: '4px',
        borderRadius: '12px',
        width: 'fit-content'
      }}>
        <button
          onClick={() => setActiveTab('zones')}
          style={{
            padding: '12px 24px',
            background: activeTab === 'zones' ? theme.colors.backgroundPrimary : 'transparent',
            color: activeTab === 'zones' ? theme.colors.primary : theme.colors.textSecondary,
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
          <MapPin size={16} />
          Zone Management
        </button>
        <button
          onClick={() => setActiveTab('trucks')}
          style={{
            padding: '12px 24px',
            background: activeTab === 'trucks' ? theme.colors.backgroundPrimary : 'transparent',
            color: activeTab === 'trucks' ? theme.colors.primary : theme.colors.textSecondary,
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
          <Truck size={16} />
          Truck Posting
        </button>
      </div>

      {activeTab === 'zones' ? (
        <>
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
              <MapPin size={28} color={theme.colors.primary} />
            </div>
            <div>
              <p style={{ fontSize: '36px', fontWeight: 'bold', color: theme.colors.textPrimary, margin: 0, lineHeight: 1 }}>
                {stats.totalZones}
              </p>
              <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: '4px 0 0 0' }}>
                Total Zones
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
                {stats.activeZones}
              </p>
              <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: '4px 0 0 0' }}>
                Active Zones
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
              <DollarSign size={28} color={theme.colors.success} />
            </div>
            <div>
              <p style={{ fontSize: '36px', fontWeight: 'bold', color: theme.colors.textPrimary, margin: 0, lineHeight: 1 }}>
                ${(stats.totalRevenue / 1000).toFixed(0)}k
              </p>
              <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: '4px 0 0 0' }}>
                Monthly Revenue
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
              <TrendingUp size={28} color={theme.colors.info} />
            </div>
            <div>
              <p style={{ fontSize: '36px', fontWeight: 'bold', color: theme.colors.textPrimary, margin: 0, lineHeight: 1 }}>
                {stats.avgUtilization}%
              </p>
              <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: '4px 0 0 0' }}>
                Avg Utilization
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
              placeholder="Search zones..."
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
            <option value="metro">Metro</option>
            <option value="regional">Regional</option>
            <option value="interstate">Interstate</option>
          </select>
        </div>
      </Card>

      {/* Zones List */}
      <Card title="Service Zones" icon={<MapPin size={20} color={theme.colors.primary} />}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredZones.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: theme.colors.textSecondary }}>
              <MapPin size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
              <p style={{ fontSize: '18px', margin: 0 }}>No zones found</p>
            </div>
          ) : (
            filteredZones.map((zone) => (
              <div
                key={zone.id}
                style={{
                  background: theme.colors.background,
                  borderRadius: '12px',
                  padding: '20px',
                  border: `1px solid ${theme.colors.border}`,
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
                onClick={() => setSelectedZone(zone)}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                    <div style={{
                      width: '56px',
                      height: '56px',
                      background: `${getTypeColor(zone.type)}20`,
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Navigation size={28} color={getTypeColor(zone.type)} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary, margin: 0 }}>
                          {zone.name}
                        </h3>
                        <span style={{
                          padding: '4px 10px',
                          background: `${getTypeColor(zone.type)}20`,
                          color: getTypeColor(zone.type),
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '600',
                          textTransform: 'capitalize'
                        }}>
                          {zone.type}
                        </span>
                      </div>
                      <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: '0 0 4px 0' }}>
                        <MapPin size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                        {zone.centerPoint} • {zone.radius}mi radius
                      </p>
                      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '13px', color: theme.colors.textSecondary }}>
                        <span>{zone.activeLoads} active loads</span>
                        <span>{zone.vehiclesAssigned} vehicles</span>
                        <span>Avg: {zone.avgDistance}mi @ ${zone.avgRate}/ton</span>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '20px', fontWeight: 'bold', color: theme.colors.success, margin: '0 0 4px 0' }}>
                        ${(zone.monthlyRevenue / 1000).toFixed(0)}k
                      </p>
                      <p style={{ fontSize: '13px', color: theme.colors.textSecondary, margin: 0 }}>
                        {zone.utilizationRate}% utilized
                      </p>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedZone(zone)
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
            ))
          )}
        </div>
      </Card>

      {/* Zone Detail Modal */}
      {selectedZone && (
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
            backdropFilter: 'blur(4px)',
            padding: '20px'
          }}
          onClick={() => setSelectedZone(null)}
        >
          <div
            style={{
              background: theme.colors.backgroundCard,
              borderRadius: '20px',
              padding: '36px',
              maxWidth: '800px',
              width: '100%',
              border: `1px solid ${theme.colors.border}`,
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
              <div>
                <h2 style={{ color: theme.colors.textPrimary, fontSize: '24px', fontWeight: 'bold', margin: '0 0 8px 0' }}>
                  {selectedZone.name}
                </h2>
                <p style={{ color: theme.colors.textSecondary, margin: 0 }}>
                  {selectedZone.type.charAt(0).toUpperCase() + selectedZone.type.slice(1)} Zone • {selectedZone.centerPoint}
                </p>
              </div>
              <button
                onClick={() => setSelectedZone(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: theme.colors.textSecondary,
                  cursor: 'pointer',
                  fontSize: '28px',
                  padding: '0',
                  lineHeight: 1
                }}
              >
                ×
              </button>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '16px',
              marginBottom: '28px'
            }}>
              <div style={{ background: theme.colors.background, padding: '20px', borderRadius: '12px' }}>
                <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
                  Active Loads
                </p>
                <p style={{ fontSize: '28px', fontWeight: 'bold', color: theme.colors.textPrimary, margin: 0 }}>
                  {selectedZone.activeLoads}
                </p>
              </div>

              <div style={{ background: theme.colors.background, padding: '20px', borderRadius: '12px' }}>
                <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
                  Vehicles
                </p>
                <p style={{ fontSize: '28px', fontWeight: 'bold', color: theme.colors.textPrimary, margin: 0 }}>
                  {selectedZone.vehiclesAssigned}
                </p>
              </div>

              <div style={{ background: theme.colors.background, padding: '20px', borderRadius: '12px' }}>
                <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
                  Avg Rate
                </p>
                <p style={{ fontSize: '28px', fontWeight: 'bold', color: theme.colors.success, margin: 0 }}>
                  ${selectedZone.avgRate}
                </p>
              </div>

              <div style={{ background: theme.colors.background, padding: '20px', borderRadius: '12px' }}>
                <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
                  Utilization
                </p>
                <p style={{ fontSize: '28px', fontWeight: 'bold', color: theme.colors.textPrimary, margin: 0 }}>
                  {selectedZone.utilizationRate}%
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setSelectedZone(null)}
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
                Edit Zone
              </button>
            </div>
          </div>
        </div>
      )}
        </>
      ) : (
        <>
          {/* Truck Posting Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
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
                  <Truck size={28} color={theme.colors.primary} />
                </div>
                <div>
                  <p style={{ fontSize: '36px', fontWeight: 'bold', color: theme.colors.textPrimary, margin: 0, lineHeight: 1 }}>
                    {stats.totalTrucks}
                  </p>
                  <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: '4px 0 0 0' }}>
                    Total Posted
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
                    {stats.activeTrucks}
                  </p>
                  <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: '4px 0 0 0' }}>
                    Available
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
                    {stats.bookedTrucks}
                  </p>
                  <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: '4px 0 0 0' }}>
                    Booked
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Post New Truck Button */}
          <div style={{ marginBottom: '24px' }}>
            <button
              onClick={() => {
                setEditingTruck(null)
                setTruckFormData({
                  equipmentType: '',
                  truckNumber: '',
                  trailerNumber: '',
                  driver: '',
                  driverPhone: '',
                  currentLocation: '',
                  city: '',
                  state: 'TX',
                  zipCode: '',
                  availableDate: new Date().toISOString().split('T')[0],
                  availableTime: '08:00',
                  radius: 150,
                  capacity: 18,
                  preferredMaterials: [],
                  notes: '',
                  status: 'active'
                })
                setShowTruckModal(true)
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 28px',
                background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primaryHover})`,
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <Plus size={18} />
              Post New Truck
            </button>
          </div>

          {/* Posted Trucks */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {truckPostings.length === 0 ? (
              <Card>
                <div style={{ 
                  padding: '48px', 
                  textAlign: 'center',
                  color: theme.colors.textSecondary
                }}>
                  <Truck size={48} style={{ margin: '0 auto', marginBottom: '16px', opacity: 0.5 }} />
                  <p style={{ marginBottom: '16px' }}>No trucks posted yet</p>
                  <button
                    onClick={() => setShowTruckModal(true)}
                    style={{
                      padding: '12px 24px',
                      background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primaryHover})`,
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Post Your First Truck
                  </button>
                </div>
              </Card>
            ) : (
              truckPostings.map(posting => {
                const StatusIcon = truckStatusConfig[posting.status].icon
                const equipment = equipmentTypes[posting.equipmentType as keyof typeof equipmentTypes]

                return (
                  <Card key={posting.id}>
                    <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                      {/* Main Info */}
                      <div style={{ flex: '1 1 400px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                          <div>
                            <div style={{
                              display: 'inline-flex',
                              padding: '6px 12px',
                              background: theme.colors.backgroundSecondary,
                              border: `2px solid ${theme.colors.primary}`,
                              borderRadius: '8px',
                              fontSize: '14px',
                              fontWeight: '600',
                              color: theme.colors.primary,
                              marginBottom: '8px'
                            }}>
                              <Truck size={16} style={{ marginRight: '6px' }} />
                              {equipment?.name || posting.equipmentType}
                            </div>
                            <div style={{ fontSize: '13px', color: theme.colors.textSecondary }}>
                              Truck #{posting.truckNumber} • Trailer #{posting.trailerNumber}
                            </div>
                          </div>
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 12px',
                            background: `${truckStatusConfig[posting.status].color}20`,
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '600',
                            color: truckStatusConfig[posting.status].color
                          }}>
                            <StatusIcon size={14} />
                            {truckStatusConfig[posting.status].label}
                          </div>
                        </div>

                        {/* Location & Schedule */}
                        <div style={{ 
                          padding: '16px',
                          background: theme.colors.backgroundSecondary,
                          borderRadius: '8px',
                          marginBottom: '16px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <MapPin size={18} color={theme.colors.primary} />
                            <div>
                              <div style={{ fontSize: '16px', fontWeight: '600', color: theme.colors.textPrimary }}>
                                {posting.currentLocation}
                              </div>
                              <div style={{ fontSize: '12px', color: theme.colors.textSecondary }}>
                                Willing to travel {posting.radius} miles
                              </div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Calendar size={16} color={theme.colors.textSecondary} />
                              <span style={{ fontSize: '13px', color: theme.colors.textSecondary }}>
                                Available: {new Date(posting.availableDate).toLocaleDateString()}
                              </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Clock size={16} color={theme.colors.textSecondary} />
                              <span style={{ fontSize: '13px', color: theme.colors.textSecondary }}>
                                From: {posting.availableTime}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Driver Info */}
                        <div style={{ 
                          display: 'flex',
                          gap: '16px',
                          padding: '12px',
                          background: theme.colors.backgroundTertiary,
                          borderRadius: '8px',
                          marginBottom: '16px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <User size={16} color={theme.colors.textSecondary} />
                            <span style={{ fontSize: '13px', color: theme.colors.textPrimary, fontWeight: '500' }}>
                              {posting.driver}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Phone size={14} color={theme.colors.textSecondary} />
                            <span style={{ fontSize: '12px', color: theme.colors.textSecondary }}>
                              {posting.driverPhone}
                            </span>
                          </div>
                        </div>

                        {/* Notes */}
                        {posting.notes && (
                          <div style={{
                            padding: '12px',
                            background: theme.colors.backgroundSecondary,
                            borderRadius: '8px',
                            borderLeft: `3px solid ${theme.colors.info}`
                          }}>
                            <div style={{ fontSize: '11px', fontWeight: '600', color: theme.colors.textSecondary, marginBottom: '4px' }}>
                              Notes
                            </div>
                            <div style={{ fontSize: '12px', color: theme.colors.textPrimary }}>
                              {posting.notes}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Pricing & Actions */}
                      <div style={{ 
                        flex: '0 0 260px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}>
                        {/* Pricing */}
                        <div>
                          <div style={{ 
                            padding: '16px',
                            background: `${theme.colors.primary}10`,
                            borderRadius: '8px',
                            marginBottom: '16px'
                          }}>
                            <div style={{ fontSize: '11px', color: theme.colors.textSecondary, marginBottom: '4px' }}>
                              Your Rate
                            </div>
                            {posting.ratePerTon ? (
                              <div style={{ fontSize: '28px', fontWeight: '700', color: theme.colors.primary }}>
                                ${posting.ratePerTon.toFixed(2)}
                                <span style={{ fontSize: '14px', fontWeight: '500' }}>/ton</span>
                              </div>
                            ) : posting.ratePerMile ? (
                              <div style={{ fontSize: '28px', fontWeight: '700', color: theme.colors.primary }}>
                                ${posting.ratePerMile.toFixed(2)}
                                <span style={{ fontSize: '14px', fontWeight: '500' }}>/mi</span>
                              </div>
                            ) : (
                              <div style={{ fontSize: '14px', color: theme.colors.textSecondary }}>
                                Open to negotiate
                              </div>
                            )}
                            <div style={{ fontSize: '13px', color: theme.colors.textSecondary, marginTop: '4px' }}>
                              Capacity: {posting.capacity} tons
                            </div>
                          </div>

                          <div style={{ 
                            fontSize: '11px',
                            color: theme.colors.textSecondary,
                            padding: '12px',
                            background: theme.colors.backgroundSecondary,
                            borderRadius: '8px',
                            marginBottom: '16px'
                          }}>
                            Posted: {new Date(posting.postedDate).toLocaleDateString()}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <button
                            onClick={() => handleToggleTruckStatus(posting.id)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              padding: '12px 16px',
                              background: posting.status === 'active' 
                                ? theme.colors.backgroundSecondary
                                : `linear-gradient(135deg, ${theme.colors.success}, #0d9488)`,
                              color: posting.status === 'active' ? theme.colors.textPrimary : 'white',
                              border: `1px solid ${posting.status === 'active' ? theme.colors.border : 'transparent'}`,
                              borderRadius: '8px',
                              fontSize: '13px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            {posting.status === 'active' ? 'Mark Booked' : 'Mark Available'}
                          </button>

                          <button
                            onClick={() => handleEditTruck(posting)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              padding: '12px 16px',
                              background: theme.colors.backgroundSecondary,
                              color: theme.colors.textPrimary,
                              border: `1px solid ${theme.colors.border}`,
                              borderRadius: '8px',
                              fontSize: '13px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <Edit2 size={16} />
                            Edit
                          </button>

                          <button
                            onClick={() => handleDeleteTruck(posting.id)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              padding: '12px 16px',
                              background: theme.colors.backgroundSecondary,
                              color: theme.colors.error,
                              border: `1px solid ${theme.colors.border}`,
                              borderRadius: '8px',
                              fontSize: '13px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <Trash2 size={16} />
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })
            )}
          </div>
        </>
      )}

      {/* Truck Posting Modal */}
      {showTruckModal && (
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
          padding: '24px',
          overflow: 'auto'
        }}>
          <div style={{
            background: theme.colors.backgroundPrimary,
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '800px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '700', color: theme.colors.textPrimary }}>
                {editingTruck ? 'Edit Truck Posting' : 'Post New Truck'}
              </h2>
              <button
                onClick={() => {
                  setShowTruckModal(false)
                  setEditingTruck(null)
                }}
                style={{
                  padding: '6px',
                  background: 'transparent',
                  border: 'none',
                  color: theme.colors.textSecondary,
                  cursor: 'pointer',
                  fontSize: '24px'
                }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Form */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {/* Equipment Type */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '6px' }}>
                  Equipment Type *
                </label>
                <select
                  value={truckFormData.equipmentType}
                  onChange={(e) => {
                    const equipment = equipmentTypes[e.target.value as keyof typeof equipmentTypes]
                    setTruckFormData({ ...truckFormData, equipmentType: e.target.value, capacity: equipment?.capacity || 18 })
                  }}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: theme.colors.backgroundSecondary,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: '8px',
                    color: theme.colors.textPrimary,
                    fontSize: '14px'
                  }}
                >
                  <option value="">Select Equipment</option>
                  {Object.entries(equipmentTypes).map(([key, eq]) => (
                    <option key={key} value={key}>{eq.name}</option>
                  ))}
                </select>
              </div>

              {/* Truck Number */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '6px' }}>
                  Truck Number *
                </label>
                <input
                  type="text"
                  value={truckFormData.truckNumber}
                  onChange={(e) => setTruckFormData({ ...truckFormData, truckNumber: e.target.value })}
                  placeholder="0001"
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: theme.colors.backgroundSecondary,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: '8px',
                    color: theme.colors.textPrimary,
                    fontSize: '14px'
                  }}
                />
              </div>

              {/* Driver Name */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '6px' }}>
                  Driver Name *
                </label>
                <input
                  type="text"
                  value={truckFormData.driver}
                  onChange={(e) => setTruckFormData({ ...truckFormData, driver: e.target.value })}
                  placeholder="John Smith"
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: theme.colors.backgroundSecondary,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: '8px',
                    color: theme.colors.textPrimary,
                    fontSize: '14px'
                  }}
                />
              </div>

              {/* Driver Phone */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '6px' }}>
                  Driver Phone *
                </label>
                <input
                  type="tel"
                  value={truckFormData.driverPhone}
                  onChange={(e) => setTruckFormData({ ...truckFormData, driverPhone: e.target.value })}
                  placeholder="(903) 388-5470"
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: theme.colors.backgroundSecondary,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: '8px',
                    color: theme.colors.textPrimary,
                    fontSize: '14px'
                  }}
                />
              </div>

              {/* City */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '6px' }}>
                  Current City *
                </label>
                <input
                  type="text"
                  value={truckFormData.city}
                  onChange={(e) => setTruckFormData({ ...truckFormData, city: e.target.value })}
                  placeholder="Dallas"
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: theme.colors.backgroundSecondary,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: '8px',
                    color: theme.colors.textPrimary,
                    fontSize: '14px'
                  }}
                />
              </div>

              {/* State */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '6px' }}>
                  State *
                </label>
                <input
                  type="text"
                  value={truckFormData.state}
                  onChange={(e) => setTruckFormData({ ...truckFormData, state: e.target.value })}
                  placeholder="TX"
                  maxLength={2}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: theme.colors.backgroundSecondary,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: '8px',
                    color: theme.colors.textPrimary,
                    fontSize: '14px'
                  }}
                />
              </div>

              {/* Available Date */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '6px' }}>
                  Available Date *
                </label>
                <input
                  type="date"
                  value={truckFormData.availableDate}
                  onChange={(e) => setTruckFormData({ ...truckFormData, availableDate: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: theme.colors.backgroundSecondary,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: '8px',
                    color: theme.colors.textPrimary,
                    fontSize: '14px'
                  }}
                />
              </div>

              {/* Available Time */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '6px' }}>
                  Available From *
                </label>
                <input
                  type="time"
                  value={truckFormData.availableTime}
                  onChange={(e) => setTruckFormData({ ...truckFormData, availableTime: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: theme.colors.backgroundSecondary,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: '8px',
                    color: theme.colors.textPrimary,
                    fontSize: '14px'
                  }}
                />
              </div>

              {/* Radius */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '6px' }}>
                  Willing to Travel (miles)
                </label>
                <input
                  type="number"
                  value={truckFormData.radius}
                  onChange={(e) => setTruckFormData({ ...truckFormData, radius: parseInt(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: theme.colors.backgroundSecondary,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: '8px',
                    color: theme.colors.textPrimary,
                    fontSize: '14px'
                  }}
                />
              </div>

              {/* Rate Per Ton */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '6px' }}>
                  Rate Per Ton (optional)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={truckFormData.ratePerTon || ''}
                  onChange={(e) => setTruckFormData({ ...truckFormData, ratePerTon: parseFloat(e.target.value) })}
                  placeholder="7.50"
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: theme.colors.backgroundSecondary,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: '8px',
                    color: theme.colors.textPrimary,
                    fontSize: '14px'
                  }}
                />
              </div>

              {/* Notes */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '6px' }}>
                  Notes
                </label>
                <textarea
                  value={truckFormData.notes}
                  onChange={(e) => setTruckFormData({ ...truckFormData, notes: e.target.value })}
                  placeholder="Specializes in aggregate hauling, etc."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: theme.colors.backgroundSecondary,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: '8px',
                    color: theme.colors.textPrimary,
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
              <button
                onClick={handleSaveTruckPosting}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '16px',
                  background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primaryHover})`,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                <Save size={18} />
                {editingTruck ? 'Update Posting' : 'Post Truck'}
              </button>
              <button
                onClick={() => {
                  setShowTruckModal(false)
                  setEditingTruck(null)
                }}
                style={{
                  padding: '16px',
                  background: theme.colors.backgroundSecondary,
                  color: theme.colors.textPrimary,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: '8px',
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
    </PageContainer>
  )
}

export default ZoneManagementPage


