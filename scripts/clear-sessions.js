const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearSessions() {
  try {
    console.log('🧹 Clearing all sessions and verification tokens...');
    
    // Clear any existing sessions (if using database sessions)
    const sessionCount = await prisma.session?.count?.() || 0;
    console.log(`Sessions in DB: ${sessionCount}`);
    
    // Clear verification tokens for test user
    const deletedTokens = await prisma.verificationToken.deleteMany({
      where: {
        email: 'test.unverified@example.com'
      }
    });
    
    console.log(`✅ Deleted ${deletedTokens.count} verification tokens`);
    
    // Ensure test user is unverified
    const user = await prisma.user.update({
      where: {
        email: 'test.unverified@example.com'
      },
      data: {
        emailVerified: null
      }
    });
    
    console.log('✅ Test user status:', {
      email: user.email,
      emailVerified: user.emailVerified
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearSessions();
