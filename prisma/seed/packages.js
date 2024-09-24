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

// Generate an array of dynamic packages
async function generatePackages(count) {
  const packages = [];
  for (let i = 0; i < count; i++) {
    const isThirtyMinutes = i % 2 === 0; // Alternate between 30 and 60 minutes
    const packageType = isThirtyMinutes ? "30 Minutes" : "60 Minutes";

    packages.push({
      current_price: getRandomPrice(90, 250),
      original_price: getRandomPrice(200, 350),
      discount: getRandomDiscount(),
      subscription_frequency: "monthly",
      days_per_week: (Math.floor(Math.random() * 5) + 1).toString(), // Convert number to string
      classes_per_month: (Math.floor(Math.random() * 20) + 1).toString(), // Convert number to string
      class_duration: isThirtyMinutes ? "30 minutes" : "60 minutes",
      enrollment_action: "Enroll",
      package_type: packageType,
    });
  }
  return packages;
}

async function main() {
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
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
