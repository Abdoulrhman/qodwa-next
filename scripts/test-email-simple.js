// Simple email test script using Node.js built-in fetch (Node 18+) or manual HTTP requests

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = 'http://localhost:3000';
const TEST_EMAIL = 'abdoulrhman95@gmail.com'; // Change this to your test email

function makeRequest(url, data) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const lib = isHttps ? https : http;

    const postData = JSON.stringify(data);

    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = lib.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.write(postData);
    req.end();
  });
}

async function testEmailSystem() {
  console.log('🧪 Testing Qodwa Email System...\n');

  if (TEST_EMAIL === 'your-test-email@example.com') {
    console.log(
      '⚠️  Please update TEST_EMAIL in the script with your actual email address'
    );
    return;
  }

  try {
    // Test 1: Student Welcome Email
    console.log('📧 Testing Student Welcome Email...');
    const studentWelcomeResponse = await makeRequest(
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

    if (studentWelcomeResponse.status === 200) {
      console.log(
        '✅ Student welcome email:',
        studentWelcomeResponse.data.message
      );
    } else {
      console.log(
        '❌ Student welcome email failed:',
        studentWelcomeResponse.data
      );
    }

    // Test 2: Teacher Welcome Email
    console.log('\n📧 Testing Teacher Welcome Email...');
    const teacherWelcomeResponse = await makeRequest(
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

    if (teacherWelcomeResponse.status === 200) {
      console.log(
        '✅ Teacher welcome email:',
        teacherWelcomeResponse.data.message
      );
    } else {
      console.log(
        '❌ Teacher welcome email failed:',
        teacherWelcomeResponse.data
      );
    }

    // Test 3: Bulk Student Email
    console.log('\n📧 Testing Bulk Student Email...');
    const bulkStudentResponse = await makeRequest(
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

    if (bulkStudentResponse.status === 200) {
      console.log('✅ Bulk student email:', bulkStudentResponse.data.message);
    } else {
      console.log('❌ Bulk student email failed:', bulkStudentResponse.data);
    }

    console.log('\n🎉 Email tests completed!');
    console.log(`📬 Check your email at ${TEST_EMAIL} for the test messages.`);
    console.log(
      '\n📝 Note: Make sure you have set up your RESEND_API_KEY in .env.local'
    );
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Make sure your app is running on http://localhost:3000');
    console.log('2. Check your RESEND_API_KEY in .env.local');
    console.log('3. Update TEST_EMAIL with your actual email address');
    console.log('4. Check the server logs for more details');
  }
}

// Run the tests
testEmailSystem();
