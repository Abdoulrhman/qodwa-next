'use client';

import { Book, Bell, Clock } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { TodoList } from '@/components/dashboard/todo-list';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';

export default function DashboardPage() {
  const t = useTranslations('Dashboard');
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const { user } = useAuth();
  const userName = user?.name || '';
  
  return (
    <DashboardLayout>
      <div className='space-y-8' dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Welcome Section */}
        <div className='space-y-2'>
          <h2 className={cn('text-2xl font-semibold', isRTL && 'text-right')}>
            {isRTL 
              ? `السلام عليكم، ${userName}` 
              : `Salam Alikoum, ${userName}`}
          </h2>
          <p className={cn('text-muted-foreground', isRTL && 'text-right')}>
            {t('home.welcome_message')}
          </p>
          <Button>{t('home.discover_courses')}</Button>
        </div>

        {/* Stats Grid */}
        <div className='grid gap-4 grid-cols-1 md:grid-cols-3'>
          <Card className='p-6'>
            <div className={cn('flex flex-col gap-2', isRTL && 'items-end')}>
              <Book className='h-6 w-6 text-muted-foreground' />
              <h3 className='text-2xl font-semibold'>
                {isRTL ? '0 دورة' : '0 Courses'}
              </h3>
            </div>
          </Card>
          <Card className='p-6'>
            <div className={cn('flex flex-col gap-2', isRTL && 'items-end')}>
              <Bell className='h-6 w-6 text-muted-foreground' />
              <h3 className='text-2xl font-semibold'>
                {isRTL ? '0 حصة' : '0 Classes'}
              </h3>
            </div>
          </Card>
          <Card className='p-6'>
            <div className={cn('flex flex-col gap-2', isRTL && 'items-end')}>
              <Clock className='h-6 w-6 text-muted-foreground' />
              <h3 className='text-2xl font-semibold'>
                {isRTL ? '0:00 ساعة' : '0:00 Hours'}
              </h3>
            </div>
          </Card>
        </div>

        {/* Todo List */}
        <div className={cn('rounded-lg border bg-card', isRTL && 'text-right')}>
          <TodoList />
        </div>
      </div>
    </DashboardLayout>
  );
}
