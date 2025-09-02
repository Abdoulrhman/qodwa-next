const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearTestClassSessions() {
  try {
    console.log('🧹 Clearing test class sessions...');

    // Remove class sessions that have test notes
    const deletedSessions = await prisma.classSession.deleteMany({
      where: {
        OR: [
          { dailyAssignment: { contains: 'Read Surah' } },
          { dailyAssignment: { contains: 'Practice Tajweed' } },
          { appliedTajweed: { contains: 'Practiced Ghunna' } },
          { appliedTajweed: { contains: 'Applied Qalqalah' } },
          { review: { contains: 'Reviewed previous' } },
          { memorization: { contains: 'Started memorizing' } },
        ],
      },
    });

    console.log(`✅ Deleted ${deletedSessions.count} test class sessions`);

    // Show remaining sessions
    const remainingSessions = await prisma.classSession.findMany({
      include: {
        student: { select: { name: true } },
        teacher: { select: { name: true } },
      },
      orderBy: { startTime: 'desc' },
    });

    console.log(`📚 Remaining sessions: ${remainingSessions.length}`);
    remainingSessions.forEach((session) => {
      console.log(
        `- ${session.student.name} with ${session.teacher.name} on ${session.startTime.toDateString()}`
      );
    });
  } catch (error) {
    console.error('❌ Error clearing test sessions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearTestClassSessions();
