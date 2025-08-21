'use client';

import { useState, useEffect } from 'react';
import { Calendar, Plus, Clock, BookOpen } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useCurrentUser } from '@/features/auth/hooks/use-current-user';
import { FreeSessionBookingForm } from './free-session-booking-form';
import { FreeSessionBookingsList } from './free-session-bookings-list';
import { FreeSessionBooking } from '@/data/free-session-booking';

export const FreeSessionDashboard = () => {
  const t = useTranslations('FreeSession');
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const user = useCurrentUser();

  const [bookings, setBookings] = useState<FreeSessionBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch bookings from API
  useEffect(() => {
    const fetchBookings = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/free-session');
        const data = await response.json();

        if (response.ok && data.success) {
          setBookings(data.bookings || []);
        } else {
          console.error('Failed to fetch bookings:', data);
          setBookings([]);
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
        setBookings([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) {
      fetchBookings();
    }
  }, [user?.id]);

  const handleBookingSuccess = () => {
    setIsDialogOpen(false);
    // Refresh bookings
    const refreshBookings = async () => {
      try {
        const response = await fetch('/api/free-session');
        const data = await response.json();

        if (response.ok && data.success) {
          setBookings(data.bookings || []);
        }
      } catch (error) {
        console.error('Error refreshing bookings:', error);
      }
    };
    refreshBookings();
  };

  const pendingBookings = bookings.filter((b) => b.status === 'PENDING');
  const scheduledBookings = bookings.filter((b) => b.status === 'SCHEDULED');
  const completedBookings = bookings.filter((b) =>
    ['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(b.status)
  );

  if (isLoading) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4'></div>
          <p className='text-muted-foreground'>
            {isRTL ? 'جاري التحميل...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  // Show booking form if no bookings exist
  if (bookings.length === 0) {
    return (
      <div className='space-y-6'>
        {/* Welcome Card */}
        <Card className='w-full'>
          <CardHeader
            className={cn('text-center space-y-4', isRTL && 'text-right')}
          >
            <div className='mx-auto p-4 bg-primary/10 rounded-full w-fit'>
              <Calendar className='h-12 w-12 text-primary' />
            </div>
            <div>
              <CardTitle className='text-2xl mb-2'>
                {isRTL
                  ? 'مرحباً بك في منصة قدوة!'
                  : 'Welcome to Qodwa Platform!'}
              </CardTitle>
              <CardDescription className='text-lg'>
                {isRTL
                  ? 'احجز جلستك المجانية الأولى لتقييم احتياجاتك التعليمية وبدء رحلتك في تعلم القرآن والعربية'
                  : 'Book your first free session to evaluate your learning needs and start your Quran & Arabic learning journey'}
              </CardDescription>
            </div>
          </CardHeader>
        </Card>

        {/* Booking Form */}
        <FreeSessionBookingForm onSuccess={handleBookingSuccess} />
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div
        className={cn(
          'flex items-center justify-between',
          isRTL && 'flex-row-reverse'
        )}
      >
        <div className={isRTL ? 'text-right' : ''}>
          <h1 className='text-3xl font-bold'>
            {isRTL ? 'الجلسات المجانية' : 'Free Sessions'}
          </h1>
          <p className='text-muted-foreground'>
            {isRTL
              ? 'إدارة وتتبع جلساتك المجانية'
              : 'Manage and track your free sessions'}
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className={cn(
                'flex items-center gap-2',
                isRTL && 'flex-row-reverse'
              )}
            >
              <Plus className='h-4 w-4' />
              {isRTL ? 'احجز جلسة جديدة' : 'Book New Session'}
            </Button>
          </DialogTrigger>
          <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
            <DialogHeader className={isRTL ? 'text-right' : ''}>
              <DialogTitle>
                {isRTL ? 'احجز جلسة مجانية جديدة' : 'Book a New Free Session'}
              </DialogTitle>
              <DialogDescription>
                {isRTL
                  ? 'احجز جلسة تجريبية مجانية أخرى لاستكشاف موضوع جديد'
                  : 'Book another free trial session to explore a new subject'}
              </DialogDescription>
            </DialogHeader>
            <FreeSessionBookingForm onSuccess={handleBookingSuccess} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <Card>
          <CardContent className='p-6'>
            <div
              className={cn(
                'flex items-center gap-4',
                isRTL && 'flex-row-reverse'
              )}
            >
              <div className='p-2 bg-yellow-100 rounded-lg dark:bg-yellow-900'>
                <Clock className='h-6 w-6 text-yellow-600 dark:text-yellow-300' />
              </div>
              <div className={isRTL ? 'text-right' : ''}>
                <p className='text-sm font-medium text-muted-foreground'>
                  {isRTL ? 'في الانتظار' : 'Pending'}
                </p>
                <h3 className='text-2xl font-bold'>{pendingBookings.length}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div
              className={cn(
                'flex items-center gap-4',
                isRTL && 'flex-row-reverse'
              )}
            >
              <div className='p-2 bg-blue-100 rounded-lg dark:bg-blue-900'>
                <Calendar className='h-6 w-6 text-blue-600 dark:text-blue-300' />
              </div>
              <div className={isRTL ? 'text-right' : ''}>
                <p className='text-sm font-medium text-muted-foreground'>
                  {isRTL ? 'مجدولة' : 'Scheduled'}
                </p>
                <h3 className='text-2xl font-bold'>
                  {scheduledBookings.length}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div
              className={cn(
                'flex items-center gap-4',
                isRTL && 'flex-row-reverse'
              )}
            >
              <div className='p-2 bg-green-100 rounded-lg dark:bg-green-900'>
                <BookOpen className='h-6 w-6 text-green-600 dark:text-green-300' />
              </div>
              <div className={isRTL ? 'text-right' : ''}>
                <p className='text-sm font-medium text-muted-foreground'>
                  {isRTL ? 'مكتملة' : 'Completed'}
                </p>
                <h3 className='text-2xl font-bold'>
                  {completedBookings.length}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bookings List */}
      <Tabs defaultValue='all' className='w-full' dir={isRTL ? 'rtl' : 'ltr'}>
        <TabsList className='grid w-full grid-cols-4'>
          <TabsTrigger value='all'>{isRTL ? 'الكل' : 'All'}</TabsTrigger>
          <TabsTrigger value='pending'>
            {isRTL ? 'في الانتظار' : 'Pending'}
          </TabsTrigger>
          <TabsTrigger value='scheduled'>
            {isRTL ? 'مجدولة' : 'Scheduled'}
          </TabsTrigger>
          <TabsTrigger value='completed'>
            {isRTL ? 'مكتملة' : 'Completed'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value='all' className='mt-6'>
          <FreeSessionBookingsList bookings={bookings} />
        </TabsContent>

        <TabsContent value='pending' className='mt-6'>
          <FreeSessionBookingsList bookings={pendingBookings} />
        </TabsContent>

        <TabsContent value='scheduled' className='mt-6'>
          <FreeSessionBookingsList bookings={scheduledBookings} />
        </TabsContent>

        <TabsContent value='completed' className='mt-6'>
          <FreeSessionBookingsList bookings={completedBookings} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
