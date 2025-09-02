// Load environment variables
require('dotenv').config();

async function testTeacherRecruitmentAPI() {
  try {
    console.log('🧪 Testing Teacher Recruitment API...');

    // Test the API endpoint
    const testData = {
      emails: ['test@example.com'],
      subject: '🧪 Test Teacher Recruitment Email',
      customMessage: 'This is a test message for teacher recruitment.',
    };

    console.log('📨 Testing API call...');
    console.log('URL: http://localhost:3000/api/admin/teacher-recruitment');
    console.log('Data:', JSON.stringify(testData, null, 2));

    const response = await fetch(
      'http://localhost:3000/api/admin/teacher-recruitment',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Note: This won't work without proper authentication session
        },
        body: JSON.stringify(testData),
      }
    );

    console.log('Response status:', response.status);

    const result = await response.text();
    console.log('Response:', result);

    if (response.ok) {
      console.log('✅ API call successful');
    } else {
      console.log('❌ API call failed');
    }
  } catch (error) {
    console.error('❌ Error testing API:', error);
  }
}

testTeacherRecruitmentAPI();
