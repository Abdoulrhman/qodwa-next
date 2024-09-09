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
        <div className='price'>
          <span className='original-price'>${original_price}</span>
          <div className='package-price'>
            <span className='discounted-price'>${current_price}</span>
            <span className='subscription-frequency'>
              /{subscription_frequency}
            </span>
          </div>
        </div>
        <div className='course-details'>
          <p className='time-per-week'>{class_duration}</p>
          <ul>
            <li>
              <BsCalendar2 size={16} />
              {days_per_week}
            </li>
            <li>
              <BsClock size={16} />
              {classes_per_month}
            </li>
            <li>
              <BsEnvelopePaperFill size={16} />

              {package_type}
            </li>
          </ul>
        </div>
        <div className='btn-wrapper'>
          <button className='enroll-button'>{enrollment_action}</button>
        </div>
      </div>
    </div>
  );
};

export default PackageCard;
