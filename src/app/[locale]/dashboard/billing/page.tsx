'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  CreditCard,
  Calendar,
  DollarSign,
  Eye,
  Download,
  Plus,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

interface PaymentMethod {
  id: string;
  type: string;
  last4: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
  isActive: boolean;
}

interface PaymentHistory {
  id: string;
  amount: number;
  currency: string;
  status: string;
  description: string;
  processedAt: string;
  subscription: {
    package: {
      title: string;
    };
  };
}

interface Subscription {
  id: string;
  status: string;
  auto_renew: boolean;
  next_billing_date: string;
  package: {
    title: string;
    current_price: string;
    subscription_frequency: string;
  };
}

export default function StudentBillingPage() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      setLoading(true);

      // Fetch payment methods
      const paymentMethodsResponse = await fetch(
        '/api/student/payment-methods'
      );
      if (paymentMethodsResponse.ok) {
        const paymentMethodsData = await paymentMethodsResponse.json();
        setPaymentMethods(paymentMethodsData.paymentMethods || []);
      }

      // Fetch payment history
      const paymentHistoryResponse = await fetch(
        '/api/student/payment-history'
      );
      if (paymentHistoryResponse.ok) {
        const paymentHistoryData = await paymentHistoryResponse.json();
        setPaymentHistory(paymentHistoryData.payments || []);
      }

      // Fetch dashboard data to get subscriptions
      const dashboardResponse = await fetch('/api/student/dashboard');
      if (dashboardResponse.ok) {
        const dashboardData = await dashboardResponse.json();
        setSubscriptions(dashboardData.subscriptions || []);
      }
    } catch (error) {
      console.error('Error fetching billing data:', error);
      toast.error('Failed to load billing information');
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefaultPaymentMethod = async (paymentMethodId: string) => {
    try {
      const response = await fetch('/api/student/payment-methods/set-default', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentMethodId }),
      });

      if (response.ok) {
        // Update the local state
        setPaymentMethods((methods) =>
          methods.map((method) => ({
            ...method,
            isDefault: method.id === paymentMethodId,
          }))
        );
        toast.success('Default payment method updated');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to set default payment method');
      }
    } catch (error) {
      console.error('Error setting default payment method:', error);
      toast.error('Failed to set default payment method');
    }
  };

  const handleRemovePaymentMethod = async (paymentMethodId: string) => {
    if (!confirm('Are you sure you want to remove this payment method?')) {
      return;
    }

    try {
      const response = await fetch(
        `/api/student/payment-methods/${paymentMethodId}`,
        {
          method: 'DELETE',
        }
      );

      if (response.ok) {
        // Update the local state
        setPaymentMethods((methods) =>
          methods.filter((method) => method.id !== paymentMethodId)
        );
        toast.success('Payment method removed');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to remove payment method');
      }
    } catch (error) {
      console.error('Error removing payment method:', error);
      toast.error('Failed to remove payment method');
    }
  };

  const toggleAutoRenewal = async (
    subscriptionId: string,
    autoRenew: boolean
  ) => {
    // Mock implementation - in real app this would call the API
    setSubscriptions((subs) =>
      subs.map((sub) =>
        sub.id === subscriptionId ? { ...sub, auto_renew: !autoRenew } : sub
      )
    );
    toast.success(`Auto-renewal ${!autoRenew ? 'enabled' : 'disabled'}`);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'succeeded':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className='container mx-auto py-6'>
        <div className='animate-pulse space-y-4'>
          <div className='h-8 bg-gray-200 rounded w-1/4'></div>
          <div className='grid gap-4 md:grid-cols-2'>
            <div className='h-48 bg-gray-200 rounded'></div>
            <div className='h-48 bg-gray-200 rounded'></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto py-6 space-y-6'>
      <div className='flex justify-between items-center'>
        <h1 className='text-3xl font-bold'>Billing & Payments</h1>
        <Button
          onClick={() =>
            (window.location.href = '/dashboard/payments/add-card')
          }
        >
          <Plus className='w-4 h-4 mr-2' />
          Add Payment Method
        </Button>
      </div>

      {/* Active Subscriptions */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Calendar className='w-5 h-5' />
            Active Subscriptions
          </CardTitle>
          <CardDescription>
            Manage your subscription billing and auto-renewal settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {subscriptions.length === 0 ? (
            <p className='text-gray-500 text-center py-4'>
              No active subscriptions
            </p>
          ) : (
            <div className='space-y-4'>
              {subscriptions.map((subscription) => (
                <div key={subscription.id} className='border rounded-lg p-4'>
                  <div className='flex justify-between items-start'>
                    <div>
                      <h3 className='font-semibold'>
                        {subscription.package.title}
                      </h3>
                      <p className='text-sm text-gray-600'>
                        ${subscription.package.current_price} /{' '}
                        {subscription.package.subscription_frequency}
                      </p>
                      <p className='text-sm text-gray-500'>
                        Next billing:{' '}
                        {formatDate(subscription.next_billing_date)}
                      </p>
                    </div>
                    <div className='flex flex-col gap-2'>
                      <Badge
                        variant={
                          subscription.status === 'ACTIVE'
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {subscription.status}
                      </Badge>
                      <Button
                        variant={
                          subscription.auto_renew ? 'destructive' : 'default'
                        }
                        size='sm'
                        onClick={() =>
                          toggleAutoRenewal(
                            subscription.id,
                            subscription.auto_renew
                          )
                        }
                      >
                        {subscription.auto_renew
                          ? 'Disable Auto-Renewal'
                          : 'Enable Auto-Renewal'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className='grid gap-6 md:grid-cols-2'>
        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <CreditCard className='w-5 h-5' />
              Payment Methods
            </CardTitle>
            <CardDescription>Manage your saved payment methods</CardDescription>
          </CardHeader>
          <CardContent>
            {paymentMethods.length === 0 ? (
              <div className='text-center py-6'>
                <CreditCard className='w-12 h-12 mx-auto text-gray-400 mb-4' />
                <p className='text-gray-500 mb-4'>No payment methods saved</p>
                <Button
                  onClick={() =>
                    (window.location.href = '/dashboard/payments/add-card')
                  }
                >
                  Add Your First Card
                </Button>
              </div>
            ) : (
              <div className='space-y-3'>
                {paymentMethods.map((method) => (
                  <div key={method.id} className='border rounded-lg p-3'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-3'>
                        <CreditCard className='w-8 h-8 text-gray-400' />
                        <div>
                          <p className='font-medium'>
                            {method.brand.toUpperCase()} •••• {method.last4}
                          </p>
                          <p className='text-sm text-gray-500'>
                            Expires {method.expiryMonth}/{method.expiryYear}
                          </p>
                        </div>
                      </div>
                      <div className='flex items-center gap-2'>
                        {method.isDefault && (
                          <Badge variant='secondary' className='text-xs'>
                            Default
                          </Badge>
                        )}
                        {!method.isDefault && (
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() =>
                              handleSetDefaultPaymentMethod(method.id)
                            }
                          >
                            Set Default
                          </Button>
                        )}
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => handleRemovePaymentMethod(method.id)}
                        >
                          <Trash2 className='w-4 h-4' />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Billing Summary */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <DollarSign className='w-5 h-5' />
              Billing Summary
            </CardTitle>
            <CardDescription>Your payment overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='flex justify-between items-center'>
                <span className='text-sm text-gray-600'>Total Payments</span>
                <span className='font-semibold'>{paymentHistory.length}</span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-sm text-gray-600'>This Month</span>
                <span className='font-semibold'>
                  $
                  {paymentHistory
                    .filter((payment) => {
                      const paymentDate = new Date(payment.processedAt);
                      const currentMonth = new Date().getMonth();
                      return (
                        paymentDate.getMonth() === currentMonth &&
                        payment.status === 'SUCCEEDED'
                      );
                    })
                    .reduce((total, payment) => total + payment.amount, 0)
                    .toFixed(2)}
                </span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-sm text-gray-600'>
                  Active Subscriptions
                </span>
                <span className='font-semibold'>
                  {
                    subscriptions.filter((sub) => sub.status === 'ACTIVE')
                      .length
                  }
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Eye className='w-5 h-5' />
            Payment History
          </CardTitle>
          <CardDescription>View all your past transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {paymentHistory.length === 0 ? (
            <p className='text-gray-500 text-center py-4'>
              No payment history available
            </p>
          ) : (
            <div className='space-y-3'>
              {paymentHistory.map((payment) => (
                <div key={payment.id} className='border rounded-lg p-4'>
                  <div className='flex justify-between items-start'>
                    <div>
                      <p className='font-medium'>{payment.description}</p>
                      <p className='text-sm text-gray-600'>
                        {payment.subscription?.package?.title}
                      </p>
                      <p className='text-sm text-gray-500'>
                        {formatDate(payment.processedAt)}
                      </p>
                    </div>
                    <div className='text-right'>
                      <p className='font-semibold'>
                        ${payment.amount.toFixed(2)}{' '}
                        {payment.currency.toUpperCase()}
                      </p>
                      <Badge className={getStatusColor(payment.status)}>
                        {payment.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
