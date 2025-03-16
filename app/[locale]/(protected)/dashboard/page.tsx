import { Book, Bell, Clock } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { TodoList } from '@/components/dashboard/todo-list';

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className='space-y-8'>
        {/* Welcome Section */}
        <div className='space-y-2'>
          <h2 className='text-2xl font-semibold'>
            Salam Alikoum, Abdoulrhman Salah
          </h2>
          <p className='text-muted-foreground'>
            Keep up the great work and continue your Quran & Arabic learning
            journey! Every step makes you closer to your goal.
          </p>
          <Button>Discover Courses</Button>
        </div>

        {/* Stats Grid */}
        <div className='grid gap-4 md:grid-cols-3'>
          <Card className='p-6'>
            <div className='flex flex-col gap-2'>
              <Book className='h-6 w-6 text-muted-foreground' />
              <h3 className='text-2xl font-semibold'>0 Courses</h3>
            </div>
          </Card>
          <Card className='p-6'>
            <div className='flex flex-col gap-2'>
              <Bell className='h-6 w-6 text-muted-foreground' />
              <h3 className='text-2xl font-semibold'>0 Classes</h3>
            </div>
          </Card>
          <Card className='p-6'>
            <div className='flex flex-col gap-2'>
              <Clock className='h-6 w-6 text-muted-foreground' />
              <h3 className='text-2xl font-semibold'>0:00 Hours</h3>
            </div>
          </Card>
        </div>

        {/* Todo List */}
        <div className='rounded-lg border bg-card'>
          <TodoList />
        </div>
      </div>
    </DashboardLayout>
  );
}
