import React, { useState, useRef, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { FileText, Download, Save, X, CheckCircle, Printer, AlertCircle } from 'lucide-react'

interface BOLData {
  bolNumber: string
  loadId: string
  pickupDate: string
  pickupLocation: string
  pickupAddress: string
  pickupContactName: string
  pickupContactPhone: string
  deliveryLocation: string
  deliveryAddress: string
  deliveryContactName: string
  deliveryContactPhone: string
  commodity: string
  quantity: string
  quantityUnit: string
  pieceCount?: string
  weight?: string
  specialInstructions?: string
  carrierName: string
  driverName: string
  truckNumber: string
  trailerNumber: string
}

interface ElectronicBOLProps {
  bolData: BOLData
  onSign: (signatureData: string, signerName: string) => void
  onClose: () => void
  mode?: 'pickup' | 'delivery' // Different BOL for pickup vs POD at delivery
}

const ElectronicBOL: React.FC<ElectronicBOLProps> = ({ bolData, onSign, onClose, mode = 'pickup' }) => {
  const { theme } = useTheme()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [signatureName, setSignatureName] = useState('')
  const [signatureTitle, setSignatureTitle] = useState('')
  const [signatureDate] = useState(new Date().toLocaleDateString())
  const [signatureTime] = useState(new Date().toLocaleTimeString())
  const [hasSignature, setHasSignature] = useState(false)
  const [showPrintTemplate, setShowPrintTemplate] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.strokeStyle = theme.colors.primary
        ctx.lineWidth = 2
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
      }
    }
  }, [theme])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    setHasSignature(true)
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let x, y
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left
      y = e.touches[0].clientY - rect.top
    } else {
      x = e.clientX - rect.left
      y = e.clientY - rect.top
    }

    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasEvent>) => {
    if (!isDrawing) return
    
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let x, y
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left
      y = e.touches[0].clientY - rect.top
    } else {
      x = e.clientX - rect.left
      y = e.clientY - rect.top
    }

    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasSignature(false)
  }

  const handleSign = () => {
    if (!hasSignature || !signatureName.trim()) {
      alert('Please provide your signature and name')
      return
    }

    const canvas = canvasRef.current
    if (!canvas) return

    const signatureData = canvas.toDataURL('image/png')
    onSign(signatureData, `${signatureName} - ${signatureTitle || 'Authorized Signature'}`)
  }

  const downloadPrintableBOL = () => {
    // Generate printable BOL template
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const htmlContent = generatePrintableBOL()
    printWindow.document.write(htmlContent)
    printWindow.document.close()
    printWindow.print()
  }

  const generatePrintableBOL = () => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>BOL - ${bolData.bolNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
          .header { text-align: center; border-bottom: 3px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
          .header h1 { margin: 0; font-size: 24px; }
          .section { margin-bottom: 20px; border: 1px solid #000; padding: 10px; }
          .section-title { font-weight: bold; font-size: 16px; margin-bottom: 10px; border-bottom: 1px solid #000; padding-bottom: 5px; }
          .row { display: flex; margin-bottom: 10px; }
          .label { font-weight: bold; min-width: 150px; }
          .value { flex: 1; border-bottom: 1px solid #000; }
          .signature-box { border: 1px solid #000; padding: 10px; margin-top: 20px; min-height: 100px; }
          .signature-line { border-top: 1px solid #000; margin-top: 60px; padding-top: 5px; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>BILL OF LADING</h1>
          <p><strong>Superior One Logistics</strong></p>
          <p>BOL#: ${bolData.bolNumber} | Load ID: ${bolData.loadId}</p>
        </div>

        <div class="section">
          <div class="section-title">SHIPPER (PICKUP) INFORMATION</div>
          <div class="row">
            <div class="label">Location Name:</div>
            <div class="value">${bolData.pickupLocation}</div>
          </div>
          <div class="row">
            <div class="label">Address:</div>
            <div class="value">${bolData.pickupAddress}</div>
          </div>
          <div class="row">
            <div class="label">Contact Name:</div>
            <div class="value">${bolData.pickupContactName}</div>
          </div>
          <div class="row">
            <div class="label">Contact Phone:</div>
            <div class="value">${bolData.pickupContactPhone}</div>
          </div>
          <div class="row">
            <div class="label">Pickup Date:</div>
            <div class="value">${bolData.pickupDate}</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">CONSIGNEE (DELIVERY) INFORMATION</div>
          <div class="row">
            <div class="label">Location Name:</div>
            <div class="value">${bolData.deliveryLocation}</div>
          </div>
          <div class="row">
            <div class="label">Address:</div>
            <div class="value">${bolData.deliveryAddress}</div>
          </div>
          <div class="row">
            <div class="label">Contact Name:</div>
            <div class="value">${bolData.deliveryContactName}</div>
          </div>
          <div class="row">
            <div class="label">Contact Phone:</div>
            <div class="value">${bolData.deliveryContactPhone}</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">CARRIER INFORMATION</div>
          <div class="row">
            <div class="label">Carrier Name:</div>
            <div class="value">${bolData.carrierName}</div>
          </div>
          <div class="row">
            <div class="label">Driver Name:</div>
            <div class="value">${bolData.driverName}</div>
          </div>
          <div class="row">
            <div class="label">Truck Number:</div>
            <div class="value">${bolData.truckNumber}</div>
          </div>
          <div class="row">
            <div class="label">Trailer Number:</div>
            <div class="value">${bolData.trailerNumber}</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">COMMODITY INFORMATION</div>
          <div class="row">
            <div class="label">Description:</div>
            <div class="value">${bolData.commodity}</div>
          </div>
          <div class="row">
            <div class="label">Quantity:</div>
            <div class="value">${bolData.quantity} ${bolData.quantityUnit}</div>
          </div>
          ${bolData.pieceCount ? `
          <div class="row">
            <div class="label">Piece Count:</div>
            <div class="value">${bolData.pieceCount}</div>
          </div>
          ` : ''}
          ${bolData.weight ? `
          <div class="row">
            <div class="label">Weight:</div>
            <div class="value">${bolData.weight}</div>
          </div>
          ` : ''}
          ${bolData.specialInstructions ? `
          <div class="row">
            <div class="label">Special Instructions:</div>
            <div class="value">${bolData.specialInstructions}</div>
          </div>
          ` : ''}
        </div>

        <div class="signature-box">
          <div class="section-title">SHIPPER SIGNATURE (AT PICKUP)</div>
          <p><em>I certify that the freight described above has been loaded onto the carrier's vehicle.</em></p>
          <div class="signature-line">
            <div class="row">
              <div class="label">Printed Name:</div>
              <div class="value" style="min-width: 200px;"></div>
              <div class="label" style="margin-left: 20px;">Date:</div>
              <div class="value" style="min-width: 150px;"></div>
            </div>
            <div class="row">
              <div class="label">Signature:</div>
              <div class="value"></div>
            </div>
            <div class="row">
              <div class="label">Title:</div>
              <div class="value"></div>
            </div>
          </div>
        </div>

        <div class="signature-box">
          <div class="section-title">CARRIER/DRIVER ACKNOWLEDGMENT</div>
          <p><em>I acknowledge receipt of the freight described above in apparent good order.</em></p>
          <div class="signature-line">
            <div class="row">
              <div class="label">Driver Name:</div>
              <div class="value">${bolData.driverName}</div>
            </div>
            <div class="row">
              <div class="label">Date:</div>
              <div class="value"></div>
            </div>
          </div>
        </div>

        <p class="no-print" style="text-align: center; margin-top: 30px;">
          <button onclick="window.print()">Print This BOL</button>
          <button onclick="window.close()" style="margin-left: 10px;">Close</button>
        </p>

        <p style="font-size: 10px; text-align: center; margin-top: 30px; color: #666;">
          Generated by Superior One Logistics - ${new Date().toLocaleString()}
        </p>
      </body>
      </html>
    `
  }

  if (showPrintTemplate) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        backdropFilter: 'blur(4px)'
      }}>
        <div style={{
          background: theme.colors.backgroundCard,
          borderRadius: '16px',
          padding: '32px',
          maxWidth: '500px',
          width: '90%',
          maxHeight: '90vh',
          overflow: 'auto'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: theme.colors.textPrimary, margin: 0 }}>
              Printable BOL Template
            </h2>
            <button
              onClick={() => setShowPrintTemplate(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: theme.colors.textSecondary,
                cursor: 'pointer',
                padding: '8px'
              }}
            >
              <X size={24} />
            </button>
          </div>

          <div style={{
            padding: '20px',
            background: `${theme.colors.info}15`,
            border: `1px solid ${theme.colors.info}30`,
            borderRadius: '10px',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <AlertCircle size={18} color={theme.colors.info} />
              <span style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary }}>
                Backup Option - Print BOL Template
              </span>
            </div>
            <p style={{ fontSize: '13px', color: theme.colors.textSecondary, marginLeft: '26px', marginBottom: 0 }}>
              Use this if electronic signature is not available at pickup. Driver should print these in advance.
            </p>
          </div>

          <button
            onClick={downloadPrintableBOL}
            style={{
              width: '100%',
              padding: '16px',
              background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.accent} 100%)`,
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginBottom: '12px'
            }}
          >
            <Printer size={20} />
            Print BOL Template
          </button>

          <button
            onClick={() => setShowPrintTemplate(false)}
            style={{
              width: '100%',
              padding: '14px',
              background: theme.colors.backgroundSecondary,
              color: theme.colors.textPrimary,
              border: `2px solid ${theme.colors.border}`,
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Back to E-Sign
          </button>
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
      background: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      backdropFilter: 'blur(4px)',
      padding: '20px'
    }}>
      <div style={{
        background: theme.colors.backgroundCard,
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '900px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: theme.colors.textPrimary, margin: 0, marginBottom: '4px' }}>
              {mode === 'pickup' ? 'Electronic Bill of Lading' : 'Proof of Delivery'}
            </h2>
            <p style={{ fontSize: '14px', color: theme.colors.textSecondary, margin: 0 }}>
              BOL#: {bolData.bolNumber} | Load ID: {bolData.loadId}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: theme.colors.textSecondary,
              cursor: 'pointer',
              padding: '8px'
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* BOL Details */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          marginBottom: '24px',
          padding: '20px',
          background: theme.colors.backgroundSecondary,
          borderRadius: '12px'
        }}>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textSecondary, marginBottom: '12px' }}>
              {mode === 'pickup' ? 'PICKUP LOCATION' : 'DELIVERY LOCATION'}
            </h4>
            <p style={{ fontSize: '15px', fontWeight: '600', color: theme.colors.textPrimary, margin: '0 0 8px 0' }}>
              {mode === 'pickup' ? bolData.pickupLocation : bolData.deliveryLocation}
            </p>
            <p style={{ fontSize: '13px', color: theme.colors.textSecondary, margin: '0 0 8px 0' }}>
              {mode === 'pickup' ? bolData.pickupAddress : bolData.deliveryAddress}
            </p>
            <p style={{ fontSize: '13px', color: theme.colors.textSecondary, margin: 0 }}>
              Contact: {mode === 'pickup' ? bolData.pickupContactName : bolData.deliveryContactName} - {mode === 'pickup' ? bolData.pickupContactPhone : bolData.deliveryContactPhone}
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.textSecondary, marginBottom: '12px' }}>
              COMMODITY
            </h4>
            <p style={{ fontSize: '15px', fontWeight: '600', color: theme.colors.textPrimary, margin: '0 0 8px 0' }}>
              {bolData.commodity}
            </p>
            <p style={{ fontSize: '13px', color: theme.colors.textSecondary, margin: 0 }}>
              Quantity: {bolData.quantity} {bolData.quantityUnit}
              {bolData.pieceCount && ` | Pieces: ${bolData.pieceCount}`}
            </p>
          </div>
        </div>

        {/* Signature Pad */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '12px' }}>
            {mode === 'pickup' ? 'Shipper Signature (Pickup Location)' : 'Consignee Signature (Delivery Location)'}
          </label>
          
          <div style={{
            border: `2px solid ${theme.colors.border}`,
            borderRadius: '10px',
            background: theme.colors.background,
            marginBottom: '16px'
          }}>
            <canvas
              ref={canvasRef}
              width={800}
              height={200}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              style={{
                width: '100%',
                height: '200px',
                cursor: 'crosshair',
                touchAction: 'none'
              }}
            />
          </div>

          <button
            onClick={clearSignature}
            style={{
              padding: '10px 20px',
              background: theme.colors.backgroundSecondary,
              color: theme.colors.textPrimary,
              border: `2px solid ${theme.colors.border}`,
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              marginBottom: '16px'
            }}
          >
            Clear Signature
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '6px' }}>
                Printed Name *
              </label>
              <input
                type="text"
                value={signatureName}
                onChange={(e) => setSignatureName(e.target.value)}
                placeholder="John Smith"
                style={{
                  width: '100%',
                  padding: '12px',
                  background: theme.colors.inputBg,
                  border: `2px solid ${theme.colors.inputBorder}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: theme.colors.textPrimary,
                  outline: 'none'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '6px' }}>
                Title
              </label>
              <input
                type="text"
                value={signatureTitle}
                onChange={(e) => setSignatureTitle(e.target.value)}
                placeholder="Manager"
                style={{
                  width: '100%',
                  padding: '12px',
                  background: theme.colors.inputBg,
                  border: `2px solid ${theme.colors.inputBorder}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: theme.colors.textPrimary,
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div style={{
            marginTop: '12px',
            padding: '12px',
            background: theme.colors.backgroundTertiary,
            borderRadius: '8px',
            fontSize: '12px',
            color: theme.colors.textSecondary
          }}>
            Date: {signatureDate} | Time: {signatureTime}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleSign}
            disabled={!hasSignature || !signatureName.trim()}
            style={{
              flex: 1,
              padding: '16px',
              background: (!hasSignature || !signatureName.trim())
                ? theme.colors.backgroundTertiary
                : `linear-gradient(135deg, ${theme.colors.success} 0%, #059669 100%)`,
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: (!hasSignature || !signatureName.trim()) ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              opacity: (!hasSignature || !signatureName.trim()) ? 0.5 : 1
            }}
          >
            <CheckCircle size={20} />
            {mode === 'pickup' ? 'Confirm Pickup & Sign BOL' : 'Confirm Delivery & Sign POD'}
          </button>

          <button
            onClick={() => setShowPrintTemplate(true)}
            style={{
              padding: '16px 24px',
              background: theme.colors.backgroundCard,
              color: theme.colors.textPrimary,
              border: `2px solid ${theme.colors.warning}`,
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Printer size={18} />
            Print Template
          </button>
        </div>

        <p style={{ fontSize: '11px', color: theme.colors.textSecondary, marginTop: '16px', textAlign: 'center' }}>
          By signing, you certify that the information above is accurate and the freight has been {mode === 'pickup' ? 'loaded' : 'delivered'} as described.
        </p>
      </div>
    </div>
  )
}

export default ElectronicBOL



