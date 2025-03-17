'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';
import Sidebar from '@/components/shared/sidebar';
import LanguageSwitcher from '@/components/lang-switcher';
import useIsMobile from '@/hooks/use-is-mobile'; // Import the custom hook

interface NavLink {
  label: string;
  href: string;
}

interface IntroHeaderProps {
  navLinks: NavLink[]; // Dynamic navigation links
  isTeacherPage?: boolean; // New prop to change text color to white
}

const IntroHeader: React.FC<IntroHeaderProps> = ({
  navLinks,
  isTeacherPage = false,
}) => {
  const t = useTranslations('Home.IntroHeader');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const locale = useLocale();
  const isMobile = useIsMobile();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <header
      className={`intro__header ${isTeacherPage && !isMobile ? 'white' : ''}`}
    >
      {' '}
      {/* Add conditional class */}
      <div className='intro__header-content'>
        <div className='intro__header-logo'>
          <Link href='/' locale={locale}>
            <Image
              src={`/images/logo/${!isTeacherPage ? 'logo' : 'logo-white'}.png`}
              alt={t('logo_alt')}
              width={120}
              height={40}
            />
          </Link>
        </div>
        {!isMobile && (
          <nav className='intro__header-navbar'>
            <ul className='intro__header-navbar-nav-list'>
              {navLinks.map((link, index) => (
                <li key={index} className='intro__header-navbar-nav-item'>
                  <Link href={link.href}>{t(`nav.${link.label}`)}</Link>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {/* Burger Menu for Mobile */}
        {isMobile && (
          <button
            className='intro__header-burger'
            onClick={toggleSidebar}
            style={{
              color: isTeacherPage ? '#fff' : '#000',
            }}
            aria-label={t('menu_button_label')}
          >
            &#9776;
          </button>
        )}

        {!isMobile && (
          <div className='intro__header-user-actions'>
            <Link href='/auth/login' locale={locale}>
              {t('login')}
            </Link>
            <LanguageSwitcher />
          </div>
        )}
      </div>
      {/* Sidebar for Mobile */}
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        position='right'
        closeButtonLabel={t('close_menu')}
      >
        <ul className='intro__sidebar-nav'>
          {navLinks.map((link, index) => (
            <li key={index} className='intro__sidebar-nav-item'>
              <Link href={link.href}>{t(`nav.${link.label}`)}</Link>
            </li>
          ))}
        </ul>

        <div className='intro__sidebar-user-actions'>
          <Link href='/auth/login' locale={locale}>
            {t('login')}
          </Link>
          <LanguageSwitcher />
        </div>
      </Sidebar>
    </header>
  );
};

export default IntroHeader;
