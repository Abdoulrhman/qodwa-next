import { ExtendedUser } from '@/next-auth';

export const isTeacher = (
  user: any
): user is ExtendedUser & { isTeacher: true } => {
  return user && user.isTeacher === true;
};

export const hasTeacherAccess = (user: any): boolean => {
  return user && (user.isTeacher === true || user.role === 'TEACHER');
};
