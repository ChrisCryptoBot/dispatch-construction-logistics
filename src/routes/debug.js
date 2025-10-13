// src/routes/debug.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// This route is PUBLIC — no auth middleware — so you can see raw inputs.
router.get('/auth', (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length)
    : '';

  const isDevMode = process.env.NODE_ENV === 'development';
  const isDevToken = token.startsWith('dev-admin-token-');

  const result = {
    now: new Date().toISOString(),
    node_env: process.env.NODE_ENV || null,
    jwt_secret_present: !!process.env.JWT_SECRET,
    auth_header_present: !!authHeader,
    auth_header_preview: authHeader ? authHeader.substring(0, 32) + '…' : null,
    token_present: !!token,
    token_kind: isDevToken ? 'dev-admin-token' : (token ? 'maybe-jwt' : 'none'),
    dev_mode: isDevMode,
    dev_token_detected: isDevToken,
    // Try decoding if it *looks* like a JWT (won't throw; only base64-decodes)
    jwt_decode_attempt: (() => {
      if (!token || isDevToken || token.split('.').length !== 3) return null;
      try {
        const payload = JSON.parse(
          Buffer.from(token.split('.')[1], 'base64').toString('utf8')
        );
        return { ok: true, payloadPreview: JSON.stringify(payload).slice(0, 200) + '…' };
      } catch (_) {
        return { ok: false, error: 'not a valid JWT payload (decode failed)' };
      }
    })(),
  };

  res.status(200).json(result);
});

module.exports = router;

