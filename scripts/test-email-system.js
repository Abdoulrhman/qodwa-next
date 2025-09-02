const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000'; // Change this to your app URL
const TEST_EMAIL = 'your-test-email@example.com'; // Change this to your test email

async function testEmailSystem() {
  console.log('🧪 Testing Qodwa Email System...\n');

  try {
    // Test 1: Student Welcome Email
    console.log('📧 Testing Student Welcome Email...');
    const studentWelcomeResponse = await axios.post(
      `${BASE_URL}/api/test-email-advanced`,
      {
        type: 'test_student_welcome',
        data: {
          email: TEST_EMAIL,
          name: 'Ahmed Test Student',
          teacherName: 'Sarah Teacher',
        },
      }
    );
    console.log(
      '✅ Student welcome email:',
      studentWelcomeResponse.data.message
    );

    // Test 2: Teacher Welcome Email
    console.log('\n📧 Testing Teacher Welcome Email...');
    const teacherWelcomeResponse = await axios.post(
      `${BASE_URL}/api/test-email-advanced`,
      {
        type: 'test_teacher_welcome',
        data: {
          email: TEST_EMAIL,
          name: 'Sarah Test Teacher',
          approvalStatus: 'APPROVED',
        },
      }
    );
    console.log(
      '✅ Teacher welcome email:',
      teacherWelcomeResponse.data.message
    );

    // Test 3: Bulk Student Email
    console.log('\n📧 Testing Bulk Student Email...');
    const bulkStudentResponse = await axios.post(
      `${BASE_URL}/api/test-email-advanced`,
      {
        type: 'test_bulk_students',
        data: {
          email: TEST_EMAIL,
          name: 'Test Student',
          subject: 'Important Announcement from Qodwa',
          message:
            'Hello! This is a test bulk email to all students. We hope you are enjoying your learning journey with us!',
        },
      }
    );
    console.log('✅ Bulk student email:', bulkStudentResponse.data.message);

    // Test 4: Bulk Teacher Email
    console.log('\n📧 Testing Bulk Teacher Email...');
    const bulkTeacherResponse = await axios.post(
      `${BASE_URL}/api/test-email-advanced`,
      {
        type: 'test_bulk_teachers',
        data: {
          email: TEST_EMAIL,
          name: 'Test Teacher',
          subject: 'Teacher Update from Qodwa',
          message:
            'Dear teachers, this is a test bulk email. Thank you for your dedication to our students!',
        },
      }
    );
    console.log('✅ Bulk teacher email:', bulkTeacherResponse.data.message);

    console.log('\n🎉 All email tests completed successfully!');
    console.log(`📬 Check your email at ${TEST_EMAIL} for the test messages.`);
  } catch (error) {
    console.error(
      '❌ Email test failed:',
      error.response?.data || error.message
    );
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Make sure your app is running on the correct URL');
    console.log('2. Check your RESEND_API_KEY in .env.local');
    console.log('3. Verify your email address is correct');
    console.log('4. Check the server logs for more details');
  }
}

// Run the tests
testEmailSystem();
