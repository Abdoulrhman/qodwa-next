import { Resend } from 'resend';

// Environment variables for admin notifications
const ADMIN_EMAIL =
  process.env.ADMIN_NOTIFICATION_EMAIL || 'abdoulrhman_salah@hotmail.com';
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

// Create Resend instance
const resend = new Resend(RESEND_API_KEY);

interface UserRegistrationData {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  isTeacher: boolean | null;
  phone: string | null;
  gender: string | null;
  qualifications?: string | null;
  subjects?: string | null;
  teachingExperience?: number | null;
}

interface AdminNotificationOptions {
  type:
    | 'USER_REGISTRATION'
    | 'TEACHER_REGISTRATION'
    | 'TEACHER_APPROVAL_REQUEST';
  user: UserRegistrationData;
  additionalData?: any;
}

export const sendAdminNotification = async (
  options: AdminNotificationOptions
) => {
  try {
    if (!RESEND_API_KEY) {
      console.log(
        'Resend API key not configured. Skipping admin notification.'
      );
      return { success: false, message: 'Email service not configured' };
    }

    const { type, user, additionalData } = options;

    let subject = '';
    let htmlContent = '';

    switch (type) {
      case 'USER_REGISTRATION':
        subject = `New Student Registration - ${user.name || user.email}`;
        htmlContent = generateUserRegistrationEmail(user);
        break;

      case 'TEACHER_REGISTRATION':
        subject = `New Teacher Registration - ${user.name || user.email}`;
        htmlContent = generateTeacherRegistrationEmail(user);
        break;

      case 'TEACHER_APPROVAL_REQUEST':
        subject = `Teacher Approval Required - ${user.name || user.email}`;
        htmlContent = generateTeacherApprovalEmail(user);
        break;

      default:
        throw new Error('Invalid notification type');
    }

    const result = await resend.emails.send({
      from: `Qodwa Platform <${FROM_EMAIL}>`,
      to: [ADMIN_EMAIL],
      subject,
      html: htmlContent,
    });

    console.log('Admin notification sent successfully:', result.data?.id);
    return { success: true, messageId: result.data?.id };
  } catch (error) {
    console.error('Error sending admin notification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

const generateUserRegistrationEmail = (user: UserRegistrationData) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>New Student Registration</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #6366f1; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
        .info-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .info-table th, .info-table td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
        .info-table th { background: #f3f4f6; font-weight: 600; }
        .btn { display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📚 New Student Registration</h1>
          <p>A new student has registered on the Qodwa platform</p>
        </div>
        <div class="content">
          <h2>Student Information</h2>
          <table class="info-table">
            <tr>
              <th>Name</th>
              <td>${user.name || 'Not provided'}</td>
            </tr>
            <tr>
              <th>Email</th>
              <td>${user.email || 'Not provided'}</td>
            </tr>
            <tr>
              <th>Phone</th>
              <td>${user.phone || 'Not provided'}</td>
            </tr>
            <tr>
              <th>Gender</th>
              <td>${user.gender || 'Not provided'}</td>
            </tr>
            <tr>
              <th>Role</th>
              <td>${user.role}</td>
            </tr>
            <tr>
              <th>Registration Date</th>
              <td>${new Date().toLocaleString()}</td>
            </tr>
          </table>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/admin/users" class="btn">
              View in Admin Panel
            </a>
          </div>
          
          <div class="footer">
            <p>This is an automated notification from the Qodwa Platform</p>
            <p>Admin Email: ${ADMIN_EMAIL}</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

const generateTeacherRegistrationEmail = (user: UserRegistrationData) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>New Teacher Registration</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
        .info-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .info-table th, .info-table td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
        .info-table th { background: #f3f4f6; font-weight: 600; }
        .btn { display: inline-block; padding: 12px 24px; background: #059669; color: white; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
        .btn-secondary { background: #6b7280; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
        .alert { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>👨‍🏫 New Teacher Registration</h1>
          <p>A new teacher has applied to join the Qodwa platform</p>
        </div>
        <div class="content">
          <div class="alert">
            <strong>⚠️ Action Required:</strong> This teacher application requires your review and approval.
          </div>
          
          <h2>Teacher Information</h2>
          <table class="info-table">
            <tr>
              <th>Name</th>
              <td>${user.name || 'Not provided'}</td>
            </tr>
            <tr>
              <th>Email</th>
              <td>${user.email || 'Not provided'}</td>
            </tr>
            <tr>
              <th>Phone</th>
              <td>${user.phone || 'Not provided'}</td>
            </tr>
            <tr>
              <th>Gender</th>
              <td>${user.gender || 'Not provided'}</td>
            </tr>
            <tr>
              <th>Teaching Experience</th>
              <td>${user.teachingExperience || 0} years</td>
            </tr>
            <tr>
              <th>Subjects</th>
              <td>${user.subjects || 'Not specified'}</td>
            </tr>
            <tr>
              <th>Qualifications</th>
              <td>${user.qualifications || 'Not provided'}</td>
            </tr>
            <tr>
              <th>Application Date</th>
              <td>${new Date().toLocaleString()}</td>
            </tr>
          </table>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/admin/users" class="btn">
              Review Application
            </a>
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/admin/teachers" class="btn btn-secondary">
              Teacher Management
            </a>
          </div>
          
          <div class="footer">
            <p>This is an automated notification from the Qodwa Platform</p>
            <p>Please review and approve/reject this teacher application as soon as possible.</p>
            <p>Admin Email: ${ADMIN_EMAIL}</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

const generateTeacherApprovalEmail = (user: UserRegistrationData) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Teacher Approval Required</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
        .info-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .info-table th, .info-table td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
        .info-table th { background: #f3f4f6; font-weight: 600; }
        .btn { display: inline-block; padding: 12px 24px; background: #dc2626; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
        .urgent { background: #fecaca; border: 1px solid #dc2626; padding: 15px; border-radius: 6px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚨 Urgent: Teacher Approval Required</h1>
          <p>A teacher application is waiting for your approval</p>
        </div>
        <div class="content">
          <div class="urgent">
            <strong>🔥 Urgent Action Required:</strong> This teacher has been waiting for approval. Please review immediately.
          </div>
          
          <h2>Teacher Details</h2>
          <table class="info-table">
            <tr>
              <th>Name</th>
              <td>${user.name || 'Not provided'}</td>
            </tr>
            <tr>
              <th>Email</th>
              <td>${user.email || 'Not provided'}</td>
            </tr>
            <tr>
              <th>Status</th>
              <td>PENDING APPROVAL</td>
            </tr>
            <tr>
              <th>Waiting Since</th>
              <td>${new Date().toLocaleString()}</td>
            </tr>
          </table>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/admin/users" class="btn">
              Approve/Reject Now
            </a>
          </div>
          
          <div class="footer">
            <p>This is an urgent notification from the Qodwa Platform</p>
            <p>Admin Email: ${ADMIN_EMAIL}</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};
