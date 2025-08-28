'use server';

import * as z from 'zod';
import bcrypt from 'bcryptjs';

import { db } from '@/lib/db';
import { StudentFormSchema } from '@/shared/schemas';
import { getUserByEmail } from '@/data/user';
import { sendVerificationEmail } from '@/lib/mail';
import { generateVerificationToken } from '@/lib/tokens';
import { sendAdminNotification } from '@/lib/admin-notifications';

export const register = async (
  values: z.infer<typeof StudentFormSchema>,
  locale: string = 'en'
) => {
  const validatedFields = StudentFormSchema.safeParse(values);

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
    referralSource,
    isTeacher,
  } = validatedFields.data;

  const existingUser = await getUserByEmail(email);

  if (existingUser) {
    return { error: 'Email already in use!' };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await db.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      phone,
      gender,
      birthDate: birthDate ? new Date(birthDate) : null,
      referralSource,
      isTeacher,
    },
  });

  // Send verification email
  const verificationToken = await generateVerificationToken(email);
  await sendVerificationEmail(verificationToken.email, verificationToken.token, locale);

  // Send admin notification for new user registration
  try {
    await sendAdminNotification({
      type: 'USER_REGISTRATION',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isTeacher: user.isTeacher,
        phone: user.phone,
        gender: user.gender,
      },
    });
  } catch (error) {
    console.error('Failed to send admin notification:', error);
    // Don't fail the registration if notification fails
  }

  return { success: 'Confirmation email sent!' };
};
