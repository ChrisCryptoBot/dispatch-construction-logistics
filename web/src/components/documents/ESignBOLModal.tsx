import React, { useState, useRef } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import { X, FileText, Check } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import { api } from '../services/api'

interface ESignBOLModalProps {
  load: any
  signatureType: 'SHIPPER' | 'DRIVER'
  onClose: () => void
  onSuccess: () => void
}

export default function ESignBOLModal({ load, signatureType, onClose, onSuccess }: ESignBOLModalProps) {
  const { theme } = useTheme()
  const [signedBy, setSignedBy] = useState('')
  const [loading, setLoading] = useState(false)
  const [bolData, setBolData] = useState<any>(null)
  const signatureRef = useRef<any>(null)

  // Load BOL data
  React.useEffect(() => {
    loadBOLData()
  }, [])

  const loadBOLData = async () => {
    try {
      const response = await api.get(`/esignature/bol/${load.id}`)
      setBolData(response.data.document)
    } catch (error) {
      console.error('Failed to load BOL:', error)
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

    setLoading(true)

    try {
      // Get signature as base64 image
      const signatureData = signatureRef.current.toDataURL()

      // Submit signature
      await api.post(`/esignature/bol/${load.id}/sign`, {
        signatureType,
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

  if (!bolData) {
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
          <p style={{ color: theme.name === 'dark' ? '#ffffff' : '#000000' }}>Loading BOL...</p>
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
            <FileText size={24} style={{ color: '#d4af37' }} />
            <div>
              <h2 style={{
                margin: 0,
                fontSize: '20px',
                fontWeight: '700',
                color: theme.name === 'dark' ? '#ffffff' : '#111827'
              }}>
                Electronic Bill of Lading
              </h2>
              <p style={{
                margin: '4px 0 0 0',
                fontSize: '14px',
                color: theme.name === 'dark' ? '#9ca3af' : '#6b7280'
              }}>
                {signatureType === 'SHIPPER' ? 'Shipper Signature Required' : 'Driver Signature Required'}
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

        {/* BOL Content */}
        <div style={{ padding: '24px' }}>
          {/* Pre-filled BOL Data */}
          <div style={{
            backgroundColor: theme.name === 'dark' ? '#111827' : '#f9fafb',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '14px' }}>
              <div>
                <p style={{ fontWeight: '600', color: theme.name === 'dark' ? '#d4af37' : '#d97706', marginBottom: '8px' }}>BOL Information</p>
                <p style={{ color: theme.name === 'dark' ? '#ffffff' : '#000000' }}>BOL #: {bolData.bolNumber}</p>
                <p style={{ color: theme.name === 'dark' ? '#ffffff' : '#000000' }}>Release #: {bolData.releaseNumber}</p>
                <p style={{ color: theme.name === 'dark' ? '#ffffff' : '#000000' }}>Date: {bolData.date}</p>
              </div>
              
              <div>
                <p style={{ fontWeight: '600', color: theme.name === 'dark' ? '#d4af37' : '#d97706', marginBottom: '8px' }}>Broker</p>
                <p style={{ color: theme.name === 'dark' ? '#ffffff' : '#000000' }}>{bolData.broker.name}</p>
                <p style={{ color: theme.name === 'dark' ? '#9ca3af' : '#6b7280', fontSize: '12px' }}>MC #: {bolData.broker.mc}</p>
              </div>

              <div>
                <p style={{ fontWeight: '600', color: theme.name === 'dark' ? '#d4af37' : '#d97706', marginBottom: '8px' }}>Shipper (Pickup)</p>
                <p style={{ color: theme.name === 'dark' ? '#ffffff' : '#000000' }}>{bolData.shipper.name}</p>
                <p style={{ color: theme.name === 'dark' ? '#9ca3af' : '#6b7280', fontSize: '12px' }}>
                  {bolData.shipper.address}<br />
                  {bolData.shipper.city}, {bolData.shipper.state} {bolData.shipper.zip}
                </p>
              </div>

              <div>
                <p style={{ fontWeight: '600', color: theme.name === 'dark' ? '#d4af37' : '#d97706', marginBottom: '8px' }}>Consignee (Delivery)</p>
                <p style={{ color: theme.name === 'dark' ? '#ffffff' : '#000000' }}>{bolData.consignee.name}</p>
                <p style={{ color: theme.name === 'dark' ? '#9ca3af' : '#6b7280', fontSize: '12px' }}>
                  {bolData.consignee.address}<br />
                  {bolData.consignee.city}, {bolData.consignee.state} {bolData.consignee.zip}
                </p>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <p style={{ fontWeight: '600', color: theme.name === 'dark' ? '#d4af37' : '#d97706', marginBottom: '8px' }}>Commodity</p>
                <p style={{ color: theme.name === 'dark' ? '#ffffff' : '#000000' }}>{bolData.commodity.description}</p>
                <p style={{ color: theme.name === 'dark' ? '#9ca3af' : '#6b7280', fontSize: '12px' }}>
                  Quantity: {bolData.commodity.quantity} | Equipment: {bolData.commodity.equipmentType}
                </p>
              </div>

              {bolData.specialInstructions && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <p style={{ fontWeight: '600', color: theme.name === 'dark' ? '#d4af37' : '#d97706', marginBottom: '8px' }}>Special Instructions</p>
                  <p style={{ color: theme.name === 'dark' ? '#ffffff' : '#000000', fontSize: '12px' }}>
                    {bolData.specialInstructions}
                  </p>
                </div>
              )}
            </div>
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
              Your Name ({signatureType === 'SHIPPER' ? 'Shipper Representative' : 'Driver'})
            </label>
            <input
              type="text"
              value={signedBy}
              onChange={(e) => setSignedBy(e.target.value)}
              placeholder={signatureType === 'SHIPPER' ? 'Enter shipper name' : 'Enter driver name'}
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
              <strong>Legal Notice:</strong> By signing electronically, you agree that this signature is legally binding and equivalent to a handwritten signature. Your IP address and timestamp will be recorded for verification.
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
                background: '#d4af37',
                color: '#000000',
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
                  Sign BOL Electronically
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

