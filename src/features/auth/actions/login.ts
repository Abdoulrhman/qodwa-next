'use server';

import * as z from 'zod';

import { db } from '@/lib/db';
import { signIn } from '@/auth';
import { LoginSchema } from '@/shared/schemas';
import { getUserByEmail } from '@/data/user';
import { getTwoFactorTokenByEmail } from '@/data/two-factor-token';
import { sendVerificationEmail, sendTwoFactorTokenEmail } from '@/lib/mail';
import { getDefaultLoginRedirect } from '@/routes';
import {
  generateVerificationToken,
  generateTwoFactorToken,
} from '@/lib/tokens';
import { getTwoFactorConfirmationByUserId } from '@/data/two-factor-confirmation';

export const login = async (
  values: z.infer<typeof LoginSchema>,
  callbackUrl?: string | null,
  locale: string = 'en' // 👈 Fallback to 'en' if not provided
) => {
  const validatedFields = LoginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: 'Invalid fields!' };
  }

  const { email, password, code } = validatedFields.data;

  const existingUser = await getUserByEmail(email);

  if (!existingUser || !existingUser.email || !existingUser.password) {
    return { error: 'Email does not exist!' };
  }

  if (!existingUser.emailVerified) {
    const verificationToken = await generateVerificationToken(
      existingUser.email
    );

    await sendVerificationEmail(
      verificationToken.email,
      verificationToken.token
    );

    return { error: 'EmailNotVerified' };
  }

  if (existingUser.isTwoFactorEnabled && existingUser.email) {
    if (code) {
      const twoFactorToken = await getTwoFactorTokenByEmail(existingUser.email);

      if (!twoFactorToken) {
        return { error: 'Invalid code!' };
      }

      if (twoFactorToken.token !== code) {
        return { error: 'Invalid code!' };
      }

      const hasExpired = new Date(twoFactorToken.expires) < new Date();

      if (hasExpired) {
        return { error: 'Code expired!' };
      }

      await db.twoFactorToken.delete({
        where: { id: twoFactorToken.id },
      });

      const existingConfirmation = await getTwoFactorConfirmationByUserId(
        existingUser.id
      );

      if (existingConfirmation) {
        await db.twoFactorConfirmation.delete({
          where: { id: existingConfirmation.id },
        });
      }

      await db.twoFactorConfirmation.create({
        data: {
          userId: existingUser.id,
        },
      });
    } else {
      const twoFactorToken = await generateTwoFactorToken(existingUser.email);
      await sendTwoFactorTokenEmail(twoFactorToken.email, twoFactorToken.token);

      return { twoFactor: true };
    }
  }

  try {
    console.log('🔐 Attempting signIn for:', email);
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false, // Don't redirect automatically
    });
    console.log('✅ SignIn result:', result);

    // Check if the sign-in was successful but blocked
    if (result?.error) {
      console.log('❌ SignIn error from result:', result.error);
      if (result.error === 'CredentialsSignin') {
        // Check if it's due to email verification
        if (!existingUser.emailVerified) {
          return { error: 'EmailNotVerified' };
        }
        return { error: 'Invalid credentials!' };
      }
      return { error: result.error };
    }
  } catch (error: any) {
    console.log('❌ SignIn exception:', error);
    // Handle NextAuth errors
    if (error?.type === 'CredentialsSignin') {
      // Check if it's due to email verification
      if (!existingUser.emailVerified) {
        return { error: 'EmailNotVerified' };
      }
      return { error: 'Invalid credentials!' };
    }

    if (error?.message) {
      return { error: error.message };
    }

    return { error: 'Something went wrong!' };
  }

  return { success: 'Logged in successfully!' };
};
