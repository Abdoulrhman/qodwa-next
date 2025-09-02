import { TeacherDashboardOverview } from '@/features/teacher/components/teacher-dashboard-overview';
import { DashboardLayout } from '@/shared/components/layout/dashboard-layout';

export default function TeacherDashboardPage() {
  return (
    <DashboardLayout>
      <div className='space-y-6'>
        <TeacherDashboardOverview />
      </div>
    </DashboardLayout>
  );
}
