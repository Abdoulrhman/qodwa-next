const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestClassSessions() {
  try {
    console.log('🔍 Fetching teachers and students...');

    // Find teachers
    const teachers = await prisma.user.findMany({
      where: { isTeacher: true },
      select: { id: true, name: true, email: true },
    });

    // Find students
    const students = await prisma.user.findMany({
      where: { isTeacher: false },
      select: { id: true, name: true, email: true },
    });

    console.log('👨‍🏫 Teachers found:', teachers.length);
    teachers.forEach((teacher) =>
      console.log(`  - ${teacher.name} (${teacher.email})`)
    );

    console.log('👨‍🎓 Students found:', students.length);
    students.forEach((student) =>
      console.log(`  - ${student.name} (${student.email})`)
    );

    if (teachers.length === 0 || students.length === 0) {
      console.log(
        '❌ Need at least one teacher and one student to create class sessions'
      );
      return;
    }

    // Find teacher-student relationships
    const teacherStudentRelations = await prisma.teacherStudent.findMany({
      where: { isActive: true },
      include: {
        teacher: { select: { name: true } },
        student: { select: { name: true } },
      },
    });

    console.log(
      '🔗 Teacher-Student relationships found:',
      teacherStudentRelations.length
    );
    teacherStudentRelations.forEach((rel) => {
      console.log(`  - ${rel.teacher.name} -> ${rel.student.name}`);
    });

    if (teacherStudentRelations.length === 0) {
      console.log(
        '❌ No teacher-student relationships found. Please assign students to teachers first.'
      );
      return;
    }

    // Find active subscriptions
    const subscriptions = await prisma.subscription.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, userId: true },
    });

    console.log('📋 Active subscriptions found:', subscriptions.length);

    if (subscriptions.length === 0) {
      console.log(
        '❌ No active subscriptions found. Students need active subscriptions to have class sessions.'
      );
      return;
    }

    // Create test class sessions for the first teacher-student relationship
    const firstRelation = teacherStudentRelations[0];
    const studentSubscription = subscriptions.find(
      (sub) => sub.userId === firstRelation.studentId
    );

    if (!studentSubscription) {
      console.log(
        '❌ No active subscription found for the student in the relationship.'
      );
      return;
    }

    console.log('🚀 Creating test class sessions...');

    // Create 3 test class sessions with different dates
    const now = new Date();
    const testSessions = [
      {
        startTime: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
        status: 'COMPLETED',
      },
      {
        startTime: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        status: 'COMPLETED',
      },
      {
        startTime: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        status: 'COMPLETED',
      },
    ];

    for (let i = 0; i < testSessions.length; i++) {
      const sessionData = testSessions[i];

      const classSession = await prisma.classSession.create({
        data: {
          studentId: firstRelation.studentId,
          teacherId: firstRelation.teacherId,
          subscriptionId: studentSubscription.id,
          startTime: sessionData.startTime,
          endTime: new Date(sessionData.startTime.getTime() + 30 * 60 * 1000), // 30 minutes later
          duration: 30,
          status: sessionData.status,
          teacherEarning: 2.0,
          // Add some sample notes for variety
          dailyAssignment:
            i === 0
              ? 'Read Surah Al-Fatiha 5 times'
              : i === 1
                ? 'Practice Tajweed rules for Noon Sakinah'
                : null,
          appliedTajweed:
            i === 1
              ? 'Worked on Ikhfa rule with letter ت'
              : i === 2
                ? 'Practiced Idgham rules'
                : null,
          review: i === 0 ? 'Reviewed previous Surah memorization' : null,
          memorization: i === 2 ? 'Started memorizing Surah Al-Ikhlas' : null,
          notes: `Class session ${i + 1} - Student showed good progress`,
        },
      });

      console.log(`✅ Created class session ${i + 1}: ${classSession.id}`);
    }

    console.log('🎉 Test class sessions created successfully!');
    console.log(
      '📝 You can now test the notes functionality in the teacher dashboard'
    );
  } catch (error) {
    console.error('❌ Error creating test class sessions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestClassSessions();
