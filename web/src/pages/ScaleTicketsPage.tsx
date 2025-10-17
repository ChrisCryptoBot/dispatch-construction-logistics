import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { scaleTicketsAPI } from '../services/api'
import { Upload, Scale, CheckCircle, AlertTriangle, Clock, Eye, FileText, X, Camera, RefreshCw, Check, AlertCircle, ChevronDown, ChevronUp, Trash2, Edit2, Save, Loader, ArrowUpDown, MapPin, User, Square, CheckSquare } from 'lucide-react'
import { formatNumber, formatCurrency, formatCompactCurrency, formatPercentage } from '../utils/formatters';

interface OCRField {
  value: string
  confidence: number
  isEditing: boolean
}

interface ScaleTicket {
  id: string
  ticketNumber: string
  location: string
  date: string
  grossWeight: number
  tareWeight: number
  netWeight: number
  commodity: string
  driver: string
  status: 'pending' | 'processing' | 'ocr_complete' | 'verified' | 'failed' | 'mismatch_alert'
  imageUrl?: string
  ocrData?: {
    ticketNumber: OCRField
    grossWeight: OCRField
    tareWeight: OCRField
    netWeight: OCRField
    location: OCRField
    date: OCRField
    commodity: OCRField
  }
  calculatedNetWeight?: number
  hasMismatch?: boolean
  mismatchDetails?: string
  processingProgress?: number
}

