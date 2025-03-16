'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Loader2, Camera } from 'lucide-react';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
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
import { UserAvatar } from '@/components/ui/user-avatar';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status !== 'loading') {
      setIsLoading(false);
    }
  }, [status]);

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
      <div className='space-y-6'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>
            Profile Settings
          </h2>
          <p className='text-muted-foreground'>
            Manage your account settings and preferences.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
            <CardDescription>
              Click on the avatar to upload a custom one from your files.
            </CardDescription>
          </CardHeader>
          <CardContent className='flex flex-col items-center space-y-4'>
            <div className='relative'>
              <UserAvatar size={96} />
              <Button
                size='icon'
                variant='outline'
                className='absolute -bottom-2 -right-2 h-8 w-8 rounded-full'
              >
                <Camera className='h-4 w-4' />
                <span className='sr-only'>Upload avatar</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Update your personal information and email address.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid gap-2'>
              <Label htmlFor='name'>Name</Label>
              <Input
                id='name'
                defaultValue={session?.user?.name || ''}
                placeholder='Enter your name'
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                type='email'
                defaultValue={session?.user?.email || ''}
                placeholder='Enter your email'
                disabled
              />
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>
              Change your password to keep your account secure.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid gap-2'>
              <Label htmlFor='current'>Current Password</Label>
              <Input id='current' type='password' />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='new'>New Password</Label>
              <Input id='new' type='password' />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='confirm'>Confirm Password</Label>
              <Input id='confirm' type='password' />
            </div>
            <Button>Change Password</Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
