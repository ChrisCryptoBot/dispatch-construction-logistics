import React, { createContext, useContext, useState, useEffect } from 'react'
import type { Theme } from '../types/theme'
import { lightTheme } from '../themes/lightTheme'
import { darkTheme } from '../themes/darkTheme'


interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setThemeMode: (mode: 'light' | 'dark') => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme')
    return (saved as 'light' | 'dark') || 'dark'
  })

  useEffect(() => {
    localStorage.setItem('theme', currentTheme)
  }, [currentTheme])

  const toggleTheme = () => {
    setCurrentTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }

  const setThemeMode = (mode: 'light' | 'dark') => {
    setCurrentTheme(mode)
  }

  const theme = currentTheme === 'dark' ? darkTheme : lightTheme

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

