import { useTranslations } from 'next-intl';
import '../styles/main.scss';
import Image from 'next/image';
import Link from 'next/link';
import ToggleSwitch from './components/ToggleSwitch';
import HomePackages from './home_sections/HomePackages';

export default function Home() {
  const t = useTranslations('Home');
  return (
    <div className='home'>
      <div className='home__intro'>
        <div className='container'>
          <div className='home__header-wrapper'>
            <div className='home__left-side'>
              <div className='home__logo'>
                <Image
                  src='/images/logo/logo.png' // Path to your image in the public folder
                  alt='Logo'
                  width={120} // Set the width of the image
                  height={40} // Set the height of the image
                />
              </div>
              <nav className='home__navbar__menu'>
                <ul className='nav'>
                  <li>
                    <Link href='#'>{t('about-us')}</Link>
                  </li>
                  <li>
                    <Link href='#'>{t('contact-us')}</Link>
                  </li>
                  <li>
                    <Link href='#'>{t('packages')}</Link>
                  </li>
                </ul>
              </nav>
            </div>
            <div className='home__right-side'>
              <button className='home__get-started'>{t('get_started')}</button>

              <div className='home__user-actions'>
                <Link href={'/login'}>{t('login')}</Link>
                <Link href={'/ar'}>عربي</Link>
              </div>
            </div>
          </div>
        </div>
        <div className='container'>
          <div className='home__content'>
            <ToggleSwitch />

            <h1 className='home__main-title'>
              <span>
                Hire <span>Remote Top Talents</span>
              </span>
              <span className='home__sub-title'>
                24,000+ Talent from around 80+ Country
              </span>
            </h1>

            <div className='home__cta'>
              <button className='home__cta__btn'>{t('get_started')}</button>
            </div>
          </div>
        </div>
      </div>
      <HomePackages />
    </div>
  );
}
