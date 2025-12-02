import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../../contexts/ThemeContext'
import { carrierAPI } from '../../services/api'
import PageContainer from '../../components/shared/PageContainer'
import Card from '../../components/ui/Card'
import ReleaseStatusCard from '../../components/shared/ReleaseStatusCard'
import TonuFilingModal from '../../components/compliance/TonuFilingModal'
import { formatNumber, formatCurrency, formatCompactCurrency, formatPercentage } from '../../utils/formatters';
import AnimatedCounter from '../../components/enhanced/AnimatedCounter';

import {
  Truck, Package, MapPin, Clock, AlertCircle,
  Navigation, DollarSign, TrendingUp, Phone, MessageSquare,
  Calendar, User, Loader, XCircle, Search,
  FileText, FileSignature, ChevronDown, ChevronUp, Gauge, Fuel, Edit, Save,
  ArrowUpDown, X, CheckSquare, Square, Filter, Layers
} from 'lucide-react'

interface Load {
  id: string
  commodity: string
  status: string
  units: number
  rateMode: string
  customer?: { name: string; phone?: string }
  origin: any
  destination: any
  miles: number
  revenue: number
  pickupTime?: string
  deliveryTime?: string
  eta?: string
  completedAt?: string
  assignedAt: string
  driver?: { name: string; phone?: string }
  notes?: string
  equipmentType: string
  // Additional dispatch fields
  pickupLocation?: string
  pickupDate?: string
  pickupETA?: string
  pickupContact?: { name: string; phone?: string }
  deliveryLocation?: string
  deliveryDate?: string
  deliveryETA?: string
  deliveryContact?: { name: string; phone?: string }
  driverPhone?: string
  truckNumber?: string
  trailerNumber?: string
  deadhead?: number
  tolls?: number
  ratePerMile?: number
  trueRatePerMile?: number
  permitCost?: number
  bolNumber?: string
  rateConSigned?: boolean
  rateConSignedDate?: string
  rateConSignedBy?: string
  dispatchSignedAt?: string
  driverAcceptanceDeadline?: string
  driverAccepted?: boolean
  bolUploaded?: boolean
  bolUploadDate?: string
  podUploaded?: boolean
  podUploadDate?: string
  podReceived?: boolean
  customerPaid?: boolean
  dispatchNotes?: string
  updateArrival?: string
  updateDelivery?: string
}

