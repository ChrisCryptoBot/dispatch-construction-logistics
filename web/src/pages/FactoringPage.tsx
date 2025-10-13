import React, { useState } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import PageContainer from '../components/shared/PageContainer'
import Card from '../components/ui/Card'
import { 
  CreditCard, DollarSign, Clock, CheckCircle, Zap, 
  TrendingUp, AlertCircle, Star, Calculator, ArrowRight, Eye
} from 'lucide-react'

interface FactoringRequest {
  id: string
  loadId: string
  amount: number
  advanceRate: number
  discountRate: number
  advanceAmount: number
  status: 'pending' | 'approved' | 'funded' | 'completed'
  createdAt: string
  fundedAt?: string
  factorName?: string
}

interface QuickPayOffer {
  id: string
  factorName: string
  advanceRate: number
  discountRate: number
  processingTime: string
  rating: number
  isRecommended: boolean
}

const FactoringPage = () => {
  const { theme } = useTheme()
  const [activeTab, setActiveTab] = useState('overview')
  
  const [requests, setRequests] = useState<FactoringRequest[]>([
    {
      id: 'FR-001',
      loadId: 'LT-1234',
      amount: 1125,
      advanceRate: 95,
      discountRate: 2.5,
      advanceAmount: 1069,
      status: 'funded',
      createdAt: '2025-01-07',
      fundedAt: '2025-01-07',
      factorName: 'QuickPay Express'
    },
    {
      id: 'FR-002',
      loadId: 'LT-1235',
      amount: 1440,
      advanceRate: 90,
      discountRate: 3.0,
      advanceAmount: 1296,
      status: 'pending',
      createdAt: '2025-01-07',
      factorName: 'BYO Factor'
    }
  ])

  const quickPayOffers: QuickPayOffer[] = [
    {
      id: 'QP-001',
      factorName: 'QuickPay Express',
      advanceRate: 95,
      discountRate: 2.5,
      processingTime: '36 median payout',
      rating: 4.8,
      isRecommended: true
    },
    {
      id: 'QP-002',
      factorName: 'FastCash Factoring',
      advanceRate: 92,
      discountRate: 2.8,
      processingTime: '48 hours',
      rating: 4.6,
      isRecommended: false
    },
    {
      id: 'QP-003',
      factorName: 'Instant Funds',
      advanceRate: 90,
      discountRate: 3.0,
      processingTime: '24 hours',
      rating: 4.7,
      isRecommended: false
    }
  ]

  const getStatusColor = (status: string) => {
    const colors = {
      pending: theme.colors.warning,
      approved: theme.colors.info,
      funded: theme.colors.success,
      completed: theme.colors.textSecondary
    }
    return colors[status] || theme.colors.textSecondary
  }

  const stats = {
    totalFunded: requests.filter(r => r.status === 'funded').reduce((sum, r) => sum + r.advanceAmount, 0),
    pendingAmount: requests.filter(r => r.status === 'pending').reduce((sum, r) => sum + r.amount, 0),
    avgDiscount: requests.reduce((sum, r) => sum + r.discountRate, 0) / requests.length,
    requestCount: requests.length
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'quickpay', label: 'QuickPay' },
    { id: 'byof', label: 'BYO Factor' },
    { id: 'marketplace', label: 'Marketplace' }
  ]

  const headerAction = (
    <button
      onClick={() => alert('Request Factoring')}
      style={{
        padding: '14px 28px',
        background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.accent} 100%)`,
        color: 'white',
        borderRadius: '12px',
        border: 'none',
        fontSize: '15px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: `0 4px 12px ${theme.colors.primary}40`,
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <Zap size={18} />
      Request QuickPay
    </button>
  )

  return (
    <PageContainer
      title="Factoring & QuickPay"
      subtitle="Manage your cash flow with fast, transparent factoring"
      icon={CreditCard}
      headerAction={headerAction}
    >
      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '24px'
      }}>
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
              <DollarSign size={28} color={theme.colors.success} />
            </div>
            <div>
              <p style={{ fontSize: '36px', fontWeight: 'bold', color: theme.colors.textPrimary, margin: 0, lineHeight: 1 }}>
                ${(stats.totalFunded / 1000).toFixed(1)}k
              </p>
              <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: '4px 0 0 0' }}>
                Total Funded
              </p>
            </div>
          </div>
        </Card>

        <Card padding="24px">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              background: `${theme.colors.warning}20`,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Clock size={28} color={theme.colors.warning} />
            </div>
            <div>
              <p style={{ fontSize: '36px', fontWeight: 'bold', color: theme.colors.textPrimary, margin: 0, lineHeight: 1 }}>
                ${(stats.pendingAmount / 1000).toFixed(1)}k
              </p>
              <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: '4px 0 0 0' }}>
                Pending Approval
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
              <Calculator size={28} color={theme.colors.info} />
            </div>
            <div>
              <p style={{ fontSize: '36px', fontWeight: 'bold', color: theme.colors.textPrimary, margin: 0, lineHeight: 1 }}>
                {stats.avgDiscount.toFixed(1)}%
              </p>
              <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: '4px 0 0 0' }}>
                Avg Discount Rate
              </p>
            </div>
          </div>
        </Card>

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
              <TrendingUp size={28} color={theme.colors.primary} />
            </div>
            <div>
              <p style={{ fontSize: '36px', fontWeight: 'bold', color: theme.colors.textPrimary, margin: 0, lineHeight: 1 }}>
                {stats.requestCount}
              </p>
              <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: '4px 0 0 0' }}>
                Total Requests
              </p>
            </div>
          </div>
        </Card>
      </div>


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
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 18px',
              backgroundColor: activeTab === tab.id ? theme.colors.primary : 'transparent',
              color: activeTab === tab.id ? 'white' : theme.colors.textSecondary,
              borderRadius: '8px',
              border: 'none',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <>
          {/* QuickPay Options */}
          <Card 
            title="QuickPay" 
            subtitle="38h median payout"
            icon={<Zap size={20} color={theme.colors.primary} />}
            style={{ marginBottom: '24px' }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              {quickPayOffers.map((offer) => (
                <div
                  key={offer.id}
                  style={{
                    background: theme.colors.background,
                    padding: '20px',
                    borderRadius: '12px',
                    border: `2px solid ${offer.isRecommended ? theme.colors.primary : theme.colors.border}`,
                    position: 'relative'
                  }}
                >
                  {offer.isRecommended && (
                    <div style={{
                      position: 'absolute',
                      top: '-12px',
                      right: '12px',
                      background: theme.colors.primary,
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <Star size={12} />
                      Recommended
                    </div>
                  )}
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary, margin: '0 0 16px 0' }}>
                    {offer.factorName}
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '14px', color: theme.colors.textSecondary }}>Advance Rate</span>
                      <span style={{ fontSize: '16px', fontWeight: '600', color: theme.colors.success }}>{offer.advanceRate}%</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '14px', color: theme.colors.textSecondary }}>Discount Rate</span>
                      <span style={{ fontSize: '16px', fontWeight: '600', color: theme.colors.textPrimary }}>{offer.discountRate}%</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '14px', color: theme.colors.textSecondary }}>Processing Time</span>
                      <span style={{ fontSize: '14px', color: theme.colors.textPrimary }}>{offer.processingTime}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '14px', color: theme.colors.textSecondary }}>Rating</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Star size={14} color={theme.colors.warning} fill={theme.colors.warning} />
                        <span style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary }}>{offer.rating}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => alert(`Request ${offer.factorName}`)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: offer.isRecommended ? `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.accent} 100%)` : theme.colors.backgroundHover,
                      color: offer.isRecommended ? 'white' : theme.colors.textPrimary,
                      border: offer.isRecommended ? 'none' : `1px solid ${theme.colors.border}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    Request Advance
                    <ArrowRight size={16} />
                  </button>
                </div>
              ))}
            </div>
          </Card>

          {/* BYO Factor */}
          <Card 
            title="BYO Factor" 
            subtitle="Use your existing factor"
            icon={<CreditCard size={20} color={theme.colors.primary} />}
            style={{ marginBottom: '24px' }}
          >
            <div style={{
              background: theme.colors.background,
              padding: '32px',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                background: `${theme.colors.info}20`,
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <CreditCard size={32} color={theme.colors.info} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary, margin: '0 0 8px 0' }}>
                Use your existing factor
              </h3>
              <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: '0 0 20px 0' }}>
                NOA routing and reconciliation
              </p>
              <button
                onClick={() => alert('Add BYO Factor')}
                style={{
                  padding: '12px 24px',
                  background: theme.colors.backgroundHover,
                  color: theme.colors.textPrimary,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.colors.primary
                  e.currentTarget.style.color = 'white'
                  e.currentTarget.style.borderColor = theme.colors.primary
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = theme.colors.backgroundHover
                  e.currentTarget.style.color = theme.colors.textPrimary
                  e.currentTarget.style.borderColor = theme.colors.border
                }}
              >
                Add BYO Factor
              </button>
            </div>
          </Card>

          {/* Marketplace */}
          <Card 
            title="Marketplace" 
            subtitle="Compare offers from multiple factors"
            icon={<TrendingUp size={20} color={theme.colors.primary} />}
          >
            <div style={{
              background: theme.colors.background,
              padding: '32px',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                background: `${theme.colors.warning}20`,
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <TrendingUp size={32} color={theme.colors.warning} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary, margin: '0 0 8px 0' }}>
                Compare offers
              </h3>
              <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: '0 0 20px 0' }}>
                Get best rates from multiple factors
              </p>
              <button
                onClick={() => alert('Compare Offers')}
                style={{
                  padding: '12px 24px',
                  background: theme.colors.backgroundHover,
                  color: theme.colors.textPrimary,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.colors.primary
                  e.currentTarget.style.color = 'white'
                  e.currentTarget.style.borderColor = theme.colors.primary
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = theme.colors.backgroundHover
                  e.currentTarget.style.color = theme.colors.textPrimary
                  e.currentTarget.style.borderColor = theme.colors.border
                }}
              >
                Browse Marketplace
              </button>
            </div>
          </Card>
        </>
      )}

      {/* Recent Activity */}
      <Card 
        title="Recent Activity" 
        icon={<Clock size={20} color={theme.colors.primary} />}
        style={{ marginTop: '24px' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {requests.map((req) => (
            <div
              key={req.id}
              style={{
                background: theme.colors.background,
                padding: '16px',
                borderRadius: '10px',
                border: `1px solid ${theme.colors.border}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '16px', fontWeight: '600', color: theme.colors.textPrimary }}>
                    {req.loadId}
                  </span>
                  <span style={{
                    padding: '4px 10px',
                    background: `${getStatusColor(req.status)}20`,
                    color: getStatusColor(req.status),
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '600',
                    textTransform: 'capitalize'
                  }}>
                    {req.status}
                  </span>
                </div>
                <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: 0 }}>
                  {req.factorName} • {req.advanceRate}% advance @ {req.discountRate}% fee
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '20px', fontWeight: 'bold', color: theme.colors.success, margin: '0 0 4px 0' }}>
                  ${req.advanceAmount.toLocaleString()}
                </p>
                <p style={{ fontSize: '13px', color: theme.colors.textSecondary, margin: 0 }}>
                  of ${req.amount.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </PageContainer>
  )
}

export default FactoringPage
