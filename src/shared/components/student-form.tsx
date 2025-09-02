'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
import { createTranslatedSchemas } from '@/shared/schemas';
import axiosInstance from '@/services/axiosInstance';
import { FormError } from '@/shared/components/form-error';
import { FormSuccess } from '@/shared/components/form-success';
import NavigationHeader from '@/features/auth/components/nav-header';
import { useTranslations, useLocale } from 'next-intl';
import { cn } from '@/lib/utils';

const StudentForm: React.FC = () => {
  const t = useTranslations();
  const locale = useLocale();
  const isRTL = locale === 'ar';

  // Create translated schema
  const schemas = useMemo(() => createTranslatedSchemas(t), [t]);
  const StudentFormSchema = schemas.StudentFormSchema;

  type StudentFormValues = z.infer<typeof StudentFormSchema>;

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

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = methods;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onSubmit = async (data: StudentFormValues) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axiosInstance.post('register', data);
      setSuccess(t('Student.Form.successMessage'));
      methods.reset(); // Reset the form after successful submission
    } catch (error: any) {
      // Handle API validation errors
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else if (error.response?.status === 400) {
        setError(t('Student.Form.errors.invalidData'));
      } else if (error.response?.status === 409) {
        setError(t('Student.Form.errors.emailExists'));
      } else {
        setError(t('Student.Form.errors.unexpected'));
      }
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('Errors:', errors);
  }, [errors]);

  return (
    <div className={cn('w-full max-w-md py-8', isRTL && 'text-right')}>
      {/* Header with Logo and Back Button */}
      <NavigationHeader />

      <h1 className='text-2xl font-bold text-center mb-6 mt-6'>
        {t('Student.Form.title')}
      </h1>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          {/* Display error and success messages */}
          {error && <FormError message={error} />}
          {success && <FormSuccess message={success} />}

          {/* Hidden Input for isTeacher */}
          <input
            type='hidden'
            {...methods.register('isTeacher')}
            value='false'
          />

          {/* Name Field */}
          <FormField
            control={control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('Student.Form.fields.name')}</FormLabel>
                <Input
                  placeholder={t('Student.Form.placeholders.name')}
                  {...field}
                />
                {errors.name && (
                  <FormMessage>{errors.name.message}</FormMessage>
                )}
              </FormItem>
            )}
          />

          {/* Email Field */}
          <FormField
            control={control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('Student.Form.fields.email')}</FormLabel>
                <Input
                  type='email'
                  placeholder={t('Student.Form.placeholders.email')}
                  {...field}
                />
                {errors.email && (
                  <FormMessage>{errors.email.message}</FormMessage>
                )}
              </FormItem>
            )}
          />

          {/* Password Field */}
          <FormField
            control={control}
            name='password'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('Student.Form.fields.password')}</FormLabel>
                <Input
                  type='password'
                  placeholder={t('Student.Form.placeholders.password')}
                  {...field}
                />
                {errors.password && (
                  <FormMessage>{errors.password.message}</FormMessage>
                )}
              </FormItem>
            )}
          />

          {/* Retype Password Field */}
          <FormField
            control={control}
            name='retypePassword'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('Student.Form.fields.retypePassword')}</FormLabel>
                <Input
                  type='password'
                  placeholder={t('Student.Form.placeholders.retypePassword')}
                  {...field}
                />
                {errors.retypePassword && (
                  <FormMessage>{errors.retypePassword?.message}</FormMessage>
                )}
              </FormItem>
            )}
          />

          {/* Phone Field */}
          <FormField
            control={control}
            name='phone'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('Student.Form.fields.phone')}</FormLabel>
                <Input
                  type='text'
                  placeholder={t('Student.Form.placeholders.phone')}
                  {...field}
                />
                {errors.phone && (
                  <FormMessage>{errors.phone.message}</FormMessage>
                )}
              </FormItem>
            )}
          />

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {/* Gender Field */}
            <FormField
              control={control}
              name='gender'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Student.Form.fields.gender')}</FormLabel>
                  <Controller
                    control={control}
                    name='gender'
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className='w-full'>
                          <SelectValue
                            placeholder={t('Student.Form.placeholders.gender')}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>
                              {t('Student.Form.fields.gender')}
                            </SelectLabel>
                            <SelectItem value='MALE'>
                              {t('Student.Form.options.male')}
                            </SelectItem>
                            <SelectItem value='FEMALE'>
                              {t('Student.Form.options.female')}
                            </SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.gender && (
                    <FormMessage>{errors.gender.message}</FormMessage>
                  )}
                </FormItem>
              )}
            />

            {/* Birth Date Field */}
            <FormField
              control={control}
              name='birthDate'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Student.Form.fields.birthDate')}</FormLabel>
                  <Input type='date' {...field} />
                  {errors.birthDate && (
                    <FormMessage>{errors.birthDate.message}</FormMessage>
                  )}
                </FormItem>
              )}
            />
          </div>

          {/* Referral Source Field */}
          <FormField
            control={control}
            name='referralSource'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('Student.Form.fields.referralSource')}</FormLabel>
                <Controller
                  control={control}
                  name='referralSource'
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className='w-full'>
                        <SelectValue
                          placeholder={t(
                            'Student.Form.placeholders.referralSource'
                          )}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>
                            {t('Student.Form.fields.referralSource')}
                          </SelectLabel>
                          <SelectItem value='Facebook'>
                            {t('Student.Form.options.facebook')}
                          </SelectItem>
                          <SelectItem value='Google'>
                            {t('Student.Form.options.google')}
                          </SelectItem>
                          <SelectItem value='Friend'>
                            {t('Student.Form.options.friend')}
                          </SelectItem>
                          <SelectItem value='Others'>
                            {t('Student.Form.options.others')}
                          </SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.referralSource && (
                  <FormMessage>{errors.referralSource.message}</FormMessage>
                )}
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <Button
            type='submit'
            className='w-full bg-blue-500 text-white mt-4'
            disabled={isLoading}
          >
            {isLoading
              ? t('Student.Form.buttons.submitting')
              : t('Student.Form.buttons.register')}
          </Button>
        </form>
      </FormProvider>
    </div>
  );
};

export default StudentForm;
