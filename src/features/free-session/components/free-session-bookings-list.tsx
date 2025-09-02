'use client';

import { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  User,
  MessageCircle,
  Video,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import {
  FreeSessionBooking,
  FreeSessionStatus,
} from '@/data/free-session-booking';

interface FreeSessionBookingsListProps {
  bookings: FreeSessionBooking[];
  onRefresh?: () => void;
  className?: string;
}

export const FreeSessionBookingsList = ({
  bookings,
  onRefresh,
  className,
}: FreeSessionBookingsListProps) => {
  const t = useTranslations('FreeSession');
  const locale = useLocale();
  const isRTL = locale === 'ar';

  const getStatusColor = (status: FreeSessionStatus) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'NO_SHOW':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: FreeSessionStatus) => {
    switch (status) {
      case 'PENDING':
        return <AlertCircle className='h-4 w-4' />;
      case 'SCHEDULED':
        return <Calendar className='h-4 w-4' />;
      case 'COMPLETED':
        return <CheckCircle className='h-4 w-4' />;
      case 'CANCELLED':
      case 'NO_SHOW':
        return <XCircle className='h-4 w-4' />;
      default:
        return <AlertCircle className='h-4 w-4' />;
    }
  };

  const getStatusText = (status: FreeSessionStatus) => {
    if (isRTL) {
      switch (status) {
        case 'PENDING':
          return 'في الانتظار';
        case 'SCHEDULED':
          return 'مجدولة';
        case 'COMPLETED':
          return 'مكتملة';
        case 'CANCELLED':
          return 'ملغية';
        case 'NO_SHOW':
          return 'لم يحضر';
        default:
          return 'غير معروف';
      }
    } else {
      switch (status) {
        case 'PENDING':
          return 'Pending';
        case 'SCHEDULED':
          return 'Scheduled';
        case 'COMPLETED':
          return 'Completed';
        case 'CANCELLED':
          return 'Cancelled';
        case 'NO_SHOW':
          return 'No Show';
        default:
          return 'Unknown';
      }
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(locale, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date));
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  if (bookings.length === 0) {
    return (
      <Card className={cn('w-full', className)}>
        <CardContent className='flex flex-col items-center justify-center py-12'>
          <div className='p-4 bg-muted rounded-full mb-4'>
            <Calendar className='h-8 w-8 text-muted-foreground' />
          </div>
          <h3 className='text-lg font-medium mb-2'>
            {isRTL ? 'لا توجد جلسات محجوزة' : 'No Bookings Yet'}
          </h3>
          <p className='text-muted-foreground text-center mb-4'>
            {isRTL
              ? 'احجز جلستك المجانية الأولى لبدء رحلتك التعليمية'
              : 'Book your first free session to start your learning journey'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {bookings.map((booking) => (
        <Card key={booking.id} className='w-full'>
          <CardHeader className={cn('pb-3', isRTL && 'text-right')}>
            <div
              className={cn(
                'flex items-start justify-between',
                isRTL && 'flex-row-reverse'
              )}
            >
              <div className='space-y-1'>
                <CardTitle className='text-lg'>
                  {isRTL ? 'الجلسة المجانية' : 'Free Session'}
                </CardTitle>
                <CardDescription
                  className={cn(
                    'flex items-center gap-2',
                    isRTL && 'flex-row-reverse'
                  )}
                >
                  <Calendar className='h-4 w-4' />
                  {formatDate(booking.sessionDate)}
                </CardDescription>
              </div>
              <Badge
                className={cn(
                  'flex items-center gap-1',
                  getStatusColor(booking.status)
                )}
              >
                {getStatusIcon(booking.status)}
                {getStatusText(booking.status)}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className='space-y-4'>
            {/* Session Details */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div
                className={cn(
                  'flex items-center gap-3',
                  isRTL && 'flex-row-reverse'
                )}
              >
                <Clock className='h-4 w-4 text-muted-foreground' />
                <div className={isRTL ? 'text-right' : ''}>
                  <p className='text-sm font-medium'>
                    {isRTL ? 'الوقت والمدة' : 'Time & Duration'}
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    {formatTime(booking.sessionDate)} • {booking.duration}{' '}
                    {isRTL ? 'دقيقة' : 'min'}
                  </p>
                </div>
              </div>

              {booking.subject && (
                <div
                  className={cn(
                    'flex items-center gap-3',
                    isRTL && 'flex-row-reverse'
                  )}
                >
                  <MessageCircle className='h-4 w-4 text-muted-foreground' />
                  <div className={isRTL ? 'text-right' : ''}>
                    <p className='text-sm font-medium'>
                      {isRTL ? 'الموضوع' : 'Subject'}
                    </p>
                    <p className='text-sm text-muted-foreground'>
                      {booking.subject}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Teacher Information */}
            {booking.teacher && (
              <div
                className={cn(
                  'flex items-center gap-3 p-3 bg-muted/50 rounded-lg',
                  isRTL && 'flex-row-reverse'
                )}
              >
                <Avatar className='h-10 w-10'>
                  <AvatarImage src={''} alt={booking.teacher.name || ''} />
                  <AvatarFallback>
                    {booking.teacher.name?.charAt(0) || 'T'}
                  </AvatarFallback>
                </Avatar>
                <div className={isRTL ? 'text-right' : ''}>
                  <p className='text-sm font-medium'>
                    {isRTL ? 'المعلم المختص' : 'Assigned Teacher'}
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    {booking.teacher.name ||
                      (isRTL ? 'غير محدد' : 'Not specified')}
                  </p>
                </div>
              </div>
            )}

            {/* Student Notes */}
            {booking.studentNotes && (
              <div className='space-y-2'>
                <h4 className='text-sm font-medium'>
                  {isRTL ? 'ملاحظاتك' : 'Your Notes'}
                </h4>
                <p
                  className={cn(
                    'text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg',
                    isRTL && 'text-right'
                  )}
                >
                  {booking.studentNotes}
                </p>
              </div>
            )}

            {/* Teacher Notes */}
            {booking.teacherNotes && (
              <div className='space-y-2'>
                <h4 className='text-sm font-medium'>
                  {isRTL ? 'ملاحظات المعلم' : 'Teacher Notes'}
                </h4>
                <p
                  className={cn(
                    'text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg',
                    isRTL && 'text-right'
                  )}
                >
                  {booking.teacherNotes}
                </p>
              </div>
            )}

            {/* Meeting Link */}
            {booking.meetingLink && booking.status === 'SCHEDULED' && (
              <div className='flex justify-end'>
                <Button asChild size='sm'>
                  <a
                    href={booking.meetingLink}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    <Video className='h-4 w-4 mr-2' />
                    {isRTL ? 'انضم للجلسة' : 'Join Session'}
                  </a>
                </Button>
              </div>
            )}

            {/* Cancellation Reason */}
            {booking.cancellationReason && (
              <div className='space-y-2'>
                <h4 className='text-sm font-medium text-destructive'>
                  {isRTL ? 'سبب الإلغاء' : 'Cancellation Reason'}
                </h4>
                <p
                  className={cn(
                    'text-sm text-muted-foreground p-3 bg-destructive/5 rounded-lg',
                    isRTL && 'text-right'
                  )}
                >
                  {booking.cancellationReason}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
