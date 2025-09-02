import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import {
  sendWelcomeEmailToTeacher,
  sendStudentAssignmentEmailToTeacher,
  sendTeacherApprovalEmail,
  sendBulkEmailToTeachers,
} from '@/lib/mail';

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();

    // Check if user is admin
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        {
          error:
            'Unauthorized. Only administrators can send emails to teachers.',
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { type, data } = body;

    switch (type) {
      case 'welcome':
        return await handleWelcomeEmail(data);

      case 'student_assignment':
        return await handleStudentAssignmentEmail(data);

      case 'approval_status':
        return await handleApprovalEmail(data);

      case 'bulk_email':
        return await handleBulkEmailToTeachers(data);

      default:
        return NextResponse.json(
          { error: 'Invalid email type' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error sending email to teachers:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}

async function handleWelcomeEmail(data: {
  teacherId: string;
  approvalStatus?: 'APPROVED' | 'PENDING';
}) {
  const teacher = await db.user.findUnique({
    where: { id: data.teacherId },
  });

  if (!teacher || !teacher.email || !teacher.isTeacher) {
    return NextResponse.json(
      { error: 'Teacher not found or invalid' },
      { status: 404 }
    );
  }

  await sendWelcomeEmailToTeacher(
    teacher.email,
    teacher.name || 'Teacher',
    data.approvalStatus
  );

  return NextResponse.json({
    success: true,
    message: 'Welcome email sent successfully',
  });
}

async function handleStudentAssignmentEmail(data: {
  teacherId: string;
  studentId: string;
  packageDetails?: string;
}) {
  const teacher = await db.user.findUnique({
    where: { id: data.teacherId },
  });

  const student = await db.user.findUnique({
    where: { id: data.studentId },
    include: {
      subscriptions: {
        where: { status: 'ACTIVE' },
        include: { package: true },
        take: 1,
      },
    },
  });

  if (!teacher || !student || !teacher.email || !student.email) {
    return NextResponse.json(
      { error: 'Teacher or student not found' },
      { status: 404 }
    );
  }

  if (!teacher.isTeacher) {
    return NextResponse.json(
      { error: 'User is not a teacher' },
      { status: 400 }
    );
  }

  // Get package details if not provided
  let packageInfo = data.packageDetails;
  if (!packageInfo && student.subscriptions.length > 0) {
    const sub = student.subscriptions[0];
    packageInfo = `${sub.package.title || 'Learning Package'} - ${sub.package.class_duration} minutes, ${sub.package.days} days per week`;
  }

  await sendStudentAssignmentEmailToTeacher(
    teacher.email,
    teacher.name || 'Teacher',
    student.name || 'Student',
    student.email,
    packageInfo
  );

  return NextResponse.json({
    success: true,
    message: 'Student assignment email sent successfully',
  });
}

async function handleApprovalEmail(data: {
  teacherId: string;
  status: 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
}) {
  const teacher = await db.user.findUnique({
    where: { id: data.teacherId },
  });

  if (!teacher || !teacher.email || !teacher.isTeacher) {
    return NextResponse.json(
      { error: 'Teacher not found or invalid' },
      { status: 404 }
    );
  }

  // Update teacher approval status in database
  await db.user.update({
    where: { id: data.teacherId },
    data: {
      teacherApprovalStatus: data.status,
      teacherApprovedAt: data.status === 'APPROVED' ? new Date() : null,
      teacherRejectedReason:
        data.status === 'REJECTED' ? data.rejectionReason : null,
    },
  });

  await sendTeacherApprovalEmail(
    teacher.email,
    teacher.name || 'Teacher',
    data.status,
    data.rejectionReason
  );

  return NextResponse.json({
    success: true,
    message: `Teacher ${data.status.toLowerCase()} email sent successfully`,
  });
}

async function handleBulkEmailToTeachers(data: {
  subject: string;
  message: string;
  teacherIds?: string[];
  includePersonalization?: boolean;
}) {
  let whereClause: any = {
    isTeacher: true,
    email: { not: null },
  };

  // If specific teacher IDs are provided, filter by them
  if (data.teacherIds && data.teacherIds.length > 0) {
    whereClause.id = { in: data.teacherIds };
  }

  const teachers = await db.user.findMany({
    where: whereClause,
    select: {
      email: true,
      name: true,
    },
  });

  if (teachers.length === 0) {
    return NextResponse.json({ error: 'No teachers found' }, { status: 404 });
  }

  const results = await sendBulkEmailToTeachers(
    teachers.map((t: { email: string | null; name: string | null }) => ({
      email: t.email!,
      name: t.name || 'Teacher',
    })),
    data.subject,
    data.message,
    data.includePersonalization ?? true
  );

  const successful = results.filter((r) => r.status === 'fulfilled').length;
  const failed = results.filter((r) => r.status === 'rejected').length;

  return NextResponse.json({
    success: true,
    message: `Bulk email sent to ${successful} teachers. ${failed} failed.`,
    results: {
      total: teachers.length,
      successful,
      failed,
    },
  });
}
