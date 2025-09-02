'use client';
import { useTranslations } from 'next-intl';
import { BsChatSquareText, BsCartCheck, BsTools } from 'react-icons/bs';

const ContactUs: React.FC = () => {
  const t = useTranslations('Home.ContactUs');

  const contactCards = [
    {
      icon: <BsChatSquareText className='text-4xl text-primary' />,
      title: 'feedback',
      description: 'friendly_team',
      contactInfo: 'support@qodwa.com',
    },
    {
      icon: <BsCartCheck className='text-4xl text-primary' />,
      title: 'sales',
      description: 'sales_team',
      contactInfo: 'sales@qodwa.com',
    },
    {
      icon: <BsTools className='text-4xl text-primary' />,
      title: 'technical',
      description: 'technical_team',
      contactInfo: 'tech@qodwa.com',
    },
  ];

  return (
    <section
      className='contact-us-wrapper tp-contact-area pt-[110px] pb-[90px]'
      id='contact-us'
    >
      <p className='contact-us-header'>{t('header')}</p>
      <div className='contact-us-content'>
        {contactCards.map((card, index) => (
          <div key={index} className='contact-card'>
            <div className='icon'>{card.icon}</div>
            <p className='title'>{t(`cards.${card.title}.title`)}</p>
            <p className='description'>
              {t(`cards.${card.title}.description`)}
            </p>
            <p className='contact-info'>{card.contactInfo}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ContactUs;
