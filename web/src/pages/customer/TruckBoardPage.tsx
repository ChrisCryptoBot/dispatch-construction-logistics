import React, { useState } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import PageContainer from '../../components/shared/PageContainer'
import Card from '../../components/ui/Card'
import {
  Truck, MapPin, Phone, Mail, Clock, Navigation, Star, Filter, Search,
  Calendar, Package, Gauge, User, CheckCircle, TrendingUp, MessageSquare
} from 'lucide-react'

interface AvailableTruck {
  id: string
  carrier: string
  carrierRating: number
  totalLoads: number
  driver: string
  driverPhone: string
  equipmentType: string
  truckNumber: string
  trailerNumber: string
  currentLocation: string
  city: string
  state: string
  availableDate: string
  radius: number // miles they're willing to travel
  ratePerMile?: number
  ratePerTon?: number
  capacity: number // tons
  lastUpdated: string
  certifications: string[]
  notes?: string
  preferredMaterials?: string[]
  status: 'available_now' | 'available_soon' | 'booked'
}

const TruckBoardPage = () => {
  const { theme } = useTheme()
  const [searchLocation, setSearchLocation] = useState('')
  const [filterEquipment, setFilterEquipment] = useState<string>('all')
  const [filterRadius, setFilterRadius] = useState<number>(100)
  const [sortBy, setSortBy] = useState<string>('distance')
  const [selectedTruck, setSelectedTruck] = useState<AvailableTruck | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  // Mock data - will be replaced with API calls showing carriers' posted availability
  const [trucks] = useState<AvailableTruck[]>([
    {
      id: '1',
      carrier: 'Poorboy Trucking LLC',
      carrierRating: 4.8,
      totalLoads: 342,
      driver: 'John Smith',
      driverPhone: '(903) 388-5470',
      equipmentType: 'Tri-Axle Dump',
      truckNumber: '0001',
      trailerNumber: '0002',
      currentLocation: 'Dallas, TX',
      city: 'Dallas',
      state: 'TX',
      availableDate: '2024-11-20',
      radius: 150,
      ratePerTon: 7.50,
      capacity: 18,
      lastUpdated: '2 hours ago',
      certifications: ['DOT Compliant', 'OSHA 30'],
      notes: 'Specializes in crushed stone and aggregate',
      preferredMaterials: ['Crushed Stone', 'Gravel', 'Sand'],
      status: 'available_now'
    },
    {
      id: '2',
      carrier: 'ABC Trucking',
      carrierRating: 4.9,
      totalLoads: 567,
      driver: 'Mike Rodriguez',
      driverPhone: '(214) 555-0199',
      equipmentType: 'End Dump',
      truckNumber: '0003',
      trailerNumber: '0004',
      currentLocation: 'Fort Worth, TX',
      city: 'Fort Worth',
      state: 'TX',
      availableDate: '2024-11-20',
      radius: 200,
      ratePerTon: 8.25,
      capacity: 22,
      lastUpdated: '1 hour ago',
      certifications: ['DOT Compliant', 'Hazmat Certified'],
      preferredMaterials: ['Asphalt', 'Hot Mix', 'Aggregate'],
      status: 'available_now'
    },
    {
      id: '3',
      carrier: 'Superior Logistics',
      carrierRating: 4.7,
      totalLoads: 423,
      driver: 'Sarah Johnson',
      driverPhone: '(512) 555-0287',
      equipmentType: 'Side Dump',
      truckNumber: '0005',
      trailerNumber: '0006',
      currentLocation: 'Austin, TX',
      city: 'Austin',
      state: 'TX',
      availableDate: '2024-11-21',
      radius: 100,
      ratePerTon: 7.00,
      capacity: 20,
      lastUpdated: '30 minutes ago',
      certifications: ['DOT Compliant'],
      preferredMaterials: ['Fill Dirt', 'Topsoil', 'Mulch'],
      status: 'available_soon'
    },
    {
      id: '4',
      carrier: 'FastHaul Logistics',
      carrierRating: 4.6,
      totalLoads: 289,
      driver: 'David Martinez',
      driverPhone: '(817) 555-0345',
      equipmentType: 'Belly Dump',
      truckNumber: '0007',
      trailerNumber: '0008',
      currentLocation: 'Waco, TX',
      city: 'Waco',
      state: 'TX',
      availableDate: '2024-11-20',
      radius: 175,
      ratePerTon: 8.75,
      capacity: 24,
      lastUpdated: '4 hours ago',
      certifications: ['DOT Compliant', 'MSHA Certified'],
      notes: 'Best for high-volume projects',
      preferredMaterials: ['Coal', 'Aggregate', 'Salt'],
      status: 'available_now'
    },
    {
      id: '5',
      carrier: 'XYZ Transport',
      carrierRating: 4.9,
      totalLoads: 612,
      driver: 'Lisa Chen',
      driverPhone: '(210) 555-0456',
      equipmentType: 'Flatbed',
      truckNumber: '0009',
      trailerNumber: '0010',
      currentLocation: 'San Antonio, TX',
      city: 'San Antonio',
      state: 'TX',
      availableDate: '2024-11-22',
      radius: 250,
      ratePerMile: 2.85,
      capacity: 25,
      lastUpdated: '6 hours ago',
      certifications: ['DOT Compliant', 'Heavy Haul'],
      preferredMaterials: ['Steel Beams', 'Equipment', 'Machinery'],
      status: 'available_soon'
    }
  ])

  const statusConfig = {
    available_now: { color: theme.colors.success, label: 'Available Now', icon: CheckCircle },
    available_soon: { color: theme.colors.info, label: 'Available Soon', icon: Clock },
    booked: { color: theme.colors.textSecondary, label: 'Booked', icon: Package }
  }

  const equipmentTypes = [
    'Tri-Axle Dump',
    'End Dump',
    'Side Dump',
    'Belly Dump',
    'Flatbed',
    'Step Deck',
    'Lowboy',
    'Double Drop',
    'Super Dump'
  ]

  const filteredTrucks = trucks
    .filter(truck => {
      const matchesEquipment = filterEquipment === 'all' || truck.equipmentType === filterEquipment
      const matchesLocation = !searchLocation || 
        truck.city.toLowerCase().includes(searchLocation.toLowerCase()) ||
        truck.state.toLowerCase().includes(searchLocation.toLowerCase())
      return matchesEquipment && matchesLocation
    })
    .sort((a, b) => {
      switch(sortBy) {
        case 'rating':
          return b.carrierRating - a.carrierRating
        case 'price':
          return (a.ratePerTon || a.ratePerMile || 0) - (b.ratePerTon || b.ratePerMile || 0)
        case 'capacity':
          return b.capacity - a.capacity
        default: // distance
          return 0 // Would calculate actual distance in production
      }
    })

  const stats = {
    totalAvailable: trucks.filter(t => t.status === 'available_now').length,
    totalTrucks: trucks.length,
    avgRating: (trucks.reduce((sum, t) => sum + t.carrierRating, 0) / trucks.length).toFixed(1),
    nearbyCount: trucks.filter(t => t.radius >= 100).length
  }

  const handleRequestQuote = (truck: AvailableTruck) => {
    alert(`Request quote from ${truck.carrier} - Coming soon!`)
  }

  const handleMessageCarrier = (truck: AvailableTruck) => {
    alert(`Message ${truck.carrier} - Messaging integration coming soon!`)
  }

  return (
    <PageContainer>
      {/* Header */}
      <div style={{ marginBottom: theme.spacing.lg }}>
        <div style={{ marginBottom: theme.spacing.md }}>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: '700',
            color: theme.colors.textPrimary,
            marginBottom: theme.spacing.xs
          }}>
            Available Trucks Near You
          </h1>
          <p style={{ color: theme.colors.textSecondary, fontSize: '14px' }}>
            Find carriers posting their truck availability in your area
          </p>
        </div>

        {/* Stats */}
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
                background: `${theme.colors.success}20`,
                borderRadius: theme.borderRadius.md
              }}>
                <CheckCircle size={20} color={theme.colors.success} />
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: theme.colors.textPrimary }}>
                  {stats.totalAvailable}
                </div>
                <div style={{ fontSize: '12px', color: theme.colors.textSecondary }}>Available Now</div>
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
                <Truck size={20} color={theme.colors.primary} />
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: theme.colors.textPrimary }}>
                  {stats.totalTrucks}
                </div>
                <div style={{ fontSize: '12px', color: theme.colors.textSecondary }}>Total Trucks</div>
              </div>
            </div>
          </Card>

          <Card hover={false}>
            <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
              <div style={{ 
                padding: theme.spacing.sm,
                background: `${theme.colors.warning}20`,
                borderRadius: theme.borderRadius.md
              }}>
                <Star size={20} color={theme.colors.warning} />
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: theme.colors.textPrimary }}>
                  {stats.avgRating}
                </div>
                <div style={{ fontSize: '12px', color: theme.colors.textSecondary }}>Avg Rating</div>
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
                <Navigation size={20} color={theme.colors.info} />
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: theme.colors.textPrimary }}>
                  {stats.nearbyCount}
                </div>
                <div style={{ fontSize: '12px', color: theme.colors.textSecondary }}>Within 100mi</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card hover={false}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: theme.spacing.md, alignItems: 'center' }}>
            {/* Location Search */}
            <div style={{ flex: '1 1 250px', position: 'relative' }}>
              <MapPin 
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
                placeholder="Search by city or state..."
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
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

            {/* Equipment Filter */}
            <select
              value={filterEquipment}
              onChange={(e) => setFilterEquipment(e.target.value)}
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
              <option value="all">All Equipment</option>
              {equipmentTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
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
              <option value="distance">Sort by Distance</option>
              <option value="rating">Sort by Rating</option>
              <option value="price">Sort by Price</option>
              <option value="capacity">Sort by Capacity</option>
            </select>

            {/* Radius Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
              <span style={{ fontSize: '14px', color: theme.colors.textSecondary }}>
                Within:
              </span>
              <select
                value={filterRadius}
                onChange={(e) => setFilterRadius(Number(e.target.value))}
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
                <option value={50}>50 miles</option>
                <option value={100}>100 miles</option>
                <option value={150}>150 miles</option>
                <option value={200}>200 miles</option>
                <option value={250}>250+ miles</option>
              </select>
            </div>
          </div>
        </Card>
      </div>

      {/* Truck Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
        {filteredTrucks.length === 0 ? (
          <Card hover={false}>
            <div style={{ 
              padding: theme.spacing.xl, 
              textAlign: 'center',
              color: theme.colors.textSecondary
            }}>
              <Truck size={48} style={{ margin: '0 auto', marginBottom: theme.spacing.md, opacity: 0.5 }} />
              <p>No trucks found matching your filters</p>
            </div>
          </Card>
        ) : (
          filteredTrucks.map(truck => {
            const StatusIcon = statusConfig[truck.status].icon

            return (
              <Card key={truck.id} hover>
                <div style={{ 
                  display: 'flex', 
                  gap: theme.spacing.lg,
                  flexWrap: 'wrap'
                }}>
                  {/* Left Column - Main Info */}
                  <div style={{ flex: '1 1 400px' }}>
                    {/* Header */}
                    <div style={{ marginBottom: theme.spacing.md }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md, marginBottom: theme.spacing.xs }}>
                        <h3 style={{ 
                          fontSize: '20px', 
                          fontWeight: '700', 
                          color: theme.colors.textPrimary,
                          margin: 0
                        }}>
                          {truck.carrier}
                        </h3>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: theme.spacing.xs,
                          padding: '4px 12px',
                          background: `${statusConfig[truck.status].color}20`,
                          borderRadius: theme.borderRadius.full,
                          fontSize: '12px',
                          fontWeight: '600',
                          color: statusConfig[truck.status].color
                        }}>
                          <StatusIcon size={14} />
                          {statusConfig[truck.status].label}
                        </div>
                      </div>

                      {/* Rating & Experience */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md, marginBottom: theme.spacing.sm }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.xs }}>
                          <Star size={16} color={theme.colors.warning} fill={theme.colors.warning} />
                          <span style={{ fontSize: '16px', fontWeight: '600', color: theme.colors.textPrimary }}>
                            {truck.carrierRating}
                          </span>
                        </div>
                        <span style={{ fontSize: '13px', color: theme.colors.textSecondary }}>
                          {truck.totalLoads} completed loads
                        </span>
                      </div>

                      {/* Equipment Type */}
                      <div style={{
                        display: 'inline-flex',
                        padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                        background: theme.colors.backgroundSecondary,
                        border: `2px solid ${theme.colors.primary}`,
                        borderRadius: theme.borderRadius.md,
                        fontSize: '14px',
                        fontWeight: '600',
                        color: theme.colors.primary
                      }}>
                        <Truck size={16} style={{ marginRight: theme.spacing.xs }} />
                        {truck.equipmentType}
                      </div>
                    </div>

                    {/* Location & Availability */}
                    <div style={{ 
                      padding: theme.spacing.md,
                      background: theme.colors.backgroundSecondary,
                      borderRadius: theme.borderRadius.md,
                      marginBottom: theme.spacing.md
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm, marginBottom: theme.spacing.sm }}>
                        <MapPin size={18} color={theme.colors.primary} />
                        <div>
                          <div style={{ fontSize: '16px', fontWeight: '600', color: theme.colors.textPrimary }}>
                            {truck.currentLocation}
                          </div>
                          <div style={{ fontSize: '12px', color: theme.colors.textSecondary }}>
                            Willing to travel {truck.radius} miles
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
                        <Calendar size={16} color={theme.colors.textSecondary} />
                        <span style={{ fontSize: '13px', color: theme.colors.textSecondary }}>
                          Available: {new Date(truck.availableDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Driver Info */}
                    <div style={{ 
                      display: 'flex',
                      gap: theme.spacing.md,
                      padding: theme.spacing.sm,
                      background: theme.colors.backgroundTertiary,
                      borderRadius: theme.borderRadius.md,
                      marginBottom: theme.spacing.md
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.xs }}>
                        <User size={16} color={theme.colors.textSecondary} />
                        <span style={{ fontSize: '13px', color: theme.colors.textPrimary, fontWeight: '500' }}>
                          {truck.driver}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.xs }}>
                        <Phone size={14} color={theme.colors.textSecondary} />
                        <span style={{ fontSize: '12px', color: theme.colors.textSecondary }}>
                          {truck.driverPhone}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.xs }}>
                        <Truck size={14} color={theme.colors.textSecondary} />
                        <span style={{ fontSize: '12px', color: theme.colors.textSecondary }}>
                          #{truck.truckNumber} / #{truck.trailerNumber}
                        </span>
                      </div>
                    </div>

                    {/* Certifications */}
                    {truck.certifications && truck.certifications.length > 0 && (
                      <div style={{ marginBottom: theme.spacing.md }}>
                        <div style={{ fontSize: '11px', color: theme.colors.textSecondary, marginBottom: theme.spacing.xs }}>
                          Certifications
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: theme.spacing.xs }}>
                          {truck.certifications.map((cert, idx) => (
                            <span
                              key={idx}
                              style={{
                                padding: '4px 8px',
                                background: `${theme.colors.success}15`,
                                border: `1px solid ${theme.colors.success}`,
                                borderRadius: theme.borderRadius.sm,
                                fontSize: '11px',
                                fontWeight: '600',
                                color: theme.colors.success
                              }}
                            >
                              ✓ {cert}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Preferred Materials */}
                    {truck.preferredMaterials && truck.preferredMaterials.length > 0 && (
                      <div>
                        <div style={{ fontSize: '11px', color: theme.colors.textSecondary, marginBottom: theme.spacing.xs }}>
                          Preferred Materials
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: theme.spacing.xs }}>
                          {truck.preferredMaterials.map((material, idx) => (
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
                    )}
                  </div>

                  {/* Right Column - Pricing & Actions */}
                  <div style={{ 
                    flex: '0 0 280px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}>
                    {/* Pricing */}
                    <div>
                      <div style={{ 
                        padding: theme.spacing.md,
                        background: `${theme.colors.primary}10`,
                        borderRadius: theme.borderRadius.md,
                        marginBottom: theme.spacing.md
                      }}>
                        <div style={{ fontSize: '11px', color: theme.colors.textSecondary, marginBottom: '4px' }}>
                          Rate
                        </div>
                        {truck.ratePerTon ? (
                          <div style={{ fontSize: '32px', fontWeight: '700', color: theme.colors.primary }}>
                            ${truck.ratePerTon.toFixed(2)}
                            <span style={{ fontSize: '16px', fontWeight: '500' }}>/ton</span>
                          </div>
                        ) : (
                          <div style={{ fontSize: '32px', fontWeight: '700', color: theme.colors.primary }}>
                            ${truck.ratePerMile?.toFixed(2)}
                            <span style={{ fontSize: '16px', fontWeight: '500' }}>/mi</span>
                          </div>
                        )}
                        <div style={{ fontSize: '13px', color: theme.colors.textSecondary, marginTop: '4px' }}>
                          Capacity: {truck.capacity} tons
                        </div>
                      </div>

                      {/* Last Updated */}
                      <div style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: theme.spacing.xs,
                        padding: theme.spacing.sm,
                        background: theme.colors.backgroundSecondary,
                        borderRadius: theme.borderRadius.md,
                        marginBottom: theme.spacing.md
                      }}>
                        <Clock size={14} color={theme.colors.textSecondary} />
                        <span style={{ fontSize: '12px', color: theme.colors.textSecondary }}>
                          Updated {truck.lastUpdated}
                        </span>
                      </div>

                      {/* Notes */}
                      {truck.notes && (
                        <div style={{
                          padding: theme.spacing.sm,
                          background: theme.colors.backgroundSecondary,
                          borderRadius: theme.borderRadius.md,
                          borderLeft: `3px solid ${theme.colors.info}`,
                          marginBottom: theme.spacing.md
                        }}>
                          <div style={{ fontSize: '11px', fontWeight: '600', color: theme.colors.textSecondary, marginBottom: '4px' }}>
                            Notes
                          </div>
                          <div style={{ fontSize: '12px', color: theme.colors.textPrimary }}>
                            {truck.notes}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm }}>
                      <button
                        onClick={() => handleRequestQuote(truck)}
                        disabled={truck.status === 'booked'}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: theme.spacing.xs,
                          padding: theme.spacing.md,
                          background: truck.status === 'booked' 
                            ? theme.colors.backgroundSecondary
                            : `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primaryHover})`,
                          color: truck.status === 'booked' ? theme.colors.textSecondary : 'white',
                          border: 'none',
                          borderRadius: theme.borderRadius.md,
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: truck.status === 'booked' ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s ease',
                          opacity: truck.status === 'booked' ? 0.5 : 1
                        }}
                        onMouseEnter={(e) => {
                          if (truck.status !== 'booked') {
                            e.currentTarget.style.transform = 'translateY(-2px)'
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)'
                        }}
                      >
                        <Package size={18} />
                        Request Quote
                      </button>

                      <button
                        onClick={() => handleMessageCarrier(truck)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: theme.spacing.xs,
                          padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                          background: theme.colors.backgroundSecondary,
                          color: theme.colors.textPrimary,
                          border: `1px solid ${theme.colors.border}`,
                          borderRadius: theme.borderRadius.md,
                          fontSize: '14px',
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
                        <MessageSquare size={16} />
                        Message
                      </button>

                      <button
                        onClick={() => {
                          setSelectedTruck(truck)
                          setShowDetailsModal(true)
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: theme.spacing.xs,
                          padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                          background: theme.colors.backgroundSecondary,
                          color: theme.colors.textPrimary,
                          border: `1px solid ${theme.colors.border}`,
                          borderRadius: theme.borderRadius.md,
                          fontSize: '13px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = theme.colors.primary}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = theme.colors.border}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedTruck && (
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
              {selectedTruck.carrier} - Full Details
            </h2>
            <p style={{ color: theme.colors.textSecondary, marginBottom: theme.spacing.lg }}>
              Detailed carrier and equipment information - Coming soon
            </p>
            <button
              onClick={() => setShowDetailsModal(false)}
              style={{
                width: '100%',
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
              Close
            </button>
          </div>
        </div>
      )}
    </PageContainer>
  )
}

export default TruckBoardPage

