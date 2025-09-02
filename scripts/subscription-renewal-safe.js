#!/usr/bin/env node

/**
 * Subscription Renewal Script (Schema-Safe Version)
 * 
 * This script runs daily via GitHub Actions to process subscription renewals.
 * Currently configured to work with the existing schema until auto-renewal fields are added.
 */

const { PrismaClient } = require('@prisma/client');

// Initialize clients
const db = new PrismaClient();

/**
 * Main renewal processing function (schema-safe version)
 */
async function processSubscriptionRenewals() {
  console.log(`🔄 Starting subscription renewal process at ${new Date().toISOString()}`);
  
  try {
    // Find active subscriptions (without auto-renewal fields for now)
    const activeSubscriptions = await db.subscription.findMany({
      where: {
        status: 'ACTIVE'
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        },
        package: {
          select: {
            id: true,
            current_price: true,
            title: true,
            subscription_frequency: true
          }
        }
      },
      take: 10 // Limit for safety
    });

    console.log(`📋 Found ${activeSubscriptions.length} active subscriptions`);
    console.log('ℹ️  Auto-renewal processing will be enabled after database schema update');

    if (activeSubscriptions.length > 0) {
      console.log('\n📊 Active subscriptions summary:');
      activeSubscriptions.forEach((sub, index) => {
        console.log(`${index + 1}. User: ${sub.user.email}`);
        console.log(`   Package: ${sub.package.title}`);
        console.log(`   Price: $${sub.package.current_price}`);
        console.log(`   Frequency: ${sub.package.subscription_frequency}`);
        console.log('   Status: Ready for auto-renewal setup');
        console.log('');
      });
    }

    // Summary
    console.log(`\n📊 Renewal System Status:`);
    console.log(`✅ Database connected successfully`);
    console.log(`✅ Found ${activeSubscriptions.length} active subscriptions`);
    console.log(`⏳ Auto-renewal fields pending schema update`);
    console.log(`🔧 System ready for full auto-renewal deployment`);

    // Test Stripe connection
    if (process.env.STRIPE_SECRET_KEY) {
      console.log('\n💳 Testing Stripe connection...');
      try {
        const Stripe = require('stripe');
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        const account = await stripe.accounts.retrieve();
        console.log(`✅ Stripe connected: ${account.display_name || account.id}`);
      } catch (error) {
        console.log(`⚠️  Stripe connection issue: ${error.message}`);
      }
    }

    console.log('\n🎉 Subscription renewal check completed successfully!');
    console.log('\n📝 Next steps for full auto-renewal:');
    console.log('1. Uncomment auto-renewal fields in prisma/schema.prisma');
    console.log('2. Apply database migration');
    console.log('3. Enable full auto-renewal processing');

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
  const required = ['DATABASE_URL'];
  const missing = required.filter(env => !process.env[env]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
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
  processSubscriptionRenewals
};
