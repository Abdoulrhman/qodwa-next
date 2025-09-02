'use client';

import { useState, useTransition } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Calendar, Clock, BookOpen, MessageCircle, Globe } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormError } from '@/shared/components/form-error';
import { FormSuccess } from '@/shared/components/form-success';
import { cn } from '@/lib/utils';

const FreeSessionBookingSchema = z.object({
  sessionDate: z.string().min(1, 'Session date is required'),
  sessionTime: z.string().min(1, 'Session time is required'),
  duration: z.string().min(1, 'Duration is required'),
  subject: z.string().min(1, 'Subject is required'),
  studentNotes: z.string().optional(),
  timezone: z.string().min(1, 'Timezone is required'),
});

interface FreeSessionBookingFormProps {
  onSuccess?: () => void;
  className?: string;
}

export const FreeSessionBookingForm = ({
  onSuccess,
  className,
}: FreeSessionBookingFormProps) => {
  const t = useTranslations('FreeSession');
  const locale = useLocale();
  const isRTL = locale === 'ar';

  const [error, setError] = useState<string | undefined>('');
  const [success, setSuccess] = useState<string | undefined>('');
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof FreeSessionBookingSchema>>({
    resolver: zodResolver(FreeSessionBookingSchema),
    defaultValues: {
      sessionDate: '',
      sessionTime: '',
      duration: '30',
      subject: '',
      studentNotes: '',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  });

  const onSubmit = (values: z.infer<typeof FreeSessionBookingSchema>) => {
    setError('');
    setSuccess('');

    startTransition(async () => {
      try {
        const response = await fetch('/api/free-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || data || 'Failed to book session');
          return;
        }

        if (data.success) {
          setSuccess(data.message || t('form.bookingSuccess'));
          form.reset();
          onSuccess?.();
        } else {
          setError(data.message || 'Failed to book session');
        }
      } catch (error) {
        console.error('Booking error:', error);
        setError(
          isRTL ? 'حدث خطأ في الحجز' : 'An error occurred while booking'
        );
      }
    });
  };

  // Generate time slots (9 AM to 9 PM)
  const timeSlots: string[] = [];
  for (let hour = 9; hour <= 21; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      timeSlots.push(time);
    }
  }

  // Get minimum date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  // Get maximum date (30 days from now)
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  const maxDateString = maxDate.toISOString().split('T')[0];

  return (
    <Card className={cn('w-full max-w-2xl mx-auto', className)}>
      <CardHeader className={cn('space-y-4', isRTL && 'text-right')}>
        <div
          className={cn('flex items-center gap-3', isRTL && 'flex-row-reverse')}
        >
          <div className='p-2 bg-primary/10 rounded-lg'>
            <Calendar className='h-6 w-6 text-primary' />
          </div>
          <div>
            <CardTitle className='text-2xl'>
              {isRTL ? 'احجز جلسة مجانية' : 'Book Your Free Session'}
            </CardTitle>
            <CardDescription>
              {isRTL
                ? 'احجز جلسة تجريبية مجانية لتقييم احتياجاتك وأهدافك التعليمية'
                : 'Schedule a free trial session to evaluate your learning needs and goals'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className='space-y-6'>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            {/* Date and Time Selection */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='sessionDate'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel
                      className={cn(
                        'flex items-center gap-2',
                        isRTL && 'flex-row-reverse'
                      )}
                    >
                      <Calendar className='h-4 w-4' />
                      {isRTL ? 'تاريخ الجلسة' : 'Session Date'}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type='date'
                        min={minDate}
                        max={maxDateString}
                        disabled={isPending}
                        className={isRTL ? 'text-right' : ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='sessionTime'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel
                      className={cn(
                        'flex items-center gap-2',
                        isRTL && 'flex-row-reverse'
                      )}
                    >
                      <Clock className='h-4 w-4' />
                      {isRTL ? 'وقت الجلسة' : 'Session Time'}
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className={isRTL ? 'text-right' : ''}>
                          <SelectValue
                            placeholder={isRTL ? 'اختر الوقت' : 'Select time'}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Duration and Subject */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='duration'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel
                      className={cn(
                        'flex items-center gap-2',
                        isRTL && 'flex-row-reverse'
                      )}
                    >
                      <Clock className='h-4 w-4' />
                      {isRTL ? 'مدة الجلسة' : 'Session Duration'}
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className={isRTL ? 'text-right' : ''}>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='30'>
                          {isRTL ? '30 دقيقة' : '30 minutes'}
                        </SelectItem>
                        <SelectItem value='60'>
                          {isRTL ? '60 دقيقة' : '60 minutes'}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='subject'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel
                      className={cn(
                        'flex items-center gap-2',
                        isRTL && 'flex-row-reverse'
                      )}
                    >
                      <BookOpen className='h-4 w-4' />
                      {isRTL ? 'الموضوع' : 'Subject'}
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className={isRTL ? 'text-right' : ''}>
                          <SelectValue
                            placeholder={
                              isRTL ? 'اختر الموضوع' : 'Select subject'
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='quran-memorization'>
                          {isRTL ? 'حفظ القرآن' : 'Quran Memorization'}
                        </SelectItem>
                        <SelectItem value='quran-recitation'>
                          {isRTL ? 'تلاوة القرآن' : 'Quran Recitation'}
                        </SelectItem>
                        <SelectItem value='tajweed'>
                          {isRTL ? 'التجويد' : 'Tajweed'}
                        </SelectItem>
                        <SelectItem value='arabic-language'>
                          {isRTL ? 'اللغة العربية' : 'Arabic Language'}
                        </SelectItem>
                        <SelectItem value='islamic-studies'>
                          {isRTL ? 'الدراسات الإسلامية' : 'Islamic Studies'}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Timezone */}
            <FormField
              control={form.control}
              name='timezone'
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    className={cn(
                      'flex items-center gap-2',
                      isRTL && 'flex-row-reverse'
                    )}
                  >
                    <Globe className='h-4 w-4' />
                    {isRTL ? 'المنطقة الزمنية' : 'Timezone'}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      placeholder={
                        Intl.DateTimeFormat().resolvedOptions().timeZone
                      }
                      className={isRTL ? 'text-right' : ''}
                    />
                  </FormControl>
                  <FormDescription>
                    {isRTL
                      ? 'يتم تحديد المنطقة الزمنية تلقائياً بناءً على موقعك'
                      : 'Your timezone is automatically detected based on your location'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Student Notes */}
            <FormField
              control={form.control}
              name='studentNotes'
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    className={cn(
                      'flex items-center gap-2',
                      isRTL && 'flex-row-reverse'
                    )}
                  >
                    <MessageCircle className='h-4 w-4' />
                    {isRTL ? 'ملاحظات إضافية' : 'Additional Notes'}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      disabled={isPending}
                      placeholder={
                        isRTL
                          ? 'أخبرنا عن أهدافك التعليمية أو أي متطلبات خاصة...'
                          : 'Tell us about your learning goals or any special requirements...'
                      }
                      className={cn('min-h-[100px]', isRTL && 'text-right')}
                    />
                  </FormControl>
                  <FormDescription>
                    {isRTL
                      ? 'شارك أهدافك التعليمية لنتمكن من تخصيص الجلسة حسب احتياجاتك'
                      : 'Share your learning goals so we can customize the session to your needs'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormError message={error} />
            <FormSuccess message={success} />

            <Button
              disabled={isPending}
              type='submit'
              className='w-full'
              size='lg'
            >
              {isPending
                ? isRTL
                  ? 'جاري الحجز...'
                  : 'Booking...'
                : isRTL
                  ? 'احجز الجلسة المجانية'
                  : 'Book Free Session'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
