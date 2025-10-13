import React from 'react'
import { useTheme } from '../contexts/ThemeContext'
import SuperiorOneLogo from './SuperiorOneLogo'

interface BOLData {
  // Load Information
  loadId: string
  poNumber: string
  date: string
  
  // Shipper Information
  shipperName: string
  shipperAddress: string
  shipperCity: string
  shipperState: string
  shipperZip: string
  shipperPhone: string
  
  // Carrier Information
  carrierName: string
  carrierAddress: string
  carrierCity: string
  carrierState: string
  carrierZip: string
  carrierPhone: string
  
  // Driver Information
  driverName: string
  driverLicense: string
  driverPhone: string
  
  // Equipment Information
  truckNumber: string
  trailerNumber: string
  equipmentType: string
  
  // Pickup Information
  pickupDate: string
  pickupTime: string
  pickupLocation: string
  pickupAddress: string
  pickupCity: string
  pickupState: string
  pickupZip: string
  pickupContact: string
  pickupPhone: string
  
  // Delivery Information
  deliveryDate: string
  deliveryTime: string
  deliveryLocation: string
  deliveryAddress: string
  deliveryCity: string
  deliveryState: string
  deliveryZip: string
  deliveryContact: string
  deliveryPhone: string
  
  // Load Details
  commodity: string
  weight: string
  pieces: string
  description: string
  specialInstructions: string
  
  // Signatures
  shipperSignature: string
  shipperDate: string
  carrierSignature: string
  carrierDate: string
  driverSignature: string
  driverDate: string
  receiverSignature: string
  receiverDate: string
}

interface BOLTemplateProps {
  data: BOLData
  onPrint?: () => void
  onDownload?: () => void
  onEdit?: () => void
}

