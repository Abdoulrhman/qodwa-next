import { stripe } from './stripe';
import { db } from './db';
import Stripe from 'stripe';

export interface CreateSubscriptionParams {
  userId: string;
  packageId: number;
  paymentMethodId: string;
  customerId?: string;
}

export interface SubscriptionRenewalResult {
  success: boolean;
  subscriptionId?: string;
  error?: string;
  paymentIntentId?: string;
}

/**
 * Create or retrieve a Stripe customer for a user
 */
export async function createOrGetStripeCustomer(
  userId: string,
  email: string,
  name?: string
): Promise<string> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true, email: true, name: true },
  });

  if (user?.stripeCustomerId) {
    return user.stripeCustomerId;
  }

  // Create new Stripe customer
  const customer = await stripe.customers.create({
    email: email,
    name: name || undefined,
    metadata: {
      userId: userId,
    },
  });

  // Update user with Stripe customer ID
  await db.user.update({
    where: { id: userId },
    data: { stripeCustomerId: customer.id },
  });

  return customer.id;
}

/**
 * Save payment method securely
 */
export async function savePaymentMethod(
  userId: string,
  stripePaymentMethodId: string
): Promise<void> {
  try {
    // Handle mock payment methods for testing
    if (stripePaymentMethodId.startsWith('pm_mock_')) {
      // Create mock payment method data
      const mockData = {
        type: 'card',
        last4: stripePaymentMethodId.includes('4242') ? '4242' : '1234',
        brand: stripePaymentMethodId.includes('visa') ? 'visa' : 'mastercard',
        expiryMonth: 12,
        expiryYear: 2027,
      };

      await db.paymentMethod.upsert({
        where: { stripePaymentMethodId },
        update: {
          isActive: true,
          updatedAt: new Date(),
        },
        create: {
          userId,
          stripePaymentMethodId,
          type: mockData.type,
          last4: mockData.last4,
          brand: mockData.brand,
          expiryMonth: mockData.expiryMonth,
          expiryYear: mockData.expiryYear,
          isDefault: false,
          isActive: true,
        },
      });
      return;
    }

    // Get payment method details from Stripe for real payment methods
    const paymentMethod = await stripe.paymentMethods.retrieve(
      stripePaymentMethodId
    );

    if (paymentMethod.type === 'card' && paymentMethod.card) {
      await db.paymentMethod.upsert({
        where: { stripePaymentMethodId },
        update: {
          isActive: true,
          updatedAt: new Date(),
        },
        create: {
          userId,
          stripePaymentMethodId,
          type: paymentMethod.type,
          last4: paymentMethod.card.last4,
          brand: paymentMethod.card.brand,
          expiryMonth: paymentMethod.card.exp_month,
          expiryYear: paymentMethod.card.exp_year,
          isDefault: false,
          isActive: true,
        },
      });
    }
  } catch (error) {
    console.error('Error saving payment method:', error);
    throw error;
  }
}

/**
 * Set default payment method for a user
 */
export async function setDefaultPaymentMethod(
  userId: string,
  paymentMethodId: string
): Promise<void> {
  // Remove default flag from all user's payment methods
  await db.paymentMethod.updateMany({
    where: { userId },
    data: { isDefault: false },
  });

  // Set the new default
  await db.paymentMethod.update({
    where: { stripePaymentMethodId: paymentMethodId },
    data: { isDefault: true },
  });

  // Update user's default payment method
  await db.user.update({
    where: { id: userId },
    data: { defaultPaymentMethodId: paymentMethodId },
  });
}

/**
 * Create a Stripe subscription with setup intent for auto-renewal
 */
