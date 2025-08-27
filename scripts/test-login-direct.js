// Test script to call login action directly
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

async function testLogin() {
  try {
    // Test the login via fetch to the login action
    const response = await fetch('http://localhost:3000/en/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test.unverified@example.com',
        password: 'password123'
      })
    });
    
    console.log('Response status:', response.status);
    const result = await response.text();
    console.log('Response:', result);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Wait a bit for server to be ready, then test
setTimeout(testLogin, 2000);
