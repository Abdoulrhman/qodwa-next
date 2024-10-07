import { useTranslations } from 'next-intl';
import React, { useState } from 'react';

const SwitchButton = ({
  selected,
  setSelected,
}: {
  selected: string;
  setSelected: React.Dispatch<React.SetStateAction<string>>;
}) => {

  const t = useTranslations('Home');
  return (
    <div className='toggle-switch'>
      <div
        className={`toggle-option ${selected === '30 minutes' ? 'active' : ''}`}
        onClick={() => setSelected('30 minutes')}
      >
        {t('30Min')}
      </div>
      <div
        className={`toggle-option ${selected === '60 minutes' ? 'active' : ''}`}
        onClick={() => setSelected('60 minutes')}
      >
        {t('60Min')}
      </div>
    </div>
  );
};

export default SwitchButton;
