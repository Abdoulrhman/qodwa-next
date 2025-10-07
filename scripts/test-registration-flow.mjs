// Test the registration API
const testRegistration = async () => {
  console.log('🧪 Testing Student Registration Flow...');
  
  const testData = {
    name: 'Test Student',
    email: 'abdoulrhman95@gmail.com', // Use the allowed test email
    password: 'TestPassword123!',
    retypePassword: 'TestPassword123!',
    phone: '+1234567890',
    gender: 'MALE',
    birthDate: '1995-01-01',
    referralSource: 'ONLINE_SEARCH'
  };

  try {
    const response = await fetch('http://localhost:3000/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const result = await response.json();
    
    console.log('📊 Registration Response:');
    console.log('Status:', response.status);
    console.log('Result:', JSON.stringify(result, null, 2));
    
    if (response.ok) {
      console.log('✅ Registration successful - check console logs for email notifications');
    } else {
      console.log('❌ Registration failed');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

testRegistration();
