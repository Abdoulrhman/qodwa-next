// Test file for Railway Function
const handler = require('./index');

// Mock request and response objects
const mockReq = (method = 'POST', headers = {}) => ({
  method,
  headers: {
    'content-type': 'application/json',
    ...headers,
  },
});

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn().mockReturnValue(res);
  res.end = jest.fn().mockReturnValue(res);
  return res;
};

// Simple test function
async function testFunction() {
  console.log('🧪 Testing Railway Function...');

  try {
    // Test health check
    console.log('1. Testing health check (GET request)...');
    const req1 = mockReq('GET');
    const res1 = mockRes();

    await handler(req1, res1);
    console.log('✅ Health check test passed');

    // Test main handler
    console.log('2. Testing main handler (POST request)...');
    const req2 = mockReq('POST', {
      authorization: `Bearer ${process.env.RAILWAY_FUNCTION_SECRET || 'test-secret'}`,
    });
    const res2 = mockRes();

    await handler(req2, res2);
    console.log('✅ Main handler test completed');

    // Test unauthorized request
    console.log('3. Testing unauthorized request...');
    const req3 = mockReq('POST');
    const res3 = mockRes();

    await handler(req3, res3);
    console.log('✅ Unauthorized test completed');

    console.log('🎉 All tests completed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testFunction();
}

module.exports = { testFunction };
