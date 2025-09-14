import { NextResponse } from 'next/server';

// CORS configuration
export const corsHeaders = {
  'Access-Control-Allow-Origin':
    process.env.NODE_ENV === 'production'
      ? 'https://www.qodwaplatform.com'
      : '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '86400', // 24 hours
  'Access-Control-Allow-Credentials': 'true',
};

// Handle preflight OPTIONS requests
export function handleCorsOptions() {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}

// Create a response with CORS headers
export function createCorsResponse(
  data: any,
  options: { status?: number } = {}
) {
  return NextResponse.json(data, {
    status: options.status || 200,
    headers: corsHeaders,
  });
}

// Create an error response with CORS headers
export function createCorsErrorResponse(error: string, status: number = 500) {
  return NextResponse.json(
    { error },
    {
      status,
      headers: corsHeaders,
    }
  );
}
