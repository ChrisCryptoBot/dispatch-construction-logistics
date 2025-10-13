import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext-fixed'
import type { Load } from '../../types'

interface Driver {
  id: string
  name: string
  phone: string
  email: string
  licenseNumber: string
  licenseExpiry: string
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED'
  verified: boolean
  lastActive: string
  totalLoads: number
  onTimeRate: number
}

const DriverManagementPage = () => {
  const { user, organization } = useAuth()
  const [activeTab, setActiveTab] = useState<'drivers' | 'load-assignment' | 'verification'>('drivers')
  
  // Notification State
  const [notifications, setNotifications] = useState<Array<{id: string, type: 'success' | 'error' | 'info', message: string, timestamp: number}>>([])
  
  // Driver Management State
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [showAddDriver, setShowAddDriver] = useState(false)
  const [showEditDriver, setShowEditDriver] = useState(false)
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null)
  const [newDriver, setNewDriver] = useState({
    name: '',
    phone: '',
    email: '',
    licenseNumber: '',
    licenseExpiry: ''
  })

  // Load Assignment State
  const [showAssignmentModal, setShowAssignmentModal] = useState(false)
  const [selectedLoad, setSelectedLoad] = useState<Load | null>(null)
  const [pendingLoads, setPendingLoads] = useState<Load[]>([])

  // Driver Verification State
  const [verificationFilter, setVerificationFilter] = useState('ALL')
  const [showVerificationModal, setShowVerificationModal] = useState(false)
  const [verifyingDriver, setVerifyingDriver] = useState<Driver | null>(null)

  // Driver data state (mutable)
  const [drivers, setDrivers] = useState<Driver[]>([
    {
      id: '1',
      name: 'John Smith',
      phone: '(555) 123-4567',
      email: 'john.smith@email.com',
      licenseNumber: 'DL123456789',
      licenseExpiry: '2025-12-15',
      status: 'ACTIVE',
      verified: true,
      lastActive: '2 hours ago',
      totalLoads: 45,
      onTimeRate: 96
    },
    {
      id: '2',
      name: 'Mike Johnson',
      phone: '(555) 987-6543',
      email: 'mike.johnson@email.com',
      licenseNumber: 'DL987654321',
      licenseExpiry: '2025-08-20',
      status: 'PENDING',
      verified: false,
      lastActive: '1 day ago',
      totalLoads: 0,
      onTimeRate: 0
    },
    {
      id: '3',
      name: 'Sarah Wilson',
      phone: '(555) 456-7890',
      email: 'sarah.wilson@email.com',
      licenseNumber: 'DL456789123',
      licenseExpiry: '2026-03-10',
      status: 'ACTIVE',
      verified: true,
      lastActive: '30 minutes ago',
      totalLoads: 78,
      onTimeRate: 94
    }
  ])

  // Mock load data for Load Assignment
  const [availableLoads, setAvailableLoads] = useState<Load[]>([
    {
      id: '1',
      loadNumber: 'LD-001',
      pickupLocation: 'Dallas, TX',
      deliveryLocation: 'Houston, TX',
      pickupDate: '2024-01-15',
      deliveryDate: '2024-01-16',
      equipmentType: 'Dry Van',
      weight: '45,000 lbs',
      rate: '$1,250.00',
      status: 'AVAILABLE',
      customerName: 'ABC Manufacturing',
      driverId: null,
      driverName: null,
      driverPhone: null,
      driverAcceptanceStatus: null,
      driverAssignedAt: null,
      driverAcceptedAt: null,
      driverAcceptanceExpiry: null,
      smsVerificationSent: false,
      smsVerificationCode: null,
      smsVerifiedAt: null,
      createdAt: '2024-01-10',
      updatedAt: '2024-01-10'
    },
    {
      id: '2',
      loadNumber: 'LD-002',
      pickupLocation: 'Austin, TX',
      deliveryLocation: 'San Antonio, TX',
      pickupDate: '2024-01-16',
      deliveryDate: '2024-01-17',
      equipmentType: 'Flatbed',
      weight: '38,000 lbs',
      rate: '$980.00',
      status: 'AVAILABLE',
      customerName: 'XYZ Construction',
      driverId: null,
      driverName: null,
      driverPhone: null,
      driverAcceptanceStatus: null,
      driverAssignedAt: null,
      driverAcceptedAt: null,
      driverAcceptanceExpiry: null,
      smsVerificationSent: false,
      smsVerificationCode: null,
      smsVerifiedAt: null,
      createdAt: '2024-01-11',
      updatedAt: '2024-01-11'
    }
  ])

  // Notification functions
  const addNotification = (type: 'success' | 'error' | 'info', message: string) => {
    const notification = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: Date.now()
    }
    setNotifications(prev => [...prev, notification])
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id))
    }, 5000)
  }

  // Auto remove old notifications
  useEffect(() => {
    const interval = setInterval(() => {
      setNotifications(prev => prev.filter(n => Date.now() - n.timestamp < 5000))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Driver management functions
  const handleAddDriver = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newDriver.name || !newDriver.phone || !newDriver.email || !newDriver.licenseNumber || !newDriver.licenseExpiry) {
      addNotification('error', 'Please fill in all required fields')
      return
    }

    const driver: Driver = {
      id: Date.now().toString(),
      name: newDriver.name,
      phone: newDriver.phone,
      email: newDriver.email,
      licenseNumber: newDriver.licenseNumber,
      licenseExpiry: newDriver.licenseExpiry,
      status: 'PENDING',
      verified: false,
      lastActive: 'Just added',
      totalLoads: 0,
      onTimeRate: 0
    }

    setDrivers(prev => [...prev, driver])
    setNewDriver({ name: '', phone: '', email: '', licenseNumber: '', licenseExpiry: '' })
    setShowAddDriver(false)
    addNotification('success', `Driver ${driver.name} added successfully`)
    
    // Switch to verification tab if driver needs verification
    if (!driver.verified) {
      setTimeout(() => setActiveTab('verification'), 1000)
    }
  }

  const handleEditDriver = (driver: Driver) => {
    setEditingDriver(driver)
    setNewDriver({
      name: driver.name,
      phone: driver.phone,
      email: driver.email,
      licenseNumber: driver.licenseNumber,
      licenseExpiry: driver.licenseExpiry
    })
    setShowEditDriver(true)
  }

  const handleUpdateDriver = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingDriver) return

    setDrivers(prev => prev.map(driver => 
      driver.id === editingDriver.id 
        ? { ...driver, ...newDriver }
        : driver
    ))
    
    addNotification('success', `Driver ${newDriver.name} updated successfully`)
    setShowEditDriver(false)
    setEditingDriver(null)
    setNewDriver({ name: '', phone: '', email: '', licenseNumber: '', licenseExpiry: '' })
  }

  const handleVerifyDriver = (driver: Driver) => {
    setVerifyingDriver(driver)
    setShowVerificationModal(true)
  }

  const handleStartVerification = (driver: Driver) => {
    // Simulate verification process
    setTimeout(() => {
      setDrivers(prev => prev.map(d => 
        d.id === driver.id 
          ? { ...d, verified: true, status: 'ACTIVE' }
          : d
      ))
      addNotification('success', `Driver ${driver.name} verification completed successfully`)
      setShowVerificationModal(false)
      setVerifyingDriver(null)
    }, 2000)
    
    addNotification('info', `Starting verification process for ${driver.name}...`)
  }

  const handleAssignDriver = (load: Load) => {
    setSelectedLoad(load)
    setShowAssignmentModal(true)
  }

  const handleConfirmAssignment = (driver: Driver) => {
    if (!selectedLoad) return

    // Update load with driver assignment
    const updatedLoad: Load = {
      ...selectedLoad,
      driverId: driver.id,
      driverName: driver.name,
      driverPhone: driver.phone,
      driverAcceptanceStatus: 'PENDING',
      driverAssignedAt: new Date().toISOString(),
      driverAcceptanceExpiry: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
      smsVerificationSent: true,
      smsVerificationCode: Math.floor(100000 + Math.random() * 900000).toString()
    }

    // Remove from available loads and add to pending
    setAvailableLoads(prev => prev.filter(l => l.id !== selectedLoad.id))
    setPendingLoads(prev => [...prev, updatedLoad])

    addNotification('success', `Load ${selectedLoad.loadNumber} assigned to ${driver.name}`)
    addNotification('info', `SMS verification sent to ${driver.phone}`)
    
    setShowAssignmentModal(false)
    setSelectedLoad(null)
    
    // Switch to load assignment tab to show pending loads
    setTimeout(() => setActiveTab('load-assignment'), 1000)
  }

  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         driver.phone.includes(searchTerm) ||
                         driver.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || driver.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return '#10B981'
      case 'PENDING': return '#F59E0B'
      case 'SUSPENDED': return '#EF4444'
      default: return '#6B7280'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'fas fa-check-circle'
      case 'PENDING': return 'fas fa-clock'
      case 'SUSPENDED': return 'fas fa-ban'
      default: return 'fas fa-question-circle'
    }
  }

  const tabs = [
    { id: 'drivers', label: 'Driver Management', icon: 'fas fa-users', count: drivers.length },
    { id: 'load-assignment', label: 'Load Assignment', icon: 'fas fa-truck', count: pendingLoads.length, badge: 'PENDING' },
    { id: 'verification', label: 'Driver Verification', icon: 'fas fa-shield-alt', count: drivers.filter(d => !d.verified).length, badge: 'NEW' }
  ]

  const renderDriverManagement = () => (
    <>
      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Drivers', value: drivers.length, color: '#667eea' },
          { label: 'Active Drivers', value: drivers.filter(d => d.status === 'ACTIVE').length, color: '#10B981' },
          { label: 'Pending Verification', value: drivers.filter(d => d.status === 'PENDING').length, color: '#F59E0B' },
          { label: 'Verified Drivers', value: drivers.filter(d => d.verified).length, color: '#8B5CF6' }
        ].map((stat, index) => (
          <div key={index} style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: stat.color, marginBottom: '4px' }}>
              {stat.value}
            </div>
            <div style={{ fontSize: '14px', color: '#9CA3AF' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ 
        display: 'flex', 
        gap: '16px', 
        marginBottom: '24px',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '300px' }}>
          <i className="fas fa-search" style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#9CA3AF',
            fontSize: '14px'
          }}></i>
          <input
            type="text"
            placeholder="Search drivers by name, phone, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 12px 12px 40px',
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
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'
              e.target.style.background = 'rgba(255, 255, 255, 0.05)'
            }}
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '12px 16px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            color: '#FFFFFF',
            fontSize: '14px',
            outline: 'none',
            cursor: 'pointer',
            minWidth: '150px'
          }}
        >
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="PENDING">Pending</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
      </div>

      {/* Drivers Table */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '12px',
        overflow: 'hidden'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr',
          gap: '16px',
          padding: '16px 24px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          fontSize: '12px',
          fontWeight: '600',
          color: '#9CA3AF',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          <div>Driver</div>
          <div>Contact</div>
          <div>License</div>
          <div>Status</div>
          <div>Performance</div>
          <div>Actions</div>
        </div>

        {filteredDrivers.map((driver) => (
          <div key={driver.id} style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr',
            gap: '16px',
            padding: '20px 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
            alignItems: 'center',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'transparent'
          }}
          >
            {/* Driver Info */}
            <div>
              <div style={{ fontWeight: '600', color: '#FFFFFF', marginBottom: '4px' }}>
                {driver.name}
              </div>
              <div style={{ fontSize: '12px', color: '#9CA3AF' }}>
                Last active: {driver.lastActive}
              </div>
            </div>

            {/* Contact */}
            <div>
              <div style={{ fontSize: '14px', color: '#FFFFFF', marginBottom: '2px' }}>
                {driver.phone}
              </div>
              <div style={{ fontSize: '12px', color: '#9CA3AF' }}>
                {driver.email}
              </div>
            </div>

            {/* License */}
            <div>
              <div style={{ fontSize: '14px', color: '#FFFFFF', marginBottom: '2px' }}>
                {driver.licenseNumber}
              </div>
              <div style={{ fontSize: '12px', color: '#9CA3AF' }}>
                Expires: {new Date(driver.licenseExpiry).toLocaleDateString()}
              </div>
            </div>

            {/* Status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className={getStatusIcon(driver.status)} style={{ color: getStatusColor(driver.status) }}></i>
              <span style={{ color: getStatusColor(driver.status), fontWeight: '500' }}>
                {driver.status}
              </span>
              {driver.verified && (
                <i className="fas fa-shield-alt" style={{ color: '#10B981', fontSize: '12px' }}></i>
              )}
            </div>

            {/* Performance */}
            <div>
              <div style={{ fontSize: '14px', color: '#FFFFFF', marginBottom: '2px' }}>
                {driver.totalLoads} loads
              </div>
              <div style={{ fontSize: '12px', color: '#9CA3AF' }}>
                {driver.onTimeRate}% on-time
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => handleEditDriver(driver)}
                style={{
                  background: 'rgba(102, 126, 234, 0.1)',
                  border: '1px solid rgba(102, 126, 234, 0.3)',
                  color: '#667eea',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'rgba(102, 126, 234, 0.2)'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                Edit
              </button>
              {!driver.verified ? (
                <button 
                  onClick={() => handleVerifyDriver(driver)}
                  style={{
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    color: '#10B981',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = 'rgba(16, 185, 129, 0.2)'
                    e.currentTarget.style.transform = 'translateY(-1px)'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  Verify
                </button>
              ) : (
                <button 
                  onClick={() => handleVerifyDriver(driver)}
                  style={{
                    background: 'rgba(102, 126, 234, 0.1)',
                    border: '1px solid rgba(102, 126, 234, 0.3)',
                    color: '#667eea',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = 'rgba(102, 126, 234, 0.2)'
                    e.currentTarget.style.transform = 'translateY(-1px)'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  Re-verify
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredDrivers.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: '#9CA3AF'
        }}>
          <i className="fas fa-users" style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}></i>
          <div style={{ fontSize: '18px', marginBottom: '8px' }}>No drivers found</div>
          <div style={{ fontSize: '14px' }}>Try adjusting your search or filter criteria</div>
        </div>
      )}
    </>
  )

  const renderLoadAssignment = () => (
    <>
      {/* Load Assignment Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Available Loads', value: availableLoads.length, color: '#667eea' },
          { label: 'Pending Acceptance', value: pendingLoads.length, color: '#F59E0B' },
          { label: 'Assigned Today', value: 5, color: '#10B981' },
          { label: 'Completion Rate', value: '94%', color: '#8B5CF6' }
        ].map((stat, index) => (
          <div key={index} style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: stat.color, marginBottom: '4px' }}>
              {stat.value}
            </div>
            <div style={{ fontSize: '14px', color: '#9CA3AF' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Pending Driver Acceptance */}
      {pendingLoads.length > 0 && (
        <div style={{
          background: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <i className="fas fa-clock" style={{ color: '#F59E0B', fontSize: '20px' }}></i>
            <h3 style={{ color: '#F59E0B', fontSize: '18px', fontWeight: '600', margin: 0 }}>
              Pending Driver Acceptance ({pendingLoads.length})
            </h3>
          </div>
          <div style={{ color: '#F59E0B', fontSize: '14px' }}>
            Drivers have 15 minutes to accept assigned loads. Use the reassign button if no response.
          </div>
        </div>
      )}

      {/* Available Loads */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '12px',
        overflow: 'hidden'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr',
          gap: '16px',
          padding: '16px 24px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          fontSize: '12px',
          fontWeight: '600',
          color: '#9CA3AF',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          <div>Load #</div>
          <div>Route</div>
          <div>Equipment</div>
          <div>Rate</div>
          <div>Customer</div>
          <div>Actions</div>
        </div>

        {availableLoads.map((load) => (
          <div key={load.id} style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr',
            gap: '16px',
            padding: '20px 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
            alignItems: 'center',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'transparent'
          }}
          >
            {/* Load Number */}
            <div>
              <div style={{ fontWeight: '600', color: '#FFFFFF', marginBottom: '4px' }}>
                {load.loadNumber}
              </div>
              <div style={{ fontSize: '12px', color: '#9CA3AF' }}>
                {load.weight}
              </div>
            </div>

            {/* Route */}
            <div>
              <div style={{ fontSize: '14px', color: '#FFFFFF', marginBottom: '2px' }}>
                {load.pickupLocation} → {load.deliveryLocation}
              </div>
              <div style={{ fontSize: '12px', color: '#9CA3AF' }}>
                {new Date(load.pickupDate).toLocaleDateString()} - {new Date(load.deliveryDate).toLocaleDateString()}
              </div>
            </div>

            {/* Equipment */}
            <div style={{ color: '#FFFFFF', fontSize: '14px' }}>
              {load.equipmentType}
            </div>

            {/* Rate */}
            <div style={{ color: '#10B981', fontSize: '16px', fontWeight: '600' }}>
              {load.rate}
            </div>

            {/* Customer */}
            <div style={{ color: '#FFFFFF', fontSize: '14px' }}>
              {load.customerName}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => handleAssignDriver(load)}
                style={{
                  background: 'rgba(220, 38, 38, 0.1)',
                  border: '1px solid rgba(220, 38, 38, 0.3)',
                  color: '#dc2626',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'rgba(220, 38, 38, 0.2)'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'rgba(220, 38, 38, 0.1)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                Assign Driver
              </button>
            </div>
          </div>
        ))}
      </div>

      {availableLoads.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: '#9CA3AF'
        }}>
          <i className="fas fa-truck" style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}></i>
          <div style={{ fontSize: '18px', marginBottom: '8px' }}>No available loads</div>
          <div style={{ fontSize: '14px' }}>Check back later for new load opportunities</div>
        </div>
      )}
    </>
  )

  const renderDriverVerification = () => (
    <>
      {/* Verification Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Pending Verification', value: drivers.filter(d => !d.verified).length, color: '#F59E0B' },
          { label: 'Verified Drivers', value: drivers.filter(d => d.verified).length, color: '#10B981' },
          { label: 'Verification Rate', value: '67%', color: '#667eea' },
          { label: 'Avg. Process Time', value: '2.3 days', color: '#8B5CF6' }
        ].map((stat, index) => (
          <div key={index} style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: stat.color, marginBottom: '4px' }}>
              {stat.value}
            </div>
            <div style={{ fontSize: '14px', color: '#9CA3AF' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Verification Filters */}
      <div style={{ 
        display: 'flex', 
        gap: '16px', 
        marginBottom: '24px',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <select
          value={verificationFilter}
          onChange={(e) => setVerificationFilter(e.target.value)}
          style={{
            padding: '12px 16px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            color: '#FFFFFF',
            fontSize: '14px',
            outline: 'none',
            cursor: 'pointer',
            minWidth: '200px'
          }}
        >
          <option value="ALL">All Verification Status</option>
          <option value="PENDING">Pending Verification</option>
          <option value="VERIFIED">Verified</option>
          <option value="EXPIRED">License Expired</option>
        </select>
      </div>

      {/* Driver Verification Table */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '12px',
        overflow: 'hidden'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr',
          gap: '16px',
          padding: '16px 24px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          fontSize: '12px',
          fontWeight: '600',
          color: '#9CA3AF',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          <div>Driver</div>
          <div>License Info</div>
          <div>Verification Status</div>
          <div>Documents</div>
          <div>Last Check</div>
          <div>Actions</div>
        </div>

        {drivers.map((driver) => (
          <div key={driver.id} style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr',
            gap: '16px',
            padding: '20px 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
            alignItems: 'center',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'transparent'
          }}
          >
            {/* Driver Info */}
            <div>
              <div style={{ fontWeight: '600', color: '#FFFFFF', marginBottom: '4px' }}>
                {driver.name}
              </div>
              <div style={{ fontSize: '12px', color: '#9CA3AF' }}>
                {driver.phone}
              </div>
            </div>

            {/* License Info */}
            <div>
              <div style={{ fontSize: '14px', color: '#FFFFFF', marginBottom: '2px' }}>
                {driver.licenseNumber}
              </div>
              <div style={{ fontSize: '12px', color: '#9CA3AF' }}>
                Expires: {new Date(driver.licenseExpiry).toLocaleDateString()}
              </div>
            </div>

            {/* Verification Status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {driver.verified ? (
                <>
                  <i className="fas fa-check-circle" style={{ color: '#10B981' }}></i>
                  <span style={{ color: '#10B981', fontWeight: '500' }}>VERIFIED</span>
                </>
              ) : (
                <>
                  <i className="fas fa-clock" style={{ color: '#F59E0B' }}></i>
                  <span style={{ color: '#F59E0B', fontWeight: '500' }}>PENDING</span>
                </>
              )}
            </div>

            {/* Documents */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <i className="fas fa-id-card" style={{ color: driver.verified ? '#10B981' : '#6B7280' }}></i>
              <i className="fas fa-file-medical" style={{ color: driver.verified ? '#10B981' : '#6B7280' }}></i>
              <i className="fas fa-shield-alt" style={{ color: driver.verified ? '#10B981' : '#6B7280' }}></i>
            </div>

            {/* Last Check */}
            <div style={{ color: '#9CA3AF', fontSize: '12px' }}>
              {driver.verified ? 'Verified 2 days ago' : 'Never verified'}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {!driver.verified ? (
                <button 
                  onClick={() => handleStartVerification(driver)}
                  style={{
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    color: '#10B981',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = 'rgba(16, 185, 129, 0.2)'
                    e.currentTarget.style.transform = 'translateY(-1px)'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  Start Verification
                </button>
              ) : (
                <button 
                  onClick={() => handleStartVerification(driver)}
                  style={{
                    background: 'rgba(102, 126, 234, 0.1)',
                    border: '1px solid rgba(102, 126, 234, 0.3)',
                    color: '#667eea',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = 'rgba(102, 126, 234, 0.2)'
                    e.currentTarget.style.transform = 'translateY(-1px)'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  Re-verify
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  )

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Notification System */}
      <div style={{
        position: 'fixed',
        top: '100px',
        right: '24px',
        zIndex: 2000,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        {notifications.map((notification) => (
          <div
            key={notification.id}
            style={{
              background: notification.type === 'success' ? 'rgba(16, 185, 129, 0.9)' : 
                          notification.type === 'error' ? 'rgba(239, 68, 68, 0.9)' : 
                          'rgba(59, 130, 246, 0.9)',
              color: 'white',
              padding: '12px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              minWidth: '300px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              animation: 'slideIn 0.3s ease-out'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className={
                notification.type === 'success' ? 'fas fa-check-circle' :
                notification.type === 'error' ? 'fas fa-exclamation-circle' :
                'fas fa-info-circle'
              }></i>
              {notification.message}
            </div>
          </div>
        ))}
      </div>
      {/* Header - Gold Standard */}
      <div style={{ 
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '32px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'rgba(220, 38, 38, 0.1)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <i className="fas fa-users" style={{ fontSize: '20px', color: '#dc2626' }}></i>
            </div>
            <div>
              <h1 style={{ 
                fontSize: '28px', 
                fontWeight: '700', 
                color: '#FFFFFF', 
                margin: '0 0 4px 0',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}>
                Driver Operations
              </h1>
              <p style={{ color: '#9CA3AF', fontSize: '16px', margin: '0' }}>
                Manage drivers, assign loads, and verify credentials all in one place
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAddDriver(true)}
            style={{
              background: '#dc2626',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 20px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(220, 38, 38, 0.4)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.3)'
            }}
          >
            <i className="fas fa-plus" style={{ fontSize: '12px' }}></i>
            Add Driver
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        marginBottom: '32px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px 24px',
              background: activeTab === tab.id ? 'rgba(220, 38, 38, 0.1)' : 'transparent',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid #dc2626' : '2px solid transparent',
              color: activeTab === tab.id ? '#FFFFFF' : '#9CA3AF',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              position: 'relative'
            }}
            onMouseOver={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.color = '#FFFFFF'
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
              }
            }}
            onMouseOut={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.color = '#9CA3AF'
                e.currentTarget.style.background = 'transparent'
              }
            }}
          >
            <i className={tab.icon} style={{ fontSize: '16px' }}></i>
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span style={{
                background: activeTab === tab.id ? 'rgba(220, 38, 38, 0.2)' : '#dc2626',
                color: 'white',
                fontSize: '12px',
                fontWeight: 'bold',
                padding: '2px 8px',
                borderRadius: '10px',
                minWidth: '20px',
                textAlign: 'center'
              }}>
                {tab.count}
              </span>
            )}
            {tab.badge && (
              <span style={{
                background: tab.badge === 'PENDING' ? '#f59e0b' : tab.badge === 'NEW' ? '#10b981' : '#ef4444',
                color: 'white',
                fontSize: '10px',
                fontWeight: 'bold',
                padding: '2px 6px',
                borderRadius: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'drivers' && renderDriverManagement()}
      {activeTab === 'load-assignment' && renderLoadAssignment()}
      {activeTab === 'verification' && renderDriverVerification()}

      {/* Add Driver Modal */}
      {showAddDriver && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'rgba(22, 27, 38, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '32px',
            width: '500px',
            maxWidth: '90vw',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ color: '#FFFFFF', fontSize: '24px', fontWeight: '700', margin: 0 }}>
                Add New Driver
              </h2>
              <button
                onClick={() => setShowAddDriver(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#9CA3AF',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddDriver}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                    Driver Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newDriver.name}
                    onChange={(e) => setNewDriver({ ...newDriver, name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                    placeholder="Enter driver's full name"
                  />
                </div>

                <div>
                  <label style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={newDriver.phone}
                    onChange={(e) => setNewDriver({ ...newDriver, phone: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div>
                  <label style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={newDriver.email}
                    onChange={(e) => setNewDriver({ ...newDriver, email: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                    placeholder="driver@email.com"
                  />
                </div>

                <div>
                  <label style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                    License Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={newDriver.licenseNumber}
                    onChange={(e) => setNewDriver({ ...newDriver, licenseNumber: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                    placeholder="DL123456789"
                  />
                </div>

                <div>
                  <label style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                    License Expiry Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={newDriver.licenseExpiry}
                    onChange={(e) => setNewDriver({ ...newDriver, licenseExpiry: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddDriver(false)}
                  style={{
                    flex: 1,
                    padding: '12px 24px',
                    background: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: '#9CA3AF',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '12px 24px',
                    background: '#dc2626',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Add Driver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Driver Modal */}
      {showEditDriver && editingDriver && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'rgba(22, 27, 38, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '32px',
            width: '500px',
            maxWidth: '90vw',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ color: '#FFFFFF', fontSize: '24px', fontWeight: '700', margin: 0 }}>
                Edit Driver - {editingDriver.name}
              </h2>
              <button
                onClick={() => {
                  setShowEditDriver(false)
                  setEditingDriver(null)
                  setNewDriver({ name: '', phone: '', email: '', licenseNumber: '', licenseExpiry: '' })
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#9CA3AF',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleUpdateDriver}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                    Driver Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newDriver.name}
                    onChange={(e) => setNewDriver({ ...newDriver, name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                    placeholder="Enter driver's full name"
                  />
                </div>

                <div>
                  <label style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={newDriver.phone}
                    onChange={(e) => setNewDriver({ ...newDriver, phone: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div>
                  <label style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={newDriver.email}
                    onChange={(e) => setNewDriver({ ...newDriver, email: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                    placeholder="driver@email.com"
                  />
                </div>

                <div>
                  <label style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                    License Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={newDriver.licenseNumber}
                    onChange={(e) => setNewDriver({ ...newDriver, licenseNumber: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                    placeholder="DL123456789"
                  />
                </div>

                <div>
                  <label style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                    License Expiry Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={newDriver.licenseExpiry}
                    onChange={(e) => setNewDriver({ ...newDriver, licenseExpiry: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditDriver(false)
                    setEditingDriver(null)
                    setNewDriver({ name: '', phone: '', email: '', licenseNumber: '', licenseExpiry: '' })
                  }}
                  style={{
                    flex: 1,
                    padding: '12px 24px',
                    background: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: '#9CA3AF',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '12px 24px',
                    background: '#dc2626',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Update Driver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Driver Assignment Modal */}
      {showAssignmentModal && selectedLoad && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'rgba(22, 27, 38, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '32px',
            width: '600px',
            maxWidth: '90vw',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ color: '#FFFFFF', fontSize: '24px', fontWeight: '700', margin: 0 }}>
                Assign Driver to Load {selectedLoad.loadNumber}
              </h2>
              <button
                onClick={() => {
                  setShowAssignmentModal(false)
                  setSelectedLoad(null)
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#9CA3AF',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                ×
              </button>
            </div>

            {/* Load Details */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '24px'
            }}>
              <h3 style={{ color: '#FFFFFF', fontSize: '16px', fontWeight: '600', margin: '0 0 12px 0' }}>
                Load Details
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px' }}>
                <div><strong style={{ color: '#9CA3AF' }}>Route:</strong> <span style={{ color: '#FFFFFF' }}>{selectedLoad.pickupLocation} → {selectedLoad.deliveryLocation}</span></div>
                <div><strong style={{ color: '#9CA3AF' }}>Equipment:</strong> <span style={{ color: '#FFFFFF' }}>{selectedLoad.equipmentType}</span></div>
                <div><strong style={{ color: '#9CA3AF' }}>Rate:</strong> <span style={{ color: '#10B981' }}>{selectedLoad.rate}</span></div>
                <div><strong style={{ color: '#9CA3AF' }}>Customer:</strong> <span style={{ color: '#FFFFFF' }}>{selectedLoad.customerName}</span></div>
              </div>
            </div>

            {/* Available Drivers */}
            <div>
              <h3 style={{ color: '#FFFFFF', fontSize: '16px', fontWeight: '600', margin: '0 0 16px 0' }}>
                Select Driver
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                {drivers.filter(driver => driver.verified && driver.status === 'ACTIVE').map((driver) => (
                  <button
                    key={driver.id}
                    onClick={() => handleConfirmAssignment(driver)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      padding: '16px',
                      color: '#FFFFFF',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textAlign: 'left'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = 'rgba(220, 38, 38, 0.1)'
                      e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.3)'
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>{driver.name}</div>
                        <div style={{ fontSize: '12px', color: '#9CA3AF' }}>{driver.phone} • {driver.totalLoads} loads • {driver.onTimeRate}% on-time</div>
                      </div>
                      <i className="fas fa-chevron-right" style={{ color: '#9CA3AF' }}></i>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Driver Verification Modal */}
      {showVerificationModal && verifyingDriver && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'rgba(22, 27, 38, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '32px',
            width: '500px',
            maxWidth: '90vw',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ color: '#FFFFFF', fontSize: '24px', fontWeight: '700', margin: 0 }}>
                Driver Verification - {verifyingDriver.name}
              </h2>
              <button
                onClick={() => {
                  setShowVerificationModal(false)
                  setVerifyingDriver(null)
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#9CA3AF',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                ×
              </button>
            </div>

            {/* Verification Steps */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '8px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <i className="fas fa-id-card" style={{ color: '#F59E0B', fontSize: '20px' }}></i>
                <div>
                  <div style={{ color: '#F59E0B', fontWeight: '600', marginBottom: '4px' }}>License Verification</div>
                  <div style={{ color: '#9CA3AF', fontSize: '12px' }}>Verify driver's license: {verifyingDriver.licenseNumber}</div>
                </div>
              </div>

              <div style={{
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '8px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <i className="fas fa-file-medical" style={{ color: '#3B82F6', fontSize: '20px' }}></i>
                <div>
                  <div style={{ color: '#3B82F6', fontWeight: '600', marginBottom: '4px' }}>Medical Certificate</div>
                  <div style={{ color: '#9CA3AF', fontSize: '12px' }}>Verify medical certificate is current and valid</div>
                </div>
              </div>

              <div style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '8px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <i className="fas fa-shield-alt" style={{ color: '#10B981', fontSize: '20px' }}></i>
                <div>
                  <div style={{ color: '#10B981', fontWeight: '600', marginBottom: '4px' }}>Background Check</div>
                  <div style={{ color: '#9CA3AF', fontSize: '12px' }}>Complete background verification process</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
              <button
                type="button"
                onClick={() => {
                  setShowVerificationModal(false)
                  setVerifyingDriver(null)
                }}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  color: '#9CA3AF',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleStartVerification(verifyingDriver)}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  background: '#dc2626',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {verifyingDriver.verified ? 'Re-verify Driver' : 'Start Verification'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DriverManagementPage