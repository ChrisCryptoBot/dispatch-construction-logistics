import React from 'react'
import { useAnimatedCounter, useAnimatedCurrency, useAnimatedPercentage } from '../../hooks/useAnimatedCounter'

interface AnimatedCounterProps {
  value: number
  format?: 'number' | 'currency' | 'percentage'
  duration?: number
  delay?: number
  prefix?: string
  suffix?: string
  className?: string
  style?: React.CSSProperties
}

/**
 * Animated Counter Component
 * Smoothly counts up to target value with spring easing
 * Perfect for dashboard metrics
 */
const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  format = 'number',
  duration = 1000,
  delay = 0,
  prefix = '',
  suffix = '',
  className = '',
  style = {}
}) => {
  let displayValue: string | number

  switch (format) {
    case 'currency':
      displayValue = useAnimatedCurrency(value, duration, delay)
      break
    case 'percentage':
      displayValue = useAnimatedPercentage(value, duration, delay)
      break
    default:
      displayValue = useAnimatedCounter(value, duration, delay).toLocaleString()
  }

  return (
    <span className={className} style={style}>
      {prefix}{displayValue}{suffix}
    </span>
  )
}

export default AnimatedCounter


