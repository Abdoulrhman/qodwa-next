'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { CreditCard, Plus, Trash2, Check, AlertTriangle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { cn } from '@/lib/utils';
import StripeAddPaymentMethod from './stripe-add-payment-method';

interface PaymentMethod {
  id: string;
  stripePaymentMethodId: string;
  type: string;
  last4: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
  isActive: boolean;
}

interface Subscription {
  id: string;
  packageName: string;
  autoRenew: boolean;
  nextBillingDate?: string;
  status: 'active' | 'expired' | 'pending' | 'cancelled';
}

interface AutoRenewManagementProps {
  className?: string;
}

export default function AutoRenewManagement({
  className,
}: AutoRenewManagementProps) {
  const t = useTranslations('Dashboard.AutoRenewal');
  const locale = useLocale();
  const isRTL = locale === 'ar';

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddPaymentDialog, setShowAddPaymentDialog] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [paymentMethodsRes, subscriptionsRes] = await Promise.all([
        fetch('/api/payment-methods'),
        fetch('/api/student/subscriptions'),
      ]);

      if (!paymentMethodsRes.ok || !subscriptionsRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const [paymentMethodsData, subscriptionsData] = await Promise.all([
        paymentMethodsRes.json(),
        subscriptionsRes.json(),
      ]);

      if (paymentMethodsData.success) {
        setPaymentMethods(paymentMethodsData.paymentMethods);
      }

      if (subscriptionsData.success) {
        setSubscriptions(subscriptionsData.subscriptions);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch('/api/payment-methods');
      if (!response.ok) {
        throw new Error('Failed to fetch payment methods');
      }
      const data = await response.json();
      if (data.success) {
        setPaymentMethods(data.paymentMethods);
      }
    } catch (error) {
      console.error('Failed to fetch payment methods:', error);
    }
  };  const toggleAutoRenewal = async (
    subscriptionId: string,
    enabled: boolean
  ) => {
    try {
      const response = await fetch(
        `/api/subscriptions/${subscriptionId}/auto-renewal`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ enabled }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update auto-renewal');
      }

      // Update local state
      setSubscriptions((subs) =>
        subs.map((sub) =>
          sub.id === subscriptionId ? { ...sub, autoRenew: enabled } : sub
        )
      );
    } catch (error) {
      console.error('Error updating auto-renewal:', error);
      setError('Failed to update auto-renewal setting');
    }
  };

  const removePaymentMethod = async (paymentMethodId: string) => {
    try {
      const response = await fetch('/api/payment-methods', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_method_id: paymentMethodId }),
      });

      if (!response.ok) {
        throw new Error('Failed to remove payment method');
      }

      // Update local state
      setPaymentMethods((methods) =>
        methods.filter(
          (method) => method.stripePaymentMethodId !== paymentMethodId
        )
      );
    } catch (error) {
      console.error('Error removing payment method:', error);
      setError('Failed to remove payment method');
    }
  };

  const setDefaultPaymentMethod = async (paymentMethodId: string) => {
    try {
      const response = await fetch('/api/payment-methods', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          payment_method_id: paymentMethodId,
          action: 'set_default'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to set default payment method');
      }

      // Update local state - set all to false, then set the selected one to true
      setPaymentMethods((methods) =>
        methods.map((method) => ({
          ...method,
          isDefault: method.stripePaymentMethodId === paymentMethodId,
        }))
      );
    } catch (error) {
      console.error('Error setting default payment method:', error);
      setError('Failed to set default payment method');
    }
  };

  const addPaymentMethod = async () => {
    // This will be handled by the StripeAddPaymentMethod component
    await fetchData(); // Refresh the payment methods list
  };

  if (isLoading) {
    return (
      <div className={cn('space-y-6', className)}>
        <div className='animate-pulse'>
          <Card>
            <CardHeader>
              <div className='h-6 bg-gray-200 rounded w-1/3'></div>
              <div className='h-4 bg-gray-200 rounded w-2/3'></div>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div className='h-20 bg-gray-200 rounded'></div>
                <div className='h-20 bg-gray-200 rounded'></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {error && (
        <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
          <div className='flex items-center gap-2'>
            <AlertTriangle className='h-5 w-5 text-red-600' />
            <p className='text-red-800'>{error}</p>
          </div>
        </div>
      )}

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle
            className={cn(
              'flex items-center gap-2',
              isRTL && 'flex-row-reverse'
            )}
          >
            <CreditCard className='h-5 w-5' />
            {isRTL ? 'طرق الدفع المحفوظة' : 'Saved Payment Methods'}
          </CardTitle>
          <CardDescription>
            {isRTL
              ? 'إدارة طرق الدفع للتجديد التلقائي'
              : 'Manage payment methods for auto-renewal'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {paymentMethods.length > 0 ? (
            <div className='space-y-4'>
              <div className="flex justify-end mb-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowAddPaymentDialog(true)}
                >
                  <Plus className='h-4 w-4 mr-2' />
                  {isRTL ? 'إضافة بطاقة أخرى' : 'Add Another Card'}
                </Button>
              </div>
              
              {showAddPaymentDialog && (
                <StripeAddPaymentMethod 
                  isOpen={showAddPaymentDialog}
                  onClose={() => setShowAddPaymentDialog(false)}
                  onSuccess={() => {
                    setShowAddPaymentDialog(false);
                    fetchPaymentMethods();
                  }}
                  isRTL={isRTL}
                />
              )}
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className={cn(
                    'flex items-center justify-between p-4 border rounded-lg',
                    isRTL && 'flex-row-reverse'
                  )}
                >
                  <div
                    className={cn(
                      'flex items-center gap-3',
                      isRTL && 'flex-row-reverse'
                    )}
                  >
                    <span className='text-2xl'>
                      💳
                    </span>
                    <div className={cn(isRTL && 'text-right')}>
                      <p className='font-medium'>
                        {method.brand.toUpperCase()} •••• {method.last4}
                      </p>
                      <p className='text-sm text-muted-foreground'>
                        {isRTL ? 'ينتهي في' : 'Expires'}{' '}
                        {method.expiryMonth.toString().padStart(2, '0')}/
                        {method.expiryYear}
                      </p>
                    </div>
                    {method.isDefault && (
                      <Badge variant='secondary'>
                        {isRTL ? 'افتراضي' : 'Default'}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {!method.isDefault && (
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => setDefaultPaymentMethod(method.stripePaymentMethodId)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        {isRTL ? 'تعيين كافتراضي' : 'Set as Default'}
                      </Button>
                    )}
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() =>
                        removePaymentMethod(method.stripePaymentMethodId)
                      }
                      className='text-red-600 hover:text-red-700'
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='text-center py-8'>
              <CreditCard className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
              <h3 className='text-lg font-semibold mb-2'>
                {isRTL ? 'لا توجد طرق دفع محفوظة' : 'No Payment Methods'}
              </h3>
              <p className='text-muted-foreground mb-4'>
                {isRTL
                  ? 'أضف طريقة دفع لتمكين التجديد التلقائي'
                  : 'Add a payment method to enable auto-renewal'}
              </p>
              <Button onClick={() => setShowAddPaymentDialog(true)}>
                <Plus className='h-4 w-4 mr-2' />
                {isRTL ? 'إضافة طريقة دفع' : 'Add Payment Method'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Auto-Renewal Settings */}
      <Card>
        <CardHeader>
          <CardTitle
            className={cn(
              'flex items-center gap-2',
              isRTL && 'flex-row-reverse'
            )}
          >
            <Check className='h-5 w-5' />
            {isRTL ? 'إعدادات التجديد التلقائي' : 'Auto-Renewal Settings'}
          </CardTitle>
          <CardDescription>
            {isRTL
              ? 'تحكم في التجديد التلقائي لكل اشتراك'
              : 'Control auto-renewal for each subscription'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {subscriptions.length > 0 ? (
            <div className='space-y-4'>
              {subscriptions
                .filter((sub) => sub.status === 'active')
                .map((subscription) => (
                  <div
                    key={subscription.id}
                    className={cn(
                      'flex items-center justify-between p-4 border rounded-lg',
                      isRTL && 'flex-row-reverse'
                    )}
                  >
                    <div className={cn(isRTL && 'text-right')}>
                      <h3 className='font-medium'>
                        {subscription.packageName}
                      </h3>
                      {subscription.nextBillingDate && (
                        <p className='text-sm text-muted-foreground'>
                          {isRTL ? 'التجديد القادم:' : 'Next renewal:'}{' '}
                          {new Date(
                            subscription.nextBillingDate
                          ).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div
                      className={cn(
                        'flex items-center gap-3',
                        isRTL && 'flex-row-reverse'
                      )}
                    >
                      <span className='text-sm text-muted-foreground'>
                        {isRTL ? 'تجديد تلقائي' : 'Auto-renewal'}
                      </span>
                      <Switch
                        checked={subscription.autoRenew}
                        onCheckedChange={(checked) =>
                          toggleAutoRenewal(subscription.id, checked)
                        }
                        disabled={paymentMethods.length === 0}
                      />
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className='text-center py-8'>
              <p className='text-muted-foreground'>
                {isRTL ? 'لا توجد اشتراكات نشطة' : 'No active subscriptions'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {paymentMethods.length === 0 && (
        <div className='bg-amber-50 border border-amber-200 rounded-lg p-4'>
          <div className='flex items-start gap-3'>
            <AlertTriangle className='h-5 w-5 text-amber-600 mt-0.5' />
            <div>
              <h3 className='font-medium text-amber-800'>
                {isRTL ? 'مطلوب طريقة دفع' : 'Payment Method Required'}
              </h3>
              <p className='text-amber-700 text-sm mt-1'>
                {isRTL
                  ? 'لتمكين التجديد التلقائي، يجب إضافة طريقة دفع صالحة أولاً.'
                  : 'To enable auto-renewal, you need to add a valid payment method first.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
