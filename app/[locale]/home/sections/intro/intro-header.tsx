'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useMediaQuery } from 'react-responsive';

const Sidebar = dynamic(() => import('@/components/shared/sidebar'));

const IntroHeader: React.FC = () => {
  const t = useTranslations('Home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <header className='intro__header'>
      <div className='intro__header-content'>
        <div className='intro__header-logo'>
          <Image
            src='/images/logo/logo.png'
            alt='Logo'
            width={120}
            height={40}
          />
        </div>
        {!isMobile && (
          <nav className='intro__header-navbar'>
            <ul className='intro__header-navbar-nav-list'>
              <li className='intro__header-navbar-nav-item'>
                <Link href='#'>{t('about-us')}</Link>
              </li>
              <li className='intro__header-navbar-nav-item'>
                <Link href='#'>{t('contact-us')}</Link>
              </li>
              <li className='intro__header-navbar-nav-item'>
                <Link href='#'>{t('packages')}</Link>
              </li>
            </ul>
          </nav>
        )}

        {/* Burger Menu for Mobile */}
        {isMobile && (
          <button className='intro__header-burger' onClick={toggleSidebar}>
            &#9776;
          </button>
        )}

        {!isMobile && (
          <div className='intro__header-user-actions'>
            <Link href='/auth/login'>{t('login')}</Link>
            <Link href='/ar'>عربي</Link>
          </div>
        )}
        
      </div>

      {/* Sidebar for Mobile */}
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        position='right'
      >
        <ul className='intro__sidebar-nav'>
          <li className='intro__sidebar-nav-item'>
            <Link href='#'>{t('about-us')}</Link>
          </li>
          <li className='intro__sidebar-nav-item'>
            <Link href='#'>{t('contact-us')}</Link>
          </li>
          <li className='intro__sidebar-nav-item'>
            <Link href='#'>{t('packages')}</Link>
          </li>
        </ul>

        <div className='intro__sidebar-user-actions'>
          <Link href='/auth/login'>{t('login')}</Link>
          <Link href='/ar'>عربي</Link>
        </div>
      </Sidebar>
    </header>
  );
};

export default IntroHeader;
