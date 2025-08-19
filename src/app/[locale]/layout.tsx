import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Inter, Almarai } from 'next/font/google';
import BodyDirection from '@/shared/components/body-direction';
import { Providers } from '@/shared/components/providers/providers';
import { AuthProvider } from '@/contexts/auth-context';
import '../globals.css';
import '../../../styles/main.scss';

const inter = Inter({ subsets: ['latin'] });
const almarai = Almarai({ subsets: ['arabic'], weight: ['400', '700'] });

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages({ locale });
  const isRTL = locale === 'ar';

  return (
    <html lang={locale} dir={isRTL ? 'rtl' : 'ltr'} suppressHydrationWarning={true}>
      <head>
        <link rel='icon' href='/favicon.ico' />
      </head>
      <body 
        className={`${inter.className} ${isRTL ? almarai.className : ''}`}
        suppressHydrationWarning={true}
      >
        <Providers>
          <AuthProvider>
            <NextIntlClientProvider messages={messages} locale={locale}>
              <BodyDirection />
              {children}
            </NextIntlClientProvider>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
