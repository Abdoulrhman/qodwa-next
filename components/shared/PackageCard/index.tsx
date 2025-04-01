import Image from 'next/image';
import { BsCalendar2, BsClock, BsEnvelopePaperFill } from 'react-icons/bs';
import { Button } from '@/components/ui/button';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import CheckoutButton from '@/components/stripe/Button';

interface PackageCardProps {
  cardInfo: {
    id: number;
    current_price: string;
    original_price: string;
    discount: string;
    subscription_frequency: string;
    class_duration: string;
    enrollment_action: string;
    package_type: string;
    currency: string;
    is_popular: boolean;
  };
}

const PackageCard: React.FC<PackageCardProps> = ({ cardInfo }) => {
  const { locale } = useParams();
  const t = useTranslations('Home');
  const currencySymbol = cardInfo.currency === 'USD' ? '$' : '€';

  // Format items for Stripe checkout
  const items = [
    {
      name: cardInfo.package_type,
      price: parseFloat(cardInfo.current_price),
      quantity: 1,
      packageId: cardInfo.id,
    },
  ];

  return (
    <div className='package-card-wrapper'>
      <div className={`package-card ${cardInfo.is_popular ? 'popular' : ''}`}>
        {cardInfo.is_popular && (
          <div className='popular-badge'>{t('Features.popular')}</div>
        )}
        <div className='package-card__price'>
          <div className='package-card__price-wrapper'>
            <span className='package-card__price--discounted'>
              {currencySymbol} {cardInfo.current_price}
            </span>
            {cardInfo.discount && (
              <span className='package-card__price--original'>
                {currencySymbol} {cardInfo.original_price}
              </span>
            )}
          </div>
        </div>
        <div className='package-card__course-details'>
          <p className='package-card__time-per-week'>
            {cardInfo.class_duration} min
          </p>
          <ul className='package-card__info-list'>
            <li className='package-card__info-item'>
              <BsCalendar2 size={16} /> {cardInfo.subscription_frequency}
            </li>
            <li className='package-card__info-item'>
              <BsClock size={16} /> {cardInfo.class_duration} min{' '}
              {t('Features.duration')}
            </li>
          </ul>
        </div>
        <div className='package-card__btn-wrapper'>
          <Dialog>
            <DialogTrigger asChild>
              <Button size='lg' className='w-full' variant='qo_primary'>
                {t('buttons.enroll_now')}
              </Button>
            </DialogTrigger>
            <DialogContent className='sm:max-w-[425px]'>
              <DialogHeader>
                <DialogTitle className='text-2xl font-bold'>
                  {cardInfo.package_type}
                </DialogTitle>
                <DialogDescription>
                  {t('Features.package_details_description')}
                </DialogDescription>
              </DialogHeader>

              <div className='grid gap-4 py-4'>
                <div className='space-y-4'>
                  {/* Subscription Frequency */}
                  <div className='flex items-center gap-2'>
                    <BsCalendar2 className='h-5 w-5 text-primary' />
                    <span>
                      {t('Features.subscription_frequency')}:{' '}
                      {cardInfo.subscription_frequency}
                    </span>
                  </div>

                  {/* Class Duration */}
                  <div className='flex items-center gap-2'>
                    <BsClock className='h-5 w-5 text-primary' />
                    <span>
                      {t('Features.class_duration')}: {cardInfo.class_duration}{' '}
                      min
                    </span>
                  </div>

                  {/* Enrollment Action */}

                  {/* Package Type */}
                  <div className='flex items-center gap-2'>
                    <span className='font-semibold'>
                      {t('Features.package_type')}:
                    </span>
                    <span>{cardInfo.package_type}</span>
                  </div>

                  {/* Price Details */}
                  <div className='mt-4'>
                    <h4 className='font-semibold mb-2'>
                      {t('Features.price_details')}
                    </h4>
                    <div className='space-y-2'>
                      <div className='text-2xl font-bold text-muted'>
                        {cardInfo.currency} {cardInfo.original_price}
                      </div>
                      {cardInfo.discount && (
                        <div className='text-3xl font-bold text-primary'>
                          {cardInfo.currency} {cardInfo.current_price}
                        </div>
                      )}
                      <div className='text-sm text-gray-500'>
                        {t('Features.discount')}: {cardInfo.discount}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className='flex justify-end'>
                <CheckoutButton items={items} className='w-32' />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default PackageCard;
