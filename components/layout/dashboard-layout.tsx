'use client';

import { ReactNode } from 'react';
import { Bell, Menu } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import { ProfileMenu } from '@/components/dashboard/profile-menu';
import { DashboardSidebar } from './sidebar';
import { ThemeProvider } from 'next-themes';
import LanguageSwitcher from '../lang-switcher';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const t = useTranslations('Layout');

  return (
    <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
      <div className='min-h-screen bg-gray-50 dark:bg-background'>
        {/* Header */}
        <header className='fixed top-0 z-50 w-full border-b bg-white dark:bg-background'>
          <div className='flex h-16 items-center px-4 md:px-6'>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden mr-2">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0">
                <DashboardSidebar />
              </SheetContent>
            </Sheet>

            <Link href='/' className='flex items-center gap-2'>
              <Image
                src='/images/logo/logo.png'
                alt='Qodwa'
                width={120}
                height={40}
                className='dark:invert'
              />
            </Link>
            <div className='ml-auto flex items-center gap-2 md:gap-4'>
              <LanguageSwitcher />
              <ModeToggle />
              <Button 
                variant='ghost' 
                size='icon' 
                className="text-muted-foreground"
                aria-label={t('notifications')}
              >
                <Bell className='h-5 w-5' />
              </Button>
              <ProfileMenu />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className='flex pt-16'>
          <div className='hidden md:block'>
            <DashboardSidebar />
          </div>
          <main className='flex-1 overflow-y-auto p-6 md:p-8 max-w-7xl mx-auto w-full'>
            {children}
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
};
