'use client';

import { useEffect, useState } from 'react';
import {
  Book,
  Bell,
  Clock,
  Calendar,
  BookOpen,
  Award,
  TrendingUp,
  Users,
  MessageSquare,
  Target,
  Star,
  PlayCircle,
  CheckCircle2,
  ArrowRight,
  BarChart3,
} from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DashboardLayout } from '@/shared/components/layout/dashboard-layout';
import { TodoList } from '@/features/dashboard/components/todo-list';
import { TeacherDashboardOverview } from '@/features/teacher/components/teacher-dashboard-overview';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';
import { useCurrentUser } from '@/features/auth/hooks/use-current-user';
import { hasTeacherAccess } from '@/shared/utils/teacher-utils';

interface DashboardData {
  stats: {
    totalCourses: number;
    completedClasses: number;
    studyHours: number;
    currentStreak: number;
  };
  recentActivity: {
    id: string;
    type: 'class' | 'achievement' | 'assignment';
    title: string;
    description: string;
    timestamp: string;
    icon: string;
  }[];
  upcomingClasses: {
    id: string;
    subject: string;
    teacher: string;
    time: string;
    date: string;
    duration: number;
  }[];
  achievements: {
    id: string;
    title: string;
    description: string;
    earnedDate: string;
    type: 'recent' | 'featured';
  }[];
  progressOverview: {
    weeklyGoal: number;
    weeklyProgress: number;
    monthlyGoal: number;
    monthlyProgress: number;
  };
}

