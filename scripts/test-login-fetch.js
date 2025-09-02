// Simple test to check login behavior
async function testLoginBehavior() {
  try {
    console.log('Testing login with unverified user...');

    const response = await fetch('http://localhost:3000/en/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        email: 'test.unverified@example.com',
        password: 'password123',
      }).toString(),
    });

    console.log('Response status:', response.status);
    console.log(
      'Response headers:',
      Object.fromEntries(response.headers.entries())
    );

    if (response.redirected) {
      console.log('Redirected to:', response.url);
    }

    const result = await response.text();
    console.log('Response body preview:', result.substring(0, 200) + '...');
  } catch (error) {
    console.error('Error during test:', error);
  }
}

testLoginBehavior();
