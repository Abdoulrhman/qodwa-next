'use client';

import * as z from 'zod';
import { useState, useTransition } from 'react';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations, useLocale } from 'next-intl';

import { StudentFormSchema } from '@/shared/schemas';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CardWrapper } from './card-wrapper';
import { Button } from '@/components/ui/button';
import { FormError } from '@/shared/components/form-error';
import { FormSuccess } from '@/shared/components/form-success';
import { register } from '@/features/auth/actions/register';
import { trackRegistration } from '@/lib/facebook-pixel';

type StudentFormValues = z.infer<typeof StudentFormSchema>;

export const RegisterForm = () => {
  const t = useTranslations('Auth.register');
  const locale = useLocale();
  const [error, setError] = useState<string | undefined>('');
  const [success, setSuccess] = useState<string | undefined>('');
  const [isPending, startTransition] = useTransition();

  const methods = useForm<StudentFormValues>({
    resolver: zodResolver(StudentFormSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      retypePassword: '',
      phone: '',
      gender: 'MALE',
      birthDate: '',
      referralSource: '',
      isTeacher: false,
    },
  });

  const onSubmit = (values: StudentFormValues) => {
    setError('');
    setSuccess('');

    startTransition(() => {
      register(values, locale).then((data) => {
        setError(data.error);
        setSuccess(data.success);
        if (data.success) {
          methods.reset();
          // Track registration completion in Facebook Pixel
          trackRegistration('email');
        }
      });
    });
  };

  return (
    <CardWrapper
      headerLabel={t('title')}
      backButtonLabel={t('has_account')}
      backButtonHref={`/${locale}/auth/login`}
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
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className='space-y-6'>
          <input
            type='hidden'
            {...methods.register('isTeacher')}
            value='false'
          />

          <FormField
            control={methods.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('name_label')}</FormLabel>
                <Input
                  {...field}
                  disabled={isPending}
                  placeholder={t('name_placeholder')}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={methods.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('email_label')}</FormLabel>
                <Input
                  {...field}
                  disabled={isPending}
                  placeholder={t('email_placeholder')}
                  type='email'
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={methods.control}
            name='password'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('password_label')}</FormLabel>
                <Input
                  {...field}
                  disabled={isPending}
                  placeholder={t('password_placeholder')}
                  type='password'
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={methods.control}
            name='retypePassword'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('retype_password_label')}</FormLabel>
                <Input
                  {...field}
                  disabled={isPending}
                  placeholder={t('retype_password_placeholder')}
                  type='password'
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={methods.control}
            name='phone'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('phone_label')}</FormLabel>
                <Input
                  {...field}
                  disabled={isPending}
                  placeholder={t('phone_placeholder')}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <FormField
              control={methods.control}
              name='gender'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('gender_label')}</FormLabel>
                  <Controller
                    control={methods.control}
                    name='gender'
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder={t('gender_placeholder')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>{t('gender_label')}</SelectLabel>
                            <SelectItem value='MALE'>
                              {t('gender_male')}
                            </SelectItem>
                            <SelectItem value='FEMALE'>
                              {t('gender_female')}
                            </SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={methods.control}
              name='birthDate'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('birth_date_label')}</FormLabel>
                  <Input {...field} disabled={isPending} type='date' />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={methods.control}
            name='referralSource'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('referral_source_label')}</FormLabel>
                <Controller
                  control={methods.control}
                  name='referralSource'
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className='w-full'>
                        <SelectValue
                          placeholder={t('referral_source_placeholder')}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>
                            {t('referral_source_label')}
                          </SelectLabel>
                          <SelectItem value='Facebook'>
                            {t('referral_facebook')}
                          </SelectItem>
                          <SelectItem value='Google'>
                            {t('referral_google')}
                          </SelectItem>
                          <SelectItem value='Friend'>
                            {t('referral_friend')}
                          </SelectItem>
                          <SelectItem value='Others'>
                            {t('referral_others')}
                          </SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormError message={error} />
          <FormSuccess message={success} />
          <Button disabled={isPending} type='submit' className='w-full'>
            {t('submit')}
          </Button>
        </form>
      </FormProvider>
    </CardWrapper>
  );
};
