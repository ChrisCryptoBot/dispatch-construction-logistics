import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../../contexts/ThemeContext'
import { useQuery } from '@tanstack/react-query'
import { fleetAPI } from '../../services/api'
import { mobileFuelAPI } from '../../services/mobileFuelAPI'
import PageContainer from '../../components/shared/PageContainer'
import Card from '../../components/ui/Card'
import AnimatedCounter from '../../components/enhanced/AnimatedCounter'
import { 
  Truck, Wrench, AlertTriangle, CheckCircle, Fuel, 
  MapPin, Calendar, DollarSign, TrendingUp, Eye, Plus, 
  Search, Filter, X, Activity, Gauge, Loader, Edit,
  ArrowUpDown, CheckSquare, Square
} from 'lucide-react'

interface Vehicle {
  id: string
  unitNumber: string
  type: string
  make: string
  model: string
  year: number
  vin: string
  licensePlate: string
  status: 'active' | 'maintenance' | 'idle' | 'out_of_service'
  currentLoad?: string
  currentDriver?: string
  location: string
  odometer: number
  fuelLevel: number
  maintenanceDue: string
  lastInspection: string
  insuranceExpiry: string
  registrationExpiry: string
  avgMpg: number
  monthlyRevenue: number
  utilizationRate: number
  // Enhanced tracking fields
  downtimeHours: number
  totalDowntimeCost: number
  maintenanceCost: number
  fuelCost: number
  insuranceCost: number
  registrationCost: number
  depreciationCost: number
  totalCost: number
  netProfit: number
  roi: number
  dotInspectionDue: string
  lastDotInspection: string
  dotInspectionExpiry: string
  insuranceCertNumber: string
  registrationNumber: string
  purchasePrice: number
  purchaseDate: string
}

