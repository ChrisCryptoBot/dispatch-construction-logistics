import React, { useState } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { carrierAPI } from '../services/api'
import { AlertTriangle, X, Camera, Clock, DollarSign, FileText } from 'lucide-react'

interface TonuFilingModalProps {
  load: any
  onClose: () => void
  onSuccess: () => void
}

const TonuFilingModal: React.FC<TonuFilingModalProps> = ({
  load,
  onClose,
  onSuccess
}) => {
  const { theme } = useTheme()
  
  const [reason, setReason] = useState('')
  const [arrivalTime, setArrivalTime] = useState('')
  const [waitTime, setWaitTime] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Calculate TONU amounts
  const tonuAmount = 200 // Flat $200 charged to customer
  const platformFee = 50 // 25% to SaaS
  const carrierPayout = 150 // 75% to carrier

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!reason || reason.length < 10) {
      setError('Please provide a detailed reason (at least 10 characters)')
      return
    }
    
    if (!arrivalTime) {
      setError('Please specify when you arrived at the pickup location')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      await carrierAPI.fileTonu(load.id, {
        reason,
        arrivalTime,
        waitTime,
        evidence: []
      })
      
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to file TONU claim')
      setSubmitting(false)
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
          border: `1px solid ${theme === 'dark' ? '#333' : '#e5e7eb'}`
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-6 border-b"
          style={{ borderColor: theme === 'dark' ? '#333' : '#e5e7eb' }}
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg" style={{ backgroundColor: '#7f1d1d' }}>
              <AlertTriangle size={24} className="text-red-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-red-500">
                File TONU Claim
              </h2>
              <p 
                className="text-sm mt-1"
                style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
              >
                Truck Ordered Not Used - Material not ready for pickup
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-opacity-80"
            style={{ backgroundColor: theme === 'dark' ? '#333' : '#f3f4f6' }}
          >
            <X size={20} style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div 
              className="mb-4 p-4 rounded-lg border"
              style={{
                backgroundColor: theme === 'dark' ? '#7f1d1d' : '#fef2f2',
                borderColor: '#dc2626'
              }}
            >
              <p className="text-red-600 font-semibold">{error}</p>
            </div>
          )}

          {/* Load Summary */}
          <div 
            className="mb-6 p-4 rounded-lg"
            style={{ 
              backgroundColor: theme === 'dark' ? '#0f0f0f' : '#f9fafb',
              border: `1px solid ${theme === 'dark' ? '#333' : '#e5e7eb'}`
            }}
          >
            <h3 
              className="font-semibold mb-2"
              style={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}
            >
              Load Information
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                  Load ID
                </p>
                <p 
                  className="font-semibold"
                  style={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}
                >
                  #{load.id?.substring(0, 8)}
                </p>
              </div>
              <div>
                <p style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                  Commodity
                </p>
                <p 
                  className="font-semibold"
                  style={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}
                >
                  {load.commodity}
                </p>
              </div>
              <div>
                <p style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                  Distance
                </p>
                <p 
                  className="font-semibold"
                  style={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}
                >
                  {load.miles} miles
                </p>
              </div>
              <div>
                <p style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                  Original Revenue
                </p>
                <p 
                  className="font-semibold"
                  style={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}
                >
                  ${(load.revenue || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* TONU Compensation Display */}
          <div 
            className="mb-6 p-6 rounded-lg"
            style={{ 
              backgroundColor: theme === 'dark' ? '#064e3b' : '#d1fae5',
              border: '2px solid #10b981'
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <DollarSign size={24} className="text-green-600" />
              <div>
                <p 
                  className="text-sm font-semibold"
                  style={{ color: theme === 'dark' ? '#d1fae5' : '#065f46' }}
                >
                  TONU Compensation
                </p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  ${carrierPayout.toLocaleString()}
                </p>
              </div>
            </div>
            <div 
              className="text-xs mt-3 p-3 rounded"
              style={{ 
                backgroundColor: theme === 'dark' ? '#047857' : '#a7f3d0',
                color: theme === 'dark' ? '#d1fae5' : '#065f46'
              }}
            >
              <p className="mb-1">
                <strong>Your TONU Compensation:</strong> $150 flat rate
              </p>
              <p className="text-xs opacity-75">
                This compensates you for the wasted trip and ensures accountability from shippers.
              </p>
            </div>
          </div>

          {/* Reason */}
          <div className="mb-4">
            <label 
              className="block text-sm font-semibold mb-2" 
              style={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}
            >
              Reason for TONU <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={5}
              placeholder="Please provide detailed information about why the material was not ready (e.g., material not loaded yet, site closed, incorrect address, safety issue, etc.)"
              required
              className="w-full px-4 py-3 rounded-lg border resize-none"
              style={{
                backgroundColor: theme === 'dark' ? '#0f0f0f' : '#ffffff',
                borderColor: theme === 'dark' ? '#333' : '#d1d5db',
                color: theme === 'dark' ? '#ffffff' : '#111827',
                outline: 'none'
              }}
            />
            <p 
              className="text-xs mt-1"
              style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
            >
              {reason.length} / 10 minimum characters
            </p>
          </div>

          {/* Arrival Time */}
          <div className="mb-4">
            <label 
              className="block text-sm font-semibold mb-2" 
              style={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}
            >
              <Clock size={16} className="inline mr-2" />
              Arrival Time <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              value={arrivalTime}
              onChange={(e) => setArrivalTime(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border"
              style={{
                backgroundColor: theme === 'dark' ? '#0f0f0f' : '#ffffff',
                borderColor: theme === 'dark' ? '#333' : '#d1d5db',
                color: theme === 'dark' ? '#ffffff' : '#111827',
                outline: 'none'
              }}
            />
            <p 
              className="text-xs mt-1"
              style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
            >
              When did you arrive at the pickup location?
            </p>
          </div>

          {/* Wait Time */}
          <div className="mb-6">
            <label 
              className="block text-sm font-semibold mb-2" 
              style={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}
            >
              Wait Time (minutes)
            </label>
            <input
              type="number"
              value={waitTime}
              onChange={(e) => setWaitTime(Number(e.target.value))}
              min="0"
              max="600"
              className="w-full px-4 py-3 rounded-lg border"
              style={{
                backgroundColor: theme === 'dark' ? '#0f0f0f' : '#ffffff',
                borderColor: theme === 'dark' ? '#333' : '#d1d5db',
                color: theme === 'dark' ? '#ffffff' : '#111827',
                outline: 'none'
              }}
            />
            <p 
              className="text-xs mt-1"
              style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
            >
              How long did you wait before leaving? (Optional)
            </p>
          </div>

          {/* Legal Notice */}
          <div 
            className="mb-6 p-4 rounded-lg border-2"
            style={{
              backgroundColor: theme === 'dark' ? '#78350f' : '#fef3c7',
              borderColor: '#f59e0b'
            }}
          >
            <div className="flex items-start gap-3">
              <FileText size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-yellow-600 mb-2">
                  Legal Notice
                </p>
                <p className="text-xs text-yellow-600">
                  By submitting this TONU claim, you certify that the information provided is accurate and truthful. False claims may result in account suspension and legal action. The customer will be notified and charged the TONU amount. Disputes will be reviewed with supporting evidence.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 py-3 px-6 rounded-lg font-semibold transition-all"
              style={{
                backgroundColor: theme === 'dark' ? '#333' : '#f3f4f6',
                color: theme === 'dark' ? '#ffffff' : '#111827',
                opacity: submitting ? 0.5 : 1,
                cursor: submitting ? 'not-allowed' : 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !reason || reason.length < 10 || !arrivalTime}
              className="flex-1 py-3 px-6 rounded-lg font-semibold transition-all"
              style={{
                backgroundColor: '#ef4444',
                color: 'white',
                opacity: (submitting || !reason || reason.length < 10 || !arrivalTime) ? 0.5 : 1,
                cursor: (submitting || !reason || reason.length < 10 || !arrivalTime) ? 'not-allowed' : 'pointer'
              }}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Filing...
                </span>
              ) : (
                `File TONU - $${carrierPayout.toLocaleString()}`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TonuFilingModal

