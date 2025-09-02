import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { studentId: string } }
) {
  try {
    const session = await auth();
    const user = session?.user;

    if (!user || !user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const studentId = params.studentId;

    // Verify teacher has access to this student
    const teacherStudentRelation = await db.teacherStudent.findFirst({
      where: {
        teacherId: user.id,
        studentId: studentId,
        isActive: true,
      },
    });

    if (!teacherStudentRelation) {
      return NextResponse.json(
        { error: 'You do not have access to this student' },
        { status: 403 }
      );
    }

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
      return NextResponse.json({
        canStartSession: false,
        reason: 'No active subscription found',
        sessionsUsed: 0,
        sessionsTotal: 0,
      });
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
        teacherId: user.id,
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
        teacherId: user.id,
        status: 'SCHEDULED',
        startTime: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    // Also get all-time completed sessions for comparison
    const allTimeCompletedSessions = await db.classSession.count({
      where: {
        studentId: studentId,
        teacherId: user.id,
        status: 'COMPLETED',
      },
    });

    const totalUsedSessions =
      completedSessionsThisMonth + scheduledSessionsThisMonth;
    const canStartSession = totalUsedSessions < totalClassesPerMonth;

    return NextResponse.json({
      canStartSession,
      reason: canStartSession ? null : 'Monthly session limit reached',
      sessionsUsed: completedSessionsThisMonth,
      sessionsScheduled: scheduledSessionsThisMonth,
      sessionsTotal: totalClassesPerMonth,
      remainingSessions: totalClassesPerMonth - totalUsedSessions,
      subscriptionEndDate: subscription.endDate,
      nextMonthStart: new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        1
      ),
      packageTitle: subscription.package.title,
      allTimeCompletedSessions: allTimeCompletedSessions,
      debugInfo: {
        currentMonth: `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}`,
        startOfMonth: startOfMonth.toISOString(),
        endOfMonth: endOfMonth.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error checking session limit:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
