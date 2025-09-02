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
  const pathName = usePathname();

  useEffect(() => {
    setIsTeacherPage(pathName.includes('teacher'));
  }, [pathName]);

  // Dynamic navigation links based on page type
  const navLinks = isTeacherPage
    ? [
        { label: 'Home', href: '/' },
        { label: 'Apply as a Teacher', href: '/teacher/register' },
      ]
    : [
        { label: 'Packages', href: '#packages' },
        { label: 'Guide', href: '#how-to-start' },
        { label: 'About Us', href: '#about-us' },
        { label: 'Services', href: '#services' },
        { label: 'Contact Us', href: '#contact-us' },
      ];

  // Default values for bgImage and bgColor if not provided
  const defaultBgImage = '/images/header-bg.jpg';
  const defaultBgColor = '#f3f1fa47';

  const backgroundStyle = {
    backgroundColor: !isBgImage ? bgColor || defaultBgColor : 'transparent',
    backgroundImage: isBgImage ? `url(${bgImage || defaultBgImage})` : 'none',
  };

  return (
    <div className='intro' style={backgroundStyle}>
      <IntroHeader navLinks={navLinks} isTeacherPage={isTeacherPage} />
      <IntroContent isTeacherPage={isTeacherPage} />
    </div>
  );
};

export default HomeIntro;
