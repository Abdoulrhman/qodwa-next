'use client';

import { useState, useTransition } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormError } from '@/shared/components/form-error';
import { FormSuccess } from '@/shared/components/form-success';
import { Mail, RefreshCw } from 'lucide-react';

export default function VerifyEmailPage() {
  const { data: session } = useSession();
  const [error, setError] = useState<string | undefined>('');
  const [success, setSuccess] = useState<string | undefined>('');
  const [isPending, startTransition] = useTransition();

  const onResendVerification = () => {
    setError('');
    setSuccess('');

    if (!session?.user?.email) {
      setError('No email address found. Please log in again.');
      return;
    }

    startTransition(() => {
      fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: session?.user?.email,
        }),
      })
        .then(async (res) => {
          const data = await res.json();
          if (data.error) {
            setError(data.error);
          } else {
            setSuccess('Verification email sent! Please check your inbox.');
          }
        })
        .catch(() => {
          setError('Something went wrong. Please try again.');
        });
    });
  };

  return (
    <div className='flex items-center justify-center min-h-screen bg-gray-50'>
      <Card className='w-full max-w-md'>
        <CardHeader className='text-center'>
          <div className='flex justify-center mb-4'>
            <Mail className='h-12 w-12 text-blue-600' />
          </div>
          <CardTitle className='text-2xl'>Verify Your Email</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='text-center text-gray-600'>
            <p>Please check your email for a verification link.</p>
            <p className='mt-2 text-sm'>
              We sent a verification email to:{' '}
              <span className='font-medium'>{session?.user?.email}</span>
            </p>
          </div>

          <FormError message={error} />
          <FormSuccess message={success} />

          <div className='space-y-3'>
            <Button
              onClick={onResendVerification}
              disabled={isPending}
              className='w-full'
              variant='outline'
            >
              {isPending ? (
                <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
              ) : (
                <Mail className='mr-2 h-4 w-4' />
              )}
              Resend Verification Email
            </Button>

            <div className='text-center text-sm text-gray-500'>
              <p>
                Didn&apos;t receive the email? Check your spam folder or click
                the button above to resend.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
