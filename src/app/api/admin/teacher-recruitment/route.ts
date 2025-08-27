import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@/lib/auth';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const generateTeacherRecruitmentEmail = (customMessage?: string) => {
  // Function to format message with proper HTML structure
  const formatMessage = (message: string) => {
    let formatted = message;

    // Convert "As a teacher on our platform, you will:" to a proper heading
    formatted = formatted.replace(
      /^As a teacher on our platform, you will:\s*$/gm,
      '<h3 style="color: #1f2937; margin: 20px 0 10px 0;">As a teacher on our platform, you will:</h3>'
    );

    // Convert bullet points to proper list items
    formatted = formatted.replace(/^• (.+)$/gm, '<li>$1</li>');

    // Wrap consecutive list items in ul tags
    const listItems = formatted.match(/<li>.*?<\/li>/g);
    if (listItems && listItems.length > 0) {
      const listBlock =
        '<ul style="margin: 10px 0; padding-left: 20px;">' +
        listItems.join('') +
        '</ul>';
      formatted = formatted
        .replace(/<li>.*?<\/li>/g, '')
        .replace(/\n\s*\n/, listBlock);
    }

    // Convert double line breaks to paragraph breaks
    formatted = formatted.replace(
      /\n\n/g,
      '</p><p style="margin: 15px 0; line-height: 1.6; color: #374151;">'
    );

    // Convert single line breaks to HTML breaks (but not around headings or lists)
    formatted = formatted.replace(/\n(?!<[uh])/g, '<br>');

    // Wrap content in paragraph tags if not already formatted
    if (!formatted.includes('<p') && !formatted.includes('<h')) {
      formatted =
        '<p style="margin: 15px 0; line-height: 1.6; color: #374151;">' +
        formatted +
        '</p>';
    }

    // Clean up formatting
    formatted = formatted.replace(/<p[^>]*><\/p>/g, '');
    formatted = formatted.replace(/<br>\s*<\/p>/g, '</p>');
    formatted = formatted.replace(/<p[^>]*>\s*<ul/g, '<ul');
    formatted = formatted.replace(/<\/ul>\s*<\/p>/g, '</ul>');

    return formatted;
  };

  const defaultMessage = `We are excited to invite you to join the Qodwa Platform as a Quran and Arabic teacher. Our platform connects dedicated educators with students worldwide who are eager to learn.

As a teacher on our platform, you will:
• Earn $5.00 per hour for every teaching session
• Work with motivated students from around the globe
• Have flexible scheduling that fits your availability
• Receive ongoing support from our dedicated team

We are looking for qualified teachers who are passionate about Islamic education and have expertise in Quran recitation, Tajweed, or Arabic language instruction.`;

  const messageToUse = customMessage || defaultMessage;
  const formattedMessage = formatMessage(messageToUse);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Join Qodwa Platform - Teaching Opportunity</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          margin: 0; 
          padding: 0; 
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          padding: 20px; 
          background-color: #f8fafc;
        }
        .header { 
          background: linear-gradient(135deg, #6366f1 0%, #422e87 100%); 
          background-color: #6366f1; /* Fallback color */
          color: white !important; 
          padding: 30px; 
          text-align: center; 
          border-radius: 12px 12px 0 0; 
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: bold;
          color: white !important;
        }
        .header p {
          margin: 10px 0 0 0;
          font-size: 16px;
          opacity: 0.9;
          color: white !important;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: white !important;
          margin-bottom: 10px;
        }
        .content { 
          background: white; 
          padding: 40px 30px; 
          border-radius: 0 0 12px 12px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .highlight-box {
          background: #f0f9ff;
          border: 2px solid #3b82f6;
          border-radius: 8px;
          padding: 20px;
          margin: 25px 0;
          text-align: center;
        }
        .salary-highlight {
          background: #dcfce7;
          border: 2px solid #22c55e;
          border-radius: 8px;
          padding: 20px;
          margin: 25px 0;
          text-align: center;
        }
        .salary-amount {
          font-size: 32px;
          font-weight: bold;
          color: #16a34a;
          margin: 0;
        }
        .benefits-list {
          background: #fafafa;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .benefits-list ul {
          margin: 0;
          padding-left: 20px;
        }
        .benefits-list li {
          margin: 8px 0;
          color: #374151;
        }
        .cta-button { 
          display: inline-block; 
          padding: 16px 32px; 
          background: linear-gradient(135deg, #6366f1 0%, #422e87 100%); 
          color: white; 
          text-decoration: none; 
          border-radius: 8px; 
          font-weight: bold;
          font-size: 16px;
          margin: 20px 0;
          transition: transform 0.2s;
        }
        .cta-button:hover {
          transform: translateY(-2px);
        }
        .secondary-button {
          display: inline-block; 
          padding: 12px 24px; 
          background: #f3f4f6; 
          color: #374151; 
          text-decoration: none; 
          border-radius: 6px; 
          margin: 10px 5px;
          font-weight: 500;
        }
        .footer { 
          text-align: center; 
          margin-top: 30px; 
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          color: #6b7280; 
          font-size: 14px; 
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🎓 Qodwa Platform</div>
          <h1>Teaching Opportunity</h1>
          <p>Join our community of dedicated Quran & Arabic educators</p>
        </div>
        
        <div class="content">
          <h2 style="color: #1f2937; margin-top: 0;">السلام عليكم ورحمة الله وبركاته</h2>
          
          <div style="font-size: 16px; line-height: 1.6; color: #374151;">
            ${formattedMessage}
          </div>

          <div class="salary-highlight">
            <h3 style="margin: 0 0 10px 0; color: #16a34a;">Competitive Compensation</h3>
            <p class="salary-amount">$5.00/Hour</p>
            <p style="margin: 10px 0 0 0; color: #16a34a; font-weight: 500;">
              Paid directly for every teaching hour
            </p>
          </div>

          <div class="benefits-list">
            <h3 style="margin: 0 0 15px 0; color: #1f2937;">Why Choose Qodwa Platform?</h3>
            <ul>
              <li><strong>Flexible Schedule:</strong> Teach when it's convenient for you</li>
              <li><strong>Global Reach:</strong> Connect with students from around the world</li>
              <li><strong>Professional Support:</strong> Our team provides ongoing assistance</li>
              <li><strong>Easy Platform:</strong> User-friendly interface for seamless teaching</li>
              <li><strong>Immediate Payment:</strong> Get paid promptly for your teaching hours</li>
              <li><strong>Growing Community:</strong> Join a network of dedicated Islamic educators</li>
            </ul>
          </div>

          <div class="highlight-box">
            <h3 style="margin: 0 0 15px 0; color: #1e40af;">What We're Looking For:</h3>
            <p style="margin: 0; color: #374151;">
              • Native Arabic speakers or fluent Arabic speakers<br>
              • Quran memorization (Huffaz preferred)<br>
              • Teaching experience (any level welcome)<br>
              • Passion for Islamic education<br>
              • Reliable internet connection
            </p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="https://www.qodwaplatform.com/en/teacher/register" class="cta-button">
              🚀 Register as Teacher Now
            </a>
            <br>
            <small style="color: #6b7280;">Click the button above to start your application</small>
          </div>

          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 25px 0;">
            <h4 style="margin: 0 0 10px 0; color: #92400e;">Next Steps:</h4>
            <ol style="margin: 0; color: #92400e;">
              <li>Click the registration link above</li>
              <li>Complete your teacher profile</li>
              <li>Upload your credentials and qualifications</li>
              <li>Wait for our team to review your application</li>
              <li>Start teaching and earning $5/hour!</li>
            </ol>
          </div>

          <p style="font-size: 16px; color: #374151; margin-top: 30px;">
            Join us in our mission to make Quran and Arabic education accessible to Muslims worldwide. 
            Your knowledge and expertise can make a real difference in students' spiritual journey.
          </p>

          <div style="text-align: center; margin: 25px 0;">
            <a href="https://www.qodwaplatform.com" class="secondary-button">Visit Our Website</a>
            <a href="mailto:support@qodwaplatform.com" class="secondary-button">Contact Support</a>
          </div>

          <div class="footer">
            <p><strong>Qodwa Platform - Islamic Education Made Easy</strong></p>
            <p>This is an invitation to join our teaching community. If you have any questions, please don't hesitate to reach out.</p>
            <p style="margin-top: 15px;">
              <a href="https://www.qodwaplatform.com" style="color: #6366f1;">www.qodwaplatform.com</a> | 
              <a href="mailto:support@qodwaplatform.com" style="color: #6366f1;">support@qodwaplatform.com</a>
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();

    // Check if user is admin
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { emails, customMessage, subject } = await request.json();

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json(
        { error: 'Please provide a list of email addresses' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = emails.filter(
      (email) => !emailRegex.test(email.trim())
    );

    if (invalidEmails.length > 0) {
      return NextResponse.json(
        { error: `Invalid email format: ${invalidEmails.join(', ')}` },
        { status: 400 }
      );
    }

    const emailSubject =
      subject || '🎓 Teaching Opportunity at Qodwa Platform - $5/Hour';
    const emailContent = generateTeacherRecruitmentEmail(customMessage);

    const results = [];
    const errors = [];

    // Send emails one by one to handle individual failures
    for (const email of emails) {
      try {
        const result = await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL!,
          to: [email.trim()],
          subject: emailSubject,
          html: emailContent,
        });

        results.push({
          email: email.trim(),
          success: true,
          id: result.data?.id,
        });
      } catch (error: any) {
        console.error(`Failed to send email to ${email}:`, error);
        errors.push({
          email: email.trim(),
          success: false,
          error: error.message,
        });
      }
    }

    const successCount = results.length;
    const failureCount = errors.length;

    return NextResponse.json({
      success: true,
      message: `Recruitment emails sent successfully! ${successCount} sent, ${failureCount} failed.`,
      results: {
        successful: results,
        failed: errors,
        summary: {
          total: emails.length,
          successful: successCount,
          failed: failureCount,
        },
      },
    });
  } catch (error) {
    console.error('Error sending recruitment emails:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
