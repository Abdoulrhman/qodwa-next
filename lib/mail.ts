import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const domain = process.env.NEXT_PUBLIC_APP_URL;

// Email sender configuration
const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

export const sendTwoFactorTokenEmail = async (email: string, token: string) => {
  await resend.emails.send({
    from: fromEmail,
    to: email,
    subject: '2FA Code',
    html: `<p>Your 2FA code: ${token}</p>`,
  });
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `${domain}/auth/new-password?token=${token}`;

  await resend.emails.send({
    from: fromEmail,
    to: email,
    subject: 'Reset your password',
    html: `<p>Click <a href="${resetLink}">here</a> to reset password.</p>`,
  });
};

export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `${domain}/auth/new-verification?token=${token}`;

  await resend.emails.send({
    from: fromEmail,
    to: email,
    subject: 'Confirm your email',
    html: `<p>Click <a href="${confirmLink}">here</a> to confirm email.</p>`,
  });
};

// Student Email Functions
export const sendWelcomeEmailToStudent = async (
  studentEmail: string,
  studentName: string,
  teacherName?: string
) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Welcome to Qodwa!</h2>
      <p>Dear ${studentName},</p>
      <p>Welcome to Qodwa! We're excited to have you join our learning community.</p>
      ${teacherName ? `<p>You have been assigned to <strong>${teacherName}</strong> as your primary teacher.</p>` : ''}
      <p>Your learning journey begins now. Here's what you can expect:</p>
      <ul>
        <li>Personalized learning experience</li>
        <li>Regular feedback and progress tracking</li>
        <li>Direct communication with your teacher</li>
        <li>Access to learning materials and resources</li>
      </ul>
      <p>If you have any questions, feel free to contact your teacher or our support team.</p>
      <p>Best regards,<br>The Qodwa Team</p>
    </div>
  `;

  await resend.emails.send({
    from: fromEmail,
    to: studentEmail,
    subject: 'Welcome to Qodwa - Your Learning Journey Begins!',
    html,
  });
};

export const sendTeacherAssignmentEmailToStudent = async (
  studentEmail: string,
  studentName: string,
  teacherName: string,
  teacherEmail: string,
  subjects?: string
) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">New Teacher Assignment</h2>
      <p>Dear ${studentName},</p>
      <p>We're pleased to inform you that <strong>${teacherName}</strong> has been assigned as your teacher.</p>
      ${subjects ? `<p><strong>Subjects:</strong> ${subjects}</p>` : ''}
      <p><strong>Teacher Contact:</strong> ${teacherEmail}</p>
      <p>Your teacher will be in touch soon to discuss your learning plan and schedule your first session.</p>
      <p>We wish you all the best in your learning journey!</p>
      <p>Best regards,<br>The Qodwa Team</p>
    </div>
  `;

  await resend.emails.send({
    from: fromEmail,
    to: studentEmail,
    subject: 'Teacher Assignment - Qodwa',
    html,
  });
};

export const sendClassReminderToStudent = async (
  studentEmail: string,
  studentName: string,
  teacherName: string,
  classDate: Date,
  classTime: string,
  subjects?: string
) => {
  const formattedDate = classDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Class Reminder</h2>
      <p>Dear ${studentName},</p>
      <p>This is a friendly reminder about your upcoming class:</p>
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Teacher:</strong> ${teacherName}</p>
        <p><strong>Date:</strong> ${formattedDate}</p>
        <p><strong>Time:</strong> ${classTime}</p>
        ${subjects ? `<p><strong>Subject:</strong> ${subjects}</p>` : ''}
      </div>
      <p>Please make sure you're prepared and ready for your session. If you need to reschedule, please contact your teacher in advance.</p>
      <p>Best regards,<br>The Qodwa Team</p>
    </div>
  `;

  await resend.emails.send({
    from: fromEmail,
    to: studentEmail,
    subject: `Class Reminder - ${formattedDate}`,
    html,
  });
};

export const sendProgressUpdateToStudent = async (
  studentEmail: string,
  studentName: string,
  teacherName: string,
  progressNote: string,
  completedLessons?: number,
  totalLessons?: number
) => {
  const progressPercentage =
    completedLessons && totalLessons
      ? Math.round((completedLessons / totalLessons) * 100)
      : null;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Progress Update</h2>
      <p>Dear ${studentName},</p>
      <p>Your teacher <strong>${teacherName}</strong> has shared an update on your progress:</p>
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        ${progressPercentage ? `<p><strong>Progress:</strong> ${completedLessons}/${totalLessons} lessons completed (${progressPercentage}%)</p>` : ''}
        <p><strong>Teacher's Note:</strong></p>
        <p style="font-style: italic;">"${progressNote}"</p>
      </div>
      <p>Keep up the great work! Continue practicing and don't hesitate to ask questions during your sessions.</p>
      <p>Best regards,<br>The Qodwa Team</p>
    </div>
  `;

  await resend.emails.send({
    from: fromEmail,
    to: studentEmail,
    subject: 'Progress Update - Qodwa',
    html,
  });
};

