import { useTranslations } from 'next-intl';
import React from 'react';

interface SwitchButtonProps {
  selected: string;
  setSelected: React.Dispatch<React.SetStateAction<string>>;
  options: { value: string; label: string }[]; // Updated to accept objects
  width?: string;
}

const SwitchButton: React.FC<SwitchButtonProps> = ({
  selected,
  setSelected,
  options,
  width = 'fit-content',
}) => {
  return (
    <div className='toggle-switch' style={{ width }}>
      {options.map(({ value, label }) => (
        <div
          key={value}
          className={`toggle-option ${selected === value ? 'active' : ''}`}
          onClick={() => setSelected(value)}
        >
          {label}
        </div>
      ))}
    </div>
  );
};

export default SwitchButton;
