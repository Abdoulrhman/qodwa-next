import { useTranslations } from 'next-intl';
import HomePackages from './home/sections/packages';
import HomeServices from './home/sections/services';
import HomeIntro from './home/sections/intro';


export default function Home() {
  const t = useTranslations('Home');
  return (
    <>
      <HomeIntro />
      <HomePackages />
      <HomeServices />
    </>
  );
}
