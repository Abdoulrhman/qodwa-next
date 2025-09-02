'use client';

import { ReactNode, createContext, useContext, useEffect } from 'react';
import {
  SessionProvider as NextAuthSessionProvider,
  useSession,
} from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface EnhancedSessionContextType {
  refreshSession: () => Promise<void>;
}

const EnhancedSessionContext = createContext<
  EnhancedSessionContextType | undefined
>(undefined);

interface EnhancedSessionProviderProps {
  children: ReactNode;
}

function EnhancedSessionProviderInner({
  children,
}: EnhancedSessionProviderProps) {
  const { update } = useSession();
  const router = useRouter();

  const refreshSession = async () => {
    console.log('🔄 Manually refreshing session...');
    await update();
    router.refresh();
  };

  // Listen for login events
  useEffect(() => {
    const handleLoginSuccess = async () => {
      console.log('🎉 Login success detected, refreshing session...');
      await update();
      router.refresh();
    };

    // Listen for custom login success event
    window.addEventListener('loginSuccess', handleLoginSuccess);

    return () => {
      window.removeEventListener('loginSuccess', handleLoginSuccess);
    };
  }, [update, router]);

  return (
    <EnhancedSessionContext.Provider value={{ refreshSession }}>
      {children}
    </EnhancedSessionContext.Provider>
  );
}

export function EnhancedSessionProvider({
  children,
}: EnhancedSessionProviderProps) {
  return (
    <NextAuthSessionProvider
      refetchInterval={5 * 60}
      refetchOnWindowFocus={true}
      refetchWhenOffline={false}
    >
      <EnhancedSessionProviderInner>{children}</EnhancedSessionProviderInner>
    </NextAuthSessionProvider>
  );
}

export function useEnhancedSession() {
  const context = useContext(EnhancedSessionContext);
  if (context === undefined) {
    throw new Error(
      'useEnhancedSession must be used within an EnhancedSessionProvider'
    );
  }
  return context;
}
