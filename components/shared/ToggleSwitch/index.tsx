'use client';

import { useRouter, usePathname } from '@/i18n/routing'; // Import usePathname
import { useTranslations } from 'next-intl';
import { useState, useEffect, useCallback } from 'react';

// Define constants for the modes
const STUDENT_MODE = 'student';
const TEACHER_MODE = 'teacher';

interface ToggleSwitchProps {
  initialMode?: typeof STUDENT_MODE | typeof TEACHER_MODE;
  onToggle?: (mode: typeof STUDENT_MODE | typeof TEACHER_MODE) => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  initialMode = STUDENT_MODE,
  onToggle,
}) => {
  const router = useRouter();
  const pathname = usePathname(); // Get the current pathname
  const t = useTranslations('Home');

  // Determine initial mode based on pathname
  const getInitialMode = useCallback(():
    | typeof STUDENT_MODE
    | typeof TEACHER_MODE => {
    return pathname.includes('teacher') ? TEACHER_MODE : STUDENT_MODE;
  }, [pathname]);

  const [mode, setMode] = useState<typeof STUDENT_MODE | typeof TEACHER_MODE>(
    getInitialMode
  ); // Initialize based on pathname

  useEffect(() => {
    // Update mode when the pathname changes
    setMode(getInitialMode());
  }, [pathname, getInitialMode]);

  const handleToggle = () => {
    const newMode = mode === STUDENT_MODE ? TEACHER_MODE : STUDENT_MODE;
    setMode(newMode);

    if (onToggle) {
      onToggle(newMode);
    }

    // Use newMode to determine the routing
    if (newMode === STUDENT_MODE) {
      router.push('/'); // Redirect to student route
    } else {
      router.push('/teacher'); // Redirect to teacher route
    }
  };

  return (
    <div className='toggleSwitch'>
      <span className={mode === STUDENT_MODE ? 'toggleSwitch__active' : ''}>
        {t('student')}
      </span>
      <div className='toggleSwitch__switch' onClick={handleToggle}>
        <div
          className={
            mode === STUDENT_MODE
              ? 'toggleSwitch__student'
              : 'toggleSwitch__teacher'
          }
        ></div>
      </div>
      <span className={mode === TEACHER_MODE ? 'toggleSwitch__active' : ''}>
        {t('teacher')}
      </span>
    </div>
  );
};

export default ToggleSwitch;
