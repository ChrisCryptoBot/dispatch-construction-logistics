import React, { useState, useRef } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import { X, FileText, Check, Package } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import { api } from '../../services/api'

interface ESignPODModalProps {
  load: any
  signatureType: 'RECEIVER' | 'DRIVER'
  onClose: () => void
  onSuccess: () => void
}

export default function ESignPODModal({ load, signatureType, onClose, onSuccess }: ESignPODModalProps) {
  const { theme } = useTheme()
  const [signedBy, setSignedBy] = useState('')
  const [actualQuantity, setActualQuantity] = useState(load.units?.toString() || '')
  const [condition, setCondition] = useState('GOOD')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [podData, setPodData] = useState<any>(null)
  const signatureRef = useRef<any>(null)

  // Load POD data
  React.useEffect(() => {
    loadPODData()
  }, [])

  const loadPODData = async () => {
    try {
      const response = await api.get(`/esignature/pod/${load.id}`)
      setPodData(response.data.document)
    } catch (error) {
      console.error('Failed to load POD:', error)
    }
  }

  const handleSign = async () => {
    if (!signedBy.trim()) {
      alert('Please enter your name')
      return
    }

    if (signatureRef.current?.isEmpty()) {
      alert('Please provide your signature')
      return
    }

    // Receiver must provide delivery data
    if (signatureType === 'RECEIVER') {
      if (!actualQuantity || !condition) {
        alert('Please provide actual quantity delivered and material condition')
        return
      }
    }

    setLoading(true)

    try {
      // Get signature as base64 image
      const signatureData = signatureRef.current.toDataURL()

      // Prepare delivery data (only for receiver)
      const deliveryData = signatureType === 'RECEIVER' ? {
        actualQuantity,
        condition,
        notes
      } : null

      // Submit signature
      await api.post(`/esignature/pod/${load.id}/sign`, {
        signatureType,
        deliveryData,
        signatureData,
        signedBy
      })

      alert(`${signatureType} signature captured successfully!`)
      onSuccess()
      onClose()

    } catch (error: any) {
      console.error('Signature error:', error)
      alert(error.response?.data?.error || 'Failed to submit signature')
    } finally {
      setLoading(false)
    }
  }

  const clearSignature = () => {
    signatureRef.current?.clear()
  }

  if (!podData) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: theme.name === 'dark' ? '#1f2937' : '#ffffff',
          padding: '40px',
          borderRadius: '12px',
          maxWidth: '500px'
        }}>
          <p style={{ color: theme.name === 'dark' ? '#ffffff' : '#000000' }}>Loading POD...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      overflow: 'auto',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: theme.name === 'dark' ? '#1f2937' : '#ffffff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '800px',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: `2px solid ${theme.name === 'dark' ? '#374151' : '#e5e7eb'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Package size={24} style={{ color: '#10b981' }} />
            <div>
              <h2 style={{
                margin: 0,
                fontSize: '20px',
                fontWeight: '700',
                color: theme.name === 'dark' ? '#ffffff' : '#111827'
              }}>
                Electronic Proof of Delivery
              </h2>
              <p style={{
                margin: '4px 0 0 0',
                fontSize: '14px',
                color: theme.name === 'dark' ? '#9ca3af' : '#6b7280'
              }}>
                {signatureType === 'RECEIVER' ? 'Receiver Signature Required' : 'Driver Signature Required'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              color: theme.name === 'dark' ? '#9ca3af' : '#6b7280'
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* POD Content */}
        <div style={{ padding: '24px' }}>
          {/* Pre-filled POD Data */}
          <div style={{
            backgroundColor: theme.name === 'dark' ? '#111827' : '#f9fafb',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '14px' }}>
              <div>
                <p style={{ fontWeight: '600', color: theme.name === 'dark' ? '#10b981' : '#059669', marginBottom: '8px' }}>Load Information</p>
                <p style={{ color: theme.name === 'dark' ? '#ffffff' : '#000000' }}>Load #: {podData.loadNumber}</p>
                <p style={{ color: theme.name === 'dark' ? '#ffffff' : '#000000' }}>Commodity: {podData.loadInfo.commodity}</p>
                <p style={{ color: theme.name === 'dark' ? '#ffffff' : '#000000' }}>Expected: {podData.loadInfo.expectedQuantity}</p>
              </div>
              
              <div>
                <p style={{ fontWeight: '600', color: theme.name === 'dark' ? '#10b981' : '#059669', marginBottom: '8px' }}>Route</p>
                <p style={{ color: theme.name === 'dark' ? '#ffffff' : '#000000' }}>From: {podData.loadInfo.from}</p>
                <p style={{ color: theme.name === 'dark' ? '#ffffff' : '#000000' }}>To: {podData.loadInfo.to}</p>
              </div>
            </div>
          </div>

          {/* Delivery Verification (Only for RECEIVER) */}
          {signatureType === 'RECEIVER' && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                marginBottom: '16px',
                color: theme.name === 'dark' ? '#ffffff' : '#111827'
              }}>
                Delivery Verification
              </h3>

              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: theme.name === 'dark' ? '#ffffff' : '#111827'
                }}>
                  Actual Quantity Delivered
                </label>
                <input
                  type="text"
                  value={actualQuantity}
                  onChange={(e) => setActualQuantity(e.target.value)}
                  placeholder="e.g., 20 tons"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `2px solid ${theme.name === 'dark' ? '#374151' : '#d1d5db'}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    backgroundColor: theme.name === 'dark' ? '#111827' : '#ffffff',
                    color: theme.name === 'dark' ? '#ffffff' : '#000000'
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: theme.name === 'dark' ? '#ffffff' : '#111827'
                }}>
                  Material Condition
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `2px solid ${theme.name === 'dark' ? '#374151' : '#d1d5db'}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    backgroundColor: theme.name === 'dark' ? '#111827' : '#ffffff',
                    color: theme.name === 'dark' ? '#ffffff' : '#000000'
                  }}
                >
                  <option value="GOOD">Good Condition</option>
                  <option value="ACCEPTABLE">Acceptable</option>
                  <option value="DAMAGED">Damaged</option>
                  <option value="PARTIAL">Partial Delivery</option>
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: theme.name === 'dark' ? '#ffffff' : '#111827'
                }}>
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any delivery notes or issues..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `2px solid ${theme.name === 'dark' ? '#374151' : '#d1d5db'}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    backgroundColor: theme.name === 'dark' ? '#111827' : '#ffffff',
                    color: theme.name === 'dark' ? '#ffffff' : '#000000',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>
          )}

          {/* Name Input */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '8px',
              color: theme.name === 'dark' ? '#ffffff' : '#111827'
            }}>
              Your Name ({signatureType === 'RECEIVER' ? 'Receiver Representative' : 'Driver'})
            </label>
            <input
              type="text"
              value={signedBy}
              onChange={(e) => setSignedBy(e.target.value)}
              placeholder={signatureType === 'RECEIVER' ? 'Enter receiver name' : 'Enter driver name'}
              style={{
                width: '100%',
                padding: '12px',
                border: `2px solid ${theme.name === 'dark' ? '#374151' : '#d1d5db'}`,
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: theme.name === 'dark' ? '#111827' : '#ffffff',
                color: theme.name === 'dark' ? '#ffffff' : '#000000'
              }}
            />
          </div>

          {/* Signature Capture */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '8px',
              color: theme.name === 'dark' ? '#ffffff' : '#111827'
            }}>
              Electronic Signature
            </label>
            <div style={{
              border: `2px solid ${theme.name === 'dark' ? '#374151' : '#d1d5db'}`,
              borderRadius: '8px',
              backgroundColor: '#ffffff',
              overflow: 'hidden'
            }}>
              <SignatureCanvas
                ref={signatureRef}
                canvasProps={{
                  width: 700,
                  height: 150,
                  style: { width: '100%', height: '150px' }
                }}
                backgroundColor="#ffffff"
                penColor="#000000"
              />
            </div>
            <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontSize: '12px', color: theme.name === 'dark' ? '#9ca3af' : '#6b7280' }}>
                Sign above using your mouse, finger, or stylus
              </p>
              <button
                onClick={clearSignature}
                style={{
                  padding: '6px 12px',
                  background: 'none',
                  border: `1px solid ${theme.name === 'dark' ? '#374151' : '#d1d5db'}`,
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  color: theme.name === 'dark' ? '#ffffff' : '#000000'
                }}
              >
                Clear
              </button>
            </div>
          </div>

          {/* Legal Notice */}
          <div style={{
            padding: '16px',
            backgroundColor: theme.name === 'dark' ? '#065f46' : '#d1fae5',
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            <p style={{
              fontSize: '12px',
              color: theme.name === 'dark' ? '#d1fae5' : '#065f46',
              margin: 0
            }}>
              <strong>Legal Notice:</strong> By signing, you confirm receipt of material as described. This electronic signature is legally binding. IP address and timestamp recorded.
            </p>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              onClick={onClose}
              disabled={loading}
              style={{
                padding: '12px 24px',
                background: theme.name === 'dark' ? '#374151' : '#e5e7eb',
                color: theme.name === 'dark' ? '#ffffff' : '#000000',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSign}
              disabled={loading}
              style={{
                padding: '12px 24px',
                background: '#10b981',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                opacity: loading ? 0.5 : 1
              }}
            >
              {loading ? (
                <>Submitting...</>
              ) : (
                <>
                  <Check size={16} />
                  Sign POD Electronically
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

