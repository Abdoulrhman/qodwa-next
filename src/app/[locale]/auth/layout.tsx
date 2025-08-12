import SplittedLayout from '@/shared/components/splittedLayout';
import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return <SplittedLayout>{children}</SplittedLayout>;
};

export default AuthLayout;
