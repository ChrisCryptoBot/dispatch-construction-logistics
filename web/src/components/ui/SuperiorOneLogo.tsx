import * as React from 'react'
import { useTheme } from '../../contexts/ThemeContext'

type Props = {
  variant?: 'auto' | 'dark' | 'light' // 'dark' = dark-on-light, 'light' = white-on-dark
  className?: string
  alt?: string
  height?: number
  width?: number
}

export default function SuperiorOneLogo({
  variant = 'auto',
  className,
  alt = 'Superior One Logistics',
  height = 60,
  width
}: Props) {
  const theme = useTheme()
  const [isDark, setIsDark] = React.useState(false)

  React.useEffect(() => {
    if (variant !== 'auto') return
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)')
    const update = () => setIsDark(Boolean(mq?.matches))
    update()
    mq?.addEventListener?.('change', update)
    return () => mq?.removeEventListener?.('change', update)
  }, [variant])

  // Determine colors based on variant and theme
  const isLightBackground = variant === 'dark' || (variant === 'auto' && !isDark)
  const logoColor = isLightBackground ? '#b91c1c' : '#ffffff' // Red for light bg, white for dark bg
  const textColor = isLightBackground ? '#1a1a1a' : '#ffffff' // Dark for light bg, white for dark bg
  const grayColor = isLightBackground ? '#6b7280' : '#c0c0c0' // Gray for light bg, light gray for dark bg

  return (
    <svg
      width={width || height * 4}
      height={height}
      viewBox="0 0 400 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'block' }}
    >
      {/* SUPERIOR ONE Text - Centered and Larger */}
      <text
        x="200"
        y="40"
        fill={logoColor}
        fontSize="42"
        fontWeight="900"
        fontStyle="italic"
        fontFamily="Arial, sans-serif"
        letterSpacing="-1"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        SUPERIOR ONE
      </text>

      {/* Speed lines - More prominent */}
      <g opacity="0.7">
        <line x1="50" y1="30" x2="80" y2="30" stroke={grayColor} strokeWidth="2" />
        <line x1="50" y1="35" x2="75" y2="35" stroke={grayColor} strokeWidth="2" />
        <line x1="50" y1="40" x2="85" y2="40" stroke={grayColor} strokeWidth="2" />
        <line x1="50" y1="45" x2="70" y2="45" stroke={grayColor} strokeWidth="2" />
        <line x1="50" y1="50" x2="90" y2="50" stroke={grayColor} strokeWidth="2" />
      </g>
      
      <g opacity="0.7">
        <line x1="350" y1="30" x2="320" y2="30" stroke={grayColor} strokeWidth="2" />
        <line x1="350" y1="35" x2="325" y2="35" stroke={grayColor} strokeWidth="2" />
        <line x1="350" y1="40" x2="315" y2="40" stroke={grayColor} strokeWidth="2" />
        <line x1="350" y1="45" x2="330" y2="45" stroke={grayColor} strokeWidth="2" />
        <line x1="350" y1="50" x2="310" y2="50" stroke={grayColor} strokeWidth="2" />
      </g>
    </svg>
  )
}
