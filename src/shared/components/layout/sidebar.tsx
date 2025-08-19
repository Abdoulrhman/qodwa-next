'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  DollarSign,
  Menu,
  GraduationCap,
  Calendar,
  BookOpen,
  MessageCircle,
  BarChart3,
  Settings,
  Shield,
  Users,
  UserPlus,
  BookText,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useSession } from 'next-auth/react';
import { useCurrentUserRole } from '@/features/auth/hooks/use-current-user-role';
import { useCurrentUser } from '@/features/auth/hooks/use-current-user';
import { hasTeacherAccess } from '@/src/shared/utils/teacher-utils';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import useIsMobile from '@/shared/hooks/use-is-mobile';

interface RouteItem {
  label: string;
  icon: React.ComponentType<any>;
  href?: string;
  children?: RouteItem[];
  isActive?: boolean;
}

const getRoutes = (
  locale: string,
  t: any,
  role: string | undefined,
  isTeacher: boolean
): RouteItem[] => {
  // Base routes available to all users
  const baseRoutes: RouteItem[] = [
    {
      label: t('navigation.home'),
      icon: Home,
      href: `/${locale}/dashboard`,
      isActive: true,
    },
  ].filter((route) => route.isActive);

  // Teacher-specific routes
  const teacherRoutes: RouteItem[] = [
    {
      label: 'My Students',
      icon: Users,
      href: `/${locale}/dashboard/teacher/students`,
      isActive: true,
    },
  ].filter((route) => route.isActive);

  // Student-specific routes
  const studentRoutes: RouteItem[] = [
    {
      label: 'My Teacher',
      icon: GraduationCap,
      href: `/${locale}/dashboard/teacher`,
      isActive: true,
    },
    {
      label: 'My Packages',
      icon: BookOpen,
      href: `/${locale}/dashboard/packages`,
      isActive: true,
    },
    {
      label: 'Schedule',
      icon: Calendar,
      href: `/${locale}/dashboard/schedule`,
      isActive: false,
    },
    {
      label: 'Progress',
      icon: BarChart3,
      href: `/${locale}/dashboard/progress`,
      isActive: false,
    },
  ].filter((route) => route.isActive);

  // Admin-specific routes
  const adminRoutes: RouteItem[] = [
    {
      label: t('navigation.admin.title'),
      icon: Shield,
      children: [
        {
          label: t('navigation.admin.dashboard'),
          icon: Home,
          href: `/${locale}/dashboard/admin`,
          isActive: true,
        },
        {
          label: t('navigation.admin.users'),
          icon: Users,
          href: `/${locale}/dashboard/admin/users`,
          isActive: false,
        },
        {
          label: t('navigation.admin.teachers'),
          icon: GraduationCap,
          href: `/${locale}/dashboard/admin/teachers`,
          isActive: true,
        },
        {
          label: t('navigation.admin.packages'),
          icon: BookText,
          href: `/${locale}/dashboard/admin/packages`,
          isActive: true,
        },
        {
          label: t('navigation.admin.subscriptions'),
          icon: DollarSign,
          href: `/${locale}/dashboard/admin/subscriptions`,
          isActive: true,
        },
        {
          label: t('navigation.admin.analytics'),
          icon: BarChart3,
          href: `/${locale}/dashboard/admin/analytics`,
          isActive: false,
        },
        {
          label: t('navigation.admin.settings'),
          icon: Settings,
          href: `/${locale}/dashboard/admin/settings`,
          isActive: false,
        },
      ].filter((route) => route.isActive), // Filter out inactive routes
    },
  ];

  // Common routes for teachers and students (not admins)
  const commonRoutes: RouteItem[] = [
    {
      label: 'Messages',
      icon: MessageCircle,
      href: `/${locale}/dashboard/messages`,
      isActive: false,
    },
    {
      label: t('Payments.title'),
      icon: DollarSign,
      href: `/${locale}/dashboard/payments`,
      isActive: role === 'USER',
    },
  ].filter((route) => route.isActive);

  // Determine user type and build routes accordingly
  let userType: 'admin' | 'teacher' | 'student' = 'student';

  if (role === 'ADMIN') {
    userType = 'admin';
  } else if (isTeacher) {
    userType = 'teacher';
  }

  switch (userType) {
    case 'admin':
      return [...baseRoutes, ...adminRoutes];

    case 'teacher':
      return [...baseRoutes, ...teacherRoutes, ...commonRoutes];

    case 'student':
    default:
      return [...baseRoutes, ...studentRoutes, ...commonRoutes];
  }
};

