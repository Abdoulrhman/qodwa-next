import { createEmailTemplate, emailComponents } from './base-template';

export const classReminderEmailTemplate = (
  studentName: string,
  teacherName: string,
  formattedDate: string,
  classTime: string,
  subjects?: string
) => {
  const content = `
    ${emailComponents.title('⏰ Class Reminder')}
    ${emailComponents.subtitle(`Dear ${studentName}, this is a friendly reminder about your upcoming class.`)}
    
    ${emailComponents.infoCard(`
      <div style="font-size: 16px; font-weight: 600; color: #1e40af; margin: 0 0 20px 0; text-align: center;">📅 Class Details</div>
      <div style="background-color: #ffffff; border-radius: 8px; padding: 20px; border: 2px solid #bfdbfe;">
        <div style="display: grid; gap: 10px; font-size: 14px; color: #1e40af;">
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #e0e7ff;">
            <span style="font-weight: 600;">👨‍🏫 Teacher:</span>
            <span>${teacherName}</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #e0e7ff;">
            <span style="font-weight: 600;">📅 Date:</span>
            <span>${formattedDate}</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; ${subjects ? 'border-bottom: 1px solid #e0e7ff;' : ''}">
            <span style="font-weight: 600;">🕐 Time:</span>
            <span>${classTime}</span>
          </div>
          ${
            subjects
              ? `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0;">
              <span style="font-weight: 600;">📚 Subject:</span>
              <span>${subjects}</span>
            </div>
          `
              : ''
          }
        </div>
      </div>
    `)}
    
    ${emailComponents.warningCard(
      "Please make sure you're prepared and ready for your session. If you need to reschedule, please contact your teacher in advance.",
      '📝 Preparation Reminder:'
    )}
    
    <div style="background-color: #f0fdf4; border-radius: 8px; padding: 20px; margin: 30px 0; border-left: 4px solid #22c55e;">
      <div style="font-size: 16px; font-weight: 600; color: #047857; margin: 0 0 10px 0;">✅ Before Your Class</div>
      <ul style="font-size: 14px; color: #065f46; margin: 0; padding-left: 20px; line-height: 1.6;">
        <li>Review your previous lesson notes</li>
        <li>Prepare any questions you have</li>
        <li>Ensure your learning environment is ready</li>
        <li>Test your internet connection if it's an online session</li>
      </ul>
    </div>
  `;

  return createEmailTemplate(
    'Class Reminder',
    content,
    'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
  );
};

export const classReminderEmailSubject = (formattedDate: string) =>
  `Class Reminder - ${formattedDate}`;
