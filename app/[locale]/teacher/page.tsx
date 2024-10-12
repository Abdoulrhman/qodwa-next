import React from 'react';
import HomeIntro from '../home/sections/intro';
import Advantages from './sections/advantages';
import TeacherServices from '../home/sections/teacher-services';

const TeacherPage: React.FC = () => {
  return (
    <div>
      <HomeIntro bgColor='#422e87' isBgImage={false} />
      <TeacherServices />
    </div>
  );
};

export default TeacherPage;
