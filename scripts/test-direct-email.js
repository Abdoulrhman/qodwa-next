require('dotenv').config();
const { sendVerificationEmail, sendAdminNewStudentNotification } = require('./lib/mail.ts');

async function testEmails() {
  console.log('🧪 Testing Qodwa Email System Directly...\n');

  // Test 1: Verification Email
  console.log('📧 Testing Verification Email...');
  try {
    await sendVerificationEmail('abdoulrhman95@gmail.com', 'test-token-123');
    console.log('✅ Verification email sent successfully!\n');
  } catch (error) {
    console.log('❌ Verification email failed:', error.message, '\n');
  }

  // Test 2: Admin Notification
  console.log('📧 Testing Admin Notification...');
  try {
    await sendAdminNewStudentNotification('Test Student', 'teststudent@example.com');
    console.log('✅ Admin notification sent successfully!\n');
  } catch (error) {
    console.log('❌ Admin notification failed:', error.message, '\n');
  }

  console.log('🔧 Environment Check:');
  console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? '✅ Set' : '❌ Missing');
  console.log('RESEND_FROM_EMAIL:', process.env.RESEND_FROM_EMAIL || '❌ Missing');
  console.log('ADMIN_NOTIFICATION_EMAIL:', process.env.ADMIN_NOTIFICATION_EMAIL || '❌ Missing');
  console.log('NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL || '❌ Missing');
}

testEmails().catch(console.error);
