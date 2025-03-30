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
    const formattedSubscriptions = subscriptions.map((sub) => ({
      id: sub.id,
      status: sub.status,
      packageName: sub.package.package_type,
      price: sub.package.current_price,
      currency: sub.package.currency,
      startDate: sub.startDate.toISOString(),
    }));

    return NextResponse.json(formattedSubscriptions);
  } catch (error) {
    console.error('[SUBSCRIPTIONS_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
