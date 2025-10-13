import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../../contexts/ThemeContext'
import { customerAPI } from '../../services/api'
import PageContainer from '../../components/PageContainer'
import Card from '../../components/Card'
import ReleaseConfirmationModal from '../../components/ReleaseConfirmationModal'
import { formatNumber, formatCurrency, formatCompactCurrency, formatPercentage } from '../../utils/formatters';

import {
  Package, TrendingUp, Clock, CheckCircle, AlertCircle, XCircle,
  Truck, DollarSign, MapPin, Plus, Eye, Filter, Search,
  Calendar, User, MessageSquare, ThumbsUp, ThumbsDown, Loader,
  FileText, FileSignature, ChevronDown, ChevronUp, Navigation,
  Phone, Edit, PlayCircle, Bell
} from 'lucide-react'

interface Bid {
  id: string
  carrier: {
    id: string
    name: string
    rating?: number
    completedLoads?: number
  }
  bidAmount?: number
  message?: string
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
  createdAt: string
  expiresAt?: string
}

interface Load {
  id: string
  commodity: string
  status: string
  units: number
  rateMode: string
  pieceCount?: number
  carrier?: { name: string; phone?: string }
  origin: any
  destination: any
  miles: number
  eta?: string
  completedAt?: string
  scheduledFor?: string
  createdAt: string
  bidCount: number
  bids?: Bid[]
  equipmentType?: string
  revenue?: number
  // Document tracking
  rateConSigned?: boolean
  rateConSignedDate?: string
  rateConSignedBy?: string
  dispatchSignedAt?: string
  driverAcceptanceDeadline?: string
  driverAccepted?: boolean
  bolUploaded?: boolean
  bolUploadDate?: string
  bolNumber?: string
  podUploaded?: boolean
  podUploadDate?: string
  podReceived?: boolean
  // Contact information
  pickupLocation?: string
  pickupDate?: string
  pickupETA?: string
  pickupContact?: { name: string; phone?: string }
  deliveryLocation?: string
  deliveryDate?: string
  deliveryETA?: string
  deliveryContact?: { name: string; phone?: string }
  // Driver assignment
  driver?: { name: string; phone?: string }
  driverPhone?: string
  truckNumber?: string
  trailerNumber?: string
  // Financial
  ratePerMile?: number
  customerPaid?: boolean
  // Notes
  notes?: string
  dispatchNotes?: string
  updateArrival?: string
  updateDelivery?: string
}

