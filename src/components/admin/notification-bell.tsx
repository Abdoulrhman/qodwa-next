'use client';

import { useState, useEffect } from 'react';
import { Bell, User, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface Notification {
  id: string;
  type: 'teacher_registration' | 'student_registration';
  title: string;
  message: string;
  user: {
    name: string | null;
    email: string | null;
    image: string | null;
    role: string;
  };
  isRead: boolean;
  createdAt: string;
  actionUrl: string;
}

interface NotificationData {
  notifications: Notification[];
  pagination: {
    total: number;
    unread: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        '/api/admin/notifications?limit=5&unread=false'
      );

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data: {
        success: boolean;
        notifications: Notification[];
        pagination: any;
      } = await response.json();

      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.pagination.unread);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllAsRead: true }),
      });

      if (response.ok) {
        setUnreadCount(0);
        toast.success('All notifications marked as read');
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      toast.error('Failed to mark notifications as read');
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    setOpen(false);
    router.push(notification.actionUrl);
  };

  // Load notifications on mount
  useEffect(() => {
    fetchNotifications();

    // Set up polling for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Get notification icon
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'teacher_registration':
        return <User className='h-4 w-4 text-orange-600' />;
      case 'student_registration':
        return <User className='h-4 w-4 text-blue-600' />;
      default:
        return <Bell className='h-4 w-4' />;
    }
  };

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon' className='relative'>
          <Bell className='h-5 w-5' />
          {unreadCount > 0 && (
            <Badge
              variant='destructive'
              className='absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs'
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align='end' className='w-80'>
        <DropdownMenuLabel className='flex items-center justify-between'>
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant='ghost'
              size='sm'
              onClick={markAllAsRead}
              className='text-xs h-6 px-2'
            >
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {loading ? (
          <div className='p-4 text-center text-sm text-muted-foreground'>
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className='p-4 text-center text-sm text-muted-foreground'>
            <Bell className='h-8 w-8 mx-auto mb-2 opacity-50' />
            No notifications yet
          </div>
        ) : (
          <>
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={cn(
                  'flex items-start gap-3 p-3 cursor-pointer',
                  !notification.isRead && 'bg-blue-50 dark:bg-blue-950/30'
                )}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className='flex-shrink-0 mt-1'>
                  {getNotificationIcon(notification.type)}
                </div>

                <div className='flex-1 min-w-0'>
                  <p className='text-sm font-medium truncate'>
                    {notification.title}
                  </p>
                  <p className='text-xs text-muted-foreground line-clamp-2'>
                    {notification.message}
                  </p>
                  <div className='flex items-center gap-1 mt-1'>
                    <Clock className='h-3 w-3 text-muted-foreground' />
                    <span className='text-xs text-muted-foreground'>
                      {formatTimeAgo(notification.createdAt)}
                    </span>
                  </div>
                </div>

                {!notification.isRead && (
                  <div className='w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2' />
                )}
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className='text-center justify-center text-sm text-blue-600 hover:text-blue-700'
              onClick={() => {
                setOpen(false);
                router.push('/dashboard/admin/users');
              }}
            >
              View all notifications
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
