'use client';
import { useLocale, useTranslations } from 'next-intl';
import ToggleSwitch from '@/shared/components/ToggleSwitch';
import { useRouter } from 'next/navigation';

interface IntroContentProps {
  isTeacherPage: boolean;
}

const IntroContent: React.FC<IntroContentProps> = ({ isTeacherPage }) => {
  const t = useTranslations('Home');
  const router = useRouter();
  const locale = useLocale();

  const teacherStyle = {
    color: isTeacherPage ? '#fff' : '#000',
  };
  const handleGetStarted = () => {
    const path = isTeacherPage
      ? `/${locale}/teacher/register`
      : `/${locale}/student/register`;
    router.push(path);
  };

  const teachersStylingClass = isTeacherPage ? 'teacher-version' : '';

  return (
    <section className='intro-content'>
      <ToggleSwitch />
      <h1 className={`intro-title ${teachersStylingClass}`}>
        <span className={`intro-title-highlight ${teachersStylingClass}`}>
          {t('main_header_text')}
        </span>{' '}
        {t('now')}
      </h1>
      <p className={`intro-subtitle  ${teachersStylingClass}`}>
        {t('sub_header_text')}
      </p>
      <div className='intro-cta'>
        <button
          className={`intro-cta-btn ${teachersStylingClass}`}
          onClick={handleGetStarted}
        >
          {t('get_started')}
        </button>
      </div>
    </section>
  );
};

export default IntroContent;
