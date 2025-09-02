// Railway Function for Subscription Renewal
// This function can be called by external cron services or Vercel cron jobs

const fetch = require('node-fetch');

// Main handler function
async function handler(req, res) {
  console.log('🔄 Starting subscription renewal process...');

  try {
    // Verify the request (optional security check)
    const authHeader = req.headers.authorization;
    const expectedToken = process.env.RAILWAY_FUNCTION_SECRET;

    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      console.log('❌ Unauthorized request');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Call your Next.js API endpoint for subscription renewal
    const apiUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.APP_URL;
    const renewalEndpoint = `${apiUrl}/api/railway/subscription-renewal`;

    console.log(`📡 Calling renewal endpoint: ${renewalEndpoint}`);

    const response = await fetch(renewalEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.RAILWAY_FUNCTION_SECRET}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} - ${result.error}`);
    }

    console.log('✅ Subscription renewal completed:', result);

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Subscription renewal process completed',
      timestamp: new Date().toISOString(),
      results: result.results,
    });
  } catch (error) {
    console.error('❌ Error in subscription renewal:', error);

    // Return error but with 200 status to prevent Railway retries
    return res.status(200).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}

// Health check endpoint
async function healthCheck(req, res) {
  try {
    // Simple health check - verify environment variables
    const requiredEnvs = ['NEXT_PUBLIC_BASE_URL', 'RAILWAY_FUNCTION_SECRET'];
    const missingEnvs = requiredEnvs.filter((env) => !process.env[env]);

    if (missingEnvs.length > 0) {
      return res.status(500).json({
        status: 'unhealthy',
        error: `Missing environment variables: ${missingEnvs.join(', ')}`,
        timestamp: new Date().toISOString(),
      });
    }

    return res.status(200).json({
      status: 'healthy',
      message: 'Railway Function is running',
      timestamp: new Date().toISOString(),
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}

// Main export - handle different HTTP methods
module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Route based on HTTP method and path
  if (req.method === 'GET') {
    return healthCheck(req, res);
  } else if (req.method === 'POST') {
    return handler(req, res);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
};
