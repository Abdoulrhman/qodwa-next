const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testSessionLimit() {
  try {
    console.log('🧪 Testing 8-session limit...');

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
      `📚 Testing with: ${teacherStudent.teacher.name} -> ${teacherStudent.student.name}`
    );

    // Find a subscription for this student
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: teacherStudent.studentId,
        status: 'ACTIVE',
      },
      include: {
        package: true,
      },
    });

    if (!subscription) {
      console.log('❌ No active subscription found');
      return;
    }

    const totalClassesPerMonth = subscription.package.classes_per_month || 8;
    console.log(`📦 Package allows ${totalClassesPerMonth} classes per month`);

    // Count current month's sessions
    const currentDate = new Date();
    const startOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const endOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0,
      23,
      59,
      59
    );

    const currentSessions = await prisma.classSession.count({
      where: {
        studentId: teacherStudent.studentId,
        teacherId: teacherStudent.teacherId,
        startTime: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    console.log(`📊 Current sessions this month: ${currentSessions}`);

    // Create sessions up to the limit
    const sessionsToCreate = Math.max(
      0,
      totalClassesPerMonth - currentSessions
    );
    console.log(
      `➕ Creating ${sessionsToCreate} more sessions to reach limit...`
    );

    for (let i = 0; i < sessionsToCreate; i++) {
      const sessionDate = new Date();
      sessionDate.setDate(sessionDate.getDate() - i); // Space them out over recent days

      const endTime = new Date(sessionDate);
      endTime.setMinutes(endTime.getMinutes() + 30); // 30-minute sessions

      await prisma.classSession.create({
        data: {
          studentId: teacherStudent.studentId,
          teacherId: teacherStudent.teacherId,
          subscriptionId: subscription.id,
          startTime: sessionDate,
          endTime: endTime,
          duration: 30,
          status: 'COMPLETED',
        },
      });

      console.log(`✅ Created session ${i + 1}/${sessionsToCreate}`);
    }

    // Check final count
    const finalCount = await prisma.classSession.count({
      where: {
        studentId: teacherStudent.studentId,
        teacherId: teacherStudent.teacherId,
        startTime: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    console.log(
      `🎯 Final session count: ${finalCount}/${totalClassesPerMonth}`
    );

    if (finalCount >= totalClassesPerMonth) {
      console.log(
        '🔒 Session limit reached! Start Class button should be disabled.'
      );
    } else {
      console.log(
        `🟢 Still ${totalClassesPerMonth - finalCount} sessions remaining.`
      );
    }
  } catch (error) {
    console.error('❌ Error testing session limit:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSessionLimit();
