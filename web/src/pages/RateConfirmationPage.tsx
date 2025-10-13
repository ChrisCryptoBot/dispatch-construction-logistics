import React, { useState } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import PageContainer from '../components/PageContainer'
import Card from '../components/Card'
import { 
  FileText, Download, Send, CheckCircle, Clock, MapPin, 
  Truck, DollarSign, Calendar, User, Phone, Building2, 
  AlertCircle, Edit, Save, X, Printer
} from 'lucide-react'

interface RateConfirmationData {
  id: string
  loadId: string
  poNumber: string
  date: string
  
  // Customer Info
  customerName: string
  customerAddress: string
  customerCity: string
  customerState: string
  customerZip: string
  customerPhone: string
  
  // Carrier Info
  carrierName: string
  carrierAddress: string
  carrierCity: string
  carrierState: string
  carrierZip: string
  carrierPhone: string
  
  // Load Details
  commodity: string
  equipmentType: string
  quantity: number
  quantityUnit: string
  
  // Origin & Destination
  originAddress: string
  originCity: string
  originState: string
  destinationAddress: string
  destinationCity: string
  destinationState: string
  
  // Dates & Times
  pickupDate: string
  pickupTime: string
  deliveryDate: string
  deliveryTime: string
  
  // Pricing
  rateMode: string
  rateAmount: number
  miles?: number
  deadhead?: number
  dumpFee?: number
  fuelSurcharge?: number
  tolls?: number
  accessorials?: number
  totalRate: number
  
  // Compliance
  requiresPermit: boolean
  requiresPrevailingWage: boolean
  specialInstructions?: string
  
  // Signatures
  customerSignature?: string
  carrierSignature?: string
  signedDate?: string
  status: 'draft' | 'sent' | 'signed' | 'accepted'
}

