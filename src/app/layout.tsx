import { Inter, Almarai } from 'next/font/google';
import './globals.css';
import '../../styles/main.scss';
import { Providers } from '@/shared/components/providers/providers';
import { AuthProvider } from '@/contexts/auth-context';

const inter = Inter({ subsets: ['latin'] });
const almarai = Almarai({ subsets: ['arabic'], weight: ['400', '700'] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning={true}>
      <head>
        <link rel='icon' href='/favicon.ico' />
      </head>
      <body suppressHydrationWarning={true} className={inter.className}>
        <Providers>
          <AuthProvider>{children}</AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
