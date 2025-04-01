'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, PackageOpen } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';

interface Subscription {
  id: string;
  status: string;
  packageName: string;
  price: number;
  currency: string;
  startDate: string;
  endDate: string;
}

export default function PaymentsPage() {
  const t = useTranslations('Dashboard.Payments');
  const locale = useLocale();
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isRTL = locale === 'ar';

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const response = await fetch('/api/subscriptions');
        if (!response.ok) throw new Error('Failed to fetch subscriptions');
        const data = await response.json();
        setSubscriptions(data);
      } catch (error) {
        console.error('Error fetching subscriptions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchSubscriptions();
    }
  }, [user]);

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
      <div className='space-y-6' dir={isRTL ? 'rtl' : 'ltr'}>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>{t('title')}</h2>
          <p className='text-muted-foreground'>{t('description')}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('subscriptions')}</CardTitle>
            <CardDescription>{t('subscriptions_description')}</CardDescription>
          </CardHeader>
          <CardContent>
            {subscriptions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className={cn(isRTL && 'text-right')}>
                      {t('package')}
                    </TableHead>
                    <TableHead className={cn(isRTL && 'text-right')}>
                      {t('status')}
                    </TableHead>
                    <TableHead className={cn(isRTL && 'text-right')}>
                      {t('price')}
                    </TableHead>
                    <TableHead className={cn(isRTL && 'text-right')}>
                      {t('date')}
                    </TableHead>
                    <TableHead className={cn(isRTL && 'text-right')}>
                      {t('endDate')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions.map((subscription) => (
                    <TableRow key={subscription.id}>
                      <TableCell
                        className={cn('font-medium', isRTL && 'text-right')}
                      >
                        {subscription.packageName}
                      </TableCell>
                      <TableCell className={cn(isRTL && 'text-right')}>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            subscription.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {subscription.status}
                        </span>
                      </TableCell>
                      <TableCell className={cn(isRTL && 'text-right')}>
                        {subscription.price} {subscription.currency}
                      </TableCell>
                      <TableCell className={cn(isRTL && 'text-right')}>
                        {new Date(subscription.startDate).toLocaleDateString(
                          locale,
                          {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          }
                        )}
                      </TableCell>
                      <TableCell className={cn(isRTL && 'text-right')}>
                        {new Date(subscription.endDate).toLocaleDateString(
                          locale,
                          {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          }
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className='flex flex-col items-center justify-center py-12 text-center'>
                <PackageOpen className='h-12 w-12 text-muted-foreground mb-4' />
                <h3 className='text-lg font-semibold'>
                  {t('no_subscriptions')}
                </h3>
                <p className='text-muted-foreground mb-4'>
                  {t('no_subscriptions_description')}
                </p>
                <Button asChild>
                  <a href='/#packages'>{t('view_packages')}</a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
