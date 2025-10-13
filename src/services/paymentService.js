const { prisma } = require('../db/prisma');
const stripeAdapter = require('../adapters/stripeAdapter');

/**
 * Payment Service
 * Handles invoicing, customer charges, and carrier payouts
 */

const PLATFORM_FEE_PERCENT = parseFloat(process.env.PLATFORM_FEE_PERCENT || '0.06'); // 6%
const QUICK_PAY_FEE_PERCENT = parseFloat(process.env.QUICK_PAY_FEE_PERCENT || '0.02'); // 2%
const NET_TERMS_DAYS = parseInt(process.env.NET_TERMS_DAYS || '30'); // Net 30

/**
 * Create invoice for completed load
 * @param {string} loadId - Load ID
 * @returns {Promise<Object>} Invoice record
 */
async function createInvoice(loadId) {
  const load = await prisma.load.findUnique({
    where: { id: loadId },
    select: {
      id: true,
      shipperId: true,
      grossRevenue: true,
      status: true,
      completedAt: true
    }
  });

  if (!load) {
    throw new Error('LOAD_NOT_FOUND');
  }

  if (load.status !== 'COMPLETED') {
    throw new Error('LOAD_NOT_COMPLETED');
  }

  // Check if invoice already exists
  const existing = await prisma.invoice.findUnique({
    where: { loadId }
  });

  if (existing) {
    return existing; // Already invoiced
  }

  // Convert grossRevenue to cents
  const grossRevenueCents = Math.round(parseFloat(load.grossRevenue) * 100);

  // Calculate due date (Net 30)
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + NET_TERMS_DAYS);

  // Create invoice
  const invoice = await prisma.invoice.create({
    data: {
      loadId,
      customerId: load.shipperId,
      amountCents: grossRevenueCents,
      status: 'DRAFTED',
      issuedAt: new Date(),
      dueDate
    }
  });

  return invoice;
}

/**
 * Charge customer for invoice
 * @param {string} invoiceId - Invoice ID
 * @returns {Promise<Object>} Charge result
 */
async function chargeInvoice(invoiceId) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId }
  });

  if (!invoice) {
    throw new Error('INVOICE_NOT_FOUND');
  }

  if (invoice.status === 'PAID') {
    return { success: true, message: 'Invoice already paid', invoice };
  }

  try {
    // Get customer's Stripe ID (would be stored on Organization)
    // For now, use mock mode
    const customerStripeId = `cus_mock_${invoice.customerId}`;

    const payment = await stripeAdapter.chargeCustomer(
      customerStripeId,
      invoice.amountCents,
      {
        loadId: invoice.loadId,
        invoiceId: invoice.id
      }
    );

    // Update invoice
    const updated = await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: payment.status === 'succeeded' ? 'PAID' : 'FAILED',
        paidAt: payment.status === 'succeeded' ? new Date() : null,
        stripePaymentIntentId: payment.id
      }
    });

    return {
      success: payment.status === 'succeeded',
      invoice: updated,
      payment
    };

  } catch (error) {
    // Mark invoice as failed
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: 'FAILED' }
    });

    throw error;
  }
}

/**
 * Create payout for carrier
 * @param {string} loadId - Load ID
 * @param {boolean} quickPay - Use QuickPay option (2% fee, 48-hour payout)
 * @returns {Promise<Object>} Payout record
 */
async function createPayout(loadId, quickPay = false) {
  const load = await prisma.load.findUnique({
    where: { id: loadId },
    select: {
      id: true,
      carrierId: true,
      grossRevenue: true,
      status: true
    }
  });

  if (!load) {
    throw new Error('LOAD_NOT_FOUND');
  }

  if (!load.carrierId) {
    throw new Error('LOAD_NOT_ASSIGNED');
  }

  if (load.status !== 'COMPLETED') {
    throw new Error('LOAD_NOT_COMPLETED');
  }

  // Check if payout already exists
  const existing = await prisma.payout.findUnique({
    where: { loadId }
  });

  if (existing) {
    return existing; // Already created
  }

  // Calculate amounts
  const grossRevenueCents = Math.round(parseFloat(load.grossRevenue) * 100);
  const platformFeeCents = Math.round(grossRevenueCents * PLATFORM_FEE_PERCENT);
  const quickPayFeeCents = quickPay ? Math.round(grossRevenueCents * QUICK_PAY_FEE_PERCENT) : 0;
  const carrierPayoutCents = grossRevenueCents - platformFeeCents - quickPayFeeCents;

  // Create payout record
  const payout = await prisma.payout.create({
    data: {
      loadId,
      carrierId: load.carrierId,
      amountCents: carrierPayoutCents,
      quickPay,
      quickPayFeeCents,
      platformFeeCents,
      status: 'QUEUED'
    }
  });

  return payout;
}

