import { NextRequest, NextResponse } from 'next/server';
import {
  sendWelcomeEmailToStudent,
  sendWelcomeEmailToTeacher,
  sendBulkEmailToStudents,
  sendBulkEmailToTeachers,
} from '@/lib/mail';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    switch (type) {
      case 'test_student_welcome':
        await sendWelcomeEmailToStudent(
          data.email,
          data.name || 'Test Student',
          data.teacherName
        );
        return NextResponse.json({
          success: true,
          message: 'Student welcome email sent',
        });

      case 'test_teacher_welcome':
        await sendWelcomeEmailToTeacher(
          data.email,
          data.name || 'Test Teacher',
          data.approvalStatus || 'APPROVED'
        );
        return NextResponse.json({
          success: true,
          message: 'Teacher welcome email sent',
        });

      case 'test_bulk_students':
        const studentResults = await sendBulkEmailToStudents(
          [{ email: data.email, name: data.name || 'Test Student' }],
          data.subject || 'Test Subject',
          data.message || 'This is a test message.',
          true
        );
        return NextResponse.json({
          success: true,
          message: 'Bulk student email sent',
          results: studentResults,
        });

      case 'test_bulk_teachers':
        const teacherResults = await sendBulkEmailToTeachers(
          [{ email: data.email, name: data.name || 'Test Teacher' }],
          data.subject || 'Test Subject',
          data.message || 'This is a test message.',
          true
        );
        return NextResponse.json({
          success: true,
          message: 'Bulk teacher email sent',
          results: teacherResults,
        });

      default:
        return NextResponse.json(
          { error: 'Invalid test type' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in test email:', error);
    return NextResponse.json(
      { error: 'Failed to send test email' },
      { status: 500 }
    );
  }
}
