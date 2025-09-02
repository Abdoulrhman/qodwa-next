// Simple test script to check if email sending actually works
import { sendVerificationEmail } from '../lib/mail.js';
import { generateVerificationToken } from '../lib/tokens.js';

async function testActualEmailSending() {
  try {
    console.log('🧪 Testing actual email sending...');

    const testEmail = 'test@example.com';

    // Generate a verification token
    console.log('\n1️⃣ Generating verification token...');
    const verificationToken = await generateVerificationToken(testEmail);
    console.log(
      '✅ Token generated:',
      verificationToken.token.substring(0, 10) + '...'
    );

    // Try to send the email
    console.log('\n2️⃣ Attempting to send verification email...');
    await sendVerificationEmail(
      verificationToken.email,
      verificationToken.token
    );
    console.log('✅ Email sent successfully!');
  } catch (error) {
    console.error('❌ Error during email sending test:', error);
    console.error('Error details:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

testActualEmailSending();
