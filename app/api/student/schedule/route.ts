import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

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

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString();
    const view = searchParams.get('view') || 'week';

    // Sample schedule data
    const sampleClasses = [
      {
        id: 'class-1',
        title: 'Quran Memorization - Surah Al-Baqarah',
        teacherName: 'أستاذ أحمد محمد',
        teacherId: 'teacher-1',
        date: '2025-08-07',
        startTime: '10:00',
        endTime: '11:00',
        duration: 60,
        status: 'scheduled',
        type: 'memorization',
        meetingLink: 'https://meet.qodwa.com/room-123',
        notes: 'Focus on verses 1-20',
      },
      {
        id: 'class-2',
        title: 'Tajweed Practice Session',
        teacherName: 'أستاذة فاطمة علي',
        teacherId: 'teacher-2',
        date: '2025-08-07',
        startTime: '16:00',
        endTime: '16:45',
        duration: 45,
        status: 'scheduled',
        type: 'tajweed',
        meetingLink: 'https://meet.qodwa.com/room-456',
        notes: 'Practice Makhraj and Sifat',
      },
      {
        id: 'class-3',
        title: 'Quran Recitation Review',
        teacherName: 'أستاذ أحمد محمد',
        teacherId: 'teacher-1',
        date: '2025-08-08',
        startTime: '14:30',
        endTime: '15:30',
        duration: 60,
        status: 'scheduled',
        type: 'recitation',
        meetingLink: 'https://meet.qodwa.com/room-789',
      },
      {
        id: 'class-4',
        title: 'Islamic Studies Theory',
        teacherName: 'أستاذ علي حسن',
        teacherId: 'teacher-3',
        date: '2025-08-09',
        startTime: '11:00',
        endTime: '12:00',
        duration: 60,
        status: 'completed',
        type: 'theory',
        notes: 'Completed - Good progress on Fiqh basics',
      },
      {
        id: 'class-5',
        title: 'Weekend Intensive Session',
        teacherName: 'أستاذة فاطمة علي',
        teacherId: 'teacher-2',
        date: '2025-08-10',
        startTime: '09:00',
        endTime: '11:00',
        duration: 120,
        status: 'scheduled',
        type: 'memorization',
        meetingLink: 'https://meet.qodwa.com/room-weekend',
        notes: 'Weekend intensive memorization session',
      },
    ];

    // Filter classes based on the requested date range
    const requestedDate = new Date(date);
    let filteredClasses = sampleClasses;

    if (view === 'week') {
      const weekStart = new Date(requestedDate);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6); // End of week

      filteredClasses = sampleClasses.filter((cls) => {
        const classDate = new Date(cls.date);
        return classDate >= weekStart && classDate <= weekEnd;
      });
    } else if (view === 'month') {
      const monthStart = new Date(
        requestedDate.getFullYear(),
        requestedDate.getMonth(),
        1
      );
      const monthEnd = new Date(
        requestedDate.getFullYear(),
        requestedDate.getMonth() + 1,
        0
      );

      filteredClasses = sampleClasses.filter((cls) => {
        const classDate = new Date(cls.date);
        return classDate >= monthStart && classDate <= monthEnd;
      });
    }

    return NextResponse.json({
      success: true,
      classes: filteredClasses,
    });
  } catch (error) {
    console.error('Error fetching schedule data:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
