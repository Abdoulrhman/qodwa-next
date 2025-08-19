import React from 'react';

interface SplittedLayoutProps {
  children: React.ReactNode;
  backgroundImage?: string;
  platformName?: string;
  testimonialQuote?: string;
  testimonialAuthor?: string;
  isColorBlack?: boolean;
}

const SplittedLayout: React.FC<SplittedLayoutProps> = ({
  children,
  backgroundImage = '/images/header-bg.jpg',
  platformName = 'Qodwa Platform',
  testimonialQuote = '“This platform has transformed my Quran memorization journey, making it easier to stay consistent and track my progress effortlessly.”',
  testimonialAuthor = 'Sofia Davis',
  isColorBlack = true,
}) => {
  return (
    <div className='min-h-screen flex flex-col md:flex-row'>
      {/* Left side with background image and overlay text */}
      <div
        className={`hidden md:w-1/2 md:flex bg-cover bg-center ${
          isColorBlack ? 'text-black' : 'text-white'
        } flex-col justify-end p-8`}
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className='flex-grow'></div>
        <div className='text-lg'>
          {/* Logo and platform name at the top */}
          <div className='text-2xl font-bold mb-6'>{platformName}</div>
          {/* Testimonial quote */}
          <p className='italic'>{testimonialQuote}</p>
          <span className='block mt-4 font-semibold'>{testimonialAuthor}</span>
        </div>
      </div>

      {/* Right side with children - mobile optimized */}
      <div className='w-full md:w-1/2 flex items-start md:items-center justify-center bg-white p-4 md:p-8 pt-8 md:pt-8 min-h-screen md:min-h-0'>
        <div className='w-full max-w-md mx-auto'>
          {children}
        </div>
      </div>
    </div>
  );
};

export default SplittedLayout;
