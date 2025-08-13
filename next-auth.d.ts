import { UserRole } from '@prisma/client';
import { type DefaultSession } from 'next-auth';

export type ExtendedUser = DefaultSession['user'] & {
  role: UserRole;
  isTwoFactorEnabled: boolean;
  isOAuth: boolean;
  isTeacher?: boolean;
  subjects?: string;
  teachingExperience?: number;
  qualifications?: string;
  phone?: string;
};

declare module 'next-auth' {
  interface Session {
    user: ExtendedUser;
  }
}
