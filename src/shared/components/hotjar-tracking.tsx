'use client';

import { useEffect } from 'react';
import Script from 'next/script';
import { initHotjar } from '@/lib/hotjar';

// Get Hotjar ID from environment variables
const getHotjarId = (): string | null => {
  return process.env.NEXT_PUBLIC_HOTJAR_ID || null;
};

export function HotjarTracking() {
  const hotjarId = getHotjarId();

  useEffect(() => {
    if (hotjarId) {
      initHotjar(hotjarId);
    }
  }, [hotjarId]);

  // Don't render anything if no Hotjar ID is provided
  if (!hotjarId) {
    return null;
  }

  return (
    <Script
      id='hotjar-tracking'
      strategy='afterInteractive'
      dangerouslySetInnerHTML={{
        __html: `
(function(h,o,t,j,a,r){
    h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
    h._hjSettings={hjid:${hotjarId},hjsv:6};
    a=o.getElementsByTagName('head')[0];
    r=o.createElement('script');r.async=1;
    r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
    a.appendChild(r);
})(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');`,
      }}
    />
  );
}

export default HotjarTracking;