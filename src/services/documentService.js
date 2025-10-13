/**
 * Document Generation Service
 * Generates BOL, POD, and Rate Confirmation PDFs
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { prisma } = require('../db/prisma');

// Ensure documents directory exists
const DOCUMENTS_DIR = path.join(__dirname, '../../documents');
if (!fs.existsSync(DOCUMENTS_DIR)) {
  fs.mkdirSync(DOCUMENTS_DIR, { recursive: true });
}

/**
 * Generate Bill of Lading (BOL) PDF
 * @param {string} loadId - Load ID
 * @returns {Promise<string>} Path to generated PDF
 */
async function generateBOL(loadId) {
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

  const doc = new PDFDocument({ margin: 50 });
  const filePath = path.join(DOCUMENTS_DIR, `bol_${loadId}.pdf`);
  
  // Pipe to file
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  // Header
  doc.fontSize(20).text('BILL OF LADING', { align: 'center' });
  doc.moveDown();
  
  // BOL Number & Date
  doc.fontSize(10);
  doc.text(`BOL #: ${loadId}`, 50, 100);
  doc.text(`Release #: ${load.releaseNumber || 'TBD'}`, 50, 115);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 50, 130);

  // Broker Info
  doc.moveDown();
  doc.fontSize(12).text('BROKER:', 50, 160);
  doc.fontSize(10);
  doc.text('Superior One Logistics', 50, 180);
  doc.text('MC #: [TO BE ASSIGNED]', 50, 195);
  doc.text('Phone: (512) 555-XXXX', 50, 210);

  // Shipper Info
  doc.fontSize(12).text('SHIPPER:', 300, 160);
  doc.fontSize(10);
  doc.text(load.shipper.name, 300, 180);
  const origin = typeof load.origin === 'string' ? JSON.parse(load.origin) : load.origin;
  doc.text(origin.address || origin.siteName, 300, 195);
  doc.text(`${origin.city}, ${origin.state} ${origin.zip || ''}`, 300, 210);

  // Carrier Info
  doc.fontSize(12).text('CARRIER:', 50, 250);
  doc.fontSize(10);
  doc.text(load.carrier?.name || 'TBD', 50, 270);
  doc.text(`MC #: ${load.carrier?.mcNumber || 'N/A'}`, 50, 285);
  const driver = typeof load.driver === 'string' ? JSON.parse(load.driver) : load.driver;
  doc.text(`Driver: ${driver?.name || 'TBD'}`, 50, 300);
  doc.text(`Truck #: ${load.truckNumber || 'TBD'}`, 50, 315);

  // Consignee Info
  doc.fontSize(12).text('CONSIGNEE:', 300, 250);
  doc.fontSize(10);
  const destination = typeof load.destination === 'string' ? JSON.parse(load.destination) : load.destination;
  doc.text(destination.siteName || 'Delivery Site', 300, 270);
  doc.text(destination.address, 300, 285);
  doc.text(`${destination.city}, ${destination.state} ${destination.zip || ''}`, 300, 300);

  // Commodity Details
  doc.fontSize(12).text('COMMODITY INFORMATION:', 50, 360);
  doc.fontSize(10);
  doc.text(`Description: ${load.commodity}`, 50, 380);
  doc.text(`Quantity: ${load.units} ${load.rateMode.replace('PER_', '').toLowerCase()}`, 50, 395);
  doc.text(`Weight: To be determined at pickup`, 50, 410);
  doc.text(`Equipment Type: ${load.equipmentType}`, 50, 425);

  // Special Instructions
  if (load.releaseNotes || load.specialInstructions) {
    doc.fontSize(12).text('SPECIAL INSTRUCTIONS:', 50, 460);
    doc.fontSize(10);
    doc.text(load.releaseNotes || load.specialInstructions || '', 50, 480, { width: 500 });
  }

  // Signatures
  doc.fontSize(10);
  doc.text('SHIPPER SIGNATURE:', 50, 600);
  doc.text('_______________________________', 50, 620);
  doc.text('Name:', 50, 640);
  doc.text('Date:', 50, 655);

  doc.text('DRIVER SIGNATURE:', 300, 600);
  doc.text('_______________________________', 300, 620);
  doc.text('Name:', 300, 640);
  doc.text('Date:', 300, 655);

  // Footer
  doc.fontSize(8).text(
    'This Bill of Lading is subject to terms and conditions available at superiorone.com/terms',
    50,
    720,
    { align: 'center', width: 500 }
  );

  doc.end();

  // Wait for stream to finish
  await new Promise((resolve, reject) => {
    stream.on('finish', resolve);
    stream.on('error', reject);
  });

  return filePath;
}

