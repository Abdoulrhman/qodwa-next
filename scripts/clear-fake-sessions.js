const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearFakeTestSessions() {
  try {
    console.log('🧹 Clearing fake test sessions from 2024...');

    // Remove sessions from 2024 (these are the test sessions)
    const deletedSessions = await prisma.classSession.deleteMany({
      where: {
        startTime: {
          lt: new Date('2025-01-01'),
        },
      },
    });

    console.log(`✅ Deleted ${deletedSessions.count} fake test sessions`);

    // Show remaining real sessions
    const remainingSessions = await prisma.classSession.findMany({
      include: {
        student: { select: { name: true } },
        teacher: { select: { name: true } },
      },
      orderBy: { startTime: 'desc' },
    });

    console.log(`📚 Remaining real sessions: ${remainingSessions.length}`);
    remainingSessions.forEach((session, index) => {
      console.log(
        `${index + 1}. ${session.student.name} with ${session.teacher.name} on ${session.startTime.toDateString()} - ${session.status}`
      );
    });
  } catch (error) {
    console.error('❌ Error clearing fake sessions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearFakeTestSessions();
