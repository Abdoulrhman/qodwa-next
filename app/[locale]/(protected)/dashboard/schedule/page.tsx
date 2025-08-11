'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  Calendar,
  Clock,
  Video,
  User,
  Plus,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';

interface ScheduledClass {
  id: string;
  title: string;
  teacherName: string;
  teacherId: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'in-progress';
  type: 'memorization' | 'tajweed' | 'recitation' | 'theory';
  meetingLink?: string;
  notes?: string;
}

export default function SchedulePage() {
  const t = useTranslations('Dashboard');
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const { user } = useAuth();

  const [classes, setClasses] = useState<ScheduledClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');

  const fetchSchedule = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/student/schedule?date=${selectedDate.toISOString()}&view=${viewMode}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch schedule data');
      }

      const data = await response.json();

      if (data.success) {
        setClasses(data.classes || []);
      } else {
        setError(data.error || 'Failed to load schedule information');
      }
    } catch (err) {
      setError('An error occurred while loading schedule information');
      console.error('Error fetching schedule data:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, viewMode]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'in-progress':
        return 'bg-yellow-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    if (isRTL) {
      switch (status) {
        case 'scheduled':
          return 'مجدول';
        case 'completed':
          return 'مكتمل';
        case 'in-progress':
          return 'جاري';
        case 'cancelled':
          return 'ملغي';
        default:
          return status;
      }
    } else {
      return status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ');
    }
  };

  const getTypeText = (type: string) => {
    if (isRTL) {
      switch (type) {
        case 'memorization':
          return 'تحفيظ';
        case 'tajweed':
          return 'تجويد';
        case 'recitation':
          return 'تلاوة';
        case 'theory':
          return 'نظري';
        default:
          return type;
      }
    } else {
      return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };

    return date.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', options);
  };

  const formatTime = (timeString: string) => {
    const time = new Date(`2025-01-01T${timeString}`);
    return time.toLocaleTimeString(isRTL ? 'ar-SA' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: !isRTL,
    });
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setSelectedDate(newDate);
  };

  const isToday = (dateString: string) => {
    const classDate = new Date(dateString);
    const today = new Date();
    return classDate.toDateString() === today.toDateString();
  };

  const isPast = (dateString: string, timeString: string) => {
    const classDateTime = new Date(`${dateString}T${timeString}`);
    return classDateTime < new Date();
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className='flex h-full items-center justify-center'>
          <Loader2 className='h-8 w-8 animate-spin' />
        </div>
      </DashboardLayout>
    );
  }

  const groupedClasses = classes.reduce((groups, classItem) => {
    const date = classItem.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(classItem);
    return groups;
  }, {} as Record<string, ScheduledClass[]>);

  return (
    <DashboardLayout>
      <div className='space-y-6' dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Page Header */}
        <div className={cn('space-y-4', isRTL && 'text-right')}>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold'>
                {isRTL ? 'جدولي الدراسي' : 'My Schedule'}
              </h1>
              <p className='text-muted-foreground'>
                {isRTL
                  ? 'جدول حصصك ومواعيدك القادمة'
                  : 'Your upcoming classes and appointments'}
              </p>
            </div>
            <Button>
              <Plus className='h-4 w-4 mr-2' />
              {isRTL ? 'حجز حصة' : 'Book Class'}
            </Button>
          </div>

          {/* Navigation and View Controls */}
          <div className='flex items-center justify-between'>
            <div
              className={cn(
                'flex items-center gap-2',
                isRTL && 'flex-row-reverse'
              )}
            >
              <Button
                variant='outline'
                size='sm'
                onClick={() => navigateDate('prev')}
              >
                <ChevronLeft className='h-4 w-4' />
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() => navigateDate('next')}
              >
                <ChevronRight className='h-4 w-4' />
              </Button>
              <span className='font-medium px-4'>
                {selectedDate.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>

            <div className='flex gap-2'>
              <Button
                variant={viewMode === 'week' ? 'default' : 'outline'}
                size='sm'
                onClick={() => setViewMode('week')}
              >
                {isRTL ? 'أسبوعي' : 'Week'}
              </Button>
              <Button
                variant={viewMode === 'month' ? 'default' : 'outline'}
                size='sm'
                onClick={() => setViewMode('month')}
              >
                {isRTL ? 'شهري' : 'Month'}
              </Button>
            </div>
          </div>
        </div>

        {error && (
          <Card className='border-destructive'>
            <CardContent className='pt-6'>
              <p className='text-destructive text-center'>{error}</p>
              <div className='flex justify-center mt-4'>
                <Button onClick={fetchSchedule} variant='outline'>
                  {isRTL ? 'إعادة المحاولة' : 'Try Again'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Schedule Content */}
        <div className='space-y-6'>
          {Object.keys(groupedClasses).length > 0 ? (
            Object.entries(groupedClasses)
              .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
              .map(([date, dayClasses]) => (
                <Card key={date}>
                  <CardHeader className='pb-3'>
                    <CardTitle
                      className={cn(
                        'flex items-center gap-2',
                        isRTL && 'flex-row-reverse'
                      )}
                    >
                      <Calendar className='h-5 w-5' />
                      {formatDate(date)}
                      {isToday(date) && (
                        <Badge variant='secondary'>
                          {isRTL ? 'اليوم' : 'Today'}
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-3'>
                      {dayClasses
                        .sort((a, b) => a.startTime.localeCompare(b.startTime))
                        .map((classItem) => (
                          <div
                            key={classItem.id}
                            className={cn(
                              'flex items-center justify-between p-4 border rounded-lg transition-colors',
                              isPast(classItem.date, classItem.startTime) &&
                                classItem.status !== 'completed'
                                ? 'bg-muted opacity-60'
                                : 'hover:bg-muted/50',
                              isRTL && 'flex-row-reverse'
                            )}
                          >
                            <div
                              className={cn(
                                'flex items-center gap-3',
                                isRTL && 'flex-row-reverse'
                              )}
                            >
                              <div
                                className={cn(
                                  'w-3 h-3 rounded-full',
                                  getStatusColor(classItem.status)
                                )}
                              />

                              <div
                                className={cn(
                                  'space-y-1',
                                  isRTL && 'text-right'
                                )}
                              >
                                <h4 className='font-medium'>
                                  {classItem.title}
                                </h4>
                                <div
                                  className={cn(
                                    'flex items-center gap-4 text-sm text-muted-foreground',
                                    isRTL && 'flex-row-reverse'
                                  )}
                                >
                                  <div
                                    className={cn(
                                      'flex items-center gap-1',
                                      isRTL && 'flex-row-reverse'
                                    )}
                                  >
                                    <User className='h-3 w-3' />
                                    {classItem.teacherName}
                                  </div>
                                  <div
                                    className={cn(
                                      'flex items-center gap-1',
                                      isRTL && 'flex-row-reverse'
                                    )}
                                  >
                                    <Clock className='h-3 w-3' />
                                    {formatTime(classItem.startTime)} -{' '}
                                    {formatTime(classItem.endTime)}
                                  </div>
                                  <Badge variant='outline' className='text-xs'>
                                    {getTypeText(classItem.type)}
                                  </Badge>
                                </div>
                                {classItem.notes && (
                                  <p className='text-xs text-muted-foreground'>
                                    {classItem.notes}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div
                              className={cn(
                                'flex items-center gap-2',
                                isRTL && 'flex-row-reverse'
                              )}
                            >
                              <Badge
                                variant='secondary'
                                className={cn(
                                  'text-white text-xs',
                                  getStatusColor(classItem.status)
                                )}
                              >
                                {getStatusText(classItem.status)}
                              </Badge>

                              {classItem.status === 'scheduled' &&
                                !isPast(
                                  classItem.date,
                                  classItem.startTime
                                ) && (
                                  <Button size='sm' variant='outline'>
                                    <Video className='h-4 w-4 mr-2' />
                                    {isRTL ? 'انضم' : 'Join'}
                                  </Button>
                                )}

                              {classItem.status === 'in-progress' && (
                                <Button size='sm'>
                                  <Video className='h-4 w-4 mr-2' />
                                  {isRTL ? 'انضم الآن' : 'Join Now'}
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              ))
          ) : (
            <Card>
              <CardContent className='pt-6'>
                <div className='text-center space-y-4'>
                  <Calendar className='h-16 w-16 mx-auto text-muted-foreground' />
                  <div className='space-y-2'>
                    <h3 className='text-lg font-medium'>
                      {isRTL ? 'لا توجد حصص مجدولة' : 'No Scheduled Classes'}
                    </h3>
                    <p className='text-sm text-muted-foreground max-w-md mx-auto'>
                      {isRTL
                        ? 'لا توجد حصص مجدولة في هذه الفترة. احجز حصتك الأولى اليوم!'
                        : "You don't have any scheduled classes for this period. Book your first class today!"}
                    </p>
                  </div>
                  <Button>
                    <Plus className='h-4 w-4 mr-2' />
                    {isRTL ? 'حجز حصة' : 'Book Class'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
