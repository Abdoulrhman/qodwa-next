const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createAdminUser() {
  // Get the first user or create an admin user
  const users = await prisma.user.findMany({
    take: 1,
  });

  if (users.length === 0) {
    console.log('No users found. Create a user account first.');
    return;
  }

  const user = users[0];

  // Update the first user to be an admin
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { role: 'ADMIN' },
  });

  console.log('Updated user to admin:', {
    id: updatedUser.id,
    email: updatedUser.email,
    role: updatedUser.role,
  });
}

createAdminUser()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