const RateConfirmationPage = () => {
  const { theme } = useTheme()
  const [showModal, setShowModal] = useState(false)
  const [editingRateCon, setEditingRateCon] = useState<RateConfirmationData | null>(null)
  const [signatureMode, setSignatureMode] = useState<'customer' | 'carrier' | null>(null)
  
  // Mock data - will be replaced with API
  const [rateConfirmations, setRateConfirmations] = useState<RateConfirmationData[]>([
    {
      id: 'RC-001',
      loadId: 'LD-123456',
      poNumber: 'PO-2024-12345',
      date: '2024-11-19',
      
      customerName: 'ABC Construction Co',
      customerAddress: '123 Main Street',
      customerCity: 'Dallas',
      customerState: 'TX',
      customerZip: '75201',
      customerPhone: '(214) 555-0123',
      
      carrierName: 'Superior One Logistics',
      carrierAddress: '456 Industrial Blvd',
      carrierCity: 'Dallas',
      carrierState: 'TX',
      carrierZip: '75202',
      carrierPhone: '(214) 555-0456',
      
      commodity: 'Crushed Stone',
      equipmentType: 'Tri-Axle Dump',
      quantity: 18,
      quantityUnit: 'tons',
      
      originAddress: 'ABC Quarry',
      originCity: 'Dallas',
      originState: 'TX',
      destinationAddress: 'Construction Site',
      destinationCity: 'Fort Worth',
      destinationState: 'TX',
      
      pickupDate: '2024-11-20',
      pickupTime: '08:00',
      deliveryDate: '2024-11-20',
      deliveryTime: '14:00',
      
      rateMode: 'Per Ton',
      rateAmount: 7.50,
      miles: 32,
      deadhead: 8,
      dumpFee: 25.00,
      fuelSurcharge: 15.00,
      tolls: 12.00,
      accessorials: 0,
      totalRate: 175.00,
      
      requiresPermit: false,
      requiresPrevailingWage: true,
      specialInstructions: 'Prevailing wage job - driver must have certified payroll',
      
      status: 'sent'
    }
  ])

  const [formData, setFormData] = useState<Partial<RateConfirmationData>>({
    loadId: '',
    poNumber: '',
    date: new Date().toISOString().split('T')[0],
    customerName: '',
    customerAddress: '',
    customerCity: '',
    customerState: 'TX',
    customerZip: '',
    customerPhone: '',
    carrierName: '',
    carrierAddress: '',
    carrierCity: '',
    carrierState: 'TX',
    carrierZip: '',
    carrierPhone: '',
    commodity: '',
    equipmentType: '',
    quantity: 0,
    quantityUnit: 'tons',
    originAddress: '',
    originCity: '',
    originState: 'TX',
    destinationAddress: '',
    destinationCity: '',
    destinationState: 'TX',
    pickupDate: '',
    pickupTime: '08:00',
    deliveryDate: '',
    deliveryTime: '14:00',
    rateMode: 'Per Ton',
    rateAmount: 0,
    miles: 0,
    deadhead: 0,
    dumpFee: 0,
    fuelSurcharge: 0,
    tolls: 0,
    accessorials: 0,
    totalRate: 0,
    requiresPermit: false,
    requiresPrevailingWage: false,
    specialInstructions: '',
    status: 'draft'
  })

  const calculateTotalRate = (data: Partial<RateConfirmationData>) => {
    const baseRate = (data.rateAmount || 0) * (data.quantity || 0)
    const fees = (data.dumpFee || 0) + (data.fuelSurcharge || 0) + (data.tolls || 0) + (data.accessorials || 0)
    return baseRate + fees
  }

  const handleSaveRateConfirmation = () => {
    if (!formData.loadId || !formData.customerName || !formData.carrierName) {
      alert('Please fill in all required fields')
      return
    }

    const totalRate = calculateTotalRate(formData)
    
    if (editingRateCon) {
      // Update existing
      setRateConfirmations(rateConfirmations.map(rc => 
        rc.id === editingRateCon.id 
          ? { ...editingRateCon, ...formData, totalRate } as RateConfirmationData
          : rc
      ))
      alert('✅ Rate Confirmation updated successfully!')
    } else {
      // Create new
      const newRateCon: RateConfirmationData = {
        id: `RC-${Date.now().toString().slice(-6)}`,
        ...formData as RateConfirmationData,
        totalRate,
        status: 'draft'
      }
      setRateConfirmations([newRateCon, ...rateConfirmations])
      alert('✅ Rate Confirmation created successfully!')
    }

    // Reset form
    setShowModal(false)
    setEditingRateCon(null)
    setFormData({
      loadId: '',
      poNumber: '',
      date: new Date().toISOString().split('T')[0],
      customerName: '',
      customerAddress: '',
      customerCity: '',
      customerState: 'TX',
      customerZip: '',
      customerPhone: '',
      carrierName: '',
      carrierAddress: '',
      carrierCity: '',
      carrierState: 'TX',
      carrierZip: '',
      carrierPhone: '',
      commodity: '',
      equipmentType: '',
      quantity: 0,
      quantityUnit: 'tons',
      originAddress: '',
      originCity: '',
      originState: 'TX',
      destinationAddress: '',
      destinationCity: '',
      destinationState: 'TX',
      pickupDate: '',
      pickupTime: '08:00',
      deliveryDate: '',
      deliveryTime: '14:00',
      rateMode: 'Per Ton',
      rateAmount: 0,
      miles: 0,
      deadhead: 0,
      dumpFee: 0,
      fuelSurcharge: 0,
      tolls: 0,
      accessorials: 0,
      totalRate: 0,
      requiresPermit: false,
      requiresPrevailingWage: false,
      specialInstructions: '',
      status: 'draft'
    })
  }

  const handleSendRateConfirmation = (id: string) => {
    setRateConfirmations(rateConfirmations.map(rc => 
      rc.id === id ? { ...rc, status: 'sent' as const } : rc
    ))
    alert('✅ Rate Confirmation sent to customer!')
  }

  const handleSignRateConfirmation = (id: string, signer: 'customer' | 'carrier') => {
    const signatureName = signer === 'customer' ? 'Customer' : 'Carrier'
    const signature = prompt(`Enter ${signatureName} signature (type your name):`)
    
    if (signature) {
      setRateConfirmations(rateConfirmations.map(rc => 
        rc.id === id 
          ? { 
              ...rc, 
              [`${signer}Signature`]: signature,
              signedDate: new Date().toISOString().split('T')[0],
              status: 'signed' as const
            }
          : rc
      ))
      alert(`✅ ${signatureName} signature added!`)
    }
  }

  const handleAcceptRateConfirmation = (id: string) => {
    setRateConfirmations(rateConfirmations.map(rc => 
      rc.id === id ? { ...rc, status: 'accepted' as const } : rc
    ))
    alert('✅ Rate Confirmation accepted! Load is now confirmed.')
  }

  const statusConfig = {
    draft: { color: theme.colors.warning, label: 'Draft', icon: Edit },
    sent: { color: theme.colors.info, label: 'Sent', icon: Send },
    signed: { color: theme.colors.success, label: 'Signed', icon: CheckCircle },
    accepted: { color: theme.colors.success, label: 'Accepted', icon: CheckCircle }
  }

  const stats = {
    total: rateConfirmations.length,
    sent: rateConfirmations.filter(rc => rc.status === 'sent').length,
    signed: rateConfirmations.filter(rc => rc.status === 'signed').length,
    accepted: rateConfirmations.filter(rc => rc.status === 'accepted').length
  }

  return (
    <PageContainer
      title="Rate Confirmations"
      subtitle="Create, manage, and track rate confirmation contracts"
      icon={FileText}
    >
      {/* Stats */}
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
              <FileText size={28} color={theme.colors.primary} />
            </div>
            <div>
              <p style={{ fontSize: '36px', fontWeight: 'bold', color: theme.colors.textPrimary, margin: 0, lineHeight: 1 }}>
                {stats.total}
              </p>
              <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: '4px 0 0 0' }}>
                Total Rate Cons
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
              <Send size={28} color={theme.colors.info} />
            </div>
            <div>
              <p style={{ fontSize: '36px', fontWeight: 'bold', color: theme.colors.textPrimary, margin: 0, lineHeight: 1 }}>
                {stats.sent}
              </p>
              <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: '4px 0 0 0' }}>
                Sent
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
                {stats.signed}
              </p>
              <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: '4px 0 0 0' }}>
                Signed
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
                {stats.accepted}
              </p>
              <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: '4px 0 0 0' }}>
                Accepted
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Create New Button */}
      <div style={{ marginBottom: '24px' }}>
        <button
          onClick={() => {
            setEditingRateCon(null)
            setFormData({
              loadId: '',
              poNumber: '',
              date: new Date().toISOString().split('T')[0],
              customerName: '',
              customerAddress: '',
              customerCity: '',
              customerState: 'TX',
              customerZip: '',
              customerPhone: '',
              carrierName: '',
              carrierAddress: '',
              carrierCity: '',
              carrierState: 'TX',
              carrierZip: '',
              carrierPhone: '',
              commodity: '',
              equipmentType: '',
              quantity: 0,
              quantityUnit: 'tons',
              originAddress: '',
              originCity: '',
              originState: 'TX',
              destinationAddress: '',
              destinationCity: '',
              destinationState: 'TX',
              pickupDate: '',
              pickupTime: '08:00',
              deliveryDate: '',
              deliveryTime: '14:00',
              rateMode: 'Per Ton',
              rateAmount: 0,
              miles: 0,
              deadhead: 0,
              dumpFee: 0,
              fuelSurcharge: 0,
              tolls: 0,
              accessorials: 0,
              totalRate: 0,
              requiresPermit: false,
              requiresPrevailingWage: false,
              specialInstructions: '',
              status: 'draft'
            })
            setShowModal(true)
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
          <FileText size={18} />
          Create Rate Confirmation
        </button>
      </div>

      {/* Rate Confirmations List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {rateConfirmations.length === 0 ? (
          <Card>
            <div style={{ 
              padding: '48px', 
              textAlign: 'center',
              color: theme.colors.textSecondary
            }}>
              <FileText size={48} style={{ margin: '0 auto', marginBottom: '16px', opacity: 0.5 }} />
              <p style={{ marginBottom: '16px' }}>No rate confirmations yet</p>
              <button
                onClick={() => setShowModal(true)}
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
                Create Your First Rate Confirmation
              </button>
            </div>
          </Card>
        ) : (
          rateConfirmations.map(rateCon => {
            const StatusIcon = statusConfig[rateCon.status].icon

            return (
              <Card key={rateCon.id}>
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
                          <FileText size={16} style={{ marginRight: '6px' }} />
                          {rateCon.id}
                        </div>
                        <div style={{ fontSize: '13px', color: theme.colors.textSecondary }}>
                          Load: {rateCon.loadId} • PO: {rateCon.poNumber}
                        </div>
                      </div>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 12px',
                        background: `${statusConfig[rateCon.status].color}20`,
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: statusConfig[rateCon.status].color
                      }}>
                        <StatusIcon size={14} />
                        {statusConfig[rateCon.status].label}
                      </div>
                    </div>

                    {/* Load Details */}
                    <div style={{ 
                      padding: '16px',
                      background: theme.colors.backgroundSecondary,
                      borderRadius: '8px',
                      marginBottom: '16px'
                    }}>
                      <div style={{ fontSize: '16px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                        {rateCon.commodity} • {rateCon.equipmentType}
                      </div>
                      <div style={{ fontSize: '13px', color: theme.colors.textSecondary, marginBottom: '8px' }}>
                        Quantity: {rateCon.quantity} {rateCon.quantityUnit}
                      </div>
                      <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: theme.colors.textSecondary }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={14} />
                          {rateCon.originCity}, {rateCon.originState} → {rateCon.destinationCity}, {rateCon.destinationState}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={14} />
                          {new Date(rateCon.pickupDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {/* Customer & Carrier Info */}
                    <div style={{ 
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '16px',
                      marginBottom: '16px'
                    }}>
                      <div style={{
                        padding: '12px',
                        background: theme.colors.backgroundTertiary,
                        borderRadius: '8px'
                      }}>
                        <div style={{ fontSize: '12px', fontWeight: '600', color: theme.colors.textSecondary, marginBottom: '4px' }}>
                          Customer
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary }}>
                          {rateCon.customerName}
                        </div>
                        <div style={{ fontSize: '12px', color: theme.colors.textSecondary }}>
                          {rateCon.customerCity}, {rateCon.customerState}
                        </div>
                      </div>
                      <div style={{
                        padding: '12px',
                        background: theme.colors.backgroundTertiary,
                        borderRadius: '8px'
                      }}>
                        <div style={{ fontSize: '12px', fontWeight: '600', color: theme.colors.textSecondary, marginBottom: '4px' }}>
                          Carrier
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary }}>
                          {rateCon.carrierName}
                        </div>
                        <div style={{ fontSize: '12px', color: theme.colors.textSecondary }}>
                          {rateCon.carrierCity}, {rateCon.carrierState}
                        </div>
                      </div>
                    </div>

                    {/* Special Instructions */}
                    {rateCon.specialInstructions && (
                      <div style={{
                        padding: '12px',
                        background: theme.colors.backgroundSecondary,
                        borderRadius: '8px',
                        borderLeft: `3px solid ${theme.colors.warning}`
                      }}>
                        <div style={{ fontSize: '11px', fontWeight: '600', color: theme.colors.textSecondary, marginBottom: '4px' }}>
                          Special Instructions
                        </div>
                        <div style={{ fontSize: '12px', color: theme.colors.textPrimary }}>
                          {rateCon.specialInstructions}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Pricing & Actions */}
                  <div style={{ 
                    flex: '0 0 280px',
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
                          Rate Breakdown
                        </div>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: theme.colors.primary }}>
                          ${rateCon.totalRate.toFixed(2)}
                        </div>
                        <div style={{ fontSize: '12px', color: theme.colors.textSecondary, marginTop: '4px' }}>
                          {rateCon.rateMode}: ${rateCon.rateAmount.toFixed(2)}
                        </div>
                        {rateCon.miles && (
                          <div style={{ fontSize: '11px', color: theme.colors.textSecondary }}>
                            {rateCon.miles} miles • {rateCon.deadhead} deadhead
                          </div>
                        )}
                      </div>

                      <div style={{ 
                        fontSize: '11px',
                        color: theme.colors.textSecondary,
                        padding: '12px',
                        background: theme.colors.backgroundSecondary,
                        borderRadius: '8px',
                        marginBottom: '16px'
                      }}>
                        Created: {new Date(rateCon.date).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {rateCon.status === 'draft' && (
                        <>
                          <button
                            onClick={() => handleSendRateConfirmation(rateCon.id)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              padding: '12px 16px',
                              background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primaryHover})`,
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              fontSize: '13px',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                          >
                            <Send size={16} />
                            Send to Customer
                          </button>
                          <button
                            onClick={() => {
                              setEditingRateCon(rateCon)
                              setFormData(rateCon)
                              setShowModal(true)
                            }}
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
                              cursor: 'pointer'
                            }}
                          >
                            <Edit size={16} />
                            Edit
                          </button>
                        </>
                      )}

                      {rateCon.status === 'sent' && (
                        <>
                          <button
                            onClick={() => handleSignRateConfirmation(rateCon.id, 'customer')}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              padding: '12px 16px',
                              background: `linear-gradient(135deg, ${theme.colors.warning}, #d97706)`,
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              fontSize: '13px',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                          >
                            <User size={16} />
                            Customer Sign
                          </button>
                          <button
                            onClick={() => handleSignRateConfirmation(rateCon.id, 'carrier')}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              padding: '12px 16px',
                              background: `linear-gradient(135deg, ${theme.colors.info}, #0284c7)`,
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              fontSize: '13px',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                          >
                            <Building2 size={16} />
                            Carrier Sign
                          </button>
                        </>
                      )}

                      {rateCon.status === 'signed' && (
                        <button
                          onClick={() => handleAcceptRateConfirmation(rateCon.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            padding: '12px 16px',
                            background: `linear-gradient(135deg, ${theme.colors.success}, #16a34a)`,
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          <CheckCircle size={16} />
                          Accept & Confirm Load
                        </button>
                      )}

                      {rateCon.status === 'accepted' && (
                        <div style={{
                          padding: '12px',
                          background: `${theme.colors.success}20`,
                          borderRadius: '8px',
                          textAlign: 'center'
                        }}>
                          <CheckCircle size={20} color={theme.colors.success} style={{ marginBottom: '4px' }} />
                          <div style={{ fontSize: '12px', fontWeight: '600', color: theme.colors.success }}>
                            Load Confirmed
                          </div>
                        </div>
                      )}

                      <button
                        onClick={() => alert('Download PDF functionality would be implemented here')}
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
                          cursor: 'pointer'
                        }}
                      >
                        <Download size={16} />
                        Download PDF
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
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
            maxWidth: '900px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '700', color: theme.colors.textPrimary }}>
                {editingRateCon ? 'Edit Rate Confirmation' : 'Create Rate Confirmation'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false)
                  setEditingRateCon(null)
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

            {/* Form - This would be a comprehensive form with all the fields */}
            <div style={{
              padding: '24px',
              background: theme.colors.backgroundSecondary,
              borderRadius: '8px',
              marginBottom: '24px'
            }}>
              <div style={{ textAlign: 'center', color: theme.colors.textSecondary }}>
                <FileText size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                <p style={{ marginBottom: '16px' }}>Rate Confirmation Form</p>
                <p style={{ fontSize: '14px' }}>
                  This would contain the full form with all fields:<br/>
                  Load details, customer info, carrier info, pricing, dates, compliance, etc.
                </p>
                <p style={{ fontSize: '12px', marginTop: '16px', color: theme.colors.textSecondary }}>
                  Form implementation would include:<br/>
                  • Auto-population from load data<br/>
                  • Real-time total calculation<br/>
                  • Validation and error handling<br/>
                  • Save as draft functionality
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '16px' }}>
              <button
                onClick={handleSaveRateConfirmation}
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
                {editingRateCon ? 'Update Rate Confirmation' : 'Create Rate Confirmation'}
              </button>
              <button
                onClick={() => {
                  setShowModal(false)
                  setEditingRateCon(null)
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

export default RateConfirmationPage

