import { ReactNode } from 'react';
import { DashboardLayout } from '@/shared/components/layout/dashboard-layout';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardLayout>
      <div className='flex flex-col space-y-8'>{children}</div>
    </DashboardLayout>
  );
}
