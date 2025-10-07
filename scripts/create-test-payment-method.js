const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestPaymentMethod() {
  try {
    // Find test student user
    const user = await prisma.user.findUnique({
      where: { email: 'ahmed.student@example.com' }
    });

    if (!user) {
      console.log('❌ Test student user not found');
      return;
    }

    // Check if payment method already exists
    const existingPaymentMethod = await prisma.paymentMethod.findFirst({
      where: { userId: user.id }
    });

    if (!existingPaymentMethod) {
      const paymentMethod = await prisma.paymentMethod.create({
        data: {
          userId: user.id,
          stripePaymentMethodId: 'pm_test_card_visa_4242',
          type: 'card',
          last4: '4242',
          brand: 'visa',
          expiryMonth: 12,
          expiryYear: 2027,
          isDefault: true,
          isActive: true,
        },
      });
      console.log('✅ Created test payment method');
    } else {
      console.log('ℹ️  Payment method already exists');
    }

    // Also update the user with Stripe customer ID
    await prisma.user.update({
      where: { id: user.id },
      data: {
        stripeCustomerId: 'cus_test_customer_123',
        defaultPaymentMethodId: 'pm_test_card_visa_4242'
      }
    });
    console.log('✅ Updated user with Stripe customer info');

    console.log('🎉 Test payment method setup completed!');
  } catch (error) {
    console.error('❌ Error creating test payment method:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestPaymentMethod();