const BOLTemplate: React.FC<BOLTemplateProps> = ({ data, onPrint, onDownload, onEdit }) => {
  const { theme } = useTheme()

  const handlePrint = () => {
    window.print()
    onPrint?.()
  }

  const handleDownload = () => {
    // In a real implementation, this would generate a PDF
    console.log('Downloading BOL as PDF...')
    onDownload?.()
  }

  return (
    <div style={{
      maxWidth: '8.5in',
      margin: '0 auto',
      padding: '20px',
      background: 'white',
      color: 'black',
      fontFamily: 'Arial, sans-serif',
      lineHeight: 1.4
    }}>
      {/* Print Styles */}
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            .bol-template, .bol-template * {
              visibility: visible;
            }
            .bol-template {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            .no-print {
              display: none !important;
            }
          }
        `}
      </style>

      {/* Action Buttons - Hidden in Print */}
      <div className="no-print" style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '20px',
        padding: '16px',
        background: theme.colors.backgroundSecondary,
        borderRadius: '8px',
        border: `1px solid ${theme.colors.border}`
      }}>
        <button
          onClick={handlePrint}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            background: theme.colors.primary,
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600'
          }}
        >
          🖨️ Print BOL
        </button>
        <button
          onClick={handleDownload}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            background: theme.colors.backgroundTertiary,
            color: theme.colors.textPrimary,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600'
          }}
        >
          📥 Download PDF
        </button>
        <button
          onClick={onEdit}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            background: theme.colors.backgroundTertiary,
            color: theme.colors.textPrimary,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600'
          }}
        >
          ✏️ Edit BOL
        </button>
      </div>

      {/* BOL Document */}
      <div className="bol-template" style={{
        border: '2px solid #000',
        padding: '20px',
        background: 'white'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          borderBottom: '2px solid #000',
          paddingBottom: '15px'
        }}>
          <div>
            <SuperiorOneLogo height={40} variant="dark" />
            <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
              Construction Logistics Platform
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '5px' }}>
              BILL OF LADING
            </div>
            <div style={{ fontSize: '14px' }}>
              Load ID: _________________
            </div>
            <div style={{ fontSize: '14px' }}>
              PO Number: _________________
            </div>
            <div style={{ fontSize: '14px' }}>
              Date: _________________
            </div>
          </div>
        </div>

        {/* Shipper and Carrier Information */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          marginBottom: '20px'
        }}>
          {/* Shipper */}
          <div style={{
            border: '1px solid #000',
            padding: '15px'
          }}>
            <div style={{
              fontSize: '16px',
              fontWeight: 'bold',
              marginBottom: '10px',
              borderBottom: '1px solid #000',
              paddingBottom: '5px'
            }}>
              SHIPPER
            </div>
            <div style={{ marginBottom: '5px' }}>
              <strong>Name:</strong> _________________
            </div>
            <div style={{ marginBottom: '5px' }}>
              <strong>Address:</strong> _________________
            </div>
            <div style={{ marginBottom: '5px' }}>
              <strong>City, State ZIP:</strong> _________________
            </div>
            <div>
              <strong>Phone:</strong> _________________
            </div>
          </div>

          {/* Carrier */}
          <div style={{
            border: '1px solid #000',
            padding: '15px'
          }}>
            <div style={{
              fontSize: '16px',
              fontWeight: 'bold',
              marginBottom: '10px',
              borderBottom: '1px solid #000',
              paddingBottom: '5px'
            }}>
              CARRIER
            </div>
            <div style={{ marginBottom: '5px' }}>
              <strong>Name:</strong> _________________
            </div>
            <div style={{ marginBottom: '5px' }}>
              <strong>Address:</strong> _________________
            </div>
            <div style={{ marginBottom: '5px' }}>
              <strong>City, State ZIP:</strong> _________________
            </div>
            <div>
              <strong>Phone:</strong> _________________
            </div>
          </div>
        </div>

        {/* Driver and Equipment */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          marginBottom: '20px'
        }}>
          {/* Driver */}
          <div style={{
            border: '1px solid #000',
            padding: '15px'
          }}>
            <div style={{
              fontSize: '16px',
              fontWeight: 'bold',
              marginBottom: '10px',
              borderBottom: '1px solid #000',
              paddingBottom: '5px'
            }}>
              DRIVER
            </div>
            <div style={{ marginBottom: '5px' }}>
              <strong>Name:</strong> _________________
            </div>
            <div style={{ marginBottom: '5px' }}>
              <strong>License #:</strong> _________________
            </div>
            <div>
              <strong>Phone:</strong> _________________
            </div>
          </div>

          {/* Equipment */}
          <div style={{
            border: '1px solid #000',
            padding: '15px'
          }}>
            <div style={{
              fontSize: '16px',
              fontWeight: 'bold',
              marginBottom: '10px',
              borderBottom: '1px solid #000',
              paddingBottom: '5px'
            }}>
              EQUIPMENT
            </div>
            <div style={{ marginBottom: '5px' }}>
              <strong>Truck #:</strong> _________________
            </div>
            <div style={{ marginBottom: '5px' }}>
              <strong>Trailer #:</strong> _________________
            </div>
            <div>
              <strong>Type:</strong> _________________
            </div>
          </div>
        </div>

        {/* Pickup and Delivery */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          marginBottom: '20px'
        }}>
          {/* Pickup */}
          <div style={{
            border: '1px solid #000',
            padding: '15px'
          }}>
            <div style={{
              fontSize: '16px',
              fontWeight: 'bold',
              marginBottom: '10px',
              borderBottom: '1px solid #000',
              paddingBottom: '5px'
            }}>
              PICKUP
            </div>
            <div style={{ marginBottom: '5px' }}>
              <strong>Date:</strong> _________________
            </div>
            <div style={{ marginBottom: '5px' }}>
              <strong>Time:</strong> _________________
            </div>
            <div style={{ marginBottom: '5px' }}>
              <strong>Location:</strong> _________________
            </div>
            <div style={{ marginBottom: '5px' }}>
              <strong>Address:</strong> _________________
            </div>
            <div style={{ marginBottom: '5px' }}>
              <strong>City, State ZIP:</strong> _________________
            </div>
            <div style={{ marginBottom: '5px' }}>
              <strong>Contact:</strong> _________________
            </div>
            <div>
              <strong>Phone:</strong> _________________
            </div>
          </div>

          {/* Delivery */}
          <div style={{
            border: '1px solid #000',
            padding: '15px'
          }}>
            <div style={{
              fontSize: '16px',
              fontWeight: 'bold',
              marginBottom: '10px',
              borderBottom: '1px solid #000',
              paddingBottom: '5px'
            }}>
              DELIVERY
            </div>
            <div style={{ marginBottom: '5px' }}>
              <strong>Date:</strong> _________________
            </div>
            <div style={{ marginBottom: '5px' }}>
              <strong>Time:</strong> _________________
            </div>
            <div style={{ marginBottom: '5px' }}>
              <strong>Location:</strong> _________________
            </div>
            <div style={{ marginBottom: '5px' }}>
              <strong>Address:</strong> _________________
            </div>
            <div style={{ marginBottom: '5px' }}>
              <strong>City, State ZIP:</strong> _________________
            </div>
            <div style={{ marginBottom: '5px' }}>
              <strong>Contact:</strong> _________________
            </div>
            <div>
              <strong>Phone:</strong> _________________
            </div>
          </div>
        </div>

        {/* Load Details */}
        <div style={{
          border: '1px solid #000',
          padding: '15px',
          marginBottom: '20px'
        }}>
          <div style={{
            fontSize: '16px',
            fontWeight: 'bold',
            marginBottom: '10px',
            borderBottom: '1px solid #000',
            paddingBottom: '5px'
          }}>
            LOAD DETAILS
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '15px',
            marginBottom: '10px'
          }}>
            <div>
              <strong>Commodity:</strong> _________________
            </div>
            <div>
              <strong>Weight:</strong> _________________ lbs
            </div>
            <div>
              <strong>Pieces:</strong> _________________
            </div>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong>Description:</strong> _________________
          </div>
          <div>
            <strong>Special Instructions:</strong> _________________
          </div>
        </div>

        {/* Signatures */}
        <div style={{
          border: '1px solid #000',
          padding: '15px'
        }}>
          <div style={{
            fontSize: '16px',
            fontWeight: 'bold',
            marginBottom: '15px',
            borderBottom: '1px solid #000',
            paddingBottom: '5px'
          }}>
            SIGNATURES
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px'
          }}>
            {/* Shipper Signature */}
            <div>
              <div style={{ marginBottom: '30px' }}>
                <div style={{ marginBottom: '5px' }}>
                  <strong>Shipper Signature:</strong>
                </div>
                <div style={{
                  borderBottom: '1px solid #000',
                  height: '30px',
                  marginBottom: '5px'
                }}></div>
                <div style={{ fontSize: '12px' }}>
                  Date: _________________
                </div>
              </div>
            </div>

            {/* Carrier Signature */}
            <div>
              <div style={{ marginBottom: '30px' }}>
                <div style={{ marginBottom: '5px' }}>
                  <strong>Carrier Signature:</strong>
                </div>
                <div style={{
                  borderBottom: '1px solid #000',
                  height: '30px',
                  marginBottom: '5px'
                }}></div>
                <div style={{ fontSize: '12px' }}>
                  Date: _________________
                </div>
              </div>
            </div>

            {/* Driver Signature */}
            <div>
              <div style={{ marginBottom: '30px' }}>
                <div style={{ marginBottom: '5px' }}>
                  <strong>Driver Signature:</strong>
                </div>
                <div style={{
                  borderBottom: '1px solid #000',
                  height: '30px',
                  marginBottom: '5px'
                }}></div>
                <div style={{ fontSize: '12px' }}>
                  Date: _________________
                </div>
              </div>
            </div>

            {/* Receiver Signature */}
            <div>
              <div style={{ marginBottom: '30px' }}>
                <div style={{ marginBottom: '5px' }}>
                  <strong>Receiver Signature:</strong>
                </div>
                <div style={{
                  borderBottom: '1px solid #000',
                  height: '30px',
                  marginBottom: '5px'
                }}></div>
                <div style={{ fontSize: '12px' }}>
                  Date: _________________
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          marginTop: '20px',
          paddingTop: '15px',
          borderTop: '1px solid #000',
          fontSize: '10px',
          color: '#666',
          textAlign: 'center'
        }}>
          <div>
            This Bill of Lading is subject to the terms and conditions of the Superior One Logistics platform.
          </div>
          <div style={{ marginTop: '5px' }}>
            Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BOLTemplate
