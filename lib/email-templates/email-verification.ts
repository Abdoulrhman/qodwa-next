import { createEmailTemplate, emailComponents } from './base-template';

export const emailVerificationTemplate = (confirmLink: string) => {
  const content = `
    ${emailComponents.title('📧 Verify Your Email Address')}
    ${emailComponents.subtitle("Welcome to Qodwa! We're excited to have you join our learning community. Please verify your email address to complete your registration.")}
    
    ${emailComponents.button(confirmLink, 'Verify My Email', 'success')}
    
    ${emailComponents.successCard(`
      <div style="font-size: 18px; font-weight: 600; color: #047857; margin: 0 0 15px 0; text-align: center;">🎉 Welcome to Your Learning Journey!</div>
      <p style="font-size: 14px; color: #065f46; margin: 0; line-height: 1.6; text-align: center;">
        Once you verify your email, you'll have access to:
      </p>
      <div style="margin: 20px 0;">
        <div style="display: flex; align-items: center; margin: 10px 0; font-size: 14px; color: #065f46;">
          <span style="margin-right: 10px; font-size: 16px;">📚</span>
          <span>Personalized learning dashboard</span>
        </div>
        <div style="display: flex; align-items: center; margin: 10px 0; font-size: 14px; color: #065f46;">
          <span style="margin-right: 10px; font-size: 16px;">👨‍🏫</span>
          <span>Connect with qualified teachers</span>
        </div>
        <div style="display: flex; align-items: center; margin: 10px 0; font-size: 14px; color: #065f46;">
          <span style="margin-right: 10px; font-size: 16px;">📊</span>
          <span>Track your learning progress</span>
        </div>
        <div style="display: flex; align-items: center; margin: 10px 0; font-size: 14px; color: #065f46;">
          <span style="margin-right: 10px; font-size: 16px;">💬</span>
          <span>Direct messaging with teachers</span>
        </div>
      </div>
    `)}
    
    ${emailComponents.alternativeLink(confirmLink)}
    
    ${emailComponents.warningCard(
      "This verification link will expire in 24 hours. If you didn't create an account with Qodwa, please ignore this email."
    )}
  `;

  return createEmailTemplate(
    'Verify Your Email Address',
    content,
    'linear-gradient(135deg, #059669 0%, #047857 100%)'
  );
};

export const emailVerificationSubject = '📧 Verify Your Qodwa Account';
