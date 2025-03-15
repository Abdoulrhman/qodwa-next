import StudentForm from '@/components/student-form';
import React from 'react';
import AuthLayout from '../../auth/layout';
import SplittedLayout from '@/components/shared/splittedLayout';

const RegisterStudent = () => {
  return (
    <SplittedLayout
      backgroundImage='/images/mosque.jpg'
      platformName='Custom Platform Name'
      testimonialQuote='Custom testimonial quote.'
      testimonialAuthor='Custom Author'
      isColorBlack={false}
    >
      <StudentForm />
    </SplittedLayout>
  );
};

export default RegisterStudent;
