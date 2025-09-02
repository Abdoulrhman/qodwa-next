import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { stripe } from '@/lib/stripe';
import { createOrGetStripeCustomer } from '@/lib/stripe-subscription';

interface LineItem {
  name: string;
  price: number;
  quantity: number;
  packageId: number;
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      items,
      auto_renew = false,
    }: { items: LineItem[]; auto_renew?: boolean } = await req.json();
    const locale =
      req.headers.get('accept-language')?.split(',')[0].split('-')[0] || 'en';

    // Get the first item's packageId (assuming one package per checkout)
    const packageId = items[0]?.packageId;
    if (!packageId) {
      return NextResponse.json(
        { error: 'Package ID is required' },
        { status: 400 }
      );
    }

    // Create or get Stripe customer
    const customerId = await createOrGetStripeCustomer(
      session.user.id,
      session.user.email!,
      session.user.name || undefined
    );

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: items.map((item) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            description: auto_renew
              ? 'Subscription with auto-renewal'
              : 'One-time payment',
          },
          unit_amount: item.price * 100,
        },
        quantity: item.quantity,
      })),
      mode: auto_renew ? 'setup' : 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/${locale}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/${locale}/cancel`,
      metadata: {
        userId: session.user.id,
        packageId: packageId.toString(),
        auto_renew: auto_renew.toString(),
      },
      // For auto-renewal, we need to set up a setup intent to save the payment method
      ...(auto_renew && {
        setup_intent_data: {
          metadata: {
            userId: session.user.id,
            packageId: packageId.toString(),
          },
        },
      }),
      // Save payment method for future use
      payment_intent_data: !auto_renew
        ? {
            setup_future_usage: 'off_session',
            metadata: {
              userId: session.user.id,
              packageId: packageId.toString(),
            },
          }
        : undefined,
    });

    return NextResponse.json({ sessionId: checkoutSession.id });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
