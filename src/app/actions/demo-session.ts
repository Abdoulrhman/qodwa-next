'use server';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function bookDemoSession(date: Date) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error('Unauthorized');
    }

    const user = await db.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        hasBookedDemo: true,
        demoSessionDate: date,
      },
      select: {
        id: true,
        email: true,
        hasBookedDemo: true,
        demoSessionDate: true,
      },
    });

    revalidatePath('/');
    return { success: true, user };
  } catch (error) {
    console.error('Error booking demo session:', error);
    return { success: false, error: 'Failed to book demo session' };
  }
}
