import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../../contexts/ThemeContext'
import PageContainer from '../../components/shared/PageContainer'
import DriverAssignmentModal from '../../components/drivers/DriverAssignmentModal'
import PendingDriverAcceptance from '../../components/drivers/PendingDriverAcceptance'
import DriverLoadAcceptance from '../../components/drivers/DriverLoadAcceptance'
import DriverStatusUpdate from '../../components/dispatch/DriverStatusUpdate'
import { 
  Truck, Package, MapPin, Clock, CheckCircle, AlertCircle,
  DollarSign, TrendingUp, Calendar, User, Search, Filter,
  RefreshCw, ChevronDown, MessageSquare, Navigation, Bell,
  Users, Phone, Send, ArrowUpDown, X, CheckSquare, Square
} from 'lucide-react'
// Load interface for load assignment
interface Load {
  id: string
  loadNumber: string
  origin: { city: string; state: string; zip: string }
  destination: { city: string; state: string; zip: string }
  pickupDate: string
  deliveryDate: string
  equipmentType: string
  weight: string
  rate: number
  status: string
  customerName: string
  driverId?: string
  driverName?: string
  driverPhone?: string
}
import type { DispatchCoordination, DispatchAlert, DriverStatus } from '../../types/dispatch'
import { formatNumber, formatCurrency, formatCompactCurrency, formatPercentage } from '../../utils/formatters';
import { dispatchAPI } from '../../services/dispatchAPI'

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

type SortOption = 'pickupDate' | 'revenue' | 'miles' | 'driverDistance' | 'none'
type LoadStatusFilter = 'all' | 'available' | 'pending_driver' | 'accepted' | 'in_progress' | 'completed'

