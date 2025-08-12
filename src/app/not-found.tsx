'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

// Sample translation data
const translations = {
  en: {
    logo_alt: 'Company Logo',
    title: 'Page Not Found',
    message: 'The page you are looking for does not exist.',
    goHome: 'Go to Homepage',
  },
  ar: {
    logo_alt: 'شعار الشركة',
    title: 'الصفحة غير موجودة',
    message: 'الصفحة التي تبحث عنها غير موجودة.',
    goHome: 'العودة إلى الصفحة الرئيسية',
  },
};

export default function NotFound() {
  const router = useRouter();
  const locale =
    typeof window !== 'undefined'
      ? window.location.pathname.split('/')[1]
      : 'en';

  const t =
    translations[locale as keyof typeof translations] || translations.en;

  return (
    <div className='min-h-screen flex flex-col items-center justify-center p-4 bg-background'>
      <div className='max-w-[600px] w-full text-center space-y-8'>
        {/* Logo */}
        <div className='mb-8'>
          <Image
            src='/images/logo/logo.png'
            alt={t.logo_alt}
            width={150}
            height={50}
            className='mx-auto'
          />
        </div>

        {/* Error Message */}
        <div className='space-y-4'>
          <h1 className='text-4xl md:text-6xl font-bold text-primary'>
            {t.title}
          </h1>
          <p className='text-xl md:text-2xl text-muted-foreground'>
            {t.message}
          </p>
        </div>

        {/* Go Home Button */}
        <Button asChild size='lg' className='mt-8'>
          <Link href={`/${locale}`}>{t.goHome}</Link>
        </Button>
      </div>
    </div>
  );
}
