const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function showClassSessions() {
  try {
    console.log('📚 Showing all class sessions...');

    const sessions = await prisma.classSession.findMany({
      include: {
        student: { select: { name: true } },
        teacher: { select: { name: true } },
      },
      orderBy: { startTime: 'desc' },
    });

    console.log(`Total sessions: ${sessions.length}\n`);

    sessions.forEach((session, index) => {
      console.log(`${index + 1}. ID: ${session.id}`);
      console.log(`   Student: ${session.student.name}`);
      console.log(`   Teacher: ${session.teacher.name}`);
      console.log(`   Date: ${session.startTime.toISOString()}`);
      console.log(`   Status: ${session.status}`);
      console.log(`   Daily Assignment: ${session.dailyAssignment || 'None'}`);
      console.log(`   Applied Tajweed: ${session.appliedTajweed || 'None'}`);
      console.log(`   Review: ${session.review || 'None'}`);
      console.log(`   Memorization: ${session.memorization || 'None'}`);
      console.log('   ---');
    });
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

showClassSessions();
