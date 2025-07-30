'use client';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Header } from '@/components/auth/header';
import NavigationHeader from '@/components/auth/nav-header';
import { Social } from '@/components/auth/social';
import { BackButton } from '@/components/auth/back-button';

interface CardWrapperProps {
  children: React.ReactNode;
  headerLabel: string;
  backButtonLabel: string;
  backButtonHref: string;
  showSocial?: boolean;
  useAuthHeader?: boolean; // New prop to use AuthHeader instead of Header
  authHeaderProps?: {
    logoSrc?: string;
    logoAlt?: string;
    logoWidth?: number;
    logoHeight?: number;
    title?: string;
    variant?: 'full' | 'logo-only'; // New prop to control layout
    subtitle?: string; // For logo-only variant
  };
}

export const CardWrapper = ({
  children,
  headerLabel,
  backButtonLabel,
  backButtonHref,
  showSocial,
  useAuthHeader = false,
  authHeaderProps,
}: CardWrapperProps) => {
  console.log('CardWrapper props:', { useAuthHeader, authHeaderProps });

  return (
    <Card className='w-[400px] shadow-md'>
      <CardHeader>
        {useAuthHeader ? (
          <NavigationHeader
            variant={authHeaderProps?.variant || 'logo-only'}
            title={authHeaderProps?.title || 'Qodwa Platform'}
            subtitle={headerLabel}
            logoSrc={authHeaderProps?.logoSrc}
            logoAlt={authHeaderProps?.logoAlt}
            logoWidth={authHeaderProps?.logoWidth}
            logoHeight={authHeaderProps?.logoHeight}
          />
        ) : (
          <Header label={headerLabel} />
        )}
      </CardHeader>
      <CardContent>{children}</CardContent>
      {showSocial && (
        <CardFooter>
          <Social />
        </CardFooter>
      )}
      <CardFooter>
        <BackButton label={backButtonLabel} href={backButtonHref} />
      </CardFooter>
    </Card>
  );
};
