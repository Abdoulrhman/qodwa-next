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

    // For now, let's return sample data since the database may not have teacher assignments yet
    // TODO: Replace with actual database queries once teacher assignments are set up

    // Sample primary teacher data
    const samplePrimaryTeacher = {
      id: 'sample-teacher-1',
      name: 'أستاذ أحمد محمد',
      email: 'ahmed.mohammed@qodwa.com',
      phone: '+966501234567',
      image: '/images/teachers/teacher-1.jpg',
      subjects: 'القرآن الكريم، التجويد، الفقه',
      qualifications: 'ماجستير في علوم القرآن - جامعة الأزهر',
      teachingExperience: 8,
    };

    // Sample additional teachers
    const sampleAdditionalTeachers = [
      {
        id: 'connection-1',
        assignedAt: '2025-01-01T00:00:00Z',
        isActive: true,
        notes: 'متخصص في تحفيظ القرآن الكريم',
        teacher: {
          id: 'sample-teacher-2',
          name: 'أستاذة فاطمة علي',
          email: 'fatima.ali@qodwa.com',
          phone: '+966507654321',
          image: '/images/teachers/teacher-2.jpg',
          subjects: 'التحفيظ، التلاوة',
          qualifications: 'إجازة في القراءات العشر',
          teachingExperience: 12,
        },
      },
    ];

    // Try to fetch student data to verify they exist
    const student = await db.user.findUnique({
      where: {
        id: userId,
        OR: [{ isTeacher: false }, { isTeacher: null }],
      },
    });

    if (!student) {
      return NextResponse.json(
        {
          success: false,
          error: 'Student not found',
        },
        { status: 404 }
      );
    }

    // Return sample data for now
    const response = {
      success: true,
      primaryTeacher: samplePrimaryTeacher,
      additionalTeachers: sampleAdditionalTeachers,
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