const LoadAssignmentPage = () => {
  const { theme } = useTheme()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<LoadStatusFilter>('all')
  const [selectedLoadForAssignment, setSelectedLoadForAssignment] = useState<Load | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  
  // Enhanced filtering and sorting
  const [sortBy, setSortBy] = useState<SortOption>('none')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [equipmentFilter, setEquipmentFilter] = useState('all')
  const [dateRangeFilter, setDateRangeFilter] = useState({ from: '', to: '' })
  
  // Bulk operations
  const [selectedLoads, setSelectedLoads] = useState<string[]>([])
  const [showBulkActions, setShowBulkActions] = useState(false)
  
  // Dispatch coordination state
  const [dispatchDrivers, setDispatchDrivers] = useState<DispatchCoordination[]>([])
  const [alerts, setAlerts] = useState<DispatchAlert[]>([])
  const [selectedDispatchDriver, setSelectedDispatchDriver] = useState<DispatchCoordination | null>(null)
  const [showDriverUpdate, setShowDriverUpdate] = useState(false)
  const [activeTab, setActiveTab] = useState<'assignment' | 'coordination'>('assignment')

  // Dispatch coordination mock data
  const mockDrivers: DispatchCoordination[] = [
    {
      driverId: 'driver-1',
      driverName: 'Mike Johnson',
      status: 'EMPTY',
      location: { lat: 30.2672, lng: -97.7431, address: 'Austin, TX', lastUpdated: new Date().toISOString() },
      lastUpdate: new Date().toISOString()
    },
    {
      driverId: 'driver-2', 
      driverName: 'Sarah Williams',
      status: 'LOADED',
      currentLoad: {
        id: 'load-123',
        customerName: 'ABC Construction',
        pickupLocation: 'Austin, TX',
        deliveryLocation: 'San Antonio, TX',
        pickupTime: '2025-10-14T10:00:00Z',
        deliveryTime: '2025-10-14T14:00:00Z'
      },
      location: { lat: 29.4241, lng: -98.4936, address: 'San Antonio, TX', lastUpdated: new Date().toISOString() },
      etaToDelivery: '2025-10-14T14:30:00Z',
      lastUpdate: new Date().toISOString()
    },
    {
      driverId: 'driver-3',
      driverName: 'Carlos Rodriguez',
      status: 'AT_PICKUP',
      currentLoad: {
        id: 'load-124',
        customerName: 'XYZ Corp',
        pickupLocation: 'Houston, TX',
        deliveryLocation: 'Dallas, TX',
        pickupTime: '2025-10-14T11:00:00Z',
        deliveryTime: '2025-10-14T16:00:00Z'
      },
      location: { lat: 29.7604, lng: -95.3698, address: 'Houston, TX', lastUpdated: new Date().toISOString() },
      lastUpdate: new Date().toISOString()
    }
  ]

  const mockAlerts: DispatchAlert[] = [
    {
      id: 'alert-1',
      type: 'DRIVER_EMPTY',
      driverId: 'driver-1',
      driverName: 'Mike Johnson',
      message: 'Driver is empty and ready for new load assignment',
      priority: 'high',
      timestamp: new Date().toISOString(),
      acknowledged: false
    },
    {
      id: 'alert-2',
      type: 'DELIVERY_ETA',
      driverId: 'driver-2',
      driverName: 'Sarah Williams',
      loadId: 'load-123',
      message: 'ETA to delivery: 30 minutes',
      priority: 'medium',
      timestamp: new Date().toISOString(),
      acknowledged: false
    }
  ]

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

  // Dispatch coordination functions
  const loadDispatchData = async () => {
    try {
      setDispatchDrivers(mockDrivers)
      setAlerts(mockAlerts)
    } catch (error) {
      console.error('Failed to load dispatch data:', error)
    }
  }

  const getStatusColor = (status: DriverStatus) => {
    switch (status) {
      case 'EMPTY': return '#10B981'
      case 'LOADED': return '#F59E0B'
      case 'AT_PICKUP': return '#3B82F6'
      case 'AT_DELIVERY': return '#8B5CF6'
      case 'EN_ROUTE_PICKUP': return '#06B6D4'
      case 'EN_ROUTE_DELIVERY': return '#F59E0B'
      case 'OFF_DUTY': return '#6B7280'
      case 'ON_BREAK': return '#F59E0B'
      default: return theme.colors.textSecondary
    }
  }

  const getStatusIcon = (status: DriverStatus) => {
    switch (status) {
      case 'EMPTY': return <CheckCircle size={16} color={getStatusColor(status)} />
      case 'LOADED': return <Truck size={16} color={getStatusColor(status)} />
      case 'AT_PICKUP': return <MapPin size={16} color={getStatusColor(status)} />
      case 'AT_DELIVERY': return <MapPin size={16} color={getStatusColor(status)} />
      case 'EN_ROUTE_PICKUP': return <Navigation size={16} color={getStatusColor(status)} />
      case 'EN_ROUTE_DELIVERY': return <Navigation size={16} color={getStatusColor(status)} />
      case 'OFF_DUTY': return <AlertCircle size={16} color={getStatusColor(status)} />
      case 'ON_BREAK': return <Clock size={16} color={getStatusColor(status)} />
      default: return <Truck size={16} color={getStatusColor(status)} />
    }
  }

  const formatStatus = (status: DriverStatus) => {
    return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
  }

  const handleDispatchDriverSelect = (driver: DispatchCoordination) => {
    setSelectedDispatchDriver(driver)
    setShowDriverUpdate(true)
  }

  const handleDispatchLoadAssign = (driverId: string) => {
    const driver = dispatchDrivers.find(d => d.driverId === driverId)
    if (!driver) return

    // Check if driver already has a load assigned
    if (driver.currentLoad) {
      const confirmOverwrite = window.confirm(
        `${driver.driverName} is already assigned to Load ${driver.currentLoad.id} (${driver.currentLoad.customerName}). Are you sure you want to assign them to a different load?`
      )
      if (!confirmOverwrite) return
    }

    // Check if driver is not in EMPTY status
    if (driver.status !== 'EMPTY') {
      const confirmOverwrite = window.confirm(
        `${driver.driverName} is currently ${driver.status.toLowerCase().replace('_', ' ')}. Are you sure you want to assign them to a new load?`
      )
      if (!confirmOverwrite) return
    }

    // For now, just show available loads for assignment
    // In a full implementation, this would open a load selection modal
    const availableLoadsForDriver = availableLoads.filter(load => {
      // Check if load requirements match driver capabilities
      return load.equipmentType === 'any' || load.equipmentType === 'flatbed' // Simplified check
    })

    if (availableLoadsForDriver.length === 0) {
      alert('No available loads suitable for this driver.')
      return
    }

    // Show first available load for assignment (in real implementation, show selection modal)
    const selectedLoad = availableLoadsForDriver[0]
    const confirmAssignment = window.confirm(
      `Assign Load ${selectedLoad.id} (${selectedLoad.customer}) to ${driver.driverName}?\n\nRoute: ${selectedLoad.pickupLocation} → ${selectedLoad.deliveryLocation}\nRate: $${selectedLoad.rate}`
    )

    if (confirmAssignment) {
      // Update driver status to show they have a load assigned
      setDispatchDrivers(prev => prev.map(d => 
        d.driverId === driverId 
          ? {
              ...d,
              status: 'LOADED' as const,
              currentLoad: {
                id: selectedLoad.id,
                customerName: selectedLoad.customer,
                pickupLocation: selectedLoad.pickupLocation,
                deliveryLocation: selectedLoad.deliveryLocation,
                pickupTime: selectedLoad.pickupDate,
                deliveryTime: selectedLoad.deliveryDate
              }
            }
          : d
      ))
      console.log(`Load ${selectedLoad.id} assigned to ${driver.driverName}`)
    }
  }

  const handleDriverStatusUpdate = (driverId: string, status: string, location?: any, notes?: string) => {
    console.log('Driver status update:', { driverId, status, location, notes })
    setShowDriverUpdate(false)
    setSelectedDispatchDriver(null)
    loadDispatchData()
  }

  const handleNotifyDriver = async (driverId: string, message: string) => {
    try {
      await dispatchAPI.notifyDriver(driverId, message, 'status_request')
      console.log('Driver notification sent')
    } catch (error) {
      console.error('Failed to notify driver:', error)
    }
  }

  // Bulk operations utilities
  const toggleLoadSelection = (loadId: string) => {
    setSelectedLoads(prev => 
      prev.includes(loadId) 
        ? prev.filter(id => id !== loadId)
        : [...prev, loadId]
    )
  }

  const selectAllLoads = () => {
    const allLoadIds = [...availableLoads, ...pendingLoads, ...acceptedLoads].map(load => load.id)
    setSelectedLoads(allLoadIds)
  }

  const clearSelection = () => {
    setSelectedLoads([])
  }

  const handleBulkAssign = () => {
    console.log('Bulk assign loads:', selectedLoads)
    // Implementation for bulk assignment
  }

  const handleBulkSMS = () => {
    console.log('Bulk SMS for loads:', selectedLoads)
    // Implementation for bulk SMS
  }

  // Enhanced filtering and sorting
  const getAllLoads = () => {
    return [...availableLoads, ...pendingLoads, ...acceptedLoads]
  }

  const getFilteredAndSortedLoads = () => {
    const allLoads = getAllLoads()
    
    // Apply filters
    let filtered = allLoads.filter(load => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        load.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        load.origin.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        load.destination.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        load.commodity.toLowerCase().includes(searchTerm.toLowerCase())

      // Status filter
      const matchesStatus = filterStatus === 'all' || load.status === filterStatus

      // Equipment filter
      const matchesEquipment = equipmentFilter === 'all' || load.equipmentType === equipmentFilter

      // Date range filter
      const loadPickupDate = new Date(load.pickupDate)
      const matchesDateFrom = dateRangeFilter.from === '' || loadPickupDate >= new Date(dateRangeFilter.from)
      const matchesDateTo = dateRangeFilter.to === '' || loadPickupDate <= new Date(dateRangeFilter.to)

      return matchesSearch && matchesStatus && matchesEquipment && matchesDateFrom && matchesDateTo
    })

    // Apply sorting
    if (sortBy !== 'none') {
      filtered.sort((a, b) => {
        let comparison = 0
        
        if (sortBy === 'pickupDate') {
          comparison = new Date(a.pickupDate).getTime() - new Date(b.pickupDate).getTime()
        } else if (sortBy === 'revenue') {
          comparison = a.grossRevenue - b.grossRevenue
        } else if (sortBy === 'miles') {
          comparison = a.miles - b.miles
        } else if (sortBy === 'driverDistance') {
          // Use available drivers' distance for comparison
          const aDriver = drivers.find(d => d.status === 'available')
          const bDriver = drivers.find(d => d.status === 'available')
          comparison = (aDriver?.distanceFromPickup || 0) - (bDriver?.distanceFromPickup || 0)
        }
        
        return sortDirection === 'asc' ? comparison : -comparison
      })
    }

    return filtered
  }

  useEffect(() => {
    loadDispatchData()
  }, [])

  const handleAssignDriver = async (driverId: string, timeoutMinutes: number, notes?: string) => {
    // In production, this would make an API call
    const driver = drivers.find(d => d.id === driverId)
    if (!driver || !selectedLoadForAssignment) return

    // Check if load already has a driver assigned
    if (selectedLoadForAssignment.driverId && selectedLoadForAssignment.driverId !== driverId) {
      const confirmOverwrite = window.confirm(
        `Load ${selectedLoadForAssignment.id} is already assigned to ${selectedLoadForAssignment.driverName}. Are you sure you want to replace this assignment with ${driver.name}?`
      )
      if (!confirmOverwrite) return
    }

    // Check if driver already has a load assigned
    const existingDriverLoad = [...availableLoads, ...pendingLoads, ...acceptedLoads].find(
      load => load.driverId === driverId && load.status !== 'completed'
    )
    
    if (existingDriverLoad) {
      const confirmOverwrite = window.confirm(
        `${driver.name} is already assigned to Load ${existingDriverLoad.id}. Are you sure you want to assign them to Load ${selectedLoadForAssignment.id} instead?`
      )
      if (!confirmOverwrite) return
      
      // Remove driver from existing load
      if (existingDriverLoad.status === 'pending_driver') {
        setPendingLoads(prev => prev.filter(l => l.id !== existingDriverLoad.id))
      } else if (existingDriverLoad.status === 'accepted') {
        setAcceptedLoads(prev => prev.filter(l => l.id !== existingDriverLoad.id))
      }
      
      // Reset existing load back to available
      const resetLoad: Load = {
        ...existingDriverLoad,
        driverId: undefined,
        driverName: undefined,
        driverPhone: undefined,
        status: 'available',
        driverAcceptanceStatus: undefined,
        driverAssignedAt: undefined,
        driverAcceptedAt: undefined,
        driverAcceptanceExpiry: undefined,
        smsVerificationSent: false,
        internalNotes: existingDriverLoad.internalNotes
      }
      setAvailableLoads(prev => [...prev, resetLoad])
    }

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
    <PageContainer
      title="Dispatch Command Center"
      subtitle="Load assignment and real-time driver coordination"
      icon={Navigation as any}
    >

      {/* Tab Navigation */}
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        marginBottom: '32px',
        borderBottom: `1px solid ${theme.colors.border}`
      }}>
        <button
          onClick={() => setActiveTab('assignment')}
          style={{
            padding: '12px 24px',
            background: 'transparent',
            color: activeTab === 'assignment' ? theme.colors.textPrimary : theme.colors.textSecondary,
            border: activeTab === 'assignment' ? `1px solid ${theme.colors.border}` : '1px solid transparent',
            borderBottom: 'none',
            borderRadius: '8px 8px 0 0',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            if (activeTab !== 'assignment') {
              e.currentTarget.style.color = theme.colors.textPrimary
              e.currentTarget.style.background = theme.colors.backgroundCardHover
              e.currentTarget.style.borderColor = theme.colors.border
            } else {
              e.currentTarget.style.borderColor = theme.colors.primary
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== 'assignment') {
              e.currentTarget.style.color = theme.colors.textSecondary
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.borderColor = 'transparent'
            } else {
              e.currentTarget.style.borderColor = theme.colors.border
            }
          }}
        >
          Load Assignment
        </button>
        <button
          onClick={() => setActiveTab('coordination')}
          style={{
            padding: '12px 24px',
            background: 'transparent',
            color: activeTab === 'coordination' ? theme.colors.textPrimary : theme.colors.textSecondary,
            border: activeTab === 'coordination' ? `1px solid ${theme.colors.border}` : '1px solid transparent',
            borderBottom: 'none',
            borderRadius: '8px 8px 0 0',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            if (activeTab !== 'coordination') {
              e.currentTarget.style.color = theme.colors.textPrimary
              e.currentTarget.style.background = theme.colors.backgroundCardHover
              e.currentTarget.style.borderColor = theme.colors.border
            } else {
              e.currentTarget.style.borderColor = theme.colors.primary
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== 'coordination') {
              e.currentTarget.style.color = theme.colors.textSecondary
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.borderColor = 'transparent'
            } else {
              e.currentTarget.style.borderColor = theme.colors.border
            }
          }}
        >
          Driver Coordination
        </button>
      </div>

      {/* Assignment Tab Content */}
      {activeTab === 'assignment' && (
        <>
          {/* Dashboard Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div style={{
          padding: '24px',
          background: theme.colors.backgroundCard,
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
              background: theme.colors.backgroundTertiary,
              borderRadius: '12px'
            }}>
              <Package size={24} color={theme.colors.textSecondary} />
            </div>
          </div>
          <div style={{ fontSize: '12px', color: theme.colors.textSecondary }}>
            Ready for driver assignment
          </div>
        </div>

        <div style={{
          padding: '24px',
          background: theme.colors.backgroundCard,
          borderRadius: '12px',
          border: `1px solid ${theme.colors.border}`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div>
              <div style={{ fontSize: '14px', color: theme.colors.textSecondary, marginBottom: '8px' }}>
                Pending Acceptance
              </div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: theme.colors.textPrimary }}>
                {pendingLoads.length}
              </div>
            </div>
            <div style={{
              padding: '12px',
              background: theme.colors.backgroundTertiary,
              borderRadius: '12px'
            }}>
              <Clock size={24} color={theme.colors.textSecondary} />
            </div>
          </div>
          <div style={{ fontSize: '12px', color: theme.colors.textSecondary }}>
            Waiting for driver response
          </div>
        </div>

        <div style={{
          padding: '24px',
          background: theme.colors.backgroundCard,
          borderRadius: '12px',
          border: `1px solid ${theme.colors.border}`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div>
              <div style={{ fontSize: '14px', color: theme.colors.textSecondary, marginBottom: '8px' }}>
                SMS Verification
              </div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: theme.colors.textPrimary }}>
                {acceptedLoads.length}
              </div>
            </div>
            <div style={{
              padding: '12px',
              background: theme.colors.backgroundTertiary,
              borderRadius: '12px'
            }}>
              <MessageSquare size={24} color={theme.colors.textSecondary} />
            </div>
          </div>
          <div style={{ fontSize: '12px', color: theme.colors.textSecondary }}>
            Awaiting SMS verification
          </div>
        </div>

        <div style={{
          padding: '24px',
          background: theme.colors.backgroundCard,
          borderRadius: '12px',
          border: `1px solid ${theme.colors.border}`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div>
              <div style={{ fontSize: '14px', color: theme.colors.textSecondary, marginBottom: '8px' }}>
                Acceptance Rate Today
              </div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: theme.colors.textPrimary }}>
                94%
              </div>
            </div>
            <div style={{
              padding: '12px',
              background: theme.colors.backgroundTertiary,
              borderRadius: '12px'
            }}>
              <TrendingUp size={24} color={theme.colors.textSecondary} />
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
                gap: '6px',
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
            📦 Available Loads ({getFilteredAndSortedLoads().length})
          </h2>
          
          {/* Select All Button */}
          <button
            onClick={selectedLoads.length === getFilteredAndSortedLoads().length ? clearSelection : selectAllLoads}
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
              e.currentTarget.style.color = theme.colors.textPrimary
              e.currentTarget.style.borderColor = theme.colors.primary
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = theme.colors.textSecondary
              e.currentTarget.style.borderColor = theme.colors.border
            }}
          >
            {selectedLoads.length === getFilteredAndSortedLoads().length ? (
              <>
                <X size={16} />
                Deselect All
              </>
            ) : (
              <>
                <CheckSquare size={16} />
                Select All
              </>
            )}
          </button>
        </div>

        {/* Enhanced Search and Filters */}
        <div style={{ 
          background: theme.colors.backgroundSecondary, 
          borderRadius: '12px', 
          padding: '20px', 
          border: `1px solid ${theme.colors.border}`,
          marginBottom: '20px'
        }}>
          {/* Search Bar */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
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
                  background: theme.colors.background,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: theme.colors.textPrimary,
                  outline: 'none'
                }}
              />
            </div>
            
            {/* Bulk Actions */}
            {selectedLoads.length > 0 && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleBulkAssign}
                  style={{
                    padding: '12px 16px',
                    background: '#343a40',
                    color: 'white',
                    border: '1px solid #495057',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Users size={16} />
                  Bulk Assign ({selectedLoads.length})
                </button>
                <button
                  onClick={handleBulkSMS}
                  style={{
                    padding: '12px 16px',
                    background: '#343a40',
                    color: 'white',
                    border: '1px solid #495057',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <MessageSquare size={16} />
                  Bulk SMS ({selectedLoads.length})
                </button>
                <button
                  onClick={clearSelection}
                  style={{
                    padding: '12px 16px',
                    background: theme.colors.background,
                    color: theme.colors.textSecondary,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <X size={16} />
                  Clear
                </button>
              </div>
            )}
          </div>

          {/* Filter Controls */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {/* Status Filter */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: theme.colors.textSecondary, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as LoadStatusFilter)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: theme.name === 'dark' ? '#1e293b' : theme.colors.background,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: '8px',
                  color: theme.colors.textPrimary,
                  fontSize: '14px',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <option value="all">All Statuses</option>
                <option value="available">Available</option>
                <option value="pending_driver">Pending Driver</option>
                <option value="accepted">Accepted</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Equipment Filter */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: theme.colors.textSecondary, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Equipment
              </label>
              <select
                value={equipmentFilter}
                onChange={(e) => setEquipmentFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: theme.name === 'dark' ? '#1e293b' : theme.colors.background,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: '8px',
                  color: theme.colors.textPrimary,
                  fontSize: '14px',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <option value="all">All Equipment</option>
                <option value="End Dump">End Dump</option>
                <option value="Tri-Axle Dump">Tri-Axle Dump</option>
                <option value="Flatbed">Flatbed</option>
                <option value="Mixer">Mixer</option>
                <option value="Lowboy">Lowboy</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: theme.colors.textSecondary, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <ArrowUpDown size={14} style={{ display: 'inline', marginRight: '6px' }} />
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: theme.name === 'dark' ? '#1e293b' : theme.colors.background,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: '8px',
                  color: theme.colors.textPrimary,
                  fontSize: '14px',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <option value="none">None</option>
                <option value="pickupDate">Pickup Date</option>
                <option value="revenue">Revenue</option>
                <option value="miles">Miles</option>
                <option value="driverDistance">Driver Distance</option>
              </select>
            </div>

            {/* Sort Direction */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: theme.colors.textSecondary, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Direction
              </label>
              <select
                value={sortDirection}
                onChange={(e) => setSortDirection(e.target.value as 'asc' | 'desc')}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: theme.name === 'dark' ? '#1e293b' : theme.colors.background,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: '8px',
                  color: theme.colors.textPrimary,
                  fontSize: '14px',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <option value="asc">Low → High</option>
                <option value="desc">High → Low</option>
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: theme.colors.textSecondary, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <Calendar size={14} style={{ display: 'inline', marginRight: '6px' }} />
                Pickup From
              </label>
              <input
                type="date"
                value={dateRangeFilter.from}
                onChange={(e) => setDateRangeFilter(prev => ({ ...prev, from: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: theme.colors.background,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: '8px',
                  color: theme.colors.textPrimary,
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: theme.colors.textSecondary, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Pickup To
              </label>
              <input
                type="date"
                value={dateRangeFilter.to}
                onChange={(e) => setDateRangeFilter(prev => ({ ...prev, to: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: theme.colors.background,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: '8px',
                  color: theme.colors.textPrimary,
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Clear Filters Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
            <button
              onClick={() => {
                setSearchTerm('')
                setFilterStatus('all')
                setEquipmentFilter('all')
                setSortBy('none')
                setSortDirection('asc')
                setDateRangeFilter({ from: '', to: '' })
                clearSelection()
              }}
              style={{
                padding: '8px 16px',
                background: theme.colors.background,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: '8px',
                color: theme.colors.textSecondary,
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#343a40'
                e.currentTarget.style.color = '#FFFFFF'
                e.currentTarget.style.borderColor = theme.colors.primary
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = theme.colors.background
                e.currentTarget.style.color = theme.colors.textSecondary
                e.currentTarget.style.borderColor = theme.colors.border
              }}
            >
              <X size={16} />
              Clear All Filters
            </button>
          </div>
        </div>

        {/* Loads List */}
        <div style={{ display: 'grid', gap: '16px' }}>
          {getFilteredAndSortedLoads().length === 0 ? (
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
            getFilteredAndSortedLoads().map(load => (
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
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    {/* Bulk Selection Checkbox */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleLoadSelection(load.id)
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '4px',
                        transition: 'all 0.2s ease',
                        marginTop: '4px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = theme.colors.backgroundTertiary
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'none'
                      }}
                      title={selectedLoads.includes(load.id) ? 'Deselect load' : 'Select load for bulk actions'}
                    >
                      {selectedLoads.includes(load.id) ? (
                        <CheckSquare size={20} color={theme.colors.primary} />
                      ) : (
                        <Square size={20} color={theme.colors.textSecondary} />
                      )}
                    </button>
                    
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: '700', color: theme.colors.textPrimary, marginBottom: '4px' }}>
                        Load #{load.id}
                      </h3>
                      <div style={{ fontSize: '14px', color: theme.colors.textSecondary }}>
                        Customer: {load.commodity} Delivery
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedLoadForAssignment(load)}
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
                      e.currentTarget.style.color = theme.colors.textPrimary
                      e.currentTarget.style.borderColor = theme.colors.primary
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color = theme.colors.textSecondary
                      e.currentTarget.style.borderColor = theme.colors.border
                    }}
                    title={load.driverId ? `Currently assigned to ${load.driverName}. Click to reassign.` : 'Assign a driver to this load'}
                  >
                    <User size={16} />
                    {load.driverId ? `Reassign Driver` : `Assign Driver`}
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
        </>
      )}

      {/* Coordination Tab Content */}
      {activeTab === 'coordination' && (
        <>
          {/* Dispatch Statistics */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '24px'
          }}>
            <div style={{
              background: theme.colors.backgroundCard,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: '12px',
              padding: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: theme.colors.backgroundTertiary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Users size={24} color={theme.colors.textSecondary} />
              </div>
              <div>
                <p style={{ 
                  fontSize: '32px', 
                  fontWeight: '700', 
                  color: theme.colors.textPrimary,
                  margin: '0 0 4px 0',
                  lineHeight: 1
                }}>
                  {dispatchDrivers.length}
                </p>
                <p style={{ 
                  fontSize: '14px', 
                  color: theme.colors.textSecondary,
                  margin: 0 
                }}>
                  Total Drivers
                </p>
              </div>
            </div>

            <div style={{
              background: theme.colors.backgroundCard,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: '12px',
              padding: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: theme.colors.backgroundTertiary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <CheckCircle size={24} color={theme.colors.textSecondary} />
              </div>
              <div>
                <p style={{ 
                  fontSize: '32px', 
                  fontWeight: '700', 
                  color: theme.colors.textPrimary,
                  margin: '0 0 4px 0',
                  lineHeight: 1
                }}>
                  {dispatchDrivers.filter(d => d.status === 'EMPTY').length}
                </p>
                <p style={{ 
                  fontSize: '14px', 
                  color: theme.colors.textSecondary,
                  margin: 0 
                }}>
                  Empty (Ready)
                </p>
              </div>
            </div>

            <div style={{
              background: theme.colors.backgroundCard,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: '12px',
              padding: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: theme.colors.backgroundTertiary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Package size={24} color={theme.colors.textSecondary} />
              </div>
              <div>
                <p style={{ 
                  fontSize: '32px', 
                  fontWeight: '700', 
                  color: theme.colors.textPrimary,
                  margin: '0 0 4px 0',
                  lineHeight: 1
                }}>
                  {dispatchDrivers.filter(d => d.status === 'LOADED').length}
                </p>
                <p style={{ 
                  fontSize: '14px', 
                  color: theme.colors.textSecondary,
                  margin: 0 
                }}>
                  Loaded (En Route)
                </p>
              </div>
            </div>

            <div style={{
              background: theme.colors.backgroundCard,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: '12px',
              padding: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: theme.colors.backgroundTertiary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Bell size={24} color={theme.colors.textSecondary} />
              </div>
              <div>
                <p style={{ 
                  fontSize: '32px', 
                  fontWeight: '700', 
                  color: theme.colors.textPrimary,
                  margin: '0 0 4px 0',
                  lineHeight: 1
                }}>
                  {alerts.length}
                </p>
                <p style={{ 
                  fontSize: '14px', 
                  color: theme.colors.textSecondary,
                  margin: 0 
                }}>
                  Active Alerts
                </p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: selectedDispatchDriver ? '1fr 400px' : '1fr',
            gap: '24px',
            transition: 'grid-template-columns 0.3s ease'
          }}>
            {/* Dispatch Panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Alerts Section */}
              {alerts.length > 0 && (
                <div style={{
                  background: theme.colors.backgroundCard,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: '12px',
                  padding: '16px'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    marginBottom: '12px' 
                  }}>
                    <Bell size={16} color={theme.colors.primary} />
                    <h3 style={{ 
                      fontSize: '16px', 
                      fontWeight: '600', 
                      color: theme.colors.textPrimary,
                      margin: 0 
                    }}>
                      Dispatch Alerts ({alerts.length})
                    </h3>
                  </div>
                  
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      style={{
                        padding: '12px',
                        background: alert.priority === 'high' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                        border: `1px solid ${alert.priority === 'high' ? '#EF4444' : '#3B82F6'}`,
                        borderRadius: '8px',
                        marginBottom: '8px'
                      }}
                    >
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'flex-start' 
                      }}>
                        <div>
                          <p style={{ 
                            fontSize: '14px', 
                            fontWeight: '600', 
                            color: theme.colors.textPrimary,
                            margin: '0 0 4px 0' 
                          }}>
                            {alert.driverName}
                          </p>
                          <p style={{ 
                            fontSize: '12px', 
                            color: theme.colors.textSecondary,
                            margin: 0 
                          }}>
                            {alert.message}
                          </p>
                        </div>
                        <button
                          onClick={() => handleNotifyDriver(alert.driverId, 'Please confirm your current status')}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: theme.colors.primary,
                            cursor: 'pointer',
                            padding: '4px'
                          }}
                        >
                          <MessageSquare size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Drivers Section */}
              <div style={{
                background: theme.colors.backgroundCard,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: '12px',
                padding: '16px'
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  marginBottom: '16px' 
                }}>
                  <h3 style={{ 
                    fontSize: '16px', 
                    fontWeight: '600', 
                    color: theme.colors.textPrimary,
                    margin: 0 
                  }}>
                    Driver Status ({dispatchDrivers.length})
                  </h3>
                  <button
                    onClick={loadDispatchData}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: theme.colors.primary,
                      cursor: 'pointer',
                      padding: '4px'
                    }}
                  >
                    <RefreshCw size={16} />
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {dispatchDrivers.map((driver) => (
                    <div
                      key={driver.driverId}
                      onClick={() => handleDispatchDriverSelect(driver)}
                      style={{
                        padding: '12px',
                        background: selectedDispatchDriver?.driverId === driver.driverId 
                          ? theme.colors.backgroundHover 
                          : 'transparent',
                        border: `1px solid ${theme.colors.border}`,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        if (selectedDispatchDriver?.driverId !== driver.driverId) {
                          e.currentTarget.style.background = theme.colors.backgroundHover
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedDispatchDriver?.driverId !== driver.driverId) {
                          e.currentTarget.style.background = 'transparent'
                        }
                      }}
                    >
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'flex-start',
                        marginBottom: '8px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {getStatusIcon(driver.status)}
                          <div>
                            <p style={{ 
                              fontSize: '14px', 
                              fontWeight: '600', 
                              color: theme.colors.textPrimary,
                              margin: '0 0 2px 0' 
                            }}>
                              {driver.driverName}
                            </p>
                            <p style={{ 
                              fontSize: '12px', 
                              color: getStatusColor(driver.status),
                              margin: 0,
                              fontWeight: '500'
                            }}>
                              {formatStatus(driver.status)}
                            </p>
                          </div>
                        </div>
                        
                        {driver.status === 'EMPTY' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDispatchLoadAssign(driver.driverId)
                            }}
                            style={{
                              background: 'transparent',
                              color: theme.colors.textSecondary,
                              border: `1px solid ${theme.colors.border}`,
                              borderRadius: '8px',
                              padding: '12px 24px',
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
                            title="Assign a new load to this driver"
                          >
                            Assign Load
                          </button>
                        )}
                        
                        {driver.status !== 'EMPTY' && driver.status !== 'LOADED' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDispatchLoadAssign(driver.driverId)
                            }}
                            style={{
                              background: 'transparent',
                              color: theme.colors.textSecondary,
                              border: `1px solid ${theme.colors.border}`,
                              borderRadius: '8px',
                              padding: '12px 24px',
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
                            title={`Driver is currently ${driver.status.toLowerCase().replace('_', ' ')}. Click to assign new load.`}
                          >
                            Reassign Load
                          </button>
                        )}
                      </div>

                      {driver.currentLoad && (
                        <div style={{
                          padding: '8px',
                          background: theme.colors.backgroundSecondary,
                          borderRadius: '6px',
                          marginBottom: '8px'
                        }}>
                          <p style={{ 
                            fontSize: '12px', 
                            fontWeight: '600', 
                            color: theme.colors.textPrimary,
                            margin: '0 0 4px 0' 
                          }}>
                            Current Load: {driver.currentLoad.customerName}
                          </p>
                          <p style={{ 
                            fontSize: '11px', 
                            color: theme.colors.textSecondary,
                            margin: 0 
                          }}>
                            {driver.currentLoad.pickupLocation} → {driver.currentLoad.deliveryLocation}
                          </p>
                        </div>
                      )}

                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center' 
                      }}>
                        <p style={{ 
                          fontSize: '11px', 
                          color: theme.colors.textSecondary,
                          margin: 0 
                        }}>
                          {driver.location.address || `${driver.location.lat.toFixed(4)}, ${driver.location.lng.toFixed(4)}`}
                        </p>
                        <p style={{ 
                          fontSize: '11px', 
                          color: theme.colors.textSecondary,
                          margin: 0 
                        }}>
                          {new Date(driver.lastUpdate).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Driver Status Update Panel */}
            {selectedDispatchDriver && showDriverUpdate && (
              <div style={{
                background: theme.colors.backgroundCard,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: '12px',
                padding: '20px',
                position: 'sticky',
                top: '20px',
                height: 'fit-content'
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '16px' 
                }}>
                  <h3 style={{ 
                    fontSize: '18px', 
                    fontWeight: '600', 
                    color: theme.colors.textPrimary,
                    margin: 0 
                  }}>
                    Update Driver Status
                  </h3>
                  <button
                    onClick={() => {
                      setShowDriverUpdate(false)
                      setSelectedDispatchDriver(null)
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: theme.colors.textSecondary,
                      cursor: 'pointer',
                      padding: '4px'
                    }}
                  >
                    ×
                  </button>
                </div>
                
                <DriverStatusUpdate
                  driverId={selectedDispatchDriver.driverId}
                  driverName={selectedDispatchDriver.driverName}
                  currentStatus={selectedDispatchDriver.status}
                  currentLocation={selectedDispatchDriver.location}
                  onStatusUpdate={(status, location, notes) => {
                    handleDriverStatusUpdate(selectedDispatchDriver.driverId, status, location, notes)
                  }}
                />
              </div>
            )}
          </div>
        </>
      )}

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

