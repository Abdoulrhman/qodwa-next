import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { isTeacher: true },
    });

    if (!user?.isTeacher) {
      return NextResponse.json(
        { error: 'Teacher access required' },
        { status: 403 }
      );
    }

    // Get teacher statistics
    const teacherId = session.user.id;

    // Count total students assigned to this teacher
    const totalStudents = await db.user.count({
      where: {
        assignedTeacherId: teacherId,
      },
    });

    // Count active subscriptions for students assigned to this teacher
    const activeClasses = await db.subscription.count({
      where: {
        user: {
          assignedTeacherId: teacherId,
        },
        status: 'ACTIVE',
      },
    });

    // Get current month earnings
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const currentMonthEarnings = await db.teacherEarnings.findUnique({
      where: {
        teacherId_currentMonth_currentYear: {
          teacherId,
          currentMonth,
          currentYear,
        },
      },
    });

    const totalEarnings = currentMonthEarnings?.totalEarnings || 0;

    // Calculate average rating (for now we'll use a default, but this could be from a ratings table later)
    const averageRating = 4.5;

    // Count upcoming classes (classes scheduled for the next 7 days)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const upcomingClasses = await db.classSession.count({
      where: {
        teacherId,
        status: 'SCHEDULED',
        startTime: {
          gte: new Date(),
          lte: nextWeek,
        },
      },
    });

    // Count completed classes for this teacher
    const completedClasses = await db.classSession.count({
      where: {
        teacherId,
        status: 'COMPLETED',
      },
    });

    const stats = {
      totalStudents,
      activeClasses,
      totalEarnings,
      averageRating,
      upcomingClasses,
      completedClasses,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Teacher stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
