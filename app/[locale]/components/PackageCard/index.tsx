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
    <div className='package-card-wrapper'>
      <div className='package-card'>
        <div className='package-card__price'>
          <span className='package-card__price--original'>
            ${original_price}
          </span>
          <div className='package-card__price-wrapper'>
            <span className='package-card__price--discounted'>
              ${current_price}
            </span>
            <span className='package-card__subscription-frequency'>
              /{subscription_frequency}
            </span>
          </div>
        </div>
        <div className='package-card__course-details'>
          <p className='package-card__time-per-week'>{class_duration}</p>
          <ul className='package-card__info-list'>
            <li className='package-card__info-item'>
              <BsCalendar2 size={16} />
              {days_per_week}
            </li>
            <li className='package-card__info-item'>
              <BsClock size={16} />
              {classes_per_month}
            </li>
            <li className='package-card__info-item'>
              <BsEnvelopePaperFill size={16} />
              {package_type}
            </li>
          </ul>
        </div>
        <div className='package-card__btn-wrapper'>
          <button className='package-card__enroll-button'>
            {enrollment_action}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PackageCard;
