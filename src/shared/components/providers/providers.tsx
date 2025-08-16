'use client';

import { ReactNode } from 'react';
import { EnhancedSessionProvider } from './enhanced-session-provider';
import { ThemeProvider } from '@/shared/components/providers/theme-provider';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return <EnhancedSessionProvider>{children}</EnhancedSessionProvider>;
}
