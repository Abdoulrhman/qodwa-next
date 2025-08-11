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
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  PackageOpen, 
  CreditCard,
  Calendar,
  DollarSign,
  Download,
  Eye,
  Receipt,
  TrendingUp,
  Clock
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';

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
}

interface PaymentStats {
  totalSpent: number;
  activeSubscriptions: number;
  nextPaymentDate?: string;
  nextPaymentAmount?: number;
}

export default function PaymentsPage() {
  const t = useTranslations('Dashboard.Payments');
  const locale = useLocale();
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [paymentStats, setPaymentStats] = useState<PaymentStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isRTL = locale === 'ar';

  useEffect(() => {
    const fetchPaymentData = async () => {
      try {
        setIsLoading(true);
        const [subscriptionsResponse, statsResponse] = await Promise.all([
          fetch('/api/student/subscriptions'),
          fetch('/api/student/payment-stats')
        ]);

        if (!subscriptionsResponse.ok || !statsResponse.ok) {
          throw new Error('Failed to fetch payment data');
        }

        const subscriptionsData = await subscriptionsResponse.json();
        const statsData = await statsResponse.json();

        if (subscriptionsData.success) {
          setSubscriptions(subscriptionsData.subscriptions);
        }
        if (statsData.success) {
          setPaymentStats(statsData.stats);
        }
      } catch (error) {
        console.error('Error fetching payment data:', error);
        setError('Failed to load payment information');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchPaymentData();
    }
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'expired':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className='flex h-full items-center justify-center'>
          <Loader2 className='h-8 w-8 animate-spin' />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className='space-y-6' dir={isRTL ? 'rtl' : 'ltr'}>
          <Card className='border-destructive'>
            <CardContent className='pt-6'>
              <p className='text-destructive text-center'>{error}</p>
              <div className='flex justify-center mt-4'>
                <Button onClick={() => window.location.reload()} variant='outline'>
                  {isRTL ? 'إعادة المحاولة' : 'Try Again'}
                </Button>
              </div>
            </CardContent>
          </Card>
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
            {isRTL ? 'المدفوعات والفواتير' : 'Payments & Invoices'}
          </h1>
          <p className='text-muted-foreground'>
            {isRTL 
              ? 'إدارة اشتراكاتك ومراجعة تاريخ المدفوعات'
              : 'Manage your subscriptions and review payment history'
            }
          </p>
        </div>

        {/* Payment Stats */}
        {paymentStats && (
          <div className='grid gap-4 grid-cols-1 md:grid-cols-4'>
            <Card>
              <CardContent className='pt-6'>
                <div className={cn('flex items-center gap-3', isRTL && 'flex-row-reverse')}>
                  <div className='p-2 bg-blue-100 rounded-lg dark:bg-blue-900'>
                    <DollarSign className='h-5 w-5 text-blue-600 dark:text-blue-300' />
                  </div>
                  <div className={cn(isRTL && 'text-right')}>
                    <p className='text-sm text-muted-foreground'>
                      {isRTL ? 'إجمالي المدفوعات' : 'Total Spent'}
                    </p>
                    <p className='text-2xl font-bold'>${paymentStats.totalSpent}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='pt-6'>
                <div className={cn('flex items-center gap-3', isRTL && 'flex-row-reverse')}>
                  <div className='p-2 bg-green-100 rounded-lg dark:bg-green-900'>
                    <TrendingUp className='h-5 w-5 text-green-600 dark:text-green-300' />
                  </div>
                  <div className={cn(isRTL && 'text-right')}>
                    <p className='text-sm text-muted-foreground'>
                      {isRTL ? 'الاشتراكات النشطة' : 'Active Subscriptions'}
                    </p>
                    <p className='text-2xl font-bold'>{paymentStats.activeSubscriptions}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {paymentStats.nextPaymentDate && (
              <Card>
                <CardContent className='pt-6'>
                  <div className={cn('flex items-center gap-3', isRTL && 'flex-row-reverse')}>
                    <div className='p-2 bg-orange-100 rounded-lg dark:bg-orange-900'>
                      <Calendar className='h-5 w-5 text-orange-600 dark:text-orange-300' />
                    </div>
                    <div className={cn(isRTL && 'text-right')}>
                      <p className='text-sm text-muted-foreground'>
                        {isRTL ? 'الدفعة القادمة' : 'Next Payment'}
                      </p>
                      <p className='text-lg font-bold'>{formatDate(paymentStats.nextPaymentDate)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {paymentStats.nextPaymentAmount && (
              <Card>
                <CardContent className='pt-6'>
                  <div className={cn('flex items-center gap-3', isRTL && 'flex-row-reverse')}>
                    <div className='p-2 bg-purple-100 rounded-lg dark:bg-purple-900'>
                      <Clock className='h-5 w-5 text-purple-600 dark:text-purple-300' />
                    </div>
                    <div className={cn(isRTL && 'text-right')}>
                      <p className='text-sm text-muted-foreground'>
                        {isRTL ? 'المبلغ القادم' : 'Next Amount'}
                      </p>
                      <p className='text-2xl font-bold'>${paymentStats.nextPaymentAmount}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Active Subscriptions */}
        <Card>
          <CardHeader>
            <CardTitle className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
              <CreditCard className='h-5 w-5' />
              {isRTL ? 'الاشتراكات النشطة' : 'Active Subscriptions'}
            </CardTitle>
            <CardDescription>
              {isRTL 
                ? 'إدارة باقات التعليم الخاصة بك'
                : 'Manage your learning packages and subscriptions'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {subscriptions.length > 0 ? (
              <div className='space-y-4'>
                {subscriptions.map((subscription) => (
                  <Card key={subscription.id} className='border-l-4 border-l-primary'>
                    <CardContent className='pt-6'>
                      <div className={cn('flex items-center justify-between', isRTL && 'flex-row-reverse')}>
                        <div className={cn('flex items-center gap-4', isRTL && 'flex-row-reverse')}>
                          <div className='p-3 bg-primary/10 rounded-lg'>
                            <PackageOpen className='h-6 w-6 text-primary' />
                          </div>
                          <div className={cn(isRTL && 'text-right')}>
                            <h3 className='font-semibold text-lg'>{subscription.packageName}</h3>
                            <p className='text-sm text-muted-foreground'>
                              {subscription.price} {subscription.currency} 
                              {subscription.autoRenew && (
                                <span className='ml-2'>
                                  • {isRTL ? 'تجديد تلقائي' : 'Auto-renew'}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        
                        <div className={cn('flex items-center gap-3', isRTL && 'flex-row-reverse')}>
                          <Badge className={getStatusColor(subscription.status)}>
                            {subscription.status === 'active' && (isRTL ? 'نشط' : 'Active')}
                            {subscription.status === 'expired' && (isRTL ? 'منتهي' : 'Expired')}
                            {subscription.status === 'pending' && (isRTL ? 'معلق' : 'Pending')}
                            {subscription.status === 'cancelled' && (isRTL ? 'ملغي' : 'Cancelled')}
                          </Badge>
                          
                          <div className={cn('text-right text-sm', isRTL && 'text-left')}>
                            <div className='font-medium'>
                              {formatDate(subscription.startDate)} - {formatDate(subscription.endDate)}
                            </div>
                            <div className='text-muted-foreground'>
                              {subscription.paymentMethod}
                            </div>
                          </div>
                          
                          <div className='flex gap-2'>
                            {subscription.invoiceUrl && (
                              <Button size='sm' variant='outline' asChild>
                                <a href={subscription.invoiceUrl} target='_blank' rel='noopener noreferrer'>
                                  <Download className='h-4 w-4' />
                                </a>
                              </Button>
                            )}
                            
                            <Button size='sm' variant='outline'>
                              <Eye className='h-4 w-4' />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className='flex flex-col items-center justify-center py-12 text-center'>
                <Receipt className='h-12 w-12 text-muted-foreground mb-4' />
                <h3 className='text-lg font-semibold mb-2'>
                  {isRTL ? 'لا توجد اشتراكات' : 'No Subscriptions'}
                </h3>
                <p className='text-muted-foreground mb-4'>
                  {isRTL 
                    ? 'لم تقم بالاشتراك في أي باقة تعليمية بعد'
                    : 'You haven\'t subscribed to any learning packages yet'
                  }
                </p>
                <Button asChild>
                  <a href='/#packages'>
                    {isRTL ? 'تصفح الباقات' : 'Browse Packages'}
                  </a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment History Table */}
        {subscriptions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
                <Receipt className='h-5 w-5' />
                {isRTL ? 'تاريخ المدفوعات' : 'Payment History'}
              </CardTitle>
              <CardDescription>
                {isRTL 
                  ? 'جميع المعاملات والفواتير السابقة'
                  : 'All your past transactions and invoices'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='rounded-md border'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className={cn(isRTL && 'text-right')}>
                        {isRTL ? 'الباقة' : 'Package'}
                      </TableHead>
                      <TableHead className={cn(isRTL && 'text-right')}>
                        {isRTL ? 'الحالة' : 'Status'}
                      </TableHead>
                      <TableHead className={cn(isRTL && 'text-right')}>
                        {isRTL ? 'المبلغ' : 'Amount'}
                      </TableHead>
                      <TableHead className={cn(isRTL && 'text-right')}>
                        {isRTL ? 'تاريخ البدء' : 'Start Date'}
                      </TableHead>
                      <TableHead className={cn(isRTL && 'text-right')}>
                        {isRTL ? 'تاريخ الانتهاء' : 'End Date'}
                      </TableHead>
                      <TableHead className={cn(isRTL && 'text-right')}>
                        {isRTL ? 'الإجراءات' : 'Actions'}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscriptions.map((subscription) => (
                      <TableRow key={subscription.id}>
                        <TableCell className={cn('font-medium', isRTL && 'text-right')}>
                          {subscription.packageName}
                        </TableCell>
                        <TableCell className={cn(isRTL && 'text-right')}>
                          <Badge className={getStatusColor(subscription.status)}>
                            {subscription.status === 'active' && (isRTL ? 'نشط' : 'Active')}
                            {subscription.status === 'expired' && (isRTL ? 'منتهي' : 'Expired')}
                            {subscription.status === 'pending' && (isRTL ? 'معلق' : 'Pending')}
                            {subscription.status === 'cancelled' && (isRTL ? 'ملغي' : 'Cancelled')}
                          </Badge>
                        </TableCell>
                        <TableCell className={cn(isRTL && 'text-right')}>
                          {subscription.price} {subscription.currency}
                        </TableCell>
                        <TableCell className={cn(isRTL && 'text-right')}>
                          {formatDate(subscription.startDate)}
                        </TableCell>
                        <TableCell className={cn(isRTL && 'text-right')}>
                          {formatDate(subscription.endDate)}
                        </TableCell>
                        <TableCell className={cn(isRTL && 'text-right')}>
                          <div className='flex gap-2'>
                            {subscription.invoiceUrl && (
                              <Button size='sm' variant='ghost' asChild>
                                <a href={subscription.invoiceUrl} target='_blank' rel='noopener noreferrer'>
                                  <Download className='h-4 w-4' />
                                </a>
                              </Button>
                            )}
                            <Button size='sm' variant='ghost'>
                              <Eye className='h-4 w-4' />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
