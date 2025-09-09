'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';

export default function NotAuthorizedPage() {
  const t = useTranslations('NotAuthorized');
  const locale = useLocale();

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

        {/* Error Message */}
        <div className='space-y-4'>
          <h1 className='text-4xl md:text-6xl font-bold text-primary'>
            {t('title')}
          </h1>
          <p className='text-xl md:text-2xl text-muted-foreground'>
            {t('message')}
          </p>
        </div>

        {/* Login Button */}
        <Button asChild size='lg' className='mt-8'>
          <Link href={`/${locale}/auth/login`}>{t('login')}</Link>
        </Button>
      </div>
    </div>
  );
}
