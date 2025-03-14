'use client';

import React, { useEffect, useState } from 'react';
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
import { StudentFormSchema } from '@/schemas';
import axiosInstance from '@/services/axiosInstance';
import { FormError } from '@/components/form-error';
import { FormSuccess } from '@/components/form-success';

type StudentFormValues = z.infer<typeof StudentFormSchema>;

const StudentForm: React.FC = () => {
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
      setSuccess('Form submitted successfully!');
      methods.reset(); // Reset the form after successful submission
    } catch (error) {
      setError((error as any).response?.data?.error || (error as any).message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('Errors:', errors);
  }, [errors]);

  return (
    <div className='w-full max-w-md mx-auto'>
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
                <FormLabel>Name</FormLabel>
                <Input placeholder='Enter your name' {...field} />
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
                <FormLabel>Email</FormLabel>
                <Input type='email' placeholder='Enter your email' {...field} />
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
                <FormLabel>Password</FormLabel>
                <Input
                  type='password'
                  placeholder='Enter your password'
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
                <FormLabel>Retype Password</FormLabel>
                <Input
                  type='password'
                  placeholder='Retype your password'
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
                <FormLabel>Phone</FormLabel>
                <Input type='text' placeholder='+1-234-567-8900' {...field} />
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
                  <FormLabel>Gender</FormLabel>
                  <Controller
                    control={control}
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
                  <FormLabel>Birth Date</FormLabel>
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
                <FormLabel>Referral Source</FormLabel>
                <Controller
                  control={control}
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
            {isLoading ? 'Submitting...' : 'Register'}
          </Button>
        </form>
      </FormProvider>
    </div>
  );
};

export default StudentForm;
