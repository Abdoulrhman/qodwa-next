import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import stripe from '@/lib/stripe-client';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const paymentMethodId = params.id;

    if (!paymentMethodId) {
      return NextResponse.json(
        { error: 'Payment method ID is required' },
        { status: 400 }
      );
    }

    // Check if this payment method belongs to the user
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

    // Check if this is the user's default payment method
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { defaultPaymentMethodId: true, stripeCustomerId: true },
    });

    if (user?.defaultPaymentMethodId === paymentMethodId) {
      // Find another active payment method to set as default
      const otherPaymentMethod = await db.paymentMethod.findFirst({
        where: {
          userId: session.user.id,
          isActive: true,
          id: { not: paymentMethodId },
        },
      });

      // Update user's default payment method
      await db.user.update({
        where: { id: session.user.id },
        data: {
          defaultPaymentMethodId: otherPaymentMethod?.id || null,
        },
      });

      // Update default in Stripe if there's another payment method
      if (user.stripeCustomerId && otherPaymentMethod) {
        await stripe.customers.update(user.stripeCustomerId, {
          invoice_settings: {
            default_payment_method: otherPaymentMethod.stripePaymentMethodId,
          },
        });
      }
    }

    // Detach payment method from Stripe customer
    try {
      await stripe.paymentMethods.detach(paymentMethod.stripePaymentMethodId);
    } catch (stripeError) {
      console.error('Error detaching payment method from Stripe:', stripeError);
      // Continue with database deletion even if Stripe fails
    }

    // Mark payment method as inactive in database
    await db.paymentMethod.update({
      where: { id: paymentMethodId },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting payment method:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
