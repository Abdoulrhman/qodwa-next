'use client';

import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { useState, useTransition } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSession, signIn } from 'next-auth/react';
import Link from 'next/link';

import { LoginSchema } from '@/shared/schemas';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { CardWrapper } from './card-wrapper';
import { Button } from '@/components/ui/button';
import { FormError } from '@/shared/components/form-error';
import { FormSuccess } from '@/shared/components/form-success';
import { login } from '@/features/auth/actions/login';
import { useLocale, useTranslations } from 'next-intl';

export const LoginForm = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { update } = useSession();
  const callbackUrl = searchParams.get('callbackUrl');

  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [error, setError] = useState<string | undefined>('');
  const [success, setSuccess] = useState<string | undefined>('');
  const [isPending, startTransition] = useTransition();

  const locale = useLocale();
  const t = useTranslations('Auth.login');

  const urlError =
    searchParams.get('error') === 'OAuthAccountNotLinked'
      ? t('email_in_use_error')
      : '';

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (values: z.infer<typeof LoginSchema>) => {
    setError('');
    setSuccess('');

    startTransition(() => {
      login(values, callbackUrl, locale)
        .then(async (data) => {
          if (data?.error) {
            form.reset();
            setError(data.error);
          }

          if (data?.success) {
            form.reset();
            setSuccess(data.success);

            // Show success message briefly, then redirect with full page reload
            setTimeout(() => {
              const redirectUrl = callbackUrl || `/${locale}/dashboard`;
              // Use window.location for a complete page reload to ensure fresh session
              window.location.href = redirectUrl;
            }, 1000);
          }

          if (data?.twoFactor) {
            setShowTwoFactor(true);
          }
        })
        .catch(() => setError('Something went wrong'));
    });
  };
  return (
    <CardWrapper
      headerLabel={t('title')}
      backButtonLabel={t('no_account')}
      backButtonHref='register'
      showSocial
      useAuthHeader={true}
      authHeaderProps={{
        variant: 'full',
        logoSrc: '/images/logo/logo.png',
        logoAlt: 'Qodwa Logo',
        logoWidth: 100,
        logoHeight: 40,
        title: 'Qodwa Platform',
      }}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          <div className='space-y-4'>
            {showTwoFactor && (
              <FormField
                control={form.control}
                name='code'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Two Factor Code</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder='123456'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {!showTwoFactor && (
              <>
                <FormField
                  control={form.control}
                  name='email'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('email_label')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={isPending}
                          placeholder='john.doe@example.com'
                          type='email'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='password'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('password_label')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={isPending}
                          placeholder='******'
                          type='password'
                        />
                      </FormControl>
                      <Button
                        size='sm'
                        variant='link'
                        asChild
                        className='px-0 font-normal'
                      >
                        <Link href='/auth/reset'>{t('forgot_password')}</Link>
                      </Button>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </div>
          <FormError message={error || urlError} />
          <FormSuccess message={success} />
          <Button disabled={isPending} type='submit' className='w-full'>
            {showTwoFactor ? 'Confirm' : t('submit')}
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};