/**
 * Process payout to carrier
 * @param {string} payoutId - Payout ID
 * @returns {Promise<Object>} Payout result
 */
async function processPayout(payoutId) {
  const payout = await prisma.payout.findUnique({
    where: { id: payoutId }
  });

  if (!payout) {
    throw new Error('PAYOUT_NOT_FOUND');
  }

  if (payout.status === 'SENT') {
    return { success: true, message: 'Payout already processed', payout };
  }

  try {
    // Update status to processing
    await prisma.payout.update({
      where: { id: payoutId },
      data: { status: 'PROCESSING' }
    });

    // Get carrier's Stripe Connect account ID (would be stored on Organization)
    // For now, use mock
    const connectAccountId = `acct_mock_${payout.carrierId}`;

    const transfer = await stripeAdapter.transferToCarrier(
      connectAccountId,
      payout.amountCents,
      {
        loadId: payout.loadId,
        payoutId: payout.id,
        quickPay: payout.quickPay
      }
    );

    // Update payout
    const updated = await prisma.payout.update({
      where: { id: payoutId },
      data: {
        status: 'SENT',
        sentAt: new Date(),
        stripeTransferId: transfer.id,
        stripeConnectAccountId: connectAccountId
      }
    });

    return {
      success: true,
      payout: updated,
      transfer
    };

  } catch (error) {
    // Mark as failed
    await prisma.payout.update({
      where: { id: payoutId },
      data: {
        status: 'FAILED',
        failureReason: error.message
      }
    });

    throw error;
  }
}

/**
 * Complete payment workflow (invoice + payout)
 * @param {string} loadId - Load ID
 * @param {boolean} quickPay - QuickPay option for carrier
 * @returns {Promise<Object>} Complete payment result
 */
async function processLoadPayment(loadId, quickPay = false) {
  // Step 1: Create invoice
  const invoice = await createInvoice(loadId);

  // Step 2: Charge customer
  const chargeResult = await chargeInvoice(invoice.id);

  if (!chargeResult.success) {
    return {
      success: false,
      stage: 'CHARGE_FAILED',
      invoice: chargeResult.invoice,
      error: 'Customer charge failed'
    };
  }

  // Step 3: Create payout
  const payout = await createPayout(loadId, quickPay);

  // Step 4: Process payout (if QuickPay, otherwise queue for Net terms)
  if (quickPay) {
    const payoutResult = await processPayout(payout.id);
    return {
      success: true,
      stage: 'COMPLETED',
      invoice: chargeResult.invoice,
      payout: payoutResult.payout,
      quickPay: true
    };
  } else {
    // Queue for standard payment (30 days)
    return {
      success: true,
      stage: 'QUEUED',
      invoice: chargeResult.invoice,
      payout,
      quickPay: false,
      payoutScheduled: payout.quickPay ? '48 hours' : `${NET_TERMS_DAYS} days`
    };
  }
}

/**
 * Get payment summary for load
 * @param {string} loadId - Load ID
 * @returns {Promise<Object>} Payment summary
 */
async function getPaymentSummary(loadId) {
  const invoice = await prisma.invoice.findUnique({
    where: { loadId }
  });

  const payout = await prisma.payout.findUnique({
    where: { loadId }
  });

  const load = await prisma.load.findUnique({
    where: { id: loadId },
    select: { grossRevenue: true }
  });

  const grossRevenueCents = Math.round(parseFloat(load?.grossRevenue || 0) * 100);

  return {
    loadId,
    grossRevenue: (grossRevenueCents / 100).toFixed(2),
    invoice: invoice ? {
      id: invoice.id,
      status: invoice.status,
      amount: (invoice.amountCents / 100).toFixed(2),
      paidAt: invoice.paidAt
    } : null,
    payout: payout ? {
      id: payout.id,
      status: payout.status,
      amount: (payout.amountCents / 100).toFixed(2),
      platformFee: (payout.platformFeeCents / 100).toFixed(2),
      quickPayFee: payout.quickPayFeeCents ? (payout.quickPayFeeCents / 100).toFixed(2) : '0.00',
      sentAt: payout.sentAt,
      quickPay: payout.quickPay
    } : null
  };
}

