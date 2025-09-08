import { Resend } from 'resend';
import {
  twoFactorEmailTemplate,
  twoFactorEmailSubject,
  passwordResetEmailTemplate,
  passwordResetEmailSubject,
  emailVerificationTemplate,
  emailVerificationSubject,
  welcomeEmailTemplate,
  welcomeEmailSubject,
  teacherAssignmentEmailTemplate,
  teacherAssignmentEmailSubject,
  classReminderEmailTemplate,
  classReminderEmailSubject,
} from './email-templates';

const resend = new Resend(process.env.RESEND_API_KEY);

const domain = process.env.NEXT_PUBLIC_APP_URL;
const defaultLocale = 'en'; // Default locale for email links

// Email sender configuration
const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

// Helper function to create localized URLs
const createLocalizedUrl = (path: string, locale: string = defaultLocale) => {
  return `${domain}/${locale}${path}`;
};

export const sendTwoFactorTokenEmail = async (email: string, token: string) => {
  await resend.emails.send({
    from: fromEmail,
    to: email,
    subject: twoFactorEmailSubject,
    html: twoFactorEmailTemplate(token),
  });
};

export const sendPasswordResetEmail = async (
  email: string,
  token: string,
  locale: string = defaultLocale
) => {
  const resetLink = createLocalizedUrl(
    `/auth/new-password?token=${token}`,
    locale
  );

  await resend.emails.send({
    from: fromEmail,
    to: email,
    subject: passwordResetEmailSubject,
    html: passwordResetEmailTemplate(resetLink),
  });
};

export const sendVerificationEmail = async (
  email: string,
  token: string,
  locale: string = defaultLocale
) => {
  try {
    console.log(`📧 Sending verification email to: ${email}`);
    const confirmLink = createLocalizedUrl(
      `/auth/new-verification?token=${token}`,
      locale
    );

    const result = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: emailVerificationSubject,
      html: emailVerificationTemplate(confirmLink),
    });
    
    console.log(`✅ Verification email sent successfully to: ${email}`, result);
    return result;
  } catch (error) {
    console.error(`❌ Failed to send verification email to: ${email}`, error);
    throw error;
  }
};

// Student Email Functions
export const sendWelcomeEmailToStudent = async (
  studentEmail: string,
  studentName: string,
  teacherName?: string,
  locale: string = defaultLocale
) => {
  const dashboardLink = createLocalizedUrl('/dashboard', locale);

  await resend.emails.send({
    from: fromEmail,
    to: studentEmail,
    subject: welcomeEmailSubject('student'),
    html: welcomeEmailTemplate(studentName, 'student', dashboardLink),
  });
};

export const sendTeacherAssignmentEmailToStudent = async (
  studentEmail: string,
  studentName: string,
  teacherName: string,
  teacherEmail: string,
  subjects?: string
) => {
  await resend.emails.send({
    from: fromEmail,
    to: studentEmail,
    subject: teacherAssignmentEmailSubject,
    html: teacherAssignmentEmailTemplate(
      studentName,
      teacherName,
      teacherEmail,
      subjects
    ),
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

  await resend.emails.send({
    from: fromEmail,
    to: studentEmail,
    subject: classReminderEmailSubject(formattedDate),
    html: classReminderEmailTemplate(
      studentName,
      teacherName,
      formattedDate,
      classTime,
      subjects
    ),
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
  approvalStatus?: 'APPROVED' | 'PENDING',
  locale: string = defaultLocale
) => {
  const dashboardLink = createLocalizedUrl('/dashboard/teacher', locale);

  await resend.emails.send({
    from: fromEmail,
    to: teacherEmail,
    subject: welcomeEmailSubject('teacher'),
    html: welcomeEmailTemplate(teacherName, 'teacher', dashboardLink),
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

// Admin Notification Functions
export const sendAdminNewStudentNotification = async (
  studentName: string,
  studentEmail: string,
  locale: string = defaultLocale
) => {
  try {
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
    
    if (!adminEmail) {
      console.warn('❌ ADMIN_NOTIFICATION_EMAIL not configured');
      return;
    }
    
    console.log(`📧 Sending admin notification for new student: ${studentName} (${studentEmail}) to ${adminEmail}`);

    const subject = `🎓 New Student Registration - ${studentName}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4f46e5;">New Student Registration</h2>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1e293b;">Student Details:</h3>
          <p><strong>Name:</strong> ${studentName}</p>
          <p><strong>Email:</strong> ${studentEmail}</p>
          <p><strong>Registration Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        
        <div style="background-color: #dbeafe; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6;">
          <p style="margin: 0;"><strong>Action Required:</strong> Please review and assign a teacher to the new student.</p>
        </div>
        
        <p style="margin-top: 30px;">
          <a href="${domain}/${locale}/dashboard/admin" 
             style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View Admin Dashboard
          </a>
        </p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
        <p style="color: #64748b; font-size: 14px;">This is an automated notification from the Qodwa platform.</p>
      </div>
    `;

    const result = await resend.emails.send({
      from: fromEmail,
      to: adminEmail,
      subject,
      html,
    });
    
    console.log(`✅ Admin notification sent successfully for student: ${studentName}`, result);
    return result;
  } catch (error) {
    console.error(`❌ Failed to send admin notification for student: ${studentName} (${studentEmail})`, error);
    throw error;
  }
};
