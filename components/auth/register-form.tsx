'use client';

import * as z from 'zod';
import { useState, useTransition } from 'react';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { StudentFormSchema } from '@/schemas';
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
import { CardWrapper } from '@/components/auth/card-wrapper';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/form-error';
import { FormSuccess } from '@/components/form-success';
import { register } from '@/actions/register';

type StudentFormValues = z.infer<typeof StudentFormSchema>;

export const RegisterForm = () => {
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
      register(values).then((data) => {
        setError(data.error);
        setSuccess(data.success);
        if (data.success) methods.reset();
      });
    });
  };

  return (
    <CardWrapper
      headerLabel='Create an account'
      backButtonLabel='Already have an account?'
      backButtonHref='login'
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
                <FormLabel>Name</FormLabel>
                <Input {...field} disabled={isPending} placeholder='John Doe' />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={methods.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <Input
                  {...field}
                  disabled={isPending}
                  placeholder='john.doe@example.com'
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
                <FormLabel>Password</FormLabel>
                <Input
                  {...field}
                  disabled={isPending}
                  placeholder='******'
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
                <FormLabel>Retype Password</FormLabel>
                <Input
                  {...field}
                  disabled={isPending}
                  placeholder='******'
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
                <FormLabel>Phone</FormLabel>
                <Input
                  {...field}
                  disabled={isPending}
                  placeholder='+1-234-567-8900'
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
                  <FormLabel>Gender</FormLabel>
                  <Controller
                    control={methods.control}
                    name='gender'
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder='Select gender' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Gender</SelectLabel>
                            <SelectItem value='MALE'>Male</SelectItem>
                            <SelectItem value='FEMALE'>Female</SelectItem>
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
                  <FormLabel>Birth Date</FormLabel>
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
                <FormLabel>Referral Source</FormLabel>
                <Controller
                  control={methods.control}
                  name='referralSource'
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='Select referral source' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Referral Source</SelectLabel>
                          <SelectItem value='Facebook'>Facebook</SelectItem>
                          <SelectItem value='Google'>Google</SelectItem>
                          <SelectItem value='Friend'>Friend</SelectItem>
                          <SelectItem value='Others'>Others</SelectItem>
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
            Create an account
          </Button>
        </form>
      </FormProvider>
    </CardWrapper>
  );
};
