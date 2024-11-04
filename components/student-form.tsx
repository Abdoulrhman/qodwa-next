"use client";

import React, { useState } from "react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Form,FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { StudentFormSchema } from "@/schemas";

type StudentFormValues = z.infer<typeof StudentFormSchema>;

const StudentForm: React.FC = () => {
  const methods = useForm<StudentFormValues>({
    resolver: zodResolver(StudentFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
      gender: "MALE",
      birthDate: "",
      referralSource: "",
    },
  });

  const { handleSubmit, control, formState: { errors } } = methods;
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = (data: StudentFormValues) => {
    setIsLoading(true);
    console.log("Form submitted:", data);
    // Here, you would typically make an API call

    setIsLoading(false);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md space-y-4 p-4 bg-white shadow-md rounded-md">
          {/* Name Field */}
          <FormField control={control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <Input placeholder="Enter your name" {...field} />
                {errors.name && <FormMessage>{errors.name.message}</FormMessage>}
              </FormItem>
            )}
          />

          {/* Email Field */}
          <FormField control={control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <Input type="email" placeholder="Enter your email" {...field} />
                {errors.email && <FormMessage>{errors.email.message}</FormMessage>}
              </FormItem>
            )}
          />

          {/* Password Field */}
          <FormField control={control} name="password" render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <Input type="password" placeholder="Enter your password" {...field} />
                {errors.password && <FormMessage>{errors.password.message}</FormMessage>}
              </FormItem>
            )}
          />

          {/* Phone Field */}
          <FormField control={control} name="phone" render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <Input type="text" placeholder="+1-234-567-8900" {...field} />
                {errors.phone && <FormMessage>{errors.phone.message}</FormMessage>}
              </FormItem>
            )}
          />

          {/* Gender Field */}
          <FormField control={control} name="gender" render={({ field }) => (
              <FormItem>
                <FormLabel>Gender</FormLabel>
                <Select {...field}>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </Select>
                {errors.gender && <FormMessage>{errors.gender.message}</FormMessage>}
              </FormItem>
            )}
          />

          {/* Birth Date Field */}
          <FormField control={control} name="birthDate" render={({ field }) => (
              <FormItem>
                <FormLabel>Birth Date</FormLabel>
                <Input type="date" {...field} />
                {errors.birthDate && <FormMessage>{errors.birthDate.message}</FormMessage>}
              </FormItem>
            )}
          />

          {/* Referral Source Field */}
          <FormField control={control} name="referralSource" render={({ field }) => (
              <FormItem>
                <FormLabel>Referral Source</FormLabel>
                <Input placeholder="How did you hear about us?" {...field} />
                {errors.referralSource && <FormMessage>{errors.referralSource.message}</FormMessage>}
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <Button type="submit" className="w-full bg-blue-500 text-white mt-4" disabled={isLoading}>
            {isLoading ? "Submitting..." : "Register"}
          </Button>
        </form>
      </FormProvider>
    </div>
  );
};

export default StudentForm;
