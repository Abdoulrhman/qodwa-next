import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's payment history from database
    const paymentIntents = await db.paymentIntent.findMany({
      where: {
        subscription: {
          userId: session.user.id,
        },
      },
      include: {
        subscription: {
          include: {
            package: {
              select: {
                title: true,
                current_price: true,
              },
            },
          },
        },
      },
      orderBy: {
        processedAt: 'desc',
      },
    });

    const payments = paymentIntents.map((intent) => ({
      id: intent.id,
      amount: intent.amount, // Amount is already in dollars in the schema
      currency: intent.currency,
      status: intent.status,
      description:
        intent.description ||
        `Payment for ${intent.subscription?.package?.title}`,
      processedAt: intent.processedAt || intent.createdAt,
      subscription: {
        package: {
          title: intent.subscription?.package?.title,
        },
      },
    }));

    return NextResponse.json({ payments });
  } catch (error) {
    console.error('Error fetching payment history:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
