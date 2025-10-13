/**
 * Stripe Payment Adapter
 * Handles customer charges and carrier payouts via Stripe Connect
 * 
 * Note: Requires Stripe API key in environment
 * Set STRIPE_SECRET_KEY in .env
 */

// Mock Stripe for development (will use real Stripe when key provided)
const STRIPE_ENABLED = !!process.env.STRIPE_SECRET_KEY;

let stripe = null;

if (STRIPE_ENABLED) {
  const Stripe = require('stripe');
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-06-20'
  });
}

/**
 * Charge customer for completed load
 * @param {string} customerStripeId - Customer's Stripe ID
 * @param {number} amountCents - Amount in cents
 * @param {Object} metadata - Additional metadata
 * @returns {Promise<Object>} Payment result
 */
async function chargeCustomer(customerStripeId, amountCents, metadata = {}) {
  if (!STRIPE_ENABLED) {
    // Mock mode for development
    console.log(`[MOCK] Charging customer ${customerStripeId}: $${(amountCents / 100).toFixed(2)}`);
    return {
      id: `mock_pi_${Date.now()}`,
      status: 'succeeded',
      amount: amountCents,
      created: Math.floor(Date.now() / 1000)
    };
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: 'usd',
      customer: customerStripeId,
      metadata,
      confirm: true,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never'
      }
    });

    return {
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      created: paymentIntent.created
    };

  } catch (error) {
    console.error('Stripe charge error:', error);
    throw new Error(`Payment failed: ${error.message}`);
  }
}

/**
 * Transfer funds to carrier (Connect account)
 * @param {string} connectAccountId - Carrier's Stripe Connect account ID
 * @param {number} amountCents - Amount in cents
 * @param {Object} metadata - Additional metadata
 * @returns {Promise<Object>} Transfer result
 */
async function transferToCarrier(connectAccountId, amountCents, metadata = {}) {
  if (!STRIPE_ENABLED) {
    // Mock mode for development
    console.log(`[MOCK] Transferring to carrier ${connectAccountId}: $${(amountCents / 100).toFixed(2)}`);
    return {
      id: `mock_tr_${Date.now()}`,
      amount: amountCents,
      created: Math.floor(Date.now() / 1000),
      destination: connectAccountId
    };
  }

  try {
    const transfer = await stripe.transfers.create({
      amount: amountCents,
      currency: 'usd',
      destination: connectAccountId,
      metadata
    });

    return {
      id: transfer.id,
      amount: transfer.amount,
      created: transfer.created,
      destination: transfer.destination
    };

  } catch (error) {
    console.error('Stripe transfer error:', error);
    throw new Error(`Transfer failed: ${error.message}`);
  }
}

/**
 * Create Stripe Connect account for carrier
 * @param {Object} carrierInfo - Carrier information
 * @returns {Promise<string>} Connect account ID
 */
async function createConnectAccount(carrierInfo) {
  if (!STRIPE_ENABLED) {
    console.log(`[MOCK] Creating Connect account for ${carrierInfo.businessName}`);
    return `mock_acct_${Date.now()}`;
  }

  try {
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'US',
      email: carrierInfo.email,
      business_type: 'company',
      company: {
        name: carrierInfo.businessName,
        tax_id: carrierInfo.ein,
        phone: carrierInfo.phone
      },
      capabilities: {
        transfers: { requested: true }
      }
    });

    return account.id;

  } catch (error) {
    console.error('Create Connect account error:', error);
    throw new Error(`Failed to create payment account: ${error.message}`);
  }
}

/**
 * Refund payment to customer
 * @param {string} paymentIntentId - Original payment intent ID
 * @param {number} amountCents - Amount to refund (optional, full refund if not specified)
 * @returns {Promise<Object>} Refund result
 */
async function refundPayment(paymentIntentId, amountCents = null) {
  if (!STRIPE_ENABLED) {
    console.log(`[MOCK] Refunding ${paymentIntentId}: $${amountCents ? (amountCents / 100).toFixed(2) : 'full amount'}`);
    return {
      id: `mock_re_${Date.now()}`,
      amount: amountCents || 0,
      status: 'succeeded'
    };
  }

  try {
    const refundData = {
      payment_intent: paymentIntentId
    };

    if (amountCents) {
      refundData.amount = amountCents;
    }

    const refund = await stripe.refunds.create(refundData);

    return {
      id: refund.id,
      amount: refund.amount,
      status: refund.status
    };

  } catch (error) {
    console.error('Stripe refund error:', error);
    throw new Error(`Refund failed: ${error.message}`);
  }
}

/**
 * ESCROW FUNCTIONS: Authorize and capture payments
 */

/**
 * Authorize payment (hold funds without charging)
 * @param {string} customerStripeId - Customer's Stripe ID
 * @param {string} paymentMethodId - Payment method ID
 * @param {number} amountCents - Amount in cents
 * @param {Object} metadata - Additional metadata
 * @returns {Promise<Object>} PaymentIntent
 */
async function authorizePayment(customerStripeId, paymentMethodId, amountCents, metadata = {}) {
  if (!STRIPE_ENABLED) {
    console.log(`[MOCK] Authorizing payment for ${customerStripeId}: $${(amountCents / 100).toFixed(2)}`);
    return {
      id: `mock_pi_auth_${Date.now()}`,
      status: 'requires_capture',
      amount: amountCents,
      created: Math.floor(Date.now() / 1000)
    };
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: 'usd',
      customer: customerStripeId,
      payment_method: paymentMethodId,
      capture_method: 'manual', // KEY: Manual capture for escrow
      confirm: true,
      off_session: true,
      metadata
    });

    return {
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      created: paymentIntent.created
    };

  } catch (error) {
    console.error('Stripe authorization error:', error);
    throw new Error(`Authorization failed: ${error.message}`);
  }
}

/**
 * Capture authorized payment (actually charge the card)
 * @param {string} paymentIntentId - PaymentIntent ID to capture
 * @returns {Promise<Object>} Captured payment
 */
async function capturePayment(paymentIntentId) {
  if (!STRIPE_ENABLED) {
    console.log(`[MOCK] Capturing payment ${paymentIntentId}`);
    return {
      id: paymentIntentId,
      status: 'succeeded',
      amount_captured: 0
    };
  }

  try {
    const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId);

    return {
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount_captured: paymentIntent.amount_captured
    };

  } catch (error) {
    console.error('Stripe capture error:', error);
    throw new Error(`Capture failed: ${error.message}`);
  }
}

/**
 * Cancel payment authorization (release the hold)
 * @param {string} paymentIntentId - PaymentIntent ID to cancel
 * @returns {Promise<Object>} Cancelled payment
 */
async function cancelPayment(paymentIntentId) {
  if (!STRIPE_ENABLED) {
    console.log(`[MOCK] Cancelling payment ${paymentIntentId}`);
    return {
      id: paymentIntentId,
      status: 'canceled'
    };
  }

  try {
    const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);

    return {
      id: paymentIntent.id,
      status: paymentIntent.status
    };

  } catch (error) {
    console.error('Stripe cancel error:', error);
    throw new Error(`Cancellation failed: ${error.message}`);
  }
}

module.exports = {
  chargeCustomer,
  transferToCarrier,
  createConnectAccount,
  refundPayment,
  authorizePayment,
  capturePayment,
  cancelPayment,
  STRIPE_ENABLED
};

