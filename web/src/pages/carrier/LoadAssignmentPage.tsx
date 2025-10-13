import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../../contexts/ThemeContext'
import PageContainer from '../../components/PageContainer'
import DriverAssignmentModal from '../../components/DriverAssignmentModal'
import PendingDriverAcceptance from '../../components/PendingDriverAcceptance'
import DriverLoadAcceptance from '../../components/DriverLoadAcceptance'
import { 
  Truck, Package, MapPin, Clock, CheckCircle, AlertCircle,
  DollarSign, TrendingUp, Calendar, User, Search, Filter,
  RefreshCw, ChevronDown, MessageSquare
} from 'lucide-react'
import type { Load } from '../../types'
import { formatNumber, formatCurrency, formatCompactCurrency, formatPercentage } from '../../utils/formatters';

interface Driver {
  id: string
  name: string
  phone: string
  cdlClass: string
  cdlVerified: boolean
  phoneVerified: boolean
  truckNumber: string
  trailerNumber: string
  equipmentType: string
  status: 'available' | 'on_load' | 'off_duty'
  availableUntil?: string
  acceptanceRate: number
  totalLoadsCompleted: number
  rating: number
  currentLocation?: string
  distanceFromPickup?: number
}

const LoadAssignmentPage = () => {
  const { theme } = useTheme()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedLoadForAssignment, setSelectedLoadForAssignment] = useState<Load | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  // Mock data - In production, this would come from API
  const [availableLoads, setAvailableLoads] = useState<Load[]>([
    {
      id: 'LD-5432',
      orgId: 'org1',
      shipperId: 'shipper1',
      loadType: 'construction',
      rateMode: 'per_load',
      haulType: 'flatbed',
      commodity: 'Steel Beams',
      equipmentType: 'Flatbed',
      origin: {
        city: 'Dallas',
        state: 'TX',
        zip: '75201',
        address: '123 Industrial Blvd'
      },
      destination: {
        city: 'Houston',
        state: 'TX',
        zip: '77001',
        address: '456 Construction Ave'
      },
      rate: 850,
      miles: 245,
      grossRevenue: 850,
      pickupDate: '2024-11-16T08:00:00Z',
      deliveryDate: '2024-11-17T16:00:00Z',
      overweightPermit: false,
      prevailingWage: false,
      publicProject: false,
      requiresEscort: false,
      status: 'available',
      createdAt: '2024-11-15T10:00:00Z',
      updatedAt: '2024-11-15T10:00:00Z'
    },
    {
      id: 'LD-5433',
      orgId: 'org1',
      shipperId: 'shipper2',
      loadType: 'construction',
      rateMode: 'per_load',
      haulType: 'end_dump',
      commodity: 'Gravel',
      equipmentType: 'End Dump',
      origin: {
        city: 'Austin',
        state: 'TX',
        zip: '78701',
        address: '789 Quarry Rd'
      },
      destination: {
        city: 'San Antonio',
        state: 'TX',
        zip: '78201',
        address: '321 Site Lane'
      },
      rate: 450,
      miles: 80,
      grossRevenue: 450,
      pickupDate: '2024-11-16T10:00:00Z',
      deliveryDate: '2024-11-16T14:00:00Z',
      overweightPermit: false,
      prevailingWage: false,
      publicProject: false,
      requiresEscort: false,
      status: 'available',
      createdAt: '2024-11-15T11:00:00Z',
      updatedAt: '2024-11-15T11:00:00Z'
    }
  ])

  const [pendingLoads, setPendingLoads] = useState<Load[]>([
    {
      id: 'LD-5434',
      orgId: 'org1',
      shipperId: 'shipper1',
      carrierId: 'carrier1',
      driverId: 'driver2',
      driverName: 'Mike Johnson',
      driverPhone: '(214) 555-1234',
      loadType: 'construction',
      rateMode: 'per_load',
      haulType: 'tri_axle_dump',
      commodity: 'Sand',
      equipmentType: 'Tri-Axle Dump',
      origin: {
        city: 'Fort Worth',
        state: 'TX',
        zip: '76101'
      },
      destination: {
        city: 'Dallas',
        state: 'TX',
        zip: '75201'
      },
      rate: 320,
      miles: 35,
      grossRevenue: 320,
      pickupDate: '2024-11-16T09:00:00Z',
      deliveryDate: '2024-11-16T12:00:00Z',
      overweightPermit: false,
      prevailingWage: false,
      publicProject: false,
      requiresEscort: false,
      status: 'pending_driver',
      driverAcceptanceStatus: 'PENDING',
      driverAssignedAt: new Date(Date.now() - 4 * 60000).toISOString(), // 4 minutes ago
      driverAcceptanceExpiry: new Date(Date.now() + 26 * 60000).toISOString(), // 26 minutes from now
      smsVerificationSent: true,
      createdAt: '2024-11-15T12:00:00Z',
      updatedAt: new Date().toISOString()
    }
  ])

  const [acceptedLoads, setAcceptedLoads] = useState<Load[]>([])

  const [drivers, setDrivers] = useState<Driver[]>([
    {
      id: 'driver1',
      name: 'John Smith',
      phone: '(903) 388-5470',
      cdlClass: 'Class A',
      cdlVerified: true,
      phoneVerified: true,
      truckNumber: '0001',
      trailerNumber: '0002',
      equipmentType: 'Flatbed',
      status: 'available',
      acceptanceRate: 95,
      totalLoadsCompleted: 156,
      rating: 4.8,
      distanceFromPickup: 15
    },
    {
      id: 'driver2',
      name: 'Mike Johnson',
      phone: '(214) 555-1234',
      cdlClass: 'Class A',
      cdlVerified: true,
      phoneVerified: true,
      truckNumber: '0003',
      trailerNumber: '0004',
      equipmentType: 'End Dump',
      status: 'available',
      acceptanceRate: 88,
      totalLoadsCompleted: 98,
      rating: 4.6,
      distanceFromPickup: 25
    },
    {
      id: 'driver3',
      name: 'Sarah Williams',
      phone: '(972) 555-5678',
      cdlClass: 'Class A',
      cdlVerified: true,
      phoneVerified: true,
      truckNumber: '0005',
      trailerNumber: '0006',
      equipmentType: 'Tri-Axle Dump',
      status: 'on_load',
      availableUntil: '2024-11-15T18:00:00Z',
      acceptanceRate: 92,
      totalLoadsCompleted: 132,
      rating: 4.9,
      distanceFromPickup: 8
    }
  ])

  const handleAssignDriver = async (driverId: string, timeoutMinutes: number, notes?: string) => {
    // In production, this would make an API call
    const driver = drivers.find(d => d.id === driverId)
    if (!driver || !selectedLoadForAssignment) return

    const expiryTime = new Date(Date.now() + timeoutMinutes * 60000).toISOString()

    const updatedLoad: Load = {
      ...selectedLoadForAssignment,
      driverId: driver.id,
      driverName: driver.name,
      driverPhone: driver.phone,
      status: 'pending_driver',
      driverAcceptanceStatus: 'PENDING',
      driverAssignedAt: new Date().toISOString(),
      driverAcceptanceExpiry: expiryTime,
      smsVerificationSent: true,
      internalNotes: notes
    }

    // Move from available to pending
    setAvailableLoads(prev => prev.filter(l => l.id !== selectedLoadForAssignment.id))
    setPendingLoads(prev => [...prev, updatedLoad])
    setSelectedLoadForAssignment(null)

    // Simulate SMS send notification
    console.log(`SMS sent to ${driver.phone} for load ${updatedLoad.id}`)
  }

  const handleReassignLoad = (loadId: string) => {
    const load = pendingLoads.find(l => l.id === loadId)
    if (!load) return

    // Reset load back to available
    const resetLoad: Load = {
      ...load,
      driverId: undefined,
      driverName: undefined,
      driverPhone: undefined,
      status: 'available',
      driverAcceptanceStatus: undefined,
      driverAssignedAt: undefined,
      driverAcceptedAt: undefined,
      driverAcceptanceExpiry: undefined,
      smsVerificationSent: false
    }

    setPendingLoads(prev => prev.filter(l => l.id !== loadId))
    setAvailableLoads(prev => [...prev, resetLoad])
  }

  const handleCancelAssignment = (loadId: string) => {
    handleReassignLoad(loadId)
  }

  const filteredAvailableLoads = availableLoads.filter(load => {
    const matchesSearch = 
      load.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      load.origin.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      load.destination.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      load.commodity.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesSearch
  })

  return (
    <PageContainer>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', color: theme.colors.textPrimary, marginBottom: '8px' }}>
          Load Assignment
        </h1>
        <p style={{ fontSize: '16px', color: theme.colors.textSecondary }}>
          Assign loads to verified drivers and track acceptance status
        </p>
      </div>

      {/* Dashboard Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div style={{
          padding: '24px',
          background: theme.colors.backgroundSecondary,
          borderRadius: '12px',
          border: `1px solid ${theme.colors.border}`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div>
              <div style={{ fontSize: '14px', color: theme.colors.textSecondary, marginBottom: '8px' }}>
                Available Loads
              </div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: theme.colors.textPrimary }}>
                {availableLoads.length}
              </div>
            </div>
            <div style={{
              padding: '12px',
              background: `${theme.colors.info}20`,
              borderRadius: '12px'
            }}>
              <Package size={24} color={theme.colors.info} />
            </div>
          </div>
          <div style={{ fontSize: '12px', color: theme.colors.textSecondary }}>
            Ready for driver assignment
          </div>
        </div>

        <div style={{
          padding: '24px',
          background: theme.colors.backgroundSecondary,
          borderRadius: '12px',
          border: `1px solid ${theme.colors.border}`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div>
              <div style={{ fontSize: '14px', color: theme.colors.textSecondary, marginBottom: '8px' }}>
                Pending Acceptance
              </div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: theme.colors.warning }}>
                {pendingLoads.length}
              </div>
            </div>
            <div style={{
              padding: '12px',
              background: `${theme.colors.warning}20`,
              borderRadius: '12px'
            }}>
              <Clock size={24} color={theme.colors.warning} />
            </div>
          </div>
          <div style={{ fontSize: '12px', color: theme.colors.textSecondary }}>
            Waiting for driver response
          </div>
        </div>

        <div style={{
          padding: '24px',
          background: theme.colors.backgroundSecondary,
          borderRadius: '12px',
          border: `1px solid ${theme.colors.border}`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div>
              <div style={{ fontSize: '14px', color: theme.colors.textSecondary, marginBottom: '8px' }}>
                SMS Verification
              </div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: theme.colors.success }}>
                {acceptedLoads.length}
              </div>
            </div>
            <div style={{
              padding: '12px',
              background: `${theme.colors.success}20`,
              borderRadius: '12px'
            }}>
              <MessageSquare size={24} color={theme.colors.success} />
            </div>
          </div>
          <div style={{ fontSize: '12px', color: theme.colors.textSecondary }}>
            Awaiting SMS verification
          </div>
        </div>

        <div style={{
          padding: '24px',
          background: theme.colors.backgroundSecondary,
          borderRadius: '12px',
          border: `1px solid ${theme.colors.border}`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div>
              <div style={{ fontSize: '14px', color: theme.colors.textSecondary, marginBottom: '8px' }}>
                Acceptance Rate Today
              </div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: theme.colors.success }}>
                94%
              </div>
            </div>
            <div style={{
              padding: '12px',
              background: `${theme.colors.success}20`,
              borderRadius: '12px'
            }}>
              <TrendingUp size={24} color={theme.colors.success} />
            </div>
          </div>
          <div style={{ fontSize: '12px', color: theme.colors.textSecondary }}>
            Avg response: 8 minutes
          </div>
        </div>
      </div>

      {/* Pending Driver Acceptance Section */}
      {pendingLoads.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: theme.colors.textPrimary, margin: 0 }}>
              ⏳ Pending Driver Acceptance ({pendingLoads.length})
            </h2>
            <button
              onClick={() => setRefreshKey(prev => prev + 1)}
              style={{
                padding: '8px 16px',
                background: 'transparent',
                color: theme.colors.primary,
                border: `1px solid ${theme.colors.primary}`,
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>

          {pendingLoads.map(load => (
            <PendingDriverAcceptance
              key={load.id}
              load={load}
              onReassign={handleReassignLoad}
              onCancel={handleCancelAssignment}
            />
          ))}
        </div>
      )}

      {/* Available Loads Section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: theme.colors.textPrimary, margin: 0 }}>
            📦 Available Loads ({availableLoads.length})
          </h2>
        </div>

        {/* Search and Filters */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search 
              size={20} 
              color={theme.colors.textSecondary}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)'
              }}
            />
            <input
              type="text"
              placeholder="Search loads by ID, location, or commodity..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 12px 12px 44px',
                background: theme.colors.backgroundSecondary,
                border: `2px solid ${theme.colors.border}`,
                borderRadius: '8px',
                fontSize: '14px',
                color: theme.colors.textPrimary,
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* Loads List */}
        <div style={{ display: 'grid', gap: '16px' }}>
          {filteredAvailableLoads.length === 0 ? (
            <div style={{
              padding: '60px',
              textAlign: 'center',
              background: theme.colors.backgroundSecondary,
              borderRadius: '12px',
              border: `1px solid ${theme.colors.border}`
            }}>
              <Package size={48} color={theme.colors.textSecondary} style={{ marginBottom: '16px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                No Available Loads
              </h3>
              <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: 0 }}>
                All loads have been assigned to drivers
              </p>
            </div>
          ) : (
            filteredAvailableLoads.map(load => (
              <div
                key={load.id}
                style={{
                  padding: '20px',
                  background: theme.colors.backgroundSecondary,
                  borderRadius: '12px',
                  border: `1px solid ${theme.colors.border}`,
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: theme.colors.textPrimary, marginBottom: '4px' }}>
                      Load #{load.id}
                    </h3>
                    <div style={{ fontSize: '14px', color: theme.colors.textSecondary }}>
                      Customer: {load.commodity} Delivery
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedLoadForAssignment(load)}
                    style={{
                      padding: '10px 20px',
                      background: theme.colors.primary,
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <User size={16} />
                    Assign Driver
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <MapPin size={14} color={theme.colors.success} />
                      <span style={{ fontSize: '12px', fontWeight: '600', color: theme.colors.textSecondary }}>
                        ORIGIN
                      </span>
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary }}>
                      {load.origin.city}, {load.origin.state}
                    </div>
                    <div style={{ fontSize: '12px', color: theme.colors.textSecondary }}>
                      {load.origin.zip}
                    </div>
                  </div>

                  <div style={{ fontSize: '24px', color: theme.colors.textSecondary }}>→</div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <MapPin size={14} color={theme.colors.error} />
                      <span style={{ fontSize: '12px', fontWeight: '600', color: theme.colors.textSecondary }}>
                        DESTINATION
                      </span>
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary }}>
                      {load.destination.city}, {load.destination.state}
                    </div>
                    <div style={{ fontSize: '12px', color: theme.colors.textSecondary }}>
                      {load.destination.zip}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' }}>
                  <div style={{
                    padding: '12px',
                    background: theme.colors.backgroundPrimary,
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <DollarSign size={16} color={theme.colors.success} style={{ marginBottom: '4px' }} />
                    <div style={{ fontSize: '16px', fontWeight: '700', color: theme.colors.textPrimary }}>
                      ${formatNumber(load.rate, "0")}
                    </div>
                    <div style={{ fontSize: '11px', color: theme.colors.textSecondary }}>Rate</div>
                  </div>

                  <div style={{
                    padding: '12px',
                    background: theme.colors.backgroundPrimary,
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <Calendar size={16} color={theme.colors.primary} style={{ marginBottom: '4px' }} />
                    <div style={{ fontSize: '14px', fontWeight: '700', color: theme.colors.textPrimary }}>
                      {new Date(load.pickupDate).toLocaleDateString()}
                    </div>
                    <div style={{ fontSize: '11px', color: theme.colors.textSecondary }}>Pickup</div>
                  </div>

                  <div style={{
                    padding: '12px',
                    background: theme.colors.backgroundPrimary,
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <Package size={16} color={theme.colors.warning} style={{ marginBottom: '4px' }} />
                    <div style={{ fontSize: '14px', fontWeight: '700', color: theme.colors.textPrimary }}>
                      {load.commodity}
                    </div>
                    <div style={{ fontSize: '11px', color: theme.colors.textSecondary }}>Commodity</div>
                  </div>

                  <div style={{
                    padding: '12px',
                    background: theme.colors.backgroundPrimary,
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <Truck size={16} color={theme.colors.info} style={{ marginBottom: '4px' }} />
                    <div style={{ fontSize: '14px', fontWeight: '700', color: theme.colors.textPrimary }}>
                      {load.equipmentType}
                    </div>
                    <div style={{ fontSize: '11px', color: theme.colors.textSecondary }}>Equipment</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Driver Assignment Modal */}
      {selectedLoadForAssignment && (
        <DriverAssignmentModal
          load={selectedLoadForAssignment}
          drivers={drivers}
          onAssign={handleAssignDriver}
          onClose={() => setSelectedLoadForAssignment(null)}
        />
      )}
    </PageContainer>
  )
}

export default LoadAssignmentPage

