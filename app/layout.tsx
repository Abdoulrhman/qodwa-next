import { Inter, Almarai } from 'next/font/google';
import '../styles/main.scss';
import '../app/globals.css';
import { useLocale } from 'next-intl';
import { Providers } from '@/components/providers/providers';
import { AuthProvider } from '@/contexts/auth-context';

const inter = Inter({ subsets: ['latin'] });
const almarai = Almarai({ subsets: ['arabic'], weight: ['400', '700'] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
  params?: { locale: string };
}>) {
  const locale = useLocale();
  return (
    <html
      suppressHydrationWarning={true}
      lang={locale}
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
    >
      <head>
        <link rel='icon' href='/favicon.ico' />
      </head>
      <body
        suppressHydrationWarning={true}
        className={locale !== 'ar' ? inter.className : almarai.className}
      >
        <Providers>
          <AuthProvider>{children}</AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
