'use client';

import { useRouter } from 'next/navigation';
import { LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLocale, useTranslations } from 'next-intl';
import { UserAvatar } from '@/components/ui/user-avatar';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';

export const ProfileMenu = () => {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('Dashboard');
  const isRTL = locale === 'ar';
  const { user, logout } = useAuth();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size='icon'
          className='rounded-full h-8 w-8 p-0'
          variant='ghost'
        >
          <UserAvatar />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={isRTL ? 'start' : 'end'} className='w-56'>
        {user && (
          <>
            <div className='px-3 py-2 text-sm'>
              <div className='font-medium'>{user.name || 'User'}</div>
              <div className='text-gray-500 dark:text-gray-400 text-xs'>
                {user.email}
              </div>
            </div>
            <hr className='my-1' />
          </>
        )}
        <DropdownMenuItem
          className={cn('cursor-pointer', isRTL && 'flex-row-reverse')}
          onClick={() => router.push(`/${locale}/dashboard/profile`)}
        >
          <User className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
          {t('navigation.profile')}
        </DropdownMenuItem>
        <hr className='my-1' />
        <DropdownMenuItem
          className={cn(
            'cursor-pointer text-red-600 focus:text-red-600',
            isRTL && 'flex-row-reverse'
          )}
          onClick={logout}
        >
          <LogOut className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
          {t('navigation.logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
