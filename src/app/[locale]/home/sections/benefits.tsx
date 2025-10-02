'use client';

import { useTranslations } from 'next-intl';
import { CheckCircle2 } from 'lucide-react';
import '@/styles/pages/home/benefits/benefits.scss';

const Benefits = () => {
  const t = useTranslations('Home.Benefits');

  const benefits = [
    {
      id: 1,
      text: t('native_teachers'),
    },
    {
      id: 2,
      text: t('flexible_schedule'),
    },
    {
      id: 3,
      text: t('interactive_classes'),
    },
    {
      id: 4,
      text: t('affordable_packages'),
    },
  ];

  return (
    <section className="benefits-section">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => (
            <div
              key={benefit.id}
              className="benefit-card flex items-center gap-4 p-6 rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="icon-wrapper">
                <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0" />
              </div>
              <span className="benefit-text text-lg text-gray-700">{benefit.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;