const ScaleTicketsPage = () => {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [tickets, setTickets] = useState<ScaleTicket[]>([])
  const [selectedTicket, setSelectedTicket] = useState<ScaleTicket | null>(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [uploadingFile, setUploadingFile] = useState<File | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [expandedTickets, setExpandedTickets] = useState<Set<string>>(new Set())
  
  // Enhanced analytics state
  const [dateRange, setDateRange] = useState<{start: string, end: string}>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([])
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'weight' | 'status' | 'confidence' | 'driver'>('date')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    // Initialize with mock tickets showing various states
    const mockTickets: ScaleTicket[] = [
      {
        id: '1',
        ticketNumber: 'ST-001234',
        location: 'Dallas Quarry',
        date: '2025-01-07',
        grossWeight: 45.6,
        tareWeight: 20.3,
        netWeight: 25.3,
        commodity: 'Crushed Stone',
        driver: 'John Smith',
        status: 'verified',
        imageUrl: '/mock-ticket-1.jpg'
      },
      {
        id: '2',
        ticketNumber: 'ST-001235',
        location: 'Site D',
        date: '2025-01-07',
        grossWeight: 32.1,
        tareWeight: 23.4,
        netWeight: 8.8,
        commodity: 'Ready-Mix Concrete',
        driver: 'Sarah Johnson',
        status: 'mismatch_alert',
        calculatedNetWeight: 8.7,
        hasMismatch: true,
        mismatchDetails: 'Calculated net weight (8.7t) differs from OCR net weight (8.8t) by 0.1t',
        imageUrl: '/mock-ticket-2.jpg'
      },
      {
        id: '3',
        ticketNumber: 'ST-001236',
        location: 'Municipal Dump',
        date: '2025-01-06',
        grossWeight: 38.2,
        tareWeight: 26.1,
        netWeight: 12.1,
        commodity: 'Construction Debris',
        driver: 'Mike Rodriguez',
        status: 'ocr_complete',
        calculatedNetWeight: 12.1,
        imageUrl: '/mock-ticket-3.jpg',
        ocrData: {
          ticketNumber: { value: 'ST-001236', confidence: 98, isEditing: false },
          grossWeight: { value: '38.2', confidence: 95, isEditing: false },
          tareWeight: { value: '26.1', confidence: 97, isEditing: false },
          netWeight: { value: '12.1', confidence: 99, isEditing: false },
          location: { value: 'Municipal Dump', confidence: 92, isEditing: false },
          date: { value: '2025-01-06', confidence: 96, isEditing: false },
          commodity: { value: 'Construction Debris', confidence: 88, isEditing: false }
        }
      },
      {
        id: '4',
        ticketNumber: 'ST-001237',
        location: 'Plant C',
        date: '2025-01-06',
        grossWeight: 52.8,
        tareWeight: 28.9,
        netWeight: 23.9,
        commodity: 'Sand',
        driver: 'David Chen',
        status: 'pending',
        imageUrl: '/mock-ticket-4.jpg'
      }
    ]
    setTickets(mockTickets)
  }, [])

  // Simulated OCR Processing
  const processOCR = async (file: File): Promise<ScaleTicket> => {
    // Simulate OCR processing delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Mock OCR extracted data
    const mockOCRData = {
      ticketNumber: { value: `ST-${Math.floor(Math.random() * 900000 + 100000)}`, confidence: 96, isEditing: false },
      grossWeight: { value: (Math.random() * 30 + 30).toFixed(1), confidence: 94, isEditing: false },
      tareWeight: { value: (Math.random() * 10 + 20).toFixed(1), confidence: 95, isEditing: false },
      netWeight: { value: '0', confidence: 0, isEditing: false }, // Will be calculated
      location: { value: ['Dallas Quarry', 'Site D', 'Municipal Dump', 'Plant C'][Math.floor(Math.random() * 4)], confidence: 89, isEditing: false },
      date: { value: new Date().toISOString().split('T')[0], confidence: 97, isEditing: false },
      commodity: { value: ['Crushed Stone', 'Sand', 'Gravel', 'Concrete'][Math.floor(Math.random() * 4)], confidence: 91, isEditing: false }
    }

    const gross = parseFloat(mockOCRData.grossWeight.value)
    const tare = parseFloat(mockOCRData.tareWeight.value)
    const calculatedNet = gross - tare
    
    // Add small random variance to simulate OCR mismatch
    const ocrNet = calculatedNet + (Math.random() > 0.7 ? (Math.random() * 0.3 - 0.15) : 0)
    mockOCRData.netWeight.value = formatNumber(ocrNet, "0")
    mockOCRData.netWeight.confidence = 93

    const hasMismatch = Math.abs(calculatedNet - ocrNet) > 0.05

    const newTicket: ScaleTicket = {
      id: Date.now().toString(),
      ticketNumber: mockOCRData.ticketNumber.value,
      location: mockOCRData.location.value,
      date: mockOCRData.date.value,
      grossWeight: gross,
      tareWeight: tare,
      netWeight: ocrNet,
      commodity: mockOCRData.commodity.value,
      driver: 'Assigned Driver',
      status: hasMismatch ? 'mismatch_alert' : 'ocr_complete',
      imageUrl: URL.createObjectURL(file),
      ocrData: mockOCRData,
      calculatedNetWeight: calculatedNet,
      hasMismatch,
      mismatchDetails: hasMismatch ? `Calculated net weight (${formatNumber(calculatedNet, "0")}t) differs from OCR net weight (${formatNumber(ocrNet, "0")}t) by ${Math.abs(calculatedNet - ocrNet).toFixed(2)}t` : undefined
    }

    return newTicket
  }

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }

    setUploadingFile(file)
    
    // Add ticket with processing status
    const processingTicket: ScaleTicket = {
      id: Date.now().toString(),
      ticketNumber: 'Processing...',
      location: 'Processing...',
      date: new Date().toISOString().split('T')[0],
      grossWeight: 0,
      tareWeight: 0,
      netWeight: 0,
      commodity: 'Processing...',
      driver: 'Processing...',
      status: 'processing',
      processingProgress: 0
    }

    setTickets(prev => [processingTicket, ...prev])
    setShowUploadModal(false)

    // Simulate processing progress
    const progressInterval = setInterval(() => {
      setTickets(prev => prev.map(t => 
        t.id === processingTicket.id && t.processingProgress !== undefined
          ? { ...t, processingProgress: Math.min(t.processingProgress + 15, 90) }
          : t
      ))
    }, 300)

    try {
      const processedTicket = await processOCR(file)
      clearInterval(progressInterval)
      
      setTickets(prev => prev.map(t => 
        t.id === processingTicket.id ? processedTicket : t
      ))
      
      // Auto-open the processed ticket
      setSelectedTicket(processedTicket)
    } catch (error) {
      clearInterval(progressInterval)
      setTickets(prev => prev.map(t => 
        t.id === processingTicket.id 
          ? { ...t, status: 'failed' as const, processingProgress: 0 }
          : t
      ))
    }

    setUploadingFile(null)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }

  const verifyTicket = (ticketId: string) => {
    setTickets(prev => prev.map(t => 
      t.id === ticketId ? { ...t, status: 'verified' as const, hasMismatch: false } : t
    ))
    setSelectedTicket(null)
  }

  const deleteTicket = (ticketId: string) => {
    setTickets(prev => prev.filter(t => t.id !== ticketId))
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket(null)
    }
  }

  const toggleExpand = (ticketId: string) => {
    setExpandedTickets(prev => {
      const newSet = new Set(prev)
      if (newSet.has(ticketId)) {
        newSet.delete(ticketId)
      } else {
        newSet.add(ticketId)
      }
      return newSet
    })
  }

  const getStatusColor = (status: string) => {
    const statusColors = {
      verified: theme.colors.success,
      ocr_complete: theme.colors.info,
      pending: theme.colors.textSecondary,
      processing: theme.colors.warning,
      failed: theme.colors.error,
      mismatch_alert: theme.colors.error
    }
    return statusColors[status] || theme.colors.textSecondary
  }

  const getStatusIcon = (status: string) => {
    const icons = {
      verified: CheckCircle,
      ocr_complete: FileText,
      pending: Clock,
      processing: RefreshCw,
      failed: X,
      mismatch_alert: AlertTriangle
    }
    return icons[status] || Clock
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Enhanced filtering logic
  const filteredTickets = tickets.filter(ticket => {
    // Status filter
    const statusMatch = filterStatus === 'all' || ticket.status === filterStatus
    
    // Search filter
    const searchMatch = !searchTerm || 
      ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.driver.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.commodity.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Date range filter
    const ticketDate = new Date(ticket.date)
    const startDate = new Date(dateRange.start)
    const endDate = new Date(dateRange.end)
    const dateMatch = ticketDate >= startDate && ticketDate <= endDate
    
    return statusMatch && searchMatch && dateMatch
  }).sort((a, b) => {
    // Sorting logic
    let comparison = 0
    switch (sortBy) {
      case 'date':
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
        break
      case 'weight':
        comparison = a.netWeight - b.netWeight
        break
      case 'status':
        comparison = a.status.localeCompare(b.status)
        break
      case 'confidence':
        const aConfidence = a.ocrData ? Object.values(a.ocrData).reduce((sum, field) => sum + field.confidence, 0) / Object.keys(a.ocrData).length : 0
        const bConfidence = b.ocrData ? Object.values(b.ocrData).reduce((sum, field) => sum + field.confidence, 0) / Object.keys(b.ocrData).length : 0
        comparison = aConfidence - bConfidence
        break
      case 'driver':
        comparison = a.driver.localeCompare(b.driver)
        break
      default:
        comparison = 0
    }
    return sortDirection === 'asc' ? comparison : -comparison
  })

  const totalTonnage = tickets.filter(t => t.status === 'verified' || t.status === 'ocr_complete').reduce((sum, ticket) => sum + ticket.netWeight, 0)
  const processedTickets = tickets.filter(t => t.status === 'verified' || t.status === 'ocr_complete').length
  const pendingTickets = tickets.filter(t => t.status === 'pending' || t.status === 'processing').length
  const mismatchTickets = tickets.filter(t => t.status === 'mismatch_alert').length
  
  // Date range filtering for enhanced analytics
  const filteredTicketsByDate = tickets.filter(ticket => {
    const ticketDate = new Date(ticket.date)
    const startDate = new Date(dateRange.start)
    const endDate = new Date(dateRange.end)
    return ticketDate >= startDate && ticketDate <= endDate
  })
  
  // Enhanced analytics calculations
  const analytics = {
    totalTonnage,
    processedTickets,
    pendingTickets,
    mismatchTickets,
    dailyTonnage: filteredTicketsByDate.reduce((sum, ticket) => sum + ticket.netWeight, 0),
    weeklyTonnage: filteredTicketsByDate.reduce((sum, ticket) => sum + ticket.netWeight, 0),
    monthlyTonnage: filteredTicketsByDate.reduce((sum, ticket) => sum + ticket.netWeight, 0),
    averageProcessingTime: 2.3, // Mock data
    ocrAccuracyRate: Math.round((processedTickets / tickets.length) * 100),
    topCommodities: getTopCommodities(filteredTicketsByDate),
    topDrivers: getTopDrivers(filteredTicketsByDate),
    averageConfidence: getAverageConfidence(tickets)
  }
  
  // Helper functions for analytics
  function getTopCommodities(tickets: ScaleTicket[]) {
    const commodityMap = new Map<string, {tons: number, count: number}>()
    tickets.forEach(ticket => {
      const existing = commodityMap.get(ticket.commodity) || {tons: 0, count: 0}
      commodityMap.set(ticket.commodity, {
        tons: existing.tons + ticket.netWeight,
        count: existing.count + 1
      })
    })
    return Array.from(commodityMap.entries())
      .map(([name, data]) => ({name, ...data}))
      .sort((a, b) => b.tons - a.tons)
      .slice(0, 5)
  }
  
  function getTopDrivers(tickets: ScaleTicket[]) {
    const driverMap = new Map<string, {tickets: number, accuracy: number}>()
    tickets.forEach(ticket => {
      const existing = driverMap.get(ticket.driver) || {tickets: 0, accuracy: 0}
      const accuracy = ticket.hasMismatch ? 85 : 95 // Mock accuracy
      driverMap.set(ticket.driver, {
        tickets: existing.tickets + 1,
        accuracy: (existing.accuracy * existing.tickets + accuracy) / (existing.tickets + 1)
      })
    })
    return Array.from(driverMap.entries())
      .map(([driver, data]) => ({driver, ...data}))
      .sort((a, b) => b.accuracy - a.accuracy)
      .slice(0, 5)
  }
  
  function getAverageConfidence(tickets: ScaleTicket[]) {
    const confidenceValues = tickets
      .filter(t => t.ocrData)
      .map(t => Object.values(t.ocrData!)
        .map(field => field.confidence)
        .reduce((sum, conf) => sum + conf, 0) / Object.keys(t.ocrData!).length)
    return confidenceValues.length > 0 
      ? Math.round(confidenceValues.reduce((sum, conf) => sum + conf, 0) / confidenceValues.length)
      : 0
  }

  return (
    <div style={{
      maxWidth: '1600px',
      margin: '0 auto',
      padding: '24px',
      color: theme.colors.textPrimary,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        background: theme.colors.backgroundCard,
        borderRadius: '16px',
        padding: '32px',
        marginBottom: '24px',
        border: `1px solid ${theme.colors.border}`,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{
              fontSize: '32px',
              fontWeight: '700',
              color: theme.colors.textPrimary,
              margin: '0 0 8px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.accent} 100%)`,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 4px 16px ${theme.colors.primary}40`
              }}>
                <Scale size={24} color="white" />
              </div>
              Scale Ticket System
            </h1>
            <p style={{ color: theme.colors.textSecondary, fontSize: '16px', margin: 0 }}>
              OCR processing • Weight parsing • Auto-calculation • Mismatch detection
            </p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            style={{
              padding: '14px 28px',
              background: 'transparent',
              color: theme.colors.textSecondary,
              borderRadius: '8px',
              border: `1px solid ${theme.colors.border}`,
              fontSize: '15px',
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
            <Upload size={18} />
            Upload Scale Ticket
          </button>
        </div>
      </div>


      {/* Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '24px'
      }}>
        {/* Total Tonnage */}
        <div style={{
          background: theme.colors.backgroundCard,
          borderRadius: '16px',
          padding: '24px',
          border: `1px solid ${theme.colors.border}`,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '100px',
            height: '100px',
            background: `${theme.colors.primary}10`,
            borderRadius: '0 16px 0 100px'
          }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{
                width: '52px',
                height: '52px',
                backgroundColor: `${theme.colors.primary}20`,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'none'
              }}>
                <Scale size={26} color={theme.colors.textSecondary} />
              </div>
              <div>
                <p style={{ fontSize: '36px', fontWeight: 'bold', color: theme.colors.textPrimary, margin: '0 0 4px 0', lineHeight: 1 }}>
                  {formatNumber(totalTonnage, "0")}
                </p>
                <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: 0 }}>
                  Total Tons Processed
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Processed Tickets */}
        <div style={{
          background: theme.colors.backgroundCard,
          borderRadius: '16px',
          padding: '24px',
          border: `1px solid ${theme.colors.border}`,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '100px',
            height: '100px',
            background: `${theme.colors.success}10`,
            borderRadius: '0 16px 0 100px'
          }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{
                width: '52px',
                height: '52px',
                backgroundColor: `${theme.colors.success}20`,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'none'
              }}>
                <CheckCircle size={26} color={theme.colors.textSecondary} />
              </div>
              <div>
                <p style={{ fontSize: '36px', fontWeight: 'bold', color: theme.colors.textPrimary, margin: '0 0 4px 0', lineHeight: 1 }}>
                  {processedTickets}
                </p>
                <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: 0 }}>
                  Processed Tickets
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Tickets */}
        <div style={{
          background: theme.colors.backgroundCard,
          borderRadius: '16px',
          padding: '24px',
          border: `1px solid ${theme.colors.border}`,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '100px',
            height: '100px',
            background: `${theme.colors.warning}10`,
            borderRadius: '0 16px 0 100px'
          }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{
                width: '52px',
                height: '52px',
                backgroundColor: `${theme.colors.warning}20`,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'none'
              }}>
                <Clock size={26} color={theme.colors.textSecondary} />
              </div>
              <div>
                <p style={{ fontSize: '36px', fontWeight: 'bold', color: theme.colors.textPrimary, margin: '0 0 4px 0', lineHeight: 1 }}>
                  {pendingTickets}
                </p>
                <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: 0 }}>
                  Pending Review
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mismatch Alerts */}
        <div style={{
          background: theme.colors.backgroundCard,
          borderRadius: '16px',
          padding: '24px',
          border: `1px solid ${theme.colors.border}`,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '100px',
            height: '100px',
            background: `${theme.colors.error}10`,
            borderRadius: '0 16px 0 100px'
          }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{
                width: '52px',
                height: '52px',
                backgroundColor: `${theme.colors.error}20`,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'none'
              }}>
                <AlertTriangle size={26} color={theme.colors.textSecondary} />
              </div>
              <div>
                <p style={{ fontSize: '36px', fontWeight: 'bold', color: theme.colors.textPrimary, margin: '0 0 4px 0', lineHeight: 1 }}>
                  {mismatchTickets}
                </p>
                <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: 0 }}>
                  Mismatch Alerts
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Analytics Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '24px'
      }}>
        {/* OCR Accuracy Rate */}
        <div style={{
          background: theme.colors.backgroundCard,
          borderRadius: '16px',
          padding: '24px',
          border: `1px solid ${theme.colors.border}`,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '100px',
            height: '100px',
            background: `${theme.colors.info}10`,
            borderRadius: '0 16px 0 100px'
          }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{
                width: '52px',
                height: '52px',
                backgroundColor: `${theme.colors.info}20`,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'none'
              }}>
                <Eye size={26} color={theme.colors.textSecondary} />
              </div>
              <div>
                <p style={{ fontSize: '36px', fontWeight: 'bold', color: theme.colors.textPrimary, margin: '0 0 4px 0', lineHeight: 1 }}>
                  {analytics.ocrAccuracyRate}%
                </p>
                <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: 0 }}>
                  OCR Accuracy Rate
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Average Processing Time */}
        <div style={{
          background: theme.colors.backgroundCard,
          borderRadius: '16px',
          padding: '24px',
          border: `1px solid ${theme.colors.border}`,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '100px',
            height: '100px',
            background: `${theme.colors.primary}10`,
            borderRadius: '0 16px 0 100px'
          }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{
                width: '52px',
                height: '52px',
                backgroundColor: `${theme.colors.primary}20`,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'none'
              }}>
                <Clock size={26} color={theme.colors.textSecondary} />
              </div>
              <div>
                <p style={{ fontSize: '36px', fontWeight: 'bold', color: theme.colors.textPrimary, margin: '0 0 4px 0', lineHeight: 1 }}>
                  {analytics.averageProcessingTime}m
                </p>
                <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: 0 }}>
                  Avg Processing Time
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Average Confidence */}
        <div style={{
          background: theme.colors.backgroundCard,
          borderRadius: '16px',
          padding: '24px',
          border: `1px solid ${theme.colors.border}`,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '100px',
            height: '100px',
            background: `${theme.colors.success}10`,
            borderRadius: '0 16px 0 100px'
          }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{
                width: '52px',
                height: '52px',
                backgroundColor: `${theme.colors.success}20`,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'none'
              }}>
                <CheckCircle size={26} color={theme.colors.textSecondary} />
              </div>
              <div>
                <p style={{ fontSize: '36px', fontWeight: 'bold', color: theme.colors.textPrimary, margin: '0 0 4px 0', lineHeight: 1 }}>
                  {analytics.averageConfidence}%
                </p>
                <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: 0 }}>
                  Avg Confidence
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Commodity */}
        <div style={{
          background: theme.colors.backgroundCard,
          borderRadius: '16px',
          padding: '24px',
          border: `1px solid ${theme.colors.border}`,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '100px',
            height: '100px',
            background: `${theme.colors.accent}10`,
            borderRadius: '0 16px 0 100px'
          }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{
                width: '52px',
                height: '52px',
                backgroundColor: `${theme.colors.accent}20`,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 4px 16px ${theme.colors.accent}30`
              }}>
                <FileText size={26} color={theme.colors.accent} />
              </div>
              <div>
                <p style={{ fontSize: '20px', fontWeight: 'bold', color: theme.colors.textPrimary, margin: '0 0 4px 0', lineHeight: 1 }}>
                  {analytics.topCommodities[0]?.name || 'N/A'}
                </p>
                <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: 0 }}>
                  Top Commodity
                </p>
                <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: '4px 0 0 0' }}>
                  {formatNumber(analytics.topCommodities[0]?.tons || 0, "0")} tons
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Search and Filter Section */}
      <div style={{
        background: theme.colors.backgroundCard,
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        border: `1px solid ${theme.colors.border}`,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '20px'
        }}>
          {/* Search Bar */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: theme.colors.textPrimary,
              marginBottom: '8px'
            }}>
              Search Tickets
            </label>
            <input
              type="text"
              placeholder="Search by ticket number, driver, location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: theme.colors.inputBg,
                border: `2px solid ${theme.colors.inputBorder}`,
                borderRadius: '10px',
                fontSize: '14px',
                color: theme.colors.textPrimary,
                outline: 'none',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = theme.colors.primary}
              onBlur={(e) => e.currentTarget.style.borderColor = theme.colors.inputBorder}
            />
          </div>

          {/* Date Range Filter */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: theme.colors.textPrimary,
              marginBottom: '8px'
            }}>
              Date Range
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: theme.colors.inputBg,
                  border: `2px solid ${theme.colors.inputBorder}`,
                  borderRadius: '10px',
                  fontSize: '14px',
                  color: theme.colors.textPrimary,
                  outline: 'none'
                }}
              />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: theme.colors.inputBg,
                  border: `2px solid ${theme.colors.inputBorder}`,
                  borderRadius: '10px',
                  fontSize: '14px',
                  color: theme.colors.textPrimary,
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Sort Options */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: theme.colors.textPrimary,
              marginBottom: '8px'
            }}>
              Sort By
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: theme.colors.inputBg,
                  border: `2px solid ${theme.colors.inputBorder}`,
                  borderRadius: '10px',
                  fontSize: '14px',
                  color: theme.colors.textPrimary,
                  outline: 'none'
                }}
              >
                <option value="date">Date</option>
                <option value="weight">Weight</option>
                <option value="status">Status</option>
                <option value="confidence">Confidence</option>
                <option value="driver">Driver</option>
              </select>
              <button
                onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                style={{
                  padding: '12px',
                  background: theme.colors.backgroundHover,
                  border: `2px solid ${theme.colors.inputBorder}`,
                  borderRadius: '10px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title={`Sort ${sortDirection === 'asc' ? 'Descending' : 'Ascending'}`}
              >
                <ArrowUpDown size={16} color={theme.colors.textSecondary} />
              </button>
            </div>
          </div>

          {/* Clear Filters Button */}
          <div style={{ display: 'flex', alignItems: 'end' }}>
            <button
              onClick={() => {
                setSearchTerm('')
                setDateRange({
                  start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                  end: new Date().toISOString().split('T')[0]
                })
                setSortBy('date')
                setSortDirection('desc')
                setFilterStatus('all')
              }}
              style={{
                padding: '12px 20px',
                background: 'transparent',
                border: `2px solid ${theme.colors.border}`,
                borderRadius: '10px',
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
                e.currentTarget.style.borderColor = theme.colors.error
                e.currentTarget.style.color = theme.colors.error
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = theme.colors.border
                e.currentTarget.style.color = theme.colors.textSecondary
              }}
            >
              <X size={16} />
              Clear Filters
            </button>
          </div>
        </div>

        {/* Quick Filter Buttons */}
        <div style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
          marginBottom: '16px'
        }}>
          {[
            { label: 'Today', action: () => {
              const today = new Date().toISOString().split('T')[0]
              setDateRange({ start: today, end: today })
            }},
            { label: 'This Week', action: () => {
              const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
              const today = new Date().toISOString().split('T')[0]
              setDateRange({ start: weekStart, end: today })
            }},
            { label: 'This Month', action: () => {
              const monthStart = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
              const today = new Date().toISOString().split('T')[0]
              setDateRange({ start: monthStart, end: today })
            }},
            { label: 'High Confidence', action: () => setFilterStatus('verified') },
            { label: 'Heavy Loads (>30t)', action: () => setFilterStatus('all') },
            { label: 'Light Loads (<15t)', action: () => setFilterStatus('all') }
          ].map((filter, index) => (
            <button
              key={index}
              onClick={filter.action}
              style={{
                padding: '8px 16px',
                background: theme.colors.backgroundHover,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: '8px',
                color: theme.colors.textSecondary,
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (filterStatus !== filter.value) {
                  e.currentTarget.style.background = '#343a40'
                  e.currentTarget.style.color = 'white'
                }
              }}
              onMouseLeave={(e) => {
                if (filterStatus !== filter.value) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = theme.colors.textSecondary
                }
              }}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{
        background: theme.colors.backgroundCard,
        borderRadius: '12px',
        padding: '8px',
        marginBottom: '24px',
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
        border: `1px solid ${theme.colors.border}`
      }}>
        {[
          { label: 'All Tickets', value: 'all', count: tickets.length },
          { label: 'Mismatch Alerts', value: 'mismatch_alert', count: mismatchTickets },
          { label: 'OCR Complete', value: 'ocr_complete', count: tickets.filter(t => t.status === 'ocr_complete').length },
          { label: 'Verified', value: 'verified', count: tickets.filter(t => t.status === 'verified').length },
          { label: 'Pending', value: 'pending', count: pendingTickets }
        ].map(filter => (
          <button
            key={filter.value}
            onClick={() => setFilterStatus(filter.value)}
            style={{
              padding: '10px 18px',
              backgroundColor: 'transparent',
              color: filterStatus === filter.value ? theme.colors.textPrimary : theme.colors.textSecondary,
              borderRadius: '8px',
              border: filterStatus === filter.value ? `1px solid ${theme.colors.border}` : '1px solid transparent',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              if (filterStatus !== filter.value) {
                e.currentTarget.style.backgroundColor = theme.colors.backgroundCardHover
                e.currentTarget.style.color = theme.colors.textPrimary
                e.currentTarget.style.borderColor = theme.colors.border
              } else {
                e.currentTarget.style.borderColor = theme.colors.primary
              }
            }}
            onMouseLeave={(e) => {
              if (filterStatus !== filter.value) {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = theme.colors.textSecondary
                e.currentTarget.style.borderColor = 'transparent'
              } else {
                e.currentTarget.style.borderColor = theme.colors.border
              }
            }}
          >
            {filter.label}
            <span style={{
              backgroundColor: filterStatus === filter.value ? 'rgba(255, 255, 255, 0.3)' : theme.colors.backgroundHover,
              color: filterStatus === filter.value ? 'white' : theme.colors.textPrimary,
              fontSize: '12px',
              fontWeight: 'bold',
              padding: '2px 8px',
              borderRadius: '12px',
              minWidth: '24px',
              textAlign: 'center'
            }}>
              {filter.count}
            </span>
          </button>
        ))}
      </div>

      {/* Scale Tickets List */}
      <div style={{
        background: theme.colors.backgroundCard,
        borderRadius: '16px',
        padding: '28px',
        border: `1px solid ${theme.colors.border}`,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h2 style={{
            fontSize: '22px',
            fontWeight: '700',
            color: theme.colors.textPrimary,
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <FileText size={22} color={theme.colors.textSecondary} />
            Scale Tickets ({filteredTickets.length})
          </h2>
          
          {/* Bulk Actions */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {selectedVehicles.length > 0 && (
              <>
                <span style={{
                  fontSize: '14px',
                  color: theme.colors.textSecondary,
                  fontWeight: '600'
                }}>
                  {selectedVehicles.length} selected
                </span>
                <button
                  onClick={() => {
                    // Bulk verify selected tickets
                    setTickets(prev => prev.map(ticket => 
                      selectedVehicles.includes(ticket.id) 
                        ? { ...ticket, status: 'verified' as const }
                        : ticket
                    ))
                    setSelectedVehicles([])
                  }}
                  style={{
                    padding: '10px 16px',
                    background: '#343a40',
                    color: 'white',
                    border: '1px solid #495057',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <CheckCircle size={16} />
                  Verify Selected
                </button>
                <button
                  onClick={() => {
                    // Bulk export selected tickets
                    const selectedTickets = tickets.filter(t => selectedVehicles.includes(t.id))
                    const csvContent = [
                      'Ticket Number,Date,Driver,Location,Commodity,Gross Weight,Tare Weight,Net Weight,Status',
                      ...selectedTickets.map(t => 
                        `${t.ticketNumber},${t.date},${t.driver},${t.location},${t.commodity},${t.grossWeight},${t.tareWeight},${t.netWeight},${t.status}`
                      )
                    ].join('\n')
                    
                    const blob = new Blob([csvContent], { type: 'text/csv' })
                    const url = window.URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `scale-tickets-${new Date().toISOString().split('T')[0]}.csv`
                    a.click()
                    window.URL.revokeObjectURL(url)
                  }}
                  style={{
                    padding: '10px 16px',
                    background: '#343a40',
                    color: 'white',
                    border: '1px solid #495057',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <FileText size={16} />
                  Export CSV
                </button>
                <button
                  onClick={() => setSelectedVehicles([])}
                  style={{
                    padding: '10px 16px',
                    background: 'transparent',
                    color: theme.colors.error,
                    border: `2px solid ${theme.colors.error}`,
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
                    e.currentTarget.style.background = '#495057'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#343a40'
                  }}
                >
                  <X size={16} />
                  Clear
                </button>
              </>
            )}
            
            {/* Select All / Deselect All */}
            <button
              onClick={() => {
                if (selectedVehicles.length === filteredTickets.length) {
                  setSelectedVehicles([])
                } else {
                  setSelectedVehicles(filteredTickets.map(t => t.id))
                }
              }}
              style={{
                padding: '10px 16px',
                background: 'transparent',
                color: theme.colors.textSecondary,
                border: `2px solid ${theme.colors.border}`,
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
                e.currentTarget.style.borderColor = theme.colors.primary
                e.currentTarget.style.color = theme.colors.primary
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = theme.colors.border
                e.currentTarget.style.color = theme.colors.textSecondary
              }}
            >
              {selectedVehicles.length === filteredTickets.length ? (
                <>
                  <Square size={16} />
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
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredTickets.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: theme.colors.textSecondary
            }}>
              <FileText size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
              <p style={{ fontSize: '18px', margin: 0 }}>No tickets found</p>
            </div>
          ) : (
            filteredTickets.map((ticket) => {
              const StatusIcon = getStatusIcon(ticket.status)
              const isExpanded = expandedTickets.has(ticket.id)
              
              return (
                <div
                  key={ticket.id}
                  style={{
                    background: theme.colors.background,
                    borderRadius: '12px',
                    border: `2px solid ${ticket.hasMismatch ? theme.colors.error : theme.colors.border}`,
                    transition: 'all 0.2s ease',
                    overflow: 'hidden'
                  }}
                >
                  {/* Ticket Header */}
                  <div
                    style={{
                      padding: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      background: ticket.status === 'processing' 
                        ? `linear-gradient(90deg, ${theme.colors.background} ${ticket.processingProgress}%, ${theme.colors.backgroundCard} ${ticket.processingProgress}%)`
                        : 'transparent'
                    }}
                    onClick={() => ticket.status !== 'processing' && toggleExpand(ticket.id)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                      {/* Bulk Selection Checkbox */}
                      <input
                        type="checkbox"
                        checked={selectedVehicles.includes(ticket.id)}
                        onChange={(e) => {
                          e.stopPropagation()
                          if (selectedVehicles.includes(ticket.id)) {
                            setSelectedVehicles(prev => prev.filter(id => id !== ticket.id))
                          } else {
                            setSelectedVehicles(prev => [...prev, ticket.id])
                          }
                        }}
                        style={{
                          width: '20px',
                          height: '20px',
                          cursor: 'pointer',
                          accentColor: theme.colors.primary
                        }}
                      />
                      <div style={{
                        width: '56px',
                        height: '56px',
                        background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.accent} 100%)`,
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 4px 12px ${theme.colors.primary}30`
                      }}>
                        {ticket.status === 'processing' ? (
                          <RefreshCw size={24} color="white" style={{ animation: 'spin 1s linear infinite' }} />
                        ) : (
                          <FileText size={24} color="white" />
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h3 style={{
                          fontSize: '18px',
                          fontWeight: '600',
                          color: theme.colors.textPrimary,
                          margin: '0 0 6px 0'
                        }}>
                          {ticket.ticketNumber}
                        </h3>
                        <p style={{
                          fontSize: '14px',
                          color: theme.colors.textSecondary,
                          margin: '0 0 4px 0'
                        }}>
                          {ticket.location} • {formatDate(ticket.date)}
                        </p>
                        {ticket.hasMismatch && (
                          <p style={{
                            fontSize: '13px',
                            color: theme.colors.error,
                            margin: 0,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}>
                            <AlertTriangle size={14} />
                            {ticket.mismatchDetails}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      {ticket.status !== 'processing' && (
                        <>
                          <div style={{ textAlign: 'right' }}>
                            <p style={{
                              fontSize: '20px',
                              fontWeight: 'bold',
                              color: theme.colors.textPrimary,
                              margin: '0 0 4px 0'
                            }}>
                              {formatNumber(ticket.netWeight, "1")} tons
                            </p>
                            {ticket.calculatedNetWeight && ticket.hasMismatch && (
                              <p style={{
                                fontSize: '13px',
                                color: theme.colors.textSecondary,
                                margin: 0
                              }}>
                                Calc: {formatNumber(ticket.calculatedNetWeight, "1")}t
                              </p>
                            )}
                          </div>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            backgroundColor: `${getStatusColor(ticket.status)}20`,
                            padding: '8px 14px',
                            borderRadius: '8px',
                            border: `1px solid ${getStatusColor(ticket.status)}30`
                          }}>
                            <StatusIcon size={16} color={getStatusColor(ticket.status)} />
                            <span style={{
                              color: getStatusColor(ticket.status),
                              fontSize: '13px',
                              fontWeight: '600',
                              textTransform: 'capitalize'
                            }}>
                              {ticket.status.replace('_', ' ')}
                            </span>
                          </div>
                          {isExpanded ? <ChevronUp size={20} color={theme.colors.textSecondary} /> : <ChevronDown size={20} color={theme.colors.textSecondary} />}
                        </>
                      )}
                      {ticket.status === 'processing' && (
                        <span style={{ color: theme.colors.textSecondary, fontSize: '14px' }}>
                          {ticket.processingProgress}%
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && ticket.status !== 'processing' && (
                    <div style={{
                      padding: '0 20px 20px 20px',
                      borderTop: `1px solid ${theme.colors.border}`
                    }}>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '16px',
                        marginTop: '20px',
                        marginBottom: '20px'
                      }}>
                        <div style={{ background: theme.colors.backgroundCard, padding: '16px', borderRadius: '10px' }}>
                          <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: '0 0 6px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Gross Weight</p>
                          <p style={{ fontSize: '22px', fontWeight: 'bold', color: theme.colors.textPrimary, margin: 0 }}>
                            {formatNumber(ticket.grossWeight, "1")} tons
                          </p>
                        </div>
                        <div style={{ background: theme.colors.backgroundCard, padding: '16px', borderRadius: '10px' }}>
                          <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: '0 0 6px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tare Weight</p>
                          <p style={{ fontSize: '22px', fontWeight: 'bold', color: theme.colors.textPrimary, margin: 0 }}>
                            {formatNumber(ticket.tareWeight, "1")} tons
                          </p>
                        </div>
                        <div style={{ background: theme.colors.backgroundCard, padding: '16px', borderRadius: '10px' }}>
                          <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: '0 0 6px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Net Weight</p>
                          <p style={{ fontSize: '22px', fontWeight: 'bold', color: theme.colors.textPrimary, margin: 0 }}>
                            {formatNumber(ticket.netWeight, "1")} tons
                          </p>
                        </div>
                        <div style={{ background: theme.colors.backgroundCard, padding: '16px', borderRadius: '10px' }}>
                          <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: '0 0 6px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Commodity</p>
                          <p style={{ fontSize: '16px', fontWeight: '600', color: theme.colors.textPrimary, margin: 0 }}>
                            {ticket.commodity}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => setSelectedTicket(ticket)}
                          style={{
                            padding: '10px 20px',
                            backgroundColor: theme.colors.backgroundHover,
                            color: theme.colors.textPrimary,
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
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                          <Eye size={16} />
                          View Details
                        </button>
                        {(ticket.status === 'ocr_complete' || ticket.status === 'mismatch_alert') && (
                          <button
                            onClick={() => verifyTicket(ticket.id)}
                            style={{
                              padding: '10px 20px',
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
                              e.currentTarget.style.transform = 'translateY(-1px)'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent'
                              e.currentTarget.style.color = theme.colors.textSecondary
                              e.currentTarget.style.borderColor = theme.colors.border
                              e.currentTarget.style.transform = 'translateY(0)'
                            }}
                          >
                            <Check size={16} />
                            Verify & Accept
                          </button>
                        )}
                        <button
                          onClick={() => deleteTicket(ticket.id)}
                          style={{
                            padding: '10px 20px',
                            backgroundColor: 'transparent',
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
                            e.currentTarget.style.transform = 'translateY(-1px)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent'
                            e.currentTarget.style.color = theme.colors.textSecondary
                            e.currentTarget.style.borderColor = theme.colors.border
                            e.currentTarget.style.transform = 'translateY(0)'
                          }}
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div style={{
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
        onClick={() => setShowUploadModal(false)}
        >
          <div style={{
            background: theme.colors.backgroundCard,
            borderRadius: '20px',
            padding: '36px',
            maxWidth: '600px',
            width: '90%',
            border: `1px solid ${theme.colors.border}`,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
              <h2 style={{ color: theme.colors.textPrimary, fontSize: '26px', fontWeight: 'bold', margin: 0 }}>
                Upload Scale Ticket
              </h2>
              <button
                onClick={() => setShowUploadModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: theme.colors.textSecondary,
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.colors.backgroundHover}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <X size={24} />
              </button>
            </div>
            
            <div 
              style={{
                backgroundColor: dragActive ? `${theme.colors.primary}20` : theme.colors.background,
                padding: '48px',
                borderRadius: '16px',
                border: `3px dashed ${dragActive ? theme.colors.primary : theme.colors.border}`,
                textAlign: 'center',
                marginBottom: '24px',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div style={{
                width: '80px',
                height: '80px',
                background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.accent} 100%)`,
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                boxShadow: `0 8px 20px ${theme.colors.primary}40`
              }}>
                <Camera size={40} color="white" />
              </div>
              <h3 style={{ color: theme.colors.textPrimary, fontSize: '20px', marginBottom: '12px' }}>
                {dragActive ? 'Drop image here' : 'Drag & Drop or Click to Upload'}
              </h3>
              <p style={{ color: theme.colors.textSecondary, fontSize: '15px', marginBottom: '24px', lineHeight: 1.6 }}>
                Upload scale ticket images for automatic OCR processing<br />
                System will extract weights, calculate net tonnage, and detect mismatches
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0])
                  }
                }}
              />
              <button style={{
                padding: '14px 32px',
                background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.accent} 100%)`,
                color: 'white',
                borderRadius: '12px',
                border: 'none',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: `0 4px 12px ${theme.colors.primary}40`,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <Upload size={18} />
                Choose File
              </button>
            </div>

            {/* Mobile Integration Section */}
            <div style={{
              background: theme.colors.background,
              borderRadius: '12px',
              padding: '20px',
              border: `1px solid ${theme.colors.border}`,
              marginBottom: '24px'
            }}>
              <h3 style={{
                color: theme.colors.textPrimary,
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <Camera size={20} color={theme.colors.textSecondary} />
                Mobile App Integration
              </h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px'
              }}>
                {/* Mobile Camera Capture */}
                <div style={{
                  background: theme.colors.backgroundCard,
                  borderRadius: '10px',
                  padding: '16px',
                  border: `1px solid ${theme.colors.border}`
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '12px'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      background: `${theme.colors.primary}20`,
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Camera size={20} color={theme.colors.textSecondary} />
                    </div>
                    <div>
                      <p style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: theme.colors.textPrimary,
                        margin: 0
                      }}>
                        Camera Capture
                      </p>
                      <p style={{
                        fontSize: '12px',
                        color: theme.colors.textSecondary,
                        margin: 0
                      }}>
                        Direct photo from mobile app
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      // Simulate mobile camera capture
                      alert('Mobile camera capture would be triggered here. In a real app, this would open the mobile camera interface.')
                    }}
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: theme.colors.primary,
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = theme.colors.accent}
                    onMouseLeave={(e) => e.currentTarget.style.background = theme.colors.primary}
                  >
                    📱 Open Mobile Camera
                  </button>
                </div>

                {/* GPS Location Tagging */}
                <div style={{
                  background: theme.colors.backgroundCard,
                  borderRadius: '10px',
                  padding: '16px',
                  border: `1px solid ${theme.colors.border}`
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '12px'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      background: `${theme.colors.success}20`,
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <MapPin size={20} color={theme.colors.textSecondary} />
                    </div>
                    <div>
                      <p style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: theme.colors.textPrimary,
                        margin: 0
                      }}>
                        GPS Location
                      </p>
                      <p style={{
                        fontSize: '12px',
                        color: theme.colors.textSecondary,
                        margin: 0
                      }}>
                        Auto-tag with location
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      // Simulate GPS location capture
                      const mockLocation = {
                        latitude: 32.7767 + (Math.random() - 0.5) * 0.1,
                        longitude: -96.7970 + (Math.random() - 0.5) * 0.1,
                        address: 'Dallas, TX'
                      }
                      alert(`GPS Location captured:\nLat: ${mockLocation.latitude.toFixed(4)}\nLng: ${mockLocation.longitude.toFixed(4)}\nAddress: ${mockLocation.address}`)
                    }}
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: theme.colors.success,
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = theme.colors.warning}
                    onMouseLeave={(e) => e.currentTarget.style.background = theme.colors.success}
                  >
                    📍 Capture Location
                  </button>
                </div>

                {/* Driver Auto-Assignment */}
                <div style={{
                  background: theme.colors.backgroundCard,
                  borderRadius: '10px',
                  padding: '16px',
                  border: `1px solid ${theme.colors.border}`
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '12px'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      background: `${theme.colors.info}20`,
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <User size={20} color={theme.colors.textSecondary} />
                    </div>
                    <div>
                      <p style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: theme.colors.textPrimary,
                        margin: 0
                      }}>
                        Auto-Assignment
                      </p>
                      <p style={{
                        fontSize: '12px',
                        color: theme.colors.textSecondary,
                        margin: 0
                      }}>
                        Assign based on GPS
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      // Simulate driver auto-assignment
                      const mockDrivers = ['John Smith', 'Sarah Johnson', 'Mike Rodriguez', 'David Chen']
                      const assignedDriver = mockDrivers[Math.floor(Math.random() * mockDrivers.length)]
                      alert(`Driver auto-assigned based on GPS location:\n${assignedDriver}`)
                    }}
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: theme.colors.info,
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = theme.colors.accent}
                    onMouseLeave={(e) => e.currentTarget.style.background = theme.colors.info}
                  >
                    👤 Auto-Assign Driver
                  </button>
                </div>
              </div>

              <div style={{
                marginTop: '16px',
                padding: '12px',
                background: `${theme.colors.primary}10`,
                borderRadius: '8px',
                border: `1px solid ${theme.colors.primary}30`
              }}>
                <p style={{
                  fontSize: '13px',
                  color: theme.colors.textSecondary,
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ fontSize: '16px' }}>📱</span>
                  <strong>Mobile App Ready:</strong> These features will be fully integrated when the mobile driver app is deployed. Drivers can capture scale tickets directly from their mobile device with automatic GPS tagging and driver assignment.
                </p>
              </div>
            </div>

            <div style={{
              background: `${theme.colors.info}15`,
              border: `1px solid ${theme.colors.info}40`,
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              gap: '12px'
            }}>
              <AlertCircle size={20} color={theme.colors.textSecondary} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <p style={{ color: theme.colors.textPrimary, fontSize: '14px', fontWeight: '600', margin: '0 0 6px 0' }}>
                  Automated Processing
                </p>
                <p style={{ color: theme.colors.textSecondary, fontSize: '13px', margin: 0, lineHeight: 1.6 }}>
                  Our OCR engine automatically extracts ticket numbers, weights, dates, and locations. 
                  Net weight is calculated (Gross - Tare) and compared against OCR values. 
                  Mismatches are flagged for manual review.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Detail Modal with OCR Data */}
      {selectedTicket && (
        <div style={{
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
          overflow: 'auto',
          padding: '20px'
        }}
        onClick={() => setSelectedTicket(null)}
        >
          <div style={{
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
              <div>
                <h2 style={{ color: theme.colors.textPrimary, fontSize: '26px', fontWeight: 'bold', margin: '0 0 8px 0' }}>
                  {selectedTicket.ticketNumber}
                </h2>
                <p style={{ color: theme.colors.textSecondary, margin: 0 }}>
                  {selectedTicket.location} • {formatDate(selectedTicket.date)}
                </p>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: theme.colors.textSecondary,
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.colors.backgroundHover}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <X size={24} />
              </button>
            </div>

            {/* Mismatch Alert */}
            {selectedTicket.hasMismatch && (
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
                <AlertTriangle size={24} color={theme.colors.textSecondary} style={{ flexShrink: 0 }} />
                <div>
                  <h4 style={{ color: theme.colors.error, fontSize: '16px', fontWeight: '700', margin: '0 0 8px 0' }}>
                    Weight Mismatch Detected
                  </h4>
                  <p style={{ color: theme.colors.textPrimary, fontSize: '14px', margin: 0 }}>
                    {selectedTicket.mismatchDetails}
                  </p>
                  <p style={{ color: theme.colors.textSecondary, fontSize: '13px', margin: '8px 0 0 0' }}>
                    Please verify the weights manually. The calculated value is based on Gross - Tare.
                  </p>
                </div>
              </div>
            )}
            
            {/* Weight Comparison */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginBottom: '28px'
            }}>
              <div style={{
                background: theme.colors.background,
                padding: '20px',
                borderRadius: '12px',
                border: `1px solid ${theme.colors.border}`
              }}>
                <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
                  Gross Weight
                </p>
                <p style={{ fontSize: '28px', fontWeight: 'bold', color: theme.colors.textPrimary, margin: 0 }}>
                  {formatNumber(selectedTicket.grossWeight, "1")} tons
                </p>
              </div>
              <div style={{
                background: theme.colors.background,
                padding: '20px',
                borderRadius: '12px',
                border: `1px solid ${theme.colors.border}`
              }}>
                <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
                  Tare Weight
                </p>
                <p style={{ fontSize: '28px', fontWeight: 'bold', color: theme.colors.textPrimary, margin: 0 }}>
                  {formatNumber(selectedTicket.tareWeight, "1")} tons
                </p>
              </div>
              <div style={{
                background: theme.colors.background,
                padding: '20px',
                borderRadius: '12px',
                border: `1px solid ${theme.colors.border}`
              }}>
                <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
                  Net Weight (OCR)
                </p>
                <p style={{ fontSize: '28px', fontWeight: 'bold', color: selectedTicket.hasMismatch ? theme.colors.error : theme.colors.textPrimary, margin: 0 }}>
                  {formatNumber(selectedTicket.netWeight, "1")} tons
                </p>
              </div>
              {selectedTicket.calculatedNetWeight && (
                <div style={{
                  background: theme.colors.background,
                  padding: '20px',
                  borderRadius: '12px',
                  border: `2px solid ${selectedTicket.hasMismatch ? theme.colors.success : theme.colors.border}`
                }}>
                  <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
                    Calculated Net
                  </p>
                  <p style={{ fontSize: '28px', fontWeight: 'bold', color: theme.colors.success, margin: 0 }}>
                    {formatNumber(selectedTicket.calculatedNetWeight, "1")} tons
                  </p>
                </div>
              )}
            </div>

            {/* Additional Details */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '16px',
              marginBottom: '28px'
            }}>
              <div style={{ background: theme.colors.background, padding: '20px', borderRadius: '12px' }}>
                <h4 style={{ color: theme.colors.textPrimary, fontSize: '14px', fontWeight: '600', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Commodity
                </h4>
                <p style={{ color: theme.colors.textPrimary, fontSize: '18px', fontWeight: '600', margin: 0 }}>
                  {selectedTicket.commodity}
                </p>
              </div>
              <div style={{ background: theme.colors.background, padding: '20px', borderRadius: '12px' }}>
                <h4 style={{ color: theme.colors.textPrimary, fontSize: '14px', fontWeight: '600', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Driver
                </h4>
                <p style={{ color: theme.colors.textPrimary, fontSize: '18px', fontWeight: '600', margin: 0 }}>
                  {selectedTicket.driver}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setSelectedTicket(null)}
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
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                Close
              </button>
              {(selectedTicket.status === 'ocr_complete' || selectedTicket.status === 'mismatch_alert') && (
                <button
                  onClick={() => {
                    verifyTicket(selectedTicket.id)
                    setSelectedTicket(null)
                  }}
                  style={{
                    padding: '12px 28px',
                    background: `linear-gradient(135deg, ${theme.colors.success} 0%, ${theme.colors.success}dd 100%)`,
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    transition: 'all 0.2s ease',
                    boxShadow: `0 4px 12px ${theme.colors.success}40`
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <CheckCircle size={18} />
                  Verify & Accept Ticket
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add spinner animation */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  )
}

export default ScaleTicketsPage
