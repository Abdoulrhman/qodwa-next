import { createEmailTemplate, emailComponents } from './base-template';

export const twoFactorEmailTemplate = (token: string) => {
  const content = `
    ${emailComponents.title('🔐 Two-Factor Authentication')}
    ${emailComponents.subtitle('We received a request to access your account. Please use the verification code below to complete your login.')}
    
    <div style="background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0; border: 2px dashed #d1d5db;">
      <div style="font-size: 32px; font-weight: 700; color: #1f2937; letter-spacing: 4px; margin: 0; font-family: 'Courier New', monospace;">${token}</div>
      <div style="font-size: 14px; color: #6b7280; margin-top: 10px; font-weight: 500;">Your 6-digit verification code</div>
    </div>
    
    ${emailComponents.warningCard(
      "This code will expire in 5 minutes. If you didn't request this code, please ignore this email and secure your account immediately."
    )}
    
    ${emailComponents.infoCard(`
      <div style="font-size: 16px; font-weight: 600; color: #1e40af; margin: 0 0 10px 0;">🛡️ Security Tips</div>
      <ul style="font-size: 14px; color: #1e40af; margin: 0; padding-left: 20px;">
        <li>Never share this code with anyone</li>
        <li>Qodwa will never ask for your code via phone or email</li>
        <li>Always log in through our official website</li>
      </ul>
    `)}
  `;

  return createEmailTemplate(
    'Two-Factor Authentication Code',
    content,
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  );
};

export const twoFactorEmailSubject = '🔐 Your Qodwa Verification Code';
