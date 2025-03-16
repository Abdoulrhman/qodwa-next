'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  GraduationCap,
  FileText,
  DollarSign,
  Calendar,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { useLocale } from 'next-intl';

const getRoutes = (locale: string) => [
  {
    label: 'Home',
    icon: Home,
    href: `/${locale}/dashboard`,
  },
  {
    label: 'Learning Paths',
    icon: GraduationCap,
    href: `/${locale}/dashboard/learning-paths`,
  },
  {
    label: 'Lesson Reports',
    icon: FileText,
    href: `/${locale}/dashboard/lesson-reports`,
  },
  {
    label: 'Payments',
    icon: DollarSign,
    href: `/${locale}/dashboard/payments`,
  },
  {
    label: 'Schedule',
    icon: Calendar,
    href: `/${locale}/dashboard/schedule`,
  },
];

export const DashboardSidebar = () => {
  const pathname = usePathname();
  const locale = useLocale();
  const routes = getRoutes(locale);

  return (
    <div className='flex h-full w-56 flex-col border-r bg-background'>
      <div className='flex flex-1 flex-col gap-2 p-4'>
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-secondary',
              pathname === route.href
                ? 'bg-secondary text-secondary-foreground'
                : 'text-muted-foreground'
            )}
          >
            <route.icon className='h-4 w-4' />
            {route.label}
          </Link>
        ))}
      </div>
    </div>
  );
};
