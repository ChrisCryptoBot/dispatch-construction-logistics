import React from 'react'

interface SkeletonLoaderProps {
  width?: string | number
  height?: string | number
  borderRadius?: string | number
  count?: number
  className?: string
  style?: React.CSSProperties
}

/**
 * Skeleton Loader Component with Shimmer Effect
 * Use during data loading for better perceived performance
 */
const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = '20px',
  borderRadius = '8px',
  count = 1,
  className = '',
  style = {}
}) => {
  const skeletons = Array.from({ length: count }, (_, i) => i)

  return (
    <>
      {skeletons.map((index) => (
        <div
          key={index}
          className={`skeleton ${className}`}
          style={{
            width,
            height,
            borderRadius,
            marginBottom: count > 1 ? '12px' : 0,
            ...style
          }}
        />
      ))}
    </>
  )
}

/**
 * Skeleton Card - Full card skeleton
 */
export const SkeletonCard: React.FC = () => {
  return (
    <div className="glass-card" style={{ padding: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <SkeletonLoader width="40px" height="40px" borderRadius="10px" />
        <div style={{ flex: 1 }}>
          <SkeletonLoader width="120px" height="24px" style={{ marginBottom: '8px' }} />
          <SkeletonLoader width="200px" height="16px" />
        </div>
      </div>
      <SkeletonLoader count={3} height="16px" />
    </div>
  )
}

/**
 * Skeleton Table Row
 */
export const SkeletonTableRow: React.FC<{ columns?: number }> = ({ columns = 5 }) => {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} style={{ padding: '12px' }}>
          <SkeletonLoader height="16px" />
        </td>
      ))}
    </tr>
  )
}

/**
 * Skeleton Dashboard Stats Grid
 */
export const SkeletonStatsGrid: React.FC = () => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
      {[1, 2, 3, 4].map((i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

export default SkeletonLoader