const MyLoadsPage = () => {
  const { theme } = useTheme()
  const navigate = useNavigate()

  const [loads, setLoads] = useState<Load[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLoad, setSelectedLoad] = useState<Load | null>(null)
  const [showBidsModal, setShowBidsModal] = useState(false)
  const [expandedLoads, setExpandedLoads] = useState<Set<string>>(new Set())
  const [showRateConModal, setShowRateConModal] = useState(false)
  const [showBOLModal, setShowBOLModal] = useState(false)
  const [showPODModal, setShowPODModal] = useState(false)
  const [selectedDocumentLoad, setSelectedDocumentLoad] = useState<Load | null>(null)
  const [showReleaseModal, setShowReleaseModal] = useState(false)
  const [releaseLoad, setReleaseLoad] = useState<Load | null>(null)
  const [filterEquipment, setFilterEquipment] = useState('all')
  const [sortBy, setSortBy] = useState('date')
  const [viewMode, setViewMode] = useState<'posted' | 'active'>('active')
  const [showEditLoadModal, setShowEditLoadModal] = useState(false)
  const [editingLoad, setEditingLoad] = useState<Load | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [editForm, setEditForm] = useState({
    pickupDate: '',
    pickupETA: '',
    deliveryDate: '',
    deliveryETA: '',
    commodity: '',
    revenue: 0,
    ratePerMile: 0,
    units: 0,
    pieceCount: 0
  })

  useEffect(() => {
    loadMyLoads()
  }, [])

  // Timer for 30-minute driver acceptance countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
      
      // Check for expired driver acceptance deadlines
      setLoads(prevLoads => 
        prevLoads.map(load => {
          // Check for expired acceptance deadlines
          if (load.driverAcceptanceDeadline && !load.driverAccepted && !load.rateConSigned) {
            const deadline = new Date(load.driverAcceptanceDeadline).getTime()
            const now = new Date().getTime()
            
            if (now >= deadline) {
              // Timer expired - load returned to board
              console.log(`⚠️ Driver acceptance expired for Load ${load.id} - Returned to Load Board`)
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
        console.log('🧪 Development mode - using mock loads data')

        // Mock loads data
        setLoads([
          {
            id: 'load-001',
            commodity: 'Crushed Limestone',
            status: 'POSTED',
            units: 18.5,
            rateMode: 'PER_TON',
            origin: { siteName: 'Main Quarry', address: '1234 Rock Rd, Austin, TX' },
            destination: { siteName: 'Downtown Project', address: '789 Congress Ave, Austin, TX' },
            miles: 12.3,
            scheduledFor: 'Tomorrow 8:00 AM',
            createdAt: '2025-10-06T10:30:00Z',
            bidCount: 3,
            bids: [
              {
                id: 'bid-001',
                carrier: { id: 'c1', name: 'Superior Carriers Inc', rating: 4.8, completedLoads: 127 },
                bidAmount: 925,
                message: 'We can handle this load efficiently. 10+ years experience.',
                status: 'PENDING',
                createdAt: '2025-10-06T11:00:00Z',
                expiresAt: '2025-10-08T11:00:00Z'
              },
              {
                id: 'bid-002',
                carrier: { id: 'c2', name: 'Lone Star Trucking', rating: 4.5, completedLoads: 89 },
                bidAmount: 875,
                message: 'Competitive rate, fast service.',
                status: 'PENDING',
                createdAt: '2025-10-06T11:15:00Z'
              },
              {
                id: 'bid-003',
                carrier: { id: 'c3', name: 'Texas Haulers LLC', rating: 4.6, completedLoads: 156 },
                message: 'Express interest - will match your posted rate.',
                status: 'PENDING',
                createdAt: '2025-10-06T11:30:00Z'
              }
            ]
          },
          {
            id: 'load-002',
            commodity: 'Concrete Mix',
            status: 'ASSIGNED',
            units: 25.0,
            rateMode: 'PER_TON',
            carrier: { name: 'Superior Carriers Inc', phone: '(888) 555-2020' },
            origin: { siteName: 'North Plant', address: '456 Industrial Blvd, Round Rock, TX', city: 'Round Rock' },
            destination: { siteName: 'Highway 290 Bridge', address: 'Hwy 290 & Oak Hill, Austin, TX', city: 'Austin' },
            miles: 18.7,
            scheduledFor: 'Today 2:00 PM',
            createdAt: '2025-10-05T14:00:00Z',
            bidCount: 0,
            bids: [],
            equipmentType: 'Mixer',
            revenue: 1250,
            ratePerMile: 66.84,
            pickupLocation: 'North Plant - Round Rock, TX',
            pickupDate: '2025-10-10',
            pickupETA: '6:00 AM',
            pickupContact: { name: 'Sarah Plant Manager', phone: '(512) 555-0777' },
            deliveryLocation: 'Highway 290 Bridge - Austin, TX',
            deliveryDate: '2025-10-10',
            deliveryETA: '10:00 AM',
            deliveryContact: { name: 'Mike Construction Lead', phone: '(512) 555-0666' },
            driver: { name: 'Sarah Johnson', phone: '(512) 555-0287' },
            driverPhone: '(512) 555-0287',
            truckNumber: '1872',
            trailerNumber: 'T-523',
            rateConSigned: false,
            rateConSignedDate: null,
            rateConSignedBy: null,
            dispatchSignedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
            driverAcceptanceDeadline: new Date(Date.now() + 25 * 60 * 1000).toISOString(), // 25 minutes from now
            driverAccepted: false,
            bolUploaded: false,
            bolNumber: null,
            podUploaded: false,
            podReceived: false,
            customerPaid: false,
            notes: 'Time-sensitive delivery. Must arrive before 10 AM.',
            dispatchNotes: 'Time-sensitive delivery. MUST arrive before 10 AM. Pour scheduled at 10:15 AM.'
          },
          {
            id: 'load-003',
            commodity: 'Gravel Base',
            status: 'IN_TRANSIT',
            units: 22.3,
            rateMode: 'PER_TON',
            carrier: { name: 'Lone Star Trucking', phone: '(888) 555-3030' },
            origin: { siteName: 'South Quarry', address: '789 Quarry Ln, Buda, TX', city: 'Buda' },
            destination: { siteName: 'Airport Expansion', address: 'Austin-Bergstrom Airport, Austin, TX', city: 'Austin' },
            miles: 15.2,
            eta: '2:45 PM',
            createdAt: '2025-10-05T08:00:00Z',
            bidCount: 0,
            bids: [],
            equipmentType: 'End Dump',
            revenue: 1115,
            ratePerMile: 73.36,
            pickupLocation: 'South Quarry - Buda, TX',
            pickupDate: '2025-10-09',
            pickupETA: '1:00 PM',
            pickupContact: { name: 'Carlos Site Manager', phone: '(512) 555-0555' },
            deliveryLocation: 'Airport Expansion - Austin, TX',
            deliveryDate: '2025-10-09',
            deliveryETA: '3:00 PM',
            deliveryContact: { name: 'James Airport Security', phone: '(512) 555-0444' },
            driver: { name: 'Mike Rodriguez', phone: '(512) 555-0423' },
            driverPhone: '(512) 555-0423',
            truckNumber: '3421',
            trailerNumber: 'T-912',
            rateConSigned: true,
            rateConSignedDate: '2025-10-08',
            rateConSignedBy: 'Dispatch Manager',
            dispatchSignedAt: '2025-10-08T08:00:00Z',
            driverAcceptanceDeadline: '2025-10-08T08:30:00Z',
            driverAccepted: true,
            bolUploaded: true,
            bolUploadDate: '2025-10-09 1:20 PM',
            bolNumber: 'BOL-003-2025',
            podUploaded: false,
            podReceived: false,
            customerPaid: false,
            notes: 'Airport security requires check-in at Gate 5.',
            dispatchNotes: 'Airport security requires driver to check in at Gate 5.',
            updateArrival: 'Driver confirmed loaded and departed at 1:15 PM',
            updateDelivery: 'ETA updated to 2:45 PM, on schedule'
          },
          {
            id: 'load-004',
            commodity: 'Sand',
            status: 'COMPLETED',
            units: 16.8,
            rateMode: 'PER_TON',
            carrier: { name: 'Texas Haulers LLC', phone: '(888) 555-4040' },
            origin: { siteName: 'East Pit', address: '321 Sand Dr, Manor, TX', city: 'Manor' },
            destination: { siteName: 'Residential Development', address: '555 New Home Way, Pflugerville, TX', city: 'Pflugerville' },
            miles: 9.4,
            completedAt: 'Yesterday 11:30 AM',
            createdAt: '2025-10-04T06:00:00Z',
            bidCount: 0,
            bids: [],
            equipmentType: 'End Dump',
            revenue: 756,
            ratePerMile: 80.43,
            pickupLocation: 'East Pit - Manor, TX',
            pickupDate: '2025-10-08',
            pickupETA: '9:00 AM',
            pickupContact: { name: 'Tom Supervisor', phone: '(512) 555-0900' },
            deliveryLocation: 'Residential Development - Pflugerville, TX',
            deliveryDate: '2025-10-08',
            deliveryETA: '11:00 AM',
            deliveryContact: { name: 'Maria Site Lead', phone: '(512) 555-0800' },
            driver: { name: 'David Chen', phone: '(512) 555-0312' },
            driverPhone: '(512) 555-0312',
            truckNumber: '1634',
            trailerNumber: 'T-445',
            rateConSigned: true,
            rateConSignedDate: '2025-10-07',
            rateConSignedBy: 'Owner',
            dispatchSignedAt: '2025-10-07T14:00:00Z',
            driverAcceptanceDeadline: '2025-10-07T14:30:00Z',
            driverAccepted: true,
            bolUploaded: true,
            bolUploadDate: '2025-10-08 9:15 AM',
            bolNumber: 'BOL-004-2025',
            podUploaded: true,
            podUploadDate: '2025-10-08 11:35 AM',
            podReceived: true,
            customerPaid: false,
            notes: 'Contact site supervisor upon arrival.',
            dispatchNotes: 'Contact site supervisor Maria at (512) 555-0821 upon arrival.',
            updateArrival: 'Driver arrived and loaded at 9:10 AM',
            updateDelivery: 'Delivered and signed at 11:30 AM'
          }
        ])

        setLoading(false)
        return
      }

      // Production mode - fetch from API
      const response = await customerAPI.getLoads({ page: 1, limit: 50 })
      setLoads(response.loads || [])

    } catch (err: any) {
      console.error('Error loading loads:', err)
      setError(err.response?.data?.error || err.message || 'Failed to load loads')
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptBid = async (loadId: string, bidId: string) => {
    if (!window.confirm('Are you sure you want to accept this bid? This will assign the load to this carrier and generate a Rate Confirmation.')) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const isDevMode = token?.startsWith('dev-')

      if (isDevMode) {
        console.log('🧪 Accepting bid and generating Rate Con:', { loadId, bidId })
        
        // Import Rate Con service
        const { rateConService } = await import('../../services/rateConService')
        
        // Get the selected load and bid
        const load = loads.find(l => l.id === loadId)
        const bid = load?.bids?.find(b => b.id === bidId)
        
        if (!load || !bid) {
          throw new Error('Load or bid not found')
        }

        // Generate Rate Con
        const rateConData = {
          loadId: load.id,
          customerId: 'customer-123', // Mock customer ID
          carrierId: bid.carrier.id,
          driverId: 'driver-123', // Mock driver ID
          bidId: bid.id,
          
          // Load Details
          commodity: load.commodity,
          equipment: load.equipmentType || 'End Dump',
          units: load.units,
          rateMode: load.rateMode,
          rate: bid.bidAmount || load.revenue,
          
          // Locations (reveal full addresses after acceptance)
          pickupAddress: load.origin?.address || `${load.origin?.city}, TX`,
          deliveryAddress: load.destination?.address || `${load.destination?.city}, TX`,
          pickupContact: { name: 'Site Manager', phone: '(512) 555-0123' },
          deliveryContact: { name: 'Project Manager', phone: '(512) 555-0456' },
          
          // Dates & Times
          pickupDate: load.pickupDate || '2025-10-15',
          pickupETA: load.pickupETA || '8:00 AM - 10:00 AM',
          deliveryDate: load.deliveryDate || '2025-10-15',
          deliveryETA: load.deliveryETA || '2:00 PM - 4:00 PM',
          
          // Financial
          grossRevenue: bid.bidAmount || load.revenue,
          platformFee: (bid.bidAmount || load.revenue) * 0.08, // 8% platform fee
          carrierPayout: (bid.bidAmount || load.revenue) * 0.92,
          
          // Accessorial Charges
          accessorials: {
            layover: { rate: 150, platformFee: 37.50, carrierPayout: 112.50 },
            equipmentNotUsed: { rate: 200, platformFee: 50, carrierPayout: 150 }
          },
          
          // Workflow
          dispatchPhone: '(512) 555-0100',
          driverPhone: '(512) 555-0198',
          customerPhone: '(512) 555-0123'
        }

        // Generate Rate Con
        const workflow = await rateConService.generateRateCon(rateConData)
        
        console.log('✅ Rate Con generated:', workflow.id)
        
        alert(
          `✅ BID ACCEPTED & RATE CON GENERATED!\n\n` +
          `Load: ${load.id}\n` +
          `Carrier: ${bid.carrier.name}\n` +
          `Rate: $${bid.bidAmount || load.revenue}\n\n` +
          `📄 Rate Confirmation has been automatically generated and sent to:\n` +
          `• Dispatch/Owner (signed automatically)\n` +
          `• Driver via SMS (30-minute acceptance deadline)\n\n` +
          `⏰ Driver has 30 minutes to accept via SMS\n` +
          `📱 If driver doesn't respond, load returns to Load Board\n\n` +
          `Next: Monitor driver acceptance in "Active Loads"`
        )
        
        // Update local state
        setLoads(prevLoads => 
          prevLoads.map(load => 
            load.id === loadId 
              ? { 
                  ...load, 
                  status: 'ASSIGNED', 
                  rateConSigned: true,
                  rateConSignedDate: new Date().toISOString().split('T')[0],
                  dispatchSignedAt: workflow.dispatchSignedAt,
                  driverAcceptanceDeadline: workflow.driverAcceptanceDeadline,
                  driverAccepted: false,
                  bids: load.bids?.map(bid => bid.id === bidId ? { ...bid, status: 'ACCEPTED' as const } : { ...bid, status: 'REJECTED' as const })
                }
              : load
          )
        )
        setShowBidsModal(false)
      } else {
        // Production API call
        await customerAPI.acceptBid(loadId, bidId)
        await loadMyLoads()
        setShowBidsModal(false)
      }
    } catch (error: any) {
      console.error('Error accepting bid:', error)
      alert(`❌ Error accepting bid: ${error.message}`)
    }
  }

  const handleRejectBid = async (loadId: string, bidId: string) => {
    try {
      const token = localStorage.getItem('token')
      const isDevMode = token?.startsWith('dev-')

      if (isDevMode) {
        console.log('🧪 Rejecting bid:', { loadId, bidId })
        alert('✅ Bid rejected.')
        
        // Update local state
        setLoads(prevLoads => 
          prevLoads.map(load => 
            load.id === loadId 
              ? { ...load, bids: load.bids?.map(bid => bid.id === bidId ? { ...bid, status: 'REJECTED' as const } : bid), bidCount: load.bidCount - 1 }
              : load
          )
        )
      } else {
        // Production API call
        await customerAPI.rejectBid(loadId, bidId)
        await loadMyLoads()
      }
    } catch (error: any) {
      console.error('Error rejecting bid:', error)
      alert(`❌ Error rejecting bid: ${error.message}`)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'POSTED': return theme.colors.info
      case 'ASSIGNED': return theme.colors.warning
      case 'ACCEPTED': return theme.colors.success
      case 'IN_TRANSIT': return theme.colors.primary
      case 'DELIVERED': return theme.colors.success
      case 'COMPLETED': return theme.colors.success
      case 'CANCELLED': return theme.colors.error
      default: return theme.colors.textSecondary
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
      pickupDate: load.pickupDate || '',
      pickupETA: load.pickupETA || '',
      deliveryDate: load.deliveryDate || '',
      deliveryETA: load.deliveryETA || '',
      commodity: load.commodity || '',
      revenue: load.revenue || 0,
      ratePerMile: load.ratePerMile || 0,
      units: load.units || 0,
      pieceCount: load.pieceCount || 0
    })
    setShowEditLoadModal(true)
  }

  const handleCancelPosting = (loadId: string, commodity: string) => {
    if (!window.confirm(`Cancel load posting for ${commodity}?\n\nThis will remove the load from the Load Board.\n\nExisting bids will be notified of cancellation.`)) {
      return
    }

    // Update load status to cancelled
    setLoads(prevLoads =>
      prevLoads.map(load =>
        load.id === loadId
          ? { ...load, status: 'CANCELLED' }
          : load
      )
    )

    // In production: API call to cancel load and notify bidders
    // await customerAPI.cancelLoad(loadId)

    alert(`✅ Load posting cancelled successfully!\n\nLoad removed from Load Board.`)
  }

  const handleSaveLoadEdit = () => {
    if (!editingLoad) return

    // Check if Rate Con is already signed
    if (editingLoad.rateConSigned) {
      if (!window.confirm('⚠️ RATE CONFIRMATION ALREADY SIGNED!\n\nAny changes require:\n1. Generating a new Rate Confirmation\n2. Re-signature by carrier dispatch/owner\n3. Re-signature by driver via SMS\n\nDriver has 30 MINUTES to accept after dispatch signs or load returns to Load Board.\n\nContinue with changes?')) {
        return
      }
      
      // Update the load and trigger new Rate Con workflow
      setLoads(prevLoads =>
        prevLoads.map(load =>
          load.id === editingLoad.id
            ? {
                ...load,
                pickupDate: editForm.pickupDate,
                pickupETA: editForm.pickupETA,
                deliveryDate: editForm.deliveryDate,
                deliveryETA: editForm.deliveryETA,
                commodity: editForm.commodity,
                revenue: editForm.revenue,
                ratePerMile: editForm.ratePerMile,
                units: editForm.units,
                pieceCount: editForm.pieceCount,
                rateConSigned: false, // Reset - requires new signature
                bolUploaded: false, // Reset documents
                podUploaded: false
              }
            : load
        )
      )
      
      alert('🔄 Changes saved!\n\n✅ New Rate Confirmation automatically generated & sent\n📧 Sent to carrier dispatch for signature\n⏱️ Driver has 30 MINUTES to accept via SMS after dispatch signs\n⚠️ If not accepted within 30 min, load automatically returns to Load Board')
    } else {
      // No Rate Con yet - safe to edit
      setLoads(prevLoads =>
        prevLoads.map(load =>
          load.id === editingLoad.id
            ? {
                ...load,
                pickupDate: editForm.pickupDate,
                pickupETA: editForm.pickupETA,
                deliveryDate: editForm.deliveryDate,
                deliveryETA: editForm.deliveryETA,
                commodity: editForm.commodity,
                revenue: editForm.revenue,
                ratePerMile: editForm.ratePerMile,
                units: editForm.units,
                pieceCount: editForm.pieceCount
              }
            : load
        )
      )
      
      alert('✅ Load updated successfully!')
    }

    setShowEditLoadModal(false)
    setEditingLoad(null)
  }

  const handleApproveDelivery = (loadId: string) => {
    if (!window.confirm('Confirm that freight was delivered in good condition? This will initiate payment processing.')) {
      return
    }

    setLoads(prevLoads =>
      prevLoads.map(load =>
        load.id === loadId
          ? { ...load, customerPaid: true }
          : load
      )
    )

    alert('✅ Delivery approved! Payment processing initiated via ACH.')
  }

  const filteredLoads = loads.filter(load => {
    // Exclude cancelled loads from all views
    if (load.status === 'CANCELLED') return false
    
    // View mode filter
    const matchesViewMode = viewMode === 'posted' 
      ? load.status === 'POSTED' 
      : load.status !== 'POSTED' // Active loads (assigned, in_transit, delivered, etc.)
    
    const matchesStatus = filterStatus === 'all' || load.status === filterStatus.toUpperCase()
    const matchesSearch = searchTerm === '' ||
      load.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      load.commodity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      load.carrier?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      load.origin?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      load.destination?.city?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesEquipment = filterEquipment === 'all' || load.equipmentType === filterEquipment
    
    return matchesViewMode && matchesStatus && matchesSearch && matchesEquipment
  })

  if (loading) {
    return (
      <PageContainer title="My Loads" subtitle="Loading your loads..." icon={Package}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px', flexDirection: 'column', gap: '16px' }}>
          <Loader size={48} style={{ animation: 'spin 1s linear infinite', color: theme.colors.primary }} />
          <p style={{ fontSize: '16px', color: theme.colors.textSecondary, fontWeight: '500' }}>Loading your loads...</p>
        </div>
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer title="My Loads" subtitle="Error loading data" icon={Package}>
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
    posted: loads.filter(l => l.status === 'POSTED').length,
    active: loads.filter(l => ['ASSIGNED', 'IN_TRANSIT'].includes(l.status)).length,
    completed: loads.filter(l => l.status === 'COMPLETED').length,
    pendingBids: loads.filter(l => l.status === 'POSTED').reduce((sum, l) => sum + l.bidCount, 0)
  }

  return (
    <PageContainer
      title="My Loads"
      subtitle="Manage your shipments and review bids"
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
          <Plus size={20} /> Post New Load
        </button>
      }
    >
      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {[
          { label: 'Total Loads', value: stats.total, icon: Package, color: theme.colors.primary },
          { label: 'Posted', value: stats.posted, icon: Clock, color: theme.colors.info },
          { label: 'Active', value: stats.active, icon: Truck, color: theme.colors.warning },
          { label: 'Completed', value: stats.completed, icon: CheckCircle, color: theme.colors.success },
          { label: 'Pending Bids', value: stats.pendingBids, icon: MessageSquare, color: theme.colors.info }
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

      {/* View Mode Toggle - Exact Match to Zone Management */}
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
          onClick={() => setViewMode('posted')}
          style={{
            padding: '12px 24px',
            background: viewMode === 'posted' ? theme.colors.backgroundPrimary : 'transparent',
            color: viewMode === 'posted' ? theme.colors.primary : theme.colors.textSecondary,
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
          <Clock size={16} />
          Posted Loads ({stats.posted})
          {stats.pendingBids > 0 && viewMode === 'posted' && (
            <span style={{
              padding: '3px 8px',
              background: theme.colors.info,
              color: 'white',
              borderRadius: '10px',
              fontSize: '11px',
              fontWeight: 'bold',
              marginLeft: '4px'
            }}>
              {stats.pendingBids}
            </span>
          )}
        </button>
        <button
          onClick={() => setViewMode('active')}
          style={{
            padding: '12px 24px',
            background: viewMode === 'active' ? theme.colors.backgroundPrimary : 'transparent',
            color: viewMode === 'active' ? theme.colors.primary : theme.colors.textSecondary,
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
          Active Loads ({stats.active + stats.completed})
        </button>
      </div>

      {/* Search and Filters - Gold Standard */}
      <Card padding="24px" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Search Bar */}
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
                placeholder="Search loads, carriers, locations..."
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

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              padding: '12px 16px',
              background: theme.colors.background,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: '12px',
              color: theme.colors.textPrimary,
              fontSize: '14px',
              outline: 'none',
              cursor: 'pointer',
              minWidth: '140px'
            }}
          >
            <option value="all" style={{ background: '#1a1a1a', color: '#FFFFFF' }}>All Status</option>
            <option value="posted" style={{ background: '#1a1a1a', color: '#FFFFFF' }}>Posted</option>
            <option value="assigned" style={{ background: '#1a1a1a', color: '#FFFFFF' }}>Assigned</option>
            <option value="in_transit" style={{ background: '#1a1a1a', color: '#FFFFFF' }}>In Transit</option>
            <option value="completed" style={{ background: '#1a1a1a', color: '#FFFFFF' }}>Completed</option>
          </select>

          {/* Equipment Filter */}
          <select
            value={filterEquipment}
            onChange={(e) => setFilterEquipment(e.target.value)}
            style={{
              padding: '12px 16px',
              background: theme.colors.background,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: '12px',
              color: theme.colors.textPrimary,
              fontSize: '14px',
              outline: 'none',
              cursor: 'pointer',
              minWidth: '140px'
            }}
          >
            <option value="all" style={{ background: '#1a1a1a', color: '#FFFFFF' }}>All Equipment</option>
            <option value="End Dump" style={{ background: '#1a1a1a', color: '#FFFFFF' }}>End Dump</option>
            <option value="Mixer" style={{ background: '#1a1a1a', color: '#FFFFFF' }}>Mixer</option>
            <option value="Flatbed" style={{ background: '#1a1a1a', color: '#FFFFFF' }}>Flatbed</option>
            <option value="Step Deck" style={{ background: '#1a1a1a', color: '#FFFFFF' }}>Step Deck</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: '12px 16px',
              background: theme.colors.background,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: '12px',
              color: theme.colors.textPrimary,
              fontSize: '14px',
              outline: 'none',
              cursor: 'pointer',
              minWidth: '140px'
            }}
          >
            <option value="date" style={{ background: '#1a1a1a', color: '#FFFFFF' }}>Sort by Date</option>
            <option value="status" style={{ background: '#1a1a1a', color: '#FFFFFF' }}>Sort by Status</option>
            <option value="carrier" style={{ background: '#1a1a1a', color: '#FFFFFF' }}>Sort by Carrier</option>
            <option value="revenue" style={{ background: '#1a1a1a', color: '#FFFFFF' }}>Sort by Revenue</option>
          </select>
        </div>
      </Card>

      {/* Loads List */}
      <Card title="Your Loads" subtitle={`${filteredLoads.length} load${filteredLoads.length !== 1 ? 's' : ''}`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredLoads.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', background: theme.colors.background, borderRadius: '12px', border: `1px dashed ${theme.colors.border}` }}>
              <Package size={48} style={{ color: theme.colors.textTertiary, marginBottom: '16px' }} />
              <h3 style={{ color: theme.colors.textSecondary, marginBottom: '8px' }}>No loads found</h3>
              <p style={{ color: theme.colors.textTertiary, marginBottom: '24px' }}>Post your first load to get started</p>
              <button onClick={() => navigate('/customer/post-load')} style={{ padding: '12px 24px', background: theme.colors.primary, color: 'white', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                <Plus size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                Post Load
              </button>
            </div>
          ) : (
            filteredLoads.map((load) => {
              const origin = typeof load.origin === 'string' ? JSON.parse(load.origin) : load.origin
              const destination = typeof load.destination === 'string' ? JSON.parse(load.destination) : load.destination
              const statusColor = getStatusColor(load.status)
              const isExpanded = expandedLoads.has(load.id)
              const hasCarrier = load.status !== 'POSTED'

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
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
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
                        {load.status === 'POSTED' && (
                          <span style={{
                            padding: '6px 12px',
                            background: `${theme.colors.warning}15`,
                            color: theme.colors.textSecondary,
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}>
                            <Clock size={13} />
                            Posted {Math.floor((Date.now() - new Date(load.pickupDate || Date.now()).getTime()) / (1000 * 60 * 60))}h ago
                          </span>
                        )}
                        {load.bidCount > 0 && load.status === 'POSTED' && (
                          <button
                            onClick={() => {
                              setSelectedLoad(load)
                              setShowBidsModal(true)
                            }}
                            style={{
                              padding: '6px 12px',
                              background: `${theme.colors.info}30`,
                              color: theme.colors.info,
                              borderRadius: '8px',
                              fontSize: '13px',
                              fontWeight: '600',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = `${theme.colors.info}50`}
                            onMouseLeave={(e) => e.currentTarget.style.background = `${theme.colors.info}30`}
                          >
                            <MessageSquare size={14} />
                            Review {load.bidCount} {load.bidCount === 1 ? 'Bid' : 'Bids'}
                          </button>
                        )}
                        {load.bidCount === 0 && load.status === 'POSTED' && (
                          <span style={{
                            padding: '6px 12px',
                            background: `${theme.colors.error}15`,
                            color: theme.colors.error,
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}>
                            <AlertCircle size={13} />
                            No Bids Yet
                          </span>
                        )}
                        {load.status === 'RELEASE_REQUESTED' && (
                          <button
                            onClick={() => {
                              setReleaseLoad(load)
                              setShowReleaseModal(true)
                            }}
                            style={{
                              padding: '8px 16px',
                              background: '#f97316',
                              color: 'white',
                              borderRadius: '8px',
                              fontSize: '14px',
                              fontWeight: '700',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              transition: 'all 0.2s ease',
                              boxShadow: '0 2px 8px rgba(249, 115, 22, 0.3)',
                              animation: 'pulse 2s infinite'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#ea580c'
                              e.currentTarget.style.transform = 'scale(1.05)'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#f97316'
                              e.currentTarget.style.transform = 'scale(1)'
                            }}
                          >
                            <Bell size={16} />
                            Issue Release
                          </button>
                        )}
                      </div>
                      <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: '0 0 4px 0' }}>
                        Load #{load.id?.substring(0, 8)} • {load.units} {load.rateMode?.replace('PER_', '')?.toLowerCase()} • {load.miles} miles
                      </p>
                      <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Truck size={14} />
                        {load.carrier?.name || 'No Carrier Assigned'}
                        {load.carrier?.phone && (
                          <span style={{ marginLeft: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Phone size={14} />
                            {load.carrier.phone}
                          </span>
                        )}
                      </p>
                    </div>
                    {load.revenue && (
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '32px', fontWeight: 'bold', color: theme.colors.success, margin: 0, lineHeight: 1 }}>
                          ${formatNumber(load.revenue)}
                        </p>
                        <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: '4px 0 0 0' }}>
                          {formatCurrency(load?.ratePerMile)}/mi
                        </p>
                  </div>
                    )}
                  </div>

                  {/* Route Section */}
                  {hasCarrier && (
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
                            {load.pickupDate ? new Date(load.pickupDate).toLocaleDateString() : 'TBD'} @ {load.pickupETA || 'TBD'}
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
                            {load.deliveryDate ? new Date(load.deliveryDate).toLocaleDateString() : 'TBD'} @ {load.deliveryETA || load.eta || 'TBD'}
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
                  )}

                  {/* Driver & Equipment Info - Only for assigned loads */}
                  {hasCarrier && load.driver && (
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

                  {/* Document Status - Only for assigned/in-transit/completed loads */}
                  {hasCarrier && (
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
                          <CheckCircle size={16} color={load.podUploaded ? theme.colors.success : theme.colors.warning} />
                          <span style={{ fontSize: '13px', fontWeight: '600', color: theme.colors.textPrimary }}>
                            POD
                          </span>
                        </div>
                        <span style={{ fontSize: '11px', color: theme.colors.textSecondary, fontWeight: '600' }}>
                          {load.podUploaded ? '✓ Received' : 'Pending'}
                        </span>
                      </button>
                    </div>
                  )}

                  {/* Track Load Button - Only show if driver has accepted/signed Rate Con */}
                  {console.log(`🔍 Customer Load ${load.id}: hasCarrier=${hasCarrier}, rateConSigned=${load.rateConSigned}, driverAccepted=${load.driverAccepted}`)}
                  {hasCarrier && load.rateConSigned && load.driverAccepted && (
                    <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center' }}>
                      <button
                        onClick={() => navigate(`/loads/${load.id}/tracking`)}
                        style={{
                          padding: '12px 28px',
                          background: 'transparent',
                          color: theme.colors.primary,
                          border: `2px solid ${theme.colors.primary}`,
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
                          e.currentTarget.style.background = theme.colors.primary
                          e.currentTarget.style.color = 'white'
                          e.currentTarget.style.transform = 'translateY(-1px)'
                          e.currentTarget.style.boxShadow = `0 4px 12px ${theme.colors.primary}30`
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent'
                          e.currentTarget.style.color = theme.colors.primary
                          e.currentTarget.style.transform = 'translateY(0)'
                          e.currentTarget.style.boxShadow = 'none'
                        }}
                      >
                        <Navigation size={16} />
                        Track Load
                      </button>
                    </div>
                  )}

                  {/* Expanded Details */}
                  {isExpanded && hasCarrier && (
                    <div style={{
                      padding: '16px',
                      background: theme.colors.background,
                      borderRadius: '8px',
                      marginBottom: '16px',
                      border: `1px solid ${theme.colors.border}`
                    }}>
                      {load.notes && (
                        <div style={{
                          padding: '12px',
                          background: theme.colors.backgroundCard,
                          borderRadius: '6px',
                          borderLeft: `3px solid ${theme.colors.primary}`,
                          marginBottom: '12px'
                        }}>
                          <div style={{ fontSize: '11px', fontWeight: '600', color: theme.colors.textSecondary, marginBottom: '6px' }}>
                            Load Notes
                          </div>
                          <div style={{ fontSize: '13px', color: theme.colors.textPrimary, lineHeight: 1.5 }}>
                            {load.notes}
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
                            Carrier Updates
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
                      {hasCarrier && (
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
                            e.currentTarget.style.borderColor = theme.colors.primary
                            e.currentTarget.style.color = theme.colors.textPrimary
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent'
                            e.currentTarget.style.borderColor = theme.colors.border
                            e.currentTarget.style.color = theme.colors.textSecondary
                          }}
                        >
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          {isExpanded ? 'Less Details' : 'More Details'}
                        </button>
                      )}

                      {/* Edit Load Button - Only for ACTIVE loads (not posted) */}
                      {load.status !== 'POSTED' && (
                        <button
                          onClick={() => handleEditLoad(load)}
                          style={{
                            padding: '10px 16px',
                            backgroundColor: 'transparent',
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
                          Edit Load
                        </button>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      {/* POSTED LOADS: Special Actions for Rate Adjustment */}
                      {load.status === 'POSTED' && (
                        <>
                          <button
                            onClick={() => handleEditLoad(load)}
                            style={{
                              padding: '10px 20px',
                              background: `linear-gradient(135deg, ${theme.colors.warning} 0%, #f59e0b 100%)`,
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              fontSize: '14px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              boxShadow: `0 4px 12px ${theme.colors.warning}40`,
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                          >
                            <Edit size={16} />
                            Adjust Rate & Details
                          </button>

                          <button
                            onClick={() => handleCancelPosting(load.id, load.commodity)}
                            style={{
                              padding: '10px 20px',
                              background: theme.colors.backgroundCard,
                              color: theme.colors.error,
                              border: `2px solid ${theme.colors.error}`,
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
                              e.currentTarget.style.background = `${theme.colors.error}20`
                              e.currentTarget.style.transform = 'translateY(-2px)'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = theme.colors.backgroundCard
                              e.currentTarget.style.transform = 'translateY(0)'
                            }}
                          >
                            <XCircle size={16} />
                            Cancel Posting
                          </button>
                        </>
                      )}

                      {/* Approve Delivery Button - Only for POD received loads */}
                      {load.podUploaded && !load.customerPaid && (
                        <button
                          onClick={() => handleApproveDelivery(load.id)}
                          style={{
                            padding: '10px 20px',
                            background: `linear-gradient(135deg, ${theme.colors.success} 0%, #059669 100%)`,
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: `0 4px 12px ${theme.colors.success}40`,
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                          <CheckCircle size={16} />
                          Approve Delivery & Pay
                        </button>
                      )}

                      {/* Payment Processed Badge */}
                      {load.customerPaid && (
                        <div style={{
                          padding: '10px 20px',
                          background: `${theme.colors.success}20`,
                          color: theme.colors.success,
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          border: `1px solid ${theme.colors.success}`
                        }}>
                          <CheckCircle size={16} />
                          ✓ Payment Processed
                        </div>
                      )}

                      {!hasCarrier && (
                        <div style={{ fontSize: '14px', color: theme.colors.textTertiary, fontStyle: 'italic' }}>
                          Awaiting carrier bids
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </Card>

      {/* Bids Modal */}
      {showBidsModal && selectedLoad && (
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
          onClick={() => setShowBidsModal(false)}
        >
          <div
            style={{
              background: theme.colors.backgroundCard,
              borderRadius: '20px',
              padding: '36px',
              maxWidth: '900px',
              width: '100%',
              border: `1px solid ${theme.colors.border}`,
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
              maxHeight: '90vh',
              overflow: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ marginBottom: '28px' }}>
              <h2 style={{ color: theme.colors.textPrimary, fontSize: '26px', fontWeight: 'bold', margin: '0 0 8px 0' }}>
                Review Bids - Load #{selectedLoad.id?.substring(0, 8)}
              </h2>
              <p style={{ color: theme.colors.textSecondary, margin: 0 }}>
                {selectedLoad.commodity} • {selectedLoad.bidCount} {selectedLoad.bidCount === 1 ? 'bid' : 'bids'} received
              </p>
            </div>

            {selectedLoad.bids && selectedLoad.bids.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {selectedLoad.bids.map((bid) => (
                  <div
                    key={bid.id}
                    style={{
                      background: theme.colors.background,
                      borderRadius: '12px',
                      padding: '24px',
                      border: bid.status === 'ACCEPTED' ? `2px solid ${theme.colors.success}` : bid.status === 'REJECTED' ? `1px solid ${theme.colors.error}40` : `1px solid ${theme.colors.border}`
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                          <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '10px',
                            background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primary} 100%)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: '700',
                            fontSize: '18px'
                          }}>
                            {bid.carrier.name.charAt(0)}
                          </div>
                          <div>
                            <h3 style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary, margin: '0 0 4px 0' }}>
                              {bid.carrier.name}
                            </h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: theme.colors.textSecondary }}>
                              {bid.carrier.rating && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <TrendingUp size={14} color={theme.colors.success} />
                                  {bid.carrier.rating} rating
                                </span>
                              )}
                              {bid.carrier.completedLoads && (
                                <span>{bid.carrier.completedLoads} completed loads</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        {bid.bidAmount ? (
                          <>
                            <p style={{ fontSize: '28px', fontWeight: 'bold', color: theme.colors.success, margin: 0, lineHeight: 1 }}>
                              ${formatNumber(bid.bidAmount)}
                            </p>
                            <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: '4px 0 0 0' }}>
                              Bid Amount
                            </p>
                          </>
                        ) : (
                          <p style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.info, margin: 0 }}>
                            Express Interest
                          </p>
                        )}
                      </div>
                    </div>

                    {bid.message && (
                      <div style={{
                        background: theme.colors.backgroundCardHover,
                        borderRadius: '10px',
                        padding: '16px',
                        marginBottom: '16px'
                      }}>
                        <p style={{ fontSize: '14px', color: theme.colors.textPrimary, margin: 0, lineHeight: 1.6 }}>
                          "{bid.message}"
                        </p>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p style={{ fontSize: '13px', color: theme.colors.textSecondary, margin: 0 }}>
                        Submitted {new Date(bid.createdAt).toLocaleDateString()}
                      </p>
                      
                      {bid.status === 'PENDING' ? (
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button
                            onClick={() => handleRejectBid(selectedLoad.id, bid.id)}
                            style={{
                              padding: '10px 20px',
                              backgroundColor: `${theme.colors.error}15`,
                              color: theme.colors.error,
                              border: `1px solid ${theme.colors.error}40`,
                              borderRadius: '8px',
                              fontSize: '14px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <ThumbsDown size={16} />
                            Reject
                          </button>
                          <button
                            onClick={() => handleAcceptBid(selectedLoad.id, bid.id)}
                            style={{
                              padding: '10px 20px',
                              background: `linear-gradient(135deg, ${theme.colors.success} 0%, #059669 100%)`,
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              fontSize: '14px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              boxShadow: `0 4px 12px ${theme.colors.success}40`,
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <ThumbsUp size={16} />
                            Accept Bid
                          </button>
                        </div>
                      ) : (
                        <span style={{
                          padding: '8px 16px',
                          background: bid.status === 'ACCEPTED' ? `${theme.colors.success}20` : `${theme.colors.error}15`,
                          color: bid.status === 'ACCEPTED' ? theme.colors.success : theme.colors.error,
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: '600',
                          textTransform: 'uppercase'
                        }}>
                          {bid.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                <MessageSquare size={48} style={{ color: theme.colors.textTertiary, marginBottom: '16px' }} />
                <h3 style={{ color: theme.colors.textSecondary, marginBottom: '8px' }}>No bids yet</h3>
                <p style={{ color: theme.colors.textTertiary }}>Carriers will submit bids soon</p>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px', paddingTop: '24px', borderTop: `1px solid ${theme.colors.border}` }}>
              <button
                onClick={() => setShowBidsModal(false)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: theme.colors.backgroundCardHover,
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
            </div>
          </div>
        </div>
      )}

      {/* Edit Load Modal - Customer can edit dates and commodity */}
      {showEditLoadModal && editingLoad && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)', padding: '20px' }} onClick={() => setShowEditLoadModal(false)}>
          <div style={{ background: theme.colors.backgroundCard, borderRadius: '20px', padding: '36px', maxWidth: '700px', width: '100%', border: `1px solid ${theme.colors.border}`, boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
              <h2 style={{ color: theme.colors.textPrimary, fontSize: '24px', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Edit size={24} color={theme.colors.primary} />
                Edit Load Details
              </h2>
              <button onClick={() => setShowEditLoadModal(false)} style={{ background: 'none', border: 'none', color: theme.colors.textSecondary, cursor: 'pointer', fontSize: '28px', padding: '0', lineHeight: 1 }}>×</button>
            </div>

            {/* Warning for Active Loads (Rate Con Signed) */}
            {editingLoad.status !== 'POSTED' && editingLoad.rateConSigned && (
              <div style={{ background: `${theme.colors.warning}10`, border: `1px solid ${theme.colors.warning}30`, borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <AlertCircle size={20} color={theme.colors.warning} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary }}>⚠️ Rate Confirmation Already Signed</p>
                    <p style={{ margin: 0, fontSize: '13px', color: theme.colors.textSecondary, lineHeight: 1.5 }}>
                      Any changes will require automatically generating a new Rate Confirmation that must be re-signed by both the carrier's dispatch/owner AND driver. <strong style={{ color: theme.colors.warning }}>Driver has only 30 MINUTES after dispatch signs to accept via SMS, or the load automatically returns to the Load Board.</strong>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Info for Posted Loads (Not Yet Accepted) */}
            {editingLoad.status === 'POSTED' && (
              <div style={{ background: `${theme.colors.info}10`, border: `1px solid ${theme.colors.info}30`, borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <Bell size={20} color={theme.colors.info} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary }}>✓ Posted Load - Free to Adjust</p>
                    <p style={{ margin: 0, fontSize: '13px', color: theme.colors.textSecondary, lineHeight: 1.5 }}>
                      This load is still on the Load Board. You can adjust rates and details freely to attract more bids. Changes take effect immediately. {editingLoad.bidCount > 0 && <strong style={{ color: theme.colors.info }}>Current bids ({editingLoad.bidCount}) will remain valid.</strong>}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gap: '20px', marginBottom: '24px' }}>
              {/* Commodity */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                  Commodity <span style={{ color: theme.colors.textTertiary }}>(Material type)</span>
                </label>
                <input 
                  type="text" 
                  value={editForm.commodity} 
                  onChange={(e) => setEditForm({ ...editForm, commodity: e.target.value })} 
                  style={{ width: '100%', padding: '12px', background: theme.colors.background, border: `1px solid ${theme.colors.border}`, borderRadius: '8px', color: theme.colors.textPrimary, fontSize: '14px', outline: 'none', transition: 'all 0.2s ease' }}
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

              {/* Quantity & Piece Count */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                    Units <span style={{ color: theme.colors.textTertiary }}>(Tons/Loads/etc)</span>
                  </label>
                  <input 
                    type="number" 
                    value={editForm.units} 
                    onChange={(e) => setEditForm({ ...editForm, units: parseFloat(e.target.value) || 0 })} 
                    min="0"
                    step="0.1"
                    style={{ width: '100%', padding: '12px', background: theme.colors.background, border: `1px solid ${theme.colors.border}`, borderRadius: '8px', color: theme.colors.textPrimary, fontSize: '14px', outline: 'none', transition: 'all 0.2s ease' }}
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
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                    Piece Count <span style={{ color: theme.colors.textTertiary }}>(# of pieces)</span>
                  </label>
                  <input 
                    type="number" 
                    value={editForm.pieceCount} 
                    onChange={(e) => setEditForm({ ...editForm, pieceCount: parseInt(e.target.value) || 0 })} 
                    min="0"
                    step="1"
                    style={{ width: '100%', padding: '12px', background: theme.colors.background, border: `1px solid ${theme.colors.border}`, borderRadius: '8px', color: theme.colors.textPrimary, fontSize: '14px', outline: 'none', transition: 'all 0.2s ease' }}
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
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                    Rate Mode
                  </label>
                  <div style={{ padding: '12px', background: theme.colors.backgroundTertiary, border: `1px solid ${theme.colors.border}`, borderRadius: '8px', color: theme.colors.textSecondary, fontSize: '14px', fontWeight: '500' }}>
                    {editingLoad.rateMode?.replace('_', ' ')}
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                    Total Revenue <span style={{ color: theme.colors.textTertiary }}>(Carrier payment)</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: theme.colors.textSecondary, fontSize: '14px', fontWeight: '600' }}>$</span>
                    <input 
                      type="number" 
                      value={editForm.revenue} 
                      onChange={(e) => setEditForm({ ...editForm, revenue: parseFloat(e.target.value) || 0 })} 
                      min="0"
                      step="0.01"
                      style={{ width: '100%', padding: '12px 12px 12px 24px', background: theme.colors.background, border: `1px solid ${theme.colors.border}`, borderRadius: '8px', color: theme.colors.textPrimary, fontSize: '14px', outline: 'none', transition: 'all 0.2s ease' }}
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
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                    Rate Per Mile <span style={{ color: theme.colors.textTertiary }}>($/mile)</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: theme.colors.textSecondary, fontSize: '14px', fontWeight: '600' }}>$</span>
                    <input 
                      type="number" 
                      value={editForm.ratePerMile} 
                      onChange={(e) => setEditForm({ ...editForm, ratePerMile: parseFloat(e.target.value) || 0 })} 
                      min="0"
                      step="0.01"
                      style={{ width: '100%', padding: '12px 12px 12px 24px', background: theme.colors.background, border: `1px solid ${theme.colors.border}`, borderRadius: '8px', color: theme.colors.textPrimary, fontSize: '14px', outline: 'none', transition: 'all 0.2s ease' }}
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

              {/* Pickup Date & Time */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>Pickup Date</label>
                  <input 
                    type="date" 
                    value={editForm.pickupDate} 
                    onChange={(e) => setEditForm({ ...editForm, pickupDate: e.target.value })} 
                    style={{ width: '100%', padding: '12px', background: theme.colors.background, border: `1px solid ${theme.colors.border}`, borderRadius: '8px', color: theme.colors.textPrimary, fontSize: '14px', outline: 'none', transition: 'all 0.2s ease' }}
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
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>Pickup Time</label>
                  <input 
                    type="time" 
                    value={editForm.pickupETA} 
                    onChange={(e) => setEditForm({ ...editForm, pickupETA: e.target.value })} 
                    style={{ width: '100%', padding: '12px', background: theme.colors.background, border: `1px solid ${theme.colors.border}`, borderRadius: '8px', color: theme.colors.textPrimary, fontSize: '14px', outline: 'none', transition: 'all 0.2s ease' }}
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

              {/* Delivery Date & Time */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>Delivery Date</label>
                  <input 
                    type="date" 
                    value={editForm.deliveryDate} 
                    onChange={(e) => setEditForm({ ...editForm, deliveryDate: e.target.value })} 
                    style={{ width: '100%', padding: '12px', background: theme.colors.background, border: `1px solid ${theme.colors.border}`, borderRadius: '8px', color: theme.colors.textPrimary, fontSize: '14px', outline: 'none', transition: 'all 0.2s ease' }}
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
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>Delivery Time</label>
                  <input 
                    type="time" 
                    value={editForm.deliveryETA} 
                    onChange={(e) => setEditForm({ ...editForm, deliveryETA: e.target.value })} 
                    style={{ width: '100%', padding: '12px', background: theme.colors.background, border: `1px solid ${theme.colors.border}`, borderRadius: '8px', color: theme.colors.textPrimary, fontSize: '14px', outline: 'none', transition: 'all 0.2s ease' }}
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

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowEditLoadModal(false)} style={{ padding: '12px 24px', background: 'transparent', border: `1px solid ${theme.colors.border}`, borderRadius: '8px', color: theme.colors.textSecondary, fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSaveLoadEdit} style={{ padding: '12px 24px', background: `linear-gradient(135deg, ${theme.colors.success} 0%, #059669 100%)`, color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: `0 4px 12px ${theme.colors.success}40` }}>
                <CheckCircle size={16} />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Modals - Same legal documents as carrier side */}
      {showRateConModal && selectedDocumentLoad && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.90)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001, backdropFilter: 'blur(6px)', padding: '20px' }} onClick={() => setShowRateConModal(false)}>
          <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '40px', maxWidth: '900px', width: '100%', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 25px 80px rgba(0, 0, 0, 0.5)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <FileSignature size={64} color={theme.colors.success} style={{ marginBottom: '20px' }} />
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '12px', color: '#000' }}>Rate Confirmation</h2>
              <p style={{ fontSize: '16px', color: '#666', marginBottom: '8px' }}>Load #{selectedDocumentLoad.id.substring(0, 8)}</p>
              <p style={{ fontSize: '14px', color: '#666' }}>✓ Signed on {selectedDocumentLoad.rateConSignedDate}</p>
              <div style={{ marginTop: '30px', padding: '20px', background: '#f0fdf4', borderRadius: '8px', border: '2px solid #22c55e' }}>
                <p style={{ fontSize: '14px', color: '#15803d', margin: 0 }}>
                  <strong>Document Available:</strong> Full rate confirmation with all terms, compensation details, and signatures is accessible. This serves as your legal contract with the carrier.
                </p>
              </div>
              <button onClick={() => setShowRateConModal(false)} style={{ marginTop: '24px', padding: '12px 32px', background: '#6b7280', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {showBOLModal && selectedDocumentLoad && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.90)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001, backdropFilter: 'blur(6px)', padding: '20px' }} onClick={() => setShowBOLModal(false)}>
          <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '40px', maxWidth: '900px', width: '100%', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 25px 80px rgba(0, 0, 0, 0.5)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <FileText size={64} color={theme.colors.info} style={{ marginBottom: '20px' }} />
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '12px', color: '#000' }}>Bill of Lading</h2>
              <p style={{ fontSize: '16px', color: '#666', marginBottom: '8px' }}>BOL #{selectedDocumentLoad.bolNumber}</p>
              <p style={{ fontSize: '14px', color: '#666' }}>✓ Uploaded {selectedDocumentLoad.bolUploadDate}</p>
              <div style={{ marginTop: '30px', padding: '20px', background: '#eff6ff', borderRadius: '8px', border: '2px solid #3b82f6' }}>
                <p style={{ fontSize: '14px', color: '#1e40af', margin: 0 }}>
                  <strong>Pickup Confirmed:</strong> Bill of Lading serves as proof that your freight was loaded at the pickup location. This document was signed by the shipper and carrier.
                </p>
              </div>
              <button onClick={() => setShowBOLModal(false)} style={{ marginTop: '24px', padding: '12px 32px', background: '#6b7280', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {showPODModal && selectedDocumentLoad && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.90)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001, backdropFilter: 'blur(6px)', padding: '20px' }} onClick={() => setShowPODModal(false)}>
          <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '40px', maxWidth: '900px', width: '100%', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 25px 80px rgba(0, 0, 0, 0.5)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <CheckCircle size={64} color={theme.colors.success} style={{ marginBottom: '20px' }} />
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '12px', color: '#15803d' }}>Proof of Delivery</h2>
              <p style={{ fontSize: '16px', color: '#666', marginBottom: '8px' }}>Load #{selectedDocumentLoad.id.substring(0, 8)}</p>
              <p style={{ fontSize: '14px', color: '#666' }}>✓ Delivered {selectedDocumentLoad.podUploadDate}</p>
              <div style={{ marginTop: '30px', padding: '20px', background: '#f0fdf4', borderRadius: '8px', border: '2px solid #22c55e' }}>
                <p style={{ fontSize: '14px', color: '#15803d', margin: '0 0 12px 0' }}>
                  <strong>Delivery Confirmed:</strong> Freight was successfully delivered and received in good condition.
                </p>
                <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>
                  Consignee: {selectedDocumentLoad.deliveryContact?.name || 'Receiver'} • Status: Payment Processing
                </p>
              </div>
              <button onClick={() => setShowPODModal(false)} style={{ marginTop: '24px', padding: '12px 32px', background: '#6b7280', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>Close</button>
            </div>
          </div>
        </div>
      )}
      {/* Release Confirmation Modal */}
      {showReleaseModal && releaseLoad && (
        <ReleaseConfirmationModal
          load={releaseLoad}
          onClose={() => {
            setShowReleaseModal(false)
            setReleaseLoad(null)
          }}
          onSuccess={() => {
            loadMyLoads() // Refresh load list
          }}
        />
      )}
    </PageContainer>
  )
}

export default MyLoadsPage

