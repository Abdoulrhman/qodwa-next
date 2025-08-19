'use client';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

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
    <p
      onClick={handleLanguageChange}
      className='language-switcher'
      style={{
        cursor: 'pointer',
      }}
    >
      {currentLocale === 'ar' ? 'English' : 'عربي'}
    </p>
  );
};

export default LanguageSwitcher;
