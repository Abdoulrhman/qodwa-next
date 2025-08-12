import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface NavLink {
  label: string;
  href: string;
}

interface HeaderProps {
  logo: string;
  navLinks: NavLink[];
  isArabic?: boolean;
  onLanguageToggle?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  logo,
  navLinks,
  isArabic = false,
  onLanguageToggle,
}) => {
  return (
    <header className='sticky-header'>
      <div className='sticky-header__container'>
        {/* Logo */}
        <div className='sticky-header__logo'>
          <Link href='/'>
            <Image src={logo} alt='Logo' />
          </Link>
        </div>

        {/* Navigation */}
        <nav className='sticky-header__nav'>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className='sticky-header__link'
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className='sticky-header__actions'>
          <button
            className='sticky-header__language-toggle'
            onClick={onLanguageToggle}
          >
            {isArabic ? 'English' : 'عربي'}
          </button>
          <Link href='/login' className='sticky-header__login'>
            Login
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
