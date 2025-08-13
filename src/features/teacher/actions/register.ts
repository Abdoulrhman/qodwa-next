'use server';

import * as z from 'zod';
import bcrypt from 'bcryptjs';

import { db } from '@/lib/db';
import { TeacherRegistrationSchema } from '@/shared/schemas';
import { getUserByEmail } from '@/data/user';
import { generateVerificationToken } from '@/lib/tokens';
import { sendVerificationEmail } from '@/lib/mail';

export const registerTeacher = async (
  values: z.infer<typeof TeacherRegistrationSchema>
) => {
  const validatedFields = TeacherRegistrationSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: 'Invalid fields!' };
  }

  const {
    email,
    password,
    name,
    phone,
    gender,
    birthDate,
    qualifications,
    subjects,
    teachingExperience,
    referralSource,
  } = validatedFields.data;

  try {
    // Check if user already exists
    const existingUser = await getUserByEmail(email);

    if (existingUser) {
      return { error: 'Email already in use!' };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create teacher user
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        gender,
        birthDate: birthDate ? new Date(birthDate) : null,
        qualifications,
        subjects,
        teachingExperience,
        referralSource,
        isTeacher: true,
        role: 'TEACHER', // Set role to TEACHER for teacher registrations
      },
    });

    // Generate verification token
    const verificationToken = await generateVerificationToken(email);

    // Send verification email
    await sendVerificationEmail(
      verificationToken.email,
      verificationToken.token
    );

    return {
      success:
        'Teacher registration successful! Please check your email for verification.',
      userId: user.id,
    };
  } catch (error) {
    console.error('Teacher registration error:', error);
    return { error: 'Something went wrong during registration!' };
  }
};
