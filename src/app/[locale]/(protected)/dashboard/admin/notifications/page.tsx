'use client';

import { useState, useEffect } from 'react';
import {
  Bell,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Mail,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { RoleGate } from '@/src/features/auth/components/role-gate';

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

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    unread: 0,
    limit: 10,
    offset: 0,
    hasMore: false,
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Fetch notifications
  const fetchNotifications = async (offset = 0) => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/admin/notifications?limit=10&offset=${offset}`
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
        if (offset === 0) {
          setNotifications(data.notifications);
        } else {
          setNotifications((prev) => [...prev, ...data.notifications]);
        }
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to fetch notifications');
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
        setPagination((prev) => ({ ...prev, unread: 0 }));
        toast.success('All notifications marked as read');
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      toast.error('Failed to mark notifications as read');
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    router.push(notification.actionUrl);
  };

  // Load more notifications
  const loadMore = () => {
    fetchNotifications(pagination.offset + pagination.limit);
  };

  // Load notifications on mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Get notification icon
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'teacher_registration':
        return <User className='h-5 w-5 text-orange-600' />;
      case 'student_registration':
        return <User className='h-5 w-5 text-blue-600' />;
      default:
        return <Bell className='h-5 w-5' />;
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
    <RoleGate allowedRole='ADMIN'>
      <div className='container mx-auto py-6 space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold flex items-center gap-2'>
              <Bell className='h-8 w-8' />
              Admin Notifications
            </h1>
            <p className='text-muted-foreground'>
              Stay updated with new user registrations and teacher applications
            </p>
          </div>
          <div className='flex items-center gap-3'>
            <Button
              onClick={() => fetchNotifications(0)}
              variant='outline'
              size='sm'
              disabled={loading}
            >
              <RefreshCw className='h-4 w-4 mr-2' />
              Refresh
            </Button>
            {pagination.unread > 0 && (
              <Button onClick={markAllAsRead} variant='outline' size='sm'>
                <CheckCircle className='h-4 w-4 mr-2' />
                Mark all read
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-muted-foreground'>
                    Total Notifications
                  </p>
                  <p className='text-2xl font-bold'>{pagination.total}</p>
                </div>
                <Bell className='h-8 w-8 text-muted-foreground' />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-muted-foreground'>
                    Unread
                  </p>
                  <p className='text-2xl font-bold text-orange-600'>
                    {pagination.unread}
                  </p>
                </div>
                <AlertCircle className='h-8 w-8 text-orange-600' />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-muted-foreground'>
                    Email Notifications
                  </p>
                  <p className='text-2xl font-bold text-green-600'>✓ Active</p>
                </div>
                <Mail className='h-8 w-8 text-green-600' />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notifications List */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Notifications</CardTitle>
            <CardDescription>
              Latest user registrations and teacher applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading && notifications.length === 0 ? (
              <div className='text-center py-8'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto'></div>
                <p className='text-muted-foreground mt-2'>
                  Loading notifications...
                </p>
              </div>
            ) : notifications.length === 0 ? (
              <div className='text-center py-8'>
                <Bell className='h-16 w-16 mx-auto text-muted-foreground opacity-50' />
                <h3 className='text-lg font-medium mt-4'>
                  No notifications yet
                </h3>
                <p className='text-muted-foreground'>
                  New user registrations and teacher applications will appear
                  here
                </p>
              </div>
            ) : (
              <div className='space-y-4'>
                {notifications.map((notification, index) => (
                  <div key={notification.id}>
                    <div
                      className='flex items-start gap-4 p-4 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors'
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className='flex-shrink-0 mt-1'>
                        {getNotificationIcon(notification.type)}
                      </div>

                      <div className='flex-1 min-w-0'>
                        <div className='flex items-start justify-between'>
                          <div>
                            <p className='font-medium text-sm'>
                              {notification.title}
                            </p>
                            <p className='text-sm text-muted-foreground mt-1'>
                              {notification.message}
                            </p>
                            <div className='flex items-center gap-2 mt-2'>
                              <Clock className='h-3 w-3 text-muted-foreground' />
                              <span className='text-xs text-muted-foreground'>
                                {formatTimeAgo(notification.createdAt)}
                              </span>
                              <Badge
                                variant={
                                  notification.type === 'teacher_registration'
                                    ? 'secondary'
                                    : 'outline'
                                }
                              >
                                {notification.user.role}
                              </Badge>
                            </div>
                          </div>

                          {!notification.isRead && (
                            <div className='w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2' />
                          )}
                        </div>
                      </div>
                    </div>

                    {index < notifications.length - 1 && <Separator />}
                  </div>
                ))}

                {pagination.hasMore && (
                  <div className='text-center pt-4'>
                    <Button
                      onClick={loadMore}
                      variant='outline'
                      disabled={loading}
                    >
                      {loading ? 'Loading...' : 'Load More'}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </RoleGate>
  );
}
