import { createEmailTemplate, emailComponents } from './base-template';

export const passwordResetEmailTemplate = (resetLink: string) => {
  const content = `
    ${emailComponents.title('🔑 Reset Your Password')}
    ${emailComponents.subtitle('We received a request to reset the password for your Qodwa account. Click the button below to create a new password.')}
    
    ${emailComponents.button(resetLink, 'Reset My Password', 'danger')}
    
    ${emailComponents.alternativeLink(resetLink)}
    
    ${emailComponents.warningCard(
      "This link will expire in 1 hour for security reasons. If you didn't request a password reset, please ignore this email or contact support if you have concerns."
    )}
    
    ${emailComponents.infoCard(`
      <div style="font-size: 16px; font-weight: 600; color: #1e40af; margin: 0 0 10px 0;">🛡️ Security Note</div>
      <p style="font-size: 14px; color: #1e40af; margin: 0; line-height: 1.5;">
        For your security, this password reset link can only be used once. After you reset your password, this link will become invalid. If you need to reset your password again, you'll need to request a new reset link.
      </p>
    `)}
  `;

  return createEmailTemplate(
    'Reset Your Password',
    content,
    'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
  );
};

export const passwordResetEmailSubject = '🔑 Reset Your Qodwa Password';
