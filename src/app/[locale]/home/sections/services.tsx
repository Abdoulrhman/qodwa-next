'use client';
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
import Services from '@/shared/components/services';

const HomeServices: React.FC = () => {
  const t = useTranslations('Home.Services');

  const servicesData = [
    {
      icon: <FcLibrary size={60} />,
      title: t('any_quran_memorization_path.title'),
      description: t('any_quran_memorization_path.content'),
    },
    {
      icon: <FcBusinessman size={60} />,
      title: t('browse_teacher_profiles.title'),
      description: t('browse_teacher_profiles.content'),
    },
    {
      icon: <FcApproval size={60} />,
      title: t('achieve_quran_goals_faster.title'),
      description: t('achieve_quran_goals_faster.content'),
    },
    {
      icon: <FcAssistant size={60} />,
      title: t('comprehensive_support.title'),
      description: t('comprehensive_support.content'),
    },
    {
      icon: <FcSwitchCamera size={60} />,
      title: t('teacher_flexibility.title'),
      description: t('teacher_flexibility.content'),
    },
    {
      icon: <FcClock size={60} />,
      title: t('faster_quran_memorization.title'),
      description: t('faster_quran_memorization.content'),
    },
  ];

  return (
    <div className='bg-[#422e87] mb-12 mt-12'>
      <Services
        title={t('title')}
        services={servicesData}
        titleClassName='text-white'
      />
    </div>
  );
};

export default HomeServices;
