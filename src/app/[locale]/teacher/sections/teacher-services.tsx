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
  const t = useTranslations('Home');

  const teacherServicesData = [
    {
      icon: <FcAssistant size={60} />,
      title: t('TeacherServices.guided_teaching_path.title'),
      description: t('TeacherServices.guided_teaching_path.content'),
    },
    {
      icon: <FcBusinessman size={60} />,
      title: t('TeacherServices.teacher_training.title'),
      description: t('TeacherServices.teacher_training.content'),
    },
    {
      icon: <FcApproval size={60} />,
      title: t('TeacherServices.feedback_improvement.title'),
      description: t('TeacherServices.feedback_improvement.content'),
    },
    {
      icon: <FcClock size={60} />,
      title: t('TeacherServices.efficient_scheduling.title'),
      description: t('TeacherServices.efficient_scheduling.content'),
    },
    {
      icon: <FcDocument size={60} />,
      title: t('TeacherServices.performance_tracking.title'),
      description: t('TeacherServices.performance_tracking.content'),
    },
    {
      icon: <FcCollaboration size={60} />,
      title: t('TeacherServices.collaborative_learning.title'),
      description: t('TeacherServices.collaborative_learning.content'),
    },
  ];

  return (
    <div className='mt-12 mb-12'>
      <Services
        title={t('TeacherServices.title')}
        services={teacherServicesData}
      />
    </div>
  );
};

export default TeacherServices;
