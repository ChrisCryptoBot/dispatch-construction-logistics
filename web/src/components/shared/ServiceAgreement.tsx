import React from 'react'
import { useTheme } from '../contexts/ThemeContext'
import SuperiorOneLogo from './SuperiorOneLogo'
import { Download, Printer, CheckCircle, AlertCircle } from 'lucide-react'

interface ServiceAgreementProps {
  onClose?: () => void
  onSign?: () => void
  showActions?: boolean
}

const ServiceAgreement: React.FC<ServiceAgreementProps> = ({ 
  onClose, 
  onSign, 
  showActions = true 
}) => {
  const { theme } = useTheme()

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    // Create a downloadable version
    const element = document.createElement('a')
    const file = new Blob([document.getElementById('service-agreement-content')?.innerHTML || ''], {
      type: 'text/html'
    })
    element.href = URL.createObjectURL(file)
    element.download = 'Superior-One-Logistics-Service-Agreement.html'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '40px',
      background: theme.colors.background,
      color: theme.colors.textPrimary,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      lineHeight: 1.6
    }}>
      <div id="service-agreement-content">
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '40px',
          borderBottom: `2px solid ${theme.colors.primary}`,
          paddingBottom: '20px'
        }}>
          <SuperiorOneLogo width={200} height={60} />
          <h1 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            margin: '20px 0 10px 0',
            color: theme.colors.textPrimary
          }}>
            SERVICE AGREEMENT
          </h1>
          <p style={{
            fontSize: '16px',
            color: theme.colors.textSecondary,
            margin: '0'
          }}>
            Superior One Logistics Platform Terms of Service
          </p>
        </div>

        {/* Agreement Content */}
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: theme.colors.primary,
            marginBottom: '15px',
            borderBottom: `1px solid ${theme.colors.border}`,
            paddingBottom: '5px'
          }}>
            1. AGREEMENT OVERVIEW
          </h2>
          <p>
            This Service Agreement ("Agreement") is entered into between Superior One Logistics, LLC 
            ("Company," "we," "us," or "our") and the user ("User," "you," or "your") accessing our 
            logistics platform services. By using our platform, you agree to be bound by the terms 
            and conditions set forth in this Agreement.
          </p>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: theme.colors.primary,
            marginBottom: '15px',
            borderBottom: `1px solid ${theme.colors.border}`,
            paddingBottom: '5px'
          }}>
            2. SERVICES PROVIDED
          </h2>
          <p>
            Superior One Logistics provides a digital platform connecting shippers, carriers, and 
            logistics service providers. Our services include but are not limited to:
          </p>
          <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
            <li>Load posting and matching services</li>
            <li>Carrier verification and compliance tracking</li>
            <li>Real-time shipment tracking and communication</li>
            <li>Document management and digital signatures</li>
            <li>Payment processing and financial services</li>
            <li>Analytics and reporting tools</li>
            <li>Compliance and safety monitoring</li>
          </ul>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: theme.colors.primary,
            marginBottom: '15px',
            borderBottom: `1px solid ${theme.colors.border}`,
            paddingBottom: '5px'
          }}>
            3. USER RESPONSIBILITIES
          </h2>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '15px' }}>3.1 Account Security</h3>
          <p>
            You are responsible for maintaining the confidentiality of your account credentials 
            and for all activities that occur under your account. You agree to notify us immediately 
            of any unauthorized use of your account.
          </p>
          
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '15px' }}>3.2 Accurate Information</h3>
          <p>
            You agree to provide accurate, current, and complete information during registration 
            and to update such information to keep it accurate, current, and complete.
          </p>

          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '15px' }}>3.3 Compliance</h3>
          <p>
            You agree to comply with all applicable laws, regulations, and industry standards 
            related to transportation, logistics, and your use of our platform.
          </p>

          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '15px' }}>3.4 ACH Payment Requirements</h3>
          <p>
            To conduct business on our platform, you must maintain a valid ACH (Automated Clearing House) 
            account for payment processing. This account will be used for:
          </p>
          <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
            <li>Commission fee payments</li>
            <li>QuickPay processing fees</li>
            <li>Any other platform-related charges</li>
          </ul>
          <p style={{ marginTop: '10px', fontWeight: 'bold', color: theme.colors.warning }}>
            <AlertCircle size={16} style={{ display: 'inline', marginRight: '8px' }} />
            ACH account verification is required before posting loads or accepting carriers.
          </p>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: theme.colors.primary,
            marginBottom: '15px',
            borderBottom: `1px solid ${theme.colors.border}`,
            paddingBottom: '5px'
          }}>
            4. PAYMENT TERMS
          </h2>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '15px' }}>4.1 Commission Structure</h3>
          <p>
            Superior One Logistics charges a commission on completed transactions as follows:
          </p>
          <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
            <li><strong>Basic Plan:</strong> 6% commission on linehaul revenue</li>
            <li><strong>Pro Plan:</strong> 8% commission on linehaul revenue</li>
            <li><strong>Enterprise Plan:</strong> 4% commission on linehaul revenue (volume discount)</li>
          </ul>

          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '15px' }}>4.2 Payment Processing</h3>
          <p>
            Payments are processed through our secure payment system. Commission fees are deducted 
            from the gross revenue before disbursement to carriers.
          </p>

          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '15px' }}>4.3 Settlement Terms</h3>
          <p>
            Standard settlement is 30 days from delivery confirmation. QuickPay options are 
            available for immediate payment with additional fees.
          </p>

          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '15px' }}>4.4 TONU (Truck Order Not Used) Fees</h3>
          <p>
            In the event that a load is cancelled after a carrier has been dispatched or has arrived 
            at the pickup location, a TONU fee will be automatically deducted from the customer's 
            ACH account. This fee compensates the carrier for their time and fuel costs.
          </p>
          <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
            <li>TONU fees are automatically charged to your registered ACH account</li>
            <li>Fees are deducted immediately upon load cancellation</li>
            <li>You will receive notification of TONU charges via email</li>
            <li>TONU fees are non-refundable and separate from commission fees</li>
            <li>Fee amounts are calculated based on equipment type and distance traveled</li>
            <li>Minimum TONU fee applies regardless of distance (typically 1 hour standby rate)</li>
          </ul>
          <div style={{
            background: theme.colors.warning + '20',
            padding: '12px 16px',
            borderRadius: '8px',
            border: `1px solid ${theme.colors.warning}`,
            marginTop: '15px'
          }}>
            <p style={{ fontSize: '14px', color: theme.colors.warning, margin: '0', fontWeight: '600' }}>
              <AlertCircle size={16} style={{ display: 'inline', marginRight: '8px' }} />
              <strong>Important:</strong> TONU fees are calculated automatically and cannot be disputed once charged. 
              Ensure load details are accurate before posting to avoid unnecessary charges.
            </p>
          </div>

          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '15px' }}>4.5 Layover Fees</h3>
          <p>
            When a carrier is required to wait beyond the scheduled pickup or delivery window due to 
            customer delays, layover fees may apply. These fees compensate the carrier for extended 
            wait times and operational costs.
          </p>
          <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
            <li>Layover fees are automatically calculated based on wait time and equipment type</li>
            <li>Fees are charged to your registered ACH account when applicable</li>
            <li>You will receive notification of layover charges via email</li>
            <li>Layover fees are non-refundable and separate from commission fees</li>
            <li>Fee amounts are determined by equipment type and duration of delay</li>
            <li>Charges are calculated hourly and rounded up to the nearest hour</li>
            <li>Grace period of 15 minutes is provided before layover fees begin</li>
          </ul>
          <div style={{
            background: theme.colors.warning + '20',
            padding: '12px 16px',
            borderRadius: '8px',
            border: `1px solid ${theme.colors.warning}`,
            marginTop: '15px'
          }}>
            <p style={{ fontSize: '14px', color: theme.colors.warning, margin: '0', fontWeight: '600' }}>
              <AlertCircle size={16} style={{ display: 'inline', marginRight: '8px' }} />
              <strong>Important:</strong> Layover fees are calculated automatically based on actual wait times. 
              Ensure your site is ready for pickup/delivery to avoid unnecessary charges. 
              Communication with carriers about delays may help reduce fees.
            </p>
          </div>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: theme.colors.primary,
            marginBottom: '15px',
            borderBottom: `1px solid ${theme.colors.border}`,
            paddingBottom: '5px'
          }}>
            5. LIABILITY AND INSURANCE
          </h2>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '15px' }}>5.1 Platform Liability</h3>
          <p>
            Superior One Logistics acts as a technology platform connecting parties. We are not 
            liable for cargo loss, damage, or delays. All transportation is subject to the terms 
            agreed upon between shippers and carriers.
          </p>

          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '15px' }}>5.2 Insurance Requirements</h3>
          <p>
            Carriers must maintain minimum insurance coverage as required by federal and state 
            regulations. Proof of insurance must be provided and kept current.
          </p>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: theme.colors.primary,
            marginBottom: '15px',
            borderBottom: `1px solid ${theme.colors.border}`,
            paddingBottom: '5px'
          }}>
            6. DATA AND PRIVACY
          </h2>
          <p>
            Your privacy is important to us. Our collection and use of personal information is 
            governed by our Privacy Policy, which is incorporated by reference into this Agreement. 
            We implement industry-standard security measures to protect your data.
          </p>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: theme.colors.primary,
            marginBottom: '15px',
            borderBottom: `1px solid ${theme.colors.border}`,
            paddingBottom: '5px'
          }}>
            7. TERMINATION
          </h2>
          <p>
            Either party may terminate this Agreement at any time with 30 days written notice. 
            We reserve the right to suspend or terminate accounts that violate this Agreement 
            or engage in fraudulent activity.
          </p>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: theme.colors.primary,
            marginBottom: '15px',
            borderBottom: `1px solid ${theme.colors.border}`,
            paddingBottom: '5px'
          }}>
            8. DISPUTE RESOLUTION
          </h2>
          <p>
            Any disputes arising from this Agreement shall be resolved through binding arbitration 
            in accordance with the rules of the American Arbitration Association. The arbitration 
            shall be conducted in Dallas, Texas.
          </p>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: theme.colors.primary,
            marginBottom: '15px',
            borderBottom: `1px solid ${theme.colors.border}`,
            paddingBottom: '5px'
          }}>
            9. MODIFICATIONS
          </h2>
          <p>
            We reserve the right to modify this Agreement at any time. Material changes will be 
            communicated to users with 30 days notice. Continued use of the platform constitutes 
            acceptance of modified terms.
          </p>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: theme.colors.primary,
            marginBottom: '15px',
            borderBottom: `1px solid ${theme.colors.border}`,
            paddingBottom: '5px'
          }}>
            10. CONTACT INFORMATION
          </h2>
          <p>
            For questions regarding this Agreement, please contact us at:
          </p>
          <div style={{
            background: theme.colors.backgroundSecondary,
            padding: '20px',
            borderRadius: '8px',
            marginTop: '15px'
          }}>
            <p><strong>Superior One Logistics, LLC</strong></p>
            <p>123 Logistics Boulevard</p>
            <p>Dallas, TX 75201</p>
            <p>Phone: (214) 555-0123</p>
            <p>Email: legal@superioronelogistics.com</p>
          </div>
        </div>

        {/* Signature Section */}
        <div style={{
          marginTop: '40px',
          padding: '20px',
          border: `2px solid ${theme.colors.primary}`,
          borderRadius: '8px',
          background: theme.colors.backgroundSecondary
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: theme.colors.primary,
            marginBottom: '15px'
          }}>
            ELECTRONIC SIGNATURE
          </h3>
          <p style={{ marginBottom: '15px' }}>
            By checking the agreement box and proceeding with registration, you acknowledge that 
            you have read, understood, and agree to be bound by the terms and conditions of this 
            Service Agreement.
          </p>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '15px'
          }}>
            <CheckCircle size={20} color={theme.colors.success} />
            <span>I have read and agree to the Service Agreement terms</span>
          </div>
          <p style={{ fontSize: '14px', color: theme.colors.textSecondary }}>
            This electronic signature has the same legal effect as a handwritten signature.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      {showActions && (
        <div style={{
          display: 'flex',
          gap: '15px',
          justifyContent: 'center',
          marginTop: '30px',
          paddingTop: '20px',
          borderTop: `1px solid ${theme.colors.border}`
        }}>
          <button
            onClick={handlePrint}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              background: theme.colors.backgroundSecondary,
              color: theme.colors.textPrimary,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = theme.colors.backgroundTertiary
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = theme.colors.backgroundSecondary
            }}
          >
            <Printer size={16} />
            Print
          </button>
          
          <button
            onClick={handleDownload}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              background: theme.colors.backgroundSecondary,
              color: theme.colors.textPrimary,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = theme.colors.backgroundTertiary
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = theme.colors.backgroundSecondary
            }}
          >
            <Download size={16} />
            Download
          </button>

          {onSign && (
            <button
              onClick={onSign}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                background: theme.colors.primary,
                color: theme.colors.background,
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = theme.colors.primaryHover
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = theme.colors.primary
              }}
            >
              <CheckCircle size={16} />
              Sign Agreement
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              style={{
                padding: '12px 24px',
                background: theme.colors.backgroundSecondary,
                color: theme.colors.textPrimary,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = theme.colors.backgroundTertiary
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = theme.colors.backgroundSecondary
              }}
            >
              Close
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default ServiceAgreement
