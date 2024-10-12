import React from 'react';
import HomeIntro from '../home/sections/intro';
import Advantages from './sections/how-to-start';
import HowToStart from './sections/how-to-start';

const TeacherPage: React.FC = () => {
  return (
    <div>
      <HomeIntro bgColor='#422e87' isBgImage={false} />
      <HowToStart />
    </div>
  );
};

export default TeacherPage;
