import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Package } from '@/types/api';
import {
  handleCorsOptions,
  createCorsResponse,
  createCorsErrorResponse,
} from '@/lib/cors';

export async function OPTIONS(request: NextRequest) {
  return handleCorsOptions(request);
}

export async function GET(request: NextRequest) {
  try {
    const origin = request.headers.get('origin');

    // Fetch all packages from the database
    const packages = await db.package.findMany();

    // Transform packages to match the schema
    const transformPackage = (pkg: any): Package => ({
      id: pkg.id,
      current_price: pkg.current_price,
      original_price: pkg.original_price,
      discount: pkg.discount,
      subscription_frequency: pkg.subscription_frequency,
      days: pkg.days,
      class_duration: pkg.class_duration,
      total_classes: pkg.total_classes,
      duration_weeks: pkg.duration_weeks,
      subject: pkg.subject,
      level: pkg.level,
      features: pkg.features || [],
      title: pkg.title,
      description: pkg.description,
      enrollment_action: pkg.enrollment_action,
      package_type: pkg.package_type,
      currency: pkg.currency || 'USD',
      is_popular: pkg.is_popular || false,
      is_active: pkg.is_active || true,
      sort_order: pkg.sort_order,
    });

    // Group packages based on subscription frequency
    const monthly = packages
      .filter((pkg) => pkg.subscription_frequency === 'monthly')
      .map(transformPackage);

    const quarterly = packages
      .filter((pkg) => pkg.subscription_frequency === 'quarterly')
      .map(transformPackage);

    const halfYear = packages
      .filter((pkg) => pkg.subscription_frequency === 'half-year')
      .map(transformPackage);

    const yearly = packages
      .filter((pkg) => pkg.subscription_frequency === 'yearly')
      .map(transformPackage);

    // Build the response object with the expected keys
    const response = {
      monthly,
      quarterly,
      'half-year': halfYear,
      yearly,
    };

    return createCorsResponse(response, { origin: origin || undefined });
  } catch (error) {
    const origin = request.headers.get('origin');
    console.error('Failed to retrieve packages:', error);
    return createCorsErrorResponse(
      'Failed to retrieve packages',
      500,
      origin || undefined
    );
  }
}
