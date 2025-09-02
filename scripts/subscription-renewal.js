#!/usr/bin/env node

/**
 * Subscription Renewal Script
 *
 * This script runs daily via GitHub Actions to process subscription renewals.
 * It handles automatic billing for students with active subscriptions and saved payment methods.
 */

const { PrismaClient } = require('@prisma/client');
const Stripe = require('stripe');

// Initialize clients
const db = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Main renewal processing function
 */
async function processSubscriptionRenewals() {
  console.log(
    `🔄 Starting subscription renewal process at ${new Date().toISOString()}`
  );

  try {
    // Find subscriptions that need renewal
    const subscriptionsToRenew = await db.subscription.findMany({
      where: {
        status: 'ACTIVE',
        auto_renew: true,
        next_billing_date: {
          lte: new Date(),
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            stripeCustomerId: true,
            defaultPaymentMethodId: true,
          },
        },
        package: {
          select: {
            id: true,
            current_price: true,
            title: true,
            subscription_frequency: true,
          },
        },
      },
    });

    console.log(
      `📋 Found ${subscriptionsToRenew.length} subscriptions to process`
    );

    if (subscriptionsToRenew.length === 0) {
      console.log('✅ No subscriptions need renewal today');
      return;
    }

    const results = {
      successful: 0,
      failed: 0,
      errors: [],
    };

    // Process each subscription
    for (const subscription of subscriptionsToRenew) {
      try {
        const result = await processSubscriptionRenewal(subscription);
        if (result.success) {
          results.successful++;
          console.log(
            `✅ Successfully renewed subscription ${subscription.id} for user ${subscription.user.email}`
          );
        } else {
          results.failed++;
          results.errors.push({
            subscriptionId: subscription.id,
            userEmail: subscription.user.email,
            error: result.error,
          });
          console.error(
            `❌ Failed to renew subscription ${subscription.id}:`,
            result.error
          );
        }
      } catch (error) {
        results.failed++;
        results.errors.push({
          subscriptionId: subscription.id,
          userEmail: subscription.user.email,
          error: error.message,
        });
        console.error(
          `❌ Exception processing subscription ${subscription.id}:`,
          error
        );
      }
    }

    // Log summary
    console.log(`\n📊 Renewal Summary:`);
    console.log(`✅ Successful: ${results.successful}`);
    console.log(`❌ Failed: ${results.failed}`);

    if (results.errors.length > 0) {
      console.log(`\n🚨 Errors:`);
      results.errors.forEach((error) => {
        console.log(
          `- ${error.userEmail} (${error.subscriptionId}): ${error.error}`
        );
      });
    }
  } catch (error) {
    console.error('💥 Critical error in renewal process:', error);
    throw error;
  } finally {
    await db.$disconnect();
  }
}

/**
 * Process a single subscription renewal
 */
async function processSubscriptionRenewal(subscription) {
  const { user, package: pkg } = subscription;

  // Validate user has payment setup
  if (!user.stripeCustomerId || !user.defaultPaymentMethodId) {
    return {
      success: false,
      error: 'User does not have payment method configured',
    };
  }

  try {
    // Create payment intent for renewal
    const amount = parseFloat(pkg.current_price) * 100; // Convert to cents

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      customer: user.stripeCustomerId,
      payment_method: user.defaultPaymentMethodId,
      confirm: true,
      description: `Subscription renewal: ${pkg.title}`,
      metadata: {
        subscriptionId: subscription.id,
        userId: user.id,
        packageId: pkg.id.toString(),
        renewalDate: new Date().toISOString(),
      },
    });

    if (paymentIntent.status === 'succeeded') {
      // Calculate next billing date
      const nextBillingDate = calculateNextBillingDate(
        pkg.subscription_frequency
      );

      // Update subscription
      await db.subscription.update({
        where: { id: subscription.id },
        data: {
          next_billing_date: nextBillingDate,
          auto_renew_attempts: 0,
          last_renewal_attempt: new Date(),
          renewal_failure_reason: null,
        },
      });

      // Create payment intent record
      await db.paymentIntent.create({
        data: {
          stripePaymentIntentId: paymentIntent.id,
          subscriptionId: subscription.id,
          amount: amount / 100,
          currency: 'USD',
          status: 'SUCCEEDED',
          description: `Subscription renewal: ${pkg.title}`,
          processedAt: new Date(),
        },
      });

      return { success: true };
    } else {
      throw new Error(`Payment failed with status: ${paymentIntent.status}`);
    }
  } catch (error) {
    // Update subscription with failure info
    await db.subscription.update({
      where: { id: subscription.id },
      data: {
        auto_renew_attempts: subscription.auto_renew_attempts + 1,
        last_renewal_attempt: new Date(),
        renewal_failure_reason: error.message,
        // Disable auto-renewal after 3 failed attempts
        auto_renew: subscription.auto_renew_attempts >= 2 ? false : true,
      },
    });

    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Calculate next billing date based on frequency
 */
function calculateNextBillingDate(frequency) {
  const now = new Date();

  switch (frequency.toLowerCase()) {
    case 'monthly':
      return new Date(now.setMonth(now.getMonth() + 1));
    case 'quarterly':
      return new Date(now.setMonth(now.getMonth() + 3));
    case 'half-year':
      return new Date(now.setMonth(now.getMonth() + 6));
    case 'yearly':
      return new Date(now.setFullYear(now.getFullYear() + 1));
    default:
      // Default to monthly
      return new Date(now.setMonth(now.getMonth() + 1));
  }
}

/**
 * Validate environment variables
 */
function validateEnvironment() {
  const required = ['DATABASE_URL', 'STRIPE_SECRET_KEY'];
  const missing = required.filter((env) => !process.env[env]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
}

// Run the script
if (require.main === module) {
  validateEnvironment();
  processSubscriptionRenewals()
    .then(() => {
      console.log('🎉 Subscription renewal process completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Subscription renewal process failed:', error);
      process.exit(1);
    });
}

module.exports = {
  processSubscriptionRenewals,
  processSubscriptionRenewal,
  calculateNextBillingDate,
};