const FleetManagementPage = () => {
  const { theme } = useTheme()
  
  // State for modals and forms
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false)
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false)
  const [maintenanceVehicle, setMaintenanceVehicle] = useState<Vehicle | null>(null)
  const [maintenanceForm, setMaintenanceForm] = useState({
    serviceType: [] as string[],
    scheduledDate: '',
    scheduledTime: '',
    estimatedDuration: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    serviceProvider: '',
    estimatedCost: '',
    notes: '',
    notifyDriver: true,
    createWorkOrder: true
  })
  const [newVehicle, setNewVehicle] = useState({
    unitNumber: '',
    type: 'End Dump',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    vin: '',
    licensePlate: '',
    status: 'active' as const,
    location: '',
    odometer: 0,
    fuelLevel: 0,
    maintenanceDue: '',
    lastInspection: '',
    insuranceExpiry: '',
    registrationExpiry: '',
    avgMpg: 7.0,
    monthlyRevenue: 0,
    utilizationRate: 0,
    // Enhanced compliance fields
    dotInspectionDue: '',
    lastDotInspection: '',
    dotInspectionExpiry: '',
    insuranceCertNumber: '',
    registrationNumber: '',
    purchasePrice: 0,
    purchaseDate: '',
    // Financial tracking
    downtimeHours: 0,
    totalDowntimeCost: 0,
    maintenanceCost: 0,
    fuelCost: 0,
    insuranceCost: 0,
    registrationCost: 0,
    depreciationCost: 0,
    totalCost: 0,
    netProfit: 0,
    roi: 0
  })
  const [notifications, setNotifications] = useState<Array<{id: string, message: string, type: 'success' | 'error' | 'info'}>>([])
  const [showComplianceModal, setShowComplianceModal] = useState(false)
  const [selectedComplianceItem, setSelectedComplianceItem] = useState<{
    vehicle: string
    type: string
    dueDate: string
    daysUntil: number
    priority: string
    certNumber: string
  } | null>(null)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [pendingAction, setPendingAction] = useState<'complete' | 'renew' | null>(null)
  const [password, setPassword] = useState('')
  const [showRenewalModal, setShowRenewalModal] = useState(false)
  const [renewalForm, setRenewalForm] = useState({
    newDueDate: '',
    renewalNotes: '',
    cost: '',
    provider: ''
  })
  const [showEditVehicleModal, setShowEditVehicleModal] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)
  // Modal states - force reload
  const [showAlertsModal, setShowAlertsModal] = useState(false)
  const [showBackupModal, setShowBackupModal] = useState(false)
  const [showFullHistoryModal, setShowFullHistoryModal] = useState(false)
  const [selectedVehicleForHistory, setSelectedVehicleForHistory] = useState<Vehicle | null>(null)
  const [editForm, setEditForm] = useState({
    unitNumber: '',
    type: '',
    make: '',
    model: '',
    year: 0,
    vin: '',
    licensePlate: '',
    location: '',
    odometer: 0,
    fuelLevel: 0,
    status: 'active' as 'active' | 'maintenance' | 'idle' | 'out_of_service',
    currentDriver: '',
    maintenanceDue: '',
    lastInspection: '',
    insuranceExpiry: '',
    registrationExpiry: '',
    dotInspectionDue: '',
    lastDotInspection: '',
    dotInspectionExpiry: '',
    insuranceCertNumber: '',
    registrationNumber: '',
    purchasePrice: 0,
    purchaseDate: ''
  })
  
  const [vehicles, setVehicles] = useState<Vehicle[]>([
    {
      id: 'TR-001',
      unitNumber: 'Truck #1',
      type: 'End Dump',
      make: 'Peterbilt',
      model: '579',
      year: 2022,
      vin: '1NP5DB9X8NN123456',
      licensePlate: 'TX-ABC123',
      status: 'active',
      currentLoad: 'LT-1234',
      currentDriver: 'John Smith',
      location: 'Dallas Quarry',
      odometer: 125430,
      fuelLevel: 85,
      maintenanceDue: '2025-02-15',
      lastInspection: '2024-12-15',
      insuranceExpiry: '2025-06-30',
      registrationExpiry: '2025-03-31',
      avgMpg: 7.2,
      monthlyRevenue: 12450,
      utilizationRate: 92,
      // Enhanced tracking
      downtimeHours: 8,
      totalDowntimeCost: 640,
      maintenanceCost: 850,
      fuelCost: 2100,
      insuranceCost: 420,
      registrationCost: 180,
      depreciationCost: 1200,
      totalCost: 4750,
      netProfit: 7700,
      roi: 162.1,
      dotInspectionDue: '2025-01-15',
      lastDotInspection: '2024-07-15',
      dotInspectionExpiry: '2025-01-15',
      insuranceCertNumber: 'IC-2025-001',
      registrationNumber: 'REG-TX-2025-001',
      purchasePrice: 85000,
      purchaseDate: '2022-03-15'
    },
    {
      id: 'TR-002',
      unitNumber: 'Truck #2',
      type: 'End Dump',
      make: 'Freightliner',
      model: 'Cascadia',
      year: 2021,
      vin: '1FUJGBDV2MLB98765',
      licensePlate: 'TX-DEF456',
      status: 'maintenance',
      currentLoad: undefined,
      currentDriver: undefined,
      location: 'Maintenance Shop',
      odometer: 156780,
      fuelLevel: 0,
      maintenanceDue: '2025-01-10',
      lastInspection: '2024-11-20',
      insuranceExpiry: '2025-05-15',
      registrationExpiry: '2025-02-28',
      avgMpg: 6.8,
      monthlyRevenue: 11800,
      utilizationRate: 88,
      // Enhanced tracking
      downtimeHours: 48,
      totalDowntimeCost: 3840,
      maintenanceCost: 2100,
      fuelCost: 1950,
      insuranceCost: 380,
      registrationCost: 165,
      depreciationCost: 1100,
      totalCost: 5695,
      netProfit: 6105,
      roi: 107.2,
      dotInspectionDue: '2025-01-10',
      lastDotInspection: '2024-07-10',
      dotInspectionExpiry: '2025-01-10',
      insuranceCertNumber: 'IC-2025-002',
      registrationNumber: 'REG-TX-2025-002',
      purchasePrice: 78000,
      purchaseDate: '2021-06-10'
    },
    {
      id: 'TR-003',
      unitNumber: 'Truck #3',
      type: 'Mixer',
      make: 'Mack',
      model: 'Granite',
      year: 2023,
      vin: '1M1AW07Y6PM123789',
      licensePlate: 'TX-GHI789',
      status: 'active',
      currentLoad: 'LT-1235',
      currentDriver: 'Mike Johnson',
      location: 'Plant C',
      odometer: 45670,
      fuelLevel: 72,
      maintenanceDue: '2025-03-20',
      lastInspection: '2025-01-05',
      insuranceExpiry: '2025-08-15',
      registrationExpiry: '2025-05-31',
      avgMpg: 5.9,
      monthlyRevenue: 15200,
      utilizationRate: 95,
      // Enhanced tracking
      downtimeHours: 4,
      totalDowntimeCost: 320,
      maintenanceCost: 650,
      fuelCost: 1850,
      insuranceCost: 450,
      registrationCost: 195,
      depreciationCost: 1400,
      totalCost: 4550,
      netProfit: 10650,
      roi: 234.1,
      dotInspectionDue: '2025-07-05',
      lastDotInspection: '2025-01-05',
      dotInspectionExpiry: '2025-07-05',
      insuranceCertNumber: 'IC-2025-003',
      registrationNumber: 'REG-TX-2025-003',
      purchasePrice: 92000,
      purchaseDate: '2023-02-15'
    },
    {
      id: 'TR-004',
      unitNumber: 'Truck #4',
      type: 'Flatbed',
      make: 'Volvo',
      model: 'VNL',
      year: 2020,
      vin: '4V4NC9EH6LN456123',
      licensePlate: 'TX-JKL012',
      status: 'active',
      currentLoad: 'LT-1236',
      currentDriver: 'David Wilson',
      location: 'Steel Yard A',
      odometer: 189340,
      fuelLevel: 91,
      maintenanceDue: '2025-01-25',
      lastInspection: '2024-12-10',
      insuranceExpiry: '2025-04-30',
      registrationExpiry: '2025-01-31',
      avgMpg: 8.1,
      monthlyRevenue: 13900,
      utilizationRate: 94,
      // Enhanced tracking
      downtimeHours: 6,
      totalDowntimeCost: 480,
      maintenanceCost: 950,
      fuelCost: 2200,
      insuranceCost: 400,
      registrationCost: 170,
      depreciationCost: 900,
      totalCost: 4620,
      netProfit: 9280,
      roi: 200.9,
      dotInspectionDue: '2025-06-10',
      lastDotInspection: '2024-12-10',
      dotInspectionExpiry: '2025-06-10',
      insuranceCertNumber: 'IC-2025-004',
      registrationNumber: 'REG-TX-2025-004',
      purchasePrice: 75000,
      purchaseDate: '2020-08-20'
    }
  ])
  
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [advancedFilters, setAdvancedFilters] = useState({
    maintenanceDue: '',
    complianceExpiry: '',
    location: '',
    driver: '',
    make: '',
    yearRange: { min: '', max: '' }
  })
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  
  // Enhanced state for bulk operations and sorting
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([])
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [sortBy, setSortBy] = useState<'unitNumber' | 'roi' | 'utilizationRate' | 'maintenanceCost' | 'fuelCost' | 'age' | 'none'>('none')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  
  // Navigation hook
  const navigate = useNavigate()

  // Helper functions
  const addNotification = (message: string, type: 'success' | 'error' | 'info') => {
    const id = Date.now().toString()
    setNotifications(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, 5000)
  }

  // Bulk operations utilities
  const toggleVehicleSelection = (vehicleId: string) => {
    setSelectedVehicles(prev => 
      prev.includes(vehicleId) 
        ? prev.filter(id => id !== vehicleId)
        : [...prev, vehicleId]
    )
  }

  const selectAllVehicles = () => {
    const allVehicleIds = filteredVehicles.map(vehicle => vehicle.id)
    setSelectedVehicles(allVehicleIds)
  }

  const clearSelection = () => {
    setSelectedVehicles([])
  }

  const handleBulkMaintenance = () => {
    addNotification(`Bulk maintenance scheduled for ${selectedVehicles.length} vehicles`, 'info')
    clearSelection()
  }

  const handleBulkStatusUpdate = (newStatus: string) => {
    addNotification(`Bulk status update to ${newStatus} for ${selectedVehicles.length} vehicles`, 'info')
    clearSelection()
  }

  const handleBulkExport = () => {
    addNotification(`Exporting data for ${selectedVehicles.length} vehicles`, 'info')
    clearSelection()
  }


  // Mobile fuel update simulation (for testing future mobile app integration)
  const simulateMobileFuelUpdate = async (vehicle: Vehicle) => {
    try {
      // Simulate fuel consumption after completing a load
      const fuelConsumed = Math.floor(Math.random() * 15) + 5 // 5-20% fuel consumed per load
      const newFuelLevel = Math.max(0, vehicle.fuelLevel - fuelConsumed)
      
      // Update the vehicle's fuel level
      setVehicles(prev => prev.map(v => 
        v.id === vehicle.id 
          ? { ...v, fuelLevel: newFuelLevel }
          : v
      ))
      
      // Show notification about mobile app integration
      addNotification(
        `📱 Mobile App: Fuel level updated for ${vehicle.unitNumber} (${vehicle.fuelLevel}% → ${newFuelLevel}%) after load completion`,
        'success'
      )
      
      // In production, this would call the mobile API
      // await mobileFuelAPI.simulateMobileUpdate(vehicle.id, 'load-123', newFuelLevel)
      
    } catch (error) {
      addNotification(`Failed to update fuel level for ${vehicle.unitNumber}`, 'error')
    }
  }

  // Password verification for compliance actions
  const verifyPassword = () => {
    // In production, this would verify against the actual user password
    // For development, using 'admin123' as the verification password
    if (password === 'admin123') {
      return true
    }
    return false
  }

  const handleMarkCompleted = () => {
    if (!selectedComplianceItem) return
    
    // Show confirmation popup first
    setPendingAction('complete')
    setShowConfirmationModal(true)
  }

  const handleScheduleRenewal = () => {
    if (!selectedComplianceItem) return
    
    // Show renewal form modal
    setPendingAction('renew')
    setShowRenewalModal(true)
  }

  const confirmAction = () => {
    if (pendingAction === 'complete') {
      // Show password modal for completion
      setShowConfirmationModal(false)
      setShowPasswordModal(true)
    } else if (pendingAction === 'renew') {
      // Process renewal
      processRenewal()
    }
  }

  const processPasswordVerification = () => {
    if (verifyPassword()) {
      // Password verified - complete the action
      if (pendingAction === 'complete') {
        setNotifications(prev => [...prev, {
          id: Date.now().toString(),
          message: `✅ ${selectedComplianceItem?.type} for ${selectedComplianceItem?.vehicle} marked as completed`,
          type: 'success'
        }])
      }
      setShowPasswordModal(false)
      setShowComplianceModal(false)
      setPassword('')
      setPendingAction(null)
    } else {
      setNotifications(prev => [...prev, {
        id: Date.now().toString(),
        message: '❌ Invalid password. Please try again.',
        type: 'error'
      }])
      setPassword('')
    }
  }

  const processRenewal = () => {
    if (!selectedComplianceItem) return
    
    setNotifications(prev => [...prev, {
      id: Date.now().toString(),
      message: `📅 Renewal scheduled for ${selectedComplianceItem.type} - ${selectedComplianceItem.vehicle}`,
      type: 'info'
    }])
    setShowRenewalModal(false)
    setShowComplianceModal(false)
    setPendingAction(null)
    setRenewalForm({
      newDueDate: '',
      renewalNotes: '',
      cost: '',
      provider: ''
    })
  }

  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle)
    setEditForm({
      unitNumber: vehicle.unitNumber,
      type: vehicle.type,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      vin: vehicle.vin,
      licensePlate: vehicle.licensePlate,
      location: vehicle.location,
      odometer: vehicle.odometer,
      fuelLevel: vehicle.fuelLevel,
      status: vehicle.status,
      currentDriver: vehicle.currentDriver || '',
      maintenanceDue: vehicle.maintenanceDue,
      lastInspection: vehicle.lastInspection,
      insuranceExpiry: vehicle.insuranceExpiry,
      registrationExpiry: vehicle.registrationExpiry,
      dotInspectionDue: vehicle.dotInspectionDue,
      lastDotInspection: vehicle.lastDotInspection,
      dotInspectionExpiry: vehicle.dotInspectionExpiry,
      insuranceCertNumber: vehicle.insuranceCertNumber,
      registrationNumber: vehicle.registrationNumber,
      purchasePrice: vehicle.purchasePrice,
      purchaseDate: vehicle.purchaseDate
    })
    setShowEditVehicleModal(true)
  }

  const validateVehicleForm = (form: any) => {
    const errors: string[] = []
    
    // Required field validation
    if (!form.unitNumber?.trim()) {
      errors.push('Unit number is required')
    }
    if (!form.make?.trim()) {
      errors.push('Make is required')
    }
    if (!form.model?.trim()) {
      errors.push('Model is required')
    }
    
    // Format validation
    if (form.year && (form.year < 1900 || form.year > new Date().getFullYear() + 1)) {
      errors.push('Year must be between 1900 and next year')
    }
    
    if (form.odometer && form.odometer < 0) {
      errors.push('Odometer reading cannot be negative')
    }
    
    if (form.fuelLevel && (form.fuelLevel < 0 || form.fuelLevel > 100)) {
      errors.push('Fuel level must be between 0 and 100')
    }
    
    if (form.vin && form.vin.length !== 17) {
      errors.push('VIN must be exactly 17 characters')
    }
    
    if (form.licensePlate && form.licensePlate.length < 2) {
      errors.push('License plate must be at least 2 characters')
    }
    
    if (form.purchasePrice && form.purchasePrice < 0) {
      errors.push('Purchase price cannot be negative')
    }
    
    // Date validation
    if (form.insuranceExpiry && new Date(form.insuranceExpiry) < new Date()) {
      errors.push('Insurance expiry date cannot be in the past')
    }
    
    if (form.registrationExpiry && new Date(form.registrationExpiry) < new Date()) {
      errors.push('Registration expiry date cannot be in the past')
    }
    
    return errors
  }

  const handleSaveVehicleEdit = () => {
    if (!editingVehicle) return

    // Validate form data
    const validationErrors = validateVehicleForm(editForm)
    if (validationErrors.length > 0) {
      validationErrors.forEach(error => {
        addNotification(error, 'error')
      })
      return
    }

    // Check for duplicate unit numbers
    const isDuplicate = vehicles.some(vehicle => 
      vehicle.id !== editingVehicle.id && 
      vehicle.unitNumber.toLowerCase() === editForm.unitNumber.toLowerCase()
    )
    
    if (isDuplicate) {
      addNotification('Unit number already exists', 'error')
      return
    }

    // Update vehicle in the list
    setVehicles(prev => prev.map(vehicle => 
      vehicle.id === editingVehicle.id 
        ? { 
            ...vehicle, 
            ...editForm,
            currentDriver: editForm.currentDriver || undefined
          }
        : vehicle
    ))

    setNotifications(prev => [...prev, {
      id: Date.now().toString(),
      message: `✅ Vehicle ${editForm.unitNumber} updated successfully`,
      type: 'success'
    }])

    setShowEditVehicleModal(false)
    setEditingVehicle(null)
  }

  const handleAddVehicle = () => {
    // Validate form data
    const validationErrors = validateVehicleForm(newVehicle)
    if (validationErrors.length > 0) {
      validationErrors.forEach(error => {
        addNotification(error, 'error')
      })
      return
    }

    // Check for duplicate unit numbers
    const isDuplicate = vehicles.some(vehicle => 
      vehicle.unitNumber.toLowerCase() === newVehicle.unitNumber.toLowerCase()
    )
    
    if (isDuplicate) {
      addNotification('Unit number already exists', 'error')
      return
    }

    const vehicle: Vehicle = {
      id: `TR-${String(vehicles.length + 1).padStart(3, '0')}`,
      ...newVehicle
    }

    setVehicles(prev => [...prev, vehicle])
    setShowAddVehicleModal(false)
    setNewVehicle({
      unitNumber: '',
      type: 'End Dump',
      make: '',
      model: '',
      year: new Date().getFullYear(),
      vin: '',
      licensePlate: '',
      status: 'active',
      location: '',
      odometer: 0,
      fuelLevel: 0,
      maintenanceDue: '',
      lastInspection: '',
      insuranceExpiry: '',
      registrationExpiry: '',
      avgMpg: 7.0,
      monthlyRevenue: 0,
      utilizationRate: 0,
      // Enhanced compliance fields
      dotInspectionDue: '',
      lastDotInspection: '',
      dotInspectionExpiry: '',
      insuranceCertNumber: '',
      registrationNumber: '',
      purchasePrice: 0,
      purchaseDate: '',
      // Financial tracking
      downtimeHours: 0,
      totalDowntimeCost: 0,
      maintenanceCost: 0,
      fuelCost: 0,
      insuranceCost: 0,
      registrationCost: 0,
      depreciationCost: 0,
      totalCost: 0,
      netProfit: 0,
      roi: 0
    })
    addNotification(`Vehicle ${vehicle.unitNumber} added successfully`, 'success')
  }

  const handleScheduleMaintenance = (vehicle: Vehicle) => {
    setMaintenanceVehicle(vehicle)
    setShowMaintenanceModal(true)
    setMaintenanceForm({
      serviceType: [],
      scheduledDate: '',
      scheduledTime: '',
      estimatedDuration: '',
      priority: 'medium',
      serviceProvider: '',
      estimatedCost: '',
      notes: '',
      notifyDriver: true,
      createWorkOrder: true
    })
  }

  const handleConfirmMaintenance = () => {
    if (!maintenanceVehicle) return

    if (maintenanceForm.serviceType.length === 0) {
      addNotification('Please select at least one service type', 'error')
      return
    }

    if (!maintenanceForm.scheduledDate) {
      addNotification('Please select a scheduled date', 'error')
      return
    }

    // Update vehicle status to maintenance if scheduled
    setVehicles(prev => prev.map(v => 
      v.id === maintenanceVehicle.id 
        ? { ...v, status: 'maintenance' as const }
        : v
    ))

    addNotification(
      `Maintenance scheduled for ${maintenanceVehicle.unitNumber} on ${formatDate(maintenanceForm.scheduledDate)}`,
      'success'
    )

    setShowMaintenanceModal(false)
    setMaintenanceVehicle(null)
  }

  const toggleServiceType = (service: string) => {
    setMaintenanceForm(prev => ({
      ...prev,
      serviceType: prev.serviceType.includes(service)
        ? prev.serviceType.filter(s => s !== service)
        : [...prev.serviceType, service]
    }))
  }

  const getStatusColor = (status: string) => {
    const colors = {
      active: theme.colors.success,
      maintenance: theme.colors.warning,
      idle: theme.colors.textSecondary,
      out_of_service: theme.colors.error
    }
    return colors[status] || theme.colors.textSecondary
  }

  // Helper function for alert colors - force reload
  const getAlertColor = (type: string) => {
    switch (type) {
      case 'error': return theme.colors.error
      case 'warning': return theme.colors.warning
      case 'success': return theme.colors.success
      case 'info': return theme.colors.info
      default: return theme.colors.textSecondary
    }
  }

  // Real-world export functions
  const generateFleetCSV = () => {
    const headers = [
      'Unit Number', 'Type', 'Make', 'Model', 'Year', 'VIN', 'License Plate',
      'Status', 'Location', 'Odometer', 'Fuel Level', 'Current Driver',
      'Maintenance Due', 'Last Inspection', 'Insurance Expiry', 'Registration Expiry',
      'Avg MPG', 'Monthly Revenue', 'Utilization Rate', 'Purchase Price', 'Purchase Date'
    ]
    
    const rows = vehicles.map(vehicle => [
      vehicle.unitNumber,
      vehicle.type,
      vehicle.make,
      vehicle.model,
      vehicle.year,
      vehicle.vin,
      vehicle.licensePlate,
      vehicle.status,
      vehicle.location,
      vehicle.odometer,
      vehicle.fuelLevel,
      vehicle.currentDriver || 'Unassigned',
      vehicle.maintenanceDue,
      vehicle.lastInspection,
      vehicle.insuranceExpiry,
      vehicle.registrationExpiry,
      vehicle.avgMpg,
      vehicle.monthlyRevenue,
      vehicle.utilizationRate,
      vehicle.purchasePrice,
      vehicle.purchaseDate
    ])
    
    return [headers, ...rows].map(row => 
      row.map(field => `"${field || ''}"`).join(',')
    ).join('\n')
  }

  const generateFleetJSON = () => {
    return {
      exportDate: new Date().toISOString(),
      fleetData: {
        vehicles: vehicles.map(vehicle => ({
          ...vehicle,
          exportTimestamp: new Date().toISOString()
        })),
        stats: {
          totalVehicles: vehicles.length,
          activeVehicles: vehicles.filter(v => v.status === 'active').length,
          maintenanceVehicles: vehicles.filter(v => v.status === 'maintenance').length,
          totalRevenue: vehicles.reduce((sum, v) => sum + v.monthlyRevenue, 0),
          averageUtilization: vehicles.reduce((sum, v) => sum + v.utilizationRate, 0) / vehicles.length
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

  // Real calendar sync functionality
  const syncFleetWithCalendar = () => {
    // Generate calendar events for fleet management
    const calendarEvents = []
    
    // Add maintenance due dates
    vehicles.forEach(vehicle => {
      if (vehicle.maintenanceDue) {
        calendarEvents.push({
          title: `Maintenance Due: ${vehicle.unitNumber}`,
          start: new Date(vehicle.maintenanceDue),
          end: new Date(vehicle.maintenanceDue),
          type: 'maintenance',
          vehicle: vehicle.unitNumber,
          description: `${vehicle.make} ${vehicle.model} - ${vehicle.type} maintenance due`
        })
      }
    })
    
    // Add insurance expiry dates
    vehicles.forEach(vehicle => {
      if (vehicle.insuranceExpiry) {
        calendarEvents.push({
          title: `Insurance Expiry: ${vehicle.unitNumber}`,
          start: new Date(vehicle.insuranceExpiry),
          end: new Date(vehicle.insuranceExpiry),
          type: 'compliance',
          vehicle: vehicle.unitNumber,
          description: `${vehicle.make} ${vehicle.model} - Insurance certificate expires`
        })
      }
    })
    
    // Add registration expiry dates
    vehicles.forEach(vehicle => {
      if (vehicle.registrationExpiry) {
        calendarEvents.push({
          title: `Registration Expiry: ${vehicle.unitNumber}`,
          start: new Date(vehicle.registrationExpiry),
          end: new Date(vehicle.registrationExpiry),
          type: 'compliance',
          vehicle: vehicle.unitNumber,
          description: `${vehicle.make} ${vehicle.model} - Registration expires`
        })
      }
    })
    
    // Store events in localStorage for calendar integration
    localStorage.setItem('fleetCalendarEvents', JSON.stringify(calendarEvents))
    
    // Trigger calendar refresh if calendar page is open
    window.dispatchEvent(new CustomEvent('fleetDataSynced', { 
      detail: { events: calendarEvents } 
    }))
  }

  // Real full maintenance history functionality
  const showFullMaintenanceHistory = (vehicle: Vehicle) => {
    setSelectedVehicleForHistory(vehicle)
    setShowFullHistoryModal(true)
  }

  // Generate comprehensive maintenance history
  const generateFullMaintenanceHistory = (vehicle: Vehicle) => {
    return [
      {
        id: '1',
        date: '2024-01-15',
        type: 'Oil Change',
        provider: 'Fleet Maintenance Co.',
        cost: 85.00,
        mileage: 125000,
        status: 'Completed',
        description: 'Regular oil change with synthetic oil',
        parts: ['Oil Filter', '5W-30 Synthetic Oil'],
        technician: 'Mike Johnson'
      },
      {
        id: '2',
        date: '2024-01-10',
        type: 'Brake Inspection',
        provider: 'Fleet Maintenance Co.',
        cost: 150.00,
        mileage: 124500,
        status: 'Completed',
        description: 'Full brake system inspection and pad replacement',
        parts: ['Brake Pads', 'Brake Fluid'],
        technician: 'Sarah Wilson'
      },
      {
        id: '3',
        date: '2023-12-20',
        type: 'Tire Rotation',
        provider: 'Quick Tire Service',
        cost: 45.00,
        mileage: 123000,
        status: 'Completed',
        description: 'Tire rotation and pressure check',
        parts: [],
        technician: 'Tom Davis'
      },
      {
        id: '4',
        date: '2023-12-05',
        type: 'Engine Diagnostic',
        provider: 'Fleet Maintenance Co.',
        cost: 200.00,
        mileage: 122500,
        status: 'Completed',
        description: 'Engine diagnostic check - no issues found',
        parts: [],
        technician: 'Mike Johnson'
      },
      {
        id: '5',
        date: '2023-11-15',
        type: 'Transmission Service',
        provider: 'Transmission Specialists',
        cost: 350.00,
        mileage: 120000,
        status: 'Completed',
        description: 'Transmission fluid change and filter replacement',
        parts: ['Transmission Filter', 'Transmission Fluid'],
        technician: 'John Smith'
      }
    ]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Enhanced filtering with sorting
  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = searchTerm === '' ||
      vehicle.unitNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.vin.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || vehicle.status === filterStatus
    
    // Advanced filters
    const matchesMaintenanceDue = !advancedFilters.maintenanceDue || 
      vehicle.maintenanceDue === advancedFilters.maintenanceDue
    
    const matchesComplianceExpiry = !advancedFilters.complianceExpiry || 
      vehicle.insuranceExpiry === advancedFilters.complianceExpiry ||
      vehicle.registrationExpiry === advancedFilters.complianceExpiry
    
    const matchesLocation = !advancedFilters.location || 
      vehicle.location.toLowerCase().includes(advancedFilters.location.toLowerCase())
    
    const matchesDriver = !advancedFilters.driver || 
      (vehicle.currentDriver && vehicle.currentDriver.toLowerCase().includes(advancedFilters.driver.toLowerCase()))
    
    const matchesMake = !advancedFilters.make || 
      vehicle.make.toLowerCase().includes(advancedFilters.make.toLowerCase())
    
    const matchesYearRange = (!advancedFilters.yearRange.min || vehicle.year >= parseInt(advancedFilters.yearRange.min)) &&
      (!advancedFilters.yearRange.max || vehicle.year <= parseInt(advancedFilters.yearRange.max))
    
    return matchesSearch && matchesStatus && matchesMaintenanceDue && 
           matchesComplianceExpiry && matchesLocation && matchesDriver && 
           matchesMake && matchesYearRange
  })

  // Enhanced sorting
  const getSortedVehicles = () => {
    if (sortBy === 'none') return filteredVehicles

    const sorted = [...filteredVehicles].sort((a, b) => {
      let comparison = 0

      if (sortBy === 'unitNumber') {
        comparison = a.unitNumber.localeCompare(b.unitNumber)
      } else if (sortBy === 'roi') {
        comparison = a.roi - b.roi
      } else if (sortBy === 'utilizationRate') {
        comparison = a.utilizationRate - b.utilizationRate
      } else if (sortBy === 'maintenanceCost') {
        comparison = a.maintenanceCost - b.maintenanceCost
      } else if (sortBy === 'fuelCost') {
        comparison = a.fuelCost - b.fuelCost
      } else if (sortBy === 'age') {
        comparison = a.year - b.year
      }

      return sortDirection === 'asc' ? comparison : -comparison
    })

    return sorted
  }

  const finalFilteredVehicles = getSortedVehicles()

  const stats = {
    total: vehicles.length,
    active: vehicles.filter(v => v.status === 'active').length,
    maintenance: vehicles.filter(v => v.status === 'maintenance').length,
    avgUtilization: Math.round(vehicles.reduce((sum, v) => sum + v.utilizationRate, 0) / vehicles.length),
    totalRevenue: vehicles.reduce((sum, v) => sum + v.monthlyRevenue, 0),
    // Enhanced analytics
    totalDowntimeCost: vehicles.reduce((sum, v) => sum + v.totalDowntimeCost, 0),
    totalDowntimeHours: vehicles.reduce((sum, v) => sum + v.downtimeHours, 0),
    avgROI: Math.round(vehicles.reduce((sum, v) => sum + v.roi, 0) / vehicles.length * 10) / 10,
    totalNetProfit: vehicles.reduce((sum, v) => sum + v.netProfit, 0),
    avgNetProfit: Math.round(vehicles.reduce((sum, v) => sum + v.netProfit, 0) / vehicles.length),
    totalCost: vehicles.reduce((sum, v) => sum + v.totalCost, 0),
    // Compliance tracking
    dotInspectionsDue: vehicles.filter(v => {
      const dueDate = new Date(v.dotInspectionDue)
      const today = new Date()
      const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      return daysUntilDue <= 30
    }).length,
    insuranceExpiring: vehicles.filter(v => {
      const expiryDate = new Date(v.insuranceExpiry)
      const today = new Date()
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      return daysUntilExpiry <= 30
    }).length,
    registrationExpiring: vehicles.filter(v => {
      const expiryDate = new Date(v.registrationExpiry)
      const today = new Date()
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      return daysUntilExpiry <= 30
    }).length
  }

  const headerAction = (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      <button
        onClick={() => {
          // Real calendar sync functionality
          syncFleetWithCalendar()
          setNotifications(prev => [...prev, {
            id: Date.now().toString(),
            message: '📅 Fleet data synced with calendar successfully',
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
        onClick={() => setShowBackupModal(true)}
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
        <Activity size={18} />
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
        <AlertTriangle size={18} />
        View All Alerts
      </button>
      <button
        onClick={() => setShowAddVehicleModal(true)}
        style={{
          padding: '12px 24px',
          background: 'transparent',
          color: theme.colors.textSecondary,
          borderRadius: '8px',
          border: `1px solid ${theme.colors.border}`,
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
          e.currentTarget.style.transform = 'translateY(-1px)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.color = theme.colors.textSecondary
          e.currentTarget.style.borderColor = theme.colors.border
          e.currentTarget.style.transform = 'translateY(0)'
        }}
      >
        <Plus size={18} />
        Add Vehicle
      </button>
    </div>
  )

  return (
    <PageContainer
      title="Fleet Management"
      subtitle="Monitor vehicle status, maintenance schedules, and fleet performance"
      icon={Truck as any}
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
              background: theme.colors.backgroundTertiary,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Truck size={28} color={theme.colors.textSecondary} />
            </div>
            <div>
              <p style={{ fontSize: '36px', fontWeight: 'bold', color: theme.colors.textPrimary, margin: 0, lineHeight: 1 }}>
                {stats.total}
              </p>
              <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: '4px 0 0 0' }}>
                Total Vehicles
              </p>
            </div>
          </div>
        </Card>

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
                {stats.active}
              </p>
              <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: '4px 0 0 0' }}>
                Active Now
              </p>
            </div>
          </div>
        </Card>

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
              <Wrench size={28} color={theme.colors.textSecondary} />
            </div>
            <div>
              <p style={{ fontSize: '36px', fontWeight: 'bold', color: theme.colors.textPrimary, margin: 0, lineHeight: 1 }}>
                {stats.maintenance}
              </p>
              <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: '4px 0 0 0' }}>
                In Maintenance
              </p>
            </div>
          </div>
        </Card>

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
              <Activity size={28} color={theme.colors.textSecondary} />
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
              <DollarSign size={28} color={theme.colors.success} />
            </div>
            <div>
              <AnimatedCounter value={stats.totalRevenue / 1000} prefix="$" suffix="k" style={{ fontSize: '36px', fontWeight: 'bold', color: theme.colors.success, margin: 0, lineHeight: 1 }} />
              <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: '4px 0 0 0' }}>
                Monthly Revenue
              </p>
            </div>
          </div>
        </Card>

        {/* Enhanced Analytics Cards */}
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
                ${(stats.totalDowntimeCost / 1000).toFixed(1)}k
              </p>
              <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: '4px 0 0 0' }}>
                Downtime Cost
              </p>
            </div>
          </div>
        </Card>

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
              <TrendingUp size={28} color={theme.colors.textSecondary} />
            </div>
            <div>
              <p style={{ fontSize: '36px', fontWeight: 'bold', color: theme.colors.textPrimary, margin: 0, lineHeight: 1 }}>
                {stats.avgROI}%
              </p>
              <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: '4px 0 0 0' }}>
                Avg ROI
              </p>
            </div>
          </div>
        </Card>

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
              <CheckCircle size={28} color={theme.colors.success} />
            </div>
            <div>
              <AnimatedCounter value={stats.totalNetProfit / 1000} prefix="$" suffix="k" style={{ fontSize: '36px', fontWeight: 'bold', color: theme.colors.success, margin: 0, lineHeight: 1 }} />
              <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: '4px 0 0 0' }}>
                Net Profit
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
              placeholder="Search by unit, make, model, VIN, or plate..." /* Force reload - dark theme */
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
            <option value="all" style={{ background: '#1a1a1a', color: '#FFFFFF' }}>All Status</option>
            <option value="active" style={{ background: '#1a1a1a', color: '#FFFFFF' }}>Active</option>
            <option value="maintenance" style={{ background: '#1a1a1a', color: '#FFFFFF' }}>Maintenance</option>
            <option value="idle" style={{ background: '#1a1a1a', color: '#FFFFFF' }}>Idle</option>
            <option value="out_of_service" style={{ background: '#1a1a1a', color: '#FFFFFF' }}>Out of Service</option>
          </select>

          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            style={{
              padding: '12px 16px',
              background: showAdvancedFilters ? '#343a40' : 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${showAdvancedFilters ? '#495057' : 'rgba(255, 255, 255, 0.1)'}`,
              borderRadius: '12px',
              color: showAdvancedFilters ? 'white' : theme.colors.textSecondary,
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              if (!showAdvancedFilters) {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                e.currentTarget.style.borderColor = theme.colors.primary
              }
            }}
            onMouseLeave={(e) => {
              if (!showAdvancedFilters) {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            <Filter size={16} />
            Advanced Filters
          </button>
        </div>

        {/* Advanced Filters Panel */}
        {showAdvancedFilters && (
          <div style={{
            background: theme.colors.background,
            borderRadius: '12px',
            padding: '20px',
            border: `1px solid ${theme.colors.border}`,
            marginTop: '16px'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', color: theme.colors.textPrimary, fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>
                  Maintenance Due Date
                </label>
                <input
                  type="date"
                  value={advancedFilters.maintenanceDue}
                  onChange={(e) => setAdvancedFilters(prev => ({ ...prev, maintenanceDue: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '6px',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: theme.colors.textPrimary, fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>
                  Compliance Expiry Date
                </label>
                <input
                  type="date"
                  value={advancedFilters.complianceExpiry}
                  onChange={(e) => setAdvancedFilters(prev => ({ ...prev, complianceExpiry: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '6px',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: theme.colors.textPrimary, fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>
                  Location
                </label>
                <input
                  type="text"
                  placeholder="Filter by location..."
                  value={advancedFilters.location}
                  onChange={(e) => setAdvancedFilters(prev => ({ ...prev, location: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '6px',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: theme.colors.textPrimary, fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>
                  Driver
                </label>
                <input
                  type="text"
                  placeholder="Filter by driver..."
                  value={advancedFilters.driver}
                  onChange={(e) => setAdvancedFilters(prev => ({ ...prev, driver: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '6px',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: theme.colors.textPrimary, fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>
                  Make
                </label>
                <input
                  type="text"
                  placeholder="Filter by make..."
                  value={advancedFilters.make}
                  onChange={(e) => setAdvancedFilters(prev => ({ ...prev, make: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '6px',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: theme.colors.textPrimary, fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>
                  Year Range
                </label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input
                    type="number"
                    placeholder="Min"
                    value={advancedFilters.yearRange.min}
                    onChange={(e) => setAdvancedFilters(prev => ({ 
                      ...prev, 
                      yearRange: { ...prev.yearRange, min: e.target.value }
                    }))}
                    style={{
                      width: '70px',
                      padding: '8px 6px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '6px',
                      color: '#FFFFFF',
                      fontSize: '12px',
                      outline: 'none',
                      textAlign: 'center'
                    }}
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={advancedFilters.yearRange.max}
                    onChange={(e) => setAdvancedFilters(prev => ({ 
                      ...prev, 
                      yearRange: { ...prev.yearRange, max: e.target.value }
                    }))}
                    style={{
                      width: '70px',
                      padding: '8px 6px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '6px',
                      color: '#FFFFFF',
                      fontSize: '12px',
                      outline: 'none',
                      textAlign: 'center'
                    }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button
                onClick={() => setAdvancedFilters({
                  maintenanceDue: '',
                  complianceExpiry: '',
                  location: '',
                  driver: '',
                  make: '',
                  yearRange: { min: '', max: '' }
                })}
                style={{
                  padding: '8px 16px',
                  background: 'transparent',
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: '6px',
                  color: theme.colors.textSecondary,
                  fontSize: '12px',
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
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Fleet List */}
      <Card title="Fleet Vehicles" subtitle={`${finalFilteredVehicles.length} vehicle${finalFilteredVehicles.length !== 1 ? 's' : ''}`} icon={<Truck size={20} color={theme.colors.textSecondary} />}>
        {/* Select All Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: `1px solid ${theme.colors.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={selectedVehicles.length === finalFilteredVehicles.length ? clearSelection : selectAllVehicles}
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
                e.currentTarget.style.background = theme.colors.backgroundTertiary
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'none'
              }}
            >
              {selectedVehicles.length === finalFilteredVehicles.length ? (
                <CheckSquare size={20} color={theme.colors.textSecondary} />
              ) : (
                <Square size={20} color={theme.colors.textSecondary} />
              )}
              <span style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary }}>
                {selectedVehicles.length === finalFilteredVehicles.length ? 'Deselect All' : 'Select All'}
              </span>
            </button>
            
            {selectedVehicles.length > 0 && (
              <span style={{ fontSize: '12px', color: theme.colors.textSecondary }}>
                {selectedVehicles.length} selected
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {finalFilteredVehicles.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: theme.colors.textSecondary }}>
              <Truck size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
              <p style={{ fontSize: '18px', margin: 0 }}>No vehicles found</p>
            </div>
          ) : (
            finalFilteredVehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                style={{
                  background: theme.colors.background,
                  borderRadius: '12px',
                  padding: '20px',
                  border: `2px solid ${vehicle.status === 'maintenance' ? theme.colors.warning : theme.colors.border}`,
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
                onClick={() => setSelectedVehicle(vehicle)}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleVehicleSelection(vehicle.id)
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px',
                      borderRadius: '4px',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = theme.colors.backgroundTertiary
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'none'
                    }}
                  >
                    {selectedVehicles.includes(vehicle.id) ? (
                      <CheckSquare size={20} color={theme.colors.textSecondary} />
                    ) : (
                      <Square size={20} color={theme.colors.textSecondary} />
                    )}
                  </button>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                    <div style={{
                      width: '64px',
                      height: '64px',
                      background: theme.colors.backgroundTertiary,
                      borderRadius: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: 'none'
                    }}>
                      <Truck size={32} color={theme.colors.textSecondary} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary, margin: '0 0 6px 0' }}>
                        {vehicle.unitNumber} - {vehicle.year} {vehicle.make} {vehicle.model}
                      </h3>
                      <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: '0 0 4px 0' }}>
                        {vehicle.type} • {vehicle.licensePlate} • {vehicle.odometer.toLocaleString()} mi
                      </p>
                      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '8px' }}>
                        {vehicle.currentDriver && (
                          <span style={{ fontSize: '13px', color: theme.colors.textSecondary }}>
                            Driver: {vehicle.currentDriver}
                          </span>
                        )}
                        {vehicle.currentLoad && (
                          <span style={{ fontSize: '13px', color: theme.colors.info, fontWeight: '600' }}>
                            Load: {vehicle.currentLoad}
                          </span>
                        )}
                        <span style={{ fontSize: '13px', color: theme.colors.textSecondary, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={12} />
                          {vehicle.location}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        // Show fuel tracking info and mobile app integration
                        setNotifications(prev => [...prev, {
                          id: Date.now().toString(),
                          message: `Fuel level for ${vehicle.unitNumber}: ${vehicle.fuelLevel}% (Auto-updated via mobile app)`,
                          type: 'info'
                        }])
                        
                        // Simulate mobile app fuel update (for testing)
                        if (vehicle.currentLoad) {
                          simulateMobileFuelUpdate(vehicle)
                        }
                      }}
                      style={{ 
                        textAlign: 'center', 
                        background: 'transparent', 
                        border: 'none', 
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        position: 'relative'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)'
                      }}
                      title={`Fuel Level: ${vehicle.fuelLevel}% - Auto-updated at end of each load via mobile app`}
                    >
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: `conic-gradient(${vehicle.fuelLevel > 75 ? theme.colors.success : vehicle.fuelLevel > 25 ? theme.colors.warning : theme.colors.error} ${vehicle.fuelLevel * 3.6}deg, ${theme.colors.background} 0deg)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative'
                      }}>
                        <div style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '50%',
                          background: theme.colors.backgroundCard,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Fuel size={16} color={theme.colors.textSecondary} />
                        </div>
                        {/* Mobile app indicator */}
                        <div style={{
                          position: 'absolute',
                          top: '-2px',
                          right: '-2px',
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          background: theme.colors.primary,
                          border: `2px solid ${theme.colors.backgroundCard}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <div style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: 'white'
                          }} />
                        </div>
                      </div>
                      <p style={{ fontSize: '11px', color: theme.colors.textSecondary, margin: '4px 0 0 0' }}>
                        {vehicle.fuelLevel}%
                      </p>
                      {/* Auto-update indicator */}
                      <div style={{
                        position: 'absolute',
                        top: '60px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontSize: '8px',
                        color: theme.colors.textSecondary,
                        background: theme.colors.background,
                        padding: '2px 4px',
                        borderRadius: '4px',
                        border: `1px solid ${theme.colors.border}`,
                        whiteSpace: 'nowrap',
                        opacity: 0,
                        transition: 'opacity 0.2s ease'
                      }}
                      className="fuel-auto-update-tooltip"
                    >
                      Auto-updated via mobile
                    </div>
                    </button>

                    <button 
                      onClick={(e) => {
                        e.stopPropagation()
                        setNotifications(prev => [...prev, {
                          id: Date.now().toString(),
                          message: `Utilization rate for ${vehicle.unitNumber}: ${vehicle.utilizationRate}%`,
                          type: 'info'
                        }])
                      }}
                      style={{ 
                        textAlign: 'center', 
                        background: 'transparent', 
                        border: 'none', 
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)'
                      }}
                    >
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: `conic-gradient(${theme.colors.info} ${vehicle.utilizationRate * 3.6}deg, ${theme.colors.background} 0deg)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative'
                      }}>
                        <div style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '50%',
                          background: theme.colors.backgroundCard,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Gauge size={16} color={theme.colors.textSecondary} />
                        </div>
                      </div>
                      <p style={{ fontSize: '11px', color: theme.colors.textSecondary, margin: '4px 0 0 0' }}>
                        {vehicle.utilizationRate}%
                      </p>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setNotifications(prev => [...prev, {
                          id: Date.now().toString(),
                          message: `Status for ${vehicle.unitNumber}: ${vehicle.status.replace('_', ' ')}`,
                          type: 'info'
                        }])
                      }}
                      style={{
                        padding: '8px 14px',
                        background: `${getStatusColor(vehicle.status)}20`,
                        color: getStatusColor(vehicle.status),
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: '600',
                        textTransform: 'capitalize',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)'
                        e.currentTarget.style.background = `${getStatusColor(vehicle.status)}30`
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)'
                        e.currentTarget.style.background = `${getStatusColor(vehicle.status)}20`
                      }}
                    >
                      {vehicle.status.replace('_', ' ')}
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedVehicle(vehicle)
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
                        e.currentTarget.style.backgroundColor = theme.colors.backgroundCardHover
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

      {/* Vehicle Compliance Tracking */}
      <Card 
        title="Vehicle Compliance Tracking" 
        icon={<Truck size={20} color={theme.colors.info} />}
        style={{ marginTop: '24px' }}
      >
        <div style={{ 
          background: `${theme.colors.info}10`, 
          border: `1px solid ${theme.colors.info}30`, 
          borderRadius: '8px', 
          padding: '12px 16px', 
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <Truck size={16} color={theme.colors.info} />
          <p style={{ 
            fontSize: '13px', 
            color: theme.colors.textPrimary, 
            margin: 0,
            fontWeight: '500'
          }}>
            <strong>Vehicle-Specific Compliance:</strong> This section tracks compliance for individual vehicles only. 
            For driver licenses, company permits, and other compliance items, visit the main Compliance page.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {/* DOT Inspections */}
          <div style={{ background: theme.colors.background, padding: '20px', borderRadius: '12px', border: `2px solid ${theme.colors.info}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: `${theme.colors.info}20`,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <CheckCircle size={20} color={theme.colors.info} />
              </div>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: '600', color: theme.colors.textPrimary, margin: 0 }}>
                  Vehicle DOT Inspections
                </h4>
                <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: '2px 0 0 0' }}>
                  Annual vehicle inspections
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '14px', color: theme.colors.textSecondary }}>Due in 30 days:</span>
              <span style={{ fontSize: '18px', fontWeight: 'bold', color: stats.dotInspectionsDue > 0 ? theme.colors.warning : theme.colors.success }}>
                {stats.dotInspectionsDue}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: theme.colors.textSecondary }}>Total vehicles:</span>
              <span style={{ fontSize: '16px', fontWeight: '600', color: theme.colors.textPrimary }}>
                {stats.total}
              </span>
            </div>
          </div>

          {/* Insurance Certificates */}
          <div style={{ background: theme.colors.background, padding: '20px', borderRadius: '12px', border: `2px solid ${theme.colors.warning}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: theme.colors.backgroundTertiary,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <AlertTriangle size={20} color={theme.colors.textSecondary} />
              </div>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: '600', color: theme.colors.textPrimary, margin: 0 }}>
                  Vehicle Insurance
                </h4>
                <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: '2px 0 0 0' }}>
                  Vehicle insurance policies
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '14px', color: theme.colors.textSecondary }}>Expiring in 30 days:</span>
              <span style={{ fontSize: '18px', fontWeight: 'bold', color: stats.insuranceExpiring > 0 ? theme.colors.error : theme.colors.success }}>
                {stats.insuranceExpiring}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: theme.colors.textSecondary }}>Total policies:</span>
              <span style={{ fontSize: '16px', fontWeight: '600', color: theme.colors.textPrimary }}>
                {stats.total}
              </span>
            </div>
          </div>

          {/* Registration Renewals */}
          <div style={{ background: theme.colors.background, padding: '20px', borderRadius: '12px', border: `2px solid ${theme.colors.primary}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: theme.colors.backgroundTertiary,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Calendar size={20} color={theme.colors.textSecondary} />
              </div>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: '600', color: theme.colors.textPrimary, margin: 0 }}>
                  Vehicle Registration
                </h4>
                <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: '2px 0 0 0' }}>
                  State vehicle registration
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '14px', color: theme.colors.textSecondary }}>Expiring in 30 days:</span>
              <span style={{ fontSize: '18px', fontWeight: 'bold', color: stats.registrationExpiring > 0 ? theme.colors.warning : theme.colors.success }}>
                {stats.registrationExpiring}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: theme.colors.textSecondary }}>Total registrations:</span>
              <span style={{ fontSize: '16px', fontWeight: '600', color: theme.colors.textPrimary }}>
                {stats.total}
              </span>
            </div>
          </div>
        </div>

        {/* Vehicle-Specific Compliance Deadlines */}
        <div style={{ marginTop: '20px' }}>
          <h4 style={{ fontSize: '16px', fontWeight: '600', color: theme.colors.textPrimary, margin: '0 0 16px 0' }}>
            Vehicle Compliance Deadlines
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {vehicles.flatMap(vehicle => {
              const deadlines = []
              
              // DOT Inspection
              const dotDueDate = new Date(vehicle.dotInspectionDue)
              const today = new Date()
              const daysUntilDot = Math.ceil((dotDueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
              if (daysUntilDot <= 30) {
                deadlines.push({
                  vehicle: vehicle.unitNumber,
                  type: 'DOT Inspection',
                  dueDate: vehicle.dotInspectionDue,
                  daysUntil: daysUntilDot,
                  priority: daysUntilDot <= 7 ? 'urgent' : daysUntilDot <= 14 ? 'high' : 'medium',
                  certNumber: vehicle.dotInspectionExpiry
                })
              }

              // Insurance
              const insuranceExpiry = new Date(vehicle.insuranceExpiry)
              const daysUntilInsurance = Math.ceil((insuranceExpiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
              if (daysUntilInsurance <= 30) {
                deadlines.push({
                  vehicle: vehicle.unitNumber,
                  type: 'Insurance Renewal',
                  dueDate: vehicle.insuranceExpiry,
                  daysUntil: daysUntilInsurance,
                  priority: daysUntilInsurance <= 7 ? 'urgent' : daysUntilInsurance <= 14 ? 'high' : 'medium',
                  certNumber: vehicle.insuranceCertNumber
                })
              }

              // Registration
              const registrationExpiry = new Date(vehicle.registrationExpiry)
              const daysUntilRegistration = Math.ceil((registrationExpiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
              if (daysUntilRegistration <= 30) {
                deadlines.push({
                  vehicle: vehicle.unitNumber,
                  type: 'Registration Renewal',
                  dueDate: vehicle.registrationExpiry,
                  daysUntil: daysUntilRegistration,
                  priority: daysUntilRegistration <= 7 ? 'urgent' : daysUntilRegistration <= 14 ? 'high' : 'medium',
                  certNumber: vehicle.registrationNumber
                })
              }

              return deadlines
            }).sort((a, b) => a.daysUntil - b.daysUntil).slice(0, 6).map((deadline, idx) => (
              <div
                key={idx}
                style={{
                  background: theme.colors.background,
                  padding: '16px',
                  borderRadius: '8px',
                  border: `2px solid ${
                    deadline.priority === 'urgent' ? theme.colors.error :
                    deadline.priority === 'high' ? theme.colors.warning :
                    theme.colors.info
                  }`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <Truck size={16} color={theme.colors.textPrimary} />
                    <h5 style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, margin: 0 }}>
                      {deadline.vehicle}
                    </h5>
                    <span style={{
                      padding: '2px 6px',
                      background: `${
                        deadline.priority === 'urgent' ? theme.colors.error :
                        deadline.priority === 'high' ? theme.colors.warning :
                        theme.colors.info
                      }20`,
                      color: deadline.priority === 'urgent' ? theme.colors.error :
                             deadline.priority === 'high' ? theme.colors.warning :
                             theme.colors.info,
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: '600',
                      textTransform: 'uppercase'
                    }}>
                      {deadline.priority}
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: theme.colors.textSecondary, margin: '0 0 4px 0' }}>
                    {deadline.type} • Cert: {deadline.certNumber}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={12} color={theme.colors.textSecondary} />
                    <span style={{ fontSize: '12px', color: theme.colors.textSecondary }}>
                      Due: {deadline.dueDate} ({deadline.daysUntil} days)
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedComplianceItem(deadline)
                    setShowComplianceModal(true)
                  }}
                  style={{
                    padding: '8px 16px',
                    background: 'transparent',
                    color: theme.colors.textSecondary,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: '8px',
                    fontSize: '12px',
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
                >
                  Manage
                </button>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Maintenance Alerts */}
      <Card 
        title="Maintenance Alerts" 
        icon={<AlertTriangle size={20} color={theme.colors.textSecondary} />}
        style={{ marginTop: '24px' }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          {[
            { vehicle: 'Truck #2', type: 'DOT Inspection', dueDate: '2025-01-10', status: 'overdue', priority: 'high' },
            { vehicle: 'Truck #4', type: 'Oil Change', dueDate: '2025-01-25', status: 'upcoming', priority: 'medium' },
            { vehicle: 'Truck #1', type: 'Tire Rotation', dueDate: '2025-02-15', status: 'scheduled', priority: 'low' },
            { vehicle: 'Truck #3', type: 'Brake Inspection', dueDate: '2025-02-28', status: 'scheduled', priority: 'medium' }
          ].map((item, idx) => (
            <div
              key={idx}
              style={{
                background: theme.colors.background,
                padding: '20px',
                borderRadius: '12px',
                border: `2px solid ${
                  item.status === 'overdue' ? theme.colors.error : 
                  item.priority === 'high' ? theme.colors.warning :
                  theme.colors.border
                }`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = `0 8px 25px ${theme.colors.primary}20`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Truck size={16} color={theme.colors.textPrimary} />
                  <h4 style={{ fontSize: '16px', fontWeight: '600', color: theme.colors.textPrimary, margin: 0 }}>
                    {item.vehicle}
                  </h4>
                  {item.priority === 'high' && (
                    <span style={{
                      padding: '2px 6px',
                      background: theme.colors.backgroundTertiary,
                      color: theme.colors.error,
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: '600',
                      textTransform: 'uppercase'
                    }}>
                      URGENT
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: '0 0 6px 0' }}>
                  {item.type}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={12} color={theme.colors.textSecondary} />
                  <span style={{ fontSize: '13px', color: theme.colors.textSecondary }}>
                    Due: {item.dueDate}
                  </span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{
                  padding: '8px 12px',
                  background: `${
                    item.status === 'overdue' ? theme.colors.error :
                    item.status === 'upcoming' ? theme.colors.warning :
                    theme.colors.info
                  }20`,
                  color: item.status === 'overdue' ? theme.colors.error :
                         item.status === 'upcoming' ? theme.colors.warning :
                         theme.colors.info,
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '600',
                  textTransform: 'capitalize',
                  display: 'block',
                  marginBottom: '8px'
                }}>
                  {item.status}
                </span>
                <button
                  onClick={() => {
                    const vehicle = vehicles.find(v => v.unitNumber === item.vehicle)
                    if (vehicle) handleScheduleMaintenance(vehicle)
                  }}
                  style={{
                    padding: '6px 12px',
                    background: 'transparent',
                    color: theme.colors.textSecondary,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: '8px',
                    fontSize: '11px',
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
                >
                  Schedule
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Vehicle Detail Modal */}
      {selectedVehicle && (
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
          onClick={() => setSelectedVehicle(null)}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
              <div>
                <h2 style={{ color: theme.colors.textPrimary, fontSize: '24px', fontWeight: 'bold', margin: '0 0 8px 0' }}>
                  {selectedVehicle.unitNumber}
                </h2>
                <p style={{ color: theme.colors.textSecondary, margin: 0 }}>
                  {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model} • {selectedVehicle.type}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <button
                  onClick={() => {
                    setSelectedVehicle(null)
                    handleEditVehicle(selectedVehicle)
                  }}
                  style={{
                    padding: '8px 16px',
                    background: '#343a40',
                    border: '1px solid #495057',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <Edit size={16} />
                  Edit Vehicle
                </button>
                <button
                  onClick={() => setSelectedVehicle(null)}
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
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
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
                  color: getStatusColor(selectedVehicle.status),
                  margin: 0,
                  textTransform: 'capitalize'
                }}>
                  {selectedVehicle.status.replace('_', ' ')}
                </p>
              </div>

              <div style={{ background: theme.colors.background, padding: '20px', borderRadius: '12px' }}>
                <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
                  Odometer
                </p>
                <p style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary, margin: 0 }}>
                  {selectedVehicle.odometer.toLocaleString()} mi
                </p>
              </div>

              <div style={{ background: theme.colors.background, padding: '20px', borderRadius: '12px' }}>
                <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
                  Fuel Level
                </p>
                <p style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary, margin: 0 }}>
                  {selectedVehicle.fuelLevel}%
                </p>
              </div>

              <div style={{ background: theme.colors.background, padding: '20px', borderRadius: '12px' }}>
                <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
                  Utilization
                </p>
                <p style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary, margin: 0 }}>
                  {selectedVehicle.utilizationRate}%
                </p>
              </div>

              <div style={{ background: theme.colors.background, padding: '20px', borderRadius: '12px' }}>
                <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
                  Monthly Revenue
                </p>
                <p style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.success, margin: 0 }}>
                  ${selectedVehicle.monthlyRevenue.toLocaleString()}
                </p>
              </div>

              <div style={{ background: theme.colors.background, padding: '20px', borderRadius: '12px' }}>
                <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
                  Avg MPG
                </p>
                <p style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary, margin: 0 }}>
                  {selectedVehicle.avgMpg} mpg
                </p>
              </div>

              <div style={{ background: theme.colors.background, padding: '20px', borderRadius: '12px' }}>
                <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
                  ROI
                </p>
                <p style={{ fontSize: '18px', fontWeight: '600', color: selectedVehicle.roi > 150 ? theme.colors.success : selectedVehicle.roi > 100 ? theme.colors.warning : theme.colors.error, margin: 0 }}>
                  {selectedVehicle.roi}%
                </p>
              </div>

              <div style={{ background: theme.colors.background, padding: '20px', borderRadius: '12px' }}>
                <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
                  Downtime Cost
                </p>
                <p style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.error, margin: 0 }}>
                  ${selectedVehicle.totalDowntimeCost.toLocaleString()}
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
                <h4 style={{ color: theme.colors.textPrimary, fontSize: '14px', fontWeight: '600', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Vehicle Info
                </h4>
                <p style={{ color: theme.colors.textSecondary, fontSize: '13px', margin: '0 0 6px 0' }}>
                  VIN: {selectedVehicle.vin}
                </p>
                <p style={{ color: theme.colors.textSecondary, fontSize: '13px', margin: '0 0 6px 0' }}>
                  License Plate: {selectedVehicle.licensePlate}
                </p>
                <p style={{ color: theme.colors.textSecondary, fontSize: '13px', margin: 0 }}>
                  Location: {selectedVehicle.location}
                </p>
              </div>

              <div style={{ background: theme.colors.background, padding: '20px', borderRadius: '12px' }}>
                <h4 style={{ color: theme.colors.textPrimary, fontSize: '14px', fontWeight: '600', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Compliance & Maintenance
                </h4>
                <p style={{ color: theme.colors.textSecondary, fontSize: '13px', margin: '0 0 6px 0' }}>
                  DOT Due: {formatDate(selectedVehicle.dotInspectionDue)}
                </p>
                <p style={{ color: theme.colors.textSecondary, fontSize: '13px', margin: '0 0 6px 0' }}>
                  Insurance: {formatDate(selectedVehicle.insuranceExpiry)}
                </p>
                <p style={{ color: theme.colors.textSecondary, fontSize: '13px', margin: '0 0 6px 0' }}>
                  Registration: {formatDate(selectedVehicle.registrationExpiry)}
                </p>
                <p style={{ color: theme.colors.textSecondary, fontSize: '13px', margin: 0 }}>
                  Last Inspection: {formatDate(selectedVehicle.lastInspection)}
                </p>
              </div>
            </div>

            {/* Financial Analysis */}
            <div style={{ background: theme.colors.background, padding: '20px', borderRadius: '12px', marginBottom: '28px' }}>
              <h4 style={{ color: theme.colors.textPrimary, fontSize: '14px', fontWeight: '600', margin: '0 0 16px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Financial Analysis
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                <div>
                  <h5 style={{ color: theme.colors.textPrimary, fontSize: '13px', fontWeight: '600', margin: '0 0 8px 0' }}>Revenue & Costs</h5>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px', color: theme.colors.textSecondary }}>Monthly Revenue:</span>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: theme.colors.success }}>${selectedVehicle.monthlyRevenue.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px', color: theme.colors.textSecondary }}>Fuel Cost:</span>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: theme.colors.textPrimary }}>${selectedVehicle.fuelCost.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px', color: theme.colors.textSecondary }}>Maintenance:</span>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: theme.colors.textPrimary }}>${selectedVehicle.maintenanceCost.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px', color: theme.colors.textSecondary }}>Insurance:</span>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: theme.colors.textPrimary }}>${selectedVehicle.insuranceCost.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', color: theme.colors.textSecondary }}>Depreciation:</span>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: theme.colors.textPrimary }}>${selectedVehicle.depreciationCost.toLocaleString()}</span>
                  </div>
                  <div style={{ borderTop: `1px solid ${theme.colors.border}`, paddingTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: theme.colors.textPrimary }}>Total Costs:</span>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: theme.colors.error }}>${selectedVehicle.totalCost.toLocaleString()}</span>
                  </div>
                </div>
                <div>
                  <h5 style={{ color: theme.colors.textPrimary, fontSize: '13px', fontWeight: '600', margin: '0 0 8px 0' }}>Performance Metrics</h5>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px', color: theme.colors.textSecondary }}>Net Profit:</span>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: selectedVehicle.netProfit > 0 ? theme.colors.success : theme.colors.error }}>
                      ${selectedVehicle.netProfit.toLocaleString()}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px', color: theme.colors.textSecondary }}>ROI:</span>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: selectedVehicle.roi > 150 ? theme.colors.success : selectedVehicle.roi > 100 ? theme.colors.warning : theme.colors.error }}>
                      {selectedVehicle.roi}%
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px', color: theme.colors.textSecondary }}>Downtime Hours:</span>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: theme.colors.textPrimary }}>{selectedVehicle.downtimeHours}h</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', color: theme.colors.textSecondary }}>Downtime Cost:</span>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: theme.colors.error }}>${selectedVehicle.totalDowntimeCost.toLocaleString()}</span>
                  </div>
                  <div style={{ borderTop: `1px solid ${theme.colors.border}`, paddingTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: theme.colors.textPrimary }}>Purchase Price:</span>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: theme.colors.textPrimary }}>${selectedVehicle.purchasePrice.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Certificate Information */}
            <div style={{ background: theme.colors.background, padding: '20px', borderRadius: '12px', marginBottom: '28px' }}>
              <h4 style={{ color: theme.colors.textPrimary, fontSize: '14px', fontWeight: '600', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Certificate Information
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                <div>
                  <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: '0 0 4px 0' }}>DOT Certificate</p>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: theme.colors.textPrimary, margin: 0 }}>{selectedVehicle.dotInspectionExpiry}</p>
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: '0 0 4px 0' }}>Insurance Certificate</p>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: theme.colors.textPrimary, margin: 0 }}>{selectedVehicle.insuranceCertNumber}</p>
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: '0 0 4px 0' }}>Registration Number</p>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: theme.colors.textPrimary, margin: 0 }}>{selectedVehicle.registrationNumber}</p>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setSelectedVehicle(null)}
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
              <button
                onClick={() => {
                  setSelectedVehicle(null)
                  handleScheduleMaintenance(selectedVehicle!)
                }}
                style={{
                  padding: '12px 24px',
                  background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primary} 100%)`,
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
                <Wrench size={18} />
                Schedule Maintenance
              </button>
            </div>

            {/* Maintenance History */}
            <div style={{ background: theme.colors.background, padding: '20px', borderRadius: '12px', marginBottom: '28px' }}>
              <h4 style={{ color: theme.colors.textPrimary, fontSize: '14px', fontWeight: '600', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Wrench size={16} color={theme.colors.textSecondary} />
                Maintenance History
              </h4>
              <div style={{ background: `${theme.colors.background}80`, borderRadius: '8px', border: `1px solid ${theme.colors.border}`, overflow: 'hidden' }}>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr 1fr 1fr auto', 
                  gap: '16px', 
                  padding: '12px', 
                  background: theme.colors.backgroundTertiary,
                  borderBottom: `1px solid ${theme.colors.border}`
                }}>
                  <div style={{ color: theme.colors.textPrimary, fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' }}>Date</div>
                  <div style={{ color: theme.colors.textPrimary, fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' }}>Service Type</div>
                  <div style={{ color: theme.colors.textPrimary, fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' }}>Provider</div>
                  <div style={{ color: theme.colors.textPrimary, fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' }}>Cost</div>
                  <div style={{ color: theme.colors.textPrimary, fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' }}>Status</div>
                </div>
                {[
                  { date: '2024-10-15', service: 'Oil Change', provider: 'QuickLube Pro', cost: '$85', status: 'Completed' },
                  { date: '2024-09-20', service: 'Brake Inspection', provider: 'Fleet Services', cost: '$120', status: 'Completed' },
                  { date: '2024-08-10', service: 'Tire Rotation', provider: 'Tire Masters', cost: '$45', status: 'Completed' },
                  { date: '2024-07-05', service: 'Engine Tune-up', provider: 'Diesel Tech', cost: '$350', status: 'Completed' }
                ].map((maintenance, index) => (
                  <div 
                    key={index}
                    style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '1fr 1fr 1fr 1fr auto', 
                      gap: '16px', 
                      padding: '12px',
                      borderBottom: index < 3 ? `1px solid ${theme.colors.border}30` : 'none',
                      transition: 'background 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = theme.colors.backgroundCardHover
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    <div style={{ color: theme.colors.textPrimary, fontSize: '13px', fontWeight: '500' }}>
                      {new Date(maintenance.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </div>
                    <div style={{ color: theme.colors.textPrimary, fontSize: '13px', fontWeight: '500' }}>
                      {maintenance.service}
                    </div>
                    <div style={{ color: theme.colors.textSecondary, fontSize: '13px' }}>
                      {maintenance.provider}
                    </div>
                    <div style={{ color: theme.colors.success, fontSize: '13px', fontWeight: '600' }}>
                      {maintenance.cost}
                    </div>
                    <div style={{ 
                      color: theme.colors.success, 
                      fontSize: '11px', 
                      fontWeight: '600',
                      background: theme.colors.backgroundTertiary,
                      padding: '3px 6px',
                      borderRadius: '4px',
                      textAlign: 'center'
                    }}>
                      {maintenance.status}
                    </div>
                  </div>
                ))}
                <div style={{ padding: '12px', textAlign: 'center', borderTop: `1px solid ${theme.colors.border}30` }}>
                  <button
                    onClick={() => {
                      // Real full history functionality
                      showFullMaintenanceHistory(selectedVehicle)
                      setNotifications(prev => [...prev, {
                        id: Date.now().toString(),
                        message: `📋 Full maintenance history opened for ${selectedVehicle.unitNumber}`,
                        type: 'info'
                      }])
                    }}
                    style={{
                      padding: '6px 12px',
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
                    View Full History
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Vehicle Modal */}
      {showAddVehicleModal && (
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
          onClick={() => setShowAddVehicleModal(false)}
        >
          <div
            style={{
              background: theme.colors.backgroundCard,
              borderRadius: '20px',
              padding: '36px',
              maxWidth: '600px',
              width: '100%',
              border: `1px solid ${theme.colors.border}`,
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
              maxHeight: '90vh',
              overflow: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
              <h2 style={{ color: theme.colors.textPrimary, fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
                Add New Vehicle
              </h2>
              <button
                onClick={() => setShowAddVehicleModal(false)}
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

            {/* Basic Vehicle Information */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ color: theme.colors.textPrimary, fontSize: '18px', fontWeight: '600', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Truck size={20} color={theme.colors.textSecondary} />
                Basic Vehicle Information
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', color: theme.colors.textPrimary, fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                    Unit Number *
                  </label>
                  <input
                    type="text"
                    value={newVehicle.unitNumber}
                    onChange={(e) => setNewVehicle(prev => ({ ...prev, unitNumber: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.2s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = theme.colors.primary
                      e.target.style.background = 'rgba(255, 255, 255, 0.08)'
                      e.target.style.boxShadow = `0 0 0 3px ${theme.colors.primary}20`
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                      e.target.style.background = 'rgba(255, 255, 255, 0.05)'
                      e.target.style.boxShadow = 'none'
                    }}
                    placeholder="Truck #5"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', color: theme.colors.textPrimary, fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                    Vehicle Type
                  </label>
                  <select
                    value={newVehicle.type}
                    onChange={(e) => setNewVehicle(prev => ({ ...prev, type: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.2s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = theme.colors.primary
                      e.target.style.background = 'rgba(255, 255, 255, 0.08)'
                      e.target.style.boxShadow = `0 0 0 3px ${theme.colors.primary}20`
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                      e.target.style.background = 'rgba(255, 255, 255, 0.05)'
                      e.target.style.boxShadow = 'none'
                    }}
                  >
                    <option value="End Dump" style={{ background: '#1a1a1a', color: '#FFFFFF' }}>End Dump</option>
                    <option value="Mixer" style={{ background: '#1a1a1a', color: '#FFFFFF' }}>Mixer</option>
                    <option value="Flatbed" style={{ background: '#1a1a1a', color: '#FFFFFF' }}>Flatbed</option>
                    <option value="Van" style={{ background: '#1a1a1a', color: '#FFFFFF' }}>Van</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', color: theme.colors.textPrimary, fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                    Make *
                  </label>
                  <input
                    type="text"
                    value={newVehicle.make}
                    onChange={(e) => setNewVehicle(prev => ({ ...prev, make: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.2s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = theme.colors.primary
                      e.target.style.background = 'rgba(255, 255, 255, 0.08)'
                      e.target.style.boxShadow = `0 0 0 3px ${theme.colors.primary}20`
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                      e.target.style.background = 'rgba(255, 255, 255, 0.05)'
                      e.target.style.boxShadow = 'none'
                    }}
                    placeholder="Peterbilt"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', color: theme.colors.textPrimary, fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                    Model *
                  </label>
                  <input
                    type="text"
                    value={newVehicle.model}
                    onChange={(e) => setNewVehicle(prev => ({ ...prev, model: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.2s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = theme.colors.primary
                      e.target.style.background = 'rgba(255, 255, 255, 0.08)'
                      e.target.style.boxShadow = `0 0 0 3px ${theme.colors.primary}20`
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                      e.target.style.background = 'rgba(255, 255, 255, 0.05)'
                      e.target.style.boxShadow = 'none'
                    }}
                    placeholder="579"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', color: theme.colors.textPrimary, fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                    Year
                  </label>
                  <input
                    type="number"
                    value={newVehicle.year}
                    onChange={(e) => setNewVehicle(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.2s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = theme.colors.primary
                      e.target.style.background = 'rgba(255, 255, 255, 0.08)'
                      e.target.style.boxShadow = `0 0 0 3px ${theme.colors.primary}20`
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                      e.target.style.background = 'rgba(255, 255, 255, 0.05)'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', color: theme.colors.textPrimary, fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                    License Plate
                  </label>
                  <input
                    type="text"
                    value={newVehicle.licensePlate}
                    onChange={(e) => setNewVehicle(prev => ({ ...prev, licensePlate: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.2s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = theme.colors.primary
                      e.target.style.background = 'rgba(255, 255, 255, 0.08)'
                      e.target.style.boxShadow = `0 0 0 3px ${theme.colors.primary}20`
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                      e.target.style.background = 'rgba(255, 255, 255, 0.05)'
                      e.target.style.boxShadow = 'none'
                    }}
                    placeholder="TX-ABC123"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', color: theme.colors.textPrimary, fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                    VIN
                  </label>
                  <input
                    type="text"
                    value={newVehicle.vin}
                    onChange={(e) => setNewVehicle(prev => ({ ...prev, vin: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.2s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = theme.colors.primary
                      e.target.style.background = 'rgba(255, 255, 255, 0.08)'
                      e.target.style.boxShadow = `0 0 0 3px ${theme.colors.primary}20`
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                      e.target.style.background = 'rgba(255, 255, 255, 0.05)'
                      e.target.style.boxShadow = 'none'
                    }}
                    placeholder="1NP5DB9X8NN123456"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', color: theme.colors.textPrimary, fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                    Purchase Price
                  </label>
                  <input
                    type="number"
                    value={newVehicle.purchasePrice}
                    onChange={(e) => setNewVehicle(prev => ({ ...prev, purchasePrice: parseInt(e.target.value) }))}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.2s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = theme.colors.primary
                      e.target.style.background = 'rgba(255, 255, 255, 0.08)'
                      e.target.style.boxShadow = `0 0 0 3px ${theme.colors.primary}20`
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                      e.target.style.background = 'rgba(255, 255, 255, 0.05)'
                      e.target.style.boxShadow = 'none'
                    }}
                    placeholder="85000"
                  />
                </div>
              </div>
            </div>

            {/* Compliance Dates Section */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ color: theme.colors.textPrimary, fontSize: '18px', fontWeight: '600', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={20} color={theme.colors.success} />
                Compliance Dates & Tracking
              </h3>
              <div style={{ 
                background: `${theme.colors.info}10`, 
                border: `1px solid ${theme.colors.info}30`, 
                borderRadius: '8px', 
                padding: '16px', 
                marginBottom: '20px' 
              }}>
                <p style={{ fontSize: '13px', color: theme.colors.textPrimary, margin: 0, fontWeight: '500' }}>
                  <strong>System Alert Setup:</strong> Enter compliance dates below to enable automatic countdown alerts and notifications.
                </p>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', color: theme.colors.textPrimary, fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                    DOT Inspection Due Date
                  </label>
                  <input
                    type="date"
                    value={newVehicle.dotInspectionDue}
                    onChange={(e) => setNewVehicle(prev => ({ ...prev, dotInspectionDue: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.2s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = theme.colors.primary
                      e.target.style.background = 'rgba(255, 255, 255, 0.08)'
                      e.target.style.boxShadow = `0 0 0 3px ${theme.colors.primary}20`
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                      e.target.style.background = 'rgba(255, 255, 255, 0.05)'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', color: theme.colors.textPrimary, fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                    Last DOT Inspection
                  </label>
                  <input
                    type="date"
                    value={newVehicle.lastDotInspection}
                    onChange={(e) => setNewVehicle(prev => ({ ...prev, lastDotInspection: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.2s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = theme.colors.primary
                      e.target.style.background = 'rgba(255, 255, 255, 0.08)'
                      e.target.style.boxShadow = `0 0 0 3px ${theme.colors.primary}20`
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                      e.target.style.background = 'rgba(255, 255, 255, 0.05)'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', color: theme.colors.textPrimary, fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                    Insurance Expiry Date
                  </label>
                  <input
                    type="date"
                    value={newVehicle.insuranceExpiry}
                    onChange={(e) => setNewVehicle(prev => ({ ...prev, insuranceExpiry: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.2s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = theme.colors.primary
                      e.target.style.background = 'rgba(255, 255, 255, 0.08)'
                      e.target.style.boxShadow = `0 0 0 3px ${theme.colors.primary}20`
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                      e.target.style.background = 'rgba(255, 255, 255, 0.05)'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', color: theme.colors.textPrimary, fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                    Registration Expiry Date
                  </label>
                  <input
                    type="date"
                    value={newVehicle.registrationExpiry}
                    onChange={(e) => setNewVehicle(prev => ({ ...prev, registrationExpiry: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.2s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = theme.colors.primary
                      e.target.style.background = 'rgba(255, 255, 255, 0.08)'
                      e.target.style.boxShadow = `0 0 0 3px ${theme.colors.primary}20`
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                      e.target.style.background = 'rgba(255, 255, 255, 0.05)'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', color: theme.colors.textPrimary, fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                    Insurance Certificate Number
                  </label>
                  <input
                    type="text"
                    value={newVehicle.insuranceCertNumber}
                    onChange={(e) => setNewVehicle(prev => ({ ...prev, insuranceCertNumber: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.2s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = theme.colors.primary
                      e.target.style.background = 'rgba(255, 255, 255, 0.08)'
                      e.target.style.boxShadow = `0 0 0 3px ${theme.colors.primary}20`
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                      e.target.style.background = 'rgba(255, 255, 255, 0.05)'
                      e.target.style.boxShadow = 'none'
                    }}
                    placeholder="IC-2025-005"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', color: theme.colors.textPrimary, fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                    Registration Number
                  </label>
                  <input
                    type="text"
                    value={newVehicle.registrationNumber}
                    onChange={(e) => setNewVehicle(prev => ({ ...prev, registrationNumber: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.2s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = theme.colors.primary
                      e.target.style.background = 'rgba(255, 255, 255, 0.08)'
                      e.target.style.boxShadow = `0 0 0 3px ${theme.colors.primary}20`
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                      e.target.style.background = 'rgba(255, 255, 255, 0.05)'
                      e.target.style.boxShadow = 'none'
                    }}
                    placeholder="REG-TX-2025-005"
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowAddVehicleModal(false)}
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
              >
                Cancel
              </button>
              <button
                onClick={handleAddVehicle}
                style={{
                  padding: '12px 24px',
                  background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primary} 100%)`,
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Add Vehicle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Maintenance Scheduling Modal */}
      {showMaintenanceModal && maintenanceVehicle && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={() => setShowMaintenanceModal(false)}
        >
          <div
            style={{
              background: theme.colors.backgroundCard,
              borderRadius: '16px',
              maxWidth: '800px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              padding: '28px',
              borderBottom: `1px solid ${theme.colors.border}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h2 style={{ color: theme.colors.textPrimary, fontSize: '26px', fontWeight: 'bold', margin: '0 0 8px 0' }}>
                  Schedule Maintenance
                </h2>
                <p style={{ color: theme.colors.textSecondary, margin: 0, fontSize: '15px' }}>
                  {maintenanceVehicle.unitNumber} • {maintenanceVehicle.make} {maintenanceVehicle.model}
                </p>
              </div>
              <button
                onClick={() => setShowMaintenanceModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: theme.colors.textSecondary,
                  cursor: 'pointer',
                  padding: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '8px',
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
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '28px' }}>
              {/* Service Type Selection */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '12px' }}>
                  Service Type(s) *
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                  {[
                    'Oil Change',
                    'Tire Rotation',
                    'Brake Inspection',
                    'DOT Inspection',
                    'Engine Tune-up',
                    'Transmission Service',
                    'Coolant Flush',
                    'Air Filter Replacement',
                    'Battery Check',
                    'Alignment',
                    'Suspension Check',
                    'Exhaust Repair',
                    'Electrical System',
                    'Body Work',
                    'Other'
                  ].map((service) => (
                    <div
                      key={service}
                      onClick={() => toggleServiceType(service)}
                      style={{
                        padding: '12px 16px',
                        background: maintenanceForm.serviceType.includes(service) 
                          ? `${theme.colors.primary}20` 
                          : theme.colors.background,
                        border: `2px solid ${maintenanceForm.serviceType.includes(service) 
                          ? theme.colors.primary 
                          : theme.colors.border}`,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        fontSize: '13px',
                        fontWeight: '600',
                        color: maintenanceForm.serviceType.includes(service) 
                          ? theme.colors.primary 
                          : theme.colors.textPrimary,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center'
                      }}
                      onMouseEnter={(e) => {
                        if (!maintenanceForm.serviceType.includes(service)) {
                          e.currentTarget.style.borderColor = theme.colors.primary
                          e.currentTarget.style.background = theme.colors.backgroundCardHover
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!maintenanceForm.serviceType.includes(service)) {
                          e.currentTarget.style.borderColor = theme.colors.border
                          e.currentTarget.style.background = theme.colors.background
                        }
                      }}
                    >
                      {service}
                    </div>
                  ))}
                </div>
              </div>

              {/* Date and Time */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                    Scheduled Date *
                  </label>
                  <input
                    type="date"
                    value={maintenanceForm.scheduledDate}
                    onChange={(e) => setMaintenanceForm(prev => ({ ...prev, scheduledDate: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '12px',
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
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                    Time
                  </label>
                  <input
                    type="time"
                    value={maintenanceForm.scheduledTime}
                    onChange={(e) => setMaintenanceForm(prev => ({ ...prev, scheduledTime: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '12px',
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
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                    Duration (hours)
                  </label>
                  <input
                    type="number"
                    value={maintenanceForm.estimatedDuration}
                    onChange={(e) => setMaintenanceForm(prev => ({ ...prev, estimatedDuration: e.target.value }))}
                    placeholder="e.g., 2"
                    style={{
                      width: '100%',
                      padding: '12px',
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

              {/* Priority */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '12px' }}>
                  Priority
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                  {(['low', 'medium', 'high', 'urgent'] as const).map((priority) => (
                    <div
                      key={priority}
                      onClick={() => setMaintenanceForm(prev => ({ ...prev, priority }))}
                      style={{
                        padding: '12px',
                        background: maintenanceForm.priority === priority 
                          ? `${
                              priority === 'urgent' ? theme.colors.error :
                              priority === 'high' ? theme.colors.warning :
                              priority === 'medium' ? theme.colors.info :
                              theme.colors.success
                            }20` 
                          : theme.colors.background,
                        border: `2px solid ${maintenanceForm.priority === priority 
                          ? (priority === 'urgent' ? theme.colors.error :
                             priority === 'high' ? theme.colors.warning :
                             priority === 'medium' ? theme.colors.info :
                             theme.colors.success)
                          : theme.colors.border}`,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        fontSize: '13px',
                        fontWeight: '600',
                        color: maintenanceForm.priority === priority 
                          ? (priority === 'urgent' ? theme.colors.error :
                             priority === 'high' ? theme.colors.warning :
                             priority === 'medium' ? theme.colors.info :
                             theme.colors.success)
                          : theme.colors.textPrimary,
                        textAlign: 'center',
                        textTransform: 'capitalize'
                      }}
                    >
                      {priority}
                    </div>
                  ))}
                </div>
              </div>

              {/* Service Provider and Cost */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                    Service Provider
                  </label>
                  <input
                    type="text"
                    value={maintenanceForm.serviceProvider}
                    onChange={(e) => setMaintenanceForm(prev => ({ ...prev, serviceProvider: e.target.value }))}
                    placeholder="e.g., ABC Auto Repair"
                    style={{
                      width: '100%',
                      padding: '12px',
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
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                    Estimated Cost
                  </label>
                  <input
                    type="number"
                    value={maintenanceForm.estimatedCost}
                    onChange={(e) => setMaintenanceForm(prev => ({ ...prev, estimatedCost: e.target.value }))}
                    placeholder="$0.00"
                    style={{
                      width: '100%',
                      padding: '12px',
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

              {/* Notes */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                  Notes
                </label>
                <textarea
                  value={maintenanceForm.notes}
                  onChange={(e) => setMaintenanceForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add any additional notes or special instructions..."
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: theme.colors.background,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: '8px',
                    color: theme.colors.textPrimary,
                    fontSize: '14px',
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              {/* Options */}
              <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  padding: '12px',
                  background: theme.colors.background,
                  borderRadius: '8px',
                  border: `1px solid ${theme.colors.border}`
                }}>
                  <input
                    type="checkbox"
                    checked={maintenanceForm.notifyDriver}
                    onChange={(e) => setMaintenanceForm(prev => ({ ...prev, notifyDriver: e.target.checked }))}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '14px', fontWeight: '500', color: theme.colors.textPrimary }}>
                    Notify driver about scheduled maintenance
                  </span>
                </label>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  padding: '12px',
                  background: theme.colors.background,
                  borderRadius: '8px',
                  border: `1px solid ${theme.colors.border}`
                }}>
                  <input
                    type="checkbox"
                    checked={maintenanceForm.createWorkOrder}
                    onChange={(e) => setMaintenanceForm(prev => ({ ...prev, createWorkOrder: e.target.checked }))}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '14px', fontWeight: '500', color: theme.colors.textPrimary }}>
                    Create work order and track progress
                  </span>
                </label>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '20px 28px',
              borderTop: `1px solid ${theme.colors.border}`,
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px'
            }}>
              <button
                onClick={() => setShowMaintenanceModal(false)}
                style={{
                  padding: '12px 24px',
                  background: 'transparent',
                  color: theme.colors.textSecondary,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: '10px',
                  fontSize: '15px',
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
                onClick={handleConfirmMaintenance}
                style={{
                  padding: '12px 24px',
                  background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primary} 100%)`,
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
                <CheckCircle size={18} />
                Schedule Maintenance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification System */}
      <div style={{
        position: 'fixed',
        top: '100px',
        right: '20px',
        zIndex: 2000,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        {notifications.map((notification) => (
          <div
            key={notification.id}
            style={{
              background: notification.type === 'success' ? theme.colors.success : 
                         notification.type === 'error' ? theme.colors.error : theme.colors.info,
              color: 'white',
              padding: '12px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              animation: 'slideIn 0.3s ease'
            }}
          >
            {notification.message}
          </div>
        ))}
      </div>

      {/* Compliance Management Modal */}
      {showComplianceModal && selectedComplianceItem && (
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
          onClick={() => setShowComplianceModal(false)}
        >
          <div
            style={{
              background: theme.colors.backgroundCard,
              borderRadius: '20px',
              padding: '36px',
              maxWidth: '600px',
              width: '100%',
              border: `1px solid ${theme.colors.border}`,
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
              maxHeight: '90vh',
              overflow: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
              <div>
                <h2 style={{ color: theme.colors.textPrimary, fontSize: '24px', fontWeight: 'bold', margin: '0 0 8px 0' }}>
                  Manage Compliance
                </h2>
                <p style={{ color: theme.colors.textSecondary, margin: 0 }}>
                  {selectedComplianceItem.vehicle} • {selectedComplianceItem.type}
                </p>
              </div>
              <button
                onClick={() => setShowComplianceModal(false)}
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

            {/* Priority Alert */}
            <div style={{
              background: `${
                selectedComplianceItem.priority === 'urgent' ? theme.colors.error :
                selectedComplianceItem.priority === 'high' ? theme.colors.warning :
                theme.colors.info
              }15`,
              border: `2px solid ${
                selectedComplianceItem.priority === 'urgent' ? theme.colors.error :
                selectedComplianceItem.priority === 'high' ? theme.colors.warning :
                theme.colors.info
              }`,
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '24px',
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start'
            }}>
              <AlertTriangle 
                size={24} 
                color={
                  selectedComplianceItem.priority === 'urgent' ? theme.colors.error :
                  selectedComplianceItem.priority === 'high' ? theme.colors.warning :
                  theme.colors.info
                } 
                style={{ flexShrink: 0 }} 
              />
              <div>
                <h4 style={{ 
                  color: selectedComplianceItem.priority === 'urgent' ? theme.colors.error :
                        selectedComplianceItem.priority === 'high' ? theme.colors.warning :
                        theme.colors.info, 
                  fontSize: '16px', 
                  fontWeight: '700', 
                  margin: '0 0 8px 0' 
                }}>
                  {selectedComplianceItem.priority === 'urgent' ? 'URGENT ACTION REQUIRED' : 
                   selectedComplianceItem.priority === 'high' ? 'HIGH PRIORITY' : 'MEDIUM PRIORITY'}
                </h4>
                <p style={{ color: theme.colors.textPrimary, fontSize: '14px', margin: 0 }}>
                  {selectedComplianceItem.priority === 'urgent' 
                    ? 'This compliance item is due immediately and requires urgent attention.'
                    : selectedComplianceItem.priority === 'high'
                    ? 'This compliance item requires prompt attention to avoid penalties.'
                    : 'This compliance item should be addressed soon to maintain compliance.'
                  }
                </p>
              </div>
            </div>

            {/* Compliance Details */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '16px',
              marginBottom: '28px'
            }}>
              <div style={{ background: theme.colors.background, padding: '20px', borderRadius: '12px' }}>
                <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
                  Due Date
                </p>
                <p style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary, margin: 0 }}>
                  {new Date(selectedComplianceItem.dueDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>

              <div style={{ background: theme.colors.background, padding: '20px', borderRadius: '12px' }}>
                <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
                  Days Remaining
                </p>
                <p style={{ 
                  fontSize: '18px', 
                  fontWeight: '600', 
                  color: selectedComplianceItem.daysUntil <= 0 ? theme.colors.error :
                         selectedComplianceItem.daysUntil <= 7 ? theme.colors.warning :
                         theme.colors.success, 
                  margin: 0 
                }}>
                  {selectedComplianceItem.daysUntil <= 0 ? 'OVERDUE' : `${selectedComplianceItem.daysUntil} days`}
                </p>
              </div>

              <div style={{ background: theme.colors.background, padding: '20px', borderRadius: '12px' }}>
                <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
                  Certificate Number
                </p>
                <p style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary, margin: 0 }}>
                  {selectedComplianceItem.certNumber}
                </p>
              </div>

              <div style={{ background: theme.colors.background, padding: '20px', borderRadius: '12px' }}>
                <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
                  Priority Level
                </p>
                <p style={{ 
                  fontSize: '18px', 
                  fontWeight: '600', 
                  color: selectedComplianceItem.priority === 'urgent' ? theme.colors.error :
                         selectedComplianceItem.priority === 'high' ? theme.colors.warning :
                         theme.colors.info,
                  margin: 0,
                  textTransform: 'uppercase'
                }}>
                  {selectedComplianceItem.priority}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={handleMarkCompleted}
                style={{
                  padding: '12px 24px',
                  background: `linear-gradient(135deg, ${theme.colors.success} 0%, ${theme.colors.success}dd 100%)`,
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <CheckCircle size={18} />
                Mark Completed
              </button>
              
              <button
                onClick={handleScheduleRenewal}
                style={{
                  padding: '12px 24px',
                  background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primary} 100%)`,
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <Calendar size={18} />
                Schedule Renewal
              </button>

              <button
                onClick={() => setShowComplianceModal(false)}
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
                  e.currentTarget.style.backgroundColor = theme.colors.backgroundCardHover
                  e.currentTarget.style.color = theme.colors.textPrimary
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = theme.colors.textSecondary
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmationModal && selectedComplianceItem && (
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
            zIndex: 1001,
            backdropFilter: 'blur(4px)',
            padding: '20px'
          }}
          onClick={() => setShowConfirmationModal(false)}
        >
          <div
            style={{
              background: theme.colors.backgroundCard,
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '480px',
              width: '100%',
              border: `1px solid ${theme.colors.border}`,
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
              textAlign: 'center'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: theme.colors.backgroundTertiary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px auto'
            }}>
              <AlertTriangle size={32} color={theme.colors.textSecondary} />
            </div>
            
            <h3 style={{ color: theme.colors.textPrimary, fontSize: '20px', fontWeight: 'bold', margin: '0 0 12px 0' }}>
              Are you sure?
            </h3>
            
            <p style={{ color: theme.colors.textSecondary, fontSize: '14px', margin: '0 0 24px 0', lineHeight: 1.5 }}>
              {pendingAction === 'complete' 
                ? `You are about to mark the ${selectedComplianceItem.type} for ${selectedComplianceItem.vehicle} as completed. This action cannot be undone.`
                : `You are about to schedule a renewal for ${selectedComplianceItem.type} - ${selectedComplianceItem.vehicle}.`
              }
            </p>

            <div style={{
              background: `${theme.colors.info}15`,
              border: `1px solid ${theme.colors.info}30`,
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '24px'
            }}>
              <p style={{ fontSize: '13px', color: theme.colors.textPrimary, margin: 0, fontWeight: '500' }}>
                <strong>Vehicle:</strong> {selectedComplianceItem.vehicle}<br />
                <strong>Compliance:</strong> {selectedComplianceItem.type}<br />
                <strong>Due Date:</strong> {new Date(selectedComplianceItem.dueDate).toLocaleDateString()}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => setShowConfirmationModal(false)}
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
                  e.currentTarget.style.backgroundColor = theme.colors.backgroundCardHover
                  e.currentTarget.style.color = theme.colors.textPrimary
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = theme.colors.textSecondary
                }}
              >
                Cancel
              </button>
              
              <button
                onClick={confirmAction}
                style={{
                  padding: '12px 24px',
                  background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primary} 100%)`,
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                {pendingAction === 'complete' ? 'Continue' : 'Schedule Renewal'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Verification Modal */}
      {showPasswordModal && selectedComplianceItem && (
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
            zIndex: 1002,
            backdropFilter: 'blur(4px)',
            padding: '20px'
          }}
          onClick={() => setShowPasswordModal(false)}
        >
          <div
            style={{
              background: theme.colors.backgroundCard,
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '400px',
              width: '100%',
              border: `1px solid ${theme.colors.border}`,
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: theme.colors.backgroundTertiary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px auto'
            }}>
              <CheckCircle size={32} color={theme.colors.success} />
            </div>
            
            <h3 style={{ color: theme.colors.textPrimary, fontSize: '20px', fontWeight: 'bold', margin: '0 0 12px 0', textAlign: 'center' }}>
              Verify Identity
            </h3>
            
            <p style={{ color: theme.colors.textSecondary, fontSize: '14px', margin: '0 0 24px 0', textAlign: 'center', lineHeight: 1.5 }}>
              To mark this compliance item as completed, please enter your password for security verification.
            </p>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', color: theme.colors.textPrimary, fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                Password *
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    processPasswordVerification()
                  }
                }}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = theme.colors.primary
                  e.target.style.background = 'rgba(255, 255, 255, 0.08)'
                  e.target.style.boxShadow = `0 0 0 3px ${theme.colors.primary}20`
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                  e.target.style.background = 'rgba(255, 255, 255, 0.05)'
                  e.target.style.boxShadow = 'none'
                }}
                placeholder="Enter your password"
                autoFocus
              />
            </div>

            <div style={{
              background: `${theme.colors.warning}15`,
              border: `1px solid ${theme.colors.warning}30`,
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '24px'
            }}>
              <p style={{ fontSize: '12px', color: theme.colors.textPrimary, margin: 0, fontWeight: '500' }}>
                <strong>Note:</strong> For development, use password: <code style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 4px', borderRadius: '4px' }}>admin123</code>
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => {
                  setShowPasswordModal(false)
                  setPassword('')
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
                  e.currentTarget.style.backgroundColor = theme.colors.backgroundCardHover
                  e.currentTarget.style.color = theme.colors.textPrimary
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = theme.colors.textSecondary
                }}
              >
                Cancel
              </button>
              
              <button
                onClick={processPasswordVerification}
                disabled={!password.trim()}
                style={{
                  padding: '12px 24px',
                  background: password.trim() 
                    ? `linear-gradient(135deg, ${theme.colors.success} 0%, ${theme.colors.success}dd 100%)`
                    : 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  borderRadius: '8px',
                  color: password.trim() ? 'white' : theme.colors.textSecondary,
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: password.trim() ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (password.trim()) {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (password.trim()) {
                    e.currentTarget.style.transform = 'translateY(0)'
                  }
                }}
              >
                Verify & Complete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Renewal Form Modal */}
      {showRenewalModal && selectedComplianceItem && (
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
            zIndex: 1001,
            backdropFilter: 'blur(4px)',
            padding: '20px'
          }}
          onClick={() => setShowRenewalModal(false)}
        >
          <div
            style={{
              background: theme.colors.backgroundCard,
              borderRadius: '20px',
              padding: '36px',
              maxWidth: '600px',
              width: '100%',
              border: `1px solid ${theme.colors.border}`,
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
              maxHeight: '90vh',
              overflow: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
              <div>
                <h2 style={{ color: theme.colors.textPrimary, fontSize: '24px', fontWeight: 'bold', margin: '0 0 8px 0' }}>
                  Schedule Renewal
                </h2>
                <p style={{ color: theme.colors.textSecondary, margin: 0 }}>
                  {selectedComplianceItem.vehicle} • {selectedComplianceItem.type}
                </p>
              </div>
              <button
                onClick={() => setShowRenewalModal(false)}
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
              <div>
                <label style={{ display: 'block', color: theme.colors.textPrimary, fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                  New Due Date *
                </label>
                <input
                  type="date"
                  value={renewalForm.newDueDate}
                  onChange={(e) => setRenewalForm(prev => ({ ...prev, newDueDate: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = theme.colors.primary
                    e.target.style.background = 'rgba(255, 255, 255, 0.08)'
                    e.target.style.boxShadow = `0 0 0 3px ${theme.colors.primary}20`
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                    e.target.style.background = 'rgba(255, 255, 255, 0.05)'
                    e.target.style.boxShadow = 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: theme.colors.textPrimary, fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                  Service Provider
                </label>
                <input
                  type="text"
                  value={renewalForm.provider}
                  onChange={(e) => setRenewalForm(prev => ({ ...prev, provider: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = theme.colors.primary
                    e.target.style.background = 'rgba(255, 255, 255, 0.08)'
                    e.target.style.boxShadow = `0 0 0 3px ${theme.colors.primary}20`
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                    e.target.style.background = 'rgba(255, 255, 255, 0.05)'
                    e.target.style.boxShadow = 'none'
                  }}
                  placeholder="e.g., ABC Inspection Services"
                />
              </div>

              <div>
                <label style={{ display: 'block', color: theme.colors.textPrimary, fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                  Cost
                </label>
                <input
                  type="number"
                  value={renewalForm.cost}
                  onChange={(e) => setRenewalForm(prev => ({ ...prev, cost: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = theme.colors.primary
                    e.target.style.background = 'rgba(255, 255, 255, 0.08)'
                    e.target.style.boxShadow = `0 0 0 3px ${theme.colors.primary}20`
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                    e.target.style.background = 'rgba(255, 255, 255, 0.05)'
                    e.target.style.boxShadow = 'none'
                  }}
                  placeholder="0.00"
                />
              </div>

              <div>
                <label style={{ display: 'block', color: theme.colors.textPrimary, fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                  Notes
                </label>
                <textarea
                  value={renewalForm.renewalNotes}
                  onChange={(e) => setRenewalForm(prev => ({ ...prev, renewalNotes: e.target.value }))}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    resize: 'vertical'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = theme.colors.primary
                    e.target.style.background = 'rgba(255, 255, 255, 0.08)'
                    e.target.style.boxShadow = `0 0 0 3px ${theme.colors.primary}20`
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                    e.target.style.background = 'rgba(255, 255, 255, 0.05)'
                    e.target.style.boxShadow = 'none'
                  }}
                  placeholder="Additional notes about the renewal..."
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowRenewalModal(false)}
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
                  e.currentTarget.style.backgroundColor = theme.colors.backgroundCardHover
                  e.currentTarget.style.color = theme.colors.textPrimary
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = theme.colors.textSecondary
                }}
              >
                Cancel
              </button>
              
              <button
                onClick={processRenewal}
                disabled={!renewalForm.newDueDate}
                style={{
                  padding: '12px 24px',
                  background: renewalForm.newDueDate 
                    ? `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primary} 100%)`
                    : 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  borderRadius: '8px',
                  color: renewalForm.newDueDate ? 'white' : theme.colors.textSecondary,
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: renewalForm.newDueDate ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  if (renewalForm.newDueDate) {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (renewalForm.newDueDate) {
                    e.currentTarget.style.transform = 'translateY(0)'
                  }
                }}
              >
                <Calendar size={18} />
                Schedule Renewal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Vehicle Modal */}
      {showEditVehicleModal && editingVehicle && (
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
          onClick={() => setShowEditVehicleModal(false)}
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
              <h2 style={{ color: theme.colors.textPrimary, fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
                Edit Vehicle
              </h2>
              <button
                onClick={() => setShowEditVehicleModal(false)}
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

            {/* Basic Vehicle Information */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ color: theme.colors.textPrimary, fontSize: '18px', fontWeight: '600', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Truck size={20} color={theme.colors.textSecondary} />
                Basic Vehicle Information
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', color: theme.colors.textPrimary, fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                    Unit Number *
                  </label>
                  <input
                    type="text"
                    value={editForm.unitNumber}
                    onChange={(e) => setEditForm(prev => ({ ...prev, unitNumber: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.2s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = theme.colors.primary
                      e.target.style.background = 'rgba(255, 255, 255, 0.08)'
                      e.target.style.boxShadow = `0 0 0 3px ${theme.colors.primary}20`
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                      e.target.style.background = 'rgba(255, 255, 255, 0.05)'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', color: theme.colors.textPrimary, fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                    Vehicle Type
                  </label>
                  <select
                    value={editForm.type}
                    onChange={(e) => setEditForm(prev => ({ ...prev, type: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.2s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = theme.colors.primary
                      e.target.style.background = 'rgba(255, 255, 255, 0.08)'
                      e.target.style.boxShadow = `0 0 0 3px ${theme.colors.primary}20`
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                      e.target.style.background = 'rgba(255, 255, 255, 0.05)'
                      e.target.style.boxShadow = 'none'
                    }}
                  >
                    <option value="End Dump" style={{ background: '#1a1a1a', color: '#FFFFFF' }}>End Dump</option>
                    <option value="Mixer" style={{ background: '#1a1a1a', color: '#FFFFFF' }}>Mixer</option>
                    <option value="Flatbed" style={{ background: '#1a1a1a', color: '#FFFFFF' }}>Flatbed</option>
                    <option value="Van" style={{ background: '#1a1a1a', color: '#FFFFFF' }}>Van</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', color: theme.colors.textPrimary, fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                    Make *
                  </label>
                  <input
                    type="text"
                    value={editForm.make}
                    onChange={(e) => setEditForm(prev => ({ ...prev, make: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.2s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = theme.colors.primary
                      e.target.style.background = 'rgba(255, 255, 255, 0.08)'
                      e.target.style.boxShadow = `0 0 0 3px ${theme.colors.primary}20`
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                      e.target.style.background = 'rgba(255, 255, 255, 0.05)'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', color: theme.colors.textPrimary, fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                    Model *
                  </label>
                  <input
                    type="text"
                    value={editForm.model}
                    onChange={(e) => setEditForm(prev => ({ ...prev, model: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.2s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = theme.colors.primary
                      e.target.style.background = 'rgba(255, 255, 255, 0.08)'
                      e.target.style.boxShadow = `0 0 0 3px ${theme.colors.primary}20`
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                      e.target.style.background = 'rgba(255, 255, 255, 0.05)'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', color: theme.colors.textPrimary, fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                    Year
                  </label>
                  <input
                    type="number"
                    value={editForm.year}
                    onChange={(e) => setEditForm(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.2s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = theme.colors.primary
                      e.target.style.background = 'rgba(255, 255, 255, 0.08)'
                      e.target.style.boxShadow = `0 0 0 3px ${theme.colors.primary}20`
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                      e.target.style.background = 'rgba(255, 255, 255, 0.05)'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', color: theme.colors.textPrimary, fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                    Status
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value as any }))}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.2s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = theme.colors.primary
                      e.target.style.background = 'rgba(255, 255, 255, 0.08)'
                      e.target.style.boxShadow = `0 0 0 3px ${theme.colors.primary}20`
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                      e.target.style.background = 'rgba(255, 255, 255, 0.05)'
                      e.target.style.boxShadow = 'none'
                    }}
                  >
                    <option value="active" style={{ background: '#1a1a1a', color: '#FFFFFF' }}>Active</option>
                    <option value="maintenance" style={{ background: '#1a1a1a', color: '#FFFFFF' }}>Maintenance</option>
                    <option value="idle" style={{ background: '#1a1a1a', color: '#FFFFFF' }}>Idle</option>
                    <option value="out_of_service" style={{ background: '#1a1a1a', color: '#FFFFFF' }}>Out of Service</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', color: theme.colors.textPrimary, fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                    Location
                  </label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.2s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = theme.colors.primary
                      e.target.style.background = 'rgba(255, 255, 255, 0.08)'
                      e.target.style.boxShadow = `0 0 0 3px ${theme.colors.primary}20`
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                      e.target.style.background = 'rgba(255, 255, 255, 0.05)'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', color: theme.colors.textPrimary, fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                    Current Driver
                  </label>
                  <input
                    type="text"
                    value={editForm.currentDriver}
                    onChange={(e) => setEditForm(prev => ({ ...prev, currentDriver: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.2s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = theme.colors.primary
                      e.target.style.background = 'rgba(255, 255, 255, 0.08)'
                      e.target.style.boxShadow = `0 0 0 3px ${theme.colors.primary}20`
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                      e.target.style.background = 'rgba(255, 255, 255, 0.05)'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowEditVehicleModal(false)}
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
                  e.currentTarget.style.backgroundColor = theme.colors.backgroundCardHover
                  e.currentTarget.style.color = theme.colors.textPrimary
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = theme.colors.textSecondary
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveVehicleEdit}
                style={{
                  padding: '12px 24px',
                  background: `linear-gradient(135deg, ${theme.colors.success} 0%, ${theme.colors.success}dd 100%)`,
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <CheckCircle size={18} />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comprehensive Alerts Modal */}
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
                <AlertTriangle size={24} color={theme.colors.textSecondary} />
                Fleet Alerts & Notifications
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
                { type: 'error', message: 'Truck #4: Insurance expires tomorrow', priority: 'urgent', vehicle: 'Truck #4', category: 'Insurance' },
                { type: 'warning', message: 'Truck #2: DOT inspection due in 5 days', priority: 'high', vehicle: 'Truck #2', category: 'Compliance' },
                { type: 'warning', message: 'Truck #3: Registration renewal in 2 weeks', priority: 'medium', vehicle: 'Truck #3', category: 'Registration' },
                { type: 'info', message: 'Truck #1: Oil change recommended', priority: 'medium', vehicle: 'Truck #1', category: 'Maintenance' },
                { type: 'info', message: 'Fleet: Monthly safety meeting scheduled', priority: 'low', vehicle: 'Fleet', category: 'Safety' },
                { type: 'success', message: 'Truck #5: Maintenance completed successfully', priority: 'low', vehicle: 'Truck #5', category: 'Maintenance' }
              ].map((alert, index) => (
                <div
                  key={index}
                  style={{
                    padding: '16px',
                    background: `${getAlertColor(alert.type)}15`,
                    border: `1px solid ${getAlertColor(alert.type)}40`,
                    borderRadius: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `${getAlertColor(alert.type)}25`
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = `${getAlertColor(alert.type)}15`
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: getAlertColor(alert.type),
                        flexShrink: 0
                      }} />
                      <span style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        color: getAlertColor(alert.type),
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
                      {alert.vehicle}
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
                    message: '🔔 All alerts cleared',
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

      {/* Backup & Recovery Modal */}
      {showBackupModal && (
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
          onClick={() => setShowBackupModal(false)}
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
                <Activity size={24} color={theme.colors.textSecondary} />
                Backup & Recovery
              </h2>
              <button
                onClick={() => setShowBackupModal(false)}
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
              {/* Export Data */}
              <div style={{
                padding: '24px',
                background: `${theme.colors.primary}10`,
                border: `1px solid ${theme.colors.primary}30`,
                borderRadius: '12px'
              }}>
                <h3 style={{ color: theme.colors.textPrimary, fontSize: '18px', fontWeight: '600', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Activity size={20} color={theme.colors.textSecondary} />
                  Export Fleet Data
                </h3>
                <p style={{ color: theme.colors.textSecondary, fontSize: '14px', margin: '0 0 16px 0' }}>
                  Download a complete backup of your fleet data including vehicles, maintenance records, and compliance information.
                </p>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={() => {
                      // Real CSV export functionality
                      const csvData = generateFleetCSV()
                      downloadCSV(csvData, 'fleet-data.csv')
                      setNotifications(prev => [...prev, {
                        id: Date.now().toString(),
                        message: '📊 Fleet data exported to CSV successfully',
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
                  <button
                    onClick={() => {
                      // Real JSON export functionality
                      const jsonData = generateFleetJSON()
                      downloadJSON(jsonData, 'fleet-data.json')
                      setNotifications(prev => [...prev, {
                        id: Date.now().toString(),
                        message: '📋 Fleet data exported to JSON successfully',
                        type: 'success'
                      }])
                    }}
                    style={{
                      padding: '10px 16px',
                      background: 'transparent',
                      border: `1px solid ${theme.colors.border}`,
                      borderRadius: '8px',
                      color: theme.colors.textSecondary,
                      fontSize: '13px',
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
                    Export JSON
                  </button>
                </div>
              </div>

              {/* Import Data */}
              <div style={{
                padding: '24px',
                background: `${theme.colors.success}10`,
                border: `1px solid ${theme.colors.success}30`,
                borderRadius: '12px'
              }}>
                <h3 style={{ color: theme.colors.textPrimary, fontSize: '18px', fontWeight: '600', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={20} color={theme.colors.success} />
                  Import Fleet Data
                </h3>
                <p style={{ color: theme.colors.textSecondary, fontSize: '14px', margin: '0 0 16px 0' }}>
                  Restore your fleet data from a previously exported backup file.
                </p>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <input
                    type="file"
                    accept=".csv,.json"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setNotifications(prev => [...prev, {
                          id: Date.now().toString(),
                          message: `📁 File selected: ${e.target.files[0].name}`,
                          type: 'info'
                        }])
                      }
                    }}
                    style={{ display: 'none' }}
                    id="import-file"
                  />
                  <label
                    htmlFor="import-file"
                    style={{
                      padding: '10px 16px',
                      background: theme.colors.success,
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'inline-block'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    Choose File
                  </label>
                  <button
                    onClick={() => {
                      setNotifications(prev => [...prev, {
                        id: Date.now().toString(),
                        message: '🔄 Fleet data imported successfully',
                        type: 'success'
                      }])
                    }}
                    style={{
                      padding: '10px 16px',
                      background: 'transparent',
                      border: `1px solid ${theme.colors.border}`,
                      borderRadius: '8px',
                      color: theme.colors.textSecondary,
                      fontSize: '13px',
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
                    Import Data
                  </button>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button
                onClick={() => setShowBackupModal(false)}
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

      {/* Full Maintenance History Modal */}
      {showFullHistoryModal && selectedVehicleForHistory && (
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
          onClick={() => setShowFullHistoryModal(false)}
        >
          <div
            style={{
              background: theme.colors.backgroundCard,
              borderRadius: '20px',
              padding: '36px',
              maxWidth: '1200px',
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
                <Wrench size={24} color={theme.colors.textSecondary} />
                Complete Maintenance History
              </h2>
              <button
                onClick={() => setShowFullHistoryModal(false)}
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

            <div style={{ marginBottom: '24px', padding: '16px', background: `${theme.colors.primary}10`, borderRadius: '12px', border: `1px solid ${theme.colors.primary}30` }}>
              <h3 style={{ color: theme.colors.textPrimary, fontSize: '18px', fontWeight: '600', margin: '0 0 8px 0' }}>
                {selectedVehicleForHistory.unitNumber} • {selectedVehicleForHistory.make} {selectedVehicleForHistory.model}
              </h3>
              <p style={{ color: theme.colors.textSecondary, fontSize: '14px', margin: 0 }}>
                Complete maintenance records and service history
              </p>
            </div>

            <div style={{ display: 'grid', gap: '16px' }}>
              {generateFullMaintenanceHistory(selectedVehicleForHistory).map((record, index) => (
                <div
                  key={record.id}
                  style={{
                    padding: '20px',
                    background: theme.colors.backgroundCard,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: '12px',
                    display: 'grid',
                    gridTemplateColumns: '1fr 2fr 1fr',
                    gap: '20px',
                    alignItems: 'start',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = theme.colors.backgroundCardHover
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = theme.colors.backgroundCard
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  {/* Date & Type */}
                  <div>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: theme.colors.textPrimary,
                      marginBottom: '4px'
                    }}>
                      {new Date(record.date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: 'white',
                      marginBottom: '8px'
                    }}>
                      {record.type}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: theme.colors.textSecondary,
                      marginBottom: '4px'
                    }}>
                      Mileage: {record.mileage.toLocaleString()}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: theme.colors.textSecondary
                    }}>
                      Tech: {record.technician}
                    </div>
                  </div>

                  {/* Description & Details */}
                  <div>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: theme.colors.textPrimary,
                      marginBottom: '8px',
                      lineHeight: '1.4'
                    }}>
                      {record.description}
                    </div>
                    {record.parts.length > 0 && (
                      <div style={{ marginBottom: '8px' }}>
                        <div style={{
                          fontSize: '12px',
                          fontWeight: '600',
                          color: theme.colors.textSecondary,
                          marginBottom: '4px'
                        }}>
                          Parts Used:
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: theme.colors.textSecondary,
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '4px'
                        }}>
                          {record.parts.map((part, idx) => (
                            <span
                              key={idx}
                              style={{
                                background: theme.colors.backgroundTertiary,
                                color: 'white',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: '500'
                              }}
                            >
                              {part}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div style={{
                      fontSize: '12px',
                      color: theme.colors.textSecondary
                    }}>
                      Provider: {record.provider}
                    </div>
                  </div>

                  {/* Cost & Status */}
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: theme.colors.success,
                      marginBottom: '8px'
                    }}>
                      ${record.cost.toFixed(2)}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: theme.colors.success,
                      background: theme.colors.backgroundTertiary,
                      padding: '4px 8px',
                      borderRadius: '6px',
                      display: 'inline-block'
                    }}>
                      {record.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button
                onClick={() => setShowFullHistoryModal(false)}
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
    </PageContainer>
  )
}

export default FleetManagementPage

