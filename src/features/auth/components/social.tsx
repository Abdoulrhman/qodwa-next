'use client';

import { signIn } from 'next-auth/react';
import { FcGoogle } from 'react-icons/fc';
import { useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { getDefaultLoginRedirect } from '@/routes';
import { useLocale } from 'next-intl';

export const Social = () => {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');
  const locale = useLocale();

  const onClick = () => {
    signIn('google', {
      callbackUrl: callbackUrl || getDefaultLoginRedirect(locale),
    });
  };

  return (
    <div className='flex items-center w-full gap-x-2'>
      <Button size='lg' className='w-full' variant='outline' onClick={onClick}>
        <FcGoogle className='h-5 w-5' />
      </Button>
    </div>
  );
};
