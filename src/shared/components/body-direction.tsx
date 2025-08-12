'use client';

import { useLocale } from 'next-intl';
import { useEffect, useState } from 'react';
import { Inter, Almarai } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });
const almarai = Almarai({ subsets: ['arabic'], weight: ['400', '700'] });

export default function BodyDirection() {
  const locale = useLocale();
  const [dir, setDir] = useState('ltr');

  useEffect(() => {
    const isRTL = locale === 'ar';
    const direction = isRTL ? 'rtl' : 'ltr';
    setDir(direction);

    // Update document direction
    document.documentElement.dir = direction;
    document.documentElement.lang = locale;

    // Update body direction and preserve existing classes
    document.body.dir = direction;
    
    // Add font class while preserving existing classes
    const existingClasses = document.body.className;
    const fontClass = isRTL ? almarai.className : inter.className;
    
    // Remove any existing font classes and add the new one
    const cleanedClasses = existingClasses
      .split(' ')
      .filter(cls => !cls.startsWith('__className_') && cls !== almarai.className && cls !== inter.className)
      .join(' ');
    
    document.body.className = `${cleanedClasses} ${fontClass}`.trim();
  }, [locale]);

  return null; // This component only manages body direction and does not render any UI
}
