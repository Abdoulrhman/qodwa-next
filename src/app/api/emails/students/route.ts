import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import {
  sendWelcomeEmailToStudent,
  sendTeacherAssignmentEmailToStudent,
  sendClassReminderToStudent,
  sendProgressUpdateToStudent,
  sendBulkEmailToStudents,
} from '@/lib/mail';

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();

    // Check if user is admin or teacher
    if (!user || (user.role !== 'ADMIN' && user.role !== 'TEACHER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, data } = body;

    switch (type) {
      case 'welcome':
        return await handleWelcomeEmail(data);

      case 'teacher_assignment':
        return await handleTeacherAssignmentEmail(data);

      case 'class_reminder':
        return await handleClassReminderEmail(data);

      case 'progress_update':
        return await handleProgressUpdateEmail(data, user);

      case 'bulk_email':
        return await handleBulkEmailToStudents(data, user);

      default:
        return NextResponse.json(
          { error: 'Invalid email type' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error sending email to students:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}

async function handleWelcomeEmail(data: {
  studentId: string;
  teacherName?: string;
}) {
  const student = await db.user.findUnique({
    where: { id: data.studentId },
    include: {
      assignedTeacher: true,
    },
  });

  if (!student || !student.email) {
    return NextResponse.json(
      { error: 'Student not found or no email' },
      { status: 404 }
    );
  }

  await sendWelcomeEmailToStudent(
    student.email,
    student.name || 'Student',
    data.teacherName || student.assignedTeacher?.name || undefined
  );

  return NextResponse.json({
    success: true,
    message: 'Welcome email sent successfully',
  });
}

async function handleTeacherAssignmentEmail(data: {
  studentId: string;
  teacherId: string;
}) {
  const student = await db.user.findUnique({
    where: { id: data.studentId },
  });

  const teacher = await db.user.findUnique({
    where: { id: data.teacherId },
  });

  if (!student || !teacher || !student.email || !teacher.email) {
    return NextResponse.json(
      { error: 'Student or teacher not found' },
      { status: 404 }
    );
  }

  await sendTeacherAssignmentEmailToStudent(
    student.email,
    student.name || 'Student',
    teacher.name || 'Teacher',
    teacher.email,
    teacher.subjects || undefined
  );

  return NextResponse.json({
    success: true,
    message: 'Teacher assignment email sent successfully',
  });
}

async function handleClassReminderEmail(data: {
  studentId: string;
  classDate: string;
  classTime: string;
  subjects?: string;
}) {
  const student = await db.user.findUnique({
    where: { id: data.studentId },
    include: {
      assignedTeacher: true,
    },
  });

  if (!student || !student.email) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 });
  }

  const classDate = new Date(data.classDate);

  await sendClassReminderToStudent(
    student.email,
    student.name || 'Student',
    student.assignedTeacher?.name || 'Your Teacher',
    classDate,
    data.classTime,
    data.subjects || student.assignedTeacher?.subjects || undefined
  );

  return NextResponse.json({
    success: true,
    message: 'Class reminder email sent successfully',
  });
}

async function handleProgressUpdateEmail(
  data: {
    studentId: string;
    progressNote: string;
    completedLessons?: number;
    totalLessons?: number;
  },
  currentUser: any
) {
  const student = await db.user.findUnique({
    where: { id: data.studentId },
    include: {
      assignedTeacher: true,
    },
  });

  if (!student || !student.email) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 });
  }

  // If current user is a teacher, check if they're assigned to this student
  if (currentUser.role === 'TEACHER') {
    const isAssigned = student.assignedTeacherId === currentUser.id;
    const hasConnection = await db.teacherStudent.findFirst({
      where: {
        teacherId: currentUser.id,
        studentId: data.studentId,
        isActive: true,
      },
    });

    if (!isAssigned && !hasConnection) {
      return NextResponse.json(
        { error: 'You are not assigned to this student' },
        { status: 403 }
      );
    }
  }

  const teacherName =
    currentUser.role === 'TEACHER'
      ? currentUser.name
      : student.assignedTeacher?.name || 'Your Teacher';

  await sendProgressUpdateToStudent(
    student.email,
    student.name || 'Student',
    teacherName,
    data.progressNote,
    data.completedLessons,
    data.totalLessons
  );

  return NextResponse.json({
    success: true,
    message: 'Progress update email sent successfully',
  });
}

async function handleBulkEmailToStudents(
  data: {
    subject: string;
    message: string;
    studentIds?: string[];
    includePersonalization?: boolean;
  },
  currentUser: any
) {
  // Only admins can send bulk emails
  if (currentUser.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Only administrators can send bulk emails' },
      { status: 403 }
    );
  }

  let whereClause: any = {
    isTeacher: false,
    email: { not: null },
  };

  // If specific student IDs are provided, filter by them
  if (data.studentIds && data.studentIds.length > 0) {
    whereClause.id = { in: data.studentIds };
  }

  const students = await db.user.findMany({
    where: whereClause,
    select: {
      email: true,
      name: true,
    },
  });

  if (students.length === 0) {
    return NextResponse.json({ error: 'No students found' }, { status: 404 });
  }

  const results = await sendBulkEmailToStudents(
    students.map((s: { email: string | null; name: string | null }) => ({
      email: s.email!,
      name: s.name || 'Student',
    })),
    data.subject,
    data.message,
    data.includePersonalization ?? true
  );

  const successful = results.filter((r) => r.status === 'fulfilled').length;
  const failed = results.filter((r) => r.status === 'rejected').length;

  return NextResponse.json({
    success: true,
    message: `Bulk email sent to ${successful} students. ${failed} failed.`,
    results: {
      total: students.length,
      successful,
      failed,
    },
  });
}
