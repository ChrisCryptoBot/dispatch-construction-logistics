import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext-fixed'
import SuperiorOneLogo from '../components/ui/SuperiorOneLogo'
import { Truck, Mail, Lock, Eye, EyeOff, AlertCircle, Loader, ArrowRight, Shield } from 'lucide-react'

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

  const isDark = theme.name === 'dark'

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 24px',
        position: 'relative',
        overflow: 'hidden',
        background: isDark
          ? 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)'
          : 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 50%, #F1F5F9 100%)'
      }}
    >
      {/* Animated Background Grid */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: isDark
          ? `radial-gradient(circle at 2px 2px, rgba(148, 163, 184, 0.15) 1px, transparent 0)`
          : `radial-gradient(circle at 2px 2px, rgba(71, 85, 105, 0.08) 1px, transparent 0)`,
        backgroundSize: '48px 48px',
        opacity: 0.4,
        animation: 'gridFloat 20s ease-in-out infinite'
      }} />

      {/* Gradient Orbs */}
      <div style={{
        position: 'absolute',
        top: '-20%',
        right: '-10%',
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        background: isDark
          ? 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)'
          : 'radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%)',
        filter: 'blur(60px)',
        animation: 'float 15s ease-in-out infinite'
      }} />

      <div style={{
        position: 'absolute',
        bottom: '-20%',
        left: '-10%',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: isDark
          ? 'radial-gradient(circle, rgba(147, 51, 234, 0.12) 0%, transparent 70%)'
          : 'radial-gradient(circle, rgba(147, 51, 234, 0.06) 0%, transparent 70%)',
        filter: 'blur(60px)',
        animation: 'float 18s ease-in-out infinite reverse'
      }} />

      {/* Main Content Container */}
      <div style={{
        width: '100%',
        maxWidth: '520px',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Logo and Header Section */}
        <div style={{
          textAlign: 'center',
          marginBottom: '48px',
          animation: 'fadeInDown 0.6s ease-out'
        }}>
          <div style={{
            display: 'inline-block',
            marginBottom: '32px',
            padding: '16px',
            borderRadius: '20px',
            background: isDark
              ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.4) 100%)'
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.7) 100%)',
            backdropFilter: 'blur(20px)',
            border: isDark
              ? '1px solid rgba(148, 163, 184, 0.1)'
              : '1px solid rgba(226, 232, 240, 0.8)',
            boxShadow: isDark
              ? '0 8px 32px rgba(0, 0, 0, 0.3), 0 1px 3px rgba(0, 0, 0, 0.2)'
              : '0 8px 32px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)'
          }}>
            <SuperiorOneLogo
              variant={theme.name}
              width={220}
              height={74}
            />
          </div>

          <h1 style={{
            fontSize: 'clamp(28px, 5vw, 36px)',
            fontWeight: '700',
            background: isDark
              ? 'linear-gradient(135deg, #F1F5F9 0%, #94A3B8 100%)'
              : 'linear-gradient(135deg, #0F172A 0%, #475569 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            margin: '0 0 12px 0',
            letterSpacing: '-0.02em',
            lineHeight: 1.2
          }}>
            Welcome Back
          </h1>

          <p style={{
            fontSize: 'clamp(15px, 2.5vw, 17px)',
            color: theme.colors.textSecondary,
            margin: 0,
            fontWeight: '500',
            letterSpacing: '0.01em'
          }}>
            Sign in to access your Superior One account
          </p>
        </div>

        {/* Login Card */}
        <div style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.5) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.8) 100%)',
          backdropFilter: 'blur(24px) saturate(180%)',
          borderRadius: '24px',
          padding: 'clamp(28px, 5vw, 40px)',
          border: isDark
            ? '1px solid rgba(148, 163, 184, 0.12)'
            : '1px solid rgba(226, 232, 240, 0.8)',
          boxShadow: isDark
            ? '0 20px 60px rgba(0, 0, 0, 0.4), 0 8px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(148, 163, 184, 0.1)'
            : '0 20px 60px rgba(0, 0, 0, 0.12), 0 8px 16px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
          position: 'relative',
          animation: 'fadeInUp 0.6s ease-out 0.2s backwards'
        }}>
          {/* Development Notice */}
          <div style={{
            background: isDark
              ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(37, 99, 235, 0.08) 100%)'
              : 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(37, 99, 235, 0.05) 100%)',
            border: isDark
              ? '1px solid rgba(59, 130, 246, 0.25)'
              : '1px solid rgba(59, 130, 246, 0.2)',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '32px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '16px',
            transition: 'all 0.3s ease'
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: isDark
                ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.15) 100%)'
                : 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.1) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              border: isDark
                ? '1px solid rgba(59, 130, 246, 0.3)'
                : '1px solid rgba(59, 130, 246, 0.2)'
            }}>
              <Shield size={22} style={{ color: theme.colors.info, strokeWidth: 2.5 }} />
            </div>

            <div style={{ flex: 1 }}>
              <p style={{
                fontSize: '15px',
                fontWeight: '700',
                color: theme.colors.info,
                margin: '0 0 12px 0',
                letterSpacing: '0.01em'
              }}>
                Development Environment
              </p>
              <div style={{
                fontSize: '14px',
                color: theme.colors.textSecondary,
                lineHeight: 1.7,
                display: 'grid',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: theme.colors.info,
                    flexShrink: 0
                  }} />
                  <span><strong style={{ color: theme.colors.textPrimary, fontWeight: '600' }}>Carrier:</strong> carrier / admin</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: theme.colors.info,
                    flexShrink: 0
                  }} />
                  <span><strong style={{ color: theme.colors.textPrimary, fontWeight: '600' }}>Customer:</strong> customer / admin</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: theme.colors.info,
                    flexShrink: 0
                  }} />
                  <span><strong style={{ color: theme.colors.textPrimary, fontWeight: '600' }}>Admin:</strong> admin / admin</span>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              background: isDark
                ? 'linear-gradient(135deg, rgba(220, 38, 38, 0.15) 0%, rgba(185, 28, 28, 0.1) 100%)'
                : 'linear-gradient(135deg, rgba(254, 226, 226, 0.9) 0%, rgba(252, 165, 165, 0.6) 100%)',
              border: isDark
                ? '1px solid rgba(220, 38, 38, 0.3)'
                : '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '14px',
              padding: '16px 18px',
              marginBottom: '28px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              animation: 'shake 0.4s ease-in-out'
            }}>
              <AlertCircle
                size={20}
                style={{
                  color: isDark ? '#FCA5A5' : '#DC2626',
                  flexShrink: 0,
                  strokeWidth: 2.5
                }}
              />
              <p style={{
                margin: 0,
                fontSize: '14px',
                fontWeight: '600',
                color: isDark ? '#FCA5A5' : '#DC2626',
                letterSpacing: '0.01em'
              }}>
                {error}
              </p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin}>
            {/* Email Field */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '700',
                color: theme.colors.textPrimary,
                marginBottom: '10px',
                letterSpacing: '0.01em'
              }}>
                Email or Username
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: '18px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '20px',
                  height: '20px',
                  pointerEvents: 'none',
                  zIndex: 1
                }}>
                  <Mail
                    size={20}
                    style={{
                      color: theme.colors.textSecondary,
                      strokeWidth: 2
                    }}
                  />
                </div>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email or username"
                  required
                  style={{
                    width: '100%',
                    height: '56px',
                    padding: '0 20px 0 52px',
                    fontSize: '15px',
                    fontWeight: '500',
                    color: theme.colors.textPrimary,
                    background: isDark
                      ? 'rgba(15, 23, 42, 0.4)'
                      : 'rgba(255, 255, 255, 0.7)',
                    border: isDark
                      ? '1.5px solid rgba(71, 85, 105, 0.3)'
                      : '1.5px solid rgba(226, 232, 240, 0.8)',
                    borderRadius: '14px',
                    outline: 'none',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    backdropFilter: 'blur(8px)',
                    boxShadow: isDark
                      ? '0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 2px rgba(0, 0, 0, 0.3)'
                      : '0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 2px rgba(0, 0, 0, 0.02)'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = theme.colors.primary
                    e.target.style.background = isDark ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255, 255, 255, 0.95)'
                    e.target.style.boxShadow = isDark
                      ? `0 0 0 4px rgba(59, 130, 246, 0.12), 0 4px 12px rgba(59, 130, 246, 0.2)`
                      : `0 0 0 4px rgba(59, 130, 246, 0.08), 0 4px 12px rgba(59, 130, 246, 0.15)`
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = isDark ? 'rgba(71, 85, 105, 0.3)' : 'rgba(226, 232, 240, 0.8)'
                    e.target.style.background = isDark ? 'rgba(15, 23, 42, 0.4)' : 'rgba(255, 255, 255, 0.7)'
                    e.target.style.boxShadow = isDark
                      ? '0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 2px rgba(0, 0, 0, 0.3)'
                      : '0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 2px rgba(0, 0, 0, 0.02)'
                  }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div style={{ marginBottom: '32px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '700',
                color: theme.colors.textPrimary,
                marginBottom: '10px',
                letterSpacing: '0.01em'
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: '18px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '20px',
                  height: '20px',
                  pointerEvents: 'none',
                  zIndex: 1
                }}>
                  <Lock
                    size={20}
                    style={{
                      color: theme.colors.textSecondary,
                      strokeWidth: 2
                    }}
                  />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  style={{
                    width: '100%',
                    height: '56px',
                    padding: '0 52px',
                    fontSize: '15px',
                    fontWeight: '500',
                    color: theme.colors.textPrimary,
                    background: isDark
                      ? 'rgba(15, 23, 42, 0.4)'
                      : 'rgba(255, 255, 255, 0.7)',
                    border: isDark
                      ? '1.5px solid rgba(71, 85, 105, 0.3)'
                      : '1.5px solid rgba(226, 232, 240, 0.8)',
                    borderRadius: '14px',
                    outline: 'none',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    backdropFilter: 'blur(8px)',
                    boxShadow: isDark
                      ? '0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 2px rgba(0, 0, 0, 0.3)'
                      : '0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 2px rgba(0, 0, 0, 0.02)'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = theme.colors.primary
                    e.target.style.background = isDark ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255, 255, 255, 0.95)'
                    e.target.style.boxShadow = isDark
                      ? `0 0 0 4px rgba(59, 130, 246, 0.12), 0 4px 12px rgba(59, 130, 246, 0.2)`
                      : `0 0 0 4px rgba(59, 130, 246, 0.08), 0 4px 12px rgba(59, 130, 246, 0.15)`
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = isDark ? 'rgba(71, 85, 105, 0.3)' : 'rgba(226, 232, 240, 0.8)'
                    e.target.style.background = isDark ? 'rgba(15, 23, 42, 0.4)' : 'rgba(255, 255, 255, 0.7)'
                    e.target.style.boxShadow = isDark
                      ? '0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 2px rgba(0, 0, 0, 0.3)'
                      : '0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 2px rgba(0, 0, 0, 0.02)'
                  }}
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
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: theme.colors.textSecondary,
                    transition: 'all 0.2s ease',
                    borderRadius: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = theme.colors.textPrimary
                    e.currentTarget.style.background = isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(71, 85, 105, 0.08)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = theme.colors.textSecondary
                    e.currentTarget.style.background = 'transparent'
                  }}
                >
                  {showPassword ? <EyeOff size={20} strokeWidth={2} /> : <Eye size={20} strokeWidth={2} />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                height: '58px',
                fontSize: '16px',
                fontWeight: '700',
                color: '#FFFFFF',
                background: loading
                  ? isDark
                    ? 'linear-gradient(135deg, rgba(71, 85, 105, 0.6) 0%, rgba(51, 65, 85, 0.5) 100%)'
                    : 'linear-gradient(135deg, rgba(148, 163, 184, 0.6) 0%, rgba(100, 116, 139, 0.5) 100%)'
                  : 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                border: 'none',
                borderRadius: '14px',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: loading
                  ? 'none'
                  : isDark
                    ? '0 8px 24px rgba(59, 130, 246, 0.3), 0 2px 8px rgba(59, 130, 246, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                    : '0 8px 24px rgba(59, 130, 246, 0.25), 0 2px 8px rgba(59, 130, 246, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                letterSpacing: '0.02em',
                opacity: loading ? 0.6 : 1,
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = isDark
                    ? '0 12px 32px rgba(59, 130, 246, 0.4), 0 4px 12px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
                    : '0 12px 32px rgba(59, 130, 246, 0.35), 0 4px 12px rgba(59, 130, 246, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = isDark
                    ? '0 8px 24px rgba(59, 130, 246, 0.3), 0 2px 8px rgba(59, 130, 246, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                    : '0 8px 24px rgba(59, 130, 246, 0.25), 0 2px 8px rgba(59, 130, 246, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                }
              }}
              onMouseDown={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(0) scale(0.98)'
                }
              }}
              onMouseUp={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-2px) scale(1)'
                }
              }}
            >
              {loading ? (
                <>
                  <Loader size={22} style={{ animation: 'spin 1s linear infinite' }} strokeWidth={2.5} />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <Lock size={22} strokeWidth={2.5} />
                  <span>Sign In</span>
                  <ArrowRight size={20} strokeWidth={2.5} style={{ marginLeft: '-4px' }} />
                </>
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div style={{
            marginTop: '32px',
            paddingTop: '28px',
            borderTop: isDark
              ? '1px solid rgba(71, 85, 105, 0.2)'
              : '1px solid rgba(226, 232, 240, 0.6)',
            textAlign: 'center'
          }}>
            <p style={{
              fontSize: '14px',
              color: theme.colors.textSecondary,
              margin: '0 0 16px 0',
              fontWeight: '500'
            }}>
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/register')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: theme.colors.primary,
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontSize: '14px',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  transition: 'all 0.2s ease',
                  letterSpacing: '0.01em'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = isDark
                    ? 'rgba(59, 130, 246, 0.12)'
                    : 'rgba(59, 130, 246, 0.08)'
                  e.currentTarget.style.textDecoration = 'none'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.textDecoration = 'none'
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
                fontWeight: '600',
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: '6px',
                transition: 'all 0.2s ease',
                letterSpacing: '0.01em'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = theme.colors.textSecondary
                e.currentTarget.style.background = isDark
                  ? 'rgba(71, 85, 105, 0.1)'
                  : 'rgba(100, 116, 139, 0.06)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = theme.colors.textTertiary
                e.currentTarget.style.background = 'transparent'
              }}
            >
              Forgot password?
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          marginTop: '36px',
          animation: 'fadeIn 0.6s ease-out 0.4s backwards'
        }}>
          <p style={{
            fontSize: '13px',
            color: theme.colors.textTertiary,
            margin: 0,
            fontWeight: '600',
            letterSpacing: '0.02em'
          }}>
            © 2025 Superior One Logistics. All rights reserved.
          </p>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -30px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        @keyframes gridFloat {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          10%, 30%, 50%, 70%, 90% {
            transform: translateX(-4px);
          }
          20%, 40%, 60%, 80% {
            transform: translateX(4px);
          }
        }

        input::placeholder {
          color: ${isDark ? 'rgba(148, 163, 184, 0.5)' : 'rgba(100, 116, 139, 0.5)'};
          font-weight: 500;
        }

        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px ${isDark ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255, 255, 255, 0.95)'} inset !important;
          -webkit-text-fill-color: ${theme.colors.textPrimary} !important;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>
    </div>
  )
}

export default LoginPage
