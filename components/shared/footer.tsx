'use client';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { Link, usePathname } from '@/i18n/routing';

import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
} from 'react-icons/fa';

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

  useEffect(() => {
    setIsTeacher(pathName.includes('teacher'));
  }, [pathName]);
  return (
    <div className={`footer-wrapper ${isTeacher ? 'teacher-version' : ''}`}>
      <div className='footer-main'>
        <div className='footer-about'>
          <Image
            src={`/images/logo/logo-white.png`}
            alt='Logo'
            width={120}
            height={40}
          />
          <p className='footer-about-txt'>
            We form dedicated squads of our top-notch engineers and tech experts
            to build your product up digitally
          </p>
        </div>
        <div className='footer-quick-links'>
          <p className='quick-links-title'>Quick Links</p>
          <ul className='links'>
            {navLinks?.map((link, index) => (
              <li key={index}>
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
            {/* <p>Hire Tech Team</p>
            <p>Apply as a Talent</p> */}
          </ul>
        </div>
        <div className='footer-communication'>
          <div className={`background ${isTeacher ? 'teacher-version' : ''}`}>
            <FaFacebookF />
          </div>
          <div className={`background ${isTeacher ? 'teacher-version' : ''}`}>
            <FaTwitter />
          </div>
          <div className={`background ${isTeacher ? 'teacher-version' : ''}`}>
            <FaInstagram />
          </div>
          <div className={`background ${isTeacher ? 'teacher-version' : ''}`}>
            <FaLinkedinIn />
          </div>
        </div>
      </div>

      <p className={`footer-bottom ${isTeacher ? 'teacher-version' : ''}`}>
        &copy; {new Date().getFullYear()} - All rights reserved
      </p>
    </div>
  );
};

export default Footer;
