import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export const useCurrentUserRole = () => {
  const { data: session, status } = useSession();
  const [role, setRole] = useState<string | undefined>();

  useEffect(() => {
    if (session?.user?.role) {
      setRole(session.user.role);
    }
  }, [session]);

  return { role, loading: status === 'loading' };
};
