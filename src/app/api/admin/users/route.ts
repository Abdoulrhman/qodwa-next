import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { currentUser } from '@/lib/auth';

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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const role = searchParams.get('role');
    const search = searchParams.get('search');
    const status = searchParams.get('status');

    const skip = (page - 1) * limit;

    // Build filter conditions
    const where: any = {};

    if (role && role !== 'ALL') {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      switch (status) {
        case 'VERIFIED':
          where.emailVerified = { not: null };
          break;
        case 'UNVERIFIED':
          where.emailVerified = null;
          break;
        case 'TEACHER_PENDING':
          where.AND = [
            { isTeacher: true },
            { teacherApprovalStatus: 'PENDING' },
          ];
          break;
        case 'TEACHER_APPROVED':
          where.AND = [
            { isTeacher: true },
            { teacherApprovalStatus: 'APPROVED' },
          ];
          break;
        case 'TEACHER_REJECTED':
          where.AND = [
            { isTeacher: true },
            { teacherApprovalStatus: 'REJECTED' },
          ];
          break;
      }
    }

    // Get users with pagination
    const [users, totalCount] = await Promise.all([
      db.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isTeacher: true,
          teacherApprovalStatus: true,
          teacherApprovedAt: true,
          emailVerified: true,
          phone: true,
          gender: true,
          birthDate: true,
          qualifications: true,
          subjects: true,
          teachingExperience: true,
          referralSource: true,
          hasBookedDemo: true,
          demoSessionDate: true,
          assignedTeacherId: true,
          _count: {
            select: {
              assignedStudents: true,
              teacherConnections: true,
              studentConnections: true,
              subscriptions: true,
            },
          },
        },
      }),
      db.user.count({ where }),
    ]);

    // Get stats
    const stats = await Promise.all([
      db.user.count(),
      db.user.count({ where: { role: 'ADMIN' } }),
      db.user.count({ where: { role: 'TEACHER' } }),
      db.user.count({ where: { role: 'USER' } }),
      db.user.count({ where: { emailVerified: { not: null } } }),
      db.user.count({ where: { emailVerified: null } }),
      db.user.count({
        where: {
          isTeacher: true,
          teacherApprovalStatus: 'PENDING',
        },
      }),
      db.user.count({
        where: {
          isTeacher: true,
          teacherApprovalStatus: 'APPROVED',
        },
      }),
      db.user.count({
        where: {
          isTeacher: true,
          teacherApprovalStatus: 'REJECTED',
        },
      }),
    ]);

    const [
      totalUsers,
      totalAdmins,
      totalTeachers,
      totalStudents,
      verifiedUsers,
      unverifiedUsers,
      pendingTeachers,
      approvedTeachers,
      rejectedTeachers,
    ] = stats;

    return NextResponse.json({
      users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        limit,
      },
      stats: {
        totalUsers,
        totalAdmins,
        totalTeachers,
        totalStudents,
        verifiedUsers,
        unverifiedUsers,
        pendingTeachers,
        approvedTeachers,
        rejectedTeachers,
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await currentUser();

    // Check if user is admin
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { userId, action, data } = await request.json();

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'User ID and action are required' },
        { status: 400 }
      );
    }

    let updateData: any = {};

    switch (action) {
      case 'UPDATE_ROLE':
        if (!data.role) {
          return NextResponse.json(
            { error: 'Role is required' },
            { status: 400 }
          );
        }
        updateData.role = data.role;
        break;

      case 'VERIFY_EMAIL':
        updateData.emailVerified = new Date();
        break;

      case 'UNVERIFY_EMAIL':
        updateData.emailVerified = null;
        break;

      case 'APPROVE_TEACHER':
        updateData.teacherApprovalStatus = 'APPROVED';
        updateData.teacherApprovedAt = new Date();
        updateData.teacherApprovedBy = user.id;
        break;

      case 'REJECT_TEACHER':
        updateData.teacherApprovalStatus = 'REJECTED';
        updateData.teacherRejectedReason = data.reason || 'Not specified';
        break;

      case 'RESET_TEACHER_STATUS':
        updateData.teacherApprovalStatus = 'PENDING';
        updateData.teacherApprovedAt = null;
        updateData.teacherApprovedBy = null;
        updateData.teacherRejectedReason = null;
        break;

      case 'UPDATE_PROFILE':
        updateData = {
          name: data.name,
          phone: data.phone,
          gender: data.gender,
          birthDate: data.birthDate ? new Date(data.birthDate) : null,
        };
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Prevent deleting self
    if (userId === user.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    // Delete user and related records
    await db.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
