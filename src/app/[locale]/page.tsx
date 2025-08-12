import { useTranslations } from 'next-intl';
import HomePackages from './home/sections/packages';
import HomeServices from './home/sections/services';
import HomeIntro from './home/sections/intro';
import Head from 'next/head';
import HowToStart from './teacher/sections/how-to-start';
import Footer from '@/shared/components/footer';
import Button from '@/features/subscriptions/components/stripe/Button';
import AboutTutorSection from '@/shared/components/about-tutor-section';
import ContactUs from './home/sections/contact-us';

export default function Home() {
  const t = useTranslations('Home');
  const navLinks = [
    { label: 'Packages', href: '#packages' },
    { label: 'How to Start', href: '#how-to-start' },
    { label: 'About Us', href: '#about-us' },
    { label: 'Services', href: '#services' },
    { label: 'Contact Us', href: '#contact-us' },
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
      <AboutTutorSection />
      <HomeServices />
      <ContactUs />
      <Footer navLinks={navLinks} />
    </>
  );
}