/**
 * ESCROW SYSTEM: Authorize payment when released, capture when completed
 */

/**
 * Authorize (hold) payment when material released
 * Funds are reserved but not captured
 * @param {string} loadId - Load ID
 * @returns {Promise<Object>} Authorization result
 */
async function authorizePayment(loadId) {
  const load = await prisma.load.findUnique({
    where: { id: loadId },
    include: {
      shipper: {
        select: {
          id: true,
          stripeCustomerId: true,
          stripePaymentMethodId: true
        }
      }
    }
  });

  if (!load) {
    throw new Error('LOAD_NOT_FOUND');
  }

  if (load.status !== 'RELEASED') {
    throw new Error('LOAD_NOT_RELEASED');
  }

  // Check if customer has payment method
  if (!load.shipper.stripePaymentMethodId) {
    throw new Error('NO_PAYMENT_METHOD');
  }

  // Check if already authorized
  const existing = await prisma.invoice.findUnique({
    where: { loadId }
  });

  if (existing && existing.status === 'AUTHORIZED') {
    return { success: true, message: 'Payment already authorized', invoice: existing };
  }

  const grossRevenueCents = Math.round(parseFloat(load.grossRevenue) * 100);

  try {
    // Create PaymentIntent with manual capture
    const paymentIntent = await stripeAdapter.authorizePayment(
      load.shipper.stripeCustomerId,
      load.shipper.stripePaymentMethodId,
      grossRevenueCents,
      {
        loadId: load.id,
        type: 'load_payment'
      }
    );

    // Create/update invoice record
    const invoice = existing ? 
      await prisma.invoice.update({
        where: { id: existing.id },
        data: {
          status: 'AUTHORIZED',
          authorizedAt: new Date(),
          stripePaymentIntentId: paymentIntent.id
        }
      }) :
      await prisma.invoice.create({
        data: {
          loadId,
          customerId: load.shipperId,
          amountCents: grossRevenueCents,
          status: 'AUTHORIZED',
          authorizedAt: new Date(),
          issuedAt: new Date(),
          dueDate: new Date(),
          stripePaymentIntentId: paymentIntent.id
        }
      });

    return {
      success: true,
      invoice,
      paymentIntent,
      message: `$${(grossRevenueCents / 100).toFixed(2)} authorized (held, not charged yet)`
    };

  } catch (error) {
    console.error('Payment authorization error:', error);
    throw new Error(`AUTHORIZATION_FAILED: ${error.message}`);
  }
}

/**
 * Capture (actually charge) authorized payment
 * @param {string} loadId - Load ID
 * @returns {Promise<Object>} Capture result
 */
async function capturePayment(loadId) {
  const invoice = await prisma.invoice.findUnique({
    where: { loadId }
  });

  if (!invoice) {
    throw new Error('NO_INVOICE_FOUND');
  }

  if (!invoice.stripePaymentIntentId) {
    throw new Error('NO_PAYMENT_INTENT');
  }

  if (invoice.status === 'PAID') {
    return { success: true, message: 'Payment already captured', invoice };
  }

  if (invoice.status !== 'AUTHORIZED') {
    throw new Error('PAYMENT_NOT_AUTHORIZED');
  }

  try {
    // Capture the held funds
    const paymentIntent = await stripeAdapter.capturePayment(invoice.stripePaymentIntentId);

    // Update invoice
    const updated = await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        status: 'PAID',
        paidAt: new Date()
      }
    });

    return {
      success: true,
      invoice: updated,
      paymentIntent,
      message: `$${(invoice.amountCents / 100).toFixed(2)} captured successfully`
    };

  } catch (error) {
    // Mark as failed
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { 
        status: 'FAILED',
        failureReason: error.message
      }
    });

    throw new Error(`CAPTURE_FAILED: ${error.message}`);
  }
}

/**
 * Cancel payment authorization (release the hold)
 * @param {string} loadId - Load ID
 * @returns {Promise<Object>} Cancellation result
 */
