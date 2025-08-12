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

    console.log('Session metadata:', session.metadata);
    console.log('User ID:', userId, 'Package ID:', packageIdStr);

    if (!userId || !packageIdStr) {
      return NextResponse.json(
        { error: 'Missing user or package information' },
        { status: 400 }
      );
    }

    const packageId = parseInt(packageIdStr);

    // Fetch the subscription details - let's find the most recent one for this user and package
    let subscription = await db.subscription.findFirst({
      where: {
        userId: userId,
        packageId: packageId,
      },
      include: {
        package: true,
      },
      orderBy: {
        startDate: 'desc', // Get the most recent subscription
      },
    });

    console.log('Found subscription:', subscription);

    if (!subscription) {
      // If subscription doesn't exist, create it (webhook might not have processed yet)
      console.log('Subscription not found, creating new one...');

      try {
        const newSubscription = await db.subscription.create({
          data: {
            userId: userId,
            packageId: packageId,
            status: 'ACTIVE',
            startDate: new Date(),
          },
          include: {
            package: true,
          },
        });

        console.log('Created new subscription:', newSubscription);
        subscription = newSubscription;
      } catch (createError) {
        console.error('Error creating subscription:', createError);
        return NextResponse.json(
          { error: 'Subscription not found and could not be created' },
          { status: 404 }
        );
      }
    }

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    // Format the response to match what the frontend expects
    const formattedSubscription = {
      id: subscription.id.toString(),
      status: subscription.status,
      package: {
        package_type: subscription.package.package_type,
        package_id: subscription.package.id.toString(),
        price: parseFloat(subscription.package.current_price),
        currency: subscription.package.currency,
      },
      packageName: subscription.package.package_type,
      price: parseFloat(subscription.package.current_price),
      currency: subscription.package.currency,
      createdAt:
        subscription.startDate?.toISOString() || new Date().toISOString(),
    };

    return NextResponse.json(formattedSubscription);
  } catch (error: any) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      { error: 'Error fetching subscription details' },
      { status: 500 }
    );
  }
}
