import Link from 'next/link';
import { Button } from '@/components/ui/button';
import CancelAnimation from '@/components/shared/Animations/Cancel';
import { useTranslations } from 'next-intl';

export default function CancelPayment() {
  const t = useTranslations('Home.CancelPayment'); // Access the CancelPayment translations

  return (
    <div className='min-h-screen flex flex-col justify-center items-center bg-gray-50'>
      <div className='max-w-md w-full bg-white shadow-md rounded-lg p-6'>
        <h1 className='text-2xl font-semibold text-center text-red-500'>
          {t('title')} {/* Renders "Payment Canceled" */}
        </h1>
        <p className='text-center text-gray-600 mt-4'>
          {t('content')}{' '}
          {/* Renders "Your payment was not processed. Please try again or contact support." */}
        </p>
        <div className='mt-6 flex justify-center'>
          <CancelAnimation />
        </div>
        <div className='mt-8 flex justify-center'>
          <Link href='/'>
            <Button variant='outline'>
              {t('goHome', { defaultValue: 'Go to Home' })}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
