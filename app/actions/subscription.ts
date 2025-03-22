'use server';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

type SubscriptionStatus = 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'PENDING';

export async function createSubscription(packageId: number) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error('Unauthorized');
    }

    // Check if user already has an active subscription
    const existingSubscription = await db.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: 'ACTIVE' as SubscriptionStatus,
      },
    });

    if (existingSubscription) {
      return {
        success: false,
        error: 'You already have an active subscription',
      };
    }

    // Create new subscription
    const subscription = await db.subscription.create({
      data: {
        userId: session.user.id,
        packageId,
        status: 'PENDING' as SubscriptionStatus,
      },
      include: {
        package: true,
      },
    });

    revalidatePath('/');
    return { success: true, subscription };
  } catch (error) {
    console.error('Error creating subscription:', error);
    return { success: false, error: 'Failed to create subscription' };
  }
}

export async function updateSubscriptionStatus(
  subscriptionId: string,
  status: SubscriptionStatus
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error('Unauthorized');
    }

    const subscription = await db.subscription.update({
      where: {
        id: subscriptionId,
      },
      data: {
        status,
        ...(status === 'ACTIVE' && {
          startDate: new Date(),
        }),
      },
      include: {
        package: true,
      },
    });

    revalidatePath('/');
    return { success: true, subscription };
  } catch (error) {
    console.error('Error updating subscription:', error);
    return { success: false, error: 'Failed to update subscription' };
  }
}

export async function cancelSubscription(subscriptionId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error('Unauthorized');
    }

    const subscription = await db.subscription.update({
      where: {
        id: subscriptionId,
      },
      data: {
        status: 'CANCELLED' as SubscriptionStatus,
        endDate: new Date(),
      },
      include: {
        package: true,
      },
    });

    revalidatePath('/');
    return { success: true, subscription };
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return { success: false, error: 'Failed to cancel subscription' };
  }
}
