'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackPageView } from '@/lib/facebook-pixel';

export function useFacebookPixelPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Track page view when route changes
    const url =
      pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');

    // Small delay to ensure the pixel is loaded
    const timer = setTimeout(() => {
      trackPageView(url);
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);
}

// Component wrapper for easy integration
export function FacebookPixelPageViewTracker() {
  useFacebookPixelPageView();
  return null;
}
