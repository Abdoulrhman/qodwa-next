import { TeacherRegistrationForm } from '@/features/teacher/components/teacher-registration-form';
import { useTranslations, useLocale } from 'next-intl';
import SplittedLayout from '@/shared/components/splittedLayout';

export default function TeacherRegisterPage() {
  const t = useTranslations('Teacher.Register');
  const locale = useLocale();
  const isRTL = locale === 'ar';

  return (
    <SplittedLayout
      backgroundImage='/images/mosque.jpg'
      platformName={t('platformName')}
      testimonialQuote={t('testimonialQuote')}
      testimonialAuthor={t('testimonialAuthor')}
      isColorBlack={false}
    >
      <TeacherRegistrationForm />
    </SplittedLayout>
  );
}
