import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Package } from '@/APISchema';

export async function GET() {
  try {
    // Fetch all packages from the database
    const packages = await db.package.findMany();

    // Transform packages to match the schema
    const transformPackage = (pkg: any): Package => ({
      id: pkg.id,
      current_price: pkg.current_price,
      original_price: pkg.original_price,
      discount: pkg.discount,
      subscription_frequency: pkg.subscription_frequency,
      days_per_week: pkg.days_per_week,
      classes_per_month: pkg.classes_per_month,
      class_duration: pkg.class_duration,
      enrollment_action: pkg.enrollment_action,
      package_type: pkg.package_type,
      currency: pkg.currency || 'USD',
      is_popular: pkg.is_popular || false,
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

    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to retrieve packages:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve packages' },
      { status: 500 }
    );
  }
}
