const express = require('express');
const { prisma } = require('../db/prisma');
const { authenticateJWT } = require('../middleware/auth');
const paymentService = require('../services/paymentService');

const router = express.Router();

/**
 * POST /api/payments/invoice/:loadId - Create invoice for completed load
 */
router.post('/invoice/:loadId', authenticateJWT, async (req, res) => {
  try {
    const { loadId } = req.params;

    const invoice = await paymentService.createInvoice(loadId);

    res.json({
      success: true,
      invoice: {
        id: invoice.id,
        loadId: invoice.loadId,
        amount: (invoice.amountCents / 100).toFixed(2),
        status: invoice.status,
        dueDate: invoice.dueDate
      }
    });

  } catch (error) {
    console.error('Invoice creation error:', error);

    const errorMap = {
      'LOAD_NOT_FOUND': { status: 404, code: 'LOAD_NOT_FOUND' },
      'LOAD_NOT_COMPLETED': { status: 400, code: 'LOAD_NOT_COMPLETED' }
    };

    const mapped = errorMap[error.message] || { status: 500, code: 'INVOICE_ERROR' };

    res.status(mapped.status).json({
      error: error.message,
      code: mapped.code
    });
  }
});

/**
 * POST /api/payments/charge/:invoiceId - Charge customer for invoice
 */
router.post('/charge/:invoiceId', authenticateJWT, async (req, res) => {
  try {
    const { invoiceId } = req.params;

    // Admin only
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Admin access required',
        code: 'ACCESS_DENIED'
      });
    }

    const result = await paymentService.chargeInvoice(invoiceId);

    res.json({
      success: result.success,
      message: result.message || 'Invoice charged successfully',
      invoice: {
        id: result.invoice.id,
        status: result.invoice.status,
        amount: (result.invoice.amountCents / 100).toFixed(2),
        paidAt: result.invoice.paidAt
      }
    });

  } catch (error) {
    console.error('Charge invoice error:', error);
    res.status(500).json({
      error: error.message,
      code: 'CHARGE_ERROR'
    });
  }
});

/**
 * POST /api/payments/payout/:loadId - Create payout for carrier
 */
router.post('/payout/:loadId', authenticateJWT, async (req, res) => {
  try {
    const { loadId } = req.params;
    const { quickPay } = req.body;

    const payout = await paymentService.createPayout(loadId, quickPay || false);

    res.json({
      success: true,
      payout: {
        id: payout.id,
        amount: (payout.amountCents / 100).toFixed(2),
        platformFee: (payout.platformFeeCents / 100).toFixed(2),
        quickPayFee: payout.quickPayFeeCents ? (payout.quickPayFeeCents / 100).toFixed(2) : '0.00',
        status: payout.status,
        quickPay: payout.quickPay
      },
      estimatedPayoutDate: quickPay ? '48 hours' : `${process.env.NET_TERMS_DAYS || 30} days`
    });

  } catch (error) {
    console.error('Payout creation error:', error);

    const errorMap = {
      'LOAD_NOT_FOUND': { status: 404, code: 'LOAD_NOT_FOUND' },
      'LOAD_NOT_ASSIGNED': { status: 400, code: 'LOAD_NOT_ASSIGNED' },
      'LOAD_NOT_COMPLETED': { status: 400, code: 'LOAD_NOT_COMPLETED' }
    };

    const mapped = errorMap[error.message] || { status: 500, code: 'PAYOUT_ERROR' };

    res.status(mapped.status).json({
      error: error.message,
      code: mapped.code
    });
  }
});

/**
 * POST /api/payments/process/:loadId - Complete payment workflow
 */
router.post('/process/:loadId', authenticateJWT, async (req, res) => {
  try {
    const { loadId } = req.params;
    const { quickPay } = req.body;

    // Admin only
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Admin access required',
        code: 'ACCESS_DENIED'
      });
    }

    const result = await paymentService.processLoadPayment(loadId, quickPay || false);

    res.json({
      success: result.success,
      stage: result.stage,
      invoice: result.invoice ? {
        id: result.invoice.id,
        status: result.invoice.status,
        amount: (result.invoice.amountCents / 100).toFixed(2)
      } : null,
      payout: result.payout ? {
        id: result.payout.id,
        status: result.payout.status,
        amount: (result.payout.amountCents / 100).toFixed(2)
      } : null,
      payoutScheduled: result.payoutScheduled
    });

  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({
      error: error.message,
      code: 'PAYMENT_PROCESSING_ERROR'
    });
  }
});

/**
 * GET /api/payments/summary/:loadId - Get payment summary
 */
router.get('/summary/:loadId', authenticateJWT, async (req, res) => {
  try {
    const { loadId } = req.params;

    const summary = await paymentService.getPaymentSummary(loadId);

    res.json({
      success: true,
      ...summary
    });

  } catch (error) {
    console.error('Payment summary error:', error);
    res.status(500).json({
      error: error.message,
      code: 'PAYMENT_SUMMARY_ERROR'
    });
  }
});

module.exports = router;

