/**
 * reCAPTCHA v3 verification middleware
 * MOCK VERSION: Always passes in development
 * Replace with real Google reCAPTCHA when keys are available
 */

const MOCK_MODE = !process.env.RECAPTCHA_SECRET;

/**
 * Verify reCAPTCHA token from client
 * Score threshold: 0.5 (Google recommendation for signup)
 */
module.exports = async function verifyCaptcha(req, res, next) {
  try {
    const token = req.body?.captchaToken;
    
    if (MOCK_MODE) {
      // Mock mode: Always pass but log
      console.log('🤖 MOCK CAPTCHA: Bypassing verification (dev mode)');
      if (token) {
        console.log('   Token received:', token.substring(0, 20) + '...');
      }
      return next();
    }
    
    // Production mode: Verify with Google
    if (!token) {
      return res.status(400).json({ 
        error: { 
          code: 'CAPTCHA_REQUIRED',
          message: 'CAPTCHA token is required'
        }
      });
    }
    
    const fetch = require('node-fetch');
    const resp = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: process.env.RECAPTCHA_SECRET,
        response: token
      })
    });
    
    const data = await resp.json();
    
    if (!data.success) {
      console.warn('❌ CAPTCHA verification failed:', data['error-codes']);
      return res.status(400).json({ 
        error: { 
          code: 'CAPTCHA_FAILED',
          message: 'CAPTCHA verification failed'
        }
      });
    }
    
    // Check score (v3 only)
    const score = data.score ?? 1.0;
    if (score < 0.5) {
      console.warn('❌ CAPTCHA score too low:', score);
      return res.status(400).json({ 
        error: { 
          code: 'CAPTCHA_FAILED',
          message: 'CAPTCHA score too low (possible bot)'
        }
      });
    }
    
    console.log('✅ CAPTCHA verified, score:', score);
    next();
  } catch (error) {
    console.error('❌ CAPTCHA verification error:', error.message);
    next(error);
  }
};



