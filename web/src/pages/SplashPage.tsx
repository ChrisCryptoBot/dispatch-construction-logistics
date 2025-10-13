import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import Logo from '../components/ui/Logo'
import { 
  Truck, Building2, ArrowRight, CheckCircle, Star, Users, 
  TrendingUp, Shield, Clock, Globe, Zap, Target
} from 'lucide-react'

const SplashPage = () => {
  const { theme } = useTheme()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login')
  const [userType, setUserType] = useState<'carrier' | 'customer'>('carrier')
  
  // Form states
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  })
  
  const [signupForm, setSignupForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    firstName: '',
    lastName: '',
    phone: '',
    userType: 'carrier'
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Development: admin/admin logs into carrier dashboard
    if (loginForm.email === 'admin' && loginForm.password === 'admin') {
      const mockToken = 'dev-admin-token-' + Date.now()
      const mockUser = {
        id: 'admin-user',
        orgId: 'admin-org',
        email: 'admin@superioronelogistics.com',
        firstName: 'Admin',
        lastName: 'User',
        phone: '903-388-5470',
        role: 'SUPER_ADMIN',
        active: true,
        emailVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      const mockOrg = {
        id: 'admin-org',
        name: 'Superior One Logistics',
        type: 'CARRIER',
        mcNumber: 'MC123456',
        dotNumber: 'DOT123456',
        ein: '12-3456789',
        email: 'admin@superioronelogistics.com',
        phone: '903-388-5470',
        verified: true,
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      localStorage.setItem('token', mockToken)
      localStorage.setItem('user', JSON.stringify(mockUser))
      localStorage.setItem('organization', JSON.stringify(mockOrg))
      
      navigate('/carrier-dashboard')
    } else if (loginForm.email === 'customer' && loginForm.password === 'admin') {
      // Customer login
      const mockToken = 'dev-customer-token-' + Date.now()
      const mockUser = {
        id: 'user-001',
        email: 'admin@abc-construction.com',
        firstName: 'Customer',
        lastName: 'User',
        role: 'customer'
      }
      const mockOrg = {
        id: 'org-001',
        name: 'ABC Construction Co',
        type: 'SHIPPER'
      }
      
      localStorage.setItem('token', mockToken)
      localStorage.setItem('user', JSON.stringify(mockUser))
      localStorage.setItem('organization', JSON.stringify(mockOrg))
      
      navigate('/customer-dashboard')
    } else if (loginForm.email === 'carrier' && loginForm.password === 'admin') {
      // Carrier login
      const mockToken = 'dev-carrier-token-' + Date.now()
      const mockUser = {
        id: 'user-002',
        email: 'admin@superior-one.com',
        firstName: 'Carrier',
        lastName: 'User',
        role: 'carrier'
      }
      const mockOrg = {
        id: 'org-002',
        name: 'Superior One Logistics',
        type: 'CARRIER'
      }
      
      localStorage.setItem('token', mockToken)
      localStorage.setItem('user', JSON.stringify(mockUser))
      localStorage.setItem('organization', JSON.stringify(mockOrg))
      
      navigate('/carrier-dashboard')
    } else {
      alert('Invalid credentials. Try:\n\nCustomer: admin/admin\nCarrier: carrier/admin')
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (signupForm.password !== signupForm.confirmPassword) {
      alert('Passwords do not match')
      return
    }

    if (!signupForm.email || !signupForm.password || !signupForm.companyName) {
      alert('Please fill in all required fields')
      return
    }

    try {
      // Call the backend signup API
      const response = await fetch('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orgName: signupForm.companyName,
          orgType: signupForm.userType === 'carrier' ? 'CARRIER' : 'SHIPPER',
          email: signupForm.email,
          password: signupForm.password,
          firstName: signupForm.firstName || 'User',
          lastName: signupForm.lastName || 'User',
          phone: signupForm.phone,
          captchaToken: 'mock-dev-token' // Mock token for development
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || 'Signup failed')
      }

      // If dev bypass (admin@admin.com), go straight to dashboard
      if (data.token) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        localStorage.setItem('organization', JSON.stringify(data.organization))
        
        if (data.organization.type === 'CARRIER') {
          navigate('/carrier-dashboard')
        } else {
          navigate('/customer-dashboard')
        }
        return
      }

      // Normal flow: redirect to verification page
      if (data.requiresVerification) {
        navigate(`/verify-email?email=${encodeURIComponent(signupForm.email)}`)
      }

    } catch (error: any) {
      console.error('❌ Signup error:', error)
      alert(error.message || 'Signup failed. Please try again.')
    }
  }

  const features = [
    {
      icon: Truck,
      title: 'Smart Load Matching',
      description: 'AI-powered matching between loads and available trucks'
    },
    {
      icon: TrendingUp,
      title: 'Real-time Analytics',
      description: 'Comprehensive dashboards and performance metrics'
    },
    {
      icon: Shield,
      title: 'Compliance Tracking',
      description: 'Automated compliance monitoring and reporting'
    },
    {
      icon: Clock,
      title: '24/7 Support',
      description: 'Round-the-clock customer support and assistance'
    },
    {
      icon: Globe,
      title: 'Nationwide Network',
      description: 'Connect with carriers and shippers across the country'
    },
    {
      icon: Zap,
      title: 'Instant Notifications',
      description: 'Real-time updates on loads, bids, and deliveries'
    }
  ]

  const stats = [
    { number: '10,000+', label: 'Active Carriers' },
    { number: '50,000+', label: 'Loads Posted' },
    { number: '$2.5B+', label: 'Freight Moved' },
    { number: '99.8%', label: 'On-Time Delivery' }
  ]

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
        <Logo 
          size="xl"
          className="h-20"
        />
        <div style={{ display: 'flex', gap: '16px' }}>
          <button
            onClick={() => setActiveTab('login')}
            style={{
              padding: '12px 24px',
              background: activeTab === 'login' ? theme.colors.primary : 'transparent',
              color: activeTab === 'login' ? 'white' : theme.colors.textPrimary,
              border: `1px solid ${activeTab === 'login' ? theme.colors.primary : theme.colors.border}`,
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Login
          </button>
          <button
            onClick={() => setActiveTab('signup')}
            style={{
              padding: '12px 24px',
              background: activeTab === 'signup' ? theme.colors.primary : 'transparent',
              color: activeTab === 'signup' ? 'white' : theme.colors.textPrimary,
              border: `1px solid ${activeTab === 'signup' ? theme.colors.primary : theme.colors.border}`,
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Sign Up
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 0,
        minHeight: 'calc(100vh - 100px)'
      }}>
        {/* Left Side - Hero Content */}
        <div style={{
          padding: '80px 60px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          background: `linear-gradient(135deg, ${theme.colors.primary}10, ${theme.colors.primary}05)`
        }}>
          <div style={{ marginBottom: '40px' }}>
            <div style={{
              padding: '12px 24px',
              background: `${theme.colors.primary}20`,
              borderRadius: '30px',
              display: 'inline-block',
              marginBottom: '24px',
              border: `1px solid ${theme.colors.primary}30`
            }}>
              <span style={{
                fontSize: '14px',
                fontWeight: '600',
                color: theme.colors.primary
              }}>
                The Construction Logistics Platform More Carriers & Customers Trust
              </span>
            </div>
            
            <h1 style={{
              fontSize: '52px',
              fontWeight: '800',
              color: theme.colors.textPrimary,
              marginBottom: '24px',
              lineHeight: 1.1
            }}>
              Make More Money.
              <br />
              Get Paid Faster.
              <br />
              <span style={{
                background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primaryHover})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Build Trusted Networks.
              </span>
            </h1>
            <p style={{
              fontSize: '22px',
              color: theme.colors.textSecondary,
              lineHeight: 1.6,
              marginBottom: '32px',
              maxWidth: '600px'
            }}>
              The only platform that goes beyond basic load boards to make your construction logistics job easier at every turn. From negotiating rates to finding routes, from managing paperwork to monitoring compliance.
            </p>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
              marginBottom: '40px',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={() => setActiveTab('signup')}
                style={{
                  padding: '18px 36px',
                  background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primaryHover})`,
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: `0 8px 32px ${theme.colors.primary}40`
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)'
                  e.currentTarget.style.boxShadow = `0 12px 40px ${theme.colors.primary}50`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = `0 8px 32px ${theme.colors.primary}40`
                }}
              >
                Start Free Trial
                <ArrowRight size={18} style={{ marginLeft: '8px' }} />
              </button>
              
              <button
                onClick={() => setActiveTab('login')}
                style={{
                  padding: '18px 36px',
                  background: 'transparent',
                  color: theme.colors.textPrimary,
                  border: `2px solid ${theme.colors.border}`,
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = theme.colors.primary
                  e.currentTarget.style.background = `${theme.colors.primary}10`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = theme.colors.border
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                View Demo
              </button>
            </div>
          </div>

          {/* Real-Time Market Data */}
          <div style={{
            background: theme.colors.backgroundPrimary,
            borderRadius: '16px',
            border: `1px solid ${theme.colors.border}`,
            padding: '24px',
            marginBottom: '40px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px'
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: theme.colors.textPrimary,
                margin: 0
              }}>
                Real-time Construction Loads Market
              </h3>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '12px',
                color: theme.colors.textSecondary
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  background: theme.colors.success,
                  borderRadius: '50%',
                  animation: 'pulse 2s infinite'
                }} />
                Live Data
              </div>
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px'
            }}>
              <div style={{
                padding: '20px',
                background: theme.colors.backgroundSecondary,
                borderRadius: '12px',
                textAlign: 'center',
                border: `2px solid ${theme.colors.primary}20`
              }}>
                <div style={{
                  fontSize: '28px',
                  fontWeight: '700',
                  color: theme.colors.primary,
                  marginBottom: '4px'
                }}>
                  2,847
                </div>
                <div style={{
                  fontSize: '12px',
                  color: theme.colors.textSecondary,
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Available Loads
                </div>
                <div style={{
                  fontSize: '11px',
                  color: theme.colors.success,
                  marginTop: '4px'
                }}>
                  +127 today
                </div>
              </div>
              
              <div style={{
                padding: '20px',
                background: theme.colors.backgroundSecondary,
                borderRadius: '12px',
                textAlign: 'center',
                border: `2px solid ${theme.colors.info}20`
              }}>
                <div style={{
                  fontSize: '28px',
                  fontWeight: '700',
                  color: theme.colors.info,
                  marginBottom: '4px'
                }}>
                  $4.2M
                </div>
                <div style={{
                  fontSize: '12px',
                  color: theme.colors.textSecondary,
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Opportunity Amount
                </div>
                <div style={{
                  fontSize: '11px',
                  color: theme.colors.success,
                  marginTop: '4px'
                }}>
                  +$180K today
                </div>
              </div>
              
              <div style={{
                padding: '20px',
                background: theme.colors.backgroundSecondary,
                borderRadius: '12px',
                textAlign: 'center',
                border: `2px solid ${theme.colors.warning}20`
              }}>
                <div style={{
                  fontSize: '28px',
                  fontWeight: '700',
                  color: theme.colors.warning,
                  marginBottom: '4px'
                }}>
                  $2.84
                </div>
                <div style={{
                  fontSize: '12px',
                  color: theme.colors.textSecondary,
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Avg Rate/Mile
                </div>
                <div style={{
                  fontSize: '11px',
                  color: theme.colors.success,
                  marginTop: '4px'
                }}>
                  +$0.12 vs last week
                </div>
              </div>
              
              <div style={{
                padding: '20px',
                background: theme.colors.backgroundSecondary,
                borderRadius: '12px',
                textAlign: 'center',
                border: `2px solid ${theme.colors.success}20`
              }}>
                <div style={{
                  fontSize: '28px',
                  fontWeight: '700',
                  color: theme.colors.success,
                  marginBottom: '4px'
                }}>
                  98.7%
                </div>
                <div style={{
                  fontSize: '12px',
                  color: theme.colors.textSecondary,
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  On-Time Delivery
                </div>
                <div style={{
                  fontSize: '11px',
                  color: theme.colors.success,
                  marginTop: '4px'
                }}>
                  Industry leading
                </div>
              </div>
            </div>
          </div>

          {/* Legacy Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '24px',
            marginBottom: '40px'
          }}>
            {stats.map((stat, index) => (
              <div key={index} style={{
                padding: '24px',
                background: theme.colors.backgroundPrimary,
                borderRadius: '12px',
                border: `1px solid ${theme.colors.border}`,
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '32px',
                  fontWeight: '700',
                  color: theme.colors.primary,
                  marginBottom: '8px'
                }}>
                  {stat.number}
                </div>
                <div style={{
                  fontSize: '14px',
                  color: theme.colors.textSecondary,
                  fontWeight: '500'
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Features Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '20px'
          }}>
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '16px',
                  background: theme.colors.backgroundPrimary,
                  borderRadius: '10px',
                  border: `1px solid ${theme.colors.border}`
                }}>
                  <div style={{
                    padding: '8px',
                    background: `${theme.colors.primary}20`,
                    borderRadius: '8px',
                    flexShrink: 0
                  }}>
                    <Icon size={20} color={theme.colors.primary} />
                  </div>
                  <div>
                    <h4 style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: theme.colors.textPrimary,
                      marginBottom: '4px'
                    }}>
                      {feature.title}
                    </h4>
                    <p style={{
                      fontSize: '12px',
                      color: theme.colors.textSecondary,
                      lineHeight: 1.4
                    }}>
                      {feature.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div style={{
          padding: '80px 60px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          background: theme.colors.backgroundPrimary
        }}>
          <div style={{ maxWidth: '400px', margin: '0 auto', width: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <h2 style={{
                fontSize: '32px',
                fontWeight: '700',
                color: theme.colors.textPrimary,
                marginBottom: '12px'
              }}>
                {activeTab === 'login' ? 'Welcome Back' : 'Get Started'}
              </h2>
              <p style={{
                fontSize: '16px',
                color: theme.colors.textSecondary
              }}>
                {activeTab === 'login' 
                  ? 'Sign in to your account' 
                  : 'Create your account and start shipping'
                }
              </p>
            </div>

            {activeTab === 'login' ? (
              /* Login Form */
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: theme.colors.textPrimary,
                    marginBottom: '8px'
                  }}>
                    Email or Username
                  </label>
                  <input
                    type="text"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    placeholder="admin or carrier"
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      background: theme.colors.backgroundSecondary,
                      border: `2px solid ${theme.colors.border}`,
                      borderRadius: '10px',
                      fontSize: '15px',
                      color: theme.colors.textPrimary,
                      outline: 'none',
                      transition: 'border-color 0.2s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = theme.colors.primary}
                    onBlur={(e) => e.target.style.borderColor = theme.colors.border}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: theme.colors.textPrimary,
                    marginBottom: '8px'
                  }}>
                    Password
                  </label>
                  <input
                    type="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    placeholder="admin"
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      background: theme.colors.backgroundSecondary,
                      border: `2px solid ${theme.colors.border}`,
                      borderRadius: '10px',
                      fontSize: '15px',
                      color: theme.colors.textPrimary,
                      outline: 'none',
                      transition: 'border-color 0.2s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = theme.colors.primary}
                    onBlur={(e) => e.target.style.borderColor = theme.colors.border}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    width: '100%',
                    padding: '16px',
                    background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primaryHover})`,
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  Sign In
                  <ArrowRight size={18} />
                </button>

                <div style={{
                  padding: '16px',
                  background: `${theme.colors.info}10`,
                  borderRadius: '8px',
                  border: `1px solid ${theme.colors.info}20`
                }}>
                  <div style={{
                    fontSize: '12px',
                    color: theme.colors.textSecondary,
                    marginBottom: '8px',
                    fontWeight: '600'
                  }}>
                    Demo Credentials:
                  </div>
                  <div style={{ fontSize: '11px', color: theme.colors.textSecondary }}>
                    Customer: <strong>admin</strong> / <strong>admin</strong><br/>
                    Carrier: <strong>carrier</strong> / <strong>admin</strong>
                  </div>
                </div>
              </form>
            ) : (
              /* Signup Form */
              <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* User Type Selection */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: theme.colors.textPrimary,
                    marginBottom: '12px'
                  }}>
                    I am a...
                  </label>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setUserType('carrier')
                        setSignupForm({ ...signupForm, userType: 'carrier' })
                      }}
                      style={{
                        flex: 1,
                        padding: '14px 16px',
                        background: userType === 'carrier' ? theme.colors.primary : theme.colors.backgroundSecondary,
                        color: userType === 'carrier' ? 'white' : theme.colors.textPrimary,
                        border: `2px solid ${userType === 'carrier' ? theme.colors.primary : theme.colors.border}`,
                        borderRadius: '10px',
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
                      <Truck size={18} />
                      Carrier
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUserType('customer')
                        setSignupForm({ ...signupForm, userType: 'customer' })
                      }}
                      style={{
                        flex: 1,
                        padding: '14px 16px',
                        background: userType === 'customer' ? theme.colors.primary : theme.colors.backgroundSecondary,
                        color: userType === 'customer' ? 'white' : theme.colors.textPrimary,
                        border: `2px solid ${userType === 'customer' ? theme.colors.primary : theme.colors.border}`,
                        borderRadius: '10px',
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
                      <Building2 size={18} />
                      Customer
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: theme.colors.textPrimary,
                      marginBottom: '8px'
                    }}>
                      First Name
                    </label>
                    <input
                      type="text"
                      value={signupForm.firstName}
                      onChange={(e) => setSignupForm({ ...signupForm, firstName: e.target.value })}
                      placeholder="John"
                      style={{
                        width: '100%',
                        padding: '12px 14px',
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
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: theme.colors.textPrimary,
                      marginBottom: '8px'
                    }}>
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={signupForm.lastName}
                      onChange={(e) => setSignupForm({ ...signupForm, lastName: e.target.value })}
                      placeholder="Smith"
                      style={{
                        width: '100%',
                        padding: '12px 14px',
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
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: theme.colors.textPrimary,
                    marginBottom: '8px'
                  }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={signupForm.email}
                    onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                    placeholder="john@company.com"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
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
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: theme.colors.textPrimary,
                    marginBottom: '8px'
                  }}>
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={signupForm.companyName}
                    onChange={(e) => setSignupForm({ ...signupForm, companyName: e.target.value })}
                    placeholder="Your Company Inc"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      background: theme.colors.backgroundSecondary,
                      border: `2px solid ${theme.colors.border}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      color: theme.colors.textPrimary,
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: theme.colors.textPrimary,
                      marginBottom: '8px'
                    }}>
                      Password
                    </label>
                    <input
                      type="password"
                      value={signupForm.password}
                      onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                      placeholder="••••••••"
                      style={{
                        width: '100%',
                        padding: '12px 14px',
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
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: theme.colors.textPrimary,
                      marginBottom: '8px'
                    }}>
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={signupForm.confirmPassword}
                      onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                      placeholder="••••••••"
                      style={{
                        width: '100%',
                        padding: '12px 14px',
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

                <button
                  type="submit"
                  style={{
                    width: '100%',
                    padding: '16px',
                    background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primaryHover})`,
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  Create {userType === 'carrier' ? 'Carrier' : 'Customer'} Account
                  <ArrowRight size={18} />
                </button>

                <div style={{
                  padding: '12px',
                  background: `${theme.colors.success}10`,
                  borderRadius: '8px',
                  border: `1px solid ${theme.colors.success}20`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <CheckCircle size={16} color={theme.colors.success} />
                  <span style={{ fontSize: '12px', color: theme.colors.textSecondary }}>
                    Free to start • No setup fees • Cancel anytime
                  </span>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        padding: '60px 40px',
        textAlign: 'center',
        borderTop: `1px solid ${theme.colors.border}`,
        background: theme.colors.backgroundPrimary
      }}>
        {/* Trust Indicators */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '40px',
          marginBottom: '32px',
          flexWrap: 'wrap'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            background: theme.colors.backgroundSecondary,
            borderRadius: '8px',
            border: `1px solid ${theme.colors.border}`
          }}>
            <Star size={18} color={theme.colors.primary} />
            <span style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary }}>
              Rated 4.9/5 by 2,500+ users
            </span>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            background: theme.colors.backgroundSecondary,
            borderRadius: '8px',
            border: `1px solid ${theme.colors.border}`
          }}>
            <Shield size={18} color={theme.colors.success} />
            <span style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary }}>
              SOC 2 Type II Compliant
            </span>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            background: theme.colors.backgroundSecondary,
            borderRadius: '8px',
            border: `1px solid ${theme.colors.border}`
          }}>
            <CheckCircle size={18} color={theme.colors.info} />
            <span style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary }}>
              FMCSA Certified
            </span>
          </div>
        </div>

        {/* Customer Logos/Testimonials */}
        <div style={{
          marginBottom: '32px',
          padding: '24px',
          background: theme.colors.backgroundSecondary,
          borderRadius: '12px',
          border: `1px solid ${theme.colors.border}`
        }}>
          <h4 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: theme.colors.textPrimary,
            marginBottom: '16px'
          }}>
            Trusted by Leading Construction Companies
          </h4>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '32px',
            flexWrap: 'wrap'
          }}>
            {['ABC Construction', 'BuildCorp Inc', 'Mega Builders', 'Premier Contractors', 'Elite Construction'].map((company, index) => (
              <div key={index} style={{
                padding: '8px 16px',
                background: theme.colors.backgroundPrimary,
                borderRadius: '6px',
                border: `1px solid ${theme.colors.border}`,
                fontSize: '12px',
                fontWeight: '600',
                color: theme.colors.textSecondary
              }}>
                {company}
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Section */}
        <div style={{
          marginBottom: '24px',
          padding: '32px',
          background: `linear-gradient(135deg, ${theme.colors.primary}10, ${theme.colors.primary}05)`,
          borderRadius: '16px',
          border: `1px solid ${theme.colors.primary}20`
        }}>
          <h3 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: theme.colors.textPrimary,
            marginBottom: '16px',
            textAlign: 'center'
          }}>
            Simple, Transparent Pricing
          </h3>
          <p style={{
            fontSize: '16px',
            color: theme.colors.textSecondary,
            marginBottom: '32px',
            textAlign: 'center',
            maxWidth: '600px',
            margin: '0 auto 32px auto'
          }}>
            No hidden fees. No surprises. Just transparent pricing that grows with your business.
          </p>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
            marginBottom: '32px'
          }}>
            {/* Basic Plan */}
            <div style={{
              padding: '24px',
              background: theme.colors.backgroundPrimary,
              borderRadius: '12px',
              border: `2px solid ${theme.colors.border}`,
              textAlign: 'center',
              position: 'relative'
            }}>
              <h4 style={{
                fontSize: '18px',
                fontWeight: '700',
                color: theme.colors.textPrimary,
                marginBottom: '8px'
              }}>
                Basic
              </h4>
              <p style={{
                fontSize: '14px',
                color: theme.colors.textSecondary,
                marginBottom: '16px'
              }}>
                Perfect for new carriers
              </p>
              <div style={{
                fontSize: '36px',
                fontWeight: '800',
                color: theme.colors.primary,
                marginBottom: '8px'
              }}>
                6%
              </div>
              <div style={{
                fontSize: '14px',
                color: theme.colors.textSecondary,
                marginBottom: '20px'
              }}>
                Commission per load
              </div>
              <ul style={{
                fontSize: '14px',
                color: theme.colors.textSecondary,
                textAlign: 'left',
                listStyle: 'none',
                padding: 0,
                margin: '0 0 24px 0'
              }}>
                <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={16} color={theme.colors.success} />
                  Load Board Access
                </li>
                <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={16} color={theme.colors.success} />
                  Basic Rate Insights
                </li>
                <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={16} color={theme.colors.success} />
                  Standard Support
                </li>
              </ul>
            </div>

            {/* Pro Plan */}
            <div style={{
              padding: '24px',
              background: theme.colors.backgroundPrimary,
              borderRadius: '12px',
              border: `2px solid ${theme.colors.primary}`,
              textAlign: 'center',
              position: 'relative',
              transform: 'scale(1.05)',
              boxShadow: `0 8px 32px ${theme.colors.primary}20`
            }}>
              <div style={{
                position: 'absolute',
                top: '-12px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: theme.colors.primary,
                color: 'white',
                padding: '6px 16px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                MOST POPULAR
              </div>
              <h4 style={{
                fontSize: '18px',
                fontWeight: '700',
                color: theme.colors.textPrimary,
                marginBottom: '8px',
                marginTop: '12px'
              }}>
                Pro
              </h4>
              <p style={{
                fontSize: '14px',
                color: theme.colors.textSecondary,
                marginBottom: '16px'
              }}>
                For growing fleets
              </p>
              <div style={{
                fontSize: '36px',
                fontWeight: '800',
                color: theme.colors.primary,
                marginBottom: '8px'
              }}>
                8%
              </div>
              <div style={{
                fontSize: '14px',
                color: theme.colors.textSecondary,
                marginBottom: '20px'
              }}>
                Commission per load
              </div>
              <ul style={{
                fontSize: '14px',
                color: theme.colors.textSecondary,
                textAlign: 'left',
                listStyle: 'none',
                padding: 0,
                margin: '0 0 24px 0'
              }}>
                <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={16} color={theme.colors.success} />
                  Everything in Basic
                </li>
                <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={16} color={theme.colors.success} />
                  Advanced Analytics
                </li>
                <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={16} color={theme.colors.success} />
                  Priority Support
                </li>
                <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={16} color={theme.colors.success} />
                  QuickPay Options
                </li>
              </ul>
            </div>

            {/* Enterprise Plan */}
            <div style={{
              padding: '24px',
              background: theme.colors.backgroundPrimary,
              borderRadius: '12px',
              border: `2px solid ${theme.colors.border}`,
              textAlign: 'center',
              position: 'relative'
            }}>
              <h4 style={{
                fontSize: '18px',
                fontWeight: '700',
                color: theme.colors.textPrimary,
                marginBottom: '8px'
              }}>
                Enterprise
              </h4>
              <p style={{
                fontSize: '14px',
                color: theme.colors.textSecondary,
                marginBottom: '16px'
              }}>
                For large operations
              </p>
              <div style={{
                fontSize: '36px',
                fontWeight: '800',
                color: theme.colors.primary,
                marginBottom: '8px'
              }}>
                4%
              </div>
              <div style={{
                fontSize: '14px',
                color: theme.colors.textSecondary,
                marginBottom: '20px'
              }}>
                Volume discount
              </div>
              <ul style={{
                fontSize: '14px',
                color: theme.colors.textSecondary,
                textAlign: 'left',
                listStyle: 'none',
                padding: 0,
                margin: '0 0 24px 0'
              }}>
                <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={16} color={theme.colors.success} />
                  Everything in Pro
                </li>
                <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={16} color={theme.colors.success} />
                  Custom Integrations
                </li>
                <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={16} color={theme.colors.success} />
                  Dedicated Account Manager
                </li>
                <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={16} color={theme.colors.success} />
                  White-label Options
                </li>
              </ul>
            </div>
          </div>

          <div style={{
            textAlign: 'center',
            fontSize: '12px',
            color: theme.colors.textSecondary,
            marginBottom: '20px'
          }}>
            * Commission on linehaul only. Pass-throughs (materials, disposal, permits) excluded. 
            <br />
            ** $25 minimum fee, $150 maximum fee per load. Settlement fee: $10 per payout.
          </div>
        </div>

        {/* Security & Protection Section */}
        <div style={{
          padding: '32px',
          background: theme.colors.backgroundPrimary,
          borderRadius: '16px',
          border: `1px solid ${theme.colors.border}`,
          marginBottom: '24px'
        }}>
          <h3 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: theme.colors.textPrimary,
            marginBottom: '16px',
            textAlign: 'center'
          }}>
            Your Security & Protection
          </h3>
          <p style={{
            fontSize: '16px',
            color: theme.colors.textSecondary,
            marginBottom: '32px',
            textAlign: 'center',
            maxWidth: '600px',
            margin: '0 auto 32px auto'
          }}>
            Why work through Superior One Logistics instead of going directly to carriers?
          </p>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            <div style={{
              padding: '24px',
              background: theme.colors.backgroundSecondary,
              borderRadius: '12px',
              border: `2px solid ${theme.colors.success}20`
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: `${theme.colors.success}20`,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
              }}>
                <Shield size={24} color={theme.colors.success} />
              </div>
              <h4 style={{
                fontSize: '18px',
                fontWeight: '700',
                color: theme.colors.textPrimary,
                marginBottom: '12px'
              }}>
                Financial Protection
              </h4>
              <p style={{
                fontSize: '14px',
                color: theme.colors.textSecondary,
                lineHeight: 1.5
              }}>
                We guarantee payment to carriers and handle all billing disputes. 
                No more chasing payments or dealing with non-payment issues.
              </p>
            </div>

            <div style={{
              padding: '24px',
              background: theme.colors.backgroundSecondary,
              borderRadius: '12px',
              border: `2px solid ${theme.colors.info}20`
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: `${theme.colors.info}20`,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
              }}>
                <CheckCircle size={24} color={theme.colors.info} />
              </div>
              <h4 style={{
                fontSize: '18px',
                fontWeight: '700',
                color: theme.colors.textPrimary,
                marginBottom: '12px'
              }}>
                Verified Carriers
              </h4>
              <p style={{
                fontSize: '14px',
                color: theme.colors.textSecondary,
                lineHeight: 1.5
              }}>
                All carriers are pre-vetted with insurance, licensing, and safety records verified. 
                No more worrying about unqualified or unsafe operators.
              </p>
            </div>

            <div style={{
              padding: '24px',
              background: theme.colors.backgroundSecondary,
              borderRadius: '12px',
              border: `2px solid ${theme.colors.warning}20`
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: `${theme.colors.warning}20`,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
              }}>
                <Clock size={24} color={theme.colors.warning} />
              </div>
              <h4 style={{
                fontSize: '18px',
                fontWeight: '700',
                color: theme.colors.textPrimary,
                marginBottom: '12px'
              }}>
                Real-time Tracking
              </h4>
              <p style={{
                fontSize: '14px',
                color: theme.colors.textSecondary,
                lineHeight: 1.5
              }}>
                Track every load from pickup to delivery with GPS, photos, and status updates. 
                Never wonder where your materials are again.
              </p>
            </div>

            <div style={{
              padding: '24px',
              background: theme.colors.backgroundSecondary,
              borderRadius: '12px',
              border: `2px solid ${theme.colors.primary}20`
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: `${theme.colors.primary}20`,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
              }}>
                <Users size={24} color={theme.colors.primary} />
              </div>
              <h4 style={{
                fontSize: '18px',
                fontWeight: '700',
                color: theme.colors.textPrimary,
                marginBottom: '12px'
              }}>
                Dedicated Support
              </h4>
              <p style={{
                fontSize: '14px',
                color: theme.colors.textSecondary,
                lineHeight: 1.5
              }}>
                24/7 customer support and dedicated account management. 
                When issues arise, we handle them so you don't have to.
              </p>
            </div>
          </div>

          <div style={{
            marginTop: '32px',
            padding: '24px',
            background: `linear-gradient(135deg, ${theme.colors.warning}10, ${theme.colors.warning}05)`,
            borderRadius: '12px',
            border: `1px solid ${theme.colors.warning}20`,
            textAlign: 'center'
          }}>
            <h4 style={{
              fontSize: '18px',
              fontWeight: '700',
              color: theme.colors.textPrimary,
              marginBottom: '12px'
            }}>
              The Superior One Advantage
            </h4>
            <p style={{
              fontSize: '16px',
              color: theme.colors.textSecondary,
              lineHeight: 1.6
            }}>
              <strong>Going direct to carriers</strong> means handling insurance verification, payment disputes, 
              tracking issues, and safety concerns yourself. <strong>Working with us</strong> means 
              focusing on your business while we handle all the logistics complexity.
            </p>
          </div>
        </div>

        <p style={{
          fontSize: '12px',
          color: theme.colors.textSecondary,
          margin: 0
        }}>
          © 2024 Superior One Logistics. All rights reserved. | 
          <a href="#" style={{ color: theme.colors.primary, textDecoration: 'none' }}> Privacy Policy</a> | 
          <a href="#" style={{ color: theme.colors.primary, textDecoration: 'none' }}> Terms of Service</a>
        </p>
      </footer>
    </div>
  )
}

export default SplashPage
