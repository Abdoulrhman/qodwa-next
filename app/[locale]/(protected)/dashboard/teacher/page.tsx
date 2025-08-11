'use client';

import { useEffect, useState } from 'react';
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
import { Separator } from '@/components/ui/separator';
import {
  Loader2,
  Mail,
  Phone,
  GraduationCap,
  BookOpen,
  Calendar,
  MessageCircle,
  Star,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';

interface Teacher {
  id: string;
  name: string;
  email: string;
  phone?: string;
  image?: string;
  subjects?: string;
  qualifications?: string;
  teachingExperience?: number;
  isActive?: boolean;
}

interface TeacherConnection {
  id: string;
  assignedAt: string;
  isActive: boolean;
  notes?: string;
  teacher: Teacher;
}

export default function MyTeacherPage() {
  const t = useTranslations('Dashboard');
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const { user } = useAuth();

  const [primaryTeacher, setPrimaryTeacher] = useState<Teacher | null>(null);
  const [additionalTeachers, setAdditionalTeachers] = useState<
    TeacherConnection[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTeacherData();
  }, []);

  const fetchTeacherData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/student/teachers');

      if (!response.ok) {
        throw new Error('Failed to fetch teacher data');
      }

      const data = await response.json();

      if (data.success) {
        setPrimaryTeacher(data.primaryTeacher);
        setAdditionalTeachers(data.additionalTeachers || []);
      } else {
        setError(data.error || 'Failed to load teacher information');
      }
    } catch (err) {
      setError('An error occurred while loading teacher information');
      console.error('Error fetching teacher data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = (teacherId: string) => {
    // TODO: Implement message functionality
    console.log('Send message to teacher:', teacherId);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatExperience = (years?: number) => {
    if (!years) return isRTL ? 'غير محدد' : 'Not specified';
    return isRTL ? `${years} سنوات` : `${years} years`;
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

  return (
    <DashboardLayout>
      <div className='space-y-6' dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Page Header */}
        <div className={cn('space-y-2', isRTL && 'text-right')}>
          <h1 className='text-3xl font-bold'>
            {isRTL ? 'معلمي' : 'My Teachers'}
          </h1>
          <p className='text-muted-foreground'>
            {isRTL
              ? 'معلومات المعلمين المكلفين بتدريسك'
              : 'Information about your assigned teachers'}
          </p>
        </div>

        {error && (
          <Card className='border-destructive'>
            <CardContent className='pt-6'>
              <p className='text-destructive text-center'>{error}</p>
              <div className='flex justify-center mt-4'>
                <Button onClick={fetchTeacherData} variant='outline'>
                  {isRTL ? 'إعادة المحاولة' : 'Try Again'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Primary Teacher */}
        {primaryTeacher ? (
          <Card>
            <CardHeader>
              <CardTitle
                className={cn(
                  'flex items-center gap-2',
                  isRTL && 'flex-row-reverse'
                )}
              >
                <Star className='h-5 w-5 text-yellow-500' />
                {isRTL ? 'المعلم الرئيسي' : 'Primary Teacher'}
              </CardTitle>
              <CardDescription>
                {isRTL ? 'معلمك المكلف الرئيسي' : 'Your main assigned teacher'}
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div
                className={cn(
                  'flex items-start gap-4',
                  isRTL && 'flex-row-reverse'
                )}
              >
                <Avatar className='h-20 w-20'>
                  <AvatarImage
                    src={primaryTeacher.image}
                    alt={primaryTeacher.name}
                  />
                  <AvatarFallback className='text-lg'>
                    {getInitials(primaryTeacher.name)}
                  </AvatarFallback>
                </Avatar>

                <div className={cn('flex-1 space-y-3', isRTL && 'text-right')}>
                  <div>
                    <h3 className='text-xl font-semibold'>
                      {primaryTeacher.name}
                    </h3>
                    <Badge variant='secondary' className='mt-1'>
                      {isRTL ? 'نشط' : 'Active'}
                    </Badge>
                  </div>

                  {/* Contact Information */}
                  <div className='space-y-2'>
                    <div
                      className={cn(
                        'flex items-center gap-2',
                        isRTL && 'flex-row-reverse'
                      )}
                    >
                      <Mail className='h-4 w-4 text-muted-foreground' />
                      <span className='text-sm'>{primaryTeacher.email}</span>
                    </div>
                    {primaryTeacher.phone && (
                      <div
                        className={cn(
                          'flex items-center gap-2',
                          isRTL && 'flex-row-reverse'
                        )}
                      >
                        <Phone className='h-4 w-4 text-muted-foreground' />
                        <span className='text-sm'>{primaryTeacher.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Teaching Details */}
                  <Separator />
                  <div className='space-y-2'>
                    {primaryTeacher.subjects && (
                      <div
                        className={cn(
                          'flex items-center gap-2',
                          isRTL && 'flex-row-reverse'
                        )}
                      >
                        <BookOpen className='h-4 w-4 text-muted-foreground' />
                        <span className='text-sm font-medium'>
                          {isRTL ? 'المواد:' : 'Subjects:'}
                        </span>
                        <span className='text-sm'>
                          {primaryTeacher.subjects}
                        </span>
                      </div>
                    )}

                    {primaryTeacher.teachingExperience && (
                      <div
                        className={cn(
                          'flex items-center gap-2',
                          isRTL && 'flex-row-reverse'
                        )}
                      >
                        <GraduationCap className='h-4 w-4 text-muted-foreground' />
                        <span className='text-sm font-medium'>
                          {isRTL ? 'الخبرة:' : 'Experience:'}
                        </span>
                        <span className='text-sm'>
                          {formatExperience(primaryTeacher.teachingExperience)}
                        </span>
                      </div>
                    )}

                    {primaryTeacher.qualifications && (
                      <div
                        className={cn(
                          'flex items-start gap-2',
                          isRTL && 'flex-row-reverse'
                        )}
                      >
                        <GraduationCap className='h-4 w-4 text-muted-foreground mt-0.5' />
                        <div className={cn(isRTL && 'text-right')}>
                          <span className='text-sm font-medium block'>
                            {isRTL ? 'المؤهلات:' : 'Qualifications:'}
                          </span>
                          <span className='text-sm text-muted-foreground'>
                            {primaryTeacher.qualifications}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div
                    className={cn(
                      'flex gap-2 pt-2',
                      isRTL && 'flex-row-reverse'
                    )}
                  >
                    <Button
                      onClick={() => handleSendMessage(primaryTeacher.id)}
                      className='flex items-center gap-2'
                    >
                      <MessageCircle className='h-4 w-4' />
                      {isRTL ? 'إرسال رسالة' : 'Send Message'}
                    </Button>
                    <Button variant='outline'>
                      <Calendar className='h-4 w-4 mr-2' />
                      {isRTL ? 'جدولة حصة' : 'Schedule Class'}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className='pt-6'>
              <div className='text-center space-y-2'>
                <GraduationCap className='h-12 w-12 mx-auto text-muted-foreground' />
                <h3 className='text-lg font-medium'>
                  {isRTL
                    ? 'لم يتم تعيين معلم رئيسي'
                    : 'No Primary Teacher Assigned'}
                </h3>
                <p className='text-sm text-muted-foreground'>
                  {isRTL
                    ? 'سيتم تعيين معلم لك قريباً'
                    : 'A teacher will be assigned to you soon'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Additional Teachers */}
        {additionalTeachers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className={cn(isRTL && 'text-right')}>
                {isRTL ? 'معلمين إضافيين' : 'Additional Teachers'}
              </CardTitle>
              <CardDescription>
                {isRTL
                  ? 'معلمين آخرين يمكنهم مساعدتك في مواد محددة'
                  : 'Other teachers who can help you with specific subjects'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {additionalTeachers.map((connection) => (
                  <div
                    key={connection.id}
                    className={cn(
                      'flex items-center gap-4 p-4 border rounded-lg',
                      isRTL && 'flex-row-reverse'
                    )}
                  >
                    <Avatar className='h-12 w-12'>
                      <AvatarImage
                        src={connection.teacher.image}
                        alt={connection.teacher.name}
                      />
                      <AvatarFallback>
                        {getInitials(connection.teacher.name)}
                      </AvatarFallback>
                    </Avatar>

                    <div className={cn('flex-1', isRTL && 'text-right')}>
                      <h4 className='font-medium'>{connection.teacher.name}</h4>
                      <p className='text-sm text-muted-foreground'>
                        {connection.teacher.subjects ||
                          (isRTL ? 'غير محدد' : 'Not specified')}
                      </p>
                      {connection.notes && (
                        <p className='text-xs text-muted-foreground mt-1'>
                          {connection.notes}
                        </p>
                      )}
                    </div>

                    <div
                      className={cn('flex gap-2', isRTL && 'flex-row-reverse')}
                    >
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => handleSendMessage(connection.teacher.id)}
                      >
                        <MessageCircle className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
