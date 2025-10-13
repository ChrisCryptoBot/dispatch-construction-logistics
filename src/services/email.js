/**
 * Email service for sending verification emails
 * MOCK VERSION: Logs to console instead of sending real emails
 * Replace with real Postmark integration when ready
 */

const MOCK_MODE = !process.env.POSTMARK_TOKEN;

/**
 * Send verification email with 6-digit code
 * @param {Object} params
 * @param {string} params.to - Recipient email
 * @param {string} params.code - 6-digit verification code
 * @returns {Promise<{success: boolean, messageId?: string}>}
 */
exports.sendVerificationEmail = async ({ to, code }) => {
  const html = `
    <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 40px; border-radius: 12px; text-align: center;">
        <h1 style="color: #fbbf24; font-size: 32px; margin: 0 0 20px 0;">SUPERIOR ONE LOGISTICS</h1>
        <h2 style="color: #ffffff; font-size: 24px; margin: 0 0 30px 0;">Verify Your Email</h2>
        
        <p style="color: #d1d5db; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
          Welcome to Superior One Logistics! Please use the verification code below to complete your registration.
        </p>
        
        <div style="background: #374151; padding: 30px; border-radius: 8px; margin: 0 0 30px 0;">
          <div style="font-size: 48px; font-weight: 700; letter-spacing: 8px; color: #fbbf24; font-family: 'Courier New', monospace;">
            ${code}
          </div>
        </div>
        
        <p style="color: #9ca3af; font-size: 14px; margin: 0 0 10px 0;">
          This code expires in <strong style="color: #fbbf24;">15 minutes</strong>
        </p>
        
        <p style="color: #9ca3af; font-size: 14px; margin: 0;">
          If you didn't request this code, please ignore this email.
        </p>
        
        <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #4b5563;">
          <p style="color: #6b7280; font-size: 12px; margin: 0;">
            Superior One Logistics | Construction Freight Management
          </p>
        </div>
      </div>
    </div>
  `;

  if (MOCK_MODE) {
    // Mock mode: Log to console
    console.log('\n========================================');
    console.log('📧 MOCK EMAIL SERVICE');
    console.log('========================================');
    console.log('To:', to);
    console.log('Subject: Your verification code');
    console.log('========================================');
    console.log('🔐 VERIFICATION CODE:', code);
    console.log('========================================');
    console.log('⏰ Expires in: 15 minutes');
    console.log('========================================\n');
    
    return {
      success: true,
      messageId: `mock-${Date.now()}`
    };
  }

  // Real Postmark integration (when POSTMARK_TOKEN is set)
  try {
    const { ServerClient } = require('postmark');
    const client = new ServerClient(process.env.POSTMARK_TOKEN);
    
    const result = await client.sendEmail({
      From: process.env.EMAIL_FROM || 'no-reply@superiorone.com',
      To: to,
      Subject: 'Your verification code',
      HtmlBody: html,
      MessageStream: 'outbound'
    });
    
    return {
      success: true,
      messageId: result.MessageID
    };
  } catch (error) {
    console.error('❌ Email send failed:', error.message);
    throw new Error(`Failed to send verification email: ${error.message}`);
  }
};

/**
 * Send welcome email after successful verification
 * @param {Object} params
 * @param {string} params.to - Recipient email
 * @param {string} params.name - User's name
 * @returns {Promise<{success: boolean}>}
 */
exports.sendWelcomeEmail = async ({ to, name }) => {
  if (MOCK_MODE) {
    console.log('\n========================================');
    console.log('📧 MOCK EMAIL: Welcome Email');
    console.log('To:', to);
    console.log('Name:', name);
    console.log('========================================\n');
    return { success: true };
  }
  
  // Implement real welcome email when needed
  return { success: true };
};



