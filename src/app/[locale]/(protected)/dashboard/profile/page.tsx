'use client';

import { useEffect, useState } from 'react';
import {
  Loader2,
  Camera,
  User,
  Mail,
  Lock,
  Check,
  GraduationCap,
  Phone,
  BookOpen,
} from 'lucide-react';

import { DashboardLayout } from '@/shared/components/layout/dashboard-layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { UserAvatar } from '@/components/ui/user-avatar';
import { useAuth } from '@/contexts/auth-context';
import { useCurrentUser } from '@/features/auth/hooks/use-current-user';
import { hasTeacherAccess } from '@/shared/utils/teacher-utils';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const currentUser = useCurrentUser();
  const isTeacher = hasTeacherAccess(currentUser);

  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
  });

  // Teacher-specific state
  const [teacherData, setTeacherData] = useState({
    qualifications: '',
    subjects: '',
    teachingExperience: '',
    phone: '',
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
      });

      // Populate teacher-specific data if user is a teacher
      if (isTeacher) {
        setTeacherData({
          qualifications: (user as any)?.qualifications || '',
          subjects: (user as any)?.subjects || '',
          teachingExperience:
            (user as any)?.teachingExperience?.toString() || '',
          phone: (user as any)?.phone || '',
        });
      }
    }
  }, [user, isTeacher]);

  if (isLoading) {
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
      <div className='space-y-8 max-w-4xl'>
        {/* Header Section */}
        <div className='flex items-start justify-between'>
          <div className='space-y-1'>
            <h1 className='text-3xl font-bold tracking-tight'>
              Profile Settings
            </h1>
            <p className='text-lg text-muted-foreground'>
              Manage your account settings and preferences
            </p>
          </div>
          <Badge variant='secondary' className='flex items-center gap-2'>
            <Check className='h-3 w-3' />
            Verified Account
          </Badge>
        </div>

        {/* Profile Overview Card */}
        <Card className='border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20'>
          <CardContent className='pt-6'>
            <div className='flex flex-col md:flex-row items-center md:items-start gap-6'>
              <div className='relative group'>
                <UserAvatar
                  size={120}
                  className='ring-4 ring-white shadow-xl'
                />
                <Button
                  size='sm'
                  className='absolute -bottom-2 -right-2 h-10 w-10 rounded-full shadow-lg group-hover:scale-110 transition-transform'
                >
                  <Camera className='h-4 w-4' />
                </Button>
              </div>
              <div className='flex-1 text-center md:text-left'>
                <h2 className='text-2xl font-bold mb-2'>
                  {user?.name || 'User Name'}
                </h2>
                <p className='text-muted-foreground mb-4'>{user?.email}</p>
                <div className='flex flex-wrap gap-2 justify-center md:justify-start'>
                  <Badge variant='outline' className='flex items-center gap-1'>
                    <User className='h-3 w-3' />
                    {user?.role || 'Student'}
                  </Badge>
                  <Badge variant='outline' className='flex items-center gap-1'>
                    <Mail className='h-3 w-3' />
                    Email Verified
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className='grid gap-8 md:grid-cols-2'>
          {/* Personal Information */}
          <Card className='shadow-md'>
            <CardHeader className='pb-4'>
              <div className='flex items-center gap-2'>
                <User className='h-5 w-5 text-blue-600' />
                <CardTitle>Personal Information</CardTitle>
              </div>
              <CardDescription>
                Update your personal information and email address
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='name' className='text-sm font-medium'>
                  Full Name
                </Label>
                <Input
                  id='name'
                  value={profileData.name}
                  onChange={(e) =>
                    setProfileData({ ...profileData, name: e.target.value })
                  }
                  placeholder='Enter your full name'
                  className='h-11'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='email' className='text-sm font-medium'>
                  Email Address
                </Label>
                <Input
                  id='email'
                  type='email'
                  value={profileData.email}
                  placeholder='Enter your email'
                  disabled
                  className='h-11 bg-muted'
                />
                <p className='text-xs text-muted-foreground'>
                  Email cannot be changed. Contact support if needed.
                </p>
              </div>
              <Separator />
              <Button className='w-full h-11 font-medium'>Save Changes</Button>
            </CardContent>
          </Card>

          {/* Password Security */}
          <Card className='shadow-md'>
            <CardHeader className='pb-4'>
              <div className='flex items-center gap-2'>
                <Lock className='h-5 w-5 text-green-600' />
                <CardTitle>Password Security</CardTitle>
              </div>
              <CardDescription>
                Change your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='current' className='text-sm font-medium'>
                  Current Password
                </Label>
                <Input
                  id='current'
                  type='password'
                  placeholder='Enter current password'
                  className='h-11'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='new' className='text-sm font-medium'>
                  New Password
                </Label>
                <Input
                  id='new'
                  type='password'
                  placeholder='Enter new password'
                  className='h-11'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='confirm' className='text-sm font-medium'>
                  Confirm New Password
                </Label>
                <Input
                  id='confirm'
                  type='password'
                  placeholder='Confirm new password'
                  className='h-11'
                />
              </div>
              <div className='bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg'>
                <p className='text-xs text-blue-700 dark:text-blue-300'>
                  Password must be at least 8 characters long and contain
                  uppercase, lowercase, and numbers.
                </p>
              </div>
              <Separator />
              <Button variant='secondary' className='w-full h-11 font-medium'>
                Change Password
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Teacher Profile Section - Only shown for teachers */}
        {isTeacher && (
          <div className='grid gap-8 md:grid-cols-2'>
            {/* Teaching Profile */}
            <Card className='shadow-md border-orange-200 dark:border-orange-800'>
              <CardHeader className='pb-4'>
                <div className='flex items-center gap-2'>
                  <GraduationCap className='h-5 w-5 text-orange-600' />
                  <CardTitle>Teaching Profile</CardTitle>
                </div>
                <CardDescription>
                  Manage your teaching credentials and experience
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='subjects' className='text-sm font-medium'>
                    Subjects
                  </Label>
                  <Input
                    id='subjects'
                    value={teacherData.subjects}
                    onChange={(e) =>
                      setTeacherData({
                        ...teacherData,
                        subjects: e.target.value,
                      })
                    }
                    placeholder='e.g., Mathematics, Physics, Arabic'
                    className='h-11'
                  />
                  <p className='text-xs text-muted-foreground'>
                    Separate multiple subjects with commas
                  </p>
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='experience' className='text-sm font-medium'>
                    Teaching Experience (Years)
                  </Label>
                  <Input
                    id='experience'
                    type='number'
                    value={teacherData.teachingExperience}
                    onChange={(e) =>
                      setTeacherData({
                        ...teacherData,
                        teachingExperience: e.target.value,
                      })
                    }
                    placeholder='Enter years of experience'
                    className='h-11'
                    min='0'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='phone' className='text-sm font-medium'>
                    Phone Number
                  </Label>
                  <Input
                    id='phone'
                    type='tel'
                    value={teacherData.phone}
                    onChange={(e) =>
                      setTeacherData({ ...teacherData, phone: e.target.value })
                    }
                    placeholder='Enter your phone number'
                    className='h-11'
                  />
                </div>
                <Separator />
                <Button className='w-full h-11 font-medium bg-orange-600 hover:bg-orange-700'>
                  <GraduationCap className='mr-2 h-4 w-4' />
                  Update Teaching Profile
                </Button>
              </CardContent>
            </Card>

            {/* Qualifications */}
            <Card className='shadow-md border-purple-200 dark:border-purple-800'>
              <CardHeader className='pb-4'>
                <div className='flex items-center gap-2'>
                  <BookOpen className='h-5 w-5 text-purple-600' />
                  <CardTitle>Qualifications</CardTitle>
                </div>
                <CardDescription>
                  List your educational background and certifications
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <Label
                    htmlFor='qualifications'
                    className='text-sm font-medium'
                  >
                    Education & Certifications
                  </Label>
                  <Textarea
                    id='qualifications'
                    value={teacherData.qualifications}
                    onChange={(e) =>
                      setTeacherData({
                        ...teacherData,
                        qualifications: e.target.value,
                      })
                    }
                    placeholder='e.g., MSc Mathematics, Teaching Certificate, TESOL Certification'
                    className='min-h-[120px] resize-none'
                    rows={5}
                  />
                  <p className='text-xs text-muted-foreground'>
                    List your degrees, certifications, and relevant
                    qualifications
                  </p>
                </div>
                <div className='bg-purple-50 dark:bg-purple-950/20 p-3 rounded-lg'>
                  <p className='text-xs text-purple-700 dark:text-purple-300'>
                    💡 Tip: Include university degrees, teaching certificates,
                    language proficiency, and any specialized training.
                  </p>
                </div>
                <Separator />
                <Button
                  variant='outline'
                  className='w-full h-11 font-medium border-purple-600 text-purple-600 hover:bg-purple-50'
                >
                  <BookOpen className='mr-2 h-4 w-4' />
                  Save Qualifications
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Account Statistics */}
        <Card className='shadow-md'>
          <CardHeader>
            <CardTitle>Account Overview</CardTitle>
            <CardDescription>
              Your account activity and statistics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              <div className='text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg'>
                <div className='text-2xl font-bold text-green-600 mb-1'>
                  Active
                </div>
                <p className='text-sm text-muted-foreground'>Account Status</p>
              </div>
              <div className='text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg'>
                <div className='text-2xl font-bold text-blue-600 mb-1'>
                  2024
                </div>
                <p className='text-sm text-muted-foreground'>Member Since</p>
              </div>
              <div className='text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg'>
                <div className='text-2xl font-bold text-purple-600 mb-1'>
                  Premium
                </div>
                <p className='text-sm text-muted-foreground'>Plan Type</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
