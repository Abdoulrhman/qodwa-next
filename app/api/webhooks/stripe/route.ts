import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/db';
import { headers } from 'next/headers';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('stripe-signature') as string;

  if (!signature) {
    return NextResponse.json({ error: 'No signature found' }, { status: 400 });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error.message);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;

        // Get the user ID and package ID from the session metadata
        const userId = session.metadata?.userId;
        const packageId = parseInt(session.metadata?.packageId);

        if (!userId || !packageId) {
          return NextResponse.json(
            { error: 'Missing userId or packageId in session metadata' },
            { status: 200 } // Still return 200 to acknowledge receipt
          );
        }

        // Create or update the subscription
        const subscription = await db.subscription.upsert({
          where: {
            userId_packageId: {
              userId: userId,
              packageId: packageId,
            },
          },
          update: {
            status: 'ACTIVE',
            startDate: new Date(),
            endDate: null,
          },
          create: {
            userId: userId,
            packageId: packageId,
            status: 'ACTIVE',
            startDate: new Date(),
          },
        });

        // Update the user's hasBookedDemo status if this is their first subscription
        const user = await db.user.findUnique({
          where: { id: userId },
          include: { subscriptions: true },
        });

        if (user && user.subscriptions.length === 1) {
          await db.user.update({
            where: { id: userId },
            data: { hasBookedDemo: true },
          });
        }

        return NextResponse.json({ success: true }, { status: 200 });
      }

      case 'checkout.session.expired': {
        const session = event.data.object as any;
        console.log('Checkout session expired:', session.id);
        return NextResponse.json({ success: true }, { status: 200 });
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as any;
        console.log('Payment succeeded:', paymentIntent.id);
        return NextResponse.json({ success: true }, { status: 200 });
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as any;
        console.log('Payment failed:', paymentIntent.id);
        return NextResponse.json({ success: true }, { status: 200 });
      }

      default:
        // Always acknowledge receipt of unknown event types
        console.log(`Unhandled event type: ${event.type}`);
        return NextResponse.json({ success: true }, { status: 200 });
    }
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    // Even in case of processing errors, return 200 to acknowledge receipt
    return NextResponse.json(
      { error: 'Error processing webhook', message: error.message },
      { status: 200 }
    );
  }
}
