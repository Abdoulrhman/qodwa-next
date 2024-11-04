import StudentForm from '@/components/student-form';
import React from 'react';

const RegisterStudent = () => {


  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md">
        <StudentForm />
      </div>
    </div>
  );
};

export default RegisterStudent;
