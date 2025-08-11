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

    // Update body direction and font
    document.body.dir = direction;
    document.body.className = isRTL ? almarai.className : inter.className;
  }, [locale]);

  return null; // This component only manages body direction and does not render any UI
}
