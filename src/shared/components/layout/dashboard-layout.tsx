'use client';

import { ReactNode } from 'react';
import { Bell } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale } from 'next-intl';

import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/shared/components/mode-toggle';
import { ProfileMenu } from '@/features/dashboard/components/profile-menu';
import { DashboardSidebar } from './sidebar';
import { ThemeProvider } from 'next-themes';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const locale = useLocale();
  const isRTL = locale === 'ar';

  return (
    <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
      <div className='min-h-screen'>
        {/* Header */}
        <header className='fixed top-0 z-50 w-full border-b bg-background'>
          <div
            className={cn(
              'flex h-16 items-center px-4 md:px-6',
              isRTL && 'flex-row-reverse'
            )}
          >
            <Link href={`/${locale}`} className='flex items-center gap-2'>
              <Image
                src='/images/logo/logo.png'
                alt='Qodwa'
                width={120}
                height={40}
                className='dark:invert'
              />
            </Link>
            <div
              className={cn(
                'ml-auto flex items-center gap-4',
                isRTL && 'ml-0 mr-auto'
              )}
            >
              <ModeToggle />
              <Button variant='ghost' size='icon'>
                <Bell className='h-5 w-5' />
              </Button>
              <ProfileMenu />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className='flex pt-16'>
          <DashboardSidebar />
          <main className='flex-1 overflow-y-auto p-4 md:p-8'>{children}</main>
        </div>
      </div>
    </ThemeProvider>
  );
};
