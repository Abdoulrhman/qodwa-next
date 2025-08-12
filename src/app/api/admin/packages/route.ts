import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

// GET - Fetch all packages (Admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await db.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const packages = await db.package.findMany({
      orderBy: [{ sort_order: 'asc' } as any, { created_at: 'desc' } as any],
    });

    return NextResponse.json({
      success: true,
      packages,
    });
  } catch (error) {
    console.error('Error fetching packages:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

// POST - Create new package (Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await db.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();

    const {
      title,
      description,
      current_price,
      original_price,
      discount,
      subscription_frequency,
      days,
      class_duration,
      total_classes,
      duration_weeks,
      subject,
      level,
      features,
      currency,
      is_popular,
      is_active,
      package_type,
      sort_order,
    } = body;

    // Validate required fields
    if (
      !current_price ||
      !original_price ||
      !subscription_frequency ||
      !package_type
    ) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
        },
        { status: 400 }
      );
    }

    const newPackage = await db.package.create({
      data: {
        title,
        description,
        current_price: current_price.toString(),
        original_price: original_price.toString(),
        discount: discount || '0%',
        subscription_frequency,
        days: parseInt(days) || 1,
        class_duration: parseInt(class_duration) || 30,
        total_classes: total_classes ? parseInt(total_classes) : null,
        duration_weeks: duration_weeks ? parseInt(duration_weeks) : null,
        subject,
        level,
        features: Array.isArray(features) ? features : [],
        currency: currency || 'USD',
        is_popular: Boolean(is_popular),
        is_active: Boolean(is_active),
        package_type,
        sort_order: sort_order ? parseInt(sort_order) : null,
        enrollment_action: 'subscribe', // Default value
      } as any,
    });

    return NextResponse.json({
      success: true,
      package: newPackage,
    });
  } catch (error) {
    console.error('Error creating package:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
