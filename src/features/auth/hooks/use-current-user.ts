'use client';

import { useSession } from 'next-auth/react';

export const useCurrentUser = () => {
  const { data: session } = useSession();
  return session?.user;
};

// Server-side version for server components
export const getCurrentUserServer = async () => {
  const { auth } = await import('@/auth');
  const session = await auth();
  return session?.user;
};
