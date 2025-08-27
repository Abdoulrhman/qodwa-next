'use server';

import * as z from 'zod';
import bcrypt from 'bcryptjs';

import { db } from '@/lib/db';
import { TeacherRegistrationSchema } from '@/shared/schemas';
import { getUserByEmail } from '@/data/user';
import { generateVerificationToken } from '@/lib/tokens';
import { sendVerificationEmail } from '@/lib/mail';
import { sendAdminNotification } from '@/lib/admin-notifications';

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

    // Send admin notification for new teacher registration
    try {
      await sendAdminNotification({
        type: 'TEACHER_REGISTRATION',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          isTeacher: user.isTeacher,
          phone: user.phone,
          gender: user.gender,
          qualifications: user.qualifications,
          subjects: user.subjects,
          teachingExperience: user.teachingExperience,
        },
      });
    } catch (error) {
      console.error('Failed to send admin notification:', error);
      // Don't fail the registration if notification fails
    }

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