const CarrierMyLoadsPage = () => {
  const { theme } = useTheme()
  const navigate = useNavigate()

  const [loads, setLoads] = useState<Load[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedLoad, setSelectedLoad] = useState<Load | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  
  // State for new professional features
  const [notifications, setNotifications] = useState<Array<{id: string, message: string, type: string}>>([])
  const [showExportModal, setShowExportModal] = useState(false)
  const [showAlertsModal, setShowAlertsModal] = useState(false)
  
  // State for search and filtering
  const [searchTerm, setSearchTerm] = useState('')
  const [filterEquipment, setFilterEquipment] = useState('all')
  const [filterDriver, setFilterDriver] = useState('all')
  const [sortBy, setSortBy] = useState('date')
  const [expandedLoads, setExpandedLoads] = useState<Set<string>>(new Set())
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingLoad, setEditingLoad] = useState<Load | null>(null)
  
  // Enhanced filtering and sorting
  type SortOption = 'date' | 'revenue' | 'status' | 'miles' | 'customer' | 'none'
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [dateRangeFilter, setDateRangeFilter] = useState({ from: '', to: '' })
  const [revenueRangeFilter, setRevenueRangeFilter] = useState({ min: '', max: '' })
  
  // Bulk operations
  const [selectedLoads, setSelectedLoads] = useState<string[]>([])
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [editForm, setEditForm] = useState({
    deadhead: 0,
    tolls: 0,
    permitCost: 0
  })
  const [showRateConModal, setShowRateConModal] = useState(false)
  const [showBOLModal, setShowBOLModal] = useState(false)
  const [showPODModal, setShowPODModal] = useState(false)
  const [selectedDocumentLoad, setSelectedDocumentLoad] = useState<Load | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [releaseStatus, setReleaseStatus] = useState<any>(null)
  const [showTonuModal, setShowTonuModal] = useState(false)
  const [tonuLoad, setTonuLoad] = useState<Load | null>(null)

  useEffect(() => {
    loadMyLoads()
    
    // Add mock RELEASED load for testing TONU button
    const mockReleasedLoad = {
      id: 'mock-tonu-test-load',
      commodity: 'Crushed Limestone',
      status: 'RELEASED',
      units: 20,
      rateMode: 'PER_TON',
      customer: { name: 'ABC Construction', phone: '(512) 555-0123' },
      origin: { siteName: 'Main Quarry', address: '123 Quarry Rd, Austin, TX' },
      destination: { siteName: 'Downtown Project', address: '456 Main St, Austin, TX' },
      miles: 15,
      revenue: 1200,
      pickupDate: new Date().toISOString(),
      deliveryDate: new Date(Date.now() + 24*60*60*1000).toISOString(),
      equipmentType: 'End Dump',
      assignedAt: new Date().toISOString(),
      pickupContact: { name: 'Tom Martinez', phone: '(512) 555-0999' },
      deliveryContact: { name: 'John Foreman', phone: '(512) 555-0888' },
      driver: { name: 'John Smith', phone: '(512) 555-0198' },
      truckNumber: '2145',
      trailerNumber: 'T-801',
      rateConSigned: true,
      bolUploaded: true,
      podUploaded: false,
      releaseNumber: 'RL-2025-ABC123',
      releasedAt: new Date().toISOString(),
      releaseExpiresAt: new Date(Date.now() + 2*60*60*1000).toISOString(),
      pickupInstructions: 'Use gate B, check in at office. Gate code: #4521',
      quantityConfirmed: '20 tons'
    }
    
    setLoads(prevLoads => [mockReleasedLoad, ...prevLoads])
  }, [])

  // Fetch release status for loads that need it
  useEffect(() => {
    if (selectedLoad && (selectedLoad.status === 'RELEASE_REQUESTED' || selectedLoad.status === 'RELEASED')) {
      carrierAPI.getReleaseStatus(selectedLoad.id)
        .then(setReleaseStatus)
        .catch((err) => {
          console.error('Error fetching release status:', err)
          setReleaseStatus(null)
        })
    } else {
      setReleaseStatus(null)
    }
  }, [selectedLoad])

  // Timer for 30-minute driver acceptance countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
      
      // Check for expired driver acceptance deadlines and auto-update status
      setLoads(prevLoads => 
        prevLoads.map(load => {
          // Auto-start load when driver accepts via SMS
          if (load.driverAccepted && load.rateConSigned && load.status === 'ASSIGNED') {
            console.log(`✅ Driver accepted Load ${load.id} - Auto-starting (IN_TRANSIT)`)
            return {
              ...load,
              status: 'IN_TRANSIT'
            }
          }
          
          // Check for expired acceptance deadlines
          if (load.driverAcceptanceDeadline && !load.driverAccepted && !load.rateConSigned) {
            const deadline = new Date(load.driverAcceptanceDeadline).getTime()
            const now = new Date().getTime()
            
            if (now >= deadline) {
              // Timer expired - return load to board
              console.log(`⚠️ Driver acceptance expired for Load ${load.id} - Returning to Load Board`)
              // In real implementation, this would trigger API call to return load to board
              return {
                ...load,
                status: 'EXPIRED - Returned to Load Board',
                driverAccepted: false,
                rateConSigned: false
              }
            }
          }
          return load
        })
      )
    }, 1000) // Update every second

    return () => clearInterval(timer)
  }, [])

  const loadMyLoads = async () => {
    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Please log in to view your loads')
        return
      }

      const isDevMode = token.startsWith('dev-')

      if (isDevMode) {
        console.log('🧪 Development mode - using mock carrier loads data')
        
        // Import SMS service to check for active workflows
        import('../../services/smsService').then(({ smsService }) => {
          // Check if any loads have active SMS workflows
          const activeWorkflows = smsService.getSentMessages()
          console.log('📋 Active SMS workflows:', activeWorkflows.length)
        })

        // Mock carrier loads data
        setLoads([
          {
            id: 'load-001',
            commodity: 'Crushed Limestone',
            status: 'IN_TRANSIT',
            units: 18.5,
            rateMode: 'PER_TON',
            revenue: 925,
            customer: { name: 'ABC Construction', phone: '(512) 555-0123' },
            origin: { siteName: 'Main Quarry', address: '1234 Rock Rd, Austin, TX', city: 'Austin' },
            destination: { siteName: 'Downtown Project', address: '789 Congress Ave, Austin, TX', city: 'Austin' },
            miles: 12.3,
            pickupTime: '8:00 AM',
            deliveryTime: '2:00 PM',
            eta: '1:45 PM',
            assignedAt: '2025-10-07T06:00:00Z',
            driver: { name: 'John Smith', phone: '(512) 555-0198' },
            notes: 'Gate code: #4521. Contact foreman before arrival.',
            equipmentType: 'End Dump',
            pickupLocation: 'Main Quarry - Austin, TX',
            pickupDate: '2025-10-09',
            pickupETA: '8:00 AM',
            pickupContact: { name: 'Tom Martinez', phone: '(512) 555-0999' },
            deliveryLocation: 'Downtown Project - Austin, TX',
            deliveryDate: '2025-10-09',
            deliveryETA: '2:00 PM',
            deliveryContact: { name: 'John Foreman', phone: '(512) 555-0888' },
            driverPhone: '(512) 555-0198',
            truckNumber: '2145',
            trailerNumber: 'T-801',
            deadhead: 5,
            tolls: 0,
            ratePerMile: 75.20,
            trueRatePerMile: 72.35,
            permitCost: 0,
            bolNumber: 'BOL-001-2025',
            rateConSigned: true,
            rateConSignedDate: '2025-10-08',
            dispatchSignedAt: '2025-10-08T09:00:00Z',
            driverAcceptanceDeadline: '2025-10-08T09:30:00Z',
            driverAccepted: true,
            bolUploaded: true,
            bolUploadDate: '2025-10-09 8:15 AM',
            podUploaded: false,
            podReceived: false,
            customerPaid: false,
            dispatchNotes: 'Gate code: #4521. Contact foreman John at (512) 555-0999 before arrival.',
            updateArrival: 'Driver confirmed on-site at 8:05 AM',
            updateDelivery: 'ETA updated to 1:45 PM due to traffic'
          },
          {
            id: 'load-002',
            commodity: 'Concrete Mix',
            status: 'ASSIGNED',
            units: 25.0,
            rateMode: 'PER_TON',
            revenue: 1250,
            customer: { name: 'XYZ Builders', phone: '(512) 555-0456' },
            origin: { siteName: 'North Plant', address: '456 Industrial Blvd, Round Rock, TX', city: 'Round Rock' },
            destination: { siteName: 'Highway 290 Bridge', address: 'Hwy 290 & Oak Hill, Austin, TX', city: 'Austin' },
            miles: 18.7,
            pickupTime: '6:00 AM',
            deliveryTime: '10:00 AM',
            assignedAt: '2025-10-06T18:00:00Z',
            driver: { name: 'Sarah Johnson', phone: '(512) 555-0287' },
            notes: 'Time-sensitive delivery. Must arrive before 10 AM.',
            equipmentType: 'Mixer',
            pickupLocation: 'North Plant - Round Rock, TX',
            pickupDate: '2025-10-10',
            pickupETA: '6:00 AM',
            pickupContact: { name: 'Sarah Plant Manager', phone: '(512) 555-0777' },
            deliveryLocation: 'Highway 290 Bridge - Austin, TX',
            deliveryDate: '2025-10-10',
            deliveryETA: '10:00 AM',
            deliveryContact: { name: 'Mike Construction Lead', phone: '(512) 555-0666' },
            driverPhone: '(512) 555-0287',
            truckNumber: '1872',
            trailerNumber: 'T-523',
            deadhead: 12,
            tolls: 8.50,
            ratePerMile: 66.84,
            trueRatePerMile: 61.23,
            permitCost: 125.00,
            bolNumber: null,
            rateConSigned: false,
            rateConSignedDate: null,
            dispatchSignedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
            driverAcceptanceDeadline: new Date(Date.now() + 25 * 60 * 1000).toISOString(), // 25 minutes from now
            driverAccepted: false,
            bolUploaded: false,
            podUploaded: false,
            podReceived: false,
            customerPaid: false,
            dispatchNotes: 'Time-sensitive delivery. MUST arrive before 10 AM. Pour scheduled at 10:15 AM.',
            updateArrival: null,
            updateDelivery: null
          },
          {
            id: 'load-003',
            commodity: 'Gravel Base',
            status: 'COMPLETED',
            units: 22.3,
            rateMode: 'PER_TON',
            revenue: 1115,
            customer: { name: 'DEF Contractors' },
            origin: { siteName: 'South Quarry', address: '789 Quarry Ln, Buda, TX', city: 'Buda' },
            destination: { siteName: 'Airport Expansion', address: 'Austin-Bergstrom Airport, Austin, TX', city: 'Austin' },
            miles: 15.2,
            completedAt: 'Yesterday 3:30 PM',
            assignedAt: '2025-10-05T05:00:00Z',
            driver: { name: 'Mike Rodriguez' },
            equipmentType: 'End Dump',
            pickupLocation: 'South Quarry - Buda, TX',
            pickupDate: '2025-10-08',
            pickupETA: '1:00 PM',
            pickupContact: { name: 'Carlos Site Manager', phone: '(512) 555-0555' },
            deliveryLocation: 'Airport Expansion - Austin, TX',
            deliveryDate: '2025-10-08',
            deliveryETA: '3:00 PM',
            deliveryContact: { name: 'James Airport Security', phone: '(512) 555-0444' },
            driverPhone: '(512) 555-0423',
            truckNumber: '3421',
            trailerNumber: 'T-912',
            deadhead: 8,
            tolls: 0,
            ratePerMile: 73.36,
            trueRatePerMile: 69.12,
            permitCost: 0,
            bolNumber: 'BOL-003-2025',
            rateConSigned: true,
            rateConSignedDate: '2025-10-07',
            dispatchSignedAt: '2025-10-07T08:00:00Z',
            driverAcceptanceDeadline: '2025-10-07T08:30:00Z',
            driverAccepted: true,
            bolUploaded: true,
            bolUploadDate: '2025-10-08 1:20 PM',
            podUploaded: true,
            podUploadDate: '2025-10-08 3:45 PM',
            podReceived: true,
            customerPaid: false,
            dispatchNotes: 'Airport security requires driver to check in at Gate 5.',
            updateArrival: 'Loaded and departed at 1:15 PM',
            updateDelivery: 'Delivered and signed at 3:30 PM'
          },
          {
            id: 'load-004',
            commodity: 'Sand',
            status: 'IN_TRANSIT',
            units: 16.8,
            rateMode: 'PER_TON',
            revenue: 756,
            customer: { name: 'GHI Development', phone: '(512) 555-0789' },
            origin: { siteName: 'East Pit', address: '321 Sand Dr, Manor, TX', city: 'Manor' },
            destination: { siteName: 'Residential Development', address: '555 New Home Way, Pflugerville, TX', city: 'Pflugerville' },
            miles: 9.4,
            pickupTime: '3:00 PM',
            deliveryTime: '5:00 PM',
            eta: '4:45 PM',
            assignedAt: '2025-10-07T10:00:00Z',
            driver: { name: 'David Chen', phone: '(512) 555-0312' },
            equipmentType: 'End Dump',
            pickupLocation: 'East Pit - Manor, TX',
            pickupDate: '2025-10-09',
            pickupETA: '3:00 PM',
            pickupContact: { name: 'Maria Site Supervisor', phone: '(512) 555-0821' },
            deliveryLocation: 'Residential Development - Pflugerville, TX',
            deliveryDate: '2025-10-09',
            deliveryETA: '5:00 PM',
            deliveryContact: { name: 'Robert Development Manager', phone: '(512) 555-0922' },
            driverPhone: '(512) 555-0312',
            truckNumber: '1634',
            trailerNumber: 'T-445',
            deadhead: 3,
            tolls: 0,
            ratePerMile: 80.43,
            trueRatePerMile: 76.89,
            permitCost: 0,
            bolNumber: 'BOL-004-2025',
            rateConSigned: true,
            rateConSignedDate: '2025-10-08',
            dispatchSignedAt: '2025-10-08T14:00:00Z',
            driverAcceptanceDeadline: '2025-10-08T14:30:00Z',
            driverAccepted: true,
            bolUploaded: true,
            bolUploadDate: '2025-10-09 3:10 PM',
            podUploaded: false,
            podReceived: false,
            customerPaid: false,
            dispatchNotes: 'Contact site supervisor Maria at (512) 555-0821 upon arrival.',
            updateArrival: 'Loaded and departed at 3:05 PM',
            updateDelivery: 'En route, ETA 4:45 PM'
          }
        ])


        setLoading(false)
        return
      }

      // Production mode - fetch from API
      const response = await carrierAPI.getMyLoads({ page: 1, limit: 50 })
      setLoads(response.loads || [])

    } catch (err: any) {
      console.error('Error loading loads:', err)
      setError(err.response?.data?.error || err.message || 'Failed to load loads')
    } finally {
      setLoading(false)
    }
  }

  const toggleExpanded = (loadId: string) => {
    setExpandedLoads(prev => {
      const newSet = new Set(prev)
      if (newSet.has(loadId)) {
        newSet.delete(loadId)
      } else {
        newSet.add(loadId)
      }
      return newSet
    })
  }

  const calculateTimeRemaining = (deadline: string) => {
    const now = currentTime.getTime()
    const deadlineTime = new Date(deadline).getTime()
    const diff = deadlineTime - now
    
    if (diff <= 0) return { expired: true, minutes: 0, seconds: 0, display: 'EXPIRED' }
    
    const minutes = Math.floor(diff / 60000)
    const seconds = Math.floor((diff % 60000) / 1000)
    
    return {
      expired: false,
      minutes,
      seconds,
      display: `${minutes}:${seconds.toString().padStart(2, '0')}`
    }
  }

  const handleEditLoad = (load: Load) => {
    setEditingLoad(load)
    setEditForm({
      deadhead: load.deadhead || 0,
      tolls: load.tolls || 0,
      permitCost: load.permitCost || 0
    })
    setShowEditModal(true)
  }

  const handleSaveEdit = () => {
    if (!editingLoad) return

    // Calculate new true rate per mile
    const totalMiles = editingLoad.miles + editForm.deadhead
    const totalCosts = editForm.tolls + editForm.permitCost
    const netRevenue = editingLoad.revenue - totalCosts
    const trueRatePerMile = totalMiles > 0 ? netRevenue / totalMiles : 0

    // Update the load
    setLoads(prevLoads =>
      prevLoads.map(load =>
        load.id === editingLoad.id
          ? {
              ...load,
              deadhead: editForm.deadhead,
              tolls: editForm.tolls,
              permitCost: editForm.permitCost,
              trueRatePerMile: trueRatePerMile
            }
          : load
      )
    )

    setNotifications(prev => [...prev, {
      id: Date.now().toString(),
      message: `✅ Load ${editingLoad.id.substring(0, 8)} updated successfully`,
      type: 'success'
    }])

    setShowEditModal(false)
    setEditingLoad(null)
  }

  // Load lifecycle is now fully automated:
  // 1. Driver accepts Rate Con via SMS → Load automatically starts (status: IN_TRANSIT)
  // 2. Driver uploads BOL → Pickup confirmed
  // 3. Driver submits POD → Load automatically completes (status: DELIVERED)
  // No manual "Start Load" or "Complete Load" buttons needed

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'ASSIGNED': return theme.colors.warning
      case 'IN_TRANSIT': return theme.colors.info
      case 'DELIVERED': return theme.colors.success
      case 'COMPLETED': return theme.colors.success
      case 'CANCELLED': return theme.colors.error
      default: return theme.colors.textSecondary
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
    const allLoadIds = filteredLoads.map(load => load.id)
    setSelectedLoads(allLoadIds)
  }

  const clearSelection = () => {
    setSelectedLoads([])
  }

  const handleBulkExport = () => {
    console.log('Bulk export loads:', selectedLoads)
    // Implementation for bulk export
  }

  const handleBulkStatusUpdate = () => {
    console.log('Bulk status update for loads:', selectedLoads)
    // Implementation for bulk status update
  }

  // Enhanced filtering and sorting
  const filteredLoads = loads.filter(load => {
    const matchesStatus = filterStatus === 'all' || load.status === filterStatus.toUpperCase()
    const matchesSearch = searchTerm === '' || 
      load.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      load.commodity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      load.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      load.origin?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      load.destination?.city?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesEquipment = filterEquipment === 'all' || load.equipmentType === filterEquipment
    const matchesDriver = filterDriver === 'all' || load.driver?.name === filterDriver
    
    // Date range filter
    const loadDate = new Date(load.assignedAt)
    const matchesDateFrom = dateRangeFilter.from === '' || loadDate >= new Date(dateRangeFilter.from)
    const matchesDateTo = dateRangeFilter.to === '' || loadDate <= new Date(dateRangeFilter.to)
    
    // Revenue range filter
    const loadRevenue = load.revenue || 0
    const matchesRevenueMin = revenueRangeFilter.min === '' || loadRevenue >= parseFloat(revenueRangeFilter.min)
    const matchesRevenueMax = revenueRangeFilter.max === '' || loadRevenue <= parseFloat(revenueRangeFilter.max)
    
    return matchesStatus && matchesSearch && matchesEquipment && matchesDriver && matchesDateFrom && matchesDateTo && matchesRevenueMin && matchesRevenueMax
  })

  // Enhanced sorting
  const getSortedLoads = () => {
    if (sortBy === 'none') return filteredLoads

    const sorted = [...filteredLoads].sort((a, b) => {
      let comparison = 0

      if (sortBy === 'date') {
        comparison = new Date(a.assignedAt).getTime() - new Date(b.assignedAt).getTime()
      } else if (sortBy === 'revenue') {
        comparison = (a.revenue || 0) - (b.revenue || 0)
      } else if (sortBy === 'status') {
        comparison = a.status.localeCompare(b.status)
      } else if (sortBy === 'miles') {
        comparison = (a.miles || 0) - (b.miles || 0)
      } else if (sortBy === 'customer') {
        comparison = (a.customer?.name || '').localeCompare(b.customer?.name || '')
      }

      return sortDirection === 'asc' ? comparison : -comparison
    })

    return sorted
  }

  const finalFilteredLoads = getSortedLoads()

  // Real calendar sync functionality for carrier loads
  const syncLoadsWithCalendar = () => {
    const calendarEvents = []
    
    // Add assigned loads to calendar
    loads.forEach(load => {
      if (load.status === 'ASSIGNED' || load.status === 'IN_PROGRESS') {
        calendarEvents.push({
          title: `Load ${load.id}: ${load.commodity}`,
          start: new Date(load.pickupTime || load.assignedAt),
          end: new Date(load.deliveryTime || load.assignedAt),
          type: 'load',
          loadId: load.id,
          description: `${load.commodity} - ${load.origin?.city || 'Origin'} to ${load.destination?.city || 'Destination'} - $${load.revenue}`,
          customer: load.customer?.name || 'Unknown',
          revenue: load.revenue,
          status: load.status
        })
      }
    })
    
    // Store events in localStorage for calendar integration
    localStorage.setItem('carrierLoadCalendarEvents', JSON.stringify(calendarEvents))
    
    // Trigger calendar refresh if calendar page is open
    window.dispatchEvent(new CustomEvent('carrierLoadDataSynced', { 
      detail: { events: calendarEvents } 
    }))
  }

  // Real export functions for carrier loads
  const generateLoadsCSV = () => {
    const headers = [
      'Load ID', 'Commodity', 'Status', 'Units', 'Rate Mode', 'Customer', 'Origin', 'Destination',
      'Miles', 'Revenue', 'Pickup Time', 'Delivery Time', 'ETA', 'Completed At', 'Assigned At',
      'Driver', 'Notes'
    ]
    
    const rows = loads.map(load => [
      load.id,
      load.commodity,
      load.status,
      load.units,
      load.rateMode,
      load.customer?.name || 'N/A',
      load.origin?.city || 'N/A',
      load.destination?.city || 'N/A',
      load.miles,
      load.revenue,
      load.pickupTime || 'N/A',
      load.deliveryTime || 'N/A',
      load.eta || 'N/A',
      load.completedAt || 'N/A',
      load.assignedAt,
      load.driver?.name || 'N/A',
      load.notes || 'N/A'
    ])
    
    return [headers, ...rows].map(row => 
      row.map(field => `"${field || ''}"`).join(',')
    ).join('\n')
  }

  const generateLoadsJSON = () => {
    return {
      exportDate: new Date().toISOString(),
      carrierLoadData: {
        loads: loads.map(load => ({
          ...load,
          exportTimestamp: new Date().toISOString()
        })),
        stats: {
          totalLoads: loads.length,
          assignedLoads: loads.filter(l => l.status === 'ASSIGNED').length,
          inProgressLoads: loads.filter(l => l.status === 'IN_PROGRESS').length,
          completedLoads: loads.filter(l => l.status === 'COMPLETED').length,
          totalRevenue: loads.reduce((sum, l) => sum + l.revenue, 0),
          averageRevenue: loads.length > 0 ? loads.reduce((sum, l) => sum + l.revenue, 0) / loads.length : 0
        }
      }
    }
  }

  const downloadCSV = (csvContent: string, filename: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const downloadJSON = (jsonData: any, filename: string) => {
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <PageContainer title="My Loads" subtitle="Loading your assigned loads..." icon={Layers as any}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px', flexDirection: 'column', gap: '16px' }}>
          <Loader size={48} style={{ animation: 'spin 1s linear infinite', color: theme.colors.primary }} />
          <p style={{ fontSize: '16px', color: theme.colors.textSecondary, fontWeight: '500' }}>Loading your loads...</p>
        </div>
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer title="My Loads" subtitle="Error loading data" icon={Layers as any}>
        <Card padding="40px">
          <div style={{ textAlign: 'center' }}>
            <AlertCircle size={64} style={{ color: theme.colors.error, marginBottom: '16px' }} />
            <h3 style={{ color: theme.colors.error, marginBottom: '8px' }}>Error Loading Loads</h3>
            <p style={{ color: theme.colors.textSecondary, marginBottom: '24px' }}>{error}</p>
            <button onClick={loadMyLoads} style={{ padding: '12px 24px', background: theme.colors.primary, color: 'white', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
              Retry
            </button>
          </div>
        </Card>
      </PageContainer>
    )
  }

  const stats = {
    total: loads.length,
    assigned: loads.filter(l => l.status === 'ASSIGNED').length,
    inTransit: loads.filter(l => l.status === 'IN_TRANSIT').length,
    completed: loads.filter(l => l.status === 'COMPLETED').length,
    totalRevenue: loads.reduce((sum, l) => sum + l.revenue, 0)
  }

  // Header actions: Sync Calendar, Export Data, View Alerts - FORCE REFRESH
  console.log('🔧 MyLoadsPage: Rendering header actions with 3 buttons')
  const headerAction = (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      <button
        onClick={() => {
          // Real calendar sync functionality for carrier loads
          syncLoadsWithCalendar()
          setNotifications(prev => [...prev, {
            id: Date.now().toString(),
            message: '📅 Load data synced with calendar successfully',
            type: 'success'
          }])
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
        <Calendar size={18} />
        Sync Calendar
      </button>
      <button
        onClick={() => setShowExportModal(true)}
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
        <Package size={18} />
        Export Data
      </button>
      <button
        onClick={() => setShowAlertsModal(true)}
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
        <AlertCircle size={18} />
        View Alerts
      </button>
    </div>
  )

  return (
    <PageContainer
      title="My Loads"
      subtitle="Manage your assigned loads and deliveries"
      icon={Layers as any}
      headerAction={headerAction}
    >
      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        {[
          { label: 'Total Active', value: stats.total, icon: Package, color: theme.colors.primary, isRevenue: false },
          { label: 'Assigned', value: stats.assigned, icon: Clock, color: theme.colors.info, isRevenue: false },
          { label: 'In Transit', value: stats.inTransit, icon: Truck, color: theme.colors.warning, isRevenue: false },
          { label: 'Completed', value: stats.completed, icon: Package, color: theme.colors.success, isRevenue: false },
          { label: 'Total Revenue', value: stats.totalRevenue, icon: DollarSign, color: theme.colors.success, isRevenue: true }
        ].map(stat => (
          <Card key={stat.label} padding="28px">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '14px',
                backgroundColor: `${stat.color}10`,
                border: `1px solid ${stat.color}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {React.createElement(stat.icon, { size: 28, color: stat.color })}
              </div>
              <div>
                {stat.isRevenue ? (
                  <p style={{ fontSize: '32px', fontWeight: '700', color: stat.color, margin: 0, lineHeight: 1 }}>
                    <AnimatedCounter value={stat.value} prefix="$" />
                  </p>
                ) : (
                  <p style={{ fontSize: '32px', fontWeight: '700', color: theme.colors.textPrimary, margin: 0, lineHeight: 1 }}>
                    {stat.value}
                  </p>
                )}
                <p style={{ fontSize: '13px', fontWeight: '500', color: theme.colors.textSecondary, margin: '6px 0 0 0', letterSpacing: '0.02em' }}>{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>


      {/* Enhanced Search and Filters */}
      <Card padding="28px" style={{ marginBottom: '32px' }}>
        {/* Search Bar and Bulk Actions */}
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '24px' }}>
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
                placeholder="Search loads, customers, drivers..."
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

          {/* Bulk Actions */}
          {selectedLoads.length > 0 && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleBulkExport}
                style={{
                  padding: '12px 16px',
                  background: theme.colors.primary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <FileText size={16} />
                Export ({selectedLoads.length})
              </button>
              <button
                onClick={handleBulkStatusUpdate}
                style={{
                  padding: '12px 16px',
                  background: theme.colors.warning,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Edit size={16} />
                Update Status ({selectedLoads.length})
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          {/* Status Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: theme.colors.textSecondary, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
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
              <option value="all">All Status</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Equipment Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: theme.colors.textSecondary, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Equipment
            </label>
            <select
              value={filterEquipment}
              onChange={(e) => setFilterEquipment(e.target.value)}
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
              <option value="Mixer">Mixer</option>
              <option value="Flatbed">Flatbed</option>
              <option value="Step Deck">Step Deck</option>
            </select>
          </div>

          {/* Driver Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: theme.colors.textSecondary, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Driver
            </label>
            <select
              value={filterDriver}
              onChange={(e) => setFilterDriver(e.target.value)}
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
              <option value="all">All Drivers</option>
              <option value="John Smith">John Smith</option>
              <option value="Sarah Johnson">Sarah Johnson</option>
              <option value="Mike Wilson">Mike Wilson</option>
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
              <option value="date">Date</option>
              <option value="revenue">Revenue</option>
              <option value="status">Status</option>
              <option value="miles">Miles</option>
              <option value="customer">Customer</option>
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

          {/* Date Range From */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: theme.colors.textSecondary, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <Calendar size={14} style={{ display: 'inline', marginRight: '6px' }} />
              Date From
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

          {/* Date Range To */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: theme.colors.textSecondary, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Date To
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

          {/* Revenue Range Min */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: theme.colors.textSecondary, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <DollarSign size={14} style={{ display: 'inline', marginRight: '6px' }} />
              Min Revenue
            </label>
            <input
              type="number"
              placeholder="0"
              value={revenueRangeFilter.min}
              onChange={(e) => setRevenueRangeFilter(prev => ({ ...prev, min: e.target.value }))}
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

          {/* Revenue Range Max */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: theme.colors.textSecondary, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Max Revenue
            </label>
            <input
              type="number"
              placeholder="999999"
              value={revenueRangeFilter.max}
              onChange={(e) => setRevenueRangeFilter(prev => ({ ...prev, max: e.target.value }))}
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
              setFilterEquipment('all')
              setFilterDriver('all')
              setSortBy('date')
              setSortDirection('desc')
              setDateRangeFilter({ from: '', to: '' })
              setRevenueRangeFilter({ min: '', max: '' })
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
              e.currentTarget.style.background = theme.colors.primary
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
      </Card>

      {/* Loads List */}
      <Card title="Your Loads" subtitle={`${finalFilteredLoads.length} load${finalFilteredLoads.length !== 1 ? 's' : ''}`}>
        {/* Select All Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: `1px solid ${theme.colors.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={selectedLoads.length === finalFilteredLoads.length ? clearSelection : selectAllLoads}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `${theme.colors.primary}20`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'none'
              }}
            >
              {selectedLoads.length === finalFilteredLoads.length ? (
                <CheckSquare size={20} color={theme.colors.primary} />
              ) : (
                <Square size={20} color={theme.colors.textSecondary} />
              )}
              <span style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary }}>
                {selectedLoads.length === finalFilteredLoads.length ? 'Deselect All' : 'Select All'}
              </span>
            </button>
            
            {selectedLoads.length > 0 && (
              <span style={{ fontSize: '12px', color: theme.colors.textSecondary }}>
                {selectedLoads.length} selected
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {finalFilteredLoads.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', background: theme.colors.background, borderRadius: '12px', border: `1px dashed ${theme.colors.border}` }}>
              <Truck size={48} style={{ color: theme.colors.textTertiary, marginBottom: '16px' }} />
              <h3 style={{ color: theme.colors.textSecondary, marginBottom: '8px' }}>No loads found</h3>
              <p style={{ color: theme.colors.textTertiary, marginBottom: '24px' }}>Check the Load Board for available loads</p>
              <button onClick={() => navigate('/loads')} style={{ padding: '12px 24px', background: theme.colors.primary, color: 'white', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                View Load Board
              </button>
            </div>
          ) : (
            finalFilteredLoads.map((load) => {
              const origin = typeof load.origin === 'string' ? JSON.parse(load.origin) : load.origin
              const destination = typeof load.destination === 'string' ? JSON.parse(load.destination) : load.destination
              const statusColor = getStatusColor(load.status)
              const isExpanded = expandedLoads.has(load.id)

              return (
                <div
                  key={load.id}
                  style={{
                    background: theme.colors.backgroundCard,
                    padding: '24px',
                    borderRadius: '12px',
                    border: `1px solid ${theme.colors.border}`,
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'}
                  onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                >
                  {/* Header Section */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1 }}>
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
                          e.currentTarget.style.background = `${theme.colors.primary}20`
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

                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                          <span style={{ fontSize: '20px', fontWeight: '700', color: theme.colors.textPrimary }}>
                            {load.commodity}
                          </span>
                        <span style={{
                          padding: '6px 12px',
                          background: `${statusColor}20`,
                          color: statusColor,
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: '600',
                          textTransform: 'uppercase'
                        }}>
                          {load.status?.replace('_', ' ')}
                        </span>
                      </div>
                      <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: '0 0 4px 0' }}>
                        Load #{load.id?.substring(0, 8)} • {load.units} {load.rateMode?.replace('PER_', '')?.toLowerCase()} • {load.miles} miles
                      </p>
                      <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <User size={14} />
                        {load.customer?.name}
                        {load.customer?.phone && (
                          <span style={{ marginLeft: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Phone size={14} />
                            {load.customer.phone}
                          </span>
                        )}
                      </p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '32px', fontWeight: 'bold', color: theme.colors.success, margin: 0, lineHeight: 1 }}>
                        ${formatNumber(load.revenue)}
                      </p>
                      <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: '4px 0 0 0' }}>
                        {formatCurrency(load?.ratePerMile)}/mi
                      </p>
                    </div>
                  </div>

                  {/* Route Section */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '16px', marginBottom: '16px', padding: '16px', background: theme.colors.background, borderRadius: '10px', border: `1px solid ${theme.colors.border}` }}>
                    <div>
                      <p style={{ fontSize: '11px', color: theme.colors.textSecondary, margin: '0 0 4px 0', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.5px' }}>
                        Pickup
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        <MapPin size={14} color={theme.colors.warning} />
                        <span style={{ fontSize: '15px', fontWeight: '600', color: theme.colors.textPrimary }}>
                          {origin?.siteName || load.pickupLocation || 'Location'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                        <Clock size={12} color={theme.colors.textSecondary} />
                        <span style={{ fontSize: '13px', color: theme.colors.textSecondary }}>
                          {load.pickupDate ? new Date(load.pickupDate).toLocaleDateString() : 'TBD'} @ {load.pickupETA || load.pickupTime || 'TBD'}
                        </span>
                      </div>
                      {load.pickupContact && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', padding: '6px', background: theme.colors.backgroundCard, borderRadius: '6px' }}>
                          <User size={12} color={theme.colors.textSecondary} />
                          <span style={{ fontSize: '12px', color: theme.colors.textPrimary, fontWeight: '500' }}>
                            {load.pickupContact.name}
                          </span>
                          {load.pickupContact.phone && (
                            <>
                              <Phone size={11} color={theme.colors.textSecondary} style={{ marginLeft: '4px' }} />
                              <span style={{ fontSize: '11px', color: theme.colors.textSecondary }}>
                                {load.pickupContact.phone}
                              </span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Navigation size={24} color={theme.colors.primary} style={{ transform: 'rotate(90deg)' }} />
                    </div>
                    <div>
                      <p style={{ fontSize: '11px', color: theme.colors.textSecondary, margin: '0 0 4px 0', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.5px' }}>
                        Delivery
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        <MapPin size={14} color={theme.colors.success} />
                        <span style={{ fontSize: '15px', fontWeight: '600', color: theme.colors.textPrimary }}>
                          {destination?.siteName || load.deliveryLocation || 'Location'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                        <Clock size={12} color={theme.colors.textSecondary} />
                        <span style={{ fontSize: '13px', color: theme.colors.textSecondary }}>
                          {load.deliveryDate ? new Date(load.deliveryDate).toLocaleDateString() : 'TBD'} @ {load.deliveryETA || load.deliveryTime || load.eta || 'TBD'}
                        </span>
                      </div>
                      {load.deliveryContact && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', padding: '6px', background: theme.colors.backgroundCard, borderRadius: '6px' }}>
                          <User size={12} color={theme.colors.textSecondary} />
                          <span style={{ fontSize: '12px', color: theme.colors.textPrimary, fontWeight: '500' }}>
                            {load.deliveryContact.name}
                          </span>
                          {load.deliveryContact.phone && (
                            <>
                              <Phone size={11} color={theme.colors.textSecondary} style={{ marginLeft: '4px' }} />
                              <span style={{ fontSize: '11px', color: theme.colors.textSecondary }}>
                                {load.deliveryContact.phone}
                              </span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Driver & Equipment Info */}
                  {load.driver && (
                    <div style={{ 
                      display: 'flex',
                      gap: '16px',
                      marginBottom: '16px',
                      padding: '12px',
                      background: theme.colors.background,
                      borderRadius: '8px',
                      border: `1px solid ${theme.colors.border}`
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                        <User size={16} color={theme.colors.textSecondary} />
                        <span style={{ fontSize: '13px', color: theme.colors.textPrimary, fontWeight: '500' }}>
                          {load.driver.name}
                        </span>
                        {load.driverPhone && (
                          <>
                            <Phone size={14} color={theme.colors.textSecondary} />
                            <span style={{ fontSize: '12px', color: theme.colors.textSecondary }}>
                              {load.driverPhone}
                            </span>
                          </>
                        )}
                      </div>
                      {load.truckNumber && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Truck size={16} color={theme.colors.textSecondary} />
                          <span style={{ fontSize: '13px', color: theme.colors.textPrimary }}>
                            Truck #{load.truckNumber}
                          </span>
                          {load.trailerNumber && (
                            <span style={{ fontSize: '13px', color: theme.colors.textSecondary }}>
                              • Trailer #{load.trailerNumber}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Document Status - Clickable */}
                  <div style={{ 
                    display: 'flex',
                    gap: '12px',
                    marginBottom: '16px'
                  }}>
                    <button
                      onClick={() => {
                        if (load.rateConSigned) {
                          setSelectedDocumentLoad(load)
                          setShowRateConModal(true)
                        }
                      }}
                      disabled={!load.rateConSigned}
                      style={{
                        flex: 1,
                        padding: '10px',
                        background: load.rateConSigned 
                          ? `${theme.colors.success}10` 
                          : (load.driverAcceptanceDeadline && !load.driverAccepted)
                            ? `${theme.colors.error}10`
                            : `${theme.colors.warning}10`,
                        border: `1px solid ${load.rateConSigned 
                          ? theme.colors.success 
                          : (load.driverAcceptanceDeadline && !load.driverAccepted)
                            ? theme.colors.error
                            : theme.colors.warning}`,
                        borderRadius: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: load.rateConSigned ? 'pointer' : 'default',
                        transition: 'all 0.2s ease',
                        minHeight: '60px'
                      }}
                      onMouseEnter={(e) => {
                        if (load.rateConSigned) {
                          e.currentTarget.style.background = `${theme.colors.success}20`
                          e.currentTarget.style.transform = 'translateY(-2px)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (load.rateConSigned) {
                          e.currentTarget.style.background = `${theme.colors.success}10`
                          e.currentTarget.style.transform = 'translateY(0)'
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: load.driverAcceptanceDeadline && !load.driverAccepted ? '4px' : '0' }}>
                        <FileSignature size={16} color={load.rateConSigned 
                          ? theme.colors.success 
                          : (load.driverAcceptanceDeadline && !load.driverAccepted)
                            ? theme.colors.error
                            : theme.colors.warning} />
                        <span style={{ fontSize: '13px', fontWeight: '600', color: theme.colors.textPrimary }}>
                          Rate Con
                        </span>
                      </div>
                      
                      {/* Show countdown if waiting for driver acceptance */}
                      {load.driverAcceptanceDeadline && !load.driverAccepted && !load.rateConSigned ? (
                        (() => {
                          const timeRemaining = calculateTimeRemaining(load.driverAcceptanceDeadline)
                          return (
                            <div style={{ 
                              fontSize: '16px', 
                              fontWeight: 'bold', 
                              color: timeRemaining.expired ? theme.colors.error : timeRemaining.minutes < 5 ? theme.colors.error : theme.colors.warning,
                              fontFamily: 'monospace',
                              letterSpacing: '1px'
                            }}>
                              {timeRemaining.expired ? 'EXPIRED' : timeRemaining.display}
                            </div>
                          )
                        })()
                      ) : (
                        <span style={{ fontSize: '11px', color: theme.colors.textSecondary, fontWeight: '600' }}>
                          {load.rateConSigned ? '✓ Signed' : 'Pending'}
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        if (load.bolUploaded) {
                          setSelectedDocumentLoad(load)
                          setShowBOLModal(true)
                        }
                      }}
                      disabled={!load.bolUploaded}
                      style={{
                        flex: 1,
                        padding: '10px',
                        background: load.bolUploaded ? `${theme.colors.success}10` : `${theme.colors.warning}10`,
                        border: `1px solid ${load.bolUploaded ? theme.colors.success : theme.colors.warning}`,
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: load.bolUploaded ? 'pointer' : 'default',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (load.bolUploaded) {
                          e.currentTarget.style.background = `${theme.colors.success}20`
                          e.currentTarget.style.transform = 'translateY(-2px)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (load.bolUploaded) {
                          e.currentTarget.style.background = `${theme.colors.success}10`
                          e.currentTarget.style.transform = 'translateY(0)'
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FileText size={16} color={load.bolUploaded ? theme.colors.success : theme.colors.warning} />
                        <span style={{ fontSize: '13px', fontWeight: '600', color: theme.colors.textPrimary }}>
                          BOL
                        </span>
                      </div>
                      <span style={{ fontSize: '11px', color: theme.colors.textSecondary, fontWeight: '600' }}>
                        {load.bolUploaded ? '✓ Uploaded' : 'Pending'}
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        if (load.podUploaded) {
                          setSelectedDocumentLoad(load)
                          setShowPODModal(true)
                        }
                      }}
                      disabled={!load.podUploaded}
                      style={{
                        flex: 1,
                        padding: '10px',
                        background: load.podUploaded ? `${theme.colors.success}10` : `${theme.colors.warning}10`,
                        border: `1px solid ${load.podUploaded ? theme.colors.success : theme.colors.warning}`,
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: load.podUploaded ? 'pointer' : 'default',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (load.podUploaded) {
                          e.currentTarget.style.background = `${theme.colors.success}20`
                          e.currentTarget.style.transform = 'translateY(-2px)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (load.podUploaded) {
                          e.currentTarget.style.background = `${theme.colors.success}10`
                          e.currentTarget.style.transform = 'translateY(0)'
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FileText size={16} color={load.podUploaded ? theme.colors.success : theme.colors.warning} />
                        <span style={{ fontSize: '13px', fontWeight: '600', color: theme.colors.textPrimary }}>
                          POD
                        </span>
                      </div>
                      <span style={{ fontSize: '11px', color: theme.colors.textSecondary, fontWeight: '600' }}>
                        {load.podUploaded ? '✓ Received' : 'Pending'}
                      </span>
                    </button>
                  </div>

                  {/* Track Load Button - Only show if driver has accepted/signed Rate Con */}
                  {load.rateConSigned && load.driverAccepted && (
                    <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center' }}>
                      <button
                        onClick={() => navigate(`/loads/${load.id}/tracking`)}
                        style={{
                          padding: '12px 28px',
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
                          gap: '8px',
                          letterSpacing: '0.3px'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = theme.colors.backgroundCardHover
                          e.currentTarget.style.color = theme.colors.textPrimary
                          e.currentTarget.style.borderColor = theme.colors.primary
                          e.currentTarget.style.transform = 'translateY(-1px)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent'
                          e.currentTarget.style.color = theme.colors.textSecondary
                          e.currentTarget.style.borderColor = theme.colors.border
                          e.currentTarget.style.transform = 'translateY(0)'
                        }}
                      >
                        <Navigation size={16} />
                        Track Load
                      </button>
                    </div>
                  )}

                  {/* File TONU Button - Show for RELEASED loads when material is not ready */}
                  {load.status === 'RELEASED' && (
                    <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center' }}>
                      <button
                        onClick={() => {
                          setTonuLoad(load)
                          setShowTonuModal(true)
                        }}
                        style={{
                          padding: '12px 28px',
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
                          gap: '8px',
                          letterSpacing: '0.3px'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = theme.colors.backgroundCardHover
                          e.currentTarget.style.color = theme.colors.textPrimary
                          e.currentTarget.style.borderColor = theme.colors.primary
                          e.currentTarget.style.transform = 'translateY(-1px)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent'
                          e.currentTarget.style.color = theme.colors.textSecondary
                          e.currentTarget.style.borderColor = theme.colors.border
                          e.currentTarget.style.transform = 'translateY(0)'
                        }}
                      >
                        <AlertCircle size={16} />
                        Material Not Ready - File TONU
                      </button>
                    </div>
                  )}

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div style={{
                      padding: '16px',
                      background: theme.colors.background,
                      borderRadius: '8px',
                      marginBottom: '16px',
                      border: `1px solid ${theme.colors.border}`
                    }}>
                      <div style={{ 
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                        gap: '16px',
                        marginBottom: '16px'
                      }}>
                      <div>
                          <div style={{ fontSize: '11px', color: theme.colors.textSecondary, marginBottom: '4px', fontWeight: '600' }}>
                            Deadhead Miles
                          </div>
                          <div style={{ fontSize: '16px', fontWeight: '600', color: theme.colors.textPrimary }}>
                            {load.deadhead || 0} mi
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '11px', color: theme.colors.textSecondary, marginBottom: '4px', fontWeight: '600' }}>
                            Tolls
                          </div>
                          <div style={{ fontSize: '16px', fontWeight: '600', color: theme.colors.textPrimary }}>
                            ${(load.tolls || 0).toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '11px', color: theme.colors.textSecondary, marginBottom: '4px', fontWeight: '600' }}>
                            True Rate/Mile
                          </div>
                          <div style={{ fontSize: '16px', fontWeight: '600', color: theme.colors.textPrimary }}>
                            ${load.trueRatePerMile?.toFixed(2) || '0.00'}
                          </div>
                        </div>
                        {load.permitCost && load.permitCost > 0 && (
                          <div>
                            <div style={{ fontSize: '11px', color: theme.colors.textSecondary, marginBottom: '4px', fontWeight: '600' }}>
                              Permit Cost
                            </div>
                            <div style={{ fontSize: '16px', fontWeight: '600', color: theme.colors.textPrimary }}>
                              ${formatNumber(load.permitCost, "0")}
                            </div>
                          </div>
                        )}
                        {load.bolNumber && (
                          <div>
                            <div style={{ fontSize: '11px', color: theme.colors.textSecondary, marginBottom: '4px', fontWeight: '600' }}>
                              BOL Number
                            </div>
                            <div style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary }}>
                              {load.bolNumber}
                      </div>
                    </div>
                  )}
                      </div>

                      {load.dispatchNotes && (
                        <div style={{
                          padding: '12px',
                          background: theme.colors.backgroundCard,
                          borderRadius: '6px',
                          borderLeft: `3px solid ${theme.colors.primary}`,
                          marginBottom: '12px'
                        }}>
                          <div style={{ fontSize: '11px', fontWeight: '600', color: theme.colors.textSecondary, marginBottom: '6px' }}>
                            Dispatch Notes
                          </div>
                          <div style={{ fontSize: '13px', color: theme.colors.textPrimary, lineHeight: 1.5 }}>
                            {load.dispatchNotes}
                          </div>
                    </div>
                  )}

                      {(load.updateArrival || load.updateDelivery) && (
                        <div style={{
                          padding: '12px',
                          background: `${theme.colors.info}10`,
                          borderRadius: '6px',
                          borderLeft: `3px solid ${theme.colors.info}`
                        }}>
                          <div style={{ fontSize: '11px', fontWeight: '600', color: theme.colors.textSecondary, marginBottom: '6px' }}>
                            Updates
                          </div>
                          {load.updateArrival && (
                            <div style={{ fontSize: '13px', color: theme.colors.textPrimary, marginBottom: '4px' }}>
                              • {load.updateArrival}
                            </div>
                          )}
                          {load.updateDelivery && (
                            <div style={{ fontSize: '13px', color: theme.colors.textPrimary }}>
                              • {load.updateDelivery}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => toggleExpanded(load.id)}
                        style={{
                          padding: '10px 16px',
                          backgroundColor: 'transparent',
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
                        e.currentTarget.style.color = theme.colors.textPrimary
                        e.currentTarget.style.borderColor = theme.colors.primary
                      }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent'
                          e.currentTarget.style.color = theme.colors.textSecondary
                          e.currentTarget.style.borderColor = theme.colors.border
                        }}
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        {isExpanded ? 'Less Details' : 'More Details'}
                      </button>

                      <button
                        onClick={() => handleEditLoad(load)}
                        style={{
                          padding: '10px 16px',
                          backgroundColor: 'transparent',
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
                          e.currentTarget.style.color = theme.colors.textPrimary
                          e.currentTarget.style.borderColor = theme.colors.primary
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent'
                          e.currentTarget.style.color = theme.colors.textSecondary
                          e.currentTarget.style.borderColor = theme.colors.border
                        }}
                      >
                        <Edit size={16} />
                        Edit Load
                      </button>
                    </div>

                    {/* Load lifecycle now automated:
                        - Driver SMS acceptance → Load starts (IN_TRANSIT)
                        - POD submission → Load completes (DELIVERED)
                        - No manual "Start Load" button needed
                    */}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </Card>

      {/* Details Modal */}
      {showDetailsModal && selectedLoad && (
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
            padding: '20px',
            overflow: 'auto'
          }}
          onClick={() => setShowDetailsModal(false)}
        >
          <div
            style={{
              background: theme.colors.backgroundCard,
              borderRadius: '20px',
              padding: '36px',
              maxWidth: '800px',
              width: '100%',
              border: `1px solid ${theme.colors.border}`,
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
              maxHeight: '90vh',
              overflow: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 style={{ color: theme.colors.textPrimary, fontSize: '26px', fontWeight: 'bold', margin: '0 0 8px 0' }}>
                  Load Details - #{selectedLoad.id?.substring(0, 8)}
                </h2>
                <p style={{ color: theme.colors.textSecondary, margin: 0 }}>
                  {selectedLoad.commodity} • {selectedLoad.miles} miles
                </p>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '24px' }}>
              {[
                { label: 'Customer', value: selectedLoad.customer?.name || 'N/A', icon: User },
                { label: 'Revenue', value: `$${formatNumber(selectedLoad.revenue)}`, icon: DollarSign },
                { label: 'Units', value: `${selectedLoad.units} ${selectedLoad.rateMode?.replace('PER_', '')?.toLowerCase()}`, icon: Package },
                { label: 'Status', value: selectedLoad.status?.replace('_', ' '), icon: TrendingUp }
              ].map(item => (
                <div key={item.label} style={{ background: theme.colors.background, padding: '16px', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    {React.createElement(item.icon, { size: 16, color: theme.colors.textSecondary })}
                    <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: 0, textTransform: 'uppercase', fontWeight: '600' }}>
                      {item.label}
                    </p>
                  </div>
                  <p style={{ fontSize: '16px', fontWeight: '600', color: theme.colors.textPrimary, margin: 0 }}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Release Status Card for RELEASE_REQUESTED or RELEASED loads */}
            {(selectedLoad.status === 'RELEASE_REQUESTED' || selectedLoad.status === 'RELEASED') && (
              <div style={{ marginBottom: '24px' }}>
                <ReleaseStatusCard load={selectedLoad} releaseStatus={releaseStatus} />
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: selectedLoad.status === 'RELEASED' ? 'space-between' : 'flex-end', gap: '12px', marginTop: '24px', paddingTop: '24px', borderTop: `1px solid ${theme.colors.border}` }}>
              {/* TONU Button for RELEASED loads */}
              {selectedLoad.status === 'RELEASED' && (
                <button
                  onClick={() => {
                    setTonuLoad(selectedLoad)
                    setShowTonuModal(true)
                    setShowDetailsModal(false)
                  }}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
                >
                  <AlertCircle size={16} />
                  File TONU - Material Not Ready
                </button>
              )}
              <button
                onClick={() => setShowDetailsModal(false)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: theme.colors.backgroundTertiary,
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
              {/* Load completion is automatic when driver submits POD */}
            </div>
          </div>
        </div>
      )}

      {/* Export Data Modal */}
      {showExportModal && (
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
          onClick={() => setShowExportModal(false)}
        >
          <div
            style={{
              background: theme.colors.backgroundCard,
              borderRadius: '20px',
              padding: '36px',
              maxWidth: '800px',
              width: '100%',
              border: `1px solid ${theme.colors.border}`,
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
              maxHeight: '90vh',
              overflow: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
              <h2 style={{ color: theme.colors.textPrimary, fontSize: '24px', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Package size={24} color={theme.colors.primary} />
                Export Load Data
              </h2>
              <button
                onClick={() => setShowExportModal(false)}
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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              {/* Export CSV */}
              <div style={{
                padding: '24px',
                background: `${theme.colors.primary}10`,
                border: `1px solid ${theme.colors.primary}30`,
                borderRadius: '12px'
              }}>
                <h3 style={{ color: theme.colors.textPrimary, fontSize: '18px', fontWeight: '600', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Package size={20} color={theme.colors.primary} />
                  Export Load Data (CSV)
                </h3>
                <p style={{ color: theme.colors.textSecondary, fontSize: '14px', margin: '0 0 16px 0' }}>
                  Download a complete backup of your assigned loads including all details, revenue, and status information.
                </p>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={() => {
                      const csvData = generateLoadsCSV()
                      downloadCSV(csvData, 'my-loads-data.csv')
                      setNotifications(prev => [...prev, {
                        id: Date.now().toString(),
                        message: '📊 Load data exported to CSV successfully',
                        type: 'success'
                      }])
                    }}
                    style={{
                      padding: '10px 16px',
                      background: theme.colors.primary,
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    Export CSV
                  </button>
                </div>
              </div>

              {/* Export JSON */}
              <div style={{
                padding: '24px',
                background: `${theme.colors.success}10`,
                border: `1px solid ${theme.colors.success}30`,
                borderRadius: '12px'
              }}>
                <h3 style={{ color: theme.colors.textPrimary, fontSize: '18px', fontWeight: '600', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Package size={20} color={theme.colors.success} />
                  Export Load Data (JSON)
                </h3>
                <p style={{ color: theme.colors.textSecondary, fontSize: '14px', margin: '0 0 16px 0' }}>
                  Download structured JSON data with metadata and statistics for integration with other systems.
                </p>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={() => {
                      const jsonData = generateLoadsJSON()
                      downloadJSON(jsonData, 'my-loads-data.json')
                      setNotifications(prev => [...prev, {
                        id: Date.now().toString(),
                        message: '📋 Load data exported to JSON successfully',
                        type: 'success'
                      }])
                    }}
                    style={{
                      padding: '10px 16px',
                      background: theme.colors.success,
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    Export JSON
                  </button>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button
                onClick={() => setShowExportModal(false)}
                style={{
                  padding: '12px 24px',
                  background: 'transparent',
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: '8px',
                  color: theme.colors.textSecondary,
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = theme.colors.backgroundCardHover
                  e.currentTarget.style.color = theme.colors.textPrimary
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = theme.colors.textSecondary
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Load Alerts Modal */}
      {showAlertsModal && (
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
          onClick={() => setShowAlertsModal(false)}
        >
          <div
            style={{
              background: theme.colors.backgroundCard,
              borderRadius: '20px',
              padding: '36px',
              maxWidth: '1000px',
              width: '100%',
              border: `1px solid ${theme.colors.border}`,
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
              maxHeight: '90vh',
              overflow: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
              <h2 style={{ color: theme.colors.textPrimary, fontSize: '24px', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                <AlertCircle size={24} color={theme.colors.warning} />
                Load Alerts & Notifications
              </h2>
              <button
                onClick={() => setShowAlertsModal(false)}
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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              {[
                { type: 'error', message: 'Load Pickup Overdue - Immediate Action Required', priority: 'urgent', load: 'LT-1234', category: 'Pickup Alert' },
                { type: 'warning', message: 'Load Delivery Window Approaching', priority: 'high', load: 'LT-1235', category: 'Delivery Alert' },
                { type: 'info', message: 'Load Status Updated - In Progress', priority: 'medium', load: 'LT-1236', category: 'Status Update' },
                { type: 'success', message: 'Load Completed Successfully', priority: 'low', load: 'LT-1237', category: 'Completion' },
                { type: 'info', message: 'Customer Contact Information Updated', priority: 'medium', load: 'LT-1238', category: 'Customer Update' },
                { type: 'warning', message: 'Route Optimization Available', priority: 'high', load: 'LT-1239', category: 'Route Alert' }
              ].map((alert, index) => (
                <div
                  key={index}
                  style={{
                    padding: '16px',
                    background: `${getStatusColor(alert.priority)}15`,
                    border: `1px solid ${getStatusColor(alert.priority)}40`,
                    borderRadius: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `${getStatusColor(alert.priority)}25`
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = `${getStatusColor(alert.priority)}15`
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: getStatusColor(alert.priority),
                        flexShrink: 0
                      }} />
                      <span style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        color: getStatusColor(alert.priority),
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        {alert.category}
                      </span>
                    </div>
                    <span style={{
                      fontSize: '11px',
                      color: theme.colors.textSecondary,
                      fontWeight: '600',
                      background: `${theme.colors.background}80`,
                      padding: '2px 8px',
                      borderRadius: '4px'
                    }}>
                      {alert.priority}
                    </span>
                  </div>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: theme.colors.textPrimary,
                    lineHeight: '1.4'
                  }}>
                    {alert.message}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{
                      fontSize: '12px',
                      color: theme.colors.textSecondary,
                      fontWeight: '500'
                    }}>
                      {alert.load}
                    </span>
                    <button
                      onClick={() => {
                        setNotifications(prev => [...prev, {
                          id: Date.now().toString(),
                          message: `✅ Alert dismissed: ${alert.message}`,
                          type: 'success'
                        }])
                      }}
                      style={{
                        padding: '4px 8px',
                        background: 'transparent',
                        border: `1px solid ${theme.colors.border}`,
                        borderRadius: '4px',
                        color: theme.colors.textSecondary,
                        fontSize: '11px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = theme.colors.backgroundCardHover
                        e.currentTarget.style.color = theme.colors.textPrimary
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                        e.currentTarget.style.color = theme.colors.textSecondary
                      }}
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button
                onClick={() => {
                  setNotifications(prev => [...prev, {
                    id: Date.now().toString(),
                    message: '🔔 All load alerts cleared',
                    type: 'success'
                  }])
                }}
                style={{
                  padding: '12px 24px',
                  background: 'transparent',
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: '8px',
                  color: theme.colors.textSecondary,
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = theme.colors.backgroundCardHover
                  e.currentTarget.style.color = theme.colors.textPrimary
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = theme.colors.textSecondary
                }}
              >
                Clear All Alerts
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Load Modal */}
      {showEditModal && editingLoad && (
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
          onClick={() => setShowEditModal(false)}
        >
          <div
            style={{
              background: theme.colors.backgroundCard,
              borderRadius: '20px',
              padding: '36px',
              maxWidth: '800px',
              width: '100%',
              border: `1px solid ${theme.colors.border}`,
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
              maxHeight: '90vh',
              overflow: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
              <h2 style={{ color: theme.colors.textPrimary, fontSize: '24px', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Edit size={24} color={theme.colors.primary} />
                Edit Load Details
              </h2>
              <button
                onClick={() => setShowEditModal(false)}
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

            {/* Load Info Header */}
            <div style={{ padding: '16px', background: theme.colors.background, borderRadius: '12px', marginBottom: '24px', border: `1px solid ${theme.colors.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary }}>
                    {editingLoad.commodity}
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: theme.colors.textSecondary }}>
                    Load #{editingLoad.id.substring(0, 8)} • {editingLoad.miles} miles
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: theme.colors.success }}>
                    ${formatNumber(editingLoad.revenue)}
                  </p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: theme.colors.textSecondary }}>
                    Gross Revenue
                  </p>
                </div>
              </div>
            </div>

            {/* Important Notice */}
            <div style={{
              background: `${theme.colors.warning}10`,
              border: `1px solid ${theme.colors.warning}30`,
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <AlertCircle size={20} color={theme.colors.warning} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary }}>
                    Carrier-Editable Fields Only
                  </p>
                  <p style={{ margin: 0, fontSize: '13px', color: theme.colors.textSecondary, lineHeight: 1.5 }}>
                    You can only edit cost calculation fields (deadhead, tolls, permits). Customer-set data (dates, locations, commodity) cannot be changed. 
                    If customer changes require modification after rate confirmation is signed, a new rate confirmation must be generated and re-signed.
                  </p>
                </div>
              </div>
            </div>

            {/* Editable Fields */}
            <div style={{ display: 'grid', gap: '20px', marginBottom: '24px' }}>
              {/* Deadhead Miles */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: theme.colors.textPrimary,
                  marginBottom: '8px'
                }}>
                  Deadhead Miles <span style={{ color: theme.colors.textTertiary }}>(Empty miles to pickup)</span>
                </label>
                <input
                  type="number"
                  value={editForm.deadhead}
                  onChange={(e) => setEditForm({ ...editForm, deadhead: parseFloat(e.target.value) || 0 })}
                  min="0"
                  step="0.1"
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
                  onFocus={(e) => {
                    e.target.style.borderColor = theme.colors.primary
                    e.target.style.boxShadow = `0 0 0 3px ${theme.colors.primary}20`
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = theme.colors.border
                    e.target.style.boxShadow = 'none'
                  }}
                />
              </div>

              {/* Tolls */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: theme.colors.textPrimary,
                  marginBottom: '8px'
                }}>
                  Tolls <span style={{ color: theme.colors.textTertiary }}>(Total toll costs)</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: theme.colors.textSecondary,
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    $
                  </span>
                  <input
                    type="number"
                    value={editForm.tolls}
                    onChange={(e) => setEditForm({ ...editForm, tolls: parseFloat(e.target.value) || 0 })}
                    min="0"
                    step="0.01"
                    style={{
                      width: '100%',
                      padding: '12px 12px 12px 24px',
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
                </div>
              </div>

              {/* Permit Cost */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: theme.colors.textPrimary,
                  marginBottom: '8px'
                }}>
                  Permit Cost <span style={{ color: theme.colors.textTertiary }}>(Oversize/overweight permits)</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: theme.colors.textSecondary,
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    $
                  </span>
                  <input
                    type="number"
                    value={editForm.permitCost}
                    onChange={(e) => setEditForm({ ...editForm, permitCost: parseFloat(e.target.value) || 0 })}
                    min="0"
                    step="0.01"
                    style={{
                      width: '100%',
                      padding: '12px 12px 12px 24px',
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
                </div>
              </div>
            </div>

            {/* Calculated Preview */}
            <div style={{
              background: theme.colors.background,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '24px'
            }}>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: '600', color: theme.colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Updated Calculations
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: theme.colors.textSecondary, marginBottom: '4px' }}>Total Miles</div>
                  <div style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary }}>
                    {(editingLoad.miles + editForm.deadhead).toFixed(1)} mi
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: theme.colors.textSecondary, marginBottom: '4px' }}>Total Expenses</div>
                  <div style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.error }}>
                    ${(editForm.deadhead + editForm.tolls + editForm.permitCost).toFixed(2)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: theme.colors.textSecondary, marginBottom: '4px' }}>True Rate/Mile</div>
                  <div style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.success }}>
                    ${((editingLoad.revenue - (editForm.deadhead + editForm.tolls + editForm.permitCost)) / (editingLoad.miles + editForm.deadhead)).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowEditModal(false)}
                style={{
                  padding: '12px 24px',
                  background: 'transparent',
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: '8px',
                  color: theme.colors.textSecondary,
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = theme.colors.backgroundCardHover
                  e.currentTarget.style.color = theme.colors.textPrimary
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = theme.colors.textSecondary
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                style={{
                  padding: '12px 24px',
                  background: `linear-gradient(135deg, ${theme.colors.success} 0%, #059669 100%)`,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: `0 4px 12px ${theme.colors.success}40`,
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <Save size={16} />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rate Confirmation Modal */}
      {showRateConModal && selectedDocumentLoad && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.90)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1001,
            backdropFilter: 'blur(6px)',
            padding: '20px'
          }}
          onClick={() => setShowRateConModal(false)}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '12px',
              padding: '40px',
              maxWidth: '900px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 25px 80px rgba(0, 0, 0, 0.5)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '3px solid #000', paddingBottom: '20px' }}>
              <div>
                <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#000', fontFamily: 'Arial, sans-serif' }}>
                  RATE CONFIRMATION
                </h1>
                <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#666' }}>
                  Legal Contract Document
                </p>
              </div>
              <button
                onClick={() => setShowRateConModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#666',
                  cursor: 'pointer',
                  fontSize: '32px',
                  padding: '0',
                  lineHeight: 1
                }}
              >
                ×
              </button>
            </div>

            {/* Document Content */}
            <div style={{ fontFamily: 'Arial, sans-serif', color: '#000', lineHeight: 1.6 }}>
              {/* Header Info Bar */}
              <div style={{ marginBottom: '25px', padding: '15px', background: '#1a1a1a', color: 'white', borderRadius: '8px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                <div>
                  <div style={{ fontSize: '11px', opacity: 0.7 }}>LOAD ID</div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{selectedDocumentLoad.id}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', opacity: 0.7 }}>CONTRACT DATE</div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{selectedDocumentLoad.rateConSignedDate || new Date().toLocaleDateString()}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', opacity: 0.7 }}>BOL NUMBER</div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{selectedDocumentLoad.bolNumber || 'TBD'}</div>
                </div>
              </div>

              {/* Parties */}
              <div style={{ marginBottom: '25px', padding: '20px', background: '#f8f8f8', borderRadius: '8px' }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: 'bold' }}>PARTIES TO THIS AGREEMENT</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <strong>Customer (Shipper):</strong>
                    <div>{selectedDocumentLoad.customer?.name || 'N/A'}</div>
                    {selectedDocumentLoad.customer?.phone && <div>{selectedDocumentLoad.customer.phone}</div>}
                  </div>
                  <div>
                    <strong>Carrier:</strong>
                    <div>Superior One Logistics</div>
                    <div>Motor Carrier #: [MC Number]</div>
                  </div>
                </div>
              </div>

              {/* Load Details */}
              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: 'bold', borderBottom: '2px solid #000', paddingBottom: '8px' }}>
                  LOAD DETAILS
                </h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #ddd' }}>
                      <td style={{ padding: '10px', fontWeight: 'bold', width: '40%' }}>Commodity:</td>
                      <td style={{ padding: '10px' }}>{selectedDocumentLoad.commodity}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #ddd' }}>
                      <td style={{ padding: '10px', fontWeight: 'bold' }}>Equipment Required:</td>
                      <td style={{ padding: '10px' }}>{selectedDocumentLoad.equipmentType}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #ddd' }}>
                      <td style={{ padding: '10px', fontWeight: 'bold' }}>Quantity:</td>
                      <td style={{ padding: '10px' }}>{selectedDocumentLoad.units} {selectedDocumentLoad.rateMode?.replace('PER_', '')?.toLowerCase()}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #ddd' }}>
                      <td style={{ padding: '10px', fontWeight: 'bold' }}>Total Miles:</td>
                      <td style={{ padding: '10px' }}>{selectedDocumentLoad.miles} miles</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Pickup & Delivery */}
              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: 'bold', borderBottom: '2px solid #000', paddingBottom: '8px' }}>
                  PICKUP & DELIVERY INFORMATION
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div style={{ padding: '15px', background: '#f0f9ff', borderRadius: '6px', border: '2px solid #3b82f6' }}>
                    <strong style={{ fontSize: '14px', color: '#1e40af' }}>PICKUP</strong>
                    <div style={{ marginTop: '10px', fontSize: '14px' }}>
                      <div><strong>Location:</strong> {selectedDocumentLoad.pickupLocation || 'N/A'}</div>
                      <div><strong>Date:</strong> {selectedDocumentLoad.pickupDate ? new Date(selectedDocumentLoad.pickupDate).toLocaleDateString() : 'TBD'}</div>
                      <div><strong>Time:</strong> {selectedDocumentLoad.pickupETA || 'TBD'}</div>
                      {selectedDocumentLoad.pickupContact && (
                        <>
                          <div><strong>Contact:</strong> {selectedDocumentLoad.pickupContact.name}</div>
                          {selectedDocumentLoad.pickupContact.phone && <div><strong>Phone:</strong> {selectedDocumentLoad.pickupContact.phone}</div>}
                        </>
                      )}
                    </div>
                  </div>
                  <div style={{ padding: '15px', background: '#f0fdf4', borderRadius: '6px', border: '2px solid #22c55e' }}>
                    <strong style={{ fontSize: '14px', color: '#15803d' }}>DELIVERY</strong>
                    <div style={{ marginTop: '10px', fontSize: '14px' }}>
                      <div><strong>Location:</strong> {selectedDocumentLoad.deliveryLocation || 'N/A'}</div>
                      <div><strong>Date:</strong> {selectedDocumentLoad.deliveryDate ? new Date(selectedDocumentLoad.deliveryDate).toLocaleDateString() : 'TBD'}</div>
                      <div><strong>Time:</strong> {selectedDocumentLoad.deliveryETA || 'TBD'}</div>
                      {selectedDocumentLoad.deliveryContact && (
                        <>
                          <div><strong>Contact:</strong> {selectedDocumentLoad.deliveryContact.name}</div>
                          {selectedDocumentLoad.deliveryContact.phone && <div><strong>Phone:</strong> {selectedDocumentLoad.deliveryContact.phone}</div>}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Terms - Customer View Only (No Carrier-Specific Costs) */}
              <div style={{ marginBottom: '25px', padding: '20px', background: '#fff7ed', borderRadius: '8px', border: '2px solid #f97316' }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: 'bold' }}>COMPENSATION & FINANCIAL TERMS</h3>
                <table style={{ width: '100%', fontSize: '14px', marginBottom: '15px' }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: '8px 0', fontWeight: 'bold' }}>Total Compensation:</td>
                      <td style={{ padding: '8px 0', textAlign: 'right', fontSize: '28px', fontWeight: 'bold', color: '#15803d' }}>
                        ${formatNumber(selectedDocumentLoad.revenue)}
                      </td>
                    </tr>
                    <tr style={{ borderTop: '1px solid #ddd' }}>
                      <td style={{ padding: '8px 0' }}>Rate Per Mile:</td>
                      <td style={{ padding: '8px 0', textAlign: 'right', fontSize: '18px', fontWeight: '600' }}>
                        {formatCurrency(selectedDocumentLoad?.ratePerMile)}/mi
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '8px 0' }}>Loaded Miles (Pickup to Delivery):</td>
                      <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: '600' }}>{selectedDocumentLoad.miles} miles</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '8px 0' }}>Rate Type:</td>
                      <td style={{ padding: '8px 0', textAlign: 'right' }}>{selectedDocumentLoad.rateMode?.replace('_', ' ')}</td>
                    </tr>
                  </tbody>
                </table>
                <div style={{ padding: '12px', background: '#fef3c7', borderRadius: '6px', fontSize: '12px', color: '#92400e', marginTop: '10px' }}>
                  <strong>Payment Terms:</strong> Payment due within 30 days of delivery via ACH after POD validation. Quick pay (2% discount) available within 5 business days. Payment processed automatically after both Carrier and Customer validate delivery completion.
                </div>
              </div>

              {/* Special Instructions & Requirements */}
              {(selectedDocumentLoad.dispatchNotes || selectedDocumentLoad.notes) && (
                <div style={{ marginBottom: '25px', padding: '20px', background: '#eff6ff', borderRadius: '8px', border: '1px solid #3b82f6' }}>
                  <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 'bold', color: '#1e40af' }}>SPECIAL INSTRUCTIONS</h3>
                  <div style={{ fontSize: '14px', lineHeight: 1.7 }}>
                    {selectedDocumentLoad.dispatchNotes && <div>• {selectedDocumentLoad.dispatchNotes}</div>}
                    {selectedDocumentLoad.notes && <div>• {selectedDocumentLoad.notes}</div>}
                  </div>
                </div>
              )}

              {/* Equipment Requirements */}
              <div style={{ marginBottom: '25px', padding: '20px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #22c55e' }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 'bold', color: '#15803d' }}>EQUIPMENT REQUIREMENTS</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px' }}>
                  <div><strong>Equipment Type:</strong> {selectedDocumentLoad.equipmentType}</div>
                  {selectedDocumentLoad.truckNumber && (
                    <div><strong>Assigned Truck:</strong> #{selectedDocumentLoad.truckNumber}</div>
                  )}
                  {selectedDocumentLoad.trailerNumber && (
                    <div><strong>Assigned Trailer:</strong> #{selectedDocumentLoad.trailerNumber}</div>
                  )}
                  <div><strong>Commodity:</strong> {selectedDocumentLoad.commodity}</div>
                </div>
              </div>

              {/* Accessorial Charges Schedule */}
              <div style={{ marginBottom: '25px', padding: '20px', background: '#fefce8', borderRadius: '8px', border: '2px solid #eab308' }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: 'bold', color: '#854d0e' }}>ACCESSORIAL CHARGES SCHEDULE</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', border: '2px solid #854d0e' }}>
                  <thead>
                    <tr style={{ background: '#fef3c7' }}>
                      <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #854d0e', fontWeight: 'bold' }}>Service</th>
                      <th style={{ padding: '10px', textAlign: 'center', borderBottom: '2px solid #854d0e', fontWeight: 'bold' }}>Rate</th>
                      <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #854d0e', fontWeight: 'bold' }}>Terms</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #d4a308' }}>
                      <td style={{ padding: '10px', fontWeight: '600' }}>Detention</td>
                      <td style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>$75.00/hr</td>
                      <td style={{ padding: '10px', fontSize: '12px' }}>First 2 hours free, then $75/hr in 30-min increments</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #d4a308' }}>
                      <td style={{ padding: '10px', fontWeight: '600' }}>Driver Assist</td>
                      <td style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>$150.00</td>
                      <td style={{ padding: '10px', fontSize: '12px' }}>Flat rate when driver loads/unloads shipment</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #d4a308' }}>
                      <td style={{ padding: '10px', fontWeight: '600' }}>Equipment Not Used</td>
                      <td style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>$200.00</td>
                      <td style={{ padding: '10px', fontSize: '12px' }}>Cancellation within 24hrs of scheduled pickup</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #d4a308' }}>
                      <td style={{ padding: '10px', fontWeight: '600' }}>Stop-Off Charges</td>
                      <td style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>$50-$100</td>
                      <td style={{ padding: '10px', fontSize: '12px' }}>1st: $50, 2nd: $75, 3rd+: $100 per stop</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #d4a308' }}>
                      <td style={{ padding: '10px', fontWeight: '600' }}>Layover (24hrs)</td>
                      <td style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>$250.00</td>
                      <td style={{ padding: '10px', fontSize: '12px' }}>Hold carrier overnight (detention not applicable)</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '10px', fontWeight: '600' }}>Redelivery</td>
                      <td style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>$50.00</td>
                      <td style={{ padding: '10px', fontSize: '12px' }}>Consignee refuses delivery, requires return trip</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '10px', fontWeight: '600' }}>Reconsignment</td>
                      <td style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>$50.00</td>
                      <td style={{ padding: '10px', fontSize: '12px' }}>Change delivery location after arrival + mileage</td>
                    </tr>
                  </tbody>
                </table>
                <div style={{ padding: '12px', background: '#fef3c7', borderRadius: '6px', fontSize: '11px', color: '#854d0e', marginTop: '12px', lineHeight: 1.6 }}>
                  <strong>Important Notice:</strong> These accessorial rates were agreed to by Customer during onboarding via signed Service Agreement. Charges are applied when applicable and invoiced separately with the primary freight payment.<br/><br/>
                  <strong>Platform Fee Distribution:</strong> For Equipment Not Used and Layover charges, 25% of the total goes to the Superior One Logistics platform as a service fee, and 75% goes to the Carrier. All other accessorial charges go 100% to the Carrier.
                </div>
              </div>

              {/* Terms & Conditions */}
              <div style={{ marginBottom: '25px', padding: '20px', background: '#fef2f2', borderRadius: '8px', border: '1px solid #ef4444' }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 'bold', color: '#991b1b' }}>BINDING TERMS & CONDITIONS</h3>
                <div style={{ fontSize: '12px', lineHeight: 1.7, color: '#000' }}>
                  <p style={{ margin: '0 0 10px 0' }}>
                    <strong>1. CONTRACTUAL COMMITMENT:</strong> This Rate Confirmation constitutes a legally binding contract between Customer (Shipper), Carrier, and assigned Driver. Both Dispatch/Owner AND Driver must sign to execute this agreement.
                  </p>
                  <p style={{ margin: '0 0 10px 0' }}>
                    <strong>2. DRIVER ACCEPTANCE:</strong> Driver must accept load via SMS verification. Failure to accept within required timeframe renders this contract null and void.
                  </p>
                  <p style={{ margin: '0 0 10px 0' }}>
                    <strong>3. SCHEDULE CHANGES:</strong> Any modification to pickup/delivery dates or locations by Customer after signing requires generation and re-signature of new Rate Confirmation by both Dispatch/Owner and Driver.
                  </p>
                  <p style={{ margin: '0 0 10px 0' }}>
                    <strong>4. DOCUMENTATION:</strong> Carrier must provide signed Bill of Lading at pickup and Proof of Delivery at delivery. Electronic signatures are accepted and legally binding.
                  </p>
                  <p style={{ margin: '0 0 10px 0' }}>
                    <strong>5. PAYMENT:</strong> Payment processed via ACH after delivery validation by both Carrier and Customer. Customer ACH withdrawal occurs after POD approval.
                  </p>
                  <p style={{ margin: '0 0 10px 0' }}>
                    <strong>6. CANCELLATION:</strong> Cancellation by either party after signing may result in cancellation fees as outlined in the Master Service Agreement. Equipment ordered but not used within 24 hours: $200 flat fee.
                  </p>
                  <p style={{ margin: '0 0 10px 0' }}>
                    <strong>7. INSURANCE:</strong> Carrier maintains required cargo insurance and liability coverage as per federal regulations.
                  </p>
                  <p style={{ margin: '0 0 10px 0' }}>
                    <strong>8. ACCESSORIAL CHARGES:</strong> All accessorial charges (detention, layover, stop-offs, etc.) must be pre-approved by Customer and are invoiced separately. See Accessorial Schedule above for rates.
                  </p>
                  <p style={{ margin: '0' }}>
                    <strong>9. DISPUTE RESOLUTION:</strong> Any disputes shall be resolved through arbitration in accordance with the Master Service Agreement.
                  </p>
                </div>
              </div>

              {/* Carrier Insurance & Compliance */}
              <div style={{ marginBottom: '25px', padding: '20px', background: '#f0f9ff', borderRadius: '8px', border: '1px solid #3b82f6' }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 'bold', color: '#1e40af' }}>CARRIER INSURANCE & COMPLIANCE</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                  <div><strong>Motor Carrier:</strong> Superior One Logistics</div>
                  <div><strong>MC Number:</strong> [MC-XXXXXX]</div>
                  <div><strong>DOT Number:</strong> [DOT-XXXXXX]</div>
                  <div><strong>EIN:</strong> [XX-XXXXXXX]</div>
                  <div><strong>Cargo Insurance:</strong> $100,000 Coverage</div>
                  <div><strong>Liability Insurance:</strong> $1,000,000 Coverage</div>
                  <div><strong>Policy Number:</strong> [POL-XXXXXX]</div>
                  <div><strong>Expiration:</strong> [MM/DD/YYYY]</div>
                </div>
              </div>

              {/* Driver Assignment */}
              {selectedDocumentLoad.driver && (
                <div style={{ marginBottom: '25px', padding: '20px', background: '#fef3c7', borderRadius: '8px', border: '2px solid #f59e0b' }}>
                  <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 'bold' }}>ASSIGNED DRIVER & EQUIPMENT</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px' }}>
                    <div><strong>Driver Name:</strong> {selectedDocumentLoad.driver.name}</div>
                    {selectedDocumentLoad.driverPhone && <div><strong>Driver Phone:</strong> {selectedDocumentLoad.driverPhone}</div>}
                    <div><strong>License Number:</strong> [DL-XXXXXXX]</div>
                    <div><strong>License State:</strong> TX</div>
                    {selectedDocumentLoad.truckNumber && (
                      <>
                        <div><strong>Truck Number:</strong> #{selectedDocumentLoad.truckNumber}</div>
                        <div><strong>Trailer Number:</strong> #{selectedDocumentLoad.trailerNumber}</div>
                      </>
                    )}
                    <div><strong>SMS Verified:</strong> ✓ Confirmed</div>
                    <div><strong>Driver Status:</strong> Active & Verified</div>
                  </div>
                </div>
              )}

              {/* Emergency Contact Information */}
              <div style={{ marginBottom: '25px', padding: '15px', background: '#fef2f2', borderRadius: '8px', border: '1px solid #ef4444' }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 'bold', color: '#991b1b' }}>EMERGENCY CONTACTS</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', fontSize: '13px' }}>
                  <div>
                    <strong>Dispatch 24/7:</strong><br />
                    (888) 555-HAUL
                  </div>
                  <div>
                    <strong>Customer Service:</strong><br />
                    support@superiorone.com
                  </div>
                  <div>
                    <strong>Emergency Line:</strong><br />
                    (888) 555-9111
                  </div>
                </div>
              </div>

              {/* Signatures */}
              <div style={{ marginTop: '40px', paddingTop: '30px', borderTop: '2px solid #000' }}>
                <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: 'bold' }}>SIGNATURES</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                  <div>
                    <div style={{ borderBottom: '2px solid #000', paddingBottom: '5px', marginBottom: '10px' }}>
                      <em style={{ fontSize: '18px', fontFamily: 'cursive' }}>
                        {selectedDocumentLoad.rateConSignedBy || 'Dispatch Signature'}
                      </em>
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>Dispatch/Owner Signature</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>Date: {selectedDocumentLoad.rateConSignedDate || new Date().toLocaleDateString()}</div>
                  </div>
                  <div>
                    <div style={{ borderBottom: '2px solid #000', paddingBottom: '5px', marginBottom: '10px' }}>
                      <em style={{ fontSize: '18px', fontFamily: 'cursive' }}>
                        {selectedDocumentLoad.driver?.name || 'Driver Signature'}
                      </em>
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>Driver Signature (SMS Verified)</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>Date: {selectedDocumentLoad.rateConSignedDate || new Date().toLocaleDateString()}</div>
                  </div>
                </div>
              </div>

              {/* Legal Notice */}
              <div style={{ marginTop: '30px', padding: '15px', background: '#f3f4f6', borderRadius: '6px', fontSize: '11px', color: '#666', lineHeight: 1.5 }}>
                <strong>LEGAL NOTICE:</strong> This Rate Confirmation constitutes a binding contract between all parties. Any modification to pickup/delivery dates after signing requires generation and re-signature of a new Rate Confirmation by both dispatch/owner and driver.
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ marginTop: '30px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => window.print()}
                style={{
                  padding: '12px 24px',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Print Document
              </button>
              <button
                onClick={() => setShowRateConModal(false)}
                style={{
                  padding: '12px 24px',
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BOL Modal */}
      {showBOLModal && selectedDocumentLoad && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.90)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1001,
            backdropFilter: 'blur(6px)',
            padding: '20px'
          }}
          onClick={() => setShowBOLModal(false)}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '12px',
              padding: '40px',
              maxWidth: '900px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 25px 80px rgba(0, 0, 0, 0.5)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '3px solid #000', paddingBottom: '20px' }}>
              <div>
                <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#000', fontFamily: 'Arial, sans-serif' }}>
                  BILL OF LADING
                </h1>
                <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#666' }}>
                  BOL #{selectedDocumentLoad.bolNumber || 'N/A'} • Pickup Confirmation
                </p>
              </div>
              <button
                onClick={() => setShowBOLModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#666',
                  cursor: 'pointer',
                  fontSize: '32px',
                  padding: '0',
                  lineHeight: 1
                }}
              >
                ×
              </button>
            </div>

            {/* Document Content */}
            <div style={{ fontFamily: 'Arial, sans-serif', color: '#000', lineHeight: 1.6 }}>
              {/* Shipper Info */}
              <div style={{ marginBottom: '25px', padding: '20px', background: '#f0f9ff', borderRadius: '8px', border: '2px solid #3b82f6' }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: 'bold', color: '#1e40af' }}>SHIPPER</h3>
                <div><strong>Location:</strong> {selectedDocumentLoad.pickupLocation || 'N/A'}</div>
                {selectedDocumentLoad.pickupContact && (
                  <>
                    <div><strong>Contact:</strong> {selectedDocumentLoad.pickupContact.name}</div>
                    {selectedDocumentLoad.pickupContact.phone && <div><strong>Phone:</strong> {selectedDocumentLoad.pickupContact.phone}</div>}
                  </>
                )}
                <div><strong>Pickup Date:</strong> {selectedDocumentLoad.pickupDate ? new Date(selectedDocumentLoad.pickupDate).toLocaleDateString() : 'TBD'} @ {selectedDocumentLoad.pickupETA || 'TBD'}</div>
              </div>

              {/* Consignee Info */}
              <div style={{ marginBottom: '25px', padding: '20px', background: '#f0fdf4', borderRadius: '8px', border: '2px solid #22c55e' }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: 'bold', color: '#15803d' }}>CONSIGNEE</h3>
                <div><strong>Location:</strong> {selectedDocumentLoad.deliveryLocation || 'N/A'}</div>
                {selectedDocumentLoad.deliveryContact && (
                  <>
                    <div><strong>Contact:</strong> {selectedDocumentLoad.deliveryContact.name}</div>
                    {selectedDocumentLoad.deliveryContact.phone && <div><strong>Phone:</strong> {selectedDocumentLoad.deliveryContact.phone}</div>}
                  </>
                )}
                <div><strong>Delivery Date:</strong> {selectedDocumentLoad.deliveryDate ? new Date(selectedDocumentLoad.deliveryDate).toLocaleDateString() : 'TBD'} @ {selectedDocumentLoad.deliveryETA || 'TBD'}</div>
              </div>

              {/* Freight Description */}
              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: 'bold', borderBottom: '2px solid #000', paddingBottom: '8px' }}>
                  FREIGHT DESCRIPTION
                </h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', border: '2px solid #000' }}>
                  <thead>
                    <tr style={{ background: '#f3f4f6' }}>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #000' }}>Description</th>
                      <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #000' }}>Quantity</th>
                      <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #000' }}>Unit</th>
                      <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #000' }}>Equipment</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>{selectedDocumentLoad.commodity}</td>
                      <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>{selectedDocumentLoad.units}</td>
                      <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>{selectedDocumentLoad.rateMode?.replace('PER_', '')}</td>
                      <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>{selectedDocumentLoad.equipmentType}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Carrier & Driver Info */}
              <div style={{ marginBottom: '25px', padding: '20px', background: '#fef3c7', borderRadius: '8px', border: '1px solid #f59e0b' }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: 'bold' }}>CARRIER & DRIVER INFORMATION</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', fontSize: '14px' }}>
                  <div>
                    <strong>Carrier:</strong> Superior One Logistics<br />
                    <strong>Load ID:</strong> {selectedDocumentLoad.id}
                  </div>
                  {selectedDocumentLoad.driver && (
                    <div>
                      <strong>Driver:</strong> {selectedDocumentLoad.driver.name}<br />
                      {selectedDocumentLoad.truckNumber && <div><strong>Truck:</strong> #{selectedDocumentLoad.truckNumber}</div>}
                    </div>
                  )}
                </div>
              </div>

              {/* Signatures */}
              <div style={{ marginTop: '40px', paddingTop: '30px', borderTop: '2px solid #000' }}>
                <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: 'bold' }}>SHIPPER CERTIFICATION</h3>
                <div style={{ marginBottom: '30px' }}>
                  <div style={{ borderBottom: '2px solid #000', paddingBottom: '5px', marginBottom: '10px', width: '50%' }}>
                    <em style={{ fontSize: '18px', fontFamily: 'cursive' }}>
                      {selectedDocumentLoad.pickupContact?.name || 'Shipper Signature'}
                    </em>
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Shipper's Signature (Certifies freight loaded)</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Date/Time: {selectedDocumentLoad.bolUploadDate || 'N/A'}</div>
                </div>
              </div>

              {/* Legal Notice */}
              <div style={{ marginTop: '30px', padding: '15px', background: '#f3f4f6', borderRadius: '6px', fontSize: '11px', color: '#666', lineHeight: 1.5 }}>
                <strong>NOTICE:</strong> This Bill of Lading serves as legal proof that freight was loaded and dispatched from the pickup location. This document is required for payment processing and dispute resolution.
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ marginTop: '30px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => window.print()}
                style={{
                  padding: '12px 24px',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Print BOL
              </button>
              <button
                onClick={() => setShowBOLModal(false)}
                style={{
                  padding: '12px 24px',
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POD Modal */}
      {showPODModal && selectedDocumentLoad && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.90)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1001,
            backdropFilter: 'blur(6px)',
            padding: '20px'
          }}
          onClick={() => setShowPODModal(false)}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '12px',
              padding: '40px',
              maxWidth: '900px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 25px 80px rgba(0, 0, 0, 0.5)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '3px solid #15803d', paddingBottom: '20px' }}>
              <div>
                <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#15803d', fontFamily: 'Arial, sans-serif' }}>
                  PROOF OF DELIVERY
                </h1>
                <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#666' }}>
                  POD Confirmation • Legal Delivery Receipt
                </p>
              </div>
              <button
                onClick={() => setShowPODModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#666',
                  cursor: 'pointer',
                  fontSize: '32px',
                  padding: '0',
                  lineHeight: 1
                }}
              >
                ×
              </button>
            </div>

            {/* Document Content */}
            <div style={{ fontFamily: 'Arial, sans-serif', color: '#000', lineHeight: 1.6 }}>
              {/* Load Summary */}
              <div style={{ marginBottom: '25px', padding: '20px', background: '#f0fdf4', borderRadius: '8px', border: '2px solid #22c55e' }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: 'bold', color: '#15803d' }}>DELIVERY SUMMARY</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', fontSize: '14px' }}>
                  <div><strong>Load ID:</strong> {selectedDocumentLoad.id}</div>
                  <div><strong>BOL Number:</strong> {selectedDocumentLoad.bolNumber || 'N/A'}</div>
                  <div><strong>Commodity:</strong> {selectedDocumentLoad.commodity}</div>
                  <div><strong>Quantity:</strong> {selectedDocumentLoad.units} {selectedDocumentLoad.rateMode?.replace('PER_', '')}</div>
                </div>
              </div>

              {/* Delivery Information */}
              <div style={{ marginBottom: '25px', padding: '20px', background: '#f0f9ff', borderRadius: '8px', border: '2px solid #3b82f6' }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: 'bold', color: '#1e40af' }}>DELIVERY LOCATION</h3>
                <div style={{ fontSize: '14px' }}>
                  <div><strong>Address:</strong> {selectedDocumentLoad.deliveryLocation || 'N/A'}</div>
                  {selectedDocumentLoad.deliveryContact && (
                    <>
                      <div><strong>Consignee:</strong> {selectedDocumentLoad.deliveryContact.name}</div>
                      {selectedDocumentLoad.deliveryContact.phone && <div><strong>Phone:</strong> {selectedDocumentLoad.deliveryContact.phone}</div>}
                    </>
                  )}
                  <div><strong>Scheduled:</strong> {selectedDocumentLoad.deliveryDate ? new Date(selectedDocumentLoad.deliveryDate).toLocaleDateString() : 'TBD'} @ {selectedDocumentLoad.deliveryETA || 'TBD'}</div>
                  <div><strong>Actual Delivery:</strong> {selectedDocumentLoad.podUploadDate || 'N/A'}</div>
                </div>
              </div>

              {/* Carrier & Driver */}
              <div style={{ marginBottom: '25px', padding: '20px', background: '#fef3c7', borderRadius: '8px', border: '1px solid #f59e0b' }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: 'bold' }}>CARRIER & DRIVER</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', fontSize: '14px' }}>
                  <div>
                    <strong>Carrier:</strong> Superior One Logistics<br />
                    <strong>Customer:</strong> {selectedDocumentLoad.customer?.name || 'N/A'}
                  </div>
                  {selectedDocumentLoad.driver && (
                    <div>
                      <strong>Driver:</strong> {selectedDocumentLoad.driver.name}<br />
                      {selectedDocumentLoad.driverPhone && <div><strong>Phone:</strong> {selectedDocumentLoad.driverPhone}</div>}
                      {selectedDocumentLoad.truckNumber && <div><strong>Equipment:</strong> Truck #{selectedDocumentLoad.truckNumber}</div>}
                    </div>
                  )}
                </div>
              </div>

              {/* Delivery Confirmation */}
              <div style={{ marginBottom: '25px', padding: '20px', background: '#dcfce7', borderRadius: '8px', border: '2px solid #16a34a' }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: 'bold', color: '#15803d' }}>✓ DELIVERY CONFIRMED</h3>
                <div style={{ fontSize: '14px' }}>
                  <div><strong>Status:</strong> <span style={{ color: '#15803d', fontWeight: 'bold' }}>DELIVERED</span></div>
                  <div><strong>Received By:</strong> {selectedDocumentLoad.deliveryContact?.name || 'Consignee'}</div>
                  <div><strong>Timestamp:</strong> {selectedDocumentLoad.podUploadDate || new Date().toLocaleString()}</div>
                  <div><strong>Condition:</strong> Good Order (No Damage Reported)</div>
                </div>
              </div>

              {/* Signatures */}
              <div style={{ marginTop: '40px', paddingTop: '30px', borderTop: '2px solid #000' }}>
                <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: 'bold' }}>CONSIGNEE CERTIFICATION</h3>
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ borderBottom: '2px solid #000', paddingBottom: '5px', marginBottom: '10px', width: '50%' }}>
                    <em style={{ fontSize: '18px', fontFamily: 'cursive' }}>
                      {selectedDocumentLoad.deliveryContact?.name || 'Consignee Signature'}
                    </em>
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Consignee's Signature (Certifies receipt of freight in good condition)</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Date/Time: {selectedDocumentLoad.podUploadDate || 'N/A'}</div>
                </div>
                <div style={{ fontSize: '12px', color: '#666', fontStyle: 'italic' }}>
                  Electronic signature captured via mobile device at delivery location
                </div>
              </div>

              {/* Legal Notice */}
              <div style={{ marginTop: '30px', padding: '15px', background: '#f3f4f6', borderRadius: '6px', fontSize: '11px', color: '#666', lineHeight: 1.5 }}>
                <strong>LEGAL NOTICE:</strong> This Proof of Delivery serves as legal documentation that freight was successfully delivered and received in good condition. This document is required for payment processing and serves as proof of completion for all parties involved.
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ marginTop: '30px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => window.print()}
                style={{
                  padding: '12px 24px',
                  background: '#22c55e',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Print POD
              </button>
              <button
                onClick={() => setShowPODModal(false)}
                style={{
                  padding: '12px 24px',
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TONU Filing Modal */}
      {showTonuModal && tonuLoad && (
        <TonuFilingModal
          load={tonuLoad}
          onClose={() => {
            setShowTonuModal(false)
            setTonuLoad(null)
          }}
          onSuccess={() => {
            loadMyLoads() // Refresh load list
          }}
        />
      )}
    </PageContainer>
  )
}

// Force recompilation - MyLoadsPage with clickable legal documents (Rate Con, BOL, POD)
export default CarrierMyLoadsPage


