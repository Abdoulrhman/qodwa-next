'use client';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { Link, usePathname } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

import { FaFacebookF, FaInstagram, FaLinkedinIn } from 'react-icons/fa';

interface NavLink {
  label: string;
  href: string;
}
interface FooterProps {
  navLinks?: NavLink[]; // Dynamic navigation links
}
const Footer: React.FC<FooterProps> = ({ navLinks }) => {
  const pathName = usePathname();
  const [isTeacher, setIsTeacher] = useState(false);
  const t = useTranslations('Footer');
  const navT = useTranslations('Home.IntroHeader.nav');

  useEffect(() => {
    setIsTeacher(pathName.includes('teacher'));
  }, [pathName]);
  return (
    <div className={`footer-wrapper ${isTeacher ? 'teacher-version' : ''}`}>
      <div className='footer-content'>
        <div className='footer-main'>
          <div className='footer-about'>
            <Image
              src={`/images/logo/logo-white.png`}
              alt='Logo'
              width={120}
              height={40}
            />
            <p className='footer-about-txt'>{t('description')}</p>
          </div>
          <div className='footer-quick-links'>
            <p className='quick-links-title'>{t('quick_links')}</p>
            <ul className='links'>
              {navLinks?.map((link, index) => (
                <li key={index}>
                  <Link href={link.href}>{navT(link.label)}</Link>
                </li>
              ))}
              {/* <p>Hire Tech Team</p>
            <p>Apply as a Talent</p> */}
            </ul>
          </div>
          <div className='footer-communication'>
            <a
              href='https://www.facebook.com/people/Qodwa/61572522448338/'
              target='_blank'
              rel='noopener noreferrer'
              className={`background ${isTeacher ? 'teacher-version' : ''}`}
            >
              <FaFacebookF />
            </a>
            <a
              href='https://www.instagram.com/qodwaplatform/'
              target='_blank'
              rel='noopener noreferrer'
              className={`background ${isTeacher ? 'teacher-version' : ''}`}
            >
              <FaInstagram />
            </a>
            <a
              href='https://www.linkedin.com/company/qodwa-platform'
              target='_blank'
              rel='noopener noreferrer'
              className={`background ${isTeacher ? 'teacher-version' : ''}`}
            >
              <FaLinkedinIn />
            </a>
          </div>
        </div>

        <p className={`footer-bottom ${isTeacher ? 'teacher-version' : ''}`}>
          &copy; {new Date().getFullYear()} - {t('all_rights_reserved')}
        </p>
      </div>
    </div>
  );
};

export default Footer;
