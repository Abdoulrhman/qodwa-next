import { createEmailTemplate, emailComponents } from './base-template';

export const welcomeEmailTemplate = (
  userName: string,
  userType: 'student' | 'teacher' = 'student',
  dashboardLink?: string
) => {
  const content = `
    ${emailComponents.title('🎉 Welcome to Qodwa!')}
    ${emailComponents.subtitle(`Dear ${userName}, welcome to the Qodwa learning platform! We're thrilled to have you join our community of dedicated ${userType}s.`)}
    
    ${emailComponents.successCard(`
      <div style="text-align: center;">
        <div style="font-size: 18px; font-weight: 600; color: #047857; margin: 0 0 15px 0;">✅ Your Account is Ready!</div>
        <p style="font-size: 14px; color: #065f46; margin: 0; line-height: 1.6;">
          Your ${userType} account has been successfully created and verified. You can now access all the features of our platform.
        </p>
      </div>
    `)}
    
    ${
      userType === 'student'
        ? `
      ${emailComponents.infoCard(`
        <div style="font-size: 16px; font-weight: 600; color: #1e40af; margin: 0 0 15px 0;">📚 What's Next?</div>
        <ul style="font-size: 14px; color: #1e40af; margin: 0; padding-left: 20px; line-height: 1.6;">
          <li>Browse and subscribe to learning packages</li>
          <li>Get assigned to qualified teachers</li>
          <li>Start your personalized learning journey</li>
          <li>Track your progress and achievements</li>
          <li>Communicate directly with your teachers</li>
        </ul>
      `)}
    `
        : `
      ${emailComponents.infoCard(`
        <div style="font-size: 16px; font-weight: 600; color: #1e40af; margin: 0 0 15px 0;">👨‍🏫 Teacher Dashboard</div>
        <ul style="font-size: 14px; color: #1e40af; margin: 0; padding-left: 20px; line-height: 1.6;">
          <li>Manage your student assignments</li>
          <li>Track student progress and performance</li>
          <li>Send progress updates and feedback</li>
          <li>Schedule and manage classes</li>
          <li>Access teaching resources and materials</li>
        </ul>
      `)}
    `
    }
    
    ${dashboardLink ? emailComponents.button(dashboardLink, 'Go to Dashboard', 'primary') : ''}
    
    <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: center;">
      <div style="font-size: 16px; font-weight: 600; color: #374151; margin: 0 0 10px 0;">Need Help Getting Started?</div>
      <p style="font-size: 14px; color: #6b7280; margin: 0; line-height: 1.6;">
        Our support team is here to help! Feel free to reach out if you have any questions or need assistance navigating the platform.
      </p>
    </div>
  `;

  return createEmailTemplate(
    'Welcome to Qodwa',
    content,
    'linear-gradient(135deg, #059669 0%, #047857 100%)'
  );
};

export const welcomeEmailSubject = (userType: 'student' | 'teacher') =>
  `🎉 Welcome to Qodwa - Your ${userType === 'student' ? 'Learning' : 'Teaching'} Journey Begins!`;
