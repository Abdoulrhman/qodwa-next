'use client';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MdLanguage } from 'react-icons/md';

const LanguageSwitcher: React.FC = () => {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [currentLocale, setCurrentLocale] = useState<string>('en');

  // Fallback to get locale from URL params if useLocale fails
  useEffect(() => {
    if (locale) {
      setCurrentLocale(locale);
    } else if (params?.locale) {
      setCurrentLocale(params.locale as string);
    }
  }, [locale, params?.locale]);

  const handleLanguageChange = useCallback(() => {
    const targetLocale = currentLocale === 'ar' ? 'en' : 'ar';
    router.replace(pathname, { locale: targetLocale });
  }, [currentLocale, router, pathname]);

  return (
    <Button
      variant='ghost'
      size='sm'
      onClick={handleLanguageChange}
      className={cn(
        'h-9 w-9 p-0',
        'flex items-center justify-center',
        'transition-all duration-200 ease-in-out',
        'hover:bg-accent hover:scale-110',
        'border border-transparent hover:border-border',
        'rounded-full'
      )}
      title={currentLocale === 'ar' ? 'Switch to English' : 'التبديل للعربية'}
    >
      <span className='text-xl leading-none'>
        <MdLanguage />
      </span>
    </Button>
  );
};

export default LanguageSwitcher;