async function cancelAuthorization(loadId) {
  const invoice = await prisma.invoice.findUnique({
    where: { loadId }
  });

  if (!invoice || !invoice.stripePaymentIntentId) {
    return { success: true, message: 'No authorization to cancel' };
  }

  if (invoice.status !== 'AUTHORIZED') {
    return { success: true, message: 'Payment not in authorized state' };
  }

  try {
    // Cancel the PaymentIntent (release the hold)
    await stripeAdapter.cancelPayment(invoice.stripePaymentIntentId);

    // Update invoice
    const updated = await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        status: 'CANCELLED'
      }
    });

    return {
      success: true,
      invoice: updated,
      message: 'Payment authorization cancelled, funds released'
    };

  } catch (error) {
    console.error('Payment cancellation error:', error);
    throw new Error(`CANCELLATION_FAILED: ${error.message}`);
  }
}

/**
 * Process payout asynchronously (via background job)
 * @param {string} loadId - Load ID
 * @param {boolean} quickPay - QuickPay option
 */
async function processPayoutAsync(loadId, quickPay = false) {
  // Create payout record
  const payout = await createPayout(loadId, quickPay);
  
  // Queue background job to process payout
  // (In production, would use BullMQ)
  // For now, process immediately
  return await processPayout(payout.id);
}

/**
 * Charge cancellation fee
 * @param {string} customerId - Customer org ID
 * @param {number} fee - Fee amount in dollars
 * @param {string} loadId - Associated load ID
 */
async function chargeCancellationFee(customerId, fee, loadId) {
  if (fee <= 0) {
    return { success: true, message: 'No fee to charge' };
  }

  const feeCents = Math.round(fee * 100);

  try {
    const customer = await prisma.organization.findUnique({
      where: { id: customerId },
      select: { stripeCustomerId: true, stripePaymentMethodId: true }
    });

    if (!customer.stripePaymentMethodId) {
      throw new Error('NO_PAYMENT_METHOD');
    }

    const payment = await stripeAdapter.chargeCustomer(
      customer.stripeCustomerId,
      feeCents,
      {
        loadId,
        type: 'cancellation_fee'
      }
    );

    return {
      success: payment.status === 'succeeded',
      amount: fee,
      payment
    };

  } catch (error) {
    console.error('Cancellation fee charge error:', error);
    throw error;
  }
}

/**
 * Process cancellation payout to carrier (if customer cancels after release)
 * @param {string} carrierId - Carrier org ID
 * @param {number} amount - Amount in dollars
 * @param {string} loadId - Associated load ID
 */
async function processCancellationPayout(carrierId, amount, loadId) {
  if (amount <= 0) {
    return { success: true, message: 'No compensation due' };
  }

  const amountCents = Math.round(amount * 100);

  try {
    const carrier = await prisma.organization.findUnique({
      where: { id: carrierId },
      select: { stripeConnectAccountId: true }
    });

    if (!carrier.stripeConnectAccountId) {
      throw new Error('NO_PAYOUT_ACCOUNT');
    }

    const transfer = await stripeAdapter.transferToCarrier(
      carrier.stripeConnectAccountId,
      amountCents,
      {
        loadId,
        type: 'cancellation_compensation'
      }
    );

    return {
      success: true,
      amount,
      transfer
    };

  } catch (error) {
    console.error('Cancellation payout error:', error);
    throw error;
  }
}

/**
 * Refund payment to customer (for disputes)
 * @param {string} paymentIntentId - PaymentIntent ID to refund
 * @param {number} amountCents - Amount to refund (optional, full refund if not specified)
 */
async function refundPayment(paymentIntentId, amountCents = null) {
  try {
    const refund = await stripeAdapter.refundPayment(paymentIntentId, amountCents);
    return {
      success: true,
      refund,
      amount: refund.amount / 100
    };
  } catch (error) {
    console.error('Refund error:', error);
    throw error;
  }
}

module.exports = {
  createInvoice,
  chargeInvoice,
  createPayout,
  processPayout,
  processLoadPayment,
  getPaymentSummary,
  authorizePayment,
  capturePayment,
  cancelAuthorization,
  processPayoutAsync,
  chargeCancellationFee,
  processCancellationPayout,
  refundPayment,
  PLATFORM_FEE_PERCENT,
  QUICK_PAY_FEE_PERCENT
};

