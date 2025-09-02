import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@/lib/auth';
import { sendAdminNotification } from '@/lib/admin-notifications';
import { db } from '@/lib/db';

// GET /api/admin/notifications - Get admin notifications
export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();

    // Check if user is admin
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    // If requesting settings
    if (type === 'settings') {
      const settings = {
        adminEmail: process.env.ADMIN_NOTIFICATION_EMAIL || 'Not configured',
        emailServiceConfigured: !!process.env.RESEND_API_KEY,
        emailService: 'Resend',
        fromEmail: process.env.RESEND_FROM_EMAIL || 'Not configured',
        baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'Not configured',
      };

      return NextResponse.json({
        success: true,
        settings,
      });
    }

    // Get notifications (recent user registrations)
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const unreadOnly = searchParams.get('unread') === 'true';

    // Get recent users (excluding admin)
    const dateFilter = unreadOnly
      ? new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours for "unread"
      : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // Last 7 days for all

    const recentUsers = await db.user.findMany({
      where: {
        id: { not: user.id },
        // Use emailVerified field that exists in your schema
        emailVerified: { not: null },
      },
      orderBy: { emailVerified: 'desc' },
      take: limit,
      skip: offset,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        image: true,
      },
    });

    // Transform to notification format
    const notifications = recentUsers.map((u) => ({
      id: `user_${u.id}`,
      type:
        u.role === 'TEACHER' ? 'teacher_registration' : 'student_registration',
      title:
        u.role === 'TEACHER'
          ? `New Teacher Application: ${u.name || u.email}`
          : `New Student Registration: ${u.name || u.email}`,
      message:
        u.role === 'TEACHER'
          ? `${u.name || u.email} has applied to become a teacher and requires approval.`
          : `${u.name || u.email} has registered as a student.`,
      user: {
        name: u.name,
        email: u.email,
        image: u.image,
        role: u.role,
      },
      isRead: false,
      createdAt: u.emailVerified,
      actionUrl: `/dashboard/admin/users?highlight=${u.id}`,
    }));

    // Get counts
    const totalUsers = await db.user.count({
      where: { id: { not: user.id } },
    });

    const recentCount = await db.user.count({
      where: {
        id: { not: user.id },
        emailVerified: { gte: dateFilter },
      },
    });

    return NextResponse.json({
      success: true,
      notifications,
      pagination: {
        total: totalUsers,
        unread: recentCount,
        limit,
        offset,
        hasMore: offset + limit < totalUsers,
      },
    });
  } catch (error) {
    console.error('Error fetching admin notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/notifications - Send test notifications or mark as read
export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();

    // Check if user is admin
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { type, testData, notificationIds, markAllAsRead } =
      await request.json();

    if (type === 'TEST_NOTIFICATION') {
      // Send a test notification using proper format
      const testUser = {
        id: 'test-' + Date.now(),
        name: testData?.name || 'Test User',
        email: testData?.email || 'test@example.com',
        role: testData?.role || 'STUDENT',
        isTeacher: testData?.role === 'TEACHER',
        phone: testData?.phone || '+1234567890',
        gender: testData?.gender || 'MALE',
      };

      try {
        await sendAdminNotification({
          type: 'USER_REGISTRATION',
          user: testUser,
        });
        return NextResponse.json({
          success: true,
          message: 'Test notification sent successfully',
          testUser,
        });
      } catch (emailError: any) {
        console.error('Email error:', emailError);
        return NextResponse.json({
          success: false,
          message: 'Failed to send test notification',
          error: emailError?.message || 'Unknown error',
        });
      }
    }

    if (markAllAsRead || (notificationIds && Array.isArray(notificationIds))) {
      // In a real implementation, you'd update a notifications table
      // For now, just return success
      return NextResponse.json({
        success: true,
        message: markAllAsRead
          ? 'All notifications marked as read'
          : `${notificationIds.length} notifications marked as read`,
      });
    }

    return NextResponse.json(
      { error: 'Invalid notification type or parameters' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in admin notifications POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
