'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useAuth } from '@/contexts/auth-context';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const router = useRouter();
  const { status } = useSession();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated && requireAuth) {
      // Extract current locale from pathname
      const pathname = window.location.pathname;
      const locale = pathname.split('/')[1] || 'en';

      // Redirect to login with callback URL
      const loginUrl = `/${locale}/auth/login?callbackUrl=${encodeURIComponent(
        pathname
      )}`;
      router.replace(loginUrl);
    }
  }, [isLoading, isAuthenticated, requireAuth, router]);

  // Show loading spinner while checking authentication
  if (isLoading || status === 'loading') {
    return (
      <div className='flex h-screen items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4'></div>
          <p className='text-muted-foreground'>Loading...</p>
        </div>
      </div>
    );
  }

  // If authentication is required but user is not authenticated, don't render children
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
