import { useTranslations } from 'next-intl';
import HomePackages from './home/sections/packages';
import HomeServices from './home/sections/services';
import HomeIntro from './home/sections/intro';
import Head from 'next/head';
import HowToStart from './teacher/sections/how-to-start';
import Footer from '@/components/shared/footer';

export default function Home() {
  const t = useTranslations('Home');
  const navLinks = [
    { label: 'Apply as a Student', href: '/student/register' },
    { label: 'Packages', href: '/packages' },
  ];
  return (
    <>
      <Head>
        <title>{t('Meta.title')}</title>
        <meta name='description' content={t('Meta.description')} />
        <meta name='keywords' content={t('Meta.keywords')} />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <meta charSet='UTF-8' />
      </Head>

      <HomeIntro />
      <HomePackages />
      <HowToStart />
      <HomeServices />
      <Footer navLinks={navLinks} />
    </>
  );
}
