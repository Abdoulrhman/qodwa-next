import Link from 'next/link';
import { Button } from '@/components/ui/button';
import SuccessAnimation from '@/components/shared/Animations/Success';
import { useTranslations } from 'next-intl';

export default function SuccessPayment() {
  const t = useTranslations('Home.SuccessPayment'); // Access the SuccessPayment translations

  return (
    <div className='min-h-screen flex flex-col justify-center items-center bg-gray-50'>
      <div className='max-w-md w-full bg-white shadow-md rounded-lg p-6'>
        <h1 className='text-2xl font-semibold text-center text-green-500'>
          {t('title')} {/* Renders "Payment Successful" */}
        </h1>
        <p className='text-center text-gray-600 mt-4'>
          {t('content')}{' '}
          {/* Renders "Your payment has been successfully processed. You will receive a confirmation email shortly." */}
        </p>
        <div className='mt-6 flex justify-center'>
          <SuccessAnimation />
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
