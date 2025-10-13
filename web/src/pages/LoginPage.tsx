import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext-fixed'
import SuperiorOneLogo from '../components/SuperiorOneLogo'
import { Truck, Mail, Lock, Eye, EyeOff, AlertCircle, Loader } from 'lucide-react'

const LoginPage = () => {
  const { theme } = useTheme()
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Use real API authentication
      await login(email, password)
      
      // Determine redirect based on organization type
      const org = JSON.parse(localStorage.getItem('organization') || '{}')
      const redirectPath = org.type === 'CARRIER' ? '/carrier-dashboard' : '/customer-dashboard'
      
      console.log('✅ Login successful, redirecting to:', redirectPath)
      navigate(redirectPath)
      
    } catch (loginError: any) {
      console.error('Login error:', loginError)
      setError(loginError.message || 'Login failed. Please check your credentials.')
      setLoading(false)
    }
  }

  return (
    <div 
      className="login-background"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background Pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.03,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        pointerEvents: 'none'
      }} />

      {/* Logo Watermark */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        opacity: 0.02,
        pointerEvents: 'none',
        zIndex: 0
      }}>
        <SuperiorOneLogo 
          variant={theme.name}
          width={800}
          height={300}
        />
      </div>

      {/* Login Card */}
      <div style={{
        width: '100%',
        maxWidth: '480px',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Logo Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '40px'
        }}>
          <div className="login-logo-container" style={{
            marginBottom: '24px'
          }}>
            <SuperiorOneLogo 
              variant={theme.name}
              width={240}
              height={80}
            />
          </div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: theme.colors.textPrimary,
            margin: '0 0 8px 0',
            letterSpacing: '-0.5px'
          }}>
            Welcome Back
          </h1>
          <p style={{
            fontSize: '16px',
            color: theme.colors.textSecondary,
            margin: 0
          }}>
            Sign in to your Superior One account
          </p>
        </div>

        {/* Login Form Card */}
        <div className="login-card-glass">
          {/* Development Notice */}
          <div style={{
            background: `${theme.colors.info}15`,
            border: `1px solid ${theme.colors.info}40`,
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}>
            <Truck size={20} style={{ color: theme.colors.info, flexShrink: 0, marginTop: '2px' }} />
            <div style={{ width: '100%' }}>
              <p style={{
                fontSize: '14px',
                fontWeight: '600',
                color: theme.colors.info,
                margin: '0 0 8px 0'
              }}>
                Development Mode - Test Accounts
              </p>
              <div style={{
                fontSize: '13px',
                color: theme.colors.textSecondary,
                lineHeight: 1.6
              }}>
                <div style={{ marginBottom: '6px' }}>
                  <strong style={{ color: theme.colors.textPrimary }}>🚛 Carrier:</strong> carrier / admin
                </div>
                <div style={{ marginBottom: '6px' }}>
                  <strong style={{ color: theme.colors.textPrimary }}>📦 Customer:</strong> customer / admin
                </div>
                <div>
                  <strong style={{ color: theme.colors.textPrimary }}>👤 Admin:</strong> admin / admin
                </div>
              </div>
        </div>
      </div>

          {/* Error Message */}
            {error && (
            <div className="login-error-glass" style={{ marginBottom: '24px' }}>
              <AlertCircle size={20} style={{ flexShrink: 0 }} />
              <p style={{ margin: 0 }}>
                {error}
              </p>
            </div>
            )}

          {/* Login Form */}
          <form onSubmit={handleLogin}>
            {/* Email/Username Field */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: theme.colors.textPrimary,
                marginBottom: '8px'
              }}>
                Email or Username
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={20} style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: theme.colors.textSecondary,
                  pointerEvents: 'none'
                }} />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email or username"
                  required
                  className="login-input-glass"
                />
              </div>
            </div>

            {/* Password Field */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: theme.colors.textPrimary,
                marginBottom: '8px'
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={20} style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: theme.colors.textSecondary,
                  pointerEvents: 'none'
                }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="login-input-glass"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: theme.colors.textSecondary,
                    transition: 'color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = theme.colors.textPrimary}
                  onMouseLeave={(e) => e.currentTarget.style.color = theme.colors.textSecondary}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="login-button-glass"
              style={{
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? (
                <>
                  <Loader size={20} className="login-spinner" />
                  Signing in...
                </>
              ) : (
                <>
                  <Lock size={20} />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div style={{
            marginTop: '24px',
            paddingTop: '24px',
            borderTop: `1px solid ${theme.colors.border}`,
            textAlign: 'center'
          }}>
            <p style={{
              fontSize: '14px',
              color: theme.colors.textSecondary,
              margin: '0 0 12px 0'
            }}>
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/register')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: theme.colors.primary,
                  fontWeight: '600',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontSize: '14px'
                }}
              >
                Sign up
              </button>
            </p>
            <button
              onClick={() => alert('Password reset coming soon!')}
              style={{
                background: 'transparent',
                border: 'none',
                color: theme.colors.textTertiary,
                fontSize: '13px',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Forgot password?
            </button>
          </div>
            </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          marginTop: '32px'
        }}>
          <p style={{
            fontSize: '13px',
            color: theme.colors.textTertiary,
            margin: 0
          }}>
            © 2025 Superior One Logistics. All rights reserved.
          </p>
        </div>
      </div>

      {/* Add spinner animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default LoginPage