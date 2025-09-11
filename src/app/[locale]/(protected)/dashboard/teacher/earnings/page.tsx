import { TeacherEarnings } from '@/features/teacher/components/teacher-earnings';
import { DashboardLayout } from '@/shared/components/layout/dashboard-layout';

export default function TeacherEarningsPage() {
  return (
    <DashboardLayout>
      <div className='space-y-6'>
        <TeacherEarnings />
      </div>
    </DashboardLayout>
  );
}
