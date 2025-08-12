import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Verify user exists and is not a teacher
    const user = await db.user.findUnique({
      where: {
        id: userId,
        OR: [{ isTeacher: false }, { isTeacher: null }],
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
        },
        { status: 404 }
      );
    }

    // Fetch user's subscriptions with package details
    const subscriptions = await db.subscription.findMany({
      where: {
        userId: userId,
      },
      include: {
        package: true, // Include package details
      },
      orderBy: {
        startDate: 'desc', // Most recent first
      },
    });

    // Transform the data to match the expected frontend format
    const transformedSubscriptions = subscriptions.map((subscription) => {
      // Map Prisma enum values to frontend expected values
      let status: string;
      switch (subscription.status) {
        case 'ACTIVE':
          // Check if subscription is actually expired
          const isExpired =
            subscription.endDate && subscription.endDate < new Date();
          status = isExpired ? 'expired' : 'active';
          break;
        case 'CANCELLED':
          status = 'cancelled';
          break;
        case 'EXPIRED':
          status = 'expired';
          break;
        case 'PENDING':
          status = 'pending';
          break;
        default:
          status = 'active';
      }

      // Calculate class progress using the new schema fields
      // Temporarily using type assertions until TypeScript picks up new types
      const packageData = subscription.package as any;
      const subscriptionData = subscription as any;

      const totalClasses =
        packageData.total_classes ||
        calculateTotalClasses(subscription.package);
      const remainingClasses =
        subscriptionData.classes_remaining ||
        Math.max(totalClasses - (subscriptionData.classes_completed || 0), 0);

      // Use the stored next class date or calculate it
      const nextClassDate =
        subscriptionData.next_class_date?.toISOString() ||
        (status === 'active' ? calculateNextClassDate(subscription) : null);

      return {
        id: subscription.id,
        status: status as 'active' | 'expired' | 'pending' | 'cancelled',
        packageName: packageData.title || subscription.package.package_type,
        price: parseFloat(subscription.package.current_price),
        currency: subscription.package.currency,
        startDate: subscription.startDate.toISOString(),
        endDate: subscription.endDate?.toISOString() || null,
        autoRenew: subscriptionData.auto_renew || false,
        paymentMethod: subscriptionData.payment_method || 'Credit Card',
        invoiceUrl: `/api/invoices/${subscription.id}.pdf`,
        remainingClasses,
        totalClasses,
        nextClassDate,
      };
    });

    const response = {
      success: true,
      subscriptions: transformedSubscriptions,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching subscription data:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

// Helper function to calculate total classes based on package
function calculateTotalClasses(packageData: any): number {
  const { subscription_frequency, days, class_duration } = packageData;

  // Base calculation: classes per week = days
  const classesPerWeek = days;

  // Calculate total classes based on subscription frequency
  switch (subscription_frequency) {
    case 'monthly':
      return classesPerWeek * 4; // 4 weeks in a month
    case 'quarterly':
      return classesPerWeek * 12; // 12 weeks in a quarter
    case 'half-year':
      return classesPerWeek * 24; // 24 weeks in half year
    case 'yearly':
      return classesPerWeek * 52; // 52 weeks in a year
    default:
      return classesPerWeek * 4; // Default to monthly
  }
}

// Helper function to calculate next class date
function calculateNextClassDate(subscription: any): string | null {
  // This is a simplified calculation - you would implement proper scheduling logic
  const now = new Date();
  const nextClass = new Date(now);

  // Add 2 days for next class (you would implement proper scheduling logic here)
  nextClass.setDate(now.getDate() + 2);
  nextClass.setHours(10, 0, 0, 0); // Set to 10:00 AM

  return nextClass.toISOString();
}
