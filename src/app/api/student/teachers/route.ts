import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Fetch real student data with teacher relationships
    const studentData = await db.user.findUnique({
      where: {
        id: userId,
        OR: [{ isTeacher: false }, { isTeacher: null }],
      },
      include: {
        // Primary teacher assignment
        assignedTeacher: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            image: true,
            subjects: true,
            qualifications: true,
            teachingExperience: true,
          },
        },
        // Additional teacher connections
        teacherConnections: {
          where: {
            isActive: true,
          },
          include: {
            teacher: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                image: true,
                subjects: true,
                qualifications: true,
                teachingExperience: true,
              },
            },
          },
          orderBy: {
            assignedAt: 'desc',
          },
        },
      },
    });

    if (!studentData) {
      return NextResponse.json(
        {
          success: false,
          error: 'Student not found',
        },
        { status: 404 }
      );
    }

    // Format the response data
    const response = {
      success: true,
      primaryTeacher: studentData.assignedTeacher,
      additionalTeachers: studentData.teacherConnections,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching teacher data:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
