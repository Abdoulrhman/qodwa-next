'use client';

import { useTranslations } from 'next-intl';
import { Star } from 'lucide-react';
import Image from 'next/image';

const TrustSection = () => {
  const t = useTranslations('Home.Trust');

  const testimonials = [
    {
      name: 'Sarah Ahmad',
      text: t('testimonial1'),
      image: '/images/testimonials/student1.svg'
    },
    {
      name: 'Mohammed Hassan',
      text: t('testimonial2'),
      image: '/images/testimonials/student2.svg'
    }
  ];

  return (
    <section className="trust-section py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Testimonials */}
        <div className="mb-12">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 relative rounded-full overflow-hidden mr-4">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">{testimonial.name}</h4>
                    <div className="flex text-yellow-400">
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 italic">{testimonial.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Badge */}
        <div className="text-center mb-12">
          <p className="text-xl font-semibold text-gray-700">
            {t('trusted_by')}
          </p>
        </div>

        {/* Payment Security */}
        <div className="flex justify-center items-center gap-6">
          <Image 
            src="/images/payment/apple-pay.svg" 
            alt="Apple Pay" 
            width={60} 
            height={40}
          />
          <Image 
            src="/images/payment/visa.svg" 
            alt="Visa" 
            width={60} 
            height={40}
          />
          <Image 
            src="/images/payment/mastercard.svg" 
            alt="Mastercard" 
            width={60} 
            height={40}
          />
          <Image 
            src="/images/payment/paypal.svg" 
            alt="PayPal" 
            width={60} 
            height={40}
          />
        </div>
      </div>
    </section>
  );
};

export default TrustSection;