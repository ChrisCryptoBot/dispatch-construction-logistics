import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext-fixed'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoading, token } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0f172a'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '3px solid #374151',
          borderTop: '3px solid #dc2626',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    )
  }

  if (!token) {
    return <Navigate to="/splash" state={{ from: location }} replace />
  }

  return <>{children}</>
}

export default ProtectedRoute

