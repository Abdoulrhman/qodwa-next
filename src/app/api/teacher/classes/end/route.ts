import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
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

    const { studentId } = await request.json();

    if (!studentId) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      );
    }

    // Find the active class session
    const activeClassSession = await db.classSession.findFirst({
      where: {
        studentId,
        teacherId: session.user.id,
        status: 'IN_PROGRESS',
      },
      include: {
        subscription: {
          include: {
            package: true,
          },
        },
      },
    });

    if (!activeClassSession) {
      return NextResponse.json(
        { error: 'No active class session found' },
        { status: 404 }
      );
    }

    const endTime = new Date();
    const actualDuration = Math.round(
      (endTime.getTime() - activeClassSession.startTime.getTime()) / (1000 * 60)
    );

    // Calculate earnings: $4 per hour, so $2 for 30 minutes
    const earningsPerMinute = 4 / 60; // $4 per hour
    const earnings = Math.round(actualDuration * earningsPerMinute * 100) / 100;

    // Update the class session
    const updatedClassSession = await db.classSession.update({
      where: { id: activeClassSession.id },
      data: {
        endTime,
        status: 'COMPLETED',
        duration: actualDuration,
        teacherEarning: earnings,
      },
    });

    // Update subscription classes completed
    await db.subscription.update({
      where: { id: activeClassSession.subscriptionId },
      data: {
        classes_completed: {
          increment: 1,
        },
      },
    });

    // Update or create teacher earnings record
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    await db.teacherEarnings.upsert({
      where: {
        teacherId_currentMonth_currentYear: {
          teacherId: session.user.id,
          currentMonth,
          currentYear,
        },
      },
      update: {
        totalEarnings: {
          increment: earnings,
        },
        totalClasses: {
          increment: 1,
        },
        lastUpdated: new Date(),
      },
      create: {
        teacherId: session.user.id,
        totalEarnings: earnings,
        totalClasses: 1,
        currentMonth,
        currentYear,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Class ended successfully',
      classSession: {
        id: updatedClassSession.id,
        duration: actualDuration,
        earnings,
      },
    });
  } catch (error) {
    console.error('End class error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
