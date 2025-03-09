import React from 'react';
import {
  FcLibrary,
  FcBusinessman,
  FcApproval,
  FcAssistant,
  FcSwitchCamera,
  FcClock,
} from 'react-icons/fc'; // Import icons from react-icons/fc
import { useTranslations } from 'next-intl';
import Services from '@/components/shared/services';

const HomeServices: React.FC = () => {
  const t = useTranslations('Home');

  const servicesData = [
    {
      icon: <FcLibrary size={60} />,
      title: t('Services.any_quran_memorization_path.title'),
      description: t('Services.any_quran_memorization_path.content'),
    },
    {
      icon: <FcBusinessman size={60} />,
      title: t('Services.browse_teacher_profiles.title'),
      description: t('Services.browse_teacher_profiles.content'),
    },
    {
      icon: <FcApproval size={60} />,
      title: t('Services.achieve_quran_goals_faster.title'),
      description: t('Services.achieve_quran_goals_faster.content'),
    },
    {
      icon: <FcAssistant size={60} />,
      title: t('Services.comprehensive_support.title'),
      description: t('Services.comprehensive_support.content'),
    },
    {
      icon: <FcSwitchCamera size={60} />,
      title: t('Services.teacher_flexibility.title'),
      description: t('Services.teacher_flexibility.content'),
    },
    {
      icon: <FcClock size={60} />,
      title: t('Services.faster_quran_memorization.title'),
      description: t('Services.faster_quran_memorization.content'),
    },
  ];

  return (
    <div className='bg-[#422e87] mb-12 mt-12'>
      <Services
        title={t('Services.title')}
        services={servicesData}
        titleClassName='text-white'
      />
    </div>
  );
};

export default HomeServices;
