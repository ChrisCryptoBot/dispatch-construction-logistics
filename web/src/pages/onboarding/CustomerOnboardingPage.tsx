import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from '../../contexts/ThemeContext'
import SuperiorOneLogo from '../../components/ui/SuperiorOneLogo'
import ServiceAgreement from '../../components/ServiceAgreement'
import ACHPaymentSetup from '../../components/ACHPaymentSetup'
import CreditAccountApplication from '../../components/CreditAccountApplication'
import { 
  Building2, User, Phone, Mail, MapPin, CreditCard, Shield, ArrowRight, ArrowLeft,
  CheckCircle, FileText, Truck, Package, Calendar, X, Eye
} from 'lucide-react'

const CustomerOnboardingPage = () => {
  const { theme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [currentStep, setCurrentStep] = useState(1)
  const [showServiceAgreement, setShowServiceAgreement] = useState(false)
  const [showACHPayment, setShowACHPayment] = useState(false)
  const [showCreditApplication, setShowCreditApplication] = useState(false)
  const [formData, setFormData] = useState({
    // Step 1: Company Information
    companyName: '',
    dbaName: '',
    businessType: '',
    taxId: '',
    federalId: '',
    entityType: '',
    yearStarted: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    email: '',
    website: '',
    
    // Step 2: Contact Information
    primaryContact: '',
    primaryPhone: '',
    primaryEmail: '',
    title: '',
    purchasingContact: '',
    purchasingPhone: '',
    purchasingEmail: '',
    
    // Step 3: Business Information
    industryType: '',
    companySize: '',
    annualShippingVolume: '',
    averageLoadsPerMonth: '',
    typicalCommodities: [] as string[],
    
    // Step 4: Payment & Credit Information
    paymentTerms: '',
    creditLimit: '',
    requestedCreditLimit: '',
    averageMonthlyVolume: '',
    billingAddress: '',
    billingCity: '',
    billingState: '',
    billingZip: '',
    
    // Banking & References
    bankName: '',
    bankContact: '',
    bankPhone: '',
    reference1Name: '',
    reference1Phone: '',
    reference2Name: '',
    reference2Phone: '',
    
    // Authorized Signers
    signer1Name: '',
    signer1Title: '',
    signer1Phone: '',
    signer1Email: '',
    signer2Name: '',
    signer2Title: '',
    signer2Phone: '',
    signer2Email: '',
    
    // ACH Payment Data
    achVerified: false,
    achBankName: '',
    achRoutingNumber: '',
    achAccountNumber: '',
    achAccountType: 'checking',
    achAccountHolderName: '',
    achBillingAddress: '',
    achCity: '',
    achState: '',
    achZip: '',
    
    // Step 5: Service Agreement
    serviceAgreementSigned: false,
    serviceAgreementDate: '',
    termsAccepted: false,
    privacyAccepted: false,
    agreeToCreditCheck: false,
    agreeToPersonalGuarantee: false
  })

  const commodityOptions = [
    'Crushed Stone',
    'Sand & Gravel',
    'Concrete',
    'Asphalt',
    'Dirt/Fill',
    'Recycled Materials',
    'Aggregate',
    'Construction Debris',
    'Mining Materials',
    'Other'
  ]

  const steps = [
    { number: 1, title: 'Company Info', icon: Building2 },
    { number: 2, title: 'Contacts', icon: User },
    { number: 3, title: 'Business', icon: Package },
    { number: 4, title: 'Payment & Credit', icon: CreditCard },
    { number: 5, title: 'ACH Setup', icon: Shield },
    { number: 6, title: 'Agreement', icon: CheckCircle }
  ]

  const handleNext = () => {
    if (currentStep < 6) {
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

  const handleComplete = () => {
    // Mock completion - in production this would save to backend
    const mockToken = 'dev-customer-token-' + Date.now()
    const mockUser = {
      id: 'user-new-' + Date.now(),
      email: formData.email,
      firstName: formData.primaryContact.split(' ')[0] || 'Customer',
      lastName: formData.primaryContact.split(' ')[1] || 'User',
      role: 'customer'
    }
    const mockOrg = {
      id: 'org-new-' + Date.now(),
      name: formData.companyName,
      type: 'SHIPPER'
    }
    
    localStorage.setItem('token', mockToken)
    localStorage.setItem('user', JSON.stringify(mockUser))
    localStorage.setItem('organization', JSON.stringify(mockOrg))
    
    alert('✅ Customer onboarding completed successfully!')
    navigate('/customer-dashboard')
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
                  placeholder="ABC Construction Co"
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
                  Business Type *
                </label>
                <select
                  value={formData.businessType}
                  onChange={(e) => updateFormData('businessType', e.target.value)}
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
                >
                  <option value="">Select Business Type</option>
                  <option value="construction">Construction</option>
                  <option value="mining">Mining</option>
                  <option value="quarry">Quarry</option>
                  <option value="manufacturing">Manufacturing</option>
                  <option value="retail">Retail</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                  Tax ID / Federal ID *
                </label>
                <input
                  type="text"
                  value={formData.taxId}
                  onChange={(e) => updateFormData('taxId', e.target.value)}
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
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                  Entity Type *
                </label>
                <select
                  value={formData.entityType}
                  onChange={(e) => updateFormData('entityType', e.target.value)}
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
                >
                  <option value="">Select Entity Type</option>
                  <option value="Corporation">Corporation</option>
                  <option value="LLC">LLC</option>
                  <option value="Partnership">Partnership</option>
                  <option value="Sole Proprietorship">Sole Proprietorship</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                  Year Business Started *
                </label>
                <input
                  type="text"
                  value={formData.yearStarted}
                  onChange={(e) => updateFormData('yearStarted', e.target.value)}
                  placeholder="2020"
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

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                Website
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => updateFormData('website', e.target.value)}
                placeholder="https://www.company.com"
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
              <div style={{ marginTop: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => updateFormData('title', e.target.value)}
                  placeholder="Operations Manager"
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

            <div style={{
              padding: '20px',
              background: theme.colors.backgroundSecondary,
              borderRadius: '12px',
              border: `1px solid ${theme.colors.border}`
            }}>
              <h4 style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '16px' }}>
                Purchasing Contact (Optional)
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.purchasingContact}
                    onChange={(e) => updateFormData('purchasingContact', e.target.value)}
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
                    value={formData.purchasingPhone}
                    onChange={(e) => updateFormData('purchasingPhone', e.target.value)}
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
                    value={formData.purchasingEmail}
                    onChange={(e) => updateFormData('purchasingEmail', e.target.value)}
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

            <div style={{
              padding: '20px',
              background: theme.colors.backgroundSecondary,
              borderRadius: '12px',
              border: `1px solid ${theme.colors.border}`,
              marginTop: '20px'
            }}>
              <h4 style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '16px' }}>
                Authorized Signers
              </h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                    Signer 1 Name *
                  </label>
                  <input
                    type="text"
                    value={formData.signer1Name}
                    onChange={(e) => updateFormData('signer1Name', e.target.value)}
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
                    Signer 1 Title *
                  </label>
                  <input
                    type="text"
                    value={formData.signer1Title}
                    onChange={(e) => updateFormData('signer1Title', e.target.value)}
                    placeholder="President"
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                    Signer 1 Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.signer1Phone}
                    onChange={(e) => updateFormData('signer1Phone', e.target.value)}
                    placeholder="(555) 123-4567"
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
                    Signer 1 Email
                  </label>
                  <input
                    type="email"
                    value={formData.signer1Email}
                    onChange={(e) => updateFormData('signer1Email', e.target.value)}
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                    Signer 2 Name
                  </label>
                  <input
                    type="text"
                    value={formData.signer2Name}
                    onChange={(e) => updateFormData('signer2Name', e.target.value)}
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
                    Signer 2 Title
                  </label>
                  <input
                    type="text"
                    value={formData.signer2Title}
                    onChange={(e) => updateFormData('signer2Title', e.target.value)}
                    placeholder="Vice President"
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
              Business Information
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                  Industry Type *
                </label>
                <select
                  value={formData.industryType}
                  onChange={(e) => updateFormData('industryType', e.target.value)}
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
                >
                  <option value="">Select Industry</option>
                  <option value="construction">Construction</option>
                  <option value="mining">Mining</option>
                  <option value="quarry">Quarry</option>
                  <option value="manufacturing">Manufacturing</option>
                  <option value="retail">Retail</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                  Company Size *
                </label>
                <select
                  value={formData.companySize}
                  onChange={(e) => updateFormData('companySize', e.target.value)}
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
                >
                  <option value="">Select Size</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-500">201-500 employees</option>
                  <option value="500+">500+ employees</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                  Annual Shipping Volume *
                </label>
                <select
                  value={formData.annualShippingVolume}
                  onChange={(e) => updateFormData('annualShippingVolume', e.target.value)}
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
                >
                  <option value="">Select Volume</option>
                  <option value="under-100k">Under $100K</option>
                  <option value="100k-500k">$100K - $500K</option>
                  <option value="500k-1m">$500K - $1M</option>
                  <option value="1m-5m">$1M - $5M</option>
                  <option value="5m+">$5M+</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                  Average Loads Per Month *
                </label>
                <select
                  value={formData.averageLoadsPerMonth}
                  onChange={(e) => updateFormData('averageLoadsPerMonth', e.target.value)}
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
                >
                  <option value="">Select Loads</option>
                  <option value="1-10">1-10 loads</option>
                  <option value="11-25">11-25 loads</option>
                  <option value="26-50">26-50 loads</option>
                  <option value="51-100">51-100 loads</option>
                  <option value="100+">100+ loads</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '12px' }}>
                Typical Commodities *
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                {commodityOptions.map(commodity => (
                  <label key={commodity} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px',
                    background: theme.colors.backgroundSecondary,
                    border: `2px solid ${formData.typicalCommodities.includes(commodity) ? theme.colors.primary : theme.colors.border}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}>
                    <input
                      type="checkbox"
                      checked={formData.typicalCommodities.includes(commodity)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          updateFormData('typicalCommodities', [...formData.typicalCommodities, commodity])
                        } else {
                          updateFormData('typicalCommodities', formData.typicalCommodities.filter(c => c !== commodity))
                        }
                      }}
                      style={{ margin: 0 }}
                    />
                    <span style={{ fontSize: '14px', color: theme.colors.textPrimary }}>
                      {commodity}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div style={{ display: 'grid', gap: '20px' }}>
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: theme.colors.textPrimary, marginBottom: '20px' }}>
              Payment & Credit Information
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                  Payment Terms *
                </label>
                <select
                  value={formData.paymentTerms}
                  onChange={(e) => updateFormData('paymentTerms', e.target.value)}
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
                >
                  <option value="">Select Terms</option>
                  <option value="net-15">Net 15</option>
                  <option value="net-30">Net 30</option>
                  <option value="net-45">Net 45</option>
                  <option value="net-60">Net 60</option>
                  <option value="cod">COD</option>
                  <option value="prepaid">Prepaid</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                  Requested Credit Limit *
                </label>
                <input
                  type="text"
                  value={formData.requestedCreditLimit}
                  onChange={(e) => updateFormData('requestedCreditLimit', e.target.value)}
                  placeholder="$50,000"
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
                  Average Monthly Volume *
                </label>
                <input
                  type="text"
                  value={formData.averageMonthlyVolume}
                  onChange={(e) => updateFormData('averageMonthlyVolume', e.target.value)}
                  placeholder="$25,000"
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
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                  Bank Contact Person
                </label>
                <input
                  type="text"
                  value={formData.bankContact}
                  onChange={(e) => updateFormData('bankContact', e.target.value)}
                  placeholder="John Smith"
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
                  Bank Phone
                </label>
                <input
                  type="tel"
                  value={formData.bankPhone}
                  onChange={(e) => updateFormData('bankPhone', e.target.value)}
                  placeholder="(555) 123-4567"
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
                  Trade Reference 1
                </label>
                <input
                  type="text"
                  value={formData.reference1Name}
                  onChange={(e) => updateFormData('reference1Name', e.target.value)}
                  placeholder="ABC Supply Co"
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
                  Reference 1 Phone
                </label>
                <input
                  type="tel"
                  value={formData.reference1Phone}
                  onChange={(e) => updateFormData('reference1Phone', e.target.value)}
                  placeholder="(555) 987-6543"
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
                  Trade Reference 2
                </label>
                <input
                  type="text"
                  value={formData.reference2Name}
                  onChange={(e) => updateFormData('reference2Name', e.target.value)}
                  placeholder="XYZ Materials Inc"
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
                  Reference 2 Phone
                </label>
                <input
                  type="tel"
                  value={formData.reference2Phone}
                  onChange={(e) => updateFormData('reference2Phone', e.target.value)}
                  placeholder="(555) 456-7890"
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
              padding: '20px',
              background: theme.colors.backgroundSecondary,
              borderRadius: '12px',
              border: `1px solid ${theme.colors.border}`
            }}>
              <h4 style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '16px' }}>
                Billing Address (Optional)
              </h4>
              <div style={{ display: 'grid', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                    Billing Address
                  </label>
                  <input
                    type="text"
                    value={formData.billingAddress}
                    onChange={(e) => updateFormData('billingAddress', e.target.value)}
                    placeholder="123 Billing Street"
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                      City
                    </label>
                    <input
                      type="text"
                      value={formData.billingCity}
                      onChange={(e) => updateFormData('billingCity', e.target.value)}
                      placeholder="Dallas"
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
                      State
                    </label>
                    <input
                      type="text"
                      value={formData.billingState}
                      onChange={(e) => updateFormData('billingState', e.target.value)}
                      placeholder="TX"
                      maxLength={2}
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
                      Zip Code
                    </label>
                    <input
                      type="text"
                      value={formData.billingZip}
                      onChange={(e) => updateFormData('billingZip', e.target.value)}
                      placeholder="75201"
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
          </div>
        )

      case 5:
        return (
          <div style={{ display: 'grid', gap: '20px' }}>
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: theme.colors.textPrimary, marginBottom: '20px' }}>
              ACH Payment Setup
            </h3>
            
            <div style={{
              padding: '24px',
              background: theme.colors.backgroundSecondary,
              borderRadius: '12px',
              border: `1px solid ${theme.colors.border}`
            }}>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px',
                background: theme.colors.backgroundPrimary,
                borderRadius: '8px',
                border: `2px dashed ${theme.colors.primary}`,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onClick={() => setShowACHPayment(true)}
              onMouseOver={(e) => {
                e.currentTarget.style.background = theme.colors.backgroundSecondary
                e.currentTarget.style.borderColor = theme.colors.primaryHover
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = theme.colors.backgroundPrimary
                e.currentTarget.style.borderColor = theme.colors.primary
              }}
            >
              <CreditCard size={24} color={theme.colors.primary} />
              <div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '4px' }}>
                  {formData.achVerified ? 'ACH Account Verified' : 'Setup ACH Payment'}
                </div>
                <div style={{ fontSize: '12px', color: theme.colors.textSecondary }}>
                  {formData.achVerified 
                    ? `${formData.achBankName} ••••${formData.achAccountNumber.slice(-4)}`
                    : 'Click to setup your ACH payment account'
                  }
                </div>
              </div>
            </div>

            {formData.achVerified && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 16px',
                background: theme.colors.success + '20',
                borderRadius: '8px',
                border: `1px solid ${theme.colors.success}`
              }}>
                <CheckCircle size={16} color={theme.colors.success} />
                <span style={{ fontSize: '14px', color: theme.colors.success, fontWeight: '600' }}>
                  ACH account verified and ready for platform charges
                </span>
              </div>
            )}
          </div>
        </div>
        )

      case 6:
        return (
          <div style={{ display: 'grid', gap: '20px' }}>
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: theme.colors.textPrimary, marginBottom: '20px' }}>
              Service Agreement & Terms
            </h3>
            
            <div style={{
              padding: '24px',
              background: theme.colors.backgroundSecondary,
              borderRadius: '12px',
              border: `1px solid ${theme.colors.border}`
            }}>
              <h4 style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '16px' }}>
                Accessorial Schedule
              </h4>
              
              <div style={{ marginBottom: '20px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ background: theme.colors.backgroundPrimary }}>
                      <th style={{ padding: '12px', textAlign: 'left', border: `1px solid ${theme.colors.border}`, color: theme.colors.textPrimary, fontWeight: '600' }}>Service</th>
                      <th style={{ padding: '12px', textAlign: 'left', border: `1px solid ${theme.colors.border}`, color: theme.colors.textPrimary, fontWeight: '600' }}>Rate</th>
                      <th style={{ padding: '12px', textAlign: 'left', border: `1px solid ${theme.colors.border}`, color: theme.colors.textPrimary, fontWeight: '600' }}>Definition of Service</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: '12px', border: `1px solid ${theme.colors.border}`, color: theme.colors.textPrimary, fontWeight: '600' }}>Detention</td>
                      <td style={{ padding: '12px', border: `1px solid ${theme.colors.border}`, color: theme.colors.textPrimary }}>$50.00</td>
                      <td style={{ padding: '12px', border: `1px solid ${theme.colors.border}`, color: theme.colors.textSecondary }}>The first two hours are free. This is a rate per hour service that is billable in 30-minute increments thereafter.</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '12px', border: `1px solid ${theme.colors.border}`, color: theme.colors.textPrimary, fontWeight: '600' }}>Driver Assist</td>
                      <td style={{ padding: '12px', border: `1px solid ${theme.colors.border}`, color: theme.colors.textPrimary }}>$100.00</td>
                      <td style={{ padding: '12px', border: `1px solid ${theme.colors.border}`, color: theme.colors.textSecondary }}>When a driver is required to load or unload a shipment. This is a flat rate.</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '12px', border: `1px solid ${theme.colors.border}`, color: theme.colors.textPrimary, fontWeight: '600' }}>Equipment Ordered Not Used</td>
                      <td style={{ padding: '12px', border: `1px solid ${theme.colors.border}`, color: theme.colors.textPrimary }}>$200.00</td>
                      <td style={{ padding: '12px', border: `1px solid ${theme.colors.border}`, color: theme.colors.textSecondary }}>When requested to provide equipment for the transportation of a load and the load cancels within 24 hours of the agreed upon loading time. This is a flat rate per occurrence.</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '12px', border: `1px solid ${theme.colors.border}`, color: theme.colors.textPrimary, fontWeight: '600' }}>Stop Off Charge</td>
                      <td style={{ padding: '12px', border: `1px solid ${theme.colors.border}`, color: theme.colors.textPrimary }}>
                        1st Stop: $50.00<br/>
                        2nd Stop: $75.00<br/>
                        3rd Stop: $100.00<br/>
                        4th Stop: $100.00
                      </td>
                      <td style={{ padding: '12px', border: `1px solid ${theme.colors.border}`, color: theme.colors.textSecondary }}>A charge for any scheduled stop between the shipper and consignee. This is a flat rate per occurrence rate in addition to any line haul charges.</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '12px', border: `1px solid ${theme.colors.border}`, color: theme.colors.textPrimary, fontWeight: '600' }}>Layover Charge Per 24 Hours</td>
                      <td style={{ padding: '12px', border: `1px solid ${theme.colors.border}`, color: theme.colors.textPrimary }}>$250.00</td>
                      <td style={{ padding: '12px', border: `1px solid ${theme.colors.border}`, color: theme.colors.textSecondary }}>When requested to hold a carrier at a reference point of the load and the Carrier is required to stay from the close of business until the following open of business. Detention is not paid at the time of lay over pay is allowed.</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '12px', border: `1px solid ${theme.colors.border}`, color: theme.colors.textPrimary, fontWeight: '600' }}>Redelivery</td>
                      <td style={{ padding: '12px', border: `1px solid ${theme.colors.border}`, color: theme.colors.textPrimary }}>$50.00</td>
                      <td style={{ padding: '12px', border: `1px solid ${theme.colors.border}`, color: theme.colors.textSecondary }}>When the Carrier attempts to make delivery and the consignee cannot accept the shipment at that given time, the carrier may be required to redeliver the product at a later date. This charge is a flat rate per occurrence in addition to any rate per miles traveled or shortage charges that may be applicable.</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '12px', border: `1px solid ${theme.colors.border}`, color: theme.colors.textPrimary, fontWeight: '600' }}>Reconsignment</td>
                      <td style={{ padding: '12px', border: `1px solid ${theme.colors.border}`, color: theme.colors.textPrimary }}>$50.00</td>
                      <td style={{ padding: '12px', border: `1px solid ${theme.colors.border}`, color: theme.colors.textSecondary }}>A change in the consignee location after the shipment has arrived at the original destination. This is a flat fee per occurrence rate in addition to the normal line haul charges for the miles traveled on the shipment.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{
              padding: '20px',
              background: theme.colors.backgroundSecondary,
              borderRadius: '12px',
              border: `1px solid ${theme.colors.border}`
            }}>
              <h4 style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '16px' }}>
                Terms & Agreements
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

                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={formData.agreeToCreditCheck}
                    onChange={(e) => updateFormData('agreeToCreditCheck', e.target.checked)}
                    style={{ margin: 0 }}
                  />
                  <span style={{ fontSize: '14px', color: theme.colors.textPrimary }}>
                    I authorize Superior One Logistics to perform a credit check
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
                    checked={formData.agreeToPersonalGuarantee}
                    onChange={(e) => updateFormData('agreeToPersonalGuarantee', e.target.checked)}
                    style={{ margin: 0 }}
                  />
                  <span style={{ fontSize: '14px', color: theme.colors.textPrimary }}>
                    I agree to provide a personal guarantee if required
                  </span>
                </label>
              </div>
            </div>

            <div style={{
              padding: '20px',
              background: theme.colors.backgroundSecondary,
              borderRadius: '12px',
              border: `1px solid ${theme.colors.border}`
            }}>
              <h4 style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '16px' }}>
                Service Agreement
              </h4>
              <p style={{ fontSize: '14px', color: theme.colors.textSecondary, marginBottom: '20px' }}>
                Please review and sign the service agreement to complete your onboarding.
              </p>
              
              <div 
                onClick={() => setShowServiceAgreement(true)}
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
                    {formData.serviceAgreementSigned ? 'Service Agreement Signed' : 'Review & Sign Service Agreement'}
                  </div>
                  <div style={{ fontSize: '14px', color: theme.colors.textSecondary }}>
                    {formData.serviceAgreementSigned 
                      ? 'Service agreement has been signed and dated'
                      : 'Click to review and sign the comprehensive service agreement'
                    }
                  </div>
                </div>
              </div>

              {formData.serviceAgreementSigned && (
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
                    Service agreement signed on {new Date(formData.serviceAgreementDate).toLocaleDateString()}
                  </span>
                </div>
              )}
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
          {currentStep === 6 ? 'Complete Onboarding' : 'Next'}
          <ArrowRight size={16} />
        </button>
      </footer>

      {/* Service Agreement Modal */}
      {showServiceAgreement && (
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
            background: theme.colors.background,
            borderRadius: '12px',
            maxWidth: '90vw',
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowServiceAgreement(false)}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: theme.colors.backgroundSecondary,
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 1001
              }}
            >
              <X size={16} color={theme.colors.textPrimary} />
            </button>
            <ServiceAgreement 
              onClose={() => setShowServiceAgreement(false)}
              onSign={() => {
                setFormData(prev => ({
                  ...prev,
                  serviceAgreementSigned: true,
                  serviceAgreementDate: new Date().toISOString()
                }))
                setShowServiceAgreement(false)
              }}
            />
          </div>
        </div>
      )}

      {/* ACH Payment Setup Modal */}
      {showACHPayment && (
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
            background: theme.colors.background,
            borderRadius: '12px',
            maxWidth: '90vw',
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowACHPayment(false)}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: theme.colors.backgroundSecondary,
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 1001
              }}
            >
              <X size={16} color={theme.colors.textPrimary} />
            </button>
            <ACHPaymentSetup 
              onComplete={(achData) => {
                setFormData(prev => ({
                  ...prev,
                  achVerified: true,
                  achBankName: achData.bankName,
                  achRoutingNumber: achData.routingNumber,
                  achAccountNumber: achData.accountNumber,
                  achAccountType: achData.accountType,
                  achAccountHolderName: achData.accountHolderName,
                  achBillingAddress: achData.billingAddress,
                  achCity: achData.city,
                  achState: achData.state,
                  achZip: achData.zip
                }))
                setShowACHPayment(false)
              }}
              onCancel={() => setShowACHPayment(false)}
            />
          </div>
        </div>
      )}

      {/* Credit Application Modal */}
      {showCreditApplication && (
        <CreditAccountApplication 
          onComplete={(creditData) => {
            setFormData(prev => ({
              ...prev,
              creditApplicationCompleted: true,
              // Map credit application data to onboarding form data
              companyName: creditData.companyName || prev.companyName,
              taxId: creditData.federalId || prev.taxId,
              address: creditData.physicalAddress1 || prev.address,
              city: creditData.physicalCity || prev.city,
              state: creditData.physicalState || prev.state,
              zipCode: creditData.physicalZip || prev.zipCode,
              phone: creditData.phoneNumber || prev.phone,
              email: creditData.email || prev.email,
              creditLimit: creditData.requestedCreditLimit || prev.creditLimit,
              paymentTerms: creditData.paymentTerms || prev.paymentTerms
            }))
            setShowCreditApplication(false)
          }}
          onCancel={() => setShowCreditApplication(false)}
          initialData={{
            companyName: formData.companyName,
            federalId: formData.taxId,
            physicalAddress1: formData.address,
            physicalCity: formData.city,
            physicalState: formData.state,
            physicalZip: formData.zipCode,
            phoneNumber: formData.phone,
            email: formData.email,
            requestedCreditLimit: formData.creditLimit,
            paymentTerms: formData.paymentTerms
          }}
        />
      )}
    </div>
  )
}

export default CustomerOnboardingPage
