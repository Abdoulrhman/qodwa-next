'use server';

import * as z from 'zod';

import { ResetSchema } from '@/shared/schemas';
import { getUserByEmail } from '@/data/user';
import { sendPasswordResetEmail } from '@/lib/mail';
import { generatePasswordResetToken } from '@/lib/tokens';

export const reset = async (
  values: z.infer<typeof ResetSchema>,
  locale: string = 'en'
) => {
  console.log('📧 Password reset request received:', { locale });

  const validatedFields = ResetSchema.safeParse(values);

  if (!validatedFields.success) {
    console.log('❌ Invalid fields:', validatedFields.error);
    return { error: 'Invalid emaiL!' };
  }

  const { email } = validatedFields.data;
  console.log('🔍 Looking for user with email:', email);

  const existingUser = await getUserByEmail(email);

  if (!existingUser) {
    console.log('❌ User not found');
    return { error: 'Email not found!' };
  }

  console.log('✅ User found, generating reset token...');
  const passwordResetToken = await generatePasswordResetToken(email);
  console.log('🔑 Token generated:', {
    id: passwordResetToken.id,
    email: passwordResetToken.email,
    token: passwordResetToken.token.substring(0, 8) + '...',
    expires: passwordResetToken.expires,
  });

  console.log('📤 Sending reset email...');
  await sendPasswordResetEmail(
    passwordResetToken.email,
    passwordResetToken.token,
    locale
  );

  console.log('✅ Reset email sent successfully');
  return { success: 'Reset email sent!' };
};
