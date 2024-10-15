import React from 'react';
import HomeIntro from '../home/sections/intro';
import TeacherServices from './sections/teacher-services';
import Footer from '@/components/shared/footer';

const TeacherPage: React.FC = () => {
  const navLinks = [{ label: 'Apply as a Teacher', href: '/teacher/register' }];
  return (
    <div>
      <HomeIntro bgColor='#422e87' isBgImage={false} />
      <TeacherServices />
      <Footer navLinks={navLinks} />
    </div>
  );
};

export default TeacherPage;
