import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Fetch all packages from the database
    const packages = await db.package.findMany();

    // Group packages based on subscription frequency and transform them
    const monthly = packages
      .filter((pkg) => pkg.subscription_frequency === 'monthly')
      .map((pkg) => ({
        id: pkg.id,
        package_id: pkg.package_id, // make sure this field exists in your DB
        price: pkg.current_price, // mapping current_price to price
        currency: 'USD', // or use pkg.currency if available
        days: pkg.days, // ensure this field exists or adjust accordingly
        duration: pkg.class_duration, // mapping class_duration to duration
        is_popular: pkg.is_popular, // ensure this field exists or set a default value
      }));

    const quarterly = packages
      .filter((pkg) => pkg.subscription_frequency === 'quarterly')
      .map((pkg) => ({
        id: pkg.id,
        package_id: pkg.package_id,
        price: pkg.current_price,
        currency: 'USD',
        days: pkg.days,
        duration: pkg.class_duration,
        is_popular: pkg.is_popular,
      }));

    const halfYear = packages
      .filter((pkg) => pkg.subscription_frequency === 'half-year')
      .map((pkg) => ({
        id: pkg.id,
        package_id: pkg.package_id,
        price: pkg.current_price,
        currency: 'USD',
        days: pkg.days,
        duration: pkg.class_duration,
        is_popular: pkg.is_popular,
      }));

    const yearly = packages
      .filter((pkg) => pkg.subscription_frequency === 'yearly')
      .map((pkg) => ({
        id: pkg.id,
        package_id: pkg.package_id,
        price: pkg.current_price,
        currency: 'USD',
        days: pkg.days,
        duration: pkg.class_duration,
        is_popular: pkg.is_popular,
      }));

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
