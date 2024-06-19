import Image from 'next/image';
import { PackageObject } from './types';
import { BsCalendar2, BsClock, BsEnvelopePaperFill } from 'react-icons/bs';

interface PackageCardProps {
  cardInfo: PackageObject;
}

const PackageCard: React.FC<PackageCardProps> = ({
  cardInfo: {
    current_price,
    original_price,
    discount,
    subscription_frequency,
    days_per_week,
    classes_per_month,
    class_duration,
    enrollment_action,
    package_type,
  },
}) => {
  return (
    <div className='price-card-wrapper'>
      <div className='price-card'>
        <div className='flied-icon2'>
          <Image
            src='/images/cilbration.png'
            alt='cilbration'
            width={200}
            height={200}
          />
        </div>
        <div className='price'>
          <span className='discounted-price'>{current_price}</span>
          <span className='original-price'>{original_price}</span>
          <span className='discount-percentage'>{discount} off</span>
          <span className='subscription-frequency'>
            {subscription_frequency}
          </span>
        </div>
        <div className='course-details'>
          <p className='time-per-week'>{class_duration}</p>
          <ul>
            <li>
              <BsCalendar2 size={20} />
              {days_per_week}
            </li>
            <li>
              <BsClock size={20} />
              {classes_per_month}
            </li>
            <li>
              <BsEnvelopePaperFill size={20} />

              {package_type}
            </li>
          </ul>
        </div>
        <button className='enroll-button'>{enrollment_action}</button>
      </div>
    </div>
  );
};

export default PackageCard;
