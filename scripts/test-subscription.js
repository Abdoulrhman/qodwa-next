const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestSubscription() {
  // First, get a user (or create one for testing)
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ isTeacher: false }, { isTeacher: null }],
    },
  });

  if (!user) {
    console.log('No student user found to create subscription for');
    return;
  }

  // Get the first package
  const packageData = await prisma.package.findFirst();

  if (!packageData) {
    console.log('No package found to create subscription for');
    return;
  }

  // Create a test subscription
  const subscription = await prisma.subscription.create({
    data: {
      userId: user.id,
      packageId: packageData.id,
      status: 'ACTIVE',
      startDate: new Date(),
      classes_completed: 10,
      classes_remaining: 14,
      next_class_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      auto_renew: true,
      payment_method: 'Credit Card',
    },
  });

  console.log('Test subscription created:', subscription);
}

createTestSubscription()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
