'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  DollarSign,
  Menu,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import useIsMobile from '@/hooks/use-is-mobile';

const getRoutes = (locale: string, t: any) => [
  {
    label: t('navigation.home'),
    icon: Home,
    href: `/${locale}/dashboard`,
  },
  {
    label: t('Payments.title'),
    icon: DollarSign,
    href: `/${locale}/dashboard/payments`,
  },
];

export const DashboardSidebar = () => {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations('Dashboard');
  const isRTL = locale === 'ar';
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const routes = getRoutes(locale, t);

  // Close sidebar on route change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('dashboard-sidebar');
      if (isMobile && isSidebarOpen && sidebar && !sidebar.contains(event.target as Node)) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobile, isSidebarOpen]);

  // Prevent scrolling when sidebar is open on mobile
  useEffect(() => {
    if (isMobile && isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMobile, isSidebarOpen]);

  return (
    <>
      {/* Mobile toggle button */}
      {isMobile && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="fixed top-20 left-4 z-50"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}

      {/* Backdrop overlay for mobile */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        id="dashboard-sidebar"
        className={cn(
          'fixed h-full bg-background border-r z-50 transition-all duration-300',
          isMobile ? (
            isSidebarOpen 
              ? 'translate-x-0' 
              : isRTL ? 'translate-x-56' : '-translate-x-56'
          ) : 'translate-x-0',
          isRTL ? 'right-0 border-l border-r-0' : 'left-0',
          'w-56'
        )}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div className="flex flex-1 flex-col gap-2 p-4 pt-20">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-secondary',
                pathname === route.href
                  ? 'bg-secondary text-secondary-foreground'
                  : 'text-muted-foreground',
                isRTL && 'flex-row-reverse text-right'
              )}
            >
              <route.icon className="h-4 w-4" />
              {route.label}
            </Link>
          ))}
        </div>
      </div>
      
      {/* Main content spacer for desktop */}
      {!isMobile && (
        <div className="w-56" />
      )}
    </>
  );
};
