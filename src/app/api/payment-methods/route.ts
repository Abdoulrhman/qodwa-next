import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { stripe } from '@/lib/stripe';
import {
  createOrGetStripeCustomer,
  savePaymentMethod,
  setDefaultPaymentMethod,
} from '@/lib/stripe-subscription';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const paymentMethods = await db.paymentMethod.findMany({
      where: {
        userId: session.user.id,
        isActive: true,
      },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({
      success: true,
      paymentMethods,
    });
  } catch (error) {
    console.error('[PAYMENT_METHODS_GET]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { payment_method_id, set_as_default = false } = await req.json();

    if (!payment_method_id) {
      return NextResponse.json(
        { error: 'Payment method ID is required' },
        { status: 400 }
      );
    }

    // Get or create Stripe customer
    const customerId = await createOrGetStripeCustomer(
      session.user.id,
      session.user.email!,
      session.user.name || undefined
    );

    // Attach payment method to customer
    await stripe.paymentMethods.attach(payment_method_id, {
      customer: customerId,
    });

    // Save payment method to database
    await savePaymentMethod(session.user.id, payment_method_id);

    // Set as default if requested
    if (set_as_default) {
      await setDefaultPaymentMethod(session.user.id, payment_method_id);
    }

    return NextResponse.json({
      success: true,
      message: 'Payment method saved successfully',
    });
  } catch (error) {
    console.error('[PAYMENT_METHODS_POST]', error);
    return NextResponse.json(
      { error: 'Failed to save payment method' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { payment_method_id } = await req.json();

    if (!payment_method_id) {
      return NextResponse.json(
        { error: 'Payment method ID is required' },
        { status: 400 }
      );
    }

    // Detach from Stripe
    await stripe.paymentMethods.detach(payment_method_id);

    // Mark as inactive in database
    await db.paymentMethod.update({
      where: { stripePaymentMethodId: payment_method_id },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      message: 'Payment method removed successfully',
    });
  } catch (error) {
    console.error('[PAYMENT_METHODS_DELETE]', error);
    return NextResponse.json(
      { error: 'Failed to remove payment method' },
      { status: 500 }
    );
  }
}
