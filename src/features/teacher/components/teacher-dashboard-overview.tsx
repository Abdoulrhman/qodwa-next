'use client';

import { useState, useEffect } from 'react';
import { useCurrentUser } from '@/features/auth/hooks/use-current-user';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Users,
  BookOpen,
  DollarSign,
  Clock,
  Star,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { hasTeacherAccess } from '@/shared/utils/teacher-utils';

interface TeacherStats {
  totalStudents: number;
  activeClasses: number;
  totalEarnings: number;
  averageRating: number;
  upcomingClasses: number;
  completedClasses: number;
}

export const TeacherDashboardOverview = () => {
  const t = useTranslations();
  const user = useCurrentUser();
  const [stats, setStats] = useState<TeacherStats>({
    totalStudents: 0,
    activeClasses: 0,
    totalEarnings: 0,
    averageRating: 0,
    upcomingClasses: 0,
    completedClasses: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeacherStats = async () => {
      try {
        const response = await fetch('/api/teacher/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch teacher stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (hasTeacherAccess(user)) {
      fetchTeacherStats();
    }
  }, [user]);

  if (!hasTeacherAccess(user)) {
    return (
      <div className='text-center py-8'>
        <p className='text-muted-foreground'>
          Access denied. Teacher account required.
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Welcome Section */}
      <div className='bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg'>
        <h1 className='text-2xl font-bold mb-2'>
          {t('teacherDashboard.welcome', { default: 'Welcome back' })},{' '}
          {user?.name}!
        </h1>
        <p className='text-blue-100'>
          {t('teacherDashboard.subtitle', {
            default: "Here's an overview of your teaching activity",
          })}
        </p>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              {t('teacherDashboard.totalStudents', {
                default: 'Total Students',
              })}
            </CardTitle>
            <Users className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {loading ? '...' : stats.totalStudents}
            </div>
            <p className='text-xs text-muted-foreground'>
              {t('teacherDashboard.activeStudents', {
                default: 'Active students',
              })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              {t('teacherDashboard.activeClasses', {
                default: 'Active Classes',
              })}
            </CardTitle>
            <BookOpen className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {loading ? '...' : stats.activeClasses}
            </div>
            <p className='text-xs text-muted-foreground'>
              {t('teacherDashboard.ongoingClasses', {
                default: 'Ongoing classes',
              })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              {t('teacherDashboard.totalEarnings', {
                default: 'Total Earnings',
              })}
            </CardTitle>
            <DollarSign className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              ${loading ? '...' : stats.totalEarnings.toFixed(2)}
            </div>
            <p className='text-xs text-muted-foreground'>
              {t('teacherDashboard.thisMonth', { default: 'This month' })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              {t('teacherDashboard.averageRating', {
                default: 'Average Rating',
              })}
            </CardTitle>
            <Star className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {loading ? '...' : stats.averageRating.toFixed(1)}
            </div>
            <p className='text-xs text-muted-foreground'>
              {t('teacherDashboard.outOfFive', { default: 'out of 5' })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              {t('teacherDashboard.upcomingClasses', {
                default: 'Upcoming Classes',
              })}
            </CardTitle>
            <Clock className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {loading ? '...' : stats.upcomingClasses}
            </div>
            <p className='text-xs text-muted-foreground'>
              {t('teacherDashboard.nextWeek', { default: 'Next 7 days' })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              {t('teacherDashboard.completedClasses', {
                default: 'Completed Classes',
              })}
            </CardTitle>
            <Calendar className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {loading ? '...' : stats.completedClasses}
            </div>
            <p className='text-xs text-muted-foreground'>
              {t('teacherDashboard.totalCompleted', {
                default: 'Total completed',
              })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>
            {t('teacherDashboard.quickActions', { default: 'Quick Actions' })}
          </CardTitle>
          <CardDescription>
            {t('teacherDashboard.quickActionsDesc', {
              default: 'Manage your teaching activities',
            })}
          </CardDescription>
        </CardHeader>
        <CardContent className='flex flex-wrap gap-4'>
          <Button>
            <Calendar className='mr-2 h-4 w-4' />
            {t('teacherDashboard.viewSchedule', { default: 'View Schedule' })}
          </Button>
          <Button variant='outline'>
            <Users className='mr-2 h-4 w-4' />
            {t('teacherDashboard.manageStudents', {
              default: 'Manage Students',
            })}
          </Button>
          <Button variant='outline'>
            <BookOpen className='mr-2 h-4 w-4' />
            {t('teacherDashboard.createLesson', { default: 'Create Lesson' })}
          </Button>
          <Button variant='outline'>
            <DollarSign className='mr-2 h-4 w-4' />
            {t('teacherDashboard.viewEarnings', { default: 'View Earnings' })}
          </Button>
        </CardContent>
      </Card>

      {/* Profile Status */}
      <Card>
        <CardHeader>
          <CardTitle>
            {t('teacherDashboard.profileStatus', { default: 'Profile Status' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex items-center justify-between'>
            <div>
              <p className='font-medium'>{user?.name}</p>
              <p className='text-sm text-muted-foreground'>{user?.email}</p>
              <div className='flex gap-2 mt-2'>
                <Badge variant='secondary'>
                  {(user as any)?.subjects || 'No subjects listed'}
                </Badge>
                <Badge variant='outline'>
                  {(user as any)?.teachingExperience
                    ? `${(user as any)?.teachingExperience} years experience`
                    : 'New teacher'}
                </Badge>
              </div>
            </div>
            <Button variant='outline'>
              {t('teacherDashboard.editProfile', { default: 'Edit Profile' })}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
