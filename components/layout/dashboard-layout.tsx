'use client';

import { ReactNode } from 'react';
import { Bell } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import { ProfileMenu } from '@/components/dashboard/profile-menu';
import { DashboardSidebar } from './sidebar';
import { ThemeProvider } from 'next-themes';

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
      <div className='min-h-screen'>
        {/* Header */}
        <header className='fixed top-0 z-50 w-full border-b bg-background'>
          <div className='flex h-16 items-center px-4 md:px-6'>
            <Link href='/' className='flex items-center gap-2'>
              <Image
                src='/images/logo/logo.png'
                alt='Qodwa'
                width={120}
                height={40}
                className='dark:invert'
              />
            </Link>
            <div className='ml-auto flex items-center gap-4'>
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
          <main className='flex-1 overflow-y-auto p-8'>{children}</main>
        </div>
      </div>
    </ThemeProvider>
  );
};