/**
 * Generate Proof of Delivery (POD) template
 * @param {string} loadId - Load ID
 * @returns {Promise<string>} Path to generated PDF
 */
async function generatePODTemplate(loadId) {
  const load = await prisma.load.findUnique({
    where: { id: loadId },
    include: { shipper: true, carrier: true }
  });

  if (!load) {
    throw new Error('LOAD_NOT_FOUND');
  }

  const doc = new PDFDocument({ margin: 50 });
  const filePath = path.join(DOCUMENTS_DIR, `pod_template_${loadId}.pdf`);
  const stream = fs.createWriteStream(filePath);
  
  doc.pipe(stream);

  // Header
  doc.fontSize(20).text('PROOF OF DELIVERY', { align: 'center' });
  doc.moveDown();
  
  doc.fontSize(10);
  doc.text(`Load #: ${loadId}`, 50, 100);
  doc.text(`BOL #: ${loadId}`, 50, 115);
  doc.text(`Date: __________________`, 50, 130);

  // Load Details
  doc.fontSize(12).text('LOAD INFORMATION:', 50, 160);
  doc.fontSize(10);
  doc.text(`Commodity: ${load.commodity}`, 50, 180);
  doc.text(`Expected Quantity: ${load.units} ${load.rateMode.replace('PER_', '').toLowerCase()}`, 50, 195);
  const origin = typeof load.origin === 'string' ? JSON.parse(load.origin) : load.origin;
  const destination = typeof load.destination === 'string' ? JSON.parse(load.destination) : load.destination;
  doc.text(`Delivered From: ${origin.city}, ${origin.state}`, 50, 210);
  doc.text(`Delivered To: ${destination.city}, ${destination.state}`, 50, 225);

  // Delivery Verification
  doc.fontSize(12).text('DELIVERY VERIFICATION:', 50, 260);
  doc.fontSize(10);
  doc.text('Actual Quantity Delivered: __________________', 50, 280);
  doc.text('Condition of Material (Good/Damaged): __________________', 50, 300);
  doc.text('Delivery Time: __________________', 50, 320);
  doc.text('Receiver Name (Print): __________________', 50, 340);

  // Receiver Signature
  doc.fontSize(12).text('RECEIVER SIGNATURE:', 50, 380);
  doc.text('_______________________________', 50, 400);
  doc.fontSize(10);
  doc.text('By signing, I confirm receipt of material as described above', 50, 425);

  // Photos
  doc.fontSize(10);
  doc.text('PHOTOS REQUIRED:', 50, 460);
  doc.text('☐ Photo of delivered material', 50, 480);
  doc.text('☐ Photo of truck at delivery site', 50, 495);
  doc.text('☐ Photo of signed POD', 50, 510);

  doc.end();

  await new Promise((resolve, reject) => {
    stream.on('finish', resolve);
    stream.on('error', reject);
  });

  return filePath;
}

/**
 * Generate Rate Confirmation
 * @param {string} loadId - Load ID
 * @returns {Promise<string>} Path to generated PDF
 */
