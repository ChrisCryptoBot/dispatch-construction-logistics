/**
 * E-Signature Service
 * Handles electronic signature capture and document finalization
 */

const { prisma } = require('../db/prisma');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const DOCUMENTS_DIR = path.join(__dirname, '../../documents');
const SIGNED_DIR = path.join(DOCUMENTS_DIR, 'signed');

// Ensure directories exist
if (!fs.existsSync(DOCUMENTS_DIR)) {
  fs.mkdirSync(DOCUMENTS_DIR, { recursive: true });
}
if (!fs.existsSync(SIGNED_DIR)) {
  fs.mkdirSync(SIGNED_DIR, { recursive: true });
}

/**
 * Create e-sign BOL with all load data pre-filled
 * Only signature fields are empty for electronic capture
 * @param {string} loadId - Load ID
 * @returns {Promise<Object>} E-sign BOL data
 */
async function createESignBOL(loadId) {
  const load = await prisma.load.findUnique({
    where: { id: loadId },
    include: {
      shipper: true,
      carrier: true
    }
  });

  if (!load) {
    throw new Error('LOAD_NOT_FOUND');
  }

  const origin = typeof load.origin === 'string' ? JSON.parse(load.origin) : load.origin;
  const destination = typeof load.destination === 'string' ? JSON.parse(load.destination) : load.destination;
  const driver = typeof load.driver === 'string' ? JSON.parse(load.driver) : load.driver;

  // Create BOL data structure for e-signature
  const bolData = {
    id: `bol_${loadId}`,
    loadId: loadId,
    documentType: 'BOL',
    createdAt: new Date().toISOString(),
    
    // Pre-filled data
    bolNumber: loadId,
    releaseNumber: load.releaseNumber,
    date: new Date().toLocaleDateString(),
    
    broker: {
      name: 'Superior One Logistics',
      mc: '[TO BE ASSIGNED]',
      phone: '(512) 555-XXXX',
      email: 'dispatch@superiorone.com'
    },
    
    shipper: {
      name: load.shipper.name,
      address: origin.address || origin.siteName,
      city: origin.city,
      state: origin.state,
      zip: origin.zip || '',
      contact: load.pickupContact?.name || '',
      phone: load.pickupContact?.phone || ''
    },
    
    carrier: {
      name: load.carrier?.name || '',
      mc: load.carrier?.mcNumber || 'N/A',
      driver: driver?.name || '',
      phone: driver?.phone || '',
      truck: load.truckNumber || '',
      trailer: load.trailerNumber || ''
    },
    
    consignee: {
      name: destination.siteName || 'Delivery Site',
      address: destination.address,
      city: destination.city,
      state: destination.state,
      zip: destination.zip || '',
      contact: load.deliveryContact?.name || '',
      phone: load.deliveryContact?.phone || ''
    },
    
    commodity: {
      description: load.commodity,
      quantity: `${load.units} ${load.rateMode.replace('PER_', '').toLowerCase()}`,
      weight: 'To be determined at pickup',
      equipmentType: load.equipmentType
    },
    
    specialInstructions: load.releaseNotes || load.specialInstructions || '',
    
    // Signature fields (empty, to be filled via e-sign)
    signatures: {
      shipper: {
        signatureData: null,
        signedBy: null,
        signedAt: null,
        ipAddress: null
      },
      driver: {
        signatureData: null,
        signedBy: null,
        signedAt: null,
        ipAddress: null
      }
    },
    
    status: 'PENDING_SIGNATURES'
  };

  // Save to database for tracking
  await prisma.document.create({
    data: {
      loadId,
      type: 'BOL',
      url: `esign/bol_${loadId}.json`,
      status: 'PENDING_SIGNATURES',
      metadata: JSON.stringify(bolData)
    }
  });

  return bolData;
}

/**
 * Create e-sign POD with all load data pre-filled
 * @param {string} loadId - Load ID
 * @returns {Promise<Object>} E-sign POD data
 */
