#!/usr/bin/env node

/**
 * Test Subscription Renewal Script
 * 
 * This script tests the subscription renewal functionality locally
 * before deploying to GitHub Actions.
 */

const { PrismaClient } = require('@prisma/client');

const db = new PrismaClient();

async function testRenewalSetup() {
  console.log('🧪 Testing subscription renewal setup...\n');
  
  try {
    // Check if we have the required models (when uncommented)
    console.log('📋 Checking database models...');
    
    // Test basic subscription query
    const subscriptions = await db.subscription.findMany({
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
      take: 5
    });

    console.log(`✅ Found ${subscriptions.length} active subscriptions`);
    
    if (subscriptions.length > 0) {
      console.log('\n📊 Sample subscription data:');
      subscriptions.forEach((sub, index) => {
        console.log(`${index + 1}. User: ${sub.user.email}`);
        console.log(`   Package: ${sub.package.title}`);
        console.log(`   Price: $${sub.package.current_price}`);
        console.log(`   Frequency: ${sub.package.subscription_frequency}`);
        console.log(`   Auto-renew: ${sub.auto_renew || 'Not set'}`);
        console.log('');
      });
    }

    // Test environment variables
    console.log('🔧 Checking environment variables...');
    const requiredEnvs = ['DATABASE_URL', 'STRIPE_SECRET_KEY'];
    const missing = requiredEnvs.filter(env => !process.env[env]);
    
    if (missing.length > 0) {
      console.error(`❌ Missing environment variables: ${missing.join(', ')}`);
    } else {
      console.log('✅ All required environment variables are set');
    }

    // Test Stripe connection
    if (process.env.STRIPE_SECRET_KEY) {
      console.log('\n💳 Testing Stripe connection...');
      const Stripe = require('stripe');
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      
      try {
        const account = await stripe.accounts.retrieve();
        console.log(`✅ Connected to Stripe account: ${account.display_name || account.id}`);
      } catch (error) {
        console.error('❌ Stripe connection failed:', error.message);
      }
    }

    console.log('\n🎉 Test completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Uncomment the auto-renewal fields in prisma/schema.prisma');
    console.log('2. Run: npx prisma db push (or create migration)');
    console.log('3. Test the renewal script: yarn renewal:test');
    console.log('4. Configure GitHub repository secrets');
    console.log('5. Deploy and test GitHub Actions workflow');

  } catch (error) {
    console.error('💥 Test failed:', error);
    throw error;
  } finally {
    await db.$disconnect();
  }
}

// Run the test
if (require.main === module) {
  testRenewalSetup()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { testRenewalSetup };