async function generateRateConfirmation(loadId) {
  const load = await prisma.load.findUnique({
    where: { id: loadId },
    include: { shipper: true, carrier: true }
  });

  if (!load) {
    throw new Error('LOAD_NOT_FOUND');
  }

  const doc = new PDFDocument({ margin: 50 });
  const filePath = path.join(DOCUMENTS_DIR, `rate_con_${loadId}.pdf`);
  const stream = fs.createWriteStream(filePath);
  
  doc.pipe(stream);

  // Header
  doc.fontSize(20).text('RATE CONFIRMATION', { align: 'center' });
  doc.moveDown();

  // Confirmation Number & Date
  doc.fontSize(10);
  doc.text(`Confirmation #: ${loadId}`, 50, 100);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 50, 115);

  // Broker Info
  doc.fontSize(12).text('BROKER:', 50, 150);
  doc.fontSize(10);
  doc.text('Superior One Logistics', 50, 170);
  doc.text('MC #: [TO BE ASSIGNED]', 50, 185);
  doc.text('Phone: (512) 555-XXXX', 50, 200);
  doc.text('Email: dispatch@superiorone.com', 50, 215);

  // Carrier Info
  doc.fontSize(12).text('CARRIER:', 300, 150);
  doc.fontSize(10);
  doc.text(load.carrier?.name || 'TBD', 300, 170);
  doc.text(`MC #: ${load.carrier?.mcNumber || 'N/A'}`, 300, 185);
  doc.text(`DOT #: ${load.carrier?.dotNumber || 'N/A'}`, 300, 200);
  doc.text(`Contact: ${load.carrier?.contactPhone || 'TBD'}`, 300, 215);

  // Load Details
  doc.fontSize(12).text('LOAD DETAILS:', 50, 260);
  doc.fontSize(10);
  doc.text(`Commodity: ${load.commodity}`, 50, 280);
  doc.text(`Quantity: ${load.units} ${load.rateMode.replace('PER_', '').toLowerCase()}`, 50, 295);
  doc.text(`Equipment: ${load.equipmentType}`, 50, 310);
  doc.text(`Miles: ${load.miles || 'TBD'}`, 50, 325);

  // Pickup
  const origin = typeof load.origin === 'string' ? JSON.parse(load.origin) : load.origin;
  doc.fontSize(12).text('PICKUP:', 50, 360);
  doc.fontSize(10);
  doc.text(origin.siteName || origin.address, 50, 380);
  doc.text(`${origin.city}, ${origin.state} ${origin.zip || ''}`, 50, 395);
  doc.text(`Date: ${new Date(load.pickupDate).toLocaleDateString()}`, 50, 410);

  // Delivery
  const destination = typeof load.destination === 'string' ? JSON.parse(load.destination) : load.destination;
  doc.fontSize(12).text('DELIVERY:', 300, 360);
  doc.fontSize(10);
  doc.text(destination.siteName || destination.address, 300, 380);
  doc.text(`${destination.city}, ${destination.state} ${destination.zip || ''}`, 300, 395);
  doc.text(`Date: ${new Date(load.deliveryDate).toLocaleDateString()}`, 300, 410);

  // Rate & Payment
  doc.fontSize(14).text('RATE & PAYMENT TERMS:', 50, 450);
  doc.fontSize(12);
  doc.text(`Rate: $${load.rate} per ${load.rateMode.replace('PER_', '').toLowerCase()}`, 50, 475);
  doc.text(`Total Amount: $${load.grossRevenue}`, 50, 495, { underline: true });
  
  doc.fontSize(10);
  doc.text('Payment Terms:', 50, 520);
  doc.text('  • Standard: Net-7 (Payment within 7 days of delivery)', 50, 535);
  doc.text('  • QuickPay: Net-3 (Payment within 3 days, 3% fee)', 50, 550);

  // Terms & Conditions
  doc.fontSize(10).text('TERMS & CONDITIONS:', 50, 590);
  doc.fontSize(8);
  doc.text('1. Carrier agrees to transport commodity as described above', 50, 610, { width: 500 });
  doc.text('2. Carrier confirms proper insurance and authority', 50, 625, { width: 500 });
  doc.text('3. Carrier will not re-broker this load', 50, 640, { width: 500 });
  doc.text('4. All loads subject to broker-carrier agreement terms', 50, 655, { width: 500 });

  // Signature
  doc.fontSize(10).text('CARRIER ACCEPTANCE:', 50, 690);
  doc.text('_______________________________', 50, 710);
  doc.text('Authorized Signature', 50, 730);
  doc.text('Date: __________________', 50, 745);

  doc.end();

  await new Promise((resolve, reject) => {
    stream.on('finish', resolve);
    stream.on('error', reject);
  });

  return filePath;
}

