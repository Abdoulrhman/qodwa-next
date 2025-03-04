import React from 'react';
import {
  FaRegArrowAltCircleRight,
  FaRegArrowAltCircleLeft,
} from 'react-icons/fa';
import { useTranslations, useLocale } from 'next-intl'; // Import useLocale to detect language direction

const HowToStart: React.FC = () => {
  const t = useTranslations('Home.HowToStart');
  const locale = useLocale(); // Get the current locale

  const isRTL = locale === 'ar'; // Check if the language is Arabic (right-to-left)

  return (
    <div className='how-to-start-wrapper' id='how-to-start'>
      <h2 className='how-to-start-title'>{t('title')}</h2>
      <p className='how-to-start-subtitle'>{t('subtitle')}</p>
      <div className='how-to-start-main'>
        {/* Step 1 */}
        <div className='how-to-start-main-points'>
          <p className='points-number'>{t('steps.step1.number')}</p>
          <div className='points-wrapper'>
            <div className='points-wrapper-main'>
              <div className='points-title'>
                <div className='points-title-wrapper'>
                  <p className='title'>{t('steps.step1.title')}</p>
                  <div className='under-line'></div>
                </div>
              </div>
              <div className='points-content'>
                {t('steps.step1.description')}
              </div>
            </div>
            <div className='arrow'>
              {isRTL ? (
                <FaRegArrowAltCircleLeft size='30px' /> // Show left arrow for RTL
              ) : (
                <FaRegArrowAltCircleRight size='30px' /> // Show right arrow for LTR
              )}
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className='how-to-start-main-points'>
          <p className='points-number'>{t('steps.step2.number')}</p>
          <div className='points-wrapper'>
            <div className='points-wrapper-main'>
              <div className='points-title'>
                <div className='points-title-wrapper'>
                  <p className='title'>{t('steps.step2.title')}</p>
                  <div className='under-line'></div>
                </div>
              </div>
              <div className='points-content'>
                {t('steps.step2.description')}
              </div>
            </div>
            <div className='arrow'>
              {isRTL ? (
                <FaRegArrowAltCircleLeft size='30px' />
              ) : (
                <FaRegArrowAltCircleRight size='30px' />
              )}
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className='how-to-start-main-points'>
          <p className='points-number'>{t('steps.step3.number')}</p>
          <div className='points-wrapper'>
            <div className='points-wrapper-main'>
              <div className='points-title'>
                <div className='points-title-wrapper'>
                  <p className='title'>{t('steps.step3.title')}</p>
                  <div className='under-line'></div>
                </div>
              </div>
              <div className='points-content'>
                {t('steps.step3.description')}
              </div>
            </div>
            <div className='arrow'>
              {isRTL ? (
                <FaRegArrowAltCircleLeft size='30px' />
              ) : (
                <FaRegArrowAltCircleRight size='30px' />
              )}
            </div>
          </div>
        </div>

        {/* Step 4 */}
        <div className='how-to-start-main-points'>
          <p className='points-number'>{t('steps.step4.number')}</p>
          <div className='points-wrapper'>
            <div className='points-wrapper-main'>
              <div className='points-title'>
                <div className='points-title-wrapper'>
                  <p className='title'>{t('steps.step4.title')}</p>
                  <div className='under-line'></div>
                </div>
              </div>
              <div className='points-content'>
                {t('steps.step4.description')}
              </div>
            </div>
            <div className='arrow'>
              {isRTL ? (
                <FaRegArrowAltCircleLeft size='30px' />
              ) : (
                <FaRegArrowAltCircleRight size='30px' />
              )}
            </div>
          </div>
        </div>
      </div>
      <button>{t('apply_button')}</button>
    </div>
  );
};

export default HowToStart;
