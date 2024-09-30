import React from 'react';
import { FaUsers, FaFolderOpen, FaChartLine, FaHandHoldingUsd, FaExchangeAlt, FaClock } from 'react-icons/fa';

const cardsData = [
  {
    title: 'Any Tech Team. Any Time.',
    description: 'You own and manage the projects, and our world-class, squads of developers are yours to direct.',
    icon: <FaUsers />,
  },
  {
    title: 'Browse Techies Portfolios',
    description: 'Find Top-notch tech talents you can trust by browsing their samples of previous work.',
    icon: <FaFolderOpen />,
  },
  {
    title: 'Scale More Effectively.',
    description: 'Ramp up your Squads on-demand, or ramp down as needed. We make scaling easy.',
    icon: <FaChartLine />,
  },
  {
    title: 'Overhead Management',
    description: 'We are responsible for the entire employment process, including payroll management and vacations.',
    icon: <FaHandHoldingUsd />,
  },
  {
    title: 'Friendly Replacement',
    description: 'If the talent performance doesn’t match with partner expectations, We will manage a replacement.',
    icon: <FaExchangeAlt />,
  },
  {
    title: '60% Faster Hiring',
    description: 'We nominate remote engineers after evaluating them thoroughly to filter out the top 1% of Full/Part-time remote talents.',
    icon: <FaClock />,
  },
];

const HomeServices: React.FC = () => {
  return (
    <section className="services">
      <h2 className="services__title">Compete With an Expert Tech Talents</h2>
      <div className="services__grid">
        {cardsData.map((card, index) => (
          <div className="services__card" key={index}>
            <div className="services__card-icon">{card.icon}</div>
            <h3 className="services__card-title">{card.title}</h3>
            <p className="services__card-description">{card.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HomeServices;
