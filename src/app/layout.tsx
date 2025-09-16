import type { Metadata } from 'next';
import FacebookPixel from '@/shared/components/facebook-pixel';

export const metadata: Metadata = {
  title: 'Qodwa Platform',
  description: 'Learn Quran online with qualified teachers',
};

// This is the root layout that should only handle global meta
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body>
        <FacebookPixel />
        {children}
      </body>
    </html>
  );
}
