import React, { type ReactNode } from 'react'
import S1Header from './S1Header'
import S1Sidebar from './S1Sidebar'
import { useTheme } from '../../../contexts/ThemeContext'

interface S1LayoutProps {
  children: ReactNode
}

const S1LayoutConstruction: React.FC<S1LayoutProps> = ({ children }) => {
  const { theme } = useTheme()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false)

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: theme.colors.background,
        color: theme.colors.textPrimary,
      }}
    >
      {/* Sidebar */}
      <S1Sidebar 
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          marginLeft: isSidebarCollapsed ? '80px' : '280px',
          transition: 'margin-left 0.3s ease',
        }}
      >
        {/* Header */}
        <S1Header />

        {/* Page Content */}
        <main
          style={{
            flex: 1,
            padding: '32px',
            overflowY: 'auto',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  )
}

export default S1LayoutConstruction

