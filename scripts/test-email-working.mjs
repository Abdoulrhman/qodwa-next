import { Resend } from 'resend';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

async function testEmail() {
  console.log('🧪 Testing Email System...');
  console.log('📧 RESEND_API_KEY:', process.env.RESEND_API_KEY ? 'Found' : 'Missing');
  console.log('📧 ADMIN_NOTIFICATION_EMAIL:', process.env.ADMIN_NOTIFICATION_EMAIL);
  console.log('📧 RESEND_FROM_EMAIL:', process.env.RESEND_FROM_EMAIL);

  try {
    // Test basic email sending - use the allowed email in test mode
    const result = await resend.emails.send({
      from: 'onboarding@resend.dev', // Use Resend's default for testing
      to: ['abdoulrhman95@gmail.com'], // The only allowed email in test mode
      subject: '🧪 Qodwa Email Test - Manual Verification',
      html: `
        <div style="padding: 20px; font-family: Arial, sans-serif;">
          <h2>📧 Email System Test</h2>
          <p>This is a test email from Qodwa platform to verify email functionality.</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <p><strong>Test Type:</strong> Manual Email Verification</p>
        </div>
      `
    });

    console.log('✅ Email sent successfully!');
    console.log('📧 Result:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ Email failed:', error);
    console.error('Error details:', error.message);
  }
}

testEmail();
