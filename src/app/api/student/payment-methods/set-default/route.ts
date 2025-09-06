import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import stripe from '@/lib/stripe-client';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { paymentMethodId } = await request.json();

    if (!paymentMethodId) {
      return NextResponse.json(
        { error: 'Payment method ID is required' },
        { status: 400 }
      );
    }

    // Verify the payment method belongs to the user
    const paymentMethod = await db.paymentMethod.findFirst({
      where: {
        id: paymentMethodId,
        userId: session.user.id,
        isActive: true,
      },
    });

    if (!paymentMethod) {
      return NextResponse.json(
        { error: 'Payment method not found' },
        { status: 404 }
      );
    }

    // Get user with Stripe customer ID
    const user = await db.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || !user.stripeCustomerId) {
      return NextResponse.json(
        { error: 'User or Stripe customer not found' },
        { status: 404 }
      );
    }

    // Update default payment method in Stripe
    await stripe.customers.update(user.stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethod.stripePaymentMethodId,
      },
    });

    // Update user's default payment method in database
    await db.user.update({
      where: { id: session.user.id },
      data: { defaultPaymentMethodId: paymentMethodId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error setting default payment method:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
