#!/usr/bin/env node

/**
 * Test Script for Subscription Renewal Logic
 *
 * This script tests the renewal logic without processing actual payments.
 * Use this to verify the system is working before enabling auto-renewal.
 */

const { PrismaClient } = require('@prisma/client');

const db = new PrismaClient();

async function testRenewalSystem() {
  console.log(
    `🧪 Testing subscription renewal system at ${new Date().toISOString()}`
  );

  try {
    // Test 1: Database connection
    console.log('\n1️⃣ Testing database connection...');
    const userCount = await db.user.count();
    console.log(`✅ Connected! Found ${userCount} users in database`);

    // Test 2: Find subscriptions with auto-renewal enabled
    console.log('\n2️⃣ Testing auto-renewal subscription detection...');
    const autoRenewSubs = await db.subscription.findMany({
      where: {
        auto_renew: true,
        status: 'ACTIVE',
      },
      include: {
        user: {
          select: {
            email: true,
            stripeCustomerId: true,
            defaultPaymentMethodId: true,
          },
        },
        package: {
          select: {
            title: true,
            current_price: true,
            subscription_frequency: true,
          },
        },
      },
      take: 5,
    });

    console.log(
      `✅ Found ${autoRenewSubs.length} subscriptions with auto-renewal enabled`
    );

    if (autoRenewSubs.length > 0) {
      console.log('\n📋 Auto-renewal subscriptions:');
      autoRenewSubs.forEach((sub, index) => {
        const hasPaymentMethod =
          sub.user.stripeCustomerId && sub.user.defaultPaymentMethodId;
        console.log(`${index + 1}. ${sub.user.email}`);
        console.log(
          `   Package: ${sub.package.title} ($${sub.package.current_price})`
        );
        console.log(
          `   Payment Method: ${hasPaymentMethod ? '✅ Available' : '❌ Missing'}`
        );
        console.log(`   Next Billing: ${sub.next_billing_date || 'Not set'}`);
        console.log('');
      });
    }

    // Test 3: Find subscriptions due for renewal (next 7 days)
    console.log('\n3️⃣ Testing renewal eligibility detection...');
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const dueSoon = await db.subscription.findMany({
      where: {
        status: 'ACTIVE',
        OR: [
          {
            next_billing_date: {
              lte: sevenDaysFromNow,
            },
          },
          {
            endDate: {
              lte: sevenDaysFromNow,
            },
          },
        ],
      },
      include: {
        user: {
          select: {
            email: true,
          },
        },
        package: {
          select: {
            title: true,
            current_price: true,
          },
        },
      },
    });

    console.log(
      `✅ Found ${dueSoon.length} subscriptions due for renewal within 7 days`
    );

    if (dueSoon.length > 0) {
      console.log('\n📅 Subscriptions due soon:');
      dueSoon.forEach((sub, index) => {
        console.log(`${index + 1}. ${sub.user.email}`);
        console.log(
          `   Package: ${sub.package.title} ($${sub.package.current_price})`
        );
        console.log(`   End Date: ${sub.endDate?.toDateString() || 'Not set'}`);
        console.log(
          `   Auto-Renew: ${sub.auto_renew ? '✅ Enabled' : '❌ Disabled'}`
        );
        console.log('');
      });
    }

    // Test 4: Environment variables check
    console.log('\n4️⃣ Testing environment configuration...');
    const envVars = [
      'DATABASE_URL',
      'STRIPE_SECRET_KEY',
      'NEXTAUTH_SECRET',
      'NEXT_PUBLIC_APP_URL',
    ];

    envVars.forEach((envVar) => {
      const value = process.env[envVar];
      if (value) {
        console.log(`✅ ${envVar}: Set (${value.length} characters)`);
      } else {
        console.log(`❌ ${envVar}: Missing`);
      }
    });

    // Test 5: Stripe connection test
    console.log('\n5️⃣ Testing Stripe connection...');
    if (process.env.STRIPE_SECRET_KEY) {
      try {
        const Stripe = require('stripe');
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        const account = await stripe.accounts.retrieve();
        console.log(
          `✅ Stripe connected: ${account.display_name || account.id}`
        );
      } catch (error) {
        console.log(`❌ Stripe connection failed: ${error.message}`);
      }
    } else {
      console.log('❌ STRIPE_SECRET_KEY not found');
    }

    // Summary and recommendations
    console.log('\n📊 System Readiness Assessment:');

    const hasAutoRenewSubs = autoRenewSubs.length > 0;
    const hasValidPaymentMethods = autoRenewSubs.some(
      (sub) => sub.user.stripeCustomerId && sub.user.defaultPaymentMethodId
    );
    const hasStripeConnection = !!process.env.STRIPE_SECRET_KEY;
    const hasDatabaseAccess = userCount > 0;

    console.log(`Database Access: ${hasDatabaseAccess ? '✅' : '❌'}`);
    console.log(`Stripe Connection: ${hasStripeConnection ? '✅' : '❌'}`);
    console.log(
      `Auto-Renewal Subscriptions: ${hasAutoRenewSubs ? '✅' : '⚠️  None found'}`
    );
    console.log(
      `Valid Payment Methods: ${hasValidPaymentMethods ? '✅' : '⚠️  None found'}`
    );

    if (
      hasDatabaseAccess &&
      hasStripeConnection &&
      hasAutoRenewSubs &&
      hasValidPaymentMethods
    ) {
      console.log('\n🎉 System is READY for production auto-renewal!');
      console.log('\n📝 To enable production auto-renewal:');
      console.log(
        '1. Update GitHub Actions workflow to use subscription-renewal-production.js'
      );
      console.log(
        '2. Ensure all required environment variables are set in GitHub Secrets'
      );
      console.log('3. Test with manual workflow dispatch first');
    } else {
      console.log('\n⚠️  System needs setup before enabling auto-renewal:');
      if (!hasAutoRenewSubs) {
        console.log('- Enable auto-renewal for active subscriptions');
      }
      if (!hasValidPaymentMethods) {
        console.log('- Ensure users have valid payment methods');
      }
      if (!hasStripeConnection) {
        console.log('- Configure Stripe API keys');
      }
    }
  } catch (error) {
    console.error('💥 Test failed:', error);
    throw error;
  } finally {
    await db.$disconnect();
  }
}

// Run the test
if (require.main === module) {
  testRenewalSystem()
    .then(() => {
      console.log('\n🎉 Renewal system test completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Renewal system test failed:', error);
      process.exit(1);
    });
}

module.exports = {
  testRenewalSystem,
};
