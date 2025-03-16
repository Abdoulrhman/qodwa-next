'use client';

import { logout } from '@/actions/logout';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';

interface LogoutButtonProps {
  children?: React.ReactNode;
}

export const LogoutButton = ({ children }: LogoutButtonProps) => {
  const router = useRouter();
  const locale = useLocale();

  const onClick = async () => {
    await logout();
    router.push(`/${locale}/auth/login`);
  };

  return (
    <span onClick={onClick} className='cursor-pointer'>
      {children}
    </span>
  );
};
