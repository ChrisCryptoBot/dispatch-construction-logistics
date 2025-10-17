import React, { useState } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext-fixed'
import { 
  Sun, Moon, User, Bell, Lock, Database, Palette, CreditCard,
  Mail, Phone, Building, MapPin, Globe, Calendar, Save, X,
  Check, AlertCircle, Shield, Eye, EyeOff, Download, Upload,
  Trash2, Edit, RefreshCw, Key, Smartphone
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { notificationAPI } from '../services/notificationAPI'
import { securityAPI } from '../services/securityAPI'
import { privacyAPI } from '../services/privacyAPI'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const SettingsPage = () => {
  const { theme, setThemeMode } = useTheme()
  const { user, organization, logout } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'appearance' | 'account' | 'notifications' | 'security' | 'data' | 'billing'>('appearance')
  
  // Account editing states
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '+1 (512) 555-0100',
    title: 'Operations Manager',
    department: 'Dispatch'
  })
  
  // Company editing states
  const [isEditingCompany, setIsEditingCompany] = useState(false)
  const [companyForm, setCompanyForm] = useState({
    name: organization?.name || '',
    address: '123 Main St',
    city: 'Austin',
    state: 'TX',
    zip: '78701',
    phone: '+1 (512) 555-0123',
    website: 'superiorone.com',
    ein: '**-***1234'
  })
  
  // Notification API integration
  const { data: notificationPreferences, isLoading: loadingPreferences } = useQuery({
    queryKey: ['notification-preferences'],
    queryFn: notificationAPI.getPreferences,
    staleTime: 5 * 60 * 1000 // 5 minutes
  })

  const updatePreferencesMutation = useMutation({
    mutationFn: notificationAPI.updatePreferences,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] })
      queryClient.invalidateQueries({ queryKey: ['unread-notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notifications-recent'] })
    }
  })

  // Loading and error states for notifications
  const [savingNotifications, setSavingNotifications] = useState(false)
  const [notificationError, setNotificationError] = useState<string | null>(null)
  
  // Security API integration
  const { data: securitySettings, isLoading: loadingSecurity } = useQuery({
    queryKey: ['security-settings'],
    queryFn: securityAPI.getSettings,
    staleTime: 5 * 60 * 1000 // 5 minutes
  })

  const { data: activeSessions } = useQuery({
    queryKey: ['active-sessions'],
    queryFn: securityAPI.getActiveSessions,
    staleTime: 2 * 60 * 1000 // 2 minutes
  })

  const { data: securityEvents } = useQuery({
    queryKey: ['security-events'],
    queryFn: securityAPI.getSecurityEvents,
    staleTime: 5 * 60 * 1000 // 5 minutes
  })

  const updateSecurityMutation = useMutation({
    mutationFn: securityAPI.updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security-settings'] })
    }
  })

  // Security form states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  // Security operation states
  const [changingPassword, setChangingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [settingUp2FA, setSettingUp2FA] = useState(false)
  const [show2FASetup, setShow2FASetup] = useState(false)
  const [twoFactorSetup, setTwoFactorSetup] = useState<any>(null)
  
  // Privacy API integration
  const { data: privacySettings, isLoading: loadingPrivacy } = useQuery({
    queryKey: ['privacy-settings'],
    queryFn: privacyAPI.getSettings,
    staleTime: 5 * 60 * 1000 // 5 minutes
  })

  const { data: dataUsage } = useQuery({
    queryKey: ['data-usage'],
    queryFn: privacyAPI.getDataUsage,
    staleTime: 5 * 60 * 1000
  })

  const { data: privacyAuditLog } = useQuery({
    queryKey: ['privacy-audit-log'],
    queryFn: privacyAPI.getAuditLog,
    staleTime: 5 * 60 * 1000
  })

  const updatePrivacyMutation = useMutation({
    mutationFn: privacyAPI.updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['privacy-settings'] })
      queryClient.invalidateQueries({ queryKey: ['privacy-audit-log'] })
    }
  })

  // Privacy operation states
  const [exportingData, setExportingData] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)
  const [deletingAccount, setDeletingAccount] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const tabs = [
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'account', label: 'Account', icon: User },
    { id: 'billing', label: 'Billing & Payments', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'data', label: 'Data & Privacy', icon: Database }
  ]

  // Loading states
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingCompany, setSavingCompany] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [companyError, setCompanyError] = useState<string | null>(null)
  
  // Billing states
  const [billingSettings, setBillingSettings] = useState({
    paymentTerms: 'Net 7 Days',
    gracePeriod: '3 Days',
    invoicePrefix: 'INV-2025',
    autoSend: 'Manual',
    payoutSchedule: 'Same Day'
  })
  const [savingBilling, setSavingBilling] = useState(false)
  const [billingError, setBillingError] = useState<string | null>(null)

  // Validation functions
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePhone = (phone: string) => {
    const phoneRegex = /^\+?1?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/
    return phoneRegex.test(phone.replace(/\D/g, ''))
  }

  // Handlers
  const handleSaveProfile = async () => {
    setProfileError(null)
    
    // Validation
    if (!profileForm.firstName.trim()) {
      setProfileError('First name is required')
      return
    }
    if (!profileForm.lastName.trim()) {
      setProfileError('Last name is required')
      return
    }
    if (!profileForm.email.trim()) {
      setProfileError('Email is required')
      return
    }
    if (!validateEmail(profileForm.email)) {
      setProfileError('Please enter a valid email address')
      return
    }
    if (profileForm.phone && !validatePhone(profileForm.phone)) {
      setProfileError('Please enter a valid phone number')
      return
    }

    setSavingProfile(true)
    try {
      console.log('💾 Saving profile...', profileForm)
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      
      setIsEditingProfile(false)
      alert('✅ Profile updated successfully!')
    } catch (error) {
      console.error('Profile save error:', error)
      setProfileError('Failed to save profile. Please try again.')
    } finally {
      setSavingProfile(false)
    }
  }

  const handleSaveCompany = async () => {
    setCompanyError(null)
    
    // Validation
    if (!companyForm.name.trim()) {
      setCompanyError('Company name is required')
      return
    }
    if (!companyForm.address.trim()) {
      setCompanyError('Address is required')
      return
    }
    if (!companyForm.city.trim()) {
      setCompanyError('City is required')
      return
    }
    if (!companyForm.state.trim()) {
      setCompanyError('State is required')
      return
    }
    if (!companyForm.zip.trim()) {
      setCompanyError('ZIP code is required')
      return
    }

    setSavingCompany(true)
    try {
      console.log('💾 Saving company info...', companyForm)
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      
      setIsEditingCompany(false)
      alert('✅ Company information updated successfully!')
    } catch (error) {
      console.error('Company save error:', error)
      setCompanyError('Failed to save company information. Please try again.')
    } finally {
      setSavingCompany(false)
    }
  }

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError('Please fill in all password fields')
      return
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match')
      return
    }
    
    if (passwordForm.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters')
      return
    }

    // Check password strength
    const hasUpperCase = /[A-Z]/.test(passwordForm.newPassword)
    const hasLowerCase = /[a-z]/.test(passwordForm.newPassword)
    const hasNumbers = /\d/.test(passwordForm.newPassword)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(passwordForm.newPassword)

    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      setPasswordError('Password must contain uppercase, lowercase, numbers, and special characters')
      return
    }
    
    setPasswordError(null)
    setChangingPassword(true)

    try {
      await securityAPI.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      })
      
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      
      // Update security settings cache
      queryClient.invalidateQueries({ queryKey: ['security-settings'] })
      
      alert('✅ Password changed successfully! Please log in again.')
      // logout() // Uncomment when ready to implement logout
    } catch (error) {
      console.error('Password change failed:', error)
      setPasswordError('Failed to change password. Please check your current password and try again.')
    } finally {
      setChangingPassword(false)
    }
  }

  // Billing handlers
  const handleBillingSettingChange = async (setting: string, value: string) => {
    setBillingError(null)
    setSavingBilling(true)
    
    try {
      // Update local state immediately for better UX
      setBillingSettings(prev => ({ ...prev, [setting]: value }))
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      console.log(`💳 Billing setting updated: ${setting} = ${value}`)
    } catch (error) {
      console.error('Billing update error:', error)
      setBillingError(`Failed to update ${setting}. Please try again.`)
      // Revert state on error
      setBillingSettings(prev => ({ ...prev, [setting]: prev[setting as keyof typeof prev] }))
    } finally {
      setSavingBilling(false)
    }
  }

  const handlePayoutSetup = () => {
    // Navigate to a modal or dedicated page for payout setup
    alert('🔧 Payout setup feature coming soon! This will integrate with Stripe Connect for secure bank account management.')
  }

  const handleStripeUpgrade = () => {
    // Navigate to Stripe integration setup
    alert('💳 Stripe integration coming soon! This will enable automated payment processing and reduce manual invoice management.')
  }

  // Notification handlers
  const handleNotificationToggle = async (type: string, channel: 'email' | 'sms' | 'push', enabled: boolean) => {
    if (!notificationPreferences) return

    setNotificationError(null)
    setSavingNotifications(true)

    try {
      const updatedPreferences = {
        ...notificationPreferences,
        [channel === 'email' ? 'emailNotifications' : channel === 'sms' ? 'smsNotifications' : 'pushNotifications']: enabled,
        types: {
          ...notificationPreferences.types,
          [type as keyof typeof notificationPreferences.types]: {
            ...notificationPreferences.types[type as keyof typeof notificationPreferences.types],
            [channel]: enabled
          }
        }
      }

      await updatePreferencesMutation.mutateAsync(updatedPreferences)
    } catch (error) {
      console.error('Failed to update notification preferences:', error)
      setNotificationError(`Failed to update ${channel} notifications. Please try again.`)
    } finally {
      setSavingNotifications(false)
    }
  }

  const handleBulkNotificationToggle = async (channel: 'email' | 'sms' | 'push', enabled: boolean) => {
    if (!notificationPreferences) return

    setNotificationError(null)
    setSavingNotifications(true)

    try {
      const updatedTypes = Object.keys(notificationPreferences.types).reduce((acc, type) => {
        acc[type] = {
          ...notificationPreferences.types[type as keyof typeof notificationPreferences.types],
          [channel]: enabled
        }
        return acc
      }, {} as typeof notificationPreferences.types)

      const updatedPreferences = {
        ...notificationPreferences,
        [channel === 'email' ? 'emailNotifications' : channel === 'sms' ? 'smsNotifications' : 'pushNotifications']: enabled,
        types: updatedTypes
      }

      await updatePreferencesMutation.mutateAsync(updatedPreferences)
    } catch (error) {
      console.error('Failed to update notification preferences:', error)
      setNotificationError(`Failed to update ${channel} notifications. Please try again.`)
    } finally {
      setSavingNotifications(false)
    }
  }

  const handleToggle2FA = async () => {
    if (!securitySettings?.twoFactorEnabled) {
      const confirmed = window.confirm(
        '🔐 Enable Two-Factor Authentication?\n\n' +
        'This will add an extra layer of security to your account.\n\n' +
        'You will need to scan a QR code with an authenticator app.\n\n' +
        'Continue?'
      )
      if (confirmed) {
        setSettingUp2FA(true)
        try {
          const setup = await securityAPI.setup2FA()
          setTwoFactorSetup(setup)
          setShow2FASetup(true)
        } catch (error) {
          console.error('2FA setup failed:', error)
          alert('❌ Failed to setup 2FA. Please try again.')
        } finally {
          setSettingUp2FA(false)
        }
      }
    } else {
      const confirmed = window.confirm(
        '⚠️ Disable Two-Factor Authentication?\n\n' +
        'This will remove the extra security layer from your account.\n\n' +
        'Are you sure you want to continue?'
      )
      if (confirmed) {
        try {
          await securityAPI.disable2FA('') // In real implementation, ask for password
          queryClient.invalidateQueries({ queryKey: ['security-settings'] })
          alert('✅ 2FA Disabled!\n\nYour account is now less secure.')
        } catch (error) {
          console.error('2FA disable failed:', error)
          alert('❌ Failed to disable 2FA. Please try again.')
        }
      }
    }
  }

  const handleVerify2FA = async (token: string) => {
    try {
      await securityAPI.verify2FA(token)
      setShow2FASetup(false)
      setTwoFactorSetup(null)
      queryClient.invalidateQueries({ queryKey: ['security-settings'] })
      alert('✅ 2FA Enabled Successfully!\n\nYour account is now protected with two-factor authentication.')
    } catch (error) {
      console.error('2FA verification failed:', error)
      alert('❌ Invalid verification code. Please try again.')
    }
  }

  const handleTerminateSession = async (sessionId: string) => {
    const confirmed = window.confirm('Are you sure you want to terminate this session?')
    if (confirmed) {
      try {
        await securityAPI.terminateSession(sessionId)
        queryClient.invalidateQueries({ queryKey: ['active-sessions'] })
        alert('✅ Session terminated successfully.')
      } catch (error) {
        console.error('Session termination failed:', error)
        alert('❌ Failed to terminate session. Please try again.')
      }
    }
  }

  const handleTerminateAllOtherSessions = async () => {
    const confirmed = window.confirm('Are you sure you want to terminate all other sessions? This will log out all other devices.')
    if (confirmed) {
      try {
        await securityAPI.terminateAllOtherSessions()
        queryClient.invalidateQueries({ queryKey: ['active-sessions'] })
        alert('✅ All other sessions terminated successfully.')
      } catch (error) {
        console.error('Session termination failed:', error)
        alert('❌ Failed to terminate sessions. Please try again.')
      }
    }
  }

  const handlePrivacyToggle = async (setting: string, value: boolean) => {
    if (!privacySettings) return

    try {
      await updatePrivacyMutation.mutateAsync({
        [setting]: value
      })
    } catch (error) {
      console.error('Failed to update privacy setting:', error)
      alert('❌ Failed to update privacy settings. Please try again.')
    }
  }

  const handleExportData = async () => {
    const confirmed = window.confirm(
      '📦 Export Your Data?\n\n' +
      'This will create a downloadable archive containing:\n\n' +
      '• Profile information\n' +
      '• Load history\n' +
      '• Transaction records\n' +
      '• Communication logs\n' +
      '• Preference settings\n\n' +
      'You will receive a download link via email.\n\n' +
      'Continue?'
    )

    if (!confirmed) return

    setExportError(null)
    setExportingData(true)

    try {
      const exportRequest = await privacyAPI.requestDataExport('json')
      
      alert(
        '✅ Data export request submitted!\n\n' +
        `Request ID: ${exportRequest.userId.substring(0, 8)}\n` +
        'Status: Processing\n\n' +
        'You will receive an email with a download link within 24 hours.\n\n' +
        'The download will be available for 7 days.'
      )
      
      queryClient.invalidateQueries({ queryKey: ['privacy-audit-log'] })
    } catch (error) {
      console.error('Data export failed:', error)
      setExportError('Failed to request data export. Please try again.')
    } finally {
      setExportingData(false)
    }
  }

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      '⚠️ DELETE ACCOUNT?\n\n' +
      'This action is IRREVERSIBLE and will:\n\n' +
      '• Permanently delete your account\n' +
      '• Remove all your data\n' +
      '• Cancel active loads\n' +
      '• Terminate billing\n' +
      '• Cannot be undone\n\n' +
      'Are you absolutely sure?'
    )
    
    if (!confirmed) return

    const typeConfirm = prompt('Type DELETE in capital letters to confirm account deletion:')
    
    if (typeConfirm !== 'DELETE') {
      alert('❌ Account deletion cancelled. Text did not match.')
      return
    }

    const password = prompt('Enter your password to confirm:')
    
    if (!password) {
      alert('❌ Account deletion cancelled. Password required.')
      return
    }

    const reason = prompt('Please tell us why you are deleting your account (optional):') || 'No reason provided'

    setDeleteError(null)
    setDeletingAccount(true)

    try {
      const deletionRequest = await privacyAPI.requestAccountDeletion(reason, password)
      
      alert(
        '✅ Account deletion request received.\n\n' +
        `Confirmation Code: ${deletionRequest.confirmationCode}\n` +
        `Scheduled for: ${new Date(deletionRequest.scheduledFor).toLocaleDateString()}\n\n` +
        'Your account will be deleted in 7 days.\n\n' +
        'You will receive a final confirmation email.\n\n' +
        'You can cancel this request within 7 days by contacting support with your confirmation code.'
      )
      
      queryClient.invalidateQueries({ queryKey: ['privacy-audit-log'] })
      
      // Optional: logout user after a delay
      // setTimeout(() => logout(), 3000)
    } catch (error) {
      console.error('Account deletion failed:', error)
      setDeleteError('Failed to process account deletion. Please check your password and try again.')
    } finally {
      setDeletingAccount(false)
    }
  }

  return (
    <div style={{
      maxWidth: '1400px',
      margin: '0 auto',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        background: theme.colors.backgroundCard,
        borderRadius: '24px',
        padding: '32px',
        marginBottom: '32px',
        border: `1px solid ${theme.colors.border}`,
        boxShadow: theme.shadow.subtle
      }}>
        <h1 style={{
          fontSize: '36px',
          fontWeight: 'bold',
          margin: '0 0 12px 0',
          color: theme.colors.textPrimary,
          letterSpacing: '-0.025em'
        }}>
          Settings
        </h1>
        <p style={{
          fontSize: '18px',
          color: theme.colors.textSecondary,
          margin: 0,
          fontWeight: '500'
        }}>
          Manage your account preferences and system configuration
        </p>
      </div>

      <div style={{ display: 'flex', gap: '24px' }}>
        {/* Sidebar Tabs */}
        <div style={{
          width: '280px',
          background: theme.colors.backgroundCard,
          borderRadius: '16px',
          padding: '16px',
          border: `1px solid ${theme.colors.border}`,
          boxShadow: theme.shadow.subtle,
          height: 'fit-content'
        }}>
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px',
                  backgroundColor: isActive ? theme.colors.primary : 'transparent',
                  color: isActive ? 'white' : theme.colors.textPrimary,
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  marginBottom: '8px',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = theme.colors.backgroundCardHover
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }
                }}
              >
                <Icon style={{ width: '20px', height: '20px' }} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Content Area */}
        <div style={{ flex: 1 }}>
          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div style={{
              background: theme.colors.backgroundCard,
              borderRadius: '16px',
              padding: '32px',
              border: `1px solid ${theme.colors.border}`,
              boxShadow: theme.shadow.subtle
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                margin: '0 0 8px 0',
                color: theme.colors.textPrimary
              }}>
                Appearance Settings
              </h2>
              <p style={{
                fontSize: '16px',
                color: theme.colors.textSecondary,
                margin: '0 0 32px 0'
              }}>
                Customize how the application looks and feels
              </p>

              {/* Theme Selector */}
              <div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: theme.colors.textPrimary,
                  margin: '0 0 16px 0'
                }}>
                  Theme Mode
                </h3>
                
                <div style={{ display: 'flex', gap: '16px' }}>
                  {/* Light Theme Option */}
                  <button
                    onClick={() => {
                      setThemeMode('light')
                      alert('✅ Light mode activated!')
                    }}
                    style={{
                      flex: 1,
                      padding: '24px',
                      borderRadius: '16px',
                      border: `2px solid ${theme.name === 'light' ? theme.colors.primary : theme.colors.border}`,
                      backgroundColor: theme.name === 'light' ? `${theme.colors.primary}10` : theme.colors.backgroundTertiary,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      if (theme.name !== 'light') {
                        e.currentTarget.style.transform = 'translateY(-4px)'
                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (theme.name !== 'light') {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = 'none'
                      }
                    }}
                  >
                    <div style={{ position: 'relative', zIndex: 1 }}>
                      <div style={{
                        width: '56px',
                        height: '56px',
                        background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                        boxShadow: '0 8px 24px rgba(251, 191, 36, 0.3)'
                      }}>
                        <Sun style={{ width: '28px', height: '28px', color: 'white' }} />
                      </div>
                      <h4 style={{
                        fontSize: '18px',
                        fontWeight: '700',
                        color: theme.colors.textPrimary,
                        margin: '0 0 8px 0',
                        textAlign: 'center'
                      }}>
                        Light Mode
                      </h4>
                      <p style={{
                        fontSize: '14px',
                        color: theme.colors.textSecondary,
                        margin: 0,
                        textAlign: 'center',
                        lineHeight: '1.5'
                      }}>
                        Clean, bright interface perfect for daytime use
                      </p>
                    </div>
                    {theme.name === 'light' && (
                      <div style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        width: '24px',
                        height: '24px',
                        background: theme.colors.success,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 4px 12px ${theme.colors.success}40`
                      }}>
                        <Check size={14} color="white" style={{ fontWeight: 'bold' }} />
                      </div>
                    )}
                  </button>

                  {/* Dark Theme Option */}
                  <button
                    onClick={() => {
                      setThemeMode('dark')
                      alert('✅ Dark mode activated!')
                    }}
                    style={{
                      flex: 1,
                      padding: '24px',
                      borderRadius: '16px',
                      border: `2px solid ${theme.name === 'dark' ? theme.colors.primary : theme.colors.border}`,
                      backgroundColor: theme.name === 'dark' ? `${theme.colors.primary}10` : theme.colors.backgroundTertiary,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      if (theme.name !== 'dark') {
                        e.currentTarget.style.transform = 'translateY(-4px)'
                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (theme.name !== 'dark') {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = 'none'
                      }
                    }}
                  >
                    <div style={{ position: 'relative', zIndex: 1 }}>
                      <div style={{
                        width: '56px',
                        height: '56px',
                        background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                        boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)'
                      }}>
                        <Moon style={{ width: '28px', height: '28px', color: 'white' }} />
                      </div>
                      <h4 style={{
                        fontSize: '18px',
                        fontWeight: '700',
                        color: theme.colors.textPrimary,
                        margin: '0 0 8px 0',
                        textAlign: 'center'
                      }}>
                        Dark Mode
                      </h4>
                      <p style={{
                        fontSize: '14px',
                        color: theme.colors.textSecondary,
                        margin: 0,
                        textAlign: 'center',
                        lineHeight: '1.5'
                      }}>
                        Reduced eye strain for extended use and low-light environments
                      </p>
                    </div>
                    {theme.name === 'dark' && (
                      <div style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        width: '24px',
                        height: '24px',
                        background: theme.colors.success,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 4px 12px ${theme.colors.success}40`
                      }}>
                        <Check size={14} color="white" style={{ fontWeight: 'bold' }} />
                      </div>
                    )}
                  </button>
                </div>

                {/* Current Theme Info */}
                <div style={{
                  marginTop: '24px',
                  padding: '16px',
                  backgroundColor: theme.colors.backgroundTertiary,
                  borderRadius: '12px',
                  border: `1px solid ${theme.colors.border}`
                }}>
                  <p style={{
                    fontSize: '14px',
                    color: theme.colors.textSecondary,
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{
                      width: '8px',
                      height: '8px',
                      background: theme.colors.success,
                      borderRadius: '50%',
                      boxShadow: `0 0 8px ${theme.colors.success}`
                    }} />
                    Currently using <strong style={{ color: theme.colors.textPrimary, marginLeft: '4px' }}>
                      {theme.name === 'dark' ? 'Dark' : 'Light'} Mode
                    </strong>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Account Tab */}
          {activeTab === 'account' && (
            <div style={{
              background: theme.colors.backgroundCard,
              borderRadius: '16px',
              padding: '32px',
              border: `1px solid ${theme.colors.border}`,
              boxShadow: theme.shadow.subtle
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                margin: '0 0 8px 0',
                color: theme.colors.textPrimary
              }}>
                Account Settings
              </h2>
              <p style={{
                fontSize: '16px',
                color: theme.colors.textSecondary,
                margin: '0 0 32px 0'
              }}>
                Manage your personal information and organization details
              </p>

              {/* Personal Information */}
              <div style={{
                padding: '24px',
                backgroundColor: theme.colors.backgroundTertiary,
                borderRadius: '12px',
                border: `1px solid ${theme.colors.border}`,
                marginBottom: '24px'
              }}>
                {profileError && (
                  <div style={{
                    marginBottom: '20px',
                    padding: '12px 16px',
                    backgroundColor: `${theme.colors.error}10`,
                    border: `1px solid ${theme.colors.error}30`,
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <AlertCircle size={16} color={theme.colors.error} />
                    <p style={{
                      color: theme.colors.error,
                      fontSize: '14px',
                      fontWeight: '500',
                      margin: 0
                    }}>
                      {profileError}
                    </p>
                  </div>
                )}
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary, margin: 0 }}>
                    Personal Information
                  </h3>
                  {!isEditingProfile ? (
                    <button
                      onClick={() => setIsEditingProfile(true)}
                      style={{
                        padding: '8px 16px',
                        background: theme.colors.primary,
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      <Edit size={14} />
                      Edit
                    </button>
                  ) : (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={handleSaveProfile}
                        disabled={savingProfile}
                        style={{
                          padding: '8px 16px',
                          background: savingProfile ? theme.colors.backgroundCard : theme.colors.success,
                          color: savingProfile ? theme.colors.textSecondary : 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: savingProfile ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.2s ease',
                          opacity: savingProfile ? 0.6 : 1
                        }}
                        onMouseEnter={(e) => {
                          if (!savingProfile) e.currentTarget.style.transform = 'translateY(-2px)'
                        }}
                        onMouseLeave={(e) => {
                          if (!savingProfile) e.currentTarget.style.transform = 'translateY(0)'
                        }}
                      >
                        {savingProfile ? (
                          <>
                            <RefreshCw size={14} className="animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save size={14} />
                            Save
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setIsEditingProfile(false)}
                        style={{
                          padding: '8px 16px',
                          background: theme.colors.backgroundCard,
                          color: theme.colors.textPrimary,
                          border: `1px solid ${theme.colors.border}`,
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = theme.colors.backgroundCardHover}
                        onMouseLeave={(e) => e.currentTarget.style.background = theme.colors.backgroundCard}
                      >
                        <X size={14} />
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: theme.colors.textSecondary,
                      display: 'block',
                      marginBottom: '8px'
                    }}>
                      <User size={14} style={{ display: 'inline', marginRight: '6px' }} />
                      First Name
                    </label>
                    {isEditingProfile ? (
                      <input
                        type="text"
                        value={profileForm.firstName}
                        onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '12px',
                          background: theme.colors.background,
                          border: `1px solid ${theme.colors.border}`,
                          borderRadius: '8px',
                          color: theme.colors.textPrimary,
                          fontSize: '14px',
                          outline: 'none',
                          transition: 'all 0.2s ease'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = theme.colors.primary
                          e.target.style.boxShadow = `0 0 0 3px ${theme.colors.primary}20`
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = theme.colors.border
                          e.target.style.boxShadow = 'none'
                        }}
                      />
                    ) : (
                      <div style={{
                        fontSize: '16px',
                        color: theme.colors.textPrimary,
                        fontWeight: '600'
                      }}>
                        {profileForm.firstName}
                      </div>
                    )}
                  </div>

                  <div>
                    <label style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: theme.colors.textSecondary,
                      display: 'block',
                      marginBottom: '8px'
                    }}>
                      Last Name
                    </label>
                    {isEditingProfile ? (
                      <input
                        type="text"
                        value={profileForm.lastName}
                        onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '12px',
                          background: theme.colors.background,
                          border: `1px solid ${theme.colors.border}`,
                          borderRadius: '8px',
                          color: theme.colors.textPrimary,
                          fontSize: '14px',
                          outline: 'none',
                          transition: 'all 0.2s ease'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = theme.colors.primary
                          e.target.style.boxShadow = `0 0 0 3px ${theme.colors.primary}20`
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = theme.colors.border
                          e.target.style.boxShadow = 'none'
                        }}
                      />
                    ) : (
                      <div style={{
                        fontSize: '16px',
                        color: theme.colors.textPrimary,
                        fontWeight: '600'
                      }}>
                        {profileForm.lastName}
                      </div>
                    )}
                  </div>

                  <div>
                    <label style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: theme.colors.textSecondary,
                      display: 'block',
                      marginBottom: '8px'
                    }}>
                      <Mail size={14} style={{ display: 'inline', marginRight: '6px' }} />
                      Email Address
                    </label>
                    {isEditingProfile ? (
                      <input
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '12px',
                          background: theme.colors.background,
                          border: `1px solid ${theme.colors.border}`,
                          borderRadius: '8px',
                          color: theme.colors.textPrimary,
                          fontSize: '14px',
                          outline: 'none',
                          transition: 'all 0.2s ease'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = theme.colors.primary
                          e.target.style.boxShadow = `0 0 0 3px ${theme.colors.primary}20`
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = theme.colors.border
                          e.target.style.boxShadow = 'none'
                        }}
                      />
                    ) : (
                      <div style={{
                        fontSize: '16px',
                        color: theme.colors.textPrimary,
                        fontWeight: '600'
                      }}>
                        {profileForm.email}
                      </div>
                    )}
                  </div>

                  <div>
                    <label style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: theme.colors.textSecondary,
                      display: 'block',
                      marginBottom: '8px'
                    }}>
                      <Phone size={14} style={{ display: 'inline', marginRight: '6px' }} />
                      Phone Number
                    </label>
                    {isEditingProfile ? (
                      <input
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '12px',
                          background: theme.colors.background,
                          border: `1px solid ${theme.colors.border}`,
                          borderRadius: '8px',
                          color: theme.colors.textPrimary,
                          fontSize: '14px',
                          outline: 'none',
                          transition: 'all 0.2s ease'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = theme.colors.primary
                          e.target.style.boxShadow = `0 0 0 3px ${theme.colors.primary}20`
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = theme.colors.border
                          e.target.style.boxShadow = 'none'
                        }}
                      />
                    ) : (
                      <div style={{
                        fontSize: '16px',
                        color: theme.colors.textPrimary,
                        fontWeight: '600'
                      }}>
                        {profileForm.phone}
                      </div>
                    )}
                  </div>

                  <div>
                    <label style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: theme.colors.textSecondary,
                      display: 'block',
                      marginBottom: '8px'
                    }}>
                      Job Title
                    </label>
                    {isEditingProfile ? (
                      <input
                        type="text"
                        value={profileForm.title}
                        onChange={(e) => setProfileForm({ ...profileForm, title: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '12px',
                          background: theme.colors.background,
                          border: `1px solid ${theme.colors.border}`,
                          borderRadius: '8px',
                          color: theme.colors.textPrimary,
                          fontSize: '14px',
                          outline: 'none',
                          transition: 'all 0.2s ease'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = theme.colors.primary
                          e.target.style.boxShadow = `0 0 0 3px ${theme.colors.primary}20`
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = theme.colors.border
                          e.target.style.boxShadow = 'none'
                        }}
                      />
                    ) : (
                      <div style={{
                        fontSize: '16px',
                        color: theme.colors.textPrimary,
                        fontWeight: '600'
                      }}>
                        {profileForm.title}
                      </div>
                    )}
                  </div>

                  <div>
                    <label style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: theme.colors.textSecondary,
                      display: 'block',
                      marginBottom: '8px'
                    }}>
                      Department
                    </label>
                    {isEditingProfile ? (
                      <select
                        value={profileForm.department}
                        onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '12px',
                          background: theme.colors.background,
                          border: `1px solid ${theme.colors.border}`,
                          borderRadius: '8px',
                          color: theme.colors.textPrimary,
                          fontSize: '14px',
                          cursor: 'pointer',
                          outline: 'none',
                          transition: 'all 0.2s ease'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = theme.colors.primary
                          e.target.style.boxShadow = `0 0 0 3px ${theme.colors.primary}20`
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = theme.colors.border
                          e.target.style.boxShadow = 'none'
                        }}
                      >
                        <option style={{ background: theme.colors.backgroundCard, color: theme.colors.textPrimary }}>Dispatch</option>
                        <option style={{ background: theme.colors.backgroundCard, color: theme.colors.textPrimary }}>Operations</option>
                        <option style={{ background: theme.colors.backgroundCard, color: theme.colors.textPrimary }}>Sales</option>
                        <option style={{ background: theme.colors.backgroundCard, color: theme.colors.textPrimary }}>Administration</option>
                        <option style={{ background: theme.colors.backgroundCard, color: theme.colors.textPrimary }}>Finance</option>
                      </select>
                    ) : (
                      <div style={{
                        fontSize: '16px',
                        color: theme.colors.textPrimary,
                        fontWeight: '600'
                      }}>
                        {profileForm.department}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Company Information */}
              <div style={{
                padding: '24px',
                backgroundColor: theme.colors.backgroundTertiary,
                borderRadius: '12px',
                border: `1px solid ${theme.colors.border}`
              }}>
                {companyError && (
                  <div style={{
                    marginBottom: '20px',
                    padding: '12px 16px',
                    backgroundColor: `${theme.colors.error}10`,
                    border: `1px solid ${theme.colors.error}30`,
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <AlertCircle size={16} color={theme.colors.error} />
                    <p style={{
                      color: theme.colors.error,
                      fontSize: '14px',
                      fontWeight: '500',
                      margin: 0
                    }}>
                      {companyError}
                    </p>
                  </div>
                )}
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary, margin: 0 }}>
                    <Building size={18} style={{ display: 'inline', marginRight: '8px' }} />
                    Company Information
                  </h3>
                  {!isEditingCompany ? (
                    <button
                      onClick={() => setIsEditingCompany(true)}
                      style={{
                        padding: '8px 16px',
                        background: theme.colors.primary,
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      <Edit size={14} />
                      Edit
                    </button>
                  ) : (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={handleSaveCompany}
                        disabled={savingCompany}
                        style={{
                          padding: '8px 16px',
                          background: savingCompany ? theme.colors.backgroundCard : theme.colors.success,
                          color: savingCompany ? theme.colors.textSecondary : 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: savingCompany ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.2s ease',
                          opacity: savingCompany ? 0.6 : 1
                        }}
                        onMouseEnter={(e) => {
                          if (!savingCompany) e.currentTarget.style.transform = 'translateY(-2px)'
                        }}
                        onMouseLeave={(e) => {
                          if (!savingCompany) e.currentTarget.style.transform = 'translateY(0)'
                        }}
                      >
                        {savingCompany ? (
                          <>
                            <RefreshCw size={14} className="animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save size={14} />
                            Save
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setIsEditingCompany(false)}
                        style={{
                          padding: '8px 16px',
                          background: theme.colors.backgroundCard,
                          color: theme.colors.textPrimary,
                          border: `1px solid ${theme.colors.border}`,
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = theme.colors.backgroundCardHover}
                        onMouseLeave={(e) => e.currentTarget.style.background = theme.colors.backgroundCard}
                      >
                        <X size={14} />
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: theme.colors.textSecondary,
                      display: 'block',
                      marginBottom: '8px'
                    }}>
                      Company Name
                    </label>
                    {isEditingCompany ? (
                      <input
                        type="text"
                        value={companyForm.name}
                        onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '12px',
                          background: theme.colors.background,
                          border: `1px solid ${theme.colors.border}`,
                          borderRadius: '8px',
                          color: theme.colors.textPrimary,
                          fontSize: '14px',
                          outline: 'none',
                          transition: 'all 0.2s ease'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = theme.colors.primary
                          e.target.style.boxShadow = `0 0 0 3px ${theme.colors.primary}20`
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = theme.colors.border
                          e.target.style.boxShadow = 'none'
                        }}
                      />
                    ) : (
                      <div style={{
                        fontSize: '16px',
                        color: theme.colors.textPrimary,
                        fontWeight: '600'
                      }}>
                        {companyForm.name}
                      </div>
                    )}
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: theme.colors.textSecondary,
                      display: 'block',
                      marginBottom: '8px'
                    }}>
                      <MapPin size={14} style={{ display: 'inline', marginRight: '6px' }} />
                      Address
                    </label>
                    {isEditingCompany ? (
                      <input
                        type="text"
                        value={companyForm.address}
                        onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '12px',
                          background: theme.colors.background,
                          border: `1px solid ${theme.colors.border}`,
                          borderRadius: '8px',
                          color: theme.colors.textPrimary,
                          fontSize: '14px',
                          outline: 'none',
                          transition: 'all 0.2s ease'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = theme.colors.primary
                          e.target.style.boxShadow = `0 0 0 3px ${theme.colors.primary}20`
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = theme.colors.border
                          e.target.style.boxShadow = 'none'
                        }}
                      />
                    ) : (
                      <div style={{
                        fontSize: '16px',
                        color: theme.colors.textPrimary,
                        fontWeight: '600'
                      }}>
                        {companyForm.address}
                      </div>
                    )}
                  </div>

                  <div>
                    <label style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: theme.colors.textSecondary,
                      display: 'block',
                      marginBottom: '8px'
                    }}>
                      City
                    </label>
                    {isEditingCompany ? (
                      <input
                        type="text"
                        value={companyForm.city}
                        onChange={(e) => setCompanyForm({ ...companyForm, city: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '12px',
                          background: theme.colors.background,
                          border: `1px solid ${theme.colors.border}`,
                          borderRadius: '8px',
                          color: theme.colors.textPrimary,
                          fontSize: '14px',
                          outline: 'none',
                          transition: 'all 0.2s ease'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = theme.colors.primary
                          e.target.style.boxShadow = `0 0 0 3px ${theme.colors.primary}20`
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = theme.colors.border
                          e.target.style.boxShadow = 'none'
                        }}
                      />
                    ) : (
                      <div style={{
                        fontSize: '16px',
                        color: theme.colors.textPrimary,
                        fontWeight: '600'
                      }}>
                        {companyForm.city}
                      </div>
                    )}
                  </div>

                  <div>
                    <label style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: theme.colors.textSecondary,
                      display: 'block',
                      marginBottom: '8px'
                    }}>
                      State
                    </label>
                    {isEditingCompany ? (
                      <input
                        type="text"
                        value={companyForm.state}
                        onChange={(e) => setCompanyForm({ ...companyForm, state: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '12px',
                          background: theme.colors.background,
                          border: `1px solid ${theme.colors.border}`,
                          borderRadius: '8px',
                          color: theme.colors.textPrimary,
                          fontSize: '14px',
                          outline: 'none',
                          transition: 'all 0.2s ease'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = theme.colors.primary
                          e.target.style.boxShadow = `0 0 0 3px ${theme.colors.primary}20`
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = theme.colors.border
                          e.target.style.boxShadow = 'none'
                        }}
                      />
                    ) : (
                      <div style={{
                        fontSize: '16px',
                        color: theme.colors.textPrimary,
                        fontWeight: '600'
                      }}>
                        {companyForm.state}
                      </div>
                    )}
                  </div>

                  <div>
                    <label style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: theme.colors.textSecondary,
                      display: 'block',
                      marginBottom: '8px'
                    }}>
                      ZIP Code
                    </label>
                    {isEditingCompany ? (
                      <input
                        type="text"
                        value={companyForm.zip}
                        onChange={(e) => setCompanyForm({ ...companyForm, zip: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '12px',
                          background: theme.colors.background,
                          border: `1px solid ${theme.colors.border}`,
                          borderRadius: '8px',
                          color: theme.colors.textPrimary,
                          fontSize: '14px',
                          outline: 'none',
                          transition: 'all 0.2s ease'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = theme.colors.primary
                          e.target.style.boxShadow = `0 0 0 3px ${theme.colors.primary}20`
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = theme.colors.border
                          e.target.style.boxShadow = 'none'
                        }}
                      />
                    ) : (
                      <div style={{
                        fontSize: '16px',
                        color: theme.colors.textPrimary,
                        fontWeight: '600'
                      }}>
                        {companyForm.zip}
                      </div>
                    )}
                  </div>

                  <div>
                    <label style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: theme.colors.textSecondary,
                      display: 'block',
                      marginBottom: '8px'
                    }}>
                      <Phone size={14} style={{ display: 'inline', marginRight: '6px' }} />
                      Company Phone
                    </label>
                    {isEditingCompany ? (
                      <input
                        type="tel"
                        value={companyForm.phone}
                        onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '12px',
                          background: theme.colors.background,
                          border: `1px solid ${theme.colors.border}`,
                          borderRadius: '8px',
                          color: theme.colors.textPrimary,
                          fontSize: '14px',
                          outline: 'none',
                          transition: 'all 0.2s ease'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = theme.colors.primary
                          e.target.style.boxShadow = `0 0 0 3px ${theme.colors.primary}20`
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = theme.colors.border
                          e.target.style.boxShadow = 'none'
                        }}
                      />
                    ) : (
                      <div style={{
                        fontSize: '16px',
                        color: theme.colors.textPrimary,
                        fontWeight: '600'
                      }}>
                        {companyForm.phone}
                      </div>
                    )}
                  </div>

                  <div>
                    <label style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: theme.colors.textSecondary,
                      display: 'block',
                      marginBottom: '8px'
                    }}>
                      <Globe size={14} style={{ display: 'inline', marginRight: '6px' }} />
                      Website
                    </label>
                    {isEditingCompany ? (
                      <input
                        type="text"
                        value={companyForm.website}
                        onChange={(e) => setCompanyForm({ ...companyForm, website: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '12px',
                          background: theme.colors.background,
                          border: `1px solid ${theme.colors.border}`,
                          borderRadius: '8px',
                          color: theme.colors.textPrimary,
                          fontSize: '14px',
                          outline: 'none',
                          transition: 'all 0.2s ease'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = theme.colors.primary
                          e.target.style.boxShadow = `0 0 0 3px ${theme.colors.primary}20`
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = theme.colors.border
                          e.target.style.boxShadow = 'none'
                        }}
                      />
                    ) : (
                      <div style={{
                        fontSize: '16px',
                        color: theme.colors.textPrimary,
                        fontWeight: '600'
                      }}>
                        {companyForm.website}
                      </div>
                    )}
                  </div>

                  <div>
                    <label style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: theme.colors.textSecondary,
                      display: 'block',
                      marginBottom: '8px'
                    }}>
                      EIN (Tax ID)
                    </label>
                    <div style={{
                      fontSize: '16px',
                      color: theme.colors.textPrimary,
                      fontWeight: '600',
                      fontFamily: 'monospace'
                    }}>
                      {companyForm.ein}
                    </div>
                    <p style={{ fontSize: '12px', color: theme.colors.textTertiary, margin: '4px 0 0 0' }}>
                      Contact support to change
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Billing Tab - Billing Settings Only */}
          {activeTab === 'billing' && (
            <div style={{
              background: theme.colors.backgroundCard,
              borderRadius: '16px',
              padding: '32px',
              border: `1px solid ${theme.colors.border}`,
              boxShadow: theme.shadow.subtle
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                margin: '0 0 8px 0',
                color: theme.colors.textPrimary
              }}>
                Billing Settings
              </h2>
              <p style={{
                fontSize: '16px',
                color: theme.colors.textSecondary,
                margin: '0 0 32px 0'
              }}>
                Configure payment terms, bank accounts, and platform fees
              </p>

              {billingError && (
                <div style={{
                  marginBottom: '24px',
                  padding: '12px 16px',
                  backgroundColor: `${theme.colors.error}10`,
                  border: `1px solid ${theme.colors.error}30`,
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <AlertCircle size={16} color={theme.colors.error} />
                  <p style={{
                    color: theme.colors.error,
                    fontSize: '14px',
                    fontWeight: '500',
                    margin: 0
                  }}>
                    {billingError}
                  </p>
                </div>
              )}

              {savingBilling && (
                <div style={{
                  marginBottom: '24px',
                  padding: '12px 16px',
                  backgroundColor: `${theme.colors.primary}10`,
                  border: `1px solid ${theme.colors.primary}30`,
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <RefreshCw size={16} color={theme.colors.primary} className="animate-spin" />
                  <p style={{
                    color: theme.colors.primary,
                    fontSize: '14px',
                    fontWeight: '500',
                    margin: 0
                  }}>
                    Saving billing settings...
                  </p>
                </div>
              )}

              {/* Payment Terms */}
              <div style={{
                padding: '24px',
                background: theme.colors.backgroundTertiary,
                borderRadius: '12px',
                border: `1px solid ${theme.colors.border}`,
                marginBottom: '24px'
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary, margin: '0 0 20px 0' }}>
                  Payment Terms
                </h3>
                
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: theme.colors.textSecondary,
                    display: 'block',
                    marginBottom: '8px'
                  }}>
                    Default Invoice Due Date
                  </label>
                  <select
                    value={billingSettings.paymentTerms}
                    onChange={(e) => handleBillingSettingChange('paymentTerms', e.target.value)}
                    disabled={savingBilling}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      background: savingBilling ? theme.colors.backgroundCard : theme.colors.backgroundCard,
                      border: `2px solid ${savingBilling ? theme.colors.border : theme.colors.border}`,
                      borderRadius: '12px',
                      color: savingBilling ? theme.colors.textSecondary : theme.colors.textPrimary,
                      fontSize: '15px',
                      fontWeight: '500',
                      cursor: savingBilling ? 'not-allowed' : 'pointer',
                      outline: 'none',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      opacity: savingBilling ? 0.6 : 1,
                      boxShadow: savingBilling ? 'none' : `0 4px 12px ${theme.colors.border}30, 0 2px 6px ${theme.colors.border}20, inset 0 1px 0 ${theme.colors.background}40`,
                      position: 'relative',
                      appearance: 'none',
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 12px center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '16px'
                    }}
                    onFocus={(e) => {
                      if (!savingBilling) {
                        e.target.style.borderColor = theme.colors.primary
                        e.target.style.boxShadow = `0 0 0 4px ${theme.colors.primary}15, 0 8px 25px ${theme.colors.primary}25, 0 4px 12px ${theme.colors.primary}20, inset 0 1px 0 ${theme.colors.primary}30`
                        e.target.style.transform = 'translateY(-1px)'
                      }
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = theme.colors.border
                      e.target.style.boxShadow = `0 4px 12px ${theme.colors.border}30, 0 2px 6px ${theme.colors.border}20, inset 0 1px 0 ${theme.colors.background}40`
                      e.target.style.transform = 'translateY(0)'
                    }}
                    onMouseEnter={(e) => {
                      if (!savingBilling) {
                        const target = e.target as HTMLSelectElement
                        target.style.borderColor = theme.colors.primary
                        target.style.boxShadow = `0 6px 20px ${theme.colors.primary}20, 0 4px 12px ${theme.colors.primary}15, inset 0 1px 0 ${theme.colors.primary}20`
                        target.style.transform = 'translateY(-1px)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!savingBilling) {
                        const target = e.target as HTMLSelectElement
                        target.style.borderColor = theme.colors.border
                        target.style.boxShadow = `0 4px 12px ${theme.colors.border}30, 0 2px 6px ${theme.colors.border}20, inset 0 1px 0 ${theme.colors.background}40`
                        target.style.transform = 'translateY(0)'
                      }
                    }}
                  >
                    <option style={{ 
                      background: theme.name === 'dark' ? '#1e293b' : theme.colors.backgroundCard, 
                      color: theme.colors.textPrimary,
                      padding: '12px 16px',
                      border: 'none'
                    }}>Net 7 Days</option>
                    <option style={{ 
                      background: theme.name === 'dark' ? '#1e293b' : theme.colors.backgroundCard, 
                      color: theme.colors.textPrimary,
                      padding: '12px 16px',
                      border: 'none'
                    }}>Net 15 Days</option>
                    <option style={{ 
                      background: theme.name === 'dark' ? '#1e293b' : theme.colors.backgroundCard, 
                      color: theme.colors.textPrimary,
                      padding: '12px 16px',
                      border: 'none'
                    }}>Net 30 Days</option>
                    <option style={{ 
                      background: theme.name === 'dark' ? '#1e293b' : theme.colors.backgroundCard, 
                      color: theme.colors.textPrimary,
                      padding: '12px 16px',
                      border: 'none'
                    }}>Due on Receipt</option>
                  </select>
                </div>

                <div>
                  <label style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: theme.colors.textSecondary,
                    display: 'block',
                    marginBottom: '8px'
                  }}>
                    Late Payment Grace Period
                  </label>
                  <select
                    value={billingSettings.gracePeriod}
                    onChange={(e) => handleBillingSettingChange('gracePeriod', e.target.value)}
                    disabled={savingBilling}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      background: theme.colors.backgroundCard,
                      border: `2px solid ${theme.colors.border}`,
                      borderRadius: '12px',
                      color: savingBilling ? theme.colors.textSecondary : theme.colors.textPrimary,
                      fontSize: '15px',
                      fontWeight: '500',
                      cursor: savingBilling ? 'not-allowed' : 'pointer',
                      outline: 'none',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      opacity: savingBilling ? 0.6 : 1,
                      boxShadow: savingBilling ? 'none' : `0 4px 12px ${theme.colors.border}30, 0 2px 6px ${theme.colors.border}20, inset 0 1px 0 ${theme.colors.background}40`,
                      position: 'relative',
                      appearance: 'none',
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 12px center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '16px'
                    }}
                    onFocus={(e) => {
                      if (!savingBilling) {
                        e.target.style.borderColor = theme.colors.primary
                        e.target.style.boxShadow = `0 0 0 4px ${theme.colors.primary}15, 0 8px 25px ${theme.colors.primary}25, 0 4px 12px ${theme.colors.primary}20, inset 0 1px 0 ${theme.colors.primary}30`
                        e.target.style.transform = 'translateY(-1px)'
                      }
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = theme.colors.border
                      e.target.style.boxShadow = `0 4px 12px ${theme.colors.border}30, 0 2px 6px ${theme.colors.border}20, inset 0 1px 0 ${theme.colors.background}40`
                      e.target.style.transform = 'translateY(0)'
                    }}
                    onMouseEnter={(e) => {
                      if (!savingBilling) {
                        const target = e.target as HTMLSelectElement
                        target.style.borderColor = theme.colors.primary
                        target.style.boxShadow = `0 6px 20px ${theme.colors.primary}20, 0 4px 12px ${theme.colors.primary}15, inset 0 1px 0 ${theme.colors.primary}20`
                        target.style.transform = 'translateY(-1px)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!savingBilling) {
                        const target = e.target as HTMLSelectElement
                        target.style.borderColor = theme.colors.border
                        target.style.boxShadow = `0 4px 12px ${theme.colors.border}30, 0 2px 6px ${theme.colors.border}20, inset 0 1px 0 ${theme.colors.background}40`
                        target.style.transform = 'translateY(0)'
                      }
                    }}
                  >
                    <option style={{ 
                      background: theme.name === 'dark' ? '#1e293b' : theme.colors.backgroundCard, 
                      color: theme.colors.textPrimary,
                      padding: '12px 16px',
                      border: 'none'
                    }}>3 Days</option>
                    <option style={{ 
                      background: theme.name === 'dark' ? '#1e293b' : theme.colors.backgroundCard, 
                      color: theme.colors.textPrimary,
                      padding: '12px 16px',
                      border: 'none'
                    }}>5 Days</option>
                    <option style={{ 
                      background: theme.name === 'dark' ? '#1e293b' : theme.colors.backgroundCard, 
                      color: theme.colors.textPrimary,
                      padding: '12px 16px',
                      border: 'none'
                    }}>7 Days</option>
                    <option style={{ 
                      background: theme.name === 'dark' ? '#1e293b' : theme.colors.backgroundCard, 
                      color: theme.colors.textPrimary,
                      padding: '12px 16px',
                      border: 'none'
                    }}>No Grace Period</option>
                  </select>
                </div>
              </div>

              {/* Platform Tier */}
              <div style={{
                padding: '24px',
                background: theme.colors.backgroundTertiary,
                borderRadius: '12px',
                border: `1px solid ${theme.colors.border}`,
                marginBottom: '24px'
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary, margin: '0 0 20px 0' }}>
                  Platform Tier & Fees
                </h3>
                
                <div style={{
                  padding: '16px',
                  background: theme.colors.background,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: '8px',
                  marginBottom: '16px'
                }}>
                  <div style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: `1px solid ${theme.colors.border}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '14px', color: theme.colors.textSecondary, fontWeight: '600' }}>Basic Tier</span>
                      <span style={{ fontSize: '16px', color: theme.colors.textPrimary, fontWeight: '700' }}>6%</span>
                    </div>
                  </div>
                  <div style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: `1px solid ${theme.colors.border}`, background: `${theme.colors.success}10`, padding: '12px', borderRadius: '8px', margin: '-4px -4px 12px -4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '14px', color: theme.colors.success, fontWeight: '700' }}>✓ Pro Tier (Your Plan)</span>
                      <span style={{ fontSize: '16px', color: theme.colors.success, fontWeight: '700' }}>8%</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '14px', color: theme.colors.textSecondary, fontWeight: '600' }}>Enterprise Tier</span>
                      <span style={{ fontSize: '16px', color: theme.colors.textPrimary, fontWeight: '700' }}>4%</span>
                    </div>
                  </div>
                </div>

                <div style={{
                  padding: '12px',
                  background: `${theme.colors.warning}10`,
                  border: `1px solid ${theme.colors.warning}30`,
                  borderRadius: '8px'
                }}>
                  <p style={{ fontSize: '13px', color: theme.colors.textSecondary, margin: 0 }}>
                    <strong style={{ color: theme.colors.warning }}>Accessorial Fee:</strong> 25% on Layover & Equipment Not Used charges only
                  </p>
                </div>
              </div>

              {/* Bank Account Information */}
              <div style={{
                padding: '24px',
                background: theme.colors.backgroundTertiary,
                borderRadius: '12px',
                border: `1px solid ${theme.colors.border}`,
                marginBottom: '24px'
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary, margin: '0 0 20px 0' }}>
                  Receiving Account (For Payments)
                </h3>
                
                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: theme.colors.textSecondary,
                    display: 'block',
                    marginBottom: '8px'
                  }}>
                    Bank Name
                  </label>
                  <div style={{
                    fontSize: '16px',
                    color: theme.colors.textPrimary,
                    fontWeight: '500'
                  }}>
                    Wells Fargo
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: theme.colors.textSecondary,
                    display: 'block',
                    marginBottom: '8px'
                  }}>
                    Account Number
                  </label>
                  <div style={{
                    fontSize: '16px',
                    color: theme.colors.textPrimary,
                    fontWeight: '500',
                    fontFamily: 'monospace'
                  }}>
                    ****1234
                  </div>
                </div>

                <div>
                  <label style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: theme.colors.textSecondary,
                    display: 'block',
                    marginBottom: '8px'
                  }}>
                    Routing Number
                  </label>
                  <div style={{
                    fontSize: '16px',
                    color: theme.colors.textPrimary,
                    fontWeight: '500',
                    fontFamily: 'monospace'
                  }}>
                    111000025
                  </div>
                </div>

                <button
                  onClick={handlePayoutSetup}
                  style={{
                    marginTop: '20px',
                    padding: '16px 28px',
                    background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.accent} 100%)`,
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    boxShadow: `0 4px 12px ${theme.colors.primary}30, 0 2px 4px ${theme.colors.primary}20`,
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)'
                    e.currentTarget.style.boxShadow = `0 8px 25px ${theme.colors.primary}40, 0 4px 8px ${theme.colors.primary}30`
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)'
                    e.currentTarget.style.boxShadow = `0 4px 12px ${theme.colors.primary}30, 0 2px 4px ${theme.colors.primary}20`
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px) scale(0.98)'
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)'
                  }}
                >
                  <CreditCard size={16} />
                  Update Payout Account (Stripe)
                </button>
              </div>

              {/* Payment Method for Stripe (Future) */}
              <div style={{
                padding: '24px',
                background: theme.colors.backgroundTertiary,
                borderRadius: '12px',
                border: `1px solid ${theme.colors.border}`,
                marginBottom: '24px'
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary, margin: '0 0 16px 0' }}>
                  Payment Processing
                </h3>
                
                <div style={{
                  padding: '16px',
                  background: theme.colors.background,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: '8px',
                  marginBottom: '16px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '14px', color: theme.colors.textSecondary, fontWeight: '600' }}>Current Method</span>
                    <span style={{ fontSize: '16px', color: theme.colors.warning, fontWeight: '700' }}>Manual</span>
                  </div>
                  <p style={{ fontSize: '13px', color: theme.colors.textTertiary, margin: 0 }}>
                    Invoices are sent manually. Customers pay via bank transfer.
                  </p>
                </div>

                <button
                  onClick={handleStripeUpgrade}
                  style={{
                    padding: '16px 28px',
                    background: `linear-gradient(135deg, ${theme.colors.primary}15 0%, ${theme.colors.accent}15 100%)`,
                    color: theme.colors.primary,
                    border: `2px solid ${theme.colors.primary}`,
                    borderRadius: '12px',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    boxShadow: `0 4px 12px ${theme.colors.primary}20, 0 2px 4px ${theme.colors.primary}10`,
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `linear-gradient(135deg, ${theme.colors.primary}25 0%, ${theme.colors.accent}25 100%)`
                    e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)'
                    e.currentTarget.style.boxShadow = `0 8px 25px ${theme.colors.primary}30, 0 4px 8px ${theme.colors.primary}20`
                    e.currentTarget.style.borderColor = theme.colors.accent
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = `linear-gradient(135deg, ${theme.colors.primary}15 0%, ${theme.colors.accent}15 100%)`
                    e.currentTarget.style.transform = 'translateY(0) scale(1)'
                    e.currentTarget.style.boxShadow = `0 4px 12px ${theme.colors.primary}20, 0 2px 4px ${theme.colors.primary}10`
                    e.currentTarget.style.borderColor = theme.colors.primary
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px) scale(0.98)'
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)'
                  }}
                >
                  <CreditCard size={16} />
                  Upgrade to Stripe (Automated Payments)
                </button>
              </div>

              {/* Invoice Settings */}
              <div style={{
                padding: '24px',
                background: theme.colors.backgroundTertiary,
                borderRadius: '12px',
                border: `1px solid ${theme.colors.border}`,
                marginBottom: '24px'
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary, margin: '0 0 16px 0' }}>
                  Invoice Settings
                </h3>
                
                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: theme.colors.textSecondary,
                    display: 'block',
                    marginBottom: '8px'
                  }}>
                    Invoice Prefix
                  </label>
                  <input
                    type="text"
                    value={billingSettings.invoicePrefix}
                    placeholder="INV-2025"
                    onChange={(e) => handleBillingSettingChange('invoicePrefix', e.target.value)}
                    disabled={savingBilling}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      background: theme.colors.background,
                      border: `2px solid ${theme.colors.border}`,
                      borderRadius: '12px',
                      color: savingBilling ? theme.colors.textSecondary : theme.colors.textPrimary,
                      fontSize: '15px',
                      fontWeight: '500',
                      outline: 'none',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      opacity: savingBilling ? 0.6 : 1,
                      boxShadow: savingBilling ? 'none' : `0 4px 12px ${theme.colors.border}30, 0 2px 6px ${theme.colors.border}20, inset 0 1px 0 ${theme.colors.background}40`
                    }}
                    onFocus={(e) => {
                      if (!savingBilling) {
                        e.target.style.borderColor = theme.colors.primary
                        e.target.style.boxShadow = `0 0 0 4px ${theme.colors.primary}15, 0 8px 25px ${theme.colors.primary}25, 0 4px 12px ${theme.colors.primary}20, inset 0 1px 0 ${theme.colors.primary}30`
                        e.target.style.transform = 'translateY(-1px)'
                      }
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = theme.colors.border
                      e.target.style.boxShadow = `0 4px 12px ${theme.colors.border}30, 0 2px 6px ${theme.colors.border}20, inset 0 1px 0 ${theme.colors.background}40`
                      e.target.style.transform = 'translateY(0)'
                    }}
                    onMouseEnter={(e) => {
                      if (!savingBilling) {
                        const target = e.target as HTMLSelectElement
                        target.style.borderColor = theme.colors.primary
                        target.style.boxShadow = `0 6px 20px ${theme.colors.primary}20, 0 4px 12px ${theme.colors.primary}15, inset 0 1px 0 ${theme.colors.primary}20`
                        target.style.transform = 'translateY(-1px)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!savingBilling) {
                        const target = e.target as HTMLSelectElement
                        target.style.borderColor = theme.colors.border
                        target.style.boxShadow = `0 4px 12px ${theme.colors.border}30, 0 2px 6px ${theme.colors.border}20, inset 0 1px 0 ${theme.colors.background}40`
                        target.style.transform = 'translateY(0)'
                      }
                    }}
                  />
                  <p style={{ fontSize: '12px', color: theme.colors.textTertiary, margin: '4px 0 0 0' }}>
                    Example: INV-2025-0001, INV-2025-0002, etc.
                  </p>
                </div>

                <div>
                  <label style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: theme.colors.textSecondary,
                    display: 'block',
                    marginBottom: '8px'
                  }}>
                    Auto-Send Invoices
                  </label>
                  <select
                    value={billingSettings.autoSend}
                    onChange={(e) => handleBillingSettingChange('autoSend', e.target.value)}
                    disabled={savingBilling}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      background: theme.colors.backgroundCard,
                      border: `2px solid ${theme.colors.border}`,
                      borderRadius: '12px',
                      color: savingBilling ? theme.colors.textSecondary : theme.colors.textPrimary,
                      fontSize: '15px',
                      fontWeight: '500',
                      cursor: savingBilling ? 'not-allowed' : 'pointer',
                      outline: 'none',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      opacity: savingBilling ? 0.6 : 1,
                      boxShadow: savingBilling ? 'none' : `0 4px 12px ${theme.colors.border}30, 0 2px 6px ${theme.colors.border}20, inset 0 1px 0 ${theme.colors.background}40`,
                      position: 'relative',
                      appearance: 'none',
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 12px center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '16px'
                    }}
                    onFocus={(e) => {
                      if (!savingBilling) {
                        e.target.style.borderColor = theme.colors.primary
                        e.target.style.boxShadow = `0 0 0 4px ${theme.colors.primary}15, 0 8px 25px ${theme.colors.primary}25, 0 4px 12px ${theme.colors.primary}20, inset 0 1px 0 ${theme.colors.primary}30`
                        e.target.style.transform = 'translateY(-1px)'
                      }
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = theme.colors.border
                      e.target.style.boxShadow = `0 4px 12px ${theme.colors.border}30, 0 2px 6px ${theme.colors.border}20, inset 0 1px 0 ${theme.colors.background}40`
                      e.target.style.transform = 'translateY(0)'
                    }}
                    onMouseEnter={(e) => {
                      if (!savingBilling) {
                        const target = e.target as HTMLSelectElement
                        target.style.borderColor = theme.colors.primary
                        target.style.boxShadow = `0 6px 20px ${theme.colors.primary}20, 0 4px 12px ${theme.colors.primary}15, inset 0 1px 0 ${theme.colors.primary}20`
                        target.style.transform = 'translateY(-1px)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!savingBilling) {
                        const target = e.target as HTMLSelectElement
                        target.style.borderColor = theme.colors.border
                        target.style.boxShadow = `0 4px 12px ${theme.colors.border}30, 0 2px 6px ${theme.colors.border}20, inset 0 1px 0 ${theme.colors.background}40`
                        target.style.transform = 'translateY(0)'
                      }
                    }}
                  >
                    <option style={{ 
                      background: theme.name === 'dark' ? '#1e293b' : theme.colors.backgroundCard, 
                      color: theme.colors.textPrimary,
                      padding: '12px 16px',
                      border: 'none'
                    }}>Manual</option>
                    <option style={{ 
                      background: theme.name === 'dark' ? '#1e293b' : theme.colors.backgroundCard, 
                      color: theme.colors.textPrimary,
                      padding: '12px 16px',
                      border: 'none'
                    }}>Auto-send on delivery</option>
                    <option style={{ 
                      background: theme.name === 'dark' ? '#1e293b' : theme.colors.backgroundCard, 
                      color: theme.colors.textPrimary,
                      padding: '12px 16px',
                      border: 'none'
                    }}>Auto-send on POD receipt</option>
                  </select>
                </div>
              </div>

              {/* Carrier Payout Settings */}
              <div style={{
                padding: '24px',
                background: theme.colors.backgroundTertiary,
                borderRadius: '12px',
                border: `1px solid ${theme.colors.border}`
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary, margin: '0 0 16px 0' }}>
                  Carrier Payout Settings
                </h3>
                
                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: theme.colors.textSecondary,
                    display: 'block',
                    marginBottom: '8px'
                  }}>
                    Payout Schedule
                  </label>
                  <select
                    value={billingSettings.payoutSchedule}
                    onChange={(e) => handleBillingSettingChange('payoutSchedule', e.target.value)}
                    disabled={savingBilling}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      background: theme.colors.backgroundCard,
                      border: `2px solid ${theme.colors.border}`,
                      borderRadius: '12px',
                      color: savingBilling ? theme.colors.textSecondary : theme.colors.textPrimary,
                      fontSize: '15px',
                      fontWeight: '500',
                      cursor: savingBilling ? 'not-allowed' : 'pointer',
                      outline: 'none',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      opacity: savingBilling ? 0.6 : 1,
                      boxShadow: savingBilling ? 'none' : `0 4px 12px ${theme.colors.border}30, 0 2px 6px ${theme.colors.border}20, inset 0 1px 0 ${theme.colors.background}40`,
                      position: 'relative',
                      appearance: 'none',
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 12px center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '16px'
                    }}
                    onFocus={(e) => {
                      if (!savingBilling) {
                        e.target.style.borderColor = theme.colors.primary
                        e.target.style.boxShadow = `0 0 0 4px ${theme.colors.primary}15, 0 8px 25px ${theme.colors.primary}25, 0 4px 12px ${theme.colors.primary}20, inset 0 1px 0 ${theme.colors.primary}30`
                        e.target.style.transform = 'translateY(-1px)'
                      }
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = theme.colors.border
                      e.target.style.boxShadow = `0 4px 12px ${theme.colors.border}30, 0 2px 6px ${theme.colors.border}20, inset 0 1px 0 ${theme.colors.background}40`
                      e.target.style.transform = 'translateY(0)'
                    }}
                    onMouseEnter={(e) => {
                      if (!savingBilling) {
                        const target = e.target as HTMLSelectElement
                        target.style.borderColor = theme.colors.primary
                        target.style.boxShadow = `0 6px 20px ${theme.colors.primary}20, 0 4px 12px ${theme.colors.primary}15, inset 0 1px 0 ${theme.colors.primary}20`
                        target.style.transform = 'translateY(-1px)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!savingBilling) {
                        const target = e.target as HTMLSelectElement
                        target.style.borderColor = theme.colors.border
                        target.style.boxShadow = `0 4px 12px ${theme.colors.border}30, 0 2px 6px ${theme.colors.border}20, inset 0 1px 0 ${theme.colors.background}40`
                        target.style.transform = 'translateY(0)'
                      }
                    }}
                  >
                    <option style={{ 
                      background: theme.name === 'dark' ? '#1e293b' : theme.colors.backgroundCard, 
                      color: theme.colors.textPrimary,
                      padding: '12px 16px',
                      border: 'none'
                    }}>Same Day</option>
                    <option style={{ 
                      background: theme.name === 'dark' ? '#1e293b' : theme.colors.backgroundCard, 
                      color: theme.colors.textPrimary,
                      padding: '12px 16px',
                      border: 'none'
                    }}>Next Business Day</option>
                    <option style={{ 
                      background: theme.name === 'dark' ? '#1e293b' : theme.colors.backgroundCard, 
                      color: theme.colors.textPrimary,
                      padding: '12px 16px',
                      border: 'none'
                    }}>Weekly (Fridays)</option>
                    <option style={{ 
                      background: theme.name === 'dark' ? '#1e293b' : theme.colors.backgroundCard, 
                      color: theme.colors.textPrimary,
                      padding: '12px 16px',
                      border: 'none'
                    }}>Bi-Weekly</option>
                  </select>
                </div>


                <div style={{
                  padding: '12px',
                  background: theme.colors.background,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: '8px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', color: theme.colors.textSecondary, fontWeight: '600' }}>Carrier Receives (Pro Tier)</span>
                    <span style={{ fontSize: '18px', color: theme.colors.success, fontWeight: '700' }}>92%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div style={{
              background: theme.colors.backgroundCard,
              borderRadius: '16px',
              padding: '32px',
              border: `1px solid ${theme.colors.border}`,
              boxShadow: theme.shadow.subtle
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                margin: '0 0 8px 0',
                color: theme.colors.textPrimary
              }}>
                Notification Preferences
              </h2>
              <p style={{
                fontSize: '16px',
                color: theme.colors.textSecondary,
                margin: '0 0 32px 0'
              }}>
                Control how and when you receive notifications
              </p>

              {loadingPreferences && (
                <div style={{
                  marginBottom: '24px',
                  padding: '16px',
                  backgroundColor: `${theme.colors.primary}10`,
                  border: `1px solid ${theme.colors.primary}30`,
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <RefreshCw size={20} color={theme.colors.primary} className="animate-spin" />
                  <p style={{
                    color: theme.colors.primary,
                    fontSize: '14px',
                    fontWeight: '500',
                    margin: 0
                  }}>
                    Loading notification preferences...
                  </p>
                </div>
              )}

              {notificationError && (
                <div style={{
                  marginBottom: '24px',
                  padding: '16px',
                  backgroundColor: `${theme.colors.error}10`,
                  border: `1px solid ${theme.colors.error}30`,
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <AlertCircle size={20} color={theme.colors.error} />
                  <p style={{
                    color: theme.colors.error,
                    fontSize: '14px',
                    fontWeight: '500',
                    margin: 0
                  }}>
                    {notificationError}
                  </p>
                </div>
              )}

              {savingNotifications && (
                <div style={{
                  marginBottom: '24px',
                  padding: '16px',
                  backgroundColor: `${theme.colors.warning}10`,
                  border: `1px solid ${theme.colors.warning}30`,
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <RefreshCw size={20} color={theme.colors.warning} className="animate-spin" />
                  <p style={{
                    color: theme.colors.warning,
                    fontSize: '14px',
                    fontWeight: '500',
                    margin: 0
                  }}>
                    Saving notification preferences...
                  </p>
                </div>
              )}

              {notificationPreferences && (
                <>
                  {/* Global Controls */}
                  <div style={{
                    padding: '24px',
                    backgroundColor: theme.colors.backgroundTertiary,
                    borderRadius: '12px',
                    border: `1px solid ${theme.colors.border}`,
                    marginBottom: '24px'
                  }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Bell size={18} />
                      Global Notification Settings
                    </h3>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
                        <div>
                          <p style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, margin: '0 0 4px 0' }}>
                            Email Notifications
                          </p>
                          <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: 0 }}>
                            Receive notifications via email
                          </p>
                        </div>
                        <button
                          onClick={() => handleBulkNotificationToggle('email', !notificationPreferences.emailNotifications)}
                          disabled={savingNotifications}
                          style={{
                            padding: '8px 16px',
                            background: notificationPreferences.emailNotifications ? theme.colors.success : theme.colors.backgroundCard,
                            color: notificationPreferences.emailNotifications ? 'white' : theme.colors.textPrimary,
                            border: `2px solid ${notificationPreferences.emailNotifications ? theme.colors.success : theme.colors.border}`,
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: savingNotifications ? 'not-allowed' : 'pointer',
                            transition: 'all 0.3s ease',
                            minWidth: '90px',
                            opacity: savingNotifications ? 0.6 : 1
                          }}
                        >
                          {notificationPreferences.emailNotifications ? 'Enabled' : 'Disabled'}
                        </button>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
                        <div>
                          <p style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, margin: '0 0 4px 0' }}>
                            SMS Notifications
                          </p>
                          <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: 0 }}>
                            Receive notifications via SMS
                          </p>
                        </div>
                        <button
                          onClick={() => handleBulkNotificationToggle('sms', !notificationPreferences.smsNotifications)}
                          disabled={savingNotifications}
                          style={{
                            padding: '8px 16px',
                            background: notificationPreferences.smsNotifications ? theme.colors.success : theme.colors.backgroundCard,
                            color: notificationPreferences.smsNotifications ? 'white' : theme.colors.textPrimary,
                            border: `2px solid ${notificationPreferences.smsNotifications ? theme.colors.success : theme.colors.border}`,
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: savingNotifications ? 'not-allowed' : 'pointer',
                            transition: 'all 0.3s ease',
                            minWidth: '90px',
                            opacity: savingNotifications ? 0.6 : 1
                          }}
                        >
                          {notificationPreferences.smsNotifications ? 'Enabled' : 'Disabled'}
                        </button>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
                        <div>
                          <p style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, margin: '0 0 4px 0' }}>
                            Push Notifications
                          </p>
                          <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: 0 }}>
                            Receive browser push notifications
                          </p>
                        </div>
                        <button
                          onClick={() => handleBulkNotificationToggle('push', !notificationPreferences.pushNotifications)}
                          disabled={savingNotifications}
                          style={{
                            padding: '8px 16px',
                            background: notificationPreferences.pushNotifications ? theme.colors.success : theme.colors.backgroundCard,
                            color: notificationPreferences.pushNotifications ? 'white' : theme.colors.textPrimary,
                            border: `2px solid ${notificationPreferences.pushNotifications ? theme.colors.success : theme.colors.border}`,
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: savingNotifications ? 'not-allowed' : 'pointer',
                            transition: 'all 0.3s ease',
                            minWidth: '90px',
                            opacity: savingNotifications ? 0.6 : 1
                          }}
                        >
                          {notificationPreferences.pushNotifications ? 'Enabled' : 'Disabled'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Detailed Notification Types */}
                  <div style={{
                    padding: '24px',
                    backgroundColor: theme.colors.backgroundTertiary,
                    borderRadius: '12px',
                    border: `1px solid ${theme.colors.border}`
                  }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary, margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Bell size={18} />
                      Notification Types
                    </h3>
                    
                    <div style={{ display: 'grid', gap: '16px' }}>
                      {Object.entries(notificationPreferences.types).map(([type, settings]) => (
                        <div key={type} style={{
                          padding: '16px',
                          backgroundColor: theme.colors.background,
                          borderRadius: '8px',
                          border: `1px solid ${theme.colors.border}`
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <h4 style={{
                              fontSize: '16px',
                              fontWeight: '600',
                              color: theme.colors.textPrimary,
                              margin: 0,
                              textTransform: 'capitalize'
                            }}>
                              {type.replace(/_/g, ' ')}
                            </h4>
                            <button
                              onClick={() => handleNotificationToggle(type, 'email', !settings.enabled)}
                              disabled={savingNotifications}
                              style={{
                                padding: '6px 12px',
                                background: settings.enabled ? theme.colors.success : theme.colors.backgroundCard,
                                color: settings.enabled ? 'white' : theme.colors.textPrimary,
                                border: `1px solid ${settings.enabled ? theme.colors.success : theme.colors.border}`,
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: savingNotifications ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s ease',
                                opacity: savingNotifications ? 0.6 : 1
                              }}
                            >
                              {settings.enabled ? 'Enabled' : 'Disabled'}
                            </button>
                          </div>
                          
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '13px', color: theme.colors.textSecondary, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Mail size={14} />
                                Email
                              </span>
                              <button
                                onClick={() => handleNotificationToggle(type, 'email', !settings.email)}
                                disabled={savingNotifications || !settings.enabled}
                                style={{
                                  width: '24px',
                                  height: '24px',
                                  background: settings.email ? theme.colors.success : theme.colors.backgroundCard,
                                  border: `2px solid ${settings.email ? theme.colors.success : theme.colors.border}`,
                                  borderRadius: '50%',
                                  cursor: savingNotifications || !settings.enabled ? 'not-allowed' : 'pointer',
                                  transition: 'all 0.2s ease',
                                  opacity: savingNotifications || !settings.enabled ? 0.6 : 1,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                {settings.email && <Check size={12} color="white" />}
                              </button>
                            </div>
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '13px', color: theme.colors.textSecondary, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Smartphone size={14} />
                                SMS
                              </span>
                              <button
                                onClick={() => handleNotificationToggle(type, 'sms', !settings.sms)}
                                disabled={savingNotifications || !settings.enabled}
                                style={{
                                  width: '24px',
                                  height: '24px',
                                  background: settings.sms ? theme.colors.success : theme.colors.backgroundCard,
                                  border: `2px solid ${settings.sms ? theme.colors.success : theme.colors.border}`,
                                  borderRadius: '50%',
                                  cursor: savingNotifications || !settings.enabled ? 'not-allowed' : 'pointer',
                                  transition: 'all 0.2s ease',
                                  opacity: savingNotifications || !settings.enabled ? 0.6 : 1,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                {settings.sms && <Check size={12} color="white" />}
                              </button>
                            </div>
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '13px', color: theme.colors.textSecondary, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Bell size={14} />
                                Push
                              </span>
                              <button
                                onClick={() => handleNotificationToggle(type, 'push', !settings.push)}
                                disabled={savingNotifications || !settings.enabled}
                                style={{
                                  width: '24px',
                                  height: '24px',
                                  background: settings.push ? theme.colors.success : theme.colors.backgroundCard,
                                  border: `2px solid ${settings.push ? theme.colors.success : theme.colors.border}`,
                                  borderRadius: '50%',
                                  cursor: savingNotifications || !settings.enabled ? 'not-allowed' : 'pointer',
                                  transition: 'all 0.2s ease',
                                  opacity: savingNotifications || !settings.enabled ? 0.6 : 1,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                {settings.push && <Check size={12} color="white" />}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div style={{
              background: theme.colors.backgroundCard,
              borderRadius: '16px',
              padding: '32px',
              border: `1px solid ${theme.colors.border}`,
              boxShadow: theme.shadow.subtle
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                margin: '0 0 8px 0',
                color: theme.colors.textPrimary
              }}>
                Security Settings
              </h2>
              <p style={{
                fontSize: '16px',
                color: theme.colors.textSecondary,
                margin: '0 0 32px 0'
              }}>
                Protect your account and manage security preferences
              </p>

              {loadingSecurity && (
                <div style={{
                  marginBottom: '24px',
                  padding: '16px',
                  backgroundColor: `${theme.colors.primary}10`,
                  border: `1px solid ${theme.colors.primary}30`,
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <RefreshCw size={20} color={theme.colors.primary} className="animate-spin" />
                  <p style={{
                    color: theme.colors.primary,
                    fontSize: '14px',
                    fontWeight: '500',
                    margin: 0
                  }}>
                    Loading security settings...
                  </p>
                </div>
              )}

              {/* Password Change */}
              <div style={{
                padding: '24px',
                backgroundColor: theme.colors.backgroundTertiary,
                borderRadius: '12px',
                border: `1px solid ${theme.colors.border}`,
                marginBottom: '24px'
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Key size={18} />
                  Change Password
                </h3>
                
                <div style={{ display: 'grid', gap: '16px' }}>
                  <div>
                    <label style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: theme.colors.textSecondary,
                      display: 'block',
                      marginBottom: '8px'
                    }}>
                      Current Password
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        placeholder="Enter current password"
                        style={{
                          width: '100%',
                          padding: '12px 40px 12px 12px',
                          background: theme.colors.background,
                          border: `1px solid ${theme.colors.border}`,
                          borderRadius: '8px',
                          color: theme.colors.textPrimary,
                          fontSize: '14px',
                          outline: 'none',
                          transition: 'all 0.2s ease'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = theme.colors.primary
                          e.target.style.boxShadow = `0 0 0 3px ${theme.colors.primary}20`
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = theme.colors.border
                          e.target.style.boxShadow = 'none'
                        }}
                      />
                      <button
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        style={{
                          position: 'absolute',
                          right: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                          color: theme.colors.textSecondary
                        }}
                      >
                        {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: theme.colors.textSecondary,
                      display: 'block',
                      marginBottom: '8px'
                    }}>
                      New Password
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        placeholder="Enter new password"
                        style={{
                          width: '100%',
                          padding: '12px 40px 12px 12px',
                          background: theme.colors.background,
                          border: `1px solid ${theme.colors.border}`,
                          borderRadius: '8px',
                          color: theme.colors.textPrimary,
                          fontSize: '14px',
                          outline: 'none',
                          transition: 'all 0.2s ease'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = theme.colors.primary
                          e.target.style.boxShadow = `0 0 0 3px ${theme.colors.primary}20`
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = theme.colors.border
                          e.target.style.boxShadow = 'none'
                        }}
                      />
                      <button
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        style={{
                          position: 'absolute',
                          right: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                          color: theme.colors.textSecondary
                        }}
                      >
                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: theme.colors.textSecondary,
                      display: 'block',
                      marginBottom: '8px'
                    }}>
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      placeholder="Confirm new password"
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: theme.colors.background,
                        border: `1px solid ${theme.colors.border}`,
                        borderRadius: '8px',
                        color: theme.colors.textPrimary,
                        fontSize: '14px',
                        outline: 'none',
                        transition: 'all 0.2s ease'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = theme.colors.primary
                        e.target.style.boxShadow = `0 0 0 3px ${theme.colors.primary}20`
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = theme.colors.border
                        e.target.style.boxShadow = 'none'
                      }}
                    />
                  </div>

                  {passwordError && (
                    <div style={{
                      padding: '12px',
                      backgroundColor: `${theme.colors.error}10`,
                      border: `1px solid ${theme.colors.error}30`,
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <AlertCircle size={16} color={theme.colors.error} />
                      <p style={{
                        color: theme.colors.error,
                        fontSize: '13px',
                        fontWeight: '500',
                        margin: 0
                      }}>
                        {passwordError}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={handleChangePassword}
                    disabled={changingPassword}
                    style={{
                      padding: '12px 24px',
                      background: changingPassword ? theme.colors.backgroundCard : theme.colors.primary,
                      color: changingPassword ? theme.colors.textSecondary : 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: changingPassword ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                      marginTop: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      opacity: changingPassword ? 0.6 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (!changingPassword) e.currentTarget.style.transform = 'translateY(-2px)'
                    }}
                    onMouseLeave={(e) => {
                      if (!changingPassword) e.currentTarget.style.transform = 'translateY(0)'
                    }}
                  >
                    {changingPassword && <RefreshCw size={16} className="animate-spin" />}
                    {changingPassword ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </div>

              {/* Two-Factor Authentication */}
              <div style={{
                padding: '24px',
                backgroundColor: theme.colors.backgroundTertiary,
                borderRadius: '12px',
                border: `1px solid ${theme.colors.border}`,
                marginBottom: '24px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary, margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Shield size={18} />
                      Two-Factor Authentication (2FA)
                    </h3>
                    <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: 0 }}>
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <button
                    onClick={handleToggle2FA}
                    disabled={settingUp2FA}
                    style={{
                      padding: '10px 20px',
                      background: securitySettings?.twoFactorEnabled ? theme.colors.success : theme.colors.primary,
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: settingUp2FA ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      opacity: settingUp2FA ? 0.6 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (!settingUp2FA) e.currentTarget.style.transform = 'translateY(-2px)'
                    }}
                    onMouseLeave={(e) => {
                      if (!settingUp2FA) e.currentTarget.style.transform = 'translateY(0)'
                    }}
                  >
                    {settingUp2FA && <RefreshCw size={16} className="animate-spin" />}
                    {securitySettings?.twoFactorEnabled ? '✓ Enabled' : settingUp2FA ? 'Setting up...' : 'Enable 2FA'}
                  </button>
                </div>

                {securitySettings?.twoFactorEnabled && (
                  <div style={{
                    padding: '16px',
                    background: `${theme.colors.success}10`,
                    border: `1px solid ${theme.colors.success}30`,
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <Check size={20} color={theme.colors.success} />
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.success, margin: '0 0 4px 0' }}>
                        2FA is Active
                      </p>
                      <p style={{ fontSize: '13px', color: theme.colors.textSecondary, margin: 0 }}>
                        Your account is protected with two-factor authentication
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Session Timeout */}
              <div style={{
                padding: '24px',
                backgroundColor: theme.colors.backgroundTertiary,
                borderRadius: '12px',
                border: `1px solid ${theme.colors.border}`
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary, margin: '0 0 16px 0' }}>
                  Session Timeout
                </h3>
                
                <div>
                  <label style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: theme.colors.textSecondary,
                    display: 'block',
                    marginBottom: '8px'
                  }}>
                    Auto logout after inactivity
                  </label>
                  <select
                    value={securitySettings?.sessionTimeout?.toString() || '30'}
                    onChange={async (e) => {
                      try {
                        await updateSecurityMutation.mutateAsync({ sessionTimeout: parseInt(e.target.value) })
                        alert(`✅ Session timeout updated to ${e.target.value} minutes`)
                      } catch (error) {
                        console.error('Failed to update session timeout:', error)
                        alert('❌ Failed to update session timeout. Please try again.')
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: theme.colors.background,
                      border: `1px solid ${theme.colors.border}`,
                      borderRadius: '8px',
                      color: theme.colors.textPrimary,
                      fontSize: '14px',
                      cursor: 'pointer',
                      outline: 'none',
                      transition: 'all 0.2s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = theme.colors.primary
                      e.target.style.boxShadow = `0 0 0 3px ${theme.colors.primary}20`
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = theme.colors.border
                      e.target.style.boxShadow = 'none'
                    }}
                  >
                    <option style={{ background: theme.colors.backgroundCard, color: theme.colors.textPrimary }} value="15">15 minutes</option>
                    <option style={{ background: theme.colors.backgroundCard, color: theme.colors.textPrimary }} value="30">30 minutes</option>
                    <option style={{ background: theme.colors.backgroundCard, color: theme.colors.textPrimary }} value="60">1 hour</option>
                    <option style={{ background: theme.colors.backgroundCard, color: theme.colors.textPrimary }} value="120">2 hours</option>
                    <option style={{ background: theme.colors.backgroundCard, color: theme.colors.textPrimary }} value="never">Never</option>
                  </select>
                  <p style={{ fontSize: '12px', color: theme.colors.textTertiary, margin: '8px 0 0 0' }}>
                    Currently set to: <strong style={{ color: theme.colors.textPrimary }}>{securitySettings?.sessionTimeout === 0 ? 'Never' : `${securitySettings?.sessionTimeout || 30} minutes`}</strong>
                  </p>
                </div>
              </div>

              {/* Active Sessions */}
              {activeSessions && activeSessions.length > 0 && (
                <div style={{
                  padding: '24px',
                  backgroundColor: theme.colors.backgroundTertiary,
                  borderRadius: '12px',
                  border: `1px solid ${theme.colors.border}`,
                  marginTop: '24px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Smartphone size={18} />
                      Active Sessions ({activeSessions.length})
                    </h3>
                    <button
                      onClick={handleTerminateAllOtherSessions}
                      style={{
                        padding: '8px 16px',
                        background: 'transparent',
                        border: `1px solid ${theme.colors.border}`,
                        borderRadius: '6px',
                        color: theme.colors.textSecondary,
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = theme.colors.error
                        e.currentTarget.style.color = theme.colors.error
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = theme.colors.border
                        e.currentTarget.style.color = theme.colors.textSecondary
                      }}
                    >
                      Terminate All Others
                    </button>
                  </div>
                  
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {activeSessions.map((session) => (
                      <div key={session.id} style={{
                        padding: '16px',
                        backgroundColor: theme.colors.background,
                        borderRadius: '8px',
                        border: `1px solid ${theme.colors.border}`,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: session.isCurrent ? theme.colors.primary : theme.colors.backgroundCard,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: session.isCurrent ? 'white' : theme.colors.textSecondary
                          }}>
                            <Smartphone size={18} />
                          </div>
                          <div>
                            <p style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, margin: '0 0 4px 0' }}>
                              {session.device}
                              {session.isCurrent && (
                                <span style={{
                                  marginLeft: '8px',
                                  padding: '2px 8px',
                                  background: theme.colors.primary,
                                  color: 'white',
                                  borderRadius: '4px',
                                  fontSize: '11px',
                                  fontWeight: '500'
                                }}>
                                  Current
                                </span>
                              )}
                            </p>
                            <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: '0 0 2px 0' }}>
                              {session.location} • {session.ipAddress}
                            </p>
                            <p style={{ fontSize: '11px', color: theme.colors.textTertiary, margin: 0 }}>
                              Last activity: {new Date(session.lastActivity).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        
                        {!session.isCurrent && (
                          <button
                            onClick={() => handleTerminateSession(session.id)}
                            style={{
                              padding: '6px 12px',
                              background: 'transparent',
                              border: `1px solid ${theme.colors.border}`,
                              borderRadius: '6px',
                              color: theme.colors.textSecondary,
                              fontSize: '12px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = theme.colors.error
                              e.currentTarget.style.color = theme.colors.error
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = theme.colors.border
                              e.currentTarget.style.color = theme.colors.textSecondary
                            }}
                          >
                            Terminate
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Security Events */}
              {securityEvents && securityEvents.length > 0 && (
                <div style={{
                  padding: '24px',
                  backgroundColor: theme.colors.backgroundTertiary,
                  borderRadius: '12px',
                  border: `1px solid ${theme.colors.border}`,
                  marginTop: '24px'
                }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Shield size={18} />
                    Recent Security Events
                  </h3>
                  
                  <div style={{ display: 'grid', gap: '8px' }}>
                    {securityEvents.slice(0, 5).map((event) => (
                      <div key={event.id} style={{
                        padding: '12px',
                        backgroundColor: theme.colors.background,
                        borderRadius: '8px',
                        border: `1px solid ${theme.colors.border}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: event.severity === 'critical' ? theme.colors.error : 
                                     event.severity === 'warning' ? theme.colors.warning : theme.colors.primary,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white'
                        }}>
                          <Shield size={14} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '13px', fontWeight: '600', color: theme.colors.textPrimary, margin: '0 0 2px 0' }}>
                            {event.description}
                          </p>
                          <p style={{ fontSize: '11px', color: theme.colors.textSecondary, margin: 0 }}>
                            {event.location} • {new Date(event.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <div style={{
                          padding: '2px 8px',
                          background: event.severity === 'critical' ? `${theme.colors.error}20` : 
                                     event.severity === 'warning' ? `${theme.colors.warning}20` : `${theme.colors.primary}20`,
                          border: `1px solid ${event.severity === 'critical' ? theme.colors.error : 
                                              event.severity === 'warning' ? theme.colors.warning : theme.colors.primary}`,
                          borderRadius: '4px',
                          fontSize: '10px',
                          fontWeight: '600',
                          color: event.severity === 'critical' ? theme.colors.error : 
                                 event.severity === 'warning' ? theme.colors.warning : theme.colors.primary,
                          textTransform: 'uppercase'
                        }}>
                          {event.severity}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 2FA Setup Modal */}
              {show2FASetup && twoFactorSetup && (
                <div style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1000
                }}>
                  <div style={{
                    background: theme.colors.backgroundCard,
                    borderRadius: '16px',
                    padding: '32px',
                    border: `1px solid ${theme.colors.border}`,
                    boxShadow: theme.shadow.strong,
                    maxWidth: '500px',
                    width: '90%',
                    maxHeight: '80vh',
                    overflow: 'auto'
                  }}>
                    <h3 style={{
                      fontSize: '20px',
                      fontWeight: 'bold',
                      color: theme.colors.textPrimary,
                      margin: '0 0 16px 0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <Shield size={20} />
                      Setup Two-Factor Authentication
                    </h3>
                    
                    <p style={{
                      fontSize: '14px',
                      color: theme.colors.textSecondary,
                      margin: '0 0 24px 0'
                    }}>
                      Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.)
                    </p>

                    <div style={{
                      textAlign: 'center',
                      marginBottom: '24px'
                    }}>
                      <img 
                        src={twoFactorSetup.qrCode} 
                        alt="2FA QR Code"
                        style={{
                          width: '200px',
                          height: '200px',
                          border: `1px solid ${theme.colors.border}`,
                          borderRadius: '8px'
                        }}
                      />
                    </div>

                    <div style={{
                      padding: '16px',
                      backgroundColor: `${theme.colors.warning}10`,
                      border: `1px solid ${theme.colors.warning}30`,
                      borderRadius: '8px',
                      marginBottom: '24px'
                    }}>
                      <p style={{
                        fontSize: '13px',
                        color: theme.colors.textSecondary,
                        margin: '0 0 8px 0',
                        fontWeight: '600'
                      }}>
                        Backup Codes (Save these securely):
                      </p>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
                        gap: '8px'
                      }}>
                        {twoFactorSetup.backupCodes.map((code: string, index: number) => (
                          <div key={index} style={{
                            padding: '8px',
                            background: theme.colors.background,
                            border: `1px solid ${theme.colors.border}`,
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '600',
                            color: theme.colors.textPrimary,
                            textAlign: 'center'
                          }}>
                            {code}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{
                      display: 'flex',
                      gap: '12px',
                      justifyContent: 'flex-end'
                    }}>
                      <button
                        onClick={() => {
                          setShow2FASetup(false)
                          setTwoFactorSetup(null)
                        }}
                        style={{
                          padding: '10px 20px',
                          background: 'transparent',
                          border: `1px solid ${theme.colors.border}`,
                          borderRadius: '8px',
                          color: theme.colors.textSecondary,
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          const token = prompt('Enter the 6-digit code from your authenticator app:')
                          if (token && token.length === 6) {
                            handleVerify2FA(token)
                          } else {
                            alert('Please enter a valid 6-digit code.')
                          }
                        }}
                        style={{
                          padding: '10px 20px',
                          background: theme.colors.primary,
                          border: 'none',
                          borderRadius: '8px',
                          color: 'white',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        Verify & Enable
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Data & Privacy Tab */}
          {activeTab === 'data' && (
            <div style={{
              background: theme.colors.backgroundCard,
              borderRadius: '16px',
              padding: '32px',
              border: `1px solid ${theme.colors.border}`,
              boxShadow: theme.shadow.subtle
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                margin: '0 0 8px 0',
                color: theme.colors.textPrimary
              }}>
                Data & Privacy
              </h2>
              <p style={{
                fontSize: '16px',
                color: theme.colors.textSecondary,
                margin: '0 0 32px 0'
              }}>
                Manage your data and privacy settings
              </p>

              {loadingPrivacy && (
                <div style={{
                  marginBottom: '24px',
                  padding: '16px',
                  backgroundColor: `${theme.colors.primary}10`,
                  border: `1px solid ${theme.colors.primary}30`,
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <RefreshCw size={20} color={theme.colors.primary} className="animate-spin" />
                  <p style={{
                    color: theme.colors.primary,
                    fontSize: '14px',
                    fontWeight: '500',
                    margin: 0
                  }}>
                    Loading privacy settings...
                  </p>
                </div>
              )}

              {/* Data Usage Overview */}
              {dataUsage && (
                <div style={{
                  padding: '24px',
                  backgroundColor: theme.colors.backgroundTertiary,
                  borderRadius: '12px',
                  border: `1px solid ${theme.colors.border}`,
                  marginBottom: '24px'
                }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Database size={18} />
                    Data Usage
                  </h3>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '16px'
                  }}>
                    <div style={{
                      padding: '16px',
                      backgroundColor: theme.colors.background,
                      borderRadius: '8px',
                      border: `1px solid ${theme.colors.border}`
                    }}>
                      <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: '0 0 8px 0' }}>
                        Total Storage
                      </p>
                      <p style={{ fontSize: '20px', fontWeight: 'bold', color: theme.colors.textPrimary, margin: 0 }}>
                        {(dataUsage.totalStorageUsed / 1048576).toFixed(1)} MB
                      </p>
                    </div>
                    
                    <div style={{
                      padding: '16px',
                      backgroundColor: theme.colors.background,
                      borderRadius: '8px',
                      border: `1px solid ${theme.colors.border}`
                    }}>
                      <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: '0 0 8px 0' }}>
                        Documents
                      </p>
                      <p style={{ fontSize: '20px', fontWeight: 'bold', color: theme.colors.textPrimary, margin: 0 }}>
                        {dataUsage.documentCount}
                      </p>
                    </div>
                    
                    <div style={{
                      padding: '16px',
                      backgroundColor: theme.colors.background,
                      borderRadius: '8px',
                      border: `1px solid ${theme.colors.border}`
                    }}>
                      <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: '0 0 8px 0' }}>
                        Loads
                      </p>
                      <p style={{ fontSize: '20px', fontWeight: 'bold', color: theme.colors.textPrimary, margin: 0 }}>
                        {dataUsage.loadCount}
                      </p>
                    </div>
                    
                    <div style={{
                      padding: '16px',
                      backgroundColor: theme.colors.background,
                      borderRadius: '8px',
                      border: `1px solid ${theme.colors.border}`
                    }}>
                      <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: '0 0 8px 0' }}>
                        Messages
                      </p>
                      <p style={{ fontSize: '20px', fontWeight: 'bold', color: theme.colors.textPrimary, margin: 0 }}>
                        {dataUsage.messageCount}
                      </p>
                    </div>
                    
                    <div style={{
                      padding: '16px',
                      backgroundColor: theme.colors.background,
                      borderRadius: '8px',
                      border: `1px solid ${theme.colors.border}`
                    }}>
                      <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: '0 0 8px 0' }}>
                        Invoices
                      </p>
                      <p style={{ fontSize: '20px', fontWeight: 'bold', color: theme.colors.textPrimary, margin: 0 }}>
                        {dataUsage.invoiceCount}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Privacy Preferences */}
              <div style={{
                padding: '24px',
                backgroundColor: theme.colors.backgroundTertiary,
                borderRadius: '12px',
                border: `1px solid ${theme.colors.border}`,
                marginBottom: '24px'
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Shield size={18} />
                  Privacy Preferences
                </h3>
                
                {privacySettings && Object.entries(privacySettings).filter(([key]) => 
                  ['allowAnalytics', 'shareWithPartners', 'personalizedAds', 'usageReports', 'thirdPartyTracking', 'marketingEmails'].includes(key)
                ).map(([key, value]) => (
                  <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: `1px solid ${theme.colors.border}` }}>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, margin: '0 0 4px 0' }}>
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </p>
                      <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: 0 }}>
                        {key === 'allowAnalytics' && 'Help us improve by sharing anonymous usage data'}
                        {key === 'shareWithPartners' && 'Share data with trusted third-party partners'}
                        {key === 'personalizedAds' && 'Receive personalized advertisements'}
                        {key === 'usageReports' && 'Send monthly usage reports'}
                        {key === 'thirdPartyTracking' && 'Allow third-party tracking cookies'}
                        {key === 'marketingEmails' && 'Receive marketing and promotional emails'}
                      </p>
                    </div>
                    <button
                      onClick={() => handlePrivacyToggle(key, !value)}
                      disabled={updatePrivacyMutation.isPending}
                      style={{
                        padding: '8px 16px',
                        background: value ? theme.colors.success : theme.colors.backgroundCard,
                        color: value ? 'white' : theme.colors.textPrimary,
                        border: `2px solid ${value ? theme.colors.success : theme.colors.border}`,
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: updatePrivacyMutation.isPending ? 'not-allowed' : 'pointer',
                        transition: 'all 0.3s ease',
                        minWidth: '90px',
                        opacity: updatePrivacyMutation.isPending ? 0.6 : 1
                      }}
                      onMouseEnter={(e) => {
                        if (!updatePrivacyMutation.isPending) e.currentTarget.style.transform = 'scale(1.05)'
                      }}
                      onMouseLeave={(e) => {
                        if (!updatePrivacyMutation.isPending) e.currentTarget.style.transform = 'scale(1)'
                      }}
                    >
                      {value ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                ))}
              </div>

              {/* Data Export */}
              <div style={{
                padding: '24px',
                backgroundColor: theme.colors.backgroundTertiary,
                borderRadius: '12px',
                border: `1px solid ${theme.colors.border}`,
                marginBottom: '24px'
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary, margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Download size={18} />
                  Export Your Data
                </h3>
                <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: '0 0 16px 0' }}>
                  Download a copy of all your data stored in our system (GDPR compliant)
                </p>
                
                {exportError && (
                  <div style={{
                    marginBottom: '16px',
                    padding: '12px',
                    backgroundColor: `${theme.colors.error}10`,
                    border: `1px solid ${theme.colors.error}30`,
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <AlertCircle size={16} color={theme.colors.error} />
                    <p style={{
                      color: theme.colors.error,
                      fontSize: '13px',
                      fontWeight: '500',
                      margin: 0
                    }}>
                      {exportError}
                    </p>
                  </div>
                )}

                <button
                  onClick={handleExportData}
                  disabled={exportingData}
                  style={{
                    padding: '12px 24px',
                    background: exportingData ? theme.colors.backgroundCard : theme.colors.primary,
                    color: exportingData ? theme.colors.textSecondary : 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: exportingData ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    opacity: exportingData ? 0.6 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!exportingData) e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    if (!exportingData) e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  {exportingData ? <RefreshCw size={16} className="animate-spin" /> : <Download size={16} />}
                  {exportingData ? 'Processing...' : 'Request Data Export'}
                </button>
              </div>

              {/* Delete Account */}
              <div style={{
                padding: '24px',
                backgroundColor: `${theme.colors.error}10`,
                borderRadius: '12px',
                border: `1px solid ${theme.colors.error}30`
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.error, margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={18} />
                  Delete Account
                </h3>
                <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: '0 0 16px 0' }}>
                  Permanently delete your account and all associated data. This action cannot be undone. Your account will be scheduled for deletion in 7 days.
                </p>
                
                {deleteError && (
                  <div style={{
                    marginBottom: '16px',
                    padding: '12px',
                    backgroundColor: `${theme.colors.error}10`,
                    border: `1px solid ${theme.colors.error}30`,
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <AlertCircle size={16} color={theme.colors.error} />
                    <p style={{
                      color: theme.colors.error,
                      fontSize: '13px',
                      fontWeight: '500',
                      margin: 0
                    }}>
                      {deleteError}
                    </p>
                  </div>
                )}

                <button
                  onClick={handleDeleteAccount}
                  disabled={deletingAccount}
                  style={{
                    padding: '12px 24px',
                    background: deletingAccount ? theme.colors.backgroundCard : theme.colors.error,
                    color: deletingAccount ? theme.colors.textSecondary : 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: deletingAccount ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    opacity: deletingAccount ? 0.6 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!deletingAccount) e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    if (!deletingAccount) e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  {deletingAccount ? <RefreshCw size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  {deletingAccount ? 'Processing...' : 'Delete My Account'}
                </button>
              </div>

              {/* Privacy Audit Log */}
              {privacyAuditLog && privacyAuditLog.length > 0 && (
                <div style={{
                  padding: '24px',
                  backgroundColor: theme.colors.backgroundTertiary,
                  borderRadius: '12px',
                  border: `1px solid ${theme.colors.border}`,
                  marginTop: '24px'
                }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Shield size={18} />
                    Privacy Activity Log
                  </h3>
                  <p style={{ fontSize: '13px', color: theme.colors.textSecondary, margin: '0 0 16px 0' }}>
                    Recent privacy-related activities on your account
                  </p>
                  
                  <div style={{ display: 'grid', gap: '8px' }}>
                    {privacyAuditLog.slice(0, 5).map((log) => (
                      <div key={log.id} style={{
                        padding: '12px',
                        backgroundColor: theme.colors.background,
                        borderRadius: '8px',
                        border: `1px solid ${theme.colors.border}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: theme.colors.primary,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white'
                        }}>
                          <Shield size={14} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '13px', fontWeight: '600', color: theme.colors.textPrimary, margin: '0 0 2px 0' }}>
                            {log.description}
                          </p>
                          <p style={{ fontSize: '11px', color: theme.colors.textSecondary, margin: 0 }}>
                            {new Date(log.timestamp).toLocaleString()} • {log.ipAddress}
                          </p>
                        </div>
                        <div style={{
                          padding: '2px 8px',
                          background: `${theme.colors.primary}20`,
                          border: `1px solid ${theme.colors.primary}`,
                          borderRadius: '4px',
                          fontSize: '10px',
                          fontWeight: '600',
                          color: theme.colors.primary,
                          textTransform: 'uppercase'
                        }}>
                          {log.action.replace(/_/g, ' ')}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{
                    marginTop: '16px',
                    padding: '12px',
                    background: `${theme.colors.warning}10`,
                    border: `1px solid ${theme.colors.warning}30`,
                    borderRadius: '8px'
                  }}>
                    <p style={{
                      fontSize: '12px',
                      color: theme.colors.textSecondary,
                      margin: 0
                    }}>
                      <strong>Note:</strong> All privacy-related activities are logged for your security and transparency. Contact us if you notice any suspicious activity.
                    </p>
                  </div>
                </div>
              )}

              {/* GDPR Compliance Note */}
              <div style={{
                marginTop: '24px',
                padding: '16px',
                background: `${theme.colors.primary}10`,
                border: `1px solid ${theme.colors.primary}30`,
                borderRadius: '8px'
              }}>
                <p style={{
                  fontSize: '13px',
                  color: theme.colors.textSecondary,
                  margin: 0,
                  lineHeight: 1.6
                }}>
                  <strong style={{ color: theme.colors.textPrimary }}>Your Privacy Rights:</strong> Under GDPR and similar regulations, you have the right to access, rectify, delete, and export your personal data. You can also object to processing and restrict certain uses of your data. For more information, visit our <a href="/privacy-policy" style={{ color: theme.colors.primary }}>Privacy Policy</a> or contact our Data Protection Officer at <a href="mailto:privacy@superiorone.com" style={{ color: theme.colors.primary }}>privacy@superiorone.com</a>.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SettingsPage