export async function createStripeSubscription(
  params: CreateSubscriptionParams
): Promise<SubscriptionRenewalResult> {
  try {
    const { userId, packageId, paymentMethodId, customerId } = params;

    // Get package details
    const packageData = await db.package.findUnique({
      where: { id: packageId },
    });

    if (!packageData) {
      return { success: false, error: 'Package not found' };
    }

    // Get or create Stripe customer
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true, stripeCustomerId: true },
    });

    if (!user?.email) {
      return { success: false, error: 'User not found' };
    }

    const stripeCustomerId =
      customerId ||
      (await createOrGetStripeCustomer(
        userId,
        user.email,
        user.name || undefined
      ));

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: stripeCustomerId,
    });

    // Create or get price in Stripe
    const priceId = await createOrGetStripePrice(packageData);

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: stripeCustomerId,
      items: [{ price: priceId }],
      default_payment_method: paymentMethodId,
      metadata: {
        userId,
        packageId: packageId.toString(),
      },
      // Set billing cycle based on package frequency
      billing_cycle_anchor: getBillingCycleAnchor(
        packageData.subscription_frequency
      ),
    });

    // Save payment method
    await savePaymentMethod(userId, paymentMethodId);
    await setDefaultPaymentMethod(userId, paymentMethodId);

    // Update subscription in database
    await db.subscription.upsert({
      where: {
        userId_packageId: { userId, packageId },
      },
      update: {
        stripeSubscriptionId: subscription.id,
        auto_renew: true,
        next_billing_date: new Date(subscription.current_period_end * 1000),
        billing_cycle_anchor: new Date(
          subscription.billing_cycle_anchor! * 1000
        ),
        status: 'ACTIVE',
      },
      create: {
        userId,
        packageId,
        stripeSubscriptionId: subscription.id,
        auto_renew: true,
        next_billing_date: new Date(subscription.current_period_end * 1000),
        billing_cycle_anchor: new Date(
          subscription.billing_cycle_anchor! * 1000
        ),
        status: 'ACTIVE',
      },
    });

    return {
      success: true,
      subscriptionId: subscription.id,
    };
  } catch (error) {
    console.error('Error creating Stripe subscription:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Cancel auto-renewal for a subscription
 */
export async function cancelAutoRenewal(
  subscriptionId: string
): Promise<boolean> {
  try {
    const subscription = await db.subscription.findUnique({
      where: { id: subscriptionId },
      select: { stripeSubscriptionId: true },
    });

    if (!subscription?.stripeSubscriptionId) {
      return false;
    }

    // Cancel Stripe subscription at period end
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    // Update database
    await db.subscription.update({
      where: { id: subscriptionId },
      data: { auto_renew: false },
    });

    return true;
  } catch (error) {
    console.error('Error canceling auto-renewal:', error);
    return false;
  }
}

/**
 * Process subscription renewal (called by Railway Function)
 */
export async function processSubscriptionRenewal(
  subscriptionId: string
): Promise<SubscriptionRenewalResult> {
  try {
    const subscription = await db.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        user: {
          select: {
            stripeCustomerId: true,
            defaultPaymentMethodId: true,
            email: true,
          },
        },
        package: true,
      },
    });

    if (!subscription || !subscription.auto_renew) {
      return {
        success: false,
        error: 'Subscription not found or auto-renewal disabled',
      };
    }

    if (
      !subscription.user.stripeCustomerId ||
      !subscription.user.defaultPaymentMethodId
    ) {
      return { success: false, error: 'No payment method available' };
    }

    // Create payment intent for renewal
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(parseFloat(subscription.package.current_price) * 100),
      currency: subscription.package.currency.toLowerCase(),
      customer: subscription.user.stripeCustomerId,
      payment_method: subscription.user.defaultPaymentMethodId,
      confirm: true,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never',
      },
      metadata: {
        subscriptionId,
        userId: subscription.userId,
        packageId: subscription.packageId.toString(),
        renewalAttempt: (subscription.auto_renew_attempts + 1).toString(),
      },
    });

    // Record payment intent
    await db.paymentIntent.create({
      data: {
        stripePaymentIntentId: paymentIntent.id,
        subscriptionId,
        amount: parseFloat(subscription.package.current_price),
        currency: subscription.package.currency,
        status: paymentIntent.status === 'succeeded' ? 'SUCCEEDED' : 'PENDING',
        description: `Auto-renewal for ${subscription.package.package_type}`,
        processedAt: paymentIntent.status === 'succeeded' ? new Date() : null,
      },
    });

    if (paymentIntent.status === 'succeeded') {
      // Calculate next billing date
      const nextBillingDate = calculateNextBillingDate(
        subscription.package.subscription_frequency
      );

      // Reset subscription period
      await db.subscription.update({
        where: { id: subscriptionId },
        data: {
          next_billing_date: nextBillingDate,
          auto_renew_attempts: 0,
          last_renewal_attempt: new Date(),
          status: 'ACTIVE',
        },
      });

      return {
        success: true,
        subscriptionId,
        paymentIntentId: paymentIntent.id,
      };
    } else {
      // Handle failed payment
      await db.subscription.update({
        where: { id: subscriptionId },
        data: {
          auto_renew_attempts: subscription.auto_renew_attempts + 1,
          last_renewal_attempt: new Date(),
          renewal_failure_reason:
            paymentIntent.last_payment_error?.message || 'Payment failed',
        },
      });

      return {
        success: false,
        error: paymentIntent.last_payment_error?.message || 'Payment failed',
      };
    }
  } catch (error) {
    console.error('Error processing subscription renewal:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get subscriptions due for renewal
 */
export async function getSubscriptionsDueForRenewal(): Promise<
  Array<{ id: string; userId: string; packageId: number }>
> {
  const now = new Date();
  const gracePeriod = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours grace period

  const subscriptions = await db.subscription.findMany({
    where: {
      auto_renew: true,
      status: 'ACTIVE',
      next_billing_date: {
        lte: gracePeriod,
      },
      auto_renew_attempts: {
        lt: 3, // Max 3 attempts
      },
    },
    select: {
      id: true,
      userId: true,
      packageId: true,
    },
  });

  return subscriptions;
}

// Helper functions

function getBillingCycleAnchor(frequency: string): number {
  const now = new Date();
  let anchor: Date;

  switch (frequency) {
    case 'monthly':
      anchor = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
      break;
    case 'quarterly':
      anchor = new Date(now.getFullYear(), now.getMonth() + 3, now.getDate());
      break;
    case 'half-year':
      anchor = new Date(now.getFullYear(), now.getMonth() + 6, now.getDate());
      break;
    case 'yearly':
      anchor = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
      break;
    default:
      anchor = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
  }

  return Math.floor(anchor.getTime() / 1000);
}

export function calculateNextBillingDate(frequency: string): Date {
  const now = new Date();

  switch (frequency) {
    case 'monthly':
      return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
    case 'quarterly':
      return new Date(now.getFullYear(), now.getMonth() + 3, now.getDate());
    case 'half-year':
      return new Date(now.getFullYear(), now.getMonth() + 6, now.getDate());
    case 'yearly':
      return new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
    default:
      return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
  }
}

async function createOrGetStripePrice(packageData: any): Promise<string> {
  // Check if price already exists in Stripe by searching existing prices
  const existingPrices = await stripe.prices.list({
    product: `prod_${packageData.id}_${packageData.package_type}`,
    limit: 100,
  });

  const matchingPrice = existingPrices.data.find(
    (price) => 
      price.unit_amount === Math.round(parseFloat(packageData.current_price) * 100) &&
      price.recurring?.interval === getStripeInterval(packageData.subscription_frequency)
  );

  if (matchingPrice) {
    return matchingPrice.id;
  }

  // Create new price
  const price = await stripe.prices.create({
    unit_amount: Math.round(parseFloat(packageData.current_price) * 100),
    currency: packageData.currency.toLowerCase(),
    recurring: {
      interval: getStripeInterval(packageData.subscription_frequency),
      interval_count: getIntervalCount(packageData.subscription_frequency),
    },
    product_data: {
      name: `${packageData.package_type} - ${packageData.subscription_frequency}`,
      metadata: {
        description: packageData.description || '',
        package_id: packageData.id.toString(),
      },
    },
  });

  return price.id;
}

function getStripeInterval(frequency: string): 'month' | 'year' {
  switch (frequency) {
    case 'yearly':
      return 'year';
    default:
      return 'month';
  }
}

function getIntervalCount(frequency: string): number {
  switch (frequency) {
    case 'monthly':
      return 1;
    case 'quarterly':
      return 3;
    case 'half-year':
      return 6;
    case 'yearly':
      return 1;
    default:
      return 1;
  }
}
