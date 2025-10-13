import React, { useState } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import PageContainer from '../components/shared/PageContainer'
import Card from '../components/ui/Card'
import BOLTemplate from '../components/documents/BOLTemplate'
import { 
  FileText, Download, Upload, Printer, Smartphone, 
  Edit, Save, X, Eye, CheckCircle, Clock, AlertCircle,
  Building2, Truck, MapPin, Calendar, User, Phone, Package
} from 'lucide-react'

interface BOLTemplate {
  id: string
  name: string
  type: 'printable' | 'digital'
  description: string
  fields: BOLField[]
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

interface BOLField {
  id: string
  name: string
  type: 'text' | 'number' | 'date' | 'signature' | 'checkbox'
  required: boolean
  placeholder?: string
  defaultValue?: string
}

interface BOLInstance {
  id: string
  templateId: string
  loadId: string
  poNumber: string
  date: string
  
  // Shipper Info
  shipperName: string
  shipperAddress: string
  shipperCity: string
  shipperState: string
  shipperZip: string
  shipperPhone: string
  
  // Carrier Info
  carrierName: string
  carrierAddress: string
  carrierCity: string
  carrierState: string
  carrierZip: string
  carrierPhone: string
  
  // Consignee Info
  consigneeName: string
  consigneeAddress: string
  consigneeCity: string
  consigneeState: string
  consigneeZip: string
  consigneePhone: string
  
  // Load Details
  commodity: string
  equipmentType: string
  quantity: number
  quantityUnit: string
  weight: number
  weightUnit: string
  
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
  
  // Special Instructions
  specialInstructions?: string
  temperatureRequirements?: string
  hazardousMaterials?: string
  
  // Signatures
  shipperSignature?: string
  carrierSignature?: string
  consigneeSignature?: string
  signedDate?: string
  
