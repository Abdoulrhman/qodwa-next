import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BsCalendar2,
  BsClock,
  BsEnvelopePaperFill,
  BsCurrencyDollar,
  BsCheckCircleFill,
} from 'react-icons/bs';
import CheckoutButton from '@/components/stripe/Button';
import axiosInstance from '@/services/axiosInstance';
import { Package } from '@/APISchema';
import { headers } from 'next/headers';
import FeatureItem from './FeatureItem';

async function getPackage(id: string): Promise<Package> {
  try {
    // Use absolute URL to ensure correct API path
    const res = await axiosInstance.get(`packages/${id}`);

    if (!res.data || res.data.error) {
      throw new Error(res.data?.error || 'Failed to fetch package');
    }

    return res.data;
  } catch (error: any) {
    console.error('Error fetching package:', error);
    throw new Error(error.message || 'Failed to fetch package');
  }
}

export default async function PackageDetails({
  params: { id, locale },
}: {
  params: { id: string; locale: string };
}) {
  // Validate locale and redirect if needed
  if (!['en', 'ar'].includes(locale)) {
    redirect('/en/packages');
  }

  const t = await getTranslations('PackageDetails');

  let packageData: Package | null = null;
  let error: string | null = null;

  try {
    packageData = await getPackage(id);
  } catch (err: any) {
    error = err.message || t('error_loading_package');
  }

  if (error || !packageData) {
    return (
      <div className='container mx-auto p-6'>
        <Card className='text-center p-6 border-red-200 bg-red-50'>
          <CardContent>{error || t('package_not_found')}</CardContent>
        </Card>
      </div>
    );
  }

  const benefits = [
    {
      icon: <BsCheckCircleFill className='text-green-500' />,
      text: t('benefits.quality'),
    },
    {
      icon: <BsCheckCircleFill className='text-green-500' />,
      text: t('benefits.certified'),
    },
    {
      icon: <BsCheckCircleFill className='text-green-500' />,
      text: t('benefits.flexible'),
    },
  ];

  return (
    <div className='min-h-screen bg-gradient-to-b from-primary/5 to-background'>
      {/* Hero Section */}
      <div className='relative py-12 bg-primary/10 overflow-hidden'>
        <div className='absolute inset-0 pattern-grid-lg opacity-5' />
        <div className='container mx-auto px-4 relative z-10'>
          <h1 className='text-4xl md:text-5xl font-bold text-center mb-4 animate-fade-in'>
            {packageData.package_type}
          </h1>
          <p className='text-muted-foreground text-center max-w-2xl mx-auto'>
            {packageData?.description || t('no_description')}
          </p>
        </div>
      </div>

      <div className='container mx-auto p-6'>
        <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-3'>
          {/* Main Package Card */}
          <Card
            className='col-span-2 hover:shadow-lg transition-shadow duration-300
                         bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-background/60
                         border-gradient-to-r from-primary/20 to-primary/40'
          >
            <CardHeader>
              <CardTitle className='flex items-center justify-between'>
                <span className='text-2xl font-bold'>{t('details')}</span>
                <span className='text-3xl font-bold text-primary'>
                  ${packageData.current_price}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
              {/* Features Grid with animation */}
              <div className='grid grid-cols-2 gap-4 animate-fade-in'>
                <FeatureItem
                  icon={<BsCalendar2 className='text-primary' size={20} />}
                  label={t('features.days_per_week')}
                  value={packageData.days_per_week}
                />
                <FeatureItem
                  icon={<BsClock className='text-primary' size={20} />}
                  label={t('features.duration')}
                  value={packageData.class_duration}
                />
                <FeatureItem
                  icon={
                    <BsEnvelopePaperFill className='text-primary' size={20} />
                  }
                  label={t('features.classes')}
                  value={packageData.classes_per_month}
                />
                <FeatureItem
                  icon={<BsCurrencyDollar className='text-primary' size={20} />}
                  label={t('features.savings')}
                  value={`${packageData.discount}% ${t('features.off')}`}
                />
              </div>

              {/* Checkout Button */}
              <div className='flex justify-center mt-6 '>
                <CheckoutButton
                  items={[
                    {
                      name: `${packageData.package_type} Package`,
                      price: +packageData.current_price,
                      quantity: 1,
                    },
                  ]}
                  className='w-full bg-green-600 hover:bg-green-700 text-white 
                            font-semibold py-6 px-8 rounded-lg transition-all
                            hover:scale-105 duration-300 shadow-md
                            hover:shadow-lg active:scale-95'
                />
              </div>
            </CardContent>
          </Card>

          {/* Benefits Card */}
          <Card className='bg-primary/5 border-none'>
            <CardHeader>
              <CardTitle className='text-xl font-semibold'>
                {t('benefits.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className='space-y-4'>
                {benefits.map((benefit, index) => (
                  <li
                    key={index}
                    className='flex items-center gap-3 p-3
                             hover:bg-primary/10 rounded-lg transition-colors
                             [&>span]:mx-2'
                  >
                    {benefit.icon}
                    <span>{benefit.text}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
