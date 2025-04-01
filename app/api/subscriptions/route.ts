import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const subscriptions = await db.subscription.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        package: true,
      },
      orderBy: {
        startDate: 'desc',
      },
    });

    // Transform the data to match the expected format
    const formattedSubscriptions = subscriptions.map((sub) => {
      // Calculate end date based on subscription frequency
      const startDate = new Date(sub.startDate);
      let endDate = new Date(startDate);

      switch (sub.package.subscription_frequency.toLowerCase()) {
        case 'monthly':
          endDate.setMonth(startDate.getMonth() + 1);
          break;
        case 'quarterly':
          endDate.setMonth(startDate.getMonth() + 3);
          break;
        case 'semmi-annual':
          endDate.setMonth(startDate.getMonth() + 6);
          break;
        case 'yearly':
          endDate.setFullYear(startDate.getFullYear() + 1);
          break;
        default:
          // Default to monthly if frequency is unknown
          endDate.setMonth(startDate.getMonth() + 1);
      }

      return {
        id: sub.id,
        status: sub.status,
        packageName: sub.package.package_type,
        price: sub.package.current_price,
        currency: sub.package.currency,
        startDate: sub.startDate.toISOString(),
        endDate: endDate.toISOString(),
        frequency: sub.package.subscription_frequency,
      };
    });

    return NextResponse.json(formattedSubscriptions);
  } catch (error) {
    console.error('[SUBSCRIPTIONS_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
