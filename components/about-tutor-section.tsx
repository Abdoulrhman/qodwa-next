import { FreeAccessIcon } from '@/public/icons/FreeAccessIcon';
import KnowAboutClassesIcon from '@/public/icons/KnowAboutClassesIcon';
import ProfessionalEducatorsIcon from '@/public/icons/ProfessionalEducatorsIcon';
import RealTimeSupportIcon from '@/public/icons/RealTimeSupportIcon';
import React from 'react';

const AboutTutorSection = () => {
  return (
    <section className='tp-about-tutor-area pt-[110px] pb-[90px]' id='about-us'>
      {/* Container */}
      <div className='container max-w-7xl mx-auto px-4'>
        {/* Top Row */}
        <div className='row flex flex-wrap items-end'>
          {/* Left Column */}
          <div className='col-lg-6 w-full lg:w-6/12 mb-[130px]'>
            <div className='tp-about-tutor-heading'>
              <div className='tp-about-tutor-subtitle flex items-center space-x-2 mb-4'>
                <span>
                  {/* SVG Icon */}
                  <KnowAboutClassesIcon />
                </span>
                <p className='text-sm font-medium text-blue-600'>
                  Know about classes
                </p>
              </div>
              <h3 className='tp-about-tutor-title text-3xl md:text-4xl font-bold leading-tight'>
                We create unique <br />
                digital media experiences.
              </h3>
            </div>
          </div>

          {/* Right Column */}
          <div className='col-lg-6 w-full lg:w-6/12'>
            <div className='tp-about-tutor-right flex lg:justify-end mb-[130px]'>
              <div className='tp-about-tutor-content'>
                <p className='text-gray-600 leading-relaxed'>
                  Online courses from the world&apos;s leading experts. <br />
                  Lorem ipsum is simply dummy of the printing and <br />
                  typesetting industry lorem
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row (Tutor Items) */}
        <div className='row flex flex-wrap -mx-4'>
          {/* Single Item */}
          <div
            className='col-lg-4 col-md-6 w-full md:w-6/12 lg:w-4/12 px-4 mb-8'
            data-wow-delay='.3s'
          >
            <div className='tp-tutor-item about text-center'>
              <div className='tp-tutor-icon mb-5 flex justify-center'>
                <span>
                  <ProfessionalEducatorsIcon />
                </span>
              </div>
              <div className='tp-tutor-content'>
                <h4 className='tp-tutor-title text-lg font-semibold mb-2'>
                  Professional Educators
                </h4>
                <p className='text-gray-600'>
                  Get one-on-one help from our subject matter experts.
                </p>
              </div>
            </div>
          </div>

          {/* Single Item */}
          <div
            className='col-lg-4 col-md-6 w-full md:w-6/12 lg:w-4/12 px-4 mb-8'
            data-wow-delay='.5s'
          >
            <div className='tp-tutor-item about text-center'>
              <div className='tp-tutor-icon mb-5 flex justify-center'>
                <span>
                  <RealTimeSupportIcon />
                </span>
              </div>
              <div className='tp-tutor-content'>
                <h4 className='tp-tutor-title text-lg font-semibold mb-2'>
                  Real-Time Support
                </h4>
                <p className='text-gray-600'>
                  Ask questions over live chat or schedule a virtual meeting.
                </p>
              </div>
            </div>
          </div>

          {/* Single Item */}
          <div
            className='col-lg-4 col-md-6 w-full md:w-6/12 lg:w-4/12 px-4 mb-8'
            data-wow-delay='.7s'
          >
            <div className='tp-tutor-item about text-center'>
              <div className='tp-tutor-icon mb-5 flex justify-center'>
                <span>
                  <FreeAccessIcon />
                </span>
              </div>
              <div className='tp-tutor-content'>
                <h4 className='tp-tutor-title text-lg font-semibold mb-2'>
                  Free Access
                </h4>
                <p className='text-gray-600'>
                  Every course offers online tutoring at no additional charge.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutTutorSection;
