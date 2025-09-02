const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createClassSessionsWithTimes() {
  try {
    console.log('🚀 Creating test class sessions with end times...');

    // Find a teacher-student relationship
    const teacherStudent = await prisma.teacherStudent.findFirst({
      where: {
        isActive: true,
      },
      include: {
        teacher: true,
        student: true,
      },
    });

    if (!teacherStudent) {
      console.log('❌ No active teacher-student relationship found');
      return;
    }

    console.log(
      `📚 Found relationship: ${teacherStudent.teacher.name} -> ${teacherStudent.student.name}`
    );

    // Find a subscription for this student
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: teacherStudent.studentId,
        status: 'ACTIVE',
      },
    });

    if (!subscription) {
      console.log('❌ No active subscription found for this student');
      return;
    }

    console.log(`💳 Found subscription: ${subscription.id}`);

    // Create test sessions with various statuses and times
    const sessions = [
      {
        startTime: new Date('2024-01-15T09:00:00Z'),
        endTime: new Date('2024-01-15T09:30:00Z'),
        duration: 30,
        status: 'COMPLETED',
        dailyAssignment: 'Read Surah Al-Fatiha 5 times',
        appliedTajweed: 'Practiced Ghunna with Noon Sakinah',
        review: 'Reviewed previous memorization of Surah Al-Ikhlas',
        memorization: 'Started memorizing Surah Al-Falaq - first 3 verses',
      },
      {
        startTime: new Date('2024-01-16T10:00:00Z'),
        endTime: new Date('2024-01-16T10:45:00Z'),
        duration: 45,
        status: 'COMPLETED',
        dailyAssignment: 'Practice Tajweed rules for Meem Sakinah',
        appliedTajweed: 'Applied Qalqalah rules correctly',
        review: 'Reviewed Surah Al-Falaq verses 1-3',
        memorization: 'Completed memorization of Surah Al-Falaq',
      },
      {
        startTime: new Date('2024-01-17T11:30:00Z'),
        endTime: new Date('2024-01-17T12:00:00Z'),
        duration: 30,
        status: 'COMPLETED',
        dailyAssignment: 'Recite Surah Al-Nas 10 times',
        appliedTajweed: 'Worked on proper pronunciation of Arabic letters',
        review: 'Reviewed complete Surah Al-Falaq',
        memorization: 'Started Surah Al-Nas - verses 1-4',
      },
      {
        startTime: new Date('2024-01-18T14:00:00Z'),
        endTime: new Date('2024-01-18T14:20:00Z'),
        duration: 20,
        status: 'COMPLETED',
        dailyAssignment: 'Practice recitation with family',
        appliedTajweed: 'Focused on Madd rules and elongation',
        review: 'Full review of Surah Al-Nas',
        memorization: 'Completed memorization of Surah Al-Nas',
      },
      {
        startTime: new Date('2024-01-19T16:00:00Z'),
        endTime: null, // No end time for upcoming session
        duration: 30,
        status: 'SCHEDULED',
        dailyAssignment: null,
        appliedTajweed: null,
        review: null,
        memorization: null,
      },
    ];

    for (const sessionData of sessions) {
      const session = await prisma.classSession.create({
        data: {
          studentId: teacherStudent.studentId,
          teacherId: teacherStudent.teacherId,
          subscriptionId: subscription.id,
          ...sessionData,
        },
      });

      console.log(
        `✅ Created session: ${session.startTime.toDateString()} - Status: ${session.status}`
      );
    }

    console.log('🎉 Test class sessions with times created successfully!');
  } catch (error) {
    console.error('❌ Error creating test sessions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createClassSessionsWithTimes();