async function createESignPOD(loadId) {
  const load = await prisma.load.findUnique({
    where: { id: loadId },
    include: {
      shipper: true,
      carrier: true
    }
  });

  if (!load) {
    throw new Error('LOAD_NOT_FOUND');
  }

  const origin = typeof load.origin === 'string' ? JSON.parse(load.origin) : load.origin;
  const destination = typeof load.destination === 'string' ? JSON.parse(load.destination) : load.destination;
  const driver = typeof load.driver === 'string' ? JSON.parse(load.driver) : load.driver;

  // Create POD data structure for e-signature
  const podData = {
    id: `pod_${loadId}`,
    loadId: loadId,
    documentType: 'POD',
    createdAt: new Date().toISOString(),
    
    // Pre-filled data
    loadNumber: loadId,
    bolNumber: loadId,
    date: new Date().toLocaleDateString(),
    
    loadInfo: {
      commodity: load.commodity,
      expectedQuantity: `${load.units} ${load.rateMode.replace('PER_', '').toLowerCase()}`,
      from: `${origin.city}, ${origin.state}`,
      to: `${destination.city}, ${destination.state}`
    },
    
    // Delivery verification (to be filled at delivery)
    deliveryData: {
      actualQuantity: null, // Filled by receiver
      condition: null, // GOOD, DAMAGED, etc.
      deliveryTime: null,
      receiverName: null,
      notes: null
    },
    
    // Signature fields (empty, to be filled via e-sign)
    signatures: {
      receiver: {
        signatureData: null,
        signedBy: null,
        signedAt: null,
        ipAddress: null
      },
      driver: {
        signatureData: null,
        signedBy: null,
        signedAt: null,
        ipAddress: null
      }
    },
    
    // Photo requirements
    photosRequired: [
      'Photo of delivered material',
      'Photo of truck at delivery site',
      'Photo of signed POD'
    ],
    photos: [],
    
    status: 'PENDING_DELIVERY'
  };

  // Save to database
  await prisma.document.create({
    data: {
      loadId,
      type: 'POD',
      url: `esign/pod_${loadId}.json`,
      status: 'PENDING_DELIVERY',
      metadata: JSON.stringify(podData)
    }
  });

  return podData;
}

/**
 * Sign BOL electronically (shipper or driver signature)
 * @param {string} loadId - Load ID
 * @param {string} signatureType - 'SHIPPER' or 'DRIVER'
 * @param {Object} signatureData - Signature data from canvas
 * @param {string} signedBy - Name of person signing
 * @param {string} ipAddress - IP address of signer
 */
async function signBOL(loadId, signatureType, signatureData, signedBy, ipAddress) {
  const document = await prisma.document.findFirst({
    where: {
      loadId,
      type: 'BOL'
    }
  });

  if (!document) {
    throw new Error('BOL_NOT_FOUND');
  }

  const bolData = JSON.parse(document.metadata);

  // Add signature
  if (signatureType === 'SHIPPER') {
    bolData.signatures.shipper = {
      signatureData,
      signedBy,
      signedAt: new Date().toISOString(),
      ipAddress
    };
  } else if (signatureType === 'DRIVER') {
    bolData.signatures.driver = {
      signatureData,
      signedBy,
      signedAt: new Date().toISOString(),
      ipAddress
    };
  }

  // Check if both signatures collected
  const fullySigned = bolData.signatures.shipper.signatureData && bolData.signatures.driver.signatureData;

  if (fullySigned) {
    bolData.status = 'FULLY_SIGNED';
    
    // Generate final signed PDF
    const signedPdfPath = await generateSignedBOLPDF(loadId, bolData);
    
    // Update load
    await prisma.load.update({
      where: { id: loadId },
      data: {
        bolUploaded: true,
        bolDocumentUrl: signedPdfPath
      }
    });

    // Email signed BOL to both parties
    const emailService = require('./emailService');
    await emailService.sendSignedBOL(loadId, signedPdfPath);
  }

  // Update document metadata
  await prisma.document.update({
    where: { id: document.id },
    data: {
      metadata: JSON.stringify(bolData),
      status: fullySigned ? 'SIGNED' : 'PENDING_SIGNATURES'
    }
  });

  return {
    success: true,
    fullySigned,
    signatureType,
    signedBy,
    message: fullySigned 
      ? 'BOL fully signed. Emailed to customer and carrier.'
      : `${signatureType} signature captured. Waiting for ${signatureType === 'SHIPPER' ? 'driver' : 'shipper'} signature.`
  };
}

