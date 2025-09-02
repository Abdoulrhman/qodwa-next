const { Resend } = require('resend');

async function testResend() {
  console.log('🔍 Testing Resend Configuration...\n');

  // Check environment variables
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;

  console.log('📧 Configuration:');
  console.log(`API Key: ${apiKey ? '✅ Present' : '❌ Missing'}`);
  console.log(`From Email: ${fromEmail || '❌ Missing'}`);
  console.log(`Admin Email: ${adminEmail || '❌ Missing'}`);
  console.log('');

  if (!apiKey) {
    console.log('❌ Missing RESEND_API_KEY');
    return;
  }

  const resend = new Resend(apiKey);

  try {
    console.log('🚀 Testing API connection...');

    // Test API key validity by attempting to send a test email
    const result = await resend.emails.send({
      from: fromEmail,
      to: [adminEmail],
      subject: '🧪 Test Email from Qodwa Admin System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">🎉 Email System Test</h2>
          <p>This is a test email to verify that your Resend integration is working correctly.</p>
          <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Test Details:</strong></p>
            <ul>
              <li>From: ${fromEmail}</li>
              <li>To: ${adminEmail}</li>
              <li>API Key: ${apiKey.substring(0, 8)}...</li>
              <li>Time: ${new Date().toISOString()}</li>
            </ul>
          </div>
          <p>If you received this email, your notification system is working! 🎊</p>
        </div>
      `,
    });

    console.log('✅ Email sent successfully!');
    console.log('📧 Email ID:', result.data?.id);
    console.log('📬 Please check your inbox at:', adminEmail);
    console.log('');
    console.log("💡 If you don't receive the email, check:");
    console.log('   1. Spam/Junk folder');
    console.log('   2. Resend domain verification');
    console.log('   3. API key permissions');
  } catch (error) {
    console.log('❌ Error sending email:');
    console.log('Error details:', error.message);

    if (error.message.includes('API key')) {
      console.log(
        '💡 This looks like an API key issue. Please check your RESEND_API_KEY'
      );
    } else if (error.message.includes('domain')) {
      console.log(
        '💡 This looks like a domain verification issue. You may need to verify your domain with Resend'
      );
    }
  }
}

// Load environment variables manually
const fs = require('fs');
const path = require('path');

function loadEnv() {
  try {
    const envPath = path.join(__dirname, '..', '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');

    envContent.split('\n').forEach((line) => {
      line = line.trim();
      if (line && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          let value = valueParts.join('=');
          // Remove quotes if present
          value = value.replace(/^["']|["']$/g, '');
          process.env[key] = value;
        }
      }
    });
  } catch (error) {
    console.log('Could not load .env file:', error.message);
  }
}

loadEnv();
testResend();
