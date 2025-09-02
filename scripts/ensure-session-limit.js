const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function ensureSessionLimitReached() {
  try {
    console.log('🎯 Ensuring 8-session limit is reached...');

    // Find the teacher-student relationship
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

    // Find subscription
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

    // Count current sessions this month
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

    const totalAllowed = subscription.package.classes_per_month || 8;

    console.log(`📊 Current sessions: ${currentSessions}/${totalAllowed}`);

    if (currentSessions >= totalAllowed) {
      console.log(
        '✅ Session limit already reached! Start Class button should be disabled.'
      );
    } else {
      const needed = totalAllowed - currentSessions;
      console.log(`➕ Adding ${needed} more sessions to reach limit...`);

      for (let i = 0; i < needed; i++) {
        const sessionDate = new Date();
        sessionDate.setMinutes(sessionDate.getMinutes() + i * 35); // Space them out

        const endTime = new Date(sessionDate);
        endTime.setMinutes(endTime.getMinutes() + 30);

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

        console.log(`✅ Added session ${i + 1}/${needed}`);
      }

      console.log(
        '🔒 Session limit reached! Start Class button should now be disabled.'
      );
    }
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

ensureSessionLimitReached();
