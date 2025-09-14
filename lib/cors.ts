import { NextResponse } from 'next/server';

// Allowed origins for CORS
const allowedOrigins = [
  'https://www.qodwaplatform.com',
  'https://qodwaplatform.com',
  'http://localhost:3000',
  'http://localhost:3001',
];

// Get CORS headers based on the request origin
function getCorsHeaders(origin?: string | null) {
  const isAllowedOrigin =
    origin &&
    (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development');

  return {
    'Access-Control-Allow-Origin': isAllowedOrigin ? origin : allowedOrigins[0],
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers':
      'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400', // 24 hours
    'Access-Control-Allow-Credentials': 'true',
  };
}

// CORS configuration - fallback headers
export const corsHeaders = getCorsHeaders();

// Handle preflight OPTIONS requests
export function handleCorsOptions(request?: Request) {
  const origin = request?.headers.get('origin');
  return new Response(null, {
    status: 200,
    headers: getCorsHeaders(origin),
  });
}

// Create a response with CORS headers
export function createCorsResponse(
  data: any,
  options: { status?: number; origin?: string } = {}
) {
  return NextResponse.json(data, {
    status: options.status || 200,
    headers: getCorsHeaders(options.origin),
  });
}

// Create an error response with CORS headers
export function createCorsErrorResponse(
  error: string,
  status: number = 500,
  origin?: string
) {
  return NextResponse.json(
    { error },
    {
      status,
      headers: getCorsHeaders(origin),
    }
  );
}
