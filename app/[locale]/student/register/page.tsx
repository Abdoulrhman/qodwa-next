import StudentForm from '@/components/student-form';
import React from 'react';
import AuthLayout from '../../auth/layout';

const RegisterStudent = () => {
  return (
    <AuthLayout
      backgroundImage='/images/mosque.jpg'
      platformName='Custom Platform Name'
      testimonialQuote='Custom testimonial quote.'
      testimonialAuthor='Custom Author'
      isColorBlack={false}
    >
      <StudentForm />
    </AuthLayout>
  );
};

export default RegisterStudent;
