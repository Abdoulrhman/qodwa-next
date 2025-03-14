import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
  backgroundImage?: string;
  platformName?: string;
  testimonialQuote?: string;
  testimonialAuthor?: string;
  isColorBlack?: boolean;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  backgroundImage = '/images/header-bg.jpg',
  platformName = 'Qodwa Platform',
  testimonialQuote = '“This platform has transformed my Quran memorization journey, making it easier to stay consistent and track my progress effortlessly.”',
  testimonialAuthor = 'Sofia Davis',
  isColorBlack = true,
}) => {
  return (
    <div className='h-screen flex'>
      {/* Left side with background image and overlay text */}
      <div
        className={`w-1/2 hidden md:flex bg-cover bg-center ${
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

      {/* Right side with children */}
      <div className='w-full md:w-1/2 flex items-center justify-center bg-white p-8'>
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
