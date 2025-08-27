import Image from 'next/image';
import {
  BsCalendar2,
  BsClock,
  BsEnvelopePaperFill,
  BsPeople,
  BsBook,
  BsStar,
  BsCheckCircle,
  BsAward,
} from 'react-icons/bs';
import { Button } from '@/components/ui/button';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import CheckoutButton from '@/features/subscriptions/components/stripe/Button';

interface PackageCardProps {
  cardInfo: {
    id: number;
    current_price: string;
    original_price: string;
    discount: string;
    subscription_frequency: string;
    days: number;
    class_duration: number;
    total_classes: number | null;
    duration_weeks: number | null;
    subject: string | null;
    level: string | null;
    features: string[];
    title: string | null;
    description: string | null;
    enrollment_action: string;
    package_type: string;
    currency: string;
    is_popular: boolean;
    is_active: boolean;
    sort_order: number | null;
  };
}

const PackageCard: React.FC<PackageCardProps> = ({ cardInfo }) => {
  const { locale } = useParams();
  const t = useTranslations('Home');
  const tPackage = useTranslations('Home.PackageContent');
  const tCommon = useTranslations('Common');
  const currencySymbol = cardInfo.currency === 'USD' ? '$' : '€';

  // Helper function to get translated package content
  const getTranslatedContent = (key: string, fallback: string) => {
    const packageKey = `${cardInfo.total_classes}_classes.${key}`;
    try {
      const translated = tPackage(packageKey);
      // If translation returns the key itself (meaning not found), use fallback
      return translated.includes('PackageContent') ? fallback : translated;
    } catch {
      return fallback;
    }
  };

  // Helper function to get translated features
  const getTranslatedFeatures = (features: string[]) => {
    return features.map((feature) => {
      try {
        if (feature.includes('days / week')) {
          const translated = tPackage(
            `${cardInfo.total_classes}_classes.features.days_per_week`
          );
          return translated.includes('PackageContent') ? feature : translated;
        }
        if (feature.includes('minutes / day')) {
          const translated = tPackage(
            `${cardInfo.total_classes}_classes.features.duration`
          );
          return translated.includes('PackageContent') ? feature : translated;
        }
        if (feature.includes('/ class')) {
          const priceMatch = feature.match(/\$[\d.]+/);
          const price = priceMatch ? priceMatch[0] : '';
          const translated = tPackage(
            `${cardInfo.total_classes}_classes.features.per_class`
          );
          return translated.includes('PackageContent')
            ? feature
            : `${price}${translated}`;
        }
        if (feature.includes('Save')) {
          const discountMatch = feature.match(/Save (\d+%)/);
          const discount = discountMatch ? discountMatch[1] : '';
          const translated = tPackage('save_discount', { discount });
          return translated.includes('PackageContent') ? feature : translated;
        }
        return feature;
      } catch {
        return feature;
      }
    });
  };

  // Get translated content
  const translatedTitle = getTranslatedContent(
    'title',
    cardInfo.title ||
      t('Packages.minutes_title', { duration: cardInfo.class_duration })
  );
  const translatedDescription = getTranslatedContent(
    'description',
    cardInfo.description || ''
  );
  const translatedSubject = (() => {
    try {
      const translated = tPackage('subject');
      return translated.includes('PackageContent')
        ? cardInfo.subject
        : translated;
    } catch {
      return cardInfo.subject;
    }
  })();
  const translatedLevel = (() => {
    if (!cardInfo.level) return 'All Levels';
    try {
      const translated = tPackage(`levels.${cardInfo.level}`);
      return translated.includes('PackageContent')
        ? cardInfo.level
        : translated;
    } catch {
      return cardInfo.level;
    }
  })();
  const translatedFeatures = getTranslatedFeatures(cardInfo.features || []);

  // Format items for Stripe checkout
  const items = [
    {
      name: translatedTitle,
      price: parseFloat(cardInfo.current_price),
      quantity: 1,
      packageId: cardInfo.id,
    },
  ];

  // Calculate per class price
  const perClassPrice = cardInfo.total_classes
    ? (parseFloat(cardInfo.current_price) / cardInfo.total_classes).toFixed(1)
    : null;

  return (
    <div className='package-card-wrapper'>
      <div className={`package-card ${cardInfo.is_popular ? 'popular' : ''}`}>
        {cardInfo.is_popular && (
          <div className='popular-badge'>{t('Features.popular')}</div>
        )}

        {/* Package Header */}
        <div className='package-card__header'>
          <h3 className='package-card__title'>{translatedTitle}</h3>
          {translatedDescription && (
            <p className='package-card__description'>{translatedDescription}</p>
          )}
        </div>

        {/* Price Section */}
        <div className='package-card__price'>
          <div className='package-card__price-wrapper'>
            <span className='package-card__price--discounted'>
              {currencySymbol} {cardInfo.current_price}
            </span>
            {/* Always show original price as strikethrough for monthly, or when there's a discount */}
            {(cardInfo.subscription_frequency === 'monthly' ||
              (cardInfo.discount && cardInfo.discount !== '0%')) && (
              <span className='package-card__price--original'>
                {currencySymbol} {cardInfo.original_price}
              </span>
            )}
          </div>
          {cardInfo.discount && cardInfo.discount !== '0%' && (
            <Badge variant='destructive' className='mt-2'>
              Save {cardInfo.discount}
            </Badge>
          )}
        </div>

        {/* Course Details */}
        <div className='package-card__course-details'>
          <div className='package-card__stats'>
            {cardInfo.subject && (
              <div className='package-card__stat'>
                <BsBook size={14} />
                <span>{cardInfo.subject}</span>
              </div>
            )}
            {cardInfo.level && (
              <div className='package-card__stat'>
                <BsAward size={14} />
                <span>{translatedLevel}</span>
              </div>
            )}
          </div>

          <ul className='package-card__info-list'>
            <li className='package-card__info-item'>
              <BsCalendar2 size={16} />
              {t('Packages.days_per_week', { days: cardInfo.days })}
            </li>
            <li className='package-card__info-item'>
              <BsClock size={16} />
              {cardInfo.class_duration} {tCommon('minutes')}/{tCommon('class')}
            </li>
            {cardInfo.total_classes && (
              <li className='package-card__info-item'>
                <BsPeople size={16} />
                {cardInfo.total_classes} {tCommon('total_classes')}
              </li>
            )}
            {perClassPrice && (
              <li className='package-card__info-item'>
                <BsStar size={16} />
                {currencySymbol}
                {perClassPrice}/{tCommon('class')}
              </li>
            )}
          </ul>
        </div>

        <div className='package-card__btn-wrapper'>
          <Dialog>
            <DialogTrigger asChild>
              <Button size='lg' className='w-full' variant='qo_primary'>
                {t('Packages.enroll_now')}
              </Button>
            </DialogTrigger>
            <DialogContent className='sm:max-w-[500px] max-h-[80vh] overflow-y-auto'>
              <DialogHeader>
                <DialogTitle className='text-2xl font-bold flex items-center gap-2'>
                  {translatedTitle}
                  {cardInfo.is_popular && (
                    <Badge variant='destructive'>{t('Features.popular')}</Badge>
                  )}
                </DialogTitle>
                <DialogDescription>
                  {translatedDescription ||
                    t('Features.package_details_description')}
                </DialogDescription>
              </DialogHeader>

              <div className='grid gap-6 py-4'>
                {/* Pricing Details */}
                <div className='space-y-3'>
                  <h4 className='font-semibold text-lg flex items-center gap-2'>
                    <BsStar className='h-5 w-5 text-primary' />
                    {t('Features.price_details')}
                  </h4>
                  <div className='bg-gray-50 p-4 rounded-lg space-y-2'>
                    <div className='flex justify-between items-center'>
                      <span>{t('Packages.current_price')}:</span>
                      <span className='text-2xl font-bold text-primary'>
                        {currencySymbol} {cardInfo.current_price}
                      </span>
                    </div>
                    {/* Show original price for monthly or when there's a discount */}
                    {(cardInfo.subscription_frequency === 'monthly' ||
                      (cardInfo.discount && cardInfo.discount !== '0%')) && (
                      <>
                        <div className='flex justify-between items-center text-gray-500'>
                          <span>{t('Packages.original_price')}:</span>
                          <span className='line-through'>
                            {currencySymbol} {cardInfo.original_price}
                          </span>
                        </div>
                        {cardInfo.discount && cardInfo.discount !== '0%' && (
                          <div className='flex justify-between items-center text-green-600'>
                            <span>{t('Packages.you_save')}:</span>
                            <span className='font-semibold'>
                              {cardInfo.discount}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                    {perClassPrice && (
                      <div className='flex justify-between items-center border-t pt-2'>
                        <span>{t('Packages.per_class')}:</span>
                        <span className='font-semibold'>
                          {currencySymbol}
                          {perClassPrice}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Package Details */}
                <div className='space-y-3'>
                  <h4 className='font-semibold text-lg'>
                    {t('Packages.package_details')}
                  </h4>
                  <div className='grid grid-cols-2 gap-4'>
                    {cardInfo.subject && (
                      <div className='flex items-center gap-2'>
                        <BsBook className='h-4 w-4 text-primary' />
                        <span className='text-sm'>
                          <strong>{t('Packages.subject')}:</strong>{' '}
                          {cardInfo.subject}
                        </span>
                      </div>
                    )}
                    {cardInfo.level && (
                      <div className='flex items-center gap-2'>
                        <BsAward className='h-4 w-4 text-primary' />
                        <span className='text-sm'>
                          <strong>{t('Packages.level')}:</strong>{' '}
                          {translatedLevel}
                        </span>
                      </div>
                    )}
                    <div className='flex items-center gap-2'>
                      <BsCalendar2 className='h-4 w-4 text-primary' />
                      <span className='text-sm'>
                        <strong>{tCommon('frequency')}:</strong>{' '}
                        {cardInfo.subscription_frequency}
                      </span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <BsClock className='h-4 w-4 text-primary' />
                      <span className='text-sm'>
                        <strong>{tCommon('duration')}:</strong>{' '}
                        {cardInfo.class_duration} {tCommon('minutes')}/
                        {tCommon('class')}
                      </span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <BsPeople className='h-4 w-4 text-primary' />
                      <span className='text-sm'>
                        <strong>{tCommon('schedule')}:</strong>{' '}
                        {t('Packages.days_per_week', { days: cardInfo.days })}
                      </span>
                    </div>
                    {cardInfo.total_classes && (
                      <div className='flex items-center gap-2'>
                        <BsCheckCircle className='h-4 w-4 text-primary' />
                        <span className='text-sm'>
                          <strong>{tCommon('total_classes')}:</strong>{' '}
                          {cardInfo.total_classes}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Features */}
                {translatedFeatures && translatedFeatures.length > 0 && (
                  <div className='space-y-3'>
                    <h4 className='font-semibold text-lg'>
                      {t('Packages.whats_included')}
                    </h4>
                    <div className='space-y-2'>
                      {translatedFeatures.map((feature, index) => (
                        <div key={index} className='flex items-center gap-2'>
                          <BsCheckCircle className='h-4 w-4 text-green-500 flex-shrink-0' />
                          <span className='text-sm'>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Duration Info */}
                {cardInfo.duration_weeks && (
                  <div className='bg-blue-50 p-4 rounded-lg'>
                    <h5 className='font-semibold text-blue-800 mb-2'>
                      {t('Packages.program_duration')}
                    </h5>
                    <p className='text-blue-700 text-sm'>
                      {t('Packages.duration_description', {
                        weeks: cardInfo.duration_weeks,
                        days: cardInfo.days,
                      })}
                    </p>
                  </div>
                )}
              </div>

              <div className='flex justify-end pt-4 border-t'>
                <CheckoutButton items={items} className='w-full sm:w-auto' />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default PackageCard;
