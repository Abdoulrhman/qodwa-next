import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function AuthTestPage() {
  const session = await auth();

  if (!session) {
    redirect('/en/auth/login?callbackUrl=/en/auth-test');
  }

  return (
    <div className='p-8'>
      <h1 className='text-2xl font-bold mb-4'>Authentication Test</h1>
      <div className='space-y-4'>
        <p>✅ You are authenticated!</p>
        <p>
          <strong>User ID:</strong> {session.user?.id}
        </p>
        <p>
          <strong>Email:</strong> {session.user?.email}
        </p>
        <p>
          <strong>Name:</strong> {session.user?.name}
        </p>
        <p>
          <strong>Role:</strong> {session.user?.role}
        </p>
      </div>
    </div>
  );
}
