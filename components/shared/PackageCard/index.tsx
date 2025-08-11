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
import CheckoutButton from '@/components/stripe/Button';

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
    return features.map(feature => {
      try {
        if (feature.includes('days / week')) {
          const translated = tPackage(`${cardInfo.total_classes}_classes.features.days_per_week`);
          return translated.includes('PackageContent') ? feature : translated;
        }
        if (feature.includes('minutes / day')) {
          const translated = tPackage(`${cardInfo.total_classes}_classes.features.duration`);
          return translated.includes('PackageContent') ? feature : translated;
        }
        if (feature.includes('/ class')) {
          const priceMatch = feature.match(/\$[\d.]+/);
          const price = priceMatch ? priceMatch[0] : '';
          const translated = tPackage(`${cardInfo.total_classes}_classes.features.per_class`);
          return translated.includes('PackageContent') ? feature : `${price}${translated}`;
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
  const translatedTitle = getTranslatedContent('title', cardInfo.title || `${cardInfo.class_duration} Minutes`);
  const translatedDescription = getTranslatedContent('description', cardInfo.description || '');
  const translatedSubject = (() => {
    try {
      const translated = tPackage('subject');
      return translated.includes('PackageContent') ? cardInfo.subject : translated;
    } catch {
      return cardInfo.subject;
    }
  })();
  const translatedLevel = (() => {
    if (!cardInfo.level) return 'All Levels';
    try {
      const translated = tPackage(`levels.${cardInfo.level}`);
      return translated.includes('PackageContent') ? cardInfo.level : translated;
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
          <h3 className='package-card__title'>
            {translatedTitle}
          </h3>
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
              {cardInfo.days} days/week
            </li>
            <li className='package-card__info-item'>
              <BsClock size={16} />
              {cardInfo.class_duration} min/class
            </li>
            {cardInfo.total_classes && (
              <li className='package-card__info-item'>
                <BsPeople size={16} />
                {cardInfo.total_classes} total classes
              </li>
            )}
            {perClassPrice && (
              <li className='package-card__info-item'>
                <BsStar size={16} />
                {currencySymbol}
                {perClassPrice}/class
              </li>
            )}
          </ul>

          {/* Features Preview */}
          {translatedFeatures && translatedFeatures.length > 0 && (
            <div className='package-card__features-preview'>
              {translatedFeatures.slice(0, 3).map((feature, index) => (
                <div key={index} className='package-card__feature'>
                  <BsCheckCircle size={12} />
                  <span>{feature}</span>
                </div>
              ))}
              {translatedFeatures.length > 3 && (
                <span className='package-card__more-features'>
                                  <span className='package-card__features-count'>
                  +{translatedFeatures.length - 3} more
                </span>
                </span>
              )}
            </div>
          )}
        </div>

        <div className='package-card__btn-wrapper'>
          <Dialog>
            <DialogTrigger asChild>
              <Button size='lg' className='w-full' variant='qo_primary'>
                {t('buttons.enroll_now')}
              </Button>
            </DialogTrigger>
            <DialogContent className='sm:max-w-[500px] max-h-[80vh] overflow-y-auto'>
              <DialogHeader>
                <DialogTitle className='text-2xl font-bold flex items-center gap-2'>
                  {translatedTitle}
                  {cardInfo.is_popular && (
                    <Badge variant='destructive'>Popular</Badge>
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
                      <span>Current Price:</span>
                      <span className='text-2xl font-bold text-primary'>
                        {currencySymbol} {cardInfo.current_price}
                      </span>
                    </div>
                    {/* Show original price for monthly or when there's a discount */}
                    {(cardInfo.subscription_frequency === 'monthly' ||
                      (cardInfo.discount && cardInfo.discount !== '0%')) && (
                      <>
                        <div className='flex justify-between items-center text-gray-500'>
                          <span>Original Price:</span>
                          <span className='line-through'>
                            {currencySymbol} {cardInfo.original_price}
                          </span>
                        </div>
                        {cardInfo.discount && cardInfo.discount !== '0%' && (
                          <div className='flex justify-between items-center text-green-600'>
                            <span>You Save:</span>
                            <span className='font-semibold'>
                              {cardInfo.discount}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                    {perClassPrice && (
                      <div className='flex justify-between items-center border-t pt-2'>
                        <span>Per Class:</span>
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
                  <h4 className='font-semibold text-lg'>Package Details</h4>
                  <div className='grid grid-cols-2 gap-4'>
                    {cardInfo.subject && (
                      <div className='flex items-center gap-2'>
                        <BsBook className='h-4 w-4 text-primary' />
                        <span className='text-sm'>
                          <strong>Subject:</strong> {cardInfo.subject}
                        </span>
                      </div>
                    )}
                    {cardInfo.level && (
                      <div className='flex items-center gap-2'>
                        <BsAward className='h-4 w-4 text-primary' />
                        <span className='text-sm'>
                          <strong>Level:</strong> {translatedLevel}
                        </span>
                      </div>
                    )}
                    <div className='flex items-center gap-2'>
                      <BsCalendar2 className='h-4 w-4 text-primary' />
                      <span className='text-sm'>
                        <strong>Frequency:</strong>{' '}
                        {cardInfo.subscription_frequency}
                      </span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <BsClock className='h-4 w-4 text-primary' />
                      <span className='text-sm'>
                        <strong>Duration:</strong> {cardInfo.class_duration}{' '}
                        min/class
                      </span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <BsPeople className='h-4 w-4 text-primary' />
                      <span className='text-sm'>
                        <strong>Schedule:</strong> {cardInfo.days} days/week
                      </span>
                    </div>
                    {cardInfo.total_classes && (
                      <div className='flex items-center gap-2'>
                        <BsCheckCircle className='h-4 w-4 text-primary' />
                        <span className='text-sm'>
                          <strong>Total Classes:</strong>{' '}
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
                      What&apos;s Included
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
                      Program Duration
                    </h5>
                    <p className='text-blue-700 text-sm'>
                      This package runs for {cardInfo.duration_weeks} weeks with{' '}
                      {cardInfo.days} classes per week.
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
