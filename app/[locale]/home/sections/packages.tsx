'use client';

import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { Autoplay } from 'swiper/modules';

import { useTranslations, useLocale } from 'next-intl';
import SwitchButton from '@/components/shared/SwitchButton';
import axiosInstance from '@/services/axiosInstance';
import { Package, PackagesResponse } from '@/APISchema';
import Skeleton from '@/components/shared/Skeleton';
import PackageCard from '@/components/shared/PackageCard';

const HomePackages: React.FC = () => {
  const t = useTranslations('Home');
  const locale = useLocale();
  const isRTL = locale === 'ar';

  const [selectedList, setSelectedList] = useState<Package[]>([]);
  const [packages, setPackages] = useState<PackagesResponse>(
    {} as PackagesResponse
  );
  const [selectedFrequency, setSelectedFrequency] = useState('monthly');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axiosInstance
      .get('/packages')
      .then((res) => {
        setPackages(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(t('Packages.error_loading_packages'));
        setLoading(false);
      });
  }, [t]);

  useEffect(() => {
    // Selecting packages based on subscription frequency only
    const filteredPackages =
      packages[selectedFrequency as keyof PackagesResponse] || [];

    setSelectedList(filteredPackages);
  }, [selectedFrequency, packages]);

  const renderSkeletons = () => (
    <Swiper
      spaceBetween={50}
      slidesPerView={3}
      loop
      autoplay={{ delay: 3000, pauseOnMouseEnter: true }}
      navigation={true}
      modules={[Autoplay]}
      breakpoints={{
        300: { slidesPerView: 1 },
        640: { slidesPerView: 2, spaceBetween: 20 },
        768: { slidesPerView: 3, spaceBetween: 20 },
      }}
    >
      {Array(3)
        .fill(0)
        .map((_, index) => (
          <SwiperSlide key={index}>
            <Skeleton
              width='calc(100% - 20px)'
              height='300px'
              borderRadius='8px'
            />
          </SwiperSlide>
        ))}
    </Swiper>
  );

  return (
    <div className='home-packages' id='packages'>
      <div className='container__header'>
        <h2 className='home__packages__title'>
          <span className='home__packages__title__explore'>{t('explore')}</span>
          <span> {t('our_packages')} </span>
        </h2>

        {/* Filters Wrapper */}
        <div className='filters-container'>
          {/* Subscription Frequency Filter */}
          <SwitchButton
            selected={selectedFrequency}
            setSelected={setSelectedFrequency}
            options={[
              { value: 'monthly', label: t('monthly') },
              { value: 'quarterly', label: t('quarterly') },
              { value: 'half-year', label: t('half-year') },
              { value: 'yearly', label: t('yearly') },
            ]}
            width='700px'
          />
        </div>
      </div>

      {loading ? (
        renderSkeletons()
      ) : (
        <Swiper
          dir={isRTL ? 'rtl' : 'ltr'}
          key={`swiper-${isRTL}`} // Force re-render when direction changes
          spaceBetween={50}
          slidesPerView={3}
          breakpoints={{
            300: { slidesPerView: 1 },
            640: { slidesPerView: 2, spaceBetween: 20 },
            768: { slidesPerView: 3, spaceBetween: 20 },
          }}
        >
          {selectedList.length > 0 ? (
            selectedList.map((data, index) => (
              <SwiperSlide key={index}>
                <PackageCard cardInfo={data} />
              </SwiperSlide>
            ))
          ) : (
            <SwiperSlide>
              <div className='no-packages'>
                {t('Packages.no_packages_available')}
              </div>
            </SwiperSlide>
          )}
        </Swiper>
      )}

      {error && (
        <div className='error_message'>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default HomePackages;
