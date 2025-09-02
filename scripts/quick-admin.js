#!/usr/bin/env node
/**
 * Quick Admin User Creation Script
 * Usage: node scripts/quick-admin.js [email] [name] [password]
 *
 * Example: node scripts/quick-admin.js admin@qodwa.com "Admin User" "securepassword123"
 *
 * If no arguments provided, it will use default values.
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Default admin credentials (change these for production!)
const DEFAULT_ADMIN = {
  email: 'admin@qodwa.com',
  name: 'Qodwa Admin',
  password: 'admin123456', // Change this!
};

async function createQuickAdmin() {
  console.log('🚀 Quick Admin Creation Script');
  console.log('==============================\n');

  try {
    // Get credentials from command line or use defaults
    const email = process.argv[2] || DEFAULT_ADMIN.email;
    const name = process.argv[3] || DEFAULT_ADMIN.name;
    const password = process.argv[4] || DEFAULT_ADMIN.password;

    console.log('📧 Email:', email);
    console.log('👤 Name:', name);
    console.log('🔐 Password:', '***' + password.slice(-3));

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log('\n⚠️  User already exists. Updating to admin role...');

      const updatedUser = await prisma.user.update({
        where: { email },
        data: {
          role: 'ADMIN',
          emailVerified: new Date(),
        },
      });

      console.log('✅ User updated to admin successfully!');
      console.log('🆔 User ID:', updatedUser.id);
      console.log('👑 Role:', updatedUser.role);
    } else {
      console.log('\n🔨 Creating new admin user...');

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create new admin user
      const newUser = await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          role: 'ADMIN',
          emailVerified: new Date(),
        },
      });

      console.log('✅ Admin user created successfully!');
      console.log('🆔 User ID:', newUser.id);
      console.log('👑 Role:', newUser.role);
      console.log('✅ Email verified: Yes');
    }

    // Show admin count
    const adminCount = await prisma.user.count({
      where: { role: 'ADMIN' },
    });

    console.log(`\n📊 Total admin users: ${adminCount}`);

    console.log('\n🎉 Admin setup complete!');
    console.log('💡 You can now log in with these credentials:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(
      '\n⚠️  Remember to change the default password after first login!'
    );
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// Usage information
function showUsage() {
  console.log('Usage: node scripts/quick-admin.js [email] [name] [password]');
  console.log('');
  console.log('Examples:');
  console.log('  node scripts/quick-admin.js');
  console.log('  node scripts/quick-admin.js admin@example.com');
  console.log('  node scripts/quick-admin.js admin@example.com "John Admin"');
  console.log(
    '  node scripts/quick-admin.js admin@example.com "John Admin" "mypassword123"'
  );
  console.log('');
  console.log('If no arguments provided, default credentials will be used.');
}

// Check for help flag
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  showUsage();
  process.exit(0);
}

// Run the script
createQuickAdmin()
  .catch((error) => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
