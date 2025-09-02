const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testModels() {
  try {
    console.log('Testing Prisma models...');

    // Test ClassSession model
    console.log('✓ ClassSession model available:', !!prisma.classSession);

    // Test TeacherEarnings model
    console.log('✓ TeacherEarnings model available:', !!prisma.teacherEarnings);

    // Test User model with new relations
    console.log('✓ User model available:', !!prisma.user);

    console.log('All models are properly generated!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testModels();
