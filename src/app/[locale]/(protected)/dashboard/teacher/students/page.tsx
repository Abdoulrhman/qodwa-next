import { TeacherStudentManagement } from '@/features/teacher/components/teacher-student-management';
import { DashboardLayout } from '@/shared/components/layout/dashboard-layout';

export default function TeacherStudentsPage() {
  return (
    <DashboardLayout>
      <TeacherStudentManagement />
    </DashboardLayout>
  );
}
