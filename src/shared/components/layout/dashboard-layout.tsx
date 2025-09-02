'use client';

import { ReactNode } from 'react';
import { Bell } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale } from 'next-intl';

import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/shared/components/mode-toggle';
import LanguageSwitcher from '@/shared/components/lang-switcher';
import { ProfileMenu } from '@/features/dashboard/components/profile-menu';
import { DashboardSidebar } from './sidebar';
import { ThemeProvider } from 'next-themes';
import { cn } from '@/lib/utils';
import { useCurrentUser } from '@/src/hooks/use-current-user';
import NotificationBell from '@/src/components/admin/notification-bell';

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const user = useCurrentUser();

  return (
    <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
      <div className='min-h-screen' dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <header className='fixed top-0 z-50 w-full border-b bg-background'>
          <div
            className={cn(
              'flex h-16 items-center px-4 md:px-6',
              isRTL && 'flex-row-reverse'
            )}
          >
            <Link
              href={`/${locale}`}
              className={cn('flex items-center gap-2', isRTL && 'order-2')}
            >
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
                'flex items-center gap-4',
                isRTL ? 'mr-auto order-1' : 'ml-auto'
              )}
            >
              <ModeToggle />
              <LanguageSwitcher />
              <Button variant='ghost' size='icon'>
                <Bell className='h-5 w-5' />
              </Button>
              <ProfileMenu />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className={cn('flex pt-16', isRTL && 'flex-row-reverse')}>
          <DashboardSidebar />
          <main
            className={cn(
              'flex-1 overflow-y-auto p-4 md:p-8 transition-all duration-300'
            )}
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            {children}
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
};
