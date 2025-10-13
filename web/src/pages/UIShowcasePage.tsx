import React, { useState } from 'react'
import PageContainer from '../components/PageContainer'
import EnhancedCard from '../components/enhanced/EnhancedCard'
import EnhancedButton from '../components/enhanced/EnhancedButton'
import AnimatedCounter from '../components/enhanced/AnimatedCounter'
import ProgressBar from '../components/enhanced/ProgressBar'
import Tooltip from '../components/enhanced/Tooltip'
import Badge from '../components/enhanced/Badge'
import BottomSheet from '../components/enhanced/BottomSheet'
import SkeletonLoader, { SkeletonCard, SkeletonStatsGrid } from '../components/enhanced/SkeletonLoader'
import { Package, TrendingUp, Truck, DollarSign, Info, Zap } from 'lucide-react'

/**
 * UI Showcase Page
 * Demonstrates all enhanced components and animations
 * Access at: http://localhost:5173/ui-showcase
 */
const UIShowcasePage = () => {
  const [loading, setLoading] = useState(false)
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false)

  const simulateLoading = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 3000)
  }

  return (
    <PageContainer>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 20px' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h1 className="text-fluid-3xl" style={{
            fontWeight: '700',
            background: 'linear-gradient(135deg, #C53030 0%, #f87171 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '16px'
          }}>
            Enhanced UI Components
          </h1>
          <p className="text-fluid-lg" style={{
            color: 'var(--text/secondary)',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Modern glassmorphism, spring animations, and data visualization components
          </p>
        </div>

        {/* Section 1: Glass Cards */}
        <section style={{ marginBottom: '60px' }}>
          <h2 className="text-fluid-2xl" style={{
            fontWeight: '600',
            color: 'var(--text/primary)',
            marginBottom: '24px'
          }}>
            1. Enhanced Cards <Badge variant="success" size="sm">New</Badge>
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            <EnhancedCard
              variant="glass"
              title="Glass Effect"
              subtitle="Glassmorphism with blur"
              icon={<Package color="#C53030" size={20} />}
              hover
              animateOnMount
            >
              <p style={{ color: 'var(--text/secondary)', margin: 0 }}>
                Multi-layer blur with spring animations on hover. Try hovering over this card!
              </p>
            </EnhancedCard>

            <EnhancedCard
              variant="solid"
              title="Solid Variant"
              subtitle="Traditional style"
              icon={<Truck color="#10b981" size={20} />}
              hover
            >
              <p style={{ color: 'var(--text/secondary)', margin: 0 }}>
                Solid background with smooth lift animation.
              </p>
            </EnhancedCard>

            <EnhancedCard
              variant="gradient"
              title="Duo-tone Effect"
              subtitle="Color overlay blend"
              icon={<DollarSign color="#f59e0b" size={20} />}
              hover
            >
              <p style={{ color: 'var(--text/secondary)', margin: 0 }}>
                Gradient overlay with duo-tone color mapping.
              </p>
            </EnhancedCard>
          </div>
        </section>

        {/* Section 2: Animated Counters */}
        <section style={{ marginBottom: '60px' }}>
          <h2 className="text-fluid-2xl" style={{
            fontWeight: '600',
            color: 'var(--text/primary)',
            marginBottom: '24px'
          }}>
            2. Animated Counters <Badge variant="info" size="sm">Live Data</Badge>
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            <EnhancedCard variant="glass" animateOnMount={false}>
              <div style={{ textAlign: 'center' }}>
                <TrendingUp color="#10b981" size={32} style={{ margin: '0 auto 12px' }} />
                <div className="text-fluid-3xl" style={{
                  fontWeight: '700',
                  color: 'var(--text/primary)',
                  marginBottom: '8px'
                }}>
                  <AnimatedCounter value={1247} duration={1500} />
                </div>
                <p style={{ color: 'var(--text/secondary)', margin: 0, fontSize: '14px' }}>
                  Total Loads
                </p>
              </div>
            </EnhancedCard>

            <EnhancedCard variant="glass" animateOnMount={false}>
              <div style={{ textAlign: 'center' }}>
                <DollarSign color="#C53030" size={32} style={{ margin: '0 auto 12px' }} />
                <div className="text-fluid-3xl" style={{
                  fontWeight: '700',
                  color: 'var(--text/primary)',
                  marginBottom: '8px'
                }}>
                  <AnimatedCounter value={428950} format="currency" duration={1800} />
                </div>
                <p style={{ color: 'var(--text/secondary)', margin: 0, fontSize: '14px' }}>
                  Revenue This Month
                </p>
              </div>
            </EnhancedCard>

            <EnhancedCard variant="glass" animateOnMount={false}>
              <div style={{ textAlign: 'center' }}>
                <Package color="#3b82f6" size={32} style={{ margin: '0 auto 12px' }} />
                <div className="text-fluid-3xl" style={{
                  fontWeight: '700',
                  color: 'var(--text/primary)',
                  marginBottom: '8px'
                }}>
                  <AnimatedCounter value={0.978} format="percentage" duration={1600} />
                </div>
                <p style={{ color: 'var(--text/secondary)', margin: 0, fontSize: '14px' }}>
                  On-Time Delivery
                </p>
              </div>
            </EnhancedCard>
          </div>
        </section>

        {/* Section 3: Buttons */}
        <section style={{ marginBottom: '60px' }}>
          <h2 className="text-fluid-2xl" style={{
            fontWeight: '600',
            color: 'var(--text/primary)',
            marginBottom: '24px'
          }}>
            3. Enhanced Buttons <Badge variant="warning" size="sm">Interactive</Badge>
          </h2>

          <EnhancedCard variant="glass">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
              <EnhancedButton variant="primary" icon={<Zap size={16} />}>
                Primary Action
              </EnhancedButton>
              
              <EnhancedButton variant="secondary">
                Secondary
              </EnhancedButton>
              
              <EnhancedButton variant="glass">
                Glass Style
              </EnhancedButton>
              
              <EnhancedButton variant="ghost">
                Ghost Button
              </EnhancedButton>
              
              <EnhancedButton variant="primary" loading>
                Loading...
              </EnhancedButton>
              
              <EnhancedButton variant="primary" disabled>
                Disabled
              </EnhancedButton>
            </div>
            
            <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border/subtle)' }}>
              <p style={{ color: 'var(--text/tertiary)', fontSize: '13px', marginBottom: '12px' }}>
                Button Sizes:
              </p>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <EnhancedButton variant="primary" size="sm">Small</EnhancedButton>
                <EnhancedButton variant="primary" size="md">Medium</EnhancedButton>
                <EnhancedButton variant="primary" size="lg">Large</EnhancedButton>
              </div>
            </div>
          </EnhancedCard>
        </section>

        {/* Section 4: Progress Bars */}
        <section style={{ marginBottom: '60px' }}>
          <h2 className="text-fluid-2xl" style={{
            fontWeight: '600',
            color: 'var(--text/primary)',
            marginBottom: '24px'
          }}>
            4. Progress Indicators
          </h2>

          <EnhancedCard variant="glass">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <p style={{ color: 'var(--text/secondary)', fontSize: '14px', marginBottom: '8px' }}>
                  Primary Progress (75%)
                </p>
                <ProgressBar value={75} variant="primary" showLabel />
              </div>

              <div>
                <p style={{ color: 'var(--text/secondary)', fontSize: '14px', marginBottom: '8px' }}>
                  Success Progress (90%)
                </p>
                <ProgressBar value={90} variant="success" showLabel />
              </div>

              <div>
                <p style={{ color: 'var(--text/secondary)', fontSize: '14px', marginBottom: '8px' }}>
                  Warning Progress (45%)
                </p>
                <ProgressBar value={45} variant="warning" showLabel striped />
              </div>

              <div>
                <p style={{ color: 'var(--text/secondary)', fontSize: '14px', marginBottom: '8px' }}>
                  Different Sizes
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <ProgressBar value={60} size="sm" variant="primary" />
                  <ProgressBar value={70} size="md" variant="success" />
                  <ProgressBar value={80} size="lg" variant="danger" />
                </div>
              </div>
            </div>
          </EnhancedCard>
        </section>

        {/* Section 5: Badges & Tooltips */}
        <section style={{ marginBottom: '60px' }}>
          <h2 className="text-fluid-2xl" style={{
            fontWeight: '600',
            color: 'var(--text/primary)',
            marginBottom: '24px'
          }}>
            5. Badges & Tooltips
          </h2>

          <EnhancedCard variant="glass">
            <div style={{ marginBottom: '32px' }}>
              <p style={{ color: 'var(--text/secondary)', fontSize: '14px', marginBottom: '16px' }}>
                Badges:
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                <Badge variant="primary">Primary</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="danger">Danger</Badge>
                <Badge variant="info">Info</Badge>
                <Badge variant="neutral">Neutral</Badge>
                <Badge variant="primary" pulse>Live Updates</Badge>
                <Badge variant="success" dot>8 Active</Badge>
              </div>
            </div>

            <div>
              <p style={{ color: 'var(--text/secondary)', fontSize: '14px', marginBottom: '16px' }}>
                Tooltips (hover over the icons):
              </p>
              <div style={{ display: 'flex', gap: '24px' }}>
                <Tooltip content="This is a top tooltip" position="top">
                  <div className="scale-on-hover" style={{
                    width: '48px',
                    height: '48px',
                    background: 'rgba(197, 48, 48, 0.15)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}>
                    <Info color="#C53030" size={24} />
                  </div>
                </Tooltip>

                <Tooltip content="Bottom tooltip with glass effect" position="bottom">
                  <div className="scale-on-hover" style={{
                    width: '48px',
                    height: '48px',
                    background: 'rgba(16, 185, 129, 0.15)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}>
                    <Package color="#10b981" size={24} />
                  </div>
                </Tooltip>

                <Tooltip content="Left side tooltip" position="left">
                  <div className="scale-on-hover" style={{
                    width: '48px',
                    height: '48px',
                    background: 'rgba(59, 130, 246, 0.15)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}>
                    <Truck color="#3b82f6" size={24} />
                  </div>
                </Tooltip>
              </div>
            </div>
          </EnhancedCard>
        </section>

        {/* Section 6: Loading States */}
        <section style={{ marginBottom: '60px' }}>
          <h2 className="text-fluid-2xl" style={{
            fontWeight: '600',
            color: 'var(--text/primary)',
            marginBottom: '24px'
          }}>
            6. Loading States
          </h2>

          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
            <EnhancedButton 
              variant="primary" 
              onClick={simulateLoading}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Simulate Loading'}
            </EnhancedButton>
          </div>

          {loading ? (
            <SkeletonStatsGrid />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              {[
                { title: 'Active Loads', value: 47, icon: <Package color="#C53030" size={24} /> },
                { title: 'In Transit', value: 23, icon: <Truck color="#10b981" size={24} /> },
                { title: 'Delivered Today', value: 12, icon: <TrendingUp color="#3b82f6" size={24} /> },
                { title: 'Revenue', value: '$42,850', icon: <DollarSign color="#f59e0b" size={24} /> }
              ].map((stat, i) => (
                <EnhancedCard key={i} variant="glass" hover>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                      width: '56px',
                      height: '56px',
                      background: 'rgba(197, 48, 48, 0.15)',
                      borderRadius: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {stat.icon}
                    </div>
                    <div>
                      <p style={{ color: 'var(--text/tertiary)', fontSize: '13px', margin: 0 }}>
                        {stat.title}
                      </p>
                      <p className="text-fluid-2xl" style={{
                        fontWeight: '700',
                        color: 'var(--text/primary)',
                        margin: '4px 0 0 0'
                      }}>
                        {stat.value}
                      </p>
                    </div>
                  </div>
                </EnhancedCard>
              ))}
            </div>
          )}
        </section>

        {/* Section 7: Mobile Components */}
        <section style={{ marginBottom: '60px' }}>
          <h2 className="text-fluid-2xl" style={{
            fontWeight: '600',
            color: 'var(--text/primary)',
            marginBottom: '24px'
          }}>
            7. Mobile Optimizations <Badge variant="info" size="sm">Touch</Badge>
          </h2>

          <EnhancedCard variant="glass">
            <p style={{ color: 'var(--text/secondary)', marginBottom: '16px' }}>
              Test the bottom sheet component (optimized for mobile):
            </p>
            <EnhancedButton 
              variant="primary" 
              onClick={() => setBottomSheetOpen(true)}
            >
              Open Bottom Sheet
            </EnhancedButton>

            <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border/subtle)' }}>
              <p style={{ color: 'var(--text/tertiary)', fontSize: '13px' }}>
                Mobile features include: Bottom sheets, swipe gestures, touch-friendly targets (48px), safe area insets, pull-to-refresh, and optimized animations.
              </p>
            </div>
          </EnhancedCard>
        </section>

        {/* Bottom Sheet Demo */}
        <BottomSheet
          isOpen={bottomSheetOpen}
          onClose={() => setBottomSheetOpen(false)}
          title="Mobile Bottom Sheet"
        >
          <div>
            <p style={{ color: 'var(--text/secondary)', marginBottom: '20px' }}>
              This bottom sheet provides a better mobile UX than traditional modals. Try swiping down to close!
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="mobile-card">
                <p style={{ fontWeight: '600', color: 'var(--text/primary)', marginBottom: '4px' }}>
                  Load #1247
                </p>
                <p style={{ color: 'var(--text/tertiary)', fontSize: '13px', margin: 0 }}>
                  Dallas, TX → Houston, TX
                </p>
              </div>

              <div className="mobile-card">
                <p style={{ fontWeight: '600', color: 'var(--text/primary)', marginBottom: '4px' }}>
                  Load #1248
                </p>
                <p style={{ color: 'var(--text/tertiary)', fontSize: '13px', margin: 0 }}>
                  Phoenix, AZ → Los Angeles, CA
                </p>
              </div>

              <div className="mobile-card">
                <p style={{ fontWeight: '600', color: 'var(--text/primary)', marginBottom: '4px' }}>
                  Load #1249
                </p>
                <p style={{ color: 'var(--text/tertiary)', fontSize: '13px', margin: 0 }}>
                  Austin, TX → San Antonio, TX
                </p>
              </div>
            </div>

            <div style={{ marginTop: '24px' }}>
              <EnhancedButton 
                variant="primary" 
                fullWidth
                onClick={() => setBottomSheetOpen(false)}
              >
                Close Sheet
              </EnhancedButton>
            </div>
          </div>
        </BottomSheet>

      </div>
    </PageContainer>
  )
}

export default UIShowcasePage


