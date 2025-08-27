/**
 * Test script to verify email verification enforcement
 * Run with: node scripts/test-email-verification.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const db = new PrismaClient();

async function createUnverifiedUser() {
  try {
    // Create a test user without email verification
    const hashedPassword = await bcrypt.hash('testpassword123', 12);
    
    const testUser = await db.user.create({
      data: {
        name: 'Test User',
        email: 'test.unverified@example.com',
        password: hashedPassword,
        role: 'USER',
        emailVerified: null, // Explicitly set to null (unverified)
      },
    });

    console.log('✅ Created unverified test user:', {
      id: testUser.id,
      email: testUser.email,
      emailVerified: testUser.emailVerified,
    });

    console.log('\n📋 Test Instructions:');
    console.log('1. Try logging in with: test.unverified@example.com / testpassword123');
    console.log('2. You should be blocked from accessing the dashboard');
    console.log('3. You should be redirected to /auth/verify-email');
    
    return testUser;
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('⚠️  Test user already exists, deleting and recreating...');
      await db.user.delete({
        where: { email: 'test.unverified@example.com' }
      });
      return createUnverifiedUser();
    }
    console.error('❌ Error creating test user:', error);
  }
}

async function createVerifiedUser() {
  try {
    // Create a test user with email verification
    const hashedPassword = await bcrypt.hash('testpassword123', 12);
    
    const testUser = await db.user.create({
      data: {
        name: 'Verified User',
        email: 'test.verified@example.com',
        password: hashedPassword,
        role: 'USER',
        emailVerified: new Date(), // Verified
      },
    });

    console.log('✅ Created verified test user:', {
      id: testUser.id,
      email: testUser.email,
      emailVerified: testUser.emailVerified,
    });

    console.log('\n📋 Comparison Test:');
    console.log('1. Try logging in with: test.verified@example.com / testpassword123');
    console.log('2. This user SHOULD be able to access the dashboard');
    
    return testUser;
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('⚠️  Verified test user already exists, deleting and recreating...');
      await db.user.delete({
        where: { email: 'test.verified@example.com' }
      });
      return createVerifiedUser();
    }
    console.error('❌ Error creating verified test user:', error);
  }
}

async function main() {
  console.log('🧪 Creating test users for email verification enforcement...\n');
  
  await createUnverifiedUser();
  console.log('');
  await createVerifiedUser();

  console.log('\n🔒 Email verification enforcement is now active!');
  console.log('📧 Unverified users will be redirected to the verification page.');
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
