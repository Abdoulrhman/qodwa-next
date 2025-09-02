import { db } from '@/lib/db';

export async function checkSessionLimit(studentId: string, teacherId: string) {
  try {
    // Get the student's active subscription
    const subscription = await db.subscription.findFirst({
      where: {
        userId: studentId,
        status: 'ACTIVE',
      },
      include: {
        package: true,
      },
    });

    if (!subscription) {
      return {
        canStartSession: false,
        reason: 'No active subscription found',
        sessionsUsed: 0,
        sessionsTotal: 0,
      };
    }

    // Get the total classes for this month from the package
    const totalClassesPerMonth = subscription.package.classes_per_month || 8;

    // Count completed sessions for the current month
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

    const completedSessionsThisMonth = await db.classSession.count({
      where: {
        studentId: studentId,
        teacherId: teacherId,
        status: 'COMPLETED',
        startTime: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    const canStartSession = completedSessionsThisMonth < totalClassesPerMonth;

    return {
      canStartSession,
      reason: canStartSession ? null : 'Monthly session limit reached',
      sessionsUsed: completedSessionsThisMonth,
      sessionsTotal: totalClassesPerMonth,
      subscriptionEndDate: subscription.endDate,
      nextMonthStart: new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        1
      ),
    };
  } catch (error) {
    console.error('Error checking session limit:', error);
    return {
      canStartSession: false,
      reason: 'Error checking session limit',
      sessionsUsed: 0,
      sessionsTotal: 0,
    };
  }
}

export async function getSessionStats(studentId: string, teacherId: string) {
  try {
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

    // Get subscription info
    const subscription = await db.subscription.findFirst({
      where: {
        userId: studentId,
        status: 'ACTIVE',
      },
      include: {
        package: true,
      },
    });

    if (!subscription) {
      return null;
    }

    const totalClassesPerMonth = subscription.package.classes_per_month || 8;

    // Count sessions for current month
    const completedSessionsThisMonth = await db.classSession.count({
      where: {
        studentId: studentId,
        teacherId: teacherId,
        status: 'COMPLETED',
        startTime: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    const scheduledSessionsThisMonth = await db.classSession.count({
      where: {
        studentId: studentId,
        teacherId: teacherId,
        status: 'SCHEDULED',
        startTime: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    const remainingSessions =
      totalClassesPerMonth -
      completedSessionsThisMonth -
      scheduledSessionsThisMonth;

    return {
      totalClassesPerMonth,
      completedSessionsThisMonth,
      scheduledSessionsThisMonth,
      remainingSessions,
      canScheduleMore: remainingSessions > 0,
      subscriptionStatus: subscription.status,
      packageTitle: subscription.package.title,
    };
  } catch (error) {
    console.error('Error getting session stats:', error);
    return null;
  }
}
