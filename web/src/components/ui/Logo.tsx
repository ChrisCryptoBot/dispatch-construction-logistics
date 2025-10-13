import React from 'react'
import { useTheme } from '../../contexts/ThemeContext'

interface LogoProps {
  variant?: 'full' | 'icon' | 'gray'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeClasses = {
  sm: 'h-6',
  md: 'h-10',
  lg: 'h-14',
  xl: 'h-20'
}

export const Logo = ({ 
  variant = 'full', 
  size = 'md',
  className = '' 
}: LogoProps) => {
  const { theme } = useTheme()
  
  // Determine which logo to use
  let logoSrc = '/assets/logos/LOGO_LIGHTMODE.png'
  
  if (variant === 'gray') {
    logoSrc = '/assets/logos/LOGO_GRAY.PNG'
  } else if (theme.name === 'dark') {
    logoSrc = '/assets/logos/LOGO_DARKMODE.png'
  }
  
  return (
    <img
      src={logoSrc}
      alt="Superior One Logistics"
      className={`${sizeClasses[size]} w-auto object-contain ${className}`}
      loading="lazy"
    />
  )
}

export default Logo

