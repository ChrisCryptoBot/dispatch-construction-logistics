import React, { useState, useEffect } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../contexts/AuthContext-fixed'
import { customerAPI } from '../../services/api'
import PageContainer from '../../components/shared/PageContainer'
import Card from '../../components/ui/Card'
import {
  CreditCard, Building, DollarSign, CheckCircle, AlertCircle,
  Plus, Trash2, Lock, Info, Shield, ChevronRight, Loader
} from 'lucide-react'

interface PaymentMethod {
  id: string
  type: 'card' | 'bank'
  last4: string
  brand?: string
  bankName?: string
  isDefault: boolean
  expiryMonth?: number
  expiryYear?: number
}

const PaymentSetupPage = () => {
  const { theme } = useTheme()
  const { user, organization } = useAuth()
  
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddCard, setShowAddCard] = useState(false)
  const [showAddBank, setShowAddBank] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Card form state
  const [cardForm, setCardForm] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    nameOnCard: '',
    zipCode: ''
  })

  // Bank form state
  const [bankForm, setBankForm] = useState({
    accountHolderName: '',
    routingNumber: '',
    accountNumber: '',
    accountNumberConfirm: '',
    accountType: 'checking'
  })

  useEffect(() => {
    loadPaymentMethods()
  }, [])

  const loadPaymentMethods = async () => {
    setLoading(true)
    try {
      // TODO: Replace with actual API call when Stripe is integrated
      // const response = await customerAPI.getPaymentMethods()
      
      // Mock data for now
      setTimeout(() => {
        setPaymentMethods([
          {
            id: 'pm_mock_1',
            type: 'card',
            last4: '4242',
            brand: 'Visa',
            isDefault: true,
            expiryMonth: 12,
            expiryYear: 2025
          }
        ])
        setLoading(false)
      }, 500)
    } catch (err: any) {
      console.error('Error loading payment methods:', err)
      setLoading(false)
    }
  }

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      // TODO: Integrate with Stripe API
      // const response = await customerAPI.addPaymentMethod({
      //   type: 'card',
      //   ...cardForm
      // })

      // Mock success for now
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSuccess('Payment method added successfully!')
      setShowAddCard(false)
      setCardForm({
        cardNumber: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: '',
        nameOnCard: '',
        zipCode: ''
      })
      loadPaymentMethods()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add payment method')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddBank = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    if (bankForm.accountNumber !== bankForm.accountNumberConfirm) {
      setError('Account numbers do not match')
      setSubmitting(false)
      return
    }

    try {
      // TODO: Integrate with Stripe API
      // const response = await customerAPI.addPaymentMethod({
      //   type: 'bank',
      //   ...bankForm
      // })

      // Mock success for now
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSuccess('Bank account added successfully!')
      setShowAddBank(false)
      setBankForm({
        accountHolderName: '',
        routingNumber: '',
        accountNumber: '',
        accountNumberConfirm: '',
        accountType: 'checking'
      })
      loadPaymentMethods()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add bank account')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSetDefault = async (methodId: string) => {
    try {
      // TODO: API call
      // await customerAPI.setDefaultPaymentMethod(methodId)
      setSuccess('Default payment method updated')
      loadPaymentMethods()
    } catch (err) {
      setError('Failed to update default payment method')
    }
  }

  const handleDelete = async (methodId: string) => {
    if (!confirm('Are you sure you want to remove this payment method?')) return

    try {
      // TODO: API call
      // await customerAPI.deletePaymentMethod(methodId)
      setSuccess('Payment method removed')
      loadPaymentMethods()
    } catch (err) {
      setError('Failed to remove payment method')
    }
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    return parts.length ? parts.join(' ') : value
  }

  if (loading) {
    return (
      <PageContainer title="Payment Methods">
        <Card padding="60px" style={{ textAlign: 'center' }}>
          <Loader size={48} className="animate-spin" style={{ color: theme.colors.primary, margin: '0 auto 20px' }} />
          <p style={{ color: theme.colors.textSecondary }}>Loading payment methods...</p>
        </Card>
      </PageContainer>
    )
  }

  return (
    <PageContainer title="Payment Methods">
      {/* Success/Error Messages */}
      {success && (
        <div style={{
          padding: '16px',
          marginBottom: '24px',
          backgroundColor: theme.name === 'dark' ? '#064e3b' : '#d1fae5',
          border: `1px solid ${theme.name === 'dark' ? '#059669' : '#10b981'}`,
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <CheckCircle size={20} style={{ color: '#10b981' }} />
          <span style={{ color: theme.name === 'dark' ? '#d1fae5' : '#065f46', fontWeight: '600' }}>
            {success}
          </span>
        </div>
      )}

      {error && (
        <div style={{
          padding: '16px',
          marginBottom: '24px',
          backgroundColor: theme.name === 'dark' ? '#7f1d1d' : '#fef2f2',
          border: `1px solid #dc2626`,
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <AlertCircle size={20} style={{ color: '#dc2626' }} />
          <span style={{ color: '#dc2626', fontWeight: '600' }}>
            {error}
          </span>
        </div>
      )}

      {/* Info Banner */}
      <Card style={{ marginBottom: '24px', background: `${theme.colors.info}10`, border: `1px solid ${theme.colors.info}30` }}>
        <div style={{ display: 'flex', alignItems: 'start', gap: '16px' }}>
          <Shield size={24} color={theme.colors.info} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h3 style={{ color: theme.colors.textPrimary, margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600' }}>
              Secure Payment Processing
            </h3>
            <p style={{ color: theme.colors.textSecondary, margin: 0, fontSize: '14px', lineHeight: '1.6' }}>
              Your payment information is encrypted and securely stored. We never see or store your full card or bank account numbers. 
              All transactions are processed through Stripe, a PCI DSS Level 1 certified payment processor.
            </p>
          </div>
        </div>
      </Card>

      {/* Saved Payment Methods */}
      <Card 
        title="Saved Payment Methods" 
        subtitle="Manage your payment methods for invoices"
        icon={<CreditCard size={20} color={theme.colors.primary} />}
        action={
          !showAddCard && !showAddBank && (
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowAddCard(true)}
                style={{
                  padding: '10px 20px',
                  background: theme.colors.primary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
              >
                <CreditCard size={16} />
                Add Card
              </button>
              <button
                onClick={() => setShowAddBank(true)}
                style={{
                  padding: '10px 20px',
                  background: theme.colors.backgroundHover,
                  color: theme.colors.textPrimary,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
              >
                <Building size={16} />
                Add Bank Account
              </button>
            </div>
          )
        }
      >
        {/* Add Card Form */}
        {showAddCard && (
          <form onSubmit={handleAddCard} style={{
            padding: '24px',
            background: theme.colors.backgroundSecondary,
            borderRadius: '12px',
            marginBottom: '24px',
            border: `1px solid ${theme.colors.border}`
          }}>
            <h3 style={{ color: theme.colors.textPrimary, margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600' }}>
              Add Credit/Debit Card
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
              {/* Card Number */}
              <div>
                <label style={{ display: 'block', color: theme.colors.textSecondary, fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                  Card Number *
                </label>
                <input
                  type="text"
                  value={cardForm.cardNumber}
                  onChange={(e) => setCardForm({ ...cardForm, cardNumber: formatCardNumber(e.target.value) })}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: theme.colors.background,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: '8px',
                    color: theme.colors.textPrimary,
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Name on Card */}
              <div>
                <label style={{ display: 'block', color: theme.colors.textSecondary, fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                  Name on Card *
                </label>
                <input
                  type="text"
                  value={cardForm.nameOnCard}
                  onChange={(e) => setCardForm({ ...cardForm, nameOnCard: e.target.value })}
                  placeholder="John Doe"
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: theme.colors.background,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: '8px',
                    color: theme.colors.textPrimary,
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Expiry and CVV */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', color: theme.colors.textSecondary, fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                    Month *
                  </label>
                  <input
                    type="text"
                    value={cardForm.expiryMonth}
                    onChange={(e) => setCardForm({ ...cardForm, expiryMonth: e.target.value.replace(/\D/g, '').slice(0, 2) })}
                    placeholder="MM"
                    maxLength={2}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: theme.colors.background,
                      border: `1px solid ${theme.colors.border}`,
                      borderRadius: '8px',
                      color: theme.colors.textPrimary,
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: theme.colors.textSecondary, fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                    Year *
                  </label>
                  <input
                    type="text"
                    value={cardForm.expiryYear}
                    onChange={(e) => setCardForm({ ...cardForm, expiryYear: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                    placeholder="YYYY"
                    maxLength={4}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: theme.colors.background,
                      border: `1px solid ${theme.colors.border}`,
                      borderRadius: '8px',
                      color: theme.colors.textPrimary,
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: theme.colors.textSecondary, fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                    CVV *
                  </label>
                  <input
                    type="text"
                    value={cardForm.cvv}
                    onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                    placeholder="123"
                    maxLength={4}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: theme.colors.background,
                      border: `1px solid ${theme.colors.border}`,
                      borderRadius: '8px',
                      color: theme.colors.textPrimary,
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: theme.colors.textSecondary, fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                    ZIP Code *
                  </label>
                  <input
                    type="text"
                    value={cardForm.zipCode}
                    onChange={(e) => setCardForm({ ...cardForm, zipCode: e.target.value.slice(0, 10) })}
                    placeholder="12345"
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: theme.colors.background,
                      border: `1px solid ${theme.colors.border}`,
                      borderRadius: '8px',
                      color: theme.colors.textPrimary,
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: '12px 24px',
                  background: theme.colors.primary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {submitting ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Lock size={16} />
                    Add Card Securely
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowAddCard(false)}
                disabled={submitting}
                style={{
                  padding: '12px 24px',
                  background: 'transparent',
                  color: theme.colors.textSecondary,
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
          </form>
        )}

        {/* Add Bank Form */}
        {showAddBank && (
          <form onSubmit={handleAddBank} style={{
            padding: '24px',
            background: theme.colors.backgroundSecondary,
            borderRadius: '12px',
            marginBottom: '24px',
            border: `1px solid ${theme.colors.border}`
          }}>
            <h3 style={{ color: theme.colors.textPrimary, margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600' }}>
              Add Bank Account (ACH)
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
              {/* Account Holder Name */}
              <div>
                <label style={{ display: 'block', color: theme.colors.textSecondary, fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                  Account Holder Name *
                </label>
                <input
                  type="text"
                  value={bankForm.accountHolderName}
                  onChange={(e) => setBankForm({ ...bankForm, accountHolderName: e.target.value })}
                  placeholder="John Doe"
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: theme.colors.background,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: '8px',
                    color: theme.colors.textPrimary,
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Routing Number */}
              <div>
                <label style={{ display: 'block', color: theme.colors.textSecondary, fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                  Routing Number *
                </label>
                <input
                  type="text"
                  value={bankForm.routingNumber}
                  onChange={(e) => setBankForm({ ...bankForm, routingNumber: e.target.value.replace(/\D/g, '').slice(0, 9) })}
                  placeholder="123456789"
                  maxLength={9}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: theme.colors.background,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: '8px',
                    color: theme.colors.textPrimary,
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
                <p style={{ fontSize: '12px', color: theme.colors.textTertiary, margin: '4px 0 0 0' }}>
                  9-digit number found on the bottom of your check
                </p>
              </div>

              {/* Account Number */}
              <div>
                <label style={{ display: 'block', color: theme.colors.textSecondary, fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                  Account Number *
                </label>
                <input
                  type="text"
                  value={bankForm.accountNumber}
                  onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value.replace(/\D/g, '').slice(0, 17) })}
                  placeholder="Account number"
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: theme.colors.background,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: '8px',
                    color: theme.colors.textPrimary,
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Confirm Account Number */}
              <div>
                <label style={{ display: 'block', color: theme.colors.textSecondary, fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                  Confirm Account Number *
                </label>
                <input
                  type="text"
                  value={bankForm.accountNumberConfirm}
                  onChange={(e) => setBankForm({ ...bankForm, accountNumberConfirm: e.target.value.replace(/\D/g, '').slice(0, 17) })}
                  placeholder="Re-enter account number"
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: theme.colors.background,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: '8px',
                    color: theme.colors.textPrimary,
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Account Type */}
              <div>
                <label style={{ display: 'block', color: theme.colors.textSecondary, fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                  Account Type *
                </label>
                <select
                  value={bankForm.accountType}
                  onChange={(e) => setBankForm({ ...bankForm, accountType: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: theme.colors.background,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: '8px',
                    color: theme.colors.textPrimary,
                    fontSize: '14px',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="checking">Checking</option>
                  <option value="savings">Savings</option>
                </select>
              </div>
            </div>

            {/* ACH Info */}
            <div style={{
              padding: '12px',
              background: `${theme.colors.info}10`,
              border: `1px solid ${theme.colors.info}30`,
              borderRadius: '8px',
              marginTop: '16px'
            }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <Info size={16} color={theme.colors.info} style={{ flexShrink: 0, marginTop: '2px' }} />
                <p style={{ fontSize: '13px', color: theme.colors.textSecondary, margin: 0, lineHeight: '1.6' }}>
                  ACH bank transfers typically take 3-5 business days to process. Your first payment may require micro-deposit verification.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: '12px 24px',
                  background: theme.colors.primary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {submitting ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Lock size={16} />
                    Add Bank Account
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowAddBank(false)}
                disabled={submitting}
                style={{
                  padding: '12px 24px',
                  background: 'transparent',
                  color: theme.colors.textSecondary,
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
          </form>
        )}

        {/* Payment Methods List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {paymentMethods.length === 0 && !showAddCard && !showAddBank ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <CreditCard size={48} style={{ color: theme.colors.textTertiary, margin: '0 auto 16px' }} />
              <p style={{ color: theme.colors.textSecondary, marginBottom: '8px' }}>No payment methods added yet</p>
              <p style={{ color: theme.colors.textTertiary, fontSize: '14px' }}>
                Add a card or bank account to pay your invoices
              </p>
            </div>
          ) : (
            paymentMethods.map((method) => (
              <div
                key={method.id}
                style={{
                  padding: '20px',
                  background: theme.colors.backgroundSecondary,
                  border: `1px solid ${method.isDefault ? theme.colors.primary : theme.colors.border}`,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '10px',
                    background: `${theme.colors.primary}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {method.type === 'card' ? (
                      <CreditCard size={24} color={theme.colors.primary} />
                    ) : (
                      <Building size={24} color={theme.colors.primary} />
                    )}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                      <h4 style={{ margin: 0, color: theme.colors.textPrimary, fontSize: '16px', fontWeight: '600' }}>
                        {method.type === 'card' ? (
                          `${method.brand} ••••${method.last4}`
                        ) : (
                          `${method.bankName || 'Bank Account'} ••••${method.last4}`
                        )}
                      </h4>
                      {method.isDefault && (
                        <span style={{
                          padding: '4px 10px',
                          background: `${theme.colors.success}20`,
                          color: theme.colors.success,
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '600'
                        }}>
                          DEFAULT
                        </span>
                      )}
                    </div>
                    {method.type === 'card' && method.expiryMonth && method.expiryYear && (
                      <p style={{ margin: 0, color: theme.colors.textSecondary, fontSize: '14px' }}>
                        Expires {String(method.expiryMonth).padStart(2, '0')}/{method.expiryYear}
                      </p>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {!method.isDefault && (
                    <button
                      onClick={() => handleSetDefault(method.id)}
                      style={{
                        padding: '8px 16px',
                        background: 'transparent',
                        color: theme.colors.primary,
                        border: `1px solid ${theme.colors.primary}`,
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      Set as Default
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(method.id)}
                    style={{
                      padding: '8px 12px',
                      background: 'transparent',
                      color: theme.colors.error,
                      border: `1px solid ${theme.colors.border}`,
                      borderRadius: '6px',
                      fontSize: '13px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Help Section */}
      <Card title="Need Help?" icon={<Info size={20} color={theme.colors.info} />} style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
            <CheckCircle size={20} color={theme.colors.success} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h4 style={{ margin: '0 0 4px 0', color: theme.colors.textPrimary, fontSize: '15px', fontWeight: '600' }}>
                All payments are secure
              </h4>
              <p style={{ margin: 0, color: theme.colors.textSecondary, fontSize: '14px', lineHeight: '1.6' }}>
                We use bank-level encryption and never store your full payment information. All data is tokenized and stored securely with Stripe.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
            <CheckCircle size={20} color={theme.colors.success} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h4 style={{ margin: '0 0 4px 0', color: theme.colors.textPrimary, fontSize: '15px', fontWeight: '600' }}>
                Automatic invoice payment
              </h4>
              <p style={{ margin: 0, color: theme.colors.textSecondary, fontSize: '14px', lineHeight: '1.6' }}>
                Your default payment method will be charged automatically when invoices are generated for completed loads. You can review all invoices before payment.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
            <Info size={20} color={theme.colors.info} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h4 style={{ margin: '0 0 4px 0', color: theme.colors.textPrimary, fontSize: '15px', fontWeight: '600' }}>
                Questions about billing?
              </h4>
              <p style={{ margin: 0, color: theme.colors.textSecondary, fontSize: '14px', lineHeight: '1.6' }}>
                Contact our billing team at billing@superioronelogistics.com or call (512) 555-BILL (2455)
              </p>
            </div>
          </div>
        </div>
      </Card>
    </PageContainer>
  )
}

export default PaymentSetupPage

