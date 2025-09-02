import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { cancelAutoRenewal } from '@/lib/stripe-subscription';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { subscriptionId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { enabled } = await req.json();
    const subscriptionId = params.subscriptionId;

    // Verify the subscription belongs to the user
    const subscription = await db.subscription.findFirst({
      where: {
        id: subscriptionId,
        userId: session.user.id,
      },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    if (enabled) {
      // Check if user has a default payment method
      const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: { defaultPaymentMethodId: true },
      });

      if (!user?.defaultPaymentMethodId) {
        return NextResponse.json(
          {
            error:
              'No payment method available. Please add a payment method first.',
          },
          { status: 400 }
        );
      }

      // Enable auto-renewal
      await db.subscription.update({
        where: { id: subscriptionId },
        data: {
          auto_renew: true,
          // Reset failure attempts when enabling
          auto_renew_attempts: 0,
          renewal_failure_reason: null,
        },
      });
    } else {
      // Disable auto-renewal
      if (subscription.stripe_subscription_id) {
        await cancelAutoRenewal(subscriptionId);
      } else {
        await db.subscription.update({
          where: { id: subscriptionId },
          data: { auto_renew: false },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: enabled ? 'Auto-renewal enabled' : 'Auto-renewal disabled',
    });
  } catch (error) {
    console.error('[AUTO_RENEWAL_PATCH]', error);
    return NextResponse.json(
      { error: 'Failed to update auto-renewal setting' },
      { status: 500 }
    );
  }
}
