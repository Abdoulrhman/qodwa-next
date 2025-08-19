'use client';
import { useTranslations, useLocale } from 'next-intl';

export default function DebugTranslation() {
  const t = useTranslations('Home');
  const locale = useLocale();

  console.log('Current locale:', locale);
  console.log('Translation test:', t('main_header_text'));

  return (
    <div
      style={{
        position: 'fixed',
        top: '10px',
        left: '10px',
        background: 'red',
        color: 'white',
        padding: '10px',
        zIndex: 9999,
      }}
    >
      <p>Locale: {locale}</p>
      <p>Text: {t('main_header_text')}</p>
      <p>Now: {t('now')}</p>
    </div>
  );
}
