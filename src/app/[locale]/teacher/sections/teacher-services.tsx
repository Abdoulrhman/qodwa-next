'use client';
import React from 'react';
import {
  FcBusinessman,
  FcApproval,
  FcAssistant,
  FcClock,
  FcDocument,
  FcCollaboration,
} from 'react-icons/fc'; // Import icons from react-icons/fc
import { useTranslations } from 'next-intl';
import Services from '@/shared/components/services';

const TeacherServices: React.FC = () => {
  const t = useTranslations('TeacherServices');

  const teacherServicesData = [
    {
      icon: <FcAssistant size={60} />,
      title: t('guided_teaching_path.title'),
      description: t('guided_teaching_path.content'),
    },
    {
      icon: <FcBusinessman size={60} />,
      title: t('teacher_training.title'),
      description: t('teacher_training.content'),
    },
    {
      icon: <FcApproval size={60} />,
      title: t('feedback_improvement.title'),
      description: t('feedback_improvement.content'),
    },
    {
      icon: <FcClock size={60} />,
      title: t('efficient_scheduling.title'),
      description: t('efficient_scheduling.content'),
    },
    {
      icon: <FcDocument size={60} />,
      title: t('performance_tracking.title'),
      description: t('performance_tracking.content'),
    },
    {
      icon: <FcCollaboration size={60} />,
      title: t('collaborative_learning.title'),
      description: t('collaborative_learning.content'),
    },
  ];

  return (
    <div className='mt-12 mb-12'>
      <Services title={t('title')} services={teacherServicesData} />
    </div>
  );
};

export default TeacherServices;
