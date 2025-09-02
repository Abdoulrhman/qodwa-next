import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { currentUser } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: { studentId: string; classId: string } }
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

    const { studentId, classId } = params;
    const body = await request.json();
    const { dailyAssignment, appliedTajweed, review, memorization, notes } =
      body;

    // Verify the teacher has access to this student and class
    const classSession = await db.classSession.findFirst({
      where: {
        id: classId,
        studentId: studentId,
        teacherId: user.id,
      },
    });

    if (!classSession) {
      return NextResponse.json(
        { error: 'Class session not found or you do not have access to it' },
        { status: 404 }
      );
    }

    // Update the class session with notes
    const updatedClassSession = await db.classSession.update({
      where: {
        id: classId,
      },
      data: {
        dailyAssignment: dailyAssignment || null,
        appliedTajweed: appliedTajweed || null,
        review: review || null,
        memorization: memorization || null,
        notes: notes || null,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Notes updated successfully',
      data: {
        id: updatedClassSession.id,
        dailyAssignment: updatedClassSession.dailyAssignment,
        appliedTajweed: updatedClassSession.appliedTajweed,
        review: updatedClassSession.review,
        memorization: updatedClassSession.memorization,
        notes: updatedClassSession.notes,
      },
    });
  } catch (error) {
    console.error('Error updating class notes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
