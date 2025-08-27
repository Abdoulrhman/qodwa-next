import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';

import { AdminFreeSessionsDashboard } from '@/features/admin/free-sessions/components/admin-free-sessions-dashboard';

export const metadata: Metadata = {
  title: 'Admin - Free Sessions Management',
  description: 'Manage all free session bookings',
};

export default async function AdminFreeSessionsPage() {
  const t = await getTranslations('Dashboard.admin.freeSessions');

  return (
    <div className='container mx-auto py-6 space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>{t('title')}</h1>
          <p className='text-muted-foreground'>{t('description')}</p>
        </div>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <AdminFreeSessionsDashboard />
      </Suspense>
    </div>
  );
}
