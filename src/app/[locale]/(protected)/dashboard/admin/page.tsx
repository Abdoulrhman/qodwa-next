'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RoleGate } from '@/features/auth/components/role-gate';
import { Progress } from '@/components/ui/progress';
import { useTranslations } from 'next-intl';
import {
  Package,
  Users,
  BookOpen,
  Calendar,
  MessageCircle,
  BarChart3,
  Crown,
  Clock,
  Star,
  Plus,
  ArrowRight,
  CheckCircle,
  Award,
  Zap,
  Target,
} from 'lucide-react';
import { Link } from '@/i18n/routing';

interface AdminStats {
  totalPackages: number;
  totalUsers: number;
  totalSubscriptions: number;
  revenue: number;
  totalTeachers: number;
  pendingApprovals: number;
  studyHours: number;
  currentStreak: number;
}

interface RecentActivity {
  id: string;
  type: 'memorization' | 'attendance' | 'practice';
  title: string;
  time: string;
  completed?: boolean;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
  featured?: boolean;
}

export default function AdminDashboard() {
  const t = useTranslations('Dashboard.admin');
  const [stats, setStats] = useState<AdminStats>({
    totalPackages: 0,
    totalUsers: 0,
    totalSubscriptions: 0,
    revenue: 0,
    totalTeachers: 0,
    pendingApprovals: 0,
    studyHours: 0,
    currentStreak: 0,
  });

  useEffect(() => {
    // Simulate fetching real data
    setStats({
      totalPackages: 24,
      totalUsers: 156,
      totalSubscriptions: 45,
      revenue: 12500,
      totalTeachers: 8,
      pendingApprovals: 3,
      studyHours: 156,
      currentStreak: 7,
    });
  }, []);

  const [recentActivities] = useState<RecentActivity[]>([
    {
      id: '1',
      type: 'memorization',
      title: t('activities.quran_memorization'),
      time: 'Aug 6, 01:30 PM',
      completed: true,
    },
    {
      id: '2',
      type: 'attendance',
      title: t('activities.perfect_attendance'),
      time: 'Aug 5, 01:00 PM',
      completed: true,
    },
    {
      id: '3',
      type: 'practice',
      title: t('activities.tajweed_practice'),
      time: 'Aug 6, 05:30 PM',
      completed: false,
    },
  ]);

  const [achievements] = useState<Achievement[]>([
    {
      id: '1',
      title: t('achievements.first_surah_completed'),
      description: 'Successfully memorized Al-Fatiha',
      date: 'Aug 1',
      featured: true,
    },
    {
      id: '2',
      title: t('achievements.consistent_learner'),
      description: '7 days without missing',
      date: 'Aug 3',
    },
  ]);

  return (
    <RoleGate allowedRole='ADMIN'>
      <div className='container mx-auto px-4 py-8'>
        {/* Header */}
        <div className='flex items-center justify-between mb-8'>
          <div>
            <h1 className='text-3xl font-bold flex items-center gap-2'>
              <Crown className='h-8 w-8 text-yellow-500' />
              {t('welcome')} 👋
            </h1>
            <p className='text-muted-foreground mt-2'>{t('subtitle')}</p>
          </div>
          <Button className='bg-blue-600 hover:bg-blue-700'>
            {t('discover_courses')}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
          <Card className='border-l-4 border-l-blue-500'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                {t('stats.enrolled_courses')}
              </CardTitle>
              <BookOpen className='h-4 w-4 text-blue-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-blue-600'>
                {stats.totalPackages}
              </div>
              <p className='text-xs text-muted-foreground'>
                +2 from last month
              </p>
            </CardContent>
          </Card>

          <Card className='border-l-4 border-l-green-500'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                {t('stats.classes_completed')}
              </CardTitle>
              <CheckCircle className='h-4 w-4 text-green-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-green-600'>244</div>
              <p className='text-xs text-muted-foreground'>+18 this week</p>
            </CardContent>
          </Card>

          <Card className='border-l-4 border-l-purple-500'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                {t('stats.study_hours')}
              </CardTitle>
              <Clock className='h-4 w-4 text-purple-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-purple-600'>
                {stats.studyHours}h
              </div>
              <p className='text-xs text-muted-foreground'>+5h this week</p>
            </CardContent>
          </Card>

          <Card className='border-l-4 border-l-orange-500'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                {t('stats.current_streak')}
              </CardTitle>
              <Zap className='h-4 w-4 text-orange-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-orange-600'>
                {stats.currentStreak} {t('stats.days')}
              </div>
              <p className='text-xs text-muted-foreground'>Keep going! 🔥</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Progress Overview */}
          <Card className='lg:col-span-2'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <BarChart3 className='h-5 w-5' />
                {t('sections.progress_overview')}
              </CardTitle>
              <p className='text-sm text-muted-foreground'>
                Track your weekly and monthly achievements.
              </p>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div>
                  <div className='flex justify-between items-center mb-2'>
                    <span className='text-sm font-medium'>Weekly Goal</span>
                    <span className='text-sm text-muted-foreground'>
                      7/10 classes
                    </span>
                  </div>
                  <Progress value={70} className='h-2' />
                </div>
                <div>
                  <div className='flex justify-between items-center mb-2'>
                    <span className='text-sm font-medium'>Monthly Goal</span>
                    <span className='text-sm text-muted-foreground'>
                      24/40 classes
                    </span>
                  </div>
                  <Progress value={60} className='h-2' />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Classes */}
          <Card>
            <CardHeader className='flex flex-row items-center justify-between'>
              <CardTitle className='flex items-center gap-2'>
                <Calendar className='h-5 w-5' />
                {t('sections.upcoming_classes')}
              </CardTitle>
              <Button size='sm' variant='ghost'>
                <ArrowRight className='h-4 w-4' />
              </Button>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center gap-3 p-3 border rounded-lg'>
                <div className='w-2 h-8 bg-blue-500 rounded'></div>
                <div className='flex-1'>
                  <p className='font-medium text-sm'>Quran Memorization</p>
                  <p className='text-xs text-muted-foreground'>
                    01:00 PM • 40 min
                  </p>
                </div>
                <ArrowRight className='h-4 w-4 text-muted-foreground' />
              </div>
              <div className='flex items-center gap-3 p-3 border rounded-lg'>
                <div className='w-2 h-8 bg-green-500 rounded'></div>
                <div className='flex-1'>
                  <p className='font-medium text-sm'>Tajweed Rules</p>
                  <p className='text-xs text-muted-foreground'>
                    03:00 PM • 40 min
                  </p>
                </div>
                <ArrowRight className='h-4 w-4 text-muted-foreground' />
              </div>
              <Button variant='outline' className='w-full' size='sm'>
                View Full Schedule
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Content Grid */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6'>
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Target className='h-5 w-5' />
                {t('sections.recent_activity')}
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              {recentActivities.map((activity) => (
                <div key={activity.id} className='flex items-center gap-3'>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activity.completed
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {activity.type === 'memorization' && (
                      <BookOpen className='h-4 w-4' />
                    )}
                    {activity.type === 'attendance' && (
                      <Star className='h-4 w-4' />
                    )}
                    {activity.type === 'practice' && (
                      <Target className='h-4 w-4' />
                    )}
                  </div>
                  <div className='flex-1'>
                    <p className='font-medium text-sm'>{activity.title}</p>
                    <p className='text-xs text-muted-foreground'>
                      {activity.time}
                    </p>
                  </div>
                  {activity.completed && (
                    <CheckCircle className='h-4 w-4 text-green-500' />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Achievements */}
          <Card>
            <CardHeader className='flex flex-row items-center justify-between'>
              <CardTitle className='flex items-center gap-2'>
                <Award className='h-5 w-5' />
                {t('sections.recent_achievements')}
              </CardTitle>
              <Button size='sm' variant='ghost' disabled>
                View All Achievements
              </Button>
            </CardHeader>
            <CardContent className='space-y-4'>
              {achievements.map((achievement) => (
                <div key={achievement.id} className='flex items-center gap-3'>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      achievement.featured
                        ? 'bg-yellow-100 text-yellow-600'
                        : 'bg-blue-100 text-blue-600'
                    }`}
                  >
                    <Award className='h-4 w-4' />
                  </div>
                  <div className='flex-1'>
                    <p className='font-medium text-sm'>{achievement.title}</p>
                    <p className='text-xs text-muted-foreground'>
                      {achievement.description}
                    </p>
                  </div>
                  <span className='text-xs text-muted-foreground'>
                    {achievement.date}
                  </span>
                  {achievement.featured && (
                    <Star className='h-4 w-4 text-yellow-500 fill-current' />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* To-do List and Quick Actions */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6'>
          {/* To-do List */}
          <Card>
            <CardHeader className='flex flex-row items-center justify-between'>
              <CardTitle className='flex items-center gap-2'>
                <CheckCircle className='h-5 w-5' />
                {t('sections.todo_list')}
              </CardTitle>
              <Button size='sm' variant='ghost'>
                <Plus className='h-4 w-4' />
                Add Task
              </Button>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                <div className='flex items-center gap-3 text-sm'>
                  <input type='checkbox' className='rounded' defaultChecked />
                  <span className='line-through text-muted-foreground'>
                    Save Surat Al-Kawthar
                  </span>
                  <Button
                    size='sm'
                    variant='ghost'
                    className='ml-auto text-red-500'
                  >
                    ×
                  </Button>
                </div>
                <div className='flex items-center gap-3 text-sm'>
                  <input type='checkbox' className='rounded' />
                  <span>Complete Tajweed exercises</span>
                </div>
                <div className='flex items-center gap-3 text-sm'>
                  <input type='checkbox' className='rounded' />
                  <span>Review last week&apos;s lessons</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Zap className='h-5 w-5' />
                {t('sections.quick_actions')}
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <Button
                variant='outline'
                className='w-full justify-start'
                asChild
              >
                <Link href='/dashboard/admin/teachers'>
                  <Users className='h-4 w-4 mr-2' />
                  {t('quick_actions.contact_teacher')}
                </Link>
              </Button>
              <Button
                variant='outline'
                className='w-full justify-start'
                asChild
              >
                <Link href='/dashboard/admin/packages'>
                  <Package className='h-4 w-4 mr-2' />
                  {t('quick_actions.my_packages')}
                </Link>
              </Button>
              <Button
                variant='outline'
                className='w-full justify-start'
                asChild
              >
                <Link href='/dashboard/messages'>
                  <MessageCircle className='h-4 w-4 mr-2' />
                  {t('quick_actions.messages')}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </RoleGate>
  );
}
