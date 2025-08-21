import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getFreeSessionBookingsByStudentId } from '@/data/free-session-booking';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const bookings = await getFreeSessionBookingsByStudentId(session.user.id);

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('[FREE_SESSION_MY_BOOKINGS_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
