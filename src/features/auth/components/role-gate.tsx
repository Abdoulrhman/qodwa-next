'use client';

import { UserRole } from '@prisma/client';

import { useCurrentUserRole } from '@/features/auth/hooks/use-current-user-role';
import { FormError } from '@/shared/components/form-error';

interface RoleGateProps {
  children: React.ReactNode;
  allowedRole: UserRole;
}

export const RoleGate = ({ children, allowedRole }: RoleGateProps) => {
  const { role, loading } = useCurrentUserRole();

  if (loading) {
    return <div>Loading...</div>; // Show a loading state
  }

  if (role !== allowedRole) {
    return (
      <FormError message='You do not have permission to view this content!' />
    );
  }

  return <>{children}</>;
};