/**
 * Generate POD template PDF
 * @param {string} loadId - Load ID  
 * @returns {Promise<string>} Path to generated PDF
 */
async function generatePODTemplate(loadId) {
  const load = await prisma.load.findUnique({
    where: { id: loadId },
    include: { shipper: true, carrier: true }
  });

  if (!load) {
    throw new Error('LOAD_NOT_FOUND');
  }

  const doc = new PDFDocument({ margin: 50 });
  const filePath = path.join(DOCUMENTS_DIR, `pod_template_${loadId}.pdf`);
  const stream = fs.createWriteStream(filePath);
  
  doc.pipe(stream);

  // Header
  doc.fontSize(20).text('PROOF OF DELIVERY', { align: 'center' });
  doc.moveDown();
  
  doc.fontSize(10);
  doc.text(`Load #: ${loadId}`, 50, 100);
  doc.text(`BOL #: ${loadId}`, 50, 115);
  doc.text(`Date: __________________`, 50, 130);

  // Load Details
  doc.fontSize(12).text('LOAD INFORMATION:', 50, 160);
  doc.fontSize(10);
  doc.text(`Commodity: ${load.commodity}`, 50, 180);
  doc.text(`Expected Quantity: ${load.units} ${load.rateMode.replace('PER_', '').toLowerCase()}`, 50, 195);
  const origin = typeof load.origin === 'string' ? JSON.parse(load.origin) : load.origin;
  const destination = typeof load.destination === 'string' ? JSON.parse(load.destination) : load.destination;
  doc.text(`Delivered From: ${origin.city}, ${origin.state}`, 50, 210);
  doc.text(`Delivered To: ${destination.city}, ${destination.state}`, 50, 225);

  // Delivery Verification
  doc.fontSize(12).text('DELIVERY VERIFICATION:', 50, 260);
  doc.fontSize(10);
  doc.text('Actual Quantity Delivered: __________________', 50, 280);
  doc.text('Condition of Material (Good/Damaged): __________________', 50, 300);
  doc.text('Delivery Time: __________________', 50, 320);
  doc.text('Receiver Name (Print): __________________', 50, 340);

  // Receiver Signature
  doc.fontSize(12).text('RECEIVER SIGNATURE:', 50, 380);
  doc.text('_______________________________', 50, 400);
  doc.fontSize(10);
  doc.text('By signing, I confirm receipt of material as described above', 50, 425);

  // Photos Required
  doc.fontSize(10);
  doc.text('PHOTOS REQUIRED:', 50, 460);
  doc.text('☐ Photo of delivered material', 50, 480);
  doc.text('☐ Photo of truck at delivery site', 50, 495);
  doc.text('☐ Photo of signed POD', 50, 510);

  doc.end();

  await new Promise((resolve, reject) => {
    stream.on('finish', resolve);
    stream.on('error', reject);
  });

  return filePath;
}

/**
 * Generate Rate Confirmation PDF
 * @param {string} loadId - Load ID
 * @returns {Promise<string>} Path to generated PDF
 */
