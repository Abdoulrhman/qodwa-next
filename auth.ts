import NextAuth from 'next-auth';
import { UserRole } from '@prisma/client';
import { PrismaAdapter } from '@auth/prisma-adapter';

import { db } from '@/lib/db';
import authConfig from '@/config/auth.config';
import { getUserById } from '@/data/user';
import { getTwoFactorConfirmationByUserId } from '@/data/two-factor-confirmation';
import { getAccountByUserId } from './data/account';

// @ts-ignore
export const { handlers, auth, signIn, signOut } = NextAuth({
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  events: {
    // @ts-ignore
    async linkAccount({ user }) {
      await db.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      });
    },
  },
  callbacks: {
    // @ts-ignore
    async signIn({ user, account }) {
      console.log('🔐 SignIn callback called with:', {
        userId: user.id,
        email: user.email,
        provider: account?.provider,
      });

      // Allow OAuth without email verification
      if (account?.provider !== 'credentials') return true;

      const existingUser = await getUserById(user.id!);
      console.log('👤 Found existing user:', {
        id: existingUser?.id,
        email: existingUser?.email,
        emailVerified: existingUser?.emailVerified,
      });

      // Prevent sign in without email verification
      if (!existingUser?.emailVerified) {
        console.log('❌ Email not verified, returning false');
        // Return false to prevent sign in
        return false;
      }

      if (existingUser.isTwoFactorEnabled) {
        const twoFactorConfirmation = await getTwoFactorConfirmationByUserId(
          existingUser.id
        );

        if (!twoFactorConfirmation) return false;

        // Delete two factor confirmation for next sign in
        await db.twoFactorConfirmation.delete({
          where: { id: twoFactorConfirmation.id },
        });
      }

      console.log('✅ SignIn successful');
      return true;
    },
    // @ts-ignore
    async session({ token, session }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }

      if (token.role && session.user) {
        (session.user as any).role = token.role as UserRole;
      }

      if (session.user) {
        (session.user as any).isTwoFactorEnabled =
          token.isTwoFactorEnabled as boolean;
      }

      if (session.user) {
        session.user.name = token.name;
        session.user.email = token.email!;
        (session.user as any).isOAuth = token.isOAuth as boolean;
        (session.user as any).isTeacher = token.isTeacher as boolean;
        (session.user as any).subjects = token.subjects as string;
        (session.user as any).teachingExperience =
          token.teachingExperience as number;
        (session.user as any).qualifications = token.qualifications as string;
        (session.user as any).phone = token.phone as string;
        (session.user as any).emailVerified =
          token.emailVerified as Date | null;
      }

      return session;
    },
    // @ts-ignore
    async jwt({ token, trigger }) {
      if (!token.sub) return token;

      const existingUser = await getUserById(token.sub);

      if (!existingUser) return token;

      const existingAccount = await getAccountByUserId(existingUser.id);

      token.isOAuth = !!existingAccount;
      token.name = existingUser.name;
      token.email = existingUser.email;
      token.role = existingUser.role;
      token.isTwoFactorEnabled = existingUser.isTwoFactorEnabled;
      token.isTeacher = existingUser.isTeacher;
      token.subjects = existingUser.subjects;
      token.teachingExperience = existingUser.teachingExperience;
      token.qualifications = existingUser.qualifications;
      token.phone = existingUser.phone;
      token.emailVerified = existingUser.emailVerified;

      // Force token refresh timestamp for debugging
      token.lastUpdated = Date.now();

      return token;
    },
  },
  adapter: PrismaAdapter(db),
  session: {
    strategy: 'jwt',
    maxAge: 30 * 60, // 30 minutes for development testing
  },
  jwt: {
    maxAge: 30 * 60, // 30 minutes for development testing
  },
  ...authConfig,
});

export const { GET, POST } = handlers;
