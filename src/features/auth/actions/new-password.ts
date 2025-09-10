'use server';

import * as z from 'zod';
import bcrypt from 'bcryptjs';

import { NewPasswordSchema } from '@/shared/schemas';
import { getPasswordResetTokenByToken } from '@/data/password-reset-token';
import { getUserByEmail } from '@/data/user';
import { db } from '@/lib/db';

export const newPassword = async (
  values: z.infer<typeof NewPasswordSchema>,
  token?: string | null
) => {
  console.log('🔑 New password request received:', {
    token: token?.substring(0, 8) + '...',
    hasToken: !!token,
  });

  if (!token) {
    console.log('❌ No token provided');
    return { error: 'Missing token!' };
  }

  const validatedFields = NewPasswordSchema.safeParse(values);

  if (!validatedFields.success) {
    console.log('❌ Invalid fields:', validatedFields.error);
    return { error: 'Invalid fields!' };
  }

  const { password } = validatedFields.data;

  console.log('🔍 Looking for token in database...');
  const existingToken = await getPasswordResetTokenByToken(token);

  if (!existingToken) {
    console.log('❌ Token not found in database');
    return { error: 'Invalid token!' };
  }

  console.log('✅ Token found:', {
    id: existingToken.id,
    email: existingToken.email,
    expires: existingToken.expires,
  });

  const hasExpired = new Date(existingToken.expires) < new Date();

  if (hasExpired) {
    console.log('❌ Token has expired:', {
      expires: existingToken.expires,
      now: new Date(),
    });
    return { error: 'Token has expired!' };
  }

  console.log('✅ Token is valid and not expired');

  const existingUser = await getUserByEmail(existingToken.email);

  if (!existingUser) {
    console.log('❌ User not found for email:', existingToken.email);
    return { error: 'Email does not exist!' };
  }

  console.log('✅ User found:', {
    id: existingUser.id,
    email: existingUser.email,
  });

  const hashedPassword = await bcrypt.hash(password, 10);

  console.log('🔐 Updating user password...');
  await db.user.update({
    where: { id: existingUser.id },
    data: { password: hashedPassword },
  });

  console.log('🗑️ Deleting used token...');
  await db.passwordResetToken.delete({
    where: { id: existingToken.id },
  });

  console.log('✅ Password reset completed successfully');
  return { success: 'Password updated!' };
};
