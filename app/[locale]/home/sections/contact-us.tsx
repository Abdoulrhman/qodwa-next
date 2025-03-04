import { useTranslations } from 'next-intl';

const ContactUs: React.FC = () => {
  const t = useTranslations('Home');

  return (
    <section
      className='contact-us-wrapper tp-contact-area pt-[110px] pb-[90px]'
      id='contact-us'
    >
      <p className='contact-us-header'>Let us know how we can help</p>
      <div className='contact-us-content'>
        <div className='contact-card'>
          <div className='icon'>icon</div>
          <p className='title'>Feedbacks</p>
          <p className='description'>Speak to our Friendly Team</p>
          <p className='contact-info'>Support@gmail.com</p>
        </div>
        <div className='contact-card'>
          <div className='icon'>icon</div>
          <p className='title'>Feedbacks</p>
          <p className='description'>Speak to our Friendly Team</p>
          <p className='contact-info'>Support@gmail.com</p>
        </div>
        <div className='contact-card'>
          <div className='icon'>icon</div>
          <p className='title'>Feedbacks</p>
          <p className='description'>Speak to our Friendly Team</p>
          <p className='contact-info'>Support@gmail.com</p>
        </div>
      </div>
    </section>
  );
};
export default ContactUs;
