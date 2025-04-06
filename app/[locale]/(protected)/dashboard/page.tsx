import { Book, Bell, Clock, Info } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { TodoList } from '@/components/dashboard/todo-list';

interface MetadataProps {
  params: {
    locale: string;
  };
}

export async function generateMetadata({ params }: MetadataProps) {
  return {
    title: 'Dashboard - Qodwa',
  };
}

export default async function DashboardPage() {
  const t = await getTranslations('Dashboard');
  
  return (
    <DashboardLayout>
      <div className='space-y-6'>
        {/* Top Section: Welcome + Todo */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* Welcome Section */}
          <Card className="bg-white dark:bg-background p-6 space-y-3">
            <h2 className='text-xl font-semibold'>
              {t('welcome', { name: 'Abdoulrhman Salah' })}
            </h2>
            <p className='text-sm text-muted-foreground'>
              {t('welcome_message')}
            </p>
            <Button variant="default" size="sm" className="bg-[#101828] hover:bg-[#101828]/90 text-white">
              {t('discover_courses')}
            </Button>
          </Card>

          {/* Todo List Section */}
          <div className='space-y-4'>
            <h2 className="text-xl font-semibold">{t('todo_list')}</h2>
            <Card className='divide-y'>
              <div className="p-4 flex items-center justify-between">
                <span>{t('todo_items.save_surah')}</span>
                <Button variant="ghost" size="icon">
                  <Info className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
              <div className="p-4 flex items-center justify-between">
                <span>{t('todo_items.repeat_surah')}</span>
                <Button variant="ghost" size="icon">
                  <Info className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Stats Grid */}
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
          <Card className='p-6 bg-gray-50 dark:bg-background'>
            <div className='space-y-2'>
              <Book className='h-6 w-6 text-muted-foreground' />
              <h3 className='text-xl font-semibold'>0 {t('stats.courses')}</h3>
            </div>
          </Card>
          <Card className='p-6 bg-gray-50 dark:bg-background'>
            <div className='space-y-2'>
              <Bell className='h-6 w-6 text-muted-foreground' />
              <h3 className='text-xl font-semibold'>0 {t('stats.classes')}</h3>
            </div>
          </Card>
          <Card className='p-6 bg-gray-50 dark:bg-background'>
            <div className='space-y-2'>
              <Clock className='h-6 w-6 text-muted-foreground' />
              <h3 className='text-xl font-semibold'>0:00 {t('stats.hours')}</h3>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
