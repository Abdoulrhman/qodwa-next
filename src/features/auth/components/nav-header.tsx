'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useLocale } from 'next-intl';
import { cn } from '@/lib/utils';

interface NavigationHeaderProps {
  backHref?: string;
  showBackButton?: boolean;
  logoSrc?: string;
  logoAlt?: string;
  logoWidth?: number;
  logoHeight?: number;
  className?: string;
  logoClassName?: string;
  backButtonClassName?: string;
  variant?: 'full' | 'logo-only'; // New prop to control layout
  title?: string; // For logo-only variant
  subtitle?: string; // For logo-only variant
}

const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  backHref = '/',
  showBackButton = true,
  logoSrc = '/images/logo/logo.png',
  logoAlt = 'Qodwa Logo',
  logoWidth = 100,
  logoHeight = 40,
  className,
  logoClassName,
  backButtonClassName,
  variant = 'full',
  title,
  subtitle,
}) => {
  const locale = useLocale();
  const isRTL = locale === 'ar';

  // Logo-only variant for use in CardWrapper
  if (variant === 'logo-only') {
    return (
      <div
        className={cn(
          'w-full flex flex-col gap-y-4 items-center justify-center',
          className
        )}
      >
        <div
          className={cn('relative', logoClassName)}
          style={{ width: `${logoWidth}px`, height: `${logoHeight}px` }}
        >
          <Image
            src={logoSrc}
            alt={logoAlt}
            fill
            className='object-contain dark:invert'
            priority
          />
        </div>
        {title && <h1 className='text-3xl font-semibold'>{title}</h1>}
        {subtitle && (
          <p className='text-muted-foreground text-sm'>{subtitle}</p>
        )}
      </div>
    );
  }

  // Full variant with back button and navigation
  return (
    <>
      <div
        className={cn(
          'flex items-center justify-between mb-6 sticky top-0 bg-white z-10',
          isRTL && 'flex-row-reverse',
          className
        )}
      >
        {showBackButton ? (
          <Link href={backHref} className='flex items-center'>
            <Button
              variant='ghost'
              size='icon'
              className={cn('mr-2', isRTL && 'ml-2 mr-0', backButtonClassName)}
            >
              <ArrowLeft className='h-5 w-5' />
            </Button>
          </Link>
        ) : (
          <div /> // Empty div to maintain spacing when back button is hidden
        )}

        <div className='flex items-center'>
          <Link href='/' className='flex items-center'>
            <div
              className={cn('relative', logoClassName)}
              style={{ width: `${logoWidth}px`, height: `${logoHeight}px` }}
            >
              <Image
                src={logoSrc}
                alt={logoAlt}
                fill
                className='object-contain dark:invert'
                priority
              />
            </div>
          </Link>
        </div>
      </div>

      {(title || subtitle) && (
        <div className='flex flex-col items-center justify-center mb-6'>
          {title && (
            <h1 className='text-lg font-semibold text-center'>{title}</h1>
          )}
          {subtitle && (
            <p className='text-muted-foreground text-xs text-center mt-1'>
              {subtitle}
            </p>
          )}
        </div>
      )}
    </>
  );
};

export default NavigationHeader;
