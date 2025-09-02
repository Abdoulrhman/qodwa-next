const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testLoginVerification() {
  try {
    console.log('🔍 Testing login verification for unverified users...');

    // Find the unverified test user
    const unverifiedUser = await prisma.user.findUnique({
      where: {
        email: 'test.unverified@example.com',
      },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        password: true,
      },
    });

    if (!unverifiedUser) {
      console.log('❌ Test user not found. Creating one...');

      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('password123', 10);

      const newUser = await prisma.user.create({
        data: {
          name: 'Test Unverified User',
          email: 'test.unverified@example.com',
          password: hashedPassword,
          emailVerified: null, // Explicitly set as null
        },
      });

      console.log('✅ Created unverified test user:', {
        id: newUser.id,
        email: newUser.email,
        emailVerified: newUser.emailVerified,
      });
    } else {
      console.log('📧 Found test user:', {
        email: unverifiedUser.email,
        emailVerified: unverifiedUser.emailVerified,
        hasPassword: !!unverifiedUser.password,
      });

      if (unverifiedUser.emailVerified) {
        console.log(
          '⚠️  User is already verified! Setting back to unverified...'
        );
        await prisma.user.update({
          where: { id: unverifiedUser.id },
          data: { emailVerified: null },
        });
        console.log('✅ User set back to unverified state');
      }
    }

    console.log(
      '\n✅ Test user is ready for testing email verification enforcement'
    );
    console.log('👤 You can now try to login with:');
    console.log('   Email: test.unverified@example.com');
    console.log('   Password: password123');
    console.log('   Expected: Should show email verification error message');
  } catch (error) {
    console.error('❌ Error during test setup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLoginVerification();
