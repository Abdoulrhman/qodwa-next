const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Base monthly packages
const basePackages = [
  {
    title: '8 Classes',
    description: 'We are just warming up',
    monthly_price: 45.0,
    original_price: '50.00',
    days: 2,
    class_duration: 30,
    total_classes: 8,
    duration_weeks: 4,
    subject: 'Quran',
    level: 'Beginner',
    features: ['2 days / week', '30 minutes / day'],
    package_type: 'basic',
    sort_order: 1,
  },
  {
    title: '12 Classes',
    description: 'We are just getting started',
    monthly_price: 60.0,
    original_price: '66.00',
    days: 3,
    class_duration: 30,
    total_classes: 12,
    duration_weeks: 4,
    subject: 'Quran',
    level: 'Beginner',
    features: ['3 days / week', '30 minutes / day'],
    package_type: 'standard',
    sort_order: 2,
  },
  {
    title: '16 Classes',
    description: 'The most popular plan',
    monthly_price: 75.0,
    original_price: '80.00',
    days: 4,
    class_duration: 30,
    total_classes: 16,
    duration_weeks: 4,
    subject: 'Quran',
    level: 'Intermediate',
    features: ['4 days / week', '30 minutes / day'],
    package_type: 'premium',
    sort_order: 3,
    is_popular_monthly: true,
  },
  {
    title: '20 Classes',
    description: 'We mean serious business!',
    monthly_price: 88.0,
    original_price: '95.00',
    days: 5,
    class_duration: 30,
    total_classes: 20,
    duration_weeks: 4,
    subject: 'Quran',
    level: 'Intermediate',
    features: ['5 days / week', '30 minutes / day'],
    package_type: 'premium',
    sort_order: 4,
  },
  {
    title: '24 Classes',
    description: "We're on the fast track!",
    monthly_price: 100.0,
    original_price: '108.00',
    days: 6,
    class_duration: 30,
    total_classes: 24,
    duration_weeks: 4,
    subject: 'Quran',
    level: 'Advanced',
    features: ['6 days / week', '30 minutes / day'],
    package_type: 'enterprise',
    sort_order: 5,
  },
  {
    title: '28 Classes',
    description: 'Welcome to the ultimate experience!',
    monthly_price: 110.0,
    original_price: '120.00',
    days: 7,
    class_duration: 30,
    total_classes: 28,
    duration_weeks: 4,
    subject: 'Quran',
    level: 'Advanced',
    features: ['7 days / week', '30 minutes / day'],
    package_type: 'enterprise',
    sort_order: 6,
  },
];

// Generate packages for all subscription frequencies
const packagesData = [];

basePackages.forEach((basePackage, index) => {
  // Monthly packages
  const monthlyPackage = {
    ...basePackage,
    current_price: basePackage.monthly_price.toFixed(2),
    subscription_frequency: 'monthly',
    discount: '0%',
    features: [
      ...basePackage.features,
      `$${(basePackage.monthly_price / basePackage.total_classes).toFixed(1)} / class`,
    ],
    currency: 'USD',
    is_popular: basePackage.is_popular_monthly || false,
    is_active: true,
    enrollment_action: 'subscribe',
    sort_order: index * 4 + 1,
  };
  delete monthlyPackage.monthly_price;
  delete monthlyPackage.is_popular_monthly;

  // Quarterly packages (5% discount)
  const quarterlyPrice = basePackage.monthly_price * 3 * 0.95;
  const quarterlyPackage = {
    ...basePackage,
    current_price: quarterlyPrice.toFixed(2),
    original_price: (basePackage.monthly_price * 3).toFixed(2),
    subscription_frequency: 'quarterly',
    discount: '5%',
    total_classes: basePackage.total_classes * 3,
    duration_weeks: basePackage.duration_weeks * 3,
    features: [
      ...basePackage.features,
      `$${(quarterlyPrice / (basePackage.total_classes * 3)).toFixed(1)} / class`,
      'Save 5%',
    ],
    currency: 'USD',
    is_popular: false,
    is_active: true,
    enrollment_action: 'subscribe',
    sort_order: index * 4 + 2,
  };
  delete quarterlyPackage.monthly_price;
  delete quarterlyPackage.is_popular_monthly;

  // Semi-Annual packages (10% discount)
  const semiAnnualPrice = basePackage.monthly_price * 6 * 0.9;
  const semiAnnualPackage = {
    ...basePackage,
    current_price: semiAnnualPrice.toFixed(2),
    original_price: (basePackage.monthly_price * 6).toFixed(2),
    subscription_frequency: 'half-year',
    discount: '10%',
    total_classes: basePackage.total_classes * 6,
    duration_weeks: basePackage.duration_weeks * 6,
    features: [
      ...basePackage.features,
      `$${(semiAnnualPrice / (basePackage.total_classes * 6)).toFixed(1)} / class`,
      'Save 10%',
    ],
    currency: 'USD',
    is_popular: index === 2, // Make 16 Classes semi-annual popular
    is_active: true,
    enrollment_action: 'subscribe',
    sort_order: index * 4 + 3,
  };
  delete semiAnnualPackage.monthly_price;
  delete semiAnnualPackage.is_popular_monthly;

  // Yearly packages (20% discount)
  const yearlyPrice = basePackage.monthly_price * 12 * 0.8;
  const yearlyPackage = {
    ...basePackage,
    current_price: yearlyPrice.toFixed(2),
    original_price: (basePackage.monthly_price * 12).toFixed(2),
    subscription_frequency: 'yearly',
    discount: '20%',
    total_classes: basePackage.total_classes * 12,
    duration_weeks: basePackage.duration_weeks * 12,
    features: [
      ...basePackage.features,
      `$${(yearlyPrice / (basePackage.total_classes * 12)).toFixed(1)} / class`,
      'Save 20%',
    ],
    currency: 'USD',
    is_popular: false,
    is_active: true,
    enrollment_action: 'subscribe',
    sort_order: index * 4 + 4,
  };
  delete yearlyPackage.monthly_price;
  delete yearlyPackage.is_popular_monthly;

  packagesData.push(
    monthlyPackage,
    quarterlyPackage,
    semiAnnualPackage,
    yearlyPackage
  );
});

async function seedPackages() {
  console.log('🌱 Starting packages seed...');

  const prisma = new PrismaClient();

  try {
    // Clear existing packages
    await prisma.package.deleteMany({});
    console.log('🗑️  Cleared existing packages');

    // Insert new packages
    for (const packageData of packagesData) {
      const createdPackage = await prisma.package.create({
        data: packageData,
      });
      console.log(`✅ Created package: ${createdPackage.title}`);
    }

    console.log('🎉 Packages seed completed successfully!');
    console.log(`📦 Created ${packagesData.length} packages`);
  } catch (error) {
    console.error('❌ Error seeding packages:', error);
    throw error;
  }
}

async function main() {
  try {
    await seedPackages();
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

module.exports = { seedPackages };
