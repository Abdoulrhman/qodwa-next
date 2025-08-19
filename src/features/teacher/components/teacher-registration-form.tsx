'use client';

import * as z from 'zod';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';

import { TeacherRegistrationSchema } from '@/shared/schemas';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormError } from '@/shared/components/form-error';
import { FormSuccess } from '@/shared/components/form-success';
import { registerTeacher } from '../actions/register';
import NavigationHeader from '@/features/auth/components/nav-header';

export const TeacherRegistrationForm = () => {
  const t = useTranslations();
  const [error, setError] = useState<string | undefined>('');
  const [success, setSuccess] = useState<string | undefined>('');
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof TeacherRegistrationSchema>>({
    resolver: zodResolver(TeacherRegistrationSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      retypePassword: '',
      phone: '',
      gender: undefined,
      birthDate: '',
      qualifications: '',
      subjects: '',
      teachingExperience: 0,
      referralSource: '',
      isTeacher: true,
    },
  });

  const onSubmit = (values: z.infer<typeof TeacherRegistrationSchema>) => {
    setError('');
    setSuccess('');

    startTransition(() => {
      registerTeacher(values).then((data) => {
        setError(data.error);
        setSuccess(data.success);

        if (data.success) {
          form.reset();
        }
      });
    });
  };

  return (
    <div className='w-full max-w-2xl mx-auto'>
      {/* Header with Logo and Back Button */}
      <NavigationHeader />
      
      <div className='text-center mb-8'>
        <h1 className='text-3xl font-bold text-foreground'>
          {t('teacherRegistration.title', { default: 'Join as a Teacher' })}
        </h1>
        <p className='text-muted-foreground mt-2'>
          {t('teacherRegistration.subtitle', {
            default: 'Share your knowledge and inspire students worldwide',
          })}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          {/* Personal Information */}
          <div className='space-y-4'>
            <h2 className='text-xl font-semibold text-foreground border-b pb-2'>
              {t('teacherRegistration.personalInfo', {
                default: 'Personal Information',
              })}
            </h2>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('teacherRegistration.name', { default: 'Full Name' })}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder={t('teacherRegistration.namePlaceholder', {
                          default: 'Enter your full name',
                        })}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('teacherRegistration.email', { default: 'Email' })}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder={t('teacherRegistration.emailPlaceholder', {
                          default: 'your.email@example.com',
                        })}
                        type='email'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('teacherRegistration.password', {
                        default: 'Password',
                      })}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder={t(
                          'teacherRegistration.passwordPlaceholder',
                          { default: 'Enter password' }
                        )}
                        type='password'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='retypePassword'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('teacherRegistration.retypePassword', {
                        default: 'Confirm Password',
                      })}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder={t(
                          'teacherRegistration.retypePasswordPlaceholder',
                          { default: 'Confirm password' }
                        )}
                        type='password'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <FormField
                control={form.control}
                name='phone'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('teacherRegistration.phone', {
                        default: 'Phone Number',
                      })}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder={t('teacherRegistration.phonePlaceholder', {
                          default: '+1234567890',
                        })}
                        type='tel'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='gender'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('teacherRegistration.gender', { default: 'Gender' })}
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger disabled={isPending}>
                          <SelectValue
                            placeholder={t(
                              'teacherRegistration.genderPlaceholder',
                              { default: 'Select gender' }
                            )}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='MALE'>
                          {t('teacherRegistration.male', { default: 'Male' })}
                        </SelectItem>
                        <SelectItem value='FEMALE'>
                          {t('teacherRegistration.female', {
                            default: 'Female',
                          })}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='birthDate'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('teacherRegistration.birthDate', {
                        default: 'Birth Date',
                      })}
                    </FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isPending} type='date' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Professional Information */}
          <div className='space-y-4'>
            <h2 className='text-xl font-semibold text-foreground border-b pb-2'>
              {t('teacherRegistration.professionalInfo', {
                default: 'Professional Information',
              })}
            </h2>

            <FormField
              control={form.control}
              name='qualifications'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('teacherRegistration.qualifications', {
                      default: 'Qualifications & Education',
                    })}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      disabled={isPending}
                      placeholder={t(
                        'teacherRegistration.qualificationsPlaceholder',
                        {
                          default:
                            'Describe your educational background, degrees, certifications...',
                        }
                      )}
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='subjects'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('teacherRegistration.subjects', {
                        default: 'Subjects You Teach',
                      })}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder={t(
                          'teacherRegistration.subjectsPlaceholder',
                          { default: 'Math, Physics, Chemistry...' }
                        )}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='teachingExperience'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('teacherRegistration.experience', {
                        default: 'Teaching Experience (Years)',
                      })}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder={t(
                          'teacherRegistration.experiencePlaceholder',
                          { default: '0' }
                        )}
                        type='number'
                        min='0'
                        max='50'
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='referralSource'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('teacherRegistration.referralSource', {
                      default: 'How did you hear about us?',
                    })}
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger disabled={isPending}>
                        <SelectValue
                          placeholder={t(
                            'teacherRegistration.referralPlaceholder',
                            { default: 'Select source' }
                          )}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='Facebook'>
                        {t('teacherRegistration.facebook', {
                          default: 'Facebook',
                        })}
                      </SelectItem>
                      <SelectItem value='Google'>
                        {t('teacherRegistration.google', { default: 'Google' })}
                      </SelectItem>
                      <SelectItem value='Friend'>
                        {t('teacherRegistration.friend', {
                          default: 'Friend Referral',
                        })}
                      </SelectItem>
                      <SelectItem value='LinkedIn'>
                        {t('teacherRegistration.linkedin', {
                          default: 'LinkedIn',
                        })}
                      </SelectItem>
                      <SelectItem value='Others'>
                        {t('teacherRegistration.others', { default: 'Others' })}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormError message={error} />
          <FormSuccess message={success} />

          <Button disabled={isPending} type='submit' className='w-full'>
            {isPending
              ? t('teacherRegistration.submitting', {
                  default: 'Submitting...',
                })
              : t('teacherRegistration.submit', {
                  default: 'Submit Application',
                })}
          </Button>
        </form>
      </Form>
    </div>
  );
};
