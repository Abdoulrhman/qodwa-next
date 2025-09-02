import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { currentUser } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { studentId: string } }
) {
  try {
    const user = await currentUser();

    // Check if user is a teacher
    if (!user || !user.isTeacher) {
      return NextResponse.json(
        { error: 'Unauthorized - Teacher access required' },
        { status: 401 }
      );
    }

    const { studentId } = params;

    // Verify the teacher has access to this student
    const teacherStudentRelation = await db.teacherStudent.findFirst({
      where: {
        teacherId: user.id,
        studentId: studentId,
        isActive: true,
      },
    });

    if (!teacherStudentRelation) {
      return NextResponse.json(
        { error: 'You do not have access to this student' },
        { status: 403 }
      );
    }

    // Fetch class sessions with notes for this student
    const classSessions = await db.classSession.findMany({
      where: {
        studentId: studentId,
        teacherId: user.id,
      },
      orderBy: {
        startTime: 'desc',
      },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        status: true,
        notes: true,
        dailyAssignment: true,
        appliedTajweed: true,
        review: true,
        memorization: true,
        duration: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(classSessions);
  } catch (error) {
    console.error('Error fetching student notes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
