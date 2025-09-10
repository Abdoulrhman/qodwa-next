'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Home, Search, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';

// Enhanced translation data
const translations = {
  en: {
    logo_alt: 'Qodwa Logo',
    title: '404',
    subtitle: 'Oops! Page Not Found',
    message:
      'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.',
    suggestions: 'Here are some helpful links instead:',
    goHome: 'Go to Homepage',
    goBack: 'Go Back',
    searchHint: 'Try searching for what you need',
    refreshPage: 'Refresh Page',
  },
  ar: {
    logo_alt: 'شعار قدوة',
    title: '404',
    subtitle: 'عذراً! الصفحة غير موجودة',
    message:
      'الصفحة التي تبحث عنها قد تكون محذوفة أو تم تغيير اسمها أو غير متاحة مؤقتاً.',
    suggestions: 'إليك بعض الروابط المفيدة بدلاً من ذلك:',
    goHome: 'العودة إلى الصفحة الرئيسية',
    goBack: 'العودة للخلف',
    searchHint: 'جرب البحث عما تحتاجه',
    refreshPage: 'تحديث الصفحة',
  },
};

export default function NotFound() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const locale =
    typeof window !== 'undefined'
      ? window.location.pathname.split('/')[1]
      : 'en';

  const t =
    translations[locale as keyof typeof translations] || translations.en;

  const isRTL = locale === 'ar';

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(`/${locale}`);
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/20 ${isRTL ? 'rtl' : 'ltr'}`}
    >
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute top-1/4 left-1/4 w-32 h-32 bg-primary/5 rounded-full blur-3xl animate-pulse'></div>
        <div className='absolute bottom-1/4 right-1/4 w-48 h-48 bg-secondary/5 rounded-full blur-3xl animate-pulse delay-1000'></div>
      </div>

      <div className='max-w-4xl w-full text-center space-y-8 relative z-10'>
        {/* Logo */}
        <div
          className={`mb-8 transition-all duration-700 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
        >
          <Image
            src='/images/logo/logo.png'
            alt={t.logo_alt}
            width={180}
            height={60}
            className='mx-auto hover:scale-105 transition-transform duration-300'
          />
        </div>

        {/* 404 Illustration */}
        <div
          className={`flex justify-center mb-8 transition-all duration-700 delay-100 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
        >
          <div className='relative'>
            <Image
              src='/images/404.svg'
              alt='404 Error'
              width={400}
              height={300}
              className='mx-auto hover:scale-105 transition-transform duration-500'
            />
          </div>
        </div>

        {/* Error Message */}
        <div
          className={`space-y-6 transition-all duration-700 delay-200 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
        >
          <div className='space-y-4'>
            <h1 className='text-6xl md:text-8xl font-bold text-primary/80 tracking-wider animate-bounce'>
              {t.title}
            </h1>
            <h2 className='text-2xl md:text-4xl font-semibold text-foreground'>
              {t.subtitle}
            </h2>
          </div>

          <p className='text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed'>
            {t.message}
          </p>
        </div>

        {/* Action Buttons */}
        <div
          className={`space-y-6 transition-all duration-700 delay-300 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
        >
          <p className='text-sm font-medium text-muted-foreground'>
            {t.suggestions}
          </p>

          <div className='flex flex-col sm:flex-row gap-4 justify-center items-center max-w-2xl mx-auto'>
            <Button
              asChild
              size='lg'
              className='min-w-[200px] hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl'
            >
              <Link href={`/${locale}`} className='flex items-center gap-2'>
                <Home size={20} />
                {t.goHome}
              </Link>
            </Button>

            <Button
              onClick={handleGoBack}
              variant='outline'
              size='lg'
              className='min-w-[200px] hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl'
            >
              <ArrowLeft size={20} className={isRTL ? 'rotate-180' : ''} />
              {t.goBack}
            </Button>
          </div>

          <div className='flex flex-col sm:flex-row gap-3 justify-center items-center'>
            <Button
              onClick={handleRefresh}
              variant='ghost'
              size='sm'
              className='hover:scale-105 transition-all duration-300'
            >
              <RefreshCw size={16} />
              {t.refreshPage}
            </Button>
          </div>
        </div>

        {/* Footer hint */}
        <div
          className={`mt-12 transition-all duration-700 delay-400 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
        >
          <p className='text-sm text-muted-foreground/60 flex items-center justify-center gap-2'>
            <Search size={16} />
            {t.searchHint}
          </p>
        </div>
      </div>

      {/* Animated background elements */}
      <div className='fixed inset-0 pointer-events-none overflow-hidden'>
        <div className='absolute top-20 left-10 w-2 h-2 bg-primary/20 rounded-full animate-ping delay-0'></div>
        <div className='absolute top-40 right-20 w-3 h-3 bg-secondary/20 rounded-full animate-ping delay-1000'></div>
        <div className='absolute bottom-32 left-20 w-2 h-2 bg-accent/20 rounded-full animate-ping delay-2000'></div>
        <div className='absolute bottom-20 right-10 w-4 h-4 bg-primary/10 rounded-full animate-pulse'></div>
      </div>
    </div>
  );
}
