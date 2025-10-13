import React, { useState } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { DollarSign, Download, Eye, CheckCircle, Clock, AlertCircle, CreditCard, FileText, Calendar, TrendingUp, Search, Filter } from 'lucide-react'
import PageContainer from '../../components/PageContainer'
import Card from '../../components/Card'

interface Invoice {
  id: string
  invoiceNumber: string
  loadId: string
  carrier: string
  jobSite: string
  material: string
  quantity: number
  ratePerTon: number
  amount: number
  dueDate: string
  issueDate: string
  status: 'paid' | 'pending' | 'overdue' | 'processing'
  paymentMethod?: string
  paidDate?: string
}

const InvoicesPage = () => {
  const { theme } = useTheme()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)

  // Mock invoices
  const [invoices] = useState<Invoice[]>([
    {
      id: '1',
      invoiceNumber: 'INV-2025-001',
      loadId: 'LD-5432',
      carrier: 'ABC Trucking',
      jobSite: 'Downtown Plaza Construction',
      material: 'Ready-Mix Concrete',
      quantity: 25.5,
      ratePerTon: 85.00,
      amount: 2167.50,
      issueDate: '2025-01-08',
      dueDate: '2025-01-22',
      status: 'pending'
    },
    {
      id: '2',
      invoiceNumber: 'INV-2025-002',
      loadId: 'LD-5433',
      carrier: 'FastHaul Logistics',
      jobSite: 'Highway 35 Extension',
      material: 'Asphalt',
      quantity: 32.0,
      ratePerTon: 92.50,
      amount: 2960.00,
      issueDate: '2025-01-08',
      dueDate: '2025-01-22',
      status: 'processing',
      paymentMethod: 'ACH'
    },
    {
      id: '3',
      invoiceNumber: 'INV-2025-003',
      loadId: 'LD-5430',
      carrier: 'Superior Logistics',
      jobSite: 'Downtown Plaza Construction',
      material: 'Crushed Stone',
      quantity: 28.3,
      ratePerTon: 78.00,
      amount: 2207.40,
      issueDate: '2025-01-07',
      dueDate: '2025-01-21',
      status: 'paid',
      paymentMethod: 'Credit Card',
      paidDate: '2025-01-08'
    },
    {
      id: '4',
      invoiceNumber: 'INV-2024-245',
      loadId: 'LD-5401',
      carrier: 'XYZ Transport',
      jobSite: 'Municipal Building Renovation',
      material: 'Concrete',
      quantity: 19.5,
      ratePerTon: 88.50,
      amount: 1725.75,
      issueDate: '2024-12-20',
      dueDate: '2025-01-03',
      status: 'overdue',
      paymentMethod: 'Check'
    },
    {
      id: '5',
      invoiceNumber: 'INV-2025-004',
      loadId: 'LD-5434',
      carrier: 'ABC Trucking',
      jobSite: 'Downtown Plaza Construction',
      material: 'Sand',
      quantity: 22.0,
      ratePerTon: 72.00,
      amount: 1584.00,
      issueDate: '2025-01-08',
      dueDate: '2025-01-22',
      status: 'paid',
      paymentMethod: 'ACH',
      paidDate: '2025-01-08'
    },
    {
      id: '6',
      invoiceNumber: 'INV-2025-005',
      loadId: 'LD-5435',
      carrier: 'FastHaul Logistics',
      jobSite: 'Riverside Park Development',
      material: 'Topsoil',
      quantity: 18.5,
      ratePerTon: 65.00,
      amount: 1202.50,
      issueDate: '2025-01-09',
      dueDate: '2025-01-23',
      status: 'pending'
    }
  ])

  const statusConfig = {
    paid: { color: theme.colors.success, label: 'Paid', icon: CheckCircle },
    pending: { color: theme.colors.warning, label: 'Pending', icon: Clock },
    overdue: { color: theme.colors.error, label: 'Overdue', icon: AlertCircle },
    processing: { color: theme.colors.info, label: 'Processing', icon: Clock }
  }

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inv.loadId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inv.carrier.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || inv.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const stats = {
    total: invoices.reduce((sum, inv) => sum + inv.amount, 0),
    paid: invoices.filter(i => i.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0),
    pending: invoices.filter(i => i.status === 'pending' || i.status === 'processing').reduce((sum, inv) => sum + inv.amount, 0),
    overdue: invoices.filter(i => i.status === 'overdue').reduce((sum, inv) => sum + inv.amount, 0),
    count: invoices.length
  }

  return (
    <PageContainer>
      {/* Header */}
      <div style={{ marginBottom: theme.spacing.lg }}>
        <div style={{ marginBottom: theme.spacing.md }}>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: '700',
            color: theme.colors.textPrimary,
            marginBottom: theme.spacing.xs
          }}>
            Invoices & Billing
          </h1>
          <p style={{ color: theme.colors.textSecondary, fontSize: '14px' }}>
            Track and manage your invoices and payments
          </p>
        </div>

        {/* Stats Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
          gap: theme.spacing.md,
          marginBottom: theme.spacing.lg
        }}>
          <Card hover={false}>
            <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
              <div style={{ 
                padding: theme.spacing.sm,
                background: `${theme.colors.primary}20`,
                borderRadius: theme.borderRadius.md
              }}>
                <DollarSign size={20} color={theme.colors.primary} />
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: theme.colors.textPrimary }}>
                  ${stats.total.toLocaleString()}
                </div>
                <div style={{ fontSize: '12px', color: theme.colors.textSecondary }}>Total Amount</div>
              </div>
            </div>
          </Card>

          <Card hover={false}>
            <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
              <div style={{ 
                padding: theme.spacing.sm,
                background: `${theme.colors.success}20`,
                borderRadius: theme.borderRadius.md
              }}>
                <CheckCircle size={20} color={theme.colors.success} />
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: theme.colors.textPrimary }}>
                  ${stats.paid.toLocaleString()}
                </div>
                <div style={{ fontSize: '12px', color: theme.colors.textSecondary }}>Paid</div>
              </div>
            </div>
          </Card>

          <Card hover={false}>
            <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
              <div style={{ 
                padding: theme.spacing.sm,
                background: `${theme.colors.warning}20`,
                borderRadius: theme.borderRadius.md
              }}>
                <Clock size={20} color={theme.colors.warning} />
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: theme.colors.textPrimary }}>
                  ${stats.pending.toLocaleString()}
                </div>
                <div style={{ fontSize: '12px', color: theme.colors.textSecondary }}>Pending</div>
              </div>
            </div>
          </Card>

          <Card hover={false}>
            <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
              <div style={{ 
                padding: theme.spacing.sm,
                background: `${theme.colors.error}20`,
                borderRadius: theme.borderRadius.md
              }}>
                <AlertCircle size={20} color={theme.colors.error} />
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: theme.colors.textPrimary }}>
                  ${stats.overdue.toLocaleString()}
                </div>
                <div style={{ fontSize: '12px', color: theme.colors.textSecondary }}>Overdue</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Search and Filter */}
        <div style={{ display: 'flex', gap: theme.spacing.md, marginBottom: theme.spacing.md }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search 
              size={18} 
              style={{ 
                position: 'absolute', 
                left: theme.spacing.sm, 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: theme.colors.textSecondary
              }} 
            />
            <input
              type="text"
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: `${theme.spacing.sm} ${theme.spacing.sm} ${theme.spacing.sm} 40px`,
                background: theme.colors.backgroundSecondary,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: theme.borderRadius.md,
                color: theme.colors.textPrimary,
                fontSize: '14px'
              }}
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              padding: `${theme.spacing.sm} ${theme.spacing.md}`,
              background: theme.colors.backgroundSecondary,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: theme.borderRadius.md,
              color: theme.colors.textPrimary,
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <Card hover={false}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${theme.colors.border}` }}>
                <th style={{ 
                  padding: theme.spacing.md, 
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: theme.colors.textSecondary,
                  textTransform: 'uppercase'
                }}>
                  Invoice #
                </th>
                <th style={{ 
                  padding: theme.spacing.md, 
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: theme.colors.textSecondary,
                  textTransform: 'uppercase'
                }}>
                  Load / Carrier
                </th>
                <th style={{ 
                  padding: theme.spacing.md, 
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: theme.colors.textSecondary,
                  textTransform: 'uppercase'
                }}>
                  Material
                </th>
                <th style={{ 
                  padding: theme.spacing.md, 
                  textAlign: 'right',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: theme.colors.textSecondary,
                  textTransform: 'uppercase'
                }}>
                  Amount
                </th>
                <th style={{ 
                  padding: theme.spacing.md, 
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: theme.colors.textSecondary,
                  textTransform: 'uppercase'
                }}>
                  Due Date
                </th>
                <th style={{ 
                  padding: theme.spacing.md, 
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: theme.colors.textSecondary,
                  textTransform: 'uppercase'
                }}>
                  Status
                </th>
                <th style={{ 
                  padding: theme.spacing.md, 
                  textAlign: 'center',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: theme.colors.textSecondary,
                  textTransform: 'uppercase'
                }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map(inv => {
                const StatusIcon = statusConfig[inv.status].icon
                const isOverdue = inv.status === 'overdue'
                
                return (
                  <tr 
                    key={inv.id}
                    style={{ 
                      borderBottom: `1px solid ${theme.colors.border}`,
                      transition: 'background 0.2s ease',
                      background: isOverdue ? `${theme.colors.error}10` : 'transparent'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = theme.colors.backgroundSecondary}
                    onMouseLeave={(e) => e.currentTarget.style.background = isOverdue ? `${theme.colors.error}10` : 'transparent'}
                  >
                    <td style={{ padding: theme.spacing.md }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary }}>
                        {inv.invoiceNumber}
                      </div>
                      <div style={{ fontSize: '12px', color: theme.colors.textSecondary }}>
                        {new Date(inv.issueDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td style={{ padding: theme.spacing.md }}>
                      <div style={{ fontSize: '13px', fontWeight: '500', color: theme.colors.textPrimary }}>
                        {inv.loadId}
                      </div>
                      <div style={{ fontSize: '12px', color: theme.colors.textSecondary }}>
                        {inv.carrier}
                      </div>
                    </td>
                    <td style={{ padding: theme.spacing.md }}>
                      <div style={{ fontSize: '13px', color: theme.colors.textPrimary }}>
                        {inv.material}
                      </div>
                      <div style={{ fontSize: '12px', color: theme.colors.textSecondary }}>
                        {inv.quantity}t @ ${inv.ratePerTon}/t
                      </div>
                    </td>
                    <td style={{ padding: theme.spacing.md, textAlign: 'right' }}>
                      <div style={{ fontSize: '16px', fontWeight: '700', color: theme.colors.textPrimary }}>
                        ${inv.amount.toLocaleString()}
                      </div>
                    </td>
                    <td style={{ padding: theme.spacing.md }}>
                      <div style={{ fontSize: '13px', color: isOverdue ? theme.colors.error : theme.colors.textPrimary }}>
                        {new Date(inv.dueDate).toLocaleDateString()}
                      </div>
                      {inv.paidDate && (
                        <div style={{ fontSize: '11px', color: theme.colors.success }}>
                          Paid: {new Date(inv.paidDate).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: theme.spacing.md }}>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: theme.spacing.xs,
                        padding: '4px 10px',
                        background: `${statusConfig[inv.status].color}20`,
                        borderRadius: theme.borderRadius.full,
                        fontSize: '12px',
                        fontWeight: '600',
                        color: statusConfig[inv.status].color
                      }}>
                        <StatusIcon size={12} />
                        {statusConfig[inv.status].label}
                      </div>
                    </td>
                    <td style={{ padding: theme.spacing.md }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: theme.spacing.xs }}>
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          style={{
                            padding: theme.spacing.xs,
                            background: 'transparent',
                            border: 'none',
                            color: theme.colors.primary,
                            cursor: 'pointer',
                            borderRadius: theme.borderRadius.sm,
                            transition: 'background 0.2s ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = theme.colors.backgroundTertiary}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => alert(`Download invoice: ${inv.invoiceNumber}`)}
                          style={{
                            padding: theme.spacing.xs,
                            background: 'transparent',
                            border: 'none',
                            color: theme.colors.success,
                            cursor: 'pointer',
                            borderRadius: theme.borderRadius.sm,
                            transition: 'background 0.2s ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = theme.colors.backgroundTertiary}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <Download size={18} />
                        </button>
                        {inv.status !== 'paid' && (
                          <button
                            onClick={() => alert(`Pay invoice: ${inv.invoiceNumber} - $${inv.amount}`)}
                            style={{
                              padding: theme.spacing.xs,
                              background: 'transparent',
                              border: 'none',
                              color: theme.colors.warning,
                              cursor: 'pointer',
                              borderRadius: theme.borderRadius.sm,
                              transition: 'background 0.2s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = theme.colors.backgroundTertiary}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            <CreditCard size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Detail Modal */}
      {selectedInvoice && (
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
          padding: theme.spacing.lg
        }}>
          <div style={{
            background: theme.colors.backgroundPrimary,
            borderRadius: theme.borderRadius.lg,
            padding: theme.spacing.xl,
            maxWidth: '700px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: theme.spacing.lg }}>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: '700', color: theme.colors.textPrimary }}>
                  {selectedInvoice.invoiceNumber}
                </h2>
                <p style={{ color: theme.colors.textSecondary, fontSize: '14px' }}>
                  Issued: {new Date(selectedInvoice.issueDate).toLocaleDateString()}
                </p>
              </div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: theme.spacing.xs,
                padding: '6px 12px',
                background: `${statusConfig[selectedInvoice.status].color}20`,
                borderRadius: theme.borderRadius.full,
                fontSize: '14px',
                fontWeight: '600',
                color: statusConfig[selectedInvoice.status].color
              }}>
                {React.createElement(statusConfig[selectedInvoice.status].icon, { size: 14 })}
                {statusConfig[selectedInvoice.status].label}
              </div>
            </div>

            <div style={{ 
              padding: theme.spacing.md,
              background: theme.colors.backgroundSecondary,
              borderRadius: theme.borderRadius.md,
              marginBottom: theme.spacing.lg
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing.md }}>
                <div>
                  <div style={{ fontSize: '12px', color: theme.colors.textSecondary, marginBottom: '4px' }}>
                    Load ID
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary }}>
                    {selectedInvoice.loadId}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: theme.colors.textSecondary, marginBottom: '4px' }}>
                    Carrier
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary }}>
                    {selectedInvoice.carrier}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: theme.colors.textSecondary, marginBottom: '4px' }}>
                    Job Site
                  </div>
                  <div style={{ fontSize: '14px', color: theme.colors.textPrimary }}>
                    {selectedInvoice.jobSite}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: theme.colors.textSecondary, marginBottom: '4px' }}>
                    Due Date
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary }}>
                    {new Date(selectedInvoice.dueDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: theme.spacing.lg }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textSecondary, marginBottom: theme.spacing.sm }}>
                Line Items
              </h4>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${theme.colors.border}` }}>
                    <th style={{ padding: theme.spacing.sm, textAlign: 'left', fontSize: '12px', color: theme.colors.textSecondary }}>
                      Description
                    </th>
                    <th style={{ padding: theme.spacing.sm, textAlign: 'right', fontSize: '12px', color: theme.colors.textSecondary }}>
                      Quantity
                    </th>
                    <th style={{ padding: theme.spacing.sm, textAlign: 'right', fontSize: '12px', color: theme.colors.textSecondary }}>
                      Rate
                    </th>
                    <th style={{ padding: theme.spacing.sm, textAlign: 'right', fontSize: '12px', color: theme.colors.textSecondary }}>
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: `1px solid ${theme.colors.border}` }}>
                    <td style={{ padding: theme.spacing.sm, fontSize: '13px', color: theme.colors.textPrimary }}>
                      {selectedInvoice.material}
                    </td>
                    <td style={{ padding: theme.spacing.sm, textAlign: 'right', fontSize: '13px', color: theme.colors.textPrimary }}>
                      {selectedInvoice.quantity} tons
                    </td>
                    <td style={{ padding: theme.spacing.sm, textAlign: 'right', fontSize: '13px', color: theme.colors.textPrimary }}>
                      ${selectedInvoice.ratePerTon.toFixed(2)}
                    </td>
                    <td style={{ padding: theme.spacing.sm, textAlign: 'right', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary }}>
                      ${selectedInvoice.amount.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ 
              padding: theme.spacing.md,
              background: `${theme.colors.primary}15`,
              borderRadius: theme.borderRadius.md,
              marginBottom: theme.spacing.lg
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '18px', fontWeight: '700', color: theme.colors.textPrimary }}>
                  Total Amount
                </span>
                <span style={{ fontSize: '28px', fontWeight: '700', color: theme.colors.primary }}>
                  ${selectedInvoice.amount.toFixed(2)}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: theme.spacing.md }}>
              {selectedInvoice.status !== 'paid' && (
                <button
                  onClick={() => alert(`Pay invoice: ${selectedInvoice.invoiceNumber}`)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: theme.spacing.xs,
                    padding: theme.spacing.md,
                    background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primaryHover})`,
                    color: 'white',
                    border: 'none',
                    borderRadius: theme.borderRadius.md,
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  <CreditCard size={18} />
                  Pay Now
                </button>
              )}
              <button
                onClick={() => alert(`Download invoice: ${selectedInvoice.invoiceNumber}`)}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: theme.spacing.xs,
                  padding: theme.spacing.md,
                  background: theme.colors.backgroundSecondary,
                  color: theme.colors.textPrimary,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: theme.borderRadius.md,
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                <Download size={18} />
                Download PDF
              </button>
              <button
                onClick={() => setSelectedInvoice(null)}
                style={{
                  padding: theme.spacing.md,
                  background: theme.colors.backgroundSecondary,
                  color: theme.colors.textPrimary,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: theme.borderRadius.md,
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
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

export default InvoicesPage

