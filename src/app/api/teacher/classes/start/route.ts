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

    // Verify the student is assigned to this teacher
    const student = await db.user.findFirst({
      where: {
        id: studentId,
        assignedTeacherId: session.user.id,
      },
      include: {
        subscriptions: {
          where: {
            status: 'ACTIVE',
          },
          include: {
            package: true,
          },
        },
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found or not assigned to you' },
        { status: 404 }
      );
    }

    if (!student.subscriptions.length) {
      return NextResponse.json(
        { error: 'Student has no active subscriptions' },
        { status: 400 }
      );
    }

    // Get the active subscription (use the first one if multiple)
    const activeSubscription = student.subscriptions[0];

    // Create a new class session
    const classSession = await db.classSession.create({
      data: {
        studentId,
        teacherId: session.user.id,
        subscriptionId: activeSubscription.id,
        startTime: new Date(),
        duration: activeSubscription.package.class_duration || 30,
        zoomLink: `https://zoom.us/j/${Math.random().toString(36).substring(2, 15)}?pwd=class_${studentId}`,
        status: 'IN_PROGRESS',
        teacherEarning: 2.0, // $2 for 30 minutes, will be calculated based on duration
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Class started successfully',
      classSession: {
        id: classSession.id,
        startTime: classSession.startTime,
        duration: classSession.duration,
      },
    });
  } catch (error) {
    console.error('Start class error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
