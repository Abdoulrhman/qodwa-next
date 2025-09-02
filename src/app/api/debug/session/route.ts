import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await auth();

    return NextResponse.json({
      session: session,
      user: session?.user,
      isAuthenticated: !!session,
      debugInfo: {
        userId: session?.user?.id,
        email: session?.user?.email,
        name: session?.user?.name,
        role: (session?.user as any)?.role,
        isTeacher: (session?.user as any)?.isTeacher,
        allUserKeys: session?.user ? Object.keys(session.user) : [],
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get session', details: error },
      { status: 500 }
    );
  }
}
