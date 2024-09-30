'use client';
import { useTranslations } from 'next-intl';
import ToggleSwitch from '@/components/shared/ToggleSwitch';

const IntroContent: React.FC = () => {
  const t = useTranslations('Home');

  return (
    <section className="intro-content">
      <ToggleSwitch />
      <h1 className="intro-title">
        Hire <span className="intro-title-highlight">Remote Top Talents</span>
      </h1>
      <p className="intro-subtitle">24,000+ Talent from around 80+ Countries</p>
      <div className="intro-cta">
        <button className="intro-cta-btn">{t('get_started')}</button>
      </div>
    </section>
  );
};

export default IntroContent;
