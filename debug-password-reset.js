const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

async function debugPasswordReset() {
  console.log('🔍 Debugging Password Reset Token System...\n');

  try {
    // Check if we can connect to the database
    await prisma.$connect();
    console.log('✅ Database connection successful');

    // Clean up any old test tokens first
    await prisma.passwordResetToken.deleteMany({
      where: { email: 'test@example.com' },
    });

    // Generate a test token
    const testToken = uuidv4();
    const testEmail = 'test@example.com';
    const expires = new Date(new Date().getTime() + 3600 * 1000); // 1 hour

    console.log('📝 Creating test token...');
    console.log(`Token: ${testToken}`);
    console.log(`Email: ${testEmail}`);
    console.log(`Expires: ${expires}`);

    // Create the token
    const createdToken = await prisma.passwordResetToken.create({
      data: {
        email: testEmail,
        token: testToken,
        expires: expires,
      },
    });

    console.log('✅ Token created successfully:', createdToken);

    // Try to retrieve the token
    console.log('\n🔍 Retrieving token by token string...');
    const retrievedToken = await prisma.passwordResetToken.findUnique({
      where: { token: testToken },
    });

    if (retrievedToken) {
      console.log('✅ Token retrieved successfully:', retrievedToken);

      // Check if token has expired
      const hasExpired = new Date(retrievedToken.expires) < new Date();
      console.log(`⏰ Token expired: ${hasExpired}`);
      console.log(`Current time: ${new Date()}`);
      console.log(`Token expires: ${new Date(retrievedToken.expires)}`);
    } else {
      console.log('❌ Token not found!');
    }

    // Try to retrieve by email
    console.log('\n🔍 Retrieving token by email...');
    const tokenByEmail = await prisma.passwordResetToken.findFirst({
      where: { email: testEmail },
    });

    if (tokenByEmail) {
      console.log('✅ Token found by email:', tokenByEmail);
    } else {
      console.log('❌ Token not found by email!');
    }

    // List all password reset tokens
    console.log('\n📋 All password reset tokens in database:');
    const allTokens = await prisma.passwordResetToken.findMany({
      orderBy: { expires: 'desc' },
      take: 10, // Limit to 10 most recent
    });

    console.log(`Found ${allTokens.length} tokens:`);
    allTokens.forEach((token, index) => {
      const expired = new Date(token.expires) < new Date();
      console.log(
        `${index + 1}. Email: ${token.email}, Expired: ${expired}, Expires: ${token.expires}`
      );
    });

    // Clean up test token
    await prisma.passwordResetToken.delete({
      where: { id: createdToken.id },
    });
    console.log('\n🧹 Cleaned up test token');
  } catch (error) {
    console.error('❌ Error during debugging:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Database connection closed');
  }
}

debugPasswordReset();
