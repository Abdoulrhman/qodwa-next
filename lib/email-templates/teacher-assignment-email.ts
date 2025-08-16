import { createEmailTemplate, emailComponents } from './base-template';

export const teacherAssignmentEmailTemplate = (
  studentName: string,
  teacherName: string,
  teacherEmail: string,
  subjects?: string
) => {
  const content = `
    ${emailComponents.title('👨‍🏫 New Teacher Assignment')}
    ${emailComponents.subtitle(`Dear ${studentName}, we're pleased to inform you that ${teacherName} has been assigned as your teacher.`)}
    
    ${emailComponents.successCard(`
      <div style="text-align: center;">
        <div style="font-size: 18px; font-weight: 600; color: #047857; margin: 0 0 15px 0;">🎓 Your Teacher Details</div>
        <div style="font-size: 14px; color: #065f46; line-height: 1.6;">
          <p style="margin: 5px 0;"><strong>Teacher:</strong> ${teacherName}</p>
          <p style="margin: 5px 0;"><strong>Contact:</strong> ${teacherEmail}</p>
          ${subjects ? `<p style="margin: 5px 0;"><strong>Subjects:</strong> ${subjects}</p>` : ''}
        </div>
      </div>
    `)}
    
    ${emailComponents.infoCard(`
      <div style="font-size: 16px; font-weight: 600; color: #1e40af; margin: 0 0 15px 0;">📚 What's Next?</div>
      <ul style="font-size: 14px; color: #1e40af; margin: 0; padding-left: 20px; line-height: 1.6;">
        <li>Your teacher will contact you soon to schedule your first session</li>
        <li>Discuss your learning goals and expectations</li>
        <li>Create a personalized learning plan together</li>
        <li>Set up regular progress check-ins</li>
      </ul>
    `)}
    
    <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: center;">
      <p style="font-size: 14px; color: #6b7280; margin: 0; line-height: 1.6;">
        We wish you all the best in your learning journey! If you have any questions, feel free to reach out to your teacher or our support team.
      </p>
    </div>
  `;

  return createEmailTemplate(
    'New Teacher Assignment',
    content,
    'linear-gradient(135deg, #059669 0%, #047857 100%)'
  );
};

export const teacherAssignmentEmailSubject = 'Teacher Assignment - Qodwa';
