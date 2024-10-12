import React from 'react';
import HomeIntro from '../home/sections/intro';
import TeacherServices from '../home/sections/teacher-services';
import HowToStart from './sections/how-to-start';

const TeacherPage: React.FC = () => {
  return (
    <div>
      <HomeIntro bgColor='#422e87' isBgImage={false} />
      <TeacherServices />
      <HowToStart />
    </div>
  );
};

export default TeacherPage;
