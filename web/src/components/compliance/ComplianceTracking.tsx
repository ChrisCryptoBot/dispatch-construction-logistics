import React, { useState } from 'react'
import { colors, shadows, borders, spacing, gradients } from '../styles/design-system'

interface ComplianceItem {
  id: string
  title: string
  type: 'license' | 'permit' | 'certification' | 'inspection' | 'insurance'
  status: 'compliant' | 'expiring' | 'expired' | 'pending' | 'non-compliant'
  dueDate: string
  renewalDate?: string
  issuedBy: string
  description: string
  requirements: string[]
  violations?: ComplianceViolation[]
  documents: string[]
  priority: 'low' | 'medium' | 'high' | 'critical'
}

interface ComplianceViolation {
  id: string
  title: string
  severity: 'minor' | 'major' | 'critical'
  date: string
  description: string
  status: 'open' | 'resolved' | 'appealed'
  penalty?: number
  correctiveAction?: string
}

const ComplianceTracking = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'items' | 'violations' | 'reports'>('overview')
  const [selectedItem, setSelectedItem] = useState<ComplianceItem | null>(null)

  // Mock data
  const complianceItems: ComplianceItem[] = [
    {
      id: 'COMP001',
      title: 'CDL License - Class A',
      type: 'license',
      status: 'expiring',
      dueDate: '2024-03-15',
      renewalDate: '2024-01-15',
      issuedBy: 'Pennsylvania DMV',
      description: 'Commercial Driver License for Class A vehicles',
      requirements: ['Medical examination', 'Written test', 'Road test', 'Background check'],
      documents: ['CDL-2024-001.pdf', 'Medical-Cert-2024.pdf'],
      priority: 'high'
    },
    {
      id: 'COMP002',
      title: 'DOT Safety Certificate',
      type: 'certification',
      status: 'compliant',
      dueDate: '2024-12-31',
      issuedBy: 'Federal Motor Carrier Safety Administration',
      description: 'DOT safety certification for interstate commerce',
      requirements: ['Safety audit', 'Insurance verification', 'Drug testing program'],
      documents: ['DOT-Safety-2024.pdf'],
      priority: 'critical'
    },
    {
      id: 'COMP003',
      title: 'Overweight Permit - Route 95',
      type: 'permit',
      status: 'expired',
      dueDate: '2024-01-01',
      issuedBy: 'Maryland DOT',
      description: 'Permit for overweight loads on Route 95 corridor',
      requirements: ['Route survey', 'Bridge analysis', 'Fee payment'],
      documents: ['Overweight-Permit-2024.pdf'],
      priority: 'high'
    },
    {
      id: 'COMP004',
      title: 'Vehicle Inspection - Annual',
      type: 'inspection',
      status: 'pending',
      dueDate: '2024-02-28',
      issuedBy: 'Pennsylvania State Police',
      description: 'Annual vehicle safety inspection for all fleet vehicles',
      requirements: ['Brake inspection', 'Light check', 'Tire inspection', 'Emission test'],
      documents: ['Inspection-Schedule-2024.pdf'],
      priority: 'medium'
    },
    {
      id: 'COMP005',
      title: 'Cargo Insurance',
      type: 'insurance',
      status: 'compliant',
      dueDate: '2024-06-30',
      issuedBy: 'Progressive Insurance',
      description: 'Cargo liability insurance coverage',
      requirements: ['Policy renewal', 'Premium payment', 'Coverage verification'],
      documents: ['Cargo-Insurance-2024.pdf'],
      priority: 'critical'
    }
  ]

  const violations: ComplianceViolation[] = [
    {
      id: 'VIOL001',
      title: 'Overweight Violation - I-81',
      severity: 'major',
      date: '2024-01-05',
      description: 'Vehicle exceeded weight limit by 2,500 lbs on I-81 North',
      status: 'open',
      penalty: 850,
      correctiveAction: 'Adjust load distribution and verify weight before departure'
    },
    {
      id: 'VIOL002',
      title: 'Hours of Service Violation',
      severity: 'critical',
      date: '2024-01-03',
      description: 'Driver exceeded 11-hour driving limit by 45 minutes',
      status: 'resolved',
      penalty: 1250,
      correctiveAction: 'Updated ELD system and retrained driver on HOS regulations'
    },
    {
      id: 'VIOL003',
      title: 'Missing Safety Equipment',
      severity: 'minor',
      date: '2024-01-02',
      description: 'Fire extinguisher missing from vehicle inspection',
      status: 'resolved',
      penalty: 150,
      correctiveAction: 'Replaced fire extinguisher and implemented daily equipment checklist'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return '#10b981'
      case 'expiring': return '#f59e0b'
      case 'expired': return '#ef4444'
      case 'pending': return '#3b82f6'
      case 'non-compliant': return '#dc2626'
      default: return '#6b7280'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#ef4444'
      case 'major': return '#f59e0b'
      case 'minor': return '#10b981'
      default: return '#6b7280'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return '#ef4444'
      case 'high': return '#f59e0b'
      case 'medium': return '#3b82f6'
      case 'low': return '#10b981'
      default: return '#6b7280'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'license': return 'fas fa-id-card'
      case 'permit': return 'fas fa-file-alt'
      case 'certification': return 'fas fa-certificate'
      case 'inspection': return 'fas fa-search'
      case 'insurance': return 'fas fa-shield-alt'
      default: return 'fas fa-file'
    }
  }

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate)
    const today = new Date()
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getComplianceScore = () => {
    const total = complianceItems.length
    const compliant = complianceItems.filter(item => item.status === 'compliant').length
    const expiring = complianceItems.filter(item => item.status === 'expiring').length
    const score = Math.round(((compliant + expiring * 0.7) / total) * 100)
    return score
  }

  return (
    <div style={{
      background: colors.background.secondary,
      borderRadius: borders.radius.xl,
      padding: spacing.xl,
      border: `${borders.thin} ${colors.border.primary}`,
      boxShadow: shadows.card,
      marginBottom: spacing.xl
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg }}>
        <div>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: colors.text.primary,
            margin: '0 0 8px 0',
            display: 'flex',
            alignItems: 'center',
            gap: spacing.md
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: gradients.primary,
              borderRadius: borders.radius.md,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: shadows.soft
            }}>
              <i className="fas fa-shield-alt" style={{ color: 'white', fontSize: '18px' }}></i>
            </div>
            Compliance Tracking
          </h2>
          <p style={{ color: colors.text.secondary, margin: 0, fontSize: '14px' }}>
            Regulatory compliance monitoring, violation tracking, and certification management
          </p>
        </div>
        <div style={{ display: 'flex', gap: spacing.sm }}>
          <button style={{
            padding: `${spacing.sm} ${spacing.md}`,
            backgroundColor: colors.background.tertiary,
            color: colors.text.secondary,
            border: `${borders.thin} ${colors.border.secondary}`,
            borderRadius: borders.radius.sm,
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}>
            <i className="fas fa-sync-alt" style={{ marginRight: spacing.xs }}></i>
            Refresh
          </button>
          <button style={{
            padding: `${spacing.sm} ${spacing.md}`,
            background: gradients.primary,
            color: 'white',
            border: 'none',
            borderRadius: borders.radius.sm,
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: shadows.soft
          }}>
            <i className="fas fa-plus" style={{ marginRight: spacing.xs }}></i>
            Add Item
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: spacing.xs,
        marginBottom: spacing.lg,
        borderBottom: `${borders.thin} ${colors.border.secondary}`,
        paddingBottom: spacing.md
      }}>
        {[
          { id: 'overview', label: 'Overview', icon: 'fas fa-th-large' },
          { id: 'items', label: 'Compliance Items', icon: 'fas fa-list-check', count: complianceItems.length },
          { id: 'violations', label: 'Violations', icon: 'fas fa-exclamation-triangle', count: violations.length },
          { id: 'reports', label: 'Reports', icon: 'fas fa-chart-bar' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              padding: `${spacing.sm} ${spacing.md}`,
              backgroundColor: activeTab === tab.id ? colors.primary[500] : 'transparent',
              color: activeTab === tab.id ? 'white' : colors.text.secondary,
              border: 'none',
              borderRadius: borders.radius.sm,
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: spacing.xs
            }}
          >
            <i className={tab.icon} style={{ fontSize: '14px' }}></i>
            {tab.label}
            {tab.count && (
              <span style={{
                backgroundColor: activeTab === tab.id ? 'rgba(255,255,255,0.2)' : colors.primary[500],
                color: 'white',
                fontSize: '11px',
                fontWeight: '700',
                padding: '2px 6px',
                borderRadius: '10px',
                marginLeft: spacing.xs
              }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div>
          {/* Compliance Score */}
          <div style={{
            background: colors.background.tertiary,
            borderRadius: borders.radius.lg,
            padding: spacing.lg,
            border: `${borders.thin} ${colors.border.secondary}`,
            marginBottom: spacing.lg,
            textAlign: 'center'
          }}>
            <h3 style={{
              color: colors.text.primary,
              fontSize: '18px',
              fontWeight: '700',
              margin: '0 0 16px 0'
            }}>
              Overall Compliance Score
            </h3>
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: `conic-gradient(#10b981 0deg ${getComplianceScore() * 3.6}deg, #374151 ${getComplianceScore() * 3.6}deg 360deg)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              position: 'relative'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: colors.background.tertiary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `4px solid ${colors.background.tertiary}`
              }}>
                <span style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: colors.text.primary
                }}>
                  {getComplianceScore()}%
                </span>
              </div>
            </div>
            <p style={{
              color: colors.text.secondary,
              fontSize: '14px',
              margin: 0
            }}>
              Based on {complianceItems.length} compliance items
            </p>
          </div>

          {/* Stats Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: spacing.lg,
            marginBottom: spacing.xl
          }}>
            <div style={{
              background: colors.background.tertiary,
              borderRadius: borders.radius.lg,
              padding: spacing.lg,
              border: `${borders.thin} ${colors.border.secondary}`,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981', marginBottom: spacing.xs }}>
                {complianceItems.filter(item => item.status === 'compliant').length}
              </div>
              <div style={{ color: colors.text.secondary, fontSize: '14px', fontWeight: '600' }}>
                Compliant Items
              </div>
            </div>
            <div style={{
              background: colors.background.tertiary,
              borderRadius: borders.radius.lg,
              padding: spacing.lg,
              border: `${borders.thin} ${colors.border.secondary}`,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f59e0b', marginBottom: spacing.xs }}>
                {complianceItems.filter(item => item.status === 'expiring').length}
              </div>
              <div style={{ color: colors.text.secondary, fontSize: '14px', fontWeight: '600' }}>
                Expiring Soon
              </div>
            </div>
            <div style={{
              background: colors.background.tertiary,
              borderRadius: borders.radius.lg,
              padding: spacing.lg,
              border: `${borders.thin} ${colors.border.secondary}`,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ef4444', marginBottom: spacing.xs }}>
                {complianceItems.filter(item => item.status === 'expired').length}
              </div>
              <div style={{ color: colors.text.secondary, fontSize: '14px', fontWeight: '600' }}>
                Expired Items
              </div>
            </div>
            <div style={{
              background: colors.background.tertiary,
              borderRadius: borders.radius.lg,
              padding: spacing.lg,
              border: `${borders.thin} ${colors.border.secondary}`,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#dc2626', marginBottom: spacing.xs }}>
                {violations.filter(v => v.status === 'open').length}
              </div>
              <div style={{ color: colors.text.secondary, fontSize: '14px', fontWeight: '600' }}>
                Open Violations
              </div>
            </div>
          </div>

          {/* Upcoming Expirations */}
          <div>
            <h3 style={{
              color: colors.text.primary,
              fontSize: '18px',
              fontWeight: '700',
              margin: `0 0 ${spacing.lg} 0`
            }}>
              Upcoming Expirations
            </h3>
            <div style={{
              display: 'grid',
              gap: spacing.md
            }}>
              {complianceItems
                .filter(item => item.status === 'expiring' || item.status === 'pending')
                .sort((a, b) => getDaysUntilDue(a.dueDate) - getDaysUntilDue(b.dueDate))
                .slice(0, 5)
                .map(item => (
                  <div
                    key={item.id}
                    style={{
                      background: colors.background.tertiary,
                      borderRadius: borders.radius.lg,
                      padding: spacing.lg,
                      border: `${borders.thin} ${colors.border.secondary}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing.md,
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      (e.target as HTMLDivElement).style.transform = 'translateY(-2px)'
                      (e.target as HTMLDivElement).style.boxShadow = shadows.medium
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLDivElement).style.transform = 'translateY(0)'
                      (e.target as HTMLDivElement).style.boxShadow = 'none'
                    }}
                  >
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: borders.radius.md,
                      backgroundColor: getStatusColor(item.status),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <i className={getTypeIcon(item.type)} style={{ color: 'white', fontSize: '20px' }}></i>
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{
                        color: colors.text.primary,
                        fontSize: '16px',
                        fontWeight: '600',
                        margin: '0 0 4px 0'
                      }}>
                        {item.title}
                      </h4>
                      <p style={{
                        color: colors.text.secondary,
                        fontSize: '14px',
                        margin: '0 0 8px 0'
                      }}>
                        {item.description}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md, fontSize: '12px' }}>
                        <span style={{ color: colors.text.tertiary }}>Issued by: {item.issuedBy}</span>
                        <span style={{ color: colors.text.tertiary }}>•</span>
                        <span style={{ color: colors.text.tertiary }}>Due: {item.dueDate}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: spacing.xs,
                        backgroundColor: getPriorityColor(item.priority),
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: borders.radius.sm,
                        fontSize: '11px',
                        fontWeight: '600',
                        textTransform: 'uppercase'
                      }}>
                        {item.priority}
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: spacing.xs,
                        backgroundColor: getStatusColor(item.status),
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: borders.radius.sm,
                        fontSize: '11px',
                        fontWeight: '600',
                        textTransform: 'uppercase'
                      }}>
                        {getDaysUntilDue(item.dueDate)} days
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'items' && (
        <div>
          <div style={{
            display: 'grid',
            gap: spacing.lg
          }}>
            {complianceItems.map(item => (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                style={{
                  background: colors.background.tertiary,
                  borderRadius: borders.radius.lg,
                  padding: spacing.lg,
                  border: `${borders.thin} ${colors.border.secondary}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLDivElement).style.transform = 'translateY(-2px)'
                  (e.target as HTMLDivElement).style.boxShadow = shadows.medium
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLDivElement).style.transform = 'translateY(0)'
                  (e.target as HTMLDivElement).style.boxShadow = 'none'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: borders.radius.md,
                      backgroundColor: getStatusColor(item.status),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <i className={getTypeIcon(item.type)} style={{ color: 'white', fontSize: '20px' }}></i>
                    </div>
                    <div>
                      <h3 style={{
                        color: colors.text.primary,
                        fontSize: '18px',
                        fontWeight: '700',
                        margin: '0 0 4px 0'
                      }}>
                        {item.title}
                      </h3>
                      <p style={{
                        color: colors.text.secondary,
                        fontSize: '14px',
                        margin: 0
                      }}>
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing.xs,
                      backgroundColor: getPriorityColor(item.priority),
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: borders.radius.sm,
                      fontSize: '11px',
                      fontWeight: '600',
                      textTransform: 'uppercase'
                    }}>
                      {item.priority}
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing.xs,
                      backgroundColor: getStatusColor(item.status),
                      color: 'white',
                      padding: '6px 12px',
                      borderRadius: borders.radius.sm,
                      fontSize: '12px',
                      fontWeight: '600',
                      textTransform: 'uppercase'
                    }}>
                      {item.status}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: spacing.lg, marginBottom: spacing.md }}>
                  <div>
                    <div style={{ color: colors.text.secondary, fontSize: '12px', marginBottom: '4px' }}>Issued By</div>
                    <div style={{ color: colors.text.primary, fontSize: '14px', fontWeight: '600' }}>
                      {item.issuedBy}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: colors.text.secondary, fontSize: '12px', marginBottom: '4px' }}>Due Date</div>
                    <div style={{ color: colors.text.primary, fontSize: '14px', fontWeight: '600' }}>
                      {item.dueDate}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: colors.text.secondary, fontSize: '12px', marginBottom: '4px' }}>Days Until Due</div>
                    <div style={{ color: colors.text.primary, fontSize: '14px', fontWeight: '600' }}>
                      {getDaysUntilDue(item.dueDate)} days
                    </div>
                  </div>
                </div>

                <div style={{
                  borderTop: `${borders.thin} ${colors.border.secondary}`,
                  paddingTop: spacing.sm
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md, fontSize: '12px' }}>
                    <span style={{ color: colors.text.tertiary }}>
                      {item.requirements.length} requirements
                    </span>
                    <span style={{ color: colors.text.tertiary }}>•</span>
                    <span style={{ color: colors.text.tertiary }}>
                      {item.documents.length} documents
                    </span>
                    {item.violations && item.violations.length > 0 && (
                      <>
                        <span style={{ color: colors.text.tertiary }}>•</span>
                        <span style={{ color: '#ef4444' }}>
                          {item.violations.length} violations
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'violations' && (
        <div>
          <div style={{
            display: 'grid',
            gap: spacing.lg
          }}>
            {violations.map(violation => (
              <div
                key={violation.id}
                style={{
                  background: colors.background.tertiary,
                  borderRadius: borders.radius.lg,
                  padding: spacing.lg,
                  border: `${borders.thin} ${colors.border.secondary}`,
                  borderLeft: `4px solid ${getSeverityColor(violation.severity)}`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs }}>
                      <span style={{
                        backgroundColor: getSeverityColor(violation.severity),
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: borders.radius.sm,
                        fontSize: '11px',
                        fontWeight: '700',
                        textTransform: 'uppercase'
                      }}>
                        {violation.severity}
                      </span>
                      <span style={{
                        backgroundColor: colors.background.primary,
                        color: colors.text.secondary,
                        padding: '2px 8px',
                        borderRadius: borders.radius.sm,
                        fontSize: '11px',
                        fontWeight: '600'
                      }}>
                        {violation.status}
                      </span>
                    </div>
                    <h3 style={{
                      color: colors.text.primary,
                      fontSize: '16px',
                      fontWeight: '700',
                      margin: '0 0 8px 0'
                    }}>
                      {violation.title}
                    </h3>
                    <p style={{
                      color: colors.text.secondary,
                      fontSize: '14px',
                      margin: '0 0 8px 0'
                    }}>
                      {violation.description}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md, fontSize: '12px' }}>
                      <span style={{ color: colors.text.tertiary }}>
                        Date: {violation.date}
                      </span>
                      {violation.penalty && (
                        <>
                          <span style={{ color: colors.text.tertiary }}>•</span>
                          <span style={{ color: '#ef4444', fontWeight: '600' }}>
                            Penalty: ${violation.penalty.toLocaleString()}
                          </span>
                        </>
                      )}
                    </div>
                    {violation.correctiveAction && (
                      <div style={{
                        marginTop: spacing.sm,
                        padding: spacing.sm,
                        backgroundColor: colors.background.primary,
                        borderRadius: borders.radius.sm,
                        border: `1px solid ${colors.border.secondary}`
                      }}>
                        <div style={{
                          color: colors.text.secondary,
                          fontSize: '12px',
                          fontWeight: '600',
                          marginBottom: '4px'
                        }}>
                          Corrective Action:
                        </div>
                        <div style={{
                          color: colors.text.primary,
                          fontSize: '13px'
                        }}>
                          {violation.correctiveAction}
                        </div>
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: spacing.xs }}>
                    <button style={{
                      padding: `${spacing.xs} ${spacing.sm}`,
                      backgroundColor: colors.background.primary,
                      color: colors.text.secondary,
                      border: `${borders.thin} ${colors.border.secondary}`,
                      borderRadius: borders.radius.sm,
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}>
                      View Details
                    </button>
                    {violation.status === 'open' && (
                      <button style={{
                        padding: `${spacing.xs} ${spacing.sm}`,
                        background: gradients.primary,
                        color: 'white',
                        border: 'none',
                        borderRadius: borders.radius.sm,
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}>
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: colors.text.secondary }}>
          <i className="fas fa-chart-bar" style={{ fontSize: '64px', marginBottom: spacing.lg, color: colors.primary[500] }}></i>
          <h3 style={{ fontSize: '24px', marginBottom: spacing.md, color: colors.text.primary }}>Compliance Reports</h3>
          <p style={{ marginBottom: spacing.lg }}>Generate detailed compliance reports and analytics...</p>
          <button style={{
            padding: `${spacing.md} ${spacing.lg}`,
            background: gradients.primary,
            color: 'white',
            border: 'none',
            borderRadius: borders.radius.md,
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}>
            <i className="fas fa-download" style={{ marginRight: spacing.sm }}></i>
            Generate Report
          </button>
        </div>
      )}
    </div>
  )
}

export default ComplianceTracking
