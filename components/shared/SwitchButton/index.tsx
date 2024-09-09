import React, { useState } from 'react';

const SwitchButton = ({
  selected,
  setSelected,
}: {
  selected: string;
  setSelected: React.Dispatch<React.SetStateAction<string>>;
}) => {
  return (
    <div className='toggle-switch'>
      <div
        className={`toggle-option ${selected === '30 minutes' ? 'active' : ''}`}
        onClick={() => setSelected('30 minutes')}
      >
        30 minutes
      </div>
      <div
        className={`toggle-option ${selected === '60 minutes' ? 'active' : ''}`}
        onClick={() => setSelected('60 minutes')}
      >
        60 minutes
      </div>
    </div>
  );
};

export default SwitchButton;
