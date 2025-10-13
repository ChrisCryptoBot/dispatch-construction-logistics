import React, { useState } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { customerAPI } from '../../services/api'
import { CheckCircle, AlertTriangle, X, Truck, MapPin, Calendar, Package } from 'lucide-react'

interface ReleaseConfirmationModalProps {
  load: any
  onClose: () => void
  onSuccess: () => void
}

const ReleaseConfirmationModal: React.FC<ReleaseConfirmationModalProps> = ({
  load,
  onClose,
  onSuccess
}) => {
  const { theme } = useTheme()
  
  const [confirmedReady, setConfirmedReady] = useState(false)
  const [quantityConfirmed, setQuantityConfirmed] = useState('')
  const [siteContact, setSiteContact] = useState('')
  const [pickupInstructions, setPickupInstructions] = useState('')
  const [acknowledgedTonu, setAcknowledgedTonu] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!confirmedReady || !acknowledgedTonu) {
      setError('Please confirm all requirements before issuing release')
      return
    }

    setSubmitting(true)

    try {
      await customerAPI.issueRelease(load.id, {
        confirmedReady,
        quantityConfirmed,
        siteContact,
        pickupInstructions,
        acknowledgedTonu
      })

      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to issue release')
    } finally {
      setSubmitting(false)
    }
  }

  const origin = typeof load.origin === 'string' ? JSON.parse(load.origin) : load.origin
  const pickupDate = new Date(load.pickupDate).toLocaleDateString()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        className="rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: theme.name === 'dark' ? '#1a1a1a' : '#ffffff',
          border: `1px solid ${theme.name === 'dark' ? '#333' : '#e5e7eb'}`
        }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-6 border-b"
          style={{ borderColor: theme.name === 'dark' ? '#333' : '#e5e7eb' }}
        >
          <div>
            <h2 
              className="text-2xl font-bold"
              style={{ color: theme.name === 'dark' ? '#ffffff' : '#111827' }}
            >
              Issue Material Release
            </h2>
            <p 
              className="text-sm mt-1"
              style={{ color: theme.name === 'dark' ? '#9ca3af' : '#6b7280' }}
            >
              Confirm material is ready for carrier pickup
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-opacity-80"
            style={{ backgroundColor: theme.name === 'dark' ? '#333' : '#f3f4f6' }}
          >
            <X size={20} style={{ color: theme.name === 'dark' ? '#9ca3af' : '#6b7280' }} />
          </button>
        </div>

        {/* Load Summary */}
        <div 
          className="p-6 border-b"
          style={{ 
            backgroundColor: theme.name === 'dark' ? '#0f0f0f' : '#f9fafb',
            borderColor: theme.name === 'dark' ? '#333' : '#e5e7eb'
          }}
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-2">
              <Package size={18} className="text-orange-500 mt-0.5" />
              <div>
                <p className="text-xs" style={{ color: theme.name === 'dark' ? '#9ca3af' : '#6b7280' }}>
                  Material
                </p>
                <p className="font-semibold" style={{ color: theme.name === 'dark' ? '#ffffff' : '#111827' }}>
                  {load.commodity}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Truck size={18} className="text-orange-500 mt-0.5" />
              <div>
                <p className="text-xs" style={{ color: theme.name === 'dark' ? '#9ca3af' : '#6b7280' }}>
                  Carrier
                </p>
                <p className="font-semibold" style={{ color: theme.name === 'dark' ? '#ffffff' : '#111827' }}>
                  {load.carrier?.name || 'Unassigned'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin size={18} className="text-orange-500 mt-0.5" />
              <div>
                <p className="text-xs" style={{ color: theme.name === 'dark' ? '#9ca3af' : '#6b7280' }}>
                  Pickup Location
                </p>
                <p className="font-semibold" style={{ color: theme.name === 'dark' ? '#ffffff' : '#111827' }}>
                  {origin?.siteName || 'Pickup Site'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Calendar size={18} className="text-orange-500 mt-0.5" />
              <div>
                <p className="text-xs" style={{ color: theme.name === 'dark' ? '#9ca3af' : '#6b7280' }}>
                  Scheduled Pickup
                </p>
                <p className="font-semibold" style={{ color: theme.name === 'dark' ? '#ffffff' : '#111827' }}>
                  {pickupDate}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div 
              className="flex items-center gap-2 p-4 rounded-lg"
              style={{ backgroundColor: theme.name === 'dark' ? '#7f1d1d' : '#fee2e2' }}
            >
              <AlertTriangle size={18} className="text-red-500" />
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}

          {/* Material Ready Confirmation */}
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmedReady}
                onChange={(e) => setConfirmedReady(e.target.checked)}
                className="w-5 h-5 rounded border-2 cursor-pointer"
                style={{
                  borderColor: theme.name === 'dark' ? '#4b5563' : '#d1d5db',
                  accentColor: '#f97316'
                }}
              />
              <div className="flex-1">
                <p 
                  className="font-semibold"
                  style={{ color: theme.name === 'dark' ? '#ffffff' : '#111827' }}
                >
                  Material is physically ready for pickup
                </p>
                <p 
                  className="text-xs mt-1"
                  style={{ color: theme.name === 'dark' ? '#9ca3af' : '#6b7280' }}
                >
                  Confirm material is loaded, staged, and accessible
                </p>
              </div>
            </label>
          </div>

          {/* Quantity Confirmed */}
          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: theme.name === 'dark' ? '#d1d5db' : '#374151' }}
            >
              Quantity Confirmed *
            </label>
            <input
              type="text"
              value={quantityConfirmed}
              onChange={(e) => setQuantityConfirmed(e.target.value)}
              placeholder={`e.g., ${load.units} ${load.rateMode === 'PER_TON' ? 'tons' : 'yards'}`}
              required
              className="w-full px-4 py-2 rounded-lg border"
              style={{
                backgroundColor: theme.name === 'dark' ? '#1a1a1a' : '#ffffff',
                borderColor: theme.name === 'dark' ? '#4b5563' : '#d1d5db',
                color: theme.name === 'dark' ? '#ffffff' : '#111827'
              }}
            />
          </div>

          {/* Site Contact */}
          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: theme.name === 'dark' ? '#d1d5db' : '#374151' }}
            >
              Site Contact Person & Phone *
            </label>
            <input
              type="text"
              value={siteContact}
              onChange={(e) => setSiteContact(e.target.value)}
              placeholder="e.g., Joe Smith @ 555-123-4567"
              required
              className="w-full px-4 py-2 rounded-lg border"
              style={{
                backgroundColor: theme.name === 'dark' ? '#1a1a1a' : '#ffffff',
                borderColor: theme.name === 'dark' ? '#4b5563' : '#d1d5db',
                color: theme.name === 'dark' ? '#ffffff' : '#111827'
              }}
            />
          </div>

          {/* Pickup Instructions */}
          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: theme.name === 'dark' ? '#d1d5db' : '#374151' }}
            >
              Pickup Instructions (Optional)
            </label>
            <textarea
              value={pickupInstructions}
              onChange={(e) => setPickupInstructions(e.target.value)}
              placeholder="Gate code, parking instructions, special requirements..."
              rows={3}
              className="w-full px-4 py-2 rounded-lg border resize-none"
              style={{
                backgroundColor: theme.name === 'dark' ? '#1a1a1a' : '#ffffff',
                borderColor: theme.name === 'dark' ? '#4b5563' : '#d1d5db',
                color: theme.name === 'dark' ? '#ffffff' : '#111827'
              }}
            />
          </div>

          {/* TONU Acknowledgment */}
          <div 
            className="p-4 rounded-lg border-2"
            style={{
              backgroundColor: theme.name === 'dark' ? '#7f1d1d' : '#fef2f2',
              borderColor: theme.name === 'dark' ? '#dc2626' : '#fca5a5'
            }}
          >
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={acknowledgedTonu}
                onChange={(e) => setAcknowledgedTonu(e.target.checked)}
                className="w-5 h-5 rounded border-2 cursor-pointer mt-0.5"
                style={{
                  borderColor: '#dc2626',
                  accentColor: '#dc2626'
                }}
              />
              <div className="flex-1">
                <p 
                  className="font-semibold text-red-600"
                >
                  I acknowledge TONU liability
                </p>
                <p className="text-xs mt-2 text-red-500">
                  If the material is NOT ready when the carrier arrives, I understand that my company will be charged a TONU (Truck Ordered Not Used) fee of $200. This fee compensates the carrier for wasted time and fuel.
                </p>
              </div>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-lg font-semibold border"
              style={{
                borderColor: theme.name === 'dark' ? '#4b5563' : '#d1d5db',
                color: theme.name === 'dark' ? '#d1d5db' : '#374151',
                backgroundColor: theme.name === 'dark' ? '#1a1a1a' : '#ffffff'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!confirmedReady || !acknowledgedTonu || !quantityConfirmed || !siteContact || submitting}
              className="flex-1 px-6 py-3 rounded-lg font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ backgroundColor: '#f97316' }}
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Issuing Release...
                </>
              ) : (
                <>
                  <CheckCircle size={18} />
                  Issue Release
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ReleaseConfirmationModal

