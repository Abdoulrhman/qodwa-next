import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch user subscriptions with packages and class sessions
    const subscriptions = await db.subscription.findMany({
      where: {
        userId: userId,
        status: 'ACTIVE',
      },
      include: {
        package: true,
        classSessions: {
          where: {
            status: 'COMPLETED',
          },
        },
      },
    });

    // Fetch upcoming class sessions
    const upcomingClasses = await db.classSession.findMany({
      where: {
        studentId: userId,
        status: 'SCHEDULED',
        startTime: {
          gte: new Date(),
        },
      },
      include: {
        teacher: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        startTime: 'asc',
      },
      take: 5,
    });

    // Calculate stats
    const totalCourses = subscriptions.length;
    const completedClasses = subscriptions.reduce(
      (total, sub) => total + sub.classSessions.length,
      0
    );

    // Calculate total study hours (assuming each class is 60 minutes)
    const studyHours = completedClasses;

    // Calculate current streak (simplified - you can enhance this logic)
    const recentClasses = await db.classSession.findMany({
      where: {
        studentId: userId,
        status: 'COMPLETED',
        endTime: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
      orderBy: {
        endTime: 'desc',
      },
    });

    // Simple streak calculation - consecutive days with classes
    let currentStreak = 0;
    const today = new Date();
    let checkDate = new Date(today);

    for (let i = 0; i < 30; i++) {
      const dayStart = new Date(checkDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(checkDate);
      dayEnd.setHours(23, 59, 59, 999);

      const hasClassToday = recentClasses.some((cls) => {
        const classDate = new Date(cls.endTime || cls.startTime);
        return classDate >= dayStart && classDate <= dayEnd;
      });

      if (hasClassToday) {
        currentStreak++;
      } else if (currentStreak > 0) {
        break;
      }

      checkDate.setDate(checkDate.getDate() - 1);
    }

    // Fetch recent activity
    const recentActivity = await db.classSession.findMany({
      where: {
        studentId: userId,
        status: 'COMPLETED',
      },
      include: {
        teacher: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        endTime: 'desc',
      },
      take: 3,
    });

    // Format upcoming classes
    const formattedUpcomingClasses = upcomingClasses.map((cls) => ({
      id: cls.id,
      subject: 'Quran & Arabic Class', // You can enhance this based on package type
      teacher: cls.teacher?.name || 'Teacher',
      time: cls.startTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
      date: cls.startTime.toISOString().split('T')[0],
      duration: cls.duration || 60,
    }));

    // Format recent activity
    const formattedRecentActivity = recentActivity.map((cls, index) => ({
      id: cls.id,
      type: 'class' as const,
      title: 'Class Completed',
      description: `Completed class with ${cls.teacher?.name || 'Teacher'}`,
      timestamp: (cls.endTime || cls.startTime).toISOString(),
      icon: '📚',
    }));

    // Calculate progress (you can enhance this based on your business logic)
    const weeklyGoal = 3; // 3 classes per week
    const monthlyGoal = 12; // 12 classes per month

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const weeklyProgress = await db.classSession.count({
      where: {
        studentId: userId,
        status: 'COMPLETED',
        endTime: {
          gte: weekStart,
        },
      },
    });

    const monthlyProgress = await db.classSession.count({
      where: {
        studentId: userId,
        status: 'COMPLETED',
        endTime: {
          gte: monthStart,
        },
      },
    });

    // Sample achievements - you can enhance this with a proper achievements system
    const achievements = [
      ...(totalCourses > 0
        ? [
            {
              id: '1',
              title: 'First Course Enrolled',
              description: 'Successfully enrolled in your first course',
              earnedDate:
                subscriptions[0]?.startDate.toISOString() ||
                new Date().toISOString(),
              type: 'recent' as const,
            },
          ]
        : []),
      ...(completedClasses >= 5
        ? [
            {
              id: '2',
              title: 'Active Learner',
              description: 'Completed 5 or more classes',
              earnedDate: new Date().toISOString(),
              type: 'featured' as const,
            },
          ]
        : []),
      ...(currentStreak >= 3
        ? [
            {
              id: '3',
              title: 'Consistent Learner',
              description: `${currentStreak} days learning streak`,
              earnedDate: new Date().toISOString(),
              type: 'featured' as const,
            },
          ]
        : []),
    ];

    const dashboardData = {
      stats: {
        totalCourses,
        completedClasses,
        studyHours,
        currentStreak,
      },
      recentActivity: formattedRecentActivity,
      upcomingClasses: formattedUpcomingClasses,
      achievements,
      progressOverview: {
        weeklyGoal,
        weeklyProgress,
        monthlyGoal,
        monthlyProgress,
      },
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
