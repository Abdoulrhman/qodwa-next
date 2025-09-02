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

    // Get all users who are teachers or have applied to be teachers
    const teachers = await db.user.findMany({
      where: {
        isTeacher: true,
      },
      include: {
        _count: {
          select: {
            assignedStudents: true,
            studentConnections: {
              where: {
                isActive: true,
              },
            },
          },
        },
      },
    });

    // Transform the data for the frontend
    const transformedTeachers = teachers.map((teacher: any) => ({
      id: teacher.id,
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone,
      subjects: teacher.subjects,
      qualifications: teacher.qualifications,
      teachingExperience: teacher.teachingExperience,
      teacherApprovalStatus: teacher.teacherApprovalStatus || 'PENDING',
      teacherApprovedAt: teacher.teacherApprovedAt,
      teacherRejectedReason: teacher.teacherRejectedReason,
      createdAt: teacher.createdAt || new Date(),
      primaryStudentCount: teacher._count?.assignedStudents || 0,
      totalConnectionCount: teacher._count?.studentConnections || 0,
    }));

    // Calculate stats
    const stats = {
      total: transformedTeachers.length,
      pending: transformedTeachers.filter(
        (t) => t.teacherApprovalStatus === 'PENDING'
      ).length,
      approved: transformedTeachers.filter(
        (t) => t.teacherApprovalStatus === 'APPROVED'
      ).length,
      rejected: transformedTeachers.filter(
        (t) => t.teacherApprovalStatus === 'REJECTED'
      ).length,
    };

    return NextResponse.json({
      success: true,
      teachers: transformedTeachers,
      stats,
    });
  } catch (error) {
    console.error('Error fetching teachers:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
