import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid package ID' },
        { status: 400 }
      );
    }

    const pkg = await db.package.findUnique({
      where: { id },
    });

    if (!pkg) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    }

    // Transform the package data to match the expected response format
    const response = {
      id: pkg.id,
      package_id: pkg.package_id,
      price: pkg.current_price,
      currency: 'USD',
      days: pkg.days,
      duration: pkg.class_duration,
      is_popular: pkg.is_popular,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to retrieve package:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve package' },
      { status: 500 }
    );
  }
}
