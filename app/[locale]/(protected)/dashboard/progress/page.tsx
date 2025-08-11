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
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  BookOpen,
  Award,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle,
  Target,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';

interface ProgressData {
  surahs: {
    memorized: string[];
    inProgress: string[];
    totalSurahs: number;
    completionPercentage: number;
  };
  attendance: {
    thisMonth: number;
    totalClasses: number;
    attendanceRate: number;
    streak: number;
  };
  achievements: {
    id: string;
    title: string;
    description: string;
    earnedDate: string;
    type: 'memorization' | 'attendance' | 'milestone';
  }[];
  stats: {
    totalHoursStudied: number;
    averageSessionDuration: number;
    weeklyGoalProgress: number;
  };
}

export default function ProgressPage() {
  const t = useTranslations('Dashboard');
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const { user } = useAuth();

  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/student/progress');

      if (!response.ok) {
        throw new Error('Failed to fetch progress data');
      }

      const data = await response.json();

      if (data.success) {
        setProgressData(data.progress);
      } else {
        setError(data.error || 'Failed to load progress information');
      }
    } catch (err) {
      setError('An error occurred while loading progress information');
      console.error('Error fetching progress data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };

    return date.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', options);
  };

  const getAchievementIcon = (type: string) => {
    switch (type) {
      case 'memorization':
        return <BookOpen className='h-4 w-4' />;
      case 'attendance':
        return <Calendar className='h-4 w-4' />;
      case 'milestone':
        return <Target className='h-4 w-4' />;
      default:
        return <Award className='h-4 w-4' />;
    }
  };

  const getAchievementColor = (type: string) => {
    switch (type) {
      case 'memorization':
        return 'bg-blue-500';
      case 'attendance':
        return 'bg-green-500';
      case 'milestone':
        return 'bg-purple-500';
      default:
        return 'bg-yellow-500';
    }
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

  if (error || !progressData) {
    return (
      <DashboardLayout>
        <div className='space-y-6' dir={isRTL ? 'rtl' : 'ltr'}>
          <Card className='border-destructive'>
            <CardContent className='pt-6'>
              <p className='text-destructive text-center'>{error}</p>
              <div className='flex justify-center mt-4'>
                <Button onClick={fetchProgressData} variant='outline'>
                  {isRTL ? 'إعادة المحاولة' : 'Try Again'}
                </Button>
              </div>
            </CardContent>
          </Card>
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
            {isRTL ? 'تقدمي' : 'My Progress'}
          </h1>
          <p className='text-muted-foreground'>
            {isRTL
              ? 'تتبع إنجازاتك وتقدمك في الحفظ والحضور'
              : 'Track your achievements and learning progress'}
          </p>
        </div>

        {/* Stats Overview */}
        <div className='grid gap-4 grid-cols-1 md:grid-cols-3'>
          <Card>
            <CardContent className='pt-6'>
              <div
                className={cn(
                  'flex items-center gap-3',
                  isRTL && 'flex-row-reverse'
                )}
              >
                <div className='p-2 bg-blue-100 rounded-lg dark:bg-blue-900'>
                  <Clock className='h-5 w-5 text-blue-600 dark:text-blue-300' />
                </div>
                <div className={cn(isRTL && 'text-right')}>
                  <p className='text-sm text-muted-foreground'>
                    {isRTL ? 'إجمالي ساعات الدراسة' : 'Total Study Hours'}
                  </p>
                  <p className='text-2xl font-bold'>
                    {progressData.stats.totalHoursStudied}h
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='pt-6'>
              <div
                className={cn(
                  'flex items-center gap-3',
                  isRTL && 'flex-row-reverse'
                )}
              >
                <div className='p-2 bg-green-100 rounded-lg dark:bg-green-900'>
                  <TrendingUp className='h-5 w-5 text-green-600 dark:text-green-300' />
                </div>
                <div className={cn(isRTL && 'text-right')}>
                  <p className='text-sm text-muted-foreground'>
                    {isRTL ? 'معدل الحضور' : 'Attendance Rate'}
                  </p>
                  <p className='text-2xl font-bold'>
                    {progressData.attendance.attendanceRate}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='pt-6'>
              <div
                className={cn(
                  'flex items-center gap-3',
                  isRTL && 'flex-row-reverse'
                )}
              >
                <div className='p-2 bg-purple-100 rounded-lg dark:bg-purple-900'>
                  <Award className='h-5 w-5 text-purple-600 dark:text-purple-300' />
                </div>
                <div className={cn(isRTL && 'text-right')}>
                  <p className='text-sm text-muted-foreground'>
                    {isRTL ? 'الإنجازات المكتسبة' : 'Achievements Earned'}
                  </p>
                  <p className='text-2xl font-bold'>
                    {progressData.achievements.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Surah Memorization Progress */}
        <Card>
          <CardHeader>
            <CardTitle
              className={cn(
                'flex items-center gap-2',
                isRTL && 'flex-row-reverse'
              )}
            >
              <BookOpen className='h-5 w-5' />
              {isRTL ? 'تقدم حفظ السور' : 'Surah Memorization Progress'}
            </CardTitle>
            <CardDescription>
              {isRTL
                ? `${progressData.surahs.memorized.length} من ${progressData.surahs.totalSurahs} سورة مكتملة`
                : `${progressData.surahs.memorized.length} of ${progressData.surahs.totalSurahs} surahs completed`}
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <div
                className={cn(
                  'flex justify-between',
                  isRTL && 'flex-row-reverse'
                )}
              >
                <span className='text-sm font-medium'>
                  {isRTL ? 'نسبة الإنجاز' : 'Overall Progress'}
                </span>
                <span className='text-sm text-muted-foreground'>
                  {progressData.surahs.completionPercentage.toFixed(1)}%
                </span>
              </div>
              <Progress
                value={progressData.surahs.completionPercentage}
                className='h-3'
              />
            </div>

            {/* Memorized Surahs */}
            <div className='space-y-2'>
              <h4 className={cn('font-medium', isRTL && 'text-right')}>
                {isRTL ? 'السور المحفوظة' : 'Memorized Surahs'}
              </h4>
              <div className='flex flex-wrap gap-2'>
                {progressData.surahs.memorized.map((surah, index) => (
                  <Badge
                    key={index}
                    variant='secondary'
                    className='bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  >
                    <CheckCircle className='h-3 w-3 mr-1' />
                    {surah}
                  </Badge>
                ))}
              </div>
            </div>

            {/* In Progress Surahs */}
            {progressData.surahs.inProgress.length > 0 && (
              <div className='space-y-2'>
                <h4 className={cn('font-medium', isRTL && 'text-right')}>
                  {isRTL ? 'السور قيد الحفظ' : 'In Progress'}
                </h4>
                <div className='flex flex-wrap gap-2'>
                  {progressData.surahs.inProgress.map((surah, index) => (
                    <Badge
                      key={index}
                      variant='outline'
                      className='border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    >
                      <Clock className='h-3 w-3 mr-1' />
                      {surah}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Attendance Progress */}
        <Card>
          <CardHeader>
            <CardTitle
              className={cn(
                'flex items-center gap-2',
                isRTL && 'flex-row-reverse'
              )}
            >
              <Calendar className='h-5 w-5' />
              {isRTL ? 'إحصائيات الحضور' : 'Attendance Statistics'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid gap-4 grid-cols-1 md:grid-cols-2'>
              <div className={cn('space-y-2', isRTL && 'text-right')}>
                <p className='text-sm font-medium'>
                  {isRTL ? 'الحضور هذا الشهر' : "This Month's Attendance"}
                </p>
                <p className='text-3xl font-bold'>
                  {progressData.attendance.thisMonth}/
                  {progressData.attendance.totalClasses}
                </p>
                <Progress
                  value={
                    (progressData.attendance.thisMonth /
                      progressData.attendance.totalClasses) *
                    100
                  }
                  className='h-2'
                />
              </div>

              <div className={cn('space-y-2', isRTL && 'text-right')}>
                <p className='text-sm font-medium'>
                  {isRTL ? 'سلسلة الحضور' : 'Current Streak'}
                </p>
                <p className='text-3xl font-bold text-orange-600'>
                  {progressData.attendance.streak} {isRTL ? 'يوم' : 'days'}
                </p>
                <p className='text-xs text-muted-foreground'>
                  {isRTL
                    ? 'أيام متتالية من الحضور'
                    : 'consecutive days attended'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle
              className={cn(
                'flex items-center gap-2',
                isRTL && 'flex-row-reverse'
              )}
            >
              <Award className='h-5 w-5' />
              {isRTL ? 'الإنجازات' : 'Achievements'}
            </CardTitle>
            <CardDescription>
              {isRTL
                ? 'الإنجازات والمعالم التي حققتها'
                : "Milestones and achievements you've earned"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {progressData.achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={cn(
                    'flex items-center gap-3 p-3 border rounded-lg',
                    isRTL && 'flex-row-reverse'
                  )}
                >
                  <div
                    className={cn(
                      'p-2 rounded-full text-white',
                      getAchievementColor(achievement.type)
                    )}
                  >
                    {getAchievementIcon(achievement.type)}
                  </div>

                  <div className={cn('flex-1', isRTL && 'text-right')}>
                    <h4 className='font-medium'>{achievement.title}</h4>
                    <p className='text-sm text-muted-foreground'>
                      {achievement.description}
                    </p>
                  </div>

                  <div className={cn('text-right', isRTL && 'text-left')}>
                    <p className='text-xs text-muted-foreground'>
                      {formatDate(achievement.earnedDate)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
