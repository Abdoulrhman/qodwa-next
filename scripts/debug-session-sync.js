const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugSessionSync() {
  try {
    console.log('🔍 Debugging session sync issues...');

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
      `📚 Analyzing: ${teacherStudent.teacher.name} -> ${teacherStudent.student.name}`
    );
    console.log(`Student ID: ${teacherStudent.studentId}`);
    console.log(`Teacher ID: ${teacherStudent.teacherId}`);

    // Get all sessions for this teacher-student pair
    const allSessions = await prisma.classSession.findMany({
      where: {
        studentId: teacherStudent.studentId,
        teacherId: teacherStudent.teacherId,
      },
      orderBy: {
        startTime: 'desc',
      },
    });

    console.log(`\n📊 Total sessions found: ${allSessions.length}`);

    // Analyze by status
    const statusCounts = {};
    allSessions.forEach((session) => {
      statusCounts[session.status] = (statusCounts[session.status] || 0) + 1;
    });

    console.log('\n📈 Sessions by status:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`);
    });

    // Analyze by month
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

    console.log(
      `\n📅 Current month analysis (${currentDate.getFullYear()}-${currentDate.getMonth() + 1}):`
    );
    console.log(`Start of month: ${startOfMonth.toISOString()}`);
    console.log(`End of month: ${endOfMonth.toISOString()}`);

    const thisMonthSessions = allSessions.filter((session) => {
      const sessionDate = new Date(session.startTime);
      return sessionDate >= startOfMonth && sessionDate <= endOfMonth;
    });

    console.log(`\n🗓️ This month's sessions: ${thisMonthSessions.length}`);
    thisMonthSessions.forEach((session) => {
      console.log(
        `  - ${session.startTime.toISOString()} | ${session.status} | Duration: ${session.duration}min`
      );
    });

    const thisMonthCompleted = thisMonthSessions.filter(
      (s) => s.status === 'COMPLETED'
    ).length;
    const thisMonthScheduled = thisMonthSessions.filter(
      (s) => s.status === 'SCHEDULED'
    ).length;

    console.log(`\n📋 This month breakdown:`);
    console.log(`  Completed: ${thisMonthCompleted}`);
    console.log(`  Scheduled: ${thisMonthScheduled}`);
    console.log(
      `  Total this month: ${thisMonthCompleted + thisMonthScheduled}`
    );

    // Check subscription info
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: teacherStudent.studentId,
        status: 'ACTIVE',
      },
      include: {
        package: true,
      },
    });

    if (subscription) {
      console.log(`\n💳 Subscription info:`);
      console.log(`  Package: ${subscription.package.title}`);
      console.log(
        `  Classes per month: ${subscription.package.classes_per_month || 8}`
      );
      console.log(
        `  Classes completed (subscription): ${subscription.classes_completed}`
      );
    }

    // All-time completed sessions
    const allTimeCompleted = allSessions.filter(
      (s) => s.status === 'COMPLETED'
    ).length;
    console.log(`\n🎯 All-time completed sessions: ${allTimeCompleted}`);

    console.log(`\n🔍 Summary:`);
    console.log(
      `  - Package Progress should show: ${allTimeCompleted}/8 (${Math.round((allTimeCompleted / 8) * 100)}%)`
    );
    console.log(
      `  - Monthly Sessions should show: ${thisMonthCompleted + thisMonthScheduled}/8`
    );
    console.log(
      `  - Remaining this month: ${8 - (thisMonthCompleted + thisMonthScheduled)}`
    );
  } catch (error) {
    console.error('❌ Error debugging session sync:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugSessionSync();
