'use client';

import { useSession } from 'next-auth/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UserAvatarProps {
  className?: string;
  size?: number;
}

export const UserAvatar = ({ className, size = 32 }: UserAvatarProps) => {
  const { data: session } = useSession();
  const user = session?.user;

  const getInitials = (name?: string | null) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Avatar className={className} style={{ width: size, height: size }}>
      <AvatarImage
        src={user?.image || '/placeholder.jpg'}
        alt={user?.name || 'User'}
      />
      <AvatarFallback className='bg-secondary'>
        {getInitials(user?.name)}
      </AvatarFallback>
    </Avatar>
  );
};
