'use client';

import { useState } from 'react';

interface ToggleSwitchProps {
  initialMode?: 'student' | 'teacher';
  onToggle?: (mode: 'student' | 'teacher') => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  initialMode = 'student',
  onToggle,
}) => {
  const [mode, setMode] = useState<'student' | 'teacher'>(initialMode);

  const handleToggle = () => {
    const newMode = mode === 'student' ? 'teacher' : 'student';
    setMode(newMode);
    if (onToggle) {
      onToggle(newMode);
    }
  };

  return (
    <div className='toggleSwitch'>
      <span className={mode === 'student' ? 'toggleSwitch__active' : ''}>
        Student
      </span>
      <div className='toggleSwitch__switch' onClick={handleToggle}>
        <div
          className={
            mode === 'student'
              ? 'toggleSwitch__student'
              : 'toggleSwitch__teacher'
          }
        ></div>
      </div>
      <span className={mode === 'teacher' ? 'toggleSwitch__active' : ''}>
        teacher
      </span>
    </div>
  );
};

export default ToggleSwitch;
