'use client';

import { RoleGate } from '@/features/auth/components/role-gate';
import EmailManager from '@/shared/components/email-manager';
import EmailTestPanel from '@/shared/components/email-test-panel';
import EmailStatsCard from '@/shared/components/email-stats-card';
import EmailGuideCard from '@/shared/components/email-guide-card';

export default function AdminEmailPage() {
  return (
    <RoleGate allowedRole='ADMIN'>
      <div className='container mx-auto px-4 py-8'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold'>Email Management</h1>
          <p className='text-muted-foreground'>
            Send emails to students and teachers, test the system, and view
            statistics
          </p>
        </div>

        {/* Top Section - Stats and Guide */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8'>
          <EmailStatsCard />
          <EmailGuideCard />
        </div>

        {/* Email Manager and Test Panel */}
        <div className='grid grid-cols-1 xl:grid-cols-3 gap-6'>
          {/* Main Email Manager */}
          <div className='xl:col-span-2'>
            <EmailManager />
          </div>

          {/* Test Panel */}
          <div>
            <EmailTestPanel />
          </div>
        </div>
      </div>
    </RoleGate>
  );
}
