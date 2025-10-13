import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from '../../contexts/ThemeContext'
import SuperiorOneLogo from '../../components/ui/SuperiorOneLogo'
import CarrierPacket from '../../components/carrier/CarrierPacket'
import { 
  Truck, Building2, FileText, CheckCircle, ArrowRight, ArrowLeft,
  User, Phone, Mail, MapPin, CreditCard, Shield, Upload, X
} from 'lucide-react'

const CarrierOnboardingPage = () => {
  const { theme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [currentStep, setCurrentStep] = useState(1)
  const [showCarrierPacket, setShowCarrierPacket] = useState(false)
  const [formData, setFormData] = useState({
    // Step 1: Company Information
    companyName: '',
    dbaName: '',
    mcNumber: '',
    dotNumber: '',
    ein: '',
    yearsInBusiness: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    email: '',
    
    // Step 2: Contact Information
    primaryContact: '',
    primaryPhone: '',
    primaryEmail: '',
    dispatcherName: '',
    dispatcherPhone: '',
    dispatcherEmail: '',
    
    // Step 3: Insurance Information
    insuranceProvider: '',
    policyNumber: '',
    coverageAmount: '',
    expirationDate: '',
    cargoInsuranceProvider: '',
    cargoPolicyNumber: '',
    cargoCoverageAmount: '',
    generalLiabilityProvider: '',
    generalLiabilityPolicyNumber: '',
    generalLiabilityCoverageAmount: '',
    workersCompProvider: '',
    workersCompPolicyNumber: '',
    
    // Step 4: Banking Information
    bankName: '',
    accountNumber: '',
    routingNumber: '',
    
    // Step 5: Fleet Information
    totalTrucks: '',
    totalTrailers: '',
    averageMilesPerMonth: '',
    operatingStates: '',
    equipmentTypes: [] as string[],
    
    // Step 6: Carrier Packet
    carrierPacketSigned: false,
    carrierPacketDate: '',
    termsAccepted: false,
    privacyAccepted: false,
    
    // Anti-Double Brokering Security
    insuranceVerified: false,
    insuranceVerificationDate: '',
    w9Verified: false,
    w9VerificationDate: '',
    bankAccountVerified: false,
    bankVerificationDate: '',
    bondAmount: '',
    bondProvider: '',
    bondExpirationDate: '',
    driverVerificationCompleted: false,
    driverVerificationDate: '',
    blacklistCheckCompleted: false,
    blacklistCheckDate: '',
    antiDoubleBrokeringAgreement: false,
    
    // Document Uploads
    w9File: null as File | null,
    w9FileName: '',
    insuranceCertificate: null as File | null,
    insuranceCertificateName: '',
    bankStatement: null as File | null,
    bankStatementName: ''
  })

  const equipmentOptions = [
    'Tri-Axle Dump',
    'End Dump',
    'Side Dump', 
    'Belly Dump',
    'Flatbed',
    'Step Deck',
    'Lowboy',
    'Double Drop',
    'Super Dump',
    'Mixer Truck'
  ]

  const steps = [
    { number: 1, title: 'Company Info', icon: Building2 },
    { number: 2, title: 'Contacts', icon: User },
    { number: 3, title: 'Insurance', icon: Shield },
    { number: 4, title: 'Banking', icon: CreditCard },
    { number: 5, title: 'Fleet', icon: Truck },
    { number: 6, title: 'Documents', icon: Upload },
    { number: 7, title: 'Contract', icon: FileText }
  ]

  const handleNext = () => {
    if (currentStep < 7) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleFileUpload = (field: string, file: File) => {
    setFormData(prev => ({
      ...prev,
      [field]: file,
      [`${field}Name`]: file.name
    }))
  }

  const handleFileRemove = (field: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: null,
      [`${field}Name`]: ''
    }))
  }

  const handleComplete = () => {
    // Mock completion - in production this would save to backend
    const mockToken = 'dev-carrier-token-' + Date.now()
    const mockUser = {
      id: 'user-new-' + Date.now(),
      email: formData.email,
      firstName: formData.primaryContact.split(' ')[0] || 'Carrier',
      lastName: formData.primaryContact.split(' ')[1] || 'User',
      role: 'carrier'
    }
    const mockOrg = {
      id: 'org-new-' + Date.now(),
      name: formData.companyName,
      type: 'CARRIER'
    }
    
    localStorage.setItem('token', mockToken)
    localStorage.setItem('user', JSON.stringify(mockUser))
    localStorage.setItem('organization', JSON.stringify(mockOrg))
    
    alert('✅ Carrier onboarding completed successfully!')
    navigate('/carrier-dashboard')
  }

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div style={{ display: 'grid', gap: '20px' }}>
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: theme.colors.textPrimary, marginBottom: '20px' }}>
              Company Information
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                  Company Name *
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => updateFormData('companyName', e.target.value)}
                  placeholder="Superior One Logistics"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: theme.colors.backgroundSecondary,
                    border: `2px solid ${theme.colors.border}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: theme.colors.textPrimary,
                    outline: 'none'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                  DBA Name
                </label>
                <input
                  type="text"
                  value={formData.dbaName}
                  onChange={(e) => updateFormData('dbaName', e.target.value)}
                  placeholder="DBA Name (if different)"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                  MC Number
                </label>
                <input
                  type="text"
                  value={formData.mcNumber}
                  onChange={(e) => updateFormData('mcNumber', e.target.value)}
                  placeholder="MC-123456"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: theme.colors.backgroundSecondary,
                    border: `2px solid ${theme.colors.border}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: theme.colors.textPrimary,
                    outline: 'none'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                  DOT Number *
                </label>
                <input
                  type="text"
                  value={formData.dotNumber}
                  onChange={(e) => updateFormData('dotNumber', e.target.value)}
                  placeholder="DOT-123456"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                  EIN (Tax ID) *
                </label>
                <input
                  type="text"
                  value={formData.ein}
                  onChange={(e) => updateFormData('ein', e.target.value)}
                  placeholder="12-3456789"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: theme.colors.backgroundSecondary,
                    border: `2px solid ${theme.colors.border}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: theme.colors.textPrimary,
                    outline: 'none'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                  Years in Business *
                </label>
                <input
                  type="text"
                  value={formData.yearsInBusiness || ''}
                  onChange={(e) => updateFormData('yearsInBusiness', e.target.value)}
                  placeholder="5"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                  EIN *
                </label>
                <input
                  type="text"
                  value={formData.ein}
                  onChange={(e) => updateFormData('ein', e.target.value)}
                  placeholder="12-3456789"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: theme.colors.backgroundSecondary,
                    border: `2px solid ${theme.colors.border}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: theme.colors.textPrimary,
                    outline: 'none'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                  Address *
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => updateFormData('address', e.target.value)}
                  placeholder="123 Main Street"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                  City *
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => updateFormData('city', e.target.value)}
                  placeholder="Dallas"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: theme.colors.backgroundSecondary,
                    border: `2px solid ${theme.colors.border}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: theme.colors.textPrimary,
                    outline: 'none'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                  State *
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => updateFormData('state', e.target.value)}
                  placeholder="TX"
                  maxLength={2}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: theme.colors.backgroundSecondary,
                    border: `2px solid ${theme.colors.border}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: theme.colors.textPrimary,
                    outline: 'none'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                  Zip Code *
                </label>
                <input
                  type="text"
                  value={formData.zipCode}
                  onChange={(e) => updateFormData('zipCode', e.target.value)}
                  placeholder="75201"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                  Phone *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateFormData('phone', e.target.value)}
                  placeholder="(214) 555-0123"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: theme.colors.backgroundSecondary,
                    border: `2px solid ${theme.colors.border}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: theme.colors.textPrimary,
                    outline: 'none'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  placeholder="admin@company.com"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
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
          </div>
        )

      case 2:
        return (
          <div style={{ display: 'grid', gap: '20px' }}>
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: theme.colors.textPrimary, marginBottom: '20px' }}>
              Contact Information
            </h3>
            
            <div style={{
              padding: '20px',
              background: theme.colors.backgroundSecondary,
              borderRadius: '12px',
              border: `1px solid ${theme.colors.border}`
            }}>
              <h4 style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '16px' }}>
                Primary Contact
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.primaryContact}
                    onChange={(e) => updateFormData('primaryContact', e.target.value)}
                    placeholder="John Smith"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: theme.colors.backgroundPrimary,
                      border: `2px solid ${theme.colors.border}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      color: theme.colors.textPrimary,
                      outline: 'none'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                    Phone *
                  </label>
                  <input
                    type="tel"
                    value={formData.primaryPhone}
                    onChange={(e) => updateFormData('primaryPhone', e.target.value)}
                    placeholder="(214) 555-0123"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: theme.colors.backgroundPrimary,
                      border: `2px solid ${theme.colors.border}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      color: theme.colors.textPrimary,
                      outline: 'none'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.primaryEmail}
                    onChange={(e) => updateFormData('primaryEmail', e.target.value)}
                    placeholder="john@company.com"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: theme.colors.backgroundPrimary,
                      border: `2px solid ${theme.colors.border}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      color: theme.colors.textPrimary,
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
            </div>

            <div style={{
              padding: '20px',
              background: theme.colors.backgroundSecondary,
              borderRadius: '12px',
              border: `1px solid ${theme.colors.border}`
            }}>
              <h4 style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '16px' }}>
                Dispatcher Contact (Optional)
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.dispatcherName}
                    onChange={(e) => updateFormData('dispatcherName', e.target.value)}
                    placeholder="Jane Doe"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: theme.colors.backgroundPrimary,
                      border: `2px solid ${theme.colors.border}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      color: theme.colors.textPrimary,
                      outline: 'none'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.dispatcherPhone}
                    onChange={(e) => updateFormData('dispatcherPhone', e.target.value)}
                    placeholder="(214) 555-0456"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: theme.colors.backgroundPrimary,
                      border: `2px solid ${theme.colors.border}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      color: theme.colors.textPrimary,
                      outline: 'none'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.dispatcherEmail}
                    onChange={(e) => updateFormData('dispatcherEmail', e.target.value)}
                    placeholder="jane@company.com"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: theme.colors.backgroundPrimary,
                      border: `2px solid ${theme.colors.border}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      color: theme.colors.textPrimary,
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div style={{ display: 'grid', gap: '20px' }}>
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: theme.colors.textPrimary, marginBottom: '20px' }}>
              Insurance Information
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                  Insurance Provider *
                </label>
                <input
                  type="text"
                  value={formData.insuranceProvider}
                  onChange={(e) => updateFormData('insuranceProvider', e.target.value)}
                  placeholder="ABC Insurance Co"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: theme.colors.backgroundSecondary,
                    border: `2px solid ${theme.colors.border}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: theme.colors.textPrimary,
                    outline: 'none'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                  Policy Number *
                </label>
                <input
                  type="text"
                  value={formData.policyNumber}
                  onChange={(e) => updateFormData('policyNumber', e.target.value)}
                  placeholder="POL-123456789"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                  Coverage Amount *
                </label>
                <input
                  type="text"
                  value={formData.coverageAmount}
                  onChange={(e) => updateFormData('coverageAmount', e.target.value)}
                  placeholder="$1,000,000"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: theme.colors.backgroundSecondary,
                    border: `2px solid ${theme.colors.border}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: theme.colors.textPrimary,
                    outline: 'none'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                  Expiration Date *
                </label>
                <input
                  type="date"
                  value={formData.expirationDate}
                  onChange={(e) => updateFormData('expirationDate', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
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

            <div style={{
              padding: '16px',
              background: `${theme.colors.info}10`,
              borderRadius: '8px',
              border: `1px solid ${theme.colors.info}20`
            }}>
              <div style={{ fontSize: '14px', color: theme.colors.textSecondary }}>
                <strong>Note:</strong> You will need to upload your Certificate of Insurance (COI) 
                before your account can be activated. This can be done after completing onboarding.
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div style={{ display: 'grid', gap: '20px' }}>
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: theme.colors.textPrimary, marginBottom: '20px' }}>
              Banking Information
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                  Bank Name *
                </label>
                <input
                  type="text"
                  value={formData.bankName}
                  onChange={(e) => updateFormData('bankName', e.target.value)}
                  placeholder="First National Bank"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: theme.colors.backgroundSecondary,
                    border: `2px solid ${theme.colors.border}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: theme.colors.textPrimary,
                    outline: 'none'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                  Routing Number *
                </label>
                <input
                  type="text"
                  value={formData.routingNumber}
                  onChange={(e) => updateFormData('routingNumber', e.target.value)}
                  placeholder="123456789"
                  maxLength={9}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
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

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                Account Number *
              </label>
              <input
                type="text"
                value={formData.accountNumber}
                onChange={(e) => updateFormData('accountNumber', e.target.value)}
                placeholder="1234567890"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: theme.colors.backgroundSecondary,
                  border: `2px solid ${theme.colors.border}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: theme.colors.textPrimary,
                  outline: 'none'
                }}
              />
            </div>

            <div style={{
              padding: '16px',
              background: `${theme.colors.success}10`,
              borderRadius: '8px',
              border: `1px solid ${theme.colors.success}20`
            }}>
              <div style={{ fontSize: '14px', color: theme.colors.textSecondary }}>
                <strong>Secure:</strong> Your banking information is encrypted and stored securely. 
                This information is only used for payment processing and will not be shared.
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div style={{ display: 'grid', gap: '20px' }}>
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: theme.colors.textPrimary, marginBottom: '20px' }}>
              Fleet Information
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                  Total Trucks *
                </label>
                <input
                  type="number"
                  value={formData.totalTrucks}
                  onChange={(e) => updateFormData('totalTrucks', e.target.value)}
                  placeholder="5"
                  min="1"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: theme.colors.backgroundSecondary,
                    border: `2px solid ${theme.colors.border}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: theme.colors.textPrimary,
                    outline: 'none'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                  Total Trailers *
                </label>
                <input
                  type="number"
                  value={formData.totalTrailers}
                  onChange={(e) => updateFormData('totalTrailers', e.target.value)}
                  placeholder="8"
                  min="0"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
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

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '12px' }}>
                Equipment Types *
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                {equipmentOptions.map(equipment => (
                  <label key={equipment} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px',
                    background: theme.colors.backgroundSecondary,
                    border: `2px solid ${formData.equipmentTypes.includes(equipment) ? theme.colors.primary : theme.colors.border}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}>
                    <input
                      type="checkbox"
                      checked={formData.equipmentTypes.includes(equipment)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          updateFormData('equipmentTypes', [...formData.equipmentTypes, equipment])
                        } else {
                          updateFormData('equipmentTypes', formData.equipmentTypes.filter(t => t !== equipment))
                        }
                      }}
                      style={{ margin: 0 }}
                    />
                    <span style={{ fontSize: '14px', color: theme.colors.textPrimary }}>
                      {equipment}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )

      case 6:
        return (
          <div style={{ display: 'grid', gap: '20px' }}>
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: theme.colors.textPrimary, marginBottom: '20px' }}>
              Required Documents
            </h3>
            
            <div style={{
              padding: '20px',
              background: theme.colors.backgroundSecondary,
              borderRadius: '12px',
              border: `1px solid ${theme.colors.border}`
            }}>
              <h4 style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '16px' }}>
                Anti-Double Brokering Security Documents
              </h4>
              <p style={{ fontSize: '14px', color: theme.colors.textSecondary, marginBottom: '20px' }}>
                Upload the following documents to complete your carrier verification and prevent double brokering.
              </p>
              
              {/* W-9 Upload */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '16px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '12px' }}>
                  W-9 Tax Form * (Required for Anti-Double Brokering)
                </label>
                <div style={{
                  padding: '16px',
                  background: theme.colors.backgroundPrimary,
                  borderRadius: '8px',
                  border: `2px dashed ${formData.w9File ? theme.colors.success : theme.colors.border}`,
                  textAlign: 'center'
                }}>
                  {formData.w9File ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <FileText size={20} color={theme.colors.success} />
                        <span style={{ fontSize: '14px', color: theme.colors.success, fontWeight: '600' }}>
                          {formData.w9FileName}
                        </span>
                      </div>
                      <button
                        onClick={() => handleFileRemove('w9File')}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: theme.colors.error,
                          cursor: 'pointer',
                          padding: '4px'
                        }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload size={32} color={theme.colors.textSecondary} style={{ marginBottom: '8px' }} />
                      <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: '0 0 8px 0' }}>
                        Click to upload W-9 form
                      </p>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleFileUpload('w9File', file)
                        }}
                        style={{ display: 'none' }}
                        id="w9-upload"
                      />
                      <label
                        htmlFor="w9-upload"
                        style={{
                          display: 'inline-block',
                          padding: '8px 16px',
                          background: theme.colors.primary,
                          color: 'white',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '600'
                        }}
                      >
                        Choose File
                      </label>
                    </div>
                  )}
                </div>
                <p style={{ fontSize: '12px', color: theme.colors.textSecondary, marginTop: '8px' }}>
                  W-9 forms will be verified with IRS records to prevent double brokering schemes.
                </p>
              </div>

              {/* Insurance Certificate Upload */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '16px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '12px' }}>
                  Insurance Certificate * (Required for Anti-Double Brokering)
                </label>
                <div style={{
                  padding: '16px',
                  background: theme.colors.backgroundPrimary,
                  borderRadius: '8px',
                  border: `2px dashed ${formData.insuranceCertificate ? theme.colors.success : theme.colors.border}`,
                  textAlign: 'center'
                }}>
                  {formData.insuranceCertificate ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Shield size={20} color={theme.colors.success} />
                        <span style={{ fontSize: '14px', color: theme.colors.success, fontWeight: '600' }}>
                          {formData.insuranceCertificateName}
                        </span>
                      </div>
                      <button
                        onClick={() => handleFileRemove('insuranceCertificate')}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: theme.colors.error,
                          cursor: 'pointer',
                          padding: '4px'
                        }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload size={32} color={theme.colors.textSecondary} style={{ marginBottom: '8px' }} />
                      <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: '0 0 8px 0' }}>
                        Click to upload insurance certificate
                      </p>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleFileUpload('insuranceCertificate', file)
                        }}
                        style={{ display: 'none' }}
                        id="insurance-upload"
                      />
                      <label
                        htmlFor="insurance-upload"
                        style={{
                          display: 'inline-block',
                          padding: '8px 16px',
                          background: theme.colors.primary,
                          color: 'white',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '600'
                        }}
                      >
                        Choose File
                      </label>
                    </div>
                  )}
                </div>
                <p style={{ fontSize: '12px', color: theme.colors.textSecondary, marginTop: '8px' }}>
                  Insurance certificates will be verified directly with your insurance provider. 
                  Must name Superior One Logistics as certificate holder.
                </p>
              </div>

              {/* Bank Statement Upload */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '16px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '12px' }}>
                  Bank Statement * (Required for Anti-Double Brokering)
                </label>
                <div style={{
                  padding: '16px',
                  background: theme.colors.backgroundPrimary,
                  borderRadius: '8px',
                  border: `2px dashed ${formData.bankStatement ? theme.colors.success : theme.colors.border}`,
                  textAlign: 'center'
                }}>
                  {formData.bankStatement ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <CreditCard size={20} color={theme.colors.success} />
                        <span style={{ fontSize: '14px', color: theme.colors.success, fontWeight: '600' }}>
                          {formData.bankStatementName}
                        </span>
                      </div>
                      <button
                        onClick={() => handleFileRemove('bankStatement')}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: theme.colors.error,
                          cursor: 'pointer',
                          padding: '4px'
                        }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload size={32} color={theme.colors.textSecondary} style={{ marginBottom: '8px' }} />
                      <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: '0 0 8px 0' }}>
                        Click to upload bank statement
                      </p>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleFileUpload('bankStatement', file)
                        }}
                        style={{ display: 'none' }}
                        id="bank-upload"
                      />
                      <label
                        htmlFor="bank-upload"
                        style={{
                          display: 'inline-block',
                          padding: '8px 16px',
                          background: theme.colors.primary,
                          color: 'white',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '600'
                        }}
                      >
                        Choose File
                      </label>
                    </div>
                  )}
                </div>
                <p style={{ fontSize: '12px', color: theme.colors.textSecondary, marginTop: '8px' }}>
                  Bank account will be verified to match your carrier business name, ensuring 
                  direct payment to authorized carrier only.
                </p>
              </div>

              <div style={{
                padding: '16px',
                background: `${theme.colors.info}10`,
                borderRadius: '8px',
                border: `1px solid ${theme.colors.info}`,
                marginTop: '20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Shield size={16} color={theme.colors.info} />
                  <span style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.info }}>
                    Security Notice
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: 0, lineHeight: '1.4' }}>
                  All documents will be verified through official channels to prevent double brokering. 
                  W-9 forms are mandatory and will be cross-referenced with IRS records.
                </p>
              </div>
            </div>

            {/* Driver Verification Notice */}
            <div style={{
              padding: '20px',
              background: theme.colors.backgroundSecondary,
              borderRadius: '12px',
              border: `2px solid ${theme.colors.warning}`,
              marginTop: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <User size={32} color={theme.colors.warning} style={{ flexShrink: 0, marginTop: '4px' }} />
                <div>
                  <h4 style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '12px' }}>
                    Driver Verification Required Post-Onboarding
                  </h4>
                  <p style={{ fontSize: '14px', color: theme.colors.textSecondary, lineHeight: '1.6', marginBottom: '12px' }}>
                    After completing carrier onboarding, you will need to add and verify all drivers through your carrier dashboard. 
                    This allows carriers with many drivers to manage their team efficiently.
                  </p>
                  
                  <div style={{
                    padding: '16px',
                    background: theme.colors.backgroundPrimary,
                    borderRadius: '8px',
                    border: `1px solid ${theme.colors.border}`,
                    marginTop: '16px'
                  }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '12px' }}>
                      Driver Verification Requirements:
                    </div>
                    <ul style={{ fontSize: '12px', color: theme.colors.textSecondary, lineHeight: '1.6', margin: 0, paddingLeft: '20px' }}>
                      <li>Each driver must have a verified CDL license</li>
                      <li>Driver licenses will be verified with state DMV records</li>
                      <li>Each driver must provide a verified phone number for SMS verification</li>
                      <li><strong>SMS Verification at Rate Confirmation:</strong> Driver will receive a verification text at time of rate confirmation and must accept within the timeframe or the contract becomes null and void</li>
                      <li>Only verified drivers can accept and haul freight</li>
                      <li>Driver-carrier matching prevents unauthorized pickups</li>
                      <li>All driver data is cross-referenced to prevent double brokering</li>
                    </ul>
                  </div>

                  <div style={{
                    padding: '12px 16px',
                    background: `${theme.colors.warning}10`,
                    borderRadius: '8px',
                    border: `1px solid ${theme.colors.warning}`,
                    marginTop: '16px'
                  }}>
                    <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: 0, lineHeight: '1.4' }}>
                      <strong style={{ color: theme.colors.warning }}>Important:</strong> You will not be able to accept loads 
                      until at least one driver is verified in your carrier dashboard.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 7:
        return (
          <div style={{ display: 'grid', gap: '20px' }}>
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: theme.colors.textPrimary, marginBottom: '20px' }}>
              Carrier Agreement & Terms
            </h3>
            
            <div style={{
              padding: '24px',
              background: theme.colors.backgroundSecondary,
              borderRadius: '12px',
              border: `1px solid ${theme.colors.border}`
            }}>
              <h4 style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '16px' }}>
                Carrier Agreement
              </h4>
              <p style={{ fontSize: '14px', color: theme.colors.textSecondary, marginBottom: '20px' }}>
                Please review and sign the comprehensive Carrier Agreement. This document outlines the terms, 
                conditions, and expectations for working with Superior One Logistics.
              </p>
              
              <div 
                onClick={() => setShowCarrierPacket(true)}
                style={{
                  padding: '20px',
                  background: theme.colors.backgroundPrimary,
                  borderRadius: '12px',
                  border: `2px dashed ${theme.colors.primary}`,
                  textAlign: 'center',
                  marginBottom: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = theme.colors.backgroundSecondary
                  e.currentTarget.style.borderColor = theme.colors.primaryHover
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = theme.colors.backgroundPrimary
                  e.currentTarget.style.borderColor = theme.colors.primary
                }}
              >
                <FileText size={32} color={theme.colors.primary} />
                <div>
                  <div style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                    {formData.carrierPacketSigned ? 'Carrier Agreement Signed' : 'Review & Sign Carrier Agreement'}
                  </div>
                  <div style={{ fontSize: '14px', color: theme.colors.textSecondary }}>
                    {formData.carrierPacketSigned 
                      ? 'Your carrier agreement has been signed and dated'
                      : 'Click to review the comprehensive carrier agreement'
                    }
                  </div>
                </div>
              </div>

              {formData.carrierPacketSigned && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px',
                  background: theme.colors.success + '20',
                  borderRadius: '8px',
                  border: `1px solid ${theme.colors.success}`
                }}>
                  <CheckCircle size={20} color={theme.colors.success} />
                  <span style={{ fontSize: '14px', color: theme.colors.success, fontWeight: '600' }}>
                    Carrier agreement signed on {new Date(formData.carrierPacketDate).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            <div style={{
              padding: '20px',
              background: theme.colors.backgroundSecondary,
              borderRadius: '12px',
              border: `1px solid ${theme.colors.border}`
            }}>
              <h4 style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '16px' }}>
                Terms & Privacy
              </h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={formData.termsAccepted}
                    onChange={(e) => updateFormData('termsAccepted', e.target.checked)}
                    style={{ margin: 0 }}
                  />
                  <span style={{ fontSize: '14px', color: theme.colors.textPrimary }}>
                    I agree to the <a href="#" style={{ color: theme.colors.primary }}>Terms of Service</a>
                  </span>
                </label>
                
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={formData.privacyAccepted}
                    onChange={(e) => updateFormData('privacyAccepted', e.target.checked)}
                    style={{ margin: 0 }}
                  />
                  <span style={{ fontSize: '14px', color: theme.colors.textPrimary }}>
                    I agree to the <a href="#" style={{ color: theme.colors.primary }}>Privacy Policy</a>
                  </span>
                </label>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${theme.colors.backgroundPrimary} 0%, ${theme.colors.backgroundSecondary} 100%)`,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <header style={{
        padding: '20px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: `1px solid ${theme.colors.border}`,
        background: theme.colors.backgroundPrimary
      }}>
        <SuperiorOneLogo 
          variant={theme.name === 'dark' ? 'light' : 'dark'} 
          width={300}
          height={80}
        />
        <button
          onClick={() => navigate('/splash')}
          style={{
            padding: '8px 16px',
            background: 'transparent',
            color: theme.colors.textSecondary,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: '6px',
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <X size={16} />
          Exit
        </button>
      </header>

      {/* Progress Bar */}
      <div style={{
        padding: '20px 40px',
        background: theme.colors.backgroundPrimary,
        borderBottom: `1px solid ${theme.colors.border}`
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          maxWidth: '1000px',
          margin: '0 auto',
          gap: '20px',
          flexWrap: 'wrap'
        }}>
          {steps.map((step, index) => {
            const Icon = step.icon
            const isActive = currentStep === step.number
            const isCompleted = currentStep > step.number
            
            return (
              <div key={step.number} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flexDirection: 'column',
                minWidth: '120px'
              }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: isCompleted ? theme.colors.success : isActive ? theme.colors.primary : theme.colors.backgroundSecondary,
                  border: `2px solid ${isCompleted ? theme.colors.success : isActive ? theme.colors.primary : theme.colors.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isCompleted || isActive ? 'white' : theme.colors.textSecondary,
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  {isCompleted ? <CheckCircle size={18} /> : <Icon size={18} />}
                </div>
                <div style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: isActive || isCompleted ? theme.colors.textPrimary : theme.colors.textSecondary,
                  textAlign: 'center',
                  lineHeight: '1.2'
                }}>
                  {step.title}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Main Content */}
      <main style={{
        flex: 1,
        padding: '60px 40px',
        maxWidth: '800px',
        margin: '0 auto',
        width: '100%'
      }}>
        {renderStepContent()}
      </main>

      {/* Footer */}
      <footer style={{
        padding: '20px 40px',
        background: theme.colors.backgroundPrimary,
        borderTop: `1px solid ${theme.colors.border}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <button
          onClick={handlePrevious}
          disabled={currentStep === 1}
          style={{
            padding: '12px 24px',
            background: currentStep === 1 ? theme.colors.backgroundSecondary : theme.colors.backgroundSecondary,
            color: currentStep === 1 ? theme.colors.textSecondary : theme.colors.textPrimary,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            opacity: currentStep === 1 ? 0.5 : 1
          }}
        >
          <ArrowLeft size={16} />
          Previous
        </button>

        <div style={{ fontSize: '14px', color: theme.colors.textSecondary }}>
          Step {currentStep} of {steps.length}
        </div>

        <button
          onClick={handleNext}
          style={{
            padding: '12px 24px',
            background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primaryHover})`,
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
          {currentStep === 7 ? 'Complete Onboarding' : 'Next'}
          <ArrowRight size={16} />
        </button>
      </footer>

      {/* Carrier Packet Modal */}
      {showCarrierPacket && (
        <CarrierPacket 
          onClose={() => setShowCarrierPacket(false)}
          onSign={() => {
            setFormData(prev => ({
              ...prev,
              carrierPacketSigned: true,
              carrierPacketDate: new Date().toISOString()
            }))
            setShowCarrierPacket(false)
          }}
        />
      )}
    </div>
  )
}

export default CarrierOnboardingPage
