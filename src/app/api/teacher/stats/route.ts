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

    // Calculate total earnings (mock calculation for now)
    const totalEarnings = activeClasses * 100; // $100 per active class as example

    // Calculate average rating (mock for now)
    const averageRating = 4.5;

    // Count upcoming classes (mock for now)
    const upcomingClasses = Math.floor(Math.random() * 10) + 1;

    // Count completed classes (mock for now)
    const completedClasses = Math.floor(Math.random() * 50) + 20;

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