// Teacher Email Functions
export const sendWelcomeEmailToTeacher = async (
  teacherEmail: string,
  teacherName: string,
  approvalStatus?: 'APPROVED' | 'PENDING'
) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Welcome to Qodwa Teacher Platform!</h2>
      <p>Dear ${teacherName},</p>
      <p>Welcome to the Qodwa teaching platform! We're thrilled to have you join our community of dedicated educators.</p>
      
      ${
        approvalStatus === 'APPROVED'
          ? `<div style="background-color: #d1fae5; border: 1px solid #10b981; padding: 15px; border-radius: 8px; margin: 20px 0;">
             <p style="color: #065f46; margin: 0;"><strong>✅ Your account has been approved!</strong> You can now start accepting students and managing your classes.</p>
           </div>`
          : `<div style="background-color: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0;">
             <p style="color: #92400e; margin: 0;"><strong>⏳ Your account is under review.</strong> We'll notify you once your application has been approved.</p>
           </div>`
      }
      
      <p>As a Qodwa teacher, you'll have access to:</p>
      <ul>
        <li>Student management dashboard</li>
        <li>Progress tracking tools</li>
        <li>Direct communication with students and parents</li>
        <li>Lesson planning resources</li>
        <li>Performance analytics</li>
      </ul>
      
      <p>If you have any questions about the platform or need assistance, our support team is here to help.</p>
      <p>Best regards,<br>The Qodwa Team</p>
    </div>
  `;

  await resend.emails.send({
    from: fromEmail,
    to: teacherEmail,
    subject: 'Welcome to Qodwa Teacher Platform!',
    html,
  });
};

export const sendStudentAssignmentEmailToTeacher = async (
  teacherEmail: string,
  teacherName: string,
  studentName: string,
  studentEmail: string,
  packageDetails?: string
) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">New Student Assignment</h2>
      <p>Dear ${teacherName},</p>
      <p>A new student has been assigned to you:</p>
      
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Student Name:</strong> ${studentName}</p>
        <p><strong>Student Email:</strong> ${studentEmail}</p>
        ${packageDetails ? `<p><strong>Package:</strong> ${packageDetails}</p>` : ''}
      </div>
      
      <p>Please reach out to your new student to introduce yourself and schedule the first session. You can contact them directly at ${studentEmail}.</p>
      
      <p>Remember to:</p>
      <ul>
        <li>Schedule an initial assessment</li>
        <li>Discuss learning goals and expectations</li>
        <li>Create a personalized learning plan</li>
        <li>Set up regular progress check-ins</li>
      </ul>
      
      <p>Best regards,<br>The Qodwa Team</p>
    </div>
  `;

  await resend.emails.send({
    from: fromEmail,
    to: teacherEmail,
    subject: 'New Student Assignment - Qodwa',
    html,
  });
};

export const sendTeacherApprovalEmail = async (
  teacherEmail: string,
  teacherName: string,
  status: 'APPROVED' | 'REJECTED',
  rejectionReason?: string
) => {
  const isApproved = status === 'APPROVED';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Teacher Application ${isApproved ? 'Approved' : 'Update'}</h2>
      <p>Dear ${teacherName},</p>
      
      ${
        isApproved
          ? `<div style="background-color: #d1fae5; border: 1px solid #10b981; padding: 20px; border-radius: 8px; margin: 20px 0;">
             <h3 style="color: #065f46; margin-top: 0;">🎉 Congratulations! Your application has been approved!</h3>
             <p style="color: #065f46;">You can now start accepting students and managing your classes on the Qodwa platform.</p>
           </div>
           <p>Next steps:</p>
           <ul>
             <li>Log in to your teacher dashboard</li>
             <li>Complete your profile setup</li>
             <li>Review the teacher guidelines</li>
             <li>Start accepting student assignments</li>
           </ul>`
          : `<div style="background-color: #fee2e2; border: 1px solid #ef4444; padding: 20px; border-radius: 8px; margin: 20px 0;">
             <h3 style="color: #991b1b; margin-top: 0;">Application Status Update</h3>
             <p style="color: #991b1b;">Unfortunately, we cannot approve your application at this time.</p>
             ${rejectionReason ? `<p style="color: #991b1b;"><strong>Reason:</strong> ${rejectionReason}</p>` : ''}
           </div>
           <p>You're welcome to reapply in the future. If you have questions about this decision, please contact our support team.</p>`
      }
      
      <p>Thank you for your interest in joining the Qodwa teaching community.</p>
      <p>Best regards,<br>The Qodwa Team</p>
    </div>
  `;

  await resend.emails.send({
    from: fromEmail,
    to: teacherEmail,
    subject: `Teacher Application ${isApproved ? 'Approved' : 'Update'} - Qodwa`,
    html,
  });
};

// Bulk Email Functions
export const sendBulkEmailToStudents = async (
  students: Array<{ email: string; name: string }>,
  subject: string,
  message: string,
  includePersonalization: boolean = true
) => {
  const emailPromises = students.map((student) => {
    const personalizedMessage = includePersonalization
      ? `Dear ${student.name},\n\n${message}`
      : message;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Message from Qodwa</h2>
        <div style="white-space: pre-line; line-height: 1.6;">
          ${personalizedMessage}
        </div>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">Best regards,<br>The Qodwa Team</p>
      </div>
    `;

    return resend.emails.send({
      from: fromEmail,
      to: student.email,
      subject,
      html,
    });
  });

  return Promise.allSettled(emailPromises);
};

export const sendBulkEmailToTeachers = async (
  teachers: Array<{ email: string; name: string }>,
  subject: string,
  message: string,
  includePersonalization: boolean = true
) => {
  const emailPromises = teachers.map((teacher) => {
    const personalizedMessage = includePersonalization
      ? `Dear ${teacher.name},\n\n${message}`
      : message;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Message from Qodwa</h2>
        <div style="white-space: pre-line; line-height: 1.6;">
          ${personalizedMessage}
        </div>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">Best regards,<br>The Qodwa Team</p>
      </div>
    `;

    return resend.emails.send({
      from: fromEmail,
      to: teacher.email,
      subject,
      html,
    });
  });

  return Promise.allSettled(emailPromises);
};
