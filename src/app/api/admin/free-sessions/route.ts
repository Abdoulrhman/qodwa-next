import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getAllFreeSessionBookings, updateFreeSessionBooking, UpdateFreeSessionBookingData } from '@/data/free-session-booking';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const result = await getAllFreeSessionBookings({
      status: status as any,
      page,
      limit,
    });

    return NextResponse.json({
      success: true,
      bookings: result.bookings,
      total: result.total,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit),
    });
  } catch (error) {
    console.error('[ADMIN_FREE_SESSIONS_GET]', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, status, teacherId, teacherNotes } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const updateData: UpdateFreeSessionBookingData = {};
    if (status) updateData.status = status;
    if (teacherId) updateData.teacherId = teacherId;
    if (teacherNotes) updateData.teacherNotes = teacherNotes;

    const updatedBooking = await updateFreeSessionBooking(id, updateData);

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
    });
  } catch (error) {
    console.error('[ADMIN_FREE_SESSIONS_PATCH]', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
