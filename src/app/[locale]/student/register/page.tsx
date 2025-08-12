import StudentForm from '@/shared/components/student-form';
import React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import SplittedLayout from '@/shared/components/splittedLayout';

const RegisterStudent = () => {
  const t = useTranslations('Student.Register');
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
      <StudentForm />
    </SplittedLayout>
  );
};

export default RegisterStudent;
