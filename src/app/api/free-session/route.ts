import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import {
  createFreeSessionBooking,
  CreateFreeSessionBookingData,
  checkStudentHasFreeSession,
  getFreeSessionBookingsByStudentId,
} from '@/data/free-session-booking';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Check if student already has a free session booking
    const hasExistingBooking = await checkStudentHasFreeSession(
      session.user.id
    );
    if (hasExistingBooking) {
      return new NextResponse(
        'You already have a free session booking. Only one free session per student is allowed.',
        {
          status: 400,
        }
      );
    }

    const body = await request.json();
    const {
      sessionDate,
      sessionTime,
      duration,
      subject,
      studentNotes,
      timezone,
    } = body;

    if (!sessionDate || !sessionTime || !subject) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // Combine date and time
    const combinedDateTime = new Date(`${sessionDate}T${sessionTime}`);

    // Validate that the session is in the future
    if (combinedDateTime <= new Date()) {
      return new NextResponse('Session date must be in the future', {
        status: 400,
      });
    }

    const bookingData: CreateFreeSessionBookingData = {
      studentId: session.user.id,
      sessionDate: combinedDateTime,
      duration: parseInt(duration) || 30,
      subject,
      studentNotes,
      timezone,
    };

    const booking = await createFreeSessionBooking(bookingData);

    if (!booking) {
      return new NextResponse('Failed to create booking', { status: 500 });
    }

    return NextResponse.json({
      success: true,
      booking,
      message: 'Free session booked successfully!',
    });
  } catch (error: any) {
    console.error('[FREE_SESSION_BOOKING_POST]', error);

    if (error.message === 'Student already has a free session booking') {
      return new NextResponse(
        'You already have a free session booking. Only one free session per student is allowed.',
        {
          status: 400,
        }
      );
    }

    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const bookings = await getFreeSessionBookingsByStudentId(session.user.id);

    return NextResponse.json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error('[FREE_SESSION_BOOKING_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
