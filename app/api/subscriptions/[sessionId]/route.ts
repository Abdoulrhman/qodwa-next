import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/db';

export async function GET(
  req: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    const sessionId = params.sessionId;

    // Retrieve the Stripe session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Get the user ID and package ID from the session metadata
    const userId = session.metadata?.userId;
    const packageIdStr = session.metadata?.packageId;

    if (!userId || !packageIdStr) {
      return NextResponse.json(
        { error: 'Missing user or package information' },
        { status: 400 }
      );
    }

    const packageId = parseInt(packageIdStr);

    // Fetch the subscription details
    const subscription = await db.subscription.findUnique({
      where: {
        userId_packageId: {
          userId,
          packageId,
        },
      },
      include: {
        package: true,
      },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ subscription });
  } catch (error: any) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      { error: 'Error fetching subscription details' },
      { status: 500 }
    );
  }
}