export default function DashboardPage() {
  const t = useTranslations('Dashboard');
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const { user } = useAuth();
  const userName = user?.name || '';

  // Add teacher/student detection
  const currentUser = useCurrentUser();
  const isTeacher = hasTeacherAccess(currentUser);

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call - replace with actual API call
    const fetchDashboardData = async () => {
      try {
        // Sample data - replace with actual API call
        const sampleData: DashboardData = {
          stats: {
            totalCourses: 3,
            completedClasses: 24,
            studyHours: 156,
            currentStreak: 7,
          },
          recentActivity: [
            {
              id: '1',
              type: 'class',
              title: 'Quran Memorization Class',
              description: 'Completed Al-Baqarah verses 1-20',
              timestamp: '2024-08-06T10:30:00Z',
              icon: '📚',
            },
            {
              id: '2',
              type: 'achievement',
              title: 'Perfect Attendance Week',
              description: 'Attended all classes this week',
              timestamp: '2024-08-05T16:00:00Z',
              icon: '🏆',
            },
            {
              id: '3',
              type: 'assignment',
              title: 'Tajweed Practice',
              description: 'Submitted recitation assignment',
              timestamp: '2024-08-04T14:20:00Z',
              icon: '✅',
            },
          ],
          upcomingClasses: [
            {
              id: '1',
              subject: 'Quran Memorization',
              teacher: 'Ahmed Al-Mansouri',
              time: '19:00',
              date: '2024-08-07',
              duration: 60,
            },
            {
              id: '2',
              subject: 'Tajweed Rules',
              teacher: 'Fatima Al-Zahra',
              time: '20:30',
              date: '2024-08-08',
              duration: 45,
            },
          ],
          achievements: [
            {
              id: '1',
              title: 'First Surah Completed',
              description: 'Successfully memorized Al-Fatiha',
              earnedDate: '2024-08-01T00:00:00Z',
              type: 'recent',
            },
            {
              id: '2',
              title: 'Consistent Learner',
              description: '7 days learning streak',
              earnedDate: '2024-08-06T00:00:00Z',
              type: 'featured',
            },
          ],
          progressOverview: {
            weeklyGoal: 10,
            weeklyProgress: 7,
            monthlyGoal: 40,
            monthlyProgress: 24,
          },
        };

        setDashboardData(sampleData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (isRTL) {
      if (hour < 12) return 'صباح الخير';
      if (hour < 17) return 'مساء الخير';
      return 'مساء الخير';
    } else {
      if (hour < 12) return 'Good Morning';
      if (hour < 17) return 'Good Afternoon';
      return 'Good Evening';
    }
  };

  const formatTime = (timeString: string) => {
    return new Date(`1970-01-01T${timeString}:00`).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className='flex h-full items-center justify-center'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4'></div>
            <p className='text-muted-foreground'>
              {isRTL ? 'جاري التحميل...' : 'Loading...'}
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Render teacher dashboard if user is a teacher
  if (isTeacher) {
    return (
      <DashboardLayout>
        <div className='space-y-6' dir={isRTL ? 'rtl' : 'ltr'}>
          {/* Welcome Header for Teacher */}
          <div className={cn('space-y-4', isRTL && 'text-right')}>
            <div className='flex items-center justify-between flex-wrap gap-4'>
              <div className={cn('space-y-2', isRTL && 'text-right')}>
                <h1 className='text-3xl font-bold'>
                  Welcome back, {userName.split(' ')[0] || 'Teacher'} 👨‍🏫
                </h1>
                <p className='text-lg text-muted-foreground'>
                  Here&apos;s an overview of your teaching activity
                </p>
              </div>
            </div>
          </div>

          {/* Teacher Dashboard Content */}
          <TeacherDashboardOverview />
        </div>
      </DashboardLayout>
    );
  }

  // Render student dashboard if user is a student
  return (
    <DashboardLayout>
      <div className='space-y-6' dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Welcome Header */}
        <div className={cn('space-y-4', isRTL && 'text-right')}>
          <div className='flex items-center justify-between flex-wrap gap-4'>
            <div className={cn('space-y-2', isRTL && 'text-right')}>
              <h1 className='text-3xl font-bold'>
                {getTimeGreeting()}, {userName.split(' ')[0] || 'Student'} 👋
              </h1>
              <p className='text-lg text-muted-foreground'>
                {isRTL
                  ? 'استمر في رحلتك التعليمية. كل خطوة تقربك من هدفك!'
                  : 'Keep up the great work and continue your Quran & Arabic learning journey! Every step makes you closer to your goal.'}
              </p>
            </div>
            <Button
              size='lg'
              className='bg-gradient-to-r from-primary to-blue-600'
            >
              {isRTL ? 'استكشاف الدورات' : 'Discover Courses'}
            </Button>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className='grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'>
          <Card className='border-l-4 border-l-blue-500'>
            <CardContent className='pt-6'>
              <div
                className={cn(
                  'flex items-center gap-3',
                  isRTL && 'flex-row-reverse'
                )}
              >
                <div className='p-2 bg-blue-100 rounded-lg dark:bg-blue-900'>
                  <Book className='h-6 w-6 text-blue-600 dark:text-blue-300' />
                </div>
                <div className={cn(isRTL && 'text-right')}>
                  <p className='text-sm font-medium text-muted-foreground'>
                    {isRTL ? 'الدورات المسجلة' : 'Enrolled Courses'}
                  </p>
                  <h3 className='text-2xl font-bold'>
                    {dashboardData?.stats.totalCourses || 0}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='border-l-4 border-l-green-500'>
            <CardContent className='pt-6'>
              <div
                className={cn(
                  'flex items-center gap-3',
                  isRTL && 'flex-row-reverse'
                )}
              >
                <div className='p-2 bg-green-100 rounded-lg dark:bg-green-900'>
                  <CheckCircle2 className='h-6 w-6 text-green-600 dark:text-green-300' />
                </div>
                <div className={cn(isRTL && 'text-right')}>
                  <p className='text-sm font-medium text-muted-foreground'>
                    {isRTL ? 'الحصص المكتملة' : 'Classes Completed'}
                  </p>
                  <h3 className='text-2xl font-bold'>
                    {dashboardData?.stats.completedClasses || 0}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='border-l-4 border-l-purple-500'>
            <CardContent className='pt-6'>
              <div
                className={cn(
                  'flex items-center gap-3',
                  isRTL && 'flex-row-reverse'
                )}
              >
                <div className='p-2 bg-purple-100 rounded-lg dark:bg-purple-900'>
                  <Clock className='h-6 w-6 text-purple-600 dark:text-purple-300' />
                </div>
                <div className={cn(isRTL && 'text-right')}>
                  <p className='text-sm font-medium text-muted-foreground'>
                    {isRTL ? 'ساعات الدراسة' : 'Study Hours'}
                  </p>
                  <h3 className='text-2xl font-bold'>
                    {dashboardData?.stats.studyHours || 0}h
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='border-l-4 border-l-orange-500'>
            <CardContent className='pt-6'>
              <div
                className={cn(
                  'flex items-center gap-3',
                  isRTL && 'flex-row-reverse'
                )}
              >
                <div className='p-2 bg-orange-100 rounded-lg dark:bg-orange-900'>
                  <Target className='h-6 w-6 text-orange-600 dark:text-orange-300' />
                </div>
                <div className={cn(isRTL && 'text-right')}>
                  <p className='text-sm font-medium text-muted-foreground'>
                    {isRTL ? 'أيام متتالية' : 'Current Streak'}
                  </p>
                  <h3 className='text-2xl font-bold'>
                    {dashboardData?.stats.currentStreak || 0}{' '}
                    {isRTL ? 'أيام' : 'days'}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className='grid gap-6 grid-cols-1 lg:grid-cols-3'>
          {/* Left Column */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Progress Overview */}
            <Card>
              <CardHeader>
                <CardTitle
                  className={cn(
                    'flex items-center gap-2',
                    isRTL && 'flex-row-reverse'
                  )}
                >
                  <BarChart3 className='h-5 w-5' />
                  {isRTL ? 'نظرة على التقدم' : 'Progress Overview'}
                </CardTitle>
                <CardDescription>
                  {isRTL
                    ? 'تتبع إنجازاتك الأسبوعية والشهرية'
                    : 'Track your weekly and monthly achievements'}
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div className='space-y-2'>
                  <div
                    className={cn(
                      'flex justify-between',
                      isRTL && 'flex-row-reverse'
                    )}
                  >
                    <span className='text-sm font-medium'>
                      {isRTL ? 'الهدف الأسبوعي' : 'Weekly Goal'}
                    </span>
                    <span className='text-sm text-muted-foreground'>
                      {dashboardData?.progressOverview.weeklyProgress || 0}/
                      {dashboardData?.progressOverview.weeklyGoal || 10}
                      {isRTL ? ' حصة' : ' classes'}
                    </span>
                  </div>
                  <Progress
                    value={
                      ((dashboardData?.progressOverview.weeklyProgress || 0) /
                        (dashboardData?.progressOverview.weeklyGoal || 10)) *
                      100
                    }
                    className='h-3'
                  />
                </div>

                <div className='space-y-2'>
                  <div
                    className={cn(
                      'flex justify-between',
                      isRTL && 'flex-row-reverse'
                    )}
                  >
                    <span className='text-sm font-medium'>
                      {isRTL ? 'الهدف الشهري' : 'Monthly Goal'}
                    </span>
                    <span className='text-sm text-muted-foreground'>
                      {dashboardData?.progressOverview.monthlyProgress || 0}/
                      {dashboardData?.progressOverview.monthlyGoal || 40}
                      {isRTL ? ' حصة' : ' classes'}
                    </span>
                  </div>
                  <Progress
                    value={
                      ((dashboardData?.progressOverview.monthlyProgress || 0) /
                        (dashboardData?.progressOverview.monthlyGoal || 40)) *
                      100
                    }
                    className='h-3'
                  />
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle
                  className={cn(
                    'flex items-center gap-2',
                    isRTL && 'flex-row-reverse'
                  )}
                >
                  <Bell className='h-5 w-5' />
                  {isRTL ? 'النشاط الأخير' : 'Recent Activity'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {dashboardData?.recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className={cn(
                        'flex items-center gap-3 p-3 border rounded-lg',
                        isRTL && 'flex-row-reverse'
                      )}
                    >
                      <div className='text-2xl'>{activity.icon}</div>
                      <div className={cn('flex-1', isRTL && 'text-right')}>
                        <h4 className='font-medium'>{activity.title}</h4>
                        <p className='text-sm text-muted-foreground'>
                          {activity.description}
                        </p>
                      </div>
                      <div className={cn('text-right', isRTL && 'text-left')}>
                        <p className='text-xs text-muted-foreground'>
                          {new Date(activity.timestamp).toLocaleDateString(
                            isRTL ? 'ar-SA' : 'en-US',
                            {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            }
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Todo List Section */}
            <Card>
              <CardHeader>
                <CardTitle
                  className={cn(
                    'flex items-center gap-2',
                    isRTL && 'flex-row-reverse'
                  )}
                >
                  <CheckCircle2 className='h-5 w-5' />
                  {isRTL ? 'قائمة المهام' : 'To-do List'}
                </CardTitle>
                <CardDescription>
                  {isRTL
                    ? 'إدارة مهامك اليومية والأسبوعية'
                    : 'Manage your daily and weekly tasks'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TodoList />
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className='space-y-6'>
            {/* Upcoming Classes */}
            <Card>
              <CardHeader>
                <CardTitle
                  className={cn(
                    'flex items-center gap-2',
                    isRTL && 'flex-row-reverse'
                  )}
                >
                  <Calendar className='h-5 w-5' />
                  {isRTL ? 'الحصص القادمة' : 'Upcoming Classes'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {dashboardData?.upcomingClasses.map((classItem) => (
                    <div
                      key={classItem.id}
                      className={cn(
                        'flex items-center gap-3 p-3 border rounded-lg hover:bg-accent transition-colors',
                        isRTL && 'flex-row-reverse'
                      )}
                    >
                      <div className='p-2 bg-primary/10 rounded-lg'>
                        <PlayCircle className='h-4 w-4 text-primary' />
                      </div>
                      <div className={cn('flex-1', isRTL && 'text-right')}>
                        <h4 className='font-medium text-sm'>
                          {classItem.subject}
                        </h4>
                        <p className='text-xs text-muted-foreground'>
                          {classItem.teacher}
                        </p>
                        <p className='text-xs text-muted-foreground'>
                          {formatTime(classItem.time)} • {classItem.duration}{' '}
                          {isRTL ? 'دقيقة' : 'min'}
                        </p>
                      </div>
                      <Button size='sm' variant='ghost'>
                        <ArrowRight
                          className={cn('h-4 w-4', isRTL && 'scale-x-[-1]')}
                        />
                      </Button>
                    </div>
                  ))}

                  <Button variant='outline' className='w-full' asChild>
                    <a href={`/${locale}/dashboard/schedule`}>
                      {isRTL ? 'عرض الجدول الكامل' : 'View Full Schedule'}
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Achievements */}
            <Card>
              <CardHeader>
                <CardTitle
                  className={cn(
                    'flex items-center gap-2',
                    isRTL && 'flex-row-reverse'
                  )}
                >
                  <Award className='h-5 w-5' />
                  {isRTL ? 'الإنجازات الأخيرة' : 'Recent Achievements'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {dashboardData?.achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className={cn(
                        'flex items-center gap-3 p-3 border rounded-lg',
                        isRTL && 'flex-row-reverse'
                      )}
                    >
                      <div
                        className={cn(
                          'p-2 rounded-full',
                          achievement.type === 'featured'
                            ? 'bg-yellow-100 dark:bg-yellow-900'
                            : 'bg-gray-100 dark:bg-gray-800'
                        )}
                      >
                        <Award
                          className={cn(
                            'h-4 w-4',
                            achievement.type === 'featured'
                              ? 'text-yellow-600 dark:text-yellow-300'
                              : 'text-gray-600 dark:text-gray-300'
                          )}
                        />
                      </div>
                      <div className={cn('flex-1', isRTL && 'text-right')}>
                        <h4 className='font-medium text-sm'>
                          {achievement.title}
                        </h4>
                        <p className='text-xs text-muted-foreground'>
                          {achievement.description}
                        </p>
                        <p className='text-xs text-muted-foreground'>
                          {new Date(achievement.earnedDate).toLocaleDateString(
                            isRTL ? 'ar-SA' : 'en-US',
                            {
                              month: 'short',
                              day: 'numeric',
                            }
                          )}
                        </p>
                      </div>
                      {achievement.type === 'featured' && (
                        <Star
                          className='h-4 w-4 text-yellow-500'
                          fill='currentColor'
                        />
                      )}
                    </div>
                  ))}

                  <Button variant='outline' className='w-full' asChild>
                    <a href={`/${locale}/dashboard/progress`}>
                      {isRTL ? 'عرض جميع الإنجازات' : 'View All Achievements'}
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className={cn(isRTL && 'text-right')}>
                  {isRTL ? 'إجراءات سريعة' : 'Quick Actions'}
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <Button
                  variant='outline'
                  className='w-full justify-start'
                  asChild
                >
                  <a href={`/${locale}/dashboard/teacher`}>
                    <Users className='h-4 w-4 mr-2' />
                    {isRTL ? 'تواصل مع المعلم' : 'Contact Teacher'}
                  </a>
                </Button>

                <Button
                  variant='outline'
                  className='w-full justify-start'
                  asChild
                >
                  <a href={`/${locale}/dashboard/packages`}>
                    <BookOpen className='h-4 w-4 mr-2' />
                    {isRTL ? 'الباقات المشترك بها' : 'My Packages'}
                  </a>
                </Button>

                <Button
                  variant='outline'
                  className='w-full justify-start'
                  asChild
                >
                  <a href={`/${locale}/dashboard/messages`}>
                    <MessageSquare className='h-4 w-4 mr-2' />
                    {isRTL ? 'الرسائل' : 'Messages'}
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
