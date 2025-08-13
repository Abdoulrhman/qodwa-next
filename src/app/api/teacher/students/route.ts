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
          select: {
            id: true,
            status: true,
            startDate: true,
            endDate: true,
            classes_completed: true,
            next_class_date: true,
          },
        },
      },
    });

    // Transform the data to include calculated fields
    const transformedStudents = students.map((student) => ({
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
    }));

    return NextResponse.json(transformedStudents);
  } catch (error) {
    console.error('Teacher students error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
