'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import SuccessAnimation from '@/components/shared/Animations/Success';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { db } from '@/lib/db';

export default function SuccessPayment() {
  const t = useTranslations('Home.SuccessPayment');
  const searchParams = useSearchParams();
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      // Fetch subscription details
      fetch(`/api/subscriptions/${sessionId}`)
        .then((res) => res.json())
        .then((data) => {
          setSubscription(data.subscription);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching subscription:', error);
          setLoading(false);
        });
    }
  }, [searchParams]);

  return (
    <div className='min-h-screen flex flex-col justify-center items-center bg-gray-50'>
      <div className='max-w-md w-full bg-white shadow-md rounded-lg p-6'>
        <h1 className='text-2xl font-semibold text-center text-green-500'>
          {t('title')}
        </h1>
        <p className='text-center text-gray-600 mt-4'>{t('content')}</p>

        {loading ? (
          <div className='mt-6 flex justify-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900'></div>
          </div>
        ) : subscription ? (
          <div className='mt-6 space-y-4'>
            <div className='text-center'>
              <h3 className='font-semibold'>{t('subscription_details')}</h3>
              <p className='text-gray-600'>{subscription.package.name}</p>
              <p className='text-gray-600'>
                {t('subscription_status')}: {subscription.status}
              </p>
            </div>
            <div className='mt-6 flex justify-center'>
              <SuccessAnimation />
            </div>
          </div>
        ) : null}

        <div className='mt-8 flex justify-center'>
          <Link href='/'>
            <Button variant='outline'>{t('goHome')}</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
