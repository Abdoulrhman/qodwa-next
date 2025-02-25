const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Function to generate random prices between a range
const getRandomPrice = (min, max) => {
  return (Math.random() * (max - min) + min).toFixed(2);
};

// Function to create a random discount
const getRandomDiscount = () => {
  return (Math.random() * 30 + 10).toFixed(2); // Random discount between 10% and 40%
};

// Function to randomly assign subscription frequencies
const getRandomSubscriptionFrequency = () => {
  const frequencies = ['monthly', 'quarterly', 'half-year', 'yearly'];
  return frequencies[Math.floor(Math.random() * frequencies.length)];
};

// Generate an array of dynamic packages
async function generatePackages(count) {
  const packages = [];

  for (let i = 1; i <= count; i++) {
    const isThirtyMinutes = i % 2 === 0; // Alternate between 30 and 60 minutes
    const packageType = isThirtyMinutes ? '30 Minutes' : '60 Minutes';
    const originalPrice = parseFloat(getRandomPrice(200, 350));
    const discount = parseFloat(getRandomDiscount());
    const currentPrice = (
      originalPrice -
      originalPrice * (discount / 100)
    ).toFixed(2);

    packages.push({
      package_id: i, // Unique package ID
      current_price: currentPrice.toString(),
      original_price: originalPrice.toFixed(2),
      discount: discount.toFixed(2),
      subscription_frequency: getRandomSubscriptionFrequency(),
      days: Math.floor(Math.random() * 7) + 1, // Random days per week (1-7)
      class_duration: isThirtyMinutes ? 30 : 60, // 30 or 60 minutes as integer
      is_popular: Math.random() < 0.3, // 30% chance to be popular
      currency: 'USD',
      enrollment_action: 'Enroll',
      package_type: packageType,
    });
  }

  return packages;
}

async function main() {
  console.log('Seeding packages...');

  const packagesCount = 12; // Number of packages to generate
  const packages = await generatePackages(packagesCount);

  // Seed the packages into the database
  for (const pkg of packages) {
    await prisma.package.create({
      data: pkg,
    });
  }

  console.log(`${packagesCount} packages seeded successfully!`);
}

main()
  .catch((e) => {
    console.error('Error seeding packages:', e);
    process.exit(1);
  })
  .finally(async () => {
    prisma.$disconnect();
  });
