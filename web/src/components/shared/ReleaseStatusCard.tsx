import React from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { 
  CheckCircle, Clock, AlertTriangle, XCircle, 
  MapPin, Calendar, Package, Shield 
} from 'lucide-react'

interface ReleaseStatusCardProps {
  load: any
  releaseStatus?: any
}

const ReleaseStatusCard: React.FC<ReleaseStatusCardProps> = ({ load, releaseStatus }) => {
  const { theme } = useTheme()

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'RELEASED':
        return {
          icon: CheckCircle,
          color: '#10b981',
          bgColor: theme.name === 'dark' ? '#064e3b' : '#d1fae5',
          label: 'Released - Ready for Pickup',
          message: 'Material confirmed ready. You can proceed to pickup location.'
        }
      case 'RELEASE_REQUESTED':
        return {
          icon: Clock,
          color: '#f59e0b',
          bgColor: theme.name === 'dark' ? '#78350f' : '#fef3c7',
          label: 'Waiting for Shipper Confirmation',
          message: 'Shipper has been notified to confirm material is ready.'
        }
      case 'EXPIRED_RELEASE':
        return {
          icon: AlertTriangle,
          color: '#ef4444',
          bgColor: theme.name === 'dark' ? '#7f1d1d' : '#fee2e2',
          label: 'Release Expired',
          message: 'Release expired. Shipper must re-confirm material is ready.'
        }
      case 'ACCEPTED':
        return {
          icon: Clock,
          color: '#6b7280',
          bgColor: theme.name === 'dark' ? '#374151' : '#f3f4f6',
          label: 'Accepted - Awaiting Release',
          message: 'You\'ve accepted this load. Release will be requested soon.'
        }
      default:
        return {
          icon: XCircle,
          color: '#6b7280',
          bgColor: theme.name === 'dark' ? '#374151' : '#f3f4f6',
          label: 'Not Released',
          message: 'Load not yet ready for pickup.'
        }
    }
  }

  const statusConfig = getStatusConfig(load.status)
  const StatusIcon = statusConfig.icon

  const isReleased = load.status === 'RELEASED' && releaseStatus?.isReleased

  return (
    <div
      className="rounded-lg p-6 border"
      style={{
        backgroundColor: theme.name === 'dark' ? '#1a1a1a' : '#ffffff',
        borderColor: statusConfig.color
      }}
    >
      {/* Status Header */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="p-3 rounded-lg"
          style={{ backgroundColor: statusConfig.bgColor }}
        >
          <StatusIcon size={24} style={{ color: statusConfig.color }} />
        </div>
        <div>
          <h3
            className="text-lg font-bold"
            style={{ color: theme.name === 'dark' ? '#ffffff' : '#111827' }}
          >
            {statusConfig.label}
          </h3>
          <p
            className="text-sm mt-1"
            style={{ color: theme.name === 'dark' ? '#9ca3af' : '#6b7280' }}
          >
            {statusConfig.message}
          </p>
        </div>
      </div>

      {/* Release Details (if released) */}
      {isReleased && releaseStatus && (
        <div
          className="mt-4 p-4 rounded-lg border space-y-3"
          style={{
            backgroundColor: theme.name === 'dark' ? '#0f0f0f' : '#f9fafb',
            borderColor: theme.name === 'dark' ? '#333' : '#e5e7eb'
          }}
        >
          {/* Release Number */}
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-orange-500" />
            <div>
              <p
                className="text-xs"
                style={{ color: theme.name === 'dark' ? '#9ca3af' : '#6b7280' }}
              >
                Release Number
              </p>
              <p
                className="font-mono font-bold"
                style={{ color: theme.name === 'dark' ? '#ffffff' : '#111827' }}
              >
                {releaseStatus.releaseNumber}
              </p>
            </div>
          </div>

          {/* Pickup Address (now visible) */}
          <div className="flex items-start gap-2">
            <MapPin size={16} className="text-orange-500 mt-0.5" />
            <div>
              <p
                className="text-xs"
                style={{ color: theme.name === 'dark' ? '#9ca3af' : '#6b7280' }}
              >
                Pickup Address
              </p>
              <p
                className="font-semibold"
                style={{ color: theme.name === 'dark' ? '#ffffff' : '#111827' }}
              >
                {releaseStatus.pickupAddress}
              </p>
            </div>
          </div>

          {/* Quantity Confirmed */}
          {releaseStatus.quantityConfirmed && (
            <div className="flex items-center gap-2">
              <Package size={16} className="text-orange-500" />
              <div>
                <p
                  className="text-xs"
                  style={{ color: theme.name === 'dark' ? '#9ca3af' : '#6b7280' }}
                >
                  Quantity Ready
                </p>
                <p
                  className="font-semibold"
                  style={{ color: theme.name === 'dark' ? '#ffffff' : '#111827' }}
                >
                  {releaseStatus.quantityConfirmed}
                </p>
              </div>
            </div>
          )}

          {/* Pickup Instructions */}
          {releaseStatus.notes && (
            <div
              className="p-3 rounded-lg border-l-4 border-orange-500"
              style={{
                backgroundColor: theme.name === 'dark' ? '#1a1a1a' : '#ffffff'
              }}
            >
              <p
                className="text-xs font-semibold mb-1"
                style={{ color: theme.name === 'dark' ? '#d1d5db' : '#374151' }}
              >
                Pickup Instructions:
              </p>
              <p
                className="text-sm"
                style={{ color: theme.name === 'dark' ? '#9ca3af' : '#6b7280' }}
              >
                {releaseStatus.notes}
              </p>
            </div>
          )}

          {/* Expiry Warning */}
          {releaseStatus.expiresAt && (
            <div className="flex items-center gap-2 text-xs">
              <Clock size={14} style={{ color: theme.name === 'dark' ? '#9ca3af' : '#6b7280' }} />
              <p style={{ color: theme.name === 'dark' ? '#9ca3af' : '#6b7280' }}>
                Release valid until {new Date(releaseStatus.expiresAt).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Waiting Message (if not released) */}
      {!isReleased && load.status === 'RELEASE_REQUESTED' && (
        <div
          className="mt-4 p-4 rounded-lg flex items-start gap-3"
          style={{
            backgroundColor: theme.name === 'dark' ? '#78350f' : '#fef3c7'
          }}
        >
          <AlertTriangle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-yellow-600">
              Pickup address will be displayed once shipper confirms material is ready.
            </p>
            <p className="text-xs text-yellow-600 mt-1">
              We'll send you a notification as soon as the release is issued.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default ReleaseStatusCard


