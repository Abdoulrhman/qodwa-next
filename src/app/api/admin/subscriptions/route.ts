import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    // Fetch all subscriptions with user and package details
    const subscriptions = await db.subscription.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        package: {
          select: {
            id: true,
            title: true,
            current_price: true,
          },
        },
      },
      orderBy: {
        startDate: 'desc',
      },
    });

    // Calculate statistics
    const stats = {
      total: subscriptions.length,
      active: subscriptions.filter((sub) => sub.status === 'ACTIVE').length,
      expired: subscriptions.filter((sub) => sub.status === 'EXPIRED').length,
    };

    // Transform the data to include computed fields
    const transformedSubscriptions = subscriptions.map((subscription) => ({
      id: subscription.id,
      status: subscription.status,
      startDate: subscription.startDate.toISOString(),
      endDate: subscription.endDate?.toISOString() || '',
      user: {
        name: subscription.user.name || 'Unknown User',
        email: subscription.user.email || 'No email',
      },
      package: {
        name: subscription.package.title || 'Unknown Package',
        price: parseFloat(subscription.package.current_price || '0'),
      },
      sessionsUsed: subscription.classes_completed,
      totalSessions: subscription.classes_remaining
        ? subscription.classes_completed + subscription.classes_remaining
        : subscription.classes_completed,
    }));

    return NextResponse.json({
      subscriptions: transformedSubscriptions,
      stats,
    });
  } catch (error) {
    console.error('Error fetching admin subscriptions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
