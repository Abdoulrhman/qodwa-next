'use client';

import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { Autoplay } from 'swiper/modules';

import { useTranslations } from 'next-intl';
import SwitchButton from '@/components/shared/SwitchButton';
import axiosInstance from '@/services/axiosInstance';
import { Package, PackagesResponse } from '@/APISchema';
import Skeleton from '@/components/shared/Skeleton';
import PackageCard from '@/components/shared/PackageCard';

const HomePackages: React.FC = () => {
  const t = useTranslations('Home');

  const [selectedList, setSelectedList] = useState<Package[]>([]);
  const [packages, setPackages] = useState<PackagesResponse>(
    {} as PackagesResponse
  );
  const [selected, setSelected] = useState('30 minutes');
  const [loading, setLoading] = useState(true); // Initial loading state
  const [error, setError] = useState<string | null>(null); // Error state

  useEffect(() => {
    axiosInstance
      .get('/packages')
      .then((res) => {
        setPackages(res.data);
        setLoading(false); // Stop loading when data is fetched
      })
      .catch((err) => {
        setError(t('error_loading_packages')); // Set error message
        setLoading(false); // Stop loading on error
      });
  }, [t]);

  useEffect(() => {
    if (selected === '30 minutes') {
      setSelectedList(packages.thirtyMinutes || []);
    } else {
      setSelectedList(packages.sixtyMinutes || []);
    }
  }, [selected, packages]);

  const renderSkeletons = () => (
    <div className='skeleton-container'>
      {Array(3)
        .fill(0)
        .map((_, index) => (
          <Skeleton
            key={index}
            width='calc(33.33% - 20px)'
            height='300px'
            borderRadius='8px'
          />
        ))}
    </div>
  );

  return (
    <div className='home__packages'>
      <div className='container'>
        <div className='container__header'>
          <h2 className='home__packages__title'>
            <span className='home__packages__title__explore'>
              {t('explore')}
            </span>
            <span> {t('our_packages')} </span>
          </h2>
          <SwitchButton selected={selected} setSelected={setSelected} />
        </div>

        {loading ? (
          renderSkeletons() // Render skeletons outside of Swiper
        ) : (
          <Swiper
            spaceBetween={50}
            slidesPerView={3}
            loop
            autoplay={{ delay: 3000, pauseOnMouseEnter: true }}
            navigation={true}
            modules={[Autoplay]}
            breakpoints={{
              300: {
                slidesPerView: 1,
              },
              640: {
                slidesPerView: 2,
                spaceBetween: 20,
              },
              768: {
                slidesPerView: 3,
                spaceBetween: 20,
              },
            }}
          >
            {selectedList.map((data, index) => (
              <SwiperSlide key={index}>
                <PackageCard cardInfo={data} />
              </SwiperSlide>
            ))}
          </Swiper>
        )}

        {error && (
          <div className='error_message'>
            <p>{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePackages;
