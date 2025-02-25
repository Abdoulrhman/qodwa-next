import Image from 'next/image';
import { BsCalendar2, BsClock, BsEnvelopePaperFill } from 'react-icons/bs';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Package } from '@/APISchema';

interface PackageCardProps {
  cardInfo: Package;
}

const PackageCard: React.FC<PackageCardProps> = ({
  cardInfo: { id, package_id, price, currency, days, duration, is_popular },
}) => {
  const { locale } = useParams();
  const t = useTranslations('Home');

  return (
    <div className='package-card-wrapper'>
      <div className={`package-card ${is_popular ? 'popular' : ''}`}>
        <div className='package-card__price'>
          <div className='package-card__price-wrapper'>
            <span className='package-card__price--discounted'>
              {currency} {price}
            </span>
          </div>
        </div>
        <div className='package-card__course-details'>
          <p className='package-card__time-per-week'>{duration} min</p>
          <ul className='package-card__info-list'>
            <li className='package-card__info-item'>
              <BsCalendar2 size={16} /> {days} {t('Features.days_per_week')}
            </li>
            <li className='package-card__info-item'>
              <BsClock size={16} /> {duration} min {t('Features.duration')}
            </li>
          </ul>
        </div>
        <div className='package-card__btn-wrapper'>
          <Link href={`/${locale}/packages/${id}`}>
            <Button size='lg' className='w-full' variant='qo_primary'>
              {t('buttons.view_details')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PackageCard;
