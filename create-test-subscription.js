const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestSubscription() {
  try {
    // Find or create test student user
    let user = await prisma.user.findUnique({
      where: { email: 'ahmed.student@example.com' }
    });

    if (!user) {
      console.log('Creating test student user...');
      const hashedPassword = await bcrypt.hash('password123', 12);
      user = await prisma.user.create({
        data: {
          name: 'Ahmed Student',
          email: 'ahmed.student@example.com',
          password: hashedPassword,
          role: 'USER',
          emailVerified: new Date(),
          isTeacher: false,
        }
      });
      console.log('✅ Created test student user');
    } else {
      console.log('✅ Found existing test student user');
    }

    // Get first package
    const packages = await prisma.package.findMany({
      take: 2
    });

    if (packages.length === 0) {
      console.log('❌ No packages found. Please run seed first.');
      return;
    }

    // Create test subscriptions
    for (const pkg of packages) {
      const existingSubscription = await prisma.subscription.findFirst({
        where: {
          userId: user.id,
          packageId: pkg.id
        }
      });

      if (!existingSubscription) {
        const subscription = await prisma.subscription.create({
          data: {
            userId: user.id,
            packageId: pkg.id,
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            status: 'ACTIVE',
            classes_completed: Math.floor(Math.random() * 5),
            classes_remaining: Math.floor(Math.random() * 15) + 10,
            auto_renew: true,
            payment_method: 'Credit Card ending in 4242',
          },
        });
        console.log(`✅ Created subscription for package: ${pkg.title || pkg.id}`);
      } else {
        console.log(`ℹ️  Subscription already exists for package: ${pkg.title || pkg.id}`);
      }
    }

    console.log('🎉 Test subscriptions setup completed!');
  } catch (error) {
    console.error('❌ Error creating test subscription:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestSubscription();
