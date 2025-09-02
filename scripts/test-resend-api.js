// Load environment variables
require('dotenv').config();

const { Resend } = require('resend');

async function testResendApi() {
  try {
    console.log('🧪 Testing Resend API configuration...');

    // Check environment variables
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL;

    console.log('📧 Configuration:');
    console.log('RESEND_API_KEY:', apiKey ? '✅ Set' : '❌ Missing');
    console.log('RESEND_FROM_EMAIL:', fromEmail || '❌ Missing');

    if (!apiKey) {
      console.log('❌ RESEND_API_KEY is missing!');
      return;
    }

    if (!fromEmail) {
      console.log('❌ RESEND_FROM_EMAIL is missing!');
      return;
    }

    // Initialize Resend
    const resend = new Resend(apiKey);
    console.log('📤 Resend client initialized');

    // Test email content
    const testEmail = 'test@example.com';
    const testSubject = '🧪 Test Email from Qodwa Platform';
    const testContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Test Email</title>
      </head>
      <body>
        <h1>Test Email</h1>
        <p>This is a test email to verify Resend configuration.</p>
        <p>If you receive this, the email system is working!</p>
      </body>
      </html>
    `;

    console.log('📨 Attempting to send test email...');
    console.log('To:', testEmail);
    console.log('From:', fromEmail);
    console.log('Subject:', testSubject);

    // Send test email
    const result = await resend.emails.send({
      from: fromEmail,
      to: [testEmail],
      subject: testSubject,
      html: testContent,
    });

    console.log('✅ Email sent successfully!');
    console.log('Result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('❌ Error testing Resend API:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.status,
      name: error.name,
    });
  }
}

testResendApi();
