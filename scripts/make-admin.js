#!/usr/bin/env node
/**
 * Enhanced Make Admin Script
 * Usage: node scripts/make-admin.js [email]
 *
 * This script updates an existing user to admin role.
 * If no email provided, it will prompt for one or use the first user.
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function makeUserAdmin() {
  console.log('👑 Make User Admin Script');
  console.log('=========================\n');

  try {
    let targetEmail = process.argv[2];

    if (!targetEmail) {
      // If no email provided, show available users
      const users = await prisma.user.findMany({
        where: {
          role: { not: 'ADMIN' },
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
        take: 10,
      });

      if (users.length === 0) {
        console.log(
          '❌ No non-admin users found. All users are already admins or no users exist.'
        );

        // Show existing admins
        const admins = await prisma.user.findMany({
          where: { role: 'ADMIN' },
          select: { email: true, name: true },
        });

        if (admins.length > 0) {
          console.log('\n👑 Existing admin users:');
          admins.forEach((admin, index) => {
            console.log(
              `  ${index + 1}. ${admin.name || 'No name'} (${admin.email})`
            );
          });
        }

        process.exit(1);
      }

      console.log('📋 Available users to promote:');
      users.forEach((user, index) => {
        console.log(
          `  ${index + 1}. ${user.name || 'No name'} (${user.email}) - Role: ${user.role}`
        );
      });

      console.log('\n💡 Usage: node scripts/make-admin.js [email]');
      console.log('Example: node scripts/make-admin.js user@example.com');
      process.exit(0);
    }

    // Find the target user
    const user = await prisma.user.findUnique({
      where: { email: targetEmail },
    });

    if (!user) {
      console.log(`❌ User with email "${targetEmail}" not found.`);
      process.exit(1);
    }

    if (user.role === 'ADMIN') {
      console.log(`✅ User "${targetEmail}" is already an admin.`);
      console.log('👤 Name:', user.name || 'No name');
      console.log('🆔 ID:', user.id);
      process.exit(0);
    }

    console.log('👤 Found user:');
    console.log('  📧 Email:', user.email);
    console.log('  👤 Name:', user.name || 'No name');
    console.log('  🎭 Current Role:', user.role);
    console.log('  🆔 ID:', user.id);

    // Update user to admin
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        role: 'ADMIN',
        emailVerified: user.emailVerified || new Date(), // Ensure email is verified for admins
      },
    });

    console.log('\n✅ User successfully promoted to admin!');
    console.log('👑 New Role:', updatedUser.role);
    console.log('✅ Email verified:', updatedUser.emailVerified ? 'Yes' : 'No');

    // Show updated admin count
    const adminCount = await prisma.user.count({
      where: { role: 'ADMIN' },
    });

    const userCount = await prisma.user.count();

    console.log(`\n📊 Statistics:`);
    console.log(`  👑 Total admins: ${adminCount}`);
    console.log(`  👥 Total users: ${userCount}`);

    console.log('\n🎉 Admin promotion complete!');
  } catch (error) {
    console.error('\n❌ Error promoting user to admin:', error.message);
    process.exit(1);
  }
}

// Show usage if help requested
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('Make User Admin Script');
  console.log('======================');
  console.log('');
  console.log('Usage: node scripts/make-admin.js [email]');
  console.log('');
  console.log('Examples:');
  console.log(
    '  node scripts/make-admin.js                    # List available users'
  );
  console.log(
    '  node scripts/make-admin.js user@example.com   # Make specific user admin'
  );
  console.log('');
  console.log('This script promotes an existing user to admin role.');
  process.exit(0);
}

// Run the script
makeUserAdmin()
  .catch((e) => {
    console.error('❌ Unexpected error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
