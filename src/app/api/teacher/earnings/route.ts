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

    // Get current month and year
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    // Get teacher earnings for current month
    const currentMonthEarnings = await db.teacherEarnings.findUnique({
      where: {
        teacherId_currentMonth_currentYear: {
          teacherId: session.user.id,
          currentMonth,
          currentYear,
        },
      },
    });

    // Get all-time earnings
    const allTimeEarnings = await db.teacherEarnings.findMany({
      where: {
        teacherId: session.user.id,
      },
    });

    // Calculate totals
    const totalEarnings = allTimeEarnings.reduce(
      (sum, earning) => sum + earning.totalEarnings,
      0
    );
    const totalClasses = allTimeEarnings.reduce(
      (sum, earning) => sum + earning.totalClasses,
      0
    );

    // Get recent class sessions
    const recentClasses = await db.classSession.findMany({
      where: {
        teacherId: session.user.id,
        status: 'COMPLETED',
      },
      include: {
        student: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        endTime: 'desc',
      },
      take: 10,
    });

    return NextResponse.json({
      currentMonth: {
        earnings: currentMonthEarnings?.totalEarnings || 0,
        classes: currentMonthEarnings?.totalClasses || 0,
        month: currentMonth,
        year: currentYear,
      },
      allTime: {
        earnings: totalEarnings,
        classes: totalClasses,
      },
      recentClasses: recentClasses.map((cls) => ({
        id: cls.id,
        studentName: cls.student.name,
        date: cls.endTime,
        duration: cls.duration,
        earning: cls.teacherEarning,
      })),
      monthlyBreakdown: allTimeEarnings.map((earning) => ({
        month: earning.currentMonth,
        year: earning.currentYear,
        earnings: earning.totalEarnings,
        classes: earning.totalClasses,
      })),
    });
  } catch (error) {
    console.error('Teacher earnings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
