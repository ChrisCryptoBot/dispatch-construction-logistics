import React, { useState } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { X, FileText, Download, CheckCircle, AlertCircle, Shield } from 'lucide-react'

interface CarrierPacketProps {
  onClose: () => void
  onSign: () => void
}

const CarrierPacket: React.FC<CarrierPacketProps> = ({ onClose, onSign }) => {
  const { theme } = useTheme()
  const [currentSection, setCurrentSection] = useState(1)
  const [signed, setSigned] = useState(false)

  const sections = [
    { id: 1, title: 'Overview', icon: FileText },
    { id: 2, title: 'Terms & Conditions', icon: AlertCircle },
    { id: 3, title: 'Insurance & Compliance', icon: Shield },
    { id: 4, title: 'Rate Structure', icon: CheckCircle },
    { id: 5, title: 'Payment Terms', icon: CheckCircle },
    { id: 6, title: 'Signature', icon: CheckCircle }
  ]

  const handleSign = () => {
    setSigned(true)
    setTimeout(() => {
      onSign()
    }, 1000)
  }

  const renderSectionContent = () => {
    switch (currentSection) {
      case 1:
        return (
          <div style={{ padding: '20px 0' }}>
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: theme.colors.textPrimary, marginBottom: '20px' }}>
              Carrier Agreement Overview
            </h3>
            
            <div style={{ display: 'grid', gap: '20px' }}>
              <div style={{
                padding: '20px',
                background: theme.colors.backgroundSecondary,
                borderRadius: '12px',
                border: `1px solid ${theme.colors.border}`
              }}>
                <h4 style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '12px' }}>
                  Agreement Summary
                </h4>
                <p style={{ fontSize: '14px', color: theme.colors.textSecondary, lineHeight: '1.6', marginBottom: '16px' }}>
                  This Carrier Agreement establishes the terms and conditions for transportation services 
                  between Superior One Logistics and your carrier company. By signing this agreement, 
                  you agree to provide reliable transportation services in accordance with our standards.
                </p>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '20px' }}>
                  <div style={{
                    padding: '16px',
                    background: theme.colors.backgroundPrimary,
                    borderRadius: '8px',
                    border: `1px solid ${theme.colors.border}`
                  }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                      Service Requirements
                    </div>
                    <ul style={{ fontSize: '12px', color: theme.colors.textSecondary, lineHeight: '1.5', margin: 0, paddingLeft: '16px' }}>
                      <li>On-time delivery performance</li>
                      <li>Maintain proper insurance coverage</li>
                      <li>Comply with safety regulations</li>
                      <li>Provide real-time tracking updates</li>
                    </ul>
                  </div>
                  
                  <div style={{
                    padding: '16px',
                    background: theme.colors.backgroundPrimary,
                    borderRadius: '8px',
                    border: `1px solid ${theme.colors.border}`
                  }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                      Payment Terms
                    </div>
                    <ul style={{ fontSize: '12px', color: theme.colors.textSecondary, lineHeight: '1.5', margin: 0, paddingLeft: '16px' }}>
                      <li>Net 30 payment terms</li>
                      <li>Direct deposit available</li>
                      <li>Fuel surcharge included</li>
                      <li>Performance bonuses available</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div style={{ padding: '20px 0' }}>
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: theme.colors.textPrimary, marginBottom: '20px' }}>
              Terms & Conditions
            </h3>
            
            <div style={{ display: 'grid', gap: '20px' }}>
              <div style={{
                padding: '20px',
                background: theme.colors.backgroundSecondary,
                borderRadius: '12px',
                border: `1px solid ${theme.colors.border}`
              }}>
                <h4 style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '16px' }}>
                  Service Level Agreement
                </h4>
                
                <div style={{ display: 'grid', gap: '16px' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                      1. Performance Standards
                    </div>
                    <p style={{ fontSize: '12px', color: theme.colors.textSecondary, lineHeight: '1.5', margin: 0 }}>
                      Carrier agrees to maintain a minimum 95% on-time delivery rate and provide 
                      real-time tracking updates for all shipments.
                    </p>
                  </div>
                  
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                      2. Insurance Requirements
                    </div>
                    <p style={{ fontSize: '12px', color: theme.colors.textSecondary, lineHeight: '1.5', margin: 0 }}>
                      Carrier must maintain minimum $1,000,000 liability insurance and provide 
                      current certificates of insurance upon request.
                    </p>
                  </div>
                  
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                      3. Safety Compliance
                    </div>
                    <p style={{ fontSize: '12px', color: theme.colors.textSecondary, lineHeight: '1.5', margin: 0 }}>
                      All drivers must have valid CDL licenses and maintain DOT compliance. 
                      Random drug testing may be required.
                    </p>
                  </div>
                  
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                      4. Equipment Standards
                    </div>
                    <p style={{ fontSize: '12px', color: theme.colors.textSecondary, lineHeight: '1.5', margin: 0 }}>
                      All equipment must meet DOT safety standards and be properly maintained. 
                      Pre-trip inspections are required for all loads.
                    </p>
                  </div>
                </div>
              </div>

              <div style={{
                padding: '20px',
                background: theme.colors.backgroundSecondary,
                borderRadius: '12px',
                border: `2px solid ${theme.colors.error}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <Shield size={24} color={theme.colors.error} />
                  <h4 style={{ fontSize: '18px', fontWeight: '700', color: theme.colors.error, margin: 0 }}>
                    Anti-Double Brokering Provisions
                  </h4>
                </div>
                
                <div style={{ display: 'grid', gap: '16px' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                      5. Prohibition of Double Brokering
                    </div>
                    <p style={{ fontSize: '12px', color: theme.colors.textSecondary, lineHeight: '1.5', margin: 0 }}>
                      Carrier expressly agrees that it shall NOT re-broker, co-broker, subcontract, assign, or transfer 
                      any load tendered by Superior One Logistics to any third party without prior written consent. 
                      Carrier warrants that it will transport all loads using its own equipment and authorized drivers only.
                    </p>
                  </div>
                  
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                      6. Driver-Carrier Verification
                    </div>
                    <p style={{ fontSize: '12px', color: theme.colors.textSecondary, lineHeight: '1.5', margin: 0 }}>
                      All drivers assigned to Superior One Logistics loads must be verified employees or authorized 
                      owner-operators of Carrier. Driver licenses must be verified with state DMV records prior to 
                      load assignment. Only pre-approved drivers may pick up and deliver loads.
                    </p>
                  </div>
                  
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                      7. SMS Driver Verification at Rate Confirmation
                    </div>
                    <p style={{ fontSize: '12px', color: theme.colors.textSecondary, lineHeight: '1.5', margin: 0 }}>
                      At the time of rate confirmation, the assigned driver will receive an SMS verification text to their 
                      verified phone number. The driver MUST accept the verification within the specified timeframe to 
                      validate the rate confirmation. Failure to verify via SMS will render the rate confirmation NULL AND VOID. 
                      This ensures the actual driver is aware of and accepts the load, preventing double brokering schemes.
                    </p>
                  </div>
                  
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                      8. Pickup & Delivery Confirmation Requirements
                    </div>
                    <p style={{ fontSize: '12px', color: theme.colors.textSecondary, lineHeight: '1.5', margin: 0 }}>
                      Driver must confirm at origin with shipper and provide real-time GPS location. Receiver must 
                      confirm delivery with digital signature and photo documentation. Any deviation from authorized 
                      driver or equipment will be considered a material breach.
                    </p>
                  </div>
                  
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                      9. Verification & Background Checks
                    </div>
                    <p style={{ fontSize: '12px', color: theme.colors.textSecondary, lineHeight: '1.5', margin: 0 }}>
                      Carrier consents to verification of W-9 tax forms with IRS records, insurance certificates 
                      with direct carrier verification, and bank account verification matching carrier business name. 
                      Carrier will be cross-referenced against known double broker databases and blacklists.
                    </p>
                  </div>
                  
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                      10. Liability for Double Brokering Violations
                    </div>
                    <p style={{ fontSize: '12px', color: theme.colors.textSecondary, lineHeight: '1.5', margin: 0 }}>
                      Carrier shall be held fully responsible for any violations of the double brokering prohibition. 
                      In the event of a violation, Carrier shall be liable for: (a) immediate termination of this agreement, 
                      (b) forfeiture of all outstanding payments, (c) liquidated damages of $10,000 per violation, 
                      (d) actual damages including legal fees, and (e) reporting to FMCSA and industry blacklist databases.
                    </p>
                  </div>
                  
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                      11. Legal Action & FMCSA Reporting
                    </div>
                    <p style={{ fontSize: '12px', color: theme.colors.textSecondary, lineHeight: '1.5', margin: 0 }}>
                      Superior One Logistics reserves the right to pursue legal action through state and federal courts 
                      for any double brokering violations. All violations will be reported to the Federal Motor Carrier 
                      Safety Administration (FMCSA) and shared with industry partners through Transportation Intermediary 
                      Association (TIA) membership channels.
                    </p>
                  </div>
                  
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                      12. Industry Blacklist & Information Sharing
                    </div>
                    <p style={{ fontSize: '12px', color: theme.colors.textSecondary, lineHeight: '1.5', margin: 0 }}>
                      Carriers found in violation of double brokering provisions will be added to industry-wide blacklists 
                      shared among freight brokers and shippers. Superior One Logistics actively participates in TIA 
                      information sharing programs to protect the industry from fraudulent carriers.
                    </p>
                  </div>
                  
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                      13. Carrier Acknowledgment & Certification
                    </div>
                    <p style={{ fontSize: '12px', color: theme.colors.textSecondary, lineHeight: '1.5', margin: 0 }}>
                      By signing this agreement, Carrier certifies that it is an authorized motor carrier with valid 
                      operating authority, that all information provided is accurate and complete, and that Carrier 
                      understands and agrees to comply with all anti-double brokering provisions. Carrier acknowledges 
                      that violations may result in criminal prosecution under applicable federal and state laws.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div style={{ padding: '20px 0' }}>
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: theme.colors.textPrimary, marginBottom: '20px' }}>
              Insurance & Compliance Requirements
            </h3>
            
            <div style={{ display: 'grid', gap: '20px' }}>
              <div style={{
                padding: '20px',
                background: theme.colors.backgroundSecondary,
                borderRadius: '12px',
                border: `1px solid ${theme.colors.border}`
              }}>
                <h4 style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '16px' }}>
                  Insurance Requirements
                </h4>
                
                <div style={{ display: 'grid', gap: '16px' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                      Primary Liability Insurance
                    </div>
                    <p style={{ fontSize: '12px', color: theme.colors.textSecondary, lineHeight: '1.5', margin: 0 }}>
                      Minimum $1,000,000 per occurrence, $2,000,000 aggregate. Certificate must name Superior One Logistics as certificate holder.
                    </p>
                  </div>
                  
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                      Cargo Insurance
                    </div>
                    <p style={{ fontSize: '12px', color: theme.colors.textSecondary, lineHeight: '1.5', margin: 0 }}>
                      Minimum $100,000 per load. Must cover all commodities transported for Superior One Logistics.
                    </p>
                  </div>
                  
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                      General Liability
                    </div>
                    <p style={{ fontSize: '12px', color: theme.colors.textSecondary, lineHeight: '1.5', margin: 0 }}>
                      Minimum $1,000,000 per occurrence, $2,000,000 aggregate. Must include premises and operations coverage.
                    </p>
                  </div>
                  
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                      Workers' Compensation
                    </div>
                    <p style={{ fontSize: '12px', color: theme.colors.textSecondary, lineHeight: '1.5', margin: 0 }}>
                      Required in all states where operations occur. Must meet state minimum requirements.
                    </p>
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
                  Safety & Compliance Requirements
                </h4>
                
                <div style={{ display: 'grid', gap: '16px' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                      DOT Compliance
                    </div>
                    <p style={{ fontSize: '12px', color: theme.colors.textSecondary, lineHeight: '1.5', margin: 0 }}>
                      Must maintain satisfactory DOT safety rating. All drivers must have valid CDL licenses. 
                      Random drug testing may be required.
                    </p>
                  </div>
                  
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                      Equipment Standards
                    </div>
                    <p style={{ fontSize: '12px', color: theme.colors.textSecondary, lineHeight: '1.5', margin: 0 }}>
                      All equipment must meet DOT safety standards. Pre-trip inspections required for all loads. 
                      Equipment must be properly maintained and roadworthy.
                    </p>
                  </div>
                  
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                      Driver Requirements
                    </div>
                    <p style={{ fontSize: '12px', color: theme.colors.textSecondary, lineHeight: '1.5', margin: 0 }}>
                      All drivers must have valid CDL, clean driving record, and pass background checks. 
                      Minimum 2 years commercial driving experience required.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div style={{ padding: '20px 0' }}>
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: theme.colors.textPrimary, marginBottom: '20px' }}>
              Rate Structure & Accessorials
            </h3>
            
            <div style={{ display: 'grid', gap: '20px' }}>
              <div style={{
                padding: '20px',
                background: theme.colors.backgroundSecondary,
                borderRadius: '12px',
                border: `1px solid ${theme.colors.border}`
              }}>
                <h4 style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '16px' }}>
                  Base Rate Structure
                </h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                      Line Haul Rates
                    </div>
                    <ul style={{ fontSize: '12px', color: theme.colors.textSecondary, lineHeight: '1.5', margin: 0, paddingLeft: '16px' }}>
                      <li>Mileage-based pricing</li>
                      <li>Load-specific rates</li>
                      <li>Distance and weight factors</li>
                      <li>Market rate adjustments</li>
                    </ul>
                  </div>
                  
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                      Fuel Surcharge
                    </div>
                    <ul style={{ fontSize: '12px', color: theme.colors.textSecondary, lineHeight: '1.5', margin: 0, paddingLeft: '16px' }}>
                      <li>Weekly fuel price updates</li>
                      <li>Per-mile surcharge calculation</li>
                      <li>Automatic adjustments</li>
                      <li>Transparent fuel cost recovery</li>
                    </ul>
                  </div>
                </div>
                
                <div style={{
                  padding: '16px',
                  background: theme.colors.backgroundPrimary,
                  borderRadius: '8px',
                  border: `1px solid ${theme.colors.border}`
                }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                    Performance Bonuses
                  </div>
                  <p style={{ fontSize: '12px', color: theme.colors.textSecondary, lineHeight: '1.5', margin: 0 }}>
                    Carriers with 98%+ on-time delivery rates and excellent safety records are eligible for 
                    quarterly performance bonuses up to 5% of total revenue.
                  </p>
                </div>
              </div>

              <div style={{
                padding: '20px',
                background: theme.colors.backgroundSecondary,
                borderRadius: '12px',
                border: `1px solid ${theme.colors.border}`
              }}>
                <h4 style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '16px' }}>
                  Accessorial Charges
                </h4>
                
                <div style={{ marginBottom: '20px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                      <tr style={{ background: theme.colors.backgroundPrimary }}>
                        <th style={{ padding: '12px', textAlign: 'left', border: `1px solid ${theme.colors.border}`, color: theme.colors.textPrimary, fontWeight: '600' }}>Service</th>
                        <th style={{ padding: '12px', textAlign: 'left', border: `1px solid ${theme.colors.border}`, color: theme.colors.textPrimary, fontWeight: '600' }}>Rate</th>
                        <th style={{ padding: '12px', textAlign: 'left', border: `1px solid ${theme.colors.border}`, color: theme.colors.textPrimary, fontWeight: '600' }}>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ padding: '12px', border: `1px solid ${theme.colors.border}`, color: theme.colors.textPrimary, fontWeight: '600' }}>Detention</td>
                        <td style={{ padding: '12px', border: `1px solid ${theme.colors.border}`, color: theme.colors.textPrimary }}>$50.00/hour</td>
                        <td style={{ padding: '12px', border: `1px solid ${theme.colors.border}`, color: theme.colors.textSecondary }}>After 2 free hours, billable in 30-minute increments</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '12px', border: `1px solid ${theme.colors.border}`, color: theme.colors.textPrimary, fontWeight: '600' }}>Driver Assist</td>
                        <td style={{ padding: '12px', border: `1px solid ${theme.colors.border}`, color: theme.colors.textPrimary }}>$100.00</td>
                        <td style={{ padding: '12px', border: `1px solid ${theme.colors.border}`, color: theme.colors.textSecondary }}>When driver is required to load/unload</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '12px', border: `1px solid ${theme.colors.border}`, color: theme.colors.textPrimary, fontWeight: '600' }}>Layover</td>
                        <td style={{ padding: '12px', border: `1px solid ${theme.colors.border}`, color: theme.colors.textPrimary }}>$187.50</td>
                        <td style={{ padding: '12px', border: `1px solid ${theme.colors.border}`, color: theme.colors.textSecondary }}>Per 24-hour period when required to hold</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '12px', border: `1px solid ${theme.colors.border}`, color: theme.colors.textPrimary, fontWeight: '600' }}>Stop Off</td>
                        <td style={{ padding: '12px', border: `1px solid ${theme.colors.border}`, color: theme.colors.textPrimary }}>$37.50-$75.00</td>
                        <td style={{ padding: '12px', border: `1px solid ${theme.colors.border}`, color: theme.colors.textSecondary }}>Additional stops between origin and destination</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div style={{ padding: '20px 0' }}>
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: theme.colors.textPrimary, marginBottom: '20px' }}>
              Payment Terms & Schedule
            </h3>
            
            <div style={{ display: 'grid', gap: '20px' }}>
              <div style={{
                padding: '20px',
                background: theme.colors.backgroundSecondary,
                borderRadius: '12px',
                border: `1px solid ${theme.colors.border}`
              }}>
                <h4 style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '16px' }}>
                  Payment Schedule
                </h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                      Standard Payment Terms
                    </div>
                    <ul style={{ fontSize: '12px', color: theme.colors.textSecondary, lineHeight: '1.5', margin: 0, paddingLeft: '16px' }}>
                      <li>Net 30 payment terms</li>
                      <li>Direct deposit preferred</li>
                      <li>Fuel surcharge included</li>
                      <li>Performance bonuses</li>
                    </ul>
                  </div>
                  
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                      Rate Structure
                    </div>
                    <ul style={{ fontSize: '12px', color: theme.colors.textSecondary, lineHeight: '1.5', margin: 0, paddingLeft: '16px' }}>
                      <li>Mileage-based rates</li>
                      <li>Load-specific pricing</li>
                      <li>Fuel surcharge adjustments</li>
                      <li>Accessorial charges</li>
                    </ul>
                  </div>
                </div>
                
                <div style={{
                  padding: '16px',
                  background: theme.colors.backgroundPrimary,
                  borderRadius: '8px',
                  border: `1px solid ${theme.colors.border}`
                }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                    Performance Bonuses
                  </div>
                  <p style={{ fontSize: '12px', color: theme.colors.textSecondary, lineHeight: '1.5', margin: 0 }}>
                    Carriers with 98%+ on-time delivery rates and excellent safety records 
                    are eligible for quarterly performance bonuses up to 5% of total revenue.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      case 6:
        return (
          <div style={{ padding: '20px 0' }}>
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: theme.colors.textPrimary, marginBottom: '20px' }}>
              Digital Signature
            </h3>
            
            <div style={{ display: 'grid', gap: '20px' }}>
              <div style={{
                padding: '20px',
                background: theme.colors.backgroundSecondary,
                borderRadius: '12px',
                border: `1px solid ${theme.colors.border}`
              }}>
                <h4 style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '16px' }}>
                  Agreement Confirmation
                </h4>
                
                <p style={{ fontSize: '14px', color: theme.colors.textSecondary, lineHeight: '1.6', marginBottom: '20px' }}>
                  By clicking "Sign Agreement" below, you electronically sign this Carrier Agreement 
                  and agree to all terms and conditions outlined in this document.
                </p>
                
                <div style={{
                  padding: '20px',
                  background: theme.colors.backgroundPrimary,
                  borderRadius: '8px',
                  border: `2px solid ${signed ? theme.colors.success : theme.colors.border}`,
                  textAlign: 'center'
                }}>
                  {signed ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                      <CheckCircle size={24} color={theme.colors.success} />
                      <span style={{ fontSize: '16px', fontWeight: '600', color: theme.colors.success }}>
                        Agreement Signed Successfully
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={handleSign}
                      style={{
                        padding: '12px 24px',
                        background: theme.colors.primary,
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = theme.colors.primaryHover
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = theme.colors.primary
                      }}
                    >
                      Sign Agreement
                    </button>
                  )}
                </div>
                
                <div style={{ marginTop: '16px', fontSize: '12px', color: theme.colors.textSecondary, textAlign: 'center' }}>
                  This electronic signature has the same legal effect as a handwritten signature
                </div>
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
        background: theme.colors.backgroundPrimary,
        borderRadius: '12px',
        width: '90%',
        maxWidth: '800px',
        maxHeight: '90vh',
        overflow: 'auto',
        position: 'relative'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            background: theme.colors.backgroundSecondary,
            border: `1px solid ${theme.colors.border}`,
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
        
        <div style={{ padding: '40px' }}>
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: theme.colors.textPrimary, marginBottom: '8px' }}>
              Carrier Agreement
            </h2>
            <p style={{ fontSize: '16px', color: theme.colors.textSecondary }}>
              Review and sign the carrier agreement to complete your onboarding
            </p>
          </div>
          
          <div style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '30px',
            padding: '4px',
            background: theme.colors.backgroundSecondary,
            borderRadius: '8px'
          }}>
            {sections.map((section) => {
              const Icon = section.icon
              const isActive = currentSection === section.id
              return (
                <button
                  key={section.id}
                  onClick={() => setCurrentSection(section.id)}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    background: isActive ? theme.colors.primary : 'transparent',
                    color: isActive ? 'white' : theme.colors.textSecondary,
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Icon size={16} />
                  {section.title}
                </button>
              )
            })}
          </div>
          
          {renderSectionContent()}
        </div>
      </div>
    </div>
  )
}

export default CarrierPacket