/**
 * Sign POD electronically (receiver or driver signature)
 * @param {string} loadId - Load ID
 * @param {string} signatureType - 'RECEIVER' or 'DRIVER'
 * @param {Object} deliveryData - Delivery verification data
 * @param {Object} signatureData - Signature data from canvas
 * @param {string} signedBy - Name of person signing
 * @param {string} ipAddress - IP address of signer
 */
async function signPOD(loadId, signatureType, deliveryData, signatureData, signedBy, ipAddress) {
  const document = await prisma.document.findFirst({
    where: {
      loadId,
      type: 'POD'
    }
  });

  if (!document) {
    throw new Error('POD_NOT_FOUND');
  }

  const podData = JSON.parse(document.metadata);

  // Update delivery data if receiver is signing
  if (signatureType === 'RECEIVER' && deliveryData) {
    podData.deliveryData = {
      actualQuantity: deliveryData.actualQuantity,
      condition: deliveryData.condition,
      deliveryTime: new Date().toISOString(),
      receiverName: signedBy,
      notes: deliveryData.notes || ''
    };
  }

  // Add signature
  if (signatureType === 'RECEIVER') {
    podData.signatures.receiver = {
      signatureData,
      signedBy,
      signedAt: new Date().toISOString(),
      ipAddress
    };
  } else if (signatureType === 'DRIVER') {
    podData.signatures.driver = {
      signatureData,
      signedBy,
      signedAt: new Date().toISOString(),
      ipAddress
    };
  }

  // Check if both signatures collected
  const fullySigned = podData.signatures.receiver.signatureData && podData.signatures.driver.signatureData;

  if (fullySigned) {
    podData.status = 'FULLY_SIGNED';
    
    // Generate final signed PDF
    const signedPdfPath = await generateSignedPODPDF(loadId, podData);
    
    // Update load
    await prisma.load.update({
      where: { id: loadId },
      data: {
        podUploaded: true,
        podDocumentUrl: signedPdfPath,
        status: 'DELIVERED' // Auto-advance to DELIVERED when POD signed
      }
    });

    // Email signed POD to both parties
    const emailService = require('./emailService');
    await emailService.sendSignedPOD(loadId, signedPdfPath);
  }

  // Update document metadata
  await prisma.document.update({
    where: { id: document.id },
    data: {
      metadata: JSON.stringify(podData),
      status: fullySigned ? 'SIGNED' : 'PENDING_SIGNATURES'
    }
  });

  return {
    success: true,
    fullySigned,
    signatureType,
    signedBy,
    deliveryData: podData.deliveryData,
    message: fullySigned 
      ? 'POD fully signed. Load marked as DELIVERED. Emailed to customer and carrier.'
      : `${signatureType} signature captured. Waiting for ${signatureType === 'RECEIVER' ? 'driver' : 'receiver'} signature.`
  };
}

/**
 * Generate final signed BOL PDF with embedded signatures
 * @param {string} loadId - Load ID
 * @param {Object} bolData - BOL data with signatures
 * @returns {Promise<string>} Path to signed PDF
 */
