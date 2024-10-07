'use client';
import { useTranslations } from 'next-intl';
import ToggleSwitch from '@/components/shared/ToggleSwitch';

const IntroContent: React.FC = () => {
  const t = useTranslations('Home');

  return (
    <section className='intro-content'>
      <ToggleSwitch />
      <h1 className='intro-title'>
       
        <span className='intro-title-highlight'>{t('main_header_text')}</span>{' '}
        {t('now')}
      </h1>
      <p className='intro-subtitle'>{t('sub_header_text')}</p>
      <div className='intro-cta'>
        <button className='intro-cta-btn'>{t('get_started')}</button>
      </div>
    </section>
  );
};

export default IntroContent;
