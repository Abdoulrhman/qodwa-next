import { ReactNode } from 'react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <div className='flex flex-col space-y-8'>{children}</div>;
}
