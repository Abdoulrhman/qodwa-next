// Export all email templates
export { createEmailTemplate, emailComponents } from './base-template';
export {
  twoFactorEmailTemplate,
  twoFactorEmailSubject,
} from './two-factor-email';
export {
  passwordResetEmailTemplate,
  passwordResetEmailSubject,
} from './password-reset-email';
export {
  emailVerificationTemplate,
  emailVerificationSubject,
} from './email-verification';
export { welcomeEmailTemplate, welcomeEmailSubject } from './welcome-email';
export {
  teacherAssignmentEmailTemplate,
  teacherAssignmentEmailSubject,
} from './teacher-assignment-email';
export {
  classReminderEmailTemplate,
  classReminderEmailSubject,
} from './class-reminder-email';

// Template types for better type safety
export interface EmailTemplateData {
  to: string;
  subject: string;
  html: string;
}

// Helper function to create email data object
export const createEmailData = (
  to: string,
  subject: string,
  html: string
): EmailTemplateData => ({
  to,
  subject,
  html,
});
