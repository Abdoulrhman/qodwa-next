import { db } from '@/lib/db';

// Test if TypeScript recognizes the new models
async function testModels() {
  // Test PaymentMethod model
  const paymentMethods = await db.paymentMethod.findMany();
  console.log('PaymentMethod model works:', paymentMethods.length);

  // Test PaymentIntent model
  const paymentIntents = await db.paymentIntent.findMany();
  console.log('PaymentIntent model works:', paymentIntents.length);

  // Test updated Subscription model
  const subscriptions = await db.subscription.findMany({
    select: {
      id: true,
      auto_renew: true,
      next_billing_date: true,
      stripe_subscription_id: true,
    },
  });
  console.log('Enhanced Subscription model works:', subscriptions.length);

  // Test updated User model
  const users = await db.user.findMany({
    select: {
      id: true,
      stripeCustomerId: true,
      defaultPaymentMethodId: true,
    },
  });
  console.log('Enhanced User model works:', users.length);
}

export default testModels;
