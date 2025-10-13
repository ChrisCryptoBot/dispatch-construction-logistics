import { useEffect, useState } from 'react'

/**
 * Hook for animating number values with spring easing
 * Perfect for dashboard metrics and counters
 */
export const useAnimatedCounter = (
  targetValue: number,
  duration: number = 1000,
  delay: number = 0
): number => {
  const [currentValue, setCurrentValue] = useState(0)

  useEffect(() => {
    const startTime = Date.now() + delay
    let animationFrame: number

    const animate = () => {
      const now = Date.now()
      const elapsed = Math.max(0, now - startTime)
      const progress = Math.min(elapsed / duration, 1)

      // Spring easing function (ease-out-cubic)
      const eased = 1 - Math.pow(1 - progress, 3)
      const newValue = Math.floor(eased * targetValue)

      setCurrentValue(newValue)

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      } else {
        setCurrentValue(targetValue) // Ensure we hit the exact target
      }
    }

    animationFrame = requestAnimationFrame(animate)

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [targetValue, duration, delay])

  return currentValue
}

/**
 * Hook for animating currency values
 */
export const useAnimatedCurrency = (
  targetValue: number,
  duration: number = 1000,
  delay: number = 0
): string => {
  const animatedValue = useAnimatedCounter(targetValue, duration, delay)
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(animatedValue)
}

/**
 * Hook for animating percentage values
 */
export const useAnimatedPercentage = (
  targetValue: number,
  duration: number = 1000,
  delay: number = 0
): string => {
  const animatedValue = useAnimatedCounter(targetValue * 100, duration, delay)
  return `${(animatedValue / 100).toFixed(1)}%`
}


