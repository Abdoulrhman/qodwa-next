import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import ToggleSwitch from '@/components/shared/ToggleSwitch';
import HomePackages from './home/sections/packages';
import HomeServices from './home/sections/services';
import HomeIntro from './home/sections/intro';


export default function Home() {
  const t = useTranslations('Home');
  const locale = useLocale();
  return (
    <>
      <HomeIntro />
      <HomePackages />
      <HomeServices />
    </>
  );
}
