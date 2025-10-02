import { useTranslations } from 'next-intl';
import HomePackages from './home/sections/packages';
import HomeServices from './home/sections/services';
import HomeIntro from './home/sections/intro';
import TrustSection from './home/sections/trust';
import Benefits from './home/sections/benefits';
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
    { label: 'Guide', href: '#how-to-start' },
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
      <Benefits />
      <TrustSection />
      <HomePackages />
      <div className="text-center py-16 bg-gray-50">
        <h2 className="text-4xl font-bold mb-4">{t('start_journey')}</h2>
        <button className="bg-primary hover:bg-primary/90 text-white font-bold py-4 px-8 rounded-full text-lg transition-all">
          {t('enroll_now')}
        </button>
      </div>
      <HomeServices />
      <ContactUs />
      <Footer navLinks={navLinks} />
    </>
  );
}
