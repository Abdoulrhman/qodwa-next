'use client';

import { useLocale } from 'next-intl';
import { useEffect, useState } from 'react';

export default function BodyDirection() {
  const locale = useLocale();
  const [dir, setDir] = useState('ltr');

  useEffect(() => {
    locale === 'ar' ? setDir('rtl') : setDir('ltr');
  }, [locale]);

  useEffect(() => {
    document.body.dir = dir; // Update the body direction dynamically
  }, [dir]);

  return null; // This component only manages body direction and does not render any UI
}
