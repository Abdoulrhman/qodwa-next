'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function LearningPathsPage() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const t = useTranslations('Dashboard.learning_paths');

  useEffect(() => {
    if (status !== 'loading') {
      setIsLoading(false);
    }
  }, [status]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className='flex h-full items-center justify-center'>
          <Loader2 className='h-8 w-8 animate-spin' />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className='space-y-6'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>
            {t('title')}
          </h2>
        </div>

        <Card className="bg-white dark:bg-background">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <div className="mb-6 w-64">
              <Image 
                src="/images/paths.svg" 
                alt="No learning paths" 
                width={256} 
                height={256} 
                priority
              />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {t('no_paths')}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              {t('need_assignment')}
            </p>
            <Button>
              {t('view_paths')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
} 