  status: 'draft' | 'pickup_signed' | 'delivery_signed' | 'completed'
}

const BOLTemplatesPage = () => {
  const { theme } = useTheme()
  const [activeTab, setActiveTab] = useState<'templates' | 'instances'>('templates')
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [showBOLModal, setShowBOLModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<BOLTemplate | null>(null)
  const [editingBOL, setEditingBOL] = useState<BOLInstance | null>(null)
  const [viewingBOL, setViewingBOL] = useState<BOLInstance | null>(null)

  // Mock BOL Templates
  const [bolTemplates, setBolTemplates] = useState<BOLTemplate[]>([
    {
      id: 'BOL-001',
      name: 'Standard Construction BOL',
      type: 'printable',
      description: 'Standard Bill of Lading for construction materials',
      fields: [
        { id: 'shipper_name', name: 'Shipper Name', type: 'text', required: true },
        { id: 'carrier_name', name: 'Carrier Name', type: 'text', required: true },
        { id: 'consignee_name', name: 'Consignee Name', type: 'text', required: true },
        { id: 'commodity', name: 'Commodity', type: 'text', required: true },
        { id: 'quantity', name: 'Quantity', type: 'number', required: true },
        { id: 'weight', name: 'Weight', type: 'number', required: true },
        { id: 'pickup_date', name: 'Pickup Date', type: 'date', required: true },
        { id: 'delivery_date', name: 'Delivery Date', type: 'date', required: true },
        { id: 'shipper_signature', name: 'Shipper Signature', type: 'signature', required: true },
        { id: 'carrier_signature', name: 'Carrier Signature', type: 'signature', required: true },
        { id: 'consignee_signature', name: 'Consignee Signature', type: 'signature', required: true }
      ],
      isDefault: true,
      createdAt: '2024-11-01',
      updatedAt: '2024-11-19'
    },
    {
      id: 'BOL-002',
      name: 'Digital Mobile BOL',
      type: 'digital',
      description: 'Digital BOL optimized for mobile app signing',
      fields: [
        { id: 'shipper_name', name: 'Shipper Name', type: 'text', required: true },
        { id: 'carrier_name', name: 'Carrier Name', type: 'text', required: true },
        { id: 'consignee_name', name: 'Consignee Name', type: 'text', required: true },
        { id: 'commodity', name: 'Commodity', type: 'text', required: true },
        { id: 'quantity', name: 'Quantity', type: 'number', required: true },
        { id: 'pickup_date', name: 'Pickup Date', type: 'date', required: true },
        { id: 'delivery_date', name: 'Delivery Date', type: 'date', required: true },
        { id: 'shipper_signature', name: 'Shipper Signature', type: 'signature', required: true },
        { id: 'carrier_signature', name: 'Carrier Signature', type: 'signature', required: true },
        { id: 'consignee_signature', name: 'Consignee Signature', type: 'signature', required: true }
      ],
      isDefault: true,
      createdAt: '2024-11-01',
      updatedAt: '2024-11-19'
    }
  ])

  // Mock BOL Instances - Universal BOL for drivers to print and fill out
  const [bolInstances, setBolInstances] = useState<BOLInstance[]>([
    {
      id: 'BOLI-001',
      templateId: 'BOL-001',
      loadId: 'LD-123456',
      poNumber: 'PO-2024-12345',
      date: new Date().toISOString().split('T')[0],
      
      shipperName: 'ABC Construction Co',
      shipperAddress: '123 Main Street',
      shipperCity: 'Dallas',
      shipperState: 'TX',
      shipperZip: '75201',
      shipperPhone: '(214) 555-0123',
      
      carrierName: 'Superior One Logistics',
      carrierAddress: '456 Industrial Blvd',
      carrierCity: 'Dallas',
      carrierState: 'TX',
      carrierZip: '75202',
      carrierPhone: '(214) 555-0456',
      
      consigneeName: 'Fort Worth Construction Site',
      consigneeAddress: '789 Job Site Road',
      consigneeCity: 'Fort Worth',
      consigneeState: 'TX',
      consigneeZip: '76101',
      consigneePhone: '(817) 555-0789',
      
      commodity: 'Crushed Stone',
      equipmentType: 'Tri-Axle Dump',
      quantity: 18,
      quantityUnit: 'tons',
      weight: 36000,
      weightUnit: 'lbs',
      
      originAddress: 'ABC Quarry',
      originCity: 'Dallas',
      originState: 'TX',
      destinationAddress: 'Construction Site',
      destinationCity: 'Fort Worth',
      destinationState: 'TX',
      
      pickupDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      pickupTime: '08:00',
      deliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      deliveryTime: '14:00',
      
      specialInstructions: 'Handle with care - fragile materials',
      
      shipperSignature: 'John Smith',
      carrierSignature: 'Mike Johnson',
      consigneeSignature: undefined,
      
      status: 'pickup_signed'
    },
    {
      id: 'BOLI-002',
      templateId: 'BOL-001',
      loadId: 'LD-789012',
      poNumber: 'PO-2024-67890',
      date: new Date().toISOString().split('T')[0],
      
      shipperName: 'Metro Construction Group',
      shipperAddress: '456 Industrial Blvd',
      shipperCity: 'Houston',
      shipperState: 'TX',
      shipperZip: '77001',
      shipperPhone: '(713) 555-0123',
      
      carrierName: 'Superior One Logistics',
      carrierAddress: '456 Industrial Blvd',
      carrierCity: 'Dallas',
      carrierState: 'TX',
      carrierZip: '75202',
      carrierPhone: '(214) 555-0456',
      
      consigneeName: 'Downtown Development Corp',
      consigneeAddress: '321 Business District',
      consigneeCity: 'Austin',
      consigneeState: 'TX',
      consigneeZip: '73301',
      consigneePhone: '(512) 555-0789',
      
      commodity: 'Ready-Mix Concrete',
      equipmentType: 'Concrete Mixer',
      quantity: 8,
      quantityUnit: 'cubic yards',
      weight: 16000,
      weightUnit: 'lbs',
      
      originAddress: 'Metro Concrete Plant',
      originCity: 'Houston',
      originState: 'TX',
      destinationAddress: 'Downtown Construction Site',
      destinationCity: 'Austin',
      destinationState: 'TX',
      
      pickupDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      pickupTime: '06:00',
      deliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      deliveryTime: '10:00',
      
      specialInstructions: 'Deliver within 2 hours of mixing - time sensitive',
      
      shipperSignature: 'Sarah Johnson',
      carrierSignature: 'Robert Davis',
      consigneeSignature: undefined,
      
      status: 'draft'
    }
  ])

  const [templateFormData, setTemplateFormData] = useState<Partial<BOLTemplate>>({
    name: '',
    type: 'printable',
    description: '',
    fields: [],
    isDefault: false
  })

  const [bolFormData, setBolFormData] = useState<Partial<BOLInstance>>({
    templateId: 'BOL-001',
    loadId: '',
    poNumber: '',
    date: new Date().toISOString().split('T')[0],
    shipperName: '',
    shipperAddress: '',
    shipperCity: '',
    shipperState: 'TX',
    shipperZip: '',
    shipperPhone: '',
    carrierName: '',
    carrierAddress: '',
    carrierCity: '',
    carrierState: 'TX',
    carrierZip: '',
    carrierPhone: '',
    consigneeName: '',
    consigneeAddress: '',
    consigneeCity: '',
    consigneeState: 'TX',
    consigneeZip: '',
    consigneePhone: '',
    commodity: '',
    equipmentType: '',
    quantity: 0,
    quantityUnit: 'tons',
    weight: 0,
    weightUnit: 'lbs',
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
    specialInstructions: '',
    status: 'draft'
  })

  const handleSaveTemplate = () => {
    if (!templateFormData.name || !templateFormData.description) {
      alert('Please fill in all required fields')
      return
    }

    if (editingTemplate) {
      // Update existing template
      setBolTemplates(bolTemplates.map(t => 
        t.id === editingTemplate.id 
          ? { ...editingTemplate, ...templateFormData } as BOLTemplate
          : t
      ))
      alert('✅ BOL Template updated successfully!')
    } else {
      // Create new template
      const newTemplate: BOLTemplate = {
        id: `BOL-${Date.now().toString().slice(-6)}`,
        ...templateFormData as BOLTemplate,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      }
      setBolTemplates([newTemplate, ...bolTemplates])
      alert('✅ BOL Template created successfully!')
    }

    // Reset form
    setShowTemplateModal(false)
    setEditingTemplate(null)
    setTemplateFormData({
      name: '',
      type: 'printable',
      description: '',
      fields: [],
      isDefault: false
    })
  }

  const handleSaveBOL = () => {
    if (!bolFormData.loadId || !bolFormData.shipperName || !bolFormData.carrierName) {
      alert('Please fill in all required fields')
      return
    }

    if (editingBOL) {
      // Update existing BOL
      setBolInstances(bolInstances.map(b => 
        b.id === editingBOL.id 
          ? { ...editingBOL, ...bolFormData } as BOLInstance
          : b
      ))
      alert('✅ BOL updated successfully!')
    } else {
      // Create new BOL
      const newBOL: BOLInstance = {
        id: `BOLI-${Date.now().toString().slice(-6)}`,
        ...bolFormData as BOLInstance,
        status: 'draft'
      }
      setBolInstances([newBOL, ...bolInstances])
      alert('✅ BOL created successfully!')
    }

    // Reset form
    setShowBOLModal(false)
    setEditingBOL(null)
  }

  const handleSignBOL = (id: string, signer: 'shipper' | 'carrier' | 'consignee') => {
    const signatureName = signer === 'shipper' ? 'Shipper' : signer === 'carrier' ? 'Carrier' : 'Consignee'
    const signature = prompt(`Enter ${signatureName} signature (type your name):`)
    
    if (signature) {
      setBolInstances(bolInstances.map(b => {
        let newStatus = b.status
        if (signer === 'shipper' && !b.shipperSignature) {
          newStatus = 'pickup_signed'
        } else if (signer === 'consignee' && b.status === 'pickup_signed') {
          newStatus = 'delivery_signed'
        }
        
        return b.id === id 
          ? { 
              ...b, 
              [`${signer}Signature`]: signature,
              signedDate: new Date().toISOString().split('T')[0],
              status: newStatus
            }
          : b
      }))
      alert(`✅ ${signatureName} signature added!`)
    }
  }

  const handleCompleteBOL = (id: string) => {
    setBolInstances(bolInstances.map(b => 
      b.id === id ? { ...b, status: 'completed' as const } : b
    ))
    alert('✅ BOL completed! POD generated.')
  }

  const statusConfig = {
    draft: { color: theme.colors.warning, label: 'Draft', icon: Edit },
    pickup_signed: { color: theme.colors.info, label: 'Pickup Signed', icon: CheckCircle },
    delivery_signed: { color: theme.colors.success, label: 'Delivery Signed', icon: CheckCircle },
    completed: { color: theme.colors.success, label: 'Completed', icon: CheckCircle }
  }

  const stats = {
    totalTemplates: bolTemplates.length,
    totalBOLs: bolInstances.length,
    signedBOLs: bolInstances.filter(b => b.status !== 'draft').length,
    completedBOLs: bolInstances.filter(b => b.status === 'completed').length
  }

  return (
    <PageContainer
      title="BOL Templates & Management"
      subtitle="Create, manage, and track Bills of Lading"
      icon={FileText}
    >
      {/* Tabs */}
      <div style={{
        background: theme.colors.backgroundCard,
        borderRadius: '12px',
        padding: '8px',
        marginBottom: '24px',
        display: 'flex',
        gap: '8px',
        border: `1px solid ${theme.colors.border}`
      }}>
        <button
          onClick={() => setActiveTab('templates')}
          style={{
            padding: '10px 18px',
            backgroundColor: activeTab === 'templates' ? theme.colors.primary : 'transparent',
            color: activeTab === 'templates' ? 'white' : theme.colors.textSecondary,
            borderRadius: '8px',
            border: 'none',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <FileText size={16} />
          Templates
          <span style={{
            backgroundColor: activeTab === 'templates' ? 'rgba(255,255,255,0.2)' : theme.colors.primary,
            color: 'white',
            fontSize: '11px',
            fontWeight: '700',
            padding: '2px 6px',
            borderRadius: '10px',
            marginLeft: '4px'
          }}>
            {bolTemplates.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('instances')}
          style={{
            padding: '10px 18px',
            backgroundColor: activeTab === 'instances' ? theme.colors.primary : 'transparent',
            color: activeTab === 'instances' ? 'white' : theme.colors.textSecondary,
            borderRadius: '8px',
            border: 'none',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Package size={16} />
          BOL Instances
          <span style={{
            backgroundColor: activeTab === 'instances' ? 'rgba(255,255,255,0.2)' : theme.colors.primary,
            color: 'white',
            fontSize: '11px',
            fontWeight: '700',
            padding: '2px 6px',
            borderRadius: '10px',
            marginLeft: '4px'
          }}>
            {bolInstances.length}
          </span>
        </button>
      </div>

      {activeTab === 'templates' ? (
        <>
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
                    {stats.totalTemplates}
                  </p>
                  <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: '4px 0 0 0' }}>
                    Templates
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
                  <Printer size={28} color={theme.colors.info} />
                </div>
                <div>
                  <p style={{ fontSize: '36px', fontWeight: 'bold', color: theme.colors.textPrimary, margin: 0, lineHeight: 1 }}>
                    {bolTemplates.filter(t => t.type === 'printable').length}
                  </p>
                  <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: '4px 0 0 0' }}>
                    Printable
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
                  <Smartphone size={28} color={theme.colors.success} />
                </div>
                <div>
                  <p style={{ fontSize: '36px', fontWeight: 'bold', color: theme.colors.textPrimary, margin: 0, lineHeight: 1 }}>
                    {bolTemplates.filter(t => t.type === 'digital').length}
                  </p>
                  <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: '4px 0 0 0' }}>
                    Digital
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Create Template Button */}
          <div style={{ marginBottom: '24px' }}>
            <button
              onClick={() => {
                setEditingTemplate(null)
                setTemplateFormData({
                  name: '',
                  type: 'printable',
                  description: '',
                  fields: [],
                  isDefault: false
                })
                setShowTemplateModal(true)
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
              Create BOL Template
            </button>
          </div>

          {/* Templates List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {bolTemplates.map(template => (
              <Card key={template.id}>
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
                          {template.type === 'printable' ? <Printer size={16} style={{ marginRight: '6px' }} /> : <Smartphone size={16} style={{ marginRight: '6px' }} />}
                          {template.name}
                        </div>
                        <div style={{ fontSize: '13px', color: theme.colors.textSecondary }}>
                          {template.description}
                        </div>
                      </div>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 12px',
                        background: `${theme.colors.info}20`,
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: theme.colors.info
                      }}>
                        {template.type === 'printable' ? <Printer size={14} /> : <Smartphone size={14} />}
                        {template.type === 'printable' ? 'Printable' : 'Digital'}
                      </div>
                    </div>

                    {/* Fields */}
                    <div style={{ 
                      padding: '16px',
                      background: theme.colors.backgroundSecondary,
                      borderRadius: '8px',
                      marginBottom: '16px'
                    }}>
                      <div style={{ fontSize: '12px', fontWeight: '600', color: theme.colors.textSecondary, marginBottom: '8px' }}>
                        Template Fields ({template.fields.length})
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {template.fields.slice(0, 6).map(field => (
                          <span
                            key={field.id}
                            style={{
                              padding: '4px 8px',
                              background: theme.colors.backgroundTertiary,
                              border: `1px solid ${theme.colors.border}`,
                              borderRadius: '6px',
                              fontSize: '11px',
                              color: theme.colors.textPrimary
                            }}
                          >
                            {field.name}
                          </span>
                        ))}
                        {template.fields.length > 6 && (
                          <span style={{
                            padding: '4px 8px',
                            background: theme.colors.backgroundTertiary,
                            border: `1px solid ${theme.colors.border}`,
                            borderRadius: '6px',
                            fontSize: '11px',
                            color: theme.colors.textSecondary
                          }}>
                            +{template.fields.length - 6} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Metadata */}
                    <div style={{ 
                      fontSize: '11px',
                      color: theme.colors.textSecondary,
                      padding: '12px',
                      background: theme.colors.backgroundTertiary,
                      borderRadius: '8px'
                    }}>
                      Created: {new Date(template.createdAt).toLocaleDateString()} • 
                      Updated: {new Date(template.updatedAt).toLocaleDateString()}
                      {template.isDefault && (
                        <span style={{ 
                          marginLeft: '12px',
                          padding: '2px 6px',
                          background: theme.colors.success,
                          color: 'white',
                          borderRadius: '4px',
                          fontSize: '10px',
                          fontWeight: '600'
                        }}>
                          DEFAULT
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ 
                    flex: '0 0 200px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    gap: '12px'
                  }}>
                    <button
                      onClick={() => {
                        setEditingTemplate(template)
                        setTemplateFormData(template)
                        setShowTemplateModal(true)
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
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <Edit size={16} />
                      Edit Template
                    </button>

                    <button
                      onClick={() => {
                        // Create a blank BOL instance for preview (printable template)
                        const sampleBOL: BOLInstance = {
                          id: 'PREVIEW-001',
                          templateId: template.id,
                          loadId: '',
                          poNumber: '',
                          date: '',
                          
                          shipperName: '',
                          shipperAddress: '',
                          shipperCity: '',
                          shipperState: '',
                          shipperZip: '',
                          shipperPhone: '',
                          
                          carrierName: '',
                          carrierAddress: '',
                          carrierCity: '',
                          carrierState: '',
                          carrierZip: '',
                          carrierPhone: '',
                          
                          consigneeName: '',
                          consigneeAddress: '',
                          consigneeCity: '',
                          consigneeState: '',
                          consigneeZip: '',
                          consigneePhone: '',
                          
                          commodity: '',
                          equipmentType: '',
                          quantity: 0,
                          quantityUnit: '',
                          weight: 0,
                          weightUnit: '',
                          
                          originAddress: '',
                          originCity: '',
                          originState: '',
                          destinationAddress: '',
                          destinationCity: '',
                          destinationState: '',
                          
                          pickupDate: '',
                          pickupTime: '',
                          deliveryDate: '',
                          deliveryTime: '',
                          
                          specialInstructions: '',
                          
                          shipperSignature: '',
                          carrierSignature: '',
                          consigneeSignature: undefined,
                          
                          status: 'draft'
                        }
                        setViewingBOL(sampleBOL)
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
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <Eye size={16} />
                      Preview
                    </button>

                    {template.type === 'printable' ? (
                      <button
                        onClick={() => alert('Print functionality would be implemented here')}
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
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <Printer size={16} />
                        Print Template
                      </button>
                    ) : (
                      <button
                        onClick={() => alert('Mobile app integration would be implemented here')}
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
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <Smartphone size={16} />
                        Mobile App
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <>
          {/* BOL Instances Stats */}
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
                  <Package size={28} color={theme.colors.primary} />
                </div>
                <div>
                  <p style={{ fontSize: '36px', fontWeight: 'bold', color: theme.colors.textPrimary, margin: 0, lineHeight: 1 }}>
                    {stats.totalBOLs}
                  </p>
                  <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: '4px 0 0 0' }}>
                    Total BOLs
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
                  <CheckCircle size={28} color={theme.colors.info} />
                </div>
                <div>
                  <p style={{ fontSize: '36px', fontWeight: 'bold', color: theme.colors.textPrimary, margin: 0, lineHeight: 1 }}>
                    {stats.signedBOLs}
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
                    {stats.completedBOLs}
                  </p>
                  <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: '4px 0 0 0' }}>
                    Completed
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Create BOL Button */}
          <div style={{ marginBottom: '24px' }}>
            <button
              onClick={() => {
                setEditingBOL(null)
                setBolFormData({
                  templateId: 'BOL-001',
                  loadId: '',
                  poNumber: '',
                  date: new Date().toISOString().split('T')[0],
                  shipperName: '',
                  shipperAddress: '',
                  shipperCity: '',
                  shipperState: 'TX',
                  shipperZip: '',
                  shipperPhone: '',
                  carrierName: '',
                  carrierAddress: '',
                  carrierCity: '',
                  carrierState: 'TX',
                  carrierZip: '',
                  carrierPhone: '',
                  consigneeName: '',
                  consigneeAddress: '',
                  consigneeCity: '',
                  consigneeState: 'TX',
                  consigneeZip: '',
                  consigneePhone: '',
                  commodity: '',
                  equipmentType: '',
                  quantity: 0,
                  quantityUnit: 'tons',
                  weight: 0,
                  weightUnit: 'lbs',
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
                  specialInstructions: '',
                  status: 'draft'
                })
                setShowBOLModal(true)
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
              <Package size={18} />
              Create BOL
            </button>
          </div>

          {/* BOL Instances List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {bolInstances.map(bol => {
              const StatusIcon = statusConfig[bol.status].icon

              return (
                <Card key={bol.id}>
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
                            <Package size={16} style={{ marginRight: '6px' }} />
                            {bol.id}
                          </div>
                          <div style={{ fontSize: '13px', color: theme.colors.textSecondary }}>
                            Load: {bol.loadId} • PO: {bol.poNumber}
                          </div>
                        </div>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 12px',
                          background: `${statusConfig[bol.status].color}20`,
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '600',
                          color: statusConfig[bol.status].color
                        }}>
                          <StatusIcon size={14} />
                          {statusConfig[bol.status].label}
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
                          {bol.commodity} • {bol.equipmentType}
                        </div>
                        <div style={{ fontSize: '13px', color: theme.colors.textSecondary, marginBottom: '8px' }}>
                          Quantity: {bol.quantity} {bol.quantityUnit} • Weight: {bol.weight.toLocaleString()} {bol.weightUnit}
                        </div>
                        <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: theme.colors.textSecondary }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={14} />
                            {bol.originCity}, {bol.originState} → {bol.destinationCity}, {bol.destinationState}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={14} />
                            {new Date(bol.pickupDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      {/* Parties Info */}
                      <div style={{ 
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr',
                        gap: '12px',
                        marginBottom: '16px'
                      }}>
                        <div style={{
                          padding: '12px',
                          background: theme.colors.backgroundTertiary,
                          borderRadius: '8px'
                        }}>
                          <div style={{ fontSize: '12px', fontWeight: '600', color: theme.colors.textSecondary, marginBottom: '4px' }}>
                            Shipper
                          </div>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary }}>
                            {bol.shipperName}
                          </div>
                          <div style={{ fontSize: '12px', color: theme.colors.textSecondary }}>
                            {bol.shipperCity}, {bol.shipperState}
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
                            {bol.carrierName}
                          </div>
                          <div style={{ fontSize: '12px', color: theme.colors.textSecondary }}>
                            {bol.carrierCity}, {bol.carrierState}
                          </div>
                        </div>
                        <div style={{
                          padding: '12px',
                          background: theme.colors.backgroundTertiary,
                          borderRadius: '8px'
                        }}>
                          <div style={{ fontSize: '12px', fontWeight: '600', color: theme.colors.textSecondary, marginBottom: '4px' }}>
                            Consignee
                          </div>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary }}>
                            {bol.consigneeName}
                          </div>
                          <div style={{ fontSize: '12px', color: theme.colors.textSecondary }}>
                            {bol.destinationCity}, {bol.destinationState}
                          </div>
                        </div>
                      </div>

                      {/* Special Instructions */}
                      {bol.specialInstructions && (
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
                            {bol.specialInstructions}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Signatures & Actions */}
                    <div style={{ 
                      flex: '0 0 280px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}>
                      {/* Signatures */}
                      <div>
                        <div style={{ 
                          padding: '16px',
                          background: `${theme.colors.primary}10`,
                          borderRadius: '8px',
                          marginBottom: '16px'
                        }}>
                          <div style={{ fontSize: '11px', color: theme.colors.textSecondary, marginBottom: '8px' }}>
                            Signatures
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '12px', color: theme.colors.textPrimary }}>Shipper:</span>
                              <span style={{ fontSize: '12px', color: bol.shipperSignature ? theme.colors.success : theme.colors.textSecondary }}>
                                {bol.shipperSignature || 'Not signed'}
                              </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '12px', color: theme.colors.textPrimary }}>Carrier:</span>
                              <span style={{ fontSize: '12px', color: bol.carrierSignature ? theme.colors.success : theme.colors.textSecondary }}>
                                {bol.carrierSignature || 'Not signed'}
                              </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '12px', color: theme.colors.textPrimary }}>Consignee:</span>
                              <span style={{ fontSize: '12px', color: bol.consigneeSignature ? theme.colors.success : theme.colors.textSecondary }}>
                                {bol.consigneeSignature || 'Not signed'}
                              </span>
                            </div>
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
                          Created: {new Date(bol.date).toLocaleDateString()}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {/* View BOL Button - Always Available */}
                        <button
                          onClick={() => setViewingBOL(bol)}
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
                          <Eye size={16} />
                          View BOL
                        </button>

                        {bol.status === 'draft' && (
                          <button
                            onClick={() => handleSignBOL(bol.id, 'shipper')}
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
                            Shipper Sign
                          </button>
                        )}

                        {bol.status === 'pickup_signed' && (
                          <button
                            onClick={() => handleSignBOL(bol.id, 'consignee')}
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
                            Consignee Sign
                          </button>
                        )}

                        {bol.status === 'delivery_signed' && (
                          <button
                            onClick={() => handleCompleteBOL(bol.id)}
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
                            Complete BOL
                          </button>
                        )}

                        {bol.status === 'completed' && (
                          <div style={{
                            padding: '12px',
                            background: `${theme.colors.success}20`,
                            borderRadius: '8px',
                            textAlign: 'center'
                          }}>
                            <CheckCircle size={20} color={theme.colors.success} style={{ marginBottom: '4px' }} />
                            <div style={{ fontSize: '12px', fontWeight: '600', color: theme.colors.success }}>
                              BOL Completed
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
            })}
          </div>
        </>
      )}

      {/* Template Modal */}
      {showTemplateModal && (
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
                {editingTemplate ? 'Edit BOL Template' : 'Create BOL Template'}
              </h2>
              <button
                onClick={() => {
                  setShowTemplateModal(false)
                  setEditingTemplate(null)
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

            {/* Template Form */}
            <div style={{
              padding: '24px',
              background: theme.colors.backgroundSecondary,
              borderRadius: '8px',
              marginBottom: '24px'
            }}>
              <div style={{ textAlign: 'center', color: theme.colors.textSecondary }}>
                <FileText size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                <p style={{ marginBottom: '16px' }}>BOL Template Configuration</p>
                <p style={{ fontSize: '14px' }}>
                  This would contain the full template form with:<br/>
                  • Template name and description<br/>
                  • Field configuration (text, number, date, signature)<br/>
                  • Required field settings<br/>
                  • Print/digital template options
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '16px' }}>
              <button
                onClick={handleSaveTemplate}
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
                {editingTemplate ? 'Update Template' : 'Create Template'}
              </button>
              <button
                onClick={() => {
                  setShowTemplateModal(false)
                  setEditingTemplate(null)
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

      {/* BOL Modal */}
      {showBOLModal && (
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
                {editingBOL ? 'Edit BOL' : 'Create BOL'}
              </h2>
              <button
                onClick={() => {
                  setShowBOLModal(false)
                  setEditingBOL(null)
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

            {/* BOL Form */}
            <div style={{
              padding: '24px',
              background: theme.colors.backgroundSecondary,
              borderRadius: '8px',
              marginBottom: '24px'
            }}>
              <div style={{ textAlign: 'center', color: theme.colors.textSecondary }}>
                <Package size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                <p style={{ marginBottom: '16px' }}>BOL Creation Form</p>
                <p style={{ fontSize: '14px' }}>
                  This would contain the full BOL form with:<br/>
                  • Load and PO number auto-population<br/>
                  • Shipper, carrier, and consignee information<br/>
                  • Load details (commodity, quantity, weight)<br/>
                  • Origin and destination addresses<br/>
                  • Pickup and delivery dates/times
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '16px' }}>
              <button
                onClick={handleSaveBOL}
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
                {editingBOL ? 'Update BOL' : 'Create BOL'}
              </button>
              <button
                onClick={() => {
                  setShowBOLModal(false)
                  setEditingBOL(null)
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

      {/* BOL Viewer Modal */}
      {viewingBOL && (
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
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: theme.colors.backgroundPrimary,
            borderRadius: '12px',
            width: '100%',
            maxWidth: '90vw',
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'relative'
          }}>
            {/* Close Button */}
            <button
              onClick={() => setViewingBOL(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                padding: '8px',
                background: theme.colors.backgroundSecondary,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: '6px',
                color: theme.colors.textPrimary,
                cursor: 'pointer',
                zIndex: 1001
              }}
            >
              <X size={20} />
            </button>

            {/* BOL Template Component */}
            <BOLTemplate
              data={{
                loadId: viewingBOL.loadId,
                poNumber: viewingBOL.poNumber,
                date: viewingBOL.date,
                shipperName: viewingBOL.shipperName,
                shipperAddress: viewingBOL.shipperAddress,
                shipperCity: viewingBOL.shipperCity,
                shipperState: viewingBOL.shipperState,
                shipperZip: viewingBOL.shipperZip,
                shipperPhone: viewingBOL.shipperPhone,
                carrierName: viewingBOL.carrierName,
                carrierAddress: viewingBOL.carrierAddress,
                carrierCity: viewingBOL.carrierCity,
                carrierState: viewingBOL.carrierState,
                carrierZip: viewingBOL.carrierZip,
                carrierPhone: viewingBOL.carrierPhone,
                driverName: 'John Driver',
                driverLicense: 'DL123456789',
                driverPhone: '555-0123',
                truckNumber: 'TRK-001',
                trailerNumber: 'TRL-001',
                equipmentType: viewingBOL.equipmentType,
                pickupDate: viewingBOL.pickupDate,
                pickupTime: viewingBOL.pickupTime,
                pickupLocation: 'Pickup Site',
                pickupAddress: viewingBOL.originAddress,
                pickupCity: viewingBOL.originCity,
                pickupState: viewingBOL.originState,
                pickupZip: '12345',
                pickupContact: 'Site Manager',
                pickupPhone: '555-0100',
                deliveryDate: viewingBOL.deliveryDate,
                deliveryTime: viewingBOL.deliveryTime,
                deliveryLocation: 'Delivery Site',
                deliveryAddress: viewingBOL.destinationAddress,
                deliveryCity: viewingBOL.destinationCity,
                deliveryState: viewingBOL.destinationState,
                deliveryZip: '54321',
                deliveryContact: 'Site Manager',
                deliveryPhone: '555-0200',
                commodity: viewingBOL.commodity,
                weight: viewingBOL.weight.toString(),
                pieces: viewingBOL.quantity.toString(),
                description: `${viewingBOL.commodity} - ${viewingBOL.quantity} ${viewingBOL.quantityUnit}`,
                specialInstructions: viewingBOL.specialInstructions || 'Handle with care',
                shipperSignature: viewingBOL.shipperSignature || '',
                shipperDate: viewingBOL.signedDate || '',
                carrierSignature: viewingBOL.carrierSignature || '',
                carrierDate: viewingBOL.signedDate || '',
                driverSignature: '',
                driverDate: '',
                receiverSignature: viewingBOL.consigneeSignature || '',
                receiverDate: viewingBOL.signedDate || ''
              }}
              onPrint={() => console.log('Printing BOL...')}
              onDownload={() => console.log('Downloading BOL...')}
              onEdit={() => {
                setViewingBOL(null)
                setEditingBOL(viewingBOL)
                setShowBOLModal(true)
              }}
            />
          </div>
        </div>
      )}
    </PageContainer>
  )
}

export default BOLTemplatesPage
