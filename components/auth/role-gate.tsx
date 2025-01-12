'use client';

import { useEffect, useState } from 'react';
import { UserRole } from '@prisma/client';

import { useCurrentRole } from '@/hooks/use-current-role';
import { FormError } from '@/components/form-error';

interface RoleGateProps {
  children: React.ReactNode;
  allowedRole: UserRole;
}

export const RoleGate = ({ children, allowedRole }: RoleGateProps) => {
  const rolePromise = useCurrentRole(); // Call the hook here
  const [role, setRole] = useState<UserRole | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    rolePromise
      .then((currentRole) => {
        setRole(currentRole);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [rolePromise]);

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
