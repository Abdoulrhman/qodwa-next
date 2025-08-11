'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, Package, Calendar, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';
import HomePackages from '@/app/[locale]/home/sections/packages';

interface Subscription {
  id: string;
  status: 'active' | 'expired' | 'pending' | 'cancelled';
  packageName: string;
  price: number;
  currency: string;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  paymentMethod: string;
  invoiceUrl?: string;
  remainingClasses?: number;
  totalClasses?: number;
  nextClassDate?: string;
}

export default function MyPackagesPage() {
  const t = useTranslations('Dashboard');
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const { user } = useAuth();

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);

      // Fetch subscriptions
      const subscriptionsResponse = await fetch('/api/student/subscriptions');

      if (subscriptionsResponse.ok) {
        const subscriptionsResult = await subscriptionsResponse.json();
        if (subscriptionsResult.success) {
          setSubscriptions(subscriptionsResult.subscriptions || []);
        }
      }
    } catch (err) {
      setError('An error occurred while loading subscription data');
      console.error('Error fetching subscription data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'expired':
        return 'bg-red-500';
      case 'cancelled':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    if (isRTL) {
      switch (status.toLowerCase()) {
        case 'active':
          return 'نشط';
        case 'pending':
          return 'في الانتظار';
        case 'expired':
          return 'منتهي الصلاحية';
        case 'cancelled':
          return 'ملغي';
        default:
          return status;
      }
    } else {
      return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    }
  };

  const formatFrequency = (frequency: string) => {
    if (isRTL) {
      switch (frequency.toLowerCase()) {
        case 'monthly':
          return 'شهرياً';
        case 'quarterly':
          return 'ربع سنوي';
        case 'half-year':
          return 'نصف سنوي';
        case 'yearly':
          return 'سنوياً';
        default:
          return frequency;
      }
    }
    return frequency;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };

    return date.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', options);
  };

  const calculateProgress = (remaining: number, total: number) => {
    if (total === 0) return 0;
    const used = total - remaining;
    return (used / total) * 100;
  };

  if (loading) {
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
        {/* Page Header */}
        <div className={cn('space-y-2', isRTL && 'text-right')}>
          <h1 className='text-3xl font-bold'>
            {isRTL ? 'باقاتي' : 'My Packages'}
          </h1>
          <p className='text-muted-foreground'>
            {isRTL
              ? 'تفاصيل اشتراكاتك والحصص المتبقية'
              : 'Your subscription details and remaining classes'}
          </p>
        </div>

        {error && (
          <Card className='border-destructive'>
            <CardContent className='pt-6'>
              <p className='text-destructive text-center'>{error}</p>
              <div className='flex justify-center mt-4'>
                <Button onClick={fetchSubscriptions} variant='outline'>
                  {isRTL ? 'إعادة المحاولة' : 'Try Again'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Subscriptions */}
        {subscriptions.length > 0 && (
          <div className='space-y-4'>
            <h2 className={cn('text-xl font-semibold', isRTL && 'text-right')}>
              {isRTL ? 'اشتراكاتي النشطة' : 'My Active Subscriptions'}
            </h2>
            {subscriptions.map((subscription) => (
              <Card key={subscription.id} className='overflow-hidden'>
                <CardHeader className='pb-3'>
                  <div
                    className={cn(
                      'flex items-start justify-between',
                      isRTL && 'flex-row-reverse'
                    )}
                  >
                    <div className={cn('space-y-1', isRTL && 'text-right')}>
                      <CardTitle className='text-xl'>
                        {subscription.packageName}
                      </CardTitle>
                      <CardDescription>
                        {isRTL
                          ? 'باقة تعليمية متكاملة'
                          : 'Comprehensive learning package'}
                      </CardDescription>
                    </div>
                    <div
                      className={cn(
                        'flex items-center gap-2',
                        isRTL && 'flex-row-reverse'
                      )}
                    >
                      <Badge
                        variant='secondary'
                        className={cn(
                          'text-white',
                          getStatusColor(subscription.status)
                        )}
                      >
                        {getStatusText(subscription.status)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className='space-y-4'>
                  {/* Subscription Info */}
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    <div className={cn('space-y-1', isRTL && 'text-right')}>
                      <p className='text-sm font-medium text-muted-foreground'>
                        {isRTL ? 'تاريخ البدء' : 'Start Date'}
                      </p>
                      <p className='text-sm'>
                        {formatDate(subscription.startDate)}
                      </p>
                    </div>

                    {subscription.endDate && (
                      <div className={cn('space-y-1', isRTL && 'text-right')}>
                        <p className='text-sm font-medium text-muted-foreground'>
                          {isRTL ? 'تاريخ الانتهاء' : 'End Date'}
                        </p>
                        <p className='text-sm'>
                          {formatDate(subscription.endDate)}
                        </p>
                      </div>
                    )}

                    <div className={cn('space-y-1', isRTL && 'text-right')}>
                      <p className='text-sm font-medium text-muted-foreground'>
                        {isRTL ? 'السعر' : 'Price'}
                      </p>
                      <div
                        className={cn(
                          'flex items-center gap-2',
                          isRTL && 'flex-row-reverse'
                        )}
                      >
                        <span className='text-sm font-semibold'>
                          {subscription.price} {subscription.currency}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Progress */}
                  {subscription.remainingClasses !== undefined &&
                    subscription.totalClasses && (
                      <div className='space-y-2'>
                        <div
                          className={cn(
                            'flex justify-between items-center',
                            isRTL && 'flex-row-reverse'
                          )}
                        >
                          <span className='text-sm font-medium'>
                            {isRTL ? 'تقدم الحصص' : 'Class Progress'}
                          </span>
                          <span className='text-sm text-muted-foreground'>
                            {subscription.remainingClasses}{' '}
                            {isRTL ? 'متبقي من' : 'remaining of'}{' '}
                            {subscription.totalClasses}
                          </span>
                        </div>
                        <Progress
                          value={calculateProgress(
                            subscription.remainingClasses,
                            subscription.totalClasses
                          )}
                          className='h-2'
                        />
                      </div>
                    )}

                  {/* Next Class */}
                  {subscription.nextClassDate &&
                    subscription.status === 'active' && (
                      <div
                        className={cn(
                          'flex items-center gap-2 p-3 bg-muted rounded-lg',
                          isRTL && 'flex-row-reverse'
                        )}
                      >
                        <Calendar className='h-4 w-4 text-muted-foreground' />
                        <span className='text-sm'>
                          {isRTL ? 'الحصة التالية:' : 'Next class:'}{' '}
                          {formatDate(subscription.nextClassDate)}
                        </span>
                      </div>
                    )}

                  {/* Actions */}
                  <div
                    className={cn(
                      'flex gap-2 pt-2',
                      isRTL && 'flex-row-reverse'
                    )}
                  >
                    {subscription.status === 'active' && (
                      <>
                        <Button size='sm'>
                          <Calendar className='h-4 w-4 mr-2' />
                          {isRTL ? 'جدولة حصة' : 'Schedule Class'}
                        </Button>
                        <Button size='sm' variant='outline'>
                          <RefreshCw className='h-4 w-4 mr-2' />
                          {isRTL ? 'تجديد الاشتراك' : 'Renew'}
                        </Button>
                      </>
                    )}

                    {subscription.status === 'expired' && (
                      <Button size='sm'>
                        <RefreshCw className='h-4 w-4 mr-2' />
                        {isRTL ? 'إعادة الاشتراك' : 'Resubscribe'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Available Packages - Show when no subscriptions */}
        {subscriptions.length === 0 && !loading && (
          <div className='space-y-6'>
            <div className={cn('text-center space-y-2', isRTL && 'text-right')}>
              <h2 className='text-2xl font-bold'>
                {isRTL
                  ? 'اختر الباقة المناسبة لك'
                  : 'Choose Your Perfect Package'}
              </h2>
              <p className='text-muted-foreground'>
                {isRTL
                  ? 'ابدأ رحلتك التعليمية مع أفضل الباقات المتاحة'
                  : 'Start your learning journey with our best available packages'}
              </p>
            </div>

            {/* Use the existing HomePackages component */}
            <HomePackages />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
