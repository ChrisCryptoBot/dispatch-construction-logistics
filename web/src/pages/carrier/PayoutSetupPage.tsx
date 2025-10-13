import React, { useState, useEffect } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../contexts/AuthContext-fixed'
import { carrierAPI } from '../../services/api'
import PageContainer from '../../components/PageContainer'
import Card from '../../components/Card'
import {
  Building, DollarSign, CheckCircle, AlertCircle,
  Plus, Trash2, Lock, Info, Shield, Clock, Loader, FileText,
  Zap
} from 'lucide-react'

interface PayoutAccount {
  id: string
  accountHolderName: string
  bankName?: string
  last4: string
  accountType: 'checking' | 'savings'
  isDefault: boolean
  verified: boolean
  microDepositsPending?: boolean
}

const PayoutSetupPage = () => {
  const { theme } = useTheme()
  const { user, organization } = useAuth()
  
  const [payoutAccounts, setPayoutAccounts] = useState<PayoutAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddAccount, setShowAddAccount] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [w9Uploaded, setW9Uploaded] = useState(false)

  // Bank account form state
  const [bankForm, setBankForm] = useState({
    accountHolderName: '',
    routingNumber: '',
    accountNumber: '',
    accountNumberConfirm: '',
    accountType: 'checking',
    bankName: '',
    ssn: '', // For sole proprietors
    ein: '' // For companies
  })

  useEffect(() => {
    loadPayoutAccounts()
  }, [])

  const loadPayoutAccounts = async () => {
    setLoading(true)
    try {
      // TODO: Replace with actual API call when Stripe Connect is integrated
      // const response = await carrierAPI.getPayoutAccounts()
      
      // Mock data for now
      setTimeout(() => {
        setPayoutAccounts([
          {
            id: 'ba_mock_1',
            accountHolderName: organization?.name || 'Carrier LLC',
            bankName: 'Chase Bank',
            last4: '6789',
            accountType: 'checking',
            isDefault: true,
            verified: true
          }
        ])
        setW9Uploaded(true)
        setLoading(false)
      }, 500)
    } catch (err: any) {
      console.error('Error loading payout accounts:', err)
      setLoading(false)
    }
  }

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    if (bankForm.accountNumber !== bankForm.accountNumberConfirm) {
      setError('Account numbers do not match')
      setSubmitting(false)
      return
    }

    if (!w9Uploaded) {
      setError('Please upload W9 form before adding a payout account')
      setSubmitting(false)
      return
    }

    try {
      // TODO: Integrate with Stripe Connect API
      // const response = await carrierAPI.addPayoutAccount({
      //   ...bankForm
      // })

      // Mock success for now
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSuccess('Bank account added successfully! Micro-deposits will be sent within 1-2 business days for verification.')
      setShowAddAccount(false)
      setBankForm({
        accountHolderName: '',
        routingNumber: '',
        accountNumber: '',
        accountNumberConfirm: '',
        accountType: 'checking',
        bankName: '',
        ssn: '',
        ein: ''
      })
      loadPayoutAccounts()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add payout account')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSetDefault = async (accountId: string) => {
    try {
      // TODO: API call
      // await carrierAPI.setDefaultPayoutAccount(accountId)
      setSuccess('Default payout account updated')
      loadPayoutAccounts()
    } catch (err) {
      setError('Failed to update default payout account')
    }
  }

  const handleDelete = async (accountId: string) => {
    if (!confirm('Are you sure you want to remove this payout account? This will affect your ability to receive payments.')) return

    try {
      // TODO: API call
      // await carrierAPI.deletePayoutAccount(accountId)
      setSuccess('Payout account removed')
      loadPayoutAccounts()
    } catch (err) {
      setError('Failed to remove payout account')
    }
  }

  const handleW9Upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      // TODO: Upload W9 to backend
      // const formData = new FormData()
      // formData.append('w9', file)
      // await carrierAPI.uploadW9(formData)
      
      setSuccess('W9 form uploaded successfully')
      setW9Uploaded(true)
    } catch (err) {
      setError('Failed to upload W9 form')
    }
  }

  if (loading) {
    return (
      <PageContainer title="Payout Setup">
        <Card padding="60px" style={{ textAlign: 'center' }}>
          <Loader size={48} className="animate-spin" style={{ color: theme.colors.primary, margin: '0 auto 20px' }} />
          <p style={{ color: theme.colors.textSecondary }}>Loading payout information...</p>
        </Card>
      </PageContainer>
    )
  }

  return (
    <PageContainer title="Payout Setup">
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

      {/* QuickPay Info Banner */}
      <Card style={{ marginBottom: '24px', background: `linear-gradient(135deg, ${theme.colors.success}20 0%, ${theme.colors.success}10 100%)`, border: `1px solid ${theme.colors.success}30` }}>
        <div style={{ display: 'flex', alignItems: 'start', gap: '16px' }}>
          <Zap size={28} color={theme.colors.success} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h3 style={{ color: theme.colors.textPrimary, margin: '0 0 8px 0', fontSize: '18px', fontWeight: '700' }}>
              Get Paid Faster with QuickPay
            </h3>
            <p style={{ color: theme.colors.textSecondary, margin: '0 0 12px 0', fontSize: '14px', lineHeight: '1.6' }}>
              Standard payment terms: <strong>Net-30</strong> (paid 30 days after load completion)<br/>
              QuickPay option: <strong>48 hours</strong> for a 3% fee
            </p>
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              <div>
                <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: '0 0 4px 0', fontWeight: '600', textTransform: 'uppercase' }}>
                  Standard (Free)
                </p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: theme.colors.textPrimary, margin: 0 }}>
                  30 days
                </p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: '0 0 4px 0', fontWeight: '600', textTransform: 'uppercase' }}>
                  QuickPay (3% fee)
                </p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: theme.colors.success, margin: 0 }}>
                  48 hours
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Security Banner */}
      <Card style={{ marginBottom: '24px', background: `${theme.colors.info}10`, border: `1px solid ${theme.colors.info}30` }}>
        <div style={{ display: 'flex', alignItems: 'start', gap: '16px' }}>
          <Shield size={24} color={theme.colors.info} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h3 style={{ color: theme.colors.textPrimary, margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600' }}>
              Secure ACH Payouts
            </h3>
            <p style={{ color: theme.colors.textSecondary, margin: 0, fontSize: '14px', lineHeight: '1.6' }}>
              Your banking information is encrypted and securely stored. We use Stripe Connect, a PCI DSS Level 1 certified payment processor trusted by millions of businesses worldwide. Payouts are sent via ACH (Automated Clearing House) directly to your bank account.
            </p>
          </div>
        </div>
      </Card>

      {/* W9 Form Upload */}
      {!w9Uploaded && (
        <Card 
          title="Tax Information Required" 
          subtitle="Upload W9 form to receive payouts"
          icon={<FileText size={20} color={theme.colors.warning} />}
          style={{ marginBottom: '24px', border: `2px solid ${theme.colors.warning}` }}
        >
          <div style={{
            padding: '24px',
            background: `${theme.colors.warning}10`,
            borderRadius: '12px',
            border: `1px solid ${theme.colors.warning}30`
          }}>
            <div style={{ display: 'flex', alignItems: 'start', gap: '16px', marginBottom: '20px' }}>
              <AlertCircle size={24} color={theme.colors.warning} style={{ flexShrink: 0 }} />
              <div>
                <h4 style={{ margin: '0 0 8px 0', color: theme.colors.textPrimary, fontSize: '16px', fontWeight: '600' }}>
                  W9 Form Required for Payouts
                </h4>
                <p style={{ margin: 0, color: theme.colors.textSecondary, fontSize: '14px', lineHeight: '1.6' }}>
                  IRS regulations require us to collect a W9 form before we can process payouts. This is a standard requirement for all contractors.
                </p>
              </div>
            </div>
            
            <label style={{
              display: 'inline-block',
              padding: '12px 24px',
              background: theme.colors.warning,
              color: 'white',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}>
              <FileText size={16} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
              Upload W9 Form
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleW9Upload}
                style={{ display: 'none' }}
              />
            </label>
            
            <p style={{ fontSize: '12px', color: theme.colors.textTertiary, margin: '12px 0 0 0' }}>
              <a href="https://www.irs.gov/pub/irs-pdf/fw9.pdf" target="_blank" rel="noopener noreferrer" style={{ color: theme.colors.primary, textDecoration: 'underline' }}>
                Download blank W9 form from IRS website
              </a>
            </p>
          </div>
        </Card>
      )}

      {/* Bank Accounts */}
      <Card 
        title="Payout Bank Accounts" 
        subtitle="Manage where you receive your payments"
        icon={<Building size={20} color={theme.colors.primary} />}
        action={
          w9Uploaded && !showAddAccount && (
            <button
              onClick={() => setShowAddAccount(true)}
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
              <Plus size={16} />
              Add Bank Account
            </button>
          )
        }
      >
        {/* Add Account Form */}
        {showAddAccount && (
          <form onSubmit={handleAddAccount} style={{
            padding: '24px',
            background: theme.colors.backgroundSecondary,
            borderRadius: '12px',
            marginBottom: '24px',
            border: `1px solid ${theme.colors.border}`
          }}>
            <h3 style={{ color: theme.colors.textPrimary, margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600' }}>
              Add Payout Bank Account
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
                  placeholder={organization?.name || "Your Company Name or Your Name"}
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
                  Must match the name on your bank account
                </p>
              </div>

              {/* Bank Name */}
              <div>
                <label style={{ display: 'block', color: theme.colors.textSecondary, fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                  Bank Name *
                </label>
                <input
                  type="text"
                  value={bankForm.bankName}
                  onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                  placeholder="Chase, Bank of America, Wells Fargo, etc."
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
                  onChange={(e) => setBankForm({ ...bankForm, accountType: e.target.value as 'checking' | 'savings' })}
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
                  <option value="checking">Business Checking</option>
                  <option value="savings">Business Savings</option>
                </select>
              </div>
            </div>

            {/* Verification Info */}
            <div style={{
              padding: '16px',
              background: `${theme.colors.info}10`,
              border: `1px solid ${theme.colors.info}30`,
              borderRadius: '8px',
              marginTop: '16px'
            }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <Clock size={20} color={theme.colors.info} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ margin: '0 0 8px 0', color: theme.colors.textPrimary, fontSize: '14px', fontWeight: '600' }}>
                    Account Verification Process
                  </h4>
                  <p style={{ fontSize: '13px', color: theme.colors.textSecondary, margin: 0, lineHeight: '1.6' }}>
                    After adding your account, we'll send two small micro-deposits (less than $1 each) within 1-2 business days. 
                    You'll need to verify these amounts to complete setup. Once verified, you'll be able to receive payouts.
                  </p>
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
                    Add Bank Account Securely
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowAddAccount(false)}
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

        {/* Bank Accounts List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {payoutAccounts.length === 0 && !showAddAccount ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <Building size={48} style={{ color: theme.colors.textTertiary, margin: '0 auto 16px' }} />
              <p style={{ color: theme.colors.textSecondary, marginBottom: '8px' }}>No payout accounts added yet</p>
              <p style={{ color: theme.colors.textTertiary, fontSize: '14px' }}>
                Add a bank account to start receiving payouts for your loads
              </p>
            </div>
          ) : (
            payoutAccounts.map((account) => (
              <div
                key={account.id}
                style={{
                  padding: '20px',
                  background: theme.colors.backgroundSecondary,
                  border: `1px solid ${account.isDefault ? theme.colors.primary : theme.colors.border}`,
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
                    <Building size={24} color={theme.colors.primary} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                      <h4 style={{ margin: 0, color: theme.colors.textPrimary, fontSize: '16px', fontWeight: '600' }}>
                        {account.bankName} ••••{account.last4}
                      </h4>
                      {account.isDefault && (
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
                      {account.verified ? (
                        <span style={{
                          padding: '4px 10px',
                          background: `${theme.colors.success}20`,
                          color: theme.colors.success,
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <CheckCircle size={12} />
                          VERIFIED
                        </span>
                      ) : (
                        <span style={{
                          padding: '4px 10px',
                          background: `${theme.colors.warning}20`,
                          color: theme.colors.warning,
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '600'
                        }}>
                          PENDING VERIFICATION
                        </span>
                      )}
                    </div>
                    <p style={{ margin: 0, color: theme.colors.textSecondary, fontSize: '14px' }}>
                      {account.accountHolderName} • {account.accountType.charAt(0).toUpperCase() + account.accountType.slice(1)}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {!account.isDefault && account.verified && (
                    <button
                      onClick={() => handleSetDefault(account.id)}
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
                    onClick={() => handleDelete(account.id)}
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
      <Card title="Payout Information" icon={<Info size={20} color={theme.colors.info} />} style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
            <DollarSign size={20} color={theme.colors.success} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h4 style={{ margin: '0 0 4px 0', color: theme.colors.textPrimary, fontSize: '15px', fontWeight: '600' }}>
                Standard Payment Terms: Net-30
              </h4>
              <p style={{ margin: 0, color: theme.colors.textSecondary, fontSize: '14px', lineHeight: '1.6' }}>
                Payouts are processed 30 days after load completion. ACH transfers typically take 2-3 business days to appear in your account.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
            <Zap size={20} color={theme.colors.warning} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h4 style={{ margin: '0 0 4px 0', color: theme.colors.textPrimary, fontSize: '15px', fontWeight: '600' }}>
                QuickPay Option: Get paid in 48 hours
              </h4>
              <p style={{ margin: 0, color: theme.colors.textSecondary, fontSize: '14px', lineHeight: '1.6' }}>
                Need cash flow faster? Request QuickPay on any completed load for a 3% processing fee. Funds arrive within 48 hours.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
            <Shield size={20} color={theme.colors.info} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h4 style={{ margin: '0 0 4px 0', color: theme.colors.textPrimary, fontSize: '15px', fontWeight: '600' }}>
                Secure and reliable
              </h4>
              <p style={{ margin: 0, color: theme.colors.textSecondary, fontSize: '14px', lineHeight: '1.6' }}>
                All payouts are sent via ACH through Stripe Connect. Your banking information is encrypted and never shared with shippers.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
            <Info size={20} color={theme.colors.info} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h4 style={{ margin: '0 0 4px 0', color: theme.colors.textPrimary, fontSize: '15px', fontWeight: '600' }}>
                Questions about payouts?
              </h4>
              <p style={{ margin: 0, color: theme.colors.textSecondary, fontSize: '14px', lineHeight: '1.6' }}>
                Contact our payouts team at payouts@superioronelogistics.com or call (512) 555-PAY1 (7291)
              </p>
            </div>
          </div>
        </div>
      </Card>
    </PageContainer>
  )
}

export default PayoutSetupPage

