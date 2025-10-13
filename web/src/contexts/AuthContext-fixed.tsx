import React, { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'

// Define types inline to avoid import issues
interface User {
  id: string
  orgId: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  role: string
  active: boolean
  emailVerified: boolean
  createdAt: string
  updatedAt: string
}

interface Organization {
  id: string
  name: string
  type: 'SHIPPER' | 'CARRIER'
  mcNumber?: string
  dotNumber?: string
  ein?: string
  email?: string
  phone?: string
  address?: any
  metadata?: any
  verified: boolean
  active: boolean
  createdAt: string
  updatedAt: string
}

interface AuthState {
  user: User | null
  organization: Organization | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthState & {
  login: (email: string, password: string) => Promise<void>
  register: (data: any) => Promise<void>
  logout: () => void
}>({} as any)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  console.log('🚀 Fixed AuthProvider rendering...')
  
  const [user, setUser] = useState<User | null>(null)
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    console.log('🔄 AuthProvider useEffect running...')
    // Load user and organization from localStorage on mount
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    const storedOrg = localStorage.getItem('organization')

    console.log('📦 Checking localStorage:')
    console.log('  - Token:', storedToken ? 'EXISTS' : 'MISSING')
    console.log('  - User:', storedUser ? 'EXISTS' : 'MISSING')  
    console.log('  - Org:', storedOrg ? 'EXISTS' : 'MISSING')

    if (storedToken && storedUser && storedOrg) {
      try {
        const parsedUser = JSON.parse(storedUser)
        const parsedOrg = JSON.parse(storedOrg)
        
        setToken(storedToken)
        setUser(parsedUser)
        setOrganization(parsedOrg)
        
        console.log('✅ Loaded auth from localStorage')
        console.log('👤 User:', parsedUser.firstName, parsedUser.lastName)
        console.log('🏢 Org:', parsedOrg.name, '(', parsedOrg.type, ')')
      } catch (error) {
        console.error('❌ Error parsing stored auth data:', error)
        // Clear invalid data
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('organization')
      }
    } else {
      console.log('⚠️ No complete auth data in localStorage - waiting for manual login')
    }
    
    setIsLoading(false)
    console.log('✅ AuthProvider initialized')
  }, [])

  const login = async (email: string, password: string) => {
    // Development bypass: admin/admin credentials
    if (email === 'admin' && password === 'admin') {
      const mockToken = 'dev-admin-token-' + Date.now()
      const mockUser: User = {
        id: 'admin-user',
        orgId: 'admin-org',
        email: 'admin@superioronelogistics.com',
        firstName: 'Admin',
        lastName: 'User',
        phone: '903-388-5470',
        role: 'SUPER_ADMIN', // Full access to carrier AND customer dashboards
        active: true,
        emailVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      const mockOrg: Organization = {
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
      setToken(mockToken)
      setUser(mockUser)
      setOrganization(mockOrg)
      localStorage.setItem('token', mockToken)
      localStorage.setItem('user', JSON.stringify(mockUser))
      localStorage.setItem('organization', JSON.stringify(mockOrg))
      console.log('✅ Admin login successful!')
      return
    }

    // Normal API login for other credentials
    try {
      const { token, user, organization } = await authAPI.login({ email, password })
      setToken(token)
      setUser(user)
      setOrganization(organization)
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      localStorage.setItem('organization', JSON.stringify(organization))
      console.log('✅ Login successful, data stored')
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const register = async (formData: any) => {
    try {
      const { token, user, organization } = await authAPI.register(formData)
      setToken(token)
      setUser(user)
      setOrganization(organization)
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      localStorage.setItem('organization', JSON.stringify(organization))
      console.log('✅ Registration successful, data stored')
    } catch (error) {
      console.error('Register error:', error)
      throw error
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    setOrganization(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('organization')
    console.log('✅ Logged out, data cleared')
  }

  const value = {
    user,
    organization,
    token,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated: !!token
  }

  console.log('🚀 Fixed AuthProvider value:', value)

  return (
    <AuthContext.Provider value={value}>
      {isLoading ? (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          fontFamily: 'Arial, sans-serif'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>🚀</div>
            <div>Loading DISPATCH SaaS...</div>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
