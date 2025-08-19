#!/usr/bin/env node
/**
 * Script to create an admin user
 * Usage: node scripts/create-admin.js
 *
 * This script will prompt for admin details and create a new admin user
 * or update an existing user to admin status.
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const prisma = new PrismaClient();

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Helper function to prompt for input
function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

// Helper function to prompt for password (hidden input)
function promptPassword(question) {
  return new Promise((resolve) => {
    process.stdout.write(question);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    let password = '';
    process.stdin.on('data', function (char) {
      char = char + '';

      switch (char) {
        case '\n':
        case '\r':
        case '\u0004':
          process.stdin.setRawMode(false);
          process.stdin.pause();
          process.stdout.write('\n');
          resolve(password);
          break;
        case '\u0003':
          process.stdout.write('\n');
          process.exit();
          break;
        case '\u007f': // Backspace
          if (password.length > 0) {
            password = password.slice(0, -1);
            process.stdout.write('\b \b');
          }
          break;
        default:
          password += char;
          process.stdout.write('*');
          break;
      }
    });
  });
}

// Validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Main function to create admin user
async function createAdminUser() {
  console.log('🔧 Qodwa Admin User Creation Tool');
  console.log('=====================================\n');

  try {
    // Get admin details
    const email = await prompt('Enter admin email: ');

    if (!isValidEmail(email)) {
      console.log('❌ Invalid email format. Please try again.');
      process.exit(1);
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log(`\n👤 User with email "${email}" already exists.`);
      const choice = await prompt(
        'Do you want to update this user to admin? (y/n): '
      );

      if (choice.toLowerCase() !== 'y' && choice.toLowerCase() !== 'yes') {
        console.log('❌ Operation cancelled.');
        process.exit(0);
      }

      // Update existing user to admin
      const updatedUser = await prisma.user.update({
        where: { email },
        data: {
          role: 'ADMIN',
          emailVerified: new Date(), // Ensure admin email is verified
        },
      });

      console.log('\n✅ User successfully updated to admin!');
      console.log('📧 Email:', updatedUser.email);
      console.log('👑 Role:', updatedUser.role);
      console.log('🆔 ID:', updatedUser.id);
    } else {
      // Create new admin user
      const name = await prompt('Enter admin name: ');
      const password = await promptPassword('Enter admin password: ');
      const confirmPassword = await promptPassword('Confirm admin password: ');

      if (password !== confirmPassword) {
        console.log('\n❌ Passwords do not match. Please try again.');
        process.exit(1);
      }

      if (password.length < 6) {
        console.log('\n❌ Password must be at least 6 characters long.');
        process.exit(1);
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create admin user
      const newUser = await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          role: 'ADMIN',
          emailVerified: new Date(), // Admin users are automatically verified
        },
      });

      console.log('\n✅ Admin user successfully created!');
      console.log('📧 Email:', newUser.email);
      console.log('👤 Name:', newUser.name);
      console.log('👑 Role:', newUser.role);
      console.log('🆔 ID:', newUser.id);
      console.log('✅ Email verified:', newUser.emailVerified ? 'Yes' : 'No');
    }

    // Show total admin count
    const adminCount = await prisma.user.count({
      where: { role: 'ADMIN' },
    });

    console.log(`\n📊 Total admin users: ${adminCount}`);
    console.log('\n🎉 Admin user setup complete!');
  } catch (error) {
    console.error('\n❌ Error creating admin user:', error.message);
    process.exit(1);
  }
}

// Interactive menu for additional operations
async function showMenu() {
  console.log('\n📋 Additional Operations:');
  console.log('1. List all admin users');
  console.log('2. Remove admin role from user');
  console.log('3. Exit');

  const choice = await prompt('\nSelect an option (1-3): ');

  switch (choice) {
    case '1':
      await listAdminUsers();
      break;
    case '2':
      await removeAdminRole();
      break;
    case '3':
      console.log('👋 Goodbye!');
      process.exit(0);
      break;
    default:
      console.log('❌ Invalid choice. Please try again.');
      await showMenu();
  }
}

// List all admin users
async function listAdminUsers() {
  try {
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    if (admins.length === 0) {
      console.log('\n📭 No admin users found.');
    } else {
      console.log(`\n👑 Admin Users (${admins.length}):`);
      console.log('=====================================');
      admins.forEach((admin, index) => {
        console.log(
          `${index + 1}. ${admin.name || 'No name'} (${admin.email})`
        );
        console.log(`   ID: ${admin.id}`);
        console.log(`   Verified: ${admin.emailVerified ? 'Yes' : 'No'}`);
        console.log('');
      });
    }
  } catch (error) {
    console.error('❌ Error listing admin users:', error.message);
  }
}

// Remove admin role from user
async function removeAdminRole() {
  try {
    const email = await prompt('Enter email of user to remove admin role: ');

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log('❌ User not found.');
      return;
    }

    if (user.role !== 'ADMIN') {
      console.log('❌ User is not an admin.');
      return;
    }

    const confirm = await prompt(
      `Are you sure you want to remove admin role from "${email}"? (y/n): `
    );

    if (confirm.toLowerCase() === 'y' || confirm.toLowerCase() === 'yes') {
      await prisma.user.update({
        where: { email },
        data: { role: 'USER' },
      });
      console.log('✅ Admin role removed successfully.');
    } else {
      console.log('❌ Operation cancelled.');
    }
  } catch (error) {
    console.error('❌ Error removing admin role:', error.message);
  }
}

// Main execution
async function main() {
  await createAdminUser();

  const showMenuChoice = await prompt(
    '\nWould you like to see additional options? (y/n): '
  );
  if (
    showMenuChoice.toLowerCase() === 'y' ||
    showMenuChoice.toLowerCase() === 'yes'
  ) {
    await showMenu();
  }
}

// Run the script
main()
  .catch((error) => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  })
  .finally(async () => {
    rl.close();
    await prisma.$disconnect();
  });
