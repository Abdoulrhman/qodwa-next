'use client';

import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  CreditCard,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface Package {
  id: number;
  title: string;
  current_price: string;
  original_price: string;
  currency: string;
  subscription_frequency: string;
  description: string;
  features: string[];
  discount: string;
  package_type: string;
}

interface EnhancedCheckoutButtonProps {
  packageData: Package;
  className?: string;
}

export default function EnhancedCheckoutButton({
  packageData,
  className,
}: EnhancedCheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [autoRenew, setAutoRenew] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const t = useTranslations('PackageDetails');
  const { data: session } = useSession();
  const locale = useLocale();
  const isRTL = locale === 'ar';

  const handleCheckout = async () => {
    if (!session) {
      // Redirect to login
      window.location.href = `/${locale}/auth/login`;
      return;
    }

    setLoading(true);

    try {
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe not loaded');
      }

      // Use the enhanced checkout API that supports auto-renewal
      const response = await fetch('/api/checkout-with-auto-renewal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [
            {
              name: `${packageData.title} - ${packageData.subscription_frequency}`,
              price: parseFloat(packageData.current_price),
              quantity: 1,
              packageId: packageData.id,
            },
          ],
          auto_renew: autoRenew,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { sessionId } = await response.json();

      const result = await stripe.redirectToCheckout({ sessionId });

      if (result.error) {
        throw new Error(result.error.message);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert(
        error instanceof Error
          ? error.message
          : 'An error occurred during checkout'
      );
    } finally {
      setLoading(false);
    }
  };

  const getSavingsAmount = () => {
    const currentPrice = parseFloat(packageData.current_price);
    const originalPrice = parseFloat(packageData.original_price);
    return originalPrice - currentPrice;
  };

  const getFrequencyText = () => {
    switch (packageData.subscription_frequency) {
      case 'monthly':
        return isRTL ? 'شهرياً' : 'Monthly';
      case 'quarterly':
        return isRTL ? 'كل 3 أشهر' : 'Every 3 months';
      case 'half-year':
        return isRTL ? 'كل 6 أشهر' : 'Every 6 months';
      case 'yearly':
        return isRTL ? 'سنوياً' : 'Yearly';
      default:
        return packageData.subscription_frequency;
    }
  };

  return (
    <Card className={cn('w-full max-w-md', className)}>
      <CardHeader>
        <CardTitle
          className={cn(
            'flex items-center justify-between',
            isRTL && 'flex-row-reverse'
          )}
        >
          <span>{packageData.title}</span>
          {packageData.discount !== '0%' && (
            <Badge variant='secondary' className='bg-green-100 text-green-800'>
              {isRTL ? 'وفر' : 'Save'} {packageData.discount}
            </Badge>
          )}
        </CardTitle>
        <CardDescription className={cn(isRTL && 'text-right')}>
          {packageData.description}
        </CardDescription>
      </CardHeader>

      <CardContent className='space-y-6'>
        {/* Pricing */}
        <div className={cn('text-center', isRTL && 'text-right')}>
          <div className='flex items-baseline justify-center gap-2'>
            <span className='text-3xl font-bold'>
              ${packageData.current_price}
            </span>
            <span className='text-muted-foreground'>
              {packageData.currency}
            </span>
          </div>

          {packageData.discount !== '0%' && (
            <div className='flex items-center justify-center gap-2 mt-2'>
              <span className='text-sm text-muted-foreground line-through'>
                ${packageData.original_price}
              </span>
              <span className='text-sm text-green-600 font-medium'>
                {isRTL ? 'وفر' : 'Save'} ${getSavingsAmount().toFixed(2)}
              </span>
            </div>
          )}

          <p className='text-sm text-muted-foreground mt-1'>
            {getFrequencyText()}
          </p>
        </div>

        {/* Features */}
        <div className='space-y-2'>
          {packageData.features.map((feature, index) => (
            <div
              key={index}
              className={cn(
                'flex items-center gap-2',
                isRTL && 'flex-row-reverse'
              )}
            >
              <CheckCircle className='h-4 w-4 text-green-600 flex-shrink-0' />
              <span className='text-sm'>{feature}</span>
            </div>
          ))}
        </div>

        {/* Auto-Renewal Option */}
        <div className='space-y-4 p-4 bg-muted/50 rounded-lg'>
          <div
            className={cn(
              'flex items-center justify-between',
              isRTL && 'flex-row-reverse'
            )}
          >
            <div
              className={cn(
                'flex items-center gap-2',
                isRTL && 'flex-row-reverse'
              )}
            >
              <RefreshCw className='h-4 w-4 text-blue-600' />
              <span className='font-medium'>
                {isRTL ? 'التجديد التلقائي' : 'Auto-Renewal'}
              </span>
            </div>
            <Switch checked={autoRenew} onCheckedChange={setAutoRenew} />
          </div>

          {autoRenew && (
            <div className='space-y-2'>
              <div className='flex items-start gap-2'>
                <CheckCircle className='h-4 w-4 text-green-600 mt-0.5 flex-shrink-0' />
                <div className='text-sm space-y-1'>
                  <p className='font-medium text-green-800'>
                    {isRTL
                      ? 'مزايا التجديد التلقائي:'
                      : 'Auto-Renewal Benefits:'}
                  </p>
                  <ul className='text-muted-foreground space-y-1'>
                    <li>
                      •{' '}
                      {isRTL ? 'لا انقطاع في التعلم' : 'Uninterrupted learning'}
                    </li>
                    <li>
                      • {isRTL ? 'نفس السعر المخفض' : 'Same discounted price'}
                    </li>
                    <li>
                      • {isRTL ? 'يمكن الإلغاء في أي وقت' : 'Cancel anytime'}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          <Button
            variant='outline'
            size='sm'
            onClick={() => setShowDetails(!showDetails)}
            className='w-full'
          >
            {showDetails
              ? isRTL
                ? 'إخفاء التفاصيل'
                : 'Hide Details'
              : isRTL
                ? 'إظهار التفاصيل'
                : 'Show Details'}
          </Button>

          {showDetails && (
            <div className='text-xs text-muted-foreground space-y-2 mt-4'>
              <div className='flex items-start gap-2'>
                <AlertTriangle className='h-3 w-3 mt-0.5 flex-shrink-0' />
                <div>
                  <p className='font-medium mb-1'>
                    {isRTL ? 'شروط التجديد التلقائي:' : 'Auto-Renewal Terms:'}
                  </p>
                  <ul className='space-y-1'>
                    <li>
                      •{' '}
                      {isRTL
                        ? 'سيتم تجديد اشتراكك تلقائياً'
                        : 'Your subscription will renew automatically'}
                    </li>
                    <li>
                      •{' '}
                      {isRTL
                        ? 'يمكنك إلغاء التجديد التلقائي في أي وقت'
                        : 'You can cancel auto-renewal anytime'}
                    </li>
                    <li>
                      •{' '}
                      {isRTL
                        ? 'ستتلقى تذكيراً قبل التجديد بـ 3 أيام'
                        : "You'll receive a reminder 3 days before renewal"}
                    </li>
                    <li>
                      •{' '}
                      {isRTL
                        ? 'أموالك محمية بضمان استرداد 30 يوماً'
                        : 'Protected by 30-day money-back guarantee'}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Checkout Button */}
        <Button
          onClick={handleCheckout}
          disabled={loading}
          className='w-full'
          size='lg'
        >
          <CreditCard className='h-4 w-4 mr-2' />
          {loading
            ? isRTL
              ? 'جاري المعالجة...'
              : 'Processing...'
            : autoRenew
              ? isRTL
                ? 'اشترك مع التجديد التلقائي'
                : 'Subscribe with Auto-Renewal'
              : isRTL
                ? 'اشترك الآن'
                : 'Subscribe Now'}
        </Button>

        {!session && (
          <p className='text-xs text-center text-muted-foreground'>
            {isRTL
              ? 'ستحتاج إلى تسجيل الدخول أو إنشاء حساب للمتابعة'
              : "You'll need to sign in or create an account to continue"}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
