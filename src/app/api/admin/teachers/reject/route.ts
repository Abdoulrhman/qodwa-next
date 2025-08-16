import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { currentUser } from '@/lib/auth';

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

    const { teacherId, reason } = await request.json();

    if (!teacherId) {
      return NextResponse.json(
        { error: 'Teacher ID is required' },
        { status: 400 }
      );
    }

    if (!reason || reason.trim().length < 10) {
      return NextResponse.json(
        {
          error:
            'A detailed rejection reason is required (minimum 10 characters)',
        },
        { status: 400 }
      );
    }

    // Find the teacher
    const teacher = await db.user.findUnique({
      where: { id: teacherId },
    });

    if (!teacher || !teacher.isTeacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    // Update teacher approval status
    const updatedTeacher = await db.user.update({
      where: { id: teacherId },
      data: {
        teacherApprovalStatus: 'REJECTED',
        teacherRejectedReason: reason.trim(),
        teacherApprovedAt: null,
        teacherApprovedBy: null,
      } as any,
    });

    return NextResponse.json({
      success: true,
      message: `Teacher ${teacher.name} application has been rejected`,
      teacher: {
        id: updatedTeacher.id,
        name: updatedTeacher.name,
        email: updatedTeacher.email,
        teacherApprovalStatus: 'REJECTED',
        rejectionReason: reason.trim(),
      },
    });
  } catch (error) {
    console.error('Error rejecting teacher:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
