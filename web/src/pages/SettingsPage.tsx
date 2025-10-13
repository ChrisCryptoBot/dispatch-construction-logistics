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

const SettingsPage = () => {
  const { theme, setThemeMode } = useTheme()
  const { user, organization, logout } = useAuth()
  const navigate = useNavigate()
  
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
  
  // Notification states
  const [emailNotifications, setEmailNotifications] = useState({
    loadUpdates: true,
    driverMessages: true,
    paymentReceipts: true,
    invoices: true,
    systemAlerts: true,
    weeklyReports: true,
    marketingEmails: false
  })
  
  const [smsNotifications, setSmsNotifications] = useState({
    urgentAlerts: true,
    loadAssignments: true,
    driverAcceptance: true,
    deliveryConfirmations: true
  })
  
  const [pushNotifications, setPushNotifications] = useState({
    enabled: true,
    loadUpdates: true,
    messages: true,
    alerts: true
  })
  
  // Security states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [sessionTimeout, setSessionTimeout] = useState('30')
  
  // Data & Privacy states
  const [dataPreferences, setDataPreferences] = useState({
    allowAnalytics: true,
    shareWithPartners: false,
    personalizedAds: false,
    usageReports: true
  })

  const tabs = [
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'account', label: 'Account', icon: User },
    { id: 'billing', label: 'Billing & Payments', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'data', label: 'Data & Privacy', icon: Database }
  ]

  // Handlers
  const handleSaveProfile = () => {
    console.log('💾 Saving profile...', profileForm)
    // TODO: API call to update profile
    setIsEditingProfile(false)
    alert('✅ Profile updated successfully!')
  }

  const handleSaveCompany = () => {
    console.log('💾 Saving company info...', companyForm)
    // TODO: API call to update company
    setIsEditingCompany(false)
    alert('✅ Company information updated successfully!')
  }

  const handleChangePassword = () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      alert('❌ Please fill in all password fields')
      return
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('❌ New passwords do not match')
      return
    }
    
    if (passwordForm.newPassword.length < 8) {
      alert('❌ Password must be at least 8 characters')
      return
    }
    
    console.log('🔒 Changing password...')
    // TODO: API call to change password
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    alert('✅ Password changed successfully! Please log in again.')
    // logout()
  }

  const handleToggle2FA = () => {
    if (!twoFactorEnabled) {
      const confirmed = window.confirm(
        '🔐 Enable Two-Factor Authentication?\n\n' +
        'This will add an extra layer of security to your account.\n\n' +
        'You will receive a setup code via SMS to your registered phone number.\n\n' +
        'Continue?'
      )
      if (confirmed) {
        setTwoFactorEnabled(true)
        alert('✅ 2FA Enabled!\n\nSetup code sent to: +1 (512) 555-0100\n\nPlease check your phone and enter the code on your next login.')
      }
    } else {
      const confirmed = window.confirm('⚠️ Disable Two-Factor Authentication?\n\nThis will reduce your account security.\n\nContinue?')
      if (confirmed) {
        setTwoFactorEnabled(false)
        alert('✅ 2FA Disabled')
      }
    }
  }

  const handleExportData = () => {
    console.log('📦 Exporting user data...')
    alert('✅ Data export started!\n\nYou will receive an email with a download link within 24 hours containing:\n\n• Profile information\n• Load history\n• Transaction records\n• Communication logs\n• Preference settings')
  }

  const handleDeleteAccount = () => {
    const confirmed = window.confirm(
      '⚠️ DELETE ACCOUNT?\n\n' +
      'This action is IRREVERSIBLE and will:\n\n' +
      '• Permanently delete your account\n• Remove all your data\n• Cancel active loads\n• Terminate billing\n\n' +
      'Type "DELETE" to confirm'
    )
    
    if (confirmed) {
      const typeConfirm = prompt('Type DELETE to confirm account deletion:')
      if (typeConfirm === 'DELETE') {
        console.log('🗑️ Account deletion initiated')
        alert('✅ Account deletion request received.\n\nOur team will process this within 24 hours.\n\nYou will receive a final confirmation email.')
        // logout()
      } else {
        alert('❌ Account deletion cancelled')
      }
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
                        style={{
                          padding: '8px 16px',
                          background: theme.colors.success,
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
                        <Save size={14} />
                        Save
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
                        style={{
                          padding: '8px 16px',
                          background: theme.colors.success,
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
                        <Save size={14} />
                        Save
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
                    onChange={(e) => alert(`✅ Payment terms updated to ${e.target.value}`)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: theme.colors.backgroundCard,
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
                    <option style={{ background: theme.colors.backgroundCard, color: theme.colors.textPrimary }}>Net 7 Days (Current)</option>
                    <option style={{ background: theme.colors.backgroundCard, color: theme.colors.textPrimary }}>Net 15 Days</option>
                    <option style={{ background: theme.colors.backgroundCard, color: theme.colors.textPrimary }}>Net 30 Days</option>
                    <option style={{ background: theme.colors.backgroundCard, color: theme.colors.textPrimary }}>Due on Receipt</option>
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
                    onChange={(e) => alert(`✅ Grace period updated to ${e.target.value}`)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: theme.colors.backgroundCard,
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
                    <option style={{ background: theme.colors.backgroundCard, color: theme.colors.textPrimary }}>3 Days (Current)</option>
                    <option style={{ background: theme.colors.backgroundCard, color: theme.colors.textPrimary }}>5 Days</option>
                    <option style={{ background: theme.colors.backgroundCard, color: theme.colors.textPrimary }}>7 Days</option>
                    <option style={{ background: theme.colors.backgroundCard, color: theme.colors.textPrimary }}>No Grace Period</option>
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
                  onClick={() => window.location.href = '/carrier/payout-setup'}
                  style={{
                    marginTop: '20px',
                    padding: '12px 24px',
                    background: theme.colors.primary,
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
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
                  onClick={() => window.location.href = '/customer/payment-setup'}
                  style={{
                    padding: '12px 24px',
                    background: `${theme.colors.primary}20`,
                    color: theme.colors.primary,
                    border: `1px solid ${theme.colors.primary}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `${theme.colors.primary}30`
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = `${theme.colors.primary}20`
                    e.currentTarget.style.transform = 'translateY(0)'
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
                    defaultValue="INV-2025"
                    placeholder="INV-2025"
                    onChange={(e) => console.log('Invoice prefix changed:', e.target.value)}
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
                    onChange={(e) => alert(`✅ Auto-send updated: ${e.target.value}`)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: theme.colors.backgroundCard,
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
                    <option style={{ background: theme.colors.backgroundCard, color: theme.colors.textPrimary }}>Manual (Current)</option>
                    <option style={{ background: theme.colors.backgroundCard, color: theme.colors.textPrimary }}>Auto-send on delivery</option>
                    <option style={{ background: theme.colors.backgroundCard, color: theme.colors.textPrimary }}>Auto-send on POD receipt</option>
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
                    onChange={(e) => alert(`✅ Payout schedule updated: ${e.target.value}`)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: theme.colors.backgroundCard,
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
                    <option style={{ background: theme.colors.backgroundCard, color: theme.colors.textPrimary }}>Same Day (Current)</option>
                    <option style={{ background: theme.colors.backgroundCard, color: theme.colors.textPrimary }}>Next Business Day</option>
                    <option style={{ background: theme.colors.backgroundCard, color: theme.colors.textPrimary }}>Weekly (Fridays)</option>
                    <option style={{ background: theme.colors.backgroundCard, color: theme.colors.textPrimary }}>Bi-Weekly</option>
                  </select>
                </div>

                <div style={{ marginTop: '16px', marginBottom: '16px' }}>
                  <button
                    onClick={() => window.location.href = '/carrier/payout-setup'}
                    style={{
                      padding: '12px 24px',
                      background: `${theme.colors.primary}20`,
                      color: theme.colors.primary,
                      border: `1px solid ${theme.colors.primary}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = `${theme.colors.primary}30`
                      e.currentTarget.style.transform = 'translateY(-2px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = `${theme.colors.primary}20`
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                  >
                    <CreditCard size={16} />
                    Setup Payout Account (Stripe Connect)
                  </button>
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

              {/* Email Notifications */}
              <div style={{
                padding: '24px',
                backgroundColor: theme.colors.backgroundTertiary,
                borderRadius: '12px',
                border: `1px solid ${theme.colors.border}`,
                marginBottom: '24px'
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Mail size={18} />
                  Email Notifications
                </h3>
                
                {Object.entries(emailNotifications).map(([key, value]) => (
                  <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: `1px solid ${theme.colors.border}` }}>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, margin: '0 0 4px 0' }}>
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </p>
                      <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: 0 }}>
                        Receive notifications for {key.toLowerCase()}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setEmailNotifications({ ...emailNotifications, [key]: !value })
                        alert(`✅ ${key} notifications ${!value ? 'enabled' : 'disabled'}!`)
                      }}
                      style={{
                        padding: '6px 12px',
                        background: value ? theme.colors.success : theme.colors.backgroundCard,
                        color: value ? 'white' : theme.colors.textPrimary,
                        border: `1px solid ${value ? theme.colors.success : theme.colors.border}`,
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        minWidth: '80px'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      {value ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                ))}
              </div>

              {/* SMS Notifications */}
              <div style={{
                padding: '24px',
                backgroundColor: theme.colors.backgroundTertiary,
                borderRadius: '12px',
                border: `1px solid ${theme.colors.border}`,
                marginBottom: '24px'
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Smartphone size={18} />
                  SMS Notifications
                </h3>
                
                {Object.entries(smsNotifications).map(([key, value]) => (
                  <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: `1px solid ${theme.colors.border}` }}>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, margin: '0 0 4px 0' }}>
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </p>
                      <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: 0 }}>
                        Text messages for {key.toLowerCase()}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSmsNotifications({ ...smsNotifications, [key]: !value })
                        alert(`✅ ${key} SMS ${!value ? 'enabled' : 'disabled'}!`)
                      }}
                      style={{
                        padding: '6px 12px',
                        background: value ? theme.colors.success : theme.colors.backgroundCard,
                        color: value ? 'white' : theme.colors.textPrimary,
                        border: `1px solid ${value ? theme.colors.success : theme.colors.border}`,
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        minWidth: '80px'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      {value ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                ))}
              </div>

              {/* Push Notifications */}
              <div style={{
                padding: '24px',
                backgroundColor: theme.colors.backgroundTertiary,
                borderRadius: '12px',
                border: `1px solid ${theme.colors.border}`
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.textPrimary, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Bell size={18} />
                  Push Notifications
                </h3>
                
                {Object.entries(pushNotifications).map(([key, value]) => (
                  <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: `1px solid ${theme.colors.border}` }}>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, margin: '0 0 4px 0' }}>
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </p>
                      <p style={{ fontSize: '12px', color: theme.colors.textSecondary, margin: 0 }}>
                        Browser push notifications for {key.toLowerCase()}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setPushNotifications({ ...pushNotifications, [key]: !value })
                        alert(`✅ ${key} push notifications ${!value ? 'enabled' : 'disabled'}!`)
                      }}
                      style={{
                        padding: '6px 12px',
                        background: value ? theme.colors.success : theme.colors.backgroundCard,
                        color: value ? 'white' : theme.colors.textPrimary,
                        border: `1px solid ${value ? theme.colors.success : theme.colors.border}`,
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        minWidth: '80px'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      {value ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                ))}
              </div>
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

                  <button
                    onClick={handleChangePassword}
                    style={{
                      padding: '12px 24px',
                      background: theme.colors.primary,
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      marginTop: '8px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    Update Password
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
                    style={{
                      padding: '10px 20px',
                      background: twoFactorEnabled ? theme.colors.success : theme.colors.primary,
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    {twoFactorEnabled ? '✓ Enabled' : 'Enable 2FA'}
                  </button>
                </div>

                {twoFactorEnabled && (
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
                    value={sessionTimeout}
                    onChange={(e) => {
                      setSessionTimeout(e.target.value)
                      alert(`✅ Session timeout updated to ${e.target.value} minutes`)
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
                    Currently set to: <strong style={{ color: theme.colors.textPrimary }}>{sessionTimeout === 'never' ? 'Never' : `${sessionTimeout} minutes`}</strong>
                  </p>
                </div>
              </div>
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
                
                {Object.entries(dataPreferences).map(([key, value]) => (
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
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setDataPreferences({ ...dataPreferences, [key]: !value })
                        alert(`✅ ${key} ${!value ? 'enabled' : 'disabled'}!`)
                      }}
                      style={{
                        padding: '6px 12px',
                        background: value ? theme.colors.success : theme.colors.backgroundCard,
                        color: value ? 'white' : theme.colors.textPrimary,
                        border: `1px solid ${value ? theme.colors.success : theme.colors.border}`,
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        minWidth: '80px'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
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
                  Download a copy of all your data stored in our system
                </p>
                <button
                  onClick={handleExportData}
                  style={{
                    padding: '12px 24px',
                    background: theme.colors.primary,
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <Download size={16} />
                  Request Data Export
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
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                <button
                  onClick={handleDeleteAccount}
                  style={{
                    padding: '12px 24px',
                    background: theme.colors.error,
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <Trash2 size={16} />
                  Delete My Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SettingsPage

