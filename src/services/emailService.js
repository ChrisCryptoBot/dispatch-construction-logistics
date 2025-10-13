/**
 * Email Notification Service
 * Using Twilio SendGrid for email delivery
 */

const sgMail = require('@sendgrid/mail');

// Initialize SendGrid with API key from environment
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'notifications@superioronelogistics.com';
const FROM_NAME = process.env.SENDGRID_FROM_NAME || 'Superior One Logistics';

/**
 * Send email using SendGrid
 * Falls back to console.log if SendGrid not configured (development)
 */
async function sendEmail({ to, subject, html, text }) {
  // If SendGrid is not configured, log to console (development mode)
  if (!process.env.SENDGRID_API_KEY) {
    console.log('📧 [EMAIL - Dev Mode] Would send email:');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${text || html}`);
    return { success: true, mode: 'development' };
  }

  try {
    const msg = {
      to,
      from: {
        email: FROM_EMAIL,
        name: FROM_NAME
      },
      subject,
      html: html || text,
      text: text || html.replace(/<[^>]*>/g, '') // Strip HTML for text version
    };

    await sgMail.send(msg);
    console.log(`✅ Email sent to ${to}: ${subject}`);
    return { success: true, mode: 'production' };
  } catch (error) {
    console.error('❌ SendGrid error:', error.message);
    if (error.response) {
      console.error('Response body:', error.response.body);
    }
    throw error;
  }
}

/**
 * Email Templates
 */

async function sendLoadPostedEmail(carrier, load) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0;">New Load Available</h1>
      </div>
      
      <div style="padding: 30px; background: #f9fafb;">
        <h2 style="color: #1f2937;">Hi ${carrier.name},</h2>
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
          A new load matching your preferences has been posted on Superior One Logistics.
        </p>
        
        <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #3b82f6;">
          <h3 style="margin: 0 0 10px 0; color: #1f2937;">Load Details</h3>
          <p style="margin: 5px 0;"><strong>Commodity:</strong> ${load.commodity}</p>
          <p style="margin: 5px 0;"><strong>Equipment:</strong> ${load.equipmentType}</p>
          <p style="margin: 5px 0;"><strong>Origin:</strong> ${load.origin.siteName || load.origin.city}</p>
          <p style="margin: 5px 0;"><strong>Destination:</strong> ${load.destination.siteName || load.destination.city}</p>
          <p style="margin: 5px 0;"><strong>Distance:</strong> ${load.miles} miles</p>
          <p style="margin: 5px 0;"><strong>Pickup Date:</strong> ${new Date(load.pickupDate).toLocaleDateString()}</p>
        </div>
        
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/carrier/load-board" 
           style="display: inline-block; background: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0;">
          View Load & Place Bid
        </a>
        
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          Log in to your carrier dashboard to view full details and place a bid.
        </p>
      </div>
      
      <div style="padding: 20px; text-align: center; background: #1f2937; color: #9ca3af; font-size: 12px;">
        <p>Superior One Logistics - Construction Logistics Platform</p>
        <p>Questions? Contact us at support@superioronelogistics.com</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: carrier.email,
    subject: `New Load: ${load.commodity} - ${load.miles} miles`,
    html
  });
}

async function sendBidReceivedEmail(customer, load, bid) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0;">New Bid Received</h1>
      </div>
      
      <div style="padding: 30px; background: #f9fafb;">
        <h2 style="color: #1f2937;">Hi ${customer.name},</h2>
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
          You've received a new bid on your load from a verified carrier.
        </p>
        
        <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #10b981;">
          <h3 style="margin: 0 0 10px 0; color: #1f2937;">Bid Details</h3>
          <p style="margin: 5px 0;"><strong>Load:</strong> ${load.commodity} - ${load.miles} miles</p>
          <p style="margin: 5px 0;"><strong>Carrier:</strong> ${bid.carrier.name}</p>
          <p style="margin: 5px 0;"><strong>Bid Amount:</strong> $${bid.bidAmount}</p>
          ${bid.message ? `<p style="margin: 5px 0;"><strong>Message:</strong> ${bid.message}</p>` : ''}
        </div>
        
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/customer/loads" 
           style="display: inline-block; background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0;">
          Review Bid
        </a>
        
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          Log in to your dashboard to review carrier details and accept/reject the bid.
        </p>
      </div>
      
      <div style="padding: 20px; text-align: center; background: #1f2937; color: #9ca3af; font-size: 12px;">
        <p>Superior One Logistics - Construction Logistics Platform</p>
        <p>Questions? Contact us at support@superioronelogistics.com</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: customer.email,
    subject: `New Bid: $${bid.bidAmount} for ${load.commodity}`,
    html
  });
}

async function sendReleaseRequestEmail(customer, load) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0;">🚨 Action Required: Material Release</h1>
      </div>
      
      <div style="padding: 30px; background: #f9fafb;">
        <h2 style="color: #1f2937;">Hi ${customer.name},</h2>
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
          The carrier has accepted your load and is ready to pick up. <strong>Please confirm your material is ready to avoid TONU charges.</strong>
        </p>
        
        <div style="background: #fef3c7; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <h3 style="margin: 0 0 10px 0; color: #92400e;">⚠️ TONU Liability Warning</h3>
          <p style="color: #92400e; margin: 5px 0;">
            If you issue a release and the material is NOT ready when the carrier arrives, 
            you will be charged a TONU (Truck Ordered Not Used) fee of $200 to compensate the carrier 
            for their wasted trip.
          </p>
        </div>
        
        <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #1f2937;">Load Details</h3>
          <p style="margin: 5px 0;"><strong>Commodity:</strong> ${load.commodity}</p>
          <p style="margin: 5px 0;"><strong>Pickup Location:</strong> ${load.origin.siteName}</p>
          <p style="margin: 5px 0;"><strong>Scheduled Pickup:</strong> ${new Date(load.pickupDate).toLocaleString()}</p>
          <p style="margin: 5px 0;"><strong>Carrier:</strong> ${load.carrier?.name || 'Assigned'}</p>
        </div>
        
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/customer/loads" 
           style="display: inline-block; background: #f97316; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0;">
          Issue Release Now
        </a>
        
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          Only issue a release when you have physically confirmed the material is loaded and ready for pickup.
        </p>
      </div>
      
      <div style="padding: 20px; text-align: center; background: #1f2937; color: #9ca3af; font-size: 12px;">
        <p>Superior One Logistics - Construction Logistics Platform</p>
        <p>Questions? Contact us at support@superioronelogistics.com</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: customer.email,
    subject: `🚨 Action Required: Confirm Material Ready - Load ${load.id.substring(0, 8)}`,
    html
  });
}

async function sendInsuranceBlockedEmail(carrier) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0;">Insurance Verification Required</h1>
      </div>
      
      <div style="padding: 30px; background: #f9fafb;">
        <h2 style="color: #1f2937;">Hi ${carrier.name},</h2>
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
          We're unable to assign loads to your account at this time because your insurance information 
          requires verification or has expired.
        </p>
        
        <div style="background: #fef2f2; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #ef4444;">
          <h3 style="margin: 0 0 10px 0; color: #991b1b;">Action Required</h3>
          <p style="color: #991b1b; margin: 5px 0;">
            To continue accepting loads, please update your insurance documents in your carrier dashboard.
          </p>
        </div>
        
        <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #1f2937;">What You Need to Upload</h3>
          <ul style="color: #4b5563; line-height: 1.8;">
            <li><strong>Cargo Insurance:</strong> Minimum $100,000 coverage</li>
            <li><strong>General Liability:</strong> Minimum $1,000,000 coverage</li>
            <li><strong>Auto Liability:</strong> Minimum $1,000,000 coverage</li>
            <li><strong>Workers Compensation:</strong> As required by law</li>
          </ul>
        </div>
        
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/carrier/compliance" 
           style="display: inline-block; background: #ef4444; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0;">
          Update Insurance Documents
        </a>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #1f2937;">Need Help or Want to Dispute?</h3>
          <p style="color: #4b5563; margin: 5px 0;">
            If you believe this is an error or have questions about your insurance status, please contact 
            our compliance team:
          </p>
          <p style="color: #1f2937; margin: 10px 0; font-weight: bold;">
            📞 Phone: (512) 555-COMP (2667)<br/>
            📧 Email: compliance@superioronelogistics.com<br/>
            ⏰ Hours: Monday-Friday, 8 AM - 6 PM CT
          </p>
          <p style="color: #6b7280; font-size: 14px; margin-top: 10px;">
            We typically review disputes within 24-48 business hours. Our compliance team will verify your 
            documentation and restore your account access if everything is in order.
          </p>
        </div>
      </div>
      
      <div style="padding: 20px; text-align: center; background: #1f2937; color: #9ca3af; font-size: 12px;">
        <p>Superior One Logistics - Construction Logistics Platform</p>
        <p>Compliance Team: compliance@superioronelogistics.com</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: carrier.email,
    subject: `Action Required: Insurance Verification - ${carrier.name}`,
    html
  });
}

async function sendWelcomeEmail(user, orgType) {
  const dashboardUrl = orgType === 'CARRIER' 
    ? '/carrier/dashboard' 
    : '/customer/dashboard';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 40px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 32px;">Welcome to Superior One</h1>
        <p style="color: #dbeafe; margin: 10px 0 0 0;">Construction Logistics Platform</p>
      </div>
      
      <div style="padding: 40px; background: #f9fafb;">
        <h2 style="color: #1f2937;">Hi ${user.firstName},</h2>
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
          Welcome to Superior One Logistics! We're excited to have you on board.
        </p>
        
        <div style="background: white; padding: 25px; border-radius: 10px; margin: 25px 0;">
          <h3 style="margin: 0 0 15px 0; color: #1f2937;">Get Started</h3>
          ${orgType === 'CARRIER' ? `
            <ul style="color: #4b5563; line-height: 1.8; padding-left: 20px;">
              <li>Complete your carrier profile</li>
              <li>Upload insurance documents</li>
              <li>Add your trucks and trailers</li>
              <li>Browse available loads on the load board</li>
              <li>Place your first bid</li>
            </ul>
          ` : `
            <ul style="color: #4b5563; line-height: 1.8; padding-left: 20px;">
              <li>Complete your company profile</li>
              <li>Add your job sites</li>
              <li>Post your first load</li>
              <li>Review bids from verified carriers</li>
              <li>Track your shipments in real-time</li>
            </ul>
          `}
        </div>
        
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}${dashboardUrl}" 
           style="display: inline-block; background: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0;">
          Go to Dashboard
        </a>
        
        <div style="background: #eff6ff; padding: 20px; border-radius: 10px; margin: 25px 0;">
          <h3 style="margin: 0 0 10px 0; color: #1e40af;">Need Help?</h3>
          <p style="color: #1e40af; margin: 5px 0;">
            Our support team is here to help you get started. Feel free to reach out anytime!
          </p>
          <p style="color: #1e40af; margin: 10px 0;">
            📧 support@superioronelogistics.com<br/>
            📞 (512) 555-0123
          </p>
        </div>
      </div>
      
      <div style="padding: 20px; text-align: center; background: #1f2937; color: #9ca3af; font-size: 12px;">
        <p>Superior One Logistics - Construction Logistics Platform</p>
        <p>Building the future of construction logistics</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject: `Welcome to Superior One Logistics! 🚛`,
    html
  });
}

module.exports = {
  sendEmail,
  sendLoadPostedEmail,
  sendBidReceivedEmail,
  sendReleaseRequestEmail,
  sendInsuranceBlockedEmail,
  sendWelcomeEmail
};


