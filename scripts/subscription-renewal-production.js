#!/usr/bin/env node

/**
 * Subscription Renewal Script (Production Version)
 *
 * This script runs daily via GitHub Actions to process automatic subscription renewals.
 * It handles Stripe payment processing and manages subscription lifecycles.
 */

const { PrismaClient } = require('@prisma/client');
const Stripe = require('stripe');

// Initialize clients
const db = new PrismaClient();
let stripe;

/**
 * Initialize Stripe client
 */
function initializeStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY environment variable is required');
  }
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  console.log('✅ Stripe client initialized');
}

/**
 * Find subscriptions eligible for renewal
 */
async function findEligibleSubscriptions() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const subscriptions = await db.subscription.findMany({
    where: {
      status: 'ACTIVE',
      auto_renew: true,
      next_billing_date: {
        lte: tomorrow,
      },
      auto_renew_attempts: {
        lt: 3, // Maximum 3 retry attempts
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
    take: 50, // Process max 50 at a time for safety
  });

  console.log(
    `📋 Found ${subscriptions.length} subscriptions eligible for renewal`
  );
  return subscriptions;
}

/**
 * Process a single subscription renewal
 */
async function processSubscriptionRenewal(subscription) {
  const { user, package: pkg } = subscription;

  console.log(`\n🔄 Processing renewal for user: ${user.email}`);
  console.log(`   Package: ${pkg.title} ($${pkg.current_price})`);

  try {
    // Validate user has payment method
    if (!user.stripeCustomerId || !user.defaultPaymentMethodId) {
      await handleRenewalFailure(subscription.id, 'No valid payment method');
      return { success: false, reason: 'No payment method' };
    }

    // Calculate next billing dates
    const currentEndDate = subscription.endDate || new Date();
    const newEndDate = calculateNextEndDate(
      currentEndDate,
      pkg.subscription_frequency
    );
    const nextBillingDate = calculateNextBillingDate(
      newEndDate,
      pkg.subscription_frequency
    );

    // Create payment intent
    const amount = Math.round(parseFloat(pkg.current_price) * 100); // Convert to cents

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      customer: user.stripeCustomerId,
      payment_method: user.defaultPaymentMethodId,
      confirm: true,
      return_url: process.env.NEXT_PUBLIC_APP_URL || 'https://qodwa.vercel.app',
      description: `Auto-renewal: ${pkg.title}`,
      metadata: {
        subscriptionId: subscription.id,
        userId: user.id,
        packageId: pkg.id.toString(),
        renewal: 'true',
      },
    });

    if (paymentIntent.status === 'succeeded') {
      // Payment successful - update subscription
      const updatedSubscription = await db.subscription.update({
        where: { id: subscription.id },
        data: {
          endDate: newEndDate,
          next_billing_date: nextBillingDate,
          auto_renew_attempts: 0, // Reset attempts
          last_renewal_attempt: new Date(),
          renewal_failure_reason: null,
          classes_remaining: pkg.classes_per_month || 8, // Reset classes
          status: 'ACTIVE',
        },
      });

      // Create payment record
      await db.paymentIntent.create({
        data: {
          stripePaymentIntentId: paymentIntent.id,
          subscriptionId: subscription.id,
          amount: parseFloat(pkg.current_price),
          currency: 'USD',
          status: 'SUCCEEDED',
          description: `Auto-renewal: ${pkg.title}`,
          processedAt: new Date(),
        },
      });

      console.log(
        `✅ Renewal successful! New end date: ${newEndDate.toDateString()}`
      );
      return { success: true, newEndDate };
    } else {
      // Payment failed
      await handleRenewalFailure(
        subscription.id,
        `Payment failed: ${paymentIntent.status}`
      );
      return { success: false, reason: `Payment ${paymentIntent.status}` };
    }
  } catch (error) {
    console.error(`❌ Renewal failed for ${user.email}:`, error.message);
    await handleRenewalFailure(subscription.id, error.message);
    return { success: false, reason: error.message };
  }
}

/**
 * Handle renewal failure
 */
async function handleRenewalFailure(subscriptionId, reason) {
  const subscription = await db.subscription.findUnique({
    where: { id: subscriptionId },
  });

  const newAttempts = (subscription.auto_renew_attempts || 0) + 1;
  const shouldCancel = newAttempts >= 3;

  await db.subscription.update({
    where: { id: subscriptionId },
    data: {
      auto_renew_attempts: newAttempts,
      last_renewal_attempt: new Date(),
      renewal_failure_reason: reason,
      status: shouldCancel ? 'EXPIRED' : 'ACTIVE',
      auto_renew: shouldCancel ? false : true,
    },
  });

  if (shouldCancel) {
    console.log(`⚠️  Subscription cancelled after 3 failed attempts`);
  } else {
    console.log(`⚠️  Renewal attempt ${newAttempts}/3 failed: ${reason}`);
  }
}

/**
 * Calculate next end date based on subscription frequency
 */
function calculateNextEndDate(currentDate, frequency) {
  const newDate = new Date(currentDate);

  switch (frequency.toLowerCase()) {
    case 'monthly':
      newDate.setMonth(newDate.getMonth() + 1);
      break;
    case 'quarterly':
      newDate.setMonth(newDate.getMonth() + 3);
      break;
    case 'half-year':
      newDate.setMonth(newDate.getMonth() + 6);
      break;
    case 'yearly':
      newDate.setFullYear(newDate.getFullYear() + 1);
      break;
    default:
      newDate.setMonth(newDate.getMonth() + 1); // Default to monthly
  }

  return newDate;
}

/**
 * Calculate next billing date (7 days before end date)
 */
function calculateNextBillingDate(endDate, frequency) {
  const billingDate = new Date(endDate);
  billingDate.setDate(billingDate.getDate() - 7); // Bill 7 days before expiry
  return billingDate;
}

/**
 * Main renewal processing function
 */
async function processSubscriptionRenewals() {
  console.log(
    `🔄 Starting subscription renewal process at ${new Date().toISOString()}`
  );

  try {
    initializeStripe();

    const eligibleSubscriptions = await findEligibleSubscriptions();

    if (eligibleSubscriptions.length === 0) {
      console.log('✅ No subscriptions need renewal at this time');
      return;
    }

    let successCount = 0;
    let failureCount = 0;
    const results = [];

    // Process each subscription
    for (const subscription of eligibleSubscriptions) {
      const result = await processSubscriptionRenewal(subscription);
      results.push({
        subscriptionId: subscription.id,
        userEmail: subscription.user.email,
        packageTitle: subscription.package.title,
        ...result,
      });

      if (result.success) {
        successCount++;
      } else {
        failureCount++;
      }

      // Add delay between processing to avoid rate limits
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // Summary report
    console.log(`\n📊 Renewal Process Summary:`);
    console.log(`✅ Successful renewals: ${successCount}`);
    console.log(`❌ Failed renewals: ${failureCount}`);
    console.log(`📋 Total processed: ${eligibleSubscriptions.length}`);

    // Log failures for review
    if (failureCount > 0) {
      console.log(`\n❌ Failed Renewals:`);
      results
        .filter((r) => !r.success)
        .forEach((result, index) => {
          console.log(
            `${index + 1}. ${result.userEmail} (${result.packageTitle}): ${result.reason}`
          );
        });
    }

    console.log('\n🎉 Subscription renewal process completed!');
  } catch (error) {
    console.error('💥 Critical error in renewal process:', error);
    throw error;
  } finally {
    await db.$disconnect();
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
  findEligibleSubscriptions,
};
