'use client';
import React, { use, useEffect, useState } from 'react';
import IntroContent from './intro-content';
import IntroHeader from './intro-header';
import { usePathname } from '@/i18n/routing';

interface HomeIntroProps {
  bgImage?: string; // Optional background image
  bgColor?: string; // Optional background color
  isBgImage?: boolean; // Determines if the background image should be applied
}

const HomeIntro: React.FC<HomeIntroProps> = ({
  bgImage,
  bgColor,
  isBgImage = true,
}) => {
  const [isTeacherPage, setIsTeacherPage] = useState(false);
  const navLinks = [
    { label: 'About Us', href: '/about' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'Packages', href: '/packages' },
  ];

  // Default values for bgImage and bgColor if not provided
  const defaultBgImage = '/images/header-bg.jpg';
  const defaultBgColor = '#f3f1fa47';

  const backgroundStyle = {
    backgroundColor: !isBgImage ? bgColor || defaultBgColor : 'transparent',
    backgroundImage: isBgImage ? `url(${bgImage || defaultBgImage})` : 'none',
  };

  const pathName = usePathname();

  useEffect(() => {
    setIsTeacherPage(pathName.includes('teacher'));
  }, [pathName]);

  return (
    <div className='intro' style={backgroundStyle}>
      <IntroHeader navLinks={navLinks} isTeacherPage={isTeacherPage} />
      <IntroContent isTeacherPage={isTeacherPage} />
    </div>
  );
};

export default HomeIntro;
