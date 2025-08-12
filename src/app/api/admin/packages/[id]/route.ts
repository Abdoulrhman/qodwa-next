import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

// GET - Fetch single package (Admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const packageId = parseInt(params.id);
    if (isNaN(packageId)) {
      return NextResponse.json(
        { error: 'Invalid package ID' },
        { status: 400 }
      );
    }

    const pkg = await db.package.findUnique({
      where: { id: packageId },
    });

    if (!pkg) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      package: pkg,
    });
  } catch (error) {
    console.error('Error fetching package:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

// PUT - Update package (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const packageId = parseInt(params.id);
    if (isNaN(packageId)) {
      return NextResponse.json(
        { error: 'Invalid package ID' },
        { status: 400 }
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

    // Check if package exists
    const existingPackage = await db.package.findUnique({
      where: { id: packageId },
    });

    if (!existingPackage) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    }

    const updatedPackage = await db.package.update({
      where: { id: packageId },
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
      } as any,
    });

    return NextResponse.json({
      success: true,
      package: updatedPackage,
    });
  } catch (error) {
    console.error('Error updating package:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete package (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const packageId = parseInt(params.id);
    if (isNaN(packageId)) {
      return NextResponse.json(
        { error: 'Invalid package ID' },
        { status: 400 }
      );
    }

    // Check if package exists
    const existingPackage = await db.package.findUnique({
      where: { id: packageId },
    });

    if (!existingPackage) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    }

    // Check if package has active subscriptions
    const activeSubscriptions = await db.subscription.findMany({
      where: {
        packageId: packageId,
        status: 'ACTIVE',
      },
    });

    if (activeSubscriptions.length > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete package with active subscriptions',
        },
        { status: 400 }
      );
    }

    await db.package.delete({
      where: { id: packageId },
    });

    return NextResponse.json({
      success: true,
      message: 'Package deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting package:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