async function generateRateConfirmation(loadId) {
  const load = await prisma.load.findUnique({
    where: { id: loadId },
    include: { shipper: true, carrier: true }
  });

  if (!load) {
    throw new Error('LOAD_NOT_FOUND');
  }

  const doc = new PDFDocument({ margin: 50 });
  const filePath = path.join(DOCUMENTS_DIR, `rate_con_${loadId}.pdf`);
  const stream = fs.createWriteStream(filePath);
  
  doc.pipe(stream);

  // Header
  doc.fontSize(20).text('RATE CONFIRMATION', { align: 'center' });
  doc.moveDown();

  // Confirmation Number & Date
  doc.fontSize(10);
  doc.text(`Confirmation #: ${loadId}`, 50, 100);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 50, 115);

  // Broker Info
  doc.fontSize(12).text('BROKER:', 50, 150);
  doc.fontSize(10);
  doc.text('Superior One Logistics', 50, 170);
  doc.text('MC #: [TO BE ASSIGNED]', 50, 185);
  doc.text('Phone: (512) 555-XXXX', 50, 200);
  doc.text('Email: dispatch@superiorone.com', 50, 215);

  // Carrier Info
  doc.fontSize(12).text('CARRIER:', 300, 150);
  doc.fontSize(10);
  doc.text(load.carrier?.name || 'TBD', 300, 170);
  doc.text(`MC #: ${load.carrier?.mcNumber || 'N/A'}`, 300, 185);
  doc.text(`DOT #: ${load.carrier?.dotNumber || 'N/A'}`, 300, 200);
  doc.text(`Contact: ${load.carrier?.contactPhone || 'TBD'}`, 300, 215);

  // Load Details
  doc.fontSize(12).text('LOAD DETAILS:', 50, 260);
  doc.fontSize(10);
  doc.text(`Commodity: ${load.commodity}`, 50, 280);
  doc.text(`Quantity: ${load.units} ${load.rateMode.replace('PER_', '').toLowerCase()}`, 50, 295);
  doc.text(`Equipment: ${load.equipmentType}`, 50, 310);
  doc.text(`Miles: ${load.miles || 'TBD'}`, 50, 325);

  // Pickup
  const origin = typeof load.origin === 'string' ? JSON.parse(load.origin) : load.origin;
  doc.fontSize(12).text('PICKUP:', 50, 360);
  doc.fontSize(10);
  doc.text(origin.siteName || origin.address, 50, 380);
  doc.text(`${origin.city}, ${origin.state} ${origin.zip || ''}`, 50, 395);
  doc.text(`Date: ${new Date(load.pickupDate).toLocaleDateString()}`, 50, 410);

  // Delivery
  const destination = typeof load.destination === 'string' ? JSON.parse(load.destination) : load.destination;
  doc.fontSize(12).text('DELIVERY:', 300, 360);
  doc.fontSize(10);
  doc.text(destination.siteName || destination.address, 300, 380);
  doc.text(`${destination.city}, ${destination.state} ${destination.zip || ''}`, 300, 395);
  doc.text(`Date: ${new Date(load.deliveryDate).toLocaleDateString()}`, 300, 410);

  // Rate & Payment
  doc.fontSize(14).text('RATE & PAYMENT TERMS:', 50, 450);
  doc.fontSize(12);
  doc.text(`Rate: $${load.rate} per ${load.rateMode.replace('PER_', '').toLowerCase()}`, 50, 475);
  doc.text(`Total Amount: $${load.grossRevenue}`, 50, 495, { underline: true });
  
  doc.fontSize(10);
  doc.text('Payment Terms:', 50, 520);
  doc.text('  • Standard: Net-7 (Payment within 7 days of delivery)', 50, 535);
  doc.text('  • QuickPay: Net-3 (Payment within 3 days, 3% fee)', 50, 550);

  // Terms & Conditions
  doc.fontSize(10).text('TERMS & CONDITIONS:', 50, 590);
  doc.fontSize(8);
  doc.text('1. Carrier agrees to transport commodity as described above', 50, 610, { width: 500 });
  doc.text('2. Carrier confirms proper insurance and authority', 50, 625, { width: 500 });
  doc.text('3. Carrier will not re-broker this load', 50, 640, { width: 500 });
  doc.text('4. All loads subject to broker-carrier agreement terms', 50, 655, { width: 500 });

  // Signature
  doc.fontSize(10).text('CARRIER ACCEPTANCE:', 50, 690);
  doc.text('_______________________________', 50, 710);
  doc.text('Authorized Signature', 50, 730);
  doc.text('Date: __________________', 50, 745);

  doc.end();

  await new Promise((resolve, reject) => {
    stream.on('finish', resolve);
    stream.on('error', reject);
  });

  return filePath;
}

module.exports = {
  generateBOL,
  generatePODTemplate,
  generateRateConfirmation
};

