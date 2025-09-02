import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

// Generate Zoom link for student (in real app, this would integrate with Zoom API)
function generateZoomLink(studentId: string): string {
  // For demo purposes, generate a mock zoom link
  // In production, you would integrate with Zoom API to create actual meeting rooms
  const meetingId = Math.random().toString(36).substring(2, 15);
  return `https://zoom.us/j/${meetingId}?pwd=student_${studentId}`;
}

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

    // Get students assigned to this teacher
    const students = await db.user.findMany({
      where: {
        assignedTeacherId: session.user.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        birthDate: true,
        gender: true,
        subscriptions: {
          where: {
            status: 'ACTIVE',
          },
          select: {
            id: true,
            status: true,
            startDate: true,
            endDate: true,
            classes_completed: true,
            next_class_date: true,
            package: {
              select: {
                id: true,
                title: true,
                class_duration: true,
                total_classes: true,
              },
            },
          },
        },
      },
    });

    // Get zoom links from TeacherStudent relationships
    const teacherStudentRelations = await db.teacherStudent.findMany({
      where: {
        teacherId: session.user.id,
        isActive: true,
        studentId: {
          in: students.map((student) => student.id),
        },
      },
      select: {
        studentId: true,
        zoomLink: true,
      },
    });

    // Transform the data to include calculated fields
    const transformedStudents = students.map((student) => {
      // Find zoom link for this student from teacher-student relationship
      const teacherStudentRelation = teacherStudentRelations.find(
        (rel) => rel.studentId === student.id
      );

      return {
        id: student.id,
        name: student.name || 'Unknown',
        email: student.email || '',
        phone: student.phone,
        birthDate: student.birthDate?.toISOString(),
        gender: student.gender,
        activeSubscriptions: student.subscriptions.filter(
          (sub) => sub.status === 'ACTIVE'
        ).length,
        completedClasses: student.subscriptions.reduce(
          (total, sub) => total + sub.classes_completed,
          0
        ),
        nextClassDate: student.subscriptions
          .filter((sub) => sub.next_class_date)
          .sort(
            (a, b) =>
              new Date(a.next_class_date!).getTime() -
              new Date(b.next_class_date!).getTime()
          )[0]
          ?.next_class_date?.toISOString(),
        zoomLink:
          teacherStudentRelation?.zoomLink || generateZoomLink(student.id), // Use stored zoom link or generate fallback
        subscriptions: student.subscriptions.map((sub) => ({
          id: sub.id,
          status: sub.status,
          classes_completed: sub.classes_completed,
          total_classes: sub.package.total_classes || 8, // Default to 8 if not set
          package: {
            title: sub.package.title || 'Package',
            class_duration: sub.package.class_duration,
          },
        })),
      };
    });

    return NextResponse.json(transformedStudents);
  } catch (error) {
    console.error('Teacher students error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
