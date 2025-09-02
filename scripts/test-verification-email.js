const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testEmailSending() {
  try {
    console.log('🔍 Testing email verification system...');

    // Test 1: Check if Resend configuration is loaded
    const resendApiKey = process.env.RESEND_API_KEY;
    const resendFromEmail = process.env.RESEND_FROM_EMAIL;

    console.log('\n📧 Email Configuration:');
    console.log('RESEND_API_KEY:', resendApiKey ? '✅ Set' : '❌ Missing');
    console.log('RESEND_FROM_EMAIL:', resendFromEmail || '❌ Missing');

    if (!resendApiKey || !resendFromEmail) {
      console.log('\n❌ Email configuration is incomplete!');
      return;
    }

    // Test 2: Check recent user registrations without email verification
    console.log('\n👥 Checking recent unverified users...');
    const unverifiedUsers = await prisma.user.findMany({
      where: {
        emailVerified: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        isTeacher: true,
      },
      take: 10,
    });

    console.log(`Found ${unverifiedUsers.length} unverified users:`);
    unverifiedUsers.forEach((user) => {
      console.log(
        `  - ${user.name} (${user.email}) - ${user.isTeacher ? 'Teacher' : 'Student'}`
      );
    });

    // Test 3: Check verification tokens table
    console.log('\n🔑 Checking verification tokens...');
    const recentTokens = await prisma.verificationToken.findMany({
      orderBy: {
        expires: 'desc',
      },
      take: 5,
    });

    console.log(`Found ${recentTokens.length} recent verification tokens:`);
    recentTokens.forEach((token) => {
      console.log(`  - ${token.email} - Expires: ${token.expires}`);
    });

    console.log('\n✅ Email verification test completed');
  } catch (error) {
    console.error('❌ Error during email test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testEmailSending();
