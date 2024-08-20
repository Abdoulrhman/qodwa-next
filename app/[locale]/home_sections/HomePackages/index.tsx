'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { Autoplay } from 'swiper/modules';

import PackageCard from '../../components/PackageCard';
import { useTranslations } from 'next-intl';
import SwitchButton from '../../components/SwitchButton';
import { useEffect, useState } from 'react';

const HomePackages: React.FC = () => {
  const t = useTranslations('Home');

  const [selectedList, setSelectedList] = useState([]);
  const [selected, setSelected] = useState('30 minutes');

  const packageData1 = [
    {
      current_price: '$100',
      original_price: '$300',
      discount: '50%',
      subscription_frequency: 'Month',
      days_per_week: '3 Days / Week',
      classes_per_month: '12 Classes / Month',
      class_duration: '60 mins',
      enrollment_action: 'Enroll Now',
      package_type: 'Basic',
    },
    {
      current_price: '$100',
      original_price: '$200',
      discount: '50%',
      subscription_frequency: 'Monthly',
      days_per_week: '3 Days',
      classes_per_month: '12 Classes',
      class_duration: '1 Hour',
      enrollment_action: 'Enroll Now',
      package_type: 'Basic',
    },
    {
      current_price: '$100',
      original_price: '$200',
      discount: '50%',
      subscription_frequency: 'Monthly',
      days_per_week: '3 Days',
      classes_per_month: '12 Classes',
      class_duration: '1 Hour',
      enrollment_action: 'Enroll Now',
      package_type: 'Basic',
    },
    {
      current_price: '$100',
      original_price: '$200',
      discount: '50%',
      subscription_frequency: 'Monthly',
      days_per_week: '3 Days',
      classes_per_month: '12 Classes',
      class_duration: '1 Hour',
      enrollment_action: 'Enroll Now',
      package_type: 'Basic',
    },
    {
      current_price: '$100',
      original_price: '$200',
      discount: '50%',
      subscription_frequency: 'Monthly',
      days_per_week: '3 Days',
      classes_per_month: '12 Classes',
      class_duration: '1 Hour',
      enrollment_action: 'Enroll Now',
      package_type: 'Basic',
    },
  ];
  const packageData2 = [
    {
      current_price: '$100',
      original_price: '$200',
      discount: '50%',
      subscription_frequency: 'Monthly',
      days_per_week: '3 Days',
      classes_per_month: '12 Classes',
      class_duration: '1 Hour',
      enrollment_action: 'Enroll Now',
      package_type: 'Basic',
    },
    {
      current_price: '$100',
      original_price: '$200',
      discount: '50%',
      subscription_frequency: 'Monthly',
      days_per_week: '3 Days',
      classes_per_month: '12 Classes',
      class_duration: '1 Hour',
      enrollment_action: 'Enroll Now',
      package_type: 'Basic',
    },
    {
      current_price: '$100',
      original_price: '$200',
      discount: '50%',
      subscription_frequency: 'Monthly',
      days_per_week: '3 Days',
      classes_per_month: '12 Classes',
      class_duration: '1 Hour',
      enrollment_action: 'Enroll Now',
      package_type: 'Basic',
    },
    {
      current_price: '$100',
      original_price: '$200',
      discount: '50%',
      subscription_frequency: 'Monthly',
      days_per_week: '3 Days',
      classes_per_month: '12 Classes',
      class_duration: '1 Hour',
      enrollment_action: 'Enroll Now',
      package_type: 'Basic',
    },
    {
      current_price: '$100',
      original_price: '$200',
      discount: '50%',
      subscription_frequency: 'Monthly',
      days_per_week: '3 Days',
      classes_per_month: '12 Classes',
      class_duration: '1 Hour',
      enrollment_action: 'Enroll Now',
      package_type: 'Basic',
    },
  ];

  useEffect(() => {
    if (selected === '30 minutes') {
      setSelectedList(packageData1 as never[]);
    } else {
      setSelectedList(packageData2 as never[]);
    }
  }, [selected]);

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

        <Swiper
          spaceBetween={50}
          slidesPerView={3}
          //   autoplay={{
          //     delay: 2500,
          //     pauseOnMouseEnter: true,
          //   }}
          loop
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
      </div>
    </div>
  );
};

export default HomePackages;
