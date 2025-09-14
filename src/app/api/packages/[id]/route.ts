import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  handleCorsOptions,
  createCorsResponse,
  createCorsErrorResponse,
} from '@/lib/cors';

export async function OPTIONS(request: NextRequest) {
  return handleCorsOptions(request);
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const origin = request.headers.get('origin');
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return createCorsErrorResponse(
        'Invalid package ID',
        400,
        origin || undefined
      );
    }

    const pkg = await db.package.findUnique({
      where: { id },
    });

    if (!pkg) {
      return createCorsErrorResponse(
        'Package not found',
        404,
        origin || undefined
      );
    }

    // Transform the package data to match the expected response format
    const response = {
      id: pkg.id,
      package_id: pkg.id, // Using id since package_id was removed
      price: pkg.current_price,
      currency: 'USD',
      days: pkg.days,
      duration: pkg.class_duration,
      is_popular: pkg.is_popular,
    };

    return createCorsResponse(response, { origin: origin || undefined });
  } catch (error) {
    const origin = request.headers.get('origin');
    console.error('Failed to retrieve package:', error);
    return createCorsErrorResponse(
      'Failed to retrieve package',
      500,
      origin || undefined
    );
  }
}