export const DashboardSidebar = () => {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations('Dashboard');
  const isRTL = locale === 'ar';
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>(
    {}
  );

  // Get user role and user data
  const { role } = useCurrentUserRole();
  const user = useCurrentUser();
  const { data: session, status, update } = useSession();

  // Use session user if useCurrentUser returns undefined (fallback)
  const currentUser = user || session?.user;
  const isTeacher = hasTeacherAccess(currentUser);

  // Handle loading state
  const isLoading = status === 'loading';

  // Force session refresh if authenticated but user data is missing
  useEffect(() => {
    if (status === 'authenticated' && !user && session?.user) {
      console.log('🔄 Forcing session refresh due to missing user data');
      update();
    }
  }, [status, user, session?.user, update]);

  // Additional effect to handle session state changes
  useEffect(() => {
    if (status === 'authenticated' && session?.user && !user) {
      console.log(
        '🔄 Session authenticated but useCurrentUser hook not updated, forcing refresh...'
      );
      // Small delay then force update
      setTimeout(() => {
        update();
      }, 100);
    }
  }, [status, session, user, update]);

  console.log('🔍 CORRECT SIDEBAR DEBUG:', {
    user: user,
    currentUser: currentUser,
    session: session,
    role: role,
    isTeacher: isTeacher,
    status: status,
    isLoading: isLoading,
    userIsTeacherFlag: (currentUser as any)?.isTeacher,
    userRoleFlag: (currentUser as any)?.role,
    sessionUser: session?.user,
  });

  const routes = getRoutes(locale, t, role, isTeacher);

  // Toggle dropdown function
  const toggleDropdown = (label: string) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  // Initialize admin dropdown as open if on admin page
  useEffect(() => {
    if (pathname.includes('/dashboard/admin')) {
      setOpenDropdowns((prev) => ({ ...prev, Admin: true }));
    }
  }, [pathname]);

  // Check if any admin route is active
  const isAdminRouteActive = (children: any[]) => {
    return children.some((child: any) => pathname === child.href);
  };

  // Close sidebar on route change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('dashboard-sidebar');
      if (
        isMobile &&
        isSidebarOpen &&
        sidebar &&
        !sidebar.contains(event.target as Node)
      ) {
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
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobile, isSidebarOpen]);

  // Show loading skeleton while session is loading
  if (isLoading) {
    console.log('🔍 SIDEBAR LOADING STATE');
    return (
      <aside className='w-64 h-full bg-background border-r'>
        <div className='p-4'>
          <div className='space-y-2'>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className='h-10 bg-muted animate-pulse rounded' />
            ))}
          </div>
        </div>
      </aside>
    );
  }

  return (
    <>
      {/* Mobile toggle button */}
      {isMobile && (
        <Button
          variant='ghost'
          size='icon'
          className='fixed top-20 left-4 z-50'
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <Menu className='h-5 w-5' />
        </Button>
      )}

      {/* Backdrop overlay for mobile */}
      {isMobile && isSidebarOpen && (
        <div
          className='fixed inset-0 bg-black/30 z-40'
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        id='dashboard-sidebar'
        className={cn(
          'fixed h-full bg-background border-r z-50 transition-all duration-300',
          isMobile
            ? isSidebarOpen
              ? 'translate-x-0'
              : isRTL
                ? 'translate-x-56'
                : '-translate-x-56'
            : 'translate-x-0',
          isRTL ? 'right-0 border-l border-r-0' : 'left-0',
          'w-56'
        )}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div className='flex flex-1 flex-col gap-2 p-4 pt-20'>
          {routes.map((route: any) => {
            // Handle dropdown routes
            if (route.children) {
              const isOpen = openDropdowns[route.label];
              const hasActiveChild = isAdminRouteActive(route.children);

              return (
                <div key={route.label}>
                  {/* Dropdown trigger */}
                  <button
                    onClick={() => toggleDropdown(route.label)}
                    className={cn(
                      'flex items-center justify-between w-full gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-secondary',
                      hasActiveChild
                        ? 'bg-secondary text-secondary-foreground'
                        : 'text-muted-foreground',
                      isRTL && 'flex-row-reverse text-right'
                    )}
                  >
                    <div
                      className={cn(
                        'flex items-center gap-3',
                        isRTL && 'flex-row-reverse'
                      )}
                    >
                      <route.icon className='h-4 w-4' />
                      {route.label}
                    </div>
                    {isOpen ? (
                      <ChevronDown className='h-4 w-4' />
                    ) : (
                      <ChevronRight className='h-4 w-4' />
                    )}
                  </button>

                  {/* Dropdown content */}
                  {isOpen && (
                    <div
                      className={cn(
                        'ml-4 mt-1 space-y-1',
                        isRTL && 'mr-4 ml-0'
                      )}
                    >
                      {route.children.map((child: any) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-secondary',
                            pathname === child.href
                              ? 'bg-secondary text-secondary-foreground'
                              : 'text-muted-foreground',
                            isRTL && 'flex-row-reverse text-right'
                          )}
                        >
                          <child.icon className='h-4 w-4' />
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            // Handle regular routes
            return (
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
                <route.icon className='h-4 w-4' />
                {route.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main content spacer for desktop */}
      {!isMobile && <div className='w-56' />}
    </>
  );
};
