'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import {Link} from '@/i18n/routing';

import { useLocale, useTranslations } from 'next-intl';
import Sidebar from '@/components/shared/sidebar';
import LanguageSwitcher from '@/components/lang-switcher';


const IntroHeader: React.FC = () => {
  const t = useTranslations('Home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const locale = useLocale();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.matchMedia('(max-width: 768px)').matches);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
            <Link href='/auth/login' locale={locale}>{t('login')}</Link>
         <LanguageSwitcher />
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
          <LanguageSwitcher />
        </div>
      </Sidebar>
    </header>
  );
};

export default IntroHeader;
