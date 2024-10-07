'use client';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/router';
import { useCallback } from 'react';

const LanguageSwitcher: React.FC = () => {
  const locale = useLocale();

  // Handle language change with a full page refresh
  const handleLanguageChange = useCallback(() => {
    const targetLocale = locale === 'ar' ? 'en' : 'ar';
    window.location.href = `/${targetLocale}`;
  }, [locale]);

  return (
    <p onClick={handleLanguageChange} className='language-switcher' style={{
        cursor: 'pointer',
    }}>
      {locale === 'ar' ? 'English' : 'عربي'}
    </p>
  );
};

export default LanguageSwitcher;
