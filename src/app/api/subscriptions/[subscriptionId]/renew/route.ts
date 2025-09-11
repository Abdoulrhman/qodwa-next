import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { subscriptionId: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { subscriptionId } = params;

    // Get the subscription to renew
    const subscription = await db.subscription.findFirst({
      where: {
        id: subscriptionId,
        userId: session.user.id,
        status: 'ACTIVE',
      },
      include: {
        package: true,
      },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found or already expired' },
        { status: 404 }
      );
    }

    // Check if renewal is allowed (within 7 days of expiry)
    const now = new Date();
    const daysUntilExpiry = Math.ceil(
      (subscription.endDate!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilExpiry > 7) {
      return NextResponse.json(
        {
          error: `Renewal not allowed yet. You can renew within 7 days of expiry. Days remaining: ${daysUntilExpiry}`,
        },
        { status: 400 }
      );
    }

    // Calculate new subscription dates
    const currentEndDate = subscription.endDate!;
    const newStartDate = new Date(currentEndDate.getTime() + 1); // Start the day after current expires

    // Calculate new end date based on package duration
    const packageDurationDays = 30; // Default to 30 days, adjust based on package
    const newEndDate = new Date(newStartDate);
    newEndDate.setDate(newEndDate.getDate() + packageDurationDays);

    // Mark current subscription as expired
    await db.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: 'EXPIRED',
        notes: 'Manually renewed by user',
      },
    });

    // Create new subscription
    const newSubscription = await db.subscription.create({
      data: {
        userId: session.user.id,
        packageId: subscription.packageId,
        startDate: newStartDate,
        endDate: newEndDate,
        status: 'ACTIVE',
        classes_completed: 0,
        auto_renew: subscription.auto_renew,
        notes: 'Manual renewal',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Subscription renewed successfully',
      newSubscription: {
        id: newSubscription.id,
        startDate: newSubscription.startDate,
        endDate: newSubscription.endDate,
        status: newSubscription.status,
      },
    });
  } catch (error) {
    console.error('Error renewing subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
