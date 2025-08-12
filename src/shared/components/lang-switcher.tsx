'use client';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { useCallback } from 'react';

const LanguageSwitcher: React.FC = () => {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = useCallback(() => {
    const targetLocale = locale === 'ar' ? 'en' : 'ar';
    router.replace(pathname, { locale: targetLocale });
  }, [locale, router, pathname]);

  return (
    <p
      onClick={handleLanguageChange}
      className='language-switcher'
      style={{
        cursor: 'pointer',
      }}
    >
      {locale === 'ar' ? 'English' : 'عربي'}
    </p>
  );
};

export default LanguageSwitcher;
