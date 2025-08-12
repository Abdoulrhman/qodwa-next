import React from 'react';

interface Service {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface ServicesProps {
  title: string;
  services: Service[];
  className?: string;
  titleClassName?: string;
}

const Services: React.FC<ServicesProps> = ({
  title,
  services,
  className = '',
  titleClassName = '',
}) => {
  return (
    <section className={`services ${className}`} id='services'>
      <h2 className={`services__title ${titleClassName}`}>{title}</h2>
      <ul className='services__grid'>
        {services.map((service, index) => (
          <li
            className={`services__card ${index === 0 ? 'mt-100' : ''} ${
              index === 1 ? 'mt-50' : ''
            } ${index === services.length - 2 ? 'mb-50' : ''} ${
              index === services.length - 1 ? 'mb-100' : ''
            }`}
            key={index}
          >
            <div className='services__card-icon'>{service.icon}</div>
            <h3 className='services__card-title'>{service.title}</h3>
            <p className='services__card-description'>{service.description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default Services;
