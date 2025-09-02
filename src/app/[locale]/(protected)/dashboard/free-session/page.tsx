import { DashboardLayout } from '@/shared/components/layout/dashboard-layout';
import { FreeSessionDashboard } from '@/features/free-session/components/free-session-dashboard';

export default function FreeSessionPage() {
  return (
    <DashboardLayout>
      <FreeSessionDashboard />
    </DashboardLayout>
  );
}
