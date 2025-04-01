'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface SubscriptionDetails {
  id: string;
  status: string;
  package: {
    package_type: string;
    package_id: string;
    price: number;
    currency: string;
  };
  packageName: string;
  price: number;
  currency: string;
  createdAt: string;
}

export default function SuccessPage() {
  const t = useTranslations('Success');
  const searchParams = useSearchParams();
  const [subscription, setSubscription] = useState<SubscriptionDetails | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const sessionId = searchParams.get('session_id');
  useEffect(() => {
    const fetchSubscriptionDetails = async () => {
      if (!sessionId) return;

      try {
        const response = await fetch(`/api/subscriptions/${sessionId}`);
        if (!response.ok) throw new Error('Failed to fetch subscription');
        const data = await response.json();
        setSubscription(data);
      } catch (error) {
        console.error('Error fetching subscription:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscriptionDetails();
  }, [sessionId]);

  return (
    <div className='min-h-screen flex flex-col items-center justify-center p-4 bg-background'>
      <div className='max-w-[600px] w-full text-center space-y-8'>
        {/* Logo */}
        <div className='mb-8'>
          <Image
            src='/images/logo/logo.png'
            alt={t('logo_alt')}
            width={150}
            height={50}
            className='mx-auto'
          />
        </div>

        {/* Success Message */}
        <div className='space-y-4'>
          <h1 className='text-4xl md:text-6xl font-bold text-primary'>
            {t('title')}
          </h1>
          <p className='text-xl md:text-2xl text-muted-foreground'>
            {t('message')}
          </p>
        </div>

        {/* Subscription Details */}
        {isLoading ? (
          <div className='flex justify-center'>
            <Loader2 className='h-8 w-8 animate-spin' />
          </div>
        ) : subscription ? (
          <div className='bg-muted p-6 rounded-lg space-y-2 text-left'>
            <h3 className='font-semibold text-lg'>
              {t('subscription_details')}
            </h3>
            <p>
              <span className='font-medium'>{t('package')}:</span>{' '}
              {subscription?.package?.package_type}
            </p>
            <p>
              <span className='font-medium'>{t('price')}:</span>{' '}
              {subscription?.package?.price} {subscription?.package?.currency}
            </p>
            <p>
              <span className='font-medium'>{t('status')}:</span>{' '}
              <span className='text-green-600 font-medium'>
                {subscription?.status}
              </span>
            </p>
          </div>
        ) : null}

        {/* Go Home Button */}
        <Button asChild size='lg' className='mt-8'>
          <Link href='/'>{t('go_home')}</Link>
        </Button>
      </div>
    </div>
  );
}