async function generateSignedBOLPDF(loadId, bolData) {
  const doc = new PDFDocument({ margin: 50 });
  const filePath = path.join(SIGNED_DIR, `bol_signed_${loadId}_${Date.now()}.pdf`);
  const stream = fs.createWriteStream(filePath);
  
  doc.pipe(stream);

  // Header
  doc.fontSize(20).text('BILL OF LADING', { align: 'center' });
  doc.fontSize(10).fillColor('#10b981').text('✓ ELECTRONICALLY SIGNED', { align: 'center' });
  doc.fillColor('#000000');
  doc.moveDown();
  
  // BOL Info
  doc.fontSize(10);
  doc.text(`BOL #: ${bolData.bolNumber}`, 50, 100);
  doc.text(`Release #: ${bolData.releaseNumber}`, 50, 115);
  doc.text(`Date: ${bolData.date}`, 50, 130);

  // Broker Info
  doc.fontSize(12).text('BROKER:', 50, 160);
  doc.fontSize(10);
  doc.text(bolData.broker.name, 50, 180);
  doc.text(`MC #: ${bolData.broker.mc}`, 50, 195);
  doc.text(`Phone: ${bolData.broker.phone}`, 50, 210);

  // Shipper Info
  doc.fontSize(12).text('SHIPPER:', 300, 160);
  doc.fontSize(10);
  doc.text(bolData.shipper.name, 300, 180);
  doc.text(bolData.shipper.address, 300, 195);
  doc.text(`${bolData.shipper.city}, ${bolData.shipper.state} ${bolData.shipper.zip}`, 300, 210);

  // Carrier Info
  doc.fontSize(12).text('CARRIER:', 50, 250);
  doc.fontSize(10);
  doc.text(bolData.carrier.name, 50, 270);
  doc.text(`MC #: ${bolData.carrier.mc}`, 50, 285);
  doc.text(`Driver: ${bolData.carrier.driver}`, 50, 300);
  doc.text(`Truck #: ${bolData.carrier.truck}`, 50, 315);

  // Consignee Info
  doc.fontSize(12).text('CONSIGNEE:', 300, 250);
  doc.fontSize(10);
  doc.text(bolData.consignee.name, 300, 270);
  doc.text(bolData.consignee.address, 300, 285);
  doc.text(`${bolData.consignee.city}, ${bolData.consignee.state} ${bolData.consignee.zip}`, 300, 300);

  // Commodity Details
  doc.fontSize(12).text('COMMODITY:', 50, 360);
  doc.fontSize(10);
  doc.text(`Description: ${bolData.commodity.description}`, 50, 380);
  doc.text(`Quantity: ${bolData.commodity.quantity}`, 50, 395);
  doc.text(`Equipment: ${bolData.commodity.equipmentType}`, 50, 410);

  // Special Instructions
  if (bolData.specialInstructions) {
    doc.fontSize(12).text('SPECIAL INSTRUCTIONS:', 50, 450);
    doc.fontSize(10);
    doc.text(bolData.specialInstructions, 50, 470, { width: 500 });
  }

  // E-Signatures
  const sigY = bolData.specialInstructions ? 540 : 500;
  
  // Shipper signature
  doc.fontSize(10).text('SHIPPER E-SIGNATURE:', 50, sigY);
  if (bolData.signatures.shipper.signatureData) {
    // Embed signature image (base64 to image)
    const sigImage = Buffer.from(bolData.signatures.shipper.signatureData.split(',')[1], 'base64');
    doc.image(sigImage, 50, sigY + 20, { width: 200, height: 50 });
    doc.text(`Signed by: ${bolData.signatures.shipper.signedBy}`, 50, sigY + 75);
    doc.text(`Date: ${new Date(bolData.signatures.shipper.signedAt).toLocaleString()}`, 50, sigY + 90);
  }

  // Driver signature
  doc.text('DRIVER E-SIGNATURE:', 300, sigY);
  if (bolData.signatures.driver.signatureData) {
    const sigImage = Buffer.from(bolData.signatures.driver.signatureData.split(',')[1], 'base64');
    doc.image(sigImage, 300, sigY + 20, { width: 200, height: 50 });
    doc.text(`Signed by: ${bolData.signatures.driver.signedBy}`, 300, sigY + 75);
    doc.text(`Date: ${new Date(bolData.signatures.driver.signedAt).toLocaleString()}`, 300, sigY + 90);
  }

  // Footer
  doc.fontSize(8).text(
    'This is a legally binding electronic document. IP addresses and timestamps are recorded for verification.',
    50,
    720,
    { align: 'center', width: 500 }
  );

  doc.end();

  await new Promise((resolve, reject) => {
    stream.on('finish', resolve);
    stream.on('error', reject);
  });

  return filePath;
}

/**
 * Generate final signed POD PDF with embedded signatures
 * @param {string} loadId - Load ID
 * @param {Object} podData - POD data with signatures
 * @returns {Promise<string>} Path to signed PDF
 */
async function generateSignedPODPDF(loadId, podData) {
  const doc = new PDFDocument({ margin: 50 });
  const filePath = path.join(SIGNED_DIR, `pod_signed_${loadId}_${Date.now()}.pdf`);
  const stream = fs.createWriteStream(filePath);
  
  doc.pipe(stream);

  // Header
  doc.fontSize(20).text('PROOF OF DELIVERY', { align: 'center' });
  doc.fontSize(10).fillColor('#10b981').text('✓ ELECTRONICALLY SIGNED', { align: 'center' });
  doc.fillColor('#000000');
  doc.moveDown();
  
  // Document Info
  doc.fontSize(10);
  doc.text(`Load #: ${podData.loadNumber}`, 50, 100);
  doc.text(`BOL #: ${podData.bolNumber}`, 50, 115);
  doc.text(`Date: ${podData.date}`, 50, 130);

  // Load Information
  doc.fontSize(12).text('LOAD INFORMATION:', 50, 160);
  doc.fontSize(10);
  doc.text(`Commodity: ${podData.loadInfo.commodity}`, 50, 180);
  doc.text(`Expected Quantity: ${podData.loadInfo.expectedQuantity}`, 50, 195);
  doc.text(`From: ${podData.loadInfo.from}`, 50, 210);
  doc.text(`To: ${podData.loadInfo.to}`, 50, 225);

  // Delivery Verification
  doc.fontSize(12).text('DELIVERY VERIFICATION:', 50, 260);
  doc.fontSize(10);
  doc.text(`Actual Quantity Delivered: ${podData.deliveryData.actualQuantity || 'N/A'}`, 50, 280);
  doc.text(`Condition: ${podData.deliveryData.condition || 'N/A'}`, 50, 295);
  doc.text(`Delivery Time: ${podData.deliveryData.deliveryTime ? new Date(podData.deliveryData.deliveryTime).toLocaleString() : 'N/A'}`, 50, 310);
  doc.text(`Receiver: ${podData.deliveryData.receiverName || 'N/A'}`, 50, 325);

  if (podData.deliveryData.notes) {
    doc.text(`Notes: ${podData.deliveryData.notes}`, 50, 340, { width: 500 });
  }

  // E-Signatures
  const sigY = 400;
  
  // Receiver signature
  doc.fontSize(10).text('RECEIVER E-SIGNATURE:', 50, sigY);
  if (podData.signatures.receiver.signatureData) {
    const sigImage = Buffer.from(podData.signatures.receiver.signatureData.split(',')[1], 'base64');
    doc.image(sigImage, 50, sigY + 20, { width: 200, height: 50 });
    doc.text(`Signed by: ${podData.signatures.receiver.signedBy}`, 50, sigY + 75);
    doc.text(`Date: ${new Date(podData.signatures.receiver.signedAt).toLocaleString()}`, 50, sigY + 90);
  }

  // Driver signature
  doc.text('DRIVER E-SIGNATURE:', 300, sigY);
  if (podData.signatures.driver.signatureData) {
    const sigImage = Buffer.from(podData.signatures.driver.signatureData.split(',')[1], 'base64');
    doc.image(sigImage, 300, sigY + 20, { width: 200, height: 50 });
    doc.text(`Signed by: ${podData.signatures.driver.signedBy}`, 300, sigY + 75);
    doc.text(`Date: ${new Date(podData.signatures.driver.signedAt).toLocaleString()}`, 300, sigY + 90);
  }

  // Verification statement
  doc.fontSize(8).text(
    'By signing electronically, receiver confirms receipt of material as described. IP addresses and timestamps recorded for legal verification.',
    50,
    720,
    { align: 'center', width: 500 }
  );

  doc.end();

  await new Promise((resolve, reject) => {
    stream.on('finish', resolve);
    stream.on('error', reject);
  });

  return filePath;
}

/**
 * Get e-sign document for signing
 * @param {string} loadId - Load ID
 * @param {string} type - 'BOL' or 'POD'
 */
async function getESignDocument(loadId, type) {
  const document = await prisma.document.findFirst({
    where: {
      loadId,
      type
    }
  });

  if (!document) {
    throw new Error(`${type}_NOT_FOUND`);
  }

  return JSON.parse(document.metadata);
}

module.exports = {
  createESignBOL,
  createESignPOD,
  signBOL,
  signPOD,
  getESignDocument
